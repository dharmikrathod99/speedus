export type VehicleCategory =
  | 'sports'
  | 'supercar'
  | 'hypercar'
  | 'sedan'
  | 'suv'
  | 'muscle'
  | 'taxi'
  | 'motorcycle'
  | 'truck'
  | 'bus';

export interface VehicleDef {
  id: string;
  name: string;
  brand: string;
  category: VehicleCategory;
  price: number;
  topSpeed: number; // km/h
  acceleration: number; // 0-100 in sec
  handling: number; // 1-10
  braking: number; // 1-10
  mass: number; // kg
  drivetrain: 'RWD' | 'AWD' | 'FWD';
  engineType: string;
  defaultColor: string;
  availableColors: string[];
  description: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    wheelbase: number;
  };
}

export interface VehicleCustomization {
  color: string;
  finish: 'gloss' | 'matte' | 'metallic' | 'pearlescent';
  underglow: string | null;
  spoiler: number; // 0 = none, 1 = sport lip, 2 = carbon wing, 3 = GT super wing
  engineLevel: number; // 0-3 (+10% power per level)
  hasTurbo: boolean;
  brakeLevel: number; // 0-3
  suspensionLevel: number; // 0-3
  wheelColor: string;
  windowTint: number;
}

export type ItemCategory =
  | 'food'
  | 'drink'
  | 'clothing'
  | 'tool'
  | 'medical'
  | 'fitness'
  | 'tactical'
  | 'electronics'
  | 'luxury'
  | 'education';

export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  price: number;
  energyBonus?: number;
  hungerBonus?: number;
  healthBonus?: number;
  armorBonus?: number;
  wantedBonus?: number;
  description: string;
  shopId?: string;
  icon?: string;
}

export interface CityShop {
  id: string;
  name: string;
  categoryName: string;
  type:
    | 'vegetable'
    | 'gym'
    | 'pharmacy'
    | 'hospital'
    | 'school'
    | 'police'
    | 'mall'
    | 'electronics'
    | 'cafe'
    | 'restaurant'
    | 'pizza'
    | 'burger'
    | 'convenience';
  position: [number, number, number];
  entranceHeading?: number;
  description: string;
  tagline: string;
  accentColor: string;
  icon: string;
  chunkX: number;
  chunkZ: number;
  localPos: [number, number, number];
}

export interface Business {
  id: string;
  name: string;
  type: 'taxi_depot' | 'gas_station_franchise' | 'car_wash' | 'tuning_shop';
  purchasePrice: number;
  dailyRevenue: number;
  position: [number, number, number];
  description: string;
}

export type PropertyType = 'apartment' | 'penthouse' | 'villa' | 'mansion' | 'garage';

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  price: number;
  dailyIncome: number;
  position: [number, number, number];
  spawnPosition: [number, number, number];
  description: string;
  features: string[];
}

export type JobType = 'taxi' | 'delivery' | 'racing' | 'police' | 'mechanic' | 'bus' | 'truck' | 'fuel_worker';

export interface Job {
  id: string;
  title: string;
  type: JobType;
  description: string;
  baseReward: number;
  xpReward: number;
  timeLimitSec: number;
  minLevel: number;
  startPosition: [number, number, number];
}

export interface ActiveMission {
  jobId: string;
  title: string;
  type: JobType;
  stage: 'pickup' | 'transit' | 'delivery' | 'racing' | 'completed' | 'bus_route';
  targetPosition: [number, number, number];
  targetName: string;
  timer: number;
  maxTime: number;
  reward: number;
  xpReward: number;
  checkpoints?: [number, number, number][];
  currentCheckpointIndex?: number;
  passengerName?: string;
  cargoType?: string;
}

export type WeatherType = 'clear' | 'sunny' | 'rain' | 'fog' | 'sunset' | 'night';

export type CameraMode = 'chase' | 'cockpit' | 'hood' | 'free';

export interface PlayerAppearance {
  hairColor: string;
  jacketColor: string;
  pantsColor: string;
  skinColor: string;
  shirtType?: 'hoodie' | 'tshirt' | 'jacket' | 'suit' | 'tanktop';
  pantsType?: 'jeans' | 'cargo' | 'shorts' | 'trackpants';
  shoesColor?: string;
  hairStyle?: 'short' | 'cap' | 'beanie' | 'fade' | 'long';
  eyewear?: 'none' | 'sunglasses' | 'aviators' | 'visor';
  eyewearColor?: string;
  eyeColor?: string;
}

export interface PlayerProfile {
  name: string;
  cash: number;
  bank: number;
  xp: number;
  level: number;
  reputation: number;
  energy: number;
  hunger: number;
  health: number;
  maxHealth?: number;
  armor: number;
  maxArmor?: number;
  stamina: number;
  ownedVehicles: Record<string, VehicleCustomization>;
  activeVehicleId: string | null;
  ownedProperties: string[];
  ownedBusinesses: string[];
  inventory: Record<string, number>; // itemId -> count
  activeHomeId: string;
  completedMissions: number;
  careerEarnings: number;
  appearance: PlayerAppearance;
}

export interface GameSettings {
  graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
  shadows: boolean;
  bloom: boolean;
  soundVolume: number;
  engineVolume: number;
  musicVolume: number;
  showFps: boolean;
  fov: number;
  speedUnit: 'kmh' | 'mph';
  touchControls: boolean;
}

export interface POI {
  id: string;
  name: string;
  type:
    | 'dealership'
    | 'garage'
    | 'gas_station'
    | 'shop'
    | 'property'
    | 'job'
    | 'home'
    | 'business'
    | 'stunt'
    | 'vegetable'
    | 'gym'
    | 'pharmacy'
    | 'hospital'
    | 'school'
    | 'police'
    | 'mall'
    | 'electronics'
    | 'cafe'
    | 'restaurant'
    | 'pizza'
    | 'burger';
  position: [number, number, number];
  icon: string;
  description: string;
}
