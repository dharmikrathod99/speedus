import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import { playerPhysics, vehiclePhysics } from '../../stores/vehiclePhysics';
import { ENTERABLE_HOUSES, getNearestEnterableHouse, INTERIOR_CONFIG } from '../../stores/houseSystem';

// Static Geometries (Allocated once at module load, zero runtime GC churn)
const geoFloor = new THREE.PlaneGeometry(24, 18);
const geoCeiling = new THREE.PlaneGeometry(24, 18);
const geoWallBack = new THREE.BoxGeometry(24, 4.8, 0.3);
const geoWallSide = new THREE.BoxGeometry(0.3, 4.8, 18);
const geoBalconyFloor = new THREE.BoxGeometry(24, 0.2, 4);
const geoGlassPanel = new THREE.BoxGeometry(5.8, 4.6, 0.08);
const geoMullion = new THREE.BoxGeometry(0.12, 4.8, 0.14);
const geoBalconyGlassRail = new THREE.BoxGeometry(24, 1.1, 0.06);
const geoBalconyRailCap = new THREE.BoxGeometry(24, 0.08, 0.12);

// Furniture Geometries
const geoSofaBase = new THREE.BoxGeometry(3.8, 0.45, 1.1);
const geoSofaBack = new THREE.BoxGeometry(3.8, 0.65, 0.25);
const geoSofaChaise = new THREE.BoxGeometry(1.2, 0.45, 2.4);
const geoCushion = new THREE.BoxGeometry(0.5, 0.4, 0.18);
const geoCoffeeTableTop = new THREE.BoxGeometry(2.2, 0.06, 1.0);
const geoCoffeeTableLeg = new THREE.CylinderGeometry(0.03, 0.03, 0.38, 8);
const geoRug = new THREE.PlaneGeometry(5.8, 4.4);
const geoTvBacking = new THREE.BoxGeometry(4.6, 3.8, 0.1);
const geoTvConsole = new THREE.BoxGeometry(3.6, 0.45, 0.6);
const geoTvScreen = new THREE.BoxGeometry(2.4, 1.35, 0.04);
const geoFloorLampPole = new THREE.CylinderGeometry(0.025, 0.03, 2.3, 8);
const geoFloorLampHead = new THREE.SphereGeometry(0.22, 12, 12);

// Kitchen Geometries
const geoIsland = new THREE.BoxGeometry(4.2, 0.95, 1.4);
const geoBarstoolSeat = new THREE.CylinderGeometry(0.26, 0.26, 0.08, 16);
const geoBarstoolLeg = new THREE.CylinderGeometry(0.02, 0.02, 0.72, 8);
const geoFridge = new THREE.BoxGeometry(1.4, 2.1, 0.95);
const geoFridgeHandle = new THREE.CylinderGeometry(0.015, 0.015, 0.8, 6);
const geoPendantCord = new THREE.CylinderGeometry(0.01, 0.01, 1.4, 6);
const geoPendantGlobe = new THREE.SphereGeometry(0.18, 12, 12);

// Bedroom Geometries
const geoBedBase = new THREE.BoxGeometry(2.5, 0.4, 2.2);
const geoBedMattress = new THREE.BoxGeometry(2.4, 0.35, 2.1);
const geoBedHeadboard = new THREE.BoxGeometry(2.6, 1.2, 0.2);
const geoPillow = new THREE.BoxGeometry(0.65, 0.16, 0.4);
const geoDuvet = new THREE.BoxGeometry(2.42, 0.12, 1.4);
const geoNightstand = new THREE.BoxGeometry(0.6, 0.45, 0.5);
const geoLampShade = new THREE.CylinderGeometry(0.14, 0.2, 0.25, 12);
const geoWardrobe = new THREE.BoxGeometry(0.6, 2.6, 3.2);

