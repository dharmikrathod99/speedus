import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { VEHICLES } from '../../data/vehicles';
import { PROPERTIES, JOBS } from '../../data/worldData';
import {
  CreditCard,
  Briefcase,
  Car,
  Home,
  Radio,
  CloudSun,
  Settings,
  Shirt,
  X,
  Wifi,
  Battery,
  ChevronLeft,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Navigation,
  Play,
  Square
} from 'lucide-react';

export const Smartphone: React.FC = () => {
  const isPhoneOpen = useGameStore((s) => s.isPhoneOpen);
  const togglePhone = useGameStore((s) => s.togglePhone);
  const activeApp = useGameStore((s) => s.activePhoneApp);
  const openApp = useGameStore((s) => s.openPhoneApp);
  const player = useGameStore((s) => s.player);
  const setActiveScreen = useGameStore((s) => s.setActiveScreen);
  const transferToBank = useGameStore((s) => s.transferToBank);
  const transferToCash = useGameStore((s) => s.transferToCash);
  const startJob = useGameStore((s) => s.startJob);
  const cancelMission = useGameStore((s) => s.cancelMission);
  const activeMission = useGameStore((s) => s.activeMission);
  const setActiveVehicle = useGameStore((s) => s.setActiveVehicle);
  const purchaseProperty = useGameStore((s) => s.purchaseProperty);
  const radioStation = useGameStore((s) => s.radioStation);
  const radioPlaying = useGameStore((s) => s.radioPlaying);
  const setRadio = useGameStore((s) => s.setRadio);
  const weather = useGameStore((s) => s.weather);
  const setWeather = useGameStore((s) => s.setWeather);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const setTimeOfDay = useGameStore((s) => s.setTimeOfDay);
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);

  const [transferAmount, setTransferAmount] = useState<string>('5000');

  if (!isPhoneOpen) return null;

  // Format in-game clock
  const hours = Math.floor(timeOfDay);
  const minutes = Math.floor((timeOfDay - hours) * 60);
  const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-x-0 bottom-4 sm:inset-x-auto sm:bottom-6 sm:right-10 z-50 select-none flex justify-center animate-in fade-in slide-in-from-bottom-8 duration-300 pointer-events-auto">
      {/* Phone Hardware Bezel */}
      <div className="relative w-[92vw] max-w-[330px] h-[85vh] max-h-[600px] bg-slate-900 rounded-[40px] sm:rounded-[44px] p-3 sm:p-3.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(0,240,255,0.3)] border-4 border-cyan-400/80 flex flex-col overflow-hidden">
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-20 flex items-center justify-center border border-white/20">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2" />
          <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_6px_rgba(0,240,255,1)]" />
        </div>

        {/* Screen Container */}
        <div className="relative flex-1 bg-gradient-to-b from-slate-900 via-slate-950 to-neutral-950 rounded-[34px] overflow-hidden flex flex-col border border-cyan-400/30">
          {/* Status Bar */}
          <div className="h-10 px-6 pt-3 flex justify-between items-center text-xs font-bold text-white z-10">
            <span className="text-cyan-300 font-display">{timeString}</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-cyan-400 font-extrabold">5G</span>
              <Wifi className="w-4 h-4 text-cyan-300" />
              <Battery className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* App Header (if in an app) */}
          {activeApp !== 'home' && (
            <div className="h-12 px-4 flex items-center justify-between border-b border-cyan-400/30 bg-slate-900/90 backdrop-blur-md">
              <button
                onClick={() => openApp('home')}
                className="flex items-center gap-1 text-xs text-cyan-300 font-bold hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" /> Home
              </button>
              <span className="text-xs font-black uppercase tracking-wider text-white">
                {activeApp}
              </span>
              <button onClick={togglePhone} className="text-gray-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* App Content Body */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {/* ========================================================
                HOME SCREEN GRID
            ======================================================== */}
            {activeApp === 'home' && (
              <div className="mt-4">
                <div className="mb-6 px-1">
                  <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Welcome back,</h3>
                  <h2 className="text-2xl font-display font-black text-white">{player.name}</h2>
                  <div className="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-400/50 text-emerald-300 font-black text-xs shadow-md">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>${(player.cash + player.bank).toLocaleString()} Net Worth</span>
                  </div>
                </div>

                {/* 6 Grid Icons */}
                <div className="grid grid-cols-3 gap-y-6 gap-x-4 text-center">
                  <button onClick={() => openApp('bank')} className="flex flex-col items-center group">
                    <div className="w-15 h-15 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)] group-hover:scale-110 transition-transform">
                      <CreditCard className="w-7 h-7 text-black" />
                    </div>
                    <span className="mt-1.5 text-xs font-black text-white">Apex Bank</span>
                  </button>

                  <button onClick={() => openApp('jobs')} className="flex flex-col items-center group">
                    <div className="w-15 h-15 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)] group-hover:scale-110 transition-transform">
                      <Briefcase className="w-7 h-7 text-black" />
                    </div>
                    <span className="mt-1.5 text-xs font-black text-white">Job Center</span>
                  </button>

                  <button onClick={() => openApp('garage')} className="flex flex-col items-center group">
                    <div className="w-15 h-15 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.5)] group-hover:scale-110 transition-transform">
                      <Car className="w-7 h-7 text-black" />
                    </div>
                    <span className="mt-1.5 text-xs font-black text-white">Valet Garage</span>
                  </button>

                  <button onClick={() => openApp('realestate')} className="flex flex-col items-center group">
                    <div className="w-15 h-15 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.5)] group-hover:scale-110 transition-transform">
                      <Home className="w-7 h-7 text-white" />
                    </div>
                    <span className="mt-1.5 text-xs font-black text-white">Properties</span>
                  </button>

                  <button onClick={() => openApp('radio')} className="flex flex-col items-center group">
                    <div className="w-15 h-15 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-400 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform">
                      <Radio className="w-7 h-7 text-white" />
                    </div>
                    <span className="mt-1.5 text-xs font-black text-white">Radio Player</span>
                  </button>

                  <button onClick={() => openApp('weather')} className="flex flex-col items-center group">
                    <div className="w-15 h-15 rounded-2xl bg-gradient-to-tr from-blue-500 to-sky-300 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.5)] group-hover:scale-110 transition-transform">
                      <CloudSun className="w-7 h-7 text-black" />
                    </div>
                    <span className="mt-1.5 text-xs font-black text-white">Atmosphere</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveScreen('wardrobe');
                      togglePhone();
                    }}
                    className="flex flex-col items-center group"
                  >
                    <div className="w-15 h-15 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.5)] group-hover:scale-110 transition-transform">
                      <Shirt className="w-7 h-7 text-white" />
                    </div>
                    <span className="mt-1.5 text-xs font-black text-white">Wardrobe</span>
                  </button>

                  <button onClick={() => openApp('settings')} className="flex flex-col items-center group">
                    <div className="w-15 h-15 rounded-2xl bg-gradient-to-tr from-slate-600 to-gray-400 flex items-center justify-center shadow-[0_0_15px_rgba(148,163,184,0.4)] group-hover:scale-110 transition-transform">
                      <Settings className="w-7 h-7 text-white" />
                    </div>
                    <span className="mt-1.5 text-xs font-black text-white">Settings</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================
                BANK APP
            ======================================================== */}
            {activeApp === 'bank' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-900 border-2 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                  <div className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider">SAVINGS ACCOUNT</div>
                  <div className="text-3xl font-display font-black mt-1 text-white">${player.bank.toLocaleString()}</div>
                  <div className="text-xs text-emerald-200 mt-2 font-bold">Cash in Wallet: ${player.cash.toLocaleString()}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/20 space-y-3">
                  <span className="text-xs font-extrabold text-white">Quick Transfer</span>
                  <div className="flex gap-2">
                    {['1000', '5000', '20000'].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setTransferAmount(amt)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-black border transition-all ${
                          transferAmount === amt
                            ? 'bg-emerald-400 text-black border-emerald-300 shadow-md'
                            : 'bg-slate-800 text-white border-slate-700 hover:border-emerald-400'
                        }`}
                      >
                        ${parseInt(amt).toLocaleString()}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => transferToBank(parseInt(transferAmount) || 0)}
                      className="py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(16,185,129,0.6)] transition-all"
                    >
                      <ArrowUpRight className="w-4 h-4" /> Deposit
                    </button>
                    <button
                      onClick={() => transferToCash(parseInt(transferAmount) || 0)}
                      className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black flex items-center justify-center gap-1 border border-slate-600 transition-all"
                    >
                      <ArrowDownLeft className="w-4 h-4" /> Withdraw
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
                JOB CENTER APP
            ======================================================== */}
            {activeApp === 'jobs' && (
              <div className="space-y-3">
                {activeMission && (
                  <div className="p-3.5 rounded-2xl bg-pink-950 border-2 border-pink-400 text-xs shadow-lg">
                    <div className="font-black text-pink-300 mb-1">Active Contract In Progress:</div>
                    <div className="text-white font-bold">{activeMission.title}</div>
                    <button
                      onClick={cancelMission}
                      className="mt-2.5 w-full py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black"
                    >
                      Cancel Mission
                    </button>
                  </div>
                )}

                {JOBS.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-2xl bg-slate-900/95 border border-white/20 hover:border-amber-400 transition-all shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-black text-sm text-white">{job.title}</h4>
                        <span className="text-[10px] text-amber-300 font-extrabold uppercase">{job.type}</span>
                      </div>
                      <span className="text-emerald-400 font-display font-black text-base drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]">
                        +${job.baseReward.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-200 mt-2 leading-relaxed">{job.description}</p>
                    <button
                      onClick={() => startJob(job.id)}
                      className="mt-3 w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                    >
                      <Navigation className="w-4 h-4" /> Accept Contract
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ========================================================
                VALET GARAGE APP
            ======================================================== */}
            {activeApp === 'garage' && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-200">Order your owned vehicle to your current location:</span>
                {Object.keys(player.ownedVehicles).map((defId) => {
                  const def = VEHICLES[defId];
                  if (!def) return null;
                  const isCurrent = player.activeVehicleId === defId;

                  return (
                    <div
                      key={defId}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        isCurrent
                          ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                          : 'bg-slate-900 border-white/20'
                      }`}
                    >
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-black text-sm text-white">{def.name}</h4>
                        <span className="text-[10px] font-black uppercase text-cyan-300">{def.category}</span>
                      </div>
                      <div className="text-xs text-gray-300 mt-1 font-semibold">Top Speed: {def.topSpeed} km/h</div>
                      <button
                        disabled={isCurrent}
                        onClick={() => setActiveVehicle(defId)}
                        className={`mt-3 w-full py-2.5 rounded-xl text-xs font-black ${
                          isCurrent
                            ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400 cursor-default'
                            : 'bg-cyan-400 hover:bg-cyan-300 text-black shadow-[0_0_15px_rgba(0,240,255,0.6)]'
                        }`}
                      >
                        {isCurrent ? 'Currently Active' : 'Deliver Valet'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ========================================================
                REAL ESTATE APP
            ======================================================== */}
            {activeApp === 'realestate' && (
              <div className="space-y-3">
                {PROPERTIES.map((prop) => {
                  const isOwned = player.ownedProperties.includes(prop.id);

                  return (
                    <div
                      key={prop.id}
                      className="p-4 rounded-2xl bg-slate-900 border border-white/20 space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-black text-sm text-white">{prop.name}</h4>
                          <span className="text-[10px] uppercase font-black text-rose-300">{prop.type}</span>
                        </div>
                        <span className="text-emerald-400 font-black text-sm">
                          {isOwned ? 'OWNED' : `$${prop.price.toLocaleString()}`}
                        </span>
                      </div>
                      <p className="text-xs text-gray-200 leading-relaxed">{prop.description}</p>
                      <div className="text-xs text-amber-300 font-bold">
                        Daily Passive Rent: +${prop.dailyIncome}/day
                      </div>
                      {!isOwned ? (
                        <button
                          onClick={() => purchaseProperty(prop.id)}
                          className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs shadow-md"
                        >
                          Purchase Property
                        </button>
                      ) : (
                        <div className="py-2 text-center text-xs text-emerald-300 font-black bg-emerald-950/80 rounded-xl border border-emerald-400/50">
                          Primary Asset
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ========================================================
                RADIO APP
            ======================================================== */}
            {activeApp === 'radio' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-tr from-purple-950 to-indigo-900 border-2 border-purple-400 text-center shadow-lg">
                  <div className="text-xs uppercase font-black text-purple-300">CURRENT STATION</div>
                  <div className="text-xl font-display font-black text-white mt-1">{radioStation}</div>
                  <div className="mt-3 flex justify-center">
                    <button
                      onClick={() => setRadio(radioStation, !radioPlaying)}
                      className="px-6 py-2.5 rounded-full bg-purple-500 hover:bg-purple-400 text-white font-black text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.7)]"
                    >
                      {radioPlaying ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                      {radioPlaying ? 'Stop Audio' : 'Play Live'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="text-xs font-black text-white">Available Frequencies:</span>
                  {['Night Drive FM', 'Cyberpunk Pulse', 'Sunset Lofi', 'Off'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setRadio(st, st !== 'Off')}
                      className={`w-full p-3.5 rounded-xl text-left text-xs font-black border transition-all ${
                        radioStation === st
                          ? 'bg-purple-900 border-purple-300 text-white shadow-md'
                          : 'bg-slate-900 border-slate-700 text-gray-300 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================
                ATMOSPHERE & WEATHER APP
            ======================================================== */}
            {activeApp === 'weather' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-white/20 space-y-2.5">
                  <span className="text-xs font-black text-white">Set City Weather</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(['clear', 'rain', 'sunset', 'night'] as const).map((w) => (
                      <button
                        key={w}
                        onClick={() => setWeather(w)}
                        className={`py-2.5 rounded-xl text-xs font-black capitalize border ${
                          weather === w
                            ? 'bg-cyan-500 text-black border-cyan-300 shadow-md'
                            : 'bg-slate-800 text-white border-slate-700'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-white/20 space-y-2.5">
                  <span className="text-xs font-black text-white">Fast Time Jump</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Sunrise (06:00)', time: 6.0 },
                      { label: 'Midday (12:00)', time: 12.0 },
                      { label: 'Sunset (18:00)', time: 18.0 },
                      { label: 'Midnight (00:00)', time: 0.0 }
                    ].map((t) => (
                      <button
                        key={t.label}
                        onClick={() => setTimeOfDay(t.time)}
                        className="py-2.5 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-700 text-white border border-slate-600"
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
                SETTINGS APP
            ======================================================== */}
            {activeApp === 'settings' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-900 border border-white/20 space-y-2.5">
                  <span className="font-black text-white">Graphics Quality Preset</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(['low', 'medium', 'high', 'ultra'] as const).map((q) => (
                      <button
                        key={q}
                        onClick={() => updateSettings({ graphicsQuality: q })}
                        className={`py-2.5 rounded-xl font-black uppercase border ${
                          settings.graphicsQuality === q
                            ? 'bg-cyan-400 text-black border-cyan-300 shadow-md'
                            : 'bg-slate-800 text-white border-slate-700'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-white/20 space-y-2.5">
                  <span className="font-black text-white">Speedometer Units</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(['kmh', 'mph'] as const).map((u) => (
                      <button
                        key={u}
                        onClick={() => updateSettings({ speedUnit: u })}
                        className={`py-2.5 rounded-xl font-black uppercase border ${
                          settings.speedUnit === u
                            ? 'bg-cyan-400 text-black border-cyan-300 shadow-md'
                            : 'bg-slate-800 text-white border-slate-700'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Gesture Bar */}
          <div className="h-9 flex items-center justify-center">
            <button
              onClick={() => openApp('home')}
              className="w-32 h-2 rounded-full bg-cyan-400/80 hover:bg-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.8)] transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
