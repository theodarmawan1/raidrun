import React from 'react';
import { Check, X, Lock, Flame } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { RaidBoss } from '../../data/mock';

const BossIllustration: React.FC<{ boss: RaidBoss }> = ({ boss }) => {
  if (boss.id === 'ember-titan' && boss.status === 'defeated') {
    return (
      <svg width="110" height="96" viewBox="0 0 120 104" aria-hidden="true">
        <defs>
          <linearGradient id="emberFire" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff5f1f" />
            <stop offset="55%" stopColor="#b91c1c" />
            <stop offset="100%" stopColor="#00d2ff" />
          </linearGradient>
        </defs>
        <ellipse cx="60" cy="94" rx="38" ry="6" fill="rgba(16, 42, 67, 0.14)" />
        {/* Flame horns */}
        <path
          d="M36 32 L26 10 L46 22 L60 8 L74 22 L94 10 L84 32 Z"
          fill="#ff8a2b"
        />
        {/* Body */}
        <path
          d="M32 88 L26 60 L18 66 L22 40 L38 30 L82 30 L98 40 L102 66 L94 60 L88 88 L70 88 L66 70 L54 70 L50 88 Z"
          fill="url(#emberFire)"
        />
        {/* Glowing Core & Eyes */}
        <polygon points="60,44 48,56 60,66 72,56" fill="#ffd43b" />
        <circle cx="48" cy="36" r="4" fill="#ff922b" />
        <circle cx="72" cy="36" r="4" fill="#38d9f5" />
      </svg>
    );
  }

  if (boss.id === 'glacio' && boss.status === 'defeated') {
    return (
      <svg width="110" height="96" viewBox="0 0 120 104" aria-hidden="true">
        <ellipse cx="60" cy="94" rx="38" ry="6" fill="rgba(16, 42, 67, 0.14)" />
        {/* Ice Spikes */}
        <polygon points="32,36 22,14 44,24" fill="#38bdf8" />
        <polygon points="60,26 50,6 70,6" fill="#0ea5e9" />
        <polygon points="88,36 98,14 76,24" fill="#38bdf8" />
        {/* Yeti Body */}
        <path
          d="M30 88 L22 58 L28 32 L92 32 L98 58 L90 88 L72 88 L68 70 L52 70 L48 88 Z"
          fill="#e0f2fe"
          stroke="#7dd3fc"
          strokeWidth="2"
        />
        <rect x="42" y="34" width="36" height="20" rx="8" fill="#0284c7" />
        <circle cx="52" cy="44" r="3.5" fill="#38f8c2" />
        <circle cx="68" cy="44" r="3.5" fill="#38f8c2" />
      </svg>
    );
  }

  if (boss.id === 'magma' && boss.status === 'defeated') {
    return (
      <svg width="110" height="96" viewBox="0 0 120 104" aria-hidden="true">
        <ellipse cx="60" cy="94" rx="38" ry="6" fill="rgba(16, 42, 67, 0.14)" />
        {/* Curved Horns */}
        <path d="M36 32 Q16 18 28 10 Q38 14 44 26 Z" fill="#5c3824" />
        <path d="M84 32 Q104 18 92 10 Q82 14 76 26 Z" fill="#5c3824" />
        {/* Magma Body */}
        <ellipse cx="60" cy="58" rx="32" ry="28" fill="#ff7a18" />
        <ellipse cx="60" cy="62" rx="22" ry="18" fill="#ffb703" />
        <rect x="34" y="76" width="16" height="14" rx="5" fill="#9a3412" />
        <rect x="70" y="76" width="16" height="14" rx="5" fill="#9a3412" />
        <circle cx="48" cy="48" r="4" fill="#3b1d11" />
        <circle cx="72" cy="48" r="4" fill="#3b1d11" />
      </svg>
    );
  }

  // Escaped or Locked Silhouette with Center Padlock (matching design/5.png)
  return (
    <div style={{ position: 'relative', width: 110, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="110" height="96" viewBox="0 0 120 104" aria-hidden="true">
        <ellipse cx="60" cy="94" rx="36" ry="5" fill="rgba(16, 42, 67, 0.12)" />
        {boss.id === 'drakey' ? (
          /* Dragon wings silhouette */
          <path
            d="M36 86 L42 62 L14 48 L22 22 L44 38 L54 14 L66 14 L76 38 L98 22 L106 48 L78 62 L84 86 L68 86 L60 70 L52 86 Z"
            fill="#52667a"
          />
        ) : boss.id === 'mystery-1' ? (
          /* Horned brute silhouette */
          <path
            d="M30 88 L22 54 L36 32 L32 14 L46 26 L74 26 L88 14 L84 32 L98 54 L90 88 L70 88 L64 72 L56 72 L50 88 Z"
            fill="#52667a"
          />
        ) : (
          /* Spiky crystal monster silhouette */
          <path
            d="M36 88 L18 66 L30 52 L20 34 L42 36 L48 14 L60 28 L72 14 L78 36 L100 34 L90 52 L102 66 L84 88 Z"
            fill="#52667a"
          />
        )}
      </svg>
      <div
        style={{
          position: 'absolute',
          width: 30,
          height: 30,
          borderRadius: '50%',
          background: '#ffffff',
          boxShadow: '0 4px 10px rgba(16, 42, 67, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#52667a',
        }}
      >
        <Lock size={15} strokeWidth={2.5} />
      </div>
    </div>
  );
};

export const DeckScreen: React.FC = () => {
  const { bossDeck } = useAppStore();

  const totalSlots = 12;
  const collectedCount = bossDeck.filter((b) => b.status === 'defeated').length;

  return (
    <>
      {/* Top Header matching design/5.png: "My Deck" + "3 / 12 Collected" */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <div style={{ width: 92 }} />

        <div
          className="frosted-card"
          style={{
            padding: '7px 22px',
            borderRadius: 'var(--radius-pill)',
            background: '#ffffff',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h1
            style={{
              fontSize: '1.18rem',
              fontWeight: 900,
              color: 'var(--color-text-primary)',
              whiteSpace: 'nowrap',
            }}
          >
            My Deck
          </h1>
        </div>

        <div
          className="pill-badge"
          style={{
            background: '#ffffff',
            border: '1.5px solid var(--color-border-card)',
            boxShadow: 'var(--shadow-card)',
            padding: '6px 10px',
            fontSize: '0.73rem',
            fontWeight: 900,
            color: 'var(--color-text-primary)',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ color: 'var(--color-primary-dark)' }}>
            {collectedCount} / {totalSlots}
          </span>
          <span>Collected</span>
        </div>
      </header>

      {/* 2-Column Grid of Boss Cards matching design/5.png */}
      <section
        aria-label="Boss Collection Grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 10,
          flexShrink: 0,
        }}
      >
        {bossDeck.map((boss) => {
          const isDefeated = boss.status === 'defeated';
          const isEscaped = boss.status === 'escaped';
          const cardBg = isDefeated
            ? boss.element === 'ice'
              ? 'linear-gradient(180deg, #e0f7ff 0%, #ffffff 100%)'
              : 'linear-gradient(180deg, #fff1eb 0%, #ffffff 100%)'
            : 'linear-gradient(180deg, #dbe4ee 0%, #eff4f9 100%)';

          const cardBorder = isDefeated
            ? boss.element === 'ice'
              ? '2px solid #7dd3fc'
              : '2px solid #fed7aa'
            : '2px solid rgba(255, 255, 255, 0.85)';

          return (
            <article
              key={boss.id}
              className="frosted-card"
              style={{
                position: 'relative',
                padding: '10px 10px 12px',
                background: cardBg,
                border: cardBorder,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 6,
                minHeight: 162,
                textAlign: 'center',
              }}
            >
              {boss.isNew && isDefeated && (
                <span
                  className="pill-badge"
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: '#ff3b7f',
                    color: '#ffffff',
                    fontSize: '0.62rem',
                    padding: '2px 8px',
                  }}
                >
                  NEW
                </span>
              )}

              <BossIllustration boss={boss} />

              <div
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 900,
                  color: 'var(--color-text-primary)',
                }}
              >
                {boss.name}
              </div>

              {isDefeated && (
                <span
                  className="pill-badge"
                  style={{
                    background: 'var(--color-success-bg)',
                    color: 'var(--color-success-text)',
                    fontSize: '0.7rem',
                    padding: '3px 12px',
                    gap: 4,
                  }}
                >
                  <Check size={12} strokeWidth={3} />
                  Defeated
                </span>
              )}

              {isEscaped && (
                <span
                  className="pill-badge"
                  style={{
                    background: 'var(--color-danger-bg)',
                    color: 'var(--color-danger-text)',
                    fontSize: '0.7rem',
                    padding: '3px 12px',
                    gap: 4,
                  }}
                >
                  <X size={12} strokeWidth={3} />
                  Escaped
                </span>
              )}

              {boss.status === 'locked' && (
                <span
                  className="pill-badge"
                  style={{
                    background: 'rgba(16, 42, 67, 0.08)',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.68rem',
                    padding: '3px 12px',
                  }}
                >
                  Undiscovered
                </span>
              )}
            </article>
          );
        })}
      </section>

      {/* Info Banner */}
      <div
        className="frosted-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 14px',
          flexShrink: 0,
        }}
      >
        <Flame size={18} color="#ff3b9a" style={{ flexShrink: 0 }} />
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            color: 'var(--color-text-secondary)',
          }}
        >
          Find a raid portal on the map to unlock new cards.
        </span>
      </div>
    </>
  );
};
