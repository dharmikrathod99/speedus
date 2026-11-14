import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import { playerPhysics } from '../../stores/vehiclePhysics';
import { parkedVehicles, getNearestEnterableVehicle, EnterableVehicleInfo } from '../../stores/entityVehicles';
import { VEHICLES } from '../../data/vehicles';
import { VehicleMesh } from './VehicleMesh';

const ringGeo = new THREE.RingGeometry(0.55, 0.75, 32);
const markerMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });

export const ParkedVehicles: React.FC = () => {
  const mode = useGameStore((s) => s.mode);
  const ringRef = useRef<THREE.Group>(null);
  const nearestRef = useRef<EnterableVehicleInfo | null>(null);

  useFrame(({ clock }, delta) => {
    if (mode !== 'walking') {
      nearestRef.current = null;
      if (ringRef.current) {
        ringRef.current.visible = false;
        ringRef.current.position.set(0, -1000, 0);
      }
      return;
    }

    const dt = Math.min(delta, 0.05);
    const px = playerPhysics.pos.x;
    const pz = playerPhysics.pos.z;

    // Find nearest vehicle within interaction range
    nearestRef.current = getNearestEnterableVehicle(px, pz, 5.5);

    if (ringRef.current) {
      if (nearestRef.current) {
        ringRef.current.visible = true;
        const target = nearestRef.current;
        const hoverY = (target.pos.y || 0.45) + 1.8 + Math.sin(clock.getElapsedTime() * 4) * 0.12;
        ringRef.current.position.set(target.pos.x, hoverY, target.pos.z);
        ringRef.current.rotation.y += dt * 2.5;
      } else {
        // Explicitly hide and displace marker when out of range or no vehicle nearby
        ringRef.current.visible = false;
        ringRef.current.position.set(0, -1000, 0);
      }
    }
  });

  return (
    <group>
      {/* 3D Parked Showcase & Street Entity Vehicles */}
      {parkedVehicles.map((p) => {
        const def = VEHICLES[p.vehicleDefId] || Object.values(VEHICLES)[0];
        const customization = {
          color: p.color,
          finish: 'metallic' as const,
          underglow: p.color,
          spoiler: 1,
          engineLevel: 1,
          hasTurbo: true,
          brakeLevel: 1,
          suspensionLevel: 1,
          wheelColor: '#38bdf8',
          windowTint: 0.25
        };

        return (
          <group key={p.id} position={[p.x, p.y, p.z]} rotation={[0, p.heading, 0]}>
            <VehicleMesh
              def={def}
              customization={customization}
              steerAngle={0}
              wheelSpin={0}
              isBraking={false}
              isReversing={false}
              headlightsOn={false}
              hazardsOn={false}
              isBoosting={false}
            />
          </group>
        );
      })}

      {/* Holographic Entry Marker hovering above nearest enterable car */}
      {mode === 'walking' && (
        <group ref={ringRef} position={[0, -100, 0]}>
          <pointLight color="#00f0ff" intensity={4} distance={5} />
          <mesh rotation={[Math.PI / 2, 0, 0]} geometry={ringGeo} material={markerMat} />
        </group>
      )}
    </group>
  );
};

