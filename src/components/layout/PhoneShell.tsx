import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { BottomTabBar } from './BottomTabBar';
import { useAppStore } from '../../store/useAppStore';

interface PhoneShellProps {
  children: React.ReactNode;
}

export const PhoneShell: React.FC<PhoneShellProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { toastMessage, introDismissed, dismissIntro } = useAppStore();
  const location = useLocation();
  // The Run tab (3D home world at "/") is full-bleed: canvas edge to edge, HUD floats on top
  const isHomeWorld = location.pathname === '/';
  const scrollRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 160);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  return (
    <div className="phone-shell">
      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          aria-label="Loading RAIDRUN prototype"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 90,
            background: 'var(--color-bg-soft)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: 24,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--gradient-cta)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '1.25rem',
              boxShadow: 'var(--shadow-cta)',
            }}
          >
            RR
          </div>
          <div
            style={{
              fontSize: '1.1rem',
              fontWeight: 900,
              color: 'var(--color-text-primary)',
            }}
          >
            RAIDRUN
          </div>
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              color: 'var(--color-text-secondary)',
            }}
          >
            Loading island world & mock data...
          </div>
        </div>
      )}

      {/* Once-per-session First Launch Card */}
      {!isLoading && !introDismissed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="first-launch-title"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 95,
            background: 'rgba(16, 42, 67, 0.56)',
            backdropFilter: 'blur(5px)',
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
              maxWidth: 332,
              background: '#ffffff',
              padding: '20px 18px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 12,
              boxShadow: '0 20px 44px rgba(16, 42, 67, 0.35)',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--gradient-cta)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '1.05rem',
                boxShadow: 'var(--shadow-cta)',
              }}
            >
              RR
            </div>
            <p
              id="first-launch-title"
              style={{
                fontSize: '0.92rem',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                lineHeight: 1.45,
              }}
            >
              RAIDRUN prototype. All data is mock data and running is simulated.
            </p>
            <button
              type="button"
              onClick={dismissIntro}
              className="btn-primary-cta touch-target"
              style={{
                width: '100%',
                minHeight: 48,
                fontSize: '0.92rem',
              }}
            >
              Start
            </button>
          </div>
        </div>
      )}

      {/* Global Toast Notification Pill */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'absolute',
            top: isHomeWorld
              ? 'calc(var(--safe-top) + 84px)'
              : 'max(14px, calc(var(--safe-top) + 10px))',
            left: 16,
            right: 16,
            zIndex: 110,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '9px 15px',
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(16, 42, 67, 0.94)',
              color: '#ffffff',
              border: '1.5px solid #38f8c2',
              boxShadow: '0 10px 24px rgba(16, 42, 67, 0.32)',
              fontSize: '0.78rem',
              fontWeight: 800,
              textAlign: 'center',
            }}
          >
            <CheckCircle2 size={15} color="#38f8c2" style={{ flexShrink: 0 }} />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <main
        ref={scrollRef}
        className={isHomeWorld ? 'screen-scroll screen-scroll--fullbleed' : 'screen-scroll'}
      >
        {children}
        {!isHomeWorld && (
          <footer
            aria-label="Prototype status"
            style={{
              textAlign: 'center',
              fontSize: '0.68rem',
              fontWeight: 800,
              color: 'var(--color-text-secondary)',
              paddingTop: 2,
              opacity: 0.85,
            }}
          >
            Prototype - mock data
          </footer>
        )}
      </main>
      <BottomTabBar />
    </div>
  );
};
