import { CityShop, InventoryItem } from '../types/game';

/**
 * SPEED US - Metropolitan City Commercial Catalog
 * 12 Fully Interactive Real-Life Storefronts distributed across the city map.
 */

export const CITY_SHOPS: CityShop[] = [
  // 1. Fresh Vegetable & Produce Market (East Commercial District)
  {
    id: 'shop-vegetable',
    name: 'GreenLeaf Organic Market',
    categoryName: 'Fresh Produce & Groceries',
    type: 'vegetable',
    position: [92, 0, 22],
    description: 'Farm-fresh organic fruits, crisp greens, seasonal vegetables, and revitalizing natural cold-pressed juices.',
    tagline: 'Farm-Fresh Daily • 100% Organic & Wholesome',
    accentColor: '#22c55e',
    icon: 'Apple',
    chunkX: 1,
    chunkZ: 0,
    localPos: [22, 0, 22]
  },
  // 2. IronWorks 24/7 Fitness Club & Gym (West Boulevard)
  {
    id: 'shop-gym',
    name: 'IronWorks 24/7 Fitness Club',
    categoryName: 'Gym & Sports Nutrition',
    type: 'gym',
    position: [-92, 0, 22],
    description: 'Premier downtown athletic gym. Elite free weights, personal training passes, and high-performance sports nutrition.',
    tagline: 'Unleash Your Peak Athletic Power',
    accentColor: '#eab308',
    icon: 'Dumbbell',
    chunkX: -1,
    chunkZ: 0,
    localPos: [-22, 0, 22]
  },
  // 3. MetroCare 24/7 Pharmacy (Central Downtown Hub)
  {
    id: 'shop-pharmacy',
    name: 'MetroCare 24/7 Pharmacy',
    categoryName: 'Pharmacy & First Aid',
    type: 'pharmacy',
    position: [22, 0, -22],
    description: 'Certified clinical pharmacy stocking emergency trauma bandages, medical grade painkillers, and vitamins.',
    tagline: 'Around-the-Clock Healthcare & Emergency Care',
    accentColor: '#06b6d4',
    icon: 'Pill',
    chunkX: 0,
    chunkZ: 0,
    localPos: [22, 0, -22]
  },
  // 4. Saint Jude Memorial General Hospital (North-East Medical Plaza)
  {
    id: 'shop-hospital',
    name: 'Saint Jude Memorial Hospital',
    categoryName: 'General Hospital & Trauma Center',
    type: 'hospital',
    position: [92, 0, 92],
    description: 'Full-service trauma center. Comprehensive medical exams, complete health restoration, and emergency defibrillation.',
    tagline: 'Life-Saving Critical Care & Full Health Healing',
    accentColor: '#ef4444',
    icon: 'HeartPulse',
    chunkX: 1,
    chunkZ: 1,
    localPos: [22, 0, 22]
  },
  // 5. San Andreas City College & Academy (South-West Civic District)
  {
    id: 'shop-school',
    name: 'San Andreas City Academy',
    categoryName: 'Higher Education & Bookstore',
    type: 'school',
    position: [-92, 0, -92],
    description: 'Renowned metropolitan institution. Academic research textbooks, career certification diplomas, and student gear.',
    tagline: 'Knowledge, Prestige & Career Advancement',
    accentColor: '#8b5cf6',
    icon: 'GraduationCap',
    chunkX: -1,
    chunkZ: -1,
    localPos: [-22, 0, -22]
  },
  // 6. Downtown Police Precinct & Armory (Civic West Plaza)
  {
    id: 'shop-police',
    name: 'Downtown Police Precinct & Armory',
    categoryName: 'Tactical Gear & Legal Services',
    type: 'police',
    position: [-92, 0, -22],
    description: 'Metropolitan police headquarters. Heavy tactical kevlar body armor, police radar scanners, and legal bail discharge.',
    tagline: 'Protect & Serve • Tactical Defense & Legal Bail',
    accentColor: '#3b82f6',
    icon: 'ShieldAlert',
    chunkX: -1,
    chunkZ: 0,
    localPos: [-22, 0, -22]
  },
  // 7. Grand Galleria Luxury Shopping Mall (South Shopping Promenade)
  {
    id: 'shop-mall',
    name: 'Grand Galleria Luxury Mall',
    categoryName: 'High-End Retail & Luxury Goods',
    type: 'mall',
    position: [-22, 0, -92],
    description: 'Exclusive multi-level fashion galleria featuring Swiss chronographs, designer Italian leather duffels, and fine jewelry.',
    tagline: 'Elite Haute Couture & Luxury Designer Goods',
    accentColor: '#f59e0b',
    icon: 'Store',
    chunkX: 0,
    chunkZ: -1,
    localPos: [-22, 0, -22]
  },
  // 8. ByteCircuit Tech & Electronics (East Technology Quarter)
  {
    id: 'shop-electronics',
    name: 'ByteCircuit Tech & Electronics',
    categoryName: 'Electronics & Gadgets',
    type: 'electronics',
    position: [92, 0, -22],
    description: 'High-tech electronics store with flagship smartphones, satellite GPS transponders, cyber tools, and 4K cameras.',
    tagline: 'Next-Gen Mobile Hardware & Cyber Tech',
    accentColor: '#00f0ff',
    icon: 'Cpu',
    chunkX: 1,
    chunkZ: 0,
    localPos: [22, 0, -22]
  },
  // 9. Bean & Brew Artisan Coffee Roastery (Downtown Boulevard Corner)
  {
    id: 'shop-cafe',
    name: 'Bean & Brew Artisan Cafe',
    categoryName: 'Artisan Cafe & Bakery',
    type: 'cafe',
    position: [-22, 0, 22],
    description: 'Specialty espresso roastery offering cold brew, caramel macchiatos, warm buttery croissants, and pastries.',
    tagline: 'Handcrafted Espresso & Fresh Bakery Goods',
    accentColor: '#d97706',
    icon: 'Coffee',
    chunkX: 0,
    chunkZ: 0,
    localPos: [-22, 0, 22]
  },
  // 10. Luigi\'s Authentic Brick-Oven Pizzeria (North Downtown Boulevard)
  {
    id: 'shop-pizza',
    name: 'Luigi\'s Brick-Oven Pizzeria',
    categoryName: 'Pizzeria & Trattoria',
    type: 'pizza',
    position: [-22, 0, 92],
    description: 'Wood-fired sourdough pizza, steaming hot pepperoni slices, stuffed calzones, and fresh garlic knots.',
    tagline: 'Authentic Wood-Fired Neapolitan Slices',
    accentColor: '#f97316',
    icon: 'Pizza',
    chunkX: 0,
    chunkZ: 1,
    localPos: [-22, 0, 22]
  },
  // 11. Le Gourmet French Bistro & Steakhouse (North-West Fine Dining Quarter)
  {
    id: 'shop-restaurant',
    name: 'Le Gourmet French Bistro',
    categoryName: 'Fine Dining & Steakhouse',
    type: 'restaurant',
    position: [-92, 0, 92],
    description: 'Upscale fine dining bistro serving 28-day dry-aged wagyu ribeye, pan-seared salmon, and black truffle pasta.',
    tagline: 'Michelin-Caliber Culinary Excellence',
    accentColor: '#ec4899',
    icon: 'UtensilsCrossed',
    chunkX: -1,
    chunkZ: 1,
    localPos: [-22, 0, 22]
  },
  // 12. Cluckin\' Big Burger Shack (South-East Highway Corner)
  {
    id: 'shop-burger',
    name: 'Cluckin\' Big Burger Shack',
    categoryName: 'Fast Food Drive-Thru',
    type: 'burger',
    position: [92, 0, -92],
    description: 'Iconic all-American drive-thru. Triple bacon smash burgers, loaded curly fries, and thick hand-spun vanilla shakes.',
    tagline: 'Juicy Smash Burgers & Crispy Loaded Fries',
    accentColor: '#fbbf24',
    icon: 'Beef',
    chunkX: 1,
    chunkZ: -1,
    localPos: [22, 0, -22]
  }
];

