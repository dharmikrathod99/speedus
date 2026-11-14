/**
 * SPEED US: House Interior & Property Residency Engine
 * Manages entering, exiting, and collision boundaries for interior living spaces.
 */

export interface EnterableHouse {
  id: string;
  name: string;
  district: string;
  entrancePos: [number, number, number];
  doorHeading: number;
}

export const ENTERABLE_HOUSES: EnterableHouse[] = [
  // 1. Downtown Skyview Loft (Player's Primary High-Rise Penthouse)
  {
    id: 'starter-loft',
    name: 'Downtown Skyview Penthouse',
    district: 'Financial District',
    entrancePos: [48, 0.4, -57],
    doorHeading: Math.PI
  },
  // 2. Coastal Luxury Villa (Oceanfront Estate)
  {
    id: 'luxury-villa',
    name: 'Oceanview Coastal Luxury Estate',
    district: 'Oceanfront Beachfront',
    entrancePos: [-118, 0.4, -153],
    doorHeading: 0
  },
  // 3. Grand Boulevard Modern Architectural Residence
  {
    id: 'residence-grand-boulevard',
    name: 'Grand Boulevard Luxury Residence',
    district: 'Downtown Residential Quarter',
    entrancePos: [-155, 0.4, -60],
    doorHeading: 0
  },
  // 4. Metropolitan Suburban Residence (North Residential District)
  {
    id: 'suburban-north',
    name: 'Metropolitan Suburban Residence',
    district: 'North Residential Quarter',
    entrancePos: [23, 0.4, 156],
    doorHeading: Math.PI
  },
  // 5. Ocean Avenue Suburban Residence (West Coastal Sector)
  {
    id: 'suburban-west',
    name: 'Ocean Avenue Suburban Residence',
    district: 'Coastal Boulevard',
    entrancePos: [-163, 0.4, 85],
    doorHeading: Math.PI
  }
];

export const INTERIOR_CONFIG = {
  originY: 120.0,
  floorHeight: 120.0,
  ceilingHeight: 124.8,
  minX: -11.2,
  maxX: 11.2,
  minZ: -8.4,
  maxZ: 11.0,
  entranceSpawn: [0, 120.4, -6.5] as [number, number, number]
};

/**
 * Finds the nearest enterable house within trigger range
 */
export function getNearestEnterableHouse(px: number, pz: number, maxDist = 8.5): EnterableHouse | null {
  let nearest: EnterableHouse | null = null;
  let minDist = maxDist;

  for (const house of ENTERABLE_HOUSES) {
    const dist = Math.hypot(px - house.entrancePos[0], pz - house.entrancePos[2]);
    if (dist < minDist) {
      minDist = dist;
      nearest = house;
    }
  }

  return nearest;
}

/**
 * Solid AABB furniture collision boxes inside the penthouse
 */
interface InteriorObstacle {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  name: string;
}

const INTERIOR_OBSTACLES: InteriorObstacle[] = [
  // L-Shaped Sectional Sofa
  { minX: -6.8, maxX: -1.2, minZ: 0.2, maxZ: 1.8, name: 'sofa-main' },
  { minX: -6.8, maxX: -4.8, minZ: 1.8, maxZ: 4.2, name: 'sofa-chaise' },
  // Coffee Table
  { minX: -5.2, maxX: -2.8, minZ: 2.2, maxZ: 3.8, name: 'coffee-table' },
  // Feature Media TV Wall & Console
  { minX: -8.5, maxX: 0.5, minZ: 6.5, maxZ: 7.6, name: 'tv-wall' },
  // Kitchen Marble Island Counter
  { minX: 4.2, maxX: 8.8, minZ: -1.8, maxZ: -0.2, name: 'kitchen-island' },
  // Smart Refrigerator & Pantry Wall
  { minX: 9.2, maxX: 11.4, minZ: -4.6, maxZ: -2.2, name: 'refrigerator' },
  // King-Size Platform Bed
  { minX: 5.8, maxX: 9.4, minZ: 5.0, maxZ: 8.2, name: 'bed' },
  // Executive Battlestation Workstation Desk
  { minX: -10.8, maxX: -6.2, minZ: -7.8, maxZ: -5.2, name: 'desk' },
  // Foyer Console Table
  { minX: 1.2, maxX: 4.0, minZ: -8.6, maxZ: -7.6, name: 'foyer-table' }
];

/**
 * Resolves solid collisions for walking player inside the house interior
 */
export function resolveInteriorCollisions(x: number, z: number, radius = 0.45): { x: number; z: number } {
  let cx = x;
  let cz = z;

  // 1. Constrain strictly within outer walls and balcony boundaries
  const effMinX = INTERIOR_CONFIG.minX + radius;
  const effMaxX = INTERIOR_CONFIG.maxX - radius;
  const effMinZ = INTERIOR_CONFIG.minZ + radius;
  const effMaxZ = INTERIOR_CONFIG.maxZ - radius;

  cx = Math.max(effMinX, Math.min(effMaxX, cx));
  cz = Math.max(effMinZ, Math.min(effMaxZ, cz));

  // 2. Push out of solid furniture items
  for (const obs of INTERIOR_OBSTACLES) {
    const oMinX = obs.minX - radius;
    const oMaxX = obs.maxX + radius;
    const oMinZ = obs.minZ - radius;
    const oMaxZ = obs.maxZ + radius;

    if (cx > oMinX && cx < oMaxX && cz > oMinZ && cz < oMaxZ) {
      // Find shortest penetration direction
      const penLeft = cx - oMinX;
      const penRight = oMaxX - cx;
      const penTop = cz - oMinZ;
      const penBottom = oMaxZ - cz;

      const minPen = Math.min(penLeft, penRight, penTop, penBottom);
      if (minPen === penLeft) cx = oMinX;
      else if (minPen === penRight) cx = oMaxX;
      else if (minPen === penTop) cz = oMinZ;
      else cz = oMaxZ;
    }
  }

  return { x: cx, z: cz };
}

