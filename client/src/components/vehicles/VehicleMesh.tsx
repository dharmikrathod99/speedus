import React, { useMemo } from 'react';
import * as THREE from 'three';
import { VehicleDef, VehicleCustomization } from '../../types/game';

interface VehicleMeshProps {
  def: VehicleDef;
  customization: VehicleCustomization;
  steerAngle: number;
  wheelSpin: number;
  isBraking: boolean;
  isReversing: boolean;
  headlightsOn: boolean;
  hazardsOn: boolean;
  isBoosting: boolean;
  isDrifting?: boolean;
  pitchAngle?: number;
  rollAngle?: number;
}

export const VehicleMesh: React.FC<VehicleMeshProps> = ({
  def,
  customization,
  steerAngle,
  wheelSpin,
  isBraking,
  isReversing,
  headlightsOn,
  hazardsOn,
  isBoosting,
  isDrifting = false,
  pitchAngle = 0,
  rollAngle = 0
}) => {
  const { length, width, height, wheelbase } = def.dimensions;
  const halfLength = length / 2;
  const halfWidth = width / 2;
  const wheelRadius = height * 0.28;
  const trackWidth = width * 0.85;

  // Body paint material
  const bodyMaterial = useMemo(() => {
    let roughness = 0.2;
    let metalness = 0.8;
    let clearcoat = 0.9;
    let clearcoatRoughness = 0.1;

    if (customization.finish === 'matte') {
      roughness = 0.7;
      metalness = 0.1;
      clearcoat = 0.0;
    } else if (customization.finish === 'metallic') {
      roughness = 0.25;
      metalness = 0.95;
      clearcoat = 1.0;
    } else if (customization.finish === 'pearlescent') {
      roughness = 0.15;
      metalness = 0.85;
      clearcoat = 1.0;
    }

    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(customization.color),
      roughness,
      metalness,
      clearcoat,
      clearcoatRoughness,
      reflectivity: 1.0
    });
  }, [customization.color, customization.finish]);

  // Carbon fiber / black trim material
  const carbonMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x111317,
      roughness: 0.4,
      metalness: 0.6
    });
  }, []);

  // Glass material
  const glassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.2,
      transmission: 0.65,
      transparent: true,
      opacity: 0.75,
      ior: 1.5
    });
  }, []);

  // Chrome exhaust material
  const chromeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      roughness: 0.1,
      metalness: 0.95
    });
  }, []);

  // Tire rubber material
  const tireMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.85,
      metalness: 0.1
    });
  }, []);

  // Wheel Rim material
  const rimMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(customization.wheelColor || '#475569'),
      roughness: 0.3,
      metalness: 0.85
    });
  }, [customization.wheelColor]);

  // Brake Caliper material (Red Brembo style)
  const caliperMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.3,
      metalness: 0.4
    });
  }, []);

  // Headlight material
  const headlightGlowMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: headlightsOn ? 0xffffff : 0x888888,
      emissive: headlightsOn ? 0xe0f2fe : 0x000000,
      emissiveIntensity: headlightsOn ? 3.0 : 0,
      roughness: 0.1
    });
  }, [headlightsOn]);

  // Taillight material
  const taillightGlowMaterial = useMemo(() => {
    const active = isBraking || isReversing || headlightsOn;
    const color = isReversing ? 0xffffff : 0xff1122;
    const intensity = isBraking ? 4.0 : (headlightsOn ? 1.8 : 0);
    return new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: active ? intensity : 0.1,
      roughness: 0.2
    });
  }, [isBraking, isReversing, headlightsOn]);

  // High-Tech Daytime Running Light (DRL) LED Material
  const drlGlowMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      emissive: 0x38bdf8,
      emissiveIntensity: headlightsOn ? 4.5 : 2.5,
      roughness: 0.1
    });
  }, [headlightsOn]);

  // Continuous Full-Width Rear LED Taillight Bar Material
  const taillightBarMaterial = useMemo(() => {
    const active = isBraking || headlightsOn;
    const intensity = isBraking ? 5.5 : (headlightsOn ? 2.8 : 1.2);
    return new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: intensity,
      roughness: 0.2
    });
  }, [isBraking, headlightsOn]);

  // High-performance drilled brake disc (rotor) material
  const brakeDiscMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0xa1a1aa,
      roughness: 0.25,
      metalness: 0.95
    });
  }, []);

  // Dark matte honeycomb grille material
  const darkGrilleMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.95,
      metalness: 0.1
    });
  }, []);

  // Metallic engine intake plenum material
  const enginePlenumMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.2,
      metalness: 0.92
    });
  }, []);

  // Red performance engine valve cover material
  const engineBlockMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.35,
      metalness: 0.7
    });
  }, []);

  // Titanium heat-blued exhaust tip material
  const titaniumTipMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.2,
      metalness: 0.95
    });
  }, []);

  // Supersonic plasma flame core material
  const nitroCoreMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95
    });
  }, []);

  // Billowing tire drift smoke material
  const tireSmokeMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0xf8fafc,
      transparent: true,
      opacity: 0.45
    });
  }, []);

  // Wheel component for standard cars
  const Wheel = ({ isFront, isLeft, zOffset = 0, radius = wheelRadius, tireWidth = 0.32 }: {
    isFront: boolean;
    isLeft: boolean;
    zOffset?: number;
    radius?: number;
    tireWidth?: number;
  }) => {
    const posX = isLeft ? -trackWidth / 2 : trackWidth / 2;
    const posZ = zOffset !== 0 ? zOffset : (isFront ? wheelbase / 2 : -wheelbase / 2);

    return (
      <group position={[posX, radius, posZ]}>
        <group rotation={[0, isFront ? steerAngle : 0, 0]}>
          <group rotation={[wheelSpin, 0, 0]}>
            {/* Low-profile performance sport tire */}
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[radius, radius, tireWidth, 28]} />
              <primitive object={tireMaterial} attach="material" />
            </mesh>

            {/* Alloy wheel rim barrel */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[radius * 0.74, radius * 0.74, tireWidth + 0.01, 20]} />
              <primitive object={rimMaterial} attach="material" />
            </mesh>

            {/* Drilled metallic brake rotor disc behind rim */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[radius * 0.68, radius * 0.68, 0.04, 18]} />
              <primitive object={brakeDiscMaterial} attach="material" />
            </mesh>

            {/* 5-Spoke Sport Alloy Wheel Face */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[radius * 1.35, radius * 0.16, tireWidth + 0.02]} />
              <primitive object={rimMaterial} attach="material" />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <boxGeometry args={[tireWidth + 0.02, radius * 0.16, radius * 1.35]} />
              <primitive object={rimMaterial} attach="material" />
            </mesh>
            <mesh rotation={[Math.PI / 4, 0, 0]}>
              <boxGeometry args={[tireWidth + 0.02, radius * 0.14, radius * 1.35]} />
              <primitive object={rimMaterial} attach="material" />
            </mesh>
            <mesh rotation={[-Math.PI / 4, 0, 0]}>
              <boxGeometry args={[tireWidth + 0.02, radius * 0.14, radius * 1.35]} />
              <primitive object={rimMaterial} attach="material" />
            </mesh>

            {/* Center Hub Nut */}
            <mesh position={[isLeft ? -tireWidth * 0.52 : tireWidth * 0.52, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[radius * 0.18, radius * 0.18, 0.03, 12]} />
              <primitive object={carbonMaterial} attach="material" />
            </mesh>
          </group>

          {/* Brembo Red Performance Brake Caliper */}
          <mesh position={[0, radius * 0.28, 0]}>
            <boxGeometry args={[0.13, 0.16, 0.26]} />
            <primitive object={caliperMaterial} attach="material" />
          </mesh>
        </group>
      </group>
    );
  };

  // ========================================================
  // 1. MOTORCYCLE / SUPERBIKE CHASSIS
  // ========================================================
  if (def.category === 'motorcycle') {
    const bikeWheelRadius = 0.34;
    return (
      <group rotation={[pitchAngle, 0, rollAngle * 1.8]}>
        {/* Front Wheel with fork */}
        <group position={[0, bikeWheelRadius, wheelbase / 2]}>
          <group rotation={[0, steerAngle, 0]}>
            <group rotation={[wheelSpin, 0, 0]}>
              <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[bikeWheelRadius, bikeWheelRadius, 0.16, 24]} />
                <primitive object={tireMaterial} attach="material" />
              </mesh>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[bikeWheelRadius * 0.75, bikeWheelRadius * 0.75, 0.17, 16]} />
                <primitive object={rimMaterial} attach="material" />
              </mesh>
            </group>
            {/* Front Telescopic Forks */}
            <mesh position={[-0.1, 0.35, 0]} rotation={[-0.3, 0, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.75, 8]} />
              <primitive object={chromeMaterial} attach="material" />
            </mesh>
            <mesh position={[0.1, 0.35, 0]} rotation={[-0.3, 0, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.75, 8]} />
              <primitive object={chromeMaterial} attach="material" />
            </mesh>
            {/* Handlebars */}
            <mesh position={[0, 0.65, -0.08]}>
              <boxGeometry args={[0.7, 0.04, 0.04]} />
              <primitive object={carbonMaterial} attach="material" />
            </mesh>
          </group>
        </group>

        {/* Rear Wheel with swingarm */}
        <group position={[0, bikeWheelRadius, -wheelbase / 2]}>
          <group rotation={[wheelSpin, 0, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[bikeWheelRadius, bikeWheelRadius, 0.22, 24]} />
              <primitive object={tireMaterial} attach="material" />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[bikeWheelRadius * 0.75, bikeWheelRadius * 0.75, 0.23, 16]} />
              <primitive object={rimMaterial} attach="material" />
            </mesh>
          </group>
        </group>

        {/* Motorcycle Main Body Frame & Fuel Tank */}
        <group position={[0, bikeWheelRadius + 0.15, 0]}>
          <mesh position={[0, 0.35, 0.15]} castShadow>
            <boxGeometry args={[0.42, 0.45, 0.85]} />
            <primitive object={bodyMaterial} attach="material" />
          </mesh>
          {/* Aerodynamic Fairing & Windscreen */}
          <mesh position={[0, 0.55, 0.55]} rotation={[-0.35, 0, 0]} castShadow>
            <boxGeometry args={[0.38, 0.35, 0.45]} />
            <primitive object={glassMaterial} attach="material" />
          </mesh>
          {/* Rider Seat */}
          <mesh position={[0, 0.4, -0.3]} castShadow>
            <boxGeometry args={[0.34, 0.15, 0.55]} />
            <primitive object={carbonMaterial} attach="material" />
          </mesh>
          {/* Headlight */}
          <mesh position={[0, 0.45, 0.8]}>
            <boxGeometry args={[0.22, 0.12, 0.05]} />
            <primitive object={headlightGlowMaterial} attach="material" />
          </mesh>
          {/* Taillight */}
          <mesh position={[0, 0.5, -0.65]}>
            <boxGeometry args={[0.18, 0.08, 0.05]} />
            <primitive object={taillightGlowMaterial} attach="material" />
          </mesh>
          {/* Titanium Exhaust Pipe */}
          <mesh position={[0.25, 0.15, -0.45]} rotation={[0.2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.6, 12]} />
            <primitive object={chromeMaterial} attach="material" />
          </mesh>
        </group>

        {headlightsOn && (
          <spotLight
            position={[0, bikeWheelRadius + 0.6, halfLength]}
            target-position={[0, -0.5, halfLength + 30]}
            color="#ffffff"
            intensity={7.0}
            angle={0.6}
            penumbra={0.4}
            distance={45}
            castShadow
          />
        )}
      </group>
    );
  }

  // ========================================================
  // 2. HEAVY CARGO TRUCK CHASSIS
  // ========================================================
  if (def.category === 'truck') {
    const truckWheelRadius = 0.52;
    return (
      <group rotation={[pitchAngle, 0, rollAngle]}>
        {/* Front Steer Wheels */}
        <Wheel isFront={true} isLeft={true} radius={truckWheelRadius} tireWidth={0.4} />
        <Wheel isFront={true} isLeft={false} radius={truckWheelRadius} tireWidth={0.4} />

        {/* Dual Rear Tandem Axles */}
        <Wheel isFront={false} isLeft={true} zOffset={-wheelbase / 2 + 0.6} radius={truckWheelRadius} tireWidth={0.4} />
        <Wheel isFront={false} isLeft={false} zOffset={-wheelbase / 2 + 0.6} radius={truckWheelRadius} tireWidth={0.4} />
        <Wheel isFront={false} isLeft={true} zOffset={-wheelbase / 2 - 0.6} radius={truckWheelRadius} tireWidth={0.4} />
        <Wheel isFront={false} isLeft={false} zOffset={-wheelbase / 2 - 0.6} radius={truckWheelRadius} tireWidth={0.4} />

        {/* Truck Chassis & Sleeper Cab */}
        <group position={[0, truckWheelRadius + 0.2, 0]}>
          {/* Main Truck Frame Rails */}
          <mesh position={[0, 0.1, -0.5]} castShadow receiveShadow>
            <boxGeometry args={[width * 0.9, 0.35, length * 0.95]} />
            <primitive object={carbonMaterial} attach="material" />
          </mesh>

          {/* Tall Driver Cab */}
          <mesh position={[0, height * 0.55, halfLength * 0.45]} castShadow receiveShadow>
            <boxGeometry args={[width * 0.92, height * 0.85, halfLength * 0.95]} />
            <primitive object={bodyMaterial} attach="material" />
          </mesh>

          {/* Panoramic Windshield */}
          <mesh position={[0, height * 0.75, halfLength * 0.88]} castShadow>
            <boxGeometry args={[width * 0.88, height * 0.38, 0.1]} />
            <primitive object={glassMaterial} attach="material" />
          </mesh>

          {/* Massive Chrome Front Grille */}
          <mesh position={[0, height * 0.4, halfLength * 0.93]} castShadow>
            <boxGeometry args={[width * 0.75, height * 0.5, 0.12]} />
            <primitive object={chromeMaterial} attach="material" />
          </mesh>

          {/* Dual Vertical Chrome Exhaust Stacks */}
          <mesh position={[-halfWidth * 0.92, height * 0.9, 0.1]}>
            <cylinderGeometry args={[0.08, 0.08, height * 1.1, 16]} />
            <primitive object={chromeMaterial} attach="material" />
          </mesh>
          <mesh position={[halfWidth * 0.92, height * 0.9, 0.1]}>
            <cylinderGeometry args={[0.08, 0.08, height * 1.1, 16]} />
            <primitive object={chromeMaterial} attach="material" />
          </mesh>

          {/* Headlights */}
          <mesh position={[-halfWidth * 0.75, 0.25, halfLength * 0.94]}>
            <boxGeometry args={[0.38, 0.22, 0.08]} />
            <primitive object={headlightGlowMaterial} attach="material" />
          </mesh>
          <mesh position={[halfWidth * 0.75, 0.25, halfLength * 0.94]}>
            <boxGeometry args={[0.38, 0.22, 0.08]} />
            <primitive object={headlightGlowMaterial} attach="material" />
          </mesh>

          {/* Taillights */}
          <mesh position={[-halfWidth * 0.75, 0.2, -halfLength - 0.4]}>
            <boxGeometry args={[0.4, 0.18, 0.06]} />
            <primitive object={taillightGlowMaterial} attach="material" />
          </mesh>
          <mesh position={[halfWidth * 0.75, 0.2, -halfLength - 0.4]}>
            <boxGeometry args={[0.4, 0.18, 0.06]} />
            <primitive object={taillightGlowMaterial} attach="material" />
          </mesh>
        </group>

        {headlightsOn && (
          <>
            <spotLight
              position={[-halfWidth * 0.75, truckWheelRadius + 0.4, halfLength]}
              target-position={[-halfWidth * 0.75, -0.5, halfLength + 35]}
              color="#ffffff"
              intensity={7.0}
              angle={0.65}
              distance={50}
              castShadow
            />
            <spotLight
              position={[halfWidth * 0.75, truckWheelRadius + 0.4, halfLength]}
              target-position={[halfWidth * 0.75, -0.5, halfLength + 35]}
              color="#ffffff"
              intensity={7.0}
              angle={0.65}
              distance={50}
              castShadow
            />
          </>
        )}
      </group>
    );
  }

  // ========================================================
  // 3. CITY TRANSIT BUS CHASSIS
  // ========================================================
  if (def.category === 'bus') {
    const busWheelRadius = 0.5;
    return (
      <group rotation={[pitchAngle, 0, rollAngle]}>
        <Wheel isFront={true} isLeft={true} radius={busWheelRadius} tireWidth={0.38} />
        <Wheel isFront={true} isLeft={false} radius={busWheelRadius} tireWidth={0.38} />
        <Wheel isFront={false} isLeft={true} radius={busWheelRadius} tireWidth={0.38} />
        <Wheel isFront={false} isLeft={false} radius={busWheelRadius} tireWidth={0.38} />

        <group position={[0, busWheelRadius + 0.2, 0]}>
          {/* Bus Main Monocoque Body */}
          <mesh position={[0, height * 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[width, height, length]} />
            <primitive object={bodyMaterial} attach="material" />
          </mesh>

          {/* Panoramic Passenger Window Bays (Left & Right) */}
          <mesh position={[halfWidth + 0.01, height * 0.65, 0]}>
            <boxGeometry args={[0.02, height * 0.45, length * 0.88]} />
            <primitive object={glassMaterial} attach="material" />
          </mesh>
          <mesh position={[-halfWidth - 0.01, height * 0.65, 0]}>
            <boxGeometry args={[0.02, height * 0.45, length * 0.88]} />
            <primitive object={glassMaterial} attach="material" />
          </mesh>

          {/* Front Windshield */}
          <mesh position={[0, height * 0.65, halfLength + 0.01]}>
            <boxGeometry args={[width * 0.92, height * 0.5, 0.05]} />
            <primitive object={glassMaterial} attach="material" />
          </mesh>

          {/* Illuminated LED Destination Board */}
          <mesh position={[0, height * 0.95, halfLength + 0.02]}>
            <boxGeometry args={[width * 0.7, 0.28, 0.06]} />
            <meshStandardMaterial
              color="#facc15"
              emissive="#facc15"
              emissiveIntensity={headlightsOn ? 2.5 : 0.8}
            />
          </mesh>

          {/* Headlights & Taillights */}
          <mesh position={[-halfWidth * 0.75, 0.3, halfLength + 0.02]}>
            <boxGeometry args={[0.35, 0.2, 0.06]} />
            <primitive object={headlightGlowMaterial} attach="material" />
          </mesh>
          <mesh position={[halfWidth * 0.75, 0.3, halfLength + 0.02]}>
            <boxGeometry args={[0.35, 0.2, 0.06]} />
            <primitive object={headlightGlowMaterial} attach="material" />
          </mesh>
          <mesh position={[-halfWidth * 0.75, 0.3, -halfLength - 0.02]}>
            <boxGeometry args={[0.35, 0.2, 0.06]} />
            <primitive object={taillightGlowMaterial} attach="material" />
          </mesh>
          <mesh position={[halfWidth * 0.75, 0.3, -halfLength - 0.02]}>
            <boxGeometry args={[0.35, 0.2, 0.06]} />
            <primitive object={taillightGlowMaterial} attach="material" />
          </mesh>
        </group>

        {headlightsOn && (
          <spotLight
            position={[0, busWheelRadius + 0.4, halfLength]}
            target-position={[0, -0.5, halfLength + 35]}
            color="#ffffff"
            intensity={7.0}
            angle={0.7}
            distance={50}
            castShadow
          />
        )}
      </group>
    );
  }

  // ========================================================
  // 4. HIGH-PERFORMANCE EXOTIC SPORTS CAR / SUPERCAR / HYPERCAR
  // ========================================================
  return (
    <group rotation={[pitchAngle, 0, rollAngle]}>
      {/* 4 Performance Wheels with Staggered Supercar Stance */}
      <Wheel isFront={true} isLeft={true} tireWidth={0.32} />
      <Wheel isFront={true} isLeft={false} tireWidth={0.32} />
      <Wheel isFront={false} isLeft={true} tireWidth={0.38} />
      <Wheel isFront={false} isLeft={false} tireWidth={0.38} />

      {/* Main Aerodynamic Supercar Monocoque & Bodywork */}
      <group position={[0, wheelRadius + 0.12, 0]}>
        {/* 1. Flat Underbody Aerodynamic Carbon Floor Tray */}
        <mesh position={[0, -0.06, 0]} castShadow receiveShadow>
          <boxGeometry args={[width * 0.96, 0.06, length * 0.98]} />
          <primitive object={carbonMaterial} attach="material" />
        </mesh>

        {/* 2. Lower Central Monocoque Tub */}
        <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
          <boxGeometry args={[width * 0.88, height * 0.38, length * 0.92]} />
          <primitive object={bodyMaterial} attach="material" />
        </mesh>

        {/* 3. Flared Front Wheel Arches (Muscular Front Fenders) */}
        <mesh position={[-halfWidth * 0.88, 0.16, wheelbase * 0.5]} castShadow>
          <boxGeometry args={[width * 0.22, height * 0.38, length * 0.32]} />
          <primitive object={bodyMaterial} attach="material" />
        </mesh>
        <mesh position={[halfWidth * 0.88, 0.16, wheelbase * 0.5]} castShadow>
          <boxGeometry args={[width * 0.22, height * 0.38, length * 0.32]} />
          <primitive object={bodyMaterial} attach="material" />
        </mesh>

        {/* 4. Muscular Rear Widebody Haunches (Exotic Supercar Hourglass Silhouette) */}
        <mesh position={[-halfWidth * 0.94, 0.18, -wheelbase * 0.5]} castShadow>
          <boxGeometry args={[width * 0.26, height * 0.44, length * 0.36]} />
          <primitive object={bodyMaterial} attach="material" />
        </mesh>
        <mesh position={[halfWidth * 0.94, 0.18, -wheelbase * 0.5]} castShadow>
          <boxGeometry args={[width * 0.26, height * 0.44, length * 0.36]} />
          <primitive object={bodyMaterial} attach="material" />
        </mesh>

        {/* 5. Inset Door Scallops & Deep Side Air Intakes (Radiator Cooling Ducts) */}
        <mesh position={[-halfWidth * 0.84, 0.15, -halfLength * 0.08]} castShadow>
          <boxGeometry args={[0.08, height * 0.28, length * 0.24]} />
          <primitive object={carbonMaterial} attach="material" />
        </mesh>
        <mesh position={[halfWidth * 0.84, 0.15, -halfLength * 0.08]} castShadow>
          <boxGeometry args={[0.08, height * 0.28, length * 0.24]} />
          <primitive object={carbonMaterial} attach="material" />
        </mesh>
        {/* Side intake black honeycomb grilles */}
        <mesh position={[-halfWidth * 0.87, 0.15, -halfLength * 0.16]}>
          <boxGeometry args={[0.04, height * 0.22, 0.08]} />
          <primitive object={darkGrilleMaterial} attach="material" />
        </mesh>
        <mesh position={[halfWidth * 0.87, 0.15, -halfLength * 0.16]}>
          <boxGeometry args={[0.04, height * 0.22, 0.08]} />
          <primitive object={darkGrilleMaterial} attach="material" />
        </mesh>

        {/* 6. Aerodynamic Ground-Effect Carbon Side Skirts with Rear Aero Finlets */}
        <mesh position={[-halfWidth * 0.96, -0.04, 0]} castShadow>
          <boxGeometry args={[0.08, 0.04, wheelbase * 0.88]} />
          <primitive object={carbonMaterial} attach="material" />
        </mesh>
        <mesh position={[halfWidth * 0.96, -0.04, 0]} castShadow>
          <boxGeometry args={[0.08, 0.04, wheelbase * 0.88]} />
          <primitive object={carbonMaterial} attach="material" />
        </mesh>
        {/* Upturned vertical side aero fins */}
        <mesh position={[-halfWidth * 0.98, 0.04, -wheelbase * 0.42]}>
          <boxGeometry args={[0.03, 0.14, 0.18]} />
          <primitive object={carbonMaterial} attach="material" />
        </mesh>
        <mesh position={[halfWidth * 0.98, 0.04, -wheelbase * 0.42]}>
          <boxGeometry args={[0.03, 0.14, 0.18]} />
          <primitive object={carbonMaterial} attach="material" />
        </mesh>

        {/* 7. Low-Slung Aerodynamic Wedge Hood & Sloping Nose */}
        <mesh position={[0, 0.18, halfLength * 0.52]} rotation={[-0.14, 0, 0]} castShadow>
          <boxGeometry args={[width * 0.84, height * 0.28, halfLength * 0.78]} />
          <primitive object={bodyMaterial} attach="material" />
        </mesh>
        {/* Pointed Shark-Nose Center Bumper Prow */}
        <mesh position={[0, 0.02, halfLength + 0.02]} rotation={[-0.1, 0, 0]} castShadow>
          <boxGeometry args={[width * 0.5, height * 0.26, 0.16]} />
          <primitive object={bodyMaterial} attach="material" />
        </mesh>

        {/* Twin Recessed Carbon Fiber Hood Heat Extraction Vents (Nostrils) */}
        <mesh position={[-width * 0.22, 0.25, halfLength * 0.48]} rotation={[-0.14, 0, 0]}>
          <boxGeometry args={[width * 0.16, 0.04, halfLength * 0.28]} />
          <primitive object={carbonMaterial} attach="material" />
        </mesh>
        <mesh position={[width * 0.22, 0.25, halfLength * 0.48]} rotation={[-0.14, 0, 0]}>
          <boxGeometry args={[width * 0.16, 0.04, halfLength * 0.28]} />
          <primitive object={carbonMaterial} attach="material" />
        </mesh>

        {/* 8. Aggressive Front Bumper Air Intakes (Radiator & Intercooler Grilles) */}
        {/* Center trapezoidal intake scoop */}
        <mesh position={[0, -0.02, halfLength + 0.05]}>
          <boxGeometry args={[width * 0.38, height * 0.18, 0.1]} />
          <primitive object={darkGrilleMaterial} attach="material" />
        </mesh>
        {/* Left & Right angled intercooler scoops */}
        <mesh position={[-width * 0.36, -0.02, halfLength + 0.03]} rotation={[0, 0.15, 0]}>
          <boxGeometry args={[width * 0.24, height * 0.18, 0.1]} />
          <primitive object={darkGrilleMaterial} attach="material" />
        </mesh>
        <mesh position={[width * 0.36, -0.02, halfLength + 0.03]} rotation={[0, -0.15, 0]}>
          <boxGeometry args={[width * 0.24, height * 0.18, 0.1]} />
          <primitive object={darkGrilleMaterial} attach="material" />
        </mesh>

        {/* 9. Wide Carbon Fiber Front Splitter Lip & Aerodynamic Canards */}
        <mesh position={[0, -0.11, halfLength + 0.08]} castShadow>
          <boxGeometry args={[width * 1.04, 0.04, 0.36]} />
          <primitive object={carbonMaterial} attach="material" />
        </mesh>
        {/* Left & Right vertical front splitter endplates / dive planes */}
        <mesh position={[-halfWidth * 1.02, -0.04, halfLength + 0.08]}>
          <boxGeometry args={[0.03, 0.14, 0.28]} />
          <primitive object={carbonMaterial} attach="material" />
        </mesh>
        <mesh position={[halfWidth * 1.02, -0.04, halfLength + 0.08]}>
          <boxGeometry args={[0.03, 0.14, 0.28]} />
          <primitive object={carbonMaterial} attach="material" />
        </mesh>

        {/* 10. Razor-Sharp Cyberpunk LED Headlights & DRL Lightbars */}
        {/* Left Headlight Cluster */}
        <group position={[-width * 0.36, 0.18, halfLength * 0.84]} rotation={[-0.12, 0.16, 0]}>
          {/* Dark aerodynamic housing */}
          <mesh>
            <boxGeometry args={[width * 0.22, 0.09, 0.26]} />
            <primitive object={carbonMaterial} attach="material" />
          </mesh>
          {/* Outer glowing glass lens */}
          <mesh position={[0, 0.01, 0.02]}>
            <boxGeometry args={[width * 0.2, 0.08, 0.24]} />
            <primitive object={headlightGlowMaterial} attach="material" />
          </mesh>
          {/* Angled Cyan DRL Daytime Running Light Strip */}
          <mesh position={[0, 0.04, 0.1]}>
            <boxGeometry args={[width * 0.18, 0.025, 0.05]} />
            <primitive object={drlGlowMaterial} attach="material" />
          </mesh>
          {/* Dual Projector LED Lenses */}
          <mesh position={[-0.06, 0, 0.12]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <primitive object={drlGlowMaterial} attach="material" />
          </mesh>
          <mesh position={[0.06, 0, 0.12]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <primitive object={drlGlowMaterial} attach="material" />
          </mesh>
        </group>

        {/* Right Headlight Cluster */}
        <group position={[width * 0.36, 0.18, halfLength * 0.84]} rotation={[-0.12, -0.16, 0]}>
          <mesh>
            <boxGeometry args={[width * 0.22, 0.09, 0.26]} />
            <primitive object={carbonMaterial} attach="material" />
          </mesh>
          <mesh position={[0, 0.01, 0.02]}>
            <boxGeometry args={[width * 0.2, 0.08, 0.24]} />
            <primitive object={headlightGlowMaterial} attach="material" />
          </mesh>
          <mesh position={[0, 0.04, 0.1]}>
            <boxGeometry args={[width * 0.18, 0.025, 0.05]} />
            <primitive object={drlGlowMaterial} attach="material" />
          </mesh>
          <mesh position={[-0.06, 0, 0.12]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <primitive object={drlGlowMaterial} attach="material" />
          </mesh>
          <mesh position={[0.06, 0, 0.12]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <primitive object={drlGlowMaterial} attach="material" />
          </mesh>
        </group>

        {/* Real Headlight Spotlights Casting Onto Road */}
        {headlightsOn && (
          <>
            <spotLight
              position={[-width * 0.36, 0.18, halfLength + 0.2]}
              target-position={[-width * 0.36, -0.5, halfLength + 35]}
              color="#ffffff"
              intensity={8.0}
              angle={0.65}
              penumbra={0.35}
              distance={50}
              castShadow
            />
            <spotLight
              position={[width * 0.36, 0.18, halfLength + 0.2]}
              target-position={[width * 0.36, -0.5, halfLength + 35]}
              color="#ffffff"
              intensity={8.0}
              angle={0.65}
              penumbra={0.35}
              distance={50}
              castShadow
            />
          </>
        )}

        {/* 11. Aerodynamic Teardrop Fighter-Jet Cockpit (Greenhouse) */}
        {/* Deeply Raked Tinted Windshield */}
        <mesh position={[0, height * 0.38, halfLength * 0.14]} rotation={[-0.52, 0, 0]} castShadow>
          <boxGeometry args={[width * 0.74, height * 0.44, length * 0.26]} />
          <primitive object={glassMaterial} attach="material" />
        </mesh>

        {/* Sleek Aerodynamic Double-Bubble Roof Cap */}
        <mesh position={[0, height * 0.62, -halfLength * 0.06]} castShadow>
          <boxGeometry args={[width * 0.68, 0.05, length * 0.36]} />
          <primitive object={bodyMaterial} attach="material" />
        </mesh>
        {/* Exposed Carbon Fiber Central Roof Inset */}
        <mesh position={[0, height * 0.63, -halfLength * 0.06]}>
          <boxGeometry args={[width * 0.36, 0.055, length * 0.34]} />
          <primitive object={carbonMaterial} attach="material" />
        </mesh>

        {/* A-Pillars & Roof Side Cantrails */}
        <mesh position={[-width * 0.36, height * 0.46, halfLength * 0.08]} rotation={[-0.5, 0, 0]}>
          <boxGeometry args={[0.06, height * 0.36, length * 0.2]} />
          <primitive object={bodyMaterial} attach="material" />
        </mesh>
        <mesh position={[width * 0.36, height * 0.46, halfLength * 0.08]} rotation={[-0.5, 0, 0]}>
          <boxGeometry args={[0.06, height * 0.36, length * 0.2]} />
          <primitive object={bodyMaterial} attach="material" />
        </mesh>

        {/* Flush Aerodynamic Side Windows */}
        <mesh position={[-width * 0.38, height * 0.42, -halfLength * 0.06]}>
          <boxGeometry args={[0.03, height * 0.32, length * 0.32]} />
          <primitive object={glassMaterial} attach="material" />
        </mesh>
        <mesh position={[width * 0.38, height * 0.42, -halfLength * 0.06]}>
          <boxGeometry args={[0.03, height * 0.32, length * 0.32]} />
          <primitive object={glassMaterial} attach="material" />
        </mesh>

        {/* Sculpted Winglet Side Mirrors on Aerodynamic Carbon Stalks */}
        <group position={[-halfWidth * 0.9, height * 0.36, 0.22]}>
          <mesh rotation={[0, 0, 0.2]}>
            <boxGeometry args={[0.04, 0.12, 0.04]} />
            <primitive object={carbonMaterial} attach="material" />
          </mesh>
          <mesh position={[-0.1, 0.06, 0]} rotation={[0, -0.15, 0]} castShadow>
            <boxGeometry args={[0.2, 0.09, 0.14]} />
            <primitive object={bodyMaterial} attach="material" />
          </mesh>
        </group>
        <group position={[halfWidth * 0.9, height * 0.36, 0.22]}>
          <mesh rotation={[0, 0, -0.2]}>
            <boxGeometry args={[0.04, 0.12, 0.04]} />
            <primitive object={carbonMaterial} attach="material" />
          </mesh>
          <mesh position={[0.1, 0.06, 0]} rotation={[0, 0.15, 0]} castShadow>
            <boxGeometry args={[0.2, 0.09, 0.14]} />
            <primitive object={bodyMaterial} attach="material" />
          </mesh>
        </group>

        {/* Cockpit Interior & Driver Silhouette */}
        <group position={[0.24, height * 0.3, -halfLength * 0.05]}>
          {/* Driver head with racing helmet */}
          <mesh position={[0, 0.25, 0]}>
            <sphereGeometry args={[0.15, 14, 14]} />
            <meshStandardMaterial color="#00f0ff" roughness={0.3} metalness={0.6} />
          </mesh>
          {/* Helmet Visor */}
          <mesh position={[0, 0.26, 0.1]}>
            <boxGeometry args={[0.18, 0.08, 0.12]} />
            <primitive object={carbonMaterial} attach="material" />
          </mesh>
          {/* Driver racing suit shoulders */}
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[0.34, 0.24, 0.18]} />
            <meshStandardMaterial color="#0f172a" roughness={0.7} />
          </mesh>
          {/* 3-Spoke Sport Flat-Bottom Steering Wheel */}
          <mesh position={[0, 0.16, 0.24]} rotation={[0.42, 0, 0]}>
            <torusGeometry args={[0.11, 0.02, 8, 16]} />
            <meshStandardMaterial color="#18181b" />
          </mesh>
        </group>

        {/* 12. Mid-Engine Fastback Rear Deck & Engine Bay */}
        {/* Sloping Rear Engine Bonnet */}
        <mesh position={[0, height * 0.34, -halfLength * 0.46]} rotation={[0.18, 0, 0]} castShadow>
          <boxGeometry args={[width * 0.78, height * 0.26, length * 0.38]} />
          <primitive object={bodyMaterial} attach="material" />
        </mesh>

        {/* Transparent Glass Engine Bay Showcase Window */}
        <mesh position={[0, height * 0.44, -halfLength * 0.42]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[width * 0.46, 0.02, length * 0.26]} />
          <primitive object={glassMaterial} attach="material" />
        </mesh>

        {/* Visible High-Revving Mid-Engine Details inside Bay */}
        <group position={[0, height * 0.34, -halfLength * 0.42]}>
          {/* Red Performance Cylinder Head Covers */}
          <mesh position={[-0.22, 0, 0]}>
            <boxGeometry args={[0.16, 0.12, 0.36]} />
            <primitive object={engineBlockMaterial} attach="material" />
          </mesh>
          <mesh position={[0.22, 0, 0]}>
            <boxGeometry args={[0.16, 0.12, 0.36]} />
            <primitive object={engineBlockMaterial} attach="material" />
          </mesh>
          {/* Polished Chrome/Silver Air Intake Plenum & Runners */}
          <mesh position={[0, 0.07, 0]}>
            <boxGeometry args={[0.24, 0.08, 0.32]} />
            <primitive object={enginePlenumMaterial} attach="material" />
          </mesh>
        </group>

        {/* Left & Right Engine Cooling Louvers / Ventilation Slats */}
        <mesh position={[-width * 0.32, height * 0.43, -halfLength * 0.44]} rotation={[0.18, 0, 0]}>
          <boxGeometry args={[width * 0.12, 0.02, length * 0.28]} />
          <primitive object={darkGrilleMaterial} attach="material" />
        </mesh>
        <mesh position={[width * 0.32, height * 0.43, -halfLength * 0.44]} rotation={[0.18, 0, 0]}>
          <boxGeometry args={[width * 0.12, 0.02, length * 0.28]} />
          <primitive object={darkGrilleMaterial} attach="material" />
        </mesh>

        {/* 13. Sculpted Rear Fascia & Full-Width Horizon LED Light Bar */}
        {/* Continuous Ruby Red Horizon LED Taillight Bar */}
        <mesh position={[0, 0.27, -halfLength - 0.02]}>
          <boxGeometry args={[width * 0.88, 0.045, 0.06]} />
          <primitive object={taillightBarMaterial} attach="material" />
        </mesh>
        {/* Left & Right Angular LED Taillight Clusters */}
        <mesh position={[-halfWidth * 0.76, 0.23, -halfLength - 0.02]}>
          <boxGeometry args={[0.34, 0.14, 0.06]} />
          <primitive object={taillightGlowMaterial} attach="material" />
        </mesh>
        <mesh position={[halfWidth * 0.76, 0.23, -halfLength - 0.02]}>
          <boxGeometry args={[0.34, 0.14, 0.06]} />
          <primitive object={taillightGlowMaterial} attach="material" />
        </mesh>

        {/* Integrated Sculpted Rear Ducktail Aerodynamic Lip */}
        <mesh position={[0, 0.32, -halfLength + 0.06]} rotation={[-0.15, 0, 0]} castShadow>
          <boxGeometry args={[width * 0.9, 0.06, 0.18]} />
          <primitive object={bodyMaterial} attach="material" />
        </mesh>

        {/* Rear Matte Black Heat Extraction Grilles */}
        <mesh position={[0, 0.08, -halfLength - 0.01]}>
          <boxGeometry args={[width * 0.84, 0.18, 0.04]} />
          <primitive object={darkGrilleMaterial} attach="material" />
        </mesh>

        {/* Rear Braking / Reverse Dynamic Point Light */}
        {(isBraking || isReversing) && (
          <pointLight
            position={[0, 0.25, -halfLength - 0.8]}
            color={isReversing ? '#ffffff' : '#ff1122'}
            intensity={4.5}
            distance={12}
          />
        )}

        {/* 14. Aggressive Carbon Fiber Ground-Effect Rear Diffuser */}
        <mesh position={[0, -0.08, -halfLength - 0.04]} rotation={[-0.14, 0, 0]} castShadow>
          <boxGeometry args={[width * 0.94, 0.14, 0.26]} />
          <primitive object={carbonMaterial} attach="material" />
        </mesh>
        {/* 4 Vertical Aerodynamic Diffuser Tunnel Strakes */}
        {[-0.38, -0.12, 0.12, 0.38].map((dx, i) => (
          <mesh key={i} position={[dx, -0.09, -halfLength - 0.04]} rotation={[-0.14, 0, 0]}>
            <boxGeometry args={[0.025, 0.16, 0.28]} />
            <primitive object={carbonMaterial} attach="material" />
          </mesh>
        ))}

        {/* 15. Quad Polished Titanium Performance Exhaust Tips */}
        {[-0.52, -0.36, 0.36, 0.52].map((exX, i) => (
          <group key={i} position={[exX, -0.04, -halfLength - 0.12]}>
            {/* Chrome/Titanium Pipe Body */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.065, 0.065, 0.22, 16]} />
              <primitive object={chromeMaterial} attach="material" />
            </mesh>
            {/* Heat-Treated Blued Titanium Exhaust Lip */}
            <mesh position={[0, 0, -0.11]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.068, 0.068, 0.02, 16]} />
              <primitive object={titaniumTipMaterial} attach="material" />
            </mesh>
          </group>
        ))}

        {/* 16. Supersonic Nitro Plasma Afterburner Thrusters */}
        {isBoosting && (
          <group position={[0, -0.04, -halfLength - 0.25]}>
            {/* Dynamic Intense Cyan Glow Lighting */}
            <pointLight color="#00f0ff" intensity={6.0} distance={9} />

            {/* Left Supersonic Plasma Flame */}
            <group position={[-0.44, 0, 0]}>
              {/* Outer Cyan/Blue Supersonic Flame Cone pointing backward */}
              <mesh position={[0, 0, -0.45]} rotation={[-Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.16, 0.9, 14]} />
                <meshBasicMaterial color="#00f0ff" transparent opacity={0.85} />
              </mesh>
              {/* Inner Bright White/Violet Plasma Flame Core */}
              <mesh position={[0, 0, -0.25]} rotation={[-Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.08, 0.5, 12]} />
                <primitive object={nitroCoreMaterial} attach="material" />
              </mesh>
            </group>

            {/* Right Supersonic Plasma Flame */}
            <group position={[0.44, 0, 0]}>
              <mesh position={[0, 0, -0.45]} rotation={[-Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.16, 0.9, 14]} />
                <meshBasicMaterial color="#00f0ff" transparent opacity={0.85} />
              </mesh>
              <mesh position={[0, 0, -0.25]} rotation={[-Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.08, 0.5, 12]} />
                <primitive object={nitroCoreMaterial} attach="material" />
              </mesh>
            </group>
          </group>
        )}

        {/* 17. Customizable Aerodynamic Spoilers */}
        {/* Spoiler Level 1: Extended Carbon Ducktail Lip with Gurney Flap */}
        {customization.spoiler === 1 && (
          <mesh position={[0, 0.35, -halfLength + 0.04]} rotation={[-0.2, 0, 0]} castShadow>
            <boxGeometry args={[width * 0.96, 0.06, 0.24]} />
            <primitive object={carbonMaterial} attach="material" />
          </mesh>
        )}

        {/* Spoiler Level 2: High-Downforce GT Carbon Wing */}
        {customization.spoiler === 2 && (
          <group position={[0, height * 0.36, -halfLength + 0.18]}>
            {/* CNC Aluminum Upright Pylons */}
            <mesh position={[-halfWidth * 0.52, 0.24, 0]}>
              <boxGeometry args={[0.04, 0.48, 0.16]} />
              <primitive object={carbonMaterial} attach="material" />
            </mesh>
            <mesh position={[halfWidth * 0.52, 0.24, 0]}>
              <boxGeometry args={[0.04, 0.48, 0.16]} />
              <primitive object={carbonMaterial} attach="material" />
            </mesh>
            {/* Carbon Fiber Main Airfoil Blade */}
            <mesh position={[0, 0.48, -0.06]} rotation={[-0.12, 0, 0]} castShadow>
              <boxGeometry args={[width * 1.05, 0.05, 0.36]} />
              <primitive object={carbonMaterial} attach="material" />
            </mesh>
            {/* Aerodynamic Endplates */}
            <mesh position={[-width * 0.53, 0.48, -0.06]}>
              <boxGeometry args={[0.02, 0.22, 0.42]} />
              <primitive object={carbonMaterial} attach="material" />
            </mesh>
            <mesh position={[width * 0.53, 0.48, -0.06]}>
              <boxGeometry args={[0.02, 0.22, 0.42]} />
              <primitive object={carbonMaterial} attach="material" />
            </mesh>
          </group>
        )}

        {/* Spoiler Level 3: Track-Dominating Super Trofeo Swan-Neck Hyper Wing */}
        {customization.spoiler === 3 && (
          <group position={[0, height * 0.38, -halfLength + 0.16]}>
            {/* Swan-Neck Curved Top-Mount Pylons */}
            <mesh position={[-halfWidth * 0.48, 0.32, 0.04]} rotation={[0.2, 0, 0]}>
              <boxGeometry args={[0.04, 0.62, 0.14]} />
              <primitive object={carbonMaterial} attach="material" />
            </mesh>
            <mesh position={[halfWidth * 0.48, 0.32, 0.04]} rotation={[0.2, 0, 0]}>
              <boxGeometry args={[0.04, 0.62, 0.14]} />
              <primitive object={carbonMaterial} attach="material" />
            </mesh>
            {/* Primary Main Airfoil Blade */}
            <mesh position={[0, 0.62, -0.08]} rotation={[-0.14, 0, 0]} castShadow>
              <boxGeometry args={[width * 1.2, 0.06, 0.4]} />
              <primitive object={carbonMaterial} attach="material" />
            </mesh>
            {/* Secondary Dual-Tier Upper Aero Flap */}
            <mesh position={[0, 0.72, -0.16]} rotation={[-0.22, 0, 0]} castShadow>
              <boxGeometry args={[width * 1.12, 0.03, 0.18]} />
              <primitive object={carbonMaterial} attach="material" />
            </mesh>
            {/* Aggressive Le Mans Style Aero Endplates */}
            <mesh position={[-width * 0.61, 0.62, -0.08]}>
              <boxGeometry args={[0.025, 0.32, 0.48]} />
              <primitive object={carbonMaterial} attach="material" />
            </mesh>
            <mesh position={[width * 0.61, 0.62, -0.08]}>
              <boxGeometry args={[0.025, 0.32, 0.48]} />
              <primitive object={carbonMaterial} attach="material" />
            </mesh>
          </group>
        )}

        {/* 18. Customizable Neon Underglow */}
        {customization.underglow && (
          <group position={[0, -0.15, 0]}>
            <pointLight
              color={customization.underglow}
              intensity={5.5}
              distance={5.5}
            />
            <mesh position={[-halfWidth * 0.9, 0, 0]}>
              <boxGeometry args={[0.06, 0.02, length * 0.7]} />
              <meshBasicMaterial color={customization.underglow} />
            </mesh>
            <mesh position={[halfWidth * 0.9, 0, 0]}>
              <boxGeometry args={[0.06, 0.02, length * 0.7]} />
              <meshBasicMaterial color={customization.underglow} />
            </mesh>
          </group>
        )}

        {/* 19. Taxi Illuminated Sign (If driving taxi variant) */}
        {def.category === 'taxi' && (
          <group position={[0, height * 0.68, -halfLength * 0.12]}>
            <mesh castShadow>
              <boxGeometry args={[0.65, 0.16, 0.22]} />
              <meshStandardMaterial
                color="#fef08a"
                emissive="#facc15"
                emissiveIntensity={headlightsOn ? 2.0 : 0.5}
              />
            </mesh>
          </group>
        )}

        {/* 20. Dynamic Billowing Tire Drift Smoke Puffs */}
        {(isDrifting || isBraking) && (
          <group position={[0, -0.02, 0]}>
            {/* Left Rear Tire Smoke */}
            <group position={[-halfWidth * 0.88, 0, -wheelbase * 0.5 - 0.2]}>
              <mesh position={[0, 0.12, -0.2]} scale={[1.2, 0.8, 1.3]}>
                <sphereGeometry args={[0.3, 8, 8]} />
                <primitive object={tireSmokeMaterial} attach="material" />
              </mesh>
              <mesh position={[-0.12, 0.26, -0.6]} scale={[1.7, 1.2, 1.8]}>
                <sphereGeometry args={[0.36, 8, 8]} />
                <primitive object={tireSmokeMaterial} attach="material" />
              </mesh>
              <mesh position={[0.08, 0.42, -1.05]} scale={[2.3, 1.5, 2.4]}>
                <sphereGeometry args={[0.42, 8, 8]} />
                <primitive object={tireSmokeMaterial} attach="material" />
              </mesh>
            </group>

            {/* Right Rear Tire Smoke */}
            <group position={[halfWidth * 0.88, 0, -wheelbase * 0.5 - 0.2]}>
              <mesh position={[0, 0.12, -0.2]} scale={[1.2, 0.8, 1.3]}>
                <sphereGeometry args={[0.3, 8, 8]} />
                <primitive object={tireSmokeMaterial} attach="material" />
              </mesh>
              <mesh position={[0.12, 0.26, -0.6]} scale={[1.7, 1.2, 1.8]}>
                <sphereGeometry args={[0.36, 8, 8]} />
                <primitive object={tireSmokeMaterial} attach="material" />
              </mesh>
              <mesh position={[-0.08, 0.42, -1.05]} scale={[2.3, 1.5, 2.4]}>
                <sphereGeometry args={[0.42, 8, 8]} />
                <primitive object={tireSmokeMaterial} attach="material" />
              </mesh>
            </group>
          </group>
        )}
      </group>
    </group>
  );
};
