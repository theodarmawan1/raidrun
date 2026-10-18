import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Map, Footprints, Users, User } from 'lucide-react';

interface TabConfig {
  to: string;
  label: string;
  icon: React.ReactNode;
  isCenter?: boolean;
  isActive: (pathname: string) => boolean;
}

const DeckCardsIcon: React.FC = () => (
  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    {/* Back card */}
    <rect
      x="3.5"
      y="4.5"
      width="12"
      height="15"
      rx="2.5"
      transform="rotate(-10 3.5 4.5)"
      stroke="currentColor"
      strokeWidth="2"
    />
    {/* Front boss card */}
    <rect
      x="7.5"
      y="3.5"
      width="13"
      height="16.5"
      rx="2.5"
      fill="currentColor"
      fillOpacity="0.14"
      stroke="currentColor"
      strokeWidth="2.2"
    />
    {/* Little boss horns / face inside front card */}
    <path
      d="M11 9.5 L12.2 11 L14 9.8 L15.8 11 L17 9.5 L16.5 13.8 C16.5 15 15.4 16 14 16 C12.6 16 11.5 15 11.5 13.8 Z"
      fill="currentColor"
    />
  </svg>
);

const TABS: TabConfig[] = [
  {
    to: '/map',
    label: 'Map',
    icon: <Map size={22} strokeWidth={2.4} />,
    isActive: (pathname) => pathname.startsWith('/map') || pathname.startsWith('/events'),
  },
  {
    to: '/',
    label: 'Run',
    icon: <Footprints size={22} strokeWidth={2.4} />,
    isActive: (pathname) =>
      pathname === '/' ||
      pathname.startsWith('/run') ||
      pathname.startsWith('/raid') ||
      pathname.startsWith('/hub'),
  },
  {
    to: '/deck',
    label: 'Deck',
    icon: <DeckCardsIcon />,
    isCenter: true,
    isActive: (pathname) => pathname.startsWith('/deck'),
  },
  {
    to: '/party',
    label: 'Party',
    icon: <Users size={22} strokeWidth={2.4} />,
    isActive: (pathname) => pathname.startsWith('/party'),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: <User size={22} strokeWidth={2.4} />,
    isActive: (pathname) => pathname.startsWith('/profile'),
  },
];

export const BottomTabBar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="bottom-tabbar-wrapper" aria-label="Primary Bottom Navigation">
      <div
        className={
          location.pathname === '/' ? 'bottom-tabbar bottom-tabbar--over-map' : 'bottom-tabbar'
        }
      >
        {TABS.map((tab) => {
          const active = tab.isActive(location.pathname);
          if (tab.isCenter) {
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={`tab-item tab-item--center ${active ? 'tab-item--active' : ''}`}
                aria-label={tab.label}
              >
                <span className="tab-center-disc">{tab.icon}</span>
                <span>{tab.label}</span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={`tab-item ${active ? 'tab-item--active' : ''}`}
              aria-label={tab.label}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

