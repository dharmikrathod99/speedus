import React, { useMemo, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import { vehiclePhysics, playerPhysics } from '../../stores/vehiclePhysics';
import {
  SuburbanHouse,
  LuxuryVilla,
  PlayerLoft,
  ApexDealership,
  SpeedWorksGarage,
  Warehouse,
  StuntJumpRamp,
  DowntownSkyscraper,
  GasStationComplex,
  CommercialPlaza
} from './HouseStructures';
import { CITY_SHOPS } from '../../data/shopsData';
import { ShopBuilding } from './ShopBuildings';
import { isMobileDevice } from '../../stores/virtualInput';

const CHUNK_SIZE = 70; // 70m x 70m per chunk
const isMobile = isMobileDevice();
const CHUNK_RADIUS = isMobile ? 1 : 2; // 3x3 (9 chunks) on mobile for blazing fast 60 FPS; 5x5 (25 chunks) on desktop

// Static Cached Geometries (Allocated ONCE at module load, zero runtime GC allocations)
const geoGround = new THREE.PlaneGeometry(CHUNK_SIZE, CHUNK_SIZE);
const geoHorizon = new THREE.PlaneGeometry(2400, 2400);
const geoRoad = new THREE.PlaneGeometry(CHUNK_SIZE, 16);
const geoYellowLine = new THREE.PlaneGeometry(CHUNK_SIZE, 0.2);
const geoWhiteLine = new THREE.PlaneGeometry(CHUNK_SIZE, 0.25);
const geoSidewalk = new THREE.BoxGeometry(CHUNK_SIZE, 0.2, 2.6);
const geoTrunk = new THREE.CylinderGeometry(0.2, 0.35, 2.4, 7);
const geoLeaves1 = new THREE.ConeGeometry(1.6, 1.8, 7);
const geoLeaves2 = new THREE.ConeGeometry(1.2, 1.5, 7);
const geoLeaves3 = new THREE.ConeGeometry(0.8, 1.2, 7);
const geoFlower = new THREE.BoxGeometry(4, 0.1, 1);
const geoLampPole = new THREE.CylinderGeometry(0.1, 0.14, 7, 6);
const geoLampHead = new THREE.BoxGeometry(0.35, 0.12, 0.5);

// Intersection & Street Prop Geometries
const geoCrosswalkStripe = new THREE.PlaneGeometry(0.65, 3.2);
const geoTrafficPole = new THREE.CylinderGeometry(0.08, 0.1, 5.4, 6);
const geoTrafficArm = new THREE.CylinderGeometry(0.05, 0.05, 3.2, 6);
const geoTrafficHousing = new THREE.BoxGeometry(0.3, 0.85, 0.25);
const geoSignalLens = new THREE.SphereGeometry(0.09, 8, 8);
const geoFireHydrant = new THREE.CylinderGeometry(0.16, 0.2, 0.65, 8);
const geoSpeedSignPost = new THREE.CylinderGeometry(0.035, 0.035, 2.4, 6);
const geoSpeedSignPlate = new THREE.CylinderGeometry(0.32, 0.32, 0.03, 16);

// Architecture Geometries (Strictly sized to fit inside city block quadrants without touching roads)
const geoSkyscraper = new THREE.BoxGeometry(18, 70, 18);
const geoWindowBand = new THREE.BoxGeometry(18.2, 1.6, 18.2);
const geoDealership = new THREE.BoxGeometry(18, 8, 16);
const geoDealershipSign = new THREE.BoxGeometry(16, 1.4, 0.4);
const geoGarage = new THREE.BoxGeometry(18, 10, 18);
const geoGarageSign = new THREE.BoxGeometry(14, 1.4, 0.4);
const geoGasStation = new THREE.BoxGeometry(18, 0.8, 14);
const geoGasStationSign = new THREE.BoxGeometry(18.2, 0.3, 0.2);
const geoPlayerLoft = new THREE.BoxGeometry(18, 32, 18);
const geoLuxuryVilla = new THREE.BoxGeometry(18, 9, 16);
const geoSuburbanHouse = new THREE.BoxGeometry(16, 7.5, 14);
const geoRoof = new THREE.ConeGeometry(12, 4.5, 4);
const geoWarehouse = new THREE.BoxGeometry(18, 9, 16);

// Shared Static Materials (Deep obsidian black road asphalt with negative polygon offset to guarantee zero z-fighting/clipping)
const asphaltMat = new THREE.MeshStandardMaterial({
  color: 0x111622, // Deep obsidian black asphalt
  roughness: 0.82,
  metalness: 0.1,
  polygonOffset: true,
  polygonOffsetFactor: -1,
  polygonOffsetUnits: -1
});
const yellowLineMat = new THREE.MeshBasicMaterial({
  color: 0xfacc15,
  polygonOffset: true,
  polygonOffsetFactor: -3,
  polygonOffsetUnits: -3
});
const whiteLineMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  polygonOffset: true,
  polygonOffsetFactor: -3,
  polygonOffsetUnits: -3
});
const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0xc8d1dc, roughness: 0.6 });
const grassMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.8 });
const horizonGrassMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.9 });
const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
const treeLeavesMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
const flowerMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
const buildingMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
const buildingLightMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4 });
const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.7 });
const houseRoofMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.7 });
const suburbanWallMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.6 });
const trafficHousingMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
const signalRedMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 3.5 });
const signalYellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xfacc15, emissiveIntensity: 3.5 });
const signalGreenMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 3.5 });
const hydrantRedMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });
const signPlateMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });

