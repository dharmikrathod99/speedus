import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';

export const CityBuildings: React.FC = () => {
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const isNight = timeOfDay < 6.0 || timeOfDay > 19.0;

  // Modern vibrant building materials
  const concreteDark = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 }), []);
  const concreteLight = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 }), []);
  const glassTowerMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: 0x0284c7,
    metalness: 0.7,
    roughness: 0.15,
    reflectivity: 0.95
  }), []);

  // Window glow
  const windowGlowMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfde047,
    emissiveIntensity: isNight ? 2.8 : 0.8,
    roughness: 0.2
  }), [isNight]);

  const neonCyanMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    emissive: 0x00f0ff,
    emissiveIntensity: isNight ? 3.5 : 1.8
  }), [isNight]);

  const neonPinkMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xff007f,
    emissive: 0xff007f,
    emissiveIntensity: isNight ? 3.5 : 1.8
  }), [isNight]);

  // Skyscraper Generator Helper
  const Skyscraper = ({
    x,
    z,
    width = 24,
    depth = 24,
    height = 70,
    hasHelipad = false
  }: {
    x: number;
    z: number;
    width?: number;
    depth?: number;
    height?: number;
    hasHelipad?: boolean;
  }) => {
    return (
      <group position={[x, height / 2, z]}>
        {/* Core structure */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[width, height, depth]} />
          <primitive object={glassTowerMat} attach="material" />
        </mesh>

        {/* Concrete corner pillars */}
        <mesh position={[-width / 2 + 0.4, 0, -depth / 2 + 0.4]} castShadow>
          <boxGeometry args={[1.5, height + 0.2, 1.5]} />
          <primitive object={concreteDark} attach="material" />
        </mesh>
        <mesh position={[width / 2 - 0.4, 0, -depth / 2 + 0.4]} castShadow>
          <boxGeometry args={[1.5, height + 0.2, 1.5]} />
          <primitive object={concreteDark} attach="material" />
        </mesh>
        <mesh position={[-width / 2 + 0.4, 0, depth / 2 - 0.4]} castShadow>
          <boxGeometry args={[1.5, height + 0.2, 1.5]} />
          <primitive object={concreteDark} attach="material" />
        </mesh>
        <mesh position={[width / 2 - 0.4, 0, depth / 2 - 0.4]} castShadow>
          <boxGeometry args={[1.5, height + 0.2, 1.5]} />
          <primitive object={concreteDark} attach="material" />
        </mesh>

        {/* Illuminated Window Bands */}
        {[-height * 0.35, -height * 0.15, height * 0.05, height * 0.25].map((yOffset, i) => (
          <mesh key={i} position={[0, yOffset, 0]}>
            <boxGeometry args={[width + 0.1, 1.8, depth + 0.1]} />
            <primitive object={windowGlowMat} attach="material" />
          </mesh>
        ))}

        {/* Rooftop Helipad / Spire */}
        {hasHelipad ? (
          <group position={[0, height / 2 + 0.4, 0]}>
            <mesh receiveShadow>
              <cylinderGeometry args={[width * 0.38, width * 0.38, 0.4, 24]} />
              <primitive object={concreteDark} attach="material" />
            </mesh>
            <mesh position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[width * 0.25, width * 0.28, 24]} />
              <primitive object={neonCyanMat} attach="material" />
            </mesh>
          </group>
        ) : (
          <group position={[0, height / 2 + 6, 0]}>
            <mesh>
              <cylinderGeometry args={[0.2, 0.8, 12, 8]} />
              <primitive object={concreteLight} attach="material" />
            </mesh>
            <mesh position={[0, 6.2, 0]}>
              <sphereGeometry args={[0.4, 8, 8]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
          </group>
        )}
      </group>
    );
  };

  return (
    <group>
      {/* 1. DOWNTOWN FINANCIAL DISTRICT SKYSCRAPERS */}
      <Skyscraper x={40} z={-90} width={28} depth={28} height={110} hasHelipad />
      <Skyscraper x={-40} z={-90} width={24} depth={24} height={90} />
      <Skyscraper x={120} z={-40} width={22} depth={22} height={85} />
      <Skyscraper x={120} z={40} width={26} depth={26} height={95} hasHelipad />
      <Skyscraper x={40} z={90} width={24} depth={24} height={78} />
      <Skyscraper x={-40} z={90} width={28} depth={28} height={105} hasHelipad />
      <Skyscraper x={-120} z={40} width={22} depth={22} height={65} />
      <Skyscraper x={-120} z={-40} width={24} depth={24} height={72} />

      {/* Cyber Neon Billboard atop building */}
      <group position={[40, 65, 80]}>
        <mesh>
          <boxGeometry args={[18, 5, 0.5]} />
          <primitive object={concreteDark} attach="material" />
        </mesh>
        <mesh position={[0, 0, 0.3]}>
          <planeGeometry args={[17.5, 4.5]} />
          <primitive object={neonCyanMat} attach="material" />
        </mesh>
      </group>

      {/* 2. APEX SUPERCAR DEALERSHIP SHOWROOM ([35, 0, 45]) */}
      <group position={[35, 0, 45]}>
        <mesh position={[0, 4, 0]} castShadow receiveShadow>
          <boxGeometry args={[30, 8, 24]} />
          <primitive object={concreteLight} attach="material" />
        </mesh>
        <mesh position={[0, 3.8, 12.1]}>
          <planeGeometry args={[28, 7.2]} />
          <primitive object={glassTowerMat} attach="material" />
        </mesh>
        <mesh position={[0, 8.8, 12.2]}>
          <boxGeometry args={[20, 1.6, 0.4]} />
          <primitive object={neonCyanMat} attach="material" />
        </mesh>
        <group position={[-6, 0.5, 4]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[3.2, 3.5, 0.6, 32]} />
            <primitive object={concreteLight} attach="material" />
          </mesh>
          <pointLight color="#00f0ff" intensity={4} distance={12} position={[0, 2, 0]} />
        </group>
        <group position={[6, 0.5, 4]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[3.2, 3.5, 0.6, 32]} />
            <primitive object={concreteLight} attach="material" />
          </mesh>
          <pointLight color="#ff007f" intensity={4} distance={12} position={[0, 2, 0]} />
        </group>
        <mesh position={[0, 0.1, 15]}>
          <ringGeometry args={[1.5, 2.0, 32]} />
          <primitive object={neonCyanMat} attach="material" />
        </mesh>
      </group>

      {/* 3. SPEEDWORKS CUSTOMS & TUNING GARAGE ([-45, 0, 65]) */}
      <group position={[-45, 0, 65]}>
        <mesh position={[0, 5, 0]} castShadow receiveShadow>
          <boxGeometry args={[26, 10, 26]} />
          <primitive object={concreteDark} attach="material" />
        </mesh>
        <mesh position={[-6, 3.2, 13.1]}>
          <planeGeometry args={[7, 6]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
        <mesh position={[6, 3.2, 13.1]}>
          <planeGeometry args={[7, 6]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
        <mesh position={[0, 8.5, 13.2]}>
          <boxGeometry args={[18, 1.4, 0.4]} />
          <primitive object={neonPinkMat} attach="material" />
        </mesh>
        <group position={[-6, 1.4, 4]}>
          <mesh position={[-2.2, 1.5, 0]}>
            <boxGeometry args={[0.3, 3.0, 0.3]} />
            <primitive object={concreteLight} attach="material" />
          </mesh>
          <mesh position={[2.2, 1.5, 0]}>
            <boxGeometry args={[0.3, 3.0, 0.3]} />
            <primitive object={concreteLight} attach="material" />
          </mesh>
          <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[4.2, 0.15, 2.2]} />
            <primitive object={concreteLight} attach="material" />
          </mesh>
          <pointLight color="#f59e0b" intensity={3} distance={10} position={[0, 3, 0]} />
        </group>
      </group>

      {/* 4. NITROFUEL GAS STATION & CONVENIENCE MART ([0, 0, -55]) */}
      <group position={[0, 0, -55]}>
        <mesh position={[0, 5.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[24, 0.8, 16]} />
          <primitive object={concreteLight} attach="material" />
        </mesh>
        <mesh position={[0, 5.2, 8.1]}>
          <boxGeometry args={[24.2, 0.3, 0.2]} />
          <primitive object={neonCyanMat} attach="material" />
        </mesh>
        {[-8, 8].map((cx, i) => (
          <group key={i}>
            <mesh position={[cx, 2.6, -4]} castShadow>
              <cylinderGeometry args={[0.4, 0.4, 5.2, 16]} />
              <primitive object={concreteDark} attach="material" />
            </mesh>
            <mesh position={[cx, 2.6, 4]} castShadow>
              <cylinderGeometry args={[0.4, 0.4, 5.2, 16]} />
              <primitive object={concreteDark} attach="material" />
            </mesh>
          </group>
        ))}
        {[-6, 6].map((px, i) => (
          <group key={i} position={[px, 0.6, 0]}>
            <mesh position={[0, -0.4, 0]}>
              <boxGeometry args={[2.0, 0.4, 6.0]} />
              <primitive object={concreteLight} attach="material" />
            </mesh>
            <mesh position={[0, 0.4, -1.5]} castShadow>
              <boxGeometry args={[0.9, 1.6, 0.9]} />
              <primitive object={concreteDark} attach="material" />
            </mesh>
            <mesh position={[0, 0.4, 1.5]} castShadow>
              <boxGeometry args={[0.9, 1.6, 0.9]} />
              <primitive object={concreteDark} attach="material" />
            </mesh>
          </group>
        ))}
        <group position={[0, 3, -16]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[20, 6, 10]} />
            <primitive object={concreteLight} attach="material" />
          </mesh>
          <mesh position={[0, 0, 5.1]}>
            <planeGeometry args={[18, 5]} />
            <primitive object={glassTowerMat} attach="material" />
          </mesh>
          <mesh position={[0, 3.6, 5.2]}>
            <boxGeometry args={[14, 0.8, 0.3]} />
            <primitive object={neonCyanMat} attach="material" />
          </mesh>
        </group>
      </group>

      {/* 5. DOWNTOWN SKYVIEW LOFT (PLAYER STARTER HOME) ([60, 0, -40]) */}
      <group position={[60, 0, -40]}>
        <mesh position={[0, 16, 0]} castShadow receiveShadow>
          <boxGeometry args={[22, 32, 22]} />
          <primitive object={concreteLight} attach="material" />
        </mesh>
        {[8, 14, 20, 26].map((by, i) => (
          <mesh key={i} position={[0, by, 11.2]}>
            <boxGeometry args={[18, 1.0, 1.8]} />
            <meshStandardMaterial color="#b45309" roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 0.1, 14]}>
          <ringGeometry args={[1.2, 1.6, 24]} />
          <primitive object={neonCyanMat} attach="material" />
        </mesh>
        <pointLight color="#00f0ff" intensity={3} distance={8} position={[0, 2.5, 12]} />
      </group>

      {/* 6. OCEANVIEW COASTAL LUXURY VILLA ([-130, 0, -120]) */}
      <group position={[-130, 0, -120]}>
        <mesh position={[0, 4.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[28, 9, 20]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.25} />
        </mesh>
        <mesh position={[0, 4, 10.1]}>
          <planeGeometry args={[24, 7]} />
          <primitive object={glassTowerMat} attach="material" />
        </mesh>
        <mesh position={[0, 6, 12]}>
          <boxGeometry args={[26, 0.4, 4.5]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.4, 18]}>
          <boxGeometry args={[20, 0.8, 8]} />
          <meshStandardMaterial color="#0284c7" roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
};
