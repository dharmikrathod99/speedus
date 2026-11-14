import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import { playerPhysics, vehiclePhysics } from '../../stores/vehiclePhysics';
import { soundSystem } from '../../audio/soundSystem';
import { getNearestEnterableVehicle } from '../../stores/entityVehicles';
import { CITY_SHOPS } from '../../data/shopsData';

// Static Geometries & Materials for Holographic Stunt Ramp Beacons
const geoStuntBeam = new THREE.CylinderGeometry(1.4, 1.4, 45, 16);
const geoStuntRingOuter = new THREE.RingGeometry(3.2, 3.8, 32);
const geoStuntRingInner = new THREE.RingGeometry(1.8, 2.3, 32);
const geoStuntMarkerDiamond = new THREE.OctahedronGeometry(1.2, 0);

const matStuntBeam = new THREE.MeshBasicMaterial({
  color: 0xf97316,
  transparent: true,
  opacity: 0.35,
  side: THREE.DoubleSide
});

const matStuntRing = new THREE.MeshBasicMaterial({
  color: 0xfb923c,
  side: THREE.DoubleSide
});

const matStuntDiamond = new THREE.MeshStandardMaterial({
  color: 0xffedd5,
  emissive: 0xf97316,
  emissiveIntensity: 3.5,
  roughness: 0.2
});

