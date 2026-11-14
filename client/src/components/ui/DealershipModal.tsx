import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { VEHICLES } from '../../data/vehicles';
import { X, Zap, DollarSign, Gauge, Timer, Compass, Shield, CheckCircle2, Car, Sparkles, KeyRound } from 'lucide-react';

export const DealershipModal: React.FC = () => {
  const activeScreen = useGameStore((s) => s.activeScreen);
  const setActiveScreen = useGameStore((s) => s.setActiveScreen);
  const player = useGameStore((s) => s.player);
  const purchaseVehicle = useGameStore((s) => s.purchaseVehicle);
  const setActiveVehicle = useGameStore((s) => s.setActiveVehicle);

  const vehicleList = Object.values(VEHICLES);
  const [selectedId, setSelectedId] = useState<string>(vehicleList[1]?.id || vehicleList[0]?.id || 'v8-sovereign');
  const selectedDef = VEHICLES[selectedId] || vehicleList[0];
  const [chosenColor, setChosenColor] = useState<string>(selectedDef.defaultColor);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  if (activeScreen !== 'dealership') return null;

  const isOwned = Boolean(player.ownedVehicles[selectedDef.id]);
  const isActive = player.activeVehicleId === selectedDef.id;
  const canAfford = player.cash >= selectedDef.price;

  const filteredVehicles = filterCategory === 'all'
    ? vehicleList
    : vehicleList.filter((v) => v.category === filterCategory);

  const handleBuy = () => {
    const success = purchaseVehicle(selectedDef.id, chosenColor);
    if (success) {
      setActiveVehicle(selectedDef.id);
      setActiveScreen('game');
    }
  };

  const handleTestDrive = () => {
    setActiveVehicle(selectedDef.id);
    setActiveScreen('game');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'hypercar':
        return 'text-cyan-300 border-cyan-400/60 bg-cyan-500/20';
      case 'supercar':
        return 'text-rose-300 border-rose-400/60 bg-rose-500/20';
      case 'sports':
        return 'text-blue-300 border-blue-400/60 bg-blue-500/20';
      case 'muscle':
        return 'text-amber-300 border-amber-400/60 bg-amber-500/20';
      case 'suv':
        return 'text-emerald-300 border-emerald-400/60 bg-emerald-500/20';
      case 'motorcycle':
        return 'text-purple-300 border-purple-400/60 bg-purple-500/20';
      default:
        return 'text-gray-300 border-white/20 bg-slate-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 md:p-6 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[840px] rounded-3xl bg-slate-950 border-2 border-cyan-400/70 shadow-[0_0_60px_rgba(0,240,255,0.35)] flex flex-col overflow-hidden">
        {/* ========================================================
            HEADER BAR: GTA V LUXURY MOTORSPORT THEME
        ======================================================== */}
        <div className="h-14 sm:h-16 px-3 sm:px-6 md:px-8 flex items-center justify-between border-b border-cyan-400/30 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.7)] text-black shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-lg md:text-xl font-display font-black text-white tracking-wider truncate">
                  APEX EXOTIC MOTOR CARS
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shrink-0">
                  OFFICIAL SHOWROOM
                </span>
              </div>
              <span className="hidden xs:block text-[9px] sm:text-[10px] md:text-[11px] font-extrabold text-gray-400 tracking-widest uppercase truncate">
                PREMIER OPEN-WORLD VEHICLE DEALERSHIP • SAN ANDREAS HIGHWAY SPEC
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 md:gap-5 shrink-0">
            <div className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3.5 md:px-5 py-1 sm:py-1.5 md:py-2 rounded-xl sm:rounded-2xl bg-emerald-950/90 border-2 border-emerald-400 text-emerald-300 font-display font-black text-xs sm:text-sm md:text-base shadow-[0_0_18px_rgba(16,185,129,0.4)]">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span>${player.cash.toLocaleString()}</span>
            </div>

            <button
              onClick={() => setActiveScreen('game')}
              className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-slate-800 hover:bg-red-600 text-white flex items-center justify-center transition-all border border-white/20 cursor-pointer hover:scale-105"
              title="Close Showroom [ESC]"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================
            CATEGORY FILTER TABS BAR
        ======================================================== */}
        <div className="h-11 px-3 sm:px-6 flex items-center gap-2 border-b border-cyan-400/20 bg-slate-950/90 shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Fleet' },
            { id: 'hypercar', label: 'Hypercars' },
            { id: 'supercar', label: 'Supercars' },
            { id: 'sports', label: 'Sports' },
            { id: 'muscle', label: 'Muscle' },
            { id: 'suv', label: 'SUVs' },
            { id: 'motorcycle', label: 'Motorcycles' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                filterCategory === cat.id
                  ? 'bg-cyan-400 text-black shadow-[0_0_14px_rgba(0,240,255,0.7)] font-black'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
          <span className="ml-auto text-[11px] font-bold text-gray-500 uppercase tracking-widest shrink-0 hidden md:inline-block">
            {filteredVehicles.length} Models Available
          </span>
        </div>

        {/* ========================================================
            CONTENT BODY: 2-COLUMN BALANCED LAYOUT (STACKS ON MOBILE)
        ======================================================== */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* ----------------------------------------------------
              LEFT COLUMN / TOP ROW ON MOBILE: VEHICLE ROSTER
          ---------------------------------------------------- */}
          <div
            className="w-full md:w-80 md:max-w-[340px] max-h-36 sm:max-h-48 md:max-h-none shrink-0 border-b md:border-b-0 md:border-r border-cyan-400/25 bg-slate-900/60 p-2 sm:p-3 space-y-1.5 sm:space-y-2 overflow-y-auto"
          >
            {filteredVehicles.map((v) => {
              const selected = v.id === selectedDef.id;
              const owned = Boolean(player.ownedVehicles[v.id]);
              const active = player.activeVehicleId === v.id;

              return (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedId(v.id);
                    setChosenColor(v.defaultColor);
                  }}
                  className={`w-full p-3 rounded-2xl text-left border-2 transition-all cursor-pointer block ${
                    selected
                      ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.35)] scale-[1.01]'
                      : 'bg-slate-950/80 border-white/10 hover:border-cyan-400/50 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 truncate">
                      {v.brand}
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                      {active ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-500/30 text-cyan-300 border border-cyan-400">
                          ACTIVE
                        </span>
                      ) : owned ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/30 text-emerald-300 border border-emerald-400 flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                          OWNED
                        </span>
                      ) : (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border ${getCategoryColor(v.category)}`}>
                          {v.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="font-display font-black text-sm md:text-base text-white mt-1 leading-tight truncate">
                    {v.name}
                  </h4>

                  <div className="flex justify-between items-center mt-1.5 pt-1.5 border-t border-white/10 text-xs">
                    <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider truncate">
                      {v.drivetrain} • {v.topSpeed} KM/H
                    </span>
                    <span className="font-display font-black text-emerald-400 text-xs md:text-sm shrink-0">
                      ${v.price.toLocaleString()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ----------------------------------------------------
              RIGHT COLUMN: FULL SHOWROOM SHOWCASE STAGE
          ---------------------------------------------------- */}
          <div
            className="flex-1 p-5 md:p-7 flex flex-col justify-between overflow-y-auto overflow-x-hidden bg-slate-950/90 min-w-0"
            style={{ flex: '1 1 0%', minWidth: 0 }}
          >
            <div>
              {/* Top Banner: Brand, Category, Name & Price */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-white/10">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-cyan-300 tracking-widest uppercase">
                      {selectedDef.brand}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getCategoryColor(selectedDef.category)}`}>
                      {selectedDef.category}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-xs font-bold text-gray-300 uppercase">
                      {selectedDef.drivetrain} Drivetrain
                    </span>
                  </div>

                  <h1 className="text-2xl md:text-3xl font-display font-black text-white mt-1 tracking-wide drop-shadow-md truncate">
                    {selectedDef.name}
                  </h1>

                  <span className="text-xs font-bold text-gray-400 mt-0.5 block truncate">
                    Engine Spec: <span className="text-gray-200">{selectedDef.engineType}</span>
                  </span>
                </div>

                <div className="text-left sm:text-right shrink-0 bg-slate-900/90 px-4 md:px-5 py-2.5 rounded-2xl border border-emerald-400/40 shadow-xl">
                  <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">
                    {isOwned ? 'Vehicle Status' : 'Retail Showroom Price'}
                  </span>
                  <div className="text-xl md:text-2xl font-display font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]">
                    {isOwned ? 'PURCHASED' : `$${selectedDef.price.toLocaleString()}`}
                  </div>
                </div>
              </div>

              {/* Showroom Interactive Turntable Stage Preview */}
              <div
                className="mt-4 relative h-40 md:h-48 rounded-3xl bg-slate-900/90 border border-cyan-400/30 overflow-hidden flex items-center justify-center shadow-inner"
                style={{
                  background: `radial-gradient(ellipse at 50% 65%, ${chosenColor}33 0%, rgba(15,23,42,0.95) 75%)`
                }}
              >
                {/* Ceiling Showroom Spotlight */}
                <div
                  className="absolute top-0 w-64 h-32 blur-2xl opacity-40 rounded-full pointer-events-none"
                  style={{ backgroundColor: chosenColor }}
                />

                {/* Turntable Floor Rings */}
                <div className="absolute bottom-3 w-64 h-16 border border-white/20 rounded-[50%] transform rotate-x-60 pointer-events-none" />
                <div
                  className="absolute bottom-5 w-80 h-20 border-2 rounded-[50%] transform rotate-x-60 pointer-events-none opacity-60"
                  style={{ borderColor: chosenColor }}
                />

                {/* Stylized Vehicle Silhouette with Custom Chosen Paint Accent */}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className="w-36 md:w-44 h-14 md:h-16 rounded-2xl flex items-center justify-center border-2 shadow-2xl transition-all duration-300"
                    style={{
                      backgroundColor: `${chosenColor}33`,
                      borderColor: chosenColor,
                      boxShadow: `0 0 35px ${chosenColor}66`
                    }}
                  >
                    <Car className="w-12 h-12 md:w-16 md:h-16 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" style={{ color: chosenColor }} />
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shadow-lg"
                      style={{ backgroundColor: chosenColor }}
                    />
                    <span className="text-[11px] font-black uppercase tracking-widest text-white drop-shadow">
                      {chosenColor} Paint Finish
                    </span>
                  </div>
                </div>

                <div className="absolute top-2.5 right-3 px-2.5 py-0.5 rounded-full bg-slate-950/70 border border-white/10 text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" /> Showroom Stage
                </div>
              </div>

              {/* Vehicle Description Banner */}
              <div className="mt-3 p-3 rounded-2xl bg-slate-900/60 border border-white/10">
                <p className="text-xs text-gray-300 leading-relaxed font-medium">
                  {selectedDef.description}
                </p>
              </div>

              {/* Performance Radar Specs Grid (Segmented GTA V Style) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 p-4 rounded-2xl bg-slate-900/80 border border-cyan-400/25 shadow-xl">
                {/* 1. Top Speed */}
                <div>
                  <div className="flex justify-between items-center text-xs font-black mb-1">
                    <span className="text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                      <Gauge className="w-3.5 h-3.5 text-cyan-400" /> TOP SPEED
                    </span>
                    <span className="text-white font-display text-xs">{selectedDef.topSpeed} KM/H</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-cyan-400/30">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-sky-300 rounded-full shadow-[0_0_12px_rgba(0,240,255,0.9)] transition-all duration-300"
                      style={{ width: `${Math.min(100, (selectedDef.topSpeed / 420) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* 2. Acceleration */}
                <div>
                  <div className="flex justify-between items-center text-xs font-black mb-1">
                    <span className="text-amber-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                      <Timer className="w-3.5 h-3.5 text-amber-400" /> ACCELERATION (0-100)
                    </span>
                    <span className="text-white font-display text-xs">{selectedDef.acceleration}s</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-amber-400/30">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.9)] transition-all duration-300"
                      style={{ width: `${Math.max(12, (1 - selectedDef.acceleration / 9.5) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* 3. Handling Agility */}
                <div>
                  <div className="flex justify-between items-center text-xs font-black mb-1">
                    <span className="text-purple-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                      <Compass className="w-3.5 h-3.5 text-purple-400" /> HANDLING AGILITY
                    </span>
                    <span className="text-white font-display text-xs">{selectedDef.handling} / 10</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-purple-400/30">
                    <div
                      className="h-full bg-gradient-to-r from-purple-400 to-fuchsia-400 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.9)] transition-all duration-300"
                      style={{ width: `${selectedDef.handling * 10}%` }}
                    />
                  </div>
                </div>

                {/* 4. Braking Force */}
                <div>
                  <div className="flex justify-between items-center text-xs font-black mb-1">
                    <span className="text-rose-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                      <Shield className="w-3.5 h-3.5 text-rose-400" /> BRAKING FORCE
                    </span>
                    <span className="text-white font-display text-xs">{selectedDef.braking} / 10</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-rose-400/30">
                    <div
                      className="h-full bg-gradient-to-r from-rose-400 to-red-400 rounded-full shadow-[0_0_12px_rgba(244,63,94,0.9)] transition-all duration-300"
                      style={{ width: `${selectedDef.braking * 10}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Color Swatch Options */}
              <div className="mt-3 p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <span className="text-xs font-black text-white uppercase tracking-wider block">
                    Factory Paint Finishes
                  </span>
                  <span className="text-[10px] text-cyan-300 font-bold">
                    Color: {chosenColor.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {selectedDef.availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setChosenColor(color)}
                      title={`Paint: ${color}`}
                      className={`w-7 h-7 md:w-8 md:h-8 rounded-full border-2 transition-all cursor-pointer ${
                        chosenColor === color
                          ? 'scale-120 border-white shadow-[0_0_14px_rgba(255,255,255,0.9)] ring-2 ring-cyan-400'
                          : 'border-slate-800 hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions Footer */}
            <div className="mt-4 pt-3.5 border-t border-cyan-400/30 flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={handleTestDrive}
                className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-display font-black text-xs md:text-sm border-2 border-slate-600 transition-all shadow-md cursor-pointer hover:border-cyan-400 flex items-center gap-1.5"
              >
                <KeyRound className="w-4 h-4 text-cyan-400" />
                <span>Instant Test Drive</span>
              </button>

              <div className="flex items-center gap-2">
                {isOwned ? (
                  <button
                    onClick={() => {
                      setActiveVehicle(selectedDef.id);
                      setActiveScreen('game');
                    }}
                    className="px-6 md:px-7 py-2.5 md:py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-display font-black text-xs md:text-sm tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.8)] transition-all cursor-pointer flex items-center gap-2 hover:scale-102"
                  >
                    <CheckCircle2 className="w-4 h-4 text-black" />
                    <span>{isActive ? 'Already Selected (Drive Now)' : 'Select as Active Vehicle'}</span>
                  </button>
                ) : (
                  <button
                    disabled={!canAfford}
                    onClick={handleBuy}
                    className={`px-6 md:px-7 py-2.5 md:py-3 rounded-2xl font-display font-black text-xs md:text-sm tracking-wide shadow-xl transition-all cursor-pointer ${
                      canAfford
                        ? 'bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black shadow-[0_0_25px_rgba(0,240,255,0.7)] hover:scale-102'
                        : 'bg-slate-800 text-gray-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? `Purchase Vehicle • $${selectedDef.price.toLocaleString()}` : 'Insufficient Funds'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
