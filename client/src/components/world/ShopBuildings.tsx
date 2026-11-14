import React, { useMemo } from 'react';
import * as THREE from 'three';
import { CityShop } from '../../types/game';
import { useGameStore } from '../../stores/gameStore';

// =========================================================================
// STATIC CACHED GEOMETRIES (Zero GC Allocations at Runtime)
// =========================================================================
const geoShopMain = new THREE.BoxGeometry(16, 7.5, 14);
const geoShopEntranceGlass = new THREE.BoxGeometry(7.2, 4.2, 0.15);
const geoShopAwning = new THREE.BoxGeometry(8.2, 0.4, 2.4);
const geoShopSignBoard = new THREE.BoxGeometry(11.2, 1.4, 0.35);
const geoShopDoorFrame = new THREE.BoxGeometry(2.6, 2.9, 0.22);
const geoShopDoorGlass = new THREE.BoxGeometry(2.3, 2.65, 0.12);
const geoShopDoorHandle = new THREE.BoxGeometry(0.06, 0.9, 0.1);
const geoShopFloorHalo = new THREE.RingGeometry(1.2, 1.55, 24);
const geoShopStep = new THREE.BoxGeometry(4.2, 0.2, 2.0);
const geoShopDisplayCounter = new THREE.BoxGeometry(4.8, 1.0, 1.2);
const geoShopDisplayShelf = new THREE.BoxGeometry(4.2, 2.4, 0.6);
const geoShopPillar = new THREE.BoxGeometry(0.4, 7.5, 0.4);
const geoRoofParapet = new THREE.BoxGeometry(16.4, 0.5, 14.4);

// Architectural Accent Geometries for Specific Store Types
const geoHospitalCrossH = new THREE.BoxGeometry(2.6, 0.75, 0.25);
const geoHospitalCrossV = new THREE.BoxGeometry(0.75, 2.6, 0.25);
const geoPizzaSignPlate = new THREE.CylinderGeometry(1.4, 1.4, 0.2, 16);
const geoPizzaCrust = new THREE.CylinderGeometry(1.5, 1.5, 0.1, 16);
const geoBurgerBunTop = new THREE.SphereGeometry(1.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
const geoBurgerPatty = new THREE.CylinderGeometry(1.25, 1.25, 0.35, 16);
const geoBurgerBunBot = new THREE.CylinderGeometry(1.2, 1.2, 0.25, 16);
const geoGymBarbell = new THREE.CylinderGeometry(0.08, 0.08, 3.2, 8);
const geoGymWeight = new THREE.CylinderGeometry(0.65, 0.65, 0.25, 16);
const geoPoliceBeacon = new THREE.CylinderGeometry(0.3, 0.35, 0.7, 12);
const geoCollegiatePediment = new THREE.ConeGeometry(5.2, 2.2, 4);
const geoClockFace = new THREE.CylinderGeometry(0.85, 0.85, 0.1, 16);
const geoMallArch = new THREE.TorusGeometry(3.6, 0.35, 8, 24, Math.PI);
const geoProduceCrate = new THREE.BoxGeometry(1.2, 0.45, 0.8);
const geoBistroTable = new THREE.CylinderGeometry(0.65, 0.65, 0.06, 12);
const geoBistroChair = new THREE.BoxGeometry(0.45, 0.55, 0.45);
const geoBistroUmbrella = new THREE.ConeGeometry(1.5, 0.75, 12);
const geoUmbrellaPole = new THREE.CylinderGeometry(0.03, 0.03, 2.0, 6);

// Shared Static Base Materials
const whiteTrimMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 });
const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.7 });
const brassHandleMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.25, metalness: 0.85 });
const stepStoneMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });
const daytimeGlassMat = new THREE.MeshStandardMaterial({
  color: 0x38bdf8,
  roughness: 0.15,
  metalness: 0.75,
  transparent: true,
  opacity: 0.82
});
const woodCrateMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });
const burgerBunMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
const burgerMeatMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });

