import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import { CITY_SHOPS } from '../../data/shopsData';

// =========================================================================
// STATIC CACHED GEOMETRIES (Allocated once at module load, zero runtime GC)
// =========================================================================
const geoFloor = new THREE.PlaneGeometry(18, 16);
const geoCeiling = new THREE.PlaneGeometry(18, 16);
const geoWallBack = new THREE.BoxGeometry(18, 4.8, 0.3);
const geoWallSide = new THREE.BoxGeometry(0.3, 4.8, 16);
const geoWallTrim = new THREE.BoxGeometry(18.2, 0.25, 0.35);
const geoStoreSignBoard = new THREE.BoxGeometry(12.0, 1.4, 0.2);

// Entrance & Doors
const geoExitDoorFrame = new THREE.BoxGeometry(2.8, 3.2, 0.2);
const geoExitDoorGlass = new THREE.BoxGeometry(2.5, 2.9, 0.12);
const geoExitSign = new THREE.BoxGeometry(1.6, 0.45, 0.12);
const geoExitFloorRing = new THREE.RingGeometry(1.2, 1.6, 32);

// Checkout Counter & Cashier Station
const geoCounterMain = new THREE.BoxGeometry(4.5, 1.05, 1.4);
const geoCounterTop = new THREE.BoxGeometry(4.6, 0.08, 1.5);
const geoPosTerminal = new THREE.BoxGeometry(0.5, 0.4, 0.4);
const geoRegisterScreen = new THREE.BoxGeometry(0.4, 0.3, 0.04);
const geoCounterFloorHalo = new THREE.RingGeometry(1.4, 1.8, 32);
const geoScannerPole = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8);

// 3D Cashier / Store Clerk NPC
const geoNpcHead = new THREE.SphereGeometry(0.18, 16, 16);
const geoNpcCap = new THREE.BoxGeometry(0.34, 0.10, 0.34);
const geoNpcVisor = new THREE.BoxGeometry(0.26, 0.02, 0.14);
const geoNpcTorso = new THREE.BoxGeometry(0.48, 0.70, 0.28);
const geoNpcApron = new THREE.BoxGeometry(0.49, 0.55, 0.29);
const geoNpcArm = new THREE.BoxGeometry(0.13, 0.60, 0.13);
const geoNpcBadgePlate = new THREE.BoxGeometry(2.8, 0.5, 0.08);

// Shelves & Commercial Aisle Displays
const geoAisleShelf = new THREE.BoxGeometry(5.2, 2.2, 1.0);
const geoShelfLedge = new THREE.BoxGeometry(5.1, 0.06, 0.9);
const geoCoolerCabinet = new THREE.BoxGeometry(3.6, 2.8, 1.1);
const geoCoolerGlass = new THREE.BoxGeometry(3.4, 2.5, 0.08);

// Merchandise Items (Produce, Medicine, Tech, Weights, Food)
const geoProduceCrate = new THREE.BoxGeometry(1.3, 0.4, 0.85);
const geoFruitApple = new THREE.SphereGeometry(0.12, 8, 8);
const geoFruitOrange = new THREE.SphereGeometry(0.14, 8, 8);
const geoBottleMed = new THREE.CylinderGeometry(0.08, 0.08, 0.25, 8);
const geoBoxBandage = new THREE.BoxGeometry(0.24, 0.15, 0.18);
const geoLaptop = new THREE.BoxGeometry(0.42, 0.03, 0.3);
const geoLaptopScreen = new THREE.BoxGeometry(0.42, 0.28, 0.02);
const geoGymDumbbell = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
const geoGymPlate = new THREE.CylinderGeometry(0.18, 0.18, 0.06, 12);
const geoDiningTable = new THREE.CylinderGeometry(0.8, 0.8, 0.08, 16);
const geoTablePedestal = new THREE.CylinderGeometry(0.05, 0.06, 0.72, 8);
const geoDiningChair = new THREE.BoxGeometry(0.5, 0.6, 0.5);