// Shared static emissive materials (zero per-chunk runtime WebGL material compilations)
const sharedWindowGlowMatDay = new THREE.MeshStandardMaterial({
  color: 0xfef08a,
  emissive: 0xfde047,
  emissiveIntensity: 0.8
});
const sharedWindowGlowMatNight = new THREE.MeshStandardMaterial({
  color: 0xfef08a,
  emissive: 0xfde047,
  emissiveIntensity: 2.8
});
const sharedNeonCyanMatDay = new THREE.MeshStandardMaterial({
  color: 0x00f0ff,
  emissive: 0x00f0ff,
  emissiveIntensity: 2.0
});
const sharedNeonCyanMatNight = new THREE.MeshStandardMaterial({
  color: 0x00f0ff,
  emissive: 0x00f0ff,
  emissiveIntensity: 3.5
});
const sharedNeonPinkMatDay = new THREE.MeshStandardMaterial({
  color: 0xff007f,
  emissive: 0xff007f,
  emissiveIntensity: 2.0
});
const sharedNeonPinkMatNight = new THREE.MeshStandardMaterial({
  color: 0xff007f,
  emissive: 0xff007f,
  emissiveIntensity: 3.5
});

interface ChunkProps {
  cx: number;
  cz: number;
  isNight: boolean;
}

