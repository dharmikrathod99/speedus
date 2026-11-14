import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import { soundSystem } from '../../audio/soundSystem';
import { playerPhysics, vehiclePhysics } from '../../stores/vehiclePhysics';
import { resolveWorldCollisions } from '../../physics/worldCollisions';
import { sampleRampElevation } from '../../physics/rampPhysics';
import { getTrafficObstacles } from '../../stores/trafficPhysics';
import { getParkedObstacles } from '../../stores/entityVehicles';
import { resolveInteriorCollisions, INTERIOR_CONFIG } from '../../stores/houseSystem';
import { CITY_SHOPS } from '../../data/shopsData';
import { usePedestrianStore } from '../../stores/pedestrianCombat';
import { virtualInput } from '../../stores/virtualInput';

// Static reusable vectors to eliminate per-frame GC allocations
const vCamForward = new THREE.Vector3();
const vCamRight = new THREE.Vector3();
const vMoveDir = new THREE.Vector3();
const vUpAxis = new THREE.Vector3(0, 1, 0);

export const PlayerCharacter: React.FC = () => {
  const mode = useGameStore((s) => s.mode);
  const isInsideHouse = useGameStore((s) => s.isInsideHouse);
  const isInsideShop = useGameStore((s) => s.isInsideShop);
  const activeShopInteriorId = useGameStore((s) => s.activeShopInteriorId);
  const isWasted = useGameStore((s) => s.isWasted);
  const activeWeapon = useGameStore((s) => s.activeWeapon);
  const setPlayerPos = useGameStore((s) => s.setPlayerPosition);
  const setPlayerRot = useGameStore((s) => s.setPlayerRotation);
  const appearance = useGameStore((s) => s.player.appearance);

  const characterRef = useRef<THREE.Group>(null);
  const posRef = useRef<THREE.Vector3>(playerPhysics.pos.clone());
  const velocityYRef = useRef<number>(0);
  const isGroundedRef = useRef<boolean>(true);
  const animTimeRef = useRef<number>(0);
  const punchAnimTimer = useRef<number>(0);
  const targetRotationY = useRef<number>(playerPhysics.rotationY);
  const lastStateSyncRef = useRef<number>(0);

  // Arm and Leg mesh refs for procedural animation
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    jump: false
  });

  useEffect(() => {
    // Left Click Attack Handler
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Only Left Click
      const target = e.target as HTMLElement;
      if (
        ['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'A'].includes(target.tagName) ||
        target.closest('button') ||
        target.closest('.pointer-events-auto')
      ) {
        return;
      }
      const state = useGameStore.getState();
      if (state.mode === 'walking' && !state.isWasted && state.activeScreen === 'game') {
        punchAnimTimer.current = 0.28;
        usePedestrianStore.getState().playerAttack(state.activeWeapon);
      }
    };

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
      if (k === 's' || e.key === 'ArrowDown') {
        if (mode === 'walking') {
          const state = useGameStore.getState();
          // 1. If already inside the 3D shop, pressing [S] near the front door exits back to the city!
          if (state.isInsideShop) {
            if (playerPhysics.pos.z < -5.5) {
              state.exitShopInterior();
              keys.current.backward = false;
              return;
            }
          } else if (state.isInsideHouse) {
            // 2. If inside the house, pressing [S] near the front door exits back to the city!
            if (playerPhysics.pos.z < -5.0 && Math.abs(playerPhysics.pos.x) < 2.5) {
              state.exitHouse();
              keys.current.backward = false;
              return;
            }
          } else {
            // 3. If on the street outside, check if near any shop entrance (within 18.0m)
            const px = playerPhysics.pos.x;
            const pz = playerPhysics.pos.z;
            let nearestShop = null;
            let minShopDist = 18.0;
            for (const shop of CITY_SHOPS) {
              const doorZ = shop.position[2] + (shop.localPos[2] > 0 ? -7.8 : 7.8);
              const distDoor = Math.hypot(px - shop.position[0], pz - doorZ);
              const distCenter = Math.hypot(px - shop.position[0], pz - shop.position[2]);
              const d = Math.min(distDoor, distCenter);
              if (d < minShopDist) {
                minShopDist = d;
                nearestShop = shop;
              }
            }
            if (nearestShop) {
              state.enterShopInterior(nearestShop.id);
              keys.current.backward = false;
              return;
            }

            // Convenience Mart at Gas Station
            const distMart = Math.min(Math.hypot(px - 22, pz - (-48)), Math.hypot(px - 0, pz - (-45)));
            if (distMart < 18.0) {
              state.enterShopInterior('shop-vegetable');
              keys.current.backward = false;
              return;
            }
          }
        }
        keys.current.backward = true;
      }
      if (k === 'a' || e.key === 'ArrowLeft') keys.current.left = true;
      if (k === 'd' || e.key === 'ArrowRight') keys.current.right = true;
      if (e.key === 'Shift') keys.current.sprint = true;

      // [E] Universal Interaction Key (Enter shop when outside, open catalog / exit when inside)
      if (k === 'e' && mode === 'walking') {
        const state = useGameStore.getState();
        if (state.isInsideShop && state.activeShopInteriorId) {
          // If near doorway inside shop, [E] exits to street
          if (playerPhysics.pos.z < -5.5) {
            state.exitShopInterior();
            return;
          }
          // Otherwise opens purchase modal
          state.openShop(state.activeShopInteriorId);
          return;
        }

        // On-foot exterior: Pressing [E] enters nearby shop storefront
        if (!state.isInsideShop && !state.isInsideHouse) {
          const px = playerPhysics.pos.x;
          const pz = playerPhysics.pos.z;
          let nearestShop = null;
          let minShopDist = 18.0;
          for (const shop of CITY_SHOPS) {
            const doorZ = shop.position[2] + (shop.localPos[2] > 0 ? -7.8 : 7.8);
            const distDoor = Math.hypot(px - shop.position[0], pz - doorZ);
            const distCenter = Math.hypot(px - shop.position[0], pz - shop.position[2]);
            const d = Math.min(distDoor, distCenter);
            if (d < minShopDist) {
              minShopDist = d;
              nearestShop = shop;
            }
          }
          if (nearestShop) {
            state.enterShopInterior(nearestShop.id);
            return;
          }

          // Gas station convenience mart
          const distMart = Math.min(Math.hypot(px - 22, pz - (-48)), Math.hypot(px - 0, pz - (-45)));
          if (distMart < 18.0) {
            state.enterShopInterior('shop-vegetable');
            return;
          }
        }
      }

      // Inside shop: Press [B] anywhere inside to open checkout modal
      if (k === 'b' && mode === 'walking') {
        const state = useGameStore.getState();
        if (state.isInsideShop && state.activeShopInteriorId) {
          state.openShop(state.activeShopInteriorId);
          return;
        }
      }
      if (e.code === 'Space' && isGroundedRef.current && mode === 'walking') {
        velocityYRef.current = 6.8;
        isGroundedRef.current = false;
        soundSystem.playUiClick();
      }

      // Weapon selection: [1] Fists, [2] Bat, [3] Pistol (only when Ctrl/Meta not pressed)
      if (!e.ctrlKey && !e.metaKey && (k === '1' || e.code === 'Digit1')) {
        useGameStore.getState().setActiveWeapon('fists');
      }
      if (!e.ctrlKey && !e.metaKey && (k === '2' || e.code === 'Digit2')) {
        useGameStore.getState().setActiveWeapon('bat');
      }
      if (!e.ctrlKey && !e.metaKey && (k === '3' || e.code === 'Digit3')) {
        useGameStore.getState().setActiveWeapon('pistol');
      }

      // Keyboard attack on [F]
      if (k === 'f' && mode === 'walking') {
        const state = useGameStore.getState();
        if (!state.isWasted && state.activeScreen === 'game') {
          punchAnimTimer.current = 0.28;
          usePedestrianStore.getState().playerAttack(state.activeWeapon);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || e.key === 'ArrowUp') keys.current.forward = false;
      if (k === 's' || e.key === 'ArrowDown') keys.current.backward = false;
      if (k === 'a' || e.key === 'ArrowLeft') keys.current.left = false;
      if (k === 'd' || e.key === 'ArrowRight') keys.current.right = false;
      if (e.key === 'Shift') keys.current.sprint = false;
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mode, isInsideHouse, isInsideShop, activeShopInteriorId]);

  // Synchronize on-foot position immediately when exiting vehicle, shop, house, or state transitions
  useEffect(() => {
    if (mode === 'walking') {
      posRef.current.copy(playerPhysics.pos);
      targetRotationY.current = playerPhysics.rotationY;
      velocityYRef.current = 0;
      isGroundedRef.current = true;
      if (characterRef.current) {
        characterRef.current.position.copy(playerPhysics.pos);
        characterRef.current.rotation.y = playerPhysics.rotationY;
      }
    }
  }, [mode, isInsideHouse, isInsideShop, activeShopInteriorId]);

  useFrame((state, delta) => {
    if (mode !== 'walking') return;
    const dt = Math.min(delta, 0.05);

    // Dynamic Teleport / Jump Detection: External repositioning (exiting car, shop, house, respawn, etc.)
    const distSq = posRef.current.distanceToSquared(playerPhysics.pos);
    if (distSq > 0.04) {
      posRef.current.copy(playerPhysics.pos);
      targetRotationY.current = playerPhysics.rotationY;
      velocityYRef.current = 0;
      isGroundedRef.current = true;
      if (characterRef.current) {
        characterRef.current.position.copy(playerPhysics.pos);
        characterRef.current.rotation.y = playerPhysics.rotationY;
      }
    }

    // Calculate movement vector relative to camera direction (Zero GC allocations)
    const camera = state.camera;
    camera.getWorldDirection(vCamForward);
    vCamForward.y = 0;
    vCamForward.normalize();

    vCamRight.crossVectors(vUpAxis, vCamForward).normalize().negate();

    // Check keyboard + mobile touch virtual inputs
    const kForward = keys.current.forward || virtualInput.forward || virtualInput.analogY > 0.25;
    const kBackward = keys.current.backward || virtualInput.backward || virtualInput.analogY < -0.25;
    const kRight = keys.current.right || virtualInput.right || virtualInput.analogX > 0.25;
    const kLeft = keys.current.left || virtualInput.left || virtualInput.analogX < -0.25;
    const kSprint = keys.current.sprint || virtualInput.sprint || virtualInput.boost;

    vMoveDir.set(0, 0, 0);
    if (Math.abs(virtualInput.analogX) > 0.1 || Math.abs(virtualInput.analogY) > 0.1) {
      vMoveDir.addScaledVector(vCamForward, virtualInput.analogY);
      vMoveDir.addScaledVector(vCamRight, virtualInput.analogX);
    } else {
      if (kForward) vMoveDir.add(vCamForward);
      if (kBackward) vMoveDir.sub(vCamForward);
      if (kRight) vMoveDir.add(vCamRight);
      if (kLeft) vMoveDir.sub(vCamRight);
    }

    // Trigger mobile jump if requested
    if (virtualInput.jump && isGroundedRef.current) {
      velocityYRef.current = 6.8;
      isGroundedRef.current = false;
      virtualInput.jump = false;
      soundSystem.playJump();
    }

    // Trigger mobile attack animation if requested
    if (virtualInput.attack && punchAnimTimer.current <= 0) {
      punchAnimTimer.current = 0.28;
    }

    const isMoving = vMoveDir.lengthSq() > 0.001;
    const speed = kSprint ? 9.5 : 4.8;

    if (isMoving) {
      vMoveDir.normalize();
      posRef.current.x += vMoveDir.x * speed * dt;
      posRef.current.z += vMoveDir.z * speed * dt;

      // Rotate character towards movement
      targetRotationY.current = Math.atan2(vMoveDir.x, vMoveDir.z);

      // Stride animation
      animTimeRef.current += dt * (keys.current.sprint ? 14 : 9);
      const stride = Math.sin(animTimeRef.current);

      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = stride * 0.65;
        rightLegRef.current.rotation.x = -stride * 0.65;
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = -stride * 0.55;
        rightArmRef.current.rotation.x = stride * 0.55;
      }
    } else {
      // Return limbs to idle
      animTimeRef.current = 0;
      const limbDamp = 1 - Math.exp(-10 * dt);
      if (leftLegRef.current) leftLegRef.current.rotation.x += (0 - leftLegRef.current.rotation.x) * limbDamp;
      if (rightLegRef.current) rightLegRef.current.rotation.x += (0 - rightLegRef.current.rotation.x) * limbDamp;
      if (leftArmRef.current) leftArmRef.current.rotation.x += (0 - leftArmRef.current.rotation.x) * limbDamp;
      if (rightArmRef.current) rightArmRef.current.rotation.x += (0 - rightArmRef.current.rotation.x) * limbDamp;
    }

    // Dynamic Punch / Weapon Strike Animation Override on Right Arm
    if (punchAnimTimer.current > 0) {
      punchAnimTimer.current -= dt;
      if (rightArmRef.current) {
        const p = punchAnimTimer.current / 0.28;
        rightArmRef.current.rotation.x = -1.55 + Math.sin(p * Math.PI) * 0.45;
        rightArmRef.current.rotation.y = -0.25;
        rightArmRef.current.rotation.z = -0.15;
      }
      // Snap face direction towards camera reticle when striking
      if (punchAnimTimer.current > 0.18) {
        targetRotationY.current = Math.atan2(vCamForward.x, vCamForward.z);
      }
    }

    // Collision Resolution: Interior collisions when inside shop / house vs Solid World collisions outside
    if (isInsideShop) {
      posRef.current.x = THREE.MathUtils.clamp(posRef.current.x, -8.2, 8.2);
      posRef.current.z = THREE.MathUtils.clamp(posRef.current.z, -7.2, 7.2);
    } else if (isInsideHouse) {
      const intCol = resolveInteriorCollisions(posRef.current.x, posRef.current.z, 0.45);
      posRef.current.x = intCol.x;
      posRef.current.z = intCol.z;
    } else {
      // Solid World Collision: blocks character from walking through buildings, trees, parked car, moving traffic, and showcase vehicles
      const dynamicObstacles = [
        { x: vehiclePhysics.pos.x, z: vehiclePhysics.pos.z, rotY: vehiclePhysics.heading, halfW: 1.15, halfD: 2.3 },
        ...getTrafficObstacles(),
        ...getParkedObstacles()
      ];
      const col = resolveWorldCollisions(posRef.current.x, posRef.current.z, 0.45, dynamicObstacles);
      if (col.collided) {
        posRef.current.x = col.x;
        posRef.current.z = col.z;
      }
    }

    // Dynamic Ground Height
    let groundFloor = 0;
    if (isInsideShop) {
      groundFloor = 200.0; // 200.0m shop interior floor level
    } else if (isInsideHouse) {
      groundFloor = INTERIOR_CONFIG.floorHeight; // 120.0m
    } else {
      const ramp = sampleRampElevation(posRef.current.x, posRef.current.z);
      groundFloor = ramp.onRamp ? ramp.height : 0;
    }

    // Gravity and Vertical Jump
    if (!isGroundedRef.current) {
      velocityYRef.current -= 18.0 * dt;
      posRef.current.y += velocityYRef.current * dt;
      if (posRef.current.y <= groundFloor) {
        posRef.current.y = groundFloor;
        velocityYRef.current = 0;
        isGroundedRef.current = true;
      }
    } else {
      posRef.current.y = THREE.MathUtils.lerp(posRef.current.y, groundFloor, dt * 15);
    }

    // Direct physics state update (zero React lag)
    playerPhysics.pos.copy(posRef.current);
    playerPhysics.rotationY = targetRotationY.current;
    playerPhysics.isMoving = isMoving;
    playerPhysics.isSprinting = keys.current.sprint;

    // Apply transform directly to Three.js Object3D
    if (characterRef.current) {
      characterRef.current.position.copy(posRef.current);
      let diff = (targetRotationY.current - characterRef.current.rotation.y) % (Math.PI * 2);
      if (diff < -Math.PI) diff += Math.PI * 2;
      if (diff > Math.PI) diff -= Math.PI * 2;
      characterRef.current.rotation.y += diff * (1 - Math.exp(-14 * dt));
    }

    // Throttled Zustand state synchronization for UI / saves (every 120ms)
    const now = performance.now();
    if (now - lastStateSyncRef.current > 120) {
      lastStateSyncRef.current = now;
      setPlayerPos([posRef.current.x, posRef.current.y, posRef.current.z]);
      setPlayerRot([0, targetRotationY.current, 0]);
    }
  });

  if (mode !== 'walking') {
    return null; // Character is seated inside vehicle
  }

  return (
    <group ref={characterRef} position={[posRef.current.x, posRef.current.y, posRef.current.z]}>
      {/* ====================================================
          HEAD & EARS
      ==================================================== */}
      <mesh position={[0, 1.70, 0]} castShadow>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color={appearance.skinColor} roughness={0.5} />
      </mesh>
      {/* Left Ear */}
      <mesh position={[-0.18, 1.70, 0]}>
        <boxGeometry args={[0.03, 0.06, 0.04]} />
        <meshStandardMaterial color={appearance.skinColor} roughness={0.5} />
      </mesh>
      {/* Right Ear */}
      <mesh position={[0.18, 1.70, 0]}>
        <boxGeometry args={[0.03, 0.06, 0.04]} />
        <meshStandardMaterial color={appearance.skinColor} roughness={0.5} />
      </mesh>

      {/* ====================================================
          FACIAL FEATURES: EYES, PUPILS & EYEBROWS
      ==================================================== */}
      {/* Left Eye White (Sclera) */}
      <mesh position={[-0.055, 1.72, 0.165]}>
        <boxGeometry args={[0.038, 0.024, 0.015]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Left Iris */}
      <mesh position={[-0.055, 1.72, 0.174]}>
        <boxGeometry args={[0.022, 0.020, 0.008]} />
        <meshBasicMaterial color={appearance.eyeColor || '#0284c7'} />
      </mesh>
      {/* Left Pupil */}
      <mesh position={[-0.055, 1.72, 0.179]}>
        <boxGeometry args={[0.012, 0.014, 0.005]} />
        <meshBasicMaterial color="#09090b" />
      </mesh>
      {/* Left Eyebrow */}
      <mesh position={[-0.055, 1.752, 0.17]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[0.045, 0.012, 0.01]} />
        <meshBasicMaterial color={appearance.hairColor} />
      </mesh>

      {/* Right Eye White (Sclera) */}
      <mesh position={[0.055, 1.72, 0.165]}>
        <boxGeometry args={[0.038, 0.024, 0.015]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Right Iris */}
      <mesh position={[0.055, 1.72, 0.174]}>
        <boxGeometry args={[0.022, 0.020, 0.008]} />
        <meshBasicMaterial color={appearance.eyeColor || '#0284c7'} />
      </mesh>
      {/* Right Pupil */}
      <mesh position={[0.055, 1.72, 0.179]}>
        <boxGeometry args={[0.012, 0.014, 0.005]} />
        <meshBasicMaterial color="#09090b" />
      </mesh>
      {/* Right Eyebrow */}
      <mesh position={[0.055, 1.752, 0.17]} rotation={[0, 0, -0.08]}>
        <boxGeometry args={[0.045, 0.012, 0.01]} />
        <meshBasicMaterial color={appearance.hairColor} />
      </mesh>

      {/* ====================================================
          NOSE & EXPRESSIVE SMILING MOUTH
      ==================================================== */}
      {/* Nose Bridge */}
      <mesh position={[0, 1.685, 0.182]}>
        <boxGeometry args={[0.026, 0.032, 0.022]} />
        <meshStandardMaterial color={appearance.skinColor} roughness={0.5} />
      </mesh>

      {/* Mouth Lips (Ruby Red) */}
      <mesh position={[0, 1.636, 0.170]}>
        <boxGeometry args={[0.048, 0.016, 0.012]} />
        <meshBasicMaterial color="#881337" />
      </mesh>
      {/* Mouth Teeth / Smile Accent */}
      <mesh position={[0, 1.638, 0.175]}>
        <boxGeometry args={[0.034, 0.008, 0.006]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* ====================================================
          HAIR & HEADWEAR CUSTOMIZATION
      ==================================================== */}
      {appearance.hairStyle === 'beanie' ? (
        <group position={[0, 1.83, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.19, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
            <meshStandardMaterial color={appearance.hairColor} roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.185, 0.03, 8, 20]} />
            <meshStandardMaterial color={appearance.hairColor} roughness={0.9} />
          </mesh>
        </group>
      ) : appearance.hairStyle === 'fade' || appearance.hairStyle === 'short' ? (
        <group>
          {/* Trimmed Side & Back Hair */}
          <mesh position={[0, 1.78, -0.02]} castShadow>
            <boxGeometry args={[0.34, 0.13, 0.34]} />
            <meshStandardMaterial color={appearance.hairColor} roughness={0.8} />
          </mesh>
          {/* Top Fade Quiff */}
          <mesh position={[0, 1.85, 0.02]} castShadow>
            <boxGeometry args={[0.26, 0.08, 0.28]} />
            <meshStandardMaterial color={appearance.hairColor} roughness={0.7} />
          </mesh>
        </group>
      ) : appearance.hairStyle === 'long' ? (
        <group>
          {/* Top Hair */}
          <mesh position={[0, 1.82, -0.02]} castShadow>
            <boxGeometry args={[0.36, 0.12, 0.36]} />
            <meshStandardMaterial color={appearance.hairColor} roughness={0.8} />
          </mesh>
          {/* Left Hair Strand */}
          <mesh position={[-0.19, 1.62, 0.02]} castShadow>
            <boxGeometry args={[0.06, 0.32, 0.18]} />
            <meshStandardMaterial color={appearance.hairColor} roughness={0.8} />
          </mesh>
          {/* Right Hair Strand */}
          <mesh position={[0.19, 1.62, 0.02]} castShadow>
            <boxGeometry args={[0.06, 0.32, 0.18]} />
            <meshStandardMaterial color={appearance.hairColor} roughness={0.8} />
          </mesh>
        </group>
      ) : (
        /* Default: Street Baseball Cap */
        <group position={[0, 1.81, -0.01]}>
          {/* Cap Crown */}
          <mesh castShadow>
            <boxGeometry args={[0.34, 0.13, 0.36]} />
            <meshStandardMaterial color={appearance.hairColor} roughness={0.7} />
          </mesh>
          {/* Cap Visor / Bill */}
          <mesh position={[0, -0.05, 0.21]} rotation={[-0.15, 0, 0]} castShadow>
            <boxGeometry args={[0.26, 0.02, 0.14]} />
            <meshStandardMaterial color={appearance.hairColor} roughness={0.7} />
          </mesh>
          {/* Cap Top Button */}
          <mesh position={[0, 0.07, 0]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      )}

      {/* ====================================================
          EYEWEAR CUSTOMIZATION (SUNGLASSES / VISOR)
      ==================================================== */}
      {appearance.eyewear === 'sunglasses' ? (
        <group position={[0, 1.72, 0.182]}>
          {/* Dark Frame */}
          <mesh>
            <boxGeometry args={[0.22, 0.042, 0.015]} />
            <meshStandardMaterial color="#09090b" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Left Tinted Lens */}
          <mesh position={[-0.055, 0, 0.008]}>
            <boxGeometry args={[0.062, 0.034, 0.005]} />
            <meshStandardMaterial color="#18181b" roughness={0.1} />
          </mesh>
          {/* Right Tinted Lens */}
          <mesh position={[0.055, 0, 0.008]}>
            <boxGeometry args={[0.062, 0.034, 0.005]} />
            <meshStandardMaterial color="#18181b" roughness={0.1} />
          </mesh>
        </group>
      ) : appearance.eyewear === 'aviators' ? (
        <group position={[0, 1.72, 0.184]}>
          {/* Gold Wire Frame */}
          <mesh>
            <boxGeometry args={[0.23, 0.044, 0.01]} />
            <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Teardrop Lenses */}
          <mesh position={[-0.055, -0.004, 0.006]}>
            <boxGeometry args={[0.065, 0.040, 0.005]} />
            <meshStandardMaterial color="#1c1917" roughness={0.1} />
          </mesh>
          <mesh position={[0.055, -0.004, 0.006]}>
            <boxGeometry args={[0.065, 0.040, 0.005]} />
            <meshStandardMaterial color="#1c1917" roughness={0.1} />
          </mesh>
        </group>
      ) : appearance.eyewear === 'visor' ? (
        <mesh position={[0, 1.72, 0.185]}>
          <boxGeometry args={[0.23, 0.038, 0.02]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00f0ff"
            emissiveIntensity={0.8}
            roughness={0.1}
          />
        </mesh>
      ) : null}

      {/* ====================================================
          TORSO / TOP CLOTHING CUSTOMIZATION
      ==================================================== */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <boxGeometry args={[0.48, 0.62, 0.28]} />
        <meshStandardMaterial color={appearance.jacketColor} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Special Top Accents */}
      {appearance.shirtType === 'suit' ? (
        <group>
          {/* White Dress Shirt V-Neck */}
          <mesh position={[0, 1.45, 0.142]}>
            <boxGeometry args={[0.16, 0.18, 0.01]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
          </mesh>
          {/* Silk Tie */}
          <mesh position={[0, 1.34, 0.145]}>
            <boxGeometry args={[0.05, 0.22, 0.01]} />
            <meshStandardMaterial color="#b91c1c" roughness={0.3} />
          </mesh>
        </group>
      ) : appearance.shirtType === 'hoodie' ? (
        <group>
          {/* Front Kangaroo Pocket */}
          <mesh position={[0, 1.15, 0.145]} castShadow>
            <boxGeometry args={[0.32, 0.18, 0.04]} />
            <meshStandardMaterial color={appearance.jacketColor} roughness={0.5} />
          </mesh>
          {/* Rested Hood on Back */}
          <mesh position={[0, 1.52, -0.15]} castShadow>
            <boxGeometry args={[0.34, 0.14, 0.12]} />
            <meshStandardMaterial color={appearance.jacketColor} roughness={0.6} />
          </mesh>
        </group>
      ) : appearance.shirtType === 'tanktop' ? (
        <group>
          {/* Exposed Skin Shoulders */}
          <mesh position={[-0.20, 1.48, 0]}>
            <boxGeometry args={[0.10, 0.12, 0.26]} />
            <meshStandardMaterial color={appearance.skinColor} roughness={0.5} />
          </mesh>
          <mesh position={[0.20, 1.48, 0]}>
            <boxGeometry args={[0.10, 0.12, 0.26]} />
            <meshStandardMaterial color={appearance.skinColor} roughness={0.5} />
          </mesh>
        </group>
      ) : null}

      {/* ====================================================
          ARMS (WITH SHORT-SLEEVE SKIN LOGIC)
      ==================================================== */}
      {appearance.shirtType === 'tanktop' || appearance.shirtType === 'tshirt' ? (
        <>
          {/* Left Arm: Shirt Sleeve + Exposed Forearm */}
          <group ref={leftArmRef} position={[-0.34, 1.25, 0]}>
            <mesh position={[0, 0.14, 0]}>
              <boxGeometry args={[0.14, 0.28, 0.16]} />
              <meshStandardMaterial color={appearance.jacketColor} roughness={0.5} />
            </mesh>
            <mesh position={[0, -0.14, 0]}>
              <boxGeometry args={[0.12, 0.28, 0.14]} />
              <meshStandardMaterial color={appearance.skinColor} roughness={0.5} />
            </mesh>
          </group>

          {/* Right Arm: Shirt Sleeve + Exposed Forearm */}
          <group ref={rightArmRef} position={[0.34, 1.25, 0]}>
            <mesh position={[0, 0.14, 0]}>
              <boxGeometry args={[0.14, 0.28, 0.16]} />
              <meshStandardMaterial color={appearance.jacketColor} roughness={0.5} />
            </mesh>
            <mesh position={[0, -0.14, 0]}>
              <boxGeometry args={[0.12, 0.28, 0.14]} />
              <meshStandardMaterial color={appearance.skinColor} roughness={0.5} />
            </mesh>
            {/* Clenched Fist Knuckles */}
            <mesh position={[0, -0.32, 0.02]}>
              <boxGeometry args={[0.11, 0.09, 0.12]} />
              <meshStandardMaterial color={appearance.skinColor} roughness={0.5} />
            </mesh>

            {/* Equipped 3D Baseball Bat */}
            {activeWeapon === 'bat' && (
              <group position={[0, -0.32, 0.22]} rotation={[0.4, 0, 0]}>
                <mesh position={[0, -0.06, 0]}>
                  <cylinderGeometry args={[0.022, 0.025, 0.18, 8]} />
                  <meshStandardMaterial color="#1e293b" roughness={0.7} />
                </mesh>
                <mesh position={[0, 0.26, 0]}>
                  <cylinderGeometry args={[0.045, 0.025, 0.52, 8]} />
                  <meshStandardMaterial color="#d97706" roughness={0.5} />
                </mesh>
              </group>
            )}

            {/* Equipped 3D Tactical Pistol */}
            {activeWeapon === 'pistol' && (
              <group position={[0, -0.32, 0.14]} rotation={[-Math.PI / 2, 0, 0]}>
                <mesh position={[0, 0.03, 0.06]}>
                  <boxGeometry args={[0.045, 0.055, 0.18]} />
                  <meshStandardMaterial color="#18181b" metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh position={[0, -0.04, 0]}>
                  <boxGeometry args={[0.04, 0.10, 0.05]} />
                  <meshStandardMaterial color="#27272a" roughness={0.6} />
                </mesh>
              </group>
            )}
          </group>
        </>
      ) : (
        <>
          {/* Left Arm: Full Sleeve */}
          <group ref={leftArmRef} position={[-0.34, 1.25, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.14, 0.58, 0.16]} />
              <meshStandardMaterial color={appearance.jacketColor} roughness={0.5} />
            </mesh>
          </group>
          {/* Right Arm: Full Sleeve */}
          <group ref={rightArmRef} position={[0.34, 1.25, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.14, 0.58, 0.16]} />
              <meshStandardMaterial color={appearance.jacketColor} roughness={0.5} />
            </mesh>
            {/* Clenched Fist Knuckles */}
            <mesh position={[0, -0.32, 0.02]}>
              <boxGeometry args={[0.11, 0.09, 0.12]} />
              <meshStandardMaterial color={appearance.skinColor} roughness={0.5} />
            </mesh>

            {/* Equipped 3D Baseball Bat */}
            {activeWeapon === 'bat' && (
              <group position={[0, -0.32, 0.22]} rotation={[0.4, 0, 0]}>
                <mesh position={[0, -0.06, 0]}>
                  <cylinderGeometry args={[0.022, 0.025, 0.18, 8]} />
                  <meshStandardMaterial color="#1e293b" roughness={0.7} />
                </mesh>
                <mesh position={[0, 0.26, 0]}>
                  <cylinderGeometry args={[0.045, 0.025, 0.52, 8]} />
                  <meshStandardMaterial color="#d97706" roughness={0.5} />
                </mesh>
              </group>
            )}

            {/* Equipped 3D Tactical Pistol */}
            {activeWeapon === 'pistol' && (
              <group position={[0, -0.32, 0.14]} rotation={[-Math.PI / 2, 0, 0]}>
                <mesh position={[0, 0.03, 0.06]}>
                  <boxGeometry args={[0.045, 0.055, 0.18]} />
                  <meshStandardMaterial color="#18181b" metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh position={[0, -0.04, 0]}>
                  <boxGeometry args={[0.04, 0.10, 0.05]} />
                  <meshStandardMaterial color="#27272a" roughness={0.6} />
                </mesh>
              </group>
            )}
          </group>
        </>
      )}

      {/* ====================================================
          BOTTOMS & SHOES / SNEAKERS
      ==================================================== */}
      {appearance.pantsType === 'shorts' ? (
        <>
          {/* Left Leg: Denim Shorts + Bare Knee */}
          <group ref={leftLegRef} position={[-0.14, 0.48, 0]}>
            <mesh position={[0, 0.18, 0]}>
              <boxGeometry args={[0.18, 0.40, 0.2]} />
              <meshStandardMaterial color={appearance.pantsColor} roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.20, 0]}>
              <boxGeometry args={[0.16, 0.38, 0.18]} />
              <meshStandardMaterial color={appearance.skinColor} roughness={0.5} />
            </mesh>
          </group>

          {/* Right Leg: Denim Shorts + Bare Knee */}
          <group ref={rightLegRef} position={[0.14, 0.48, 0]}>
            <mesh position={[0, 0.18, 0]}>
              <boxGeometry args={[0.18, 0.40, 0.2]} />
              <meshStandardMaterial color={appearance.pantsColor} roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.20, 0]}>
              <boxGeometry args={[0.16, 0.38, 0.18]} />
              <meshStandardMaterial color={appearance.skinColor} roughness={0.5} />
            </mesh>
          </group>
        </>
      ) : (
        <>
          {/* Left Leg: Full Pants */}
          <group ref={leftLegRef} position={[-0.14, 0.48, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.18, 0.78, 0.2]} />
              <meshStandardMaterial color={appearance.pantsColor} roughness={0.7} />
            </mesh>
          </group>
          {/* Right Leg: Full Pants */}
          <group ref={rightLegRef} position={[0.14, 0.48, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.18, 0.78, 0.2]} />
              <meshStandardMaterial color={appearance.pantsColor} roughness={0.7} />
            </mesh>
          </group>
        </>
      )}

      {/* ====================================================
          SHOES / SNEAKERS (WITH RUBBER SOLES)
      ==================================================== */}
      {/* Left Sneaker */}
      <mesh position={[-0.14, 0.06, 0.03]} castShadow>
        <boxGeometry args={[0.19, 0.12, 0.26]} />
        <meshStandardMaterial color={appearance.shoesColor || '#ffffff'} roughness={0.4} />
      </mesh>
      <mesh position={[-0.14, 0.015, 0.03]}>
        <boxGeometry args={[0.20, 0.03, 0.27]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Right Sneaker */}
      <mesh position={[0.14, 0.06, 0.03]} castShadow>
        <boxGeometry args={[0.19, 0.12, 0.26]} />
        <meshStandardMaterial color={appearance.shoesColor || '#ffffff'} roughness={0.4} />
      </mesh>
      <mesh position={[0.14, 0.015, 0.03]}>
        <boxGeometry args={[0.20, 0.03, 0.27]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Ground subtle contact shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.1, 0.45, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>
    </group>
  );
};
