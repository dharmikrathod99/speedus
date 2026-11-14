import React, { useMemo } from 'react';
import * as THREE from 'three';

// =========================================================================
// STATIC CACHED GEOMETRIES (Allocated once at module load, zero GC runtime)
// =========================================================================

// --- Suburban House Geometries ---
const geoSuburbanWall = new THREE.BoxGeometry(16, 7.5, 14);
const geoRoofPitch = new THREE.ConeGeometry(12.5, 4.6, 4);
const geoRoofFascia = new THREE.BoxGeometry(16.5, 0.35, 14.5);

// Doors & Entrances
const geoDoorFrame = new THREE.BoxGeometry(1.8, 2.65, 0.2);
const geoDoorPanel = new THREE.BoxGeometry(1.48, 2.45, 0.12);
const geoDoorHandle = new THREE.BoxGeometry(0.06, 0.24, 0.12);
const geoDoorGlassInset = new THREE.BoxGeometry(0.9, 0.55, 0.08);

// Porch, Steps & Access Ramp
const geoPorchStep = new THREE.BoxGeometry(3.2, 0.3, 1.8);
const geoPorchLowerStep = new THREE.BoxGeometry(3.6, 0.16, 0.8);
const geoPorchPillar = new THREE.BoxGeometry(0.22, 2.7, 0.22);
const geoPorchRoof = new THREE.BoxGeometry(3.4, 0.32, 2.1);
const geoPorchLightBracket = new THREE.BoxGeometry(0.12, 0.12, 0.18);
const geoPorchLantern = new THREE.BoxGeometry(0.2, 0.28, 0.2);
const geoRampDeck = new THREE.BoxGeometry(1.2, 0.12, 2.4);
const geoRampHandrail = new THREE.CylinderGeometry(0.025, 0.025, 2.45, 6);
const geoRampPost = new THREE.CylinderGeometry(0.025, 0.025, 0.85, 6);

// Stunt Ramp Geometries
const geoStuntDeck = new THREE.BoxGeometry(4.0, 0.22, 8.0);
const geoStuntStripe = new THREE.BoxGeometry(0.25, 0.24, 8.0);
const geoStuntLeg = new THREE.CylinderGeometry(0.12, 0.14, 2.6, 6);
const geoStuntCross = new THREE.CylinderGeometry(0.06, 0.06, 4.2, 6);
const geoStuntSign = new THREE.BoxGeometry(4.2, 0.6, 0.2);

// Windows, Frames & Trim
const geoWindowLargeFrame = new THREE.BoxGeometry(2.6, 2.0, 0.2);
const geoWindowLargeGlass = new THREE.BoxGeometry(2.3, 1.7, 0.12);
const geoWindowCrossV = new THREE.BoxGeometry(0.08, 1.7, 0.16);
const geoWindowCrossH = new THREE.BoxGeometry(2.3, 0.08, 0.16);
const geoWindowSill = new THREE.BoxGeometry(2.8, 0.12, 0.28);
const geoShutter = new THREE.BoxGeometry(0.5, 1.9, 0.08);

const geoWindowMedFrame = new THREE.BoxGeometry(2.0, 1.8, 0.2);
const geoWindowMedGlass = new THREE.BoxGeometry(1.7, 1.5, 0.12);
const geoWindowMedCrossV = new THREE.BoxGeometry(0.08, 1.5, 0.16);
const geoWindowMedCrossH = new THREE.BoxGeometry(1.7, 0.08, 0.16);
const geoWindowMedSill = new THREE.BoxGeometry(2.2, 0.12, 0.28);

const geoWindowSmallFrame = new THREE.BoxGeometry(1.5, 1.5, 0.2);
const geoWindowSmallGlass = new THREE.BoxGeometry(1.25, 1.25, 0.12);

// Garage
const geoGarageFrame = new THREE.BoxGeometry(4.9, 3.2, 0.2);
const geoGarageDoor = new THREE.BoxGeometry(4.6, 2.95, 0.12);
const geoGarageSlat = new THREE.BoxGeometry(4.55, 0.04, 0.14);
const geoGarageGlassRow = new THREE.BoxGeometry(4.3, 0.32, 0.14);
const geoDriveway = new THREE.BoxGeometry(5.2, 0.05, 5.2);

// Backyard Patio Sliding Door
const geoPatioDoorFrame = new THREE.BoxGeometry(2.8, 2.5, 0.2);
const geoPatioDoorGlass = new THREE.BoxGeometry(2.5, 2.2, 0.12);
const geoPatioDoorMullion = new THREE.BoxGeometry(0.08, 2.2, 0.15);

// Chimney
const geoChimney = new THREE.BoxGeometry(1.4, 5.4, 1.4);
const geoChimneyCap = new THREE.BoxGeometry(1.7, 0.22, 1.7);
const geoChimneyPot = new THREE.CylinderGeometry(0.18, 0.18, 0.55, 8);

// --- Luxury Villa Geometries ---
const geoVillaMain = new THREE.BoxGeometry(18, 9, 16);
const geoVillaPivotDoor = new THREE.BoxGeometry(2.2, 3.4, 0.15);
const geoVillaPivotHandle = new THREE.BoxGeometry(0.08, 1.6, 0.1);
const geoVillaCurtainFrame = new THREE.BoxGeometry(6.6, 3.8, 0.2);
const geoVillaCurtainGlass = new THREE.BoxGeometry(6.3, 3.5, 0.14);
const geoVillaBalconyBase = new THREE.BoxGeometry(16.0, 0.35, 2.6);
const geoVillaGlassRail = new THREE.BoxGeometry(16.0, 1.05, 0.06);
const geoVillaRailTop = new THREE.BoxGeometry(16.1, 0.08, 0.12);
const geoVillaSlidingDoorFrame = new THREE.BoxGeometry(5.4, 3.0, 0.2);
const geoVillaSlidingDoorGlass = new THREE.BoxGeometry(5.1, 2.7, 0.14);
const geoVillaRoofCanopy = new THREE.BoxGeometry(19.2, 0.45, 17.2);
const geoVillaAccentStrip = new THREE.BoxGeometry(18.2, 0.15, 0.2);

// --- Starter Loft & Luxury Residence Geometries ---
const geoLoftMain = new THREE.BoxGeometry(18, 32, 18);
const geoLoftEntranceCanopy = new THREE.BoxGeometry(6.4, 0.35, 2.4);
const geoLoftEntranceSign = new THREE.BoxGeometry(5.8, 0.5, 0.1);
const geoLoftDoubleDoorFrame = new THREE.BoxGeometry(3.2, 3.1, 0.2);
const geoLoftDoubleDoorGlass = new THREE.BoxGeometry(2.9, 2.8, 0.14);
const geoLoftDoorPushBar = new THREE.BoxGeometry(1.1, 0.08, 0.12);
const geoLoftWindowBand = new THREE.BoxGeometry(18.2, 1.6, 18.2);
const geoLoftBalcony = new THREE.BoxGeometry(4.5, 0.25, 1.5);
const geoLoftBalconyRail = new THREE.BoxGeometry(4.5, 0.9, 0.06);

// Multi-Level Luxury Townhouse & Modern Residence Geometries
const geoResFloor1 = new THREE.BoxGeometry(18, 5.0, 16);
const geoResFloor2 = new THREE.BoxGeometry(18.6, 4.8, 16.6);
const geoResFloor3 = new THREE.BoxGeometry(16, 4.4, 14);
const geoResRoofPitch = new THREE.BoxGeometry(19.8, 0.5, 17.8);
const geoResRoofOverhang = new THREE.BoxGeometry(20.6, 0.25, 18.6);
const geoResWoodSoffit = new THREE.BoxGeometry(20.4, 0.08, 18.4);
const geoResBalconyLedge = new THREE.BoxGeometry(17.8, 0.35, 2.6);
const geoResBalconyGlass = new THREE.BoxGeometry(17.8, 1.05, 0.06);
const geoResBalconyRail = new THREE.BoxGeometry(17.9, 0.08, 0.12);
const geoResFrontDoorFrame = new THREE.BoxGeometry(3.2, 3.2, 0.22);
const geoResDoubleDoor = new THREE.BoxGeometry(2.9, 2.9, 0.14);
const geoResDoorHandleLong = new THREE.BoxGeometry(0.06, 1.4, 0.08);
const geoResHousePlaque = new THREE.BoxGeometry(1.6, 0.5, 0.05);
const geoResDrivewayPaved = new THREE.BoxGeometry(6.2, 0.05, 7.5);
const geoResGarageDoor = new THREE.BoxGeometry(5.6, 3.4, 0.14);
const geoResGarageGlass = new THREE.BoxGeometry(5.4, 0.38, 0.16);
const geoResWindowLgFrame = new THREE.BoxGeometry(4.2, 2.6, 0.18);
const geoResWindowLgGlass = new THREE.BoxGeometry(3.9, 2.3, 0.12);
const geoResWindowMullion = new THREE.BoxGeometry(0.08, 2.3, 0.15);
const geoResWindowSillLg = new THREE.BoxGeometry(4.4, 0.14, 0.28);
const geoResWindowMedFrame = new THREE.BoxGeometry(2.6, 2.2, 0.18);
const geoResWindowMedGlass = new THREE.BoxGeometry(2.3, 1.9, 0.12);
const geoResWindowMedSill = new THREE.BoxGeometry(2.8, 0.14, 0.28);
const geoResChimneyModern = new THREE.BoxGeometry(1.6, 5.5, 1.6);
const geoResEntranceHalo = new THREE.RingGeometry(1.4, 1.7, 24);
const geoResEntranceStep = new THREE.BoxGeometry(4.8, 0.25, 2.8);
const geoResEntranceStepLow = new THREE.BoxGeometry(5.2, 0.16, 1.2);
const geoResHedgeBlock = new THREE.BoxGeometry(4.5, 1.1, 0.8);
const geoResCypressTrunk = new THREE.CylinderGeometry(0.12, 0.18, 1.2, 8);
const geoResCypressFoliage = new THREE.ConeGeometry(0.75, 4.2, 8);
const geoResPergolaBeam = new THREE.BoxGeometry(6.4, 0.18, 0.18);
const geoResPergolaSlat = new THREE.BoxGeometry(0.12, 0.14, 4.8);
const geoResSolarPanel = new THREE.BoxGeometry(2.4, 0.06, 1.6);

// --- Dealership Geometries ---
const geoDealershipMain = new THREE.BoxGeometry(18, 8, 16);
const geoDealershipSign = new THREE.BoxGeometry(16, 1.4, 0.4);
const geoDealershipGlassWall = new THREE.BoxGeometry(16.4, 5.8, 0.2);
const geoDealershipDoorFrame = new THREE.BoxGeometry(3.0, 2.8, 0.22);
const geoDealershipDoorGlass = new THREE.BoxGeometry(2.7, 2.5, 0.16);

// --- Garage Geometries ---
const geoGarageMain = new THREE.BoxGeometry(18, 10, 18);
const geoGarageSign = new THREE.BoxGeometry(14, 1.4, 0.4);
const geoGarageBayDoorFrame = new THREE.BoxGeometry(5.8, 4.4, 0.2);
const geoGarageBayDoor = new THREE.BoxGeometry(5.5, 4.1, 0.14);
const geoGarageServiceDoorFrame = new THREE.BoxGeometry(1.8, 2.6, 0.2);
const geoGarageServiceDoor = new THREE.BoxGeometry(1.5, 2.4, 0.12);

// --- Warehouse Geometries ---
const geoWarehouseMain = new THREE.BoxGeometry(18, 9, 16);
const geoWarehouseDockDoor = new THREE.BoxGeometry(4.2, 4.2, 0.15);