// Battlestation Geometries
const geoDeskTop = new THREE.BoxGeometry(2.4, 0.08, 1.0);
const geoDeskLeg = new THREE.BoxGeometry(0.06, 0.74, 0.9);
const geoMonitorScreen = new THREE.BoxGeometry(0.9, 0.45, 0.03);
const geoMonitorStand = new THREE.CylinderGeometry(0.03, 0.03, 0.25, 6);
const geoPcCase = new THREE.BoxGeometry(0.24, 0.48, 0.48);
const geoChairSeat = new THREE.BoxGeometry(0.55, 0.08, 0.55);
const geoChairBack = new THREE.BoxGeometry(0.52, 0.75, 0.08);

// Foyer Geometries
const geoEntranceDoor = new THREE.BoxGeometry(1.8, 2.5, 0.08);
const geoDoorHandle = new THREE.CylinderGeometry(0.02, 0.02, 0.35, 6);
const geoWelcomeMat = new THREE.BoxGeometry(1.4, 0.02, 0.9);
const geoDoorstepHalo = new THREE.RingGeometry(1.2, 1.6, 32);
const geoDoorstepDiamond = new THREE.OctahedronGeometry(0.4, 0);

// Shared Static Materials
const matFloorWood = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.38, metalness: 0.05 });
const matCeiling = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 });
const matWallBackSlat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.55 });
const matWallPlaster = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 });
const matDarkMetal = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.6 });
const matGoldBrass = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.25, metalness: 0.8 });
const matBalconyTile = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.6 });
const matGlassClear = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.35 });
const matSofaCharcoal = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
const matPillowGold = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.7 });
const matPillowTeal = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.7 });
const matMarbleIsland = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.22, metalness: 0.1 });
const matLeatherStool = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.45 });
const matFridgeStainless = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.25, metalness: 0.85 });
const matBedWood = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 });
const matBedSheet = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.75 });
const matBedDuvet = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
const matDeskCarbon = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3, metalness: 0.5 });
const matDoorWood = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.4 });
const matDoorstepHalo = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide });
const matExitHalo = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide });
const matWarmGlow = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfde047, emissiveIntensity: 2.5 });

