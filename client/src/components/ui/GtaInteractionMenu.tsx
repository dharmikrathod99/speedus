import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { usePedestrianStore } from '../../stores/pedestrianCombat';
import { soundSystem } from '../../audio/soundSystem';
import { vehiclePhysics } from '../../stores/vehiclePhysics';
import { CITY_SHOPS } from '../../data/shopsData';
import {
  Menu,
  X,
  Car,
  Wrench,
  ShoppingBag,
  Store,
  Home,
  Shirt,
  Sparkles,
  ShieldAlert,
  Heart,
  Volume2,
  VolumeX,
  Sun,
  Sunset,
  Moon,
  CloudRain,
  Map,
  Smartphone,
  Keyboard,
  ChevronRight,
  Crosshair,
  RotateCcw
} from 'lucide-react';

interface GtaInteractionMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GtaInteractionMenu: React.FC<GtaInteractionMenuProps> = ({ isOpen, onClose }) => {
  const mode = useGameStore((s) => s.mode);
  const player = useGameStore((s) => s.player);
  const wantedLevel = useGameStore((s) => s.wantedLevel);
  const activeWeapon = useGameStore((s) => s.activeWeapon);
  const setActiveWeapon = useGameStore((s) => s.setActiveWeapon);
  const setActiveScreen = useGameStore((s) => s.setActiveScreen);
  const togglePhone = useGameStore((s) => s.togglePhone);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const setTimeOfDay = useGameStore((s) => s.setTimeOfDay);
  const weather = useGameStore((s) => s.weather);
  const setWeather = useGameStore((s) => s.setWeather);
  const radioPlaying = useGameStore((s) => s.radioPlaying);
  const radioStation = useGameStore((s) => s.radioStation);
  const setRadio = useGameStore((s) => s.setRadio);
  const showNotification = useGameStore((s) => s.showNotification);

  const [activeTab, setActiveTab] = useState<'main' | 'cheats' | 'vehicles' | 'shops' | 'world' | 'controls'>('main');