// --- Skyscraper Geometries ---
const geoSkyscraperBase = new THREE.BoxGeometry(18, 28, 18);
const geoSkyscraperMid = new THREE.BoxGeometry(15, 26, 15);
const geoSkyscraperTop = new THREE.BoxGeometry(12, 24, 12);
const geoSkyscraperCrown = new THREE.BoxGeometry(9, 6, 9);
const geoHelipadPad = new THREE.CylinderGeometry(5.5, 5.5, 0.25, 24);
const geoHelipadRing = new THREE.RingGeometry(3.2, 3.6, 24);
const geoHelipadH1 = new THREE.BoxGeometry(0.5, 0.05, 3.2);
const geoHelipadH2 = new THREE.BoxGeometry(1.6, 0.05, 0.5);
const geoBeaconLight = new THREE.SphereGeometry(0.28, 8, 8);
const geoSpireMast = new THREE.CylinderGeometry(0.08, 0.35, 18, 8);
const geoFinVertical = new THREE.BoxGeometry(0.35, 78, 0.8);
const geoLobbyColonnade = new THREE.CylinderGeometry(0.35, 0.45, 7, 8);
const geoLobbyGlassWall = new THREE.BoxGeometry(17.4, 6.5, 0.2);
const geoBillboardScreen = new THREE.BoxGeometry(12.0, 6.0, 0.3);

// --- Gas Station Complex Geometries ---
const geoGasCanopy = new THREE.BoxGeometry(18, 1.2, 12);
const geoCanopyPillar = new THREE.CylinderGeometry(0.25, 0.25, 5.2, 10);
const geoPumpIsland = new THREE.BoxGeometry(1.4, 0.25, 8.0);
const geoGasPump = new THREE.BoxGeometry(0.8, 1.8, 0.8);
const geoPumpBollard = new THREE.CylinderGeometry(0.1, 0.1, 0.85, 8);
const geoMartBuilding = new THREE.BoxGeometry(16, 5.8, 9);
const geoMartGlassFront = new THREE.BoxGeometry(14.5, 3.8, 0.15);
const geoMartSign = new THREE.BoxGeometry(12, 1.1, 0.25);
const geoPriceTotem = new THREE.BoxGeometry(1.6, 7.5, 0.4);
const geoTotemScreen = new THREE.BoxGeometry(1.4, 2.8, 0.45);

// --- Commercial Plaza & Diner Geometries ---
const geoPlazaBuilding = new THREE.BoxGeometry(18, 7.5, 16);
const geoStoreAwning = new THREE.BoxGeometry(5.5, 0.35, 2.0);
const geoPatioTable = new THREE.CylinderGeometry(0.7, 0.7, 0.08, 12);
const geoPatioUmbrella = new THREE.ConeGeometry(1.8, 0.9, 12);
const geoPatioChair = new THREE.BoxGeometry(0.5, 0.6, 0.5);
const geoUmbrellaPole = new THREE.CylinderGeometry(0.04, 0.04, 2.2, 6);

// =========================================================================
// STATIC CACHED MATERIALS
// =========================================================================
const whiteTrimMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 });
const suburbanWallMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.6 });
const houseRoofMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.65 });
const doorMahoganyMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.45 });
const brassHandleMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.25, metalness: 0.85 });
const navyShutterMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
const porchStoneMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
const drivewayConcreteMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
const garageDoorMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.45, metalness: 0.25 });
const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.6 });
const chimneyBrickMat = new THREE.MeshStandardMaterial({ color: 0x852424, roughness: 0.9 });
const chimneyCapMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
const chimneyPotMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.75 });

const villaWallMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
const villaDarkAccentMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
const villaWoodDoorMat = new THREE.MeshStandardMaterial({ color: 0x3b1807, roughness: 0.4 });
const stainlessSteelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.95 });

const buildingSlateMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
const buildingLightMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4 });
const industrialDoorMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5, metalness: 0.5 });
const stuntDeckMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.5 });
const hazardYellowMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
const steelTrussMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.8 });
const helipadPadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
const helipadYellowMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
const beaconRedMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 4.5 });
const billboardPinkMat = new THREE.MeshStandardMaterial({ color: 0xff007f, emissive: 0xff007f, emissiveIntensity: 3.5 });
const billboardCyanMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 3.5 });
const pumpBodyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
const canopyWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
const umbrellaRedMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.6 });

// Semi-reflective architectural daytime glass
const daytimeGlassMat = new THREE.MeshStandardMaterial({
  color: 0x38bdf8,
  roughness: 0.15,
  metalness: 0.75,
  transparent: true,
  opacity: 0.82
});

const villaTemperedGlassMat = new THREE.MeshStandardMaterial({
  color: 0x0284c7,
  roughness: 0.1,
  metalness: 0.9,
  transparent: true,
  opacity: 0.65
});

const cedarWoodMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.5 });
const warmSandstoneMat = new THREE.MeshStandardMaterial({ color: 0xf5eedc, roughness: 0.65 });
const darkSlateRoofMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45 });
const hedgeBushMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
const greenEntranceHaloMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.85 });
const solarPanelMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.2, metalness: 0.8 });
const warmPlaqueMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });

interface HouseProps {
  isNight: boolean;
}

