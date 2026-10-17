import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Footprints,
  MapPin,
  Timer,
  Flame,
  Swords,
  Shield,
  Trophy,
  Award,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, setHubTab } = useAppStore();

  const xpPercent = Math.min(100, Math.round((user.xp / user.nextLevelXp) * 100));

  const handleOpenQuests = () => {
    setHubTab('overview');
    navigate('/hub');
  };

  return (
    <>
      {/* Avatar Stage (Mint + Crystie) & User Identity Card matching design/6.png */}
      <section
        className="frosted-card"
        aria-label="Runner Profile Summary"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          padding: 14,
          background:
            'linear-gradient(180deg, rgba(224, 251, 246, 0.92) 0%, rgba(255, 255, 255, 0.96) 45%)',
        }}
      >
        {/* Mint + Crystie Avatar Display */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 96,
              height: 104,
              borderRadius: 'var(--radius-lg)',
              background:
                'radial-gradient(circle at 50% 75%, rgba(56, 248, 194, 0.28), rgba(255, 255, 255, 0.5))',
              border: '1.5px solid rgba(0, 184, 169, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="88" height="96" viewBox="0 0 100 104" aria-label="Mint and Crystie">
              {/* Glowing Platform Ring */}
              <ellipse
                cx="44"
                cy="92"
                rx="32"
                ry="7"
                fill="none"
                stroke="#22f59a"
                strokeWidth="3.5"
              />
              {/* Head & Hair */}
              <circle cx="44" cy="22" r="10" fill="#f3b893" />
              <path d="M34 19 Q44 8 54 19 Z" fill="#4a2c18" />
              {/* Mint Running Kit */}
              <rect x="33" y="33" width="22" height="24" rx="6" fill="#00b8a9" />
              <path d="M37 33 L51 33 L48 53 L40 53 Z" fill="#ffffff" />
              {/* Shorts */}
              <rect x="34" y="55" width="9" height="14" rx="3" fill="#066168" />
              <rect x="45" y="55" width="9" height="14" rx="3" fill="#066168" />
              {/* Legs & Shoes */}
              <rect x="36" y="69" width="5" height="16" fill="#f3b893" />
              <rect x="47" y="69" width="5" height="16" fill="#f3b893" />
              <rect x="34" y="83" width="9" height="5" rx="2" fill="#00b8a9" />
              <rect x="46" y="83" width="9" height="5" rx="2" fill="#00b8a9" />
              {/* Crystie Companion */}
              <g transform="translate(66, 56)">
                <polygon points="12,0 5,12 19,12" fill="#4ce0b3" />
                <ellipse cx="12" cy="18" rx="10" ry="9" fill="#a8f9e4" />
                <circle cx="9" cy="17" r="1.8" fill="#102a43" />
                <circle cx="15" cy="17" r="1.8" fill="#102a43" />
              </g>
            </svg>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                fontSize: '1.22rem',
                fontWeight: 900,
                color: 'var(--color-text-primary)',
                letterSpacing: '0.01em',
              }}
            >
              {user.username}
            </h1>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 6,
                marginTop: 4,
              }}
            >
              <span
                className="pill-badge"
                style={{
                  background: 'var(--gradient-cta)',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  padding: '2px 10px',
                }}
              >
                Lv {user.level}
              </span>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: 'var(--color-text-secondary)',
                }}
              >
                {user.title}
              </span>
            </div>

            <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <span
                className="pill-badge"
                style={{
                  background: 'var(--color-gold-bg)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.7rem',
                  padding: '3px 9px',
                }}
              >
                <Flame size={12} color="#ff8a2b" fill="#ff8a2b" />
                {user.partyName}
              </span>
              <span
                className="pill-badge"
                style={{
                  background: 'var(--color-primary-soft)',
                  color: 'var(--color-primary-deep)',
                  fontSize: '0.7rem',
                  padding: '3px 9px',
                }}
              >
                Weekly: {user.weeklyDistanceKm} KM
              </span>
            </div>
          </div>
        </div>

        {/* Level XP Bar (matching design/6.png) */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <div
              style={{
                flex: 1,
                height: 10,
                borderRadius: 999,
                background: 'rgba(16, 42, 67, 0.1)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${xpPercent}%`,
                  height: '100%',
                  borderRadius: 999,
                  background: 'var(--gradient-xp-bar)',
                }}
              />
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 900,
                color: 'var(--color-text-primary)',
                whiteSpace: 'nowrap',
              }}
            >
              {user.xp.toLocaleString()} / {user.nextLevelXp.toLocaleString()} XP
            </span>
          </div>
        </div>

        {/* 6-Item Stats Grid (Total Distance, Total Runs, Longest Run, Fastest Pace, Current Streak, Raid Damage) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            marginTop: 2,
          }}
        >
          {[
            {
              label: 'Total Distance',
              value: `${user.totalDistanceKm} KM`,
              icon: <Footprints size={16} color="#0284c7" />,
              bg: '#e0f2fe',
            },
            {
              label: 'Total Runs',
              value: `${user.totalRuns}`,
              icon: <Footprints size={16} color="#16a34a" />,
              bg: '#dcfce7',
            },
            {
              label: 'Longest Run',
              value: `${user.longestRunKm} KM`,
              icon: <MapPin size={16} color="#d97706" />,
              bg: '#fef3c7',
            },
            {
              label: 'Fastest Pace',
              value: user.fastestPace,
              icon: <Timer size={16} color="#9333ea" />,
              bg: '#f3e8ff',
            },
            {
              label: 'Current Streak',
              value: `${user.currentStreakDays} Days`,
              icon: <Flame size={16} color="#ea580c" />,
              bg: '#ffedd5',
            },
            {
              label: 'Raid Damage',
              value: `${user.totalRaidDamage} DMG`,
              icon: <Swords size={16} color="#0284c7" />,
              bg: '#e0f2fe',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                padding: '9px 6px',
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                border: '1px solid var(--color-border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 4,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: stat.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {stat.icon}
              </div>
              <div
                style={{
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  color: 'var(--color-text-secondary)',
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 900,
                  color: 'var(--color-text-primary)',
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Earned Badges Section */}
      <section
        className="frosted-card"
        aria-label="Earned Badges"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '12px 14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2
            style={{
              fontSize: '0.96rem',
              fontWeight: 900,
              color: 'var(--color-text-primary)',
            }}
          >
            Earned Badges
          </h2>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
            4 Unlocked
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 6,
          }}
        >
          {[
            { name: 'Raid Slayer', icon: <Shield size={16} color="#0284c7" />, bg: '#e0f2fe' },
            { name: 'First Victory', icon: <Trophy size={16} color="#d97706" />, bg: '#fef3c7' },
            { name: '15d Streak', icon: <Flame size={16} color="#ea580c" />, bg: '#ffedd5' },
            { name: 'Pro Pacer', icon: <Award size={16} color="#0d9488" />, bg: '#ccfbf1' },
          ].map((badge) => (
            <div
              key={badge.name}
              style={{
                padding: '8px 4px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.85)',
                border: '1px solid var(--color-border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: badge.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {badge.icon}
              </div>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  color: 'var(--color-text-primary)',
                }}
              >
                {badge.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* "View quests" Link Card opening Hub -> Overview tab */}
      <button
        type="button"
        onClick={handleOpenQuests}
        className="frosted-card touch-target"
        style={{
          width: '100%',
          minHeight: 56,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          textAlign: 'left',
          background:
            'linear-gradient(90deg, rgba(224, 251, 246, 0.95) 0%, rgba(255, 255, 255, 0.96) 100%)',
          border: '1.5px solid rgba(0, 184, 169, 0.35)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'var(--gradient-cta)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <div
              style={{
                fontSize: '0.92rem',
                fontWeight: 900,
                color: 'var(--color-text-primary)',
              }}
            >
              View quests
            </div>
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: 'var(--color-text-secondary)',
              }}
            >
              15-Day Streak, Daily Quests & Weekly Quest in Hub
            </div>
          </div>
        </div>

        <ChevronRight size={20} color="var(--color-primary-dark)" />
      </button>
    </>
  );
};
