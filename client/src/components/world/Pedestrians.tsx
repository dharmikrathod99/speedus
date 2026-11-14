import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePedestrianStore, NpcEntity } from '../../stores/pedestrianCombat';
import { useGameStore } from '../../stores/gameStore';
import { vehiclePhysics } from '../../stores/vehiclePhysics';

const geoHead = new THREE.SphereGeometry(0.18, 14, 14);
const geoTorso = new THREE.BoxGeometry(0.42, 0.58, 0.24);
const geoLeg = new THREE.BoxGeometry(0.16, 0.68, 0.18);
const geoArm = new THREE.BoxGeometry(0.12, 0.54, 0.14);
const geoShadow = new THREE.RingGeometry(0.08, 0.38, 14);
const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 });

// 3D Weapons Geometries
const geoBat = new THREE.CylinderGeometry(0.025, 0.045, 0.75, 8);
const batMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
const geoPistolBody = new THREE.BoxGeometry(0.05, 0.12, 0.22);
const geoPistolGrip = new THREE.BoxGeometry(0.045, 0.14, 0.06);
const gunMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8, roughness: 0.2 });

// 3D Cash Drop Geometries
const geoCashStack = new THREE.BoxGeometry(0.38, 0.08, 0.22);
const cashMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x15803d, emissiveIntensity: 0.6, roughness: 0.4 });
const geoCashHalo = new THREE.RingGeometry(0.25, 0.45, 16);
const cashHaloMat = new THREE.MeshBasicMaterial({ color: 0x4ade80, side: THREE.DoubleSide });

// Health bar geometries
const geoHealthBg = new THREE.PlaneGeometry(0.65, 0.08);
const geoHealthFill = new THREE.PlaneGeometry(0.63, 0.06);
const matHealthBg = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
const matHealthGreen = new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide });
const matHealthRed = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });

