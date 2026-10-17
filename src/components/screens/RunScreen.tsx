import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Flame, Ghost, LogOut, Navigation, Users, Zap } from 'lucide-react';
import { ACTIVE_RAID_BOSS } from '../../data/mock';
import { useAppStore } from '../../store/useAppStore';

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const RunScreen: React.FC = () => {
  const navigate = useNavigate();
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const {
    run,
    bossMaxHp,
    getBossRemainingHp,
    getUserRaidDamage,
    startRaidRun,
    toggleDemoSpeed,
    toggleGhostRunner,
    toggleGps,
    tickRun,
    leaveRaid,
  } = useAppStore();

  // Ensure a fresh or active raid run is started when entering /run if not already running
  useEffect(() => {
    if (!run.isRunning && run.liveCommunityDamage === 0) {
      startRaidRun();
    }
  }, [run.isRunning, run.liveCommunityDamage, startRaidRun]);

  // Tick multiplayer raid damage (both user distance & simulated other runners)
  useEffect(() => {
    if (!run.isRunning || showLeaveModal) return;
    const interval = window.setInterval(() => {
      tickRun(1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [run.isRunning, showLeaveModal, tickRun]);

  const remainingHp = getBossRemainingHp();

  // Automatically navigate to Raid Results when Boss HP hits 0
  useEffect(() => {
    if (remainingHp <= 0 && run.bossDefeated) {
      navigate('/raid/results');
    }
  }, [remainingHp, run.bossDefeated, navigate]);

  const hpPercent = Math.round((remainingHp / bossMaxHp) * 100);
  const userDamage = getUserRaidDamage();
  const communityDamage = Math.round(run.liveCommunityDamage / 10);

  const handleConfirmLeave = () => {
    setShowLeaveModal(false);
    leaveRaid();
    navigate('/run/complete');
  };

  return (
    <>
      {/* Live Multiplayer Raid Boss HP Header Card */}
      <section className="frosted-card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 900, fontSize: '0.96rem' }}>
            <Flame size={17} color="#ff3b9a" fill="#ff3b9a" />
            {ACTIVE_RAID_BOSS.name}
          </span>
          <span
            className="pill-badge"
            style={{
              background: '#ffd8d8',
              color: '#d93025',
              fontSize: '0.7rem',
              padding: '2px 8px',
              whiteSpace: 'nowrap',
            }}
          >
            ⚔️ You -{userDamage} • Raid -{communityDamage} DMG
          </span>
        </div>

        <div
          style={{
            position: 'relative',
            height: 22,
            borderRadius: 'var(--radius-pill)',
            background: '#1e293b',
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
              transition: 'width 0.35s ease',
            }}
          />
          <span
            style={{
              position: 'relative',
              zIndex: 1,
              fontSize: '0.75rem',
              fontWeight: 900,
              color: '#ffffff',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.85)',
            }}
          >
            {remainingHp.toLocaleString()} / {bossMaxHp.toLocaleString()} HP
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.66rem',
            fontWeight: 800,
            color: 'var(--color-text-secondary)',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Users size={12} color="#00b8a9" />
            128 Runners attacking
          </span>
          <span style={{ color: 'var(--color-primary-dark)' }}>
            Ends when Boss HP hits 0
          </span>
        </div>
      </section>

      {/* Scrolling Battle Stage: Animated Running Mint Sprite Facing the Boss */}
      <section
        style={{
          position: 'relative',
          height: 172,
          borderRadius: 'var(--radius-card)',
          overflow: 'hidden',
          border: '2px solid rgba(255, 255, 255, 0.9)',
          boxShadow: 'var(--shadow-card)',
          background: 'linear-gradient(180deg, #74c0fc 0%, #d0f4de 56%, #74c655 57%, #52b748 100%)',
        }}
      >
        {/* Scrolling Clouds & Trees Layer */}
        <div
          className="run-scrolling-trees"
          style={{
            position: 'absolute',
            top: 10,
            left: 0,
            width: '200%',
            height: 90,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            pointerEvents: 'none',
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <svg key={idx} width="54" height="64" viewBox="0 0 54 64">
              <ellipse cx="27" cy="14" rx="18" ry="7" fill="rgba(255,255,255,0.75)" />
              <rect x="24" y="46" width="6" height="16" fill="#7c4d2b" />
              <polygon points="27,20 12,48 42,48" fill="#389e3c" />
            </svg>
          ))}
        </div>

        {/* Scrolling Running Track Lane */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 12,
            height: 52,
            background: '#e9cfb0',
            borderTop: '3px solid #f7e3c8',
            borderBottom: '3px solid #d4b48c',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div className="run-scrolling-lane" style={{ width: '100%', height: 6 }} />
        </div>

        {/* Left Side: Animated Running Mint Sprite + Crystie Companion Facing Right (Toward Boss) */}
        <div
          style={{
            position: 'absolute',
            left: 22,
            bottom: 14,
            zIndex: 2,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 4,
          }}
        >
          <svg width="92" height="104" viewBox="0 0 92 104" className="mint-runner-sprite">
            {/* Glowing Aura Trail Under Mint */}
            <ellipse cx="40" cy="94" rx="28" ry="7" fill="rgba(56, 248, 194, 0.45)" />

            {/* Back Leg */}
            <g className="mint-leg-back">
              <rect x="33" y="56" width="7" height="22" rx="3.5" fill="#d99b78" />
              <rect x="31" y="75" width="12" height="6" rx="3" fill="#0a878f" />
            </g>

            {/* Torso Leaning Forward Facing Right */}
            <g transform="rotate(10 38 42)">
              <rect x="28" y="30" width="20" height="28" rx="7" fill="#00b8a9" />
              <path d="M34 30 L46 30 L44 54 L34 54 Z" fill="#ffffff" />
              <rect x="28" y="52" width="20" height="10" rx="4" fill="#0a878f" />
            </g>

            {/* Head Facing Right */}
            <circle cx="42" cy="19" r="10" fill="#f3b893" />
            <path d="M31 18 Q40 6 52 15 L48 21 L32 21 Z" fill="#5c3824" />
            <circle cx="47" cy="19" r="1.8" fill="#102a43" />

            {/* Front Pumping Arm */}
            <path
              d="M38 35 L52 44 L60 36"
              fill="none"
              stroke="#f3b893"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Front Leg */}
            <g className="mint-leg-front">
              <rect x="35" y="56" width="7" height="23" rx="3.5" fill="#f3b893" />
              <rect x="34" y="76" width="13" height="6" rx="3" fill="#1ce5c8" />
            </g>

            {/* Crystie Companion Floating Behind Mint */}
            <g transform="translate(2, 48)">
              <polygon points="12,0 5,11 19,11" fill="#72f6d0" />
              <ellipse cx="12" cy="16" rx="9" ry="8" fill="#a8f9e4" />
              <circle cx="15" cy="15" r="1.6" fill="#102a43" />
            </g>
          </svg>

          {/* Flying Energy Slash Toward Boss */}
          <div
            className="energy-slash-anim"
            style={{
              marginBottom: 42,
              padding: '3px 8px',
              borderRadius: 'var(--radius-pill)',
              background: 'linear-gradient(90deg, #38f8c2, #00b8a9)',
              color: '#102a43',
              fontWeight: 900,
              fontSize: '0.68rem',
              boxShadow: '0 0 12px #38f8c2',
              whiteSpace: 'nowrap',
            }}
          >
            ⚡ SLASH!
          </div>
        </div>

        {/* Right Side: Ember Titan Boss Facing Left (Toward Mint) */}
        <div
          style={{
            position: 'absolute',
            right: 14,
            bottom: 14,
            zIndex: 2,
          }}
        >
          <svg width="118" height="122" viewBox="0 0 120 124" className="boss-float-anim">
            <defs>
              <linearGradient id="runBossGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ff3b9a" />
                <stop offset="55%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#00e5ff" />
              </linearGradient>
            </defs>
            <ellipse cx="62" cy="112" rx="44" ry="10" fill="#486581" />
            <ellipse cx="62" cy="110" rx="34" ry="7" fill="#ffd43b" />
            <path
              d="M36 102 L26 76 L14 82 L22 48 L40 40 L34 16 L50 30 L64 18 L78 30 L94 16 L88 40 L104 48 L110 82 L98 76 L88 102 L72 102 L68 82 L54 82 L50 102 Z"
              fill="url(#runBossGrad)"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <polygon points="46,44 56,48 48,52" fill="#ffe066" />
            <polygon points="72,44 62,48 70,52" fill="#ffe066" />
          </svg>
        </div>
      </section>

      {/* Primary Live Run Telemetry & Controls Card */}
      <section className="frosted-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              padding: '8px 6px',
              borderRadius: 'var(--radius-md)',
              background: '#ffffff',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>
              DISTANCE
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--color-primary-dark)' }}>
              {run.distanceKm.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-text-secondary)' }}>
              KM
            </div>
          </div>

          <div
            style={{
              padding: '8px 6px',
              borderRadius: 'var(--radius-md)',
              background: '#ffffff',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>
              AVG PACE
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
              5:30
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-text-secondary)' }}>
              /KM
            </div>
          </div>

          <div
            style={{
              padding: '8px 6px',
              borderRadius: 'var(--radius-md)',
              background: '#ffffff',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>
              MOVING TIME
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
              {formatTime(run.elapsedSeconds)}
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-text-secondary)' }}>
              MIN:SEC
            </div>
          </div>
        </div>

        {/* Interactive Mode Toggles (Demo Speed ~45s defeat, Ghost Runner, Real GPS) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          <button
            type="button"
            onClick={toggleDemoSpeed}
            className="touch-target"
            style={{
              padding: '6px 6px',
              borderRadius: 'var(--radius-md)',
              background: run.demoSpeed ? 'var(--color-primary-soft)' : '#ffffff',
              border: run.demoSpeed
                ? '1.5px solid var(--color-primary)'
                : '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-primary)',
              fontWeight: 800,
              fontSize: '0.7rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                color: 'var(--color-primary-dark)',
                whiteSpace: 'nowrap',
              }}
            >
              <Zap size={12} />
              Demo Speed
            </span>
            <span style={{ fontSize: '0.64rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
              {run.demoSpeed ? 'ON (~45s Boss)' : 'OFF (1x)'}
            </span>
          </button>

          <button
            type="button"
            onClick={toggleGhostRunner}
            className="touch-target"
            style={{
              padding: '6px 6px',
              borderRadius: 'var(--radius-md)',
              background: run.ghostRunnerEnabled ? 'var(--color-primary-soft)' : '#ffffff',
              border: run.ghostRunnerEnabled
                ? '1.5px solid var(--color-primary)'
                : '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-primary)',
              fontWeight: 800,
              fontSize: '0.7rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                color: 'var(--color-primary-dark)',
                whiteSpace: 'nowrap',
              }}
            >
              <Ghost size={12} />
              Ghost PR
            </span>
            <span style={{ fontSize: '0.64rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
              {run.ghostRunnerEnabled ? 'Ahead +18m' : 'Off'}
            </span>
          </button>

          <button
            type="button"
            onClick={toggleGps}
            className="touch-target"
            style={{
              padding: '6px 6px',
              borderRadius: 'var(--radius-md)',
              background: run.gpsEnabled ? 'var(--color-primary-soft)' : '#ffffff',
              border: run.gpsEnabled
                ? '1.5px solid var(--color-primary)'
                : '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-primary)',
              fontWeight: 800,
              fontSize: '0.7rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                color: 'var(--color-primary-dark)',
                whiteSpace: 'nowrap',
              }}
            >
              <Navigation size={12} />
              Real GPS
            </span>
            <span style={{ fontSize: '0.64rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
              {run.gpsEnabled ? 'Live GPS' : 'Simulated'}
            </span>
          </button>
        </div>

        {/* Single "Leave Raid" Control while Boss HP > 0 (No Pause button per Pokémon GO raid rules) */}
        <button
          type="button"
          onClick={() => setShowLeaveModal(true)}
          className="touch-target"
          style={{
            width: '100%',
            minHeight: 48,
            borderRadius: 'var(--radius-pill)',
            background: '#fff5f5',
            border: '2px solid #f87171',
            color: '#c53030',
            fontWeight: 900,
            fontSize: '0.95rem',
            gap: 8,
          }}
        >
          <LogOut size={17} />
          Leave Raid
        </button>
      </section>

      {/* Confirm Leave Raid Modal Dialog */}
      {showLeaveModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-raid-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 80,
            background: 'rgba(16, 42, 67, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            className="frosted-card"
            style={{
              width: '100%',
              maxWidth: 340,
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              textAlign: 'center',
              padding: 18,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'var(--color-danger-bg)',
                color: 'var(--color-danger-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <h2 id="leave-raid-title" style={{ fontSize: '1.15rem', fontWeight: 900 }}>
              Leave Raid Battle?
            </h2>
            <p
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--color-text-secondary)',
                lineHeight: 1.4,
              }}
            >
              {ACTIVE_RAID_BOSS.name} still has <strong>{remainingHp.toLocaleString()} HP</strong> left! If you
              leave now, you will keep your <strong>{run.distanceKm.toFixed(2)} KM</strong> run distance, but you
              won&apos;t earn the Raid Victory bonus.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                className="touch-target"
                style={{
                  minHeight: 46,
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--color-primary-soft)',
                  color: 'var(--color-primary-deep)',
                  fontWeight: 900,
                  fontSize: '0.86rem',
                }}
              >
                Keep Fighting
              </button>
              <button
                type="button"
                onClick={handleConfirmLeave}
                className="touch-target"
                style={{
                  minHeight: 46,
                  borderRadius: 'var(--radius-pill)',
                  background: '#e53e3e',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.86rem',
                }}
              >
                Confirm Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
