import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import { isMobileDevice } from '../../stores/virtualInput';

/**
 * SkyAtmosphere - 60 FPS Ultra-Smooth Procedural Sky & Lighting System
 * Decoupled from player position updates to prevent React re-render lag.
 * Guaranteed never black or void; vibrant azure daytime, golden sunset, and neon night.
 */
export const SkyAtmosphere: React.FC = () => {
  const { scene } = useThree();
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const weather = useGameStore((s) => s.weather);
  const isMobile = isMobileDevice();
  const shadowResolution = isMobile ? 512 : 1024;

  const skyGroupRef = useRef<THREE.Group>(null);
  const cloudsGroupRef = useRef<THREE.Group>(null);

  // Calculate vibrant colors based on time
  const {
    skyTop,
    skyHorizon,
    sunPos,
    sunColor,
    sunIntensity,
    hemiSky,
    hemiGround,
    fogColor,
    isNight
  } = useMemo(() => {
    const angle = ((timeOfDay - 6) / 24) * Math.PI * 2;
    const sunX = Math.cos(angle) * 220;
    const sunY = Math.sin(angle) * 160;
    const sunZ = Math.sin(angle) * 80;

    let sTop = '#0284c7'; // Vivid azure sky
    let sHoriz = '#bae6fd'; // Light sky horizon
    let sColor = '#fffdf0';
    let sIntensity = 3.6;
    let hSky = '#e0f2fe';
    let hGround = '#64748b';
    let fColor = '#bae6fd';
    let night = false;

    if (timeOfDay >= 5.5 && timeOfDay < 8.5) {
      // Golden Sunrise / Dawn
      sTop = '#6366f1';
      sHoriz = '#fed7aa';
      sColor = '#fdba74';
      sIntensity = 2.8;
      hSky = '#fed7aa';
      hGround = '#64748b';
      fColor = '#fdba74';
    } else if (timeOfDay >= 8.5 && timeOfDay < 16.5) {
      // Radiant Bright Daytime (Vibrant clear azure blue sky)
      sTop = '#0ea5e9';
      sHoriz = '#e0f2fe';
      sColor = '#ffffff';
      sIntensity = 3.5;
      hSky = '#f0f9ff';
      hGround = '#64748b';
      fColor = '#e0f2fe';
    } else if (timeOfDay >= 16.5 && timeOfDay < 19.5) {
      // Warm Vibrant Sunset / Golden Hour
      sTop = '#c026d3';
      sHoriz = '#fed7aa';
      sColor = '#fb923c';
      sIntensity = 2.8;
      hSky = '#f472b6';
      hGround = '#475569';
      fColor = '#fb923c';
    } else {
      // Deep Starry Cyberpunk Night
      night = true;
      sTop = '#0f172a';
      sHoriz = '#1e293b';
      sColor = '#67e8f9';
      sIntensity = 1.6;
      hSky = '#1e293b';
      hGround = '#0f172a';
      fColor = '#1e293b';
    }

    if (weather === 'rain') {
      sTop = '#475569';
      sHoriz = '#94a3b8';
      fColor = '#64748b';
      sIntensity *= 0.6;
    }

    return {
      skyTop: new THREE.Color(sTop),
      skyHorizon: new THREE.Color(sHoriz),
      sunPos: [sunX, Math.max(25, sunY), sunZ] as [number, number, number],
      sunColor: sColor,
      sunIntensity: sIntensity,
      hemiSky: hSky,
      hemiGround: hGround,
      fogColor: new THREE.Color(fColor),
      isNight: night
    };
  }, [timeOfDay, weather]);

  // Set scene background color directly to ensure NO black canvas void
  useEffect(() => {
    scene.background = skyHorizon;
  }, [scene, skyHorizon]);

  // Procedural Fluffy 3D Cloud Data (16 floating clouds)
  const cloudsData = useMemo(() => {
    const list: { x: number; y: number; z: number; scale: number; speed: number }[] = [];
    for (let i = 0; i < 16; i++) {
      list.push({
        x: (Math.random() - 0.5) * 320,
        y: 45 + Math.random() * 20,
        z: (Math.random() - 0.5) * 320,
        scale: 0.9 + Math.random() * 0.8,
        speed: 0.8 + Math.random() * 0.5
      });
    }
    return list;
  }, []);

  // Shared Cloud Spheres
  const cloudGeo = useMemo(() => new THREE.SphereGeometry(4.5, 10, 8), []);
  const cloudMat = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    // Keep sky centered around camera at all times without React state re-renders
    if (skyGroupRef.current) {
      skyGroupRef.current.position.set(state.camera.position.x, 0, state.camera.position.z);
    }

    // Drift clouds across the sky
    if (cloudsGroupRef.current) {
      cloudsGroupRef.current.children.forEach((cloud, i) => {
        cloud.position.x += dt * cloudsData[i].speed * 2.2;
        if (cloud.position.x > 220) {
          cloud.position.x = -220;
        }
      });
    }
  });

  return (
    <group>
      {/* Dynamic Atmospheric Fog: Crisp Los Santos GTA V Draw Distance */}
      <fog attach="fog" args={[fogColor.getHex(), 200, weather === 'fog' ? 180 : 950]} />

      {/* Primary Hemisphere Lighting: Illuminates ground & objects so they are NEVER black */}
      <hemisphereLight
        color={hemiSky}
        groundColor={hemiGround}
        intensity={1.6}
      />

      {/* Ambient Fill Light */}
      <ambientLight color="#ffffff" intensity={0.9} />

      {/* Directional Sun / Moon Light with optimized shadow map */}
      <directionalLight
        position={sunPos}
        color={sunColor}
        intensity={sunIntensity}
        castShadow
        shadow-mapSize-width={shadowResolution}
        shadow-mapSize-height={shadowResolution}
        shadow-camera-near={0.5}
        shadow-camera-far={450}
        shadow-camera-left={-85}
        shadow-camera-right={85}
        shadow-camera-top={85}
        shadow-camera-bottom={-85}
        shadow-bias={-0.0003}
      />

      {/* Radiant Sun Disk & Coronal Glow in the Sky */}
      <group position={sunPos}>
        <mesh>
          <sphereGeometry args={[12, 16, 16]} />
          <meshBasicMaterial color={sunColor} fog={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[20, 16, 16]} />
          <meshBasicMaterial color={sunColor} transparent opacity={0.25} fog={false} />
        </mesh>
      </group>

      {/* Centered Sky Dome Group that tracks camera directly */}
      <group ref={skyGroupRef}>
        {/* Full Sky Sphere (radius 480m) ensures sky is visible at all viewing angles */}
        <mesh>
          <sphereGeometry args={[480, 24, 16]} />
          <meshBasicMaterial
            color={skyHorizon}
            side={THREE.BackSide}
            depthWrite={false}
            fog={false}
          />
        </mesh>

        {/* Animated Fluffy 3D Stylized Clouds */}
        {!isNight && (
          <group ref={cloudsGroupRef}>
            {cloudsData.map((c, i) => (
              <group key={i} position={[c.x, c.y, c.z]} scale={[c.scale, c.scale, c.scale]}>
                <mesh position={[0, 0, 0]} geometry={cloudGeo} material={cloudMat} />
                <mesh position={[3.5, -0.5, 0]} geometry={cloudGeo} material={cloudMat} />
                <mesh position={[-3.2, -0.6, 0.8]} geometry={cloudGeo} material={cloudMat} />
                <mesh position={[0.8, 1.1, -0.8]} geometry={cloudGeo} material={cloudMat} />
              </group>
            ))}
          </group>
        )}
      </group>
    </group>
  );
};