export const Pedestrians: React.FC = () => {
  const npcs = usePedestrianStore((s) => s.npcs);
  const cashDrops = usePedestrianStore((s) => s.cashDrops);
  const updateCombatLoop = usePedestrianStore((s) => s.updateCombatLoop);
  const playerVehicleHit = usePedestrianStore((s) => s.playerVehicleHit);

  const mode = useGameStore((s) => s.mode);
  const vehicleSpeed = useGameStore((s) => s.vehicleSpeed);

  const pedMeshes = useRef<(THREE.Group | null)[]>([]);
  const lastVehicleHitTime = useRef<number>(0);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const time = clock.getElapsedTime();

    // 1. Advance NPC AI, brawls, police chases & combat
    updateCombatLoop(dt);

    // 2. High-speed vehicle pedestrian impacts
    if (mode === 'driving' && vehicleSpeed > 12) {
      const now = performance.now();
      if (now - lastVehicleHitTime.current > 400) {
        const vx = vehiclePhysics.pos.x;
        const vz = vehiclePhysics.pos.z;

        for (const npc of npcs) {
          if (npc.state === 'dead') continue;
          const d = Math.hypot(vx - npc.x, vz - npc.z);
          if (d < 2.5) {
            lastVehicleHitTime.current = now;
            playerVehicleHit(npc.id, vehicleSpeed, vehiclePhysics.heading);
            break;
          }
        }
      }
    }

    // 3. Animate individual NPC limbs, attacks, and ragdoll orientation
    npcs.forEach((ped, i) => {
      const group = pedMeshes.current[i];
      if (!group) return;

      if (ped.state === 'dead') {
        // Ragdoll / Downed position: lying flat on the sidewalk
        group.position.set(ped.x, 0.12, ped.z);
        group.rotation.x = -Math.PI / 2;
        group.rotation.y = ped.rotationY;
        group.rotation.z = 0.2; // natural limp angle

        const leftLeg = group.getObjectByName('leftLeg');
        const rightLeg = group.getObjectByName('rightLeg');
        const leftArm = group.getObjectByName('leftArm');
        const rightArm = group.getObjectByName('rightArm');
        if (leftLeg) leftLeg.rotation.x = 0.1;
        if (rightLeg) rightLeg.rotation.x = -0.15;
        if (leftArm) leftArm.rotation.x = 0.3;
        if (rightArm) rightArm.rotation.x = -0.4;
      } else {
        // Standing / Running / Attacking position
        group.position.set(ped.x, 0, ped.z);
        group.rotation.x = 0;
        group.rotation.y = ped.rotationY;
        group.rotation.z = 0;

        const isRunning = ped.state === 'attacking_player' || ped.state === 'attacking_npc' || ped.state === 'fleeing';
        const animSpeed = isRunning ? 14 : 7;
        const stride = Math.sin(time * animSpeed * (ped.speed / 1.8));

        const leftLeg = group.getObjectByName('leftLeg');
        const rightLeg = group.getObjectByName('rightLeg');
        const leftArm = group.getObjectByName('leftArm');
        const rightArm = group.getObjectByName('rightArm');

        if (leftLeg) leftLeg.rotation.x = stride * (isRunning ? 0.65 : 0.42);
        if (rightLeg) rightLeg.rotation.x = -stride * (isRunning ? 0.65 : 0.42);

        // Combat strike animation (punching forward with right arm)
        const isAttacking = (ped.state === 'attacking_player' || ped.state === 'attacking_npc') && ped.attackCooldown > 0.4;
        if (isAttacking) {
          if (rightArm) rightArm.rotation.x = -Math.PI / 2 + Math.sin(time * 20) * 0.4;
          if (leftArm) leftArm.rotation.x = -0.3;
        } else {
          if (leftArm) leftArm.rotation.x = -stride * 0.35;
          if (rightArm) rightArm.rotation.x = stride * 0.35;
        }
      }
    });
  });

  return (
    <group>
      {/* ========================================================
          LIVING NPCS (CIVILIANS, GANGSTERS, POLICE)
      ======================================================== */}
      {npcs.map((ped, i) => {
        const isDamaged = ped.health < ped.maxHealth && ped.state !== 'dead';
        const healthPct = Math.max(0, Math.min(1, ped.health / ped.maxHealth));

        return (
          <group
            key={ped.id}
            ref={(el) => (pedMeshes.current[i] = el)}
            position={[ped.x, 0, ped.z]}
          >
            {/* Overhead Role & Status Indicator Badge */}
            {ped.state !== 'dead' && (
              <group position={[0, 2.2, 0]}>
                {/* Role Pill */}
                <mesh position={[0, 0.12, 0]}>
                  <boxGeometry args={[0.65, 0.16, 0.04]} />
                  <meshBasicMaterial
                    color={
                      ped.role === 'police'
                        ? '#1d4ed8'
                        : ped.role === 'gangster'
                        ? '#b91c1c'
                        : '#047857'
                    }
                  />
                </mesh>

                {/* Overhead Mini Health Bar (Shown when damaged or in combat) */}
                {(isDamaged || ped.state === 'attacking_player') && (
                  <group position={[0, -0.05, 0.03]}>
                    <mesh geometry={geoHealthBg} material={matHealthBg} />
                    <mesh
                      position={[-(1 - healthPct) * 0.315, 0, 0.005]}
                      scale={[healthPct, 1, 1]}
                      geometry={geoHealthFill}
                      material={healthPct > 0.35 ? matHealthGreen : matHealthRed}
                    />
                  </group>
                )}
              </group>
            )}

            {/* Head */}
            <mesh position={[0, 1.68, 0]} geometry={geoHead}>
              <meshStandardMaterial color={ped.skinColor} roughness={0.5} />
            </mesh>

            {/* Hair */}
            <mesh position={[0, 1.79, -0.02]}>
              <boxGeometry args={[0.32, 0.12, 0.34]} />
              <meshStandardMaterial color={ped.hairColor} roughness={0.8} />
            </mesh>

            {/* Police Cap (If Police Officer) */}
            {ped.role === 'police' && (
              <group position={[0, 1.83, 0.02]}>
                <mesh>
                  <boxGeometry args={[0.34, 0.08, 0.34]} />
                  <meshStandardMaterial color="#1e3a8a" roughness={0.5} />
                </mesh>
                <mesh position={[0, 0.04, 0.04]}>
                  <boxGeometry args={[0.08, 0.06, 0.02]} />
                  <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
                </mesh>
                <mesh position={[0, -0.02, 0.14]}>
                  <boxGeometry args={[0.32, 0.02, 0.14]} />
                  <meshStandardMaterial color="#0f172a" roughness={0.3} />
                </mesh>
              </group>
            )}

            {/* Eyes & Facial Expression */}
            <mesh position={[-0.055, 1.70, 0.165]}>
              <boxGeometry args={[0.035, 0.022, 0.015]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[-0.055, 1.70, 0.174]}>
              <boxGeometry args={[0.018, 0.018, 0.006]} />
              <meshBasicMaterial color="#18181b" />
            </mesh>
            <mesh position={[0.055, 1.70, 0.165]}>
              <boxGeometry args={[0.035, 0.022, 0.015]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0.055, 1.70, 0.174]}>
              <boxGeometry args={[0.018, 0.018, 0.006]} />
              <meshBasicMaterial color="#18181b" />
            </mesh>

            {/* Eyebrows (Angry if gangster/cop or attacking) */}
            <mesh
              position={[-0.055, 1.73, 0.17]}
              rotation={[0, 0, ped.state === 'attacking_player' ? -0.25 : 0]}
            >
              <boxGeometry args={[0.04, 0.01, 0.01]} />
              <meshBasicMaterial color={ped.hairColor} />
            </mesh>
            <mesh
              position={[0.055, 1.73, 0.17]}
              rotation={[0, 0, ped.state === 'attacking_player' ? 0.25 : 0]}
            >
              <boxGeometry args={[0.04, 0.01, 0.01]} />
              <meshBasicMaterial color={ped.hairColor} />
            </mesh>

            {/* Nose */}
            <mesh position={[0, 1.665, 0.18]}>
              <boxGeometry args={[0.024, 0.028, 0.02]} />
              <meshStandardMaterial color={ped.skinColor} roughness={0.5} />
            </mesh>

            {/* Mouth */}
            <mesh position={[0, 1.62, 0.168]}>
              <boxGeometry args={[0.045, 0.014, 0.012]} />
              <meshBasicMaterial color={ped.state === 'dead' ? '#450a0a' : '#991b1b'} />
            </mesh>

            {/* Torso / Shirt */}
            <mesh position={[0, 1.22, 0]} geometry={geoTorso}>
              <meshStandardMaterial color={ped.shirtColor} roughness={0.5} />
            </mesh>

            {/* Left Arm */}
            <mesh name="leftArm" position={[-0.30, 1.22, 0]} geometry={geoArm}>
              <meshStandardMaterial color={ped.shirtColor} roughness={0.5} />
            </mesh>

            {/* Right Arm (Carries Weapon) */}
            <group name="rightArm" position={[0.30, 1.22, 0]}>
              <mesh geometry={geoArm}>
                <meshStandardMaterial color={ped.shirtColor} roughness={0.5} />
              </mesh>

              {/* Equippable Hand Weapon */}
              {ped.weapon === 'bat' && (
                <mesh position={[0, -0.22, 0.22]} rotation={[Math.PI / 4, 0, 0]} geometry={geoBat} material={batMat} />
              )}
              {ped.weapon === 'pistol' && (
                <group position={[0, -0.22, 0.16]}>
                  <mesh geometry={geoPistolBody} material={gunMat} />
                  <mesh position={[0, -0.06, -0.05]} rotation={[-0.3, 0, 0]} geometry={geoPistolGrip} material={gunMat} />
                </group>
              )}
            </group>

            {/* Left Leg */}
            <mesh name="leftLeg" position={[-0.12, 0.48, 0]} geometry={geoLeg}>
              <meshStandardMaterial color={ped.pantsColor} roughness={0.7} />
            </mesh>

            {/* Right Leg */}
            <mesh name="rightLeg" position={[0.12, 0.48, 0]} geometry={geoLeg}>
              <meshStandardMaterial color={ped.pantsColor} roughness={0.7} />
            </mesh>

            {/* Ground Contact Shadow (Only if alive) */}
            {ped.state !== 'dead' && (
              <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={geoShadow} material={shadowMat} />
            )}
          </group>
        );
      })}

      {/* ========================================================
          LOOTABLE CASH DROPS FROM DEFEATED NPCS
      ======================================================== */}
      {cashDrops.map((drop) => (
        <group key={drop.id} position={[drop.x, drop.y, drop.z]}>
          <mesh rotation={[0, performance.now() * 0.003, 0]} geometry={geoCashStack} material={cashMat} />
          <mesh position={[0, -0.32, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={geoCashHalo} material={cashHaloMat} />
        </group>
      ))}
    </group>
  );
};
