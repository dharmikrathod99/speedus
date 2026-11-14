import * as THREE from 'three';

/**
 * High-Performance Mutable Vehicle & Player Physics State
 * Decouples per-frame 60 FPS motion & camera tracking from React state re-renders.
 * Eliminates frame drops, lag, and main-thread React re-rendering bottlenecks.
 */
export const vehiclePhysics = {
  pos: new THREE.Vector3(60, 0.4, -24),
  velocityY: 0,
  isAirborne: false,
  jumpAirtime: 0,
  heading: 0,
  speedKmh: 0,
  velocity: 0,
  rpm: 800,
  gear: 1 as number | 'R' | 'N',
  nitro: 100,
  fuel: 95,
  steerAngle: 0,
  wheelSpin: 0,
  pitch: 0,
  roll: 0,
  isBraking: false,
  isDrifting: false,
  isBoosting: false
};

export const playerPhysics = {
  pos: new THREE.Vector3(60, 0, -20),
  rotationY: 0,
  velocityY: 0,
  isGrounded: true,
  isMoving: false,
  isSprinting: false
};
