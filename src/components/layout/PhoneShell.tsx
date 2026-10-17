import React, { useState, useEffect } from 'react';
import { BottomTabBar } from './BottomTabBar';

interface PhoneShellProps {
  children: React.ReactNode;
}

export const PhoneShell: React.FC<PhoneShellProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 160);
    return () => window.clearTimeout(timer);
  }, []);

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

      <main className="screen-scroll">
        {children}
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
      </main>
      <BottomTabBar />
    </div>
  );
};
