import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Flame, Calendar, Droplets, Route, Star, Navigation, X } from 'lucide-react';
import { ACTIVE_RAID_BOSS, COMMUNITY_ROUTES, RUNNING_EVENTS } from '../../data/mock';

type SpotCategory = 'Raids' | 'Events' | 'Water' | 'Routes';

interface DiscoverySpot {
  id: string;
  category: SpotCategory;
  title: string;
  subtitle: string;
  badgeText: string;
  distanceAway: string;
  xPercent: number;
  yPercent: number;
}

const DISCOVERY_SPOTS: DiscoverySpot[] = [
  {
    id: 'spot-raid',
    category: 'Raids',
    title: `${ACTIVE_RAID_BOSS.name} Raid`,
    subtitle: `⏱ ${ACTIVE_RAID_BOSS.countdown} • ${ACTIVE_RAID_BOSS.runnersJoined} Runners Joined`,
    badgeText: 'ACTIVE BOSS',
    distanceAway: '350m away',
    xPercent: 68,
    yPercent: 25,
  },
  {
    id: 'spot-event',
    category: 'Events',
    title: RUNNING_EVENTS[1].title,
    subtitle: `${RUNNING_EVENTS[1].startsIn} • ${RUNNING_EVENTS[1].distanceKm} KM • ${RUNNING_EVENTS[1].participants.toLocaleString()} Runners`,
    badgeText: 'FEATURED EVENT',
    distanceAway: '600m away',
    xPercent: 28,
    yPercent: 32,
  },
  {
    id: 'spot-water',
    category: 'Water',
    title: 'GBK Mist & Water Station',
    subtitle: 'Free Cold Refill • Electrolytes & Shade Point',
    badgeText: 'HYDRATION',
    distanceAway: '180m away',
    xPercent: 72,
    yPercent: 68,
  },
  {
    id: 'spot-route',
    category: 'Routes',
    title: `${COMMUNITY_ROUTES[0].name} (${COMMUNITY_ROUTES[0].distanceKm} KM)`,
    subtitle: `Community Rated ★ 4.8 • Flat Scenic Park Loop`,
    badgeText: 'POPULAR ROUTE',
    distanceAway: '120m away',
    xPercent: 30,
    yPercent: 72,
  },
];

const FILTER_CHIPS: { label: SpotCategory; icon: React.ReactNode; color: string }[] = [
  { label: 'Raids', icon: <Flame size={14} />, color: '#ff3b9a' },
  { label: 'Events', icon: <Calendar size={14} />, color: '#ff8a2b' },
  { label: 'Water', icon: <Droplets size={14} />, color: '#00a8e8' },
  { label: 'Routes', icon: <Route size={14} />, color: '#00b8a9' },
];