// =========================================================================
// 1. SUBURBAN HOUSE (With Doors, Porch, Windows, Garage, Chimney)
// =========================================================================
export const SuburbanHouse: React.FC<HouseProps> = React.memo(({ isNight }) => {
  // Warm glowing interior illumination at night vs crisp sky reflections during the day
  const windowMaterial = useMemo(
    () =>
      isNight
        ? new THREE.MeshStandardMaterial({
            color: 0xfef08a,
            emissive: 0xfde047,
            emissiveIntensity: 2.8,
            roughness: 0.2
          })
        : daytimeGlassMat,
    [isNight]
  );

  const porchLanternMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xfde047,
        emissiveIntensity: isNight ? 3.5 : 1.0
      }),
    [isNight]
  );

  return (
    <group>
      {/* --- Main Suburban House Core Body (16m wide x 7.5m high x 14m deep) --- */}
      <mesh position={[0, 3.75, 0]} geometry={geoSuburbanWall} material={suburbanWallMat} castShadow receiveShadow />

      {/* --- Roof & Fascia --- */}
      <mesh position={[0, 9.6, 0]} rotation={[0, Math.PI / 4, 0]} geometry={geoRoofPitch} material={houseRoofMat} castShadow />
      <mesh position={[0, 7.6, 0]} geometry={geoRoofFascia} material={whiteTrimMat} />

      {/* ===================================================================
          FRONT FACADE (Z = -7.0, facing street towards -Z)
      =================================================================== */}

      {/* --- 1. Front Entrance Porch & Main Door --- */}
      <group position={[-2.0, 0, -7.0]}>
        {/* Raised Porch Steps */}
        <mesh position={[0, 0.15, -0.8]} geometry={geoPorchStep} material={porchStoneMat} receiveShadow />
        <mesh position={[0, 0.08, -1.6]} geometry={geoPorchLowerStep} material={porchStoneMat} receiveShadow />

        {/* Front Porch Access Ramp (Smooth Incline Deck & Handrail) */}
        <group position={[-2.1, 0, -1.2]}>
          <mesh
            position={[0, 0.14, 0]}
            rotation={[Math.atan2(0.28, 2.4), 0, 0]}
            geometry={geoRampDeck}
            material={porchStoneMat}
            receiveShadow
          />
          {/* Ramp Safety Handrails */}
          <mesh
            position={[-0.55, 0.62, 0]}
            rotation={[Math.atan2(0.28, 2.4), 0, 0]}
            geometry={geoRampHandrail}
            material={whiteTrimMat}
          />
          <mesh position={[-0.55, 0.42, -0.9]} geometry={geoRampPost} material={whiteTrimMat} />
          <mesh position={[-0.55, 0.58, 0.9]} geometry={geoRampPost} material={whiteTrimMat} />
        </group>

        {/* Porch Columns / Pillars */}
        <mesh position={[-1.3, 1.65, -1.2]} geometry={geoPorchPillar} material={whiteTrimMat} />
        <mesh position={[1.3, 1.65, -1.2]} geometry={geoPorchPillar} material={whiteTrimMat} />

        {/* Porch Canopy Roof */}
        <mesh position={[0, 3.15, -0.9]} geometry={geoPorchRoof} material={houseRoofMat} />
        <mesh position={[0, 3.0, -0.9]} geometry={geoPorchRoof} material={whiteTrimMat} scale={[1.02, 0.3, 1.02]} />

        {/* Door Frame (Crisp White) */}
        <mesh position={[0, 1.35, -0.02]} geometry={geoDoorFrame} material={whiteTrimMat} />

        {/* Front Door Panel (Rich Mahogany Wood) */}
        <mesh position={[0, 1.3, -0.06]} geometry={geoDoorPanel} material={doorMahoganyMat} />

        {/* Door Upper Glass Transom */}
        <mesh position={[0, 1.95, -0.09]} geometry={geoDoorGlassInset} material={windowMaterial} />

        {/* Polished Brass Door Handle */}
        <mesh position={[0.55, 1.25, -0.12]} geometry={geoDoorHandle} material={brassHandleMat} />

        {/* Porch Wall Lantern */}
        <mesh position={[1.2, 2.1, -0.08]} geometry={geoPorchLightBracket} material={darkMetalMat} />
        <mesh position={[1.2, 2.05, -0.18]} geometry={geoPorchLantern} material={porchLanternMat} />
      </group>

      {/* --- 2. Attached Suburban Garage & Driveway --- */}
      <group position={[4.2, 0, -7.0]}>
        {/* Driveway Concrete Slab leading to road */}
        <mesh position={[0, 0.03, -2.7]} geometry={geoDriveway} material={drivewayConcreteMat} receiveShadow />

        {/* Garage Door Frame */}
        <mesh position={[0, 1.6, -0.02]} geometry={geoGarageFrame} material={whiteTrimMat} />

        {/* Garage Sectional Door */}
        <mesh position={[0, 1.55, -0.06]} geometry={geoGarageDoor} material={garageDoorMat} />

        {/* Garage Horizontal Panel Slat Lines */}
        {[0.75, 1.5, 2.25].map((yOff, i) => (
          <mesh key={i} position={[0, yOff, -0.08]} geometry={geoGarageSlat} material={darkMetalMat} />
        ))}

        {/* Garage Top Window Row */}
        <mesh position={[0, 2.65, -0.08]} geometry={geoGarageGlassRow} material={windowMaterial} />
      </group>

      {/* --- 3. Ground Floor Front Window (Living Room Window) --- */}
      <group position={[-5.4, 0, -7.0]}>
        <mesh position={[0, 1.8, -0.02]} geometry={geoWindowLargeFrame} material={whiteTrimMat} />
        <mesh position={[0, 1.8, -0.06]} geometry={geoWindowLargeGlass} material={windowMaterial} />
        <mesh position={[0, 1.8, -0.08]} geometry={geoWindowCrossV} material={whiteTrimMat} />
        <mesh position={[0, 1.8, -0.08]} geometry={geoWindowCrossH} material={whiteTrimMat} />
        <mesh position={[0, 0.75, -0.14]} geometry={geoWindowSill} material={whiteTrimMat} />
        {/* Navy Window Shutters */}
        <mesh position={[-1.5, 1.8, -0.06]} geometry={geoShutter} material={navyShutterMat} />
        <mesh position={[1.5, 1.8, -0.06]} geometry={geoShutter} material={navyShutterMat} />
      </group>

      {/* --- 4. Second Floor Front Windows --- */}
      {/* Window 1 (above living room) */}
      <group position={[-5.4, 0, -7.0]}>
        <mesh position={[0, 5.2, -0.02]} geometry={geoWindowMedFrame} material={whiteTrimMat} />
        <mesh position={[0, 5.2, -0.06]} geometry={geoWindowMedGlass} material={windowMaterial} />
        <mesh position={[0, 5.2, -0.08]} geometry={geoWindowMedCrossV} material={whiteTrimMat} />
        <mesh position={[0, 5.2, -0.08]} geometry={geoWindowMedCrossH} material={whiteTrimMat} />
        <mesh position={[0, 4.22, -0.14]} geometry={geoWindowMedSill} material={whiteTrimMat} />
        <mesh position={[-1.25, 5.2, -0.06]} geometry={geoShutter} material={navyShutterMat} />
        <mesh position={[1.25, 5.2, -0.06]} geometry={geoShutter} material={navyShutterMat} />
      </group>

      {/* Window 2 (above front porch) */}
      <group position={[-2.0, 0, -7.0]}>
        <mesh position={[0, 5.2, -0.02]} geometry={geoWindowSmallFrame} material={whiteTrimMat} />
        <mesh position={[0, 5.2, -0.06]} geometry={geoWindowSmallGlass} material={windowMaterial} />
        <mesh position={[0, 4.38, -0.12]} geometry={geoWindowMedSill} material={whiteTrimMat} scale={[0.8, 1, 1]} />
      </group>

      {/* Window 3 (above garage) */}
      <group position={[4.2, 0, -7.0]}>
        <mesh position={[0, 5.2, -0.02]} geometry={geoWindowMedFrame} material={whiteTrimMat} />
        <mesh position={[0, 5.2, -0.06]} geometry={geoWindowMedGlass} material={windowMaterial} />
        <mesh position={[0, 5.2, -0.08]} geometry={geoWindowMedCrossV} material={whiteTrimMat} />
        <mesh position={[0, 5.2, -0.08]} geometry={geoWindowMedCrossH} material={whiteTrimMat} />
        <mesh position={[0, 4.22, -0.14]} geometry={geoWindowMedSill} material={whiteTrimMat} />
        <mesh position={[-1.25, 5.2, -0.06]} geometry={geoShutter} material={navyShutterMat} />
        <mesh position={[1.25, 5.2, -0.06]} geometry={geoShutter} material={navyShutterMat} />
      </group>

      {/* ===================================================================
          SIDE FACADE (X = -8.0, facing cross-street towards -X)
      =================================================================== */}
      <group position={[-8.0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        {/* Ground Floor Side Window */}
        <group position={[1.0, 0, 0]}>
          <mesh position={[0, 1.8, -0.02]} geometry={geoWindowMedFrame} material={whiteTrimMat} />
          <mesh position={[0, 1.8, -0.06]} geometry={geoWindowMedGlass} material={windowMaterial} />
          <mesh position={[0, 1.8, -0.08]} geometry={geoWindowMedCrossV} material={whiteTrimMat} />
          <mesh position={[0, 1.8, -0.08]} geometry={geoWindowMedCrossH} material={whiteTrimMat} />
        </group>
        {/* Upper Floor Side Windows */}
        <group position={[-2.8, 0, 0]}>
          <mesh position={[0, 5.2, -0.02]} geometry={geoWindowMedFrame} material={whiteTrimMat} />
          <mesh position={[0, 5.2, -0.06]} geometry={geoWindowMedGlass} material={windowMaterial} />
        </group>
        <group position={[2.8, 0, 0]}>
          <mesh position={[0, 5.2, -0.02]} geometry={geoWindowMedFrame} material={whiteTrimMat} />
          <mesh position={[0, 5.2, -0.06]} geometry={geoWindowMedGlass} material={windowMaterial} />
        </group>
      </group>

      {/* ===================================================================
          EAST SIDE FACADE (X = +8.0, facing +X)
      =================================================================== */}
      <group position={[8.0, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <group position={[0, 0, 0]}>
          <mesh position={[0, 5.2, -0.02]} geometry={geoWindowMedFrame} material={whiteTrimMat} />
          <mesh position={[0, 5.2, -0.06]} geometry={geoWindowMedGlass} material={windowMaterial} />
        </group>
      </group>

      {/* ===================================================================
          REAR BACKYARD FACADE (Z = +7.0, facing +Z)
      =================================================================== */}
      <group position={[0, 0, 7.0]} rotation={[0, Math.PI, 0]}>
        {/* Backyard Sliding Patio Door */}
        <group position={[1.0, 0, 0]}>
          <mesh position={[0, 1.35, -0.02]} geometry={geoPatioDoorFrame} material={whiteTrimMat} />
          <mesh position={[0, 1.35, -0.06]} geometry={geoPatioDoorGlass} material={windowMaterial} />
          <mesh position={[0, 1.35, -0.08]} geometry={geoPatioDoorMullion} material={whiteTrimMat} />
        </group>
        {/* Backyard Upper Windows */}
        <group position={[-4.5, 0, 0]}>
          <mesh position={[0, 5.2, -0.02]} geometry={geoWindowMedFrame} material={whiteTrimMat} />
          <mesh position={[0, 5.2, -0.06]} geometry={geoWindowMedGlass} material={windowMaterial} />
        </group>
        <group position={[4.5, 0, 0]}>
          <mesh position={[0, 5.2, -0.02]} geometry={geoWindowMedFrame} material={whiteTrimMat} />
          <mesh position={[0, 5.2, -0.06]} geometry={geoWindowMedGlass} material={windowMaterial} />
        </group>
      </group>

      {/* ===================================================================
          BRICK CHIMNEY & FLUE POTS
      =================================================================== */}
      <group position={[-6.2, 0, 1.5]}>
        <mesh position={[0, 8.5, 0]} geometry={geoChimney} material={chimneyBrickMat} castShadow />
        <mesh position={[0, 11.2, 0]} geometry={geoChimneyCap} material={chimneyCapMat} />
        <mesh position={[-0.3, 11.55, 0]} geometry={geoChimneyPot} material={chimneyPotMat} />
        <mesh position={[0.3, 11.55, 0]} geometry={geoChimneyPot} material={chimneyPotMat} />
      </group>
    </group>
  );
});

// =========================================================================
// 2. LUXURY VILLA (Modern Architectural Masterpiece with Glass Curtain Walls & Balcony)
// =========================================================================
export const LuxuryVilla: React.FC<HouseProps> = React.memo(({ isNight }) => {
  const windowMaterial = useMemo(
    () =>
      isNight
        ? new THREE.MeshStandardMaterial({
            color: 0xfef08a,
            emissive: 0xfde047,
            emissiveIntensity: 3.0,
            roughness: 0.1
          })
        : villaTemperedGlassMat,
    [isNight]
  );

  const neonCyanMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: isNight ? 3.5 : 1.5
      }),
    [isNight]
  );

  return (
    <group>
      {/* Main Modern Structure */}
      <mesh position={[0, 4.5, 0]} geometry={geoVillaMain} material={villaWallMat} castShadow receiveShadow />

      {/* Roof Canopy Overhang */}
      <mesh position={[0, 9.2, 0]} geometry={geoVillaRoofCanopy} material={villaDarkAccentMat} />
      {/* Modern Neon Accent Strip */}
      <mesh position={[0, 9.2, 8.65]} geometry={geoVillaAccentStrip} material={neonCyanMat} />

      {/* --- Front Facade (Facing Road at +Z) --- */}
      <group position={[0, 0, 8.0]}>
        {/* Modern Grand Pivot Door */}
        <mesh position={[-2.2, 1.8, 0.02]} geometry={geoVillaPivotDoor} material={villaWoodDoorMat} />
        <mesh position={[-1.2, 1.8, 0.1]} geometry={geoVillaPivotHandle} material={stainlessSteelMat} />

        {/* Ground Floor Panoramic Living Room Glass Wall */}
        <mesh position={[-6.2, 2.0, 0.02]} geometry={geoVillaCurtainFrame} material={villaDarkAccentMat} />
        <mesh position={[-6.2, 2.0, 0.06]} geometry={geoVillaCurtainGlass} material={windowMaterial} />

        {/* Showroom Garage Frosted Glass Front */}
        <mesh position={[4.8, 1.8, 0.02]} geometry={geoGarageFrame} material={villaDarkAccentMat} scale={[1.2, 1.1, 1]} />
        <mesh position={[4.8, 1.8, 0.06]} geometry={geoGarageDoor} material={windowMaterial} scale={[1.2, 1.1, 1]} />

        {/* Second Floor Cantilever Balcony */}
        <mesh position={[0, 4.4, 1.3]} geometry={geoVillaBalconyBase} material={villaDarkAccentMat} />
        <mesh position={[0, 5.05, 2.55]} geometry={geoVillaGlassRail} material={villaTemperedGlassMat} />
        <mesh position={[0, 5.58, 2.55]} geometry={geoVillaRailTop} material={stainlessSteelMat} />

        {/* Second Floor Balcony Sliding Glass Doors */}
        <mesh position={[-3.2, 6.4, 0.02]} geometry={geoVillaSlidingDoorFrame} material={villaDarkAccentMat} />
        <mesh position={[-3.2, 6.4, 0.06]} geometry={geoVillaSlidingDoorGlass} material={windowMaterial} />

        {/* Master Bedroom Panoramic Glass Window */}
        <mesh position={[4.5, 6.4, 0.02]} geometry={geoVillaSlidingDoorFrame} material={villaDarkAccentMat} />
        <mesh position={[4.5, 6.4, 0.06]} geometry={geoVillaSlidingDoorGlass} material={windowMaterial} />
      </group>
    </group>
  );
});

