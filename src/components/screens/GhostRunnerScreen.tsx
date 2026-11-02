import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Crown,
  Flame,
  Ghost,
  Lock,
  Play,
  RotateCcw,
  Timer,
  Trophy,
  User,
  Users,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface CheckpointSplit {
  km: number;
  label: string;
  ghostCumulativeSec: number;
}

interface ShadowOpponent {
  id: string;
  category: 'self' | 'friend';
  runnerName: string;
  routeTitle: string;
  recordedAt: string;
  totalKm: number;
  targetPaceLabel: string;
  targetPaceSecPerKm: number;
  proOnly: boolean;
  checkpoints: CheckpointSplit[];
}

const SHADOW_OPPONENTS: ShadowOpponent[] = [
  {
    id: 'self_yesterday_3k',
    category: 'self',
    runnerName: 'Dirimu (Kemarin Sore)',
    routeTitle: 'GBK Senayan Loop • 3.0 KM',
    recordedAt: 'Rekor kemarin • 16:30',
    totalKm: 3,
    targetPaceLabel: '5:30 /KM',
    targetPaceSecPerKm: 330,
    proOnly: false,
    checkpoints: [
      { km: 1, label: 'Titik 1.0 KM (Gerbang Utara)', ghostCumulativeSec: 332 },
      { km: 2, label: 'Titik 2.0 KM (Jembatan Taman)', ghostCumulativeSec: 662 },
      { km: 3, label: 'Titik 3.0 KM (Garis Finish)', ghostCumulativeSec: 990 },
    ],
  },
  {
    id: 'self_pb_5k',
    category: 'self',
    runnerName: 'Dirimu (Personal Best 5K)',
    routeTitle: 'Sudirman Morning Run • 5.0 KM',
    recordedAt: 'Rekor terbaikmu • 26:15',
    totalKm: 5,
    targetPaceLabel: '5:15 /KM',
    targetPaceSecPerKm: 315,
    proOnly: true,
    checkpoints: [
      { km: 1, label: 'Titik 1.0 KM (Bundaran)', ghostCumulativeSec: 318 },
      { km: 2, label: 'Titik 2.0 KM (Jembatan Semanggi)', ghostCumulativeSec: 633 },
      { km: 3, label: 'Titik 3.0 KM (Taman Tengah)', ghostCumulativeSec: 946 },
      { km: 4, label: 'Titik 4.0 KM (Jalur Cepat)', ghostCumulativeSec: 1261 },
      { km: 5, label: 'Titik 5.0 KM (Garis Finish)', ghostCumulativeSec: 1575 },
    ],
  },
  {
    id: 'friend_raka_3k',
    category: 'friend',
    runnerName: 'Raka_Sprint (Teman Party)',
    routeTitle: 'Kemang Tempo Track • 3.0 KM',
    recordedAt: 'Rekor teman • 15:54',
    totalKm: 3,
    targetPaceLabel: '5:18 /KM',
    targetPaceSecPerKm: 318,
    proOnly: false,
    checkpoints: [
      { km: 1, label: 'Titik 1.0 KM (Start Avenue)', ghostCumulativeSec: 320 },
      { km: 2, label: 'Titik 2.0 KM (Tanjakan Selatan)', ghostCumulativeSec: 638 },
      { km: 3, label: 'Titik 3.0 KM (Garis Finish)', ghostCumulativeSec: 954 },
    ],
  },
  {
    id: 'friend_alya_5k',
    category: 'friend',
    runnerName: 'Alya_Pacer (Top Party)',
    routeTitle: 'Senayan Fast Pace • 5.0 KM',
    recordedAt: 'Rekor teman • 24:35',
    totalKm: 5,
    targetPaceLabel: '4:55 /KM',
    targetPaceSecPerKm: 295,
    proOnly: true,
    checkpoints: [
      { km: 1, label: 'Titik 1.0 KM (Plaza Timur)', ghostCumulativeSec: 296 },
      { km: 2, label: 'Titik 2.0 KM (Lintasan Stadion)', ghostCumulativeSec: 592 },
      { km: 3, label: 'Titik 3.0 KM (Danau Barat)', ghostCumulativeSec: 887 },
      { km: 4, label: 'Titik 4.0 KM (Boulevard)', ghostCumulativeSec: 1181 },
      { km: 5, label: 'Titik 5.0 KM (Garis Finish)', ghostCumulativeSec: 1475 },
    ],
  },
];

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatSplitDiff(diffSeconds: number): string {
  const rounded = Math.round(diffSeconds);
  const abs = Math.abs(rounded);
  const mins = Math.floor(abs / 60);
  const secs = abs % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  if (rounded < 0) return `-${formatted}`;
  if (rounded > 0) return `+${formatted}`;
  return '00:00';
}

