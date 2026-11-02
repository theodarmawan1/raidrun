import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Ghost, Shield, Zap, MapPin, Music, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface ProBenefitItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const PRO_BENEFITS: ProBenefitItem[] = [
  {
    title: 'Ghost Runner Tanpa Batas',
    description: 'Tantang semua rekor lari kamu, kapan saja.',
    icon: <Ghost size={22} strokeWidth={2.1} color="#0a878f" />,
  },
  {
    title: 'Raid Boss Eksklusif',
    description: 'Akses raid langka yang tidak muncul di versi gratis.',
    icon: <Shield size={22} strokeWidth={2.1} color="#0a878f" />,
  },
  {
    title: 'Energi & Stamina Ekstra',
    description: 'Lari lebih jauh tanpa kehabisan energi in-game.',
    icon: <Zap size={22} strokeWidth={2.1} color="#0a878f" />,
  },
  {
    title: 'Spot & Event Prioritas',
    description: 'Notifikasi lebih awal untuk event dan spot populer.',
    icon: <MapPin size={22} strokeWidth={2.1} color="#0a878f" />,
  },
  {
    title: 'Dapat Mendengarkan Musik',
    description: 'Lari lebih semangat dengan playlist musik favorit.',
    icon: <Music size={22} strokeWidth={2.1} color="#0a878f" />,
  },
];

