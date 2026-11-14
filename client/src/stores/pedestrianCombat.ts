import { create } from 'zustand';
import { soundSystem } from '../audio/soundSystem';
import { useGameStore } from './gameStore';
import { playerPhysics, vehiclePhysics } from './vehiclePhysics';

export type NpcRole = 'civilian' | 'gangster' | 'police';
export type NpcState = 'walking' | 'attacking_player' | 'attacking_npc' | 'fleeing' | 'dead';
export type WeaponType = 'fists' | 'bat' | 'pistol';

export interface NpcEntity {
  id: string;
  name: string;
  role: NpcRole;
  x: number;
  y: number;
  z: number;
  rotationY: number;
  minZ: number;
  maxZ: number;
  dir: number; // 1 or -1
  speed: number;
  health: number; // 0 - 100
  maxHealth: number;
  state: NpcState;
  targetId: string | null; // target NPC id if attacking_npc
  attackCooldown: number; // seconds until next attack
  deadTimer: number; // time since death (for ragdoll & respawn)
  weapon: WeaponType;
  shirtColor: string;
  pantsColor: string;
  skinColor: string;
  hairColor: string;
  knockbackX: number;
  knockbackZ: number;
  fleeTimer: number;
}

export interface CashDrop {
  id: string;
  x: number;
  y: number;
  z: number;
  amount: number;
  collected: boolean;
}

