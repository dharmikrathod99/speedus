import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Play, Car, Wrench } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain select-none bg-gradient-to-r from-slate-950/95 via-slate-900/85 to-transparent flex flex-col justify-start sm:justify-center p-3 sm:p-6 md:p-10 lg:p-16">
      <div className="w-full flex items-center justify-start lg:justify-between my-auto py-1 sm:py-2">
        {/* Left Menu Column */}
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-xl space-y-2 sm:space-y-3 lg:space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
          <div>
            <span className="text-[9px] xs:text-[10px] sm:text-xs font-black tracking-[0.2em] sm:tracking-[0.35em] uppercase text-cyan-300 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)] block">
              NEXT-GENERATION OPEN WORLD SIMULATOR
            </span>
            <h1 className="font-display font-black tracking-wider leading-none text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-pink-500 drop-shadow-[0_0_25px_rgba(0,240,255,0.7)] whitespace-nowrap text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl my-0.5 sm:my-1 lg:my-2">
              SPEEDUS
            </h1>
            <p className="font-racing font-bold tracking-[0.15em] sm:tracking-[0.25em] md:tracking-[0.3em] text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-xl text-white">
              DRIVE. EARN. EXPLORE. LIVE.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-1.5 sm:space-y-2.5 lg:space-y-4 w-full max-w-xs sm:max-w-sm md:max-w-md">
            <button
              onClick={handleStart}
              className="w-full py-2 sm:py-3 lg:py-4 px-3.5 sm:px-5 lg:px-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-display font-black text-xs sm:text-sm md:text-base lg:text-lg tracking-wider flex items-center justify-between shadow-[0_0_25px_rgba(0,240,255,0.6)] group transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <span>ENTER METROPOLIS</span>
              <Play className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 fill-black group-hover:translate-x-1.5 transition-transform" />
            </button>

            <button
              onClick={() => {
                handleStart();
                setActiveScreen('dealership');
              }}
              className="w-full py-1.5 sm:py-2.5 lg:py-3.5 px-3.5 sm:px-5 lg:px-6 rounded-xl sm:rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-black text-[11px] sm:text-xs md:text-sm tracking-wide border-2 border-cyan-400/50 hover:border-cyan-300 flex items-center justify-between transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <span>EXOTIC DEALERSHIP</span>
              <Car className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />
            </button>

            <button
              onClick={() => {
                handleStart();
                setActiveScreen('garage');
              }}
              className="w-full py-1.5 sm:py-2.5 lg:py-3.5 px-3.5 sm:px-5 lg:px-6 rounded-xl sm:rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-black text-[11px] sm:text-xs md:text-sm tracking-wide border-2 border-pink-400/50 hover:border-pink-300 flex items-center justify-between transition-all shadow-[0_0_15px_rgba(255,0,127,0.25)] hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <span>CUSTOM TUNING GARAGE</span>
              <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
            </button>
          </div>

          {/* Compact Player Profile Quick Info */}
          <div className="p-2 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl bg-slate-900/95 border border-cyan-400/40 w-full max-w-xs sm:max-w-sm flex items-center justify-between shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <div className="flex flex-col">
              <span className="text-[9px] sm:text-[10px] font-black text-cyan-300 uppercase tracking-wider">Active Profile</span>
              <span className="text-xs sm:text-sm font-black text-white leading-tight truncate max-w-[130px] sm:max-w-[180px]">{player.name}</span>
              <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold text-gray-300 pt-0.5">
                <span className="text-cyan-300">Lvl {player.level}</span>
                <span>•</span>
                <span>{Object.keys(player.ownedVehicles).length} Cars</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-emerald-400 font-display font-black text-xs sm:text-sm md:text-base">${player.cash.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right Column Feature Highlights (Desktop Large Screens) */}
        <div className="hidden lg:flex flex-col gap-4 max-w-sm xl:max-w-md my-auto py-4 animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="p-5 rounded-2xl bg-slate-900/95 border-2 border-cyan-400/40 space-y-2 shadow-[0_0_25px_rgba(0,240,255,0.2)]">
            <span className="text-xs uppercase font-black text-cyan-300 tracking-wider">Dynamic Metropolis</span>
            <h4 className="font-black text-white text-sm xl:text-base">Explorable Living Open World</h4>
            <p className="text-xs text-gray-200 leading-relaxed font-medium">
              Coast down vibrant downtown skyscrapers, drift through ocean boulevards, cruise the suspension bridge, and explore luxury hills.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/95 border-2 border-pink-400/40 space-y-2 shadow-[0_0_25px_rgba(255,0,127,0.2)]">
            <span className="text-xs uppercase font-black text-pink-300 tracking-wider">Life Simulator Economy</span>
            <h4 className="font-black text-white text-sm xl:text-base">Work, Earn & Invest</h4>
            <p className="text-xs text-gray-200 leading-relaxed font-medium">
              Drive taxi passenger fares, race illegal midnight circuits, deliver high-priority courier packages, buy real estate, and earn daily passive rent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
