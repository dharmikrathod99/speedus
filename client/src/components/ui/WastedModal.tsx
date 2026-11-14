import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';

export const WastedModal: React.FC = () => {
  const isWasted = useGameStore((s) => s.isWasted);
  const damageFlash = useGameStore((s) => s.damageFlash);
  const [countdown, setCountdown] = useState<number>(3);

  useEffect(() => {
    if (!isWasted) {
      setCountdown(3);
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isWasted]);

  return (
    <>
      {/* Red Hurt / Damage Flash Vignette when taking damage */}
      {damageFlash && !isWasted && (
        <div className="fixed inset-0 z-40 pointer-events-none transition-opacity duration-150 bg-gradient-to-r from-red-600/40 via-transparent to-red-600/40 border-[8px] border-red-500/80 shadow-[inset_0_0_80px_rgba(239,68,68,0.7)] animate-in fade-in" />
      )}

      {/* Iconic GTA V "WASTED" Screen */}
      {isWasted && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-700">
          {/* Blood Splatter Darkened Vignette */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-red-950/80 via-black/40 to-red-950/80 shadow-[inset_0_0_120px_rgba(185,28,28,0.9)]" />

          {/* Wasted Title Container */}
          <div className="relative z-10 flex flex-col items-center text-center px-4 animate-in zoom-in-95 duration-500">
            <h1
              className="text-7xl md:text-9xl font-display font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-red-500 via-rose-600 to-red-900 drop-shadow-[0_10px_35px_rgba(239,68,68,0.9)]"
              style={{
                fontFamily: "'Pricedown', 'Impact', 'Arial Black', sans-serif",
                letterSpacing: '0.15em',
                WebkitTextStroke: '2px rgba(255,255,255,0.2)'
              }}
            >
              WASTED
            </h1>

            <div className="h-1 w-48 md:w-80 bg-gradient-to-r from-transparent via-red-500 to-transparent my-4" />

            <p className="text-sm md:text-lg font-bold text-gray-300 max-w-md drop-shadow-md">
              You were knocked out in combat. Emergency medics are en route.
            </p>

            <div className="mt-4 px-5 py-2 rounded-2xl bg-slate-900/90 border border-red-500/50 shadow-xl flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs md:text-sm font-black text-red-300 uppercase tracking-wider">
                Admitting to St. Jude Hospital in {countdown}s...
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

