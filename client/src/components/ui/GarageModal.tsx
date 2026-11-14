import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { VEHICLES } from '../../data/vehicles';
import { Wrench, Palette, Zap, Sparkles, X, DollarSign, Check, Flame } from 'lucide-react';

export const GarageModal: React.FC = () => {
  const activeScreen = useGameStore((s) => s.activeScreen);
  const setActiveScreen = useGameStore((s) => s.setActiveScreen);
  const player = useGameStore((s) => s.player);
  const activeVehicleId = player.activeVehicleId || 'starter-taxi';
  const def = VEHICLES[activeVehicleId] || VEHICLES['starter-taxi'];
  const customization = player.ownedVehicles[activeVehicleId] || {
    color: def.defaultColor,
    finish: 'gloss',
    underglow: null,
    spoiler: 0,
    engineLevel: 0,
    hasTurbo: false,
    brakeLevel: 0,
    suspensionLevel: 0,
    wheelColor: '#334155',
    windowTint: 0.3
  };

  const updateCustomization = useGameStore((s) => s.updateCustomization);
  const spendCash = useGameStore((s) => s.spendCash);
  const repairVehicle = useGameStore((s) => s.repairVehicle);
  const refuelVehicle = useGameStore((s) => s.refuelVehicle);
  const vehicleHealth = useGameStore((s) => s.vehicleHealth);
  const vehicleFuel = useGameStore((s) => s.vehicleFuel);

  const [activeTab, setActiveTab] = useState<'paint' | 'neon' | 'aero' | 'engine' | 'maintenance'>('paint');

  if (activeScreen !== 'garage') return null;

  const colorPresets = [
    '#f59e0b', '#dc2626', '#0284c7', '#00f0ff', '#ff007f',
    '#10b981', '#a855f7', '#f8fafc', '#18181b', '#ca8a04'
  ];

  const underglowOptions = [
    { label: 'None', color: null },
    { label: 'Cyan Neon', color: '#00f0ff' },
    { label: 'Hot Pink', color: '#ff007f' },
    { label: 'Electric Gold', color: '#facc15' },
    { label: 'Acid Green', color: '#22c55e' },
    { label: 'Deep Purple', color: '#a855f7' },
    { label: 'Crimson Red', color: '#ef4444' },
    { label: 'Arctic White', color: '#ffffff' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[670px] rounded-3xl bg-slate-900/95 border-2 border-pink-400 shadow-[0_0_40px_rgba(255,0,127,0.4)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-18 px-8 flex items-center justify-between border-b border-pink-400/30 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/30 border border-pink-400 flex items-center justify-center shadow-[0_0_12px_rgba(255,0,127,0.6)]">
              <Wrench className="w-6 h-6 text-pink-300" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-black text-white tracking-wide">
                SPEEDWORKS TUNING & CUSTOMS
              </h2>
              <span className="text-xs font-black text-pink-300 tracking-widest uppercase">
                {def.name} • Bay #1
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-emerald-950 border-2 border-emerald-400 text-emerald-300 font-display font-black text-lg shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>${player.cash.toLocaleString()}</span>
            </div>

            <button
              onClick={() => setActiveScreen('game')}
              className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors border border-white/20"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-pink-400/30 bg-slate-950/60 px-8 gap-4">
          {[
            { id: 'paint', label: 'Paint & Finish', icon: Palette },
            { id: 'neon', label: 'Underglow Kits', icon: Sparkles },
            { id: 'aero', label: 'Aero & Spoilers', icon: Zap },
            { id: 'engine', label: 'Performance Upgrades', icon: Flame },
            { id: 'maintenance', label: 'Service & Repair', icon: Wrench },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-4 flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all border-b-3 ${
                  active
                    ? 'border-pink-400 text-pink-300 shadow-[0_2px_10px_rgba(255,0,127,0.5)]'
                    : 'border-transparent text-gray-300 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="flex-1 p-8 overflow-y-auto bg-slate-900/60">
          {activeTab === 'paint' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Paint Color Palette:
                </span>
                <div className="flex flex-wrap gap-3.5 mt-3">
                  {colorPresets.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateCustomization(activeVehicleId, { color: c })}
                      className={`w-12 h-12 rounded-2xl border-3 transition-transform ${
                        customization.color === c
                          ? 'scale-115 border-white shadow-[0_0_15px_rgba(255,255,255,1)]'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Finish Treatment:
                </span>
                <div className="grid grid-cols-4 gap-3 mt-3">
                  {(['gloss', 'matte', 'metallic', 'pearlescent'] as const).map((finish) => (
                    <button
                      key={finish}
                      onClick={() => updateCustomization(activeVehicleId, { finish })}
                      className={`py-3.5 px-4 rounded-xl text-xs font-black uppercase border-2 transition-all ${
                        customization.finish === finish
                          ? 'bg-pink-600 text-white border-pink-300 shadow-[0_0_15px_rgba(255,0,127,0.6)]'
                          : 'bg-slate-800 border-slate-700 text-gray-200 hover:text-white'
                      }`}
                    >
                      {finish}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'neon' && (
            <div className="space-y-4 max-w-2xl">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Select Neon Tube Illumination:
              </span>
              <div className="grid grid-cols-2 gap-3.5 mt-2">
                {underglowOptions.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => updateCustomization(activeVehicleId, { underglow: opt.color })}
                    className={`p-4 rounded-2xl text-left border-2 flex items-center justify-between transition-all ${
                      customization.underglow === opt.color
                        ? 'bg-pink-950 border-pink-400 text-white shadow-[0_0_15px_rgba(255,0,127,0.5)]'
                        : 'bg-slate-800 border-slate-700 text-gray-200 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: opt.color || '#333333' }}
                      />
                      <span className="text-xs font-black">{opt.label}</span>
                    </div>
                    {customization.underglow === opt.color && <Check className="w-5 h-5 text-pink-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'aero' && (
            <div className="space-y-4 max-w-2xl">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Aerodynamic Rear Spoilers:
              </span>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { level: 0, title: 'Factory Clean (No Wing)', desc: 'Original factory silhouette' },
                  { level: 1, title: 'Sport Ducktail Lip', desc: 'Subtle high-speed downforce' },
                  { level: 2, title: 'Carbon Racing Wing', desc: 'Track day tuned dual-mount blade' },
                  { level: 3, title: 'GT Super-Car Wing', desc: 'Maximum high-downforce cornering attack' },
                ].map((sp) => (
                  <button
                    key={sp.level}
                    onClick={() => updateCustomization(activeVehicleId, { spoiler: sp.level })}
                    className={`p-4 rounded-2xl text-left border-2 transition-all ${
                      customization.spoiler === sp.level
                        ? 'bg-pink-950 border-pink-400 text-white shadow-[0_0_15px_rgba(255,0,127,0.5)]'
                        : 'bg-slate-800 border-slate-700 text-gray-200 hover:text-white'
                    }`}
                  >
                    <h4 className="font-black text-sm text-white">{sp.title}</h4>
                    <p className="text-xs text-gray-300 mt-1">{sp.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'engine' && (
            <div className="space-y-4 max-w-2xl">
              <div className="p-5 rounded-2xl bg-slate-950 border-2 border-white/20 flex items-center justify-between shadow-md">
                <div>
                  <h4 className="font-black text-base text-white">ECU Engine Remap</h4>
                  <span className="text-xs text-gray-300 font-bold">Current Level: Stage {customization.engineLevel} / 3 (+{customization.engineLevel * 12}% Power)</span>
                </div>
                {customization.engineLevel < 3 ? (
                  <button
                    onClick={() => {
                      if (spendCash(4500)) {
                        updateCustomization(activeVehicleId, { engineLevel: customization.engineLevel + 1 });
                      }
                    }}
                    className="px-6 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-black text-xs font-black shadow-[0_0_15px_rgba(255,0,127,0.6)]"
                  >
                    Upgrade Stage {customization.engineLevel + 1} ($4,500)
                  </button>
                ) : (
                  <span className="text-xs font-black text-emerald-400">MAX LEVEL</span>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border-2 border-white/20 flex items-center justify-between shadow-md">
                <div>
                  <h4 className="font-black text-base text-white">Twin-Scroll Turbocharger System</h4>
                  <span className="text-xs text-gray-300 font-bold">+25% Acceleration & Blow-off Valve Flutter</span>
                </div>
                {!customization.hasTurbo ? (
                  <button
                    onClick={() => {
                      if (spendCash(8500)) {
                        updateCustomization(activeVehicleId, { hasTurbo: true });
                      }
                    }}
                    className="px-6 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-black text-xs font-black shadow-[0_0_15px_rgba(255,0,127,0.6)]"
                  >
                    Install Turbo ($8,500)
                  </button>
                ) : (
                  <span className="text-xs font-black text-emerald-400">INSTALLED</span>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border-2 border-white/20 flex items-center justify-between shadow-md">
                <div>
                  <h4 className="font-black text-base text-white">Carbon-Ceramic Sport Brakes</h4>
                  <span className="text-xs text-gray-300 font-bold">Current Level: Stage {customization.brakeLevel} / 3 (+{customization.brakeLevel * 15}% Stopping Power)</span>
                </div>
                {customization.brakeLevel < 3 ? (
                  <button
                    onClick={() => {
                      if (spendCash(3200)) {
                        updateCustomization(activeVehicleId, { brakeLevel: customization.brakeLevel + 1 });
                      }
                    }}
                    className="px-6 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-black text-xs font-black shadow-[0_0_15px_rgba(255,0,127,0.6)]"
                  >
                    Upgrade Stage {customization.brakeLevel + 1} ($3,200)
                  </button>
                ) : (
                  <span className="text-xs font-black text-emerald-400">MAX LEVEL</span>
                )}
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-4 max-w-2xl">
              <div className="p-5 rounded-2xl bg-slate-950 border-2 border-white/20 flex items-center justify-between shadow-md">
                <div>
                  <h4 className="font-black text-base text-white">Full Body & Mechanical Repair</h4>
                  <p className="text-xs text-gray-300 font-bold mt-1">Vehicle Health: {vehicleHealth}%</p>
                </div>
                <button
                  onClick={repairVehicle}
                  className="px-7 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black shadow-[0_0_15px_rgba(16,185,129,0.7)]"
                >
                  Repair ($750)
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border-2 border-white/20 flex items-center justify-between shadow-md">
                <div>
                  <h4 className="font-black text-base text-white">100-Octane Fuel Refill</h4>
                  <p className="text-xs text-gray-300 font-bold mt-1">Current Fuel: {vehicleFuel}%</p>
                </div>
                <button
                  onClick={refuelVehicle}
                  className="px-7 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black shadow-[0_0_15px_rgba(245,158,11,0.7)]"
                >
                  Refuel ($120)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