// =========================================================================
// 3. STARTER LOFT & LUXURY RESIDENCE (Modern Architectural Multi-Storey House)
// =========================================================================
export const PlayerLoft: React.FC<HouseProps> = React.memo(({ isNight }) => {
  const windowGlowMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xfde047,
        emissiveIntensity: isNight ? 2.8 : 0.8
      }),
    [isNight]
  );

  const windowMaterial = useMemo(
    () => (isNight ? windowGlowMat : daytimeGlassMat),
    [isNight, windowGlowMat]
  );

  const neonGreenMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        emissive: 0x22c55e,
        emissiveIntensity: isNight ? 3.8 : 2.2
      }),
    [isNight]
  );

  return (
    <group>
      {/* ===================================================================
          LEVEL 1: GROUND FLOOR (Limestone Ashlar, Grand Porch, Garage & Driveway)
      =================================================================== */}
      {/* Ground Floor Main Body */}
      <mesh position={[0, 2.5, 0]} geometry={geoResFloor1} material={warmSandstoneMat} castShadow receiveShadow />
      {/* Floor 1 Architectural Trim Divider */}
      <mesh position={[0, 5.05, 0]} geometry={geoResRoofPitch} material={whiteTrimMat} scale={[1.01, 0.35, 1.01]} />

      {/* --- Front Entrance & Porch (Facing Street at Z = -8.0) --- */}
      <group position={[-2.4, 0, -8.0]}>
        {/* Raised Limestone Porch Steps */}
        <mesh position={[0, 0.12, -0.6]} geometry={geoResEntranceStep} material={porchStoneMat} receiveShadow />
        <mesh position={[0, 0.06, -1.8]} geometry={geoResEntranceStepLow} material={porchStoneMat} receiveShadow />

        {/* Luminous Green Holographic Entrance Halo Portal on Ground */}
        <mesh position={[0, 0.26, -0.6]} rotation={[-Math.PI / 2, 0, 0]} geometry={geoResEntranceHalo} material={greenEntranceHaloMat} />

        {/* Modern Cantilevered Entrance Portico Canopy */}
        <mesh position={[0, 3.85, -1.0]} geometry={geoLoftEntranceCanopy} material={darkMetalMat} />
        {/* Recessed Soffit Warm Downlights */}
        <mesh position={[-1.2, 3.65, -1.0]} geometry={geoPorchLantern} material={windowGlowMat} scale={[0.8, 0.3, 0.8]} />
        <mesh position={[1.2, 3.65, -1.0]} geometry={geoPorchLantern} material={windowGlowMat} scale={[0.8, 0.3, 0.8]} />

        {/* Floating Residence Entrance Indicator Sign */}
        <mesh position={[0, 4.25, -1.05]} geometry={geoLoftEntranceSign} material={neonGreenMat} />

        {/* Grand Double Mahogany Front Doors */}
        <mesh position={[0, 1.6, -0.02]} geometry={geoResFrontDoorFrame} material={darkMetalMat} />
        <mesh position={[0, 1.5, -0.06]} geometry={geoResDoubleDoor} material={doorMahoganyMat} />
        {/* Vertical Brushed Brass Pull Handles */}
        <mesh position={[-0.2, 1.5, -0.15]} geometry={geoResDoorHandleLong} material={brassHandleMat} />
        <mesh position={[0.2, 1.5, -0.15]} geometry={geoResDoorHandleLong} material={brassHandleMat} />
        {/* Upper Glass Transom */}
        <mesh position={[0, 2.7, -0.07]} geometry={geoDoorGlassInset} material={windowMaterial} scale={[2.8, 0.9, 1]} />

        {/* Symmetrical Carriage Wall Lanterns */}
        <mesh position={[-2.0, 2.2, -0.08]} geometry={geoPorchLantern} material={windowGlowMat} scale={[0.7, 0.9, 0.7]} />
        <mesh position={[2.0, 2.2, -0.08]} geometry={geoPorchLantern} material={windowGlowMat} scale={[0.7, 0.9, 0.7]} />

        {/* House Address Plaque */}
        <mesh position={[-2.0, 1.4, -0.05]} geometry={geoResHousePlaque} material={warmPlaqueMat} />
      </group>

      {/* --- Attached 2-Car Garage & Driveway (Right Side at X = 5.2) --- */}
      <group position={[5.2, 0, -8.0]}>
        {/* Concrete Paved Driveway leading to road */}
        <mesh position={[0, 0.03, -3.8]} geometry={geoResDrivewayPaved} material={drivewayConcreteMat} receiveShadow />
        {/* Garage Door Frame */}
        <mesh position={[0, 1.8, -0.02]} geometry={geoGarageFrame} material={whiteTrimMat} scale={[1.18, 1.15, 1]} />
        {/* Horizontal Grooved Sectional Garage Door */}
        <mesh position={[0, 1.75, -0.06]} geometry={geoResGarageDoor} material={garageDoorMat} />
        {/* Garage Top Window Row */}
        <mesh position={[0, 3.1, -0.08]} geometry={geoResGarageGlass} material={windowMaterial} />
      </group>

      {/* --- Ground Floor Picture Window (Left Side at X = -6.2) --- */}
      <group position={[-6.2, 2.0, -8.02]}>
        <mesh geometry={geoResWindowLgFrame} material={darkMetalMat} />
        <mesh position={[0, 0, -0.02]} geometry={geoResWindowLgGlass} material={windowMaterial} />
        <mesh position={[0, -1.35, -0.04]} geometry={geoResWindowSillLg} material={whiteTrimMat} />
      </group>

      {/* ===================================================================
          LEVEL 2: SECOND FLOOR (Cantilevered Cedar Siding, Balconies & Bedrooms)
      =================================================================== */}
      <group position={[0, 7.4, 0]}>
        {/* Second Floor Cantilevered Main Body (Cedar Wood Siding) */}
        <mesh geometry={geoResFloor2} material={cedarWoodMat} castShadow receiveShadow />
        {/* Architectural White Fascia Trim Divider */}
        <mesh position={[0, 2.45, 0]} geometry={geoResRoofPitch} material={whiteTrimMat} scale={[1.02, 0.35, 1.02]} />

        {/* Full-Width Front Balcony Terrace (Facing Street at Z = -8.3) */}
        <group position={[0, -1.8, -8.3]}>
          <mesh position={[0, 0, -1.3]} geometry={geoResBalconyLedge} material={whiteTrimMat} receiveShadow />
          <mesh position={[0, 0.6, -2.55]} geometry={geoResBalconyGlass} material={daytimeGlassMat} />
          <mesh position={[0, 1.12, -2.55]} geometry={geoResBalconyRail} material={stainlessSteelMat} />

          {/* Master Bedroom Sliding Glass Patio Doors */}
          <mesh position={[-2.4, 1.8, -0.02]} geometry={geoVillaSlidingDoorFrame} material={darkMetalMat} />
          <mesh position={[-2.4, 1.8, 0.02]} geometry={geoVillaSlidingDoorGlass} material={windowMaterial} />

          {/* Balcony Teak Lounge Chairs & Table */}
          <mesh position={[4.0, 0.4, -1.3]} geometry={geoPatioTable} material={cedarWoodMat} scale={[0.8, 0.9, 0.8]} />
          <mesh position={[2.6, 0.5, -1.3]} geometry={geoPatioChair} material={darkMetalMat} scale={[0.8, 0.8, 0.8]} />
          <mesh position={[5.4, 0.5, -1.3]} geometry={geoPatioChair} material={darkMetalMat} scale={[0.8, 0.8, 0.8]} />
        </group>

        {/* Second Floor Front Right Framed Window */}
        <group position={[5.2, 0, -8.35]}>
          <mesh geometry={geoResWindowLgFrame} material={darkMetalMat} />
          <mesh position={[0, 0, -0.02]} geometry={geoResWindowLgGlass} material={windowMaterial} />
          <mesh position={[0, -1.35, -0.04]} geometry={geoResWindowSillLg} material={whiteTrimMat} />
        </group>

        {/* Left Side (West Facade) Framed Picture Windows */}
        {[-4.0, 4.0].map((zOff, i) => (
          <group key={`l2_w_${i}`} position={[-9.35, 0, zOff]} rotation={[0, Math.PI / 2, 0]}>
            <mesh geometry={geoResWindowLgFrame} material={darkMetalMat} />
            <mesh position={[0, 0, -0.02]} geometry={geoResWindowLgGlass} material={windowMaterial} />
            <mesh position={[0, -1.35, -0.04]} geometry={geoResWindowSillLg} material={whiteTrimMat} />
          </group>
        ))}

        {/* Right Side (East Facade) Framed Picture Windows */}
        {[-4.0, 4.0].map((zOff, i) => (
          <group key={`l2_e_${i}`} position={[9.35, 0, zOff]} rotation={[0, -Math.PI / 2, 0]}>
            <mesh geometry={geoResWindowLgFrame} material={darkMetalMat} />
            <mesh position={[0, 0, -0.02]} geometry={geoResWindowLgGlass} material={windowMaterial} />
            <mesh position={[0, -1.35, -0.04]} geometry={geoResWindowSillLg} material={whiteTrimMat} />
          </group>
        ))}

        {/* Rear Facade (Backyard Windows) */}
        {[-4.5, 4.5].map((xOff, i) => (
          <group key={`l2_rear_${i}`} position={[xOff, 0, 8.35]}>
            <mesh geometry={geoResWindowLgFrame} material={darkMetalMat} />
            <mesh position={[0, 0, 0.02]} geometry={geoResWindowLgGlass} material={windowMaterial} />
            <mesh position={[0, -1.35, 0.04]} geometry={geoResWindowSillLg} material={whiteTrimMat} />
          </group>
        ))}
      </group>

      {/* ===================================================================
          LEVEL 3: THIRD FLOOR PENTHOUSE (Panoramic Glass Curtain Walls & Terrace)
      =================================================================== */}
      <group position={[0, 11.9, 0]}>
        {/* Penthouse Stepped Core */}
        <mesh geometry={geoResFloor3} material={warmSandstoneMat} castShadow receiveShadow />

        {/* Floor-to-Ceiling Front Glass Curtain Wall */}
        <mesh position={[0, 0, -7.02]} geometry={geoVillaCurtainFrame} material={darkMetalMat} scale={[2.3, 1.05, 1]} />
        <mesh position={[0, 0, -7.05]} geometry={geoVillaCurtainGlass} material={windowMaterial} scale={[2.3, 1.05, 1]} />

        {/* West Panoramic Window */}
        <group position={[-8.02, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh geometry={geoVillaCurtainFrame} material={darkMetalMat} scale={[1.8, 1.05, 1]} />
          <mesh position={[0, 0, -0.02]} geometry={geoVillaCurtainGlass} material={windowMaterial} scale={[1.8, 1.05, 1]} />
        </group>

        {/* East Panoramic Window */}
        <group position={[8.02, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh geometry={geoVillaCurtainFrame} material={darkMetalMat} scale={[1.8, 1.05, 1]} />
          <mesh position={[0, 0, -0.02]} geometry={geoVillaCurtainGlass} material={windowMaterial} scale={[1.8, 1.05, 1]} />
        </group>

        {/* North (Rear) Window */}
        <group position={[0, 0, 7.02]}>
          <mesh geometry={geoVillaCurtainFrame} material={darkMetalMat} scale={[2.0, 1.05, 1]} />
          <mesh position={[0, 0, 0.02]} geometry={geoVillaCurtainGlass} material={windowMaterial} scale={[2.0, 1.05, 1]} />
        </group>
      </group>

      {/* ===================================================================
          ROOF & ARCHITECTURAL CROWN (Dramatic Angled Roof, Chimney & Solar Panels)
      =================================================================== */}
      <group position={[0, 14.3, 0]}>
        {/* Modern Angled Roof Pitch */}
        <mesh position={[0, 0.3, 0]} rotation={[-0.08, 0, 0]} geometry={geoResRoofPitch} material={darkSlateRoofMat} castShadow />
        {/* Deep Cantilevered Roof Overhang Fascia */}
        <mesh position={[0, 0.3, 0]} rotation={[-0.08, 0, 0]} geometry={geoResRoofOverhang} material={whiteTrimMat} />
        {/* Rich Cedar Soffit Underside with Recessed Spotlights */}
        <mesh position={[0, 0.05, 0]} rotation={[-0.08, 0, 0]} geometry={geoResWoodSoffit} material={cedarWoodMat} />

        {/* Modern Stone Chimney */}
        <mesh position={[-6.2, 1.8, 3.2]} geometry={geoResChimneyModern} material={warmSandstoneMat} castShadow />
        <mesh position={[-6.2, 4.6, 3.2]} geometry={geoChimneyCap} material={darkMetalMat} />

        {/* Rooftop Solar Panel Arrays */}
        <group position={[3.5, 0.6, 0]} rotation={[-0.08, 0, 0]}>
          <mesh position={[-1.4, 0, 0]} geometry={geoResSolarPanel} material={solarPanelMat} />
          <mesh position={[1.4, 0, 0]} geometry={geoResSolarPanel} material={solarPanelMat} />
        </group>

        {/* Rooftop Terrace Sky Pergola */}
        <group position={[-2.0, 0.4, -4.5]}>
          {[-2.8, 0, 2.8].map((bx, i) => (
            <mesh key={`perg_${i}`} position={[bx, 1.4, 0]} geometry={geoResPergolaBeam} material={cedarWoodMat} />
          ))}
          {[-2.0, -0.7, 0.7, 2.0].map((sz, i) => (
            <mesh key={`slat_${i}`} position={[0, 2.3, sz]} geometry={geoResPergolaSlat} material={darkMetalMat} />
          ))}
        </group>
      </group>

      {/* ===================================================================
          PROPERTY CURB APPEAL & LANDSCAPING (Hedges, Cypress Trees & Walkway)
      =================================================================== */}
      {/* Front Boundary Hedges */}
      <mesh position={[-6.4, 0.55, -9.8]} geometry={geoResHedgeBlock} material={hedgeBushMat} castShadow />
      <mesh position={[7.8, 0.55, -9.8]} geometry={geoResHedgeBlock} material={hedgeBushMat} scale={[0.7, 1, 1]} castShadow />

      {/* Tall Italian Cypress Trees */}
      <group position={[-8.2, 0, -8.6]}>
        <mesh position={[0, 0.6, 0]} geometry={geoResCypressTrunk} material={treeTrunkMat} />
        <mesh position={[0, 2.7, 0]} geometry={geoResCypressFoliage} material={hedgeBushMat} castShadow />
      </group>
      <group position={[-0.5, 0, -8.6]}>
        <mesh position={[0, 0.6, 0]} geometry={geoResCypressTrunk} material={treeTrunkMat} />
        <mesh position={[0, 2.7, 0]} geometry={geoResCypressFoliage} material={hedgeBushMat} castShadow />
      </group>

      {/* Rear Garden Private Deck & Patio Table */}
      <group position={[0, 0, 8.0]}>
        <mesh position={[0, 0.05, 2.8]} geometry={geoDriveway} material={cedarWoodMat} receiveShadow />
        <mesh position={[0, 0.8, 2.8]} geometry={geoPatioTable} material={whiteTrimMat} />
        <mesh position={[-1.2, 0.6, 2.8]} geometry={geoPatioChair} material={darkMetalMat} />
        <mesh position={[1.2, 0.6, 2.8]} geometry={geoPatioChair} material={darkMetalMat} />
        <mesh position={[0, 2.2, 2.8]} geometry={geoPatioUmbrella} material={umbrellaRedMat} />
        <mesh position={[0, 1.1, 2.8]} geometry={geoUmbrellaPole} material={stainlessSteelMat} />
      </group>
    </group>
  );
});

// =========================================================================
// 4. APEX DEALERSHIP (Showroom Glass Curtain Wall & Entrance)
// =========================================================================
export const ApexDealership: React.FC<HouseProps> = React.memo(({ isNight }) => {
  const neonCyanMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: isNight ? 3.5 : 2.0
      }),
    [isNight]
  );

  const windowMaterial = useMemo(
    () =>
      isNight
        ? new THREE.MeshStandardMaterial({
            color: 0xfef08a,
            emissive: 0xfde047,
            emissiveIntensity: 2.5
          })
        : daytimeGlassMat,
    [isNight]
  );

  return (
    <group>
      <mesh position={[0, 4, 0]} geometry={geoDealershipMain} material={buildingLightMat} castShadow receiveShadow />
      <mesh position={[0, 8.8, 8.2]} geometry={geoDealershipSign} material={neonCyanMat} />

      {/* Showroom Glass Wall (Facing Street at +Z) */}
      <group position={[0, 0, 8.0]}>
        <mesh position={[0, 3.4, 0.05]} geometry={geoDealershipGlassWall} material={windowMaterial} />
        {/* Entrance Sliding Doors */}
        <mesh position={[0, 1.5, 0.12]} geometry={geoDealershipDoorFrame} material={whiteTrimMat} />
        <mesh position={[0, 1.5, 0.16]} geometry={geoDealershipDoorGlass} material={windowMaterial} />
      </group>
    </group>
  );
});