export const HouseInterior: React.FC = () => {
  const isInsideHouse = useGameStore((s) => s.isInsideHouse);
  const isInsideShop = useGameStore((s) => s.isInsideShop);
  const activeTvChannel = useGameStore((s) => s.activeTvChannel);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const isNight = timeOfDay < 6.0 || timeOfDay > 19.0;

  const tvScreenRef = useRef<THREE.Mesh>(null);
  const doorstepRingRef = useRef<THREE.Mesh>(null);
  const doorstepDiamondRef = useRef<THREE.Mesh>(null);
  const exitRingRef = useRef<THREE.Mesh>(null);

  // TV Screen emissive material depending on active channel
  const tvMaterial = useMemo(() => {
    let color = 0xec4899;
    let emissive = 0xec4899;
    if (activeTvChannel === 0) {
      // Channel 0: Apex Grand Prix (Hot Pink & Magenta Neon)
      color = 0xec4899;
      emissive = 0xdb2777;
    } else if (activeTvChannel === 1) {
      // Channel 1: Cyberpunk Synthwave (Cyan & Electric Blue)
      color = 0x00f0ff;
      emissive = 0x0284c7;
    } else {
      // Channel 2: Sunset Horizon (Warm Amber & Gold)
      color = 0xf59e0b;
      emissive = 0xd97706;
    }
    return new THREE.MeshStandardMaterial({
      color,
      emissive,
      emissiveIntensity: 3.2,
      roughness: 0.2
    });
  }, [activeTvChannel]);

  // Global [H] key handler: Enter nearest house outside, Exit house inside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      const key = e.key.toLowerCase();

      // [H] to Enter / Exit House (strictly disabled when inside commercial shops)
      if (key === 'h') {
        const state = useGameStore.getState();
        if (state.isInsideShop) return;
        if (state.isInsideHouse) {
          state.exitHouse();
        } else {
          const px = state.mode === 'driving' ? vehiclePhysics.pos.x : playerPhysics.pos.x;
          const pz = state.mode === 'driving' ? vehiclePhysics.pos.z : playerPhysics.pos.z;
          const house = getNearestEnterableHouse(px, pz, 8.5);

          if (house) {
            state.enterHouse(house.id);
          } else {
            state.showNotification(
              'No House Nearby',
              'Walk up to the entrance of your Skyview Loft (or any residence) and press [H] to enter!',
              'info'
            );
          }
        }
        return;
      }

      // [E] Contextual Interactions inside the house
      if (key === 'e') {
        const state = useGameStore.getState();
        if (!state.isInsideHouse) return;

        const px = playerPhysics.pos.x;
        const pz = playerPhysics.pos.z;

        // 1. Front door exit trigger (Z < -5.0 and |X| < 2.5)
        if (pz < -5.0 && Math.abs(px) < 2.5) {
          state.exitHouse();
          return;
        }

        // 2. Chef's Refrigerator (X > 8.0 and Z < -1.5)
        if (px > 8.0 && pz < -1.5 && pz > -5.0) {
          state.eatFromFridge();
          return;
        }

        // 3. Mirrored Wardrobe Closet & Changing Room (X > 9.5 and Z > 3.0)
        if (px > 9.5 && pz > 3.0) {
          state.setActiveScreen('wardrobe');
          return;
        }

        // 4. King-Size Platform Bed (X between 4.5 and 9.5 and Z > 3.5)
        if (px > 4.5 && px <= 9.5 && pz > 3.5) {
          state.restInBed();
          return;
        }

        // 4. OLED TV / Living Room Sofa (X < 1.0 and Z > 0.0 and Z < 7.0)
        if (px < 1.0 && pz > 0.0 && pz < 7.0) {
          state.cycleTvChannel();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Frame animations: doorstep halo rotation, TV shimmer, exit marker
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const time = clock.getElapsedTime();

    if (doorstepRingRef.current) {
      doorstepRingRef.current.rotation.z += dt * 1.5;
    }
    if (doorstepDiamondRef.current) {
      doorstepDiamondRef.current.rotation.y += dt * 2.0;
      doorstepDiamondRef.current.position.y = 1.6 + Math.sin(time * 3.5) * 0.15;
    }
    if (exitRingRef.current) {
      exitRingRef.current.rotation.z -= dt * 1.8;
    }

    // Gentle TV screen light pulse
    if (tvScreenRef.current) {
      const mat = tvScreenRef.current.material as THREE.MeshStandardMaterial;
      if (mat && mat.emissiveIntensity) {
        mat.emissiveIntensity = 3.0 + Math.sin(time * 6.0) * 0.4;
      }
    }
  });

  const originY = INTERIOR_CONFIG.originY; // 120.0m elevation

  return (
    <group>
      {/* =========================================================================
          1. OUTDOOR DOORSTEP WELCOME MARKERS (Outside on the city streets)
          Visually indicates where players can press [H] to enter their home
      ========================================================================= */}
      {!isInsideHouse && !isInsideShop && (
        <group>
          {ENTERABLE_HOUSES.map((house) => (
            <group key={house.id} position={house.entrancePos}>
              {/* Rotating glowing doorstep halo on pavement */}
              <mesh
                ref={house.id === 'starter-loft' ? doorstepRingRef : undefined}
                position={[0, 0.04, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                geometry={geoDoorstepHalo}
                material={matDoorstepHalo}
              />
              {/* Floating holographic neon diamond */}
              <mesh
                ref={house.id === 'starter-loft' ? doorstepDiamondRef : undefined}
                position={[0, 1.6, 0]}
                geometry={geoDoorstepDiamond}
                material={matDoorstepHalo}
              />
              <pointLight color="#00f0ff" intensity={3.5} distance={7} position={[0, 1.2, 0]} />
            </group>
          ))}
        </group>
      )}

      {/* =========================================================================
          2. LUXURY HIGH-RISE INTERIOR STRUCTURE (At Y = 120m Sky Elevation)
          Full 3D Architecture, Furniture, Kitchen, Bedroom, TV, Battlestation & Balcony
      ========================================================================= */}
      {isInsideHouse && (
        <group position={[0, originY, 0]}>
        {/* Ambient Interior Point Lights */}
        <pointLight color="#fef08a" intensity={isNight ? 5.5 : 2.5} distance={16} position={[0, 3.8, 0]} />
        <pointLight color="#fed7aa" intensity={isNight ? 4.0 : 1.8} distance={12} position={[-4, 3.2, 3]} />
        <pointLight color="#fed7aa" intensity={isNight ? 4.0 : 1.8} distance={12} position={[7, 3.2, 5]} />
        <pointLight color="#00f0ff" intensity={isNight ? 3.5 : 1.2} distance={8} position={[-8.5, 1.8, -6]} />

        {/* Hardwood Parquet Floor */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={geoFloor} material={matFloorWood} receiveShadow />

        {/* Smooth Architectural Ceiling */}
        <mesh position={[0, 4.8, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={geoCeiling} material={matCeiling} />

        {/* North Wall: Dark Acoustic Slats & Entrance Foyer */}
        <mesh position={[0, 2.4, -9.0]} geometry={geoWallBack} material={matWallBackSlat} receiveShadow />

        {/* West Wall: Warm Greige Plaster with Cove Lighting */}
        <mesh position={[-12.0, 2.4, 0]} geometry={geoWallSide} material={matWallPlaster} receiveShadow />

        {/* East Wall: Textured Limestone Accent Wall */}
        <mesh position={[12.0, 2.4, 0]} geometry={geoWallSide} material={matWallPlaster} receiveShadow />

        {/* =======================================================================
            SOUTH WALL: FULL FLOOR-TO-CEILING PANORAMIC GLASS & SKYLINE BALCONY
        ======================================================================= */}
        {[-9, -3, 3, 9].map((gx, idx) => (
          <group key={idx} position={[gx, 2.4, 9.0]}>
            <mesh geometry={geoGlassPanel} material={matGlassClear} />
            <mesh position={[-2.9, 0, 0]} geometry={geoMullion} material={matDarkMetal} />
            <mesh position={[2.9, 0, 0]} geometry={geoMullion} material={matDarkMetal} />
          </group>
        ))}

        {/* Outdoor Balcony Terrace extending towards the horizon */}
        <mesh position={[0, 0.05, 11.0]} geometry={geoBalconyFloor} material={matBalconyTile} receiveShadow />
        <mesh position={[0, 0.65, 12.95]} geometry={geoBalconyGlassRail} material={matGlassClear} />
        <mesh position={[0, 1.22, 12.95]} geometry={geoBalconyRailCap} material={matDarkMetal} />

        {/* =======================================================================
            ZONE 1: FOYER & EXIT DOOR TO CITY
        ======================================================================= */}
        {/* Double Entrance Mahogany Doors */}
        <group position={[0, 1.25, -8.85]}>
          <mesh geometry={geoEntranceDoor} material={matDoorWood} />
          <mesh position={[-0.2, 0, 0.08]} rotation={[0, 0, Math.PI / 2]} geometry={geoDoorHandle} material={matGoldBrass} />
          <mesh position={[0.2, 0, 0.08]} rotation={[0, 0, Math.PI / 2]} geometry={geoDoorHandle} material={matGoldBrass} />
        </group>
        <mesh position={[0, 0.03, -7.6]} geometry={geoWelcomeMat} material={matWallBackSlat} />

        {/* Exit Doorstep Halo Indicator */}
        <mesh
          ref={exitRingRef}
          position={[0, 0.04, -6.8]}
          rotation={[-Math.PI / 2, 0, 0]}
          geometry={geoDoorstepHalo}
          material={matExitHalo}
        />

        {/* =======================================================================
            ZONE 2: GRAND LIVING ROOM LOUNGE & OLED SMART TV
        ======================================================================= */}
        {/* Geometric Soft Area Rug */}
        <mesh position={[-4.5, 0.02, 2.8]} rotation={[-Math.PI / 2, 0, 0]} geometry={geoRug} material={matWallPlaster} />

        {/* L-Shaped Sectional Sofa */}
        <group position={[-4.2, 0, 1.0]}>
          {/* Main Couch Base & Back */}
          <mesh position={[0, 0.25, 0]} geometry={geoSofaBase} material={matSofaCharcoal} castShadow />
          <mesh position={[0, 0.7, -0.45]} geometry={geoSofaBack} material={matSofaCharcoal} />
          {/* Chaise Lounge Extension */}
          <mesh position={[-1.3, 0.25, 1.2]} geometry={geoSofaChaise} material={matSofaCharcoal} />
          {/* Accent Throw Pillows */}
          <mesh position={[-1.2, 0.65, 0.4]} rotation={[0, 0.4, 0.2]} geometry={geoCushion} material={matPillowGold} />
          <mesh position={[1.2, 0.65, -0.2]} rotation={[0, -0.3, 0.1]} geometry={geoCushion} material={matPillowTeal} />
        </group>

        {/* Designer Smoked Glass Coffee Table */}
        <group position={[-4.0, 0, 3.0]}>
          <mesh position={[0, 0.4, 0]} geometry={geoCoffeeTableTop} material={matDarkMetal} castShadow />
          {[-0.9, 0.9].map((tx, i) =>
            [-0.35, 0.35].map((tz, j) => (
              <mesh key={`${i}-${j}`} position={[tx, 0.2, tz]} geometry={geoCoffeeTableLeg} material={matGoldBrass} />
            ))
          )}
        </group>

        {/* Arched Floor Lamp */}
        <group position={[-7.2, 0, 0.6]}>
          <mesh position={[0, 1.15, 0]} geometry={geoFloorLampPole} material={matGoldBrass} />
          <mesh position={[0.6, 2.2, 0.4]} geometry={geoFloorLampHead} material={matWarmGlow} />
          <pointLight color="#fed7aa" intensity={2.5} distance={5} position={[0.6, 2.2, 0.4]} />
        </group>

        {/* Feature Media Wall & 85" OLED Curved Smart TV */}
        <group position={[-4.0, 0, 7.0]}>
          <mesh position={[0, 2.2, 0.15]} geometry={geoTvBacking} material={matWallBackSlat} />
          <mesh position={[0, 0.3, -0.3]} geometry={geoTvConsole} material={matDarkMetal} />
          {/* Animated Glowing OLED TV Screen */}
          <mesh
            ref={tvScreenRef}
            position={[0, 2.2, -0.05]}
            geometry={geoTvScreen}
            material={tvMaterial}
          />
        </group>

        {/* =======================================================================
            ZONE 3: GOURMET CHEF'S KITCHEN & SMART REFRIGERATOR
        ======================================================================= */}
        {/* Calacatta Marble Waterfall Island */}
        <group position={[6.5, 0, -1.0]}>
          <mesh position={[0, 0.48, 0]} geometry={geoIsland} material={matMarbleIsland} castShadow />
          {/* Barstools */}
          {[-1.2, 0, 1.2].map((bx, idx) => (
            <group key={idx} position={[bx, 0, 1.1]}>
              <mesh position={[0, 0.72, 0]} geometry={geoBarstoolSeat} material={matLeatherStool} />
              <mesh position={[0, 0.36, 0]} geometry={geoBarstoolLeg} material={matDarkMetal} />
            </group>
          ))}
          {/* Overhead Glass Pendant Lights */}
          {[-1.2, 0, 1.2].map((px, idx) => (
            <group key={idx} position={[px, 4.8, 0]}>
              <mesh position={[0, -0.7, 0]} geometry={geoPendantCord} material={matDarkMetal} />
              <mesh position={[0, -1.4, 0]} geometry={geoPendantGlobe} material={matWarmGlow} />
              <pointLight color="#fed7aa" intensity={1.8} distance={4} position={[0, -1.4, 0]} />
            </group>
          ))}
        </group>

        {/* Stainless Steel French-Door Smart Refrigerator */}
        <group position={[10.4, 0, -3.4]}>
          <mesh position={[0, 1.05, 0]} geometry={geoFridge} material={matFridgeStainless} castShadow />
          <mesh position={[-0.2, 1.1, 0.52]} geometry={geoFridgeHandle} material={matDarkMetal} />
          <mesh position={[0.2, 1.1, 0.52]} geometry={geoFridgeHandle} material={matDarkMetal} />
          {/* Glowing Smart Screen on Refrigerator */}
          <mesh position={[0.3, 1.45, 0.5]} geometry={new THREE.PlaneGeometry(0.35, 0.45)} material={matDoorstepHalo} />
          <pointLight color="#00f0ff" intensity={1.5} distance={3} position={[0.3, 1.45, 0.7]} />
        </group>

        {/* =======================================================================
            ZONE 4: MASTER BEDROOM SUITE
        ======================================================================= */}
        <group position={[7.5, 0, 6.5]}>
          {/* Platform Bed Frame, Mattress & Linen Headboard */}
          <mesh position={[0, 0.2, 0]} geometry={geoBedBase} material={matBedWood} castShadow />
          <mesh position={[0, 0.45, 0]} geometry={geoBedMattress} material={matBedSheet} />
          <mesh position={[0, 0.9, 1.0]} geometry={geoBedHeadboard} material={matSofaCharcoal} />
          {/* Pillows & Duvet Runner */}
          <mesh position={[-0.65, 0.68, 0.75]} rotation={[-0.25, 0, 0]} geometry={geoPillow} material={matBedSheet} />
          <mesh position={[0.65, 0.68, 0.75]} rotation={[-0.25, 0, 0]} geometry={geoPillow} material={matBedSheet} />
          <mesh position={[0, 0.52, -0.2]} geometry={geoDuvet} material={matBedDuvet} />

          {/* Floating Nightstands & Bedside Lamps */}
          {[-1.6, 1.6].map((nx, idx) => (
            <group key={idx} position={[nx, 0, 0.9]}>
              <mesh position={[0, 0.25, 0]} geometry={geoNightstand} material={matBedWood} />
              <mesh position={[0, 0.65, 0]} geometry={geoLampShade} material={matWarmGlow} />
              <pointLight color="#fed7aa" intensity={2.0} distance={4} position={[0, 0.65, 0]} />
            </group>
          ))}
        </group>

        {/* Sliding Mirrored Wardrobe Closet */}
        <mesh position={[11.6, 1.3, 4.5]} geometry={geoWardrobe} material={matGlassClear} />

        {/* =======================================================================
            ZONE 5: EXECUTIVE BATTLESTATION & HOME OFFICE
        ======================================================================= */}
        <group position={[-8.5, 0, -6.5]}>
          {/* Carbon-Fiber Desk */}
          <mesh position={[0, 0.74, 0]} geometry={geoDeskTop} material={matDeskCarbon} castShadow />
          <mesh position={[-1.0, 0.37, 0]} geometry={geoDeskLeg} material={matDarkMetal} />
          <mesh position={[1.0, 0.37, 0]} geometry={geoDeskLeg} material={matDarkMetal} />

          {/* Dual Curved Ultrawide Monitors */}
          <group position={[-0.45, 1.05, 0.15]} rotation={[0, 0.18, 0]}>
            <mesh geometry={geoMonitorScreen} material={matDoorstepHalo} />
            <mesh position={[0, -0.18, 0]} geometry={geoMonitorStand} material={matDarkMetal} />
          </group>
          <group position={[0.45, 1.05, 0.15]} rotation={[0, -0.18, 0]}>
            <mesh geometry={geoMonitorScreen} material={matExitHalo} />
            <mesh position={[0, -0.18, 0]} geometry={geoMonitorStand} material={matDarkMetal} />
          </group>

          {/* Custom RGB Gaming PC Tower */}
          <mesh position={[0.95, 1.02, 0.1]} geometry={geoPcCase} material={matDarkMetal} />
          <pointLight color="#ec4899" intensity={2.0} distance={2.5} position={[0.95, 1.02, 0.3]} />

          {/* Gaming Bucket Chair */}
          <group position={[0, 0, -0.7]}>
            <mesh position={[0, 0.48, 0]} geometry={geoChairSeat} material={matDarkMetal} />
            <mesh position={[0, 0.9, -0.22]} geometry={geoChairBack} material={matSofaCharcoal} />
          </group>
        </group>
      </group>
      )}
    </group>
  );
};

