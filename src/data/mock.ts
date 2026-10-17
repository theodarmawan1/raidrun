export interface RaidBoss {
  id: string;
  name: string;
  maxHp: number;
  baseCommunityDamage: number;
  countdown: string;
  runnersJoined: number;
  status: 'active' | 'defeated' | 'escaped' | 'locked';
  isNew?: boolean;
  element: 'fire' | 'ice' | 'magma' | 'dragon' | 'mystery';
}

export interface RaidRunner {
  id: string;
  rank: number;
  name: string;
  distanceKm: number;
  damage: number;
  badgeText: string;
  avatarColor: string;
  isUser?: boolean;
  online?: boolean;
}

export interface RunningEvent {
  id: string;
  title: string;
  category: 'Easy Run' | 'Night Run' | 'Trail Challenge';
  startsIn: string;
  distanceKm: number;
  participants: number;
  location: string;
  rsvped: boolean;
}

export interface CommunityRoute {
  id: string;
  name: string;
  distanceKm: number;
  rating: number;
}

export interface PartyMember {
  id: string;
  rank: number;
  name: string;
  weeklyKm: number;
  companionColor: string;
  avatarColor: string;
}

export interface QuestItem {
  id: string;
  title: string;
  type: 'daily' | 'weekly';
  current: number;
  target: number;
  unit: string;
  rewardXp: number;
  icon: 'run' | 'sun' | 'boss';
}

export interface MapMarkerItem {
  id: string;
  type: 'raid' | 'event' | 'water' | 'popular';
  label: string;
  sublabel: string;
  badge?: string;
  position: [number, number, number];
}

export const INITIAL_USER = {
  username: 'THEO_KEREN',
  level: 24,
  title: 'Territory Runner',
  partyName: 'Velocity',
  xp: 12650,
  nextLevelXp: 20000,
  coins: 840,
  weeklyDistanceKm: 42.5,
  totalDistanceKm: 145.2,
  totalRuns: 210,
  longestRunKm: 18.5,
  fastestPace: '4:30 /KM',
  currentStreakDays: 15,
  totalRaidDamage: 860,
  companionName: 'Crystie',
};

export const ACTIVE_RAID_BOSS: RaidBoss = {
  id: 'ember-titan',
  name: 'Ember Titan',
  maxHp: 10000,
  baseCommunityDamage: 2580, // 10,000 - 2,580 = 7,420 HP remaining (matches 7.png)
  countdown: '02:41:18',
  runnersJoined: 128,
  status: 'active',
  isNew: true,
  element: 'fire',
};

export const BOSS_DECK: RaidBoss[] = [
  {
    id: 'ember-titan',
    name: 'Ember Titan',
    maxHp: 10000,
    baseCommunityDamage: 2580,
    countdown: '02:41:18',
    runnersJoined: 128,
    status: 'defeated',
    isNew: true,
    element: 'fire',
  },
  {
    id: 'glacio',
    name: 'Glacio',
    maxHp: 8500,
    baseCommunityDamage: 8500,
    countdown: '00:00:00',
    runnersJoined: 94,
    status: 'defeated',
    element: 'ice',
  },
  {
    id: 'magma',
    name: 'Magma',
    maxHp: 6000,
    baseCommunityDamage: 6000,
    countdown: '00:00:00',
    runnersJoined: 76,
    status: 'defeated',
    element: 'magma',
  },
  {
    id: 'drakey',
    name: 'Drakey',
    maxHp: 12000,
    baseCommunityDamage: 9200,
    countdown: '00:00:00',
    runnersJoined: 62,
    status: 'escaped',
    element: 'dragon',
  },
  {
    id: 'mystery-1',
    name: '???',
    maxHp: 15000,
    baseCommunityDamage: 0,
    countdown: 'Locked',
    runnersJoined: 0,
    status: 'locked',
    element: 'mystery',
  },
  {
    id: 'mystery-2',
    name: '???',
    maxHp: 20000,
    baseCommunityDamage: 0,
    countdown: 'Locked',
    runnersJoined: 0,
    status: 'locked',
    element: 'mystery',
  },
];

export const RAID_RUNNERS: RaidRunner[] = [
  {
    id: 'r1',
    rank: 1,
    name: 'AceRunner',
    distanceKm: 21.0,
    damage: 210,
    badgeText: '#1 Runner Bekasi',
    avatarColor: '#38bdf8',
    online: true,
  },
  {
    id: 'r2',
    rank: 2,
    name: 'Flash',
    distanceKm: 18.5,
    damage: 185,
    badgeText: '#2 Runner Bogor',
    avatarColor: '#f472b6',
    online: true,
  },
  {
    id: 'r3',
    rank: 3,
    name: 'Storm',
    distanceKm: 16.2,
    damage: 162,
    badgeText: '#3 Runner Jakarta',
    avatarColor: '#60a5fa',
    online: true,
  },
  {
    id: 'r4',
    rank: 4,
    name: 'Dash',
    distanceKm: 14.8,
    damage: 148,
    badgeText: 'Velocity',
    avatarColor: '#34d399',
    online: true,
  },
  {
    id: 'r-user',
    rank: 37,
    name: 'You (THEO_KEREN)',
    distanceKm: 5.2,
    damage: 52,
    badgeText: 'Rank 37',
    avatarColor: '#00b8a9',
    isUser: true,
    online: true,
  },
];

