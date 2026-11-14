/**
 * SPEED US: Universal Entity Vehicle Registry & Commandeering System
 * Allows the player to enter, hijack, and drive ANY vehicle in the open world,
 * including moving NPC traffic cars and parked showcase vehicles across the metropolis.
 */

import { vehiclePhysics } from './vehiclePhysics';
import { trafficCars, TrafficCarState, TRAFFIC_CIRCUITS } from './trafficPhysics';
import { VEHICLES } from '../data/vehicles';

export interface EnterableVehicleInfo {
  type: 'player' | 'traffic' | 'parked';
  id: number | string;
  name: string;
  vehicleDefId: string;
  color: string;
  pos: { x: number; y: number; z: number };
  heading: number;
  speed: number;
  distance: number;
}

export interface ParkedVehicleState {
  id: string;
  name: string;
  vehicleDefId: string;
  color: string;
  x: number;
  y: number;
  z: number;
  heading: number;
  halfW: number;
  halfD: number;
}

export const initialParkedVehicles: ParkedVehicleState[] = [
  // 1. Apex Dealership Showroom Pad: Exotic Supercar
  {
    id: 'parked-dealer-v12',
    name: 'Phantom Nemesis V12 Supercar',
    vehicleDefId: 'phantom-v12',
    color: '#e11d48',
    x: 26,
    y: 0.45,
    z: 38,
    heading: Math.PI,
    halfW: 1.1,
    halfD: 2.35
  },
  // 2. Apex Dealership Forecourt Display: Supersonic Hypercar
  {
    id: 'parked-dealer-horizon',
    name: 'Apex Horizon GT Hypercar',
    vehicleDefId: 'apex-horizon',
    color: '#00f0ff',
    x: 16,
    y: 0.45,
    z: 38,
    heading: Math.PI,
    halfW: 1.12,
    halfD: 2.4
  },
  // 3. SpeedWorks Customs Garage Bay: Tuned Muscle Car
  {
    id: 'parked-garage-muscle',
    name: 'Sovereign 500 GT Muscle Car',
    vehicleDefId: 'v8-sovereign',
    color: '#dc2626',
    x: -84,
    y: 0.45,
    z: 38,
    heading: Math.PI,
    halfW: 1.08,
    halfD: 2.38
  },
  // 4. NitroFuel Gas Station Pump Bay: Classic Yellow Taxi
  {
    id: 'parked-gas-taxi',
    name: 'Crown Cruiser Cab',
    vehicleDefId: 'starter-taxi',
    color: '#f59e0b',
    x: 28,
    y: 0.45,
    z: -40,
    heading: 0,
    halfW: 1.05,
    halfD: 2.4
  },
  // 5. Starter Loft Parking Bay: Tuned Sports Car
  {
    id: 'parked-loft-cyclone',
    name: 'Cyclone R-Spec Sports Car',
    vehicleDefId: 'cyclone-turbo',
    color: '#8b5cf6',
    x: 44,
    y: 0.45,
    z: -42,
    heading: 0,
    halfW: 1.05,
    halfD: 2.25
  },
  // 6. Suburban Luxury Villa Driveway: Offroad 4x4
  {
    id: 'parked-villa-suv',
    name: 'Titan Overlander 4x4',
    vehicleDefId: 'titan-suv',
    color: '#15803d',
    x: -110,
    y: 0.45,
    z: -158,
    heading: Math.PI / 2,
    halfW: 1.12,
    halfD: 2.5
  }
];

export const parkedVehicles: ParkedVehicleState[] = initialParkedVehicles.map((p) => ({ ...p }));

/**
 * Returns dynamic obstacles for parked vehicles to prevent clipping
 */
export function getParkedObstacles() {
  return parkedVehicles.map((p) => ({
    x: p.x,
    z: p.z,
    rotY: p.heading,
    halfW: p.halfW,
    halfD: p.halfD,
    id: p.id
  }));
}

/**
 * Finds the nearest vehicle that can be entered by the player on foot
 */
export function getNearestEnterableVehicle(px: number, pz: number, maxDist = 5.5): EnterableVehicleInfo | null {
  let nearest: EnterableVehicleInfo | null = null;
  let minDist = maxDist;

  // 1. Current Active Player Vehicle
  const distActive = Math.hypot(px - vehiclePhysics.pos.x, pz - vehiclePhysics.pos.z);
  if (distActive < minDist) {
    minDist = distActive;
    const store = typeof window !== 'undefined' && (window as any).__SPEEDUS_STORE__
      ? (window as any).__SPEEDUS_STORE__.getState()
      : null;
    const activeDefId = store?.player?.activeVehicleId || 'cyclone-turbo';
    const activeColor = store?.player?.ownedVehicles?.[activeDefId]?.color || '#00f0ff';
    const activeName = VEHICLES[activeDefId]?.name || 'Your Vehicle';

    nearest = {
      type: 'player',
      id: 'active-player-car',
      name: activeName,
      vehicleDefId: activeDefId,
      color: activeColor,
      pos: { x: vehiclePhysics.pos.x, y: vehiclePhysics.pos.y, z: vehiclePhysics.pos.z },
      heading: vehiclePhysics.heading,
      speed: vehiclePhysics.velocity,
      distance: distActive
    };
  }

  // 2. Moving or Stopped NPC Traffic Cars
  for (const car of trafficCars) {
    const dist = Math.hypot(px - car.x, pz - car.z);
    if (dist < minDist) {
      minDist = dist;
      nearest = {
        type: 'traffic',
        id: car.id,
        name: car.name || `${car.category.toUpperCase()} Traffic Car`,
        vehicleDefId: car.vehicleDefId || (car.category === 'sports' ? 'cyclone-turbo' : (car.category === 'suv' ? 'titan-suv' : 'v8-sovereign')),
        color: car.color,
        pos: { x: car.x, y: car.y, z: car.z },
        heading: car.rotY,
        speed: car.speed,
        distance: dist
      };
    }
  }

  // 3. Parked Showcase & Street Entity Vehicles
  for (const p of parkedVehicles) {
    const dist = Math.hypot(px - p.x, pz - p.z);
    if (dist < minDist) {
      minDist = dist;
      nearest = {
        type: 'parked',
        id: p.id,
        name: p.name,
        vehicleDefId: p.vehicleDefId,
        color: p.color,
        pos: { x: p.x, y: p.y, z: p.z },
        heading: p.heading,
        speed: 0,
        distance: dist
      };
    }
  }

  return nearest;
}

/**
 * Handles world entity cleanup / respawn when an NPC or parked car is commandeered
 */
export function onVehicleCommandeered(target: EnterableVehicleInfo, previousPos?: { x: number; y: number; z: number }) {
  if (target.type === 'traffic') {
    const car = trafficCars.find((c) => c.id === target.id);
    if (car) {
      // Seamlessly relocate the NPC car to the opposite side of its circuit so city traffic stays full
      const circuit = TRAFFIC_CIRCUITS[car.circuitIndex] || TRAFFIC_CIRCUITS[0];
      car.waypointIndex = (car.waypointIndex + 2) % circuit.length;
      car.x = circuit[car.waypointIndex][0];
      car.z = circuit[car.waypointIndex][1];
      car.speed = car.maxSpeed;
      car.targetSpeed = car.maxSpeed;
      car.isBraking = false;
      car.recoilX = 0;
      car.recoilZ = 0;
    }
  } else if (target.type === 'parked') {
    const p = parkedVehicles.find((v) => v.id === target.id);
    if (p) {
      // Hide the parked vehicle mesh so it seamlessly becomes the player's active drivable vehicle
      p.y = -100;
    }
  }
}

