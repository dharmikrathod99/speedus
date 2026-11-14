import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import { VEHICLES } from '../../data/vehicles';
import { VehicleMesh } from './VehicleMesh';
import { soundSystem } from '../../audio/soundSystem';
import { vehiclePhysics, playerPhysics } from '../../stores/vehiclePhysics';
import { resolveWorldCollisions } from '../../physics/worldCollisions';
import { sampleRampElevation } from '../../physics/rampPhysics';
import { getTrafficObstacles, applyTrafficRecoil, trafficCars } from '../../stores/trafficPhysics';
import { getParkedObstacles } from '../../stores/entityVehicles';
import { usePedestrianStore } from '../../stores/pedestrianCombat';
import { virtualInput } from '../../stores/virtualInput';

export const DrivableVehicle: React.FC = () => {
  const mode = useGameStore((s) => s.mode);
  const activeVehicleId = useGameStore((s) => s.player.activeVehicleId) || 'cyclone-turbo';
  const customization = useGameStore((s) => s.player.ownedVehicles[activeVehicleId]);
  const syncTelemetry = useGameStore((s) => s.syncVehicleTelemetry);
  const headlightsOn = useGameStore((s) => s.headlightsOn);
  const hazardsOn = useGameStore((s) => s.hazardsOn);
  const cycleCamera = useGameStore((s) => s.cycleCameraMode);
  const toggleHeadlights = useGameStore((s) => s.toggleHeadlights);
  const toggleHazards = useGameStore((s) => s.toggleHazards);

  const def = VEHICLES[activeVehicleId] || Object.values(VEHICLES)[0];
  const groupRef = useRef<THREE.Group>(null);
  const [hornActive, setHornActive] = useState(false);
  const lastUiUpdateRef = useRef<number>(0);

  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    handbrake: false,
    boost: false
  });

  // Global key bindings for driving
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      const k = e.key.toLowerCase();

      // Police call-off cheat: Ctrl + P
      if ((e.ctrlKey || e.metaKey) && k === 'p') {
        e.preventDefault();
        e.stopPropagation();
        usePedestrianStore.getState().clearPolicePursuit();
        return;
      }

      // God Mode Health cheat: Ctrl + H (100,000 HP)
      if ((e.ctrlKey || e.metaKey) && k === 'h') {
        e.preventDefault();
        e.stopPropagation();
        useGameStore.getState().activateGodHealthCheat();
        return;
      }

      // Restore Base Health cheat: Ctrl + 1 (1,000 HP)
      if ((e.ctrlKey || e.metaKey) && (e.key === '1' || e.code === 'Digit1')) {
        e.preventDefault();
        e.stopPropagation();
        useGameStore.getState().resetHealthToStandard();
        return;
      }

      if (k === 'w' || e.key === 'ArrowUp') keys.current.forward = true;
      if (k === 's' || e.key === 'ArrowDown') keys.current.backward = true;
      if (k === 'a' || e.key === 'ArrowLeft') keys.current.left = true;
      if (k === 'd' || e.key === 'ArrowRight') keys.current.right = true;
      if (e.code === 'Space') keys.current.handbrake = true;
      if (e.key === 'Shift') keys.current.boost = true;

      if (k === 'h' && !hornActive && mode === 'driving') {
        setHornActive(true);
        soundSystem.startHorn();
      }
      if (k === 'l' && mode === 'driving') toggleHeadlights();
      if (k === 'k' && mode === 'driving') toggleHazards();
      if (k === 'v' && mode === 'driving') cycleCamera();
      if (k === 'r' && mode === 'driving') {
        vehiclePhysics.velocity = 0;
        vehiclePhysics.pos.y = 0.4;
        vehiclePhysics.pitch = 0;
        vehiclePhysics.roll = 0;
        soundSystem.playUiClick();
        useGameStore.getState().showNotification('Vehicle Reset', 'Vehicle repositioned safely.', 'info');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || e.key === 'ArrowUp') keys.current.forward = false;
      if (k === 's' || e.key === 'ArrowDown') keys.current.backward = false;
      if (k === 'a' || e.key === 'ArrowLeft') keys.current.left = false;
      if (k === 'd' || e.key === 'ArrowRight') keys.current.right = false;
      if (e.code === 'Space') keys.current.handbrake = false;
      if (e.key === 'Shift') keys.current.boost = false;

      if (k === 'h') {
        setHornActive(false);
        soundSystem.stopHorn();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mode, hornActive, toggleHeadlights, toggleHazards, cycleCamera]);

  // Main Vehicle Physics Loop - Direct 60 FPS transform without React state churn
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const isDriving = mode === 'driving';

    // Upgrade modifiers
    const engineBonus = 1 + (customization?.engineLevel || 0) * 0.12;
    const turboBonus = customization?.hasTurbo ? 1.25 : 1.0;
    const totalPower = engineBonus * turboBonus;
    const topSpeedKmh = def.topSpeed * totalPower;
    const topSpeedMs = topSpeedKmh / 3.6;

    let forwardAcc = (35 / def.acceleration) * totalPower;
    let brakeDec = 28 * (1 + (customization?.brakeLevel || 0) * 0.15);
    let naturalDrag = 3.5;

    let throttle = 0;
    let isBraking = false;
    let isReversing = false;
    let isBoosting = false;

    if (isDriving) {
      // Merge physical keyboard and mobile touch virtual inputs
      const isFwd = keys.current.forward || virtualInput.forward || virtualInput.analogY > 0.25;
      const isBwd = keys.current.backward || virtualInput.backward || virtualInput.analogY < -0.25;
      const isLft = keys.current.left || virtualInput.left || virtualInput.analogX < -0.25;
      const isRgt = keys.current.right || virtualInput.right || virtualInput.analogX > 0.25;
      const isHandbrake = keys.current.handbrake || virtualInput.handbrake;
      const isBoost = keys.current.boost || virtualInput.boost;

      if (isBoost && vehiclePhysics.nitro > 5 && vehiclePhysics.velocity > 5) {
        isBoosting = true;
        forwardAcc *= 1.55;
        vehiclePhysics.nitro = Math.max(0, vehiclePhysics.nitro - dt * 25);
        soundSystem.triggerNitroSound(true);
      } else {
        vehiclePhysics.nitro = Math.min(100, vehiclePhysics.nitro + dt * 8);
      }

      if (isFwd) {
        throttle = 1;
        if (vehiclePhysics.velocity < topSpeedMs) {
          vehiclePhysics.velocity += forwardAcc * dt;
        }
      } else if (isBwd) {
        if (vehiclePhysics.velocity > 1.0) {
          isBraking = true;
          vehiclePhysics.velocity = Math.max(0, vehiclePhysics.velocity - brakeDec * dt);
        } else {
          isReversing = true;
          throttle = 0.5;
          vehiclePhysics.velocity = Math.max(-15, vehiclePhysics.velocity - forwardAcc * 0.5 * dt);
        }
      }

      if (isHandbrake) {
        isBraking = true;
        vehiclePhysics.velocity *= Math.pow(0.4, dt);
      }

      // Speed-dependent responsive steering (keyboard or smooth analog thumbstick)
      const speedAbs = Math.abs(vehiclePhysics.velocity);
      const speedFactor = Math.max(0.25, 1 - (speedAbs / topSpeedMs) * 0.65);
      const maxSteer = 0.55 * speedFactor;

      let targetSteer = 0;
      if (Math.abs(virtualInput.analogX) > 0.1) {
        // Direct analog steering from mobile touch joystick
        targetSteer = -virtualInput.analogX * maxSteer;
      } else {
        if (isLft) targetSteer = maxSteer;
        if (isRgt) targetSteer = -maxSteer;
      }

      vehiclePhysics.steerAngle = THREE.MathUtils.lerp(vehiclePhysics.steerAngle, targetSteer, dt * 10);

      if (speedAbs > 0.1) {
        const turnSpeed = (vehiclePhysics.steerAngle * (def.handling / 8)) * (vehiclePhysics.velocity > 0 ? 1 : -1);
        vehiclePhysics.heading += turnSpeed * (speedAbs / 6) * dt;
      }
    } else {
      vehiclePhysics.velocity *= Math.pow(0.2, dt);
      vehiclePhysics.steerAngle = THREE.MathUtils.lerp(vehiclePhysics.steerAngle, 0, dt * 5);
      if (Math.abs(vehiclePhysics.velocity) < 0.05) vehiclePhysics.velocity = 0;
    }

    if (!keys.current.forward && !keys.current.backward) {
      if (vehiclePhysics.velocity > 0) {
        vehiclePhysics.velocity = Math.max(0, vehiclePhysics.velocity - naturalDrag * dt);
      } else if (vehiclePhysics.velocity < 0) {
        vehiclePhysics.velocity = Math.min(0, vehiclePhysics.velocity + naturalDrag * dt);
      }
    }

    // Update Position directly on vehiclePhysics.pos
    const moveX = Math.sin(vehiclePhysics.heading) * vehiclePhysics.velocity * dt;
    const moveZ = Math.cos(vehiclePhysics.heading) * vehiclePhysics.velocity * dt;
    vehiclePhysics.pos.x += moveX;
    vehiclePhysics.pos.z += moveZ;

    // Solid World & Traffic Collision Resolution: prevents vehicle from phasing through buildings, trees, and other cars
    const carRadius = (def.dimensions?.width || 2.2) * 0.55;
    const trafficObstacles = [...getTrafficObstacles(), ...getParkedObstacles()];
    const col = resolveWorldCollisions(vehiclePhysics.pos.x, vehiclePhysics.pos.z, carRadius, trafficObstacles);
    if (col.collided) {
      vehiclePhysics.pos.x = col.x;
      vehiclePhysics.pos.z = col.z;

      // Realistic impact response
      const impactSpeed = Math.abs(vehiclePhysics.velocity);
      if (impactSpeed > 1.8) {
        soundSystem.playCollisionSound(Math.min(1.0, impactSpeed / 20));
        vehiclePhysics.velocity *= -0.32; // Kinetic recoil bounce off solid surface

        if (impactSpeed > 10.0) {
          useGameStore.setState((s) => ({
            vehicleHealth: Math.max(10, s.vehicleHealth - Math.round(impactSpeed * 0.45))
          }));
        }

        // Kinetic impulse transfer to NPC traffic car on collision
        if (col.hitType === 'vehicle') {
          let closestCar = trafficCars[0];
          let closestDist = Infinity;
          for (const tc of trafficCars) {
            const d = Math.hypot(tc.x - vehiclePhysics.pos.x, tc.z - vehiclePhysics.pos.z);
            if (d < closestDist) {
              closestDist = d;
              closestCar = tc;
            }
          }
          if (closestCar && closestDist < 4.5) {
            applyTrafficRecoil(closestCar.id, -col.normalX * impactSpeed * 0.4, -col.normalZ * impactSpeed * 0.4);
          }
        }
      }
    }

    // Dynamic 3D Ramp & Stunt Jump Physics
    const ramp = sampleRampElevation(vehiclePhysics.pos.x, vehiclePhysics.pos.z);
    const baseGroundY = 0.4;

    if (ramp.onRamp && !vehiclePhysics.isAirborne) {
      const targetRampY = baseGroundY + ramp.height;
      vehiclePhysics.pos.y = targetRampY;
      vehiclePhysics.pitch = THREE.MathUtils.lerp(vehiclePhysics.pitch, -ramp.rampAngle, dt * 14);

      // Launch off ramp lip if forward velocity is strong
      if (ramp.isLaunchLip && vehiclePhysics.velocity > 3.5) {
        vehiclePhysics.isAirborne = true;
        vehiclePhysics.velocityY = Math.max(6.0, vehiclePhysics.velocity * Math.sin(ramp.rampAngle) * 1.55);
        vehiclePhysics.jumpAirtime = 0;
        soundSystem.playUiClick();
      }
    } else if (vehiclePhysics.isAirborne || vehiclePhysics.pos.y > baseGroundY) {
      // Mid-Air Ballistic Flight & Gravity
      vehiclePhysics.velocityY -= 16.5 * dt;
      vehiclePhysics.pos.y += vehiclePhysics.velocityY * dt;
      vehiclePhysics.jumpAirtime += dt;

      // Dynamic flight pitch matching trajectory
      const flightPitch = -Math.atan2(vehiclePhysics.velocityY, Math.max(6.0, Math.abs(vehiclePhysics.velocity)));
      vehiclePhysics.pitch = THREE.MathUtils.lerp(vehiclePhysics.pitch, flightPitch, dt * 7);

      // Check ground or ramp landing
      const groundFloor = ramp.onRamp ? (baseGroundY + ramp.height) : baseGroundY;
      if (vehiclePhysics.pos.y <= groundFloor) {
        vehiclePhysics.pos.y = groundFloor;

        // Successful Stunt Jump Landing!
        if (vehiclePhysics.jumpAirtime > 0.4) {
          soundSystem.playCollisionSound(0.45);
          const bonusCash = Math.round(vehiclePhysics.jumpAirtime * 280 + Math.abs(vehiclePhysics.velocity) * 10);
          useGameStore.getState().addCash(bonusCash, 'Stunt Jump Bonus');
          useGameStore.getState().showNotification(
            '🔥 STUNT JUMP LANDED!',
            `Airtime: ${vehiclePhysics.jumpAirtime.toFixed(1)}s • Jump Reward: +$${bonusCash}`,
            'success'
          );
        }

        vehiclePhysics.velocityY = 0;
        vehiclePhysics.isAirborne = false;
        vehiclePhysics.jumpAirtime = 0;
        vehiclePhysics.pitch = THREE.MathUtils.lerp(vehiclePhysics.pitch, 0, dt * 10);
      }
    } else {
      vehiclePhysics.pos.y = THREE.MathUtils.lerp(vehiclePhysics.pos.y, baseGroundY, dt * 10);
      vehiclePhysics.pitch = THREE.MathUtils.lerp(vehiclePhysics.pitch, 0, dt * 8);
    }

    // Wheel spin
    vehiclePhysics.wheelSpin += (vehiclePhysics.velocity / (def.dimensions.height * 0.28)) * dt;

    // Speed, Gear & RPM
    const currentSpeedKmh = Math.abs(vehiclePhysics.velocity) * 3.6;
    vehiclePhysics.speedKmh = currentSpeedKmh;

    let gear: number | 'R' | 'N' = 1;
    let targetRpm = 800;

    if (vehiclePhysics.velocity < -0.1) {
      gear = 'R';
      targetRpm = 1200 + Math.abs(vehiclePhysics.velocity) * 200;
    } else if (currentSpeedKmh < 0.5) {
      gear = 'N';
      targetRpm = 800 + throttle * 1500;
    } else if (currentSpeedKmh < 45) {
      gear = 1;
      targetRpm = 1000 + (currentSpeedKmh / 45) * 6500;
    } else if (currentSpeedKmh < 85) {
      gear = 2;
      targetRpm = 2500 + ((currentSpeedKmh - 45) / 40) * 5500;
    } else if (currentSpeedKmh < 135) {
      gear = 3;
      targetRpm = 3000 + ((currentSpeedKmh - 85) / 50) * 5200;
    } else if (currentSpeedKmh < 190) {
      gear = 4;
      targetRpm = 3500 + ((currentSpeedKmh - 135) / 55) * 4800;
    } else if (currentSpeedKmh < 250) {
      gear = 5;
      targetRpm = 3800 + ((currentSpeedKmh - 190) / 60) * 4400;
    } else {
      gear = 6;
      targetRpm = 4000 + ((currentSpeedKmh - 250) / 150) * 4200;
    }

    vehiclePhysics.gear = gear;
    vehiclePhysics.rpm = THREE.MathUtils.lerp(vehiclePhysics.rpm, Math.min(8500, targetRpm), dt * 14);

    // Dynamic Suspension Pitch & Roll
    const targetPitch = isBraking ? 0.05 : (keys.current.forward ? -0.04 : 0);
    const targetRoll = (vehiclePhysics.steerAngle * (currentSpeedKmh / 120)) * 0.08;
    vehiclePhysics.pitch = THREE.MathUtils.lerp(vehiclePhysics.pitch, targetPitch, dt * 8);
    vehiclePhysics.roll = THREE.MathUtils.lerp(vehiclePhysics.roll, targetRoll, dt * 8);

    vehiclePhysics.isBraking = isBraking;
    vehiclePhysics.isDrifting = keys.current.handbrake && currentSpeedKmh > 25;
    vehiclePhysics.isBoosting = isBoosting;

    // Keep player position locked to vehicle during driving so there is zero displacement on exit
    if (isDriving) {
      playerPhysics.pos.set(vehiclePhysics.pos.x, vehiclePhysics.pos.y, vehiclePhysics.pos.z);
      playerPhysics.rotationY = vehiclePhysics.heading;
    }

    // Apply directly to the 3D Group Transform (zero React re-render lag)
    if (groupRef.current) {
      groupRef.current.position.set(vehiclePhysics.pos.x, vehiclePhysics.pos.y, vehiclePhysics.pos.z);
      groupRef.current.rotation.y = vehiclePhysics.heading;
    }

    // Audio
    soundSystem.updateEngine(vehiclePhysics.rpm, throttle, isDriving);
    soundSystem.updateSkid(vehiclePhysics.isDrifting ? 0.8 : 0);

    // Atomic throttled UI Telemetry & Position update (every 90ms = ~11Hz)
    // Drops main-thread React updates by 85%, ensuring pure 60 FPS WebGL driving!
    const now = performance.now();
    if (now - lastUiUpdateRef.current > 90) {
      lastUiUpdateRef.current = now;
      syncTelemetry({
        speed: Math.round(currentSpeedKmh),
        rpm: Math.round(vehiclePhysics.rpm),
        gear,
        nitro: Math.round(vehiclePhysics.nitro),
        braking: isBraking,
        drifting: vehiclePhysics.isDrifting,
        pos: [vehiclePhysics.pos.x, vehiclePhysics.pos.y, vehiclePhysics.pos.z],
        rot: [0, vehiclePhysics.heading, 0]
      });
    }
  });

  const distToPlayer = Math.hypot(playerPhysics.pos.x - vehiclePhysics.pos.x, playerPhysics.pos.z - vehiclePhysics.pos.z);
  const canEnter = mode === 'walking' && distToPlayer < 5.0;

  return (
    <group ref={groupRef} position={[vehiclePhysics.pos.x, vehiclePhysics.pos.y, vehiclePhysics.pos.z]}>
      <VehicleMesh
        def={def}
        customization={customization || {
          color: def.defaultColor,
          finish: 'metallic',
          underglow: '#00f0ff',
          spoiler: 1,
          engineLevel: 1,
          hasTurbo: true,
          brakeLevel: 1,
          suspensionLevel: 1,
          wheelColor: '#38bdf8',
          windowTint: 0.25
        }}
        steerAngle={vehiclePhysics.steerAngle}
        wheelSpin={vehiclePhysics.wheelSpin}
        isBraking={vehiclePhysics.isBraking}
        isReversing={keys.current.backward && vehiclePhysics.velocity < -0.1}
        headlightsOn={headlightsOn}
        hazardsOn={hazardsOn}
        isBoosting={vehiclePhysics.isBoosting}
        isDrifting={vehiclePhysics.isDrifting}
        pitchAngle={vehiclePhysics.pitch}
        rollAngle={vehiclePhysics.roll}
      />
    </group>
  );
};
