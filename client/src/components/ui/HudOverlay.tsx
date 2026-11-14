import React, { useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Speedometer } from './Speedometer';
import { MiniMap } from './MiniMap';
import { Smartphone } from './Smartphone';
import { DealershipModal } from './DealershipModal';
import { GarageModal } from './GarageModal';
import { FullCityMapModal } from './FullCityMapModal';
import { PropertyModal } from './PropertyModal';
import { ShopModal } from './ShopModal';
import { WardrobeModal } from './WardrobeModal';
import { NotificationToast } from './NotificationToast';
import { WastedModal } from './WastedModal';
import { MobileControls } from './MobileControls';
import { GtaInteractionMenu } from './GtaInteractionMenu';
import { getNearestEnterableVehicle } from '../../stores/entityVehicles';
import { getNearestEnterableHouse } from '../../stores/houseSystem';
import { CITY_SHOPS } from '../../data/shopsData';
import { usePedestrianStore } from '../../stores/pedestrianCombat';
import { soundSystem } from '../../audio/soundSystem';
import {
  DollarSign,
  Smartphone as PhoneIcon,
  Map,
  ShoppingBag,
  Store,
  Wrench,
  Shirt,
  Clock,
  Sun,
  Moon,
  Sunset,
  Timer,
  Navigation,
  Volume2,
  VolumeX,
  Compass,
  Menu
} from 'lucide-react';

