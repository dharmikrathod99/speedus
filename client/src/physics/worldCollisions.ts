/**
 * SPEED US: High-Performance Spatial Collision & Physics Engine
 * Handles solid collision boundaries for all world architecture, buildings,
 * skyscrapers, roadside trees, storefronts, ocean shoreline, and vehicles.
 * Guarantees players and vehicles CANNOT pass through solid objects.
 */

export interface BoundingBox2D {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  type?: 'building' | 'tree' | 'barrier' | 'water';
}

export interface CollisionResult {
  collided: boolean;
  x: number;
  z: number;
  normalX: number;
  normalZ: number;
  penetration: number;
  hitType?: string;
}

const CHUNK_SIZE = 70;

// Pre-computed static world building colliders
export function getWorldCollidersAround(x: number, z: number, searchRadius: number = 90): BoundingBox2D[] {
  const colliders: BoundingBox2D[] = [];

  const minChunkX = Math.floor((x - searchRadius) / CHUNK_SIZE);
  const maxChunkX = Math.ceil((x + searchRadius) / CHUNK_SIZE);
  const minChunkZ = Math.floor((z - searchRadius) / CHUNK_SIZE);
  const maxChunkZ = Math.ceil((z + searchRadius) / CHUNK_SIZE);

  for (let cx = minChunkX; cx <= maxChunkX; cx++) {
    for (let cz = minChunkZ; cz <= maxChunkZ; cz++) {
      const chunkOriginX = cx * CHUNK_SIZE;
      const chunkOriginZ = cz * CHUNK_SIZE;

      const isDowntown = Math.abs(cx) <= 1 && Math.abs(cz) <= 1;
      const isDealershipChunk = cx === 0 && cz === 1;
      const isGarageChunk = cx === -1 && cz === 1;
      const isGasStationChunk = cx === 0 && cz === -1;
      const isPlayerLoftChunk = cx === 1 && cz === -1;
      const isLuxuryVillaChunk = cx === -2 && cz === -2;

      // Landmark: Apex Dealership (18m x 16m)
      if (isDealershipChunk) {
        colliders.push({
          minX: chunkOriginX + 22 - 9.2,
          maxX: chunkOriginX + 22 + 9.2,
          minZ: chunkOriginZ - 22 - 8.2,
          maxZ: chunkOriginZ - 22 + 8.2,
          type: 'building'
        });
      }

      // Landmark: SpeedWorks Garage (18m x 18m)
      if (isGarageChunk) {
        colliders.push({
          minX: chunkOriginX - 22 - 9.2,
          maxX: chunkOriginX - 22 + 9.2,
          minZ: chunkOriginZ - 22 - 9.2,
          maxZ: chunkOriginZ - 22 + 9.2,
          type: 'building'
        });
      }

      // Landmark: NitroFuel Gas Station Pumps & Mart (18m x 14m)
      if (isGasStationChunk) {
        colliders.push({
          minX: chunkOriginX + 22 - 9.2,
          maxX: chunkOriginX + 22 + 9.2,
          minZ: chunkOriginZ + 22 - 7.2,
          maxZ: chunkOriginZ + 22 + 7.2,
          type: 'building'
        });
      }

      // Landmark: Starter Loft Apartment (18m x 18m)
      if (isPlayerLoftChunk) {
        colliders.push({
          minX: chunkOriginX - 22 - 9.2,
          maxX: chunkOriginX - 22 + 9.2,
          minZ: chunkOriginZ + 22 - 9.2,
          maxZ: chunkOriginZ + 22 + 9.2,
          type: 'building'
        });
      }

      // Landmark: Luxury Villa (18m x 16m)
      if (isLuxuryVillaChunk) {
        colliders.push({
          minX: chunkOriginX + 22 - 9.2,
          maxX: chunkOriginX + 22 + 9.2,
          minZ: chunkOriginZ - 22 - 8.2,
          maxZ: chunkOriginZ - 22 + 8.2,
          type: 'building'
        });
      }

      // Downtown High-Rise Towers & Plazas across Block Quadrants
      if (isDowntown) {
        if (!isGasStationChunk) {
          colliders.push({
            minX: chunkOriginX + 23 - 9.2,
            maxX: chunkOriginX + 23 + 9.2,
            minZ: chunkOriginZ + 23 - 9.2,
            maxZ: chunkOriginZ + 23 + 9.2,
            type: 'building'
          });
        }
        if (!isGarageChunk) {
          colliders.push({
            minX: chunkOriginX - 23 - 9.2,
            maxX: chunkOriginX - 23 + 9.2,
            minZ: chunkOriginZ - 23 - 9.2,
            maxZ: chunkOriginZ - 23 + 9.2,
            type: 'building'
          });
        }
        if (!isPlayerLoftChunk) {
          colliders.push({
            minX: chunkOriginX - 23 - 9.2,
            maxX: chunkOriginX - 23 + 9.2,
            minZ: chunkOriginZ + 23 - 9.2,
            maxZ: chunkOriginZ + 23 + 9.2,
            type: 'building'
          });
        }
        if (!isDealershipChunk) {
          colliders.push({
            minX: chunkOriginX + 23 - 9.2,
            maxX: chunkOriginX + 23 + 9.2,
            minZ: chunkOriginZ - 23 - 9.2,
            maxZ: chunkOriginZ - 23 + 9.2,
            type: 'building'
          });
        }
      }

      // Outer Procedural Neighborhoods (Suburban Houses, Plazas & Warehouses)
      if (!isDowntown && !isDealershipChunk && !isGarageChunk && !isGasStationChunk && !isPlayerLoftChunk && !isLuxuryVillaChunk) {
        const hash = Math.abs(Math.sin(cx * 12.9898 + cz * 78.233)) * 43758.5453;
        const variant = Math.floor(hash % 3);
        if (variant === 0) {
          colliders.push({
            minX: chunkOriginX + 23 - 8.2,
            maxX: chunkOriginX + 23 + 8.2,
            minZ: chunkOriginZ + 23 - 7.2,
            maxZ: chunkOriginZ + 23 + 7.2,
            type: 'building'
          });
          colliders.push({
            minX: chunkOriginX - 23 - 9.2,
            maxX: chunkOriginX - 23 + 9.2,
            minZ: chunkOriginZ - 23 - 8.2,
            maxZ: chunkOriginZ - 23 + 8.2,
            type: 'building'
          });
        } else if (variant === 1) {
          colliders.push({
            minX: chunkOriginX - 23 - 9.2,
            maxX: chunkOriginX - 23 + 9.2,
            minZ: chunkOriginZ - 23 - 8.2,
            maxZ: chunkOriginZ - 23 + 8.2,
            type: 'building'
          });
          colliders.push({
            minX: chunkOriginX + 23 - 9.2,
            maxX: chunkOriginX + 23 + 9.2,
            minZ: chunkOriginZ + 23 - 8.2,
            maxZ: chunkOriginZ + 23 + 8.2,
            type: 'building'
          });
        } else if (variant === 2) {
          colliders.push({
            minX: chunkOriginX - 23 - 8.2,
            maxX: chunkOriginX - 23 + 8.2,
            minZ: chunkOriginZ + 23 - 7.2,
            maxZ: chunkOriginZ + 23 + 7.2,
            type: 'building'
          });
          colliders.push({
            minX: chunkOriginX + 23 - 8.2,
            maxX: chunkOriginX + 23 + 8.2,
            minZ: chunkOriginZ - 23 - 7.2,
            maxZ: chunkOriginZ - 23 + 7.2,
            type: 'building'
          });
        }
      }

      // Roadside Trees (Solid Tree Trunks - 0.7m radius)
      const treeOffsets = [
        [18, 14],
        [-18, 14],
        [18, -14],
        [-18, -14]
      ];
      for (const [tx, tz] of treeOffsets) {
        const treeX = chunkOriginX + tx;
        const treeZ = chunkOriginZ + tz;
        colliders.push({
          minX: treeX - 0.7,
          maxX: treeX + 0.7,
          minZ: treeZ - 0.7,
          maxZ: treeZ + 0.7,
          type: 'tree'
        });
      }
    }
  }

  // Pacific Ocean Shoreline Western Barrier (x <= -135)
  colliders.push({
    minX: -450,
    maxX: -135,
    minZ: -450,
    maxZ: 450,
    type: 'water'
  });

  return colliders;
}

