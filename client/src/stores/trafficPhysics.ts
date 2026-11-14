/**
 * SPEED US: Real-Time Traffic Physics & AI Spatial Registry
 * Coordinates dynamic NPC traffic positions, AI braking, obstacle avoidance,
 * and solid dynamic collision boundaries with the player vehicle and pedestrian.
 */

export interface TrafficCarState {
  id: number;
  name: string;
  vehicleDefId: string;
  x: number;
  y: number;
  z: number;
  rotY: number;
  speed: number;
  targetSpeed: number;
  maxSpeed: number;
  color: string;
  category: 'sedan' | 'suv' | 'sports';
  circuitIndex: number;
  waypointIndex: number;
  wheelSpin: number;
  isBraking: boolean;
  honkCooldown: number;
  stoppedTimer: number;
  recoilX: number;
  recoilZ: number;
  halfW: number;
  halfD: number;
}

export const TRAFFIC_CIRCUITS: [number, number][][] = [
  // Circuit 0: Inner Downtown North Loop (Clockwise - Right Lane Follower)
  // Eastbound along Z=0 (+4), Southbound along X=70 (+4), Westbound along Z=70 (-4), Northbound along X=-70 (-4)
  [
    [-74, 4],
    [74, 4],
    [74, 66],
    [-74, 66]
  ],
  // Circuit 1: Inner Downtown South Loop (Counter-Clockwise - Right Lane Follower)
  // Westbound along Z=0 (-4), Southbound along X=-70 (+4), Eastbound along Z=-70 (+4), Northbound along X=70 (-4)
  [
    [66, -4],
    [-66, -4],
    [-66, -66],
    [66, -66]
  ],
  // Circuit 2: East Downtown Commercial Loop (Clockwise - Right Lane Follower)
  // Eastbound along Z=0 (+4), Southbound along X=70 (+4), Westbound along Z=70 (-4), Northbound along X=0 (-4)
  [
    [-4, 4],
    [74, 4],
    [74, 66],
    [-4, 66]
  ],
  // Circuit 3: West Midtown & Residential Loop (Counter-Clockwise - Right Lane Follower)
  [
    [-74, 4],
    [4, 4],
    [4, -66],
    [-74, -66]
  ],
  // Circuit 4: Outer City Perimeter Expressway (Large Outer Boulevard)
  [
    [-74, -66],
    [74, -66],
    [74, 66],
    [-74, 66]
  ],
  // Circuit 5: Midtown Crossway Loop (Connecting Center Core)
  [
    [-66, 4],
    [4, 4],
    [4, 66],
    [74, 66],
    [74, -4],
    [-66, -4]
  ]
];