// =========================================================================
// 5. SPEEDWORKS GARAGE (Industrial Bay Doors & Tuning Signs)
// =========================================================================
export const SpeedWorksGarage: React.FC<HouseProps> = React.memo(({ isNight }) => {
  const neonPinkMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0xff007f,
        emissive: 0xff007f,
        emissiveIntensity: isNight ? 3.5 : 2.0
      }),
    [isNight]
  );

  return (
    <group>
      <mesh position={[0, 5, 0]} geometry={geoGarageMain} material={buildingSlateMat} castShadow receiveShadow />
      <mesh position={[0, 8.5, 9.2]} geometry={geoGarageSign} material={neonPinkMat} />

      {/* Mechanic Bay Doors (Facing Street at +Z) */}
      <group position={[0, 0, 9.0]}>
        {/* Bay 1 Roll-up Door */}
        <mesh position={[-4.2, 2.3, 0.04]} geometry={geoGarageBayDoorFrame} material={whiteTrimMat} />
        <mesh position={[-4.2, 2.3, 0.08]} geometry={geoGarageBayDoor} material={industrialDoorMat} />

        {/* Bay 2 Roll-up Door */}
        <mesh position={[2.5, 2.3, 0.04]} geometry={geoGarageBayDoorFrame} material={whiteTrimMat} />
        <mesh position={[2.5, 2.3, 0.08]} geometry={geoGarageBayDoor} material={industrialDoorMat} />

        {/* Customer Service Door */}
        <mesh position={[7.0, 1.4, 0.04]} geometry={geoGarageServiceDoorFrame} material={whiteTrimMat} />
        <mesh position={[7.0, 1.4, 0.08]} geometry={geoGarageServiceDoor} material={doorMahoganyMat} />
      </group>
    </group>
  );
});

// =========================================================================
// 6. WAREHOUSE
// =========================================================================
export const Warehouse: React.FC = React.memo(() => (
  <group>
    <mesh position={[0, 4.5, 0]} geometry={geoWarehouseMain} material={buildingSlateMat} castShadow receiveShadow />
    {/* Loading Dock Doors */}
    <mesh position={[-4.0, 2.2, 8.05]} geometry={geoWarehouseDockDoor} material={industrialDoorMat} />
    <mesh position={[4.0, 2.2, 8.05]} geometry={geoWarehouseDockDoor} material={industrialDoorMat} />
  </group>
));

// =========================================================================
// 7. STUNT JUMP RAMP (Automotive Launch Ramp with Caution Stripes & Truss)
// =========================================================================
export const StuntJumpRamp: React.FC<{
  x: number;
  z: number;
  direction?: 'north' | 'south' | 'east' | 'west';
  height?: number;
  length?: number;
  width?: number;
}> = React.memo(({ x, z, direction = 'north', height = 2.6, length = 8.0, width = 4.0 }) => {
  const inclineAngle = Math.atan2(height, length);
  let rotY = 0;
  if (direction === 'north') rotY = 0;
  else if (direction === 'south') rotY = Math.PI;
  else if (direction === 'east') rotY = -Math.PI / 2;
  else if (direction === 'west') rotY = Math.PI / 2;

  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      {/* Inclined Deck */}
      <mesh
        position={[0, height / 2, -length / 2]}
        rotation={[-inclineAngle, 0, 0]}
        geometry={geoStuntDeck}
        material={stuntDeckMat}
        castShadow
        receiveShadow
      />
      {/* Side Hazard Warning Stripes */}
      <mesh
        position={[-width / 2 + 0.12, height / 2 + 0.02, -length / 2]}
        rotation={[-inclineAngle, 0, 0]}
        geometry={geoStuntStripe}
        material={hazardYellowMat}
      />
      <mesh
        position={[width / 2 - 0.12, height / 2 + 0.02, -length / 2]}
        rotation={[-inclineAngle, 0, 0]}
        geometry={geoStuntStripe}
        material={hazardYellowMat}
      />

      {/* Support Vertical Truss Legs under the high end */}
      <mesh position={[-width / 2 + 0.3, height / 2, -length + 0.3]} geometry={geoStuntLeg} material={steelTrussMat} />
      <mesh position={[width / 2 - 0.3, height / 2, -length + 0.3]} geometry={geoStuntLeg} material={steelTrussMat} />
      {/* Cross Brace */}
      <mesh position={[0, height * 0.7, -length + 0.3]} rotation={[0, 0, Math.PI / 2]} geometry={geoStuntCross} material={steelTrussMat} />

      {/* Overhead Launch Banner */}
      <group position={[0, height + 0.8, -length + 0.1]}>
        <mesh geometry={geoStuntSign} material={hazardYellowMat} />
      </group>
    </group>
  );
});