export const ShopBuilding: React.FC<{ shop: CityShop; isNight: boolean }> = React.memo(({ shop, isNight }) => {
  // Theme Materials
  const themeSignMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: shop.accentColor,
        emissive: shop.accentColor,
        emissiveIntensity: isNight ? 3.8 : 1.8
      }),
    [shop.accentColor, isNight]
  );

  const themeHaloMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: shop.accentColor,
        transparent: true,
        opacity: isNight ? 0.9 : 0.7
      }),
    [shop.accentColor, isNight]
  );

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

  // Exterior Wall Texture by Shop Type
  const wallMat = useMemo(() => {
    switch (shop.type) {
      case 'vegetable':
        return new THREE.MeshStandardMaterial({ color: 0xecfdf5, roughness: 0.6 }); // Crisp organic mint
      case 'gym':
        return new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.3 }); // Dark athletic slate
      case 'pharmacy':
        return new THREE.MeshStandardMaterial({ color: 0xf0fdfa, roughness: 0.3 }); // Clinical cyan/white
      case 'hospital':
        return new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 }); // Hospital white
      case 'school':
        return new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 }); // Ivy-league collegiate brick
      case 'police':
        return new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.4 }); // Heavy police precinct concrete
      case 'mall':
        return new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.35 }); // Cream luxury travertine
      case 'electronics':
        return new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.25, metalness: 0.8 }); // Cyberpunk obsidian
      case 'cafe':
        return new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.65 }); // Warm roasted coffee brick
      case 'pizza':
        return new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.7 }); // Italian brick-oven red
      case 'restaurant':
        return new THREE.MeshStandardMaterial({ color: 0x172554, roughness: 0.3, metalness: 0.4 }); // Royal midnight bistro
      case 'burger':
        return new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.5 }); // Retro diner red
      default:
        return new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 });
    }
  }, [shop.type]);

  const awningMat = useMemo(() => {
    switch (shop.type) {
      case 'vegetable':
        return new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 });
      case 'cafe':
        return new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
      case 'pizza':
        return new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
      case 'burger':
        return new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });
      case 'restaurant':
        return new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.4 });
      case 'mall':
        return new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.6 });
      default:
        return darkMetalMat;
    }
  }, [shop.type]);

  const handleEntranceClick = (e: any) => {
    e.stopPropagation();
    useGameStore.getState().enterShopInterior(shop.id);
  };

  return (
    <group position={shop.localPos} rotation={[0, shop.localPos[2] > 0 ? Math.PI : 0, 0]}>
      {/* --- Main Storefront Building Structure (16m wide x 7.5m high x 14m deep) --- */}
      <mesh position={[0, 3.75, 0]} geometry={geoShopMain} material={wallMat} castShadow receiveShadow />

      {/* Modern Roof Parapet Rim */}
      <mesh position={[0, 7.6, 0]} geometry={geoRoofParapet} material={whiteTrimMat} />

      {/* ===================================================================
          FRONT FACADE & ENTRANCE (Facing Sidewalk at Z = +7.0)
      =================================================================== */}
      <group position={[0, 0, 7.0]}>
        {/* Raised Entrance Step */}
        <mesh position={[0, 0.1, 0.8]} geometry={geoShopStep} material={stepStoneMat} receiveShadow />

        {/* Luminous Interactive Entrance Floor Ring with Store Theme Color (Click to enter 3D interior) */}
        <mesh
          position={[0, 0.22, 0.8]}
          rotation={[-Math.PI / 2, 0, 0]}
          geometry={geoShopFloorHalo}
          material={themeHaloMat}
          onClick={handleEntranceClick}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'default'; }}
        />

        {/* Panoramic Storefront Showroom Glass Curtain */}
        <mesh position={[0, 2.5, 0.05]} geometry={geoShopEntranceGlass} material={windowMaterial} />

        {/* Main Double Entrance Glass Doors (Click to enter 3D interior) */}
        <mesh
          position={[0, 1.5, 0.08]}
          geometry={geoShopDoorFrame}
          material={darkMetalMat}
          onClick={handleEntranceClick}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'default'; }}
        />
        <mesh
          position={[0, 1.45, 0.12]}
          geometry={geoShopDoorGlass}
          material={windowMaterial}
          onClick={handleEntranceClick}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'default'; }}
        />
        {/* Polished Brass Pull Handles */}
        <mesh position={[-0.15, 1.45, 0.2]} geometry={geoShopDoorHandle} material={brassHandleMat} />
        <mesh position={[0.15, 1.45, 0.2]} geometry={geoShopDoorHandle} material={brassHandleMat} />

        {/* Overhead Modern Weather Awning / Portico Canopy */}
        <mesh position={[0, 4.3, 1.2]} geometry={geoShopAwning} material={awningMat} castShadow />

        {/* Giant Illuminated Brand Marquee Signboard */}
        <mesh position={[0, 5.6, 0.25]} geometry={geoShopSignBoard} material={darkMetalMat} />
        <mesh position={[0, 5.6, 0.44]} geometry={geoShopSignBoard} material={themeSignMat} scale={[0.96, 0.75, 0.5]} />

        {/* Recessed Warm Entrance Downlights */}
        <pointLight color={shop.accentColor} intensity={isNight ? 4 : 2} distance={8} position={[0, 4.0, 1.2]} />
      </group>

      {/* ===================================================================
          STORE-SPECIFIC 3D ARCHITECTURAL DETAILS & SIGNATURE ROOF MODELS
      =================================================================== */}

      {/* 1. FRESH VEGETABLE MARKET: Outdoor Produce Display Crates */}
      {shop.type === 'vegetable' && (
        <group position={[0, 0, 7.8]}>
          <mesh position={[-3.6, 0.25, 0]} geometry={geoProduceCrate} material={woodCrateMat} />
          <mesh position={[-3.6, 0.45, 0]} geometry={geoProduceCrate} material={wallMat} scale={[0.9, 0.3, 0.9]} />
          <mesh position={[3.6, 0.25, 0]} geometry={geoProduceCrate} material={woodCrateMat} />
          <mesh position={[3.6, 0.45, 0]} geometry={geoProduceCrate} material={wallMat} scale={[0.9, 0.3, 0.9]} />
        </group>
      )}

      {/* 2. FITNESS GYM: Rooftop Golden Barbell Model */}
      {shop.type === 'gym' && (
        <group position={[0, 8.8, 4]}>
          <mesh rotation={[0, 0, Math.PI / 2]} geometry={geoGymBarbell} material={brassHandleMat} />
          <mesh position={[-1.2, 0, 0]} rotation={[0, 0, Math.PI / 2]} geometry={geoGymWeight} material={darkMetalMat} />
          <mesh position={[-0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]} geometry={geoGymWeight} material={darkMetalMat} scale={[0.8, 1, 0.8]} />
          <mesh position={[1.2, 0, 0]} rotation={[0, 0, Math.PI / 2]} geometry={geoGymWeight} material={darkMetalMat} />
          <mesh position={[0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]} geometry={geoGymWeight} material={darkMetalMat} scale={[0.8, 1, 0.8]} />
        </group>
      )}

      {/* 3. PHARMACY & HOSPITAL: Illuminated Red/Green Medical Cross Sign */}
      {(shop.type === 'pharmacy' || shop.type === 'hospital') && (
        <group position={[0, 8.8, 5]}>
          <mesh geometry={geoHospitalCrossH} material={themeSignMat} />
          <mesh geometry={geoHospitalCrossV} material={themeSignMat} />
        </group>
      )}

      {/* 4. SCHOOL / ACADEMY: Classical Clock Tower & Pediment */}
      {shop.type === 'school' && (
        <group position={[0, 8.6, 4]}>
          <mesh position={[0, 0.8, 0]} rotation={[0, Math.PI / 4, 0]} geometry={geoCollegiatePediment} material={whiteTrimMat} />
          <mesh position={[0, 0.8, 1.4]} rotation={[Math.PI / 2, 0, 0]} geometry={geoClockFace} material={brassHandleMat} />
        </group>
      )}

      {/* 5. POLICE STATION: Flashing Blue & Red Tactical Beacon */}
      {shop.type === 'police' && (
        <group position={[0, 8.2, 5]}>
          <mesh position={[-1.4, 0, 0]} geometry={geoPoliceBeacon} material={themeSignMat} />
          <mesh position={[1.4, 0, 0]} geometry={geoPoliceBeacon} material={new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: isNight ? 4 : 2 })} />
        </group>
      )}

      {/* 6. LUXURY MALL: Grand Glass Arch Atrium */}
      {shop.type === 'mall' && (
        <group position={[0, 5.0, 7.2]}>
          <mesh geometry={geoMallArch} material={brassHandleMat} />
        </group>
      )}

      {/* 7. CAFE: Sidewalk Bistro Tables & Umbrella */}
      {shop.type === 'cafe' && (
        <group position={[4.6, 0, 8.4]}>
          <mesh position={[0, 0.45, 0]} geometry={geoBistroTable} material={darkMetalMat} />
          <mesh position={[-0.6, 0.3, 0]} geometry={geoBistroChair} material={woodCrateMat} />
          <mesh position={[0.6, 0.3, 0]} geometry={geoBistroChair} material={woodCrateMat} />
          <mesh position={[0, 1.0, 0]} geometry={geoUmbrellaPole} material={brassHandleMat} />
          <mesh position={[0, 1.8, 0]} geometry={geoBistroUmbrella} material={awningMat} />
        </group>
      )}

      {/* 8. PIZZERIA: Giant Rooftop Pepperoni Pizza Sign */}
      {shop.type === 'pizza' && (
        <group position={[0, 9.2, 4]} rotation={[-Math.PI / 6, 0, 0]}>
          <mesh geometry={geoPizzaCrust} material={burgerBunMat} />
          <mesh position={[0, 0.08, 0]} geometry={geoPizzaSignPlate} material={themeSignMat} />
        </group>
      )}

      {/* 9. BURGER SHACK: Giant Rooftop Smash Burger Model */}
      {shop.type === 'burger' && (
        <group position={[0, 8.8, 4]}>
          <mesh position={[0, 0.1, 0]} geometry={geoBurgerBunBot} material={burgerBunMat} />
          <mesh position={[0, 0.45, 0]} geometry={geoBurgerPatty} material={burgerMeatMat} />
          <mesh position={[0, 0.75, 0]} geometry={geoBurgerBunTop} material={burgerBunMat} />
        </group>
      )}
    </group>
  );
});

