import React, { useState, useEffect } from 'react';
import { GameScene } from './components/game/GameScene';
import { HudOverlay } from './components/ui/HudOverlay';
import { MainMenu } from './components/ui/MainMenu';
import { useGameStore } from './stores/gameStore';

export const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const collectDailyRent = useGameStore((s) => s.collectDailyRent);

  // Periodic passive real estate rent income every 60 seconds of playtime
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      collectDailyRent();
    }, 60000);
    return () => clearInterval(interval);
  }, [isPlaying, collectDailyRent]);

  return (
    <div className="w-full h-full fixed inset-0 overflow-hidden select-none bg-black">
      {/* 3D Real-time Scene Viewport */}
      <GameScene />

      {/* Main Menu or Active In-Game HUD */}
      {!isPlaying ? (
        <MainMenu onStartGame={() => setIsPlaying(true)} />
      ) : (
        <HudOverlay />
      )}
    </div>
  );
};

export default App;