export const HudOverlay: React.FC = () => {
  const mode = useGameStore((s) => s.mode);
  const isInsideHouse = useGameStore((s) => s.isInsideHouse);
  const isInsideShop = useGameStore((s) => s.isInsideShop);
  const activeShopInteriorId = useGameStore((s) => s.activeShopInteriorId);
  const enterShopInterior = useGameStore((s) => s.enterShopInterior);
  const exitShopInterior = useGameStore((s) => s.exitShopInterior);
  const openShop = useGameStore((s) => s.openShop);
  const refuelVehicle = useGameStore((s) => s.refuelVehicle);
  const cycleTvChannel = useGameStore((s) => s.cycleTvChannel);
  const activeTvChannel = useGameStore((s) => s.activeTvChannel);
  const player = useGameStore((s) => s.player);
  const wantedLevel = useGameStore((s) => s.wantedLevel);
  const activeWeapon = useGameStore((s) => s.activeWeapon);
  const setActiveWeapon = useGameStore((s) => s.setActiveWeapon);
  const playerPos = useGameStore((s) => s.playerPosition);
  const vehiclePos = useGameStore((s) => s.vehiclePosition);
  const vehicleSpeed = useGameStore((s) => s.vehicleSpeed);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const setTimeOfDay = useGameStore((s) => s.setTimeOfDay);
  const weather = useGameStore((s) => s.weather);
  const setWeather = useGameStore((s) => s.setWeather);
  const activeMission = useGameStore((s) => s.activeMission);
  const missionTimeLeft = useGameStore((s) => s.missionTimeLeft);
  const activeScreen = useGameStore((s) => s.activeScreen);
  const setActiveScreen = useGameStore((s) => s.setActiveScreen);
  const togglePhone = useGameStore((s) => s.togglePhone);
  const radioPlaying = useGameStore((s) => s.radioPlaying);
  const radioStation = useGameStore((s) => s.radioStation);
  const setRadio = useGameStore((s) => s.setRadio);

  const [isInteractionMenuOpen, setIsInteractionMenuOpen] = React.useState(false);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      const k = e.key.toLowerCase();

      // Police call-off cheat: Ctrl + P (Control + P)
      if ((e.ctrlKey || e.metaKey) && k === 'p') {
        e.preventDefault();
        e.stopPropagation();
        usePedestrianStore.getState().clearPolicePursuit();
        return;
      }

      // God Mode Health cheat: Ctrl + H (100,000 HP)
      if ((e.ctrlKey || e.metaKey) && k === 'h') {
        e.preventDefault();
        e.stopPropagation();
        useGameStore.getState().activateGodHealthCheat();
        return;
      }

      // Restore Base Health cheat: Ctrl + 1 (1,000 HP)
      if ((e.ctrlKey || e.metaKey) && (e.key === '1' || e.code === 'Digit1')) {
        e.preventDefault();
        e.stopPropagation();
        useGameStore.getState().resetHealthToStandard();
        return;
      }

      // Interaction Menu Toggle: [TAB]
      if (e.key === 'Tab') {
        e.preventDefault();
        setIsInteractionMenuOpen((prev) => !prev);
        soundSystem.playUiClick();
        return;
      }

      // Smartphone toggle: P (without Ctrl)
      if (!e.ctrlKey && !e.metaKey && k === 'p') {
        togglePhone();
      }

      if (k === 'm') setActiveScreen(activeScreen === 'map' ? 'game' : 'map');
      if (k === 'u' && mode === 'walking') setActiveScreen(activeScreen === 'wardrobe' ? 'game' : 'wardrobe');
      
      // Enter / Exit Vehicle: [C] (guarded against modifier combos)
      if (!e.ctrlKey && !e.metaKey && !e.altKey && k === 'c') {
        useGameStore.getState().toggleVehicleEntry();
      }

      if (e.key === 'Escape') {
        if (isInteractionMenuOpen) {
          setIsInteractionMenuOpen(false);
          return;
        }
        if (activeScreen !== 'game') setActiveScreen('game');
        if (useGameStore.getState().isPhoneOpen) togglePhone();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeScreen, togglePhone, setActiveScreen, mode]);

  // Format time (e.g. 14.5 -> 14:30)
  const hours = Math.floor(timeOfDay);
  const minutes = Math.floor((timeOfDay - hours) * 60);
  const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  const xpPercent = Math.min(100, (player.xp % 1000) / 10);

  // Quick cycle between bright Day (12:00), Golden Sunset (17:30), and Cyber Night (21:00)
  const cycleTimeOfDay = () => {
    if (timeOfDay >= 6 && timeOfDay < 16) {
      setTimeOfDay(17.5);
      setWeather('sunset');
    } else if (timeOfDay >= 16 && timeOfDay < 20) {
      setTimeOfDay(21.0);
      setWeather('night');
    } else {
      setTimeOfDay(12.0);
      setWeather('clear');
    }
  };

  return (
    <>
      {/* 3D Interactive Screens & Modals */}
      <WastedModal />
      <GtaInteractionMenu
        isOpen={isInteractionMenuOpen}
        onClose={() => setIsInteractionMenuOpen(false)}
      />
      <DealershipModal />
      <GarageModal />
      <FullCityMapModal />
      <PropertyModal />
      <ShopModal />
      <WardrobeModal />
      <Smartphone />
      <NotificationToast />

      {/* Main Gameplay In-Game HUD */}
      {activeScreen === 'game' && (
        <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-2 sm:p-5 select-none">
          {/* ========================================================
              GTA V AUTHENTIC TOP HUD (Clean, Minimal & Cinematic)
          ======================================================== */}
          <div className="flex items-start justify-between w-full pointer-events-none">
            {/* Top-Left: Sleek GTA V Quick Menu & Level Pill */}
            <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
              <button
                onClick={() => {
                  soundSystem.playUiClick();
                  setIsInteractionMenuOpen((prev) => !prev);
                }}
                className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/20 text-white font-display font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_4px_15px_rgba(0,0,0,0.7)] hover:bg-cyan-950/80 hover:border-cyan-400/60 hover:text-cyan-300 transition-all cursor-pointer group hover:scale-105 active:scale-95"
                title="Open GTA V Interaction Menu [TAB / M]"
              >
                <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 group-hover:rotate-90 transition-transform" />
                <span>MENU</span>
                <span className="hidden sm:inline-block px-1 py-0.2 rounded bg-white/10 text-[9px] text-gray-400">
                  TAB
                </span>
              </button>

              <div className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-[10px] sm:text-xs font-bold text-gray-200 flex items-center gap-1.5">
                <span className="text-[9px] sm:text-[10px] font-black uppercase text-cyan-400">
                  LVL {player.level}
                </span>
                <div className="w-8 sm:w-12 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/20">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>

              {/* In-Game Clock Pill (Click to toggle Time of Day) */}
              <button
                onClick={cycleTimeOfDay}
                title="Click to Switch Time of Day (Day / Sunset / Night)"
                className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-[10px] sm:text-xs font-bold text-amber-300 hover:text-white flex items-center gap-1 transition-all cursor-pointer hover:bg-slate-900"
              >
                {timeOfDay >= 8 && timeOfDay < 17 ? (
                  <Sun className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
                ) : timeOfDay >= 17 && timeOfDay < 20 ? (
                  <Sunset className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-400" />
                ) : (
                  <Moon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-300" />
                )}
                <span className="font-mono text-[10px] sm:text-xs font-bold">{timeStr}</span>
              </button>
            </div>

            {/* Top-Right: Authentic GTA V Cash, Wanted Stars, Weapon & Clean Quick Buttons */}
            <div className="flex flex-col items-end gap-1 pointer-events-auto">
              {/* Cash Balance Counter (Authentic GTA V Green Font) */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="font-display font-black text-xl sm:text-3xl tracking-tight text-emerald-400 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] flex items-center">
                  <span className="text-emerald-500 mr-0.5">$</span>
                  <span>{player.cash.toLocaleString()}</span>
                </div>

                {/* Quick Menu Icons (Map & Phone) */}
                <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md p-1 rounded-xl sm:rounded-2xl border border-white/15 shadow-lg">
                  <button
                    onClick={() => setActiveScreen('map')}
                    className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-900/80 hover:bg-cyan-500 text-gray-300 hover:text-black transition-all cursor-pointer"
                    title="Open Full Map [M]"
                  >
                    <Map className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={togglePhone}
                    className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-900/80 hover:bg-cyan-500 text-gray-300 hover:text-black transition-all cursor-pointer"
                    title="Open Smartphone [P]"
                  >
                    <PhoneIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>

              {/* Wanted Level Stars (Authentic GTA V pulsing gold/red stars) */}
              {wantedLevel > 0 && (
                <div className="flex items-center gap-1 justify-end animate-pulse pr-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-sm ${
                        star <= wantedLevel
                          ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] scale-110 font-black'
                          : 'text-gray-700'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              )}

              {/* Current Active Weapon Pill (GTA V Weapon Blip) */}
              <button
                onClick={() => {
                  const nextWeapon =
                    activeWeapon === 'fists' ? 'bat' : activeWeapon === 'bat' ? 'pistol' : 'fists';
                  setActiveWeapon(nextWeapon);
                  soundSystem.playUiClick();
                }}
                title="Click or press [1-3] to switch weapon"
                className="mt-0.5 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-xs font-bold text-white flex items-center gap-2 shadow-md hover:border-amber-400 hover:text-amber-300 transition-all cursor-pointer group"
              >
                <span className="text-base">
                  {activeWeapon === 'fists' ? '👊' : activeWeapon === 'bat' ? '🏏' : '🔫'}
                </span>
                <span className="font-display font-black text-xs uppercase tracking-wider">
                  {activeWeapon === 'fists' ? 'FISTS' : activeWeapon === 'bat' ? 'BAT' : 'PISTOL'}
                </span>
                {activeWeapon === 'pistol' && (
                  <span className="text-[10px] font-mono text-cyan-300 bg-black/60 px-1.5 py-0.5 rounded">
                    36/∞
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ========================================================
              ACTIVE MISSION OBJECTIVE CARD
          ======================================================== */}
          {activeMission && (
            <div className="self-start mt-4 pointer-events-auto">
              <div className="p-4 rounded-3xl bg-slate-900/95 backdrop-blur-xl border-2 border-pink-400 shadow-[0_0_25px_rgba(255,0,127,0.4)] max-w-sm animate-in fade-in slide-in-from-left-4">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="px-3 py-1 rounded-full font-black uppercase text-[11px] bg-pink-500/30 text-pink-300 border border-pink-400/60 shadow-[0_0_10px_rgba(255,0,127,0.5)]">
                    {activeMission.title}
                  </span>
                  <div className="flex items-center gap-1 font-display font-black text-amber-300 text-sm">
                    <Timer className="w-4 h-4" />
                    <span>{Math.ceil(missionTimeLeft)}s</span>
                  </div>
                </div>

                <div className="mt-2.5 font-bold text-sm text-white flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="truncate">{activeMission.targetName}</span>
                </div>

                <div className="mt-3 h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/20">
                  <div
                    className={`h-full rounded-full transition-all duration-100 ${
                      missionTimeLeft < 20
                        ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)] animate-pulse'
                        : 'bg-gradient-to-r from-pink-500 to-rose-400 shadow-[0_0_10px_rgba(255,0,127,0.7)]'
                    }`}
                    style={{ width: `${(missionTimeLeft / activeMission.maxTime) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Shop 3D Interior Top Badge Banner */}
          {isInsideShop && (
            <div className="self-center mt-2 px-6 py-2.5 rounded-2xl bg-slate-900/95 backdrop-blur-xl border-2 border-emerald-400 text-emerald-300 font-display font-black text-sm tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.6)] flex items-center gap-3 animate-in fade-in zoom-in-95">
              <span className="text-xl">🛒</span>
              <span>{CITY_SHOPS.find((s) => s.id === activeShopInteriorId)?.name.toUpperCase() || 'COMMERCIAL STORE'}</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/30 text-white text-[10px] font-bold border border-emerald-400/40">STOREFRONT</span>
            </div>
          )}

          {/* Luxury Residence Interior Badge Banner */}
          {isInsideHouse && !isInsideShop && (
            <div className="self-center mt-2 px-6 py-2.5 rounded-2xl bg-slate-900/95 backdrop-blur-xl border-2 border-cyan-400 text-cyan-300 font-display font-black text-sm tracking-wider shadow-[0_0_25px_rgba(0,240,255,0.6)] flex items-center gap-3 animate-in fade-in zoom-in-95">
              <span className="text-xl">🏠</span>
              <span>DOWNTOWN SKYVIEW PENTHOUSE</span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/30 text-white text-[10px] font-bold border border-cyan-400/40">RESIDENCE</span>
            </div>
          )}

          {/* ========================================================
              DYNAMIC INTERACTIVE PROXIMITY PROMPT
          ======================================================== */}
          {(() => {
            const [px, , pz] = playerPos;
            const distCar = Math.hypot(px - vehiclePos[0], pz - vehiclePos[2]);
            const distDealership = Math.min(Math.hypot(px - 22, pz - 48), Math.hypot(px - 35, pz - 45));
            const distGarage = Math.min(Math.hypot(px - (-92), pz - 48), Math.hypot(px - (-45), pz - 65));
            const distGas = Math.min(Math.hypot(px - 22, pz - (-48)), Math.hypot(px - 0, pz - (-55)));
            const distShop = Math.min(Math.hypot(px - 22, pz - (-48)), Math.hypot(px - 0, pz - (-45)));
            const distLoft = Math.min(Math.hypot(px - 48, pz - (-48)), Math.hypot(px - 60, pz - (-40)));

            let promptText: string | null = null;
            let onPromptClick: (() => void) | null = null;

            if (isInsideShop) {
              const currentShop = CITY_SHOPS.find((s) => s.id === activeShopInteriorId);
              // Entrance/Exit Door is at Z = -7.6 (exit zone Z < -5.5)
              if (pz < -5.5) {
                promptText = '🚪 Click or Press [E] / [S] to Exit Shop to Street';
                onPromptClick = () => exitShopInterior();
              } else {
                promptText = `🛒 Click or Press [E] / [B] to Checkout & Buy at ${currentShop?.name || 'Shop'}`;
                onPromptClick = () => {
                  if (activeShopInteriorId) openShop(activeShopInteriorId);
                };
              }
            } else if (isInsideHouse) {
              if (pz < -5.0 && Math.abs(px) < 2.5) {
                promptText = '🚪 Click or Press [H] / [E] to Exit House';
                onPromptClick = () => useGameStore.getState().exitHouse();
              } else if (px > 8.0 && pz < -1.5 && pz > -5.0) {
                promptText = '🍔 Click or Press [E] to Open Fridge & Eat/Drink';
                onPromptClick = () => useGameStore.getState().eatFromFridge();
              } else if (px > 9.5 && pz > 3.0) {
                promptText = '👔 Click or Press [E] to Open Wardrobe & Change Clothes';
                onPromptClick = () => setActiveScreen('wardrobe');
              } else if (px > 4.5 && px <= 9.5 && pz > 3.5) {
                promptText = '💤 Click or Press [E] to Rest & Sleep in Bed';
                onPromptClick = () => useGameStore.getState().restInBed();
              } else if (px < 1.0 && pz > 0.0 && pz < 7.0) {
                promptText = `📺 Click or Press [E] to Change OLED TV Channel (Ch. ${activeTvChannel + 1}/3)`;
                onPromptClick = () => cycleTvChannel();
              }
            } else if (mode === 'walking') {
              const nearestHouse = getNearestEnterableHouse(px, pz, 8.5);
              const nearestCar = getNearestEnterableVehicle(px, pz, 6.0);

              // Check distance to City Commercial Shops (Vegetables, Gym, Pharmacy, Hospital, School, Police, Mall, Tech, Cafe, Pizza, Bistro, Burgers)
              let nearestShop = null;
              let minShopDist = 18.0;
              for (const shop of CITY_SHOPS) {
                const doorZ = shop.position[2] + (shop.localPos[2] > 0 ? -7.8 : 7.8);
                const distDoor = Math.hypot(px - shop.position[0], pz - doorZ);
                const distCenter = Math.hypot(px - shop.position[0], pz - shop.position[2]);
                const d = Math.min(distDoor, distCenter);
                if (d < minShopDist) {
                  minShopDist = d;
                  nearestShop = shop;
                }
              }

              if (nearestShop) {
                const shopEmoji =
                  nearestShop.type === 'vegetable' ? '🍎' :
                  nearestShop.type === 'gym' ? '💪' :
                  nearestShop.type === 'pharmacy' ? '💊' :
                  nearestShop.type === 'hospital' ? '🏥' :
                  nearestShop.type === 'school' ? '🎓' :
                  nearestShop.type === 'police' ? '🚔' :
                  nearestShop.type === 'mall' ? '🛍️' :
                  nearestShop.type === 'electronics' ? '⚡' :
                  nearestShop.type === 'cafe' ? '☕' :
                  nearestShop.type === 'pizza' ? '🍕' :
                  nearestShop.type === 'restaurant' ? '🥩' :
                  nearestShop.type === 'burger' ? '🍔' : '🛒';
                promptText = `${shopEmoji} Click or Press [E] / [S] to Enter ${nearestShop.name}`;
                onPromptClick = () => enterShopInterior(nearestShop.id);
              } else if (nearestHouse) {
                promptText = `🏠 Click or Press [H] to Enter ${nearestHouse.name}`;
                onPromptClick = () => useGameStore.getState().enterHouse(nearestHouse.id);
              } else if (nearestCar) {
                promptText = `🚗 Click or Press [C] to Enter ${nearestCar.name}`;
                onPromptClick = () => useGameStore.getState().toggleVehicleEntry();
              } else if (distDealership < 9.5) {
                promptText = '🏎️ Click or Press [E] to Browse Exotic Car Dealership';
                onPromptClick = () => setActiveScreen('dealership');
              } else if (distGarage < 9.5) {
                promptText = '🔧 Click or Press [E] to Enter SpeedWorks Customs Garage';
                onPromptClick = () => setActiveScreen('garage');
              } else if (distShop < 18.0) {
                promptText = '🛒 Click or Press [E] / [S] to Enter NitroFuel Mart';
                onPromptClick = () => enterShopInterior('shop-vegetable');
              } else if (distGas < 10.0) {
                promptText = '⛽ Click or Press [E] to Refuel Vehicle ($120)';
                onPromptClick = () => refuelVehicle();
              } else if (distLoft < 9.5) {
                promptText = '🏠 Click or Press [H] to Enter Skyview Loft Residence';
                onPromptClick = () => useGameStore.getState().enterHouse('loft-penthouse');
              }
            } else {
              // Driving mode contextual prompts (when stopped near drive-thru or services)
              const isStopped = vehicleSpeed < 5;
              let nearestDriveThruShop = null;
              let minShopDist = 18.0;
              for (const shop of CITY_SHOPS) {
                const doorZ = shop.position[2] + (shop.localPos[2] > 0 ? -7.8 : 7.8);
                const distDoor = Math.hypot(px - shop.position[0], pz - doorZ);
                const distCenter = Math.hypot(px - shop.position[0], pz - shop.position[2]);
                const d = Math.min(distDoor, distCenter);
                if (d < minShopDist) {
                  minShopDist = d;
                  nearestDriveThruShop = shop;
                }
              }

              if (distGas < 11.0) {
                promptText = '⛽ Click or Press [E] to Refuel Tank ($120)';
                onPromptClick = () => refuelVehicle();
              } else if (distGarage < 11.0) {
                promptText = '🔧 Click or Press [E] to Tune Vehicle in Garage';
                onPromptClick = () => setActiveScreen('garage');
              } else if (isStopped && nearestDriveThruShop) {
                promptText = `🛍️ Click or Press [S] to Shop at ${nearestDriveThruShop.name} (Drive-Thru)`;
                onPromptClick = () => openShop(nearestDriveThruShop.id);
              }
            }

            if (!promptText) return null;

            return (
              <button
                type="button"
                onClick={() => {
                  if (onPromptClick) onPromptClick();
                }}
                className="self-center mb-18 sm:mb-6 px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl sm:rounded-2xl bg-black/90 backdrop-blur-xl text-white font-display font-black text-xs sm:text-sm tracking-wide shadow-[0_0_25px_rgba(0,240,255,0.6)] border-2 border-cyan-400/80 animate-bounce pointer-events-auto flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              >
                <span>{promptText}</span>
              </button>
            );
          })()}
        </div>
      )}

      {/* Mobile Touch Controls, Speedometer & MiniMap rendered during gameplay */}
      {activeScreen === 'game' && (
        <>
          <MobileControls />
          <Speedometer />
          <MiniMap />
        </>
      )}
    </>
  );
};
