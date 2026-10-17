import React, { useState } from 'react';
import { UserPlus, Flame, Check } from 'lucide-react';
import { PARTY_INFO } from '../../data/mock';
import { useAppStore } from '../../store/useAppStore';

export const PartyScreen: React.FC = () => {
  const { user, showToast } = useAppStore();
  const [inviteCopied, setInviteCopied] = useState(false);

  const handleInvite = () => {
    setInviteCopied(true);
    showToast('Coming soon in the full app');
    window.setTimeout(() => setInviteCopied(false), 2200);
  };

  const otherMembersWeeklyKm = PARTY_INFO.members
    .slice(1)
    .reduce((acc, m) => acc + m.weeklyKm, 0);
  const totalPartyWeeklyKm = Number((user.weeklyDistanceKm + otherMembersWeeklyKm).toFixed(1));

  const progressPct = Math.min(
    100,
    Math.round((totalPartyWeeklyKm / PARTY_INFO.weeklyGoalKm) * 100)
  );

  return (
    <>
      {/* Top Header Row matching design/4.png */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          flexShrink: 0,
        }}
      >
        <h1
          style={{
            fontSize: '1.45rem',
            fontWeight: 900,
            color: 'var(--color-text-primary)',
          }}
        >
          Party
        </h1>

        <button
          type="button"
          onClick={handleInvite}
          className="touch-target"
          aria-label="Invite Friends to Party"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: '#ffffff',
            border: '1.5px solid var(--color-border-card)',
            boxShadow: 'var(--shadow-card)',
            color: 'var(--color-text-primary)',
          }}
        >
          <UserPlus size={20} />
        </button>
      </header>

      {/* Party Velocity Card with Weekly Goal Progress & Members (matching design/4.png) */}
      <section
        className="frosted-card"
        aria-label="Party Velocity Weekly Goal"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: 14,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Shield Emblem */}
          <div
            style={{
              width: 52,
              height: 56,
              borderRadius: '14px 14px 26px 26px',
              background: 'linear-gradient(180deg, #00b8a9 0%, #066168 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 6px 14px rgba(10, 135, 143, 0.28)',
              flexShrink: 0,
            }}
          >
            <Flame size={28} fill="#ffffff" />
          </div>

          <div>
            <h2
              style={{
                fontSize: '1.22rem',
                fontWeight: 900,
                color: 'var(--color-text-primary)',
                lineHeight: 1.15,
              }}
            >
              {PARTY_INFO.name}
            </h2>
            <div
              style={{
                fontSize: '0.84rem',
                fontWeight: 800,
                color: 'var(--color-text-secondary)',
                marginTop: 2,
              }}
            >
              Lv {PARTY_INFO.level}
            </div>
          </div>
        </div>

        {/* Party Member Avatars Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          {PARTY_INFO.members.map((member) => (
            <div
              key={member.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: `linear-gradient(180deg, #e0fbf6 0%, ${member.avatarColor}33 100%)`,
                  border: '2.5px solid var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0, 184, 169, 0.18)',
                }}
              >
                <svg width="34" height="34" viewBox="0 0 36 36" aria-hidden="true">
                  <circle cx="18" cy="13" r="6.5" fill="#f3b893" />
                  <path d="M11 11 Q18 4 25 11 Z" fill={member.rank === 4 ? '#f472b6' : '#3b2314'} />
                  <path d="M8 34 C8 24 28 24 28 34 Z" fill="#00b8a9" />
                </svg>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: 'var(--color-text-secondary)',
                }}
              >
                {member.name}
              </span>
            </div>
          ))}
        </div>

        {/* Weekly Goal Progress Bar + Invite Friends CTA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                width: '100%',
                height: 11,
                borderRadius: 999,
                background: 'rgba(16, 42, 67, 0.1)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progressPct}%`,
                  height: '100%',
                  borderRadius: 999,
                  background: 'var(--gradient-xp-bar)',
                }}
              />
            </div>
            <div
              style={{
                marginTop: 5,
                fontSize: '0.78rem',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
              }}
            >
              {totalPartyWeeklyKm} / {PARTY_INFO.weeklyGoalKm} KM Weekly Goal
            </div>
          </div>

          <button
            type="button"
            onClick={handleInvite}
            className="touch-target"
            style={{
              minHeight: 44,
              padding: '0 14px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--gradient-active-tab)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.78rem',
              flexShrink: 0,
              gap: 5,
              boxShadow: '0 4px 12px rgba(13, 138, 148, 0.26)',
            }}
          >
            {inviteCopied ? (
              <>
                <Check size={14} />
                <span>Invite Sent!</span>
              </>
            ) : (
              <span>Invite Friends</span>
            )}
          </button>
        </div>
      </section>

      {/* Stylized Vector Party Lineup with Companions */}
      <section
        aria-label="Velocity Squad Lineup"
        style={{
          flexShrink: 0,
          minHeight: 112,
          borderRadius: 'var(--radius-card)',
          overflow: 'hidden',
          border: '1.5px solid var(--color-border-card)',
          boxShadow: 'var(--shadow-card)',
          background: 'linear-gradient(180deg, #b5f2ea 0%, #dcfce7 58%, #f7e3c8 59%, #edd1ae 100%)',
          padding: '8px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="100%"
          height="96"
          viewBox="0 0 340 96"
          preserveAspectRatio="xMidYMid meet"
          style={{ display: 'block', width: '100%', height: 96, flexShrink: 0 }}
          aria-hidden="true"
        >
          {/* Park Railing */}
          <line x1="0" y1="48" x2="340" y2="48" stroke="#64748b" strokeWidth="2.5" />
          <line x1="0" y1="56" x2="340" y2="56" stroke="#64748b" strokeWidth="2" />
          {/* 4 Party Runners + 4 Elemental Companions */}
          {[
            { x: 52, hair: '#4a2c18', pet: '#4ce0b3' },
            { x: 130, hair: '#1e293b', pet: '#ff8a2b' },
            { x: 208, hair: '#334155', pet: '#38bdf8' },
            { x: 286, hair: '#f472b6', pet: '#fb7185' },
          ].map((r, idx) => (
            <g key={idx} transform={`translate(${r.x}, 8)`}>
              {/* Ground Shadow */}
              <ellipse cx="-6" cy="80" rx="22" ry="3.5" fill="rgba(16, 42, 67, 0.14)" />
              {/* Companion Sprite */}
              <circle cx="-22" cy="68" r="9" fill={r.pet} />
              <polygon points="-28,60 -22,52 -16,60" fill={r.pet} />
              <circle cx="-25" cy="67" r="1.5" fill="#102a43" />
              <circle cx="-19" cy="67" r="1.5" fill="#102a43" />
              {/* Runner */}
              <circle cx="0" cy="14" r="9" fill="#f3b893" />
              <path d="M-9 12 Q0 2 9 12 Z" fill={r.hair} />
              <rect x="-10" y="24" width="20" height="24" rx="5" fill="#00b8a9" />
              <path d="M-6 24 L6 24 L4 44 L-4 44 Z" fill="#ffffff" />
              <rect x="-9" y="46" width="8" height="14" rx="2" fill="#066168" />
              <rect x="1" y="46" width="8" height="14" rx="2" fill="#066168" />
              <rect x="-8" y="60" width="5" height="15" fill="#f3b893" />
              <rect x="3" y="60" width="5" height="15" fill="#f3b893" />
              <rect x="-10" y="74" width="8" height="5" rx="2" fill="#00b8a9" />
              <rect x="2" y="74" width="8" height="5" rx="2" fill="#00b8a9" />
            </g>
          ))}
        </svg>
      </section>

      {/* Weekly Leaderboard Card matching design/4.png */}
      <section
        className="frosted-card"
        aria-label="Party Weekly Leaderboard"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: 14,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2
            style={{
              fontSize: '1.08rem',
              fontWeight: 900,
              color: 'var(--color-text-primary)',
            }}
          >
            Weekly Leaderboard
          </h2>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-text-secondary)' }}>
            This Week (KM)
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {PARTY_INFO.members.map((member) => {
            const isFirst = member.rank === 1;
            const memberWeeklyKm = isFirst ? user.weeklyDistanceKm : member.weeklyKm;
            const rankBadgeBg =
              member.rank === 1
                ? '#f59f00'
                : member.rank === 2
                ? '#94a3b8'
                : member.rank === 3
                ? '#d97706'
                : 'transparent';

            return (
              <div
                key={member.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: isFirst
                    ? 'linear-gradient(90deg, #fff3cd 0%, #fff9e6 100%)'
                    : 'rgba(255, 255, 255, 0.85)',
                  border: isFirst
                    ? '1.5px solid #fde68a'
                    : '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: rankBadgeBg,
                      color: member.rank <= 3 ? '#ffffff' : 'var(--color-text-primary)',
                      fontWeight: 900,
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {member.rank}
                  </div>

                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: `${member.avatarColor}28`,
                      border: `2px solid ${member.avatarColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '0.78rem',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {member.name.slice(0, 1)}
                  </div>

                  <span
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {member.name}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: '0.86rem',
                    fontWeight: 900,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {memberWeeklyKm} KM Weekly
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
};
