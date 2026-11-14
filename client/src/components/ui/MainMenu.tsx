import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Play, Car, Wrench, Sun } from 'lucide-react';
import { soundSystem } from '../../audio/soundSystem';

interface MainMenuProps {
  onStartGame: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const setActiveScreen = useGameStore((s) => s.setActiveScreen);
  const player = useGameStore((s) => s.player);

  const handleStart = () => {
    soundSystem.init();
    soundSystem.resume();
    soundSystem.playUiClick();
    onStartGame();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-start lg:justify-between p-4 sm:p-8 md:p-12 lg:p-16 select-none bg-gradient-to-r from-slate-950/95 via-slate-900/85 to-transparent overflow-y-auto">
      {/* Left Menu Column */}
      <div className="w-full max-w-xl space-y-4 sm:space-y-6 md:space-y-8 my-auto py-4 sm:py-6 animate-in fade-in slide-in-from-left-4 duration-500">
        <div>
          <span className="text-[9px] xs:text-[10px] sm:text-xs font-black tracking-[0.2em] sm:tracking-[0.35em] uppercase text-cyan-300 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)] block">
            NEXT-GENERATION OPEN WORLD SIMULATOR
          </span>
          <h1 className="font-display font-black text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-pink-500 drop-shadow-[0_0_35px_rgba(0,240,255,0.6)] my-1 sm:my-2">
            SPEED US
          </h1>
          <p className="font-racing font-bold tracking-[0.15em] sm:tracking-[0.25em] md:tracking-[0.3em] text-xs sm:text-base md:text-xl text-white">
            DRIVE. EARN. EXPLORE. LIVE.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-2.5 sm:space-y-4 w-full max-w-xs sm:max-w-sm md:max-w-md">
          <button
            onClick={handleStart}
            className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-display font-black text-sm sm:text-base md:text-lg tracking-wider flex items-center justify-between shadow-[0_0_35px_rgba(0,240,255,0.6)] group transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <span>ENTER METROPOLIS</span>
            <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-black group-hover:translate-x-1.5 transition-transform" />
          </button>

          <button
            onClick={() => {
              handleStart();
              setActiveScreen('dealership');
            }}
            className="w-full py-2.5 sm:py-3.5 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-black text-xs sm:text-sm tracking-wide border-2 border-cyan-400/50 hover:border-cyan-300 flex items-center justify-between transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <span>EXOTIC DEALERSHIP</span>
            <Car className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />
          </button>

          <button
            onClick={() => {
              handleStart();
              setActiveScreen('garage');
            }}
            className="w-full py-2.5 sm:py-3.5 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-black text-xs sm:text-sm tracking-wide border-2 border-pink-400/50 hover:border-pink-300 flex items-center justify-between transition-all shadow-[0_0_15px_rgba(255,0,127,0.25)] hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <span>CUSTOM TUNING GARAGE</span>
            <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
          </button>
        </div>

        {/* Player Profile Quick Info */}
        <div className="p-3 sm:p-4 md:p-5 rounded-2xl sm:rounded-3xl bg-slate-900/95 border-2 border-cyan-400/40 w-full max-w-xs sm:max-w-sm space-y-1 sm:space-y-1.5 shadow-[0_0_20px_rgba(0,240,255,0.25)]">
          <div className="text-[10px] sm:text-xs font-black text-cyan-300 uppercase tracking-wider">Active Character Profile</div>
          <div className="text-sm sm:text-base font-black text-white">{player.name}</div>
          <div className="flex flex-wrap gap-2 sm:gap-3 text-[10px] sm:text-xs font-black pt-0.5">
            <span className="text-emerald-400 font-display">${player.cash.toLocaleString()} Cash</span>
            <span className="text-cyan-300">Level {player.level}</span>
            <span className="text-gray-300">{Object.keys(player.ownedVehicles).length} Vehicles</span>
          </div>
        </div>
      </div>

      {/* Right Column Feature Highlights */}
      <div className="hidden lg:flex flex-col gap-5 max-w-md my-auto py-6 animate-in fade-in slide-in-from-right-8 duration-700">
        <div className="p-6 rounded-3xl bg-slate-900/95 border-2 border-cyan-400/40 space-y-2.5 shadow-[0_0_25px_rgba(0,240,255,0.2)]">
          <span className="text-xs uppercase font-black text-cyan-300 tracking-wider">Dynamic Metropolis</span>
          <h4 className="font-black text-white text-base">Explorable Living Open World</h4>
          <p className="text-xs text-gray-200 leading-relaxed font-medium">
            Coast down vibrant downtown skyscrapers, drift through ocean boulevards, cruise the suspension bridge, and explore luxury hills.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/95 border-2 border-pink-400/40 space-y-2.5 shadow-[0_0_25px_rgba(255,0,127,0.2)]">
          <span className="text-xs uppercase font-black text-pink-300 tracking-wider">Life Simulator Economy</span>
          <h4 className="font-black text-white text-base">Work, Earn & Invest</h4>
          <p className="text-xs text-gray-200 leading-relaxed font-medium">
            Drive taxi passenger fares, race illegal midnight circuits, deliver high-priority courier packages, buy real estate, and earn daily passive rent.
          </p>
        </div>
      </div>
    </div>
  );
};
