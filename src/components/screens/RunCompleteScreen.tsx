import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Flame, Gauge, MapPin, Shield, Star, Timer, Trophy } from 'lucide-react';
import { ACTIVE_RAID_BOSS } from '../../data/mock';
import { useAppStore } from '../../store/useAppStore';

function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const RunCompleteScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, run, getUserRaidDamage, getEarnedXp, getEarnedCoins, claimRunRewards } = useAppStore();

  const distKm = Number(Math.max(0.1, run.distanceKm).toFixed(2));
  const movingSeconds = Math.round(distKm * run.paceSecondsPerKm);
  const calories = Math.round(distKm * 60);
  const raidDamage = getUserRaidDamage();
  const earnedXp = getEarnedXp();
  const earnedCoins = getEarnedCoins();
  const xpProgressPercent = Math.round((user.xp / user.nextLevelXp) * 100);

  const handleClaim = () => {
    claimRunRewards();
    navigate('/');
  };

  return (
    <>
      {/* Main Run Complete & Raid Victory Summary Card (combines design/11.png & design/12.png) */}
      <section
        className="frosted-card"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          overflow: 'hidden',
        }}
      >
        {/* Title & Conditional Raid Victory Banner (Confetti placed below title so it never overlaps) */}
        <div style={{ textAlign: 'center', zIndex: 2 }}>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
            Run Complete!
          </h1>
          {run.bossDefeated ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 4,
                padding: '3px 12px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--color-success-bg)',
                color: 'var(--color-success-text)',
                fontSize: '0.8rem',
                fontWeight: 900,
              }}
            >
              🏅 Raid Victory! • {ACTIVE_RAID_BOSS.name} Defeated
            </div>
          ) : (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 4,
                padding: '3px 12px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(16, 42, 67, 0.08)',
                color: 'var(--color-text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 800,
              }}
            >
              Left Raid Early • Distance Saved
            </div>
          )}
        </div>

        {/* Celebrating Mint + Crystie Illustration with Scoped Confetti Around Character Only */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 4,
          }}
        >
          {/* Confetti pieces positioned exclusively to the left and right of the character, below the title */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 6,
              bottom: 6,
              left: 12,
              right: 12,
              pointerEvents: 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ display: 'flex', gap: 14 }}>
              {['#ff3b9a', '#1ce5c8', '#ffc837'].map((color, idx) => (
                <span
                  key={idx}
                  style={{
                    width: 7,
                    height: 13,
                    borderRadius: 3,
                    background: color,
                    animation: `confettiFall ${1.1 + idx * 0.15}s ease-in-out infinite alternate`,
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              {['#60a5fa', '#a78bfa', '#34d399'].map((color, idx) => (
                <span
                  key={idx}
                  style={{
                    width: 7,
                    height: 13,
                    borderRadius: 3,
                    background: color,
                    animation: `confettiFall ${1.2 + idx * 0.15}s ease-in-out infinite alternate`,
                  }}
                />
              ))}
            </div>
          </div>

          <svg width="140" height="92" viewBox="0 0 140 96" style={{ zIndex: 1 }}>
            <ellipse cx="68" cy="88" rx="44" ry="6" fill="rgba(16, 42, 67, 0.1)" />
            <circle cx="58" cy="22" r="9" fill="#f3b893" />
            <path d="M49 19 Q58 10 67 19 Z" fill="#5c3824" />
            <path
              d="M46 34 L34 16 M70 34 L82 16"
              stroke="#f3b893"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            <rect x="47" y="31" width="22" height="22" rx="6" fill="#00b8a9" />
            <path d="M51 31 L65 31 L62 49 L54 49 Z" fill="#ffffff" />
            <rect x="48" y="51" width="9" height="12" rx="3" fill="#0a878f" />
            <rect x="59" y="51" width="9" height="12" rx="3" fill="#0a878f" />
            <path d="M51 63 L45 78 M64 63 L60 82" stroke="#f3b893" strokeWidth="5" strokeLinecap="round" />
            <rect x="40" y="76" width="9" height="5" rx="2" fill="#00b8a9" />
            <rect x="56" y="80" width="9" height="5" rx="2" fill="#00b8a9" />

            <g transform="translate(88, 48)">
              <polygon points="14,0 6,12 22,12" fill="#72f6d0" />
              <ellipse cx="14" cy="18" rx="11" ry="10" fill="#a8f9e4" />
              <circle cx="10" cy="17" r="1.8" fill="#102a43" />
              <circle cx="18" cy="17" r="1.8" fill="#102a43" />
            </g>
          </svg>
        </div>

        {/* High-Contrast Readable Level XP Progress Bar + Floating +XP Pill */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
              Lv {user.level} • {user.xp.toLocaleString()} / {user.nextLevelXp.toLocaleString()} XP
            </span>
            <span
              className="pill-badge"
              style={{
                background: 'var(--color-primary-soft)',
                border: '1.5px solid var(--color-primary)',
                color: 'var(--color-primary-deep)',
                fontSize: '0.74rem',
                padding: '2px 10px',
              }}
            >
              +{earnedXp} XP
            </span>
          </div>

          <div
            style={{
              position: 'relative',
              height: 16,
              borderRadius: 'var(--radius-pill)',
              background: '#102a43',
              overflow: 'hidden',
              padding: 2,
            }}
          >
            <div
              style={{
                width: `${xpProgressPercent}%`,
                height: '100%',
                background: 'var(--gradient-xp-bar)',
                borderRadius: 'var(--radius-pill)',
              }}
            />
          </div>
        </div>

        {/* 3 Reward Badges Row: +Coins, Raid Slayer / Runner, First Victory */}
        <div
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
          }}
        >
          <div
            style={{
              padding: '9px 6px',
              borderRadius: 'var(--radius-lg)',
              background: '#ffffff',
              border: '1px solid var(--color-border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fde047, #f59e0b)',
                border: '2px solid #b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#78350f',
                fontWeight: 900,
              }}
            >
              $
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
              +{earnedCoins} Coins
            </span>
          </div>

          <div
            style={{
              padding: '9px 6px',
              borderRadius: 'var(--radius-lg)',
              background: '#ffffff',
              border: '1px solid var(--color-border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7',
              }}
            >
              <Shield size={20} fill="#38bdf8" />
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
              {run.bossDefeated ? 'Raid Slayer' : 'Raid Contributor'}
            </span>
          </div>

          <div
            style={{
              padding: '9px 6px',
              borderRadius: 'var(--radius-lg)',
              background: '#ffffff',
              border: '1px solid var(--color-border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d97706',
              }}
            >
              <Trophy size={19} fill="#fbbf24" />
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
              {run.bossDefeated ? 'First Victory' : 'Pace Keeper'}
            </span>
          </div>
        </div>
      </section>

      {/* 6-Stat Summary Grid Consistent with the Run */}
      <section
        className="frosted-card"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 8,
          padding: '10px 12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MapPin size={18} color="#00b8a9" />
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-text-secondary)' }}>
              Distance
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 900 }}>{distKm.toFixed(2)} KM</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Gauge size={18} color="#00b8a9" />
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-text-secondary)' }}>
              Avg Pace
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 900 }}>5:30 /KM</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Timer size={18} color="#00b8a9" />
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-text-secondary)' }}>
              Moving Time
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 900 }}>{formatDuration(movingSeconds)}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Flame size={18} color="#00b8a9" />
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-text-secondary)' }}>
              Calories
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 900 }}>{calories} kcal</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Award size={18} color="#00b8a9" />
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-text-secondary)' }}>
              Raid Damage
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 900 }}>{raidDamage} DMG</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Star size={18} color="#00b8a9" />
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-text-secondary)' }}>
              Level XP
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 900 }}>+{earnedXp} XP</div>
          </div>
        </div>
      </section>

      {/* Claim Rewards CTA */}
      <button type="button" onClick={handleClaim} className="btn-primary-cta">
        Claim Rewards
      </button>
    </>
  );
};