// =========================================================================
// 8. DOWNTOWN SKYSCRAPER (Stepped Glass Tower, Helipad, Spire, Lobby)
// =========================================================================
export const DowntownSkyscraper: React.FC<{
  variant?: 0 | 1 | 2;
  isNight: boolean;
}> = React.memo(({ variant = 0, isNight }) => {
  const windowGlowMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xfde047,
        emissiveIntensity: isNight ? 2.8 : 0.8
      }),
    [isNight]
  );

  const neonCyanMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: isNight ? 3.8 : 1.8
      }),
    [isNight]
  );

  const neonPinkMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0xff007f,
        emissive: 0xff007f,
        emissiveIntensity: isNight ? 3.8 : 1.8
      }),
    [isNight]
  );

  // Variant 0: Stepped High-Rise with Ground Floor Grand Lobby & Rooftop Helipad
  if (variant === 0) {
    return (
      <group>
        {/* Tier 1: Base Tower (18m x 18m, height 28m) */}
        <mesh position={[0, 14, 0]} geometry={geoSkyscraperBase} material={buildingLightMat} castShadow receiveShadow />
        {/* Ground Floor Double-Height Grand Glass Lobby */}
        <mesh position={[0, 3.5, 9.02]} geometry={geoLobbyGlassWall} material={daytimeGlassMat} />
        {/* Lobby Entrance Colonnade Pillars */}
        {[-7, -2.5, 2.5, 7].map((px, i) => (
          <mesh key={i} position={[px, 3.5, 9.4]} geometry={geoLobbyColonnade} material={whiteTrimMat} />
        ))}
        {/* Lobby Canopy */}
        <mesh position={[0, 5.2, 10.2]} geometry={geoStoreAwning} material={whiteTrimMat} scale={[1.8, 1, 1.2]} />
        <mesh position={[0, 5.5, 10.2]} geometry={geoDoorGlassInset} material={neonCyanMat} scale={[5, 1, 1]} />

        {/* Tier 1 Window Glowing Bands */}
        {[8, 16, 24].map((yOff, i) => (
          <mesh key={i} position={[0, yOff, 0]} geometry={geoLoftWindowBand} material={windowGlowMat} />
        ))}

        {/* Tier 2: Mid Tower (15m x 15m, height 26m) */}
        <mesh position={[0, 41, 0]} geometry={geoSkyscraperMid} material={buildingSlateMat} castShadow receiveShadow />
        {[34, 42, 50].map((yOff, i) => (
          <mesh key={i} position={[0, yOff, 0]} geometry={geoLoftWindowBand} material={windowGlowMat} scale={[0.84, 1, 0.84]} />
        ))}

        {/* Tier 3: Upper Penthouse Tower (12m x 12m, height 24m) */}
        <mesh position={[0, 66, 0]} geometry={geoSkyscraperTop} material={daytimeGlassMat} castShadow />
        {[60, 68].map((yOff, i) => (
          <mesh key={i} position={[0, yOff, 0]} geometry={geoLoftWindowBand} material={windowGlowMat} scale={[0.68, 1, 0.68]} />
        ))}

        {/* Rooftop Helipad Complex (Y = 78m) */}
        <mesh position={[0, 78.1, 0]} geometry={geoHelipadPad} material={helipadPadMat} />
        <mesh position={[0, 78.25, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={geoHelipadRing} material={helipadYellowMat} />
        <mesh position={[-0.8, 78.25, 0]} geometry={geoHelipadH1} material={helipadYellowMat} />
        <mesh position={[0.8, 78.25, 0]} geometry={geoHelipadH1} material={helipadYellowMat} />
        <mesh position={[0, 78.25, 0]} geometry={geoHelipadH2} material={helipadYellowMat} />

        {/* Red Flashing Aviation Warning Beacons */}
        <mesh position={[-5.2, 78.8, -5.2]} geometry={geoBeaconLight} material={beaconRedMat} />
        <mesh position={[5.2, 78.8, 5.2]} geometry={geoBeaconLight} material={beaconRedMat} />
      </group>
    );
  }

  // Variant 1: Luxury Modern Urban Residence & Townhouse Penthouse Estate
  // (Full 360-degree residential architecture, double mahogany doors, garage, wrap-around balconies, cedar siding)
  if (variant === 1) {
    const windowMaterial = isNight ? windowGlowMat : daytimeGlassMat;

    return (
      <group>
        {/* ===================================================================
            LEVEL 1: GROUND FLOOR (Limestone Ashlar, Grand Porch, Garage & Driveway)
        =================================================================== */}
        {/* Ground Floor Main Body (18m x 5m x 16m) */}
        <mesh position={[0, 2.5, 0]} geometry={geoResFloor1} material={warmSandstoneMat} castShadow receiveShadow />
        {/* Floor 1 Architectural White Trim Divider */}
        <mesh position={[0, 5.05, 0]} geometry={geoResRoofPitch} material={whiteTrimMat} scale={[1.01, 0.35, 1.01]} />

        {/* --- Front Entrance & Porch (Facing Street at Z = +8.0 towards East-West Road) --- */}
        <group position={[2.5, 0, 8.0]}>
          {/* Raised Porch Steps */}
          <mesh position={[0, 0.12, 0.8]} geometry={geoResEntranceStep} material={porchStoneMat} receiveShadow />
          <mesh position={[0, 0.06, 2.0]} geometry={geoResEntranceStepLow} material={porchStoneMat} receiveShadow />

          {/* Glowing Green Interactive Residential Floor Ring */}
          <mesh position={[0, 0.26, 0.8]} rotation={[-Math.PI / 2, 0, 0]} geometry={geoResEntranceHalo} material={greenEntranceHaloMat} />

          {/* Modern Cantilevered Entrance Portico Canopy */}
          <mesh position={[0, 3.85, 1.2]} geometry={geoLoftEntranceCanopy} material={darkMetalMat} scale={[0.85, 1, 0.85]} />
          {/* Recessed Soffit Warm Downlights */}
          <mesh position={[-1.0, 3.65, 1.2]} geometry={geoPorchLantern} material={windowGlowMat} scale={[0.8, 0.3, 0.8]} />
          <mesh position={[1.0, 3.65, 1.2]} geometry={geoPorchLantern} material={windowGlowMat} scale={[0.8, 0.3, 0.8]} />

          {/* Grand Double Mahogany Front Doors */}
          <mesh position={[0, 1.6, 0.02]} geometry={geoResFrontDoorFrame} material={darkMetalMat} />
          <mesh position={[0, 1.5, 0.06]} geometry={geoResDoubleDoor} material={doorMahoganyMat} />
          {/* Vertical Brushed Brass Pull Handles */}
          <mesh position={[-0.15, 1.5, 0.15]} geometry={geoResDoorHandleLong} material={brassHandleMat} />
          <mesh position={[0.15, 1.5, 0.15]} geometry={geoResDoorHandleLong} material={brassHandleMat} />

          {/* Dual Exterior Carriage Lanterns flanking door */}
          <mesh position={[-2.0, 2.2, 0.12]} geometry={geoPorchLantern} material={windowGlowMat} />
          <mesh position={[2.0, 2.2, 0.12]} geometry={geoPorchLantern} material={windowGlowMat} />

          {/* House Address Plaque */}
          <mesh position={[2.4, 1.6, 0.1]} geometry={geoResHousePlaque} material={warmPlaqueMat} />
        </group>

        {/* --- Integrated 2-Car Luxury Garage (Facing Street at Z = +8.0, X = -4.5) --- */}
        <group position={[-4.5, 0, 8.0]}>
          <mesh position={[0, 1.8, 0.06]} geometry={geoResGarageDoor} material={garageDoorMat} />
          {/* Horizontal Frosted Glass Strip */}
          <mesh position={[0, 2.8, 0.12]} geometry={geoResGarageGlass} material={windowMaterial} />
          {/* Concrete Paver Driveway leading out to street */}
          <mesh position={[0, 0.02, 3.8]} geometry={geoResDrivewayPaved} material={drivewayConcreteMat} receiveShadow />
          {/* Overhead Modern Garage Carriage Light */}
          <mesh position={[0, 3.8, 0.2]} geometry={geoPorchLantern} material={windowGlowMat} scale={[1.4, 0.4, 0.8]} />
        </group>

        {/* --- Ground Floor Picture Windows on East (+X) Corner Facade (Faces North-South Road) --- */}
        <group position={[9.0, 2.3, 0]}>
          {/* Window 1 */}
          <mesh position={[0.02, 0, -2.5]} rotation={[0, Math.PI / 2, 0]} geometry={geoResWindowLgFrame} material={darkMetalMat} />
          <mesh position={[0.06, 0, -2.5]} rotation={[0, Math.PI / 2, 0]} geometry={geoResWindowLgGlass} material={windowMaterial} />
          {/* Window 2 */}
          <mesh position={[0.02, 0, 3.5]} rotation={[0, Math.PI / 2, 0]} geometry={geoResWindowLgFrame} material={darkMetalMat} />
          <mesh position={[0.06, 0, 3.5]} rotation={[0, Math.PI / 2, 0]} geometry={geoResWindowLgGlass} material={windowMaterial} />
        </group>

        {/* --- Ground Floor Windows on West (-X) and North (-Z) Facades --- */}
        <group position={[-9.0, 2.3, 0]}>
          <mesh position={[-0.02, 0, 0]} rotation={[0, -Math.PI / 2, 0]} geometry={geoResWindowLgFrame} material={darkMetalMat} />
          <mesh position={[-0.06, 0, 0]} rotation={[0, -Math.PI / 2, 0]} geometry={geoResWindowLgGlass} material={windowMaterial} />
        </group>
        <group position={[0, 2.3, -8.0]}>
          <mesh position={[-3.5, 0, -0.02]} rotation={[0, Math.PI, 0]} geometry={geoResWindowLgFrame} material={darkMetalMat} />
          <mesh position={[-3.5, 0, -0.06]} rotation={[0, Math.PI, 0]} geometry={geoResWindowLgGlass} material={windowMaterial} />
          <mesh position={[3.5, 0, -0.02]} rotation={[0, Math.PI, 0]} geometry={geoResWindowLgFrame} material={darkMetalMat} />
          <mesh position={[3.5, 0, -0.06]} rotation={[0, Math.PI, 0]} geometry={geoResWindowLgGlass} material={windowMaterial} />
        </group>

        {/* ===================================================================
            LEVEL 2: SECOND FLOOR (Cantilevered Cedar Siding, Wrap-Around Balcony)
        =================================================================== */}
        {/* Floor 2 Cantilever Body (18.6m x 4.8m x 16.6m) */}
        <mesh position={[0, 7.4, 0]} geometry={geoResFloor2} material={cedarWoodMat} castShadow receiveShadow />
        {/* Architectural White Stucco Cornice Band */}
        <mesh position={[0, 9.8, 0]} geometry={geoResRoofPitch} material={whiteTrimMat} scale={[1.02, 0.35, 1.02]} />

        {/* South (+Z) Front Windows */}
        <group position={[0, 7.4, 8.3]}>
          <mesh position={[-4.5, 0, 0.02]} geometry={geoResWindowLgFrame} material={darkMetalMat} />
          <mesh position={[-4.5, 0, 0.06]} geometry={geoResWindowLgGlass} material={windowMaterial} />
          <mesh position={[2.5, 0, 0.02]} geometry={geoPatioDoorFrame} material={darkMetalMat} />
          <mesh position={[2.5, 0, 0.06]} geometry={geoPatioDoorGlass} material={windowMaterial} />
        </group>

        {/* Wrap-Around Glass Balcony along South (+Z) and East (+X) Corner */}
        <group position={[2.5, 5.2, 9.2]}>
          <mesh geometry={geoLoftBalcony} material={darkMetalMat} scale={[1.4, 1, 1.2]} />
          <mesh position={[0, 0.55, 0.7]} geometry={geoLoftBalconyRail} material={daytimeGlassMat} scale={[1.4, 1, 1]} />
          <mesh position={[0, 1.0, 0.7]} geometry={geoResBalconyRail} material={stainlessSteelMat} scale={[0.35, 1, 1]} />
        </group>
        <group position={[9.9, 5.2, 2.5]} rotation={[0, Math.PI / 2, 0]}>
          <mesh geometry={geoLoftBalcony} material={darkMetalMat} scale={[1.4, 1, 1.2]} />
          <mesh position={[0, 0.55, 0.7]} geometry={geoLoftBalconyRail} material={daytimeGlassMat} scale={[1.4, 1, 1]} />
          <mesh position={[0, 1.0, 0.7]} geometry={geoResBalconyRail} material={stainlessSteelMat} scale={[0.35, 1, 1]} />
        </group>

        {/* East (+X) Panoramic Windows on Floor 2 */}
        <group position={[9.3, 7.4, 0]}>
          <mesh position={[0.02, 0, -2.5]} rotation={[0, Math.PI / 2, 0]} geometry={geoResWindowLgFrame} material={darkMetalMat} />
          <mesh position={[0.06, 0, -2.5]} rotation={[0, Math.PI / 2, 0]} geometry={geoResWindowLgGlass} material={windowMaterial} />
          <mesh position={[0.02, 0, 3.5]} rotation={[0, Math.PI / 2, 0]} geometry={geoResWindowLgFrame} material={darkMetalMat} />
          <mesh position={[0.06, 0, 3.5]} rotation={[0, Math.PI / 2, 0]} geometry={geoResWindowLgGlass} material={windowMaterial} />
        </group>

        {/* West (-X) and North (-Z) Windows on Floor 2 */}
        <group position={[-9.3, 7.4, 0]}>
          <mesh position={[-0.02, 0, 0]} rotation={[0, -Math.PI / 2, 0]} geometry={geoResWindowLgFrame} material={darkMetalMat} />
          <mesh position={[-0.06, 0, 0]} rotation={[0, -Math.PI / 2, 0]} geometry={geoResWindowLgGlass} material={windowMaterial} />
        </group>
        <group position={[0, 7.4, -8.3]}>
          <mesh position={[-3.5, 0, -0.02]} rotation={[0, Math.PI, 0]} geometry={geoResWindowLgFrame} material={darkMetalMat} />
          <mesh position={[-3.5, 0, -0.06]} rotation={[0, Math.PI, 0]} geometry={geoResWindowLgGlass} material={windowMaterial} />
          <mesh position={[3.5, 0, -0.02]} rotation={[0, Math.PI, 0]} geometry={geoResWindowLgFrame} material={darkMetalMat} />
          <mesh position={[3.5, 0, -0.06]} rotation={[0, Math.PI, 0]} geometry={geoResWindowLgGlass} material={windowMaterial} />
        </group>

        {/* ===================================================================
            LEVEL 3: THIRD FLOOR PENTHOUSE (Modern Architectural White Stucco)
        =================================================================== */}
        {/* Floor 3 Main Body (16m x 4.4m x 14m) */}
        <mesh position={[0, 12.0, 0]} geometry={geoResFloor3} material={villaWallMat} castShadow receiveShadow />

        {/* Penthouse Picture Windows & Balcony Doors on all 4 faces */}
        <group position={[0, 12.0, 7.0]}>
          <mesh position={[-2.5, 0, 0.02]} geometry={geoResWindowLgFrame} material={darkMetalMat} />
          <mesh position={[-2.5, 0, 0.06]} geometry={geoResWindowLgGlass} material={windowMaterial} />
          <mesh position={[2.5, 0, 0.02]} geometry={geoResWindowLgFrame} material={darkMetalMat} />
          <mesh position={[2.5, 0, 0.06]} geometry={geoResWindowLgGlass} material={windowMaterial} />
        </group>
        <group position={[8.0, 12.0, 0]}>
          <mesh position={[0.02, 0, -1.8]} rotation={[0, Math.PI / 2, 0]} geometry={geoResWindowLgFrame} material={darkMetalMat} />
          <mesh position={[0.06, 0, -1.8]} rotation={[0, Math.PI / 2, 0]} geometry={geoResWindowLgGlass} material={windowMaterial} />
          <mesh position={[0.02, 0, 1.8]} rotation={[0, Math.PI / 2, 0]} geometry={geoResWindowLgFrame} material={darkMetalMat} />
          <mesh position={[0.06, 0, 1.8]} rotation={[0, Math.PI / 2, 0]} geometry={geoResWindowLgGlass} material={windowMaterial} />
        </group>
        <group position={[-8.0, 12.0, 0]}>
          <mesh position={[-0.02, 0, 0]} rotation={[0, -Math.PI / 2, 0]} geometry={geoResWindowLgFrame} material={darkMetalMat} />
          <mesh position={[-0.06, 0, 0]} rotation={[0, -Math.PI / 2, 0]} geometry={geoResWindowLgGlass} material={windowMaterial} />
        </group>
        <group position={[0, 12.0, -7.0]}>
          <mesh position={[0, 0, -0.02]} rotation={[0, Math.PI, 0]} geometry={geoResWindowLgFrame} material={darkMetalMat} />
          <mesh position={[0, 0, -0.06]} rotation={[0, Math.PI, 0]} geometry={geoResWindowLgGlass} material={windowMaterial} />
        </group>

        {/* ===================================================================
            ROOF ARCHITECTURE: SLOPING SLATE ROOF, SOFFIT DOWNLIGHTS & PERGOLA
        =================================================================== */}
        {/* Main Angled Architectural Standing-Seam Slate Roof */}
        <mesh position={[0, 14.5, 0]} geometry={geoResRoofPitch} material={darkSlateRoofMat} castShadow />
        {/* Deep Cantilevered Cedar Wood Soffit with LED downlights */}
        <mesh position={[0, 14.2, 0]} geometry={geoResWoodSoffit} material={cedarWoodMat} />
        {/* Recessed Soffit Spotlights along the perimeter */}
        {[-8, 0, 8].map((sx, i) => (
          <mesh key={i} position={[sx, 14.15, 8.8]} geometry={geoPorchLantern} material={windowGlowMat} scale={[0.4, 0.15, 0.4]} />
        ))}
        {[-8, 0, 8].map((sx, i) => (
          <mesh key={i} position={[sx, 14.15, -8.8]} geometry={geoPorchLantern} material={windowGlowMat} scale={[0.4, 0.15, 0.4]} />
        ))}
        {[-6, 0, 6].map((sz, i) => (
          <mesh key={i} position={[9.8, 14.15, sz]} geometry={geoPorchLantern} material={windowGlowMat} scale={[0.4, 0.15, 0.4]} />
        ))}

        {/* Modern Natural Stone Chimney Stack with Bronze Hood */}
        <group position={[-5.5, 16.5, -4.5]}>
          <mesh geometry={geoResChimneyModern} material={porchStoneMat} castShadow />
          <mesh position={[0, 2.85, 0]} geometry={geoChimneyCap} material={darkMetalMat} />
          <mesh position={[-0.35, 3.2, 0]} geometry={geoChimneyPot} material={stainlessSteelMat} />
          <mesh position={[0.35, 3.2, 0]} geometry={geoChimneyPot} material={stainlessSteelMat} />
        </group>

        {/* Rooftop Lounge Deck & Cedar Pergola */}
        <group position={[2.0, 14.8, 0]}>
          {/* Deck Planks */}
          <mesh position={[0, -0.05, 0]} geometry={geoVillaBalconyBase} material={cedarWoodMat} scale={[0.65, 0.5, 0.65]} />
          {/* Cedar Pergola Beams */}
          <mesh position={[0, 2.2, -1.8]} geometry={geoResPergolaBeam} material={cedarWoodMat} scale={[0.8, 1, 1]} />
          <mesh position={[0, 2.2, 1.8]} geometry={geoResPergolaBeam} material={cedarWoodMat} scale={[0.8, 1, 1]} />
          {/* Pergola Cross Slats */}
          {[-2.0, -1.0, 0, 1.0, 2.0].map((px, i) => (
            <mesh key={i} position={[px, 2.3, 0]} geometry={geoResPergolaSlat} material={cedarWoodMat} scale={[1, 1, 0.75]} />
          ))}
          {/* Outdoor Lounge Table & Umbrella */}
          <mesh position={[0, 0.4, 0]} geometry={geoPatioTable} material={whiteTrimMat} scale={[0.7, 1, 0.7]} />
          <mesh position={[-0.8, 0.3, 0]} geometry={geoPatioChair} material={darkMetalMat} scale={[0.7, 0.7, 0.7]} />
          <mesh position={[0.8, 0.3, 0]} geometry={geoPatioChair} material={darkMetalMat} scale={[0.7, 0.7, 0.7]} />
          <mesh position={[0, 1.2, 0]} geometry={geoUmbrellaPole} material={stainlessSteelMat} scale={[0.8, 0.8, 0.8]} />
          <mesh position={[0, 2.0, 0]} geometry={geoPatioUmbrella} material={umbrellaRedMat} scale={[0.8, 0.8, 0.8]} />
        </group>

        {/* ===================================================================
            CURBSIDE LANDSCAPING (Manicured Hedges & Tall Cypress Trees)
        =================================================================== */}
        {/* Front Boundary Boxwood Hedges */}
        <mesh position={[-6.2, 0.55, 9.8]} geometry={geoResHedgeBlock} material={hedgeBushMat} scale={[0.8, 1, 1]} castShadow />
        <mesh position={[7.5, 0.55, 9.8]} geometry={geoResHedgeBlock} material={hedgeBushMat} scale={[0.7, 1, 1]} castShadow />
        {/* East Corner Boundary Hedge */}
        <mesh position={[9.8, 0.55, 2.0]} rotation={[0, Math.PI / 2, 0]} geometry={geoResHedgeBlock} material={hedgeBushMat} castShadow />

        {/* Tall Italian Cypress Accent Trees */}
        <group position={[-8.2, 0, 8.8]}>
          <mesh position={[0, 0.6, 0]} geometry={geoResCypressTrunk} material={treeTrunkMat} />
          <mesh position={[0, 2.7, 0]} geometry={geoResCypressFoliage} material={hedgeBushMat} castShadow />
        </group>
        <group position={[0.2, 0, 8.8]}>
          <mesh position={[0, 0.6, 0]} geometry={geoResCypressTrunk} material={treeTrunkMat} />
          <mesh position={[0, 2.7, 0]} geometry={geoResCypressFoliage} material={hedgeBushMat} castShadow />
        </group>
        <group position={[9.5, 0, -4.5]}>
          <mesh position={[0, 0.6, 0]} geometry={geoResCypressTrunk} material={treeTrunkMat} />
          <mesh position={[0, 2.7, 0]} geometry={geoResCypressFoliage} material={hedgeBushMat} castShadow />
        </group>
      </group>
    );
  }

  // Variant 2: Contemporary Multi-Story Metropolitan Villa & Residence
  // (Full 360-degree house architecture, warm brick & cedar siding, front entrance porch, multi-pane windows, balcony, garden hedges)
  const windowMaterial = isNight ? windowGlowMat : daytimeGlassMat;

  return (
    <group>
      {/* ===================================================================
          LEVEL 1: GROUND FLOOR (Warm Sandstone, Front Porch & Windows)
      =================================================================== */}
      <mesh position={[0, 2.5, 0]} geometry={geoResFloor1} material={warmSandstoneMat} castShadow receiveShadow />
      <mesh position={[0, 5.05, 0]} geometry={geoResRoofPitch} material={whiteTrimMat} scale={[1.01, 0.35, 1.01]} />

      {/* --- Front Entrance & Porch (Facing Street at Z = +8.0) --- */}
      <group position={[0, 0, 8.0]}>
        {/* Porch Steps */}
        <mesh position={[0, 0.12, 0.8]} geometry={geoResEntranceStep} material={porchStoneMat} receiveShadow />
        <mesh position={[0, 0.06, 2.0]} geometry={geoResEntranceStepLow} material={porchStoneMat} receiveShadow />

        {/* Luminous Green Interactive Floor Ring */}
        <mesh position={[0, 0.26, 0.8]} rotation={[-Math.PI / 2, 0, 0]} geometry={geoResEntranceHalo} material={greenEntranceHaloMat} />

        {/* Modern Cantilevered Entrance Portico Canopy */}
        <mesh position={[0, 3.85, 1.2]} geometry={geoLoftEntranceCanopy} material={darkMetalMat} scale={[0.9, 1, 0.9]} />
        <mesh position={[-1.2, 3.65, 1.2]} geometry={geoPorchLantern} material={windowGlowMat} scale={[0.8, 0.3, 0.8]} />
        <mesh position={[1.2, 3.65, 1.2]} geometry={geoPorchLantern} material={windowGlowMat} scale={[0.8, 0.3, 0.8]} />

        {/* Grand Double Mahogany Front Doors with Brass Handles */}
        <mesh position={[0, 1.6, 0.02]} geometry={geoResFrontDoorFrame} material={darkMetalMat} />
        <mesh position={[0, 1.5, 0.06]} geometry={geoResDoubleDoor} material={doorMahoganyMat} />
        <mesh position={[-0.15, 1.5, 0.15]} geometry={geoResDoorHandleLong} material={brassHandleMat} />
        <mesh position={[0.15, 1.5, 0.15]} geometry={geoResDoorHandleLong} material={brassHandleMat} />

        {/* Carriage Lanterns flanking door */}
        <mesh position={[-2.2, 2.2, 0.12]} geometry={geoPorchLantern} material={windowGlowMat} />
        <mesh position={[2.2, 2.2, 0.12]} geometry={geoPorchLantern} material={windowGlowMat} />
        <mesh position={[2.6, 1.6, 0.1]} geometry={geoResHousePlaque} material={warmPlaqueMat} />
      </group>

      {/* --- Ground Floor Picture Windows (South +Z, East +X, West -X, North -Z) --- */}
      <group position={[-5.0, 2.3, 8.0]}>
        <mesh position={[0, 0, 0.02]} geometry={geoResWindowLgFrame} material={darkMetalMat} />
        <mesh position={[0, 0, 0.06]} geometry={geoResWindowLgGlass} material={windowMaterial} />
      </group>
      <group position={[5.0, 2.3, 8.0]}>
        <mesh position={[0, 0, 0.02]} geometry={geoResWindowLgFrame} material={darkMetalMat} />
        <mesh position={[0, 0, 0.06]} geometry={geoResWindowLgGlass} material={windowMaterial} />
      </group>

      {/* East (+X) and West (-X) Facade Windows */}
      {[-3.0, 3.0].map((sz, i) => (
        <group key={`e-${i}`} position={[9.0, 2.3, sz]}>
          <mesh position={[0.02, 0, 0]} rotation={[0, Math.PI / 2, 0]} geometry={geoResWindowLgFrame} material={darkMetalMat} />
          <mesh position={[0.06, 0, 0]} rotation={[0, Math.PI / 2, 0]} geometry={geoResWindowLgGlass} material={windowMaterial} />
        </group>
      ))}
      {[-3.0, 3.0].map((sz, i) => (
        <group key={`w-${i}`} position={[-9.0, 2.3, sz]}>
          <mesh position={[-0.02, 0, 0]} rotation={[0, -Math.PI / 2, 0]} geometry={geoResWindowLgFrame} material={darkMetalMat} />
          <mesh position={[-0.06, 0, 0]} rotation={[0, -Math.PI / 2, 0]} geometry={geoResWindowLgGlass} material={windowMaterial} />
        </group>
      ))}

      {/* North (-Z) Facade Windows */}
      {[-4.0, 4.0].map((sx, i) => (
        <group key={`n-${i}`} position={[sx, 2.3, -8.0]}>
          <mesh position={[0, 0, -0.02]} rotation={[0, Math.PI, 0]} geometry={geoResWindowLgFrame} material={darkMetalMat} />
          <mesh position={[0, 0, -0.06]} rotation={[0, Math.PI, 0]} geometry={geoResWindowLgGlass} material={windowMaterial} />
        </group>
      ))}

      {/* ===================================================================
          LEVEL 2: SECOND FLOOR (Cantilevered Cedar Wood Siding & Balcony)
      =================================================================== */}
      <mesh position={[0, 7.4, 0]} geometry={geoResFloor2} material={cedarWoodMat} castShadow receiveShadow />
      <mesh position={[0, 9.8, 0]} geometry={geoResRoofPitch} material={whiteTrimMat} scale={[1.02, 0.35, 1.02]} />

      {/* Center Balcony on Floor 2 */}
      <group position={[0, 5.2, 9.2]}>
        <mesh geometry={geoLoftBalcony} material={darkMetalMat} scale={[1.5, 1, 1.2]} />
        <mesh position={[0, 0.55, 0.7]} geometry={geoLoftBalconyRail} material={daytimeGlassMat} scale={[1.5, 1, 1]} />
        <mesh position={[0, 1.0, 0.7]} geometry={geoResBalconyRail} material={stainlessSteelMat} scale={[0.38, 1, 1]} />
      </group>
      <group position={[0, 7.4, 8.3]}>
        <mesh position={[0, 0, 0.02]} geometry={geoPatioDoorFrame} material={darkMetalMat} />
        <mesh position={[0, 0, 0.06]} geometry={geoPatioDoorGlass} material={windowMaterial} />
        <mesh position={[-5.2, 0, 0.02]} geometry={geoResWindowLgFrame} material={darkMetalMat} />
        <mesh position={[-5.2, 0, 0.06]} geometry={geoResWindowLgGlass} material={windowMaterial} />
        <mesh position={[5.2, 0, 0.02]} geometry={geoResWindowLgFrame} material={darkMetalMat} />
        <mesh position={[5.2, 0, 0.06]} geometry={geoResWindowLgGlass} material={windowMaterial} />
      </group>

      {/* Level 2 East & West Windows */}
      {[-3.0, 3.0].map((sz, i) => (
        <group key={`l2-e-${i}`} position={[9.3, 7.4, sz]}>
          <mesh position={[0.02, 0, 0]} rotation={[0, Math.PI / 2, 0]} geometry={geoResWindowLgFrame} material={darkMetalMat} />
          <mesh position={[0.06, 0, 0]} rotation={[0, Math.PI / 2, 0]} geometry={geoResWindowLgGlass} material={windowMaterial} />
        </group>
      ))}
      {[-3.0, 3.0].map((sz, i) => (
        <group key={`l2-w-${i}`} position={[-9.3, 7.4, sz]}>
          <mesh position={[-0.02, 0, 0]} rotation={[0, -Math.PI / 2, 0]} geometry={geoResWindowLgFrame} material={darkMetalMat} />
          <mesh position={[-0.06, 0, 0]} rotation={[0, -Math.PI / 2, 0]} geometry={geoResWindowLgGlass} material={windowMaterial} />
        </group>
      ))}

      {/* ===================================================================
          LEVEL 3: TOP PENTHOUSE FLOOR & ROOFTOP DECK
      =================================================================== */}
      <mesh position={[0, 12.0, 0]} geometry={geoResFloor3} material={villaWallMat} castShadow receiveShadow />
      <mesh position={[0, 14.2, 0]} geometry={geoResRoofPitch} material={darkSlateRoofMat} scale={[0.88, 0.45, 0.88]} />

      {/* Floor 3 Front Windows */}
      <group position={[0, 12.0, 7.0]}>
        <mesh position={[-3.5, 0, 0.02]} geometry={geoResWindowLgFrame} material={darkMetalMat} />
        <mesh position={[-3.5, 0, 0.06]} geometry={geoResWindowLgGlass} material={windowMaterial} />
        <mesh position={[3.5, 0, 0.02]} geometry={geoResWindowLgFrame} material={darkMetalMat} />
        <mesh position={[3.5, 0, 0.06]} geometry={geoResWindowLgGlass} material={windowMaterial} />
      </group>

      {/* Modern Natural Stone Chimney Stack with Bronze Hood */}
      <group position={[-5.0, 16.0, -3.5]}>
        <mesh geometry={geoResChimneyModern} material={porchStoneMat} castShadow />
        <mesh position={[0, 2.85, 0]} geometry={geoChimneyCap} material={darkMetalMat} />
        <mesh position={[-0.35, 3.2, 0]} geometry={geoChimneyPot} material={stainlessSteelMat} />
        <mesh position={[0.35, 3.2, 0]} geometry={geoChimneyPot} material={stainlessSteelMat} />
      </group>

      {/* Rooftop Solar Panels */}
      <mesh position={[2.5, 14.5, -1.0]} rotation={[-0.2, 0, 0]} geometry={geoResSolarPanel} material={solarPanelMat} />
      <mesh position={[2.5, 14.5, 2.0]} rotation={[-0.2, 0, 0]} geometry={geoResSolarPanel} material={solarPanelMat} />

      {/* ===================================================================
          CURBSIDE LANDSCAPING (Manicured Hedges & Tall Italian Cypress Trees)
      =================================================================== */}
      <mesh position={[-6.0, 0.55, 9.8]} geometry={geoResHedgeBlock} material={hedgeBushMat} scale={[0.8, 1, 1]} castShadow />
      <mesh position={[6.0, 0.55, 9.8]} geometry={geoResHedgeBlock} material={hedgeBushMat} scale={[0.8, 1, 1]} castShadow />
      <mesh position={[9.8, 0.55, 0]} rotation={[0, Math.PI / 2, 0]} geometry={geoResHedgeBlock} material={hedgeBushMat} scale={[0.8, 1, 1]} castShadow />
      <mesh position={[-9.8, 0.55, 0]} rotation={[0, Math.PI / 2, 0]} geometry={geoResHedgeBlock} material={hedgeBushMat} scale={[0.8, 1, 1]} castShadow />

      <group position={[-8.0, 0, 8.8]}>
        <mesh position={[0, 0.6, 0]} geometry={geoResCypressTrunk} material={treeTrunkMat} />
        <mesh position={[0, 2.7, 0]} geometry={geoResCypressFoliage} material={hedgeBushMat} castShadow />
      </group>
      <group position={[8.0, 0, 8.8]}>
        <mesh position={[0, 0.6, 0]} geometry={geoResCypressTrunk} material={treeTrunkMat} />
        <mesh position={[0, 2.7, 0]} geometry={geoResCypressFoliage} material={hedgeBushMat} castShadow />
      </group>
    </group>
  );
});

