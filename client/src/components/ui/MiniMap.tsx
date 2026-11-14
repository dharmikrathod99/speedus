import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useIsMobile } from '../../hooks/useIsMobile';
import { POINTS_OF_INTEREST } from '../../data/worldData';
import { CITY_SHOPS } from '../../data/shopsData';
import { vehiclePhysics, playerPhysics } from '../../stores/vehiclePhysics';
import {
  LocateFixed,
  MapPin,
  Wrench,
  Fuel,
  Car,
  Home,
  Flag,
  ChevronRight,
  ChevronLeft,
  Compass
} from 'lucide-react';

export const MiniMap: React.FC = () => {
  const mode = useGameStore((s) => s.mode);
  const isMobile = useIsMobile();
  const player = useGameStore((s) => s.player);
  const activeMission = useGameStore((s) => s.activeMission);
  const customWaypoint = useGameStore((s) => s.customWaypoint);
  const setActiveScreen = useGameStore((s) => s.setActiveScreen);

  // Mobile Slide Drawer state (closed by default on mobile so screen is spacious and clear)
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Touch swipe gesture refs
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Live 60 FPS physics position & heading state
  const [pos, setPos] = useState<{ x: number; z: number; heading: number }>({ x: 0, z: 0, heading: 0 });

  // 20 FPS throttled requestAnimationFrame loop reading raw physics states directly (Saves mobile CPU)
  useEffect(() => {
    let animId: number;
    let lastTime = 0;
    const updateLoop = (now: number) => {
      animId = requestAnimationFrame(updateLoop);
      if (now - lastTime < 50) return; // 20 FPS UI refresh rate
      lastTime = now;

      const isDriving = useGameStore.getState().mode === 'driving';
      const curX = isDriving ? vehiclePhysics.pos.x : playerPhysics.pos.x;
      const curZ = isDriving ? vehiclePhysics.pos.z : playerPhysics.pos.z;
      const curHeading = isDriving ? vehiclePhysics.heading : playerPhysics.rotationY;

      setPos({ x: curX, z: curZ, heading: curHeading });
    };

    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const scale = 0.92;

  // Real 70m road grid matching ChunkManager world chunks
  const cityRoadCoords = [-280, -210, -140, -70, 0, 70, 140, 210, 280];

  const missionDist = activeMission
    ? Math.round(Math.hypot(pos.x - activeMission.targetPosition[0], pos.z - activeMission.targetPosition[2]))
    : null;

  const waypointDist = customWaypoint
    ? Math.round(Math.hypot(pos.x - customWaypoint[0], pos.z - customWaypoint[2]))
    : null;

  // Touch Swipe Handlers for Mobile (Swipe Left-to-Right to open, Right-to-Left to hide)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - (touchStartY.current || 0);

    // Only respond to predominantly horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 25) {
      if (deltaX > 25) {
        // Swiped Left to Right: Slide OUT small map
        setIsMobileOpen(true);
      } else if (deltaX < -25) {
        // Swiped Right to Left: Slide back to HIDE map
        setIsMobileOpen(false);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Pre-rendered high-performance vector road network
  const roadGridSvg = React.useMemo(
    () => (
      <svg
        className="overflow-visible pointer-events-none"
        width="600"
        height="600"
        viewBox="-300 -300 600 600"
        style={{ width: '600px', height: '600px', position: 'absolute', left: '-300px', top: '-300px' }}
      >
        {/* Deep Ocean Water (West of X = -140) */}
        <rect
          x={-550 * scale}
          y={-400 * scale}
          width={(550 - 140) * scale}
          height={800 * scale}
          fill="#07365c"
          opacity="0.85"
        />

        {/* Coastal Beach Sand Strip (X = -140 to -115) */}
        <rect
          x={-140 * scale}
          y={-400 * scale}
          width={25 * scale}
          height={800 * scale}
          fill="#d97706"
          opacity="0.3"
        />

        {/* Urban City Blocks */}
        {cityRoadCoords.slice(0, -1).map((rx) =>
          cityRoadCoords.slice(0, -1).map((rz) => (
            <rect
              key={`blk_${rx}_${rz}`}
              x={(rx + 9) * scale}
              y={(rz + 9) * scale}
              width={52 * scale}
              height={52 * scale}
              fill="#16202c"
              stroke="#0f172a"
              strokeWidth="1.5"
              rx="4"
            />
          ))
        )}

        {/* East-West Highway / Avenues */}
        {cityRoadCoords.map((rz) => (
          <g key={`ew_${rz}`}>
            <line
              x1={-140 * scale}
              y1={rz * scale}
              x2={280 * scale}
              y2={rz * scale}
              stroke="#334155"
              strokeWidth="13"
              strokeLinecap="round"
            />
            <line
              x1={-140 * scale}
              y1={rz * scale}
              x2={280 * scale}
              y2={rz * scale}
              stroke="#0f172a"
              strokeWidth="11"
              strokeLinecap="round"
            />
            {/* Dashed center lane divider */}
            <line
              x1={-140 * scale}
              y1={rz * scale}
              x2={280 * scale}
              y2={rz * scale}
              stroke="#facc15"
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.75"
            />
          </g>
        ))}

        {/* North-South Highways / Boulevards */}
        {cityRoadCoords.map((rx) => (
          <g key={`ns_${rx}`}>
            <line
              x1={rx * scale}
              y1={-280 * scale}
              x2={rx * scale}
              y2={280 * scale}
              stroke="#334155"
              strokeWidth="13"
              strokeLinecap="round"
            />
            <line
              x1={rx * scale}
              y1={-280 * scale}
              x2={rx * scale}
              y2={280 * scale}
              stroke="#0f172a"
              strokeWidth="11"
              strokeLinecap="round"
            />
            {/* Dashed center lane divider */}
            <line
              x1={rx * scale}
              y1={-280 * scale}
              x2={rx * scale}
              y2={280 * scale}
              stroke="#facc15"
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.75"
            />
          </g>
        ))}
      </svg>
    ),
    [scale]
  );

  // Common Radar Core Visualizer
  const renderRadarContent = (w: number, h: number) => {
    const rHalfW = w / 2;
    const rHalfH = h / 2;
    const rMaxDist = Math.min(rHalfW, rHalfH) * 1.35;

    return (
      <div
        onClick={() => setActiveScreen('map')}
        title="Click to Open Full GPS Map (or press [M])"
        className="relative rounded-xl bg-[#0c131c]/95 border-2 border-black/80 shadow-[0_12px_35px_rgba(0,0,0,0.85)] overflow-hidden cursor-pointer group transition-all"
        style={{
          width: `${w}px`,
          height: `${h}px`,
          boxShadow: '0 8px 30px rgba(0,0,0,0.85), inset 0 0 0 1px rgba(255,255,255,0.15)'
        }}
      >
        {/* Subtle Scanline / Radar Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-30">
          <div className="w-full h-full border border-white/10" />
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10" />
          <div className="absolute top-0 left-1/2 h-full w-[1px] bg-white/10" />
        </div>

        {/* DYNAMIC ROTATING WORLD CONTAINER (Centered on Player) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `rotate(${pos.heading * (180 / Math.PI) - 180}deg)`,
            transformOrigin: '50% 50%'
          }}
        >
          {/* World Road Network Layer */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              transform: `translate(${-pos.x * scale}px, ${-pos.z * scale}px)`
            }}
          >
            {roadGridSvg}
          </div>

          {/* GPS Route Dash-line to Custom Waypoint */}
          {customWaypoint && (
            <svg
              className="absolute left-1/2 top-1/2 overflow-visible"
              style={{
                transform: `translate(${-pos.x * scale}px, ${-pos.z * scale}px)`
              }}
            >
              <line
                x1={pos.x * scale}
                y1={pos.z * scale}
                x2={customWaypoint[0] * scale}
                y2={customWaypoint[2] * scale}
                stroke="#c084fc"
                strokeWidth="3.5"
                strokeDasharray="6,4"
                opacity="0.9"
              />
            </svg>
          )}

          {/* Authentic GTA V POI Blips */}
          {POINTS_OF_INTEREST.map((poi) => {
            const dx = (poi.position[0] - pos.x) * scale;
            const dz = (poi.position[2] - pos.z) * scale;
            const dist = Math.hypot(dx, dz);
            if (dist > rMaxDist) return null;

            let bgColor = '#06b6d4';
            let icon = <Car className="w-2.5 h-2.5 text-white stroke-[2.5]" />;

            if (poi.type === 'home') {
              bgColor = '#16a34a'; // Safehouse Green
              icon = <Home className="w-2.5 h-2.5 text-white stroke-[2.5]" />;
            } else if (poi.type === 'garage') {
              bgColor = '#ec4899'; // Mod Shop Pink
              icon = <Wrench className="w-2.5 h-2.5 text-white stroke-[2.5]" />;
            } else if (poi.type === 'gas_station') {
              bgColor = '#f59e0b'; // Fuel Amber
              icon = <Fuel className="w-2.5 h-2.5 text-white stroke-[2.5]" />;
            } else if (poi.type === 'job') {
              bgColor = '#eab308'; // Mission Yellow
              icon = <Flag className="w-2.5 h-2.5 text-black stroke-[3]" />;
            } else if (poi.type === 'stunt') {
              bgColor = '#ea580c'; // Stunt Orange
              icon = <span className="text-[8px] font-black leading-none text-white select-none">🚀</span>;
            }

            return (
              <div
                key={poi.id}
                className="absolute w-4 h-4 rounded-full flex items-center justify-center border border-black/80 shadow-md"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dz}px))`,
                  backgroundColor: bgColor
                }}
              >
                {icon}
              </div>
            );
          })}

          {/* Authentic Real-Life Commercial City Shops Blips */}
          {CITY_SHOPS.map((shop) => {
            const dx = (shop.position[0] - pos.x) * scale;
            const dz = (shop.position[2] - pos.z) * scale;
            const dist = Math.hypot(dx, dz);
            if (dist > rMaxDist) return null;

            return (
              <div
                key={shop.id}
                className="absolute w-3.5 h-3.5 rounded-full flex items-center justify-center border border-black/80 shadow-md"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dz}px))`,
                  backgroundColor: shop.accentColor
                }}
                title={shop.name}
              >
                <div className="w-1 h-1 rounded-full bg-white" />
              </div>
            );
          })}

          {/* Custom Pinned Waypoint Marker */}
          {customWaypoint && (
            (() => {
              const dx = (customWaypoint[0] - pos.x) * scale;
              const dz = (customWaypoint[2] - pos.z) * scale;
              const dist = Math.hypot(dx, dz);
              const clampedDist = Math.min(rMaxDist - 8, dist);
              const angle = Math.atan2(dz, dx);
              const cx = Math.cos(angle) * clampedDist;
              const cz = Math.sin(angle) * clampedDist;

              return (
                <div
                  className="absolute w-4.5 h-4.5 rounded-full bg-purple-600 border-2 border-white shadow-[0_0_12px_rgba(168,85,247,1)] flex items-center justify-center animate-pulse z-20"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${cx}px), calc(-50% + ${cz}px))`
                  }}
                >
                  <span className="text-[9px] font-black text-white leading-none">📍</span>
                </div>
              );
            })()
          )}

          {/* Active Mission Destination Marker */}
          {activeMission && (
            (() => {
              const dx = (activeMission.targetPosition[0] - pos.x) * scale;
              const dz = (activeMission.targetPosition[2] - pos.z) * scale;
              const dist = Math.hypot(dx, dz);
              const clampedDist = Math.min(rMaxDist - 8, dist);
              const angle = Math.atan2(dz, dx);
              const cx = Math.cos(angle) * clampedDist;
              const cz = Math.sin(angle) * clampedDist;

              return (
                <div
                  className="absolute w-4.5 h-4.5 rounded-full bg-yellow-400 border-2 border-black flex items-center justify-center animate-ping z-20"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${cx}px), calc(-50% + ${cz}px))`
                  }}
                />
              );
            })()
          )}
        </div>

        {/* Stationary Center Player Blip (Iconic GTA V White Chevron) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <svg width="22" height="22" viewBox="-11 -11 22 22" className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            <polygon points="0,-9 6.5,7.5 0,4.2 -6.5,7.5" fill="#ffffff" stroke="#000000" strokeWidth="2.0" strokeLinejoin="miter" />
          </svg>
        </div>

        {/* Cardinal North Compass Marker */}
        <div
          className="absolute text-[10px] font-black text-cyan-300 drop-shadow-[0_0_4px_rgba(0,0,0,1)] pointer-events-none z-20"
          style={{
            left: `calc(50% - ${Math.sin(pos.heading) * (rHalfW - 12)}px)`,
            top: `calc(50% + ${Math.cos(pos.heading) * (rHalfH - 10)}px)`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          N
        </div>

        {/* Hover Click Map Overlay Prompt */}
        <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[11px] font-black text-cyan-300 tracking-wider z-30">
          FULL MAP [M]
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ========================================================
          MOBILE COLLAPSIBLE SLIDE-OUT DRAWER
          - Docked on the left edge with an arrow pull-tab
          - Swipe Left-to-Right (or tap arrow) to slide small map OUT
          - Swipe Right-to-Left (or tap arrow) to HIDE map
      ======================================================== */}
      {isMobile ? (
        <div
          className="fixed top-14 sm:top-16 left-0 z-40 select-none transition-transform duration-300 ease-out flex items-start pointer-events-auto"
          style={{
            transform: isMobileOpen ? 'translateX(0)' : 'translateX(-192px)',
            touchAction: 'none'
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Small Screen-Proportional MiniMap Box (192px Wide) */}
          <div className="w-[192px] bg-slate-950/95 backdrop-blur-xl border-y-2 border-r-2 border-cyan-400/80 rounded-r-2xl p-2 shadow-[0_8px_30px_rgba(0,0,0,0.9),0_0_20px_rgba(0,240,255,0.35)] flex flex-col items-start gap-1">
            {/* Header Bar */}
            <div className="w-full flex items-center justify-between pb-1 border-b border-white/15 text-[10px] font-black uppercase text-cyan-300">
              <span className="flex items-center gap-1">
                <Compass className="w-3 h-3 text-cyan-400" />
                <span>RADAR GPS</span>
              </span>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="text-gray-400 hover:text-white p-0.5 active:scale-90"
                title="Hide Map (Swipe Left)"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            </div>

            {/* Compact 176x115 Radar View */}
            {renderRadarContent(176, 115)}

            {/* Compact 3-Tier Status Bars (Underneath Radar) */}
            <div className="w-[176px] flex items-center gap-1 px-0.5 mt-0.5">
              <div className="flex-1 h-1.5 rounded-sm bg-black/80 border border-white/20 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-emerald-500 rounded-sm"
                  style={{ width: `${Math.max(5, Math.min(100, ((player.health || 1000) / (player.maxHealth || 1000)) * 100))}%` }}
                />
              </div>
              <div className="flex-1 h-1.5 rounded-sm bg-black/80 border border-white/20 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-sky-500 rounded-sm"
                  style={{ width: `${Math.max(5, Math.min(100, ((player.armor || 1000) / (player.maxArmor || 1000)) * 100))}%` }}
                />
              </div>
              <div className="flex-1 h-1.5 rounded-sm bg-black/80 border border-white/20 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-amber-400 rounded-sm"
                  style={{ width: `${Math.max(5, player.stamina || 100)}%` }}
                />
              </div>
            </div>

            {/* Waypoint & Mission Badges */}
            <div className="flex flex-col gap-0.5 mt-0.5 w-full">
              {waypointDist !== null && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/90 border border-purple-400/80 text-[8px] font-black text-purple-200 truncate">
                  <LocateFixed className="w-2.5 h-2.5 text-purple-300 shrink-0" />
                  <span className="truncate">{waypointDist}m to Waypoint</span>
                </div>
              )}
              {missionDist !== null && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/90 border border-amber-400/80 text-[8px] font-black text-amber-200 truncate">
                  <MapPin className="w-2.5 h-2.5 text-amber-300 shrink-0" />
                  <span className="truncate">{missionDist}m to Target</span>
                </div>
              )}
            </div>
          </div>

          {/* Left Side Pull-Tab Arrow Dock Handle */}
          <button
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="h-14 sm:h-16 px-1.5 rounded-r-xl bg-slate-950/95 border-r-2 border-y-2 border-cyan-400 text-cyan-300 flex flex-col items-center justify-center shadow-[0_4px_18px_rgba(0,240,255,0.6)] active:scale-95 transition-all cursor-pointer group"
            title={isMobileOpen ? 'Swipe Left or Tap to Hide Map' : 'Swipe Right or Tap to Open Small Map'}
          >
            {isMobileOpen ? (
              <ChevronLeft className="w-5 h-5 text-cyan-300 animate-pulse" />
            ) : (
              <div className="flex flex-col items-center gap-0.5">
                <ChevronRight className="w-5 h-5 text-cyan-300 group-hover:translate-x-0.5 transition-transform animate-pulse" />
                <span className="text-[8px] font-black uppercase text-cyan-400 tracking-tighter" style={{ writingMode: 'vertical-rl' }}>
                  MAP
                </span>
              </div>
            )}
          </button>
        </div>
      ) : (
        /* ========================================================
            DESKTOP / TABLET FULL GTA V BOTTOM-LEFT RADAR HUD
        ======================================================== */
        <div className="fixed bottom-6 left-8 z-20 select-none flex flex-col items-start gap-1 font-sans pointer-events-auto">
          {/* Full 250x165 Radar */}
          {renderRadarContent(250, 165)}

          {/* 3-Tier Status Bars */}
          <div className="w-[250px] flex items-center gap-1.5 px-0.5">
            <div className="flex-1 h-2 rounded-sm bg-black/80 border border-white/20 overflow-hidden shadow-inner">
              <div
                className="h-full bg-emerald-500 rounded-sm transition-all duration-150"
                style={{ width: `${Math.max(5, Math.min(100, ((player.health || 1000) / (player.maxHealth || 1000)) * 100))}%` }}
              />
            </div>
            <div className="flex-1 h-2 rounded-sm bg-black/80 border border-white/20 overflow-hidden shadow-inner">
              <div
                className="h-full bg-sky-500 rounded-sm transition-all duration-150"
                style={{ width: `${Math.max(5, Math.min(100, ((player.armor || 1000) / (player.maxArmor || 1000)) * 100))}%` }}
              />
            </div>
            <div className="flex-1 h-2 rounded-sm bg-black/80 border border-white/20 overflow-hidden shadow-inner">
              <div
                className="h-full bg-amber-400 rounded-sm transition-all duration-150"
                style={{ width: `${Math.max(5, player.stamina || 100)}%` }}
              />
            </div>
          </div>

          {/* Waypoint & Mission Badges */}
          <div className="flex flex-col gap-1 mt-1">
            {waypointDist !== null && (
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-purple-950/90 border border-purple-400/80 text-[11px] font-black text-purple-200 shadow-md">
                <LocateFixed className="w-3 h-3 text-purple-300" />
                <span>{waypointDist}m to Waypoint</span>
              </div>
            )}
            {missionDist !== null && (
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-amber-950/90 border border-amber-400/80 text-[11px] font-black text-amber-200 shadow-md">
                <MapPin className="w-3 h-3 text-amber-300" />
                <span>{missionDist}m to Mission</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};