import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, Flame } from 'lucide-react';
import { ACTIVE_RAID_BOSS, RAID_RUNNERS } from '../../data/mock';
import { useAppStore } from '../../store/useAppStore';

const AVATAR_ROW = [
  { id: 'a1', initials: 'AR', name: 'AceRunner', bg: 'linear-gradient(135deg, #38bdf8, #0284c7)' },
  { id: 'a2', initials: 'FL', name: 'Flash', bg: 'linear-gradient(135deg, #f472b6, #db2777)' },
  { id: 'a3', initials: 'ST', name: 'Storm', bg: 'linear-gradient(135deg, #60a5fa, #2563eb)' },
  { id: 'a4', initials: 'MY', name: 'Maya', bg: 'linear-gradient(135deg, #a78bfa, #7c3aed)' },
  { id: 'a5', initials: 'DS', name: 'Dash', bg: 'linear-gradient(135deg, #34d399, #059669)' },
  { id: 'a6', initials: 'SR', name: 'Sari', bg: 'linear-gradient(135deg, #fbbf24, #d97706)' },
];

export const RaidLobbyScreen: React.FC = () => {
  const navigate = useNavigate();
  const { getBossRemainingHp, bossMaxHp, startRaidRun } = useAppStore();

  const remainingHp = getBossRemainingHp();
  const hpPercent = Math.round((remainingHp / bossMaxHp) * 100);
  const lobbyRunners = RAID_RUNNERS.slice(0, 4);

  const handleStartRaid = () => {
    startRaidRun();
    navigate('/run');
  };

  return (
    <>
      {/* Top Header Row: Back Button + Boss Info Card (matches design/7.png) */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="touch-target"
          aria-label="Back to Map"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'var(--color-surface-card)',
            border: '1.5px solid var(--color-border-card)',
            boxShadow: 'var(--shadow-card)',
            color: 'var(--color-primary-dark)',
            flexShrink: 0,
            marginTop: 4,
          }}
        >
          <ChevronLeft size={24} strokeWidth={2.6} />
        </button>

        <section
          className="frosted-card"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            padding: '10px 14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'var(--gradient-boss-hp)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                flexShrink: 0,
              }}
            >
              <Flame size={17} fill="#ffffff" />
            </div>
            <h1 style={{ fontSize: '1.28rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
              {ACTIVE_RAID_BOSS.name}
            </h1>
          </div>

          {/* Boss HP Bar */}
          <div
            style={{
              position: 'relative',
              height: 22,
              borderRadius: 'var(--radius-pill)',
              background: '#d9e2ec',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${hpPercent}%`,
                background: 'var(--gradient-boss-hp)',
                borderRadius: 'var(--radius-pill)',
                transition: 'width 0.3s ease',
              }}
            />
            <span
              style={{
                position: 'relative',
                zIndex: 1,
                fontSize: '0.75rem',
                fontWeight: 900,
                color: '#ffffff',
                textShadow: '0 1px 3px rgba(16, 42, 67, 0.55)',
              }}
            >
              {remainingHp.toLocaleString()} / {bossMaxHp.toLocaleString()} HP
            </span>
          </div>

          {/* Countdown Pill */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span
              className="pill-badge"
              style={{
                background: 'linear-gradient(90deg, #b5f5ec 0%, #87e8de 100%)',
                color: 'var(--color-text-primary)',
                padding: '3px 12px',
                fontSize: '0.78rem',
              }}
            >
              <Clock size={13} />
              {ACTIVE_RAID_BOSS.countdown}
            </span>
          </div>
        </section>
      </div>

      {/* Center Boss Portal Stage */}
      <section
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-card)',
          padding: '10px 12px 6px',
          background:
            'radial-gradient(circle at 50% 55%, rgba(255, 232, 163, 0.72) 0%, rgba(168, 240, 122, 0.55) 60%, rgba(132, 221, 91, 0.45) 100%)',
          border: '1.5px solid rgba(255, 255, 255, 0.85)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <svg width="200" height="142" viewBox="0 0 220 156" className="boss-float-anim">
          <defs>
            <linearGradient id="lobbyBossGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff3b9a" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#00e5ff" />
            </linearGradient>
            <radialGradient id="portalGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="55%" stopColor="#38f8c2" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#00b8a9" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Outer Arena Ring */}
          <ellipse
            cx="110"
            cy="126"
            rx="96"
            ry="22"
            fill="none"
            stroke="#38f8c2"
            strokeWidth="3"
            strokeOpacity="0.7"
          />

          {/* Stone Portal Pedestal */}
          <ellipse cx="110" cy="126" rx="68" ry="18" fill="#627d98" />
          <ellipse cx="110" cy="121" rx="58" ry="14" fill="#829ab1" />
          <ellipse cx="110" cy="119" rx="46" ry="11" fill="url(#portalGlow)" />
          <rect x="105" y="122" width="10" height="14" rx="2" fill="#38f8c2" />

          {/* Energy Rays */}
          <polygon points="110,16 98,55 122,55" fill="rgba(255, 212, 59, 0.35)" />
          <polygon points="46,42 84,72 72,86" fill="rgba(255, 59, 154, 0.28)" />
          <polygon points="174,42 136,72 148,86" fill="rgba(0, 229, 255, 0.28)" />

          {/* Ember Titan Silhouette */}
          <path
            d="M76 112 L64 84 L50 90 L58 56 L78 48 L70 22 L90 36 L110 24 L130 36 L150 22 L142 48 L162 56 L170 90 L156 84 L144 112 L124 112 L120 90 L100 90 L96 112 Z"
            fill="url(#lobbyBossGrad)"
            stroke="#ffffff"
            strokeWidth="2"
          />
          {/* Glowing Eyes */}
          <polygon points="94,52 105,56 96,60" fill="#ffe066" />
          <polygon points="126,52 115,56 124,60" fill="#ffe066" />
        </svg>
      </section>

      {/* Bottom Runners Joined Card + START RAID CTA (matches design/7.png) */}
      <section className="frosted-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ textAlign: 'center', fontSize: '1.08rem', fontWeight: 900 }}>
          <span style={{ color: 'var(--color-primary-dark)', fontSize: '1.2rem' }}>
            {ACTIVE_RAID_BOSS.runnersJoined}
          </span>{' '}
          Runners Joined
        </div>

        {/* 6 Circular Avatars Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 6,
            justifyItems: 'center',
          }}
        >
          {AVATAR_ROW.map((av) => (
            <div
              key={av.id}
              title={av.name}
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: av.bg,
                border: '2px solid #ffffff',
                boxShadow: '0 4px 10px rgba(16, 42, 67, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.76rem',
              }}
            >
              {av.initials}
            </div>
          ))}
        </div>

        {/* 4 Runner Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {lobbyRunners.map((runner) => (
            <div
              key={runner.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 10px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.85)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: runner.avatarColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.75rem',
                  flexShrink: 0,
                }}
              >
                {runner.name.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                {runner.name}
              </span>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#22c55e',
                  display: 'inline-block',
                }}
                aria-label="Online"
              />
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: 'var(--color-text-muted)',
                }}
              >
                Ready
              </span>
            </div>
          ))}
        </div>

        <button type="button" onClick={handleStartRaid} className="btn-primary-cta">
          START RAID
        </button>
      </section>
    </>
  );
};