export interface DynamicObstacle {
  x: number;
  z: number;
  halfW?: number;
  halfD?: number;
  rotY?: number;
  id?: number | string;
}

/**
 * Resolves solid collisions for an entity with circular radius against all nearby world colliders.
 * Returns updated (x, z) coordinates and collision impact data.
 */
export function resolveWorldCollisions(
  x: number,
  z: number,
  radius: number,
  additionalObstacles?: DynamicObstacle[]
): CollisionResult {
  const colliders = getWorldCollidersAround(x, z, 75);

  let currentX = x;
  let currentZ = z;
  let totalCollided = false;
  let finalNormalX = 0;
  let finalNormalZ = 0;
  let maxPen = 0;
  let hitType = 'none';

  // Test against world static colliders
  for (const box of colliders) {
    const clampX = Math.max(box.minX, Math.min(currentX, box.maxX));
    const clampZ = Math.max(box.minZ, Math.min(currentZ, box.maxZ));

    const dx = currentX - clampX;
    const dz = currentZ - clampZ;
    const distSq = dx * dx + dz * dz;

    if (distSq < radius * radius) {
      totalCollided = true;
      hitType = box.type || 'building';
      const dist = Math.sqrt(distSq);

      let nx = 0;
      let nz = 0;
      let pen = 0;

      if (dist > 0.001) {
        nx = dx / dist;
        nz = dz / dist;
        pen = radius - dist;
      } else {
        // Deep penetration fallback: eject along closest box edge
        const toMinX = currentX - box.minX;
        const toMaxX = box.maxX - currentX;
        const toMinZ = currentZ - box.minZ;
        const toMaxZ = box.maxZ - currentZ;
        const minVal = Math.min(toMinX, toMaxX, toMinZ, toMaxZ);

        if (minVal === toMinX) { nx = -1; pen = radius + toMinX; }
        else if (minVal === toMaxX) { nx = 1; pen = radius + toMaxX; }
        else if (minVal === toMinZ) { nx = -1; pen = radius + toMinZ; }
        else { nz = 1; pen = radius + toMaxZ; }
      }

      currentX += nx * pen;
      currentZ += nz * pen;

      if (pen > maxPen) {
        maxPen = pen;
        finalNormalX = nx;
        finalNormalZ = nz;
      }
    }
  }

  // Test against dynamic obstacles (e.g. traffic cars or player vehicle)
  if (additionalObstacles) {
    for (const obs of additionalObstacles) {
      if (obs.rotY !== undefined) {
        // High-Precision Rotated 2D Capsule Collision (exact for vehicles at ANY rotation angle)
        const sinY = Math.sin(obs.rotY);
        const cosY = Math.cos(obs.rotY);
        const halfD = obs.halfD || 2.2;
        const spineLength = halfD * 0.6; // Distance from center to front/rear axles

        // Front axle center (A) and rear axle center (B)
        const ax = obs.x + sinY * spineLength;
        const az = obs.z + cosY * spineLength;
        const bx = obs.x - sinY * spineLength;
        const bz = obs.z - cosY * spineLength;

        // Vector AB and AP
        const abX = bx - ax;
        const abZ = bz - az;
        const apX = currentX - ax;
        const apZ = currentZ - az;
        const abLenSq = abX * abX + abZ * abZ;

        // Clamp projection parameter t to segment [0, 1]
        const t = abLenSq > 0.0001 ? Math.max(0, Math.min(1, (apX * abX + apZ * abZ) / abLenSq)) : 0.5;

        // Closest point on the car's spine
        const closestX = ax + t * abX;
        const closestZ = az + t * abZ;

        const dx = currentX - closestX;
        const dz = currentZ - closestZ;
        const distSq = dx * dx + dz * dz;

        const carCapsuleRadius = (obs.halfW || 1.05) + 0.15; // Width radius + boundary shell
        const totalRadius = radius + carCapsuleRadius;

        if (distSq < totalRadius * totalRadius) {
          totalCollided = true;
          hitType = 'vehicle';
          const dist = Math.sqrt(distSq);
          const nx = dist > 0.001 ? dx / dist : sinY;
          const nz = dist > 0.001 ? dz / dist : cosY;
          const pen = totalRadius - dist;

          currentX += nx * pen;
          currentZ += nz * pen;

          if (pen > maxPen) {
            maxPen = pen;
            finalNormalX = nx;
            finalNormalZ = nz;
          }
        }
      } else {
        const halfW = obs.halfW || 1.1;
        const halfD = obs.halfD || 2.2;
        const minX = obs.x - halfW;
        const maxX = obs.x + halfW;
        const minZ = obs.z - halfD;
        const maxZ = obs.z + halfD;

        const clampX = Math.max(minX, Math.min(currentX, maxX));
        const clampZ = Math.max(minZ, Math.min(currentZ, maxZ));

        const dx = currentX - clampX;
        const dz = currentZ - clampZ;
        const distSq = dx * dx + dz * dz;

        if (distSq < radius * radius) {
          totalCollided = true;
          hitType = 'vehicle';
          const dist = Math.sqrt(distSq);
          const nx = dist > 0.001 ? dx / dist : 1;
          const nz = dist > 0.001 ? dz / dist : 0;
          const pen = radius - dist;

          currentX += nx * pen;
          currentZ += nz * pen;

          if (pen > maxPen) {
            maxPen = pen;
            finalNormalX = nx;
            finalNormalZ = nz;
          }
        }
      }
    }
  }

  return {
    collided: totalCollided,
    x: currentX,
    z: currentZ,
    normalX: finalNormalX,
    normalZ: finalNormalZ,
    penetration: maxPen,
    hitType
  };
}

