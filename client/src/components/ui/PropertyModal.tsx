import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { PROPERTIES } from '../../data/worldData';
import { Home, X, Bed, Shirt } from 'lucide-react';

export const PropertyModal: React.FC = () => {
  const activeScreen = useGameStore((s) => s.activeScreen);
  const setActiveScreen = useGameStore((s) => s.setActiveScreen);
  const player = useGameStore((s) => s.player);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const setTimeOfDay = useGameStore((s) => s.setTimeOfDay);
  const showNotification = useGameStore((s) => s.showNotification);

  const home = PROPERTIES.find((p) => p.id === player.activeHomeId) || PROPERTIES[0];

  if (activeScreen !== 'property') return null;

  const handleSleep = () => {
    setTimeOfDay((timeOfDay + 8) % 24);
    showNotification('Rested Well', 'Fast-forwarded 8 hours. Energy restored to 100%.', 'success');
  };

  const jacketColors = ['#0284c7', '#dc2626', '#10b981', '#f59e0b', '#8b5cf6', '#0f172a', '#f8fafc'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900/95 border-2 border-cyan-400 shadow-[0_0_40px_rgba(0,240,255,0.4)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-18 px-8 flex items-center justify-between border-b border-cyan-400/40 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/30 border border-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.6)]">
              <Home className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-black text-white tracking-wide">
                {home.name}
              </h2>
              <span className="text-xs font-black text-cyan-300 tracking-widest uppercase">
                Primary Residence & Safehouse
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveScreen('game')}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors border border-white/20"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8 space-y-6 bg-slate-900/60">
          <p className="text-sm text-gray-200 leading-relaxed font-medium">
            {home.description}
          </p>

          <div className="grid grid-cols-2 gap-5">
            {/* Walk Inside 3D Interior */}
            <div className="col-span-2 p-5 rounded-2xl bg-gradient-to-r from-cyan-900/50 via-slate-900/80 to-purple-900/50 border-2 border-cyan-400 flex items-center justify-between shadow-[0_0_25px_rgba(0,240,255,0.4)]">
              <div>
                <div className="flex items-center gap-2 text-white font-black text-base">
                  <span className="text-xl">🏠</span>
                  <span>Explore 3D Penthouse Interior</span>
                </div>
                <p className="text-xs text-cyan-200 mt-1 font-medium">
                  Walk inside in full 3D! Relax on the sofa, watch the curved OLED TV, grab drinks from the smart fridge, or rest in the master bed. (Shortcut: Press [H] anytime near house)
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveScreen('game');
                  useGameStore.getState().enterHouse('starter-loft');
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-pink-500 hover:from-cyan-300 hover:to-pink-400 text-black font-black text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(0,240,255,0.7)] transition-all shrink-0 cursor-pointer"
              >
                Walk Inside [H]
              </button>
            </div>

            {/* Rest / Sleep Option */}
            <div className="p-6 rounded-2xl bg-slate-950 border-2 border-white/20 space-y-3 shadow-md">
              <div className="flex items-center gap-2.5 text-white font-black text-base">
                <Bed className="w-5 h-5 text-cyan-400" />
                <span>Rest & Sleep</span>
              </div>
              <p className="text-xs text-gray-300 font-medium">
                Sleep for 8 hours to advance the city clock and wake up refreshed.
              </p>
              <button
                onClick={handleSleep}
                className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs shadow-[0_0_15px_rgba(0,240,255,0.6)] transition-all"
              >
                Sleep 8 Hours
              </button>
            </div>

            {/* Wardrobe Styling */}
            <div className="p-6 rounded-2xl bg-slate-950 border-2 border-white/20 space-y-3 shadow-md">
              <div className="flex items-center gap-2.5 text-white font-black text-base">
                <Shirt className="w-5 h-5 text-pink-400" />
                <span>Wardrobe Styling</span>
              </div>
              <p className="text-xs text-gray-300 font-medium">
                Change your player jacket & outfit color:
              </p>
              <div className="flex gap-2.5 pt-1">
                {jacketColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      useGameStore.setState((s) => ({
                        player: {
                          ...s.player,
                          appearance: { ...s.player.appearance, jacketColor: color }
                        }
                      }));
                      showNotification('Wardrobe Updated', 'Outfit color applied.', 'info');
                    }}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      player.appearance.jacketColor === color
                        ? 'scale-115 border-white shadow-[0_0_10px_rgba(255,255,255,0.9)]'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
