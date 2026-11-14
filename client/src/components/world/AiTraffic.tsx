import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import { soundSystem } from '../../audio/soundSystem';
import { vehiclePhysics, playerPhysics } from '../../stores/vehiclePhysics';
import { trafficCars, TRAFFIC_CIRCUITS } from '../../stores/trafficPhysics';
import { parkedVehicles } from '../../stores/entityVehicles';

// Pre-allocated static geometries (Zero GC churn)
const geoSedanBody = new THREE.BoxGeometry(1.9, 0.65, 4.4);
const geoSedanCabin = new THREE.BoxGeometry(1.6, 0.55, 2.3);

const geoSuvBody = new THREE.BoxGeometry(2.05, 0.85, 4.6);
const geoSuvCabin = new THREE.BoxGeometry(1.75, 0.75, 2.9);

const geoSportsBody = new THREE.BoxGeometry(2.0, 0.52, 4.3);
const geoSportsCabin = new THREE.BoxGeometry(1.5, 0.45, 2.0);
const geoSpoilerWing = new THREE.BoxGeometry(1.7, 0.08, 0.35);

const geoHeadlight = new THREE.BoxGeometry(0.32, 0.16, 0.06);
const geoTaillight = new THREE.BoxGeometry(0.38, 0.16, 0.06);
const geoWheel = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 12);

const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
const cabinMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.85 });