export const ALL_SHOP_ITEMS: InventoryItem[] = [
  // --- 1. GREENLEAF ORGANIC MARKET (Vegetables & Fruits) ---
  {
    id: 'veg-apple',
    name: 'Honeycrisp Organic Apple',
    category: 'food',
    price: 4,
    hungerBonus: 20,
    energyBonus: 10,
    healthBonus: 8,
    description: 'Sweet, crisp, freshly picked organic red apple packed with natural vitamins.',
    shopId: 'shop-vegetable',
    icon: 'Apple'
  },
  {
    id: 'veg-banana',
    name: 'Farm Fresh Banana Bunch',
    category: 'food',
    price: 5,
    hungerBonus: 25,
    energyBonus: 18,
    healthBonus: 5,
    description: 'Potassium-rich ripe bananas providing instant sustained energy.',
    shopId: 'shop-vegetable',
    icon: 'Banana'
  },
  {
    id: 'veg-watermelon',
    name: 'Chilled Watermelon Slice',
    category: 'food',
    price: 7,
    hungerBonus: 30,
    energyBonus: 25,
    healthBonus: 12,
    description: 'Refreshing, ice-cold sweet watermelon slice that hydrates and restores stamina.',
    shopId: 'shop-vegetable',
    icon: 'Citrus'
  },
  {
    id: 'veg-salad',
    name: 'Superfood Power Green Salad',
    category: 'food',
    price: 14,
    hungerBonus: 55,
    energyBonus: 30,
    healthBonus: 25,
    description: 'Crisp baby spinach, kale, avocado, walnuts, and balsamic vinaigrette.',
    shopId: 'shop-vegetable',
    icon: 'Salad'
  },
  {
    id: 'veg-juice',
    name: 'Cold-Pressed Valencia Orange Juice',
    category: 'drink',
    price: 8,
    hungerBonus: 15,
    energyBonus: 40,
    healthBonus: 20,
    description: 'Pure 100% freshly squeezed orange juice bursting with natural Vitamin C.',
    shopId: 'shop-vegetable',
    icon: 'GlassWater'
  },

  // --- 2. IRONWORKS FITNESS CLUB & GYM ---
  {
    id: 'gym-protein',
    name: 'Gold Standard Whey Protein Shake',
    category: 'fitness',
    price: 12,
    hungerBonus: 35,
    energyBonus: 45,
    healthBonus: 15,
    description: '30g premium whey protein isolate with chocolate fudge flavor for muscle recovery.',
    shopId: 'shop-gym',
    icon: 'CupSoda'
  },
  {
    id: 'gym-preworkout',
    name: 'Nitro Surge Pre-Workout Booster',
    category: 'fitness',
    price: 18,
    hungerBonus: 5,
    energyBonus: 85,
    healthBonus: 0,
    description: 'High-caffeine beta-alanine powder delivering maximum sprint stamina and razor focus.',
    shopId: 'shop-gym',
    icon: 'Zap'
  },
  {
    id: 'gym-bar',
    name: 'Titan Peanut Butter Crunch Bar',
    category: 'food',
    price: 6,
    hungerBonus: 40,
    energyBonus: 25,
    healthBonus: 10,
    description: 'Dense protein bar with roasted peanuts, oats, and dark chocolate drizzle.',
    shopId: 'shop-gym',
    icon: 'Nut'
  },
  {
    id: 'gym-pass',
    name: '1-Day VIP High-Intensity Training Pass',
    category: 'fitness',
    price: 150,
    hungerBonus: 0,
    energyBonus: 100,
    healthBonus: 100,
    description: 'Exclusive athletic personal coaching session. Completely restores Health and Stamina to 100%!',
    shopId: 'shop-gym',
    icon: 'Trophy'
  },

  // --- 3. METROCARE 24/7 PHARMACY ---
  {
    id: 'med-painkillers',
    name: 'Painkiller Relief Tablets (10pk)',
    category: 'medical',
    price: 25,
    hungerBonus: 0,
    energyBonus: 10,
    healthBonus: 35,
    description: 'Fast-acting analgesics that rapidly numb pain and heal minor injuries.',
    shopId: 'shop-pharmacy',
    icon: 'Pill'
  },
  {
    id: 'med-bandage',
    name: 'Emergency Sterile Trauma Bandage',
    category: 'medical',
    price: 45,
    hungerBonus: 0,
    energyBonus: 0,
    healthBonus: 60,
    description: 'Medical-grade compression bandage roll that stops bleeding and restores 60 HP.',
    shopId: 'shop-pharmacy',
    icon: 'Bandage'
  },
  {
    id: 'med-vitamin',
    name: 'Immune Shield Daily Vitamins',
    category: 'medical',
    price: 35,
    hungerBonus: 10,
    energyBonus: 40,
    healthBonus: 20,
    description: 'Essential multivitamin dietary complex that boosts stamina and cellular regeneration.',
    shopId: 'shop-pharmacy',
    icon: 'Sparkles'
  },
  {
    id: 'med-firstaid',
    name: 'Compact First Responder Trauma Kit',
    category: 'medical',
    price: 120,
    hungerBonus: 0,
    energyBonus: 30,
    healthBonus: 85,
    description: 'Comprehensive medical pouch with antiseptic, suture strips, and coagulant.',
    shopId: 'shop-pharmacy',
    icon: 'Cross'
  },

  // --- 4. SAINT JUDE MEMORIAL HOSPITAL ---
  {
    id: 'hosp-fullcure',
    name: 'Emergency Trauma Surgery & Full Heal',
    category: 'medical',
    price: 350,
    hungerBonus: 50,
    energyBonus: 100,
    healthBonus: 100,
    description: 'Complete inpatient emergency room trauma overhaul. Instantly restores 100% Health!',
    shopId: 'shop-hospital',
    icon: 'HeartHandshake'
  },
  {
    id: 'hosp-adrenaline',
    name: 'High-Concentration Adrenaline Syringe',
    category: 'medical',
    price: 220,
    hungerBonus: 0,
    energyBonus: 100,
    healthBonus: 40,
    description: 'Emergency epinephrine injector that triggers an instant sprint rush and overrides exhaustion.',
    shopId: 'shop-hospital',
    icon: 'Syringe'
  },
  {
    id: 'hosp-physical',
    name: 'Comprehensive Executive Medical Exam',
    category: 'medical',
    price: 600,
    hungerBonus: 100,
    energyBonus: 100,
    healthBonus: 100,
    armorBonus: 100,
    description: 'Full-body wellness scan and revitalization. Restores Health to 100 and equips 100 Body Armor!',
    shopId: 'shop-hospital',
    icon: 'Activity'
  },

  // --- 5. SAN ANDREAS CITY ACADEMY & SCHOOL ---
  {
    id: 'edu-handbook',
    name: 'Metropolitan Student Handbook',
    category: 'education',
    price: 120,
    hungerBonus: 0,
    energyBonus: 20,
    description: 'Comprehensive collegiate guide to city commerce and careers (+350 XP Reward!).',
    shopId: 'shop-school',
    icon: 'BookOpen'
  },
  {
    id: 'edu-atlas',
    name: 'Advanced Urban Navigation Atlas',
    category: 'education',
    price: 280,
    hungerBonus: 0,
    energyBonus: 30,
    description: 'Master topological cartography detailing speed traps and optimal routes (+750 XP!).',
    shopId: 'shop-school',
    icon: 'Compass'
  },
  {
    id: 'edu-backpack',
    name: 'Heavy-Duty Reinforced Canvas Backpack',
    category: 'tool',
    price: 380,
    hungerBonus: 0,
    energyBonus: 0,
    description: 'Durable multi-compartment bookbag allowing you to carry more items effortlessly.',
    shopId: 'shop-school',
    icon: 'Backpack'
  },
  {
    id: 'edu-diploma',
    name: 'Executive Honors Graduate Certificate',
    category: 'education',
    price: 1200,
    hungerBonus: 0,
    energyBonus: 50,
    description: 'Official San Andreas Academy Graduation Degree (+2,500 Career XP bonus!).',
    shopId: 'shop-school',
    icon: 'GraduationCap'
  },

  // --- 6. DOWNTOWN POLICE PRECINCT & ARMORY ---
  {
    id: 'cop-armor-light',
    name: 'Patrol Kevlar Ballistic Vest',
    category: 'tactical',
    price: 350,
    armorBonus: 50,
    description: 'Level II concealed ballistic vest providing +50 Body Armor protection.',
    shopId: 'shop-police',
    icon: 'Shield'
  },
  {
    id: 'cop-armor-heavy',
    name: 'SWAT Heavy Interceptor Tactical Armor',
    category: 'tactical',
    price: 750,
    armorBonus: 100,
    description: 'Military-grade ceramic plate armor vest providing maximum +100 Body Armor!',
    shopId: 'shop-police',
    icon: 'ShieldCheck'
  },
  {
    id: 'cop-bail',
    name: 'Official City Legal Bail Discharge',
    category: 'tactical',
    price: 1500,
    wantedBonus: -5,
    description: 'Instant court legal clearance that dismisses all police pursuit and clears Wanted stars!',
    shopId: 'shop-police',
    icon: 'Gavel'
  },
  {
    id: 'cop-scanner',
    name: 'Police Frequency Radar Detector',
    category: 'electronics',
    price: 520,
    energyBonus: 10,
    description: 'Vehicle dashboard radio scanner that alerts you to patrol car sirens and speed cameras.',
    shopId: 'shop-police',
    icon: 'Radio'
  },

  // --- 7. GRAND GALLERIA LUXURY SHOPPING MALL ---
  {
    id: 'mall-watch',
    name: 'Swiss Chronograph Automatic Watch',
    category: 'luxury',
    price: 2800,
    energyBonus: 20,
    description: 'Handcrafted sapphire crystal timepiece commanding instant prestige (+1000 XP!).',
    shopId: 'shop-mall',
    icon: 'Watch'
  },
  {
    id: 'mall-chain',
    name: '18K Solid Gold Cuban Link Necklace',
    category: 'luxury',
    price: 4200,
    energyBonus: 30,
    description: 'Bold luxury gold necklace worn by Los Santos elites (+1500 Street Reputation!).',
    shopId: 'shop-mall',
    icon: 'Gem'
  },
  {
    id: 'mall-duffel',
    name: 'Italian Monogram Leather Duffel',
    category: 'tool',
    price: 1600,
    description: 'Designer full-grain calfskin travel luggage with spacious storage capacity.',
    shopId: 'shop-mall',
    icon: 'Briefcase'
  },
  {
    id: 'mall-headphones',
    name: 'Noise-Cancelling Studio Audio Headphones',
    category: 'electronics',
    price: 750,
    energyBonus: 25,
    description: 'Audiophile planar magnetic wireless headphones with spatial sound immersion.',
    shopId: 'shop-mall',
    icon: 'Headphones'
  },

  // --- 8. BYTECIRCUIT TECH & ELECTRONICS ---
  {
    id: 'tech-phone',
    name: 'Smartphone Ultra Titanium Pro Max',
    category: 'electronics',
    price: 1399,
    energyBonus: 30,
    description: 'Cutting-edge flagship mobile device with 120Hz OLED screen and remote garage sync.',
    shopId: 'shop-electronics',
    icon: 'Smartphone'
  },
  {
    id: 'tech-powerbank',
    name: '30,000mAh Ultra-Fast Power Bank',
    category: 'electronics',
    price: 85,
    energyBonus: 20,
    description: 'High-density portable magnetic charger with rapid delivery for all tech gear.',
    shopId: 'shop-electronics',
    icon: 'BatteryCharging'
  },
  {
    id: 'tech-gps',
    name: 'High-Gain Satellite GPS Transponder',
    category: 'electronics',
    price: 450,
    energyBonus: 15,
    description: 'Military-precision GPS antenna that sharpens waypoint tracking on the radar.',
    shopId: 'shop-electronics',
    icon: 'Navigation'
  },
  {
    id: 'tech-camera',
    name: '4K Extreme Action Stunt Camera',
    category: 'electronics',
    price: 480,
    description: 'Rugged waterproof sports action camera for capturing aerial stunt jumps.',
    shopId: 'shop-electronics',
    icon: 'Camera'
  },

  // --- 9. BEAN & BREW ARTISAN COFFEE ROASTERY ---
  {
    id: 'cafe-espresso',
    name: 'Double Shot Artisan Espresso',
    category: 'drink',
    price: 5,
    hungerBonus: 5,
    energyBonus: 40,
    description: 'Intense, velvety Italian espresso with a rich golden crema layer.',
    shopId: 'shop-cafe',
    icon: 'Coffee'
  },
  {
    id: 'cafe-latte',
    name: 'Iced Caramel Cloud Foam Latte',
    category: 'drink',
    price: 7,
    hungerBonus: 15,
    energyBonus: 50,
    description: 'Chilled espresso over creamy oat milk with salted caramel cold foam.',
    shopId: 'shop-cafe',
    icon: 'CupSoda'
  },
  {
    id: 'cafe-croissant',
    name: 'Warm Flaky French Butter Croissant',
    category: 'food',
    price: 5,
    hungerBonus: 35,
    energyBonus: 10,
    description: 'Golden, crispy, laminated all-butter pastry freshly baked this morning.',
    shopId: 'shop-cafe',
    icon: 'Cookie'
  },
  {
    id: 'cafe-muffin',
    name: 'Wild Blueberry Streusel Muffin',
    category: 'food',
    price: 6,
    hungerBonus: 40,
    energyBonus: 15,
    description: 'Bursting with tart mountain blueberries and topped with crunchy brown sugar.',
    shopId: 'shop-cafe',
    icon: 'Cake'
  },

  // --- 10. LUIGI\'S AUTHENTIC BRICK-OVEN PIZZERIA ---
  {
    id: 'pizza-slice',
    name: 'Hot Crispy Pepperoni Slice',
    category: 'food',
    price: 6,
    hungerBonus: 45,
    energyBonus: 15,
    healthBonus: 15,
    description: 'Foldable New York slice loaded with spicy cupped pepperoni and melted mozzarella.',
    shopId: 'shop-pizza',
    icon: 'Pizza'
  },
  {
    id: 'pizza-pie',
    name: '18" Grand Margherita Brick-Oven Whole Pie',
    category: 'food',
    price: 26,
    hungerBonus: 100,
    energyBonus: 40,
    healthBonus: 50,
    description: 'Family-size wood-fired pizza with San Marzano tomato sauce, fresh buffalo mozzarella, and basil.',
    shopId: 'shop-pizza',
    icon: 'Pizza'
  },
  {
    id: 'pizza-knots',
    name: 'House Garlic Herb Knots Basket',
    category: 'food',
    price: 8,
    hungerBonus: 40,
    energyBonus: 10,
    description: 'Warm dough knots tossed in extra virgin olive oil, minced garlic, parsley, and parmesan.',
    shopId: 'shop-pizza',
    icon: 'Utensils'
  },
  {
    id: 'pizza-calzone',
    name: 'Stuffed Meat Lovers Baked Calzone',
    category: 'food',
    price: 16,
    hungerBonus: 70,
    energyBonus: 20,
    healthBonus: 25,
    description: 'Golden baked turnover packed with Italian sausage, bacon, pepperoni, and ricotta.',
    shopId: 'shop-pizza',
    icon: 'Sandwich'
  },

  // --- 11. LE GOURMET FRENCH BISTRO & STEAKHOUSE ---
  {
    id: 'rest-steak',
    name: 'Prime 28-Day Dry-Aged Wagyu Ribeye',
    category: 'food',
    price: 95,
    hungerBonus: 100,
    energyBonus: 50,
    healthBonus: 65,
    description: '16oz seared ribeye basted in rosemary truffle butter with roasted bone marrow.',
    shopId: 'shop-restaurant',
    icon: 'Beef'
  },
  {
    id: 'rest-salmon',
    name: 'Pan-Seared Atlantic Salmon Fillet',
    category: 'food',
    price: 68,
    hungerBonus: 85,
    energyBonus: 35,
    healthBonus: 45,
    description: 'Crispy skin salmon served over creamy dill risotto and charred asparagus spears.',
    shopId: 'shop-restaurant',
    icon: 'Fish'
  },
  {
    id: 'rest-pasta',
    name: 'Black Truffle Tagliatelle Alfredo',
    category: 'food',
    price: 54,
    hungerBonus: 80,
    energyBonus: 25,
    healthBonus: 30,
    description: 'Handmade fresh egg pasta swirled in 24-month aged parmigiano-reggiano and shaved black truffles.',
    shopId: 'shop-restaurant',
    icon: 'UtensilsCrossed'
  },
  {
    id: 'rest-creme',
    name: 'Classic Tahitian Vanilla Crème Brûlée',
    category: 'food',
    price: 20,
    hungerBonus: 45,
    energyBonus: 30,
    healthBonus: 20,
    description: 'Velvety chilled custard topped with a brittle layer of fire-torched caramelized sugar.',
    shopId: 'shop-restaurant',
    icon: 'Flame'
  },

  // --- 12. CLUCKIN\' BIG BURGER SHACK ---
  {
    id: 'burger-triple',
    name: 'Triple Bacon Angus Smash Burger',
    category: 'food',
    price: 14,
    hungerBonus: 75,
    energyBonus: 20,
    healthBonus: 20,
    description: 'Three crispy lacy-edge angus patties with smoked applewood bacon, American cheese, and secret sauce.',
    shopId: 'shop-burger',
    icon: 'Beef'
  },
  {
    id: 'burger-fries',
    name: 'Loaded Cajun Seasoned Curly Fries',
    category: 'food',
    price: 6,
    hungerBonus: 40,
    energyBonus: 15,
    description: 'Crisp golden spiral-cut potatoes generously coated in spicy Louisiana seasonings.',
    shopId: 'shop-burger',
    icon: 'Sparkles'
  },
  {
    id: 'burger-shake',
    name: 'Thick Hand-Spun Vanilla Bean Milkshake',
    category: 'drink',
    price: 7,
    hungerBonus: 30,
    energyBonus: 60,
    description: 'Ultra-creamy custard milkshake churned with real Madagascar vanilla and whipped cream.',
    shopId: 'shop-burger',
    icon: 'CupSoda'
  },
  {
    id: 'burger-combo',
    name: 'Grand Cluckin\' Deluxe Value Feast',
    category: 'food',
    price: 22,
    hungerBonus: 100,
    energyBonus: 50,
    healthBonus: 35,
    description: 'Double burger, large curly fries, crispy tenders, and a jumbo fountain drink. Complete restoration!',
    shopId: 'shop-burger',
    icon: 'ShoppingBag'
  }
];
