import { Job, Property, POI, Business, InventoryItem } from '../types/game';

export const INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: 'nitro-drink',
    name: 'Apex Nitro Rush Energy Drink',
    category: 'drink',
    price: 25,
    energyBonus: 40,
    hungerBonus: 5,
    description: 'High-octane carbonated beverage that instantly restores stamina and focus.'
  },
  {
    id: 'espresso-coffee',
    name: 'Metropolitan Dark Roast Coffee',
    category: 'drink',
    price: 15,
    energyBonus: 25,
    hungerBonus: 0,
    description: 'Freshly brewed artisan espresso.'
  },
  {
    id: 'gourmet-sandwich',
    name: 'Downtown Deli Pastrami Club',
    category: 'food',
    price: 32,
    energyBonus: 10,
    hungerBonus: 55,
    description: 'Hearty sandwich with smoked pastrami, aged cheddar, and house mustard.'
  },
  {
    id: 'protein-snack',
    name: 'Titan Power Protein Bar',
    category: 'food',
    price: 18,
    energyBonus: 15,
    hungerBonus: 30,
    description: 'Dense nutrition bar for quick sustenance on long drives.'
  },
  {
    id: 'tire-kit',
    name: 'Roadside Emergency Repair Kit',
    category: 'tool',
    price: 180,
    energyBonus: 0,
    hungerBonus: 0,
    description: 'Emergency tire inflator and sealant tool that restores 25% vehicle integrity.'
  }
];

export const BUSINESSES: Business[] = [
  {
    id: 'biz-carwash',
    name: 'Downtown Laser Car Wash',
    type: 'car_wash',
    purchasePrice: 120000,
    dailyRevenue: 1200,
    position: [20, 0, 80],
    description: 'Automated touchless vehicle wash facility in high-traffic downtown avenue.'
  },
  {
    id: 'biz-taxi-depot',
    name: 'Crown Metro Taxi Fleet Depot',
    type: 'taxi_depot',
    purchasePrice: 220000,
    dailyRevenue: 2400,
    position: [25, 0, -35],
    description: 'Central fleet operations center managing 40 dispatch cabs.'
  },
  {
    id: 'biz-gas-station',
    name: 'NitroFuel Station Franchise',
    type: 'gas_station_franchise',
    purchasePrice: 380000,
    dailyRevenue: 4200,
    position: [0, 0, -55],
    description: 'Prime highway intersection refueling plaza and convenience mart.'
  },
  {
    id: 'biz-speedworks',
    name: 'SpeedWorks Customs Tuning Franchise',
    type: 'tuning_shop',
    purchasePrice: 650000,
    dailyRevenue: 7500,
    position: [-45, 0, 65],
    description: 'Renowned performance automotive tuning & modification workshop.'
  }
];

export const PROPERTIES: Property[] = [
  {
    id: 'starter-loft',
    name: 'Downtown Skyview Loft',
    type: 'apartment',
    price: 45000,
    dailyIncome: 250,
    position: [60, 0, -40],
    spawnPosition: [60, 1, -35],
    description: 'Chic modern studio in the center of the financial district. Hardwood floors, high ceilings, and panoramic urban vistas.',
    features: ['1 Garage Space', 'Fast Travel Point', 'Daily Passive Rent', 'Custom Wardrobe']
  },
  {
    id: 'luxury-villa',
    name: 'Oceanview Coastal Estate',
    type: 'villa',
    price: 480000,
    dailyIncome: 2200,
    position: [-130, 0, -120],
    spawnPosition: [-130, 1, -115],
    description: 'Breathtaking beachfront architectural masterpiece. Infinity pool overlooking the ocean, private palm gardens, and 4-car showroom garage.',
    features: ['4-Car Showroom Garage', 'Ocean Horizon View', 'High Passive Income', 'Helipad Access']
  },
  {
    id: 'skyline-penthouse',
    name: 'Apex Horizon Super-Penthouse',
    type: 'penthouse',
    price: 1350000,
    dailyIncome: 6500,
    position: [0, 0, 130],
    spawnPosition: [0, 1, 125],
    description: 'Crown of the metropolis. Occupying the entire top two floors of the Apex Tower with 360-degree glass walls and private rooftop club.',
    features: ['6-Car Vault Garage', 'City Crown Landmark', 'Elite VIP Status', 'Rooftop Helipad']
  }
];