export const PARTY_INFO = {
  name: 'Velocity',
  level: 12,
  weeklyCurrentKm: 142,
  weeklyGoalKm: 200,
  members: [
    { id: 'p1', rank: 1, name: 'Theo (You)', weeklyKm: 42.5, companionColor: '#4ce0b3', avatarColor: '#00b8a9' },
    { id: 'p2', rank: 2, name: 'Maya', weeklyKm: 38.5, companionColor: '#ff8a2b', avatarColor: '#2dd4bf' },
    { id: 'p3', rank: 3, name: 'Rizky', weeklyKm: 33.0, companionColor: '#60a5fa', avatarColor: '#38bdf8' },
    { id: 'p4', rank: 4, name: 'Sari', weeklyKm: 28.0, companionColor: '#f472b6', avatarColor: '#fb7185' },
  ] as PartyMember[],
};

export const RUNNING_EVENTS: RunningEvent[] = [
  {
    id: 'evt-morning',
    title: 'Morning Park Run',
    category: 'Easy Run',
    startsIn: 'Starts in 2h',
    distanceKm: 5,
    participants: 420,
    location: 'GBK Central Park',
    rsvped: true,
  },
  {
    id: 'evt-marathon',
    title: 'RAIDRUN City Marathon',
    category: 'Easy Run',
    startsIn: 'Starts in 2d 8h',
    distanceKm: 10,
    participants: 1248,
    location: 'Sudirman Loop',
    rsvped: true,
  },
  {
    id: 'evt-night',
    title: 'Night Run GBK',
    category: 'Night Run',
    startsIn: 'Friday 19:00',
    distanceKm: 5,
    participants: 312,
    location: 'GBK Main Stadium',
    rsvped: false,
  },
  {
    id: 'evt-trail',
    title: 'Trail Challenge Sentul',
    category: 'Trail Challenge',
    startsIn: 'Sunday 06:00',
    distanceKm: 8,
    participants: 154,
    location: 'Sentul Highlands',
    rsvped: false,
  },
];

export const COMMUNITY_ROUTES: CommunityRoute[] = [
  {
    id: 'route-gbk',
    name: 'GBK North Loop',
    distanceKm: 5.2,
    rating: 2,
  },
  {
    id: 'route-park',
    name: 'Park Perimeter Run',
    distanceKm: 8.1,
    rating: 4,
  },
];

export const QUESTS: QuestItem[] = [
  {
    id: 'q1',
    title: 'Run 3 KM',
    type: 'daily',
    current: 1.5,
    target: 3,
    unit: 'KM',
    rewardXp: 100,
    icon: 'run',
  },
  {
    id: 'q2',
    title: 'Complete a morning run',
    type: 'daily',
    current: 0,
    target: 1,
    unit: '',
    rewardXp: 100,
    icon: 'sun',
  },
  {
    id: 'q3',
    title: 'Defeat 500 Boss HP',
    type: 'daily',
    current: 200,
    target: 500,
    unit: '',
    rewardXp: 100,
    icon: 'boss',
  },
  {
    id: 'q4',
    title: 'Run 20 KM',
    type: 'weekly',
    current: 11.2,
    target: 20,
    unit: 'KM',
    rewardXp: 100,
    icon: 'run',
  },
];

export interface PastRaidItem {
  id: string;
  bossName: string;
  timeAgo: string;
  status: 'Defeated' | 'Escaped';
  damage: number;
  rank: number;
  element: 'ice' | 'dragon' | 'magma';
}

export const PAST_RAIDS: PastRaidItem[] = [
  {
    id: 'pr-glacio',
    bossName: 'Glacio',
    timeAgo: 'Yesterday',
    status: 'Defeated',
    damage: 41,
    rank: 12,
    element: 'ice',
  },
  {
    id: 'pr-drakey',
    bossName: 'Drakey',
    timeAgo: '3 days ago',
    status: 'Escaped',
    damage: 18,
    rank: 88,
    element: 'dragon',
  },
  {
    id: 'pr-magmo',
    bossName: 'Magmo',
    timeAgo: 'Last week',
    status: 'Defeated',
    damage: 60,
    rank: 5,
    element: 'magma',
  },
];

export const MAP_MARKERS: MapMarkerItem[] = [
  {
    id: 'marker-raid',
    type: 'raid',
    label: 'Ember Titan Raid',
    sublabel: '02:41:18 • 128 Joined',
    badge: 'BOSS',
    position: [2.2, 0.3, -2.5],
  },
  {
    id: 'marker-event',
    type: 'event',
    label: 'Live Event',
    sublabel: 'Starts in 2h',
    badge: 'EVENT',
    position: [2.4, 0.3, -0.4],
  },
  {
    id: 'marker-popular',
    type: 'popular',
    label: 'Popular Spot',
    sublabel: 'GBK Bridge Loop',
    badge: 'Hot',
    position: [-1.8, 0.3, 0.5],
  },
  {
    id: 'marker-water',
    type: 'water',
    label: 'Water Station',
    sublabel: 'Free Refill & Mist Point',
    position: [1.9, 0.3, 1.4],
  },
];

