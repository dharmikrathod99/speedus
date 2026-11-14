import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  PlayerProfile,
  VehicleCustomization,
  ActiveMission,
  WeatherType,
  CameraMode,
  GameSettings
} from '../types/game';
import { VEHICLES, DEFAULT_CUSTOMIZATION } from '../data/vehicles';
import { PROPERTIES, JOBS, STREET_RACE_CIRCUIT, BUS_ROUTE_STOPS, BUSINESSES, INVENTORY_ITEMS } from '../data/worldData';
import { ALL_SHOP_ITEMS, CITY_SHOPS } from '../data/shopsData';
import { soundSystem } from '../audio/soundSystem';
import { vehiclePhysics, playerPhysics } from './vehiclePhysics';
import { getNearestEnterableVehicle, onVehicleCommandeered } from './entityVehicles';
import { ENTERABLE_HOUSES } from './houseSystem';
import { resolveWorldCollisions } from '../physics/worldCollisions';

interface GameState {
  // Player & Character Profile
  player: PlayerProfile;
  mode: 'driving' | 'walking';
  playerPosition: [number, number, number];
  playerRotation: [number, number, number];
  cameraMode: CameraMode;

  // Vehicle Dynamics & Telemetry
  vehiclePosition: [number, number, number];
  vehicleRotation: [number, number, number];
  vehicleSpeed: number; // km/h
  vehicleRpm: number;
  vehicleGear: number | 'R' | 'N';
  vehicleNitro: number; // 0 - 100
  vehicleFuel: number; // 0 - 100
  vehicleHealth: number; // 0 - 100
  headlightsOn: boolean;
  hazardsOn: boolean;
  isBraking: boolean;
  isDrifting: boolean;

  // World Environment
  timeOfDay: number; // 0.0 - 24.0 (hours)
  weather: WeatherType;
  rainIntensity: number;

  // Missions & Progression
  activeMission: ActiveMission | null;
  missionTimeLeft: number;
  customWaypoint: [number, number, number] | null;

  // House & Interior Residency
  isInsideHouse: boolean;
  activeHouseId: string | null;
  exteriorExitPos: [number, number, number] | null;
  activeTvChannel: number;
  enterHouse: (houseId?: string) => void;
  exitHouse: () => void;
  cycleTvChannel: () => void;
  restInBed: () => void;
  eatFromFridge: () => void;

  // Shop 3D Interior System
  isInsideShop: boolean;
  activeShopInteriorId: string | null;
  enterShopInterior: (shopId: string) => void;
  exitShopInterior: () => void;

  // UI Screens & Overlays
  activeScreen: 'game' | 'dealership' | 'garage' | 'map' | 'shop' | 'property' | 'settings' | 'wardrobe';
  isPhoneOpen: boolean;
  activePhoneApp: 'home' | 'bank' | 'jobs' | 'garage' | 'realestate' | 'radio' | 'weather' | 'settings';
  radioStation: string;
  radioPlaying: boolean;

  // Appearance & Wardrobe
  updateAppearance: (appearance: Partial<import('../types/game').PlayerAppearance>) => void;

  // Law Enforcement & Wanted Status
  wantedLevel: number;
  setWantedLevel: (level: number) => void;

  // Settings
  settings: GameSettings;

  // Notifications
  notification: { title: string; message: string; type?: 'info' | 'success' | 'warning' } | null;

  // Combat, Vital Health & Wasted State
  isWasted: boolean;
  damageFlash: boolean;
  activeWeapon: 'fists' | 'bat' | 'pistol';
  damagePlayer: (amount: number, attackerName?: string) => void;
  respawnPlayer: () => void;
  setActiveWeapon: (weapon: 'fists' | 'bat' | 'pistol') => void;
  activateGodHealthCheat: () => void;
  resetHealthToStandard: () => void;

  // Actions
  setMode: (mode: 'driving' | 'walking') => void;
  toggleVehicleEntry: () => void;
  commandeerVehicle: (
    defId: string,
    color: string,
    pos: { x: number; y: number; z: number },
    heading: number,
    speed: number,
    name: string
  ) => void;
  setPlayerPosition: (pos: [number, number, number]) => void;
  setPlayerRotation: (rot: [number, number, number]) => void;
  setVehiclePosition: (pos: [number, number, number]) => void;
  setVehicleRotation: (rot: [number, number, number]) => void;
  updateVehicleTelemetry: (telemetry: {
    speed: number;
    rpm: number;
    gear: number | 'R' | 'N';
    nitro?: number;
    braking?: boolean;
    drifting?: boolean;
    fuel?: number;
  }) => void;
  syncVehicleTelemetry: (telemetry: {
    speed: number;
    rpm: number;
    gear: number | 'R' | 'N';
    nitro?: number;
    braking?: boolean;
    drifting?: boolean;
    fuel?: number;
    pos?: [number, number, number];
    rot?: [number, number, number];
  }) => void;
  toggleHeadlights: () => void;
  toggleHazards: () => void;
  cycleCameraMode: () => void;
  setTimeOfDay: (time: number) => void;
  setWeather: (weather: WeatherType) => void;
  setCustomWaypoint: (pos: [number, number, number] | null) => void;

  // Economy Actions
  addCash: (amount: number, reason?: string) => void;
  spendCash: (amount: number) => boolean;
  transferToBank: (amount: number) => void;
  transferToCash: (amount: number) => void;

  // Vehicle Purchase & Customization
  purchaseVehicle: (defId: string, color?: string) => boolean;
  setActiveVehicle: (defId: string) => void;
  updateCustomization: (defId: string, customization: Partial<VehicleCustomization>) => void;
  repairVehicle: () => void;
  refuelVehicle: () => void;

  // Real Estate & Business Empires
  purchaseProperty: (propertyId: string) => boolean;
  purchaseBusiness: (businessId: string) => boolean;
  setActiveHome: (propertyId: string) => void;
  collectDailyRent: () => void;

  // Inventory & Needs
  activeShopId: string | null;
  openShop: (shopId: string) => void;
  buyShopItem: (itemId: string, consumeImmediately?: boolean) => boolean;
  consumeItem: (itemId: string) => void;

  // Missions & Jobs
  startJob: (jobId: string) => void;
  updateMissionProgress: (dt: number) => void;
  completeMissionCheckpoint: () => void;
  cancelMission: () => void;