// Shared High-Contrast Modern Commercial Materials
const matFloorTile = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.25, metalness: 0.25 });
const matCeilingGrid = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
const matWallPlaster = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
const matDarkTrim = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.7 });
const matMarbleCounter = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.15, metalness: 0.2 });
const matOakWood = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.55 });
const matGlassClear = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, transparent: true, opacity: 0.55 });
const matExitGreen = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 3.5 });
const matExitRing = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
const matHaloCyan = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
const matMetalChrome = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.2, metalness: 0.9 });
const matFruitRed = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
const matFruitOrange = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 });
const matCoolerBlue = new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0369a1, emissiveIntensity: 1.8 });
const matScreenGlow = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 2.5 });
const matSkin = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.5 });
const matClerkDark = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });

export const ShopInterior: React.FC = () => {
  const isInsideShop = useGameStore((s) => s.isInsideShop);
  const activeShopInteriorId = useGameStore((s) => s.activeShopInteriorId);
  const openShop = useGameStore((s) => s.openShop);
  const exitShopInterior = useGameStore((s) => s.exitShopInterior);

  const exitRingRef = useRef<THREE.Mesh>(null);
  const counterHaloRef = useRef<THREE.Mesh>(null);
  const cashierBadgeRef = useRef<THREE.Group>(null);

  // Active Shop Metadata
  const currentShop = useMemo(
    () => CITY_SHOPS.find((s) => s.id === activeShopInteriorId) || CITY_SHOPS[0],
    [activeShopInteriorId]
  );

  // Theme Accent Material
  const matThemeAccent = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: currentShop.accentColor,
        emissive: currentShop.accentColor,
        emissiveIntensity: 2.2,
        roughness: 0.35
      }),
    [currentShop.accentColor]
  );

  const matUniformApron = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: currentShop.accentColor,
        roughness: 0.65
      }),
    [currentShop.accentColor]
  );

  // Rotate door & counter indicator rings & pulse badge
  useFrame(({ clock }, delta) => {
    if (!isInsideShop) return;
    const dt = Math.min(delta, 0.05);
    if (exitRingRef.current) exitRingRef.current.rotation.z += dt * 1.5;
    if (counterHaloRef.current) counterHaloRef.current.rotation.z += dt * 1.2;
    if (cashierBadgeRef.current) {
      cashierBadgeRef.current.position.y = 2.45 + Math.sin(clock.getElapsedTime() * 3.0) * 0.06;
    }
  });

  if (!isInsideShop) return null;

  const handleBuyClick = (e: any) => {
    e.stopPropagation();
    openShop(currentShop.id);
  };

  return (
    <group position={[0, 200.0, 0]}>
      {/* ===================================================================
          1. ROOM STRUCTURE & AMBIENT INTERIOR LIGHTING (High Contrast)
      =================================================================== */}
      {/* Floor (18m x 16m) at Y = 0 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={geoFloor} material={matFloorTile} receiveShadow />

      {/* Ceiling (Y = 4.8m) */}
      <mesh position={[0, 4.8, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={geoCeiling} material={matCeilingGrid} />

      {/* Back Wall (Z = +7.9) with Store Marquee Brand Signboard */}
      <mesh position={[0, 2.4, 7.9]} geometry={geoWallBack} material={matWallPlaster} castShadow receiveShadow />
      <mesh position={[0, 4.6, 7.75]} geometry={geoWallTrim} material={matThemeAccent} />
      {/* Giant Luminous Store Neon Marquee on Back Wall */}
      <group position={[0, 3.8, 7.72]} onClick={handleBuyClick}>
        <mesh geometry={geoStoreSignBoard} material={matDarkTrim} />
        <mesh position={[0, 0, 0.08]} geometry={geoStoreSignBoard} material={matThemeAccent} scale={[0.96, 0.8, 0.5]} />
      </group>

      {/* Front Entrance Wall (Z = -7.9) */}
      <mesh position={[0, 2.4, -7.9]} geometry={geoWallBack} material={matWallPlaster} castShadow receiveShadow />
      <mesh position={[0, 4.6, -7.75]} geometry={geoWallTrim} material={matThemeAccent} />

      {/* Left Wall (X = -8.9) */}
      <mesh position={[-8.9, 2.4, 0]} geometry={geoWallSide} material={matWallPlaster} castShadow receiveShadow />

      {/* Right Wall (X = +8.9) */}
      <mesh position={[8.9, 2.4, 0]} geometry={geoWallSide} material={matWallPlaster} castShadow receiveShadow />

      {/* Warm Ambient & Spotlights (Controlled intensity to prevent blowout) */}
      <ambientLight intensity={0.65} />
      <pointLight position={[0, 4.2, 0]} intensity={1.8} distance={20} color="#ffffff" />
      <pointLight position={[-4.5, 3.8, 2.0]} intensity={2.5} distance={12} color={currentShop.accentColor} />
      <pointLight position={[3.5, 3.8, -1.0]} intensity={1.8} distance={14} color="#fef08a" />

      {/* ===================================================================
          2. FRONT ENTRANCE / EXIT DOOR (Z = -7.6)
      =================================================================== */}
      <group position={[0, 0, -7.6]}>
        {/* Double Glass Doors */}
        <mesh position={[0, 1.6, 0]} geometry={geoExitDoorFrame} material={matDarkTrim} onClick={exitShopInterior} />
        <mesh position={[0, 1.5, 0]} geometry={geoExitDoorGlass} material={matGlassClear} onClick={exitShopInterior} />

        {/* Luminous Green EXIT Sign above doorway */}
        <mesh position={[0, 3.4, 0.1]} geometry={geoExitSign} material={matExitGreen} />

        {/* Glowing Interactive Exit Halo Portal on Floor */}
        <mesh
          ref={exitRingRef}
          position={[0, 0.03, 1.0]}
          rotation={[-Math.PI / 2, 0, 0]}
          geometry={geoExitFloorRing}
          material={matExitRing}
          onClick={exitShopInterior}
        />
      </group>

      {/* ===================================================================
          3. CHECKOUT COUNTER & 3D CASHIER / STORE CLERK NPC
      =================================================================== */}
      {/* Checkout Counter Base & POS Station */}
      <group position={[-4.5, 0, 2.0]} onClick={handleBuyClick}>
        <mesh position={[0, 0.52, 0]} geometry={geoCounterMain} material={matDarkTrim} castShadow receiveShadow />
        <mesh position={[0, 1.08, 0]} geometry={geoCounterTop} material={matMarbleCounter} />

        {/* Touchscreen Cash Register & POS Terminal */}
        <mesh position={[-0.8, 1.25, 0.1]} geometry={geoPosTerminal} material={matDarkTrim} />
        <mesh position={[-0.8, 1.35, 0.18]} rotation={[-0.3, 0, 0]} geometry={geoRegisterScreen} material={matScreenGlow} />

        {/* Barcode Scanner Stand */}
        <mesh position={[0.8, 1.3, 0]} geometry={geoScannerPole} material={matMetalChrome} />

        {/* Cashier Welcome Floor Halo (Click to open purchase modal) */}
        <mesh
          ref={counterHaloRef}
          position={[0, 0.03, 1.6]}
          rotation={[-Math.PI / 2, 0, 0]}
          geometry={geoCounterFloorHalo}
          material={matHaloCyan}
          onClick={handleBuyClick}
        />
      </group>

      {/* Friendly 3D Shopkeeper / Cashier NPC standing behind counter */}
      <group position={[-4.5, 0, 0.8]} onClick={handleBuyClick}>
        {/* Legs / Slacks */}
        <mesh position={[-0.12, 0.45, 0]} geometry={geoNpcArm} material={matClerkDark} scale={[1, 1.5, 1]} />
        <mesh position={[0.12, 0.45, 0]} geometry={geoNpcArm} material={matClerkDark} scale={[1, 1.5, 1]} />

        {/* Torso & Uniform Apron */}
        <mesh position={[0, 1.15, 0]} geometry={geoNpcTorso} material={matClerkDark} />
        <mesh position={[0, 1.12, 0.02]} geometry={geoNpcApron} material={matUniformApron} />

        {/* Arms resting on counter */}
        <mesh position={[-0.32, 1.15, 0.12]} rotation={[0.4, 0, -0.1]} geometry={geoNpcArm} material={matClerkDark} />
        <mesh position={[0.32, 1.15, 0.12]} rotation={[0.4, 0, 0.1]} geometry={geoNpcArm} material={matClerkDark} />

        {/* Head & Uniform Cap */}
        <mesh position={[0, 1.68, 0]} geometry={geoNpcHead} material={matSkin} />
        <mesh position={[0, 1.82, -0.01]} geometry={geoNpcCap} material={matUniformApron} />
        <mesh position={[0, 1.77, 0.18]} rotation={[-0.1, 0, 0]} geometry={geoNpcVisor} material={matUniformApron} />

        {/* Floating Animated 3D Neon Badge above Cashier */}
        <group ref={cashierBadgeRef} position={[0, 2.45, 0]}>
          <mesh geometry={geoNpcBadgePlate} material={matDarkTrim} />
          <mesh position={[0, 0, 0.05]} geometry={geoNpcBadgePlate} material={matThemeAccent} scale={[0.96, 0.85, 0.5]} />
        </group>
      </group>

      {/* ===================================================================
          4. STORE-SPECIFIC MERCHANDISE DISPLAYS & AISLE FIXTURES
      =================================================================== */}

      {/* A. VEGETABLE & ORGANIC PRODUCE MARKET */}
      {currentShop.type === 'vegetable' && (
        <group onClick={handleBuyClick}>
          {/* Central Produce Islands */}
          {[-1.8, 2.8].map((posX, i) => (
            <group key={i} position={[posX, 0, -1.0]}>
              <mesh position={[0, 0.5, 0]} geometry={geoAisleShelf} material={matOakWood} castShadow />
              {[-1.8, 0, 1.8].map((ox, j) => (
                <group key={j} position={[ox, 1.1, 0]}>
                  <mesh geometry={geoProduceCrate} material={matOakWood} />
                  <mesh position={[-0.2, 0.25, 0]} geometry={geoFruitApple} material={matFruitRed} />
                  <mesh position={[0.2, 0.25, 0]} geometry={geoFruitOrange} material={matFruitOrange} />
                </group>
              ))}
            </group>
          ))}
          {/* Wall-mounted Fresh Produce Cooler Display */}
          <group position={[7.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <mesh position={[0, 1.4, 0]} geometry={geoCoolerCabinet} material={matDarkTrim} />
            <mesh position={[0, 1.4, 0.5]} geometry={geoCoolerGlass} material={matGlassClear} />
            <pointLight position={[0, 1.5, 0.2]} intensity={2.0} distance={5} color="#22c55e" />
          </group>
        </group>
      )}

      {/* B. 24/7 FITNESS CLUB & GYM */}
      {currentShop.type === 'gym' && (
        <group onClick={handleBuyClick}>
          {/* Dumbbell & Weight Racks */}
          <group position={[2.5, 0, -1.0]}>
            <mesh position={[0, 0.7, 0]} geometry={geoAisleShelf} material={matDarkTrim} />
            {[-1.5, 0, 1.5].map((wx, i) => (
              <group key={i} position={[wx, 1.2, 0]}>
                <mesh geometry={geoGymDumbbell} material={matMetalChrome} />
                <mesh position={[-0.22, 0, 0]} rotation={[0, 0, Math.PI / 2]} geometry={geoGymPlate} material={matDarkTrim} />
                <mesh position={[0.22, 0, 0]} rotation={[0, 0, Math.PI / 2]} geometry={geoGymPlate} material={matDarkTrim} />
              </group>
            ))}
          </group>
          {/* Protein Shake & Energy Drinks Cooler */}
          <group position={[7.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <mesh position={[0, 1.4, 0]} geometry={geoCoolerCabinet} material={matDarkTrim} />
            <mesh position={[0, 1.4, 0.5]} geometry={geoCoolerGlass} material={matGlassClear} />
            <pointLight position={[0, 1.5, 0.2]} intensity={2.5} distance={5} color="#eab308" />
          </group>
        </group>
      )}

      {/* C. CLINICAL PHARMACY & HOSPITAL */}
      {(currentShop.type === 'pharmacy' || currentShop.type === 'hospital') && (
        <group onClick={handleBuyClick}>
          {/* Medical Grade Display Aisles */}
          <group position={[2.5, 0, -1.0]}>
            <mesh position={[0, 1.1, 0]} geometry={geoAisleShelf} material={matMarbleCounter} />
            {[-1.5, 0, 1.5].map((mx, i) => (
              <group key={i} position={[mx, 1.3, 0]}>
                <mesh position={[-0.25, 0, 0]} geometry={geoBottleMed} material={matCoolerBlue} />
                <mesh position={[0.25, 0, 0]} geometry={geoBoxBandage} material={matFruitRed} />
              </group>
            ))}
          </group>
          {/* Emergency Cold-Storage Trauma Cabinet */}
          <group position={[7.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <mesh position={[0, 1.4, 0]} geometry={geoCoolerCabinet} material={matMarbleCounter} />
            <mesh position={[0, 1.4, 0.5]} geometry={geoCoolerGlass} material={matGlassClear} />
            <pointLight position={[0, 1.5, 0.2]} intensity={3.0} distance={6} color="#06b6d4" />
          </group>
        </group>
      )}

      {/* D. CAFE, PIZZA, BURGER & RESTAURANT */}
      {(currentShop.type === 'cafe' || currentShop.type === 'pizza' || currentShop.type === 'burger' || currentShop.type === 'restaurant') && (
        <group onClick={handleBuyClick}>
          {/* Indoor Dining Booths & Tables */}
          {[1.5, 5.2].map((tx, i) => (
            <group key={i} position={[tx, 0, -1.0]}>
              <mesh position={[0, 0.74, 0]} geometry={geoDiningTable} material={matOakWood} />
              <mesh position={[0, 0.36, 0]} geometry={geoTablePedestal} material={matDarkTrim} />
              <mesh position={[-0.8, 0.45, 0]} geometry={geoDiningChair} material={matDarkTrim} />
              <mesh position={[0.8, 0.45, 0]} geometry={geoDiningChair} material={matDarkTrim} />
            </group>
          ))}
          {/* Warm Pastry & Food Service Warmer */}
          <group position={[7.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <mesh position={[0, 1.4, 0]} geometry={geoCoolerCabinet} material={matOakWood} />
            <mesh position={[0, 1.4, 0.5]} geometry={geoCoolerGlass} material={matGlassClear} />
            <pointLight position={[0, 1.5, 0.2]} intensity={2.5} distance={5} color="#f59e0b" />
          </group>
        </group>
      )}

      {/* E. ELECTRONICS, MALL & POLICE/SCHOOL */}
      {(currentShop.type === 'electronics' || currentShop.type === 'mall' || currentShop.type === 'police' || currentShop.type === 'school') && (
        <group onClick={handleBuyClick}>
          {/* Sleek Minimalist Tech Showroom Table */}
          <group position={[2.5, 0, -1.0]}>
            <mesh position={[0, 0.9, 0]} geometry={geoAisleShelf} material={matDarkTrim} />
            {[-1.5, 0, 1.5].map((lx, i) => (
              <group key={i} position={[lx, 1.15, 0]}>
                <mesh geometry={geoLaptop} material={matDarkTrim} />
                <mesh position={[0, 0.14, -0.15]} rotation={[-0.3, 0, 0]} geometry={geoLaptopScreen} material={matScreenGlow} />
              </group>
            ))}
          </group>
          {/* Neon Showcase Wall Cabinet */}
          <group position={[7.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <mesh position={[0, 1.4, 0]} geometry={geoCoolerCabinet} material={matDarkTrim} />
            <mesh position={[0, 1.4, 0.5]} geometry={geoCoolerGlass} material={matGlassClear} />
            <pointLight position={[0, 1.5, 0.2]} intensity={3.0} distance={6} color="#a855f7" />
          </group>
        </group>
      )}
    </group>
  );
};