export const GhostRunnerScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isPro, showToast } = useAppStore();

  const [categoryTab, setCategoryTab] = useState<'self' | 'friend'>('self');
  const [selectedOpponentId, setSelectedOpponentId] = useState<string>('self_yesterday_3k');

  // Live Ghost Run Session State
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [sprintBoost, setSprintBoost] = useState(true);
  const [demoFast, setDemoFast] = useState(true);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [userDistKm, setUserDistKm] = useState(0);
  const [recordedUserSplits, setRecordedUserSplits] = useState<Record<number, number>>({});

  const selectedOpponent =
    SHADOW_OPPONENTS.find((o) => o.id === selectedOpponentId) || SHADOW_OPPONENTS[0];

  const filteredOpponents = SHADOW_OPPONENTS.filter((o) => o.category === categoryTab);

  // User current pace (seconds per KM): when Sprint Boost is ON, user runs ~14 sec/KM faster than the shadow!
  // When Sprint Boost is OFF, user runs ~8 sec/KM slower than the shadow so user can test both leading and trailing.
  const currentUserPaceSec = sprintBoost
    ? selectedOpponent.targetPaceSecPerKm - 14
    : selectedOpponent.targetPaceSecPerKm + 8;

  useEffect(() => {
    if (!isSessionActive || isFinished) return;

    const interval = window.setInterval(() => {
      const simStepSec = demoFast ? 28 : 2;
      setElapsedSec((prevSec) => {
        const nextSec = prevSec + simStepSec;
        const stepKm = simStepSec / currentUserPaceSec;

        setUserDistKm((prevKm) => {
          const rawNextKm = prevKm + stepKm;
          const clampedKm = Math.min(selectedOpponent.totalKm, Number(rawNextKm.toFixed(2)));

          // Record checkpoint splits as user crosses each KM mark
          setRecordedUserSplits((prevSplits) => {
            const updated = { ...prevSplits };
            for (const cp of selectedOpponent.checkpoints) {
              if (clampedKm >= cp.km && updated[cp.km] === undefined) {
                const fraction =
                  stepKm > 0 ? Math.max(0, Math.min(1, (cp.km - prevKm) / stepKm)) : 1;
                updated[cp.km] = Math.round(prevSec + fraction * simStepSec);
              }
            }
            return updated;
          });

          if (clampedKm >= selectedOpponent.totalKm) {
            setIsFinished(true);
            setIsSessionActive(false);
          }

          return clampedKm;
        });

        return nextSec;
      });
    }, 650);

    return () => window.clearInterval(interval);
  }, [isSessionActive, isFinished, demoFast, currentUserPaceSec, selectedOpponent]);

  const handleSelectOpponent = (opp: ShadowOpponent) => {
    if (opp.proOnly && !isPro) {
      showToast('Ghost Runner Tanpa Batas tersedia di RAIDRUN PRO');
      navigate('/pro');
      return;
    }
    setSelectedOpponentId(opp.id);
    setIsSessionActive(false);
    setIsFinished(false);
    setElapsedSec(0);
    setUserDistKm(0);
    setRecordedUserSplits({});
  };

  const handleStartSession = () => {
    setElapsedSec(58);
    setUserDistKm(0.18);
    setRecordedUserSplits({});
    setIsFinished(false);
    setIsSessionActive(true);
  };

  const handleResetSession = () => {
    setIsSessionActive(false);
    setIsFinished(false);
    setElapsedSec(0);
    setUserDistKm(0);
    setRecordedUserSplits({});
  };

  // Real-time Ghost distance & time comparison at current point in route
  const ghostDistKm = Math.min(
    selectedOpponent.totalKm,
    Number((elapsedSec / selectedOpponent.targetPaceSecPerKm).toFixed(2))
  );
  const expectedGhostSecAtUserPoint = userDistKm * selectedOpponent.targetPaceSecPerKm;
  // Negative diffSec = User is FASTER (ahead of ghost time); Positive diffSec = User is SLOWER (behind ghost time)
  const timeDiffSec = Math.round(elapsedSec - expectedGhostSecAtUserPoint);
  const meterDiff = Math.round((userDistKm - ghostDistKm) * 1000);
  const isAhead = timeDiffSec <= 0;

  const userProgressPct = Math.min(100, Math.round((userDistKm / selectedOpponent.totalKm) * 100));
  const ghostProgressPct = Math.min(
    100,
    Math.round((ghostDistKm / selectedOpponent.totalKm) * 100)
  );

  return (
    <>
      {/* Top Header Card */}
      <section
        className="frosted-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '12px 14px',
          background:
            'linear-gradient(180deg, rgba(224, 251, 246, 0.95) 0%, rgba(255, 255, 255, 0.96) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="touch-target"
            aria-label="Kembali ke Peta"
            style={{
              minHeight: 38,
              padding: '0 10px',
              borderRadius: 'var(--radius-pill)',
              background: '#ffffff',
              border: '1px solid var(--color-border-subtle)',
              fontSize: '0.74rem',
              fontWeight: 900,
              color: 'var(--color-text-primary)',
              gap: 5,
            }}
          >
            <ArrowLeft size={15} />
            Peta
          </button>

          <span
            className="pill-badge"
            style={{
              background: 'rgba(0, 184, 169, 0.14)',
              color: 'var(--color-primary-deep)',
              fontSize: '0.7rem',
              padding: '3px 10px',
            }}
          >
            <Ghost size={13} />
            Solo Ghost Mode
          </span>
        </div>

        <div>
          <h1
            style={{
              fontSize: '1.14rem',
              fontWeight: 900,
              color: 'var(--color-text-primary)',
            }}
          >
            Ghost Runner — Lawan Bayanganmu
          </h1>
          <p
            style={{
              fontSize: '0.73rem',
              fontWeight: 700,
              color: 'var(--color-text-secondary)',
              lineHeight: 1.38,
              marginTop: 2,
            }}
          >
            Lari sendirian tetap termotivasi. Tantang rekaman bayangan dari performa terbaikmu
            sendiri atau rekor teman dengan perbandingan waktu real-time di setiap titik rute.
          </p>
        </div>
      </section>

      {/* Pre-Run Shadow Opponent Picker (Shown when not actively running) */}
      {!isSessionActive && !isFinished && (
        <section
          className="frosted-card"
          aria-label="Pilih Lawan Bayangan"
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          {/* Category Switcher: Rekor Diriku vs Rekor Teman */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 6,
              padding: 4,
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(16, 42, 67, 0.06)',
            }}
          >
            <button
              type="button"
              onClick={() => setCategoryTab('self')}
              className="touch-target"
              style={{
                minHeight: 40,
                borderRadius: 'var(--radius-pill)',
                background: categoryTab === 'self' ? 'var(--gradient-active-tab)' : 'transparent',
                color: categoryTab === 'self' ? '#ffffff' : 'var(--color-text-primary)',
                fontWeight: 900,
                fontSize: '0.76rem',
                gap: 6,
              }}
            >
              <User size={14} />
              Rekor Diriku
            </button>
            <button
              type="button"
              onClick={() => setCategoryTab('friend')}
              className="touch-target"
              style={{
                minHeight: 40,
                borderRadius: 'var(--radius-pill)',
                background: categoryTab === 'friend' ? 'var(--gradient-active-tab)' : 'transparent',
                color: categoryTab === 'friend' ? '#ffffff' : 'var(--color-text-primary)',
                fontWeight: 900,
                fontSize: '0.76rem',
                gap: 6,
              }}
            >
              <Users size={14} />
              Rekor Teman
            </button>
          </div>

          {/* Opponent Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredOpponents.map((opp) => {
              const isSelected = opp.id === selectedOpponent.id;
              const isLocked = opp.proOnly && !isPro;
              return (
                <button
                  key={opp.id}
                  type="button"
                  onClick={() => handleSelectOpponent(opp)}
                  className="touch-target"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'var(--color-primary-soft)' : '#ffffff',
                    border: isSelected
                      ? '2px solid var(--color-primary)'
                      : '1.5px solid var(--color-border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: isSelected ? '#0d9488' : 'rgba(13, 148, 136, 0.12)',
                        color: isSelected ? '#ffffff' : '#0d9488',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Ghost size={20} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.84rem',
                            fontWeight: 900,
                            color: 'var(--color-text-primary)',
                          }}
                        >
                          {opp.runnerName}
                        </span>
                        {isLocked && (
                          <span
                            className="pill-badge"
                            style={{
                              background: 'var(--color-gold-bg)',
                              color: 'var(--color-gold-text)',
                              fontSize: '0.6rem',
                              padding: '1px 6px',
                              gap: 3,
                            }}
                          >
                            <Lock size={10} />
                            PRO
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        {opp.routeTitle}
                      </div>
                      <div
                        style={{
                          fontSize: '0.67rem',
                          fontWeight: 700,
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {opp.recordedAt} • Pace {opp.targetPaceLabel}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '4px 9px',
                      borderRadius: 'var(--radius-pill)',
                      background: isSelected ? '#0d9488' : 'rgba(16, 42, 67, 0.06)',
                      color: isSelected ? '#ffffff' : 'var(--color-text-primary)',
                      fontSize: '0.68rem',
                      fontWeight: 900,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {opp.totalKm}.0 KM
                  </div>
                </button>
              );
            })}
          </div>

          {!isPro && (
            <button
              type="button"
              onClick={() => navigate('/pro')}
              className="touch-target"
              style={{
                width: '100%',
                minHeight: 44,
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(90deg, #fffbeb 0%, #f0fdfa 100%)',
                border: '1.5px solid rgba(245, 158, 11, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                fontSize: '0.72rem',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Crown size={15} color="#d97706" fill="#fbbf24" />
                Buka semua rekor Ghost Runner Tanpa Batas di RAIDRUN PRO
              </span>
              <span style={{ color: '#b45309', fontWeight: 900 }}>Upgrade →</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleStartSession}
            className="btn-primary-cta touch-target"
            style={{ minHeight: 50, fontSize: '0.95rem' }}
          >
            <Play size={18} fill="#ffffff" />
            Mulai Tantang Bayangan ({selectedOpponent.totalKm}.0 KM)
          </button>
        </section>
      )}

      {/* Active / Finished Ghost Run Visual Stage & Real-Time Checkpoint Splits */}
      {(isSessionActive || isFinished) && (
        <>
          {/* Live Time Delta Banner (Unggul vs Tertinggal) */}
          <section
            className="frosted-card"
            style={{
              padding: '10px 14px',
              background: isAhead
                ? 'linear-gradient(90deg, #ecfdf5 0%, #f0fdfa 100%)'
                : 'linear-gradient(90deg, #fff7ed 0%, #fef2f2 100%)',
              border: isAhead ? '2px solid #10b981' : '2px solid #f97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.66rem',
                  fontWeight: 900,
                  color: isAhead ? '#047857' : '#c2410c',
                  textTransform: 'uppercase',
                }}
              >
                {isAhead
                  ? '⚡ KAMU UNGGUL DI DEPAN BAYANGAN'
                  : '🔥 TERTINGGAL DARI BAYANGAN'}
              </div>
              <div
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 900,
                  color: 'var(--color-text-primary)',
                }}
              >
                {formatSplitDiff(timeDiffSec)}{' '}
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-text-secondary)' }}>
                  ({meterDiff >= 0 ? `+${meterDiff}m` : `${meterDiff}m`})
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>
                LAWAN GHOST
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
                {selectedOpponent.runnerName}
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                Target {selectedOpponent.targetPaceLabel}
              </div>
            </div>
          </section>

          {/* Solo Ghost Duel Track Visual (Mint vs Spectral Shadow Opponent) */}
          <section
            aria-label="Visual Lintasan Duel Ghost Runner"
            style={{
              position: 'relative',
              height: 158,
              borderRadius: 'var(--radius-card)',
              overflow: 'hidden',
              border: '2px solid rgba(255, 255, 255, 0.92)',
              boxShadow: 'var(--shadow-card)',
              background:
                'linear-gradient(180deg, #38bdf8 0%, #bae6fd 52%, #74c655 53%, #4ade80 100%)',
            }}
          >
            {/* Scrolling Trees */}
            <div
              className={`run-scrolling-trees ${!isSessionActive ? 'run-scrolling-trees--paused' : ''}`}
              style={{
                position: 'absolute',
                top: 8,
                left: 0,
                width: '200%',
                height: 76,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-around',
                pointerEvents: 'none',
              }}
            >
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <svg key={idx} width="48" height="58" viewBox="0 0 54 64">
                  <rect x="24" y="46" width="6" height="16" fill="#7c4d2b" />
                  <polygon points="27,20 12,48 42,48" fill="#2e7d32" />
                </svg>
              ))}
            </div>

            {/* Running Track Lane */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 10,
                height: 58,
                background: '#e9cfb0',
                borderTop: '3px solid #f7e3c8',
                borderBottom: '3px solid #d4b48c',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                className={`run-scrolling-lane ${!isSessionActive ? 'run-scrolling-lane--paused' : ''}`}
                style={{ width: '100%', height: 6 }}
              />
            </div>

            {/* Spectral Ghost Runner Sprite (shifts ahead or behind Mint based on live meterDiff) */}
            <div
              style={{
                position: 'absolute',
                left: isAhead ? 56 : 186,
                bottom: 22,
                zIndex: 2,
                transition: 'left 0.45s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'rgba(15, 23, 42, 0.82)',
                  color: '#5eead4',
                  border: '1px solid #2dd4bf',
                  fontSize: '0.6rem',
                  fontWeight: 900,
                  whiteSpace: 'nowrap',
                  marginBottom: -4,
                }}
              >
                👻 Ghost ({selectedOpponent.targetPaceLabel})
              </span>
              <svg
                width="74"
                height="84"
                viewBox="0 0 92 104"
                className={`mint-runner-sprite ${!isSessionActive ? 'mint-runner-sprite--paused' : ''}`}
                style={{ opacity: 0.62, filter: 'drop-shadow(0 0 10px #2dd4bf)' }}
              >
                <ellipse cx="40" cy="94" rx="26" ry="6" fill="rgba(45, 212, 191, 0.45)" />
                <g className="mint-leg-back">
                  <rect x="33" y="56" width="7" height="22" rx="3.5" fill="#5eead4" />
                </g>
                <g transform="rotate(10 38 42)">
                  <rect x="28" y="30" width="20" height="28" rx="7" fill="#14b8a6" />
                  <rect x="28" y="52" width="20" height="10" rx="4" fill="#0f766e" />
                </g>
                <circle cx="42" cy="19" r="10" fill="#99f6e4" />
                <g className="mint-leg-front">
                  <rect x="35" y="56" width="7" height="23" rx="3.5" fill="#99f6e4" />
                </g>
              </svg>
            </div>

            {/* User Mint Runner Sprite */}
            <div
              style={{
                position: 'absolute',
                left: isAhead ? 168 : 74,
                bottom: 12,
                zIndex: 3,
                transition: 'left 0.45s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  background: '#0d9488',
                  color: '#ffffff',
                  border: '1.5px solid #ffffff',
                  fontSize: '0.62rem',
                  fontWeight: 900,
                  whiteSpace: 'nowrap',
                  marginBottom: -4,
                }}
              >
                🏃 Kamu ({formatClock(currentUserPaceSec)} /KM)
              </span>
              <svg
                width="82"
                height="92"
                viewBox="0 0 92 104"
                className={`mint-runner-sprite ${!isSessionActive ? 'mint-runner-sprite--paused' : ''}`}
              >
                <ellipse cx="40" cy="94" rx="28" ry="7" fill="rgba(56, 248, 194, 0.45)" />
                <g className="mint-leg-back">
                  <rect x="33" y="56" width="7" height="22" rx="3.5" fill="#d99b78" />
                  <rect x="31" y="75" width="12" height="6" rx="3" fill="#0a878f" />
                </g>
                <g transform="rotate(10 38 42)">
                  <rect x="28" y="30" width="20" height="28" rx="7" fill="#00b8a9" />
                  <path d="M34 30 L46 30 L44 54 L34 54 Z" fill="#ffffff" />
                  <rect x="28" y="52" width="20" height="10" rx="4" fill="#0a878f" />
                </g>
                <circle cx="42" cy="19" r="10" fill="#f3b893" />
                <path d="M31 18 Q40 6 52 15 L48 21 L32 21 Z" fill="#5c3824" />
                <circle cx="47" cy="19" r="1.8" fill="#102a43" />
                <g className="mint-leg-front">
                  <rect x="35" y="56" width="7" height="23" rx="3.5" fill="#f3b893" />
                  <rect x="34" y="76" width="13" height="6" rx="3" fill="#1ce5c8" />
                </g>
              </svg>
            </div>
          </section>

          {/* Route Progress Bar with Pin Markers & Telemetry */}
          <section className="frosted-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 900 }}>
              <span>
                Jarakmu: <strong style={{ color: 'var(--color-primary-dark)' }}>{userDistKm.toFixed(2)} KM</strong> / {selectedOpponent.totalKm}.0 KM
              </span>
              <span>Waktu: {formatClock(elapsedSec)}</span>
            </div>

            {/* Dual Progress Track (User vs Ghost Pin) */}
            <div
              style={{
                position: 'relative',
                height: 14,
                borderRadius: 999,
                background: '#e2e8f0',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${ghostProgressPct}%`,
                  background: 'rgba(148, 163, 184, 0.65)',
                  transition: 'width 0.35s ease',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${userProgressPct}%`,
                  background: 'var(--gradient-xp-bar)',
                  transition: 'width 0.35s ease',
                }}
              />
            </div>

            {/* Checkpoint Splits Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 900,
                  color: 'var(--color-text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <Timer size={14} color="#0a878f" />
                Perbandingan Waktu di Setiap Titik Rute (Splits)
              </div>

              {selectedOpponent.checkpoints.map((cp) => {
                const userSplitSec = recordedUserSplits[cp.km];
                const hasReached = userSplitSec !== undefined;
                const splitDelta = hasReached ? userSplitSec - cp.ghostCumulativeSec : 0;
                const splitFaster = splitDelta <= 0;

                return (
                  <div
                    key={cp.km}
                    style={{
                      padding: '7px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: hasReached ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                      border: '1px solid var(--color-border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      fontSize: '0.72rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 900, color: 'var(--color-text-primary)' }}>
                        {cp.label}
                      </div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                        Waktu Ghost: {formatClock(cp.ghostCumulativeSec)}
                      </div>
                    </div>

                    {hasReached ? (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 900, color: 'var(--color-text-primary)' }}>
                          Kamu: {formatClock(userSplitSec)}
                        </div>
                        <span
                          className="pill-badge"
                          style={{
                            padding: '1px 7px',
                            fontSize: '0.62rem',
                            background: splitFaster ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                            color: splitFaster ? 'var(--color-success-text)' : 'var(--color-danger-text)',
                          }}
                        >
                          {splitFaster ? 'Unggul ' : 'Tertinggal '}
                          {formatSplitDiff(splitDelta)}
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>
                        Menuju titik...
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Interactive Controls During Run */}
            {!isFinished ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 2 }}>
                <button
                  type="button"
                  onClick={() => setSprintBoost((prev) => !prev)}
                  className="touch-target"
                  style={{
                    minHeight: 44,
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-md)',
                    background: sprintBoost ? 'var(--color-primary-soft)' : '#ffffff',
                    border: sprintBoost
                      ? '1.5px solid var(--color-primary)'
                      : '1px solid var(--color-border-subtle)',
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    color: 'var(--color-text-primary)',
                    gap: 5,
                  }}
                >
                  <Flame size={14} color={sprintBoost ? '#0d9488' : '#64748b'} />
                  {sprintBoost ? 'Ritme: Sprint Unggul' : 'Ritme: Santai'}
                </button>

                <button
                  type="button"
                  onClick={() => setDemoFast((prev) => !prev)}
                  className="touch-target"
                  style={{
                    minHeight: 44,
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-md)',
                    background: demoFast ? 'var(--color-primary-soft)' : '#ffffff',
                    border: demoFast
                      ? '1.5px solid var(--color-primary)'
                      : '1px solid var(--color-border-subtle)',
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    color: 'var(--color-text-primary)',
                    gap: 5,
                  }}
                >
                  <Zap size={14} color="#0d9488" />
                  {demoFast ? 'Simulasi Cepat: ON' : 'Simulasi Cepat: OFF'}
                </button>
              </div>
            ) : (
              <div
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: isAhead ? 'var(--color-success-bg)' : 'var(--color-gold-bg)',
                  color: 'var(--color-text-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: 6,
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 900 }}>
                  {isAhead ? <Trophy size={18} color="#0c9d58" /> : <CheckCircle2 size={18} color="#b7791f" />}
                  <span>
                    {isAhead
                      ? 'Rekor Bayangan Terpecahkan! Kamu Menang!'
                      : 'Sesi Ghost Run Selesai! Terus Tantang Dirimu!'}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-text-secondary)' }}>
                  Waktu Akhir Kamu: {formatClock(elapsedSec)} ({formatSplitDiff(timeDiffSec)} vs Ghost)
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleResetSession}
              className="touch-target"
              style={{
                width: '100%',
                minHeight: 44,
                borderRadius: 'var(--radius-pill)',
                background: '#ffffff',
                border: '1.5px solid var(--color-border-subtle)',
                fontWeight: 900,
                fontSize: '0.8rem',
                color: 'var(--color-text-primary)',
                gap: 6,
              }}
            >
              <RotateCcw size={15} />
              {isFinished ? 'Pilih Lawan Bayangan Lain' : 'Ganti Lawan / Ulangi Rute'}
            </button>
          </section>
        </>
      )}
    </>
  );
};