// =========================================================================
// 9. COMPLETE NITROFUEL GAS STATION COMPLEX & CONVENIENCE MART
// =========================================================================
export const GasStationComplex: React.FC<HouseProps> = React.memo(({ isNight }) => {
  const neonCyanMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: isNight ? 3.5 : 2.0
      }),
    [isNight]
  );

  const windowGlowMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xfde047,
        emissiveIntensity: isNight ? 2.8 : 0.8
      }),
    [isNight]
  );

  return (
    <group>
      {/* --- 1. Forecourt Overhead Canopy & Fuel Pumps --- */}
      <group position={[0, 0, -4.0]}>
        {/* Large Illuminated Canopy (18m wide x 12m deep x 1.2m thick) */}
        <mesh position={[0, 5.2, 0]} geometry={geoGasCanopy} material={canopyWhiteMat} castShadow />
        {/* Illuminated Neon Cyan Canopy Edge Band */}
        <mesh position={[0, 5.2, 6.05]} geometry={geoDealershipSign} material={neonCyanMat} scale={[1.1, 0.7, 1]} />

        {/* 4 Heavy-duty Steel Canopy Support Pillars */}
        {[-6, 6].map((px, i) =>
          [-3.5, 3.5].map((pz, j) => (
            <mesh key={`${i}-${j}`} position={[px, 2.6, pz]} geometry={geoCanopyPillar} material={whiteTrimMat} />
          ))
        )}

        {/* Two Raised Concrete Pump Islands */}
        {[-4.0, 4.0].map((ix, i) => (
          <group key={i} position={[ix, 0, 0]}>
            <mesh position={[0, 0.12, 0]} geometry={geoPumpIsland} material={drivewayConcreteMat} receiveShadow />
            {/* Yellow Safety Crash Bollards */}
            <mesh position={[0, 0.45, -3.6]} geometry={geoPumpBollard} material={hazardYellowMat} />
            <mesh position={[0, 0.45, 3.6]} geometry={geoPumpBollard} material={hazardYellowMat} />

            {/* Twin Digital Fuel Dispensers */}
            {[-1.8, 1.8].map((pz, j) => (
              <group key={j} position={[0, 0.25, pz]}>
                <mesh position={[0, 0.9, 0]} geometry={geoGasPump} material={pumpBodyMat} castShadow />
                <mesh position={[0, 1.45, 0.42]} geometry={geoDoorGlassInset} material={neonCyanMat} scale={[0.6, 0.6, 1]} />
                <mesh position={[0, 1.45, -0.42]} geometry={geoDoorGlassInset} material={neonCyanMat} scale={[0.6, 0.6, 1]} />
              </group>
            ))}
          </group>
        ))}
      </group>

      {/* --- 2. NitroFuel Convenience Mart Store Building (Behind the pumps) --- */}
      <group position={[0, 0, 7.5]}>
        <mesh position={[0, 2.9, 0]} geometry={geoMartBuilding} material={buildingLightMat} castShadow receiveShadow />
        {/* Rooftop Glowing Store Sign */}
        <mesh position={[0, 6.4, -4.4]} geometry={geoMartSign} material={neonCyanMat} />

        {/* Panoramic Glass Storefront Windows */}
        <mesh position={[0, 2.0, -4.52]} geometry={geoMartGlassFront} material={windowGlowMat} />
        {/* Double Sliding Glass Entrance Doors */}
        <mesh position={[0, 1.5, -4.56]} geometry={geoLoftDoubleDoorFrame} material={whiteTrimMat} scale={[0.9, 0.9, 1]} />
      </group>

      {/* --- 3. Tall Roadside Price Totem Sign --- */}
      <group position={[9.2, 0, -11.0]}>
        <mesh position={[0, 3.75, 0]} geometry={geoPriceTotem} material={buildingSlateMat} />
        <mesh position={[0, 5.2, 0]} geometry={geoTotemScreen} material={neonCyanMat} />
      </group>
    </group>
  );
});

