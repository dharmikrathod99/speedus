import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';

export const EnvironmentManager: React.FC = () => {
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const setTimeOfDay = useGameStore((s) => s.setTimeOfDay);
  const weather = useGameStore((s) => s.weather);
  const rainIntensity = useGameStore((s) => s.rainIntensity);
  const playerPos = useGameStore((s) => s.playerPosition);
  const vehiclePos = useGameStore((s) => s.vehiclePosition);
  const mode = useGameStore((s) => s.mode);

  const sunLightRef = useRef<THREE.DirectionalLight>(null);
  const rainParticlesRef = useRef<THREE.Points>(null);

  // Rain particle geometry (1,500 raindrops)
  const [rainGeo] = useMemo(() => {
    const count = 1500;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = Math.random() * 35;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return [geo];
  }, []);

  // Sky & Lighting calculations with rich vibrancy & high visibility
  const { sunPos, sunColor, sunIntensity, hemiSky, hemiGround, hemiIntensity, ambientColor, skyColor, fogColor } = useMemo(() => {
    // 0 = Midnight, 6 = Sunrise, 12 = Noon, 18 = Sunset
    const angle = ((timeOfDay - 6) / 24) * Math.PI * 2;
    const sunX = Math.cos(angle) * 200;
    const sunY = Math.sin(angle) * 160;
    const sunZ = Math.sin(angle) * 70;

    let sColor = '#fffdf0';
    let sIntensity = 3.2;
    let hSky = '#bae6fd';
    let hGround = '#475569';
    let hIntensity = 1.4;
    let aColor = '#94a3b8';
    let skColor = '#38bdf8';
    let fgColor = '#93c5fd';

    if (timeOfDay >= 5.5 && timeOfDay < 8.5) {
      // Golden Sunrise / Dawn
      sColor = '#fdba74';
      sIntensity = 2.6;
      hSky = '#fed7aa';
      hGround = '#64748b';
      hIntensity = 1.3;
      aColor = '#c2410c';
      skColor = '#7c3aed';
      fgColor = '#fb923c';
    } else if (timeOfDay >= 8.5 && timeOfDay < 16.5) {
      // Radiant Bright Midday
      sColor = '#ffffff';
      sIntensity = 3.4;
      hSky = '#e0f2fe';
      hGround = '#64748b';
      hIntensity = 1.5;
      aColor = '#cbd5e1';
      skColor = '#38bdf8';
      fgColor = '#bfdbfe';
    } else if (timeOfDay >= 16.5 && timeOfDay < 19.5) {
      // Golden Hour / Sunset
      sColor = '#fb923c';
      sIntensity = 2.8;
      hSky = '#f472b6';
      hGround = '#475569';
      hIntensity = 1.3;
      aColor = '#db2777';
      skColor = '#c026d3';
      fgColor = '#e11d48';
    } else {
      // Night: Atmospheric Cyberpunk Night with luminous ambient & moonlight (NEVER pitch black)
      sColor = '#67e8f9';
      sIntensity = 1.4;
      hSky = '#1e293b';
      hGround = '#0f172a';
      hIntensity = 0.95;
      aColor = '#334155';
      skColor = '#0b1329';
      fgColor = '#0f1d38';
    }

    if (weather === 'rain') {
      sIntensity *= 0.6;
      skColor = '#475569';
      fgColor = '#334155';
      hIntensity = 1.0;
    }

    return {
      sunPos: [sunX, Math.max(25, sunY), sunZ] as [number, number, number],
      sunColor: sColor,
      sunIntensity: sIntensity,
      hemiSky: hSky,
      hemiGround: hGround,
      hemiIntensity: hIntensity,
      ambientColor: aColor,
      skyColor: skColor,
      fogColor: fgColor
    };
  }, [timeOfDay, weather]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);

    // Smooth subtle progression of time
    setTimeOfDay(timeOfDay + dt * 0.04);

    // Animate falling rain particles around player / car
    if (weather === 'rain' && rainParticlesRef.current) {
      const center = mode === 'driving' ? vehiclePos : playerPos;
      rainParticlesRef.current.position.set(center[0], 0, center[2]);

      const positions = rainParticlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= dt * 45;
        if (positions[i + 1] < 0) {
          positions[i + 1] = 35;
        }
      }
      rainParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Dynamic Background Sky Color & Fog with long view distance */}
      <color attach="background" args={[skyColor]} />
      <fog attach="fog" args={[fogColor, 40, weather === 'fog' ? 120 : 380]} />

      {/* Hemisphere Light: Illuminates ground & vertical surfaces so shadows are never pitch black */}
      <hemisphereLight
        color={hemiSky}
        groundColor={hemiGround}
        intensity={hemiIntensity}
      />

      {/* Ambient Lighting for base clarity */}
      <ambientLight color={ambientColor} intensity={0.8} />

      {/* Primary Directional Sun / Moon Light */}
      <directionalLight
        ref={sunLightRef}
        position={sunPos}
        color={sunColor}
        intensity={sunIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={500}
        shadow-camera-left={-90}
        shadow-camera-right={90}
        shadow-camera-top={90}
        shadow-camera-bottom={-90}
        shadow-bias={-0.0004}
      />

      {/* Sky Sun Sphere Visual */}
      <mesh position={sunPos}>
        <sphereGeometry args={[8, 16, 16]} />
        <meshBasicMaterial color={sunColor} />
      </mesh>

      {/* Rain Particle System */}
      {weather === 'rain' && (
        <points ref={rainParticlesRef} geometry={rainGeo}>
          <pointsMaterial
            color="#93c5fd"
            size={0.2}
            transparent
            opacity={0.75}
            depthWrite={false}
          />
        </points>
      )}
    </group>
  );
};
