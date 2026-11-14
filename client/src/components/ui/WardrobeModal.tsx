import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { PlayerAppearance } from '../../types/game';
import { X, Sparkles, Check, Shirt, Scissors, Eye, Glasses, Palette, RefreshCw } from 'lucide-react';

export const WardrobeModal: React.FC = () => {
  const activeScreen = useGameStore((s) => s.activeScreen);
  const setActiveScreen = useGameStore((s) => s.setActiveScreen);
  const appearance = useGameStore((s) => s.player.appearance);
  const updateAppearance = useGameStore((s) => s.updateAppearance);

  const [localApp, setLocalApp] = useState<PlayerAppearance>({
    hairColor: appearance.hairColor || '#0f172a',
    jacketColor: appearance.jacketColor || '#0284c7',
    pantsColor: appearance.pantsColor || '#1e293b',
    skinColor: appearance.skinColor || '#fde047',
    shirtType: appearance.shirtType || 'jacket',
    pantsType: appearance.pantsType || 'jeans',
    shoesColor: appearance.shoesColor || '#ffffff',
    hairStyle: appearance.hairStyle || 'cap',
    eyewear: appearance.eyewear || 'sunglasses',
    eyewearColor: appearance.eyewearColor || '#0f172a',
    eyeColor: appearance.eyeColor || '#0284c7'
  });

  const [activeTab, setActiveTab] = useState<'tops' | 'bottoms' | 'hair' | 'eyewear' | 'colors' | 'presets'>('tops');

  // Synchronize initial state when modal opens
  useEffect(() => {
    if (activeScreen === 'wardrobe') {
      setLocalApp({
        hairColor: appearance.hairColor || '#0f172a',
        jacketColor: appearance.jacketColor || '#0284c7',
        pantsColor: appearance.pantsColor || '#1e293b',
        skinColor: appearance.skinColor || '#fde047',
        shirtType: appearance.shirtType || 'jacket',
        pantsType: appearance.pantsType || 'jeans',
        shoesColor: appearance.shoesColor || '#ffffff',
        hairStyle: appearance.hairStyle || 'cap',
        eyewear: appearance.eyewear || 'sunglasses',
        eyewearColor: appearance.eyewearColor || '#0f172a',
        eyeColor: appearance.eyeColor || '#0284c7'
      });
    }
  }, [activeScreen, appearance]);

  // Keyboard close listener
  useEffect(() => {
    if (activeScreen !== 'wardrobe') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === 'Escape' || e.key.toLowerCase() === 'u') {
        setActiveScreen('game');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeScreen, setActiveScreen]);

  if (activeScreen !== 'wardrobe') return null;

  const colorPalette = [
    { label: 'Obsidian Black', hex: '#0f172a' },
    { label: 'Pure White', hex: '#f8fafc' },
    { label: 'Cyan Cyber', hex: '#06b6d4' },
    { label: 'Electric Blue', hex: '#2563eb' },
    { label: 'Crimson Red', hex: '#dc2626' },
    { label: 'Hot Magenta', hex: '#ec4899' },
    { label: 'Acid Lime', hex: '#84cc16' },
    { label: 'Emerald Green', hex: '#10b981' },
    { label: 'Golden Amber', hex: '#f59e0b' },
    { label: 'Royal Purple', hex: '#8b5cf6' },
    { label: 'Charcoal Slate', hex: '#334155' },
    { label: 'Cognac Leather', hex: '#78350f' },
  ];

  const skinTones = [
    { label: 'Light Golden', hex: '#fde047' },
    { label: 'Warm Peach', hex: '#fed7aa' },
    { label: 'Sun-Kissed Tan', hex: '#fcd34d' },
    { label: 'Deep Caramel', hex: '#d97706' },
    { label: 'Rich Chestnut', hex: '#78350f' },
    { label: 'Porcelain Fair', hex: '#fef08a' },
  ];

  const eyeColors = [
    { label: 'Sapphire Blue', hex: '#0284c7' },
    { label: 'Emerald Green', hex: '#10b981' },
    { label: 'Hazel Amber', hex: '#d97706' },
    { label: 'Obsidian Dark', hex: '#18181b' },
    { label: 'Cyber Neon', hex: '#00f0ff' },
    { label: 'Violet Amethyst', hex: '#a855f7' },
  ];

  const presets: { name: string; desc: string; app: Partial<PlayerAppearance> }[] = [
    {
      name: 'Los Santos Streetwear',
      desc: 'Cyan Street Hoodie, Dark Denim, White High-Tops, Snapback Cap',
      app: {
        shirtType: 'hoodie',
        jacketColor: '#06b6d4',
        pantsType: 'jeans',
        pantsColor: '#0f172a',
        shoesColor: '#ffffff',
        hairStyle: 'cap',
        hairColor: '#0f172a',
        eyewear: 'sunglasses',
        eyewearColor: '#0f172a'
      }
    },
    {
      name: 'Executive VIP Blazer',
      desc: 'Tailored Jet Black Suit, White Shirt & Tie, Aviators, Formal Slacks',
      app: {
        shirtType: 'suit',
        jacketColor: '#0f172a',
        pantsType: 'jeans',
        pantsColor: '#0f172a',
        shoesColor: '#18181b',
        hairStyle: 'fade',
        hairColor: '#0f172a',
        eyewear: 'aviators',
        eyewearColor: '#eab308'
      }
    },
    {
      name: 'Cyberpunk Outlaw',
      desc: 'Neon Magenta Bomber, Dark Cargo, Glowing Cyan Visor, Acid Lime Kicks',
      app: {
        shirtType: 'hoodie',
        jacketColor: '#ec4899',
        pantsType: 'cargo',
        pantsColor: '#1e293b',
        shoesColor: '#84cc16',
        hairStyle: 'short',
        hairColor: '#06b6d4',
        eyewear: 'visor',
        eyewearColor: '#00f0ff'
      }
    },
    {
      name: 'Vespucci Beach Cruiser',
      desc: 'Summer Tank Top, Denim Shorts, Retro Sunglasses, White Sneakers',
      app: {
        shirtType: 'tanktop',
        jacketColor: '#f8fafc',
        pantsType: 'shorts',
        pantsColor: '#2563eb',
        shoesColor: '#ffffff',
        hairStyle: 'fade',
        hairColor: '#78350f',
        eyewear: 'sunglasses',
        eyewearColor: '#0f172a'
      }
    },
    {
      name: 'Midnight Moto Biker',
      desc: 'Crimson Leather Jacket, Charcoal Pants, Combat Boots, Knit Beanie',
      app: {
        shirtType: 'jacket',
        jacketColor: '#dc2626',
        pantsType: 'jeans',
        pantsColor: '#0f172a',
        shoesColor: '#09090b',
        hairStyle: 'beanie',
        hairColor: '#18181b',
        eyewear: 'sunglasses',
        eyewearColor: '#0f172a'
      }
    }
  ];

  const handleSave = () => {
    updateAppearance(localApp);
    setActiveScreen('game');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-3 md:p-6 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[780px] rounded-3xl bg-slate-950 border-2 border-pink-400/70 shadow-[0_0_60px_rgba(236,72,153,0.35)] flex flex-col overflow-hidden">
        
        {/* ========================================================
            HEADER BAR
        ======================================================== */}
        <div className="h-14 sm:h-18 px-3 sm:px-6 md:px-8 flex items-center justify-between border-b border-pink-400/30 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.7)] text-white shrink-0">
              <Shirt className="w-4 h-4 sm:w-6 sm:h-6 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-xl md:text-2xl font-display font-black text-white tracking-wider truncate">
                  SUBURBAN CLOSET & WARDROBE
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-400/40 shrink-0">
                  APPAREL
                </span>
              </div>
              <span className="hidden xs:block text-[9px] sm:text-[11px] font-extrabold text-gray-400 tracking-widest uppercase truncate">
                CUSTOMIZE OUTFIT, CLOTHING STYLES, FACIAL FEATURES & ACCESSORIES • [C]
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveScreen('game')}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-800 hover:bg-red-600 text-white flex items-center justify-center transition-all border border-white/20 cursor-pointer hover:scale-105"
              title="Close Wardrobe [ESC / C]"
            >
              <X className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* ========================================================
            CATEGORY TABS
        ======================================================== */}
        <div className="h-11 sm:h-12 px-3 sm:px-6 flex items-center gap-2 border-b border-pink-400/20 bg-slate-950/90 shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: 'tops', label: 'Tops & Jackets', icon: Shirt },
            { id: 'bottoms', label: 'Bottoms & Shoes', icon: Scissors },
            { id: 'hair', label: 'Hair & Headwear', icon: Scissors },
            { id: 'eyewear', label: 'Face & Eyewear', icon: Glasses },
            { id: 'colors', label: 'Colors & Eyes', icon: Palette },
            { id: 'presets', label: 'Curated Outfits', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.7)]'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================
            BODY: LEFT PREVIEW STAGE + RIGHT CONTROLS (STACKS ON MOBILE)
        ======================================================== */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* LEFT: CHARACTER SHOWROOM SHOWCASE */}
          <div
            className="w-full md:w-80 md:max-w-[340px] max-h-36 sm:max-h-48 md:max-h-none shrink-0 border-b md:border-b-0 md:border-r border-pink-400/25 bg-slate-900/60 p-3 sm:p-6 flex flex-col justify-between items-center relative overflow-hidden"
          >
            {/* Ambient Lighting */}
            <div
              className="absolute top-1/4 w-60 h-60 blur-3xl rounded-full opacity-30 pointer-events-none"
              style={{ backgroundColor: localApp.jacketColor }}
            />

            {/* Stylized Visual Character Avatar Podium */}
            <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center">
              {/* Character Card / Silhouette */}
              <div
                className="w-48 h-80 rounded-3xl bg-slate-950/80 border-2 shadow-2xl flex flex-col items-center justify-between p-4 relative"
                style={{ borderColor: localApp.jacketColor }}
              >
                {/* Headwear / Hair */}
                <div className="relative mt-2 flex flex-col items-center">
                  <div
                    className="w-16 h-10 rounded-t-2xl shadow-md border"
                    style={{ backgroundColor: localApp.hairColor, borderColor: '#ffffff22' }}
                  />
                  {/* Face */}
                  <div
                    className="w-14 h-14 rounded-full -mt-2 flex flex-col items-center justify-center relative shadow-inner border"
                    style={{ backgroundColor: localApp.skinColor, borderColor: '#00000022' }}
                  >
                    {/* Eyes & Eyewear */}
                    {localApp.eyewear === 'sunglasses' ? (
                      <div className="w-11 h-3.5 rounded bg-black border border-white/20 -mt-1 shadow-md" />
                    ) : localApp.eyewear === 'aviators' ? (
                      <div className="w-11 h-4 rounded-b bg-amber-950/90 border-2 border-amber-400 -mt-1" />
                    ) : localApp.eyewear === 'visor' ? (
                      <div className="w-12 h-3 rounded bg-cyan-400 shadow-[0_0_8px_#00f0ff] -mt-1" />
                    ) : (
                      <div className="flex items-center gap-2 -mt-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-white flex items-center justify-center shadow-sm">
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: localApp.eyeColor || '#0284c7' }}
                          />
                        </div>
                        <div className="w-2.5 h-2.5 rounded-full bg-white flex items-center justify-center shadow-sm">
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: localApp.eyeColor || '#0284c7' }}
                          />
                        </div>
                      </div>
                    )}
                    {/* Nose */}
                    <div className="w-1.5 h-1.5 rounded-full bg-black/10 mt-1" />
                    {/* Smiling Mouth */}
                    <div className="w-4 h-1.5 rounded-b-full bg-rose-700 mt-1 flex items-center justify-center overflow-hidden">
                      <div className="w-2 h-0.5 bg-white -mt-0.5" />
                    </div>
                  </div>
                </div>

                {/* Torso / Shirt */}
                <div
                  className="w-24 h-24 rounded-2xl shadow-lg border relative flex items-center justify-center"
                  style={{ backgroundColor: localApp.jacketColor, borderColor: '#ffffff22' }}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
                    {localApp.shirtType}
                  </span>
                </div>

                {/* Legs / Pants */}
                <div className="flex gap-2 -mt-2">
                  <div
                    className="w-9 h-20 rounded-b-xl shadow-md border"
                    style={{ backgroundColor: localApp.pantsColor, borderColor: '#ffffff22' }}
                  />
                  <div
                    className="w-9 h-20 rounded-b-xl shadow-md border"
                    style={{ backgroundColor: localApp.pantsColor, borderColor: '#ffffff22' }}
                  />
                </div>

                {/* Sneakers / Shoes */}
                <div className="flex gap-2 -mt-1 mb-1">
                  <div
                    className="w-10 h-3 rounded-full shadow border-b-2 border-white"
                    style={{ backgroundColor: localApp.shoesColor || '#ffffff' }}
                  />
                  <div
                    className="w-10 h-3 rounded-full shadow border-b-2 border-white"
                    style={{ backgroundColor: localApp.shoesColor || '#ffffff' }}
                  />
                </div>
              </div>

              {/* Pedestal Turntable */}
              <div
                className="w-56 h-8 rounded-[50%] -mt-4 border-2 shadow-xl"
                style={{ borderColor: localApp.jacketColor, backgroundColor: '#090d16' }}
              />
            </div>

            <div className="w-full text-center py-2 px-3 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-gray-400">
              Real-time 3D Pedestal Preview
            </div>
          </div>

          {/* RIGHT: CUSTOMIZATION OPTIONS */}
          <div className="flex-1 p-6 md:p-8 flex flex-col justify-between overflow-y-auto bg-slate-950/90">
            <div>
              {/* TAB: TOPS */}
              {activeTab === 'tops' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-pink-400 uppercase tracking-widest">
                    Select Torso & Jacket Style
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { id: 'jacket', name: 'Biker Moto Jacket', desc: 'Heavyweight leather street jacket' },
                      { id: 'hoodie', name: 'Oversized Street Hoodie', desc: 'Kangaroo pouch relaxed fit' },
                      { id: 'suit', name: 'Tailored Business Suit', desc: 'Formal blazer with dress shirt & tie' },
                      { id: 'tshirt', name: 'Classic Crewneck T-Shirt', desc: 'Short-sleeve casual cotton' },
                      { id: 'tanktop', name: 'Athletic Summer Tank', desc: 'Sleeveless beach gym top' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setLocalApp((prev) => ({ ...prev, shirtType: item.id as any }))}
                        className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                          localApp.shirtType === item.id
                            ? 'bg-pink-950/80 border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.4)]'
                            : 'bg-slate-900 border-white/10 hover:border-pink-400/40'
                        }`}
                      >
                        <h4 className="font-display font-black text-white text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-400 mt-1 leading-snug">{item.desc}</p>
                      </button>
                    ))}
                  </div>

                  <h3 className="text-sm font-black text-pink-400 uppercase tracking-widest mt-6">
                    Top / Jacket Color
                  </h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    {colorPalette.map((col) => (
                      <button
                        key={col.hex}
                        onClick={() => setLocalApp((prev) => ({ ...prev, jacketColor: col.hex }))}
                        title={col.label}
                        className={`w-9 h-9 rounded-full border-3 transition-all cursor-pointer ${
                          localApp.jacketColor === col.hex
                            ? 'scale-120 border-white shadow-[0_0_15px_rgba(255,255,255,0.9)] ring-2 ring-pink-400'
                            : 'border-slate-800 hover:scale-110'
                        }`}
                        style={{ backgroundColor: col.hex }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: BOTTOMS */}
              {activeTab === 'bottoms' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-pink-400 uppercase tracking-widest">
                    Select Pants & Bottom Style
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { id: 'jeans', name: 'Slim Fit Designer Jeans', desc: 'Classic denim street trousers' },
                      { id: 'cargo', name: 'Tactical Cargo Pants', desc: 'Reinforced multi-pocket military fit' },
                      { id: 'trackpants', name: 'Athletic Joggers', desc: 'Comfortable sports sweatpants' },
                      { id: 'shorts', name: 'Summer Denim Shorts', desc: 'Casual warm-weather cut-offs' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setLocalApp((prev) => ({ ...prev, pantsType: item.id as any }))}
                        className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                          localApp.pantsType === item.id
                            ? 'bg-pink-950/80 border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.4)]'
                            : 'bg-slate-900 border-white/10 hover:border-pink-400/40'
                        }`}
                      >
                        <h4 className="font-display font-black text-white text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-400 mt-1 leading-snug">{item.desc}</p>
                      </button>
                    ))}
                  </div>

                  <h3 className="text-sm font-black text-pink-400 uppercase tracking-widest mt-6">
                    Pants Color
                  </h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    {colorPalette.map((col) => (
                      <button
                        key={col.hex}
                        onClick={() => setLocalApp((prev) => ({ ...prev, pantsColor: col.hex }))}
                        title={col.label}
                        className={`w-9 h-9 rounded-full border-3 transition-all cursor-pointer ${
                          localApp.pantsColor === col.hex
                            ? 'scale-120 border-white shadow-[0_0_15px_rgba(255,255,255,0.9)] ring-2 ring-pink-400'
                            : 'border-slate-800 hover:scale-110'
                        }`}
                        style={{ backgroundColor: col.hex }}
                      />
                    ))}
                  </div>

                  <h3 className="text-sm font-black text-pink-400 uppercase tracking-widest mt-6">
                    Sneakers & Footwear Color
                  </h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    {colorPalette.map((col) => (
                      <button
                        key={col.hex}
                        onClick={() => setLocalApp((prev) => ({ ...prev, shoesColor: col.hex }))}
                        title={col.label}
                        className={`w-9 h-9 rounded-full border-3 transition-all cursor-pointer ${
                          localApp.shoesColor === col.hex
                            ? 'scale-120 border-white shadow-[0_0_15px_rgba(255,255,255,0.9)] ring-2 ring-pink-400'
                            : 'border-slate-800 hover:scale-110'
                        }`}
                        style={{ backgroundColor: col.hex }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: HAIR & HEADWEAR */}
              {activeTab === 'hair' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-pink-400 uppercase tracking-widest">
                    Hairstyle & Headwear
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { id: 'cap', name: 'Baseball Snapback', desc: 'Classic front-facing brim cap' },
                      { id: 'beanie', name: 'Knit Winter Beanie', desc: 'Folded street beanie' },
                      { id: 'fade', name: 'Razor Sharp Fade', desc: 'Modern side fade with textured quiff' },
                      { id: 'short', name: 'Clean Crop', desc: 'Classic military buzz crop' },
                      { id: 'long', name: 'Flowing Waves', desc: 'Long shoulder-length layered hair' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setLocalApp((prev) => ({ ...prev, hairStyle: item.id as any }))}
                        className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                          localApp.hairStyle === item.id
                            ? 'bg-pink-950/80 border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.4)]'
                            : 'bg-slate-900 border-white/10 hover:border-pink-400/40'
                        }`}
                      >
                        <h4 className="font-display font-black text-white text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-400 mt-1 leading-snug">{item.desc}</p>
                      </button>
                    ))}
                  </div>

                  <h3 className="text-sm font-black text-pink-400 uppercase tracking-widest mt-6">
                    Hair / Cap Color
                  </h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    {colorPalette.map((col) => (
                      <button
                        key={col.hex}
                        onClick={() => setLocalApp((prev) => ({ ...prev, hairColor: col.hex }))}
                        title={col.label}
                        className={`w-9 h-9 rounded-full border-3 transition-all cursor-pointer ${
                          localApp.hairColor === col.hex
                            ? 'scale-120 border-white shadow-[0_0_15px_rgba(255,255,255,0.9)] ring-2 ring-pink-400'
                            : 'border-slate-800 hover:scale-110'
                        }`}
                        style={{ backgroundColor: col.hex }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: EYEWEAR & FACE */}
              {activeTab === 'eyewear' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-pink-400 uppercase tracking-widest">
                    Eyewear & Accessories
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { id: 'none', name: 'Natural Eyes', desc: 'Eyes fully visible without glasses' },
                      { id: 'sunglasses', name: 'Dark Wayfarers', desc: 'Classic black tinted sunglasses' },
                      { id: 'aviators', name: 'Gold Frame Aviators', desc: 'Teardrop pilot shades' },
                      { id: 'visor', name: 'Neon Cyber Visor', desc: 'Glowing HUD cyberpunk eyewear' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setLocalApp((prev) => ({ ...prev, eyewear: item.id as any }))}
                        className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                          localApp.eyewear === item.id
                            ? 'bg-pink-950/80 border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.4)]'
                            : 'bg-slate-900 border-white/10 hover:border-pink-400/40'
                        }`}
                      >
                        <h4 className="font-display font-black text-white text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-400 mt-1 leading-snug">{item.desc}</p>
                      </button>
                    ))}
                  </div>

                  <h3 className="text-sm font-black text-pink-400 uppercase tracking-widest mt-6">
                    Natural Eye / Iris Color
                  </h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    {eyeColors.map((col) => (
                      <button
                        key={col.hex}
                        onClick={() => setLocalApp((prev) => ({ ...prev, eyeColor: col.hex }))}
                        title={col.label}
                        className={`w-9 h-9 rounded-full border-3 transition-all cursor-pointer flex items-center justify-center ${
                          localApp.eyeColor === col.hex
                            ? 'scale-120 border-white shadow-[0_0_15px_rgba(255,255,255,0.9)] ring-2 ring-cyan-400'
                            : 'border-slate-800 hover:scale-110'
                        }`}
                        style={{ backgroundColor: col.hex }}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-black/60" />
                      </button>
                    ))}
                  </div>

                  <h3 className="text-sm font-black text-pink-400 uppercase tracking-widest mt-6">
                    Character Skin Complexion
                  </h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    {skinTones.map((col) => (
                      <button
                        key={col.hex}
                        onClick={() => setLocalApp((prev) => ({ ...prev, skinColor: col.hex }))}
                        title={col.label}
                        className={`w-9 h-9 rounded-full border-3 transition-all cursor-pointer ${
                          localApp.skinColor === col.hex
                            ? 'scale-120 border-white shadow-[0_0_15px_rgba(255,255,255,0.9)] ring-2 ring-pink-400'
                            : 'border-slate-800 hover:scale-110'
                        }`}
                        style={{ backgroundColor: col.hex }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: ALL COLORS & EYES */}
              {activeTab === 'colors' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-black text-pink-400 uppercase tracking-widest mb-2">
                      Jacket / Top Color
                    </h3>
                    <div className="flex items-center gap-3 flex-wrap">
                      {colorPalette.map((col) => (
                        <button
                          key={col.hex}
                          onClick={() => setLocalApp((prev) => ({ ...prev, jacketColor: col.hex }))}
                          title={col.label}
                          className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                            localApp.jacketColor === col.hex ? 'scale-125 border-white ring-2 ring-pink-400' : 'border-slate-800'
                          }`}
                          style={{ backgroundColor: col.hex }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-pink-400 uppercase tracking-widest mb-2">
                      Pants / Bottom Color
                    </h3>
                    <div className="flex items-center gap-3 flex-wrap">
                      {colorPalette.map((col) => (
                        <button
                          key={col.hex}
                          onClick={() => setLocalApp((prev) => ({ ...prev, pantsColor: col.hex }))}
                          title={col.label}
                          className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                            localApp.pantsColor === col.hex ? 'scale-125 border-white ring-2 ring-pink-400' : 'border-slate-800'
                          }`}
                          style={{ backgroundColor: col.hex }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-pink-400 uppercase tracking-widest mb-2">
                      Hair / Cap Color
                    </h3>
                    <div className="flex items-center gap-3 flex-wrap">
                      {colorPalette.map((col) => (
                        <button
                          key={col.hex}
                          onClick={() => setLocalApp((prev) => ({ ...prev, hairColor: col.hex }))}
                          title={col.label}
                          className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                            localApp.hairColor === col.hex ? 'scale-125 border-white ring-2 ring-pink-400' : 'border-slate-800'
                          }`}
                          style={{ backgroundColor: col.hex }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: CURATED OUTSETS */}
              {activeTab === 'presets' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-pink-400 uppercase tracking-widest mb-2">
                    1-Click GTA V Outfits & Styles
                  </h3>
                  {presets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setLocalApp((prev) => ({ ...prev, ...preset.app }))}
                      className="w-full p-4 rounded-2xl bg-slate-900 border border-white/10 hover:border-pink-400/60 hover:bg-slate-850 text-left transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div>
                        <h4 className="font-display font-black text-white text-base group-hover:text-pink-300">
                          {preset.name}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">{preset.desc}</p>
                      </div>

                      <span className="px-3 py-1.5 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-400/30 text-xs font-black uppercase tracking-wider group-hover:bg-pink-500 group-hover:text-white transition-all shrink-0">
                        Equip Outfit
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions Footer */}
            <div className="mt-6 pt-5 border-t border-pink-400/30 flex items-center justify-between gap-4 flex-wrap">
              <button
                onClick={() => {
                  setLocalApp({
                    hairColor: '#0f172a',
                    jacketColor: '#0284c7',
                    pantsColor: '#1e293b',
                    skinColor: '#fde047',
                    shirtType: 'jacket',
                    pantsType: 'jeans',
                    shoesColor: '#ffffff',
                    hairStyle: 'cap',
                    eyewear: 'sunglasses',
                    eyewearColor: '#0f172a',
                    eyeColor: '#0284c7'
                  });
                }}
                className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-gray-300 font-black text-xs border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset to Default</span>
              </button>

              <button
                onClick={handleSave}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-display font-black text-sm tracking-wide shadow-[0_0_30px_rgba(236,72,153,0.7)] transition-all cursor-pointer flex items-center gap-2 hover:scale-102"
              >
                <Check className="w-5 h-5" />
                <span>SAVE & WEAR OUTFIT</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