// Initial Population of Living Metropolitans across the City Blocks
const INITIAL_NPCS: NpcEntity[] = [
  // --- Starter Street & Downtown Hub Pedestrians (Immediately around Player Starter Loft [60, 0, -32]) ---
  {
    id: 'npc-starter-1',
    name: 'Tony "Knuckles" Moretti',
    role: 'gangster',
    x: 58,
    y: 0,
    z: -24,
    rotationY: Math.PI,
    minZ: -40,
    maxZ: -10,
    dir: -1,
    speed: 2.1,
    health: 120,
    maxHealth: 120,
    state: 'walking',
    targetId: null,
    attackCooldown: 0,
    deadTimer: 0,
    weapon: 'bat',
    shirtColor: '#7f1d1d',
    pantsColor: '#18181b',
    skinColor: '#d4a373',
    hairColor: '#09090b',
    knockbackX: 0,
    knockbackZ: 0,
    fleeTimer: 0
  },
  {
    id: 'npc-starter-2',
    name: 'Officer Martinez',
    role: 'police',
    x: 62,
    y: 0,
    z: -18,
    rotationY: 0,
    minZ: -35,
    maxZ: -5,
    dir: 1,
    speed: 2.2,
    health: 140,
    maxHealth: 140,
    state: 'walking',
    targetId: null,
    attackCooldown: 0,
    deadTimer: 0,
    weapon: 'pistol',
    shirtColor: '#1e3a8a',
    pantsColor: '#0f172a',
    skinColor: '#fed7aa',
    hairColor: '#1e293b',
    knockbackX: 0,
    knockbackZ: 0,
    fleeTimer: 0
  },
  {
    id: 'npc-starter-3',
    name: 'Samantha Reed',
    role: 'civilian',
    x: 55,
    y: 0,
    z: -34,
    rotationY: 0,
    minZ: -48,
    maxZ: -18,
    dir: 1,
    speed: 1.7,
    health: 100,
    maxHealth: 100,
    state: 'walking',
    targetId: null,
    attackCooldown: 0,
    deadTimer: 0,
    weapon: 'fists',
    shirtColor: '#ec4899',
    pantsColor: '#334155',
    skinColor: '#fde047',
    hairColor: '#b45309',
    knockbackX: 0,
    knockbackZ: 0,
    fleeTimer: 0
  },
  {
    id: 'npc-starter-4',
    name: 'Jack "Viper" Carver',
    role: 'gangster',
    x: 66,
    y: 0,
    z: -38,
    rotationY: Math.PI,
    minZ: -50,
    maxZ: -20,
    dir: -1,
    speed: 2.0,
    health: 110,
    maxHealth: 110,
    state: 'walking',
    targetId: null,
    attackCooldown: 0,
    deadTimer: 0,
    weapon: 'pistol',
    shirtColor: '#1e1b4b',
    pantsColor: '#991b1b',
    skinColor: '#e0a96d',
    hairColor: '#000000',
    knockbackX: 0,
    knockbackZ: 0,
    fleeTimer: 0
  },

  // Downtown Business District Civilians & Shoppers
  {
    id: 'npc-1',
    name: 'Marcus Vance',
    role: 'civilian',
    x: 38,
    y: 0,
    z: 22,
    rotationY: 0,
    minZ: 10,
    maxZ: 50,
    dir: 1,
    speed: 1.8,
    health: 100,
    maxHealth: 100,
    state: 'walking',
    targetId: null,
    attackCooldown: 0,
    deadTimer: 0,
    weapon: 'fists',
    shirtColor: '#ef4444',
    pantsColor: '#1e293b',
    skinColor: '#fde047',
    hairColor: '#18181b',
    knockbackX: 0,
    knockbackZ: 0,
    fleeTimer: 0
  },
  {
    id: 'npc-2',
    name: 'Elena Rostova',
    role: 'civilian',
    x: 38,
    y: 0,
    z: 42,
    rotationY: Math.PI,
    minZ: 14,
    maxZ: 56,
    dir: -1,
    speed: 1.6,
    health: 100,
    maxHealth: 100,
    state: 'walking',
    targetId: null,
    attackCooldown: 0,
    deadTimer: 0,
    weapon: 'fists',
    shirtColor: '#3b82f6',
    pantsColor: '#475569',
    skinColor: '#fed7aa',
    hairColor: '#78350f',
    knockbackX: 0,
    knockbackZ: 0,
    fleeTimer: 0
  },
  {
    id: 'npc-3',
    name: 'Devon Hayes',
    role: 'civilian',
    x: -38,
    y: 0,
    z: 28,
    rotationY: 0,
    minZ: 14,
    maxZ: 58,
    dir: 1,
    speed: 1.9,
    health: 100,
    maxHealth: 100,
    state: 'walking',
    targetId: null,
    attackCooldown: 0,
    deadTimer: 0,
    weapon: 'fists',
    shirtColor: '#10b981',
    pantsColor: '#0f172a',
    skinColor: '#fcd34d',
    hairColor: '#0f172a',
    knockbackX: 0,
    knockbackZ: 0,
    fleeTimer: 0
  },

  // Downtown Southside Gangsters (Tough & Aggressive)
  {
    id: 'npc-gang-1',
    name: 'Jax "Razor" Stone',
    role: 'gangster',
    x: -38,
    y: 0,
    z: 45,
    rotationY: Math.PI,
    minZ: 20,
    maxZ: 60,
    dir: -1,
    speed: 2.1,
    health: 120,
    maxHealth: 120,
    state: 'walking',
    targetId: null,
    attackCooldown: 0,
    deadTimer: 0,
    weapon: 'bat',
    shirtColor: '#18181b',
    pantsColor: '#7f1d1d',
    skinColor: '#e0a96d',
    hairColor: '#000000',
    knockbackX: 0,
    knockbackZ: 0,
    fleeTimer: 0
  },
  {
    id: 'npc-gang-2',
    name: 'Trey "Viper" Cole',
    role: 'gangster',
    x: -38,
    y: 0,
    z: 32,
    rotationY: 0,
    minZ: 16,
    maxZ: 52,
    dir: 1,
    speed: 2.0,
    health: 110,
    maxHealth: 110,
    state: 'walking',
    targetId: null,
    attackCooldown: 0,
    deadTimer: 0,
    weapon: 'pistol',
    shirtColor: '#450a0a',
    pantsColor: '#172554',
    skinColor: '#d4a373',
    hairColor: '#1e293b',
    knockbackX: 0,
    knockbackZ: 0,
    fleeTimer: 0
  },

  // Police Precinct Patrol Officers (Protectors of Law)
  {
    id: 'npc-cop-1',
    name: 'Officer Davis',
    role: 'police',
    x: -70,
    y: 0,
    z: 22,
    rotationY: 0,
    minZ: 10,
    maxZ: 40,
    dir: 1,
    speed: 2.2,
    health: 140,
    maxHealth: 140,
    state: 'walking',
    targetId: null,
    attackCooldown: 0,
    deadTimer: 0,
    weapon: 'pistol',
    shirtColor: '#1e3a8a',
    pantsColor: '#0f172a',
    skinColor: '#fde047',
    hairColor: '#451a03',
    knockbackX: 0,
    knockbackZ: 0,
    fleeTimer: 0
  },
  {
    id: 'npc-cop-2',
    name: 'Sergeant Miller',
    role: 'police',
    x: -70,
    y: 0,
    z: 35,
    rotationY: Math.PI,
    minZ: 12,
    maxZ: 42,
    dir: -1,
    speed: 2.2,
    health: 140,
    maxHealth: 140,
    state: 'walking',
    targetId: null,
    attackCooldown: 0,
    deadTimer: 0,
    weapon: 'bat',
    shirtColor: '#1e3a8a',
    pantsColor: '#0f172a',
    skinColor: '#fed7aa',
    hairColor: '#1c1917',
    knockbackX: 0,
    knockbackZ: 0,
    fleeTimer: 0
  },

  // North Commercial Strip & Market Pedestrians
  {
    id: 'npc-4',
    name: 'Chloe Bennett',
    role: 'civilian',
    x: 10,
    y: 0,
    z: -38,
    rotationY: 0,
    minZ: -55,
    maxZ: -20,
    dir: 1,
    speed: 1.7,
    health: 100,
    maxHealth: 100,
    state: 'walking',
    targetId: null,
    attackCooldown: 0,
    deadTimer: 0,
    weapon: 'fists',
    shirtColor: '#eab308',
    pantsColor: '#1e293b',
    skinColor: '#fde047',
    hairColor: '#b45309',
    knockbackX: 0,
    knockbackZ: 0,
    fleeTimer: 0
  },
  {
    id: 'npc-5',
    name: 'Lucas Wright',
    role: 'civilian',
    x: -10,
    y: 0,
    z: -38,
    rotationY: Math.PI,
    minZ: -50,
    maxZ: -15,
    dir: -1,
    speed: 1.5,
    health: 100,
    maxHealth: 100,
    state: 'walking',
    targetId: null,
    attackCooldown: 0,
    deadTimer: 0,
    weapon: 'fists',
    shirtColor: '#8b5cf6',
    pantsColor: '#334155',
    skinColor: '#fed7aa',
    hairColor: '#1e293b',
    knockbackX: 0,
    knockbackZ: 0,
    fleeTimer: 0
  },
  {
    id: 'npc-6',
    name: 'Samantha Reed',
    role: 'civilian',
    x: 62,
    y: 0,
    z: -25,
    rotationY: 0,
    minZ: -45,
    maxZ: -10,
    dir: 1,
    speed: 2.0,
    health: 100,
    maxHealth: 100,
    state: 'walking',
    targetId: null,
    attackCooldown: 0,
    deadTimer: 0,
    weapon: 'fists',
    shirtColor: '#ec4899',
    pantsColor: '#18181b',
    skinColor: '#fcd34d',
    hairColor: '#3b82f6',
    knockbackX: 0,
    knockbackZ: 0,
    fleeTimer: 0
  },

  // East Side Hustler Gangster
  {
    id: 'npc-gang-3',
    name: 'Rico "Scar" Mendez',
    role: 'gangster',
    x: 62,
    y: 0,
    z: -15,
    rotationY: Math.PI,
    minZ: -40,
    maxZ: 0,
    dir: -1,
    speed: 2.2,
    health: 120,
    maxHealth: 120,
    state: 'walking',
    targetId: null,
    attackCooldown: 0,
    deadTimer: 0,
    weapon: 'bat',
    shirtColor: '#0284c7',
    pantsColor: '#09090b',
    skinColor: '#c68642',
    hairColor: '#09090b',
    knockbackX: 0,
    knockbackZ: 0,
    fleeTimer: 0
  },

  // Metro Hospital Security Guard
  {
    id: 'npc-cop-3',
    name: 'Guard Jackson',
    role: 'police',
    x: 10,
    y: 0,
    z: -140,
    rotationY: 0,
    minZ: -155,
    maxZ: -125,
    dir: 1,
    speed: 2.0,
    health: 130,
    maxHealth: 130,
    state: 'walking',
    targetId: null,
    attackCooldown: 0,
    deadTimer: 0,
    weapon: 'bat',
    shirtColor: '#1e3a8a',
    pantsColor: '#0f172a',
    skinColor: '#8d5524',
    hairColor: '#0f172a',
    knockbackX: 0,
    knockbackZ: 0,
    fleeTimer: 0
  }
];