export const MapDiscoveryScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SpotCategory | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<string>('spot-raid');

  const visibleSpots = DISCOVERY_SPOTS.filter((spot) => {
    const matchesCategory = activeFilter ? spot.category === activeFilter : true;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      spot.title.toLowerCase().includes(q) ||
      spot.subtitle.toLowerCase().includes(q) ||
      spot.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const selectedSpot =
    visibleSpots.find((s) => s.id === selectedSpotId) ||
    visibleSpots[0] ||
    DISCOVERY_SPOTS[0];

  const handleMarkerClick = (spot: DiscoverySpot) => {
    setSelectedSpotId(spot.id);
    if (spot.category === 'Raids') {
      navigate('/raid/lobby');
    } else if (spot.category === 'Events') {
      navigate('/events');
    }
  };

  const handlePrimarySpotAction = (spot: DiscoverySpot) => {
    if (spot.category === 'Raids') {
      navigate('/raid/lobby');
    } else if (spot.category === 'Events') {
      navigate('/events');
    } else {
      navigate('/');
    }
  };

  return (
    <>
      {/* Search Header Card */}
      <header style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1
            style={{
              fontSize: '1.3rem',
              fontWeight: 900,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            Explore Map
          </h1>
          <span
            className="pill-badge"
            style={{
              background: 'rgba(255, 255, 255, 0.88)',
              color: 'var(--color-primary-deep)',
              border: '1px solid rgba(0, 184, 169, 0.25)',
              fontSize: '0.7rem',
            }}
          >
            GBK District • 4 Spots Nearby
          </span>
        </div>

        {/* Search spots input field (min-height 44px) */}
        <div
          className="frosted-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 12px',
            minHeight: 46,
            borderRadius: 'var(--radius-pill)',
          }}
        >
          <Search size={18} color="var(--color-primary-dark)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search spots (raids, events, water, routes)..."
            aria-label="Search spots"
            style={{
              flex: 1,
              minWidth: 0,
              border: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.86rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              outline: 'none',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="touch-target"
              aria-label="Clear search"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Chips Row: Raids, Events, Water, Routes (all >= 44px touch targets) */}
        <div
          role="group"
          aria-label="Spot category filters"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 6,
          }}
        >
          {FILTER_CHIPS.map((chip) => {
            const isSelected = activeFilter === chip.label;
            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => setActiveFilter(isSelected ? null : chip.label)}
                className="touch-target"
                style={{
                  minHeight: 44,
                  padding: '0 6px',
                  borderRadius: 'var(--radius-pill)',
                  background: isSelected
                    ? 'var(--gradient-active-tab)'
                    : 'var(--color-surface-card)',
                  color: isSelected ? '#ffffff' : 'var(--color-text-primary)',
                  border: isSelected
                    ? '1.5px solid #ffffff'
                    : '1.5px solid var(--color-border-card)',
                  boxShadow: isSelected
                    ? '0 6px 14px rgba(13, 138, 148, 0.28)'
                    : 'var(--shadow-card)',
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  gap: 4,
                }}
              >
                <span style={{ color: isSelected ? '#ffffff' : chip.color, display: 'flex' }}>
                  {chip.icon}
                </span>
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Static Illustrated Discovery Map with Tappable Markers */}
      <section
        aria-label="Interactive Discovery Map"
        style={{
          position: 'relative',
          height: 300,
          borderRadius: 'var(--radius-card)',
          overflow: 'hidden',
          border: '2px solid rgba(255, 255, 255, 0.92)',
          boxShadow: 'var(--shadow-card)',
          background: 'linear-gradient(180deg, #98e6ab 0%, #7ad879 55%, #68cb64 100%)',
        }}
      >
        {/* Vector Park Map Illustration: River, Bridges, Community Route Loop, Paths */}
        <svg
          viewBox="0 0 360 300"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          {/* Park Zones */}
          <path d="M0 0 L360 0 L360 110 Q220 140 0 95 Z" fill="#a8ef9d" />
          <ellipse cx="290" cy="240" rx="85" ry="55" fill="#8be383" />

          {/* Winding River */}
          <path
            d="M -10 155 Q 95 120, 185 155 T 370 135"
            fill="none"
            stroke="#d9c398"
            strokeWidth="36"
          />
          <path
            d="M -10 155 Q 95 120, 185 155 T 370 135"
            fill="none"
            stroke="#4cd4f7"
            strokeWidth="28"
          />

          {/* Running Paths */}
          <path
            d="M 55 295 C 65 210, 95 110, 130 60 C 165 20, 245 45, 265 115 C 285 185, 255 255, 180 270 Z"
            fill="none"
            stroke="#f5e2c8"
            strokeWidth="20"
            strokeLinejoin="round"
          />

          {/* Highlighted Dotted Cyan Community Route Loop */}
          <path
            d="M 75 245 C 85 190, 110 175, 155 185 C 195 195, 190 250, 135 262 Z"
            fill="rgba(56, 248, 194, 0.14)"
            stroke="#00b8a9"
            strokeWidth="3.5"
            strokeDasharray="6 4"
          />

          {/* Wooden Bridge over River */}
          <rect x="164" y="132" width="30" height="42" rx="4" fill="#d99b66" stroke="#8c5828" strokeWidth="2" />

          {/* Stylized Park Trees */}
          <circle cx="42" cy="52" r="14" fill="#43a047" />
          <circle cx="322" cy="48" r="16" fill="#43a047" />
          <circle cx="318" cy="252" r="15" fill="#2e7d32" />
          <circle cx="44" cy="262" r="13" fill="#43a047" />
        </svg>

        {/* Tappable Map Markers (All >= 44x44px touch targets) */}
        {visibleSpots.map((spot) => {
          const isSelected = selectedSpot.id === spot.id;
          const badgeColor =
            spot.category === 'Raids'
              ? '#ff3b9a'
              : spot.category === 'Events'
              ? '#ff8a2b'
              : spot.category === 'Water'
              ? '#00a8e8'
              : '#00b8a9';

          return (
            <button
              key={spot.id}
              type="button"
              onClick={() => handleMarkerClick(spot)}
              className="touch-target"
              aria-label={
                spot.category === 'Raids'
                  ? 'Raid Marker: Open Raid Lobby'
                  : spot.category === 'Events'
                  ? 'Event Marker: Open Events Discovery'
                  : `${spot.category} Marker: ${spot.title}`
              }
              style={{
                position: 'absolute',
                left: `${spot.xPercent}%`,
                top: `${spot.yPercent}%`,
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                padding: '6px 10px',
                minWidth: 54,
                minHeight: 54,
                borderRadius: 16,
                background: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.94)',
                border: `2.5px solid ${badgeColor}`,
                boxShadow: isSelected
                  ? `0 8px 20px ${badgeColor}55`
                  : '0 4px 12px rgba(16, 42, 67, 0.16)',
                zIndex: isSelected ? 5 : 2,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: badgeColor,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {spot.category === 'Raids' && <Flame size={15} />}
                {spot.category === 'Events' && <Calendar size={15} />}
                {spot.category === 'Water' && <Droplets size={15} />}
                {spot.category === 'Routes' && <Route size={15} />}
              </div>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  color: 'var(--color-text-primary)',
                  whiteSpace: 'nowrap',
                }}
              >
                {spot.category === 'Raids'
                  ? 'Raid Boss'
                  : spot.category === 'Events'
                  ? 'Live Event'
                  : spot.category === 'Water'
                  ? 'Water Spot'
                  : 'GBK Route'}
              </span>
            </button>
          );
        })}

        {/* Bottom-left Map Legend Pill */}
        <div
          style={{
            position: 'absolute',
            left: 10,
            bottom: 10,
            padding: '4px 10px',
            borderRadius: 'var(--radius-pill)',
            background: 'rgba(255, 255, 255, 0.9)',
            fontSize: '0.66rem',
            fontWeight: 800,
            color: 'var(--color-text-secondary)',
            pointerEvents: 'none',
          }}
        >
          Tap Raid or Event marker to jump in
        </div>
      </section>

      {/* Selected Spot Details & Community Routes Quick Card */}
      <section
        className="frosted-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          padding: '12px 14px',
        }}
      >
        {visibleSpots.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
            }}
          >
            <div>
              <h2 style={{ fontSize: '0.94rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
                No spots match &ldquo;{searchQuery}&rdquo;
              </h2>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                Try searching for raids, events, water, or routes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveFilter(null);
              }}
              className="touch-target"
              style={{
                minHeight: 44,
                padding: '0 14px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--gradient-cta)',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.76rem',
                flexShrink: 0,
              }}
            >
              Reset
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  className="pill-badge"
                  style={{
                    background: 'var(--color-primary-soft)',
                    color: 'var(--color-primary-deep)',
                    padding: '2px 8px',
                    fontSize: '0.65rem',
                  }}
                >
                  {selectedSpot.badgeText}
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>
                  {selectedSpot.distanceAway}
                </span>
              </div>
              <h2
                style={{
                  fontSize: '0.96rem',
                  fontWeight: 900,
                  color: 'var(--color-text-primary)',
                  marginTop: 3,
                }}
              >
                {selectedSpot.title}
              </h2>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                {selectedSpot.subtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handlePrimarySpotAction(selectedSpot)}
              className="touch-target"
              style={{
                minHeight: 44,
                padding: '0 14px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--gradient-cta)',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.78rem',
                boxShadow: '0 3px 0 #057a80',
                flexShrink: 0,
                gap: 5,
              }}
            >
              <Navigation size={14} />
              <span>
                {selectedSpot.category === 'Raids'
                  ? 'Join Raid'
                  : selectedSpot.category === 'Events'
                  ? 'Open Events'
                  : 'Start Run'}
              </span>
            </button>
          </div>
        )}

        {/* Community Rated Routes Strip (from COMMUNITY_ROUTES mock data) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            paddingTop: 8,
            borderTop: '1px solid var(--color-border-subtle)',
          }}
        >
          {COMMUNITY_ROUTES.map((route) => (
            <button
              key={route.id}
              type="button"
              onClick={() => {
                setActiveFilter('Routes');
                setSelectedSpotId('spot-route');
              }}
              className="touch-target"
              style={{
                minHeight: 48,
                padding: '6px 10px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.75)',
                border: '1px solid var(--color-border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '0.76rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
                {route.name}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: 'var(--color-text-secondary)',
                }}
              >
                <span>{route.distanceKm} KM</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: '#f59f00' }}>
                  <Star size={11} fill="#f59f00" />
                  {route.rating}.0
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </>
  );
};
