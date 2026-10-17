import { create } from 'zustand';
import {
  ACTIVE_RAID_BOSS,
  BOSS_DECK,
  INITIAL_USER,
  MAP_MARKERS,
  MapMarkerItem,
  RaidBoss,
  RUNNING_EVENTS,
  RunningEvent,
} from '../data/mock';

interface RunState {
  isRunning: boolean;
  demoSpeed: boolean;
  gpsEnabled: boolean;
  ghostRunnerEnabled: boolean;
  distanceKm: number;
  elapsedSeconds: number;
  paceSecondsPerKm: number;
  liveCommunityDamage: number;
  bossDefeated: boolean;
  rewardsClaimed: boolean;
}

interface AppState {
  user: typeof INITIAL_USER;
  bossMaxHp: number;
  baseCommunityDamage: number;
  bossDeck: RaidBoss[];
  run: RunState;
  events: RunningEvent[];
  selectedMarker: MapMarkerItem | null;
  raidSubTab: 'lobby' | 'deck';
  hubTab: 'overview' | 'raids' | 'routes' | 'events' | 'rsvp';
  qualityPreset: 'high' | 'low';

  // Computed / Getters
  getBossRemainingHp: () => number;
  getUserRaidDamage: () => number;
  getEarnedXp: () => number;
  getEarnedCoins: () => number;

  // Actions
  setRaidSubTab: (tab: 'lobby' | 'deck') => void;
  setHubTab: (tab: 'overview' | 'raids' | 'routes' | 'events' | 'rsvp') => void;
  setSelectedMarker: (marker: MapMarkerItem | null) => void;
  toggleRsvp: (eventId: string) => void;
  rsvpEvent: (eventId: string) => void;
  setQualityPreset: (preset: 'high' | 'low') => void;

  // Raid / Run loop actions
  startRaidRun: () => void;
  toggleDemoSpeed: () => void;
  toggleGhostRunner: () => void;
  toggleGps: () => void;
  tickRun: (deltaSeconds: number) => void;
  leaveRaid: () => void;
  claimRunRewards: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: INITIAL_USER,
  bossMaxHp: ACTIVE_RAID_BOSS.maxHp,
  baseCommunityDamage: ACTIVE_RAID_BOSS.baseCommunityDamage,
  bossDeck: BOSS_DECK,
  run: {
    isRunning: false,
    demoSpeed: true,
    gpsEnabled: false,
    ghostRunnerEnabled: true,
    distanceKm: 5.2,
    elapsedSeconds: 1716, // 28:36 at 5:30 /KM
    paceSecondsPerKm: 330, // 5:30 /KM
    liveCommunityDamage: 0,
    bossDefeated: true,
    rewardsClaimed: false,
  },
  events: RUNNING_EVENTS,
  selectedMarker: MAP_MARKERS[0],
  raidSubTab: 'lobby',
  hubTab: 'overview',
  qualityPreset: 'high',

  getBossRemainingHp: () => {
    const state = get();
    if (state.run.bossDefeated && !state.run.isRunning) {
      // On lobby/map before a new run starts, show the initial 7,420 HP if not currently in a defeated post-run state
      if (state.run.liveCommunityDamage === 0) {
        return state.bossMaxHp - state.baseCommunityDamage;
      }
      return 0;
    }
    const userHpDamage = Math.round(state.run.distanceKm * 100);
    return Math.max(
      0,
      state.bossMaxHp - state.baseCommunityDamage - state.run.liveCommunityDamage - userHpDamage
    );
  },

  getUserRaidDamage: () => {
    const state = get();
    return Math.max(1, Math.round(state.run.distanceKm * 10));
  },

  getEarnedXp: () => {
    const state = get();
    const distBonus = Math.round(state.run.distanceKm * 30);
    const victoryBonus = state.run.bossDefeated ? 100 : 0;
    return Math.max(25, distBonus + victoryBonus);
  },

  getEarnedCoins: () => {
    const state = get();
    const distCoins = Math.round(state.run.distanceKm * 15);
    const victoryCoins = state.run.bossDefeated ? 45 : 0;
    return Math.max(10, distCoins + victoryCoins);
  },