export const RaidRunProScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isPro, subscribePro } = useAppStore();

  const handleSubscribe = () => {
    subscribePro();
    navigate(-1);
  };

  return (
    <section
      className="frosted-card"
      aria-label="Langganan RAIDRUN PRO"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '18px 16px 16px',
        gap: 14,
        background:
          'linear-gradient(180deg, rgba(255, 251, 235, 0.96) 0%, rgba(240, 253, 250, 0.97) 48%, rgba(255, 255, 255, 0.98) 100%)',
        border: '1.5px solid rgba(245, 158, 11, 0.32)',
      }}
    >
      {/* Hero Illustration: Mint + Crystie + Golden PRO Aura & Crown */}
      <div
        style={{
          position: 'relative',
          width: 176,
          height: 148,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 6,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(251, 191, 36, 0.32) 0%, rgba(45, 212, 191, 0.22) 55%, rgba(255, 255, 255, 0) 76%)',
            pointerEvents: 'none',
          }}
        />
        <svg width="168" height="144" viewBox="0 0 168 144" aria-label="Mint dan Crystie RAIDRUN PRO">
          {/* Glowing Aura Rings */}
          <circle
            cx="82"
            cy="74"
            r="54"
            fill="none"
            stroke="rgba(245, 158, 11, 0.35)"
            strokeWidth="2"
            strokeDasharray="8 6"
          />
          <ellipse cx="82" cy="128" rx="52" ry="10" fill="rgba(13, 148, 136, 0.16)" />

          {/* Floating Crown Emblem (Top-Right) */}
          <g transform="translate(106, 14) rotate(8)">
            <circle cx="18" cy="18" r="18" fill="rgba(254, 243, 199, 0.9)" />
            <path
              d="M7 24 L9 12 L15 17 L18 10 L21 17 L27 12 L29 24 Z"
              fill="#fbbf24"
              stroke="#0f766e"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </g>

          {/* Mint Character */}
          <g transform="translate(34, 18)">
            {/* Head & Hair */}
            <circle cx="32" cy="20" r="11" fill="#f3b893" />
            <path d="M21 18 Q32 5 43 18 Z" fill="#4a2c18" />
            {/* Sporty Jersey */}
            <rect x="19" y="33" width="26" height="30" rx="7" fill="#0d9488" />
            <path d="M24 33 L40 33 L37 58 L27 58 Z" fill="#ffffff" />
            {/* Arms */}
            <rect x="12" y="35" width="6" height="24" rx="3" fill="#f3b893" />
            <rect x="46" y="35" width="6" height="24" rx="3" fill="#f3b893" />
            {/* Shorts */}
            <rect x="20" y="61" width="11" height="17" rx="3.5" fill="#115e59" />
            <rect x="33" y="61" width="11" height="17" rx="3.5" fill="#115e59" />
            {/* Legs */}
            <rect x="22" y="78" width="6" height="22" fill="#f3b893" />
            <rect x="36" y="78" width="6" height="22" fill="#f3b893" />
            {/* Running Shoes */}
            <rect x="19" y="99" width="12" height="6" rx="3" fill="#0d9488" />
            <rect x="35" y="99" width="12" height="6" rx="3" fill="#0d9488" />
          </g>

          {/* Crystie Companion */}
          <g transform="translate(96, 68)">
            <polygon points="18,0 8,18 28,18" fill="#5eead4" stroke="#0f766e" strokeWidth="1.5" />
            <polygon points="8,6 0,20 15,20" fill="#2dd4bf" />
            <polygon points="28,6 21,20 36,20" fill="#2dd4bf" />
            <ellipse
              cx="18"
              cy="28"
              rx="15"
              ry="13"
              fill="#ccfbf1"
              stroke="#0f766e"
              strokeWidth="1.8"
            />
            <circle cx="13" cy="27" r="2.4" fill="#102a43" />
            <circle cx="23" cy="27" r="2.4" fill="#102a43" />
            <ellipse cx="18" cy="39" rx="9" ry="7" fill="#5eead4" />
          </g>
        </svg>
      </div>

      {/* Title & Subtitle */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h1
          style={{
            fontSize: '1.24rem',
            fontWeight: 900,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          Naik Level Jadi RAIDRUN PRO
        </h1>
        <p
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--color-text-secondary)',
          }}
        >
          Buka semua fitur, raid, dan ghost tanpa batas.
        </p>
      </div>

      {/* 5 Feature Benefits List */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          padding: '4px 2px',
        }}
      >
        {PRO_BENEFITS.map((item) => (
          <div
            key={item.title}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 10px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.78)',
              border: '1px solid rgba(13, 148, 136, 0.14)',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'rgba(204, 251, 241, 0.65)',
                border: '1px solid rgba(13, 148, 136, 0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {item.icon}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: '0.86rem',
                  fontWeight: 900,
                  color: 'var(--color-text-primary)',
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.3,
                }}
              >
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Card with "Paling Hemat" Floating Badge */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          marginTop: 4,
          padding: '14px 16px',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(90deg, #fffbeb 0%, #f0fdfa 100%)',
          border: '2px solid #0d9488',
          boxShadow: '0 0 18px rgba(45, 212, 191, 0.25), 0 6px 16px rgba(245, 158, 11, 0.14)',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: -11,
            right: 14,
            padding: '2px 10px',
            borderRadius: 'var(--radius-pill)',
            background: 'linear-gradient(90deg, #b45309 0%, #d97706 100%)',
            color: '#ffffff',
            fontSize: '0.66rem',
            fontWeight: 900,
            boxShadow: '0 2px 6px rgba(180, 83, 9, 0.3)',
          }}
        >
          Paling Hemat
        </span>
        <div
          style={{
            fontSize: '1.3rem',
            fontWeight: 900,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          Rp50.000/bulan
        </div>
      </div>

      {/* Primary Action Button & Secondary Dismiss Link */}
      {isPro ? (
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              width: '100%',
              minHeight: 48,
              borderRadius: 'var(--radius-pill)',
              background: 'var(--color-success-bg)',
              border: '1.5px solid #10b981',
              color: 'var(--color-success-text)',
              fontWeight: 900,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <CheckCircle2 size={18} />
            RAIDRUN PRO Aktif
          </div>
          <button
            type="button"
            onClick={() => navigate('/ghost')}
            className="touch-target"
            style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              color: 'var(--color-primary-dark)',
              textDecoration: 'underline',
              minHeight: 44,
            }}
          >
            Coba Ghost Runner Tanpa Batas →
          </button>
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <button
            type="button"
            onClick={handleSubscribe}
            className="touch-target"
            style={{
              width: '100%',
              minHeight: 50,
              borderRadius: 'var(--radius-pill)',
              background: 'linear-gradient(180deg, #1f7a7c 0%, #115e59 100%)',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '0.95rem',
              border: '1.5px solid rgba(255, 255, 255, 0.35)',
              boxShadow: '0 8px 20px rgba(17, 94, 89, 0.32)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Crown size={18} color="#fbbf24" fill="#fbbf24" />
            Mulai RAIDRUN PRO
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="touch-target"
            style={{
              fontSize: '0.76rem',
              fontWeight: 800,
              color: 'var(--color-text-muted)',
              textDecoration: 'underline',
              minHeight: 44,
            }}
          >
            Lanjutkan tanpa PRO
          </button>
        </div>
      )}
    </section>
  );
};
