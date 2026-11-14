import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { CITY_SHOPS, ALL_SHOP_ITEMS } from '../../data/shopsData';
import { INVENTORY_ITEMS } from '../../data/worldData';
import {
  ShoppingBag,
  Zap,
  Coffee,
  Heart,
  Wrench,
  X,
  Check,
  DollarSign,
  Apple,
  Dumbbell,
  Pill,
  HeartPulse,
  GraduationCap,
  ShieldAlert,
  Store,
  Cpu,
  Pizza,
  UtensilsCrossed,
  Package,
  Shield,
  Sparkles,
  Flame,
  ArrowRight
} from 'lucide-react';

export const ShopModal: React.FC = () => {
  const activeScreen = useGameStore((s) => s.activeScreen);
  const setActiveScreen = useGameStore((s) => s.setActiveScreen);
  const activeShopId = useGameStore((s) => s.activeShopId);
  const player = useGameStore((s) => s.player);
  const buyShopItem = useGameStore((s) => s.buyShopItem);
  const consumeItem = useGameStore((s) => s.consumeItem);

  const [activeTab, setActiveTab] = useState<'catalog' | 'backpack'>('catalog');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Keyboard shortcut listener: [Escape] or [S] closes the shop modal
  React.useEffect(() => {
    if (activeScreen !== 'shop') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === 'Escape' || e.key.toLowerCase() === 's') {
        setActiveScreen('game');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeScreen, setActiveScreen]);

  if (activeScreen !== 'shop') return null;

  // Find active shop details (fallback to vegetable market if none specified)
  const currentShop = CITY_SHOPS.find((s) => s.id === activeShopId) || CITY_SHOPS[0];

  // Get items belonging to this shop
  const shopItems = ALL_SHOP_ITEMS.filter((i) => i.shopId === currentShop.id);

  // Player backpack inventory entries
  const ownedItemEntries = Object.entries(player.inventory)
    .map(([id, count]) => {
      const def = ALL_SHOP_ITEMS.find((i) => i.id === id) || INVENTORY_ITEMS.find((i) => i.id === id);
      return def ? { item: def, count } : null;
    })
    .filter((entry): entry is { item: typeof ALL_SHOP_ITEMS[0]; count: number } => entry !== null && entry.count > 0);

  const getShopIcon = () => {
    switch (currentShop.type) {
      case 'vegetable':
        return <Apple className="w-7 h-7 text-emerald-400" />;
      case 'gym':
        return <Dumbbell className="w-7 h-7 text-amber-400" />;
      case 'pharmacy':
        return <Pill className="w-7 h-7 text-cyan-400" />;
      case 'hospital':
        return <HeartPulse className="w-7 h-7 text-red-500" />;
      case 'school':
        return <GraduationCap className="w-7 h-7 text-purple-400" />;
      case 'police':
        return <ShieldAlert className="w-7 h-7 text-blue-400" />;
      case 'mall':
        return <Store className="w-7 h-7 text-amber-300" />;
      case 'electronics':
        return <Cpu className="w-7 h-7 text-cyan-300" />;
      case 'cafe':
        return <Coffee className="w-7 h-7 text-amber-500" />;
      case 'pizza':
        return <Pizza className="w-7 h-7 text-orange-400" />;
      case 'restaurant':
        return <UtensilsCrossed className="w-7 h-7 text-pink-400" />;
      case 'burger':
        return <Flame className="w-7 h-7 text-yellow-400" />;
      default:
        return <ShoppingBag className="w-7 h-7 text-emerald-400" />;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'food':
        return 'text-amber-300 bg-amber-500/20 border-amber-400/40';
      case 'drink':
        return 'text-cyan-300 bg-cyan-500/20 border-cyan-400/40';
      case 'medical':
        return 'text-rose-300 bg-rose-500/20 border-rose-400/40';
      case 'tactical':
        return 'text-blue-300 bg-blue-500/20 border-blue-400/40';
      case 'fitness':
        return 'text-yellow-300 bg-yellow-500/20 border-yellow-400/40';
      case 'electronics':
        return 'text-cyan-400 bg-cyan-500/20 border-cyan-400/40';
      case 'luxury':
        return 'text-purple-300 bg-purple-500/20 border-purple-400/40';
      case 'education':
        return 'text-indigo-300 bg-indigo-500/20 border-indigo-400/40';
      default:
        return 'text-gray-300 bg-slate-800 border-white/20';
    }
  };

  const playerHealth = player.health ?? 100;
  const playerArmor = player.armor ?? 0;
  const playerEnergy = player.energy ?? 100;
  const playerHunger = player.hunger ?? 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl h-[92vh] max-h-[820px] rounded-3xl bg-slate-950 border-2 shadow-2xl flex flex-col overflow-hidden"
        style={{ borderColor: `${currentShop.accentColor}99`, boxShadow: `0 0 60px ${currentShop.accentColor}33` }}
      >
        {/* ========================================================
            HEADER BAR: DYNAMIC THEMED STOREFRONT BRANDING
        ======================================================== */}
        <div
          className="h-14 sm:h-18 px-3 sm:px-6 md:px-8 flex items-center justify-between border-b bg-slate-900/90 shrink-0"
          style={{ borderColor: `${currentShop.accentColor}40` }}
        >
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            <div
              className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center border shadow-lg shrink-0"
              style={{
                backgroundColor: `${currentShop.accentColor}26`,
                borderColor: currentShop.accentColor,
                boxShadow: `0 0 20px ${currentShop.accentColor}55`
              }}
            >
              {getShopIcon()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-lg md:text-xl font-display font-black text-white tracking-wider truncate">
                  {currentShop.name}
                </h2>
                <span
                  className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border shrink-0"
                  style={{
                    backgroundColor: `${currentShop.accentColor}26`,
                    borderColor: `${currentShop.accentColor}66`,
                    color: currentShop.accentColor
                  }}
                >
                  {currentShop.categoryName}
                </span>
              </div>
              <span className="hidden xs:block text-[9px] sm:text-[10px] md:text-[11px] font-bold text-gray-400 tracking-wider uppercase truncate">
                {currentShop.tagline}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 md:gap-5 shrink-0">
            {/* Player Cash Counter */}
            <div className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3.5 md:px-5 py-1 sm:py-1.5 md:py-2 rounded-xl sm:rounded-2xl bg-emerald-950/90 border-2 border-emerald-400 text-emerald-300 font-display font-black text-xs sm:text-sm md:text-base shadow-[0_0_18px_rgba(16,185,129,0.4)]">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-emerald-400" />
              <span>${player.cash.toLocaleString()}</span>
            </div>

            <button
              onClick={() => setActiveScreen('game')}
              className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-slate-800 hover:bg-red-600 text-white flex items-center justify-center transition-all border border-white/20 cursor-pointer hover:scale-105"
              title="Exit Store [ESC]"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================
            NAVIGATION TABS & VITAL STATS MONITOR
        ======================================================== */}
        <div className="px-3 sm:px-6 py-2 flex items-center justify-between border-b border-white/10 bg-slate-900/60 shrink-0 gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-white text-black shadow-lg scale-102 font-black'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Store Catalog ({shopItems.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('backpack')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'backpack'
                  ? 'bg-white text-black shadow-lg scale-102 font-black'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>My Backpack ({ownedItemEntries.length})</span>
            </button>
          </div>

          {/* Real-time Player Vital Stats Indicators */}
          <div className="flex items-center gap-4 text-xs font-black">
            {/* Health */}
            <div className="flex items-center gap-1.5" title={`Health: ${playerHealth}%`}>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden border border-rose-500/30">
                <div className="h-full bg-rose-500 rounded-full transition-all" style={{ width: `${playerHealth}%` }} />
              </div>
              <span className="text-rose-400 font-mono text-[10px]">{playerHealth}%</span>
            </div>

            {/* Armor */}
            <div className="flex items-center gap-1.5" title={`Armor: ${playerArmor}%`}>
              <Shield className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
              <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden border border-blue-500/30">
                <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${playerArmor}%` }} />
              </div>
              <span className="text-blue-300 font-mono text-[10px]">{playerArmor}%</span>
            </div>

            {/* Stamina */}
            <div className="flex items-center gap-1.5" title={`Stamina: ${playerEnergy}%`}>
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden border border-amber-500/30">
                <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${playerEnergy}%` }} />
              </div>
              <span className="text-amber-300 font-mono text-[10px]">{playerEnergy}%</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            CONTENT BODY: STORE CATALOG OR BACKPACK INVENTORY
        ======================================================== */}
        <div className="flex-1 p-5 md:p-7 overflow-y-auto min-h-0 bg-slate-950/80">
          {activeTab === 'catalog' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shopItems.map((item) => {
                const ownedCount = player.inventory[item.id] || 0;
                const canAfford = player.cash >= item.price;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-900/85 border border-white/10 hover:border-cyan-400/60 transition-all flex flex-col justify-between gap-3.5 shadow-lg group hover:shadow-[0_0_25px_rgba(0,240,255,0.2)]"
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-md shrink-0 mt-0.5"
                        style={{
                          backgroundColor: `${currentShop.accentColor}20`,
                          borderColor: `${currentShop.accentColor}66`
                        }}
                      >
                        {getShopIcon()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-display font-black text-white text-base truncate">
                            {item.name}
                          </h4>
                          <span className="font-display font-black text-emerald-400 text-lg shrink-0">
                            ${item.price.toLocaleString()}
                          </span>
                        </div>

                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase border mt-1 ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>

                        <p className="text-xs text-gray-300 mt-1.5 leading-relaxed font-medium">
                          {item.description}
                        </p>

                        {/* Real-Life Benefits Badges */}
                        <div className="flex items-center gap-2 mt-2.5 flex-wrap text-[11px] font-black">
                          {item.healthBonus && item.healthBonus > 0 && (
                            <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                              <Heart className="w-3 h-3 text-rose-400" /> +{item.healthBonus} Health
                            </span>
                          )}
                          {item.armorBonus && item.armorBonus > 0 && (
                            <span className="px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
                              <Shield className="w-3 h-3 text-blue-400" /> +{item.armorBonus} Armor
                            </span>
                          )}
                          {item.energyBonus && item.energyBonus > 0 && (
                            <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                              <Zap className="w-3 h-3 text-amber-400" /> +{item.energyBonus}% Stamina
                            </span>
                          )}
                          {item.hungerBonus && item.hungerBonus > 0 && (
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              <Apple className="w-3 h-3 text-emerald-400" /> +{item.hungerBonus}% Nutrition
                            </span>
                          )}
                          {item.wantedBonus && (
                            <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3 text-indigo-400" /> Clears Wanted Stars
                            </span>
                          )}
                          {ownedCount > 0 && (
                            <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-gray-300 border border-white/20">
                              Owned: {ownedCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Dual Real-Life Purchase Actions: Consume Now vs Store in Bag */}
                    <div className="flex items-center gap-2 pt-2.5 border-t border-white/10">
                      {/* Action 1: Buy & Consume / Use Now */}
                      <button
                        onClick={() => buyShopItem(item.id, true)}
                        disabled={!canAfford}
                        className={`flex-1 py-2 px-3 rounded-xl font-display font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          canAfford
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-md hover:scale-102'
                            : 'bg-slate-800 text-gray-500 border border-slate-700 cursor-not-allowed'
                        }`}
                        title="Purchase and consume/apply immediately"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Buy & Consume Now</span>
                      </button>

                      {/* Action 2: Buy & Put in Backpack */}
                      <button
                        onClick={() => buyShopItem(item.id, false)}
                        disabled={!canAfford}
                        className={`py-2 px-4 rounded-xl font-display font-black text-xs transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                          canAfford
                            ? 'bg-slate-800 hover:bg-slate-700 text-white border-white/20 hover:border-cyan-400'
                            : 'bg-slate-900 text-gray-600 border-white/5 cursor-not-allowed'
                        }`}
                        title="Purchase and store in your backpack inventory"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Pack in Bag</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // BACKPACK INVENTORY TAB
            <div>
              {ownedItemEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-center text-gray-500 mb-4">
                    <Package className="w-8 h-8" />
                  </div>
                  <h3 className="font-display font-black text-lg text-white">Your Backpack is Empty</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm">
                    Browse the store catalog to purchase real-life snacks, drinks, medicine, or gear to keep in your inventory!
                  </p>
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="mt-5 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-display font-black text-xs transition-all cursor-pointer"
                  >
                    Browse Store Catalog
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ownedItemEntries.map(({ item, count }) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-slate-900/90 border border-white/15 flex items-center justify-between gap-4 shadow-lg"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center text-cyan-400 shrink-0">
                          <Package className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-display font-black text-white text-sm truncate">{item.name}</h4>
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase border mt-0.5 ${getCategoryColor(item.category)}`}>
                            {item.category} • Quantity: {count}
                          </span>
                          <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">{item.description}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => consumeItem(item.id)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-display font-black text-xs transition-all cursor-pointer shadow-md shrink-0 flex items-center gap-1.5 hover:scale-105"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Use Item</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