  // UI & Navigation
  setActiveScreen: (screen: 'game' | 'dealership' | 'garage' | 'map' | 'shop' | 'property' | 'settings' | 'wardrobe') => void;
  togglePhone: () => void;
  openPhoneApp: (app: 'home' | 'bank' | 'jobs' | 'garage' | 'realestate' | 'radio' | 'weather' | 'settings') => void;
  setRadio: (station: string, playing: boolean) => void;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  showNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
  dismissNotification: () => void;
}

let lastToggleVehicleTime = 0;

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Default Initial Profile
      player: {
        name: 'Jordan Stone',
        cash: 35000,
        bank: 75000,
        xp: 250,
        level: 1,
        reputation: 150,
        energy: 100,
        hunger: 100,
        health: 1000,
        maxHealth: 1000,
        armor: 1000,
        maxArmor: 1000,
        stamina: 100,
        ownedVehicles: {
          'cyclone-turbo': { ...DEFAULT_CUSTOMIZATION, color: '#00f0ff', underglow: '#00f0ff', spoiler: 2 },
          'starter-taxi': { ...DEFAULT_CUSTOMIZATION, color: '#fbbf24', underglow: null, spoiler: 0 }
        },
        activeVehicleId: 'cyclone-turbo',
        ownedProperties: ['starter-loft'],
        ownedBusinesses: [],
        inventory: { 'nitro-drink': 2 },
        activeHomeId: 'starter-loft',
        completedMissions: 0,
        careerEarnings: 35000,
        appearance: {
          hairColor: '#0f172a',
          jacketColor: '#0284c7',
          pantsColor: '#1e293b',
          skinColor: '#fde047',
          shirtType: 'jacket',
          pantsType: 'jeans',
          shoesColor: '#ffffff',
          hairStyle: 'cap',
          eyewear: 'sunglasses',
          eyewearColor: '#0f172a',
          eyeColor: '#0284c7'
        }
      },

      mode: 'walking',
      playerPosition: [60, 0, -32],
      playerRotation: [0, 0, 0],
      cameraMode: 'chase',

      vehiclePosition: [60, 0.4, -24],
      vehicleRotation: [0, 0, 0],
      vehicleSpeed: 0,
      vehicleRpm: 800,
      vehicleGear: 1,
      vehicleNitro: 100,
      vehicleFuel: 95,
      vehicleHealth: 100,
      headlightsOn: true,
      hazardsOn: false,
      isBraking: false,
      isDrifting: false,

      timeOfDay: 13.0, // 1:00 PM bright sunny afternoon
      weather: 'clear',
      rainIntensity: 0,

      activeMission: null,
      missionTimeLeft: 0,
      customWaypoint: null,

      isInsideHouse: false,
      activeHouseId: null,
      exteriorExitPos: null,
      activeTvChannel: 0,

      isInsideShop: false,
      activeShopInteriorId: null,

      activeShopId: null,
      wantedLevel: 0,
      setWantedLevel: (level) => set({ wantedLevel: Math.max(0, Math.min(5, level)) }),
      activeScreen: 'game',
      isPhoneOpen: false,
      activePhoneApp: 'home',
      radioStation: 'Night Drive FM',
      radioPlaying: false,

      settings: {
        graphicsQuality: 'high',
        shadows: true,
        bloom: true,
        soundVolume: 0.8,
        engineVolume: 0.8,
        musicVolume: 0.6,
        showFps: true,
        fov: 65,
        speedUnit: 'kmh',
        touchControls: false
      },

      notification: null,

      // Combat, Vital Health & Wasted State
      isWasted: false,
      damageFlash: false,
      activeWeapon: 'fists',

      setActiveWeapon: (activeWeapon) => {
        soundSystem.playUiClick();
        set({ activeWeapon });
      },

      damagePlayer: (amount: number, attackerName?: string) => {
        const state = get();
        if (state.isWasted) return;

        soundSystem.init();
        soundSystem.resume();

        const curArmor = state.player.armor ?? 0;
        const curHealth = state.player.health ?? 100;

        let newArmor = curArmor;
        let newHealth = curHealth;

        // Armor absorbs 70% of incoming damage
        if (curArmor > 0) {
          const armorDmg = Math.min(curArmor, Math.round(amount * 0.7));
          const healthDmg = amount - armorDmg;
          newArmor = Math.max(0, curArmor - armorDmg);
          newHealth = Math.max(0, curHealth - healthDmg);
        } else {
          newHealth = Math.max(0, curHealth - amount);
        }

        // Damage flash visual indicator
        set({
          damageFlash: true,
          player: {
            ...state.player,
            health: newHealth,
            armor: newArmor
          }
        });

        setTimeout(() => {
          set({ damageFlash: false });
        }, 220);

        if (newHealth <= 0) {
          // Trigger GTA V WASTED
          soundSystem.playWastedSound();
          set({ isWasted: true });

          get().showNotification(
            '💀 WASTED',
            attackerName ? `Knocked out by ${attackerName}!` : 'You were eliminated!',
            'warning'
          );

          // Respawn after 3.8s at St. Jude Metropolitan Hospital
          setTimeout(() => {
            get().respawnPlayer();
          }, 3800);
        }
      },

      respawnPlayer: () => {
        const state = get();
        const medicalFee = Math.min(350, state.player.cash);
        const hospitalX = 0;
        const hospitalY = 0.4;
        const hospitalZ = -135; // St. Jude Metropolitan Hospital entrance

        // Reset live player physics
        playerPhysics.pos.set(hospitalX, hospitalY, hospitalZ);
        playerPhysics.velocityY = 0;
        playerPhysics.isGrounded = true;

        set((s) => ({
          isWasted: false,
          mode: 'walking',
          wantedLevel: 0,
          playerPosition: [hospitalX, hospitalY, hospitalZ],
          playerRotation: [0, 0, 0],
          player: {
            ...s.player,
            cash: Math.max(0, s.player.cash - medicalFee),
            health: 1000,
            maxHealth: 1000,
            armor: 1000,
            maxArmor: 1000,
            energy: 100,
            stamina: 100
          }
        }));

        soundSystem.playHealChime();
        get().showNotification(
          '🏥 ST. JUDE EMERGENCY CLINIC',
          `Revived & discharged with 1,000 HP. Medical fee: -$${medicalFee}.`,
          'info'
        );
      },

      activateGodHealthCheat: () => {
        soundSystem.playHealChime();
        set((s) => ({
          player: {
            ...s.player,
            health: 100000,
            maxHealth: 100000,
            armor: 100000,
            maxArmor: 100000,
            energy: 100,
            stamina: 100
          }
        }));
        get().showNotification(
          '⚡ TITAN GOD MODE (Ctrl+H)',
          'Health elevated to 100,000 HP! Invulnerability activated.',
          'success'
        );
      },

      resetHealthToStandard: () => {
        soundSystem.playHealChime();
        set((s) => ({
          player: {
            ...s.player,
            health: 1000,
            maxHealth: 1000,
            armor: 1000,
            maxArmor: 1000,
            energy: 100,
            stamina: 100
          }
        }));
        get().showNotification(
          '💚 HEALTH RESTORED (Ctrl+1)',
          'Health and Armor reset back to standard 1,000 HP.',
          'info'
        );
      },

      // State mutators
      setMode: (mode) => set({ mode }),

      toggleVehicleEntry: () => {
        const now = performance.now();
        if (now - lastToggleVehicleTime < 450) {
          return; // Strict debounce prevents multi-triggering from multiple keyboard listeners
        }
        lastToggleVehicleTime = now;

        const state = get();
        soundSystem.init();
        soundSystem.resume();

        if (state.mode === 'walking') {
          // Check proximity to ANY enterable vehicle (active vehicle, traffic car, or parked entity vehicle)
          const px = playerPhysics.pos.x;
          const pz = playerPhysics.pos.z;
          const target = getNearestEnterableVehicle(px, pz, 6.0);

          if (target) {
            soundSystem.playUiClick();

            if (target.type === 'player') {
              // Re-enter currently active vehicle
              playerPhysics.pos.copy(vehiclePhysics.pos);
              set({
                mode: 'driving',
                playerPosition: [vehiclePhysics.pos.x, vehiclePhysics.pos.y, vehiclePhysics.pos.z],
                vehiclePosition: [vehiclePhysics.pos.x, vehiclePhysics.pos.y, vehiclePhysics.pos.z],
                vehicleRotation: [0, vehiclePhysics.heading, 0]
              });
              const carName = VEHICLES[state.player.activeVehicleId || 'cyclone-turbo']?.name || 'Vehicle';
              get().showNotification('Vehicle Entered', `Behind the wheel of your ${carName}. Drive: WASD / Space / Shift • [C] to Exit`, 'info');
            } else {
              // Commandeer traffic car or parked vehicle
              const prevPos = { x: vehiclePhysics.pos.x, y: vehiclePhysics.pos.y, z: vehiclePhysics.pos.z };
              state.commandeerVehicle(
                target.vehicleDefId,
                target.color,
                target.pos,
                target.heading,
                target.speed,
                target.name
              );
              onVehicleCommandeered(target, prevPos);
            }
          } else {
            get().showNotification('No Vehicle Nearby', 'Walk closer to any car or traffic vehicle to enter [C].', 'warning');
          }
        } else {
          // Exit vehicle: Spawn immediately beside the driver door at the vehicle's CURRENT location!
          soundSystem.playUiClick();
          const heading = vehiclePhysics.heading;
          // Step out ~1.35m to the left (driver side) of the car's orientation
          const exitOffset = 1.35;
          let exitX = vehiclePhysics.pos.x - Math.cos(heading) * exitOffset;
          let exitZ = vehiclePhysics.pos.z + Math.sin(heading) * exitOffset;
          let exitY = Math.max(0.4, vehiclePhysics.pos.y);

          // Check if left exit collides with solid architecture; if so, try right (passenger) side or resolve
          const colLeft = resolveWorldCollisions(exitX, exitZ, 0.45);
          if (colLeft.collided) {
            const rightX = vehiclePhysics.pos.x + Math.cos(heading) * exitOffset;
            const rightZ = vehiclePhysics.pos.z - Math.sin(heading) * exitOffset;
            const colRight = resolveWorldCollisions(rightX, rightZ, 0.45);
            if (!colRight.collided) {
              exitX = rightX;
              exitZ = rightZ;
            } else {
              exitX = colLeft.x;
              exitZ = colLeft.z;
            }
          }

          // Update live player physics state
          playerPhysics.pos.set(exitX, exitY, exitZ);
          playerPhysics.rotationY = heading;
          playerPhysics.velocityY = 0;
          playerPhysics.isGrounded = true;
          playerPhysics.isMoving = false;
          playerPhysics.isSprinting = false;

          set({
            mode: 'walking',
            playerPosition: [exitX, exitY, exitZ],
            playerRotation: [0, heading, 0],
            vehiclePosition: [vehiclePhysics.pos.x, vehiclePhysics.pos.y, vehiclePhysics.pos.z],
            vehicleRotation: [0, vehiclePhysics.heading, 0],
            vehicleSpeed: 0
          });

          get().showNotification('Vehicle Exited', 'On foot. Press [C] near any vehicle to enter and drive!', 'info');
        }
      },

      commandeerVehicle: (defId, color, pos, heading, speed, name) => {
        soundSystem.init();
        soundSystem.resume();
        soundSystem.playUiClick();

        // Preserve exact vehicle paint color and customization so the car does not change
        const prevCustomization = get().player.ownedVehicles[defId];
        const currentCustomization = {
          ...(prevCustomization || DEFAULT_CUSTOMIZATION),
          color: color || prevCustomization?.color || VEHICLES[defId]?.defaultColor || '#00f0ff',
          underglow: color || prevCustomization?.underglow || '#00f0ff'
        };

        vehiclePhysics.pos.set(pos.x, pos.y || 0.45, pos.z);
        vehiclePhysics.heading = heading;
        vehiclePhysics.velocity = speed;
        vehiclePhysics.speedKmh = Math.abs(speed) * 3.6;
        vehiclePhysics.gear = 1;
        vehiclePhysics.rpm = Math.max(1200, Math.abs(speed) * 150);
        vehiclePhysics.steerAngle = 0;
        vehiclePhysics.pitch = 0;
        vehiclePhysics.roll = 0;
        vehiclePhysics.isAirborne = false;
        vehiclePhysics.velocityY = 0;

        playerPhysics.pos.copy(vehiclePhysics.pos);
        playerPhysics.rotationY = heading;

        set((s) => ({
          mode: 'driving',
          player: {
            ...s.player,
            activeVehicleId: defId,
            ownedVehicles: {
              ...s.player.ownedVehicles,
              [defId]: currentCustomization
            }
          },
          playerPosition: [pos.x, pos.y || 0.45, pos.z],
          playerRotation: [0, heading, 0],
          vehiclePosition: [pos.x, pos.y || 0.45, pos.z],
          vehicleRotation: [0, heading, 0],
          vehicleSpeed: Math.round(Math.abs(speed) * 3.6)
        }));

        get().showNotification(
          '🔥 VEHICLE ENTERED!',
          `You took the wheel of the ${name}! Drive: WASD / Space (Handbrake) / Shift (Nitro) • [C] to Exit`,
          'success'
        );
      },

      setPlayerPosition: (playerPosition) => {
        playerPhysics.pos.set(playerPosition[0], playerPosition[1], playerPosition[2]);
        playerPhysics.velocityY = 0;
        playerPhysics.isGrounded = true;
        set({ playerPosition });
      },
      setPlayerRotation: (playerRotation) => {
        playerPhysics.rotationY = playerRotation[1];
        set({ playerRotation });
      },
      setVehiclePosition: (vehiclePosition) => {
        vehiclePhysics.pos.set(vehiclePosition[0], vehiclePosition[1], vehiclePosition[2]);
        vehiclePhysics.velocity = 0;
        vehiclePhysics.speedKmh = 0;
        vehiclePhysics.velocityY = 0;
        vehiclePhysics.isAirborne = false;
        set({ vehiclePosition, vehicleSpeed: 0 });
      },
      setVehicleRotation: (vehicleRotation) => {
        vehiclePhysics.heading = vehicleRotation[1];
        set({ vehicleRotation });
      },

      updateVehicleTelemetry: (telemetry) => {
        set((state) => ({
          vehicleSpeed: telemetry.speed,
          vehicleRpm: telemetry.rpm,
          vehicleGear: telemetry.gear,
          vehicleNitro: telemetry.nitro !== undefined ? telemetry.nitro : state.vehicleNitro,
          isBraking: telemetry.braking ?? false,
          isDrifting: telemetry.drifting ?? false,
          vehicleFuel: telemetry.fuel !== undefined ? telemetry.fuel : state.vehicleFuel
        }));
      },

      syncVehicleTelemetry: (telemetry) => {
        set((state) => ({
          vehicleSpeed: telemetry.speed,
          vehicleRpm: telemetry.rpm,
          vehicleGear: telemetry.gear,
          vehicleNitro: telemetry.nitro !== undefined ? telemetry.nitro : state.vehicleNitro,
          isBraking: telemetry.braking ?? false,
          isDrifting: telemetry.drifting ?? false,
          vehicleFuel: telemetry.fuel !== undefined ? telemetry.fuel : state.vehicleFuel,
          ...(telemetry.pos ? { vehiclePosition: telemetry.pos } : {}),
          ...(telemetry.rot ? { vehicleRotation: telemetry.rot } : {})
        }));
      },

      toggleHeadlights: () => set((s) => ({ headlightsOn: !s.headlightsOn })),
      toggleHazards: () => set((s) => ({ hazardsOn: !s.hazardsOn })),

      cycleCameraMode: () => {
        const modes: CameraMode[] = ['chase', 'cockpit', 'hood', 'free'];
        set((s) => {
          const nextIdx = (modes.indexOf(s.cameraMode) + 1) % modes.length;
          return { cameraMode: modes[nextIdx] };
        });
      },

      setTimeOfDay: (timeOfDay) => set({ timeOfDay: timeOfDay % 24 }),
      setWeather: (weather) => set({
        weather,
        rainIntensity: weather === 'rain' ? 0.9 : 0
      }),
      setCustomWaypoint: (customWaypoint) => set({ customWaypoint }),

      addCash: (amount, reason) => {
        soundSystem.playCashRegister();
        set((state) => ({
          player: {
            ...state.player,
            cash: state.player.cash + amount,
            careerEarnings: state.player.careerEarnings + amount,
            xp: state.player.xp + Math.floor(amount * 0.1),
            level: 1 + Math.floor((state.player.xp + amount * 0.1) / 1000)
          }
        }));
        if (reason) {
          get().showNotification('Reward Earned', `+$${amount.toLocaleString()} - ${reason}`, 'success');
        }
      },

      spendCash: (amount) => {
        const state = get();
        if (state.player.cash < amount) {
          get().showNotification('Insufficient Cash', `You need $${amount.toLocaleString()} in wallet.`, 'warning');
          return false;
        }
        soundSystem.playCashRegister();
        set({
          player: {
            ...state.player,
            cash: state.player.cash - amount
          }
        });
        return true;
      },

      transferToBank: (amount) => {
        const state = get();
        if (state.player.cash < amount) return;
        soundSystem.playCashRegister();
        set({
          player: {
            ...state.player,
            cash: state.player.cash - amount,
            bank: state.player.bank + amount
          }
        });
      },

      transferToCash: (amount) => {
        const state = get();
        if (state.player.bank < amount) return;
        soundSystem.playCashRegister();
        set({
          player: {
            ...state.player,
            cash: state.player.cash + amount,
            bank: state.player.bank - amount
          }
        });
      },

      purchaseVehicle: (defId, chosenColor) => {
        const def = VEHICLES[defId];
        if (!def) return false;
        const state = get();
        if (state.player.cash < def.price) {
          get().showNotification('Cannot Afford', `Vehicle costs $${def.price.toLocaleString()}`, 'warning');
          return false;
        }

        const success = get().spendCash(def.price);
        if (success) {
          const newCustomization: VehicleCustomization = {
            ...DEFAULT_CUSTOMIZATION,
            color: chosenColor || def.defaultColor
          };

          set((s) => ({
            player: {
              ...s.player,
              ownedVehicles: {
                ...s.player.ownedVehicles,
                [defId]: newCustomization
              },
              activeVehicleId: defId
            }
          }));

          get().showNotification('Vehicle Purchased!', `Congratulations on your new ${def.name}!`, 'success');
          return true;
        }
        return false;
      },

      setActiveVehicle: (defId) => {
        const state = get();
        if (!state.player.ownedVehicles[defId]) return;
        soundSystem.playUiClick();
        // Spawn car near player
        const [px, , pz] = state.playerPosition;
        set((s) => ({
          player: { ...s.player, activeVehicleId: defId },
          vehiclePosition: [px + 4, 0.4, pz + 4],
          vehicleSpeed: 0,
          vehicleRpm: 800,
          vehicleNitro: 100,
          vehicleFuel: 100,
          vehicleHealth: 100
        }));
        get().showNotification('Valet Delivery', `${VEHICLES[defId]?.name} delivered to your location.`, 'info');
      },

      updateCustomization: (defId, newMods) => {
        soundSystem.playUiClick();
        set((s) => {
          const current = s.player.ownedVehicles[defId] || DEFAULT_CUSTOMIZATION;
          return {
            player: {
              ...s.player,
              ownedVehicles: {
                ...s.player.ownedVehicles,
                [defId]: { ...current, ...newMods }
              }
            }
          };
        });
      },

      repairVehicle: () => {
        const cost = 750;
        if (get().spendCash(cost)) {
          set({ vehicleHealth: 100 });
          get().showNotification('Repairs Completed', 'Vehicle fully restored to factory condition.', 'success');
        }
      },

      refuelVehicle: () => {
        const cost = 120;
        if (get().spendCash(cost)) {
          set({ vehicleFuel: 100 });
          get().showNotification('Tank Full', 'Refueled with 100 Octane Racing Fuel.', 'success');
        }
      },

      purchaseProperty: (propertyId) => {
        const prop = PROPERTIES.find((p) => p.id === propertyId);
        if (!prop) return false;
        const state = get();
        if (state.player.ownedProperties.includes(propertyId)) return false;

        if (get().spendCash(prop.price)) {
          set((s) => ({
            player: {
              ...s.player,
              ownedProperties: [...s.player.ownedProperties, propertyId]
            }
          }));
          get().showNotification('Property Acquired!', `You are now the proud owner of ${prop.name}!`, 'success');
          return true;
        }
        return false;
      },

      setActiveHome: (propertyId) => {
        soundSystem.playUiClick();
        set((s) => ({
          player: { ...s.player, activeHomeId: propertyId }
        }));
        get().showNotification('Home Set', 'Primary residence updated.', 'info');
      },

      purchaseBusiness: (businessId) => {
        const biz = BUSINESSES.find((b) => b.id === businessId);
        if (!biz) return false;
        const state = get();
        if (state.player.ownedBusinesses.includes(businessId)) return false;

        if (get().spendCash(biz.purchasePrice)) {
          set((s) => ({
            player: {
              ...s.player,
              ownedBusinesses: [...s.player.ownedBusinesses, businessId]
            }
          }));
          get().showNotification('Business Acquired!', `You now own ${biz.name}! Daily revenue: $${biz.dailyRevenue.toLocaleString()}`, 'success');
          return true;
        }
        return false;
      },

      openShop: (shopId) => {
        soundSystem.init();
        soundSystem.resume();
        soundSystem.playDoorSound();
        set({ activeShopId: shopId, activeScreen: 'shop' });
      },

      buyShopItem: (itemId, consumeImmediately = false) => {
        const item = ALL_SHOP_ITEMS.find((i) => i.id === itemId) || INVENTORY_ITEMS.find((i) => i.id === itemId);
        if (!item) return false;

        if (!get().spendCash(item.price)) {
          get().showNotification('Insufficient Cash', `You need $${item.price} to purchase ${item.name}`, 'warning');
          return false;
        }

        soundSystem.playCashRegister();

        // If player requested to consume immediately on the spot (e.g. eat pizza, drink espresso, heal)
        if (consumeImmediately) {
          if (item.category === 'drink' || item.category === 'food') {
            soundSystem.playEatDrinkSound();
          } else if (item.category === 'medical') {
            soundSystem.playHealChime();
          } else if (item.category === 'tactical') {
            soundSystem.playEquipArmorSound();
          } else {
            soundSystem.playUiClick();
          }

          set((s) => {
            const curHealth = s.player.health ?? 1000;
            const curArmor = s.player.armor ?? 1000;
            const maxHealth = s.player.maxHealth || 1000;
            const maxArmor = s.player.maxArmor || 1000;
            const curEnergy = s.player.energy ?? 100;
            const curHunger = s.player.hunger ?? 100;
            const curXp = s.player.xp ?? 0;

            const healAmt = item.healthBonus ? item.healthBonus * 10 : 0;
            const armorAmt = item.armorBonus ? item.armorBonus * 10 : 0;
            const newHealth = Math.min(maxHealth, curHealth + healAmt);
            const newArmor = Math.min(maxArmor, curArmor + armorAmt);
            const newEnergy = Math.min(100, curEnergy + (item.energyBonus || 0));
            const newHunger = Math.min(100, curHunger + (item.hungerBonus || 0));

            let addXp = 0;
            if (item.id === 'edu-handbook') addXp = 350;
            else if (item.id === 'edu-atlas') addXp = 750;
            else if (item.id === 'edu-diploma') addXp = 2500;
            else if (item.id === 'mall-watch') addXp = 1000;
            else if (item.id === 'mall-chain') addXp = 1500;

            const newWanted = item.wantedBonus ? Math.max(0, s.wantedLevel + item.wantedBonus) : s.wantedLevel;

            return {
              wantedLevel: newWanted,
              player: {
                ...s.player,
                health: newHealth,
                armor: newArmor,
                energy: newEnergy,
                hunger: newHunger,
                xp: curXp + addXp
              }
            };
          });

          get().showNotification(
            'Item Consumed',
            `Enjoyed ${item.name}! Vital stats and health restored.`,
            'success'
          );
          return true;
        }

        // Add to persistent inventory bag
        set((s) => ({
          player: {
            ...s.player,
            inventory: {
              ...s.player.inventory,
              [itemId]: (s.player.inventory[itemId] || 0) + 1
            }
          }
        }));

        get().showNotification(
          'Purchased',
          `Added ${item.name} to backpack inventory (-$${item.price})`,
          'success'
        );
        return true;
      },

      consumeItem: (itemId) => {
        const state = get();
        const count = state.player.inventory[itemId] || 0;
        if (count <= 0) return;
        const item = ALL_SHOP_ITEMS.find((i) => i.id === itemId) || INVENTORY_ITEMS.find((i) => i.id === itemId);
        if (!item) return;

        if (item.category === 'drink' || item.category === 'food') {
          soundSystem.playEatDrinkSound();
        } else if (item.category === 'medical') {
          soundSystem.playHealChime();
        } else if (item.category === 'tactical') {
          soundSystem.playEquipArmorSound();
        } else {
          soundSystem.playUiClick();
        }

        set((s) => {
          const newInv = { ...s.player.inventory };
          if (newInv[itemId] > 1) {
            newInv[itemId] -= 1;
          } else {
            delete newInv[itemId];
          }

          const curHealth = s.player.health ?? 1000;
          const curArmor = s.player.armor ?? 1000;
          const maxHealth = s.player.maxHealth || 1000;
          const maxArmor = s.player.maxArmor || 1000;
          const curEnergy = s.player.energy ?? 100;
          const curHunger = s.player.hunger ?? 100;
          const curXp = s.player.xp ?? 0;

          const healAmt = item.healthBonus ? item.healthBonus * 10 : 0;
          const armorAmt = item.armorBonus ? item.armorBonus * 10 : 0;
          const newHealth = Math.min(maxHealth, curHealth + healAmt);
          const newArmor = Math.min(maxArmor, curArmor + armorAmt);
          const newEnergy = Math.min(100, curEnergy + (item.energyBonus || 0));
          const newHunger = Math.min(100, curHunger + (item.hungerBonus || 0));

          let addXp = 0;
          if (item.id === 'edu-handbook') addXp = 350;
          else if (item.id === 'edu-atlas') addXp = 750;
          else if (item.id === 'edu-diploma') addXp = 2500;
          else if (item.id === 'mall-watch') addXp = 1000;
          else if (item.id === 'mall-chain') addXp = 1500;

          const newWanted = item.wantedBonus ? Math.max(0, s.wantedLevel + item.wantedBonus) : s.wantedLevel;

          return {
            wantedLevel: newWanted,
            player: {
              ...s.player,
              inventory: newInv,
              health: newHealth,
              armor: newArmor,
              energy: newEnergy,
              hunger: newHunger,
              xp: curXp + addXp
            }
          };
        });

        if (itemId === 'tire-kit') {
          set((s) => ({ vehicleHealth: Math.min(100, s.vehicleHealth + 25) }));
          get().showNotification('Vehicle Repaired', 'Used Roadside Kit: +25% Vehicle Health', 'success');
        } else {
          get().showNotification(
            'Item Used',
            `Used ${item.name}. Vital stats replenished!`,
            'info'
          );
        }
      },

      collectDailyRent: () => {
        const state = get();
        let totalDaily = 0;
        state.player.ownedProperties.forEach((id) => {
          const prop = PROPERTIES.find((p) => p.id === id);
          if (prop) totalDaily += prop.dailyIncome;
        });
        state.player.ownedBusinesses.forEach((id) => {
          const biz = BUSINESSES.find((b) => b.id === id);
          if (biz) totalDaily += biz.dailyRevenue;
        });
        if (totalDaily > 0) {
          get().addCash(totalDaily, 'Daily Empire & Real Estate Income');
        }
      },

      startJob: (jobId) => {
        const job = JOBS.find((j) => j.id === jobId);
        if (!job) return;

        soundSystem.playUiClick();
        let mission: ActiveMission;

        if (job.type === 'taxi') {
          mission = {
            jobId: job.id,
            title: job.title,
            type: 'taxi',
            stage: 'pickup',
            targetPosition: [50, 0, 70],
            targetName: 'Passenger: Sophia Lane (Business Tower)',
            timer: job.timeLimitSec,
            maxTime: job.timeLimitSec,
            reward: job.baseReward,
            xpReward: job.xpReward,
            passengerName: 'Sophia Lane'
          };
        } else if (job.type === 'racing') {
          mission = {
            jobId: job.id,
            title: job.title,
            type: 'racing',
            stage: 'racing',
            targetPosition: STREET_RACE_CIRCUIT[0],
            targetName: 'Checkpoint 1 / 8',
            timer: job.timeLimitSec,
            maxTime: job.timeLimitSec,
            reward: job.baseReward,
            xpReward: job.xpReward,
            checkpoints: STREET_RACE_CIRCUIT,
            currentCheckpointIndex: 0
          };
        } else if (job.type === 'delivery') {
          mission = {
            jobId: job.id,
            title: job.title,
            type: 'delivery',
            stage: 'transit',
            targetPosition: [-90, 0, -40],
            targetName: 'Pacific Docks Logistics Warehouse',
            timer: job.timeLimitSec,
            maxTime: job.timeLimitSec,
            reward: job.baseReward,
            xpReward: job.xpReward
          };
        } else {
          mission = {
            jobId: job.id,
            title: job.title,
            type: job.type,
            stage: 'transit',
            targetPosition: [0, 0, 100],
            targetName: 'Suspect Location',
            timer: job.timeLimitSec,
            maxTime: job.timeLimitSec,
            reward: job.baseReward,
            xpReward: job.xpReward
          };
        }

        set({
          activeMission: mission,
          missionTimeLeft: job.timeLimitSec,
          activeScreen: 'game',
          isPhoneOpen: false
        });

        get().showNotification('Mission Started', `${job.title} - Head to GPS waypoint!`, 'info');
      },

      updateMissionProgress: (dt) => {
        const state = get();
        if (!state.activeMission) return;

        const newTime = state.missionTimeLeft - dt;
        if (newTime <= 0) {
          get().showNotification('Mission Failed', 'Time expired! Better luck next time.', 'warning');
          set({ activeMission: null, missionTimeLeft: 0 });
          return;
        }

        // Fast distance check using direct physics state
        const posX = state.mode === 'driving' ? vehiclePhysics.pos.x : playerPhysics.pos.x;
        const posZ = state.mode === 'driving' ? vehiclePhysics.pos.z : playerPhysics.pos.z;
        const [tx, , tz] = state.activeMission.targetPosition;
        const dist = Math.hypot(posX - tx, posZ - tz);

        if (dist < 10) {
          get().completeMissionCheckpoint();
        } else if (Math.ceil(newTime) !== Math.ceil(state.missionTimeLeft)) {
          // Throttled: only re-renders HUD once per whole second, eliminating 59 React passes/sec!
          set({ missionTimeLeft: Math.ceil(newTime) });
        }
      },

      completeMissionCheckpoint: () => {
        const state = get();
        const mission = state.activeMission;
        if (!mission) return;

        if (mission.type === 'taxi') {
          if (mission.stage === 'pickup') {
            soundSystem.playUiClick();
            set({
              activeMission: {
                ...mission,
                stage: 'delivery',
                targetPosition: [-80, 0, 80],
                targetName: 'Drop-off: Sunset Plaza Grand Hotel',
                timer: 75,
                maxTime: 75
              },
              missionTimeLeft: 75
            });
            get().showNotification('Passenger Picked Up', 'Drive to the Sunset Plaza Grand Hotel!', 'info');
          } else {
            // Completed
            soundSystem.playMissionSuccess();
            const tipBonus = Math.floor(state.missionTimeLeft * 25);
            const totalReward = mission.reward + tipBonus;
            get().addCash(totalReward, `Taxi Fare + Speed Tip ($${tipBonus})`);
            set({ activeMission: null });
            get().showNotification('Fare Delivered!', `Total Earned: $${totalReward.toLocaleString()}`, 'success');
          }
        } else if (mission.type === 'racing') {
          const nextIdx = (mission.currentCheckpointIndex || 0) + 1;
          const cps = mission.checkpoints || [];
          soundSystem.playUiClick();

          if (nextIdx < cps.length) {
            set({
              activeMission: {
                ...mission,
                currentCheckpointIndex: nextIdx,
                targetPosition: cps[nextIdx],
                targetName: `Checkpoint ${nextIdx + 1} / ${cps.length}`
              }
            });
          } else {
            // Race finished!
            soundSystem.playMissionSuccess();
            get().addCash(mission.reward, '1st Place Street Race Victory!');
            set({ activeMission: null });
            get().showNotification('RACE WON!', `You finished 1st! Prize: $${mission.reward.toLocaleString()}`, 'success');
          }
        } else {
          // Delivery / Police completed
          soundSystem.playMissionSuccess();
          get().addCash(mission.reward, `${mission.title} completed`);
          set({ activeMission: null });
          get().showNotification('Mission Accomplished!', `Earned $${mission.reward.toLocaleString()}`, 'success');
        }
      },

      cancelMission: () => {
        soundSystem.playUiClick();
        set({ activeMission: null, missionTimeLeft: 0 });
        get().showNotification('Mission Cancelled', 'Active contract abandoned.', 'info');
      },

      enterHouse: (houseId = 'starter-loft') => {
        soundSystem.init();
        soundSystem.resume();
        soundSystem.playDoorSound();

        const targetId = houseId || 'starter-loft';
        const house = ENTERABLE_HOUSES.find((h) => h.id === targetId) || ENTERABLE_HOUSES[0];
        const px = playerPhysics.pos.x;
        const py = playerPhysics.pos.y;
        const pz = playerPhysics.pos.z;

        const distToHouse = Math.hypot(px - house.entrancePos[0], pz - house.entrancePos[2]);
        let exitPos: [number, number, number];
        if (distToHouse < 20.0 && py < 20.0) {
          exitPos = [px, Math.max(0.4, py), pz];
        } else {
          exitPos = [house.entrancePos[0], house.entrancePos[1], house.entrancePos[2]];
        }

        // Teleport inside penthouse interior at [0, 120.4, -6.5] facing South
        playerPhysics.pos.set(0, 120.4, -6.5);
        playerPhysics.rotationY = 0;
        playerPhysics.velocityY = 0;
        playerPhysics.isGrounded = true;
        playerPhysics.isMoving = false;
        playerPhysics.isSprinting = false;

        set({
          mode: 'walking',
          isInsideHouse: true,
          isInsideShop: false,
          activeShopInteriorId: null,
          activeHouseId: house.id,
          exteriorExitPos: exitPos,
          playerPosition: [0, 120.4, -6.5],
          playerRotation: [0, 0, 0]
        });

        get().showNotification(
          `🏠 WELCOME TO ${house.name.toUpperCase()}`,
          'Entered residence! Explore inside, relax on the sofa, grab snacks, or press [H] near the door to exit.',
          'success'
        );
      },

      exitHouse: () => {
        soundSystem.init();
        soundSystem.resume();
        soundSystem.playDoorSound();

        const state = get();
        const activeHouse = ENTERABLE_HOUSES.find((h) => h.id === state.activeHouseId) || ENTERABLE_HOUSES[0];
        let exitX = activeHouse.entrancePos[0];
        let exitY = activeHouse.entrancePos[1];
        let exitZ = activeHouse.entrancePos[2];
        let exitHeading = activeHouse.doorHeading;

        if (state.exteriorExitPos && Math.abs(state.exteriorExitPos[1]) < 15) {
          const distFromHouse = Math.hypot(state.exteriorExitPos[0] - exitX, state.exteriorExitPos[2] - exitZ);
          if (distFromHouse < 20.0) {
            exitX = state.exteriorExitPos[0];
            exitY = Math.max(0.4, state.exteriorExitPos[1]);
            exitZ = state.exteriorExitPos[2];
          }
        }

        playerPhysics.pos.set(exitX, exitY, exitZ);
        playerPhysics.rotationY = exitHeading;
        playerPhysics.velocityY = 0;
        playerPhysics.isGrounded = true;
        playerPhysics.isMoving = false;
        playerPhysics.isSprinting = false;

        set({
          mode: 'walking',
          isInsideHouse: false,
          activeHouseId: null,
          exteriorExitPos: null,
          playerPosition: [exitX, exitY, exitZ],
          playerRotation: [0, exitHeading, 0]
        });

        get().showNotification(
          `🌳 EXITED ${activeHouse.name.toUpperCase()}`,
          'Stepped outside onto the residence porch. Walk [WASD] • Enter Vehicle [C]',
          'info'
        );
      },

      enterShopInterior: (shopId: string) => {
        soundSystem.init();
        soundSystem.resume();
        soundSystem.playDoorSound();

        const shop = CITY_SHOPS.find((s) => s.id === shopId) || CITY_SHOPS[0];
        const doorstepX = shop.position[0];
        const doorstepZ = shop.position[2] + (shop.localPos[2] > 0 ? -8.5 : 8.5);

        const px = playerPhysics.pos.x;
        const py = playerPhysics.pos.y;
        const pz = playerPhysics.pos.z;

        // If player is reasonably close to this shop's exterior, record exact standing spot, otherwise use doorstep
        const distToShop = Math.hypot(px - shop.position[0], pz - shop.position[2]);
        let exitPos: [number, number, number];
        if (distToShop < 24.0 && py < 20.0) {
          exitPos = [px, Math.max(0.4, py), pz];
        } else {
          exitPos = [doorstepX, 0.4, doorstepZ];
        }

        // Teleport inside 3D shop interior at [0, 200.4, -2.0] facing into the showroom
        playerPhysics.pos.set(0, 200.4, -2.0);
        playerPhysics.rotationY = 0;
        playerPhysics.velocityY = 0;
        playerPhysics.isGrounded = true;
        playerPhysics.isMoving = false;
        playerPhysics.isSprinting = false;

        set({
          mode: 'walking',
          isInsideShop: true,
          isInsideHouse: false,
          activeHouseId: null,
          activeShopInteriorId: shop.id,
          exteriorExitPos: exitPos,
          playerPosition: [0, 200.4, -2.0],
          playerRotation: [0, 0, 0]
        });

        get().showNotification(
          `🛒 WELCOME TO ${shop.name.toUpperCase()}`,
          'Explore store displays & cashier! Press [E] / [B] to Checkout Items • Walk to Doors & Press [E] / [S] to Exit',
          'success'
        );
      },

      exitShopInterior: () => {
        const state = get();
        soundSystem.playDoorSound();

        const currentShop = CITY_SHOPS.find((s) => s.id === state.activeShopInteriorId);
        let exitX = 0;
        let exitY = 0.4;
        let exitZ = 0;
        let exitRotY = Math.PI;

        if (currentShop) {
          const doorstepX = currentShop.position[0];
          const doorstepZ = currentShop.position[2] + (currentShop.localPos[2] > 0 ? -8.5 : 8.5);
          exitRotY = currentShop.localPos[2] > 0 ? Math.PI : 0;

          if (state.exteriorExitPos && Math.abs(state.exteriorExitPos[1]) < 15) {
            const dist = Math.hypot(state.exteriorExitPos[0] - currentShop.position[0], state.exteriorExitPos[2] - currentShop.position[2]);
            if (dist < 22.0) {
              exitX = state.exteriorExitPos[0];
              exitY = Math.max(0.4, state.exteriorExitPos[1]);
              exitZ = state.exteriorExitPos[2];
            } else {
              exitX = doorstepX;
              exitZ = doorstepZ;
            }
          } else {
            exitX = doorstepX;
            exitZ = doorstepZ;
          }
        } else if (state.exteriorExitPos && Math.abs(state.exteriorExitPos[1]) < 15) {
          exitX = state.exteriorExitPos[0];
          exitY = Math.max(0.4, state.exteriorExitPos[1]);
          exitZ = state.exteriorExitPos[2];
        }

        playerPhysics.pos.set(exitX, exitY, exitZ);
        playerPhysics.rotationY = exitRotY;
        playerPhysics.velocityY = 0;
        playerPhysics.isGrounded = true;
        playerPhysics.isMoving = false;
        playerPhysics.isSprinting = false;

        set({
          mode: 'walking',
          isInsideShop: false,
          activeShopInteriorId: null,
          exteriorExitPos: null,
          playerPosition: [exitX, exitY, exitZ],
          playerRotation: [0, exitRotY, 0]
        });

        get().showNotification(
          currentShop ? `🚪 EXITED ${currentShop.name.toUpperCase()}` : 'Metropolitan Street',
          'Stepped outside onto the sidewalk right in front of the store. Walk [WASD] • Enter Vehicle [C]',
          'info'
        );
      },

      cycleTvChannel: () => {
        soundSystem.playUiClick();
        const nextChannel = (get().activeTvChannel + 1) % 3;
        set({ activeTvChannel: nextChannel });
        const channels = [
          'Apex Grand Prix - Championship Live Broadcast',
          'Night City Neon - 4K Cyber Synthwave Stream',
          'Golden Coast Sunset - 4K Ambient Drone Cam'
        ];
        get().showNotification('📺 OLED SMART TV', `Switched to: ${channels[nextChannel]}`, 'info');
      },

      restInBed: () => {
        soundSystem.playMissionSuccess();
        const currentTime = get().timeOfDay;
        const nextTime = (currentTime < 6 || currentTime > 18) ? 8.5 : 20.5;
        set((s) => ({
          timeOfDay: nextTime,
          player: {
            ...s.player,
            health: 100,
            energy: 100,
            stamina: 100
          }
        }));
        get().showNotification(
          '💤 REST & RECOVERY',
          nextTime === 8.5 ? 'Slept soundly through the night. Woke up at a bright new dawn!' : 'Rested peacefully. Evening has arrived in the city.',
          'success'
        );
      },

      eatFromFridge: () => {
        soundSystem.playEatDrinkSound();
        set((s) => ({
          player: {
            ...s.player,
            hunger: 100,
            stamina: 100
          }
        }));
        get().showNotification(
          '🍔 CHEF\'S REFRIGERATOR',
          'Grabbed cold Nitro drinks & a gourmet deli sandwich! Hunger & Stamina 100%!',
          'success'
        );
      },

      updateAppearance: (newAppearance) => {
        soundSystem.playUiClick();
        set((s) => ({
          player: {
            ...s.player,
            appearance: {
              ...s.player.appearance,
              ...newAppearance
            }
          }
        }));
        get().showNotification('Wardrobe Updated', 'Fresh outfit & appearance equipped!', 'success');
      },

      setActiveScreen: (activeScreen) => {
        soundSystem.playUiClick();
        set({ activeScreen });
      },

      togglePhone: () => {
        soundSystem.playUiClick();
        set((s) => ({ isPhoneOpen: !s.isPhoneOpen }));
      },

      openPhoneApp: (app) => {
        soundSystem.playUiClick();
        set({ activePhoneApp: app });
      },

      setRadio: (station, playing) => {
        soundSystem.init();
        soundSystem.resume();
        soundSystem.setRadioStation(station, playing);
        set({ radioStation: station, radioPlaying: playing });
      },

      updateSettings: (newSettings) => {
        set((s) => {
          const updated = { ...s.settings, ...newSettings };
          soundSystem.setVolumes(
            updated.soundVolume,
            updated.engineVolume,
            updated.soundVolume,
            updated.musicVolume
          );
          return { settings: updated };
        });
      },

      showNotification: (title, message, type = 'info') => {
        set({ notification: { title, message, type } });
        setTimeout(() => {
          const current = get().notification;
          if (current && current.title === title) {
            set({ notification: null });
          }
        }, 4000);
      },

      dismissNotification: () => set({ notification: null })
    }),
    {
      name: 'speedus-save-v2',
      partialize: (state) => ({
        player: state.player,
        settings: state.settings
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.player) {
          if (!state.player.maxHealth || state.player.maxHealth < 1000) {
            state.player.maxHealth = 1000;
          }
          if (!state.player.health || state.player.health < 1000) {
            state.player.health = 1000;
          }
          if (!state.player.maxArmor || state.player.maxArmor < 1000) {
            state.player.maxArmor = 1000;
          }
          if (!state.player.armor || state.player.armor < 1000) {
            state.player.armor = 1000;
          }
        }
      }
    }
  )
);

if (typeof window !== 'undefined') {
  (window as any).__SPEEDUS_STORE__ = useGameStore;
}