  // Close with [Escape] or [Tab]
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === 'Escape' || e.key === 'Tab') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto flex items-start select-none bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150">
      {/* Authentic GTA V Left-Side Interaction Menu Panel */}
      <div className="relative ml-2 sm:ml-8 mt-12 sm:mt-16 w-[calc(100vw-1rem)] sm:w-[340px] max-w-[360px] max-h-[85vh] bg-black/92 border-2 border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_20px_rgba(0,240,255,0.2)] overflow-hidden flex flex-col font-sans text-white">
        {/* ========================================================
            GTA V BLACK HEADER BANNER
        ======================================================== */}
        <div className="bg-gradient-to-r from-neutral-950 via-slate-900 to-neutral-950 px-5 py-3.5 border-b-2 border-white/20 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">
              SPEED US • LOS SANTOS
            </div>
            <h2 className="font-display font-black text-lg tracking-wider text-white">
              {activeTab === 'main'
                ? 'INTERACTION MENU'
                : activeTab === 'cheats'
                ? 'ABILITIES & CHEATS'
                : activeTab === 'vehicles'
                ? 'VEHICLE SERVICES'
                : activeTab === 'shops'
                ? 'COMMERCIAL SHOPS'
                : activeTab === 'world'
                ? 'TIME & ENVIRONMENT'
                : 'CONTROLS GUIDE'}
            </h2>
          </div>

          <button
            onClick={() => {
              soundSystem.playUiClick();
              if (activeTab === 'main') {
                onClose();
              } else {
                setActiveTab('main');
              }
            }}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/25 text-gray-300 hover:text-white transition-all cursor-pointer"
            title="Back / Close"
          >
            {activeTab === 'main' ? <X className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 rotate-180" />}
          </button>
        </div>

        {/* Status Sub-bar: Player Cash & Wanted */}
        <div className="bg-slate-950 px-5 py-2 border-b border-white/10 flex items-center justify-between text-xs">
          <span className="font-mono font-bold text-emerald-400">
            ${player.cash.toLocaleString()}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400">LVL {player.level}</span>
            {wantedLevel > 0 && (
              <span className="text-amber-400 font-black animate-pulse">
                {'★'.repeat(wantedLevel)}
              </span>
            )}
          </div>
        </div>

        {/* ========================================================
            MENU ITEMS CONTAINER
        ======================================================== */}
        <div className="p-2 flex flex-col gap-1 max-h-[65vh] overflow-y-auto">
          {activeTab === 'main' && (
            <>
              {/* 1. Quick Cheats & Health */}
              <button
                onClick={() => {
                  soundSystem.playUiClick();
                  setActiveTab('cheats');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950/80 hover:border-cyan-400/60 border border-white/10 text-left flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-xs text-white group-hover:text-cyan-300">
                      Cheats & Abilities
                    </div>
                    <div className="text-[10px] text-gray-400">God Mode, Restore HP, Clear Police</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400" />
              </button>

              {/* 2. Vehicles & Garage */}
              <button
                onClick={() => {
                  soundSystem.playUiClick();
                  setActiveTab('vehicles');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950/80 hover:border-cyan-400/60 border border-white/10 text-left flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-xs text-white group-hover:text-cyan-300">
                      Vehicles & Garage
                    </div>
                    <div className="text-[10px] text-gray-400">Dealership, Tuning, Vehicle Reset</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400" />
              </button>

              {/* 3. Commercial Shops */}
              <button
                onClick={() => {
                  soundSystem.playUiClick();
                  setActiveTab('shops');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950/80 hover:border-cyan-400/60 border border-white/10 text-left flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-xs text-white group-hover:text-cyan-300">
                      Shops & Stores
                    </div>
                    <div className="text-[10px] text-gray-400">NitroFuel Mart, Pharmacy, Cafe, Gym</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400" />
              </button>

              {/* 4. Safehouses & Residences */}
              <button
                onClick={() => {
                  soundSystem.playUiClick();
                  useGameStore.getState().enterHouse('loft-penthouse');
                  onClose();
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950/80 hover:border-cyan-400/60 border border-white/10 text-left flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400">
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-xs text-white group-hover:text-cyan-300">
                      Downtown Penthouse
                    </div>
                    <div className="text-[10px] text-gray-400">Safehouse, TV, Fridge & Bed</div>
                  </div>
                </div>
                <span className="text-[9px] font-black uppercase text-pink-400 bg-pink-500/20 px-2 py-0.5 rounded">
                  ENTER
                </span>
              </button>

              {/* 5. Wardrobe */}
              <button
                onClick={() => {
                  soundSystem.playUiClick();
                  setActiveScreen('wardrobe');
                  onClose();
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950/80 hover:border-cyan-400/60 border border-white/10 text-left flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                    <Shirt className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-xs text-white group-hover:text-cyan-300">
                      Wardrobe & Outfits
                    </div>
                    <div className="text-[10px] text-gray-400">Customize Clothing & Style</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400" />
              </button>

              {/* 6. City Map */}
              <button
                onClick={() => {
                  soundSystem.playUiClick();
                  setActiveScreen('map');
                  onClose();
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950/80 hover:border-cyan-400/60 border border-white/10 text-left flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                    <Map className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-xs text-white group-hover:text-cyan-300">
                      Full City Map
                    </div>
                    <div className="text-[10px] text-gray-400">GPS Navigation & Waypoints</div>
                  </div>
                </div>
                <span className="text-[9px] font-black uppercase text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded">
                  [M]
                </span>
              </button>

              {/* 7. Smartphone */}
              <button
                onClick={() => {
                  soundSystem.playUiClick();
                  togglePhone();
                  onClose();
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950/80 hover:border-cyan-400/60 border border-white/10 text-left flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-xs text-white group-hover:text-cyan-300">
                      iFruit Smartphone
                    </div>
                    <div className="text-[10px] text-gray-400">Bank, Jobs, Real Estate Apps</div>
                  </div>
                </div>
                <span className="text-[9px] font-black uppercase text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded">
                  [P]
                </span>
              </button>

              {/* 8. Time of Day & Weather */}
              <button
                onClick={() => {
                  soundSystem.playUiClick();
                  setActiveTab('world');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950/80 hover:border-cyan-400/60 border border-white/10 text-left flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-xs text-white group-hover:text-cyan-300">
                      Time & Weather
                    </div>
                    <div className="text-[10px] text-gray-400">Switch Day, Sunset, Night & Rain</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400" />
              </button>

              {/* 9. Controls Guide */}
              <button
                onClick={() => {
                  soundSystem.playUiClick();
                  setActiveTab('controls');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950/80 hover:border-cyan-400/60 border border-white/10 text-left flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <Keyboard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-xs text-white group-hover:text-cyan-300">
                      Controls & Keys
                    </div>
                    <div className="text-[10px] text-gray-400">View Keyboard & Touch Mappings</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400" />
              </button>
            </>
          )}

          {/* ========================================================
              TAB: CHEATS & ABILITIES
          ======================================================== */}
          {activeTab === 'cheats' && (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  useGameStore.getState().resetHealthToStandard();
                  soundSystem.playUiClick();
                  showNotification('Health Restored', 'HP set to 1,000.', 'success');
                }}
                className="w-full p-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-left flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                  <div>
                    <div className="font-black text-xs text-emerald-300">Restore Standard Health</div>
                    <div className="text-[10px] text-gray-400">Set Health to 1,000 HP</div>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/60 text-emerald-400">
                  Ctrl+1
                </span>
              </button>

              <button
                onClick={() => {
                  useGameStore.getState().activateGodHealthCheat();
                  soundSystem.playUiClick();
                  showNotification('God Mode Activated', 'HP set to 100,000! 🛡️', 'warning');
                }}
                className="w-full p-3 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 text-left flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="font-black text-xs text-amber-300">100,000 HP God Mode</div>
                    <div className="text-[10px] text-gray-400">Invincible Juggernaut Health</div>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/60 text-amber-400">
                  Ctrl+H
                </span>
              </button>

              <button
                onClick={() => {
                  usePedestrianStore.getState().clearPolicePursuit();
                  soundSystem.playUiClick();
                  showNotification('Police Dispatched', 'Pursuit call-off granted.', 'info');
                }}
                className="w-full p-3 rounded-xl bg-blue-950/60 hover:bg-blue-900/80 border border-blue-500/40 text-left flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="font-black text-xs text-blue-300">Clear Police Pursuit</div>
                    <div className="text-[10px] text-gray-400">Wipe all wanted stars to 0</div>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/60 text-blue-400">
                  Ctrl+P
                </span>
              </button>
            </div>
          )}

          {/* ========================================================
              TAB: VEHICLES & GARAGE
          ======================================================== */}
          {activeTab === 'vehicles' && (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setActiveScreen('garage');
                  onClose();
                }}
                className="w-full p-3 rounded-xl bg-slate-900 hover:bg-pink-950/80 border border-white/10 text-left flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Wrench className="w-5 h-5 text-pink-400" />
                  <div>
                    <div className="font-black text-xs text-white">SpeedWorks Customs Garage</div>
                    <div className="text-[10px] text-gray-400">Engine, Turbo, Brakes & Paint Tuning</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-pink-400" />
              </button>

              <button
                onClick={() => {
                  setActiveScreen('dealership');
                  onClose();
                }}
                className="w-full p-3 rounded-xl bg-slate-900 hover:bg-cyan-950/80 border border-white/10 text-left flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Car className="w-5 h-5 text-cyan-400" />
                  <div>
                    <div className="font-black text-xs text-white">Apex Exotic Dealership</div>
                    <div className="text-[10px] text-gray-400">Purchase Supercars, SUVs & Coupes</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-cyan-400" />
              </button>

              <button
                onClick={() => {
                  vehiclePhysics.velocity = 0;
                  vehiclePhysics.pos.y = 0.4;
                  vehiclePhysics.pitch = 0;
                  vehiclePhysics.roll = 0;
                  soundSystem.playUiClick();
                  showNotification('Vehicle Reset', 'Vehicle repositioned safely.', 'info');
                }}
                className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-left flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="font-black text-xs text-white">Reset Flipped Vehicle</div>
                    <div className="text-[10px] text-gray-400">Right vehicle upright on roadway</div>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/60 text-amber-400">
                  [R]
                </span>
              </button>
            </div>
          )}

          {/* ========================================================
              TAB: COMMERCIAL SHOPS
          ======================================================== */}
          {activeTab === 'shops' && (
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => {
                  useGameStore.getState().openShop('shop-vegetable');
                  onClose();
                }}
                className="w-full p-2.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-400/40 text-left flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🛒</span>
                  <div>
                    <div className="font-black text-xs text-emerald-300">NitroFuel Convenience Mart</div>
                    <div className="text-[10px] text-gray-400">Snacks, Energy Sodas & Food</div>
                  </div>
                </div>
                <span className="text-[9px] font-black uppercase text-emerald-400 bg-black/40 px-2 py-0.5 rounded">
                  BROWSE
                </span>
              </button>

              {CITY_SHOPS.slice(0, 6).map((shop) => (
                <button
                  key={shop.id}
                  onClick={() => {
                    useGameStore.getState().enterShopInterior(shop.id);
                    onClose();
                  }}
                  className="w-full p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-left flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">
                      {shop.type === 'cafe' ? '☕' : shop.type === 'pharmacy' ? '💊' : shop.type === 'gym' ? '💪' : shop.type === 'pizza' ? '🍕' : '🏪'}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-white">{shop.name}</div>
                      <div className="text-[10px] text-gray-400 capitalize">{shop.type} Store</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded">
                    VISIT
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* ========================================================
              TAB: TIME & WEATHER
          ======================================================== */}
          {activeTab === 'world' && (
            <div className="flex flex-col gap-2">
              <div className="text-[11px] font-black uppercase tracking-wider text-gray-400 px-1">
                Time of Day
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'Day', hour: 12, icon: <Sun className="w-4 h-4 text-amber-300" /> },
                  { label: 'Sunset', hour: 18, icon: <Sunset className="w-4 h-4 text-orange-400" /> },
                  { label: 'Night', hour: 22, icon: <Moon className="w-4 h-4 text-cyan-300" /> }
                ].map((t) => (
                  <button
                    key={t.label}
                    onClick={() => {
                      setTimeOfDay(t.hour);
                      soundSystem.playUiClick();
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      Math.abs(timeOfDay - t.hour) < 3
                        ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 font-black'
                        : 'bg-slate-900/80 border-white/10 text-gray-300 hover:text-white'
                    }`}
                  >
                    {t.icon}
                    <span className="text-[10px] font-black">{t.label}</span>
                  </button>
                ))}
              </div>

              <div className="text-[11px] font-black uppercase tracking-wider text-gray-400 px-1 mt-2">
                Weather
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'clear', label: 'Clear Sky', icon: <Sun className="w-4 h-4 text-amber-300" /> },
                  { id: 'rain', label: 'Storm Rain', icon: <CloudRain className="w-4 h-4 text-cyan-400" /> }
                ].map((w) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      setWeather(w.id as any);
                      soundSystem.playUiClick();
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      weather === w.id
                        ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 font-black'
                        : 'bg-slate-900/80 border-white/10 text-gray-300 hover:text-white'
                    }`}
                  >
                    {w.icon}
                    <span className="text-[10px] font-black">{w.label}</span>
                  </button>
                ))}
              </div>

              <div className="text-[11px] font-black uppercase tracking-wider text-gray-400 px-1 mt-2">
                In-Car Radio
              </div>
              <button
                onClick={() => {
                  setRadio(radioStation, !radioPlaying);
                  soundSystem.playUiClick();
                }}
                className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-left flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {radioPlaying ? (
                    <Volume2 className="w-5 h-5 text-purple-400 animate-pulse" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <div className="font-black text-xs text-white">
                      {radioPlaying ? radioStation : 'Radio Muted'}
                    </div>
                    <div className="text-[10px] text-gray-400">Click to toggle station</div>
                  </div>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${radioPlaying ? 'bg-purple-500/30 text-purple-300' : 'bg-slate-800 text-gray-400'}`}>
                  {radioPlaying ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          )}

          {/* ========================================================
              TAB: CONTROLS & SHORTCUTS GUIDE
          ======================================================== */}
          {activeTab === 'controls' && (
            <div className="flex flex-col gap-1.5 text-xs">
              <div className="text-[10px] font-black uppercase text-cyan-400 px-1">Walking Controls</div>
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-white/10 space-y-1">
                <div className="flex justify-between"><span className="text-gray-300">Walk / Move</span><span className="font-mono text-cyan-300">WASD / Joystick</span></div>
                <div className="flex justify-between"><span className="text-gray-300">Sprint</span><span className="font-mono text-cyan-300">Shift</span></div>
                <div className="flex justify-between"><span className="text-gray-300">Jump</span><span className="font-mono text-cyan-300">Space</span></div>
                <div className="flex justify-between"><span className="text-gray-300">Attack / Strike</span><span className="font-mono text-cyan-300">Left Click / F</span></div>
                <div className="flex justify-between"><span className="text-gray-300">Weapon Select</span><span className="font-mono text-cyan-300">1 (Fists), 2 (Bat), 3 (Gun)</span></div>
                <div className="flex justify-between"><span className="text-gray-300">Enter / Exit Car</span><span className="font-mono text-cyan-300">C</span></div>
                <div className="flex justify-between"><span className="text-gray-300">Enter Shop / House</span><span className="font-mono text-cyan-300">E / S</span></div>
              </div>

              <div className="text-[10px] font-black uppercase text-cyan-400 px-1 mt-1">Driving Controls</div>
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-white/10 space-y-1">
                <div className="flex justify-between"><span className="text-gray-300">Accelerate / Reverse</span><span className="font-mono text-cyan-300">W / S</span></div>
                <div className="flex justify-between"><span className="text-gray-300">Steer</span><span className="font-mono text-cyan-300">A / D / Analog</span></div>
                <div className="flex justify-between"><span className="text-gray-300">Handbrake Drift</span><span className="font-mono text-cyan-300">Space</span></div>
                <div className="flex justify-between"><span className="text-gray-300">Nitro Boost</span><span className="font-mono text-cyan-300">Shift</span></div>
                <div className="flex justify-between"><span className="text-gray-300">Vehicle Horn</span><span className="font-mono text-cyan-300">H</span></div>
                <div className="flex justify-between"><span className="text-gray-300">Headlights</span><span className="font-mono text-cyan-300">L</span></div>
                <div className="flex justify-between"><span className="text-gray-300">Camera View</span><span className="font-mono text-cyan-300">V</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-5 py-2.5 bg-neutral-950 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-400">
          <span>Press [TAB] or [ESC] to close</span>
          <span className="font-bold text-cyan-400">SPEED US v1.0</span>
        </div>
      </div>
    </div>
  );
};