export const MissionWaypoints: React.FC = () => {
  const activeMission = useGameStore((s) => s.activeMission);
  const updateMissionProgress = useGameStore((s) => s.updateMissionProgress);
  const customWaypoint = useGameStore((s) => s.customWaypoint);
  const setCustomWaypoint = useGameStore((s) => s.setCustomWaypoint);
  const mode = useGameStore((s) => s.mode);
  const setActiveScreen = useGameStore((s) => s.setActiveScreen);
  const refuel = useGameStore((s) => s.refuelVehicle);
  const repairVehicle = useGameStore((s) => s.repairVehicle);
  const showNotification = useGameStore((s) => s.showNotification);

  const ringRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const customRingRef = useRef<THREE.Mesh>(null);

  const stuntRing1Ref = useRef<THREE.Mesh>(null);
  const stuntRing2Ref = useRef<THREE.Mesh>(null);
  const stuntDiamond1Ref = useRef<THREE.Mesh>(null);
  const stuntDiamond2Ref = useRef<THREE.Mesh>(null);

  // Keyboard trigger for POIs & Driveway Valet when on foot or vehicle
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      const k = e.key.toLowerCase();
      if (k !== 'e') return;

      const px = mode === 'driving' ? vehiclePhysics.pos.x : playerPhysics.pos.x;
      const pz = mode === 'driving' ? vehiclePhysics.pos.z : playerPhysics.pos.z;

      // Ignore outdoor POIs if currently inside house or inside shop
      const state = useGameStore.getState();
      if (state.isInsideHouse || state.isInsideShop) return;

      // 1. Driveway Valet Service on [E]
      if (mode === 'walking') {
        const distSuburbanDriveway1 = Math.hypot(px - 23, pz - 23);
        const distSuburbanDriveway2 = Math.hypot(px - (-23), pz - 23);
        const distLoftDriveway = Math.hypot(px - 48, pz - (-48));

        if (distSuburbanDriveway1 < 5.0 || distSuburbanDriveway2 < 5.0 || distLoftDriveway < 5.0) {
          repairVehicle();
          refuel();
          soundSystem.playUiClick();
          showNotification(
            '🚗 DRIVEWAY VALET SERVICE',
            'Vehicle 100% repaired, polished, and fully refueled at the driveway!',
            'success'
          );
          return;
        }
      }

      // 3. Check distance to Dealership on [E]
      const distDealership = Math.min(Math.hypot(px - 22, pz - 48), Math.hypot(px - 35, pz - 45));
      if (distDealership < 10.0) {
        setActiveScreen('dealership');
        return;
      }

      // 4. Check distance to Garage on [E]
      const distGarage = Math.min(Math.hypot(px - (-92), pz - 48), Math.hypot(px - (-45), pz - 65));
      if (distGarage < 10.0) {
        setActiveScreen('garage');
        return;
      }

      // 5. Check distance to Gas Station on [E]
      const distGas = Math.min(Math.hypot(px - 22, pz - (-48)), Math.hypot(px - 0, pz - (-55)));
      if (distGas < 10.0) {
        refuel();
        showNotification('⛽ FUEL RECHARGED', 'Tank refilled to 100% capacity.', 'success');
        return;
      }

      // 6. Check distance to Loft on [E]
      const distLoft = Math.min(Math.hypot(px - 48, pz - (-48)), Math.hypot(px - 60, pz - (-40)));
      if (distLoft < 8.0) {
        setActiveScreen('property');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, setActiveScreen, refuel, repairVehicle, showNotification]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    updateMissionProgress(dt);

    if (ringRef.current) {
      ringRef.current.rotation.z += dt * 1.5;
    }

    if (customRingRef.current) {
      customRingRef.current.rotation.z += dt * 1.8;
    }

    // Check arrival at custom GPS waypoint
    if (customWaypoint) {
      const px = mode === 'driving' ? vehiclePhysics.pos.x : playerPhysics.pos.x;
      const pz = mode === 'driving' ? vehiclePhysics.pos.z : playerPhysics.pos.z;
      const dist = Math.hypot(px - customWaypoint[0], pz - customWaypoint[2]);
      if (dist < 6.0) {
        setCustomWaypoint(null);
        soundSystem.playUiClick();
        showNotification('📍 Waypoint Reached', 'Arrived at your custom GPS destination!', 'success');
      }
    }

    // Animate Stunt Ramp Waypoint Rings & Diamonds
    if (stuntRing1Ref.current) stuntRing1Ref.current.rotation.z += dt * 2.0;
    if (stuntRing2Ref.current) stuntRing2Ref.current.rotation.z -= dt * 2.0;

    if (stuntDiamond1Ref.current) {
      stuntDiamond1Ref.current.rotation.y += dt * 2.5;
      stuntDiamond1Ref.current.position.y = 4.5 + Math.sin(Date.now() * 0.003) * 0.4;
    }
    if (stuntDiamond2Ref.current) {
      stuntDiamond2Ref.current.rotation.y += dt * 2.5;
      stuntDiamond2Ref.current.position.y = 4.5 + Math.sin(Date.now() * 0.003 + 1.5) * 0.4;
    }
  });

  return (
    <group>
      {/* Active Mission 3D Waypoint Beam & Rings */}
      {activeMission && (
        <group position={activeMission.targetPosition}>
          {/* Tall Vertical Holographic Light Beam */}
          <mesh ref={beamRef} position={[0, 25, 0]}>
            <cylinderGeometry args={[1.2, 1.2, 50, 16]} />
            <meshBasicMaterial
              color={activeMission.type === 'racing' ? '#ec4899' : '#00f0ff'}
              transparent
              opacity={0.35}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Rotating Ground Target Rings */}
          <mesh ref={ringRef} position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.5, 3.2, 32]} />
            <meshBasicMaterial
              color={activeMission.type === 'racing' ? '#ec4899' : '#00f0ff'}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Point light */}
          <pointLight
            color={activeMission.type === 'racing' ? '#ec4899' : '#00f0ff'}
            intensity={4}
            distance={15}
            position={[0, 2, 0]}
          />
        </group>
      )}

      {/* Custom Pinned GPS Waypoint 3D Hologram Beacon */}
      {customWaypoint && (
        <group position={customWaypoint}>
          <mesh position={[0, 25, 0]}>
            <cylinderGeometry args={[1.2, 1.2, 50, 16]} />
            <meshBasicMaterial color="#ec4899" transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
          <mesh ref={customRingRef} position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.5, 3.2, 32]} />
            <meshBasicMaterial color="#ec4899" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 4.5, 0]} geometry={geoStuntMarkerDiamond} material={matStuntDiamond} />
          <pointLight color="#ec4899" intensity={5} distance={20} position={[0, 3, 0]} />
        </group>
      )}

      {/* 3D Holographic Stunt Ramp Location Beacons (Visible across the city sky) */}
      {/* 1. Beachfront Stunt Arena Beacon (Relocated safely to open beach lot, completely clear of roadway) */}
      <group position={[-93, 0, 23]}>
        <mesh position={[0, 22.5, 0]} geometry={geoStuntBeam} material={matStuntBeam} />
        <mesh
          ref={stuntRing1Ref}
          position={[0, 0.25, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          geometry={geoStuntRingOuter}
          material={matStuntRing}
        />
        <mesh
          ref={stuntRing2Ref}
          position={[0, 0.28, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          geometry={geoStuntRingInner}
          material={matStuntRing}
        />
        <mesh ref={stuntDiamond1Ref} position={[0, 4.5, 0]} geometry={geoStuntMarkerDiamond} material={matStuntDiamond} />
        <pointLight color="#f97316" intensity={5} distance={20} position={[0, 3, 0]} />
      </group>

      {/* 2. Urban Stunt Park Launch Ramp Beacon */}
      <group position={[23, 0, 47]}>
        <mesh position={[0, 22.5, 0]} geometry={geoStuntBeam} material={matStuntBeam} />
        <mesh
          position={[0, 0.25, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          geometry={geoStuntRingOuter}
          material={matStuntRing}
        />
        <mesh ref={stuntDiamond2Ref} position={[0, 4.5, 0]} geometry={geoStuntMarkerDiamond} material={matStuntDiamond} />
        <pointLight color="#f97316" intensity={5} distance={20} position={[0, 3, 0]} />
      </group>

      {/* POI Interaction Beacons when walking */}
      {mode === 'walking' && (
        <>
          {/* Dealership POI */}
          <group position={[22, 0.1, 40]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[2.0, 2.5, 32]} />
              <meshBasicMaterial color="#00f0ff" side={THREE.DoubleSide} />
            </mesh>
          </group>

          {/* Garage POI */}
          <group position={[-92, 0.1, 40]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[2.0, 2.5, 32]} />
              <meshBasicMaterial color="#ff007f" side={THREE.DoubleSide} />
            </mesh>
          </group>

          {/* Gas Station & Convenience Mart POI */}
          <group position={[22, 0.1, -40]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[2.0, 2.5, 32]} />
              <meshBasicMaterial color="#10b981" side={THREE.DoubleSide} />
            </mesh>
          </group>
        </>
      )}
      </group>
  );
};
