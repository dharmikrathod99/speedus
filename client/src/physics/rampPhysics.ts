/**
 * SPEED US: 3D Ramp & Stunt Physics Engine
 * Handles elevation calculation, ramp climbing, airborne launch dynamics,
 * and landing detection for both vehicles and on-foot players.
 *
 * NOTE: All ramps are located strictly in OPEN EMPTY SPACES (Beachfront Arena & Stunt Lots),
 * keeping all traffic roads and avenues 100% CLEAR and unobstructed.
 */

export interface RampZone {
  id: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  baseY: number;
  topY: number;
  direction: 'north' | 'south' | 'east' | 'west';
  type: 'access' | 'stunt';
}

// Global static ramps in the world (Strictly in empty spaces, NEVER on roads)
export const WORLD_RAMPS: RampZone[] = [
  // 1. Oceanfront Beach Stunt Arena - North Launch Ramp (Open sand lot at X = -93, Z = 23)
  {
    id: 'ocean-stunt-north',
    minX: -96.0,
    maxX: -90.0,
    minZ: 19.0,
    maxZ: 28.0,
    baseY: 0.05,
    topY: 3.2,
    direction: 'north',
    type: 'stunt'
  },
  // 2. Oceanfront Beach Stunt Arena - South Launch Ramp (Open sand lot at X = -93, Z = 23)
  {
    id: 'ocean-stunt-south',
    minX: -96.0,
    maxX: -90.0,
    minZ: 18.0,
    maxZ: 27.0,
    baseY: 0.05,
    topY: 3.2,
    direction: 'south',
    type: 'stunt'
  },
  // 3. Urban Stunt Park Lot (Dedicated empty lot quadrant at X = 23, Z = 47)
  {
    id: 'urban-stunt-lot',
    minX: 20.5,
    maxX: 25.5,
    minZ: 43.0,
    maxZ: 52.0,
    baseY: 0.05,
    topY: 2.8,
    direction: 'north',
    type: 'stunt'
  }
];

export interface RampSample {
  onRamp: boolean;
  height: number;
  progress: number;
  rampAngle: number;
  isLaunchLip: boolean;
  type?: 'access' | 'stunt';
}

/**
 * Checks if coordinate (x, z) is currently on a ramp,
 * returning the exact height, slope angle, and whether the vehicle is at the launch lip.
 */
export function sampleRampElevation(x: number, z: number): RampSample {
  for (const ramp of WORLD_RAMPS) {
    if (x >= ramp.minX && x <= ramp.maxX && z >= ramp.minZ && z <= ramp.maxZ) {
      let progress = 0;
      let length = 1;

      if (ramp.direction === 'north') {
        length = ramp.maxZ - ramp.minZ;
        progress = (ramp.maxZ - z) / length;
      } else if (ramp.direction === 'south') {
        length = ramp.maxZ - ramp.minZ;
        progress = (z - ramp.minZ) / length;
      } else if (ramp.direction === 'east') {
        length = ramp.maxX - ramp.minX;
        progress = (x - ramp.minX) / length;
      } else if (ramp.direction === 'west') {
        length = ramp.maxX - ramp.minX;
        progress = (ramp.maxX - x) / length;
      }

      progress = Math.max(0, Math.min(1, progress));
      const height = ramp.baseY + progress * (ramp.topY - ramp.baseY);
      const rampAngle = Math.atan2(ramp.topY - ramp.baseY, length);
      const isLaunchLip = progress > 0.92;

      return {
        onRamp: true,
        height,
        progress,
        rampAngle,
        isLaunchLip,
        type: ramp.type
      };
    }
  }

  return {
    onRamp: false,
    height: 0,
    progress: 0,
    rampAngle: 0,
    isLaunchLip: false
  };
}
