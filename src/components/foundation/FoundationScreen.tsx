import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Compass,
  Flame,
  Footprints,
  Layers,
  ShieldAlert,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface FoundationScreenProps {
  title: string;
  subtitle: string;
  badgeText: string;
  milestoneNote: string;
}

export const FoundationScreen: React.FC<FoundationScreenProps> = ({
  title,
  subtitle,
  badgeText,
  milestoneNote,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, getBossRemainingHp, bossMaxHp, raidSubTab, setRaidSubTab } = useAppStore();
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 402,
    height: typeof window !== 'undefined' ? window.innerHeight : 874,
  });

  useEffect(() => {
    const onResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const bossHp = getBossRemainingHp();
  const hpPercent = Math.round((bossHp / bossMaxHp) * 100);

  return (
    <>
      {/* Prototype Indicator & Live Viewport Readout */}
      <div className="prototype-banner" style={{ whiteSpace: 'nowrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <Sparkles size={13} color="#00B8A9" />
          RAIDRUN PROTOTYPE • MOCK DATA
        </span>
        <span>
          {viewport.width} × {viewport.height} px
        </span>
      </div>

      {/* Top HUD Preview Chip (Avatar + Level + XP + Weather) */}
      <section
        className="frosted-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          padding: '10px 12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1CE5C8 0%, #0A878F 100%)',
              border: '2.5px solid #102A43',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 900,
              fontSize: '0.9rem',
              flexShrink: 0,
            }}
          >
            TK
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap' }}>
              <span style={{ fontWeight: 900, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                {user.username}
              </span>
              <span
                className="pill-badge"
                style={{
                  background: 'var(--color-primary)',
                  color: '#fff',
                  padding: '2px 7px',
                  fontSize: '0.68rem',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                Lv {user.level}
              </span>
            </div>
            <div
              style={{
                marginTop: 5,
                width: 104,
                height: 7,
                borderRadius: 999,
                background: 'rgba(16, 42, 67, 0.12)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.round((user.xp / user.nextLevelXp) * 100)}%`,
                  height: '100%',
                  background: 'var(--gradient-xp-bar)',
                }}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 3,
            flexShrink: 0,
          }}
        >
          <span
            className="pill-badge"
            style={{
              background: 'var(--color-primary-soft)',
              color: 'var(--color-primary-deep)',
              padding: '3px 9px',
              fontSize: '0.72rem',
              whiteSpace: 'nowrap',
            }}
          >
            ☀️ 28°C Clear
          </span>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-secondary)' }}>
            ⚡ {user.coins} Coins
          </span>
        </div>
      </section>

      {/* Main Route Header Card */}
      <section className="frosted-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span
            className="pill-badge"
            style={{
              background: 'var(--color-success-bg)',
              color: 'var(--color-success-text)',
            }}
          >
            <CheckCircle2 size={13} />
            {badgeText}
          </span>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>
            Route: {location.pathname}
          </span>
        </div>

        <div>
          <h1 style={{ fontSize: '1.18rem', fontWeight: 900, lineHeight: 1.18 }}>{title}</h1>
          <p
            style={{
              marginTop: 3,
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'var(--color-text-secondary)',
              lineHeight: 1.32,
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* Raid Center Tab Sub-Switch (Confirmed Decision #1) */}
        {location.pathname.startsWith('/raid') && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              background: 'rgba(16, 42, 67, 0.06)',
              padding: 4,
              borderRadius: 'var(--radius-pill)',
            }}
          >
            <button
              type="button"
              onClick={() => setRaidSubTab('lobby')}
              className="touch-target"
              style={{
                borderRadius: 'var(--radius-pill)',
                fontWeight: 800,
                fontSize: '0.8rem',
                background: raidSubTab === 'lobby' ? 'var(--gradient-active-tab)' : 'transparent',
                color: raidSubTab === 'lobby' ? '#fff' : 'var(--color-text-primary)',
              }}
            >
              🔥 Raid Lobby (7.png)
            </button>
            <button
              type="button"
              onClick={() => setRaidSubTab('deck')}
              className="touch-target"
              style={{
                borderRadius: 'var(--radius-pill)',
                fontWeight: 800,
                fontSize: '0.8rem',
                background: raidSubTab === 'deck' ? 'var(--gradient-active-tab)' : 'transparent',
                color: raidSubTab === 'deck' ? '#fff' : 'var(--color-text-primary)',
              }}
            >
              🃏 Boss Deck (5.png)
            </button>
          </div>
        )}

        {/* Active Raid Boss HP Bar Preview (matches design/7.png) */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.75)',
            borderRadius: 'var(--radius-lg)',
            padding: '9px 11px',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <span style={{ fontWeight: 900, fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Flame size={15} color="#FF3B9A" />
              Ember Titan
            </span>
            <span
              className="pill-badge"
              style={{
                background: '#E0FBF6',
                color: '#0A878F',
                padding: '2px 8px',
                fontSize: '0.7rem',
                whiteSpace: 'nowrap',
              }}
            >
              ⏱ 02:41:18
            </span>
          </div>
          <div
            style={{
              position: 'relative',
              height: 20,
              borderRadius: 999,
              background: '#D9E2EC',
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
                borderRadius: 999,
              }}
            />
            <span
              style={{
                position: 'relative',
                zIndex: 1,
                fontSize: '0.72rem',
                fontWeight: 900,
                color: '#102A43',
              }}
            >
              {bossHp.toLocaleString()} / {bossMaxHp.toLocaleString()} HP
            </span>
          </div>
        </div>

        <p
          style={{
            fontSize: '0.76rem',
            fontWeight: 700,
            color: 'var(--color-primary-deep)',
            background: 'var(--color-primary-soft)',
            padding: '7px 10px',
            borderRadius: 'var(--radius-md)',
            lineHeight: 1.3,
          }}
        >
          {milestoneNote}
        </p>
      </section>

      {/* Design System & Layout Audit Card */}
      <section className="frosted-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Layers size={15} color="#0A878F" />
            Milestone 1 Foundation Checklist
          </h2>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-success-text)' }}>
            100% Passed
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 6,
          }}
        >
          <div
            style={{
              padding: '7px 9px',
              borderRadius: 'var(--radius-md)',
              background: '#FFFFFF',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
              Edge Padding
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
              ≥ 16px Safe-Area
            </div>
          </div>
          <div
            style={{
              padding: '7px 9px',
              borderRadius: 'var(--radius-md)',
              background: '#FFFFFF',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
              Touch Targets
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
              ≥ 44 × 44 CSS px
            </div>
          </div>
          <div
            style={{
              padding: '7px 9px',
              borderRadius: 'var(--radius-md)',
              background: '#FFFFFF',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
              Viewport Unit
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
              100dvh + PWA
            </div>
          </div>
          <div
            style={{
              padding: '7px 9px',
              borderRadius: 'var(--radius-md)',
              background: '#FFFFFF',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
              3D Style Preset
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: 900, color: 'var(--color-primary-dark)' }}>
              Option A (Mint)
            </div>
          </div>
        </div>

        {/* Quick Demo Flow Navigation Buttons (44px+ touch targets) */}
        <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
          <button
            type="button"
            className="btn-primary-cta"
            style={{ minHeight: 46, fontSize: '0.95rem' }}
            onClick={() => navigate('/raid')}
          >
            <ShieldAlert size={17} />
            Open Raid Lobby
          </button>
        </div>
      </section>
    </>
  );
};
