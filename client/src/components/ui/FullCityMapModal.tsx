import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { POINTS_OF_INTEREST } from '../../data/worldData';
import { CITY_SHOPS } from '../../data/shopsData';
import { vehiclePhysics, playerPhysics } from '../../stores/vehiclePhysics';
import { X, MapPin, LocateFixed, Navigation, Trash2, Home, Wrench, Fuel, Car, Flag, Rocket, Compass, Crosshair } from 'lucide-react';

export const FullCityMapModal: React.FC = () => {
  const activeScreen = useGameStore((s) => s.activeScreen);
  const setActiveScreen = useGameStore((s) => s.setActiveScreen);
  const mode = useGameStore((s) => s.mode);
  const player = useGameStore((s) => s.player);
  const setPlayerPos = useGameStore((s) => s.setPlayerPosition);
  const setVehiclePos = useGameStore((s) => s.setVehiclePosition);
  const activeMission = useGameStore((s) => s.activeMission);
  const customWaypoint = useGameStore((s) => s.customWaypoint);
  const setCustomWaypoint = useGameStore((s) => s.setCustomWaypoint);
  const showNotification = useGameStore((s) => s.showNotification);

  const storePlayerPos = useGameStore((s) => s.playerPosition);
  const storeVehiclePos = useGameStore((s) => s.vehiclePosition);
  const storeVehicleRot = useGameStore((s) => s.vehicleRotation);
  const storePlayerRot = useGameStore((s) => s.playerRotation);

  const [filter, setFilter] = useState<'all' | 'safehouse' | 'services' | 'shops' | 'stunts' | 'jobs'>('all');
  const [selectedPoi, setSelectedPoi] = useState<any | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{ x: number; z: number } | null>(null);

  // Close with [M] or [Escape]
  useEffect(() => {
    if (activeScreen !== 'map') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key.toLowerCase() === 'm' || e.key === 'Escape') {
        setActiveScreen('game');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeScreen, setActiveScreen]);

  if (activeScreen !== 'map') return null;

  // Real-time live player / vehicle position (with store fallback)
  const currentX = mode === 'driving'
    ? (vehiclePhysics.pos.x || storeVehiclePos[0])
    : (playerPhysics.pos.x || storePlayerPos[0]);
  const currentZ = mode === 'driving'
    ? (vehiclePhysics.pos.z || storeVehiclePos[2])
    : (playerPhysics.pos.z || storePlayerPos[2]);
  const currentHeading = mode === 'driving'
    ? (vehiclePhysics.heading || storeVehicleRot[1])
    : (playerPhysics.rotationY || storePlayerRot[1]);

  // Exact GTA V rotation angle for SVG North-Up Map
  // 180 - (heading * 180 / PI)
  const playerHeadingDegrees = 180 - currentHeading * (180 / Math.PI);

  // Map coordinate translation: maps world [-220, 220] to SVG [0, 800]
  const toSvgX = (x: number) => ((x + 220) / 440) * 800;
  const toSvgY = (z: number) => ((z + 220) / 440) * 800;
  const fromSvgX = (svgX: number) => (svgX / 800) * 440 - 220;
  const fromSvgY = (svgY: number) => (svgY / 800) * 440 - 220;

  // Fast Travel handler
  const handleFastTravel = (targetPos: [number, number, number], name: string) => {
    let spawnPlayer: [number, number, number] = [targetPos[0], 0.5, targetPos[2]];
    let spawnVehicle: [number, number, number] = [targetPos[0] + 3, 0.5, targetPos[2] + 3];

    // Perfect runway approach for Stunt Ramps
    if (name.includes('Beachfront Stunt')) {
      spawnPlayer = [-95, 0.5, 30];
      spawnVehicle = [-95, 0.5, 30];
    } else if (name.includes('Urban Stunt')) {
      spawnPlayer = [23, 0.5, 25];
      spawnVehicle = [23, 0.5, 25];
    }

    setPlayerPos(spawnPlayer);
    setVehiclePos(spawnVehicle);
    showNotification('Fast Travel', `Teleported to ${name}! 🚀`, 'info');
    setActiveScreen('game');
  };

  // Set GPS Destination
  const handleSetGps = (targetPos: [number, number, number], name: string) => {
    setCustomWaypoint([targetPos[0], 0, targetPos[2]]);
    showNotification('GPS Destination Set', `Route calculated to ${name}. 📍`, 'info');
  };

  // Click on map canvas to set a custom GPS Waypoint
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const target = e.target as HTMLElement;
    if (target.dataset.isPoi === 'true') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 800;
    const svgY = ((e.clientY - rect.top) / rect.height) * 800;

    const worldX = Math.round(fromSvgX(svgX));
    const worldZ = Math.round(fromSvgY(svgY));

    setCustomWaypoint([worldX, 0, worldZ]);
    setSelectedPoi({
      id: 'custom-waypoint',
      name: 'Custom GPS Waypoint',
      type: 'custom',
      position: [worldX, 0, worldZ],
      description: `Target marked on GPS satellite grid at coordinates X: ${worldX}m, Z: ${worldZ}m. Magenta GPS route beacon is active.`
    });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 800;
    const svgY = ((e.clientY - rect.top) / rect.height) * 800;
    setHoverCoords({
      x: Math.round(fromSvgX(svgX)),
      z: Math.round(fromSvgY(svgY))
    });
  };

  const distToSelected = selectedPoi
    ? Math.round(Math.hypot(currentX - selectedPoi.position[0], currentZ - selectedPoi.position[2]))
    : 0;

  // Combined POIs including City Shops
  const allMapPois = [
    ...POINTS_OF_INTEREST,
    ...CITY_SHOPS.map((s) => ({
      id: s.id,
      name: s.name,
      type: s.type as any,
      position: s.position,
      icon: s.icon,
      description: s.description
    }))
  ];

  // Filtered POI list for the directory
  const filteredPois = allMapPois.filter((poi) => {
    if (filter === 'safehouse') return poi.type === 'home' || poi.type === 'property';
    if (filter === 'services') return ['dealership', 'garage', 'gas_station', 'shop'].includes(poi.type);
    if (filter === 'shops')
      return [
        'vegetable',
        'gym',
        'pharmacy',
        'hospital',
        'school',
        'police',
        'mall',
        'electronics',
        'cafe',
        'restaurant',
        'pizza',
        'burger'
      ].includes(poi.type);
    if (filter === 'stunts') return poi.type === 'stunt';
    if (filter === 'jobs') return poi.type === 'job';
    return true;
  });

  // Roads run along chunk boundaries (CHUNK_SIZE = 70m)
  const cityRoadCoords = [-210, -140, -70, 0, 70, 140, 210];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-3 md:p-6 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl h-[92vh] max-h-[860px] rounded-3xl bg-slate-950 border-2 border-slate-700 shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden">
        
        {/* ========================================================
            AUTHENTIC GTA V PAUSE MENU HEADER
        ======================================================== */}
        <div className="h-16 px-6 md:px-8 flex items-center justify-between border-b border-white/10 bg-black shrink-0">
          {/* Pause Tabs */}
          <div className="flex items-center gap-6 md:gap-8">
            <div className="flex items-center gap-1 text-white font-display font-black text-xl tracking-widest border-b-2 border-white pb-1">
              <span>MAP</span>
            </div>
            <div className="hidden sm:flex items-center gap-6 text-gray-500 font-display font-black text-sm tracking-widest">
              <span className="hover:text-gray-300 cursor-pointer">BRIEF</span>
              <span className="hover:text-gray-300 cursor-pointer">STATS</span>
              <span className="hover:text-gray-300 cursor-pointer">SETTINGS</span>
              <span className="hover:text-gray-300 cursor-pointer">GAME</span>
            </div>
          </div>

          {/* Cash & Exit */}
          <div className="flex items-center gap-4 md:gap-6">
            <div className="text-right">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Available Funds</span>
              <span className="font-display font-black text-lg md:text-xl text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.7)]">
                ${player.cash.toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => setActiveScreen('game')}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
              title="Return to Game [ESC / M]"
            >
              <span>RETURN</span>
              <span className="px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-gray-300 border border-white/10">ESC</span>
            </button>
          </div>
        </div>

        {/* Sub-Header: District & Legend Pills */}
        <div className="h-11 sm:h-12 px-3 sm:px-6 flex items-center justify-between border-b border-white/10 bg-slate-900/90 shrink-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="text-[10px] sm:text-xs font-black text-cyan-400 uppercase tracking-widest mr-1 sm:mr-2 shrink-0">
              FILTER:
            </span>
            {[
              { id: 'all', label: 'All Markers' },
              { id: 'shops', label: 'Shops' },
              { id: 'safehouse', label: 'Safehouses' },
              { id: 'services', label: 'Services' },
              { id: 'stunts', label: 'Stunts' },
              { id: 'jobs', label: 'Missions' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`shrink-0 px-2.5 py-1 sm:px-3 sm:py-1 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  filter === f.id
                    ? 'bg-white text-black font-black shadow-md'
                    : 'bg-slate-800 text-gray-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs font-bold text-gray-400">
            {hoverCoords && (
              <span className="font-mono text-cyan-300">
                X: {hoverCoords.x}m • Z: {hoverCoords.z}m
              </span>
            )}
            <span className="text-gray-500">|</span>
            <span className="text-gray-300">Click Map to set GPS Destination</span>
          </div>
        </div>

        {/* ========================================================
            SPLIT VIEW: MAP CANVAS (LEFT) + POI DIRECTORY (RIGHT)
        ======================================================== */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* MAP CANVAS */}
          <div className="flex-1 relative bg-[#071626] flex items-center justify-center overflow-hidden">
            <svg
              className="w-full h-full cursor-crosshair"
              viewBox="0 0 800 800"
              onClick={handleSvgClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoverCoords(null)}
            >
              {/* Deep Ocean Water (West of X = -140) */}
              <rect x="0" y="0" width={toSvgX(-140)} height="800" fill="#082038" />

              {/* Ocean Bathymetry Waves / Contour Lines */}
              <line x1={toSvgX(-180)} y1="0" x2={toSvgX(-180)} y2="800" stroke="#0e2f52" strokeWidth="2" strokeDasharray="16,12" />
              <line x1={toSvgX(-160)} y1="0" x2={toSvgX(-160)} y2="800" stroke="#0e2f52" strokeWidth="2" strokeDasharray="24,16" />

              {/* Mainland Urban Ground (Asphalt & Terrain) */}
              <rect x={toSvgX(-140)} y="0" width={800 - toSvgX(-140)} height="800" fill="#141e2b" />

              {/* Sandy Coastal Beach Strip (X = [-140, -115]) */}
              <rect
                x={toSvgX(-140)}
                y="0"
                width={toSvgX(-115) - toSvgX(-140)}
                height="800"
                fill="#b8860b"
                opacity="0.3"
              />

              {/* Urban District Blocks */}
              {cityRoadCoords.slice(0, -1).map((rx, xi) => (
                cityRoadCoords.slice(0, -1).map((rz, zi) => (
                  <rect
                    key={`${xi}_${zi}`}
                    x={toSvgX(rx) + 6}
                    y={toSvgY(rz) + 6}
                    width={toSvgX(rx + 70) - toSvgX(rx) - 12}
                    height={toSvgY(rz + 70) - toSvgY(rz) - 12}
                    fill="#1b2838"
                    stroke="#0f172a"
                    strokeWidth="1.5"
                    rx="5"
                  />
                ))
              ))}

              {/* East-West Highway / Avenues (Double Layer Road Lines) */}
              {cityRoadCoords.map((rz) => {
                const y = toSvgY(rz);
                return (
                  <g key={`ew_${rz}`}>
                    {/* Dark Road Base */}
                    <line
                      x1={toSvgX(-140)}
                      y1={y}
                      x2={toSvgX(220)}
                      y2={y}
                      stroke="#334155"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                    {/* Light Road Asphalt */}
                    <line
                      x1={toSvgX(-140)}
                      y1={y}
                      x2={toSvgX(220)}
                      y2={y}
                      stroke="#94a3b8"
                      strokeWidth="9"
                      strokeLinecap="round"
                    />
                    {/* Yellow Center Divider */}
                    <line
                      x1={toSvgX(-140)}
                      y1={y}
                      x2={toSvgX(220)}
                      y2={y}
                      stroke="#eab308"
                      strokeWidth="1.2"
                      strokeDasharray="8,6"
                    />
                  </g>
                );
              })}

              {/* North-South Highway / Avenues */}
              {cityRoadCoords.map((rx) => {
                const x = toSvgX(rx);
                return (
                  <g key={`ns_${rx}`}>
                    {/* Dark Road Base */}
                    <line
                      x1={x}
                      y1={toSvgY(-220)}
                      x2={x}
                      y2={toSvgY(220)}
                      stroke="#334155"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                    {/* Light Road Asphalt */}
                    <line
                      x1={x}
                      y1={toSvgY(-220)}
                      x2={x}
                      y2={toSvgY(220)}
                      stroke="#94a3b8"
                      strokeWidth="9"
                      strokeLinecap="round"
                    />
                    {/* Yellow Center Divider */}
                    <line
                      x1={x}
                      y1={toSvgY(-220)}
                      x2={x}
                      y2={toSvgY(220)}
                      stroke="#eab308"
                      strokeWidth="1.2"
                      strokeDasharray="8,6"
                    />
                  </g>
                );
              })}

              {/* District Watermark Labels */}
              <text x={toSvgX(-170)} y={toSvgY(-100)} fill="#1e3a5f" fontSize="18" fontWeight="900" letterSpacing="4" transform={`rotate(-90 ${toSvgX(-170)} ${toSvgY(-100)})`}>
                PACIFIC OCEAN
              </text>
              <text x={toSvgX(-128)} y={toSvgY(-150)} fill="#d97706" opacity="0.5" fontSize="12" fontWeight="900" letterSpacing="2" transform={`rotate(-90 ${toSvgX(-128)} ${toSvgY(-150)})`}>
                VESPUCCI STRAND
              </text>
              <text x={toSvgX(0)} y={toSvgY(-150)} fill="#475569" opacity="0.6" fontSize="14" fontWeight="900" letterSpacing="3">
                DOWNTOWN METROPOLIS
              </text>
              <text x={toSvgX(80)} y={toSvgY(100)} fill="#475569" opacity="0.6" fontSize="14" fontWeight="900" letterSpacing="3">
                EAST INDUSTRIAL SECTOR
              </text>

              {/* GPS Route Dashed Line to Custom Waypoint (Purple GTA V Waypoint Line) */}
              {customWaypoint && (
                <line
                  x1={toSvgX(currentX)}
                  y1={toSvgY(currentZ)}
                  x2={toSvgX(customWaypoint[0])}
                  y2={toSvgY(customWaypoint[2])}
                  stroke="#c084fc"
                  strokeWidth="4"
                  strokeDasharray="8,6"
                  opacity="0.9"
                  className="animate-pulse"
                />
              )}

              {/* GPS Route Dashed Line to Active Mission (Cyan Route Line) */}
              {activeMission && (
                <line
                  x1={toSvgX(currentX)}
                  y1={toSvgY(currentZ)}
                  x2={toSvgX(activeMission.targetPosition[0])}
                  y2={toSvgY(activeMission.targetPosition[2])}
                  stroke="#00f0ff"
                  strokeWidth="4"
                  strokeDasharray="8,6"
                  opacity="0.9"
                  className="animate-pulse"
                />
              )}

              {/* ====================================================
                  POINTS OF INTEREST BLIPS (GTA V STYLE ICONS)
              ==================================================== */}
              {filteredPois.map((poi) => {
                const px = toSvgX(poi.position[0]);
                const py = toSvgY(poi.position[2]);
                const isSelected = selectedPoi?.id === poi.id;

                let blipColor = '#06b6d4';
                if (poi.type === 'home' || poi.type === 'property') blipColor = '#16a34a'; // Safehouse Green
                else if (poi.type === 'garage') blipColor = '#ec4899'; // Mod Shop Pink
                else if (poi.type === 'gas_station') blipColor = '#f59e0b'; // Fuel Amber
                else if (poi.type === 'stunt') blipColor = '#ea580c'; // Stunt Orange
                else if (poi.type === 'job') blipColor = '#eab308'; // Mission Yellow
                else if (poi.type === 'vegetable') blipColor = '#22c55e'; // Fresh Produce Green
                else if (poi.type === 'gym') blipColor = '#eab308'; // Athletic Yellow
                else if (poi.type === 'pharmacy') blipColor = '#06b6d4'; // Pharmacy Cyan
                else if (poi.type === 'hospital') blipColor = '#ef4444'; // Hospital Red
                else if (poi.type === 'school') blipColor = '#8b5cf6'; // Academy Purple
                else if (poi.type === 'police') blipColor = '#3b82f6'; // Police Blue
                else if (poi.type === 'mall') blipColor = '#f59e0b'; // Galleria Gold
                else if (poi.type === 'electronics') blipColor = '#00f0ff'; // Cyber Cyan
                else if (poi.type === 'cafe') blipColor = '#d97706'; // Coffee Amber
                else if (poi.type === 'pizza') blipColor = '#f97316'; // Pizza Orange
                else if (poi.type === 'restaurant') blipColor = '#ec4899'; // Bistro Pink
                else if (poi.type === 'burger') blipColor = '#fbbf24'; // Diner Yellow

                return (
                  <g
                    key={poi.id}
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPoi(poi);
                    }}
                    data-is-poi="true"
                  >
                    {/* Selected Pulse Ring */}
                    {isSelected && (
                      <circle cx={px} cy={py} r="22" fill={blipColor} opacity="0.3" className="animate-ping" />
                    )}

                    {/* Outer Drop Shadow / Border */}
                    <circle cx={px} cy={py} r="12" fill="#000000" opacity="0.9" />
                    {/* Colored Blip Disc */}
                    <circle
                      cx={px}
                      cy={py}
                      r="10"
                      fill={blipColor}
                      stroke={isSelected ? '#ffffff' : '#000000'}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      className="transition-transform group-hover:scale-110"
                    />

                    {/* POI Label Tooltip on Hover */}
                    <text
                      x={px}
                      y={py - 16}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="900"
                      className="pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {poi.name}
                    </text>
                  </g>
                );
              })}

              {/* Custom Waypoint Marker (Purple Diamond) */}
              {customWaypoint && (
                <g
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPoi({
                      id: 'custom-waypoint',
                      name: 'Custom GPS Waypoint',
                      type: 'custom',
                      position: customWaypoint,
                      description: `Target marked on GPS satellite grid at coordinates X: ${customWaypoint[0]}m, Z: ${customWaypoint[2]}m.`
                    });
                  }}
                  data-is-poi="true"
                >
                  <circle cx={toSvgX(customWaypoint[0])} cy={toSvgY(customWaypoint[2])} r="18" fill="#a855f7" opacity="0.35" className="animate-ping" />
                  <rect
                    x={toSvgX(customWaypoint[0]) - 8}
                    y={toSvgY(customWaypoint[2]) - 8}
                    width="16"
                    height="16"
                    fill="#a855f7"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    transform={`rotate(45 ${toSvgX(customWaypoint[0])} ${toSvgY(customWaypoint[2])})`}
                  />
                </g>
              )}

              {/* Active Mission Destination Marker (Yellow Halo) */}
              {activeMission && (
                <g>
                  <circle
                    cx={toSvgX(activeMission.targetPosition[0])}
                    cy={toSvgY(activeMission.targetPosition[2])}
                    r="22"
                    fill="#eab308"
                    className="animate-ping"
                    opacity="0.8"
                  />
                  <circle
                    cx={toSvgX(activeMission.targetPosition[0])}
                    cy={toSvgY(activeMission.targetPosition[2])}
                    r="11"
                    fill="#eab308"
                    stroke="#000000"
                    strokeWidth="3"
                  />
                </g>
              )}

              {/* ====================================================
                  LIVE PLAYER / VEHICLE POSITION MARKER (GTA V WHITE CHEVRON)
              ==================================================== */}
              <g transform={`translate(${toSvgX(currentX)}, ${toSvgY(currentZ)})`}>
                {/* Radar Sonar Pulse Ring */}
                <circle r="20" fill="#ffffff" opacity="0.2" className="animate-ping" />
                <circle r="12" fill="#000000" opacity="0.6" />

                {/* Exact GTA V Directional Player Arrow */}
                <g transform={`rotate(${playerHeadingDegrees})`}>
                  <polygon
                    points="0,-14 9,9 0,4.2 -9,9"
                    fill="#ffffff"
                    stroke="#000000"
                    strokeWidth="2.4"
                    strokeLinejoin="miter"
                  />
                </g>
              </g>
            </svg>

            {/* Bottom-Left Controls Overlay */}
            <div className="hidden sm:flex absolute bottom-4 left-6 items-center gap-2 bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-gray-300">
              <Crosshair className="w-4 h-4 text-cyan-400" />
              <span>Tap / Click map to place GPS waypoint</span>
              <span className="text-gray-500">•</span>
              <span>Fast Travel available</span>
            </div>

            {/* Mobile Floating Selected POI Card */}
            {selectedPoi && (
              <div className="md:hidden absolute bottom-3 inset-x-3 bg-slate-950/95 backdrop-blur-xl p-3 rounded-2xl border-2 border-cyan-400/80 shadow-2xl z-20 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
                      {selectedPoi.type}
                    </span>
                    <h3 className="font-display font-black text-white text-sm truncate">
                      {selectedPoi.name}
                    </h3>
                    <span className="text-[11px] font-bold text-emerald-400 block">
                      {distToSelected}m away
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleSetGps(selectedPoi.position, selectedPoi.name)}
                      className="px-2.5 py-1.5 rounded-xl bg-cyan-500 text-black font-black text-[11px] uppercase shadow-md active:scale-95 transition-transform"
                    >
                      GPS
                    </button>
                    <button
                      onClick={() => handleFastTravel(selectedPoi.position, selectedPoi.name)}
                      className="px-2.5 py-1.5 rounded-xl bg-pink-500 text-white font-black text-[11px] uppercase shadow-md active:scale-95 transition-transform"
                    >
                      WARP
                    </button>
                    <button
                      onClick={() => setSelectedPoi(null)}
                      className="p-1.5 rounded-xl bg-slate-800 text-gray-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================
              RIGHT SIDEBAR: POI DIRECTORY & SELECTED TARGET CARD
          ======================================================== */}
          <div
            className="hidden md:flex shrink-0 border-l border-white/10 bg-slate-950 p-5 flex-col justify-between overflow-y-auto w-[340px] lg:w-[380px]"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                  METROPOLIS LOCATIONS
                </span>
                <span className="text-[11px] font-bold text-cyan-400">
                  {filteredPois.length} SITES
                </span>
              </div>

              {/* Selected Target Card */}
              {selectedPoi ? (
                <div className="mt-4 p-4 rounded-2xl bg-slate-900 border-2 border-cyan-400/60 shadow-xl animate-in fade-in">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
                        {selectedPoi.type}
                      </span>
                      <h3 className="font-display font-black text-white text-lg leading-tight mt-0.5">
                        {selectedPoi.name}
                      </h3>
                      <span className="text-xs font-bold text-emerald-400 mt-1 block">
                        {distToSelected} meters from your position
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedPoi(null)}
                      className="p-1 rounded-lg bg-slate-800 text-gray-400 hover:text-white"
                      title="Clear Selection"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-gray-300 mt-2.5 leading-relaxed">
                    {selectedPoi.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-white/10 flex gap-2">
                    <button
                      onClick={() => handleFastTravel(selectedPoi.position, selectedPoi.name)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-display font-black text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-102"
                    >
                      <LocateFixed className="w-4 h-4" />
                      <span>FAST TRAVEL</span>
                    </button>

                    {selectedPoi.type === 'custom' && (
                      <button
                        onClick={() => {
                          setCustomWaypoint(null);
                          setSelectedPoi(null);
                          showNotification('Waypoint Cleared', 'GPS destination removed.', 'info');
                        }}
                        className="py-2.5 px-3 rounded-xl bg-red-600/30 hover:bg-red-600 text-red-200 font-black text-xs border border-red-500/40 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-3.5 rounded-2xl bg-slate-900/50 border border-white/10 text-xs text-gray-400">
                  Select any location below or click anywhere on the map to set a GPS destination or fast travel.
                </div>
              )}

              {/* Scrollable POI Directory List */}
              <div className="mt-4 space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {filteredPois.map((poi) => {
                  const dist = Math.round(Math.hypot(currentX - poi.position[0], currentZ - poi.position[2]));
                  const isSelected = selectedPoi?.id === poi.id;

                  let icon = <Car className="w-4 h-4 text-cyan-400" />;
                  if (poi.type === 'home' || poi.type === 'property') icon = <Home className="w-4 h-4 text-emerald-400" />;
                  else if (poi.type === 'garage') icon = <Wrench className="w-4 h-4 text-pink-400" />;
                  else if (poi.type === 'gas_station') icon = <Fuel className="w-4 h-4 text-amber-400" />;
                  else if (poi.type === 'stunt') icon = <Rocket className="w-4 h-4 text-orange-400" />;
                  else if (poi.type === 'job') icon = <Flag className="w-4 h-4 text-yellow-400" />;

                  return (
                    <div
                      key={poi.id}
                      onClick={() => setSelectedPoi(poi)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-slate-850 border-cyan-400 shadow-md'
                          : 'bg-slate-900/70 border-white/5 hover:border-white/20 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-lg bg-black/60 shrink-0">
                          {icon}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-white text-xs truncate">
                            {poi.name}
                          </h4>
                          <span className="text-[10px] text-gray-400 uppercase font-black">
                            {poi.type}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-gray-300 block">
                          {dist}m
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFastTravel(poi.position, poi.name);
                          }}
                          className="mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-cyan-500/20 text-cyan-300 hover:bg-cyan-400 hover:text-black transition-all border border-cyan-400/30"
                        >
                          TELEPORT
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom GPS Info */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
              <span className="flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                <span>GPS Grid: 70m Blocks</span>
              </span>
              <span className="font-mono text-white">440m × 440m Atlas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
