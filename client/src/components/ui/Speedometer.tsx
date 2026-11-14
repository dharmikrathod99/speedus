import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Flame, Lightbulb, AlertTriangle } from 'lucide-react';

export const Speedometer: React.FC = () => {
  const mode = useGameStore((s) => s.mode);
  const speed = useGameStore((s) => s.vehicleSpeed);
  const rpm = useGameStore((s) => s.vehicleRpm);
  const gear = useGameStore((s) => s.vehicleGear);
  const nitro = useGameStore((s) => s.vehicleNitro);
  const fuel = useGameStore((s) => s.vehicleFuel);
  const headlightsOn = useGameStore((s) => s.headlightsOn);
  const hazardsOn = useGameStore((s) => s.hazardsOn);
  const isBraking = useGameStore((s) => s.isBraking);
  const isDrifting = useGameStore((s) => s.isDrifting);
  const speedUnit = useGameStore((s) => s.settings.speedUnit);

  if (mode !== 'driving') return null;

  const displaySpeed = speedUnit === 'mph' ? Math.round(speed * 0.621371) : speed;
  const isRedline = rpm > 7400;

  return (
    <>
      {/* ========================================================
          DESKTOP / TABLET FULL TACHOMETER (Bottom-Right)
      ======================================================== */}
      <div className="hidden sm:block fixed bottom-6 right-8 z-20 select-none pointer-events-none scale-90 md:scale-100 origin-bottom-right">
        <div className="relative w-80 p-5 rounded-3xl bg-slate-900/95 border-2 border-cyan-400/60 shadow-[0_0_30px_rgba(0,240,255,0.3)] overflow-hidden backdrop-blur-xl">
          {/* Ambient Glow */}
          <div
            className={`absolute inset-0 transition-opacity duration-150 pointer-events-none ${
              isRedline
                ? 'bg-red-500/20 animate-pulse'
                : isDrifting
                ? 'bg-pink-500/20'
                : 'bg-cyan-500/10'
            }`}
          />

          {/* Top Indicators */}
          <div className="flex items-center justify-between mb-2 px-2 text-xs">
            <div className="flex items-center gap-3">
              <Lightbulb
                className={`w-5 h-5 transition-colors ${
                  headlightsOn ? 'text-cyan-300 drop-shadow-[0_0_10px_rgba(0,240,255,0.9)]' : 'text-gray-500'
                }`}
              />
              <AlertTriangle
                className={`w-5 h-5 transition-colors ${
                  hazardsOn ? 'text-amber-400 animate-pulse drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]' : 'text-gray-500'
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              {isBraking && (
                <span className="px-2.5 py-0.5 rounded text-[11px] font-black bg-red-500/40 text-red-300 border border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.7)] animate-pulse">
                  BRAKE
                </span>
              )}
              {isDrifting && (
                <span className="px-2.5 py-0.5 rounded text-[11px] font-black bg-pink-500/40 text-pink-300 border border-pink-400 shadow-[0_0_10px_rgba(255,0,127,0.7)] animate-pulse">
                  DRIFT
                </span>
              )}
            </div>
          </div>

          {/* Speed & Gear */}
          <div className="flex items-baseline justify-between px-2 my-1">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-6xl tracking-tighter text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.6)]">
                {displaySpeed}
              </span>
              <span className="font-racing font-bold text-base tracking-wider text-cyan-300 uppercase">
                {speedUnit}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase font-black text-cyan-300 tracking-wider">GEAR</span>
              <div
                className={`w-13 h-13 rounded-2xl flex items-center justify-center font-display font-black text-2xl border-2 px-3 py-1 shadow-lg ${
                  gear === 'R'
                    ? 'bg-amber-500/30 text-amber-300 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                    : isRedline
                    ? 'bg-red-500/30 text-red-300 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse'
                    : 'bg-cyan-500/30 text-cyan-200 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.5)]'
                }`}
              >
                {gear}
              </div>
            </div>
          </div>

          {/* RPM Tachometer */}
          <div className="mt-3 px-1">
            <div className="flex justify-between text-[11px] font-black text-gray-300 mb-1">
              <span className="text-cyan-300">RPM</span>
              <span className={isRedline ? 'text-red-400 font-black animate-pulse' : 'text-gray-200'}>
                {rpm.toLocaleString()} / 8,500
              </span>
            </div>
            <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-cyan-400/40">
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  isRedline
                    ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-red-600 animate-pulse'
                    : 'bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, ((rpm - 800) / (8500 - 800)) * 100))}%` }}
              />
            </div>
          </div>

          {/* Nitro & Fuel Horizontal Gauges */}
          <div className="grid grid-cols-2 gap-4 mt-4 px-1">
            {/* Nitro */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-black text-gray-300 mb-1">
                <span className="text-pink-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-pink-400" /> NITRO
                </span>
                <span>{Math.round(nitro)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-pink-400/40">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all"
                  style={{ width: `${Math.max(4, Math.min(100, nitro))}%` }}
                />
              </div>
            </div>

            {/* Fuel */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-black text-gray-300 mb-1">
                <span className="text-amber-400">FUEL</span>
                <span>{Math.round(fuel)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-amber-400/40">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all"
                  style={{ width: `${Math.max(4, Math.min(100, fuel))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
