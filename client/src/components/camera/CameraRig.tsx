import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import { vehiclePhysics, playerPhysics } from '../../stores/vehiclePhysics';
import { virtualInput } from '../../stores/virtualInput';

/**
 * CameraRig - Zero-Lag Framerate-Independent Cinema Follow Camera
 * Decoupled from React State for rock-solid 60 FPS performance.
 * Features full multi-touch touchscreen look/turn, GTA-style auto-centering,
 * and high-precision joystick tracking.
 */
export const CameraRig: React.FC = () => {
  const { camera } = useThree();
  const mode = useGameStore((s) => s.mode);
  const cameraMode = useGameStore((s) => s.cameraMode);

  const currentCamPos = useRef<THREE.Vector3>(new THREE.Vector3(60, 6, -14));
  const currentLookAt = useRef<THREE.Vector3>(new THREE.Vector3(60, 1, -24));

  const orbitAngleX = useRef<number>(0);
  const orbitAngleY = useRef<number>(0.3);
  const isMouseDown = useRef<boolean>(false);
  const lastInteractionTime = useRef<number>(performance.now());

  // Mobile multi-touch camera drag tracker
  const activeTouchId = useRef<number | null>(null);
  const touchLastPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    // 1. Desktop Mouse Look Listeners
    const handleMouseDown = (e: MouseEvent) => {
      if (['INPUT', 'TEXTAREA', 'BUTTON'].includes((e.target as HTMLElement).tagName)) return;
      if (e.button === 0 || e.button === 2) {
        isMouseDown.current = true;
        lastInteractionTime.current = performance.now();
      }
    };
    const handleMouseUp = () => {
      isMouseDown.current = false;
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (isMouseDown.current || mode === 'walking') {
        orbitAngleX.current -= e.movementX * 0.0035;
        orbitAngleY.current = Math.max(0.05, Math.min(1.22, orbitAngleY.current + e.movementY * 0.0025));
        lastInteractionTime.current = performance.now();
      }
    };

    // 2. Mobile Touch Screen Drag Look Listeners (Universal Screen Touch)
    const handleTouchStart = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const target = touch.target as HTMLElement | null;

        // Ignore touches on UI buttons, inputs, modals, or virtual analog joystick
        if (
          target &&
          (target.closest('button') ||
            target.closest('input') ||
            target.closest('.joystick-container') ||
            target.closest('.interactive-ui') ||
            target.tagName === 'BUTTON')
        ) {
          continue;
        }

        // Assign first free touch to camera rotation
        if (activeTouchId.current === null) {
          activeTouchId.current = touch.identifier;
          touchLastPos.current = { x: touch.clientX, y: touch.clientY };
          lastInteractionTime.current = performance.now();
          break;
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (activeTouchId.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === activeTouchId.current) {
          const dx = touch.clientX - touchLastPos.current.x;
          const dy = touch.clientY - touchLastPos.current.y;
          touchLastPos.current = { x: touch.clientX, y: touch.clientY };

          // Responsive touch sensitivity
          orbitAngleX.current -= dx * 0.0055;
          orbitAngleY.current = Math.max(0.05, Math.min(1.22, orbitAngleY.current + dy * 0.004));
          lastInteractionTime.current = performance.now();
          break;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (activeTouchId.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === activeTouchId.current) {
          activeTouchId.current = null;
          lastInteractionTime.current = performance.now();
          break;
        }
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);

      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [mode]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const now = performance.now();
    const timeSinceManualLook = (now - lastInteractionTime.current) / 1000;

    // Process external swipe camera rotation if any
    if (virtualInput.camDeltaX !== 0 || virtualInput.camDeltaY !== 0) {
      orbitAngleX.current -= virtualInput.camDeltaX * 0.0055;
      orbitAngleY.current = THREE.MathUtils.clamp(
        orbitAngleY.current + virtualInput.camDeltaY * 0.004,
        0.05,
        1.22
      );
      virtualInput.camDeltaX = 0;
      virtualInput.camDeltaY = 0;
      lastInteractionTime.current = now;
    }

    if (mode === 'driving') {
      const vPos = vehiclePhysics.pos;
      const heading = vehiclePhysics.heading;
      const speedKmh = Math.abs(vehiclePhysics.speedKmh);

      // Smooth Dynamic FOV
      if (camera instanceof THREE.PerspectiveCamera) {
        const targetFov = 65 + (speedKmh / 350) * 15;
        const fovDamp = 1 - Math.exp(-6 * dt);
        camera.fov += (targetFov - camera.fov) * fovDamp;
        camera.updateProjectionMatrix();
      }

      if (cameraMode === 'chase') {
        // High-speed smooth chase camera behind vehicle
        const distBehind = 7.2 + (speedKmh / 300) * 2.0;
        const heightAbove = 2.5 + (speedKmh / 300) * 0.6;

        // Auto-recenter behind car when driving if player hasn't touched camera for 1.8s
        if (timeSinceManualLook > 1.8) {
          let targetAngle = -heading;
          let diff = (targetAngle - orbitAngleX.current) % (Math.PI * 2);
          if (diff < -Math.PI) diff += Math.PI * 2;
          if (diff > Math.PI) diff -= Math.PI * 2;
          orbitAngleX.current += diff * (1 - Math.exp(-3.5 * dt));
        }

        const effectiveAngle = orbitAngleX.current;
        const offsetX = Math.sin(effectiveAngle) * distBehind;
        const offsetZ = Math.cos(effectiveAngle) * distBehind;

        const targetX = vPos.x + offsetX;
        const targetY = vPos.y + heightAbove + (orbitAngleY.current - 0.3) * 3.5;
        const targetZ = vPos.z + offsetZ;

        // Dynamic look-ahead for corner anticipation
        const lookAheadDist = 4.0 + (speedKmh / 150) * 2.5;
        const lookTargetX = vPos.x + Math.sin(heading) * lookAheadDist;
        const lookTargetY = vPos.y + 1.1;
        const lookTargetZ = vPos.z + Math.cos(heading) * lookAheadDist;

        // Framerate-independent exponential damping with instant snap on large jumps
        const dX = targetX - currentCamPos.current.x;
        const dY = targetY - currentCamPos.current.y;
        const dZ = targetZ - currentCamPos.current.z;
        if (dX * dX + dY * dY + dZ * dZ > 400 || Math.abs(dY) > 20) {
          currentCamPos.current.set(targetX, targetY, targetZ);
          currentLookAt.current.set(lookTargetX, lookTargetY, lookTargetZ);
        } else {
          const camDamp = 1 - Math.exp(-11 * dt);
          currentCamPos.current.x += dX * camDamp;
          currentCamPos.current.y += dY * camDamp;
          currentCamPos.current.z += dZ * camDamp;

          const lookDamp = 1 - Math.exp(-14 * dt);
          currentLookAt.current.x += (lookTargetX - currentLookAt.current.x) * lookDamp;
          currentLookAt.current.y += (lookTargetY - currentLookAt.current.y) * lookDamp;
          currentLookAt.current.z += (lookTargetZ - currentLookAt.current.z) * lookDamp;
        }
      } else if (cameraMode === 'cockpit') {
        currentCamPos.current.set(vPos.x + Math.sin(heading) * 0.2, vPos.y + 1.15, vPos.z + Math.cos(heading) * 0.2);
        currentLookAt.current.set(vPos.x + Math.sin(heading) * 15, vPos.y + 1.15, vPos.z + Math.cos(heading) * 15);
      } else if (cameraMode === 'hood') {
        currentCamPos.current.set(vPos.x + Math.sin(heading) * 2.2, vPos.y + 0.7, vPos.z + Math.cos(heading) * 2.2);
        currentLookAt.current.set(vPos.x + Math.sin(heading) * 20, vPos.y + 0.7, vPos.z + Math.cos(heading) * 20);
      } else {
        const dist = 7.0;
        const camX = vPos.x + Math.sin(orbitAngleX.current) * Math.cos(orbitAngleY.current) * dist;
        const camY = vPos.y + Math.sin(orbitAngleY.current) * dist + 1.0;
        const camZ = vPos.z + Math.cos(orbitAngleX.current) * Math.cos(orbitAngleY.current) * dist;

        const camDamp = 1 - Math.exp(-12 * dt);
        currentCamPos.current.x += (camX - currentCamPos.current.x) * camDamp;
        currentCamPos.current.y += (camY - currentCamPos.current.y) * camDamp;
        currentCamPos.current.z += (camZ - currentCamPos.current.z) * camDamp;

        currentLookAt.current.set(vPos.x, vPos.y + 0.8, vPos.z);
      }
    } else {
      // Walking mode: tracks playerPhysics.pos directly with ZERO React state subscription
      const px = playerPhysics.pos.x;
      const py = playerPhysics.pos.y;
      const pz = playerPhysics.pos.z;
      const isInsideHouse = useGameStore.getState().isInsideHouse;
      const isInsideShop = useGameStore.getState().isInsideShop;
      const isInside = isInsideHouse || isInsideShop;

      // Smart GTA-style Camera Auto-Follow on Mobile:
      // When walking forward/steering with joystick and not manually touching camera for 1.0s,
      // gently steer camera behind player's movement heading so mobile play is effortless
      if (playerPhysics.isMoving && timeSinceManualLook > 1.0 && !isInside) {
        let targetAngle = -playerPhysics.rotationY;
        let diff = (targetAngle - orbitAngleX.current) % (Math.PI * 2);
        if (diff < -Math.PI) diff += Math.PI * 2;
        if (diff > Math.PI) diff -= Math.PI * 2;
        orbitAngleX.current += diff * (1 - Math.exp(-2.2 * dt));
      }

      const dist = isInside ? 2.8 : 4.5;
      const camHeight = isInside ? 1.2 : 1.6;
      let camX = px + Math.sin(orbitAngleX.current) * Math.cos(orbitAngleY.current) * dist;
      let camY = py + Math.sin(orbitAngleY.current) * dist + camHeight;
      let camZ = pz + Math.cos(orbitAngleX.current) * Math.cos(orbitAngleY.current) * dist;

      if (isInsideShop) {
        camX = Math.max(-8.2, Math.min(8.2, camX));
        camZ = Math.max(-7.2, Math.min(7.2, camZ));
        camY = Math.max(200.4, Math.min(204.5, camY));
      } else if (isInsideHouse) {
        camX = Math.max(-11.5, Math.min(11.5, camX));
        camZ = Math.max(-8.5, Math.min(11.5, camZ));
        camY = Math.max(120.4, Math.min(124.3, camY));
      }

      const dX = camX - currentCamPos.current.x;
      const dY = camY - currentCamPos.current.y;
      const dZ = camZ - currentCamPos.current.z;

      if (dX * dX + dY * dY + dZ * dZ > 225 || Math.abs(dY) > 15) {
        currentCamPos.current.set(camX, camY, camZ);
        currentLookAt.current.set(px, py + (isInside ? 1.05 : 1.3), pz);
      } else {
        const camDamp = 1 - Math.exp(-14 * dt);
        currentCamPos.current.x += dX * camDamp;
        currentCamPos.current.y += dY * camDamp;
        currentCamPos.current.z += dZ * camDamp;

        currentLookAt.current.set(px, py + (isInside ? 1.05 : 1.3), pz);
      }
    }

    camera.position.copy(currentCamPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
};