export const initialTrafficCars: TrafficCarState[] = [
  // 1. Sapphire Sovereign Sedan (Circuit 0)
  {
    id: 1,
    name: 'Sapphire Sovereign Sedan',
    vehicleDefId: 'v8-sovereign',
    x: -45,
    y: 0.45,
    z: 4,
    rotY: Math.PI / 2,
    speed: 11,
    targetSpeed: 11,
    maxSpeed: 11.5,
    color: '#3b82f6',
    category: 'sedan',
    circuitIndex: 0,
    waypointIndex: 1,
    wheelSpin: 0,
    isBraking: false,
    honkCooldown: 0,
    stoppedTimer: 0,
    recoilX: 0,
    recoilZ: 0,
    halfW: 1.05,
    halfD: 2.2
  },
  // 2. Crimson Cyclone R-Spec (Circuit 0)
  {
    id: 2,
    name: 'Crimson Cyclone R-Spec',
    vehicleDefId: 'cyclone-turbo',
    x: 35,
    y: 0.45,
    z: 4,
    rotY: Math.PI / 2,
    speed: 13,
    targetSpeed: 13,
    maxSpeed: 13.5,
    color: '#ef4444',
    category: 'sports',
    circuitIndex: 0,
    waypointIndex: 1,
    wheelSpin: 0,
    isBraking: false,
    honkCooldown: 0,
    stoppedTimer: 0,
    recoilX: 0,
    recoilZ: 0,
    halfW: 1.05,
    halfD: 2.2
  },
  // 3. Emerald Titan Overlander (Circuit 0)
  {
    id: 3,
    name: 'Emerald Titan Overlander',
    vehicleDefId: 'titan-suv',
    x: 74,
    y: 0.45,
    z: 35,
    rotY: Math.PI,
    speed: 10,
    targetSpeed: 10,
    maxSpeed: 10.5,
    color: '#10b981',
    category: 'suv',
    circuitIndex: 0,
    waypointIndex: 2,
    wheelSpin: 0,
    isBraking: false,
    honkCooldown: 0,
    stoppedTimer: 0,
    recoilX: 0,
    recoilZ: 0,
    halfW: 1.1,
    halfD: 2.3
  },
  // 4. Sunset City Cab (Circuit 0)
  {
    id: 4,
    name: 'Sunset City Cab',
    vehicleDefId: 'starter-taxi',
    x: 10,
    y: 0.45,
    z: 66,
    rotY: -Math.PI / 2,
    speed: 12,
    targetSpeed: 12,
    maxSpeed: 12.0,
    color: '#f59e0b',
    category: 'sedan',
    circuitIndex: 0,
    waypointIndex: 3,
    wheelSpin: 0,
    isBraking: false,
    honkCooldown: 0,
    stoppedTimer: 0,
    recoilX: 0,
    recoilZ: 0,
    halfW: 1.05,
    halfD: 2.2
  },
  // 5. Violet Phantom V12 (Circuit 1)
  {
    id: 5,
    name: 'Violet Phantom V12',
    vehicleDefId: 'phantom-v12',
    x: 40,
    y: 0.45,
    z: -4,
    rotY: -Math.PI / 2,
    speed: 12,
    targetSpeed: 12,
    maxSpeed: 12.5,
    color: '#8b5cf6',
    category: 'sports',
    circuitIndex: 1,
    waypointIndex: 1,
    wheelSpin: 0,
    isBraking: false,
    honkCooldown: 0,
    stoppedTimer: 0,
    recoilX: 0,
    recoilZ: 0,
    halfW: 1.05,
    halfD: 2.2
  },
  // 6. Pearl White Titan 4x4 (Circuit 1)
  {
    id: 6,
    name: 'Pearl White Titan 4x4',
    vehicleDefId: 'titan-suv',
    x: -66,
    y: 0.45,
    z: -30,
    rotY: Math.PI,
    speed: 10.5,
    targetSpeed: 10.5,
    maxSpeed: 11.0,
    color: '#f8fafc',
    category: 'suv',
    circuitIndex: 1,
    waypointIndex: 2,
    wheelSpin: 0,
    isBraking: false,
    honkCooldown: 0,
    stoppedTimer: 0,
    recoilX: 0,
    recoilZ: 0,
    halfW: 1.1,
    halfD: 2.3
  },
  // 7. Cyan Sovereign Cruiser (Circuit 1)
  {
    id: 7,
    name: 'Cyan Sovereign Cruiser',
    vehicleDefId: 'v8-sovereign',
    x: 15,
    y: 0.45,
    z: -66,
    rotY: Math.PI / 2,
    speed: 11.5,
    targetSpeed: 11.5,
    maxSpeed: 12.0,
    color: '#06b6d4',
    category: 'sedan',
    circuitIndex: 1,
    waypointIndex: 3,
    wheelSpin: 0,
    isBraking: false,
    honkCooldown: 0,
    stoppedTimer: 0,
    recoilX: 0,
    recoilZ: 0,
    halfW: 1.05,
    halfD: 2.2
  },
  // 8. Crown Metro Taxi (Circuit 2)
  {
    id: 8,
    name: 'Crown Metro Taxi',
    vehicleDefId: 'starter-taxi',
    x: 30,
    y: 0.45,
    z: 4,
    rotY: Math.PI / 2,
    speed: 11,
    targetSpeed: 11,
    maxSpeed: 11.5,
    color: '#d97706',
    category: 'sedan',
    circuitIndex: 2,
    waypointIndex: 1,
    wheelSpin: 0,
    isBraking: false,
    honkCooldown: 0,
    stoppedTimer: 0,
    recoilX: 0,
    recoilZ: 0,
    halfW: 1.05,
    halfD: 2.2
  },
  // 9. Apex Horizon Supercar (Circuit 2)
  {
    id: 9,
    name: 'Apex Horizon Supercar',
    vehicleDefId: 'apex-horizon',
    x: 74,
    y: 0.45,
    z: 40,
    rotY: Math.PI,
    speed: 13.5,
    targetSpeed: 13.5,
    maxSpeed: 14.0,
    color: '#00f0ff',
    category: 'sports',
    circuitIndex: 2,
    waypointIndex: 2,
    wheelSpin: 0,
    isBraking: false,
    honkCooldown: 0,
    stoppedTimer: 0,
    recoilX: 0,
    recoilZ: 0,
    halfW: 1.1,
    halfD: 2.3
  },
  // 10. Sovereign 500 GT Muscle (Circuit 3)
  {
    id: 10,
    name: 'Sovereign 500 GT Muscle',
    vehicleDefId: 'v8-sovereign',
    x: -35,
    y: 0.45,
    z: 4,
    rotY: Math.PI / 2,
    speed: 12.0,
    targetSpeed: 12.0,
    maxSpeed: 12.5,
    color: '#dc2626',
    category: 'sports',
    circuitIndex: 3,
    waypointIndex: 1,
    wheelSpin: 0,
    isBraking: false,
    honkCooldown: 0,
    stoppedTimer: 0,
    recoilX: 0,
    recoilZ: 0,
    halfW: 1.08,
    halfD: 2.3
  },
  // 11. Cobalt Enforcer SUV (Circuit 3)
  {
    id: 11,
    name: 'Cobalt Enforcer SUV',
    vehicleDefId: 'titan-suv',
    x: 4,
    y: 0.45,
    z: -30,
    rotY: Math.PI,
    speed: 10.5,
    targetSpeed: 10.5,
    maxSpeed: 11.0,
    color: '#2563eb',
    category: 'suv',
    circuitIndex: 3,
    waypointIndex: 2,
    wheelSpin: 0,
    isBraking: false,
    honkCooldown: 0,
    stoppedTimer: 0,
    recoilX: 0,
    recoilZ: 0,
    halfW: 1.1,
    halfD: 2.3
  },
  // 12. Solar Flare Cyclone (Circuit 3)
  {
    id: 12,
    name: 'Solar Flare Cyclone',
    vehicleDefId: 'cyclone-turbo',
    x: -40,
    y: 0.45,
    z: -66,
    rotY: -Math.PI / 2,
    speed: 12.5,
    targetSpeed: 12.5,
    maxSpeed: 13.0,
    color: '#f97316',
    category: 'sports',
    circuitIndex: 3,
    waypointIndex: 3,
    wheelSpin: 0,
    isBraking: false,
    honkCooldown: 0,
    stoppedTimer: 0,
    recoilX: 0,
    recoilZ: 0,
    halfW: 1.05,
    halfD: 2.2
  },
  // 13. Midnight Phantom Noir (Circuit 4)
  {
    id: 13,
    name: 'Midnight Phantom Noir',
    vehicleDefId: 'phantom-v12',
    x: -20,
    y: 0.45,
    z: -66,
    rotY: Math.PI / 2,
    speed: 12.0,
    targetSpeed: 12.0,
    maxSpeed: 13.0,
    color: '#1e1b4b',
    category: 'sports',
    circuitIndex: 4,
    waypointIndex: 1,
    wheelSpin: 0,
    isBraking: false,
    honkCooldown: 0,
    stoppedTimer: 0,
    recoilX: 0,
    recoilZ: 0,
    halfW: 1.05,
    halfD: 2.2
  },
  // 14. Desert Titan Overlander (Circuit 4)
  {
    id: 14,
    name: 'Desert Titan Overlander',
    vehicleDefId: 'titan-suv',
    x: 74,
    y: 0.45,
    z: 15,
    rotY: Math.PI,
    speed: 11.0,
    targetSpeed: 11.0,
    maxSpeed: 11.5,
    color: '#d97706',
    category: 'suv',
    circuitIndex: 4,
    waypointIndex: 2,
    wheelSpin: 0,
    isBraking: false,
    honkCooldown: 0,
    stoppedTimer: 0,
    recoilX: 0,
    recoilZ: 0,
    halfW: 1.1,
    halfD: 2.3
  },
  // 15. Electric Lime Horizon (Circuit 5)
  {
    id: 15,
    name: 'Electric Lime Horizon',
    vehicleDefId: 'apex-horizon',
    x: -30,
    y: 0.45,
    z: 4,
    rotY: Math.PI / 2,
    speed: 13.0,
    targetSpeed: 13.0,
    maxSpeed: 13.5,
    color: '#84cc16',
    category: 'sports',
    circuitIndex: 5,
    waypointIndex: 1,
    wheelSpin: 0,
    isBraking: false,
    honkCooldown: 0,
    stoppedTimer: 0,
    recoilX: 0,
    recoilZ: 0,
    halfW: 1.1,
    halfD: 2.3
  },
  // 16. Royal Sovereign Executive (Circuit 5)
  {
    id: 16,
    name: 'Royal Sovereign Executive',
    vehicleDefId: 'v8-sovereign',
    x: 60,
    y: 0.45,
    z: -4,
    rotY: -Math.PI / 2,
    speed: 11.5,
    targetSpeed: 11.5,
    maxSpeed: 12.0,
    color: '#6366f1',
    category: 'sedan',
    circuitIndex: 5,
    waypointIndex: 5,
    wheelSpin: 0,
    isBraking: false,
    honkCooldown: 0,
    stoppedTimer: 0,
    recoilX: 0,
    recoilZ: 0,
    halfW: 1.05,
    halfD: 2.2
  }
];

// Mutable global traffic state for 60 FPS zero-allocation physics access
export const trafficCars: TrafficCarState[] = initialTrafficCars.map((c) => ({ ...c }));

/**
 * Returns dynamic obstacles formatted for resolveWorldCollisions
 */
export function getTrafficObstacles(excludeId?: number) {
  return trafficCars
    .filter((car) => car.id !== excludeId)
    .map((car) => ({
      x: car.x,
      z: car.z,
      rotY: car.rotY,
      halfW: car.halfW,
      halfD: car.halfD,
      id: car.id
    }));
}

/**
 * Applies impact recoil impulse to a traffic car when struck by the player
 */
export function applyTrafficRecoil(id: number | undefined, pushX: number, pushZ: number) {
  if (id === undefined) return;
  const car = trafficCars.find((c) => c.id === id);
  if (car) {
    car.recoilX += pushX;
    car.recoilZ += pushZ;
    car.speed = Math.max(0, car.speed * 0.2); // Abrupt deceleration on impact
    car.isBraking = true;
  }
}
