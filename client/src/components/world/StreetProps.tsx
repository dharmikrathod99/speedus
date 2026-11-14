import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';

export const StreetProps: React.FC = () => {
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const isNight = timeOfDay < 6.5 || timeOfDay > 18.5;

  const metalMat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 }), []);
  const trunkMat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 }), []);
  const frondMat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 }), []);

  const streetlightGlow = useMemo(() => new THREE.MeshBasicMaterial({
    color: isNight ? 0xfef08a : 0xcccccc
  }), [isNight]);

  // Streetlight locations along boulevards
  const lightPositions: [number, number, number][] = [
    [-100, 0, 10], [-50, 0, 10], [0, 0, 10], [50, 0, 10], [100, 0, 10],
    [-100, 0, -10], [-50, 0, -10], [0, 0, -10], [50, 0, -10], [100, 0, -10],
    [-100, 0, 70], [-50, 0, 70], [0, 0, 70], [50, 0, 70], [100, 0, 70],
    [-100, 0, -70], [-50, 0, -70], [0, 0, -70], [50, 0, -70], [100, 0, -70]
  ];

  // Palm tree locations along Ocean drive
  const palmPositions: [number, number, number][] = [
    [-110, 0, -80], [-110, 0, -40], [-110, 0, 0], [-110, 0, 40], [-110, 0, 80],
    [-130, 0, -60], [-130, 0, -20], [-130, 0, 20], [-130, 0, 60]
  ];

  return (
    <group>
      {/* Streetlights */}
      {lightPositions.map(([x, y, z], idx) => (
        <group key={idx} position={[x, y, z]}>
          {/* Vertical Pole */}
          <mesh position={[0, 4, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.16, 8, 12]} />
            <primitive object={metalMat} attach="material" />
          </mesh>
          {/* Overhanging Arm */}
          <mesh position={[0.8, 7.8, 0]} rotation={[0, 0, Math.PI / 4]}>
            <cylinderGeometry args={[0.08, 0.08, 1.8, 8]} />
            <primitive object={metalMat} attach="material" />
          </mesh>
          {/* Lamp Head */}
          <mesh position={[1.4, 8.2, 0]}>
            <boxGeometry args={[0.4, 0.15, 0.6]} />
            <primitive object={streetlightGlow} attach="material" />
          </mesh>
          {/* Night Spotlight shining down */}
          {isNight && (
            <spotLight
              position={[1.4, 8.2, 0]}
              target-position={[1.4, 0, 0]}
              color="#fef08a"
              intensity={4.5}
              distance={25}
              angle={0.7}
              penumbra={0.6}
            />
          )}
        </group>
      ))}

      {/* Palm Trees along coastal boulevard */}
      {palmPositions.map(([px, py, pz], idx) => (
        <group key={idx} position={[px, py, pz]}>
          {/* Curved Trunk */}
          <mesh position={[0, 3.5, 0]} rotation={[0.08, 0, 0.05]} castShadow>
            <cylinderGeometry args={[0.22, 0.38, 7, 10]} />
            <primitive object={trunkMat} attach="material" />
          </mesh>
          {/* Palm Fronds Foliage */}
          <group position={[0.3, 7, 0.2]}>
            {[0, 1, 2, 3, 4, 5].map((fi) => {
              const ang = (fi * Math.PI) / 3;
              return (
                <mesh
                  key={fi}
                  position={[Math.cos(ang) * 1.6, -0.4, Math.sin(ang) * 1.6]}
                  rotation={[0.3, ang, 0]}
                  castShadow
                >
                  <boxGeometry args={[0.8, 0.06, 2.4]} />
                  <primitive object={frondMat} attach="material" />
                </mesh>
              );
            })}
          </group>
        </group>
      ))}

      {/* Overhead Highway Directional Gantry Signs */}
      <group position={[0, 0, 25]}>
        {/* Support columns */}
        <mesh position={[-10, 4, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 8, 12]} />
          <primitive object={metalMat} attach="material" />
        </mesh>
        <mesh position={[10, 4, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 8, 12]} />
          <primitive object={metalMat} attach="material" />
        </mesh>
        {/* Cross truss */}
        <mesh position={[0, 7.5, 0]}>
          <boxGeometry args={[20.5, 0.6, 0.6]} />
          <primitive object={metalMat} attach="material" />
        </mesh>
        {/* Highway Sign Plate (Green) */}
        <mesh position={[0, 7.5, 0.4]}>
          <boxGeometry args={[14, 2.4, 0.2]} />
          <meshStandardMaterial color="#15803d" />
        </mesh>
      </group>
    </group>
  );
};