// =========================================================================
// 10. COMMERCIAL PLAZA & FAST-FOOD DRIVE-THRU ("SPEED BURGER & CAFE NITRO")
// =========================================================================
export const CommercialPlaza: React.FC<HouseProps> = React.memo(({ isNight }) => {
  const neonPinkMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0xff007f,
        emissive: 0xff007f,
        emissiveIntensity: isNight ? 3.5 : 2.0
      }),
    [isNight]
  );

  const neonCyanMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: isNight ? 3.5 : 2.0
      }),
    [isNight]
  );

  const windowGlowMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xfde047,
        emissiveIntensity: isNight ? 2.8 : 0.8
      }),
    [isNight]
  );

  return (
    <group>
      {/* Main Commercial Building */}
      <mesh position={[0, 3.75, 0]} geometry={geoPlazaBuilding} material={buildingLightMat} castShadow receiveShadow />

      {/* Storefront Signage */}
      <mesh position={[-4.5, 7.8, 8.1]} geometry={geoMartSign} material={neonPinkMat} scale={[0.65, 0.9, 1]} />
      <mesh position={[4.5, 7.8, 8.1]} geometry={geoMartSign} material={neonCyanMat} scale={[0.65, 0.9, 1]} />

      {/* Front Entrance & Display Windows */}
      <mesh position={[-4.5, 2.2, 8.02]} geometry={geoVillaCurtainFrame} material={darkMetalMat} />
      <mesh position={[-4.5, 2.2, 8.06]} geometry={geoVillaCurtainGlass} material={windowGlowMat} />

      <mesh position={[4.5, 2.2, 8.02]} geometry={geoVillaCurtainFrame} material={darkMetalMat} />
      <mesh position={[4.5, 2.2, 8.06]} geometry={geoVillaCurtainGlass} material={windowGlowMat} />

      {/* Awnings */}
      <mesh position={[-4.5, 4.3, 8.8]} geometry={geoStoreAwning} material={umbrellaRedMat} />
      <mesh position={[4.5, 4.3, 8.8]} geometry={geoStoreAwning} material={whiteTrimMat} />

      {/* Outdoor Patio Seating (Tables with Red Parasol Umbrellas) */}
      {[-7.0, -3.0].map((tx, i) => (
        <group key={i} position={[tx, 0, 11.5]}>
          <mesh position={[0, 0.75, 0]} geometry={geoPatioTable} material={whiteTrimMat} />
          <mesh position={[0, 2.1, 0]} geometry={geoPatioUmbrella} material={umbrellaRedMat} />
          <mesh position={[0, 1.2, 0]} geometry={geoUmbrellaPole} material={darkMetalMat} />
          {/* Chairs */}
          <mesh position={[-0.9, 0.3, 0]} geometry={geoPatioChair} material={darkMetalMat} />
          <mesh position={[0.9, 0.3, 0]} geometry={geoPatioChair} material={darkMetalMat} />
        </group>
      ))}

      {/* Drive-Thru Pickup Window on Side Wall */}
      <group position={[9.02, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 2.0, 0]} geometry={geoWindowLargeFrame} material={whiteTrimMat} />
        <mesh position={[0, 2.0, 0.05]} geometry={geoWindowLargeGlass} material={windowGlowMat} />
        <mesh position={[0, 3.4, 0.8]} geometry={geoStoreAwning} material={umbrellaRedMat} scale={[0.6, 0.7, 0.6]} />
      </group>
    </group>
  );
});

