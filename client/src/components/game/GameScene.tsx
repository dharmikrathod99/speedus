import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { CameraRig } from '../camera/CameraRig';
import { SkyAtmosphere } from '../world/SkyAtmosphere';
import { ChunkManager } from '../world/ChunkManager';
import { OceanWater } from '../world/OceanWater';
import { AiTraffic } from '../world/AiTraffic';
import { Pedestrians } from '../world/Pedestrians';
import { MissionWaypoints } from '../world/MissionWaypoints';
import { DrivableVehicle } from '../vehicles/DrivableVehicle';
import { ParkedVehicles } from '../vehicles/ParkedVehicles';
import { PlayerCharacter } from '../player/PlayerCharacter';
import { HouseInterior } from '../world/HouseInterior';
import { ShopInterior } from '../world/ShopInterior';
import { useGameStore } from '../../stores/gameStore';
import { isMobileDevice } from '../../stores/virtualInput';

export const GameScene: React.FC = () => {
  const shadows = useGameStore((s) => s.settings.shadows);
  const isMobile = isMobileDevice();

  return (
    <div className="w-full h-full relative bg-[#38bdf8]">
      <Canvas
        shadows={shadows}
        camera={{ position: [0, 8, 15], fov: 65, near: 0.4, far: isMobile ? 900 : 1400 }}
        gl={{
          antialias: !isMobile,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
          powerPreference: 'high-performance'
        }}
        dpr={isMobile ? 1.0 : [1, 1.5]}
      >
        <Suspense fallback={null}>
          {/* Dynamic Follow Camera Rig */}
          <CameraRig />

          {/* Gorgeous Sky Dome, Drifting 3D Clouds, Sun & Atmospheric Lighting */}
          <SkyAtmosphere />

          {/* Proximity Chunk Streaming Engine: Only renders the 9 nearest chunks around the player */}
          <ChunkManager />

          {/* Ocean Shoreline & Beach */}
          <OceanWater />

          {/* Autonomous Living World */}
          <AiTraffic />
          <Pedestrians />

          {/* Dynamic Holographic Mission Beacons */}
          <MissionWaypoints />

          {/* Parked Showcase & Street Entity Vehicles */}
          <ParkedVehicles />

          {/* Player & Drivable Vehicle */}
          <DrivableVehicle />
          <PlayerCharacter />

          {/* Luxury Penthouse & House Interior System */}
          <HouseInterior />

          {/* Metropolitan Commercial Shop 3D Interior System */}
          <ShopInterior />
        </Suspense>
      </Canvas>
    </div>
  );
};