// Cute Low-Poly 3D Tree
const CuteTree = React.memo(({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) => (
  <group position={[x, 0, z]} scale={[scale, scale, scale]}>
    <mesh position={[0, 1.2, 0]} geometry={geoTrunk} material={treeTrunkMat} />
    <mesh position={[0, 2.6, 0]} geometry={geoLeaves1} material={treeLeavesMat} />
    <mesh position={[0, 3.6, 0]} geometry={geoLeaves2} material={treeLeavesMat} />
    <mesh position={[0, 4.5, 0]} geometry={geoLeaves3} material={treeLeavesMat} />
  </group>
));

// Single World Chunk Component
const WorldChunk = React.memo(({ cx, cz, isNight }: ChunkProps) => {
  const chunkOriginX = cx * CHUNK_SIZE;
  const chunkOriginZ = cz * CHUNK_SIZE;

  const isDowntown = Math.abs(cx) <= 1 && Math.abs(cz) <= 1;
  const isDealershipChunk = cx === 0 && cz === 1;
  const isGarageChunk = cx === -1 && cz === 1;
  const isGasStationChunk = cx === 0 && cz === -1;
  const isPlayerLoftChunk = cx === 1 && cz === -1;
  const isLuxuryVillaChunk = cx === -2 && cz === -2;

  // Commercial Shops in this Chunk
  const chunkShops = useMemo(
    () => CITY_SHOPS.filter((s) => s.chunkX === cx && s.chunkZ === cz),
    [cx, cz]
  );
  const hasShopNE = chunkShops.some((s) => s.localPos[0] > 0 && s.localPos[2] > 0);
  const hasShopSE = chunkShops.some((s) => s.localPos[0] > 0 && s.localPos[2] < 0);
  const hasShopNW = chunkShops.some((s) => s.localPos[0] < 0 && s.localPos[2] > 0);
  const hasShopSW = chunkShops.some((s) => s.localPos[0] < 0 && s.localPos[2] < 0);

  // Deterministic outer chunk variant (suburban house, warehouse, or open highway)
  const hash = Math.abs(Math.sin(cx * 12.9898 + cz * 78.233)) * 43758.5453;
  const variant = Math.floor(hash % 3);

  const windowGlowMat = isNight ? sharedWindowGlowMatNight : sharedWindowGlowMatDay;
  const neonCyanMat = isNight ? sharedNeonCyanMatNight : sharedNeonCyanMatDay;
  const neonPinkMat = isNight ? sharedNeonPinkMatNight : sharedNeonPinkMatDay;

  return (
    <group position={[chunkOriginX, 0, chunkOriginZ]}>
      {/* Chunk Ground Grass Base */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={geoGround} material={grassMat} receiveShadow />

      {/* East-West Road (Elevated above grass at Y = 0.04 with crisp obsidian black asphalt) */}
      <group position={[0, 0.04, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={geoRoad} material={asphaltMat} receiveShadow />
        <mesh position={[0, 0.005, 0.25]} rotation={[-Math.PI / 2, 0, 0]} geometry={geoYellowLine} material={yellowLineMat} />
        <mesh position={[0, 0.005, -0.25]} rotation={[-Math.PI / 2, 0, 0]} geometry={geoYellowLine} material={yellowLineMat} />
        <mesh position={[0, 0.005, 7.3]} rotation={[-Math.PI / 2, 0, 0]} geometry={geoWhiteLine} material={whiteLineMat} />
        <mesh position={[0, 0.005, -7.3]} rotation={[-Math.PI / 2, 0, 0]} geometry={geoWhiteLine} material={whiteLineMat} />
        <mesh position={[0, 0.12, 9.5]} geometry={geoSidewalk} material={sidewalkMat} receiveShadow />
        <mesh position={[0, 0.12, -9.5]} geometry={geoSidewalk} material={sidewalkMat} receiveShadow />
      </group>

      {/* North-South Road (Elevated above grass at Y = 0.045 with crisp obsidian black asphalt) */}
      <group position={[0, 0.045, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={geoRoad} material={asphaltMat} receiveShadow />
        <mesh position={[0, 0.005, 0.25]} rotation={[-Math.PI / 2, 0, 0]} geometry={geoYellowLine} material={yellowLineMat} />
        <mesh position={[0, 0.005, -0.25]} rotation={[-Math.PI / 2, 0, 0]} geometry={geoYellowLine} material={yellowLineMat} />
        <mesh position={[0, 0.005, 7.3]} rotation={[-Math.PI / 2, 0, 0]} geometry={geoWhiteLine} material={whiteLineMat} />
        <mesh position={[0, 0.005, -7.3]} rotation={[-Math.PI / 2, 0, 0]} geometry={geoWhiteLine} material={whiteLineMat} />
        <mesh position={[0, 0.12, 9.5]} geometry={geoSidewalk} material={sidewalkMat} receiveShadow />
        <mesh position={[0, 0.12, -9.5]} geometry={geoSidewalk} material={sidewalkMat} receiveShadow />
      </group>

      {/* Cute Trees along roadside */}
      <CuteTree x={18} z={14} scale={1.1} />
      <CuteTree x={-18} z={14} scale={1.2} />
      <CuteTree x={18} z={-14} scale={1.0} />
      <CuteTree x={-18} z={-14} scale={1.1} />

      {/* Flower Beds (Positioned safely inside grass quadrants, away from roadway & sidewalk) */}
      <mesh position={[14, 0.15, 13]} geometry={geoFlower} material={flowerMat} />
      <mesh position={[-14, 0.15, -13]} geometry={geoFlower} material={flowerMat} />

      {/* Streetlight Poles */}
      {[-22, 22].map((sx, i) => (
        <group key={i} position={[sx, 0, 11]}>
          <mesh position={[0, 3.5, 0]} geometry={geoLampPole} material={buildingMat} />
          <mesh position={[0.6, 6.8, 0]} geometry={geoLampHead} material={windowGlowMat} />
        </group>
      ))}

      {/* Downtown Landmarks (Strictly set back inside city block quadrants, away from roads) */}
      {isDealershipChunk && (
        <group position={[22, 0, -22]}>
          <ApexDealership isNight={isNight} />
        </group>
      )}

      {isGarageChunk && (
        <group position={[-22, 0, -22]}>
          <SpeedWorksGarage isNight={isNight} />
        </group>
      )}

      {isGasStationChunk && (
        <group position={[22, 0, 22]}>
          <GasStationComplex isNight={isNight} />
        </group>
      )}

      {isPlayerLoftChunk && (
        <group position={[-22, 0, 22]}>
          <PlayerLoft isNight={isNight} />
        </group>
      )}

      {isLuxuryVillaChunk && (
        <group position={[22, 0, -22]}>
          <LuxuryVilla isNight={isNight} />
        </group>
      )}

      {/* Downtown High-Rise Skyscrapers & Commercial Plazas across City Quadrants */}
      {isDowntown && (
        <>
          {/* North-East Quadrant */}
          {!isGasStationChunk && !hasShopNE && (
            <group position={[23, 0, 23]}>
              <DowntownSkyscraper variant={0} isNight={isNight} />
            </group>
          )}
          {/* South-West Quadrant */}
          {!isGarageChunk && !hasShopSW && (
            <group position={[-23, 0, -23]}>
              <DowntownSkyscraper variant={1} isNight={isNight} />
            </group>
          )}
          {/* North-West Quadrant */}
          {!isPlayerLoftChunk && !hasShopNW && (
            <group position={[-23, 0, 23]}>
              <DowntownSkyscraper variant={2} isNight={isNight} />
            </group>
          )}
          {/* South-East Quadrant */}
          {!isDealershipChunk && !hasShopSE && (
            <group position={[23, 0, -23]}>
              <CommercialPlaza isNight={isNight} />
            </group>
          )}
        </>
      )}

      {/* Outer Procedural Neighborhoods (Suburban Houses, Commercial Plazas & Logistics) */}
      {!isDowntown && (
        <>
          {variant === 0 && (
            <>
              {!hasShopNE && (
                <group position={[23, 0, 23]}>
                  <SuburbanHouse isNight={isNight} />
                </group>
              )}
              {!hasShopSW && (
                <group position={[-23, 0, -23]}>
                  <CommercialPlaza isNight={isNight} />
                </group>
              )}
            </>
          )}
          {variant === 1 && (
            <>
              {!hasShopSW && (
                <group position={[-23, 0, -23]}>
                  <Warehouse />
                </group>
              )}
              {!hasShopNE && (
                <group position={[23, 0, 23]}>
                  <CommercialPlaza isNight={isNight} />
                </group>
              )}
            </>
          )}
          {variant === 2 && (
            <>
              {!hasShopNW && (
                <group position={[-23, 0, 23]}>
                  <SuburbanHouse isNight={isNight} />
                </group>
              )}
              {!hasShopSE && (
                <group position={[23, 0, -23]}>
                  <SuburbanHouse isNight={isNight} />
                </group>
              )}
            </>
          )}
        </>
      )}

      {/* Metropolitan City Shops & Real-Life Commercial Storefronts */}
      {chunkShops.map((shop) => (
        <ShopBuilding key={shop.id} shop={shop} isNight={isNight} />
      ))}

      {/* 3D Stunt Jump Launch Ramps (Strictly located in open empty spaces, NEVER on roads) */}
      {cx === -1 && cz === 0 && (
        <group position={[-23, 0, 23]}>
          {/* Beachfront Open Sand Stunt Arena (Dedicated open beach quadrant, 23m clear of all roads) */}
          <StuntJumpRamp x={0} z={5} direction="north" height={3.2} length={9.0} width={5.5} />
          <StuntJumpRamp x={0} z={-5} direction="south" height={3.2} length={9.0} width={5.5} />
        </group>
      )}
      {cx === 0 && cz === 1 && (
        <group position={[23, 0, -23]}>
          {/* Open Lot Stunt Arena */}
          <StuntJumpRamp x={0} z={5} direction="north" height={2.8} length={9.0} width={5.0} />
        </group>
      )}
    </group>
  );
});

export const ChunkManager: React.FC = () => {
  const mode = useGameStore((s) => s.mode);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const isNight = timeOfDay < 6.0 || timeOfDay > 19.0;

  const horizonMeshRef = useRef<THREE.Mesh>(null);
  const [activeChunkCoords, setActiveChunkCoords] = useState<{ cx: number; cz: number }>({ cx: 0, cz: 0 });

  useFrame(() => {
    const px = mode === 'driving' ? vehiclePhysics.pos.x : playerPhysics.pos.x;
    const pz = mode === 'driving' ? vehiclePhysics.pos.z : playerPhysics.pos.z;
    const currentCx = Math.round(px / CHUNK_SIZE);
    const currentCz = Math.round(pz / CHUNK_SIZE);

    if (currentCx !== activeChunkCoords.cx || currentCz !== activeChunkCoords.cz) {
      setActiveChunkCoords({ cx: currentCx, cz: currentCz });
    }

    // Keep the large 2400m horizon terrain centered under the camera/player
    if (horizonMeshRef.current) {
      horizonMeshRef.current.position.set(px, -0.12, pz);
    }
  });

  // Calculate visible chunks: 5x5 base grid (350m) + dynamic forward look-ahead chunks
  const visibleChunks = useMemo(() => {
    const chunkMap = new Map<string, { cx: number; cz: number }>();

    // 1. Solid 5x5 grid centered around active chunk (350m x 350m)
    for (let dx = -CHUNK_RADIUS; dx <= CHUNK_RADIUS; dx++) {
      for (let dz = -CHUNK_RADIUS; dz <= CHUNK_RADIUS; dz++) {
        const cx = activeChunkCoords.cx + dx;
        const cz = activeChunkCoords.cz + dz;
        chunkMap.set(`${cx}_${cz}`, { cx, cz });
      }
    }

    // 2. High-speed Forward Look-Ahead on desktop (mobile keeps strict 9-chunk grid for 60 FPS)
    if (mode === 'driving' && !isMobile) {
      const heading = vehiclePhysics.heading;
      const forwardX = Math.round(Math.sin(heading));
      const forwardZ = Math.round(Math.cos(heading));

      if (forwardX !== 0 || forwardZ !== 0) {
        for (let step = 1; step <= 2; step++) {
          for (let side = -1; side <= 1; side++) {
            const cx = activeChunkCoords.cx + forwardX * (CHUNK_RADIUS + step) - forwardZ * side;
            const cz = activeChunkCoords.cz + forwardZ * (CHUNK_RADIUS + step) + forwardX * side;
            chunkMap.set(`${cx}_${cz}`, { cx, cz });
          }
        }
      }
    }

    return Array.from(chunkMap.values()).map(({ cx, cz }) => ({
      cx,
      cz,
      key: `${cx}_${cz}`
    }));
  }, [activeChunkCoords, mode]);

  return (
    <group>
      {/* 2400m x 2400m Infinite Horizon Ground Underlay (Deep -0.12m underlay guarantees horizon never drops into empty void or clips roads) */}
      <mesh ref={horizonMeshRef} position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={geoHorizon} material={horizonGrassMat} />

      {/* Endless Streaming Chunks */}
      {visibleChunks.map((chunk) => (
        <WorldChunk key={chunk.key} cx={chunk.cx} cz={chunk.cz} isNight={isNight} />
      ))}
    </group>
  );
};
