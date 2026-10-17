import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, MapPin, Sparkles, Star, Zap } from 'lucide-react';
import { ACTIVE_RAID_BOSS, RAID_RUNNERS } from '../../data/mock';
import { useAppStore } from '../../store/useAppStore';

function getRankStyle(rank: number, isUser?: boolean) {
  if (isUser) {
    return { bg: '#22e6b8', color: '#102a43' };
  }
  if (rank === 1) return { bg: '#fbd361', color: '#102a43' };
  if (rank === 2) return { bg: '#c5dcf5', color: '#102a43' };
  if (rank === 3) return { bg: '#f4a261', color: '#102a43' };
  return { bg: '#c5dcf5', color: '#102a43' };
}

function getBadgeStyle(rank: number, isUser?: boolean) {
  if (isUser) return { bg: '#b2f5ea', color: '#0a6c74', icon: <Star size={12} fill="#0a6c74" /> };
  if (rank === 1) return { bg: '#fef0c7', color: '#92400e', icon: <Crown size={12} fill="#f59e0b" /> };
  if (rank === 2) return { bg: '#cfe9ff', color: '#1e40af', icon: <Crown size={12} fill="#3b82f6" /> };
  if (rank === 3) return { bg: '#e9d5ff', color: '#5b21b6', icon: <Crown size={12} fill="#8b5cf6" /> };
  return { bg: '#b2f5ea', color: '#0a6c74', icon: <Zap size={12} fill="#0a6c74" /> };
}

export const RaidResultsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { run, getUserRaidDamage } = useAppStore();

  const userDist = Number(Math.max(0.1, run.distanceKm).toFixed(2));
  const userDmg = getUserRaidDamage();

  const rows = RAID_RUNNERS.map((r) =>
    r.isUser ? { ...r, distanceKm: userDist, damage: userDmg } : r
  );

  return (
    <>
      {/* Top Bursting Crystal Portal Stage + Raid Results Title Card (matches design/10.png) */}
      <section
        className="frosted-card"
        style={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          textAlign: 'center',
          background:
            'linear-gradient(180deg, rgba(227, 250, 252, 0.96) 0%, rgba(255, 255, 255, 0.96) 100%)',
        }}
      >
        {/* Bursting Crystal Shards SVG */}
        <svg width="160" height="82" viewBox="0 0 180 92" style={{ flexShrink: 0 }}>
          <ellipse cx="90" cy="78" rx="56" ry="12" fill="#627d98" />
          <ellipse cx="90" cy="75" rx="44" ry="8" fill="#38f8c2" />
          <polygon points="90,8 76,42 90,56 104,42" fill="#d946ef" />
          <polygon points="56,20 48,46 62,54 68,34" fill="#ff3b9a" />
          <polygon points="124,20 112,34 118,54 132,46" fill="#38bdf8" />
          <polygon points="72,10 64,28 76,34" fill="#fb923c" />
          <polygon points="110,12 104,32 116,28" fill="#818cf8" />
        </svg>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={18} color="#00b8a9" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
            Raid Results
          </h1>
          <Sparkles size={18} color="#00b8a9" />
        </div>
        <div
          style={{
            fontSize: '0.92rem',
            fontWeight: 800,
            color: 'var(--color-primary-dark)',
          }}
        >
          {ACTIVE_RAID_BOSS.name} Defeated
        </div>
      </section>

      {/* Ranked Runners List */}
      <section style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((runner) => {
          const rankCircle = getRankStyle(runner.rank, runner.isUser);
          const badge = getBadgeStyle(runner.rank, runner.isUser);

          return (
            <div
              key={runner.id}
              className="frosted-card"
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 9px',
                border: runner.isUser
                  ? '2px solid var(--color-primary-glow)'
                  : '1.5px solid var(--color-border-card)',
                boxShadow: runner.isUser
                  ? '0 0 0 2px rgba(56, 248, 194, 0.3), var(--shadow-card)'
                  : 'var(--shadow-card)',
              }}
            >
              {/* Rank Number Circle */}
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: rankCircle.bg,
                  color: rankCircle.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '0.76rem',
                  flexShrink: 0,
                }}
              >
                {runner.rank}
              </div>

              {/* Avatar Circle */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: runner.avatarColor,
                  border: '2px solid #ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.7rem',
                  flexShrink: 0,
                }}
              >
                {runner.isUser ? 'TK' : runner.name.slice(0, 2).toUpperCase()}
              </div>

              {/* Runner Name + Distance & Damage */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: '0.84rem',
                    color: 'var(--color-text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {runner.name}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: '0.67rem',
                    fontWeight: 800,
                    color: 'var(--color-text-secondary)',
                    marginTop: 2,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, whiteSpace: 'nowrap' }}>
                    <MapPin size={10} color="#0284c7" />
                    {runner.distanceKm.toFixed(1)} KM
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, whiteSpace: 'nowrap' }}>
                    ✴️ {runner.damage} DMG
                  </span>
                </div>
              </div>

              {/* Right Rank / Party Pill */}
              <span
                className="pill-badge"
                style={{
                  background: badge.bg,
                  color: badge.color,
                  fontSize: '0.62rem',
                  padding: '3px 6px',
                  gap: 3,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {badge.icon}
                {runner.badgeText}
              </span>
            </div>
          );
        })}
      </section>

      {/* Continue Button */}
      <button
        type="button"
        onClick={() => navigate('/run/complete')}
        className="btn-primary-cta"
        style={{ flexShrink: 0 }}
      >
        Continue
      </button>
    </>
  );
};
