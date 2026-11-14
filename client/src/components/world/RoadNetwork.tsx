import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';

export const RoadNetwork: React.FC = () => {
  const rainIntensity = useGameStore((s) => s.rainIntensity);

  // Road asphalt material - realistic clean metropolitan asphalt
  const asphaltMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x2e3440,
      roughness: rainIntensity > 0.1 ? 0.2 : 0.65,
      metalness: rainIntensity > 0.1 ? 0.4 : 0.1
    });
  }, [rainIntensity]);

  const curbMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0xc8d1dc,
      roughness: 0.6
    });
  }, []);

  const yellowLineMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  }, []);

  const whiteLineMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({ color: 0xffffff });
  }, []);

  const sidewalkMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.7
    });
  }, []);

  // Road Segment Helper
  const RoadSegment = ({
    x,
    z,
    length,
    width = 16,
    isVertical = false
  }: {
    x: number;
    z: number;
    length: number;
    width?: number;
    isVertical?: boolean;
  }) => {
    const rot = isVertical ? [0, Math.PI / 2, 0] : [0, 0, 0];

    return (
      <group position={[x, 0.02, z]} rotation={rot as any}>
        {/* Asphalt surface */}
        <mesh receiveShadow>
          <planeGeometry args={[length, width]} />
          <primitive object={asphaltMaterial} attach="material" />
        </mesh>

        {/* Center Double Yellow Lines */}
        <mesh position={[0, 0.003, 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[length, 0.2]} />
          <primitive object={yellowLineMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 0.003, -0.25]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[length, 0.2]} />
          <primitive object={yellowLineMaterial} attach="material" />
        </mesh>

        {/* Outer White Lane Edge Lines */}
        <mesh position={[0, 0.003, width / 2 - 0.7]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[length, 0.25]} />
          <primitive object={whiteLineMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 0.003, -width / 2 + 0.7]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[length, 0.25]} />
          <primitive object={whiteLineMaterial} attach="material" />
        </mesh>

        {/* Concrete Curbs and Sidewalks */}
        <mesh position={[0, 0.1, width / 2 + 1.8]} receiveShadow>
          <boxGeometry args={[length, 0.2, 2.4]} />
          <primitive object={sidewalkMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 0.1, -width / 2 - 1.8]} receiveShadow>
          <boxGeometry args={[length, 0.2, 2.4]} />
          <primitive object={sidewalkMaterial} attach="material" />
        </mesh>
      </group>
    );
  };

  return (
    <group>
      {/* Ground plane for grass / terrain */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[700, 700]} />
        <meshStandardMaterial color="#166534" roughness={0.85} />
      </mesh>

      {/* Main East-West Metropolitan Boulevards */}
      <RoadSegment x={0} z={0} length={340} width={18} />
      <RoadSegment x={0} z={60} length={340} width={16} />
      <RoadSegment x={0} z={-60} length={340} width={16} />
      <RoadSegment x={0} z={120} length={340} width={16} />
      <RoadSegment x={0} z={-120} length={340} width={16} />

      {/* Main North-South Avenues */}
      <RoadSegment x={0} z={0} length={340} width={18} isVertical />
      <RoadSegment x={80} z={0} length={340} width={16} isVertical />
      <RoadSegment x={-80} z={0} length={340} width={16} isVertical />
      <RoadSegment x={160} z={0} length={340} width={16} isVertical />
      <RoadSegment x={-160} z={0} length={340} width={16} isVertical />

      {/* Coastal Ocean Highway Bridge */}
      <group position={[-140, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        {/* Bridge Deck */}
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[180, 0.8, 20]} />
          <primitive object={curbMaterial} attach="material" />
        </mesh>
        {/* Bridge Asphalt */}
        <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[180, 18]} />
          <primitive object={asphaltMaterial} attach="material" />
        </mesh>
        {/* Bridge Support Pillars */}
        {[-60, -20, 20, 60].map((pz, idx) => (
          <group key={idx} position={[pz, -6, 0]}>
            <mesh position={[-8, 0, 0]}>
              <cylinderGeometry args={[1.4, 1.8, 12, 16]} />
              <primitive object={curbMaterial} attach="material" />
            </mesh>
            <mesh position={[8, 0, 0]}>
              <cylinderGeometry args={[1.4, 1.8, 12, 16]} />
              <primitive object={curbMaterial} attach="material" />
            </mesh>
          </group>
        ))}
        {/* Suspension Cable Towers */}
        <mesh position={[-40, 15, 9.5]}>
          <boxGeometry args={[2, 30, 1.2]} />
          <primitive object={curbMaterial} attach="material" />
        </mesh>
        <mesh position={[-40, 15, -9.5]}>
          <boxGeometry args={[2, 30, 1.2]} />
          <primitive object={curbMaterial} attach="material" />
        </mesh>
        <mesh position={[40, 15, 9.5]}>
          <boxGeometry args={[2, 30, 1.2]} />
          <primitive object={curbMaterial} attach="material" />
        </mesh>
        <mesh position={[40, 15, -9.5]}>
          <boxGeometry args={[2, 30, 1.2]} />
          <primitive object={curbMaterial} attach="material" />
        </mesh>
        {/* Cross beams on suspension towers */}
        <mesh position={[-40, 25, 0]}>
          <boxGeometry args={[2, 1.5, 20]} />
          <primitive object={curbMaterial} attach="material" />
        </mesh>
        <mesh position={[40, 25, 0]}>
          <boxGeometry args={[2, 1.5, 20]} />
          <primitive object={curbMaterial} attach="material" />
        </mesh>
      </group>
    </group>
  );
};
