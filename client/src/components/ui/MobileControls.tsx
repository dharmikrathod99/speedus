import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { usePedestrianStore } from '../../stores/pedestrianCombat';
import { virtualInput, isMobileDevice } from '../../stores/virtualInput';
import { soundSystem } from '../../audio/soundSystem';
import { vehiclePhysics, playerPhysics } from '../../stores/vehiclePhysics';
import { getNearestEnterableVehicle } from '../../stores/entityVehicles';
import { getNearestEnterableHouse } from '../../stores/houseSystem';
import { CITY_SHOPS } from '../../data/shopsData';
import {
  Flame,
  RotateCcw,
  Volume2,
  Crosshair,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  LogOut,
  Car,
  ShoppingBag,
  Home,
  Hand,
  Fuel
} from 'lucide-react';

export const MobileControls: React.FC = () => {
  const mode = useGameStore((s) => s.mode);
  const vehicleSpeed = useGameStore((s) => s.vehicleSpeed);
  const vehicleFuel = useGameStore((s) => s.vehicleFuel);
  const speedUnit = useGameStore((s) => s.settings.speedUnit);
  const isInsideHouse = useGameStore((s) => s.isInsideHouse);
  const isInsideShop = useGameStore((s) => s.isInsideShop);
  const activeShopInteriorId = useGameStore((s) => s.activeShopInteriorId);
  const enterShopInterior = useGameStore((s) => s.enterShopInterior);
  const exitShopInterior = useGameStore((s) => s.exitShopInterior);
  const openShop = useGameStore((s) => s.openShop);
  const toggleVehicleEntry = useGameStore((s) => s.toggleVehicleEntry);
  const activeScreen = useGameStore((s) => s.activeScreen);
  const isWasted = useGameStore((s) => s.isWasted);
  const activeWeapon = useGameStore((s) => s.activeWeapon);
  const setActiveWeapon = useGameStore((s) => s.setActiveWeapon);
  const playerPos = useGameStore((s) => s.playerPosition);

  const displaySpeed = speedUnit === 'mph' ? Math.round(vehicleSpeed * 0.621371) : vehicleSpeed;

  // Auto-detect mobile devices or touch screens
  const [enabled, setEnabled] = useState<boolean>(() => isMobileDevice());
  const [joystickActive, setJoystickActive] = useState<boolean>(false);
  const [joystickOffset, setJoystickOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [steeringLeft, setSteeringLeft] = useState<boolean>(false);
  const [steeringRight, setSteeringRight] = useState<boolean>(false);

  const joystickCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (isMobileDevice()) {
        setEnabled(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Virtual Analog Joystick touch handlers
  const handleJoystickStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    joystickCenterRef.current = { x: centerX, y: centerY };
    touchIdRef.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    setJoystickActive(true);

    handleJoystickMove(e);
  };

  const handleJoystickMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!joystickActive && touchIdRef.current !== e.pointerId) return;
    const dx = e.clientX - joystickCenterRef.current.x;
    const dy = e.clientY - joystickCenterRef.current.y;
    // Responsive joystick radius based on phone vs tablet screen width
    const maxRadius = typeof window !== 'undefined' && window.innerWidth < 640 ? 36 : 46;
    const distance = Math.hypot(dx, dy);
    const clampedDist = Math.min(distance, maxRadius);
    const angle = Math.atan2(dy, dx);

    const stickX = Math.cos(angle) * clampedDist;
    const stickY = Math.sin(angle) * clampedDist;

    setJoystickOffset({ x: stickX, y: stickY });

    const normX = stickX / maxRadius;
    const normY = -stickY / maxRadius; // Up is positive

    virtualInput.analogX = normX;
    virtualInput.analogY = normY;
    virtualInput.forward = normY > 0.22;
    virtualInput.backward = normY < -0.22;
    virtualInput.left = normX < -0.22;
    virtualInput.right = normX > 0.22;

    // Sprint when joystick is pushed over 85% to the edge
    virtualInput.sprint = Math.hypot(normX, normY) > 0.85;
  };

  const handleJoystickEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (touchIdRef.current === e.pointerId) {
      touchIdRef.current = null;
      setJoystickActive(false);
      setJoystickOffset({ x: 0, y: 0 });
      virtualInput.analogX = 0;
      virtualInput.analogY = 0;
      virtualInput.forward = false;
      virtualInput.backward = false;
      virtualInput.left = false;
      virtualInput.right = false;
      virtualInput.sprint = false;
    }
  };

  // Driving Left/Right Steering Arrow Handlers
  const handleSteerLeftStart = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    virtualInput.left = true;
    virtualInput.right = false;
    virtualInput.analogX = -1;
    setSteeringLeft(true);
  };

  const handleSteerLeftEnd = (e: React.PointerEvent) => {
    e.preventDefault();
    virtualInput.left = false;
    if (!steeringRight) {
      virtualInput.analogX = 0;
    }
    setSteeringLeft(false);
  };

  const handleSteerRightStart = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    virtualInput.right = true;
    virtualInput.left = false;
    virtualInput.analogX = 1;
    setSteeringRight(true);
  };

  const handleSteerRightEnd = (e: React.PointerEvent) => {
    e.preventDefault();
    virtualInput.right = false;
    if (!steeringLeft) {
      virtualInput.analogX = 0;
    }
    setSteeringRight(false);
  };

  // Walking Punch / Attack Action
  const handleAttack = useCallback(() => {
    if (isWasted) return;
    virtualInput.attack = true;
    usePedestrianStore.getState().playerAttack(activeWeapon);
    setTimeout(() => {
      virtualInput.attack = false;
    }, 120);
  }, [isWasted, activeWeapon]);

  // Walking Jump Action
  const handleJump = useCallback(() => {
    virtualInput.jump = true;
    setTimeout(() => {
      virtualInput.jump = false;
    }, 150);
  }, []);

  // Contextual Action helper (Enter Shop, Exit Shop, Enter House, etc.)
  const handleContextAction = useCallback(() => {
    const [px, , pz] = playerPos;
    if (isInsideShop) {
      if (pz < -5.5) {
        exitShopInterior();
      } else if (activeShopInteriorId) {
        openShop(activeShopInteriorId);
      }
      return;
    }

    if (isInsideHouse) {
      if (pz < -5.0 && Math.abs(px) < 2.5) {
        useGameStore.getState().exitHouse();
      } else if (px > 8.0 && pz < -1.5 && pz > -5.0) {
        useGameStore.getState().eatFromFridge();
      } else if (px > 9.5 && pz > 3.0) {
        useGameStore.getState().setActiveScreen('wardrobe');
      } else if (px > 4.5 && px <= 9.5 && pz > 3.5) {
        useGameStore.getState().restInBed();
      } else if (px < 1.0 && pz > 0.0 && pz < 7.0) {
        useGameStore.getState().cycleTvChannel();
      }
      return;
    }

    if (mode === 'walking') {
      let nearestShop = null;
      let minShopDist = 18.0;
      for (const shop of CITY_SHOPS) {
        const doorZ = shop.position[2] + (shop.localPos[2] > 0 ? -7.8 : 7.8);
        const distDoor = Math.hypot(px - shop.position[0], pz - doorZ);
        const distCenter = Math.hypot(px - shop.position[0], pz - shop.position[2]);
        const d = Math.min(distDoor, distCenter);
        if (d < minShopDist) {
          minShopDist = d;
          nearestShop = shop;
        }
      }

      if (nearestShop) {
        enterShopInterior(nearestShop.id);
        return;
      }

      const nearestHouse = getNearestEnterableHouse(px, pz, 8.5);
      if (nearestHouse) {
        useGameStore.getState().enterHouse(nearestHouse.id);
        return;
      }
    }
  }, [playerPos, isInsideShop, isInsideHouse, activeShopInteriorId, mode, enterShopInterior, exitShopInterior, openShop]);

  if (!enabled) {
    return (
      <button
        onClick={() => setEnabled(true)}
        className="fixed top-14 right-2 sm:top-18 sm:right-3 z-40 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-cyan-400/50 text-[10px] sm:text-[11px] font-black text-cyan-300 shadow-lg select-none cursor-pointer"
        title="Enable On-Screen Touch Controls"
      >
        📱 Touch
      </button>
    );
  }

  // Check proximity for action button icon & badge
  const [px, , pz] = playerPos;
  const nearVehicle = mode === 'walking' && !!getNearestEnterableVehicle(px, pz, 7.0);
  const nearShop = mode === 'walking' && CITY_SHOPS.some((s) => Math.hypot(px - s.position[0], pz - s.position[2]) < 18.0);
  const nearHouse = mode === 'walking' && !!getNearestEnterableHouse(px, pz, 9.0);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 select-none overflow-hidden touch-none">
      {/* ========================================================
          STEERING / MOVEMENT CONTROLS (Bottom-Left)
          - Driving Mode: Left (◀) & Right (▶) Touch Steering Arrows
          - Walking Mode: 360° Omnidirectional Virtual Analog Stick
      ======================================================== */}
      {mode === 'driving' ? (
        <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 flex items-center gap-2 sm:gap-3 pointer-events-auto touch-none select-none interactive-ui">
          {/* Steer Left Arrow Button */}
          <button
            onPointerDown={handleSteerLeftStart}
            onPointerUp={handleSteerLeftEnd}
            onPointerCancel={handleSteerLeftEnd}
            className={`w-14 h-16 sm:w-18 sm:h-20 rounded-2xl flex flex-col items-center justify-center border-2 transition-all cursor-pointer ${
              steeringLeft
                ? 'bg-gradient-to-br from-cyan-400 to-sky-500 border-white text-black shadow-[0_0_25px_rgba(0,240,255,0.9)] scale-95'
                : 'bg-slate-950/85 backdrop-blur-md border-cyan-400/60 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:border-cyan-300 active:scale-95'
            }`}
            style={{ touchAction: 'none' }}
            title="Steer Left [A / ←]"
          >
            <ArrowLeft className={`w-7 h-7 sm:w-9 sm:h-9 ${steeringLeft ? 'text-black stroke-[3]' : 'text-cyan-300'}`} />
            <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-wider mt-0.5 ${steeringLeft ? 'text-black' : 'text-cyan-200'}`}>
              LEFT
            </span>
          </button>

          {/* Steer Right Arrow Button */}
          <button
            onPointerDown={handleSteerRightStart}
            onPointerUp={handleSteerRightEnd}
            onPointerCancel={handleSteerRightEnd}
            className={`w-14 h-16 sm:w-18 sm:h-20 rounded-2xl flex flex-col items-center justify-center border-2 transition-all cursor-pointer ${
              steeringRight
                ? 'bg-gradient-to-br from-cyan-400 to-sky-500 border-white text-black shadow-[0_0_25px_rgba(0,240,255,0.9)] scale-95'
                : 'bg-slate-950/85 backdrop-blur-md border-cyan-400/60 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:border-cyan-300 active:scale-95'
            }`}
            style={{ touchAction: 'none' }}
            title="Steer Right [D / →]"
          >
            <ArrowRight className={`w-7 h-7 sm:w-9 sm:h-9 ${steeringRight ? 'text-black stroke-[3]' : 'text-cyan-300'}`} />
            <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-wider mt-0.5 ${steeringRight ? 'text-black' : 'text-cyan-200'}`}>
              RIGHT
            </span>
          </button>
        </div>
      ) : (
        <div className="joystick-container absolute bottom-3 left-3 sm:bottom-6 sm:left-6 pointer-events-auto touch-none">
          <div
            onPointerDown={handleJoystickStart}
            onPointerMove={handleJoystickMove}
            onPointerUp={handleJoystickEnd}
            onPointerCancel={handleJoystickEnd}
            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-950/80 backdrop-blur-md border-2 border-cyan-400/50 shadow-[0_0_20px_rgba(0,240,255,0.35)] flex items-center justify-center cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'none' }}
          >
            {/* Subtle directional indicators */}
            <div className="absolute top-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400/70" />
            <div className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400/70" />
            <div className="absolute left-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400/70" />
            <div className="absolute right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400/70" />

            {/* Draggable Analog Thumb Stick */}
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-sky-400 border-2 border-white/95 shadow-[0_0_12px_rgba(0,240,255,0.9)] flex items-center justify-center transition-transform duration-75"
              style={{
                transform: `translate(${joystickOffset.x}px, ${joystickOffset.y}px)`
              }}
            >
              <div className="w-4 h-4 rounded-full bg-white/50 shadow-inner" />
            </div>
          </div>
          <div className="text-center text-[9px] sm:text-[10px] font-black text-cyan-300/80 mt-1 uppercase tracking-wider">
            Move
          </div>
        </div>
      )}

      {/* ========================================================
          RIGHT ACTION BUTTONS (DRIVING MODE - Responsive Sizing)
      ======================================================== */}
      {mode === 'driving' ? (
        <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 flex flex-col items-end gap-2 sm:gap-3 pointer-events-auto touch-none interactive-ui">
          {/* Top Row: Horn, Nitro, Exit */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Nitro Boost Button */}
            <button
              onPointerDown={() => { virtualInput.boost = true; }}
              onPointerUp={() => { virtualInput.boost = false; }}
              onPointerCancel={() => { virtualInput.boost = false; }}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-500 border border-pink-300 text-white font-black flex flex-col items-center justify-center shadow-[0_0_15px_rgba(255,0,127,0.6)] active:scale-95 transition-transform"
            >
              <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[7px] sm:text-[8px] font-bold">NITRO</span>
            </button>

            {/* Horn Button */}
            <button
              onPointerDown={() => {
                soundSystem.startHorn();
                virtualInput.horn = true;
              }}
              onPointerUp={() => {
                soundSystem.stopHorn();
                virtualInput.horn = false;
              }}
              onPointerCancel={() => {
                soundSystem.stopHorn();
                virtualInput.horn = false;
              }}
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-slate-900/85 backdrop-blur-md border border-amber-400/70 text-amber-300 flex flex-col items-center justify-center shadow-md active:scale-95 transition-transform"
            >
              <Volume2 className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="text-[7px] sm:text-[8px] font-bold">HORN</span>
            </button>

            {/* Exit Vehicle Button */}
            <button
              onClick={() => toggleVehicleEntry()}
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-slate-900/85 backdrop-blur-md border border-rose-500/70 text-rose-300 flex flex-col items-center justify-center shadow-md active:scale-95 transition-transform"
            >
              <LogOut className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="text-[7px] sm:text-[8px] font-bold">EXIT</span>
            </button>
          </div>

          {/* Bottom Row: Ergonomic Gas & Brake Pedals + Drift + Compact Speed/Fuel */}
          <div className="flex items-end gap-1.5 sm:gap-2.5">
            {/* Ultra-Compact Mobile Speed & Fuel Indicator (Right beside DRIFT button) */}
            <div className="flex flex-col items-center justify-center px-1.5 py-1 rounded-xl sm:rounded-2xl bg-black/85 backdrop-blur-md border border-cyan-400/60 shadow-[0_4px_15px_rgba(0,0,0,0.8)] h-13 sm:h-16 w-13 sm:w-16 select-none pointer-events-none shrink-0">
              {/* Digital Speed Value */}
              <div className="flex items-baseline leading-none">
                <span className="font-display font-black text-sm sm:text-base text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                  {displaySpeed}
                </span>
                <span className="text-[6.5px] sm:text-[7.5px] font-racing font-bold text-cyan-300 uppercase ml-0.5">
                  {speedUnit}
                </span>
              </div>

              {/* Mini Fuel Indicator Bar */}
              <div className="w-full flex items-center gap-0.5 mt-1 px-0.5">
                <Fuel className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/20">
                  <div
                    className={`h-full rounded-full transition-all ${
                      vehicleFuel < 20 ? 'bg-red-500 animate-pulse' : vehicleFuel < 50 ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.max(4, Math.min(100, vehicleFuel))}%` }}
                  />
                </div>
              </div>
              <span className="text-[6.5px] font-mono font-bold text-gray-300 leading-none mt-0.5">
                {Math.round(vehicleFuel)}%
              </span>
            </div>

            {/* Handbrake Drift Button */}
            <button
              onPointerDown={() => { virtualInput.handbrake = true; }}
              onPointerUp={() => { virtualInput.handbrake = false; }}
              onPointerCancel={() => { virtualInput.handbrake = false; }}
              className="w-11 h-13 sm:w-13 sm:h-16 rounded-xl sm:rounded-2xl bg-slate-900/90 backdrop-blur-md border border-yellow-400 text-yellow-300 font-black flex flex-col items-center justify-center shadow-[0_0_12px_rgba(250,204,21,0.4)] active:scale-95 transition-transform"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[8px] sm:text-[9px] font-black">DRIFT</span>
            </button>

            {/* Brake / Reverse Pedal */}
            <button
              onPointerDown={() => { virtualInput.backward = true; }}
              onPointerUp={() => { virtualInput.backward = false; }}
              onPointerCancel={() => { virtualInput.backward = false; }}
              className="w-12 h-17 sm:w-15 sm:h-22 rounded-xl sm:rounded-2xl bg-gradient-to-b from-red-600 to-rose-700 border-2 border-white/80 text-white font-black flex flex-col items-center justify-center shadow-[0_0_15px_rgba(225,29,72,0.6)] active:scale-95 transition-transform"
            >
              <ArrowDown className="w-5 h-5 sm:w-7 sm:h-7" />
              <span className="text-[8px] sm:text-[10px] font-black">BRAKE</span>
            </button>

            {/* Accelerate / Gas Pedal */}
            <button
              onPointerDown={() => { virtualInput.forward = true; }}
              onPointerUp={() => { virtualInput.forward = false; }}
              onPointerCancel={() => { virtualInput.forward = false; }}
              className="w-13 h-21 sm:w-17 sm:h-26 rounded-xl sm:rounded-2xl bg-gradient-to-b from-emerald-500 to-teal-600 border-2 border-white/90 text-white font-black flex flex-col items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.7)] active:scale-95 transition-transform"
            >
              <ArrowUp className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="text-[9px] sm:text-[11px] font-black">GAS</span>
            </button>
          </div>
        </div>
      ) : (
        /* ========================================================
            RIGHT ACTION BUTTONS (WALKING MODE - Responsive Sizing)
        ======================================================== */
        <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 flex flex-col items-end gap-2 sm:gap-3 pointer-events-auto touch-none interactive-ui">
          {/* Quick Weapon Switch Pills */}
          <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md p-1 rounded-xl sm:rounded-2xl border border-white/20">
            {(['fists', 'bat', 'pistol'] as const).map((w) => (
              <button
                key={w}
                onClick={() => setActiveWeapon(w)}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase transition-all ${
                  activeWeapon === w
                    ? 'bg-amber-400 text-black shadow-md scale-105'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {w === 'fists' ? '👊 Fists' : w === 'bat' ? '🏏 Bat' : '🔫 Gun'}
              </button>
            ))}
          </div>

          {/* Context Interaction Button (Enter Shop / House / Door / Fridge / Bed) */}
          {(nearShop || nearHouse || isInsideShop || isInsideHouse) && (
            <button
              onClick={handleContextAction}
              className="px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 border border-white/80 text-white font-display font-black text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.7)] active:scale-95 transition-transform animate-bounce"
            >
              {isInsideShop ? (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{pz < -5.5 ? 'Exit' : 'Shop'}</span>
                </>
              ) : isInsideHouse ? (
                <>
                  <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{pz < -5.0 && Math.abs(px) < 2.5 ? 'Exit House' : 'Interact'}</span>
                </>
              ) : nearShop ? (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Enter Store</span>
                </>
              ) : (
                <>
                  <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Enter House</span>
                </>
              )}
            </button>
          )}

          {/* Primary Action Buttons Grid */}
          <div className="flex items-end gap-2 sm:gap-3">
            {/* Enter / Exit Car Button (Highlighted when near car) */}
            <button
              onClick={() => toggleVehicleEntry()}
              className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center font-black active:scale-95 transition-all ${
                nearVehicle
                  ? 'bg-gradient-to-tr from-pink-500 to-rose-500 text-white border-2 border-white shadow-[0_0_15px_rgba(255,0,127,0.8)] animate-pulse'
                  : 'bg-slate-900/85 backdrop-blur-md text-gray-300 border border-white/20'
              }`}
            >
              <Car className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[8px] sm:text-[9px] font-bold">CAR</span>
            </button>

            {/* Jump Button */}
            <button
              onClick={handleJump}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-cyan-600/90 border border-cyan-300 text-white flex flex-col items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.5)] active:scale-95 transition-transform"
            >
              <ChevronUp className="w-6 h-6 sm:w-7 sm:h-7" />
              <span className="text-[8px] sm:text-[9px] font-black">JUMP</span>
            </button>

            {/* Punch / Attack Button */}
            <button
              onClick={handleAttack}
              className="w-15 h-15 sm:w-18 sm:h-18 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 border-2 border-white text-white font-black flex flex-col items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.8)] active:scale-90 transition-transform"
            >
              {activeWeapon === 'pistol' ? (
                <Crosshair className="w-7 h-7 sm:w-8 sm:h-8" />
              ) : (
                <Hand className="w-7 h-7 sm:w-8 sm:h-8" />
              )}
              <span className="text-[9px] sm:text-[10px] font-black tracking-wider">
                {activeWeapon === 'pistol' ? 'SHOOT' : 'HIT'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
