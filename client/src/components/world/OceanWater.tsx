import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const OceanWater: React.FC = () => {
  const waterMeshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (waterMeshRef.current) {
      const t = clock.getElapsedTime();
      // Gentle surface shimmer/wave oscillation
      waterMeshRef.current.position.y = -0.4 + Math.sin(t * 1.2) * 0.08;
    }
  });

  return (
    <group position={[-200, 0, 0]}>
      {/* Ocean Water Plane (High-Performance standard material, zero transmission pass lag) */}
      <mesh ref={waterMeshRef} position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[220, 500, 16, 16]} />
        <meshStandardMaterial
          color="#0284c7"
          roughness={0.15}
          metalness={0.2}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Sandy Beach Shore */}
      <mesh position={[60, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 500]} />
        <meshStandardMaterial color="#fef08a" roughness={0.95} />
      </mesh>

      {/* Beach Umbrellas & Lounge Chairs */}
      {[-100, -50, 0, 50, 100].map((pz, idx) => (
        <group key={idx} position={[55, 0, pz]}>
          {/* Umbrella pole */}
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 2.4, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          {/* Umbrella canopy */}
          <mesh position={[0, 2.3, 0]}>
            <coneGeometry args={[1.6, 0.6, 12]} />
            <meshStandardMaterial color={idx % 2 === 0 ? '#ff007f' : '#00f0ff'} />
          </mesh>
          {/* Lounge chair */}
          <mesh position={[0.8, 0.2, 0]} rotation={[0, Math.PI / 6, 0]}>
            <boxGeometry args={[1.8, 0.15, 0.6]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