  setRaidSubTab: (tab) => set({ raidSubTab: tab }),
  setHubTab: (tab) => set({ hubTab: tab }),
  setSelectedMarker: (marker) => set({ selectedMarker: marker }),
  toggleRsvp: (eventId) =>
    set((state) => ({
      events: state.events.map((ev) =>
        ev.id === eventId
          ? {
              ...ev,
              rsvped: !ev.rsvped,
              participants: ev.rsvped ? ev.participants - 1 : ev.participants + 1,
            }
          : ev
      ),
    })),
  rsvpEvent: (eventId) =>
    set((state) => ({
      events: state.events.map((ev) =>
        ev.id === eventId
          ? {
              ...ev,
              rsvped: true,
              participants: ev.rsvped ? ev.participants : ev.participants + 1,
            }
          : ev
      ),
    })),
  setQualityPreset: (preset) => set({ qualityPreset: preset }),

  startRaidRun: () =>
    set((state) => ({
      run: {
        ...state.run,
        isRunning: true,
        distanceKm: 0.4,
        elapsedSeconds: 132,
        liveCommunityDamage: 120,
        bossDefeated: false,
        rewardsClaimed: false,
      },
    })),

  toggleDemoSpeed: () =>
    set((state) => ({
      run: {
        ...state.run,
        demoSpeed: !state.run.demoSpeed,
      },
    })),

  toggleGhostRunner: () =>
    set((state) => ({
      run: {
        ...state.run,
        ghostRunnerEnabled: !state.run.ghostRunnerEnabled,
      },
    })),

  toggleGps: () =>
    set((state) => ({
      run: {
        ...state.run,
        gpsEnabled: !state.run.gpsEnabled,
      },
    })),

  tickRun: (deltaSeconds) =>
    set((state) => {
      if (!state.run.isRunning) return state;

      // In Demo Speed: 7,420 HP is depleted in ~45 seconds:
      // User runs ~0.115 KM/s (~11.5 HP/s) + 127 other runners deal ~153.5 HP/s = ~165 HP/s total.
      const kmGain = state.run.demoSpeed ? deltaSeconds * 0.115 : deltaSeconds * 0.003;
      const communityHpGain = state.run.demoSpeed
        ? Math.round(deltaSeconds * 153.5)
        : Math.round(deltaSeconds * 12);

      const nextDist = Number((state.run.distanceKm + kmGain).toFixed(2));
      const nextElapsed = Math.round(nextDist * state.run.paceSecondsPerKm);
      const nextCommDmg = state.run.liveCommunityDamage + communityHpGain;
      const userHpDmg = Math.round(nextDist * 100);
      const remaining = Math.max(
        0,
        state.bossMaxHp - state.baseCommunityDamage - nextCommDmg - userHpDmg
      );

      if (remaining <= 0) {
        return {
          bossDeck: state.bossDeck.map((boss) =>
            boss.id === ACTIVE_RAID_BOSS.id
              ? { ...boss, status: 'defeated', isNew: true }
              : boss
          ),
          run: {
            ...state.run,
            isRunning: false,
            distanceKm: nextDist,
            elapsedSeconds: nextElapsed,
            liveCommunityDamage: nextCommDmg,
            bossDefeated: true,
          },
        };
      }

      return {
        run: {
          ...state.run,
          distanceKm: nextDist,
          elapsedSeconds: nextElapsed,
          liveCommunityDamage: nextCommDmg,
        },
      };
    }),

  leaveRaid: () =>
    set((state) => {
      const dist = Number(Math.max(0.1, state.run.distanceKm).toFixed(2));
      return {
        run: {
          ...state.run,
          isRunning: false,
          distanceKm: dist,
          elapsedSeconds: Math.round(dist * state.run.paceSecondsPerKm),
          bossDefeated: false,
        },
      };
    }),

  claimRunRewards: () =>
    set((state) => {
      if (state.run.rewardsClaimed) return state;
      const earnedXp = get().getEarnedXp();
      const earnedCoins = get().getEarnedCoins();
      return {
        user: {
          ...state.user,
          xp: Math.min(state.user.nextLevelXp, state.user.xp + earnedXp),
          coins: state.user.coins + earnedCoins,
          weeklyDistanceKm: Number((state.user.weeklyDistanceKm + state.run.distanceKm).toFixed(1)),
          totalDistanceKm: Number((state.user.totalDistanceKm + state.run.distanceKm).toFixed(1)),
          totalRuns: state.user.totalRuns + 1,
          totalRaidDamage: state.user.totalRaidDamage + get().getUserRaidDamage(),
        },
        bossDeck: state.run.bossDefeated
          ? state.bossDeck.map((boss) =>
              boss.id === ACTIVE_RAID_BOSS.id
                ? { ...boss, status: 'defeated', isNew: true }
                : boss
            )
          : state.bossDeck,
        run: {
          ...state.run,
          liveCommunityDamage: 0,
          rewardsClaimed: true,
        },
      };
    }),
}));