export const AiTraffic: React.FC = () => {
  const mode = useGameStore((s) => s.mode);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const isNight = timeOfDay < 6.5 || timeOfDay > 18.5;

  const carMeshesRef = useRef<(THREE.Group | null)[]>([]);
  const tailLightRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);

    // AI Driving, Obstacle Avoidance & Physics Loop
    trafficCars.forEach((car, idx) => {
      // 1. Honk cooldown countdown
      if (car.honkCooldown > 0) car.honkCooldown -= dt;

      // 2. Circuit waypoint tracking & ultra-smooth navigation
      const circuit = TRAFFIC_CIRCUITS[car.circuitIndex] || TRAFFIC_CIRCUITS[0];
      const targetWp = circuit[car.waypointIndex];

      const dx = targetWp[0] - car.x;
      const dz = targetWp[1] - car.z;
      const distToWp = Math.hypot(dx, dz);

      if (distToWp < 5.0) {
        car.waypointIndex = (car.waypointIndex + 1) % circuit.length;
      }

      const activeWp = circuit[car.waypointIndex];
      const activeDx = activeWp[0] - car.x;
      const activeDz = activeWp[1] - car.z;
      const targetAngle = Math.atan2(activeDx, activeDz);

      // Shortest-arc angular interpolation: buttery smooth corner turns
      let diff = (targetAngle - car.rotY) % (Math.PI * 2);
      if (diff < -Math.PI) diff += Math.PI * 2;
      if (diff > Math.PI) diff -= Math.PI * 2;
      car.rotY += diff * Math.min(1, dt * 5.5);

      // 3. Intersection Right-of-Way & Cross Traffic Management
      // City intersections are spaced at multiples of 70m (grid crossroads)
      const nearestIntX = Math.round(car.x / 70) * 70;
      const nearestIntZ = Math.round(car.z / 70) * 70;
      const distToInt = Math.hypot(car.x - nearestIntX, car.z - nearestIntZ);

      let mustYieldAtIntersection = false;
      const isInsideIntersection = distToInt < 6.8;
      const isApproachingIntersection = distToInt >= 6.8 && distToInt < 15.5;

      if (isApproachingIntersection) {
        for (let j = 0; j < trafficCars.length; j++) {
          if (j === idx) continue;
          const other = trafficCars[j];
          const oDistToInt = Math.hypot(other.x - nearestIntX, other.z - nearestIntZ);

          if (oDistToInt < 15.5) {
            if (oDistToInt < 6.8) {
              // Another car is already inside the intersection: yield at stop line!
              mustYieldAtIntersection = true;
              break;
            } else if (oDistToInt < distToInt || (Math.abs(oDistToInt - distToInt) < 1.0 && other.id < car.id)) {
              // Other car is closer to the intersection or has right-of-way priority
              mustYieldAtIntersection = true;
              break;
            }
          }
        }
      }

      // 4. AI Forward Look-Ahead Obstacle Detection
      const forwardX = Math.sin(car.rotY);
      const forwardZ = Math.cos(car.rotY);
      const rightX = Math.cos(car.rotY);
      const rightZ = -Math.sin(car.rotY);

      let minObstacleDist = Infinity;
      let blockedByPlayer = false;

      // Yield at intersection stop line if needed
      if (mustYieldAtIntersection) {
        const distToStopLine = Math.max(0.5, distToInt - 6.8);
        minObstacleDist = Math.min(minObstacleDist, distToStopLine + 1.2);
      }

      // Check A: Player Vehicle
      const pRelX = vehiclePhysics.pos.x - car.x;
      const pRelZ = vehiclePhysics.pos.z - car.z;
      const pForwardDist = pRelX * forwardX + pRelZ * forwardZ;
      const pLateralDist = Math.abs(pRelX * rightX + pRelZ * rightZ);

      if (pForwardDist > 0.4 && pForwardDist < 14.0 && pLateralDist < 2.4) {
        minObstacleDist = Math.min(minObstacleDist, pForwardDist);
        blockedByPlayer = true;
      }

      // Check B: Walking Player Pedestrian (when on foot)
      if (mode === 'walking') {
        const pedRelX = playerPhysics.pos.x - car.x;
        const pedRelZ = playerPhysics.pos.z - car.z;
        const pedForwardDist = pedRelX * forwardX + pedRelZ * forwardZ;
        const pedLateralDist = Math.abs(pedRelX * rightX + pedRelZ * rightZ);

        if (pedForwardDist > 0.3 && pedForwardDist < 12.0 && pedLateralDist < 2.2) {
          if (pedForwardDist < minObstacleDist) {
            minObstacleDist = pedForwardDist;
            blockedByPlayer = true;
          }
        }
      }

      // Check C: Other NPC Traffic Cars Ahead in Same Lane
      for (let j = 0; j < trafficCars.length; j++) {
        if (j === idx) continue;
        const other = trafficCars[j];
        const oRelX = other.x - car.x;
        const oRelZ = other.z - car.z;
        const oForwardDist = oRelX * forwardX + oRelZ * forwardZ;
        const oLateralDist = Math.abs(oRelX * rightX + oRelZ * rightZ);

        if (oForwardDist > 0.5 && oForwardDist < 14.0 && oLateralDist < 2.4) {
          if (oForwardDist < minObstacleDist) {
            minObstacleDist = oForwardDist;
          }
        }
      }

      // Check D: Parked Entity Vehicles Ahead in Lane
      for (const p of parkedVehicles) {
        const pkRelX = p.x - car.x;
        const pkRelZ = p.z - car.z;
        const pkForwardDist = pkRelX * forwardX + pkRelZ * forwardZ;
        const pkLateralDist = Math.abs(pkRelX * rightX + pkRelZ * rightZ);

        if (pkForwardDist > 0.5 && pkForwardDist < 14.0 && pkLateralDist < 2.4) {
          if (pkForwardDist < minObstacleDist) {
            minObstacleDist = pkForwardDist;
          }
        }
      }

      // 5. Adaptive Cruise Control & Active Braking
      if (isInsideIntersection && !blockedByPlayer) {
        // Cars inside an intersection maintain full cruise speed to clear out quickly
        car.targetSpeed = car.maxSpeed;
        car.isBraking = false;
        car.stoppedTimer = 0;
      } else if (minObstacleDist < 4.8) {
        car.stoppedTimer += dt;

        // Anti-gridlock unjam watchdog: if stopped for > 1.5s and NOT blocked by player,
        // force creep forward to clear intersection and break deadlocks
        if (!blockedByPlayer && car.stoppedTimer > 1.5) {
          car.targetSpeed = car.maxSpeed * 0.55;
          car.isBraking = false;
        } else {
          car.targetSpeed = 0;
          car.isBraking = true;
        }

        // Honk horn if stopped behind player for more than 1.6 seconds
        if (blockedByPlayer && car.stoppedTimer > 1.6 && car.honkCooldown <= 0) {
          soundSystem.playHonk();
          car.honkCooldown = 4.5;
        }
      } else if (minObstacleDist < 13.5) {
        // Smooth progressive lane following deceleration
        const followRatio = Math.max(0, (minObstacleDist - 4.8) / 8.5);
        car.targetSpeed = car.maxSpeed * followRatio;
        car.isBraking = true;
        car.stoppedTimer = 0;
      } else {
        // Open clear road: cruise smoothly at target speed
        car.targetSpeed = car.maxSpeed;
        car.isBraking = false;
        car.stoppedTimer = 0;
      }

      // Speed interpolation
      if (car.isBraking) {
        car.speed = THREE.MathUtils.lerp(car.speed, car.targetSpeed, dt * 14.0);
      } else {
        car.speed = THREE.MathUtils.lerp(car.speed, car.targetSpeed, dt * 4.5);
      }
      if (car.targetSpeed === 0 && car.speed < 0.15) {
        car.speed = 0;
      }

      // 6. Position Integration with Recoil Impulse
      car.x += Math.sin(car.rotY) * car.speed * dt + car.recoilX * dt;
      car.z += Math.cos(car.rotY) * car.speed * dt + car.recoilZ * dt;
      car.wheelSpin += car.speed * dt * 2.8;

      // Recoil damping
      car.recoilX *= Math.pow(0.04, dt);
      car.recoilZ *= Math.pow(0.04, dt);

      // 7. HARD PHYSICAL SOLID COLLISION RESOLUTION
      // Collision A: Against Player Vehicle
      const carToPlayerX = car.x - vehiclePhysics.pos.x;
      const carToPlayerZ = car.z - vehiclePhysics.pos.z;
      const distToPlayerCar = Math.hypot(carToPlayerX, carToPlayerZ);
      const minCarSeparation = 3.4;

      if (distToPlayerCar < minCarSeparation) {
        const penetration = minCarSeparation - distToPlayerCar;
        const normX = distToPlayerCar > 0.001 ? carToPlayerX / distToPlayerCar : Math.sin(car.rotY);
        const normZ = distToPlayerCar > 0.001 ? carToPlayerZ / distToPlayerCar : Math.cos(car.rotY);

        car.x += normX * penetration * 0.55;
        car.z += normZ * penetration * 0.55;
        vehiclePhysics.pos.x -= normX * penetration * 0.45;
        vehiclePhysics.pos.z -= normZ * penetration * 0.45;

        car.speed = 0;
        car.isBraking = true;

        if (Math.abs(vehiclePhysics.velocity) > 1.2) {
          vehiclePhysics.velocity *= -0.32;
          soundSystem.playCollisionSound(0.7);
        }
      }

      // Collision B: Against Walking Player Pedestrian
      if (mode === 'walking') {
        const carToPedX = car.x - playerPhysics.pos.x;
        const carToPedZ = car.z - playerPhysics.pos.z;
        const distToPed = Math.hypot(carToPedX, carToPedZ);
        const minPedSeparation = 2.2;

        if (distToPed < minPedSeparation) {
          const penetration = minPedSeparation - distToPed;
          const normX = distToPed > 0.001 ? carToPedX / distToPed : Math.sin(car.rotY);
          const normZ = distToPed > 0.001 ? carToPedZ / distToPed : Math.cos(car.rotY);

          playerPhysics.pos.x -= normX * penetration;
          playerPhysics.pos.z -= normZ * penetration;

          car.speed = 0;
          car.isBraking = true;
          soundSystem.playCollisionSound(0.35);
        }
      }

      // Collision C: Between NPC Traffic Cars (Zero Interlock / Clear Out Lead Car)
      for (let k = idx + 1; k < trafficCars.length; k++) {
        const otherCar = trafficCars[k];
        const cDx = car.x - otherCar.x;
        const cDz = car.z - otherCar.z;
        const cDist = Math.hypot(cDx, cDz);
        const minInterCarDist = 3.4;

        if (cDist < minInterCarDist) {
          const pen = minInterCarDist - cDist;
          const nx = cDist > 0.001 ? cDx / cDist : 1;
          const nz = cDist > 0.001 ? cDz / cDist : 0;

          car.x += nx * pen * 0.5;
          car.z += nz * pen * 0.5;
          otherCar.x -= nx * pen * 0.5;
          otherCar.z -= nz * pen * 0.5;

          // The lead car maintains momentum to exit contact zone; trailing car yields
          const dotLead = -cDx * Math.sin(car.rotY) - cDz * Math.cos(car.rotY);
          if (dotLead > 0) {
            // otherCar is ahead: otherCar clears out, car yields
            otherCar.targetSpeed = otherCar.maxSpeed;
            otherCar.isBraking = false;
            car.targetSpeed = 0;
            car.isBraking = true;
          } else {
            // car is ahead: car clears out, otherCar yields
            car.targetSpeed = car.maxSpeed;
            car.isBraking = false;
            otherCar.targetSpeed = 0;
            otherCar.isBraking = true;
          }
        }
      }

      // Collision D: Against Parked Entity Vehicles
      for (const p of parkedVehicles) {
        const pkDx = car.x - p.x;
        const pkDz = car.z - p.z;
        const pkDist = Math.hypot(pkDx, pkDz);
        const minPkDist = 3.4;

        if (pkDist < minPkDist) {
          const pen = minPkDist - pkDist;
          const nx = pkDist > 0.001 ? pkDx / pkDist : Math.sin(car.rotY);
          const nz = pkDist > 0.001 ? pkDz / pkDist : Math.cos(car.rotY);

          car.x += nx * pen;
          car.z += nz * pen;
          car.speed = 0;
          car.isBraking = true;
        }
      }

      // 8. Update 3D Transform
      const mesh = carMeshesRef.current[idx];
      if (mesh) {
        mesh.position.set(car.x, 0.45, car.z);
        mesh.rotation.y = car.rotY;

        // Dynamic Brake Light Glow
        const leftTail = tailLightRefs.current[idx * 2];
        const rightTail = tailLightRefs.current[idx * 2 + 1];
        const isBraking = car.isBraking || car.speed < 1.0;
        const emissiveIntensity = isBraking ? 3.5 : (isNight ? 2.0 : 0.4);
        const emissiveColor = isBraking ? '#ff0000' : '#ef4444';

        if (leftTail) {
          (leftTail.material as THREE.MeshStandardMaterial).emissiveIntensity = emissiveIntensity;
          (leftTail.material as THREE.MeshStandardMaterial).emissive.set(emissiveColor);
        }
        if (rightTail) {
          (rightTail.material as THREE.MeshStandardMaterial).emissiveIntensity = emissiveIntensity;
          (rightTail.material as THREE.MeshStandardMaterial).emissive.set(emissiveColor);
        }
      }
    });
  });

  return (
    <group>
      {trafficCars.map((car, idx) => {
        const isSuv = car.category === 'suv';
        const isSports = car.category === 'sports';

        const bodyGeo = isSuv ? geoSuvBody : (isSports ? geoSportsBody : geoSedanBody);
        const cabinGeo = isSuv ? geoSuvCabin : (isSports ? geoSportsCabin : geoSedanCabin);
        const cabinY = isSuv ? 1.05 : (isSports ? 0.85 : 0.95);
        const cabinZ = isSuv ? 0.0 : (isSports ? -0.25 : -0.15);

        return (
          <group
            key={car.id}
            ref={(el) => (carMeshesRef.current[idx] = el)}
            position={[car.x, 0.45, car.z]}
            rotation={[0, car.rotY, 0]}
          >
            {/* Main Aerodynamic Car Body */}
            <mesh position={[0, 0.45, 0]} geometry={bodyGeo} castShadow receiveShadow>
              <meshStandardMaterial color={car.color} roughness={0.25} metalness={0.75} />
            </mesh>

            {/* Tinted Cabin Glass */}
            <mesh position={[0, cabinY, cabinZ]} geometry={cabinGeo} material={cabinMat} />

            {/* Sports Car Rear Spoiler */}
            {isSports && (
              <group position={[0, 0.95, -1.9]}>
                <mesh geometry={geoSpoilerWing}>
                  <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.8} />
                </mesh>
                <mesh position={[-0.6, -0.15, 0]}>
                  <boxGeometry args={[0.08, 0.3, 0.15]} />
                  <meshStandardMaterial color="#0f172a" />
                </mesh>
                <mesh position={[0.6, -0.15, 0]}>
                  <boxGeometry args={[0.08, 0.3, 0.15]} />
                  <meshStandardMaterial color="#0f172a" />
                </mesh>
              </group>
            )}

            {/* Front Headlights */}
            <mesh position={[-0.72, 0.45, 2.21]} geometry={geoHeadlight}>
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={isNight ? 2.8 : 0.3}
              />
            </mesh>
            <mesh position={[0.72, 0.45, 2.21]} geometry={geoHeadlight}>
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={isNight ? 2.8 : 0.3}
              />
            </mesh>

            {/* Rear Taillights & Dynamic Brake Lights */}
            <mesh
              ref={(el) => (tailLightRefs.current[idx * 2] = el)}
              position={[-0.72, 0.5, -2.21]}
              geometry={geoTaillight}
            >
              <meshStandardMaterial
                color="#ef4444"
                emissive="#ef4444"
                emissiveIntensity={isNight ? 2.0 : 0.4}
              />
            </mesh>
            <mesh
              ref={(el) => (tailLightRefs.current[idx * 2 + 1] = el)}
              position={[0.72, 0.5, -2.21]}
              geometry={geoTaillight}
            >
              <meshStandardMaterial
                color="#ef4444"
                emissive="#ef4444"
                emissiveIntensity={isNight ? 2.0 : 0.4}
              />
            </mesh>

            {/* 4 Wheels */}
            {[-0.98, 0.98].map((wx, wi) =>
              [-1.3, 1.3].map((wz, zi) => (
                <mesh
                  key={`${wi}-${zi}`}
                  position={[wx, 0.15, wz]}
                  rotation={[0, 0, Math.PI / 2]}
                  geometry={geoWheel}
                  material={wheelMat}
                />
              ))
            )}
          </group>
        );
      })}
    </group>
  );
};