export const JOBS: Job[] = [
  {
    id: 'job-taxi',
    title: 'City Taxi Dispatch',
    type: 'taxi',
    description: 'Answer passenger ride hails across town. Drive smoothly, avoid collisions, and beat the clock to collect handsome tips!',
    baseReward: 1200,
    xpReward: 150,
    timeLimitSec: 90,
    minLevel: 1,
    startPosition: [25, 0, -35]
  },
  {
    id: 'job-bus',
    title: 'Metropolitan Transit Bus Route',
    type: 'bus',
    description: 'Drive the Cityline Rapid Transit bus along designated stops. Pick up and drop off commuters across the metropolitan avenue circuit.',
    baseReward: 3200,
    xpReward: 380,
    timeLimitSec: 120,
    minLevel: 1,
    startPosition: [0, 0, 20]
  },
  {
    id: 'job-truck',
    title: 'Heavy Logistics Cargo Haul',
    type: 'truck',
    description: 'Haul 20-ton industrial freight container from the Pacific Logistics Docks across the suspension bridge to the Highway Depot.',
    baseReward: 5500,
    xpReward: 600,
    timeLimitSec: 110,
    minLevel: 1,
    startPosition: [-75, 0, 15]
  },
  {
    id: 'job-delivery',
    title: 'High-Priority Courier',
    type: 'delivery',
    description: 'Urgent express delivery across districts. Race through traffic to deliver sensitive parcels to corporate towers.',
    baseReward: 2500,
    xpReward: 300,
    timeLimitSec: 80,
    minLevel: 1,
    startPosition: [-75, 0, 15]
  },
  {
    id: 'job-racing',
    title: 'Neon Midnight Grand Prix',
    type: 'racing',
    description: 'High-stakes illegal street circuit! Blast through 8 neon checkpoints across downtown avenues and the highway bridge for massive cash prizes!',
    baseReward: 8500,
    xpReward: 900,
    timeLimitSec: 100,
    minLevel: 2,
    startPosition: [85, 0, 30]
  },
  {
    id: 'job-police',
    title: 'Metropolitan Highway Interceptor',
    type: 'police',
    description: 'Pursue and neutralize an outlaw street racer tearing through the city boulevards. Ram and corner the suspect to restore order.',
    baseReward: 5000,
    xpReward: 650,
    timeLimitSec: 110,
    minLevel: 2,
    startPosition: [-35, 0, -85]
  }
];

export const POINTS_OF_INTEREST: POI[] = [
  {
    id: 'poi-dealership',
    name: 'Apex Supercar Dealership',
    type: 'dealership',
    position: [22, 0, 48],
    icon: 'Car',
    description: 'Browse, test drive, and purchase the world\'s finest exotic supercars, hypercars, bikes, and trucks.'
  },
  {
    id: 'poi-garage',
    name: 'SpeedWorks Customs & Tuning',
    type: 'garage',
    position: [-92, 0, 48],
    icon: 'Wrench',
    description: 'Upgrade your engine, bolt on turbos, customize neon underglow, spoilers, and custom paint finishes.'
  },
  {
    id: 'poi-gas',
    name: 'NitroFuel Station & Convenience Mart',
    type: 'gas_station',
    position: [22, 0, -48],
    icon: 'Fuel',
    description: 'Refuel your vehicle and buy snacks, coffee, and energy drinks to replenish hunger and stamina.'
  },
  {
    id: 'poi-home-starter',
    name: 'Skyview Loft (Player Home)',
    type: 'home',
    position: [48, 0, -48],
    icon: 'Home',
    description: 'Your starter bachelor apartment in the heart of downtown.'
  },
  {
    id: 'poi-luxury-villa',
    name: 'Oceanview Coastal Estate',
    type: 'home',
    position: [-118, 0, -162],
    icon: 'Home',
    description: 'Breathtaking beachfront architectural villa with ocean horizon views and showroom garage.'
  },
  {
    id: 'poi-job-taxi',
    name: 'Taxi Dispatch Depot',
    type: 'job',
    position: [22, 0, -35],
    icon: 'Navigation',
    description: 'Start passenger taxi missions across the city.'
  },
  {
    id: 'poi-job-racing',
    name: 'Street Racing Starting Grid',
    type: 'job',
    position: [0, 0, 20],
    icon: 'Flag',
    description: 'Enter high-speed checkpoint street races.'
  },
  {
    id: 'poi-stunt-beach',
    name: 'Beachfront Stunt Jump Arena',
    type: 'stunt',
    position: [-93, 0, 23],
    icon: 'Flame',
    description: 'High-speed coastal launch ramps on the open beach sand! Hit the gas with Nitro to soar through the air and earn stunt cash bonuses.'
  },
  {
    id: 'poi-stunt-urban',
    name: 'Urban Stunt Park Launch Ramp',
    type: 'stunt',
    position: [23, 0, 47],
    icon: 'Zap',
    description: 'Paved launch wedge ramp in the city stunt park lot. Perfect for 360 air spins, high jumps, and earning airtime rewards.'
  }
];

// Street Race Checkpoint Circuit coordinates (8 checkpoints forming a high-speed downtown loop)
export const STREET_RACE_CIRCUIT: [number, number, number][] = [
  [85, 0.5, 30],
  [85, 0.5, 90],
  [20, 0.5, 110],
  [-50, 0.5, 110],
  [-80, 0.5, 40],
  [-80, 0.5, -40],
  [-20, 0.5, -80],
  [60, 0.5, -60],
  [85, 0.5, 30] // Finish Line
];

// Bus Route Checkpoints (4 bus stops around downtown & ocean avenue)
export const BUS_ROUTE_STOPS: [number, number, number][] = [
  [30, 0.5, 20],
  [30, 0.5, 80],
  [-60, 0.5, 80],
  [-60, 0.5, -20],
  [30, 0.5, 20]
];