interface PedestrianCombatState {
  npcs: NpcEntity[];
  cashDrops: CashDrop[];
  lastCombatFeedback: { message: string; type: 'hit' | 'kill' | 'danger'; timestamp: number } | null;

  // Actions
  playerAttack: (weapon?: WeaponType) => void;
  playerVehicleHit: (npcId: string, speed: number, heading: number) => void;
  damageNpc: (npcId: string, amount: number, attackerRole?: 'player' | 'npc' | 'vehicle') => void;
  clearPolicePursuit: () => void;
  collectCashDrop: (dropId: string) => void;
  updateCombatLoop: (dt: number) => void;
}

export const usePedestrianStore = create<PedestrianCombatState>((set, get) => ({
  npcs: INITIAL_NPCS,
  cashDrops: [],
  lastCombatFeedback: null,

  /**
   * Player initiates attack (punch, bat strike, or gunshot)
   */
  playerAttack: (weapon = 'fists') => {
    soundSystem.init();
    soundSystem.resume();

    const state = useGameStore.getState();
    if (state.mode !== 'walking' || state.isWasted) return;

    const px = playerPhysics.pos.x;
    const pz = playerPhysics.pos.z;
    const pRot = playerPhysics.rotationY;

    if (weapon === 'pistol') {
      soundSystem.playGunshot();
    } else {
      soundSystem.playPunchSwing();
    }

    // Forward direction of player (character front faces +Z in local space, rotated by pRot)
    const fwdX = Math.sin(pRot);
    const fwdZ = Math.cos(pRot);

    const hitRange = weapon === 'pistol' ? 24.0 : weapon === 'bat' ? 3.4 : 2.6;
    const damage = weapon === 'pistol' ? 85 : weapon === 'bat' ? 60 : 40;

    let hitNpc: NpcEntity | null = null;
    let minDistance = hitRange;

    // Scan NPCs in front of or immediately adjacent to player
    for (const npc of get().npcs) {
      if (npc.state === 'dead') continue;

      const dx = npc.x - px;
      const dz = npc.z - pz;
      const dist = Math.hypot(dx, dz);

      if (dist <= hitRange) {
        // Dot product to check if NPC is within a 150-degree cone in front of player
        const dot = (dx * fwdX + dz * fwdZ) / (dist || 1);
        // Generous angle tolerance: hit if in front (dot > 0.1) or point-blank (dist < 1.6)
        if ((dot > 0.1 || dist < 1.6) && dist < minDistance) {
          minDistance = dist;
          hitNpc = npc;
        }
      }
    }

    if (hitNpc) {
      soundSystem.playPunchHit();
      get().damageNpc(hitNpc.id, damage, 'player');

      // Knockback away from player
      const angle = Math.atan2(hitNpc.z - pz, hitNpc.x - px);
      set((s) => ({
        npcs: s.npcs.map((n) =>
          n.id === hitNpc!.id
            ? {
                ...n,
                knockbackX: Math.cos(angle) * (weapon === 'pistol' ? 4 : 3),
                knockbackZ: Math.sin(angle) * (weapon === 'pistol' ? 4 : 3)
              }
            : n
        )
      }));
    }
  },

  /**
   * High-speed vehicle collision with NPC
   */
  playerVehicleHit: (npcId, speed, heading) => {
    const damage = Math.round(Math.min(150, Math.max(30, speed * 1.8)));
    soundSystem.playPunchHit();
    get().damageNpc(npcId, damage, 'vehicle');

    const fwdX = -Math.sin(heading);
    const fwdZ = -Math.cos(heading);
    set((s) => ({
      npcs: s.npcs.map((n) =>
        n.id === npcId
          ? {
              ...n,
              knockbackX: fwdX * 6,
              knockbackZ: fwdZ * 6
            }
          : n
      )
    }));
  },

  /**
   * Applies damage to an NPC (from player or another NPC)
   */
  damageNpc: (npcId, amount, attackerRole = 'player') => {
    const currentNpcs = get().npcs;
    const target = currentNpcs.find((n) => n.id === npcId);
    if (!target || target.state === 'dead') return;

    const newHealth = Math.max(0, target.health - amount);
    const isKilled = newHealth === 0;

    // Whenever player attacks ANY NPC, alert police and raise wanted level!
    if (attackerRole === 'player') {
      const curWanted = useGameStore.getState().wantedLevel;
      const newWanted = isKilled
        ? Math.min(5, Math.max(1, curWanted + (target.role === 'police' ? 2 : 1)))
        : Math.min(5, Math.max(1, curWanted + (target.role === 'police' ? 2 : 1)));
      useGameStore.getState().setWantedLevel(newWanted);
      soundSystem.playSirenStinger();

      if (isKilled) {
        soundSystem.playNpcDefeated();
      }
    }

    if (isKilled) {
      // Spawn Cash Drop at dead body
      const cashAmount = Math.floor(Math.random() * 85) + 35; // $35 - $120
      const newCashDrop: CashDrop = {
        id: `cash-${Date.now()}-${Math.random()}`,
        x: target.x,
        y: 0.35,
        z: target.z,
        amount: cashAmount,
        collected: false
      };

      if (attackerRole === 'player') {
        const curWanted = useGameStore.getState().wantedLevel;
        useGameStore.getState().showNotification(
          '💀 TARGET ELIMINATED',
          `${target.name} (${target.role.toUpperCase()}) downed! Cash: +$${cashAmount}! Wanted Level: ${'⭐'.repeat(curWanted)} | Press [Ctrl+P] to call off police`,
          'warning'
        );
      }

      set((s) => {
        // When player kills someone, ALL police officers pursue player!
        const px = playerPhysics.pos.x;
        const pz = playerPhysics.pos.z;

        const updatedNpcs = s.npcs.map((n) => {
          if (n.id === npcId) {
            return {
              ...n,
              health: 0,
              state: 'dead' as NpcState,
              deadTimer: 0
            };
          }
          if (attackerRole === 'player' && n.role === 'police' && n.state !== 'dead') {
            return {
              ...n,
              state: 'attacking_player' as NpcState
            };
          }
          return n;
        });

        // If no police officer is within 45m, dispatch an immediate responding police unit!
        const hasNearbyCop = updatedNpcs.some(
          (n) => n.role === 'police' && n.state !== 'dead' && Math.hypot(n.x - px, n.z - pz) < 45
        );

        if (attackerRole === 'player' && !hasNearbyCop) {
          const dispatchedCop: NpcEntity = {
            id: `npc-police-backup-${Date.now()}`,
            name: 'Officer Kowalski (Unit 4)',
            role: 'police',
            x: px + (Math.random() > 0.5 ? 24 : -24),
            y: 0,
            z: pz + (Math.random() > 0.5 ? 24 : -24),
            rotationY: 0,
            minZ: pz - 45,
            maxZ: pz + 45,
            dir: 1,
            speed: 2.3,
            health: 140,
            maxHealth: 140,
            state: 'attacking_player',
            targetId: null,
            attackCooldown: 0.4,
            deadTimer: 0,
            weapon: 'pistol',
            shirtColor: '#1e3a8a',
            pantsColor: '#0f172a',
            skinColor: '#fed7aa',
            hairColor: '#1c1917',
            knockbackX: 0,
            knockbackZ: 0,
            fleeTimer: 0
          };
          updatedNpcs.push(dispatchedCop);
        }

        return {
          npcs: updatedNpcs,
          cashDrops: [...s.cashDrops, newCashDrop]
        };
      });
    } else {
      // NPC was damaged (not killed)
      let nextState: NpcState = target.state;
      if (attackerRole === 'player') {
        if (target.role === 'gangster' || target.role === 'police') {
          nextState = 'attacking_player';
        } else {
          // 30% chance civilian fights back, 70% flees
          nextState = Math.random() < 0.3 ? 'attacking_player' : 'fleeing';
        }

        const curWanted = useGameStore.getState().wantedLevel;
        useGameStore.getState().showNotification(
          '🚨 POLICE PURSUIT INITIATED',
          `Assault reported! Police units are in pursuit! Wanted Level: ${'⭐'.repeat(curWanted)} | Press [Ctrl+P] to call off police`,
          'warning'
        );
      }

      set((s) => {
        const px = playerPhysics.pos.x;
        const pz = playerPhysics.pos.z;

        const updatedNpcs = s.npcs.map((n) => {
          if (n.id === npcId) {
            return {
              ...n,
              health: newHealth,
              state: nextState,
              fleeTimer: nextState === 'fleeing' ? 8.0 : 0
            };
          }

          // When player attacks ANY NPC, ALL police officers immediately come after player!
          if (attackerRole === 'player' && n.role === 'police' && n.state !== 'dead') {
            return {
              ...n,
              state: 'attacking_player' as NpcState
            };
          }

          // If a gangster was attacked, nearby gang members swarm
          if (attackerRole === 'player' && n.role === 'gangster' && target.role === 'gangster' && n.state === 'walking') {
            const dist = Math.hypot(n.x - target.x, n.z - target.z);
            if (dist < 18.0) {
              return { ...n, state: 'attacking_player' as NpcState };
            }
          }

          return n;
        });

        // If no police officer is within 45m, dispatch an immediate responding police unit!
        const hasNearbyCop = updatedNpcs.some(
          (n) => n.role === 'police' && n.state !== 'dead' && Math.hypot(n.x - px, n.z - pz) < 45
        );

        if (attackerRole === 'player' && !hasNearbyCop) {
          const dispatchedCop: NpcEntity = {
            id: `npc-police-backup-${Date.now()}`,
            name: 'Officer Kowalski (Unit 4)',
            role: 'police',
            x: px + (Math.random() > 0.5 ? 24 : -24),
            y: 0,
            z: pz + (Math.random() > 0.5 ? 24 : -24),
            rotationY: 0,
            minZ: pz - 45,
            maxZ: pz + 45,
            dir: 1,
            speed: 2.3,
            health: 140,
            maxHealth: 140,
            state: 'attacking_player',
            targetId: null,
            attackCooldown: 0.4,
            deadTimer: 0,
            weapon: 'pistol',
            shirtColor: '#1e3a8a',
            pantsColor: '#0f172a',
            skinColor: '#fed7aa',
            hairColor: '#1c1917',
            knockbackX: 0,
            knockbackZ: 0,
            fleeTimer: 0
          };
          updatedNpcs.push(dispatchedCop);
        }

        return { npcs: updatedNpcs };
      });
    }
  },

  /**
   * Cheat code / Police clearance (Ctrl + P)
   * All police officers and hostile NPCs immediately call off pursuit and resume standard peaceful patrol.
   */
  clearPolicePursuit: () => {
    soundSystem.playRadioCallOff();
    useGameStore.getState().setWantedLevel(0);
    useGameStore.getState().showNotification(
      '🚓 PEACE RESTORED',
      'Pursuit called off (Ctrl+P). All NPCs returned to peaceful patrol.',
      'success'
    );
    set((s) => ({
      npcs: s.npcs.map((n) =>
        n.state === 'attacking_player' || n.state === 'attacking_npc'
          ? {
              ...n,
              state: 'walking' as NpcState,
              targetId: null,
              attackCooldown: 0
            }
          : n
      )
    }));
  },

  /**
   * Player collects cash dropped on ground
   */
  collectCashDrop: (dropId) => {
    const drop = get().cashDrops.find((d) => d.id === dropId);
    if (!drop || drop.collected) return;

    soundSystem.playCashRegister();
    useGameStore.getState().addCash(drop.amount);

    set((s) => ({
      cashDrops: s.cashDrops.filter((d) => d.id !== dropId)
    }));
  },

  /**
   * Main NPC AI, Combat & Life Loop (called every frame)
   */
  updateCombatLoop: (dt: number) => {
    const gameState = useGameStore.getState();
    const isPlayerDriving = gameState.mode === 'driving';
    const px = isPlayerDriving ? vehiclePhysics.pos.x : playerPhysics.pos.x;
    const pz = isPlayerDriving ? vehiclePhysics.pos.z : playerPhysics.pos.z;
    const isPlayerDead = gameState.isWasted;

    // Check cash pickups proximity
    const drops = get().cashDrops;
    for (const drop of drops) {
      if (!drop.collected) {
        const d = Math.hypot(px - drop.x, pz - drop.z);
        if (d < 2.0) {
          get().collectCashDrop(drop.id);
        }
      }
    }

    set((s) => {
      let playerDamagedThisTick = false;
      let playerDamageAmount = 0;
      let attackerName = '';

      const updatedNpcs = s.npcs.map((npc) => {
        // Handle knockback dampening
        let curX = npc.x + npc.knockbackX * dt * 4;
        let curZ = npc.z + npc.knockbackZ * dt * 4;
        const newKnockX = npc.knockbackX * Math.max(0, 1 - dt * 6);
        const newKnockZ = npc.knockbackZ * Math.max(0, 1 - dt * 6);

        // 1. DEAD STATE: Lying on ground, count timer, respawn after 14s
        if (npc.state === 'dead') {
          const newDeadTimer = npc.deadTimer + dt;
          if (newDeadTimer > 14.0) {
            // Respawn with full health at safe sidewalk coordinates
            return {
              ...npc,
              health: npc.maxHealth,
              state: 'walking' as NpcState,
              deadTimer: 0,
              targetId: null,
              x: npc.x + (Math.random() * 6 - 3),
              z: (npc.minZ + npc.maxZ) / 2
            };
          }
          return { ...npc, deadTimer: newDeadTimer, knockbackX: newKnockX, knockbackZ: newKnockZ };
        }

        // 2. FLEEING STATE: Run in panic away from player or danger
        if (npc.state === 'fleeing') {
          const newFleeTimer = npc.fleeTimer - dt;
          const awayAngle = Math.atan2(curZ - pz, curX - px);
          curX += Math.cos(awayAngle) * (npc.speed * 1.8) * dt;
          curZ += Math.sin(awayAngle) * (npc.speed * 1.8) * dt;

          if (newFleeTimer <= 0) {
            return {
              ...npc,
              x: curX,
              z: curZ,
              rotationY: awayAngle,
              state: 'walking' as NpcState,
              fleeTimer: 0,
              knockbackX: newKnockX,
              knockbackZ: newKnockZ
            };
          }

          return {
            ...npc,
            x: curX,
            z: curZ,
            rotationY: awayAngle,
            fleeTimer: newFleeTimer,
            knockbackX: newKnockX,
            knockbackZ: newKnockZ
          };
        }

        // 3. ATTACKING PLAYER STATE: Chase player and strike!
        if (npc.state === 'attacking_player') {
          // If player is dead, return to walking
          if (isPlayerDead) {
            return { ...npc, state: 'walking' as NpcState, targetId: null };
          }

          // If this is police and wanted level was cleared (e.g. Ctrl + P), call off chase immediately!
          if (npc.role === 'police' && gameState.wantedLevel === 0) {
            return {
              ...npc,
              state: 'walking' as NpcState,
              targetId: null,
              attackCooldown: 0,
              knockbackX: newKnockX,
              knockbackZ: newKnockZ
            };
          }

          const dx = px - curX;
          const dz = pz - curZ;
          const distToPlayer = Math.hypot(dx, dz);
          const angleToPlayer = Math.atan2(dx, dz);

          let newCooldown = Math.max(0, npc.attackCooldown - dt);
          const isPolice = npc.role === 'police';
          const chaseSpeed = npc.speed * (isPolice ? 2.3 : 1.7); // Police sprint aggressively

          // Chase player towards their coordinates
          if (distToPlayer > 1.8) {
            curX += Math.sin(angleToPlayer) * chaseSpeed * dt;
            curZ += Math.cos(angleToPlayer) * chaseSpeed * dt;
          }

          // Combat attacks (Ranged pistol shot or close-range strike)
          if (npc.weapon === 'pistol' && distToPlayer <= 22.0 && distToPlayer > 1.8) {
            // Police / Gangster opening fire with pistol from range
            if (newCooldown <= 0) {
              newCooldown = 1.35;
              playerDamagedThisTick = true;
              playerDamageAmount += 24;
              attackerName = npc.name;
              soundSystem.playGunshot();
            }
          } else if (distToPlayer <= 2.0) {
            // Melee strike with fists / bat / pistol whip
            if (newCooldown <= 0) {
              newCooldown = 0.85;
              const hitDmg = npc.weapon === 'bat' ? 24 : 16;
              playerDamagedThisTick = true;
              playerDamageAmount += hitDmg;
              attackerName = npc.name;
              soundSystem.playPlayerHit();
            }
          }

          // Distance loss logic:
          // Gangsters give up if player drives > 45m away.
          // Police continue pursuit as long as wantedLevel > 0 up to 130m!
          const maxChaseDist = isPolice ? 130.0 : 45.0;
          if (distToPlayer > maxChaseDist) {
            return {
              ...npc,
              x: curX,
              z: curZ,
              rotationY: angleToPlayer,
              state: 'walking' as NpcState,
              targetId: null,
              attackCooldown: 0,
              knockbackX: newKnockX,
              knockbackZ: newKnockZ
            };
          }

          return {
            ...npc,
            x: curX,
            z: curZ,
            rotationY: angleToPlayer,
            attackCooldown: newCooldown,
            knockbackX: newKnockX,
            knockbackZ: newKnockZ
          };
        }

        // 4. ATTACKING NPC STATE (NPC vs NPC: Gangsters vs Police / Civilians)
        if (npc.state === 'attacking_npc' && npc.targetId) {
          const targetNpc = s.npcs.find((n) => n.id === npc.targetId);
          if (!targetNpc || targetNpc.state === 'dead') {
            return { ...npc, state: 'walking' as NpcState, targetId: null };
          }

          const dx = targetNpc.x - curX;
          const dz = targetNpc.z - curZ;
          const distToTarget = Math.hypot(dx, dz);
          const angleToTarget = Math.atan2(dx, dz);

          let newCooldown = Math.max(0, npc.attackCooldown - dt);

          if (distToTarget > 1.6) {
            curX += Math.sin(angleToTarget) * (npc.speed * 1.5) * dt;
            curZ += Math.cos(angleToTarget) * (npc.speed * 1.5) * dt;
          } else {
            if (newCooldown <= 0) {
              newCooldown = 1.0;
              const hitDmg = npc.weapon === 'pistol' ? 35 : 20;
              get().damageNpc(targetNpc.id, hitDmg, 'npc');
              if (npc.weapon === 'pistol') {
                soundSystem.playGunshot();
              } else {
                soundSystem.playPunchHit();
              }
            }
          }

          return {
            ...npc,
            x: curX,
            z: curZ,
            rotationY: angleToTarget,
            attackCooldown: newCooldown,
            knockbackX: newKnockX,
            knockbackZ: newKnockZ
          };
        }

        // 5. REGULAR WALKING STATE: Peaceful sidewalk patrol (Strictly peaceful - NPCs NEVER attack first)
        curZ += npc.dir * npc.speed * dt;
        let newDir = npc.dir;
        if (curZ > npc.maxZ) {
          curZ = npc.maxZ;
          newDir = -1;
        } else if (curZ < npc.minZ) {
          curZ = npc.minZ;
          newDir = 1;
        }

        return {
          ...npc,
          x: curX,
          z: curZ,
          dir: newDir,
          rotationY: newDir > 0 ? 0 : Math.PI,
          knockbackX: newKnockX,
          knockbackZ: newKnockZ
        };
      });

      // Apply damage to player if hit by any attacking NPC this frame
      if (playerDamagedThisTick && playerDamageAmount > 0) {
        useGameStore.getState().damagePlayer(playerDamageAmount, attackerName);
      }

      return { npcs: updatedNpcs };
    });
  }
}));
