import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Flame,
  Footprints,
  Sun,
  Skull,
  Swords,
  Trophy,
  Star,
  MapPin,
  Users,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import {
  COMMUNITY_ROUTES,
  PAST_RAIDS,
  PastRaidItem,
  QUESTS,
} from '../../data/mock';

type HubTabKey = 'overview' | 'raids' | 'routes' | 'events' | 'rsvp';
type EventFilter = 'All' | 'Easy Run' | 'Night Run' | 'Trail Challenge';

const HUB_TABS: { key: HubTabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'raids', label: 'Raids' },
  { key: 'routes', label: 'Routes' },
  { key: 'events', label: 'Events' },
  { key: 'rsvp', label: 'RSVP' },
];

const PastRaidBossThumb: React.FC<{ item: PastRaidItem }> = ({ item }) => {
  const bg =
    item.element === 'ice'
      ? 'linear-gradient(180deg, #7dd3fc 0%, #e0f2fe 100%)'
      : item.element === 'dragon'
      ? 'linear-gradient(180deg, #38bdf8 0%, #bae6fd 100%)'
      : 'linear-gradient(180deg, #7c2d12 0%, #ea580c 100%)';

  return (
    <div
      style={{
        width: 74,
        height: 74,
        borderRadius: 'var(--radius-md)',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
        {item.element === 'ice' && (
          <>
            <circle cx="32" cy="36" r="20" fill="#bae6fd" />
            <circle cx="32" cy="22" r="12" fill="#e0f2fe" />
            <circle cx="27" cy="22" r="2.2" fill="#0f172a" />
            <circle cx="37" cy="22" r="2.2" fill="#0f172a" />
            <path d="M28 27 Q32 30 36 27" stroke="#0f172a" strokeWidth="2" fill="none" />
          </>
        )}
        {item.element === 'dragon' && (
          <>
            <polygon points="20,16 26,8 30,18" fill="#fbbf24" />
            <polygon points="44,16 38,8 34,18" fill="#fbbf24" />
            <ellipse cx="32" cy="30" rx="14" ry="13" fill="#2dd4bf" />
            <circle cx="27" cy="28" r="2.8" fill="#0f172a" />
            <circle cx="37" cy="28" r="2.8" fill="#0f172a" />
          </>
        )}
        {item.element === 'magma' && (
          <>
            <path d="M18 22 Q12 12 22 12 Q26 16 26 22 Z" fill="#451a03" />
            <path d="M46 22 Q52 12 42 12 Q38 16 38 22 Z" fill="#451a03" />
            <ellipse cx="32" cy="36" rx="18" ry="16" fill="#fb923c" />
            <circle cx="26" cy="32" r="2.5" fill="#451a03" />
            <circle cx="38" cy="32" r="2.5" fill="#451a03" />
          </>
        )}
      </svg>
    </div>
  );
};

const EventRowThumb: React.FC<{ id: string }> = ({ id }) => {
  const isNight = id.includes('night');
  const isTrail = id.includes('trail');
  return (
    <svg
      width="84"
      height="66"
      viewBox="0 0 120 90"
      style={{ borderRadius: 'var(--radius-md)', flexShrink: 0 }}
    >
      <rect
        width="120"
        height="90"
        fill={isNight ? '#1e1b4b' : isTrail ? '#38bdf8' : '#74c0fc'}
      />
      <rect
        x="0"
        y="56"
        width="120"
        height="34"
        fill={isNight ? '#334155' : '#74d14c'}
      />
      <polygon points="34,56 86,56 106,90 14,90" fill={isNight ? '#475569' : '#e2e8f0'} />
      <path
        d="M24 62 L24 24 Q60 14 96 24 L96 62 L86 62 L86 30 Q60 22 34 30 L34 62 Z"
        fill="#00b8a9"
      />
      <circle cx="60" cy="54" r="6" fill="#00b8a9" />
      <rect x="54" y="60" width="12" height="16" rx="3" fill="#1ce5c8" />
    </svg>
  );
};

const QrPlaceholder: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="touch-target"
    aria-label="QR Code Placeholder"
    style={{
      minWidth: 58,
      minHeight: 58,
      padding: 0,
      borderRadius: 6,
      background: 'transparent',
      border: 'none',
    }}
  >
    <svg width="58" height="58" viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="6" fill="#ffffff" />
      <rect x="6" y="6" width="18" height="18" fill="none" stroke="#102a43" strokeWidth="4" />
      <rect x="11" y="11" width="8" height="8" fill="#102a43" />
      <rect x="40" y="6" width="18" height="18" fill="none" stroke="#102a43" strokeWidth="4" />
      <rect x="45" y="11" width="8" height="8" fill="#102a43" />
      <rect x="6" y="40" width="18" height="18" fill="none" stroke="#102a43" strokeWidth="4" />
      <rect x="11" y="45" width="8" height="8" fill="#102a43" />
      <g fill="#102a43">
        <rect x="28" y="8" width="6" height="6" />
        <rect x="28" y="18" width="6" height="12" />
        <rect x="8" y="28" width="12" height="6" />
        <rect x="26" y="34" width="10" height="6" />
        <rect x="40" y="28" width="6" height="12" />
        <rect x="50" y="30" width="8" height="6" />
        <rect x="30" y="44" width="8" height="14" />
        <rect x="42" y="46" width="14" height="6" />
      </g>
    </svg>
  </button>
);

export const HubScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, hubTab, setHubTab, events, toggleRsvp, showToast } = useAppStore();
  const [eventFilter, setEventFilter] = useState<EventFilter>('All');
  const [routeToast, setRouteToast] = useState(false);

  const dailyQuests = QUESTS.filter((q) => q.type === 'daily');
  const weeklyQuests = QUESTS.filter((q) => q.type === 'weekly');
  const filteredEvents = events.filter((ev) =>
    eventFilter === 'All' ? true : ev.category === eventFilter
  );
  const rsvpedEvents = events.filter((ev) => ev.rsvped);

  return (
    <>
      {/* Top Hero Stage with Back Button and Mint + Crystie (matching design/13.png–17.png) */}
      <section
        style={{
          position: 'relative',
          height: 148,
          minHeight: 148,
          flexShrink: 0,
          borderRadius: 'var(--radius-card)',
          overflow: 'hidden',
          border: '1.5px solid var(--color-border-card)',
          boxShadow: 'var(--shadow-card)',
          background:
            'linear-gradient(180deg, #8ce0ff 0%, #d8f9ff 48%, #b5f279 49%, #f7e3c8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/')}
          className="touch-target"
          aria-label="Back to Home Map"
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.92)',
            border: '1.5px solid #ffffff',
            boxShadow: 'var(--shadow-card)',
            color: 'var(--color-primary-deep)',
            zIndex: 3,
          }}
        >
          <ChevronLeft size={22} strokeWidth={2.6} />
        </button>

        {/* Mint + Crystie on Glowing Ring */}
        <svg width="136" height="132" viewBox="0 0 136 132" aria-hidden="true">
          <ellipse
            cx="64"
            cy="114"
            rx="42"
            ry="11"
            fill="none"
            stroke="#e0fbf6"
            strokeWidth="5"
          />
          <ellipse
            cx="64"
            cy="114"
            rx="42"
            ry="11"
            fill="none"
            stroke="#38f8c2"
            strokeWidth="2.5"
          />
          <circle cx="64" cy="30" r="11" fill="#f3b893" />
          <path d="M53 26 Q64 14 75 26 Z" fill="#4a2c18" />
          <rect x="52" y="42" width="24" height="26" rx="6" fill="#00b8a9" />
          <path d="M56 42 L72 42 L69 64 L59 64 Z" fill="#ffffff" />
          <rect x="53" y="66" width="10" height="15" rx="3" fill="#066168" />
          <rect x="65" y="66" width="10" height="15" rx="3" fill="#066168" />
          <rect x="55" y="81" width="5" height="18" fill="#f3b893" />
          <rect x="68" y="81" width="5" height="18" fill="#f3b893" />
          <rect x="53" y="97" width="9" height="5" rx="2" fill="#00b8a9" />
          <rect x="66" y="97" width="9" height="5" rx="2" fill="#00b8a9" />
          {/* Crystie */}
          <g transform="translate(90, 68)">
            <polygon points="12,0 5,12 19,12" fill="#4ce0b3" />
            <ellipse cx="12" cy="18" rx="10" ry="9" fill="#a8f9e4" />
            <circle cx="9" cy="17" r="1.8" fill="#102a43" />
            <circle cx="15" cy="17" r="1.8" fill="#102a43" />
          </g>
        </svg>
      </section>

      {/* 5-Tab Segmented Bar: Overview | Raids | Routes | Events | RSVP */}
      <nav
        aria-label="Runner Hub Tabs"
        className="frosted-card"
        style={{
          padding: 4,
          borderRadius: 'var(--radius-pill)',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 2,
          flexShrink: 0,
        }}
      >
        {HUB_TABS.map((t) => {
          const active = hubTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setHubTab(t.key)}
              className="touch-target"
              style={{
                minHeight: 44,
                minWidth: 44,
                padding: '0 4px',
                borderRadius: 'var(--radius-pill)',
                background: active ? 'var(--gradient-active-tab)' : 'transparent',
                color: active ? '#ffffff' : 'var(--color-text-primary)',
                fontWeight: 800,
                fontSize: '0.73rem',
                whiteSpace: 'nowrap',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      {/* Scrollable Tab Content Area below pinned Banner + Tab Bar */}
      <div
        className="hub-tab-scroll"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          paddingBottom: 12,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {/* TAB 1: OVERVIEW (15 Day Streak, Daily Quests, Weekly Quest — design/17.png) */}
        {hubTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* 15 Day Streak Card */}
          <section className="frosted-card" style={{ padding: '12px 14px' }}>
            <h2
              style={{
                fontSize: '0.98rem',
                fontWeight: 900,
                color: 'var(--color-text-primary)',
                marginBottom: 8,
              }}
            >
              {user.currentStreakDays} Day Streak
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 6,
                alignItems: 'center',
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                const completed = day <= 6;
                return (
                  <div
                    key={day}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: completed ? '#e0fbf6' : '#f8fafc',
                        border: completed
                          ? '2px solid var(--color-primary)'
                          : '1.5px solid #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {completed && <Flame size={16} color="#ff8a2b" fill="#ff8a2b" />}
                    </div>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Daily Quests Card */}
          <section
            className="frosted-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              padding: '12px 14px',
            }}
          >
            <h2
              style={{
                fontSize: '0.98rem',
                fontWeight: 900,
                color: 'var(--color-text-primary)',
              }}
            >
              Daily Quests
            </h2>

            {dailyQuests.map((q) => {
              const pct = Math.min(100, Math.round((q.current / q.target) * 100));
              return (
                <div
                  key={q.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: '#e6f4f1',
                      color: 'var(--color-text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {q.icon === 'run' && <Footprints size={16} />}
                    {q.icon === 'sun' && <Sun size={16} />}
                    {q.icon === 'boss' && <Skull size={16} />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {q.title}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginTop: 4,
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          height: 8,
                          borderRadius: 999,
                          background: 'rgba(16, 42, 67, 0.1)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            borderRadius: 999,
                            background: 'var(--gradient-xp-bar)',
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          color: 'var(--color-text-secondary)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {q.current} / {q.target} {q.unit}
                      </span>
                    </div>
                  </div>

                  <span
                    className="pill-badge"
                    style={{
                      background: 'var(--color-primary-soft)',
                      color: 'var(--color-primary-deep)',
                      fontSize: '0.68rem',
                      padding: '4px 8px',
                      flexShrink: 0,
                    }}
                  >
                    +{q.rewardXp} XP
                  </span>
                </div>
              );
            })}
          </section>

          {/* Weekly Quest Card */}
          <section
            className="frosted-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: '12px 14px',
            }}
          >
            <h2
              style={{
                fontSize: '0.98rem',
                fontWeight: 900,
                color: 'var(--color-text-primary)',
              }}
            >
              Weekly Quest
            </h2>

            {weeklyQuests.map((q) => {
              const pct = Math.min(100, Math.round((q.current / q.target) * 100));
              return (
                <div
                  key={q.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: '#e6f4f1',
                      color: 'var(--color-text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Footprints size={16} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {q.title}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginTop: 4,
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          height: 8,
                          borderRadius: 999,
                          background: 'rgba(16, 42, 67, 0.1)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            borderRadius: 999,
                            background: 'var(--gradient-xp-bar)',
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          color: 'var(--color-text-secondary)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {q.current} / {q.target} {q.unit}
                      </span>
                    </div>
                  </div>

                  <span
                    className="pill-badge"
                    style={{
                      background: 'var(--color-primary-soft)',
                      color: 'var(--color-primary-deep)',
                      fontSize: '0.68rem',
                      padding: '4px 8px',
                      flexShrink: 0,
                    }}
                  >
                    +{q.rewardXp} XP
                  </span>
                </div>
              );
            })}
          </section>
        </div>
      )}

      {/* TAB 2: RAIDS (Past raid history: Glacio, Drakey, Magmo — design/15.png) */}
      {hubTab === 'raids' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PAST_RAIDS.map((raid) => {
            const isDefeated = raid.status === 'Defeated';
            return (
              <div
                key={raid.id}
                className="frosted-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                }}
              >
                <PastRaidBossThumb item={raid} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '1.02rem',
                        fontWeight: 900,
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {raid.bossName}
                    </h3>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {raid.timeAgo}
                    </span>
                  </div>

                  <div style={{ marginTop: 4 }}>
                    <span
                      className="pill-badge"
                      style={{
                        background: isDefeated
                          ? 'var(--color-success-bg)'
                          : 'var(--color-danger-bg)',
                        color: isDefeated
                          ? 'var(--color-success-text)'
                          : 'var(--color-danger-text)',
                        fontSize: '0.7rem',
                        padding: '2px 12px',
                      }}
                    >
                      {raid.status}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginTop: 7,
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Swords size={14} color="var(--color-text-secondary)" />
                      {raid.damage} DMG
                    </span>
                    <span style={{ color: 'var(--color-border-subtle)' }}>|</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Trophy size={14} color="var(--color-text-secondary)" />
                      Rank {raid.rank}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* TAB 3: ROUTES (GBK North Loop 5.2 KM, Park Perimeter Run 8.1 KM, Create New Route — design/13.png) */}
      {hubTab === 'routes' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Illustrated Route Map Preview Card */}
          <div
            className="frosted-card"
            style={{
              padding: 8,
            }}
          >
            <svg
              width="100%"
              height="146"
              viewBox="0 0 340 150"
              preserveAspectRatio="none"
              style={{ borderRadius: 'var(--radius-lg)', display: 'block' }}
            >
              <rect width="340" height="150" fill="#9de86f" />
              <path d="M0 95 Q110 65 220 90 T340 85 L340 150 L0 150 Z" fill="#82d955" />
              <ellipse cx="105" cy="74" rx="22" ry="10" fill="#38d9f5" />
              {/* Park Path */}
              <path
                d="M 140 150 C 175 115, 130 65, 175 30 L 340 65"
                fill="none"
                stroke="#f5e2c8"
                strokeWidth="22"
              />
              {/* Dotted Cyan Loop matching design/13.png */}
              <path
                d="M 164 56 C 210 52, 248 64, 244 92 C 240 120, 224 136, 176 112 C 156 100, 184 82, 164 56 Z"
                fill="rgba(56, 248, 194, 0.14)"
                stroke="#0088a9"
                strokeWidth="3.5"
                strokeDasharray="6 4"
              />
              <circle cx="158" cy="116" r="11" fill="rgba(0, 184, 169, 0.35)" />
              <circle cx="158" cy="116" r="5" fill="#0088a9" />
            </svg>
          </div>

          {/* Community Routes List */}
          {COMMUNITY_ROUTES.map((route) => (
            <button
              key={route.id}
              type="button"
              onClick={() => showToast('Coming soon in the full app')}
              className="frosted-card touch-target"
              style={{
                width: '100%',
                minHeight: 54,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                textAlign: 'left',
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: '0.98rem',
                    fontWeight: 900,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {route.name}
                </h3>
                <div
                  style={{
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: 'var(--color-text-secondary)',
                    marginTop: 2,
                  }}
                >
                  {route.distanceKm} KM
                </div>
              </div>

              <div
                aria-label={`${route.rating} out of 4 stars`}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                {[1, 2, 3, 4].map((starIdx) => (
                  <Star
                    key={starIdx}
                    size={18}
                    color={starIdx <= route.rating ? '#f59f00' : '#cbd5e1'}
                    fill={starIdx <= route.rating ? '#f59f00' : '#cbd5e1'}
                  />
                ))}
              </div>
            </button>
          ))}

          <button
            type="button"
            onClick={() => {
              setRouteToast(true);
              showToast('Coming soon in the full app');
              window.setTimeout(() => setRouteToast(false), 2200);
            }}
            className="btn-primary-cta touch-target"
            style={{
              minHeight: 48,
              fontSize: '0.88rem',
              letterSpacing: '0.03em',
            }}
          >
            {routeToast ? 'COMING SOON IN THE FULL APP' : 'CREATE NEW ROUTE'}
          </button>
        </section>
      )}

      {/* TAB 4: EVENTS (Filter chips + Event list with View buttons — design/14.png) */}
      {hubTab === 'events' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Filter Chips: All, Easy Run, Night Run, Trail Challenge */}
          <div
            role="group"
            aria-label="Filter events by category"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 6,
            }}
          >
            {(['All', 'Easy Run', 'Night Run', 'Trail Challenge'] as EventFilter[]).map(
              (chip) => {
                const active = eventFilter === chip;
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setEventFilter(chip)}
                    className="touch-target"
                    style={{
                      minHeight: 44,
                      padding: '0 4px',
                      borderRadius: 'var(--radius-pill)',
                      background: active
                        ? 'var(--gradient-active-tab)'
                        : 'var(--color-surface-card)',
                      color: active ? '#ffffff' : 'var(--color-text-primary)',
                      border: '1.5px solid var(--color-border-card)',
                      boxShadow: 'var(--shadow-card)',
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      textAlign: 'center',
                    }}
                  >
                    {chip}
                  </button>
                );
              }
            )}
          </div>

          {/* Event List with View buttons */}
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="frosted-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: 10,
              }}
            >
              <EventRowThumb id={ev.id} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 900,
                    color: 'var(--color-text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {ev.title}
                </h3>
                <div
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: 'var(--color-text-secondary)',
                    marginTop: 2,
                  }}
                >
                  {ev.startsIn}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 5,
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <MapPin size={12} color="var(--color-primary-dark)" />
                    {ev.distanceKm} KM
                  </span>
                  <span style={{ color: 'var(--color-border-subtle)' }}>|</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <Users size={12} color="var(--color-primary-dark)" />
                    {ev.participants.toLocaleString()} Runners
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/events')}
                className="touch-target"
                style={{
                  minWidth: 62,
                  minHeight: 44,
                  padding: '0 12px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--gradient-active-tab)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.76rem',
                  flexShrink: 0,
                }}
              >
                View
              </button>
            </div>
          ))}
        </section>
      )}

      {/* TAB 5: RSVP (Going events with QR placeholder & Cancel button — design/16.png) */}
      {hubTab === 'rsvp' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rsvpedEvents.length === 0 ? (
            <div
              className="frosted-card"
              style={{
                textAlign: 'center',
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <p style={{ fontWeight: 800, color: 'var(--color-text-secondary)' }}>
                No active RSVPs yet. Join an upcoming community run to get your check-in pass!
              </p>
              <button
                type="button"
                onClick={() => setHubTab('events')}
                className="touch-target"
                style={{
                  minHeight: 44,
                  padding: '0 18px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--gradient-cta)',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.8rem',
                }}
              >
                Browse Events
              </button>
            </div>
          ) : (
            rsvpedEvents.map((ev) => (
              <div
                key={ev.id}
                className="frosted-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <EventRowThumb id={ev.id} />
                  <div style={{ minWidth: 0 }}>
                    <h3
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: 900,
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {ev.title}
                    </h3>
                    <span
                      className="pill-badge"
                      style={{
                        marginTop: 4,
                        background: 'var(--color-success-bg)',
                        color: 'var(--color-success-text)',
                        fontSize: '0.68rem',
                        padding: '2px 10px',
                      }}
                    >
                      Going
                    </span>
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {ev.startsIn}
                    </div>
                  </div>
                </div>

                {/* Right Ticket Stub with QR Placeholder and Cancel Button */}
                <div
                  style={{
                    paddingLeft: 10,
                    borderLeft: '2px dashed rgba(16, 42, 67, 0.14)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    flexShrink: 0,
                  }}
                >
                  <QrPlaceholder onClick={() => showToast('Coming soon in the full app')} />
                  <button
                    type="button"
                    onClick={() => toggleRsvp(ev.id)}
                    className="touch-target"
                    style={{
                      minHeight: 44,
                      minWidth: 74,
                      padding: '0 10px',
                      borderRadius: 'var(--radius-pill)',
                      border: '1.5px solid var(--color-primary-dark)',
                      color: 'var(--color-primary-dark)',
                      background: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))
          )}
          <p
            style={{
              textAlign: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--color-text-secondary)',
            }}
          >
            Show the QR code at check-in.
          </p>
        </section>
      )}
      </div>
      <style>{`
        .hub-tab-scroll::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>
    </>
  );
};
