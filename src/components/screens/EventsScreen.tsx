import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  QrCode,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { RunningEvent } from '../../data/mock';

type EventCategoryFilter = 'All' | 'Easy Run' | 'Night Run' | 'Trail Challenge';
type EventsSubView = 'discovery' | 'detail' | 'rsvp-list';

const CATEGORY_FILTERS: EventCategoryFilter[] = [
  'All',
  'Easy Run',
  'Night Run',
  'Trail Challenge',
];

const EventVectorThumb: React.FC<{ id: string; large?: boolean }> = ({ id, large = false }) => {
  const isNight = id.includes('night');
  const isTrail = id.includes('trail');
  return (
    <svg
      width={large ? '100%' : '88'}
      height={large ? '118' : '74'}
      viewBox="0 0 160 100"
      preserveAspectRatio="xMidYMid slice"
      style={{
        borderRadius: large ? 'var(--radius-lg)' : 'var(--radius-md)',
        flexShrink: 0,
        display: 'block',
      }}
    >
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          {isNight ? (
            <>
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#4338ca" />
            </>
          ) : isTrail ? (
            <>
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#bbf7d0" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#38d9f5" />
              <stop offset="100%" stopColor="#e0fbf6" />
            </>
          )}
        </linearGradient>
      </defs>
      <rect width="160" height="100" fill={`url(#sky-${id})`} />
      {/* Distant skyline or hills */}
      {isTrail ? (
        <path d="M0 70 L45 32 L90 66 L125 28 L160 68 L160 100 L0 100 Z" fill="#16a34a" />
      ) : (
        <g fill={isNight ? '#312e81' : '#94a3b8'} opacity="0.55">
          <rect x="18" y="34" width="18" height="40" />
          <rect x="42" y="24" width="22" height="50" />
          <rect x="98" y="28" width="20" height="46" />
          <rect x="122" y="38" width="18" height="36" />
        </g>
      )}
      {/* Ground & Running Track */}
      <rect x="0" y="68" width="160" height="32" fill={isNight ? '#1e293b' : '#74d14c'} />
      <polygon points="46,68 114,68 142,100 18,100" fill={isNight ? '#334155' : '#e2e8f0'} />
      {/* RAIDRUN Start Arch */}
      <path
        d="M36 74 L36 30 Q80 18 124 30 L124 74 L112 74 L112 36 Q80 28 48 36 L48 74 Z"
        fill="#00b8a9"
      />
      <rect x="56" y="24" width="48" height="11" rx="4" fill="#066168" />
      <text
        x="80"
        y="32"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="7"
        fontWeight="900"
        fontFamily="Nunito, sans-serif"
      >
        RAIDRUN
      </text>
      {/* Runners silhouette */}
      <circle cx="80" cy="64" r="6" fill="#00b8a9" />
      <rect x="74" y="70" width="12" height="16" rx="4" fill="#1ce5c8" />
    </svg>
  );
};

const PseudoQrCode: React.FC = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" aria-label="Check-in QR Code">
    <rect width="64" height="64" rx="8" fill="#ffffff" />
    <rect x="6" y="6" width="18" height="18" fill="none" stroke="#102a43" strokeWidth="4" />
    <rect x="11" y="11" width="8" height="8" fill="#102a43" />
    <rect x="40" y="6" width="18" height="18" fill="none" stroke="#102a43" strokeWidth="4" />
    <rect x="45" y="11" width="8" height="8" fill="#102a43" />
    <rect x="6" y="40" width="18" height="18" fill="none" stroke="#102a43" strokeWidth="4" />
    <rect x="11" y="45" width="8" height="8" fill="#102a43" />
    <g fill="#102a43">
      <rect x="28" y="8" width="6" height="6" />
      <rect x="28" y="18" width="6" height="12" />
      <rect x="8" y="28" width="12" height="6" />
      <rect x="26" y="34" width="10" height="6" />
      <rect x="40" y="28" width="6" height="12" />
      <rect x="50" y="30" width="8" height="6" />
      <rect x="30" y="44" width="8" height="14" />
      <rect x="42" y="46" width="14" height="6" />
      <rect x="48" y="54" width="10" height="4" />
    </g>
  </svg>
);

export const EventsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { events, rsvpEvent, toggleRsvp, setHubTab } = useAppStore();

  const [subView, setSubView] = useState<EventsSubView>('discovery');
  const [categoryFilter, setCategoryFilter] = useState<EventCategoryFilter>('All');
  const [selectedEventId, setSelectedEventId] = useState<string>('evt-marathon');
  const [rsvpModalEvent, setRsvpModalEvent] = useState<RunningEvent | null>(null);

  const featuredEvent =
    events.find((e) => e.id === 'evt-marathon') || events[1] || events[0];
  const selectedEvent =
    events.find((e) => e.id === selectedEventId) || featuredEvent;

  const filteredEvents = events.filter((ev) =>
    categoryFilter === 'All' ? true : ev.category === categoryFilter
  );

  const rsvpedEvents = events.filter((ev) => ev.rsvped);

  const handleOpenDetail = (ev: RunningEvent) => {
    setSelectedEventId(ev.id);
    setSubView('detail');
  };

  const handleTriggerRsvp = (ev: RunningEvent) => {
    rsvpEvent(ev.id);
    setSelectedEventId(ev.id);
    setRsvpModalEvent({
      ...ev,
      rsvped: true,
      participants: ev.rsvped ? ev.participants : ev.participants + 1,
    });
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <button
          type="button"
          onClick={() => {
            if (subView !== 'discovery') {
              setSubView('discovery');
            } else {
              navigate('/map');
            }
          }}
          className="touch-target"
          aria-label="Back"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'var(--color-surface-card)',
            border: '1.5px solid var(--color-border-card)',
            boxShadow: 'var(--shadow-card)',
            color: 'var(--color-text-primary)',
          }}
        >
          <ArrowLeft size={20} />
        </button>

        <h1
          style={{
            fontSize: '1.15rem',
            fontWeight: 900,
            color: 'var(--color-text-primary)',
            textAlign: 'center',
          }}
        >
          {subView === 'detail'
            ? 'Event Details'
            : subView === 'rsvp-list'
            ? 'My Event RSVPs'
            : 'Events Discovery'}
        </h1>

        <button
          type="button"
          onClick={() =>
            setSubView(subView === 'rsvp-list' ? 'discovery' : 'rsvp-list')
          }
          className="touch-target"
          style={{
            minHeight: 44,
            padding: '0 12px',
            borderRadius: 'var(--radius-pill)',
            background:
              subView === 'rsvp-list'
                ? 'var(--gradient-active-tab)'
                : 'var(--color-surface-card)',
            color:
              subView === 'rsvp-list' ? '#ffffff' : 'var(--color-primary-deep)',
            border: '1.5px solid var(--color-border-card)',
            boxShadow: 'var(--shadow-card)',
            fontWeight: 900,
            fontSize: '0.74rem',
            gap: 5,
          }}
        >
          <QrCode size={15} />
          <span>RSVPs ({rsvpedEvents.length})</span>
        </button>
      </header>

      {/* SUBVIEW 1: EVENTS DISCOVERY */}
      {subView === 'discovery' && (
        <>
          {/* Featured Card: RAIDRUN CITY MARATHON */}
          <section
            className="frosted-card"
            aria-label="Featured Event RAIDRUN CITY MARATHON"
            style={{
              padding: 12,
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(224,251,246,0.92) 100%)',
              border: '2px solid rgba(0, 184, 169, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ position: 'relative' }}>
              <EventVectorThumb id={featuredEvent.id} large />
              <span
                className="pill-badge"
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  background: 'var(--gradient-boss-hp)',
                  color: '#ffffff',
                  fontSize: '0.66rem',
                  padding: '3px 9px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                }}
              >
                <Sparkles size={11} />
                FEATURED MARATHON
              </span>
              <span
                className="pill-badge"
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: 'rgba(16, 42, 67, 0.85)',
                  color: '#38f8c2',
                  fontSize: '0.68rem',
                  padding: '3px 9px',
                }}
              >
                <Clock size={11} />
                {featuredEvent.startsIn}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 6,
                }}
              >
                <h2
                  style={{
                    fontSize: '1.02rem',
                    fontWeight: 900,
                    color: 'var(--color-text-primary)',
                    letterSpacing: '0.01em',
                  }}
                >
                  RAIDRUN CITY MARATHON
                </h2>
                {featuredEvent.rsvped && (
                  <span
                    className="pill-badge"
                    style={{
                      background: 'var(--color-success-bg)',
                      color: 'var(--color-success-text)',
                      fontSize: '0.66rem',
                      padding: '2px 8px',
                    }}
                  >
                    Going ✓
                  </span>
                )}
              </div>

              {/* Stat Chips for Distance, Runners, and Countdown */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 2,
                }}
              >
                <span
                  className="pill-badge"
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--color-border-subtle)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.7rem',
                    padding: '3px 9px',
                  }}
                >
                  <MapPin size={12} color="var(--color-primary-dark)" />
                  {featuredEvent.distanceKm} KM
                </span>
                <span
                  className="pill-badge"
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--color-border-subtle)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.7rem',
                    padding: '3px 9px',
                  }}
                >
                  <Users size={12} color="var(--color-primary-dark)" />
                  {featuredEvent.participants.toLocaleString()} Runners
                </span>
                <span
                  className="pill-badge"
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--color-border-subtle)',
                    color: 'var(--color-primary-deep)',
                    fontSize: '0.7rem',
                    padding: '3px 9px',
                  }}
                >
                  <Clock size={12} color="var(--color-primary-dark)" />
                  {featuredEvent.startsIn}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button
                type="button"
                onClick={() => handleOpenDetail(featuredEvent)}
                className="touch-target"
                style={{
                  minHeight: 44,
                  borderRadius: 'var(--radius-pill)',
                  background: '#ffffff',
                  color: 'var(--color-primary-deep)',
                  border: '1.5px solid rgba(0, 184, 169, 0.35)',
                  fontWeight: 900,
                  fontSize: '0.8rem',
                }}
              >
                Event Details
              </button>
              <button
                type="button"
                onClick={() => handleTriggerRsvp(featuredEvent)}
                className="touch-target"
                style={{
                  minHeight: 44,
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--gradient-cta)',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.84rem',
                  letterSpacing: '0.03em',
                  boxShadow: '0 3px 0 #057a80',
                }}
              >
                JOIN
              </button>
            </div>
          </section>

          {/* Category Tiles: Easy Run, Night Run, Trail Challenge (+ All toggle) */}
          <div
            role="group"
            aria-label="Event category tiles"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 6,
            }}
          >
            {CATEGORY_FILTERS.map((cat) => {
              const active = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className="touch-target"
                  style={{
                    minHeight: 44,
                    padding: '0 4px',
                    borderRadius: 'var(--radius-md)',
                    background: active
                      ? 'var(--gradient-active-tab)'
                      : 'var(--color-surface-card)',
                    color: active ? '#ffffff' : 'var(--color-text-primary)',
                    border: '1.5px solid var(--color-border-card)',
                    boxShadow: 'var(--shadow-card)',
                    fontWeight: 800,
                    fontSize: '0.68rem',
                    textAlign: 'center',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Event List */}
          <section
            aria-label="Upcoming Running Events"
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            {filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="frosted-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: 10,
                }}
              >
                <EventVectorThumb id={ev.id} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <h3
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: 900,
                        color: 'var(--color-text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {ev.title}
                    </h3>
                  </div>

                  <div
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: 'var(--color-text-secondary)',
                      marginTop: 2,
                    }}
                  >
                    {ev.startsIn}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginTop: 5,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <MapPin size={12} color="var(--color-primary-dark)" />
                      {ev.distanceKm} KM
                    </span>
                    <span style={{ color: 'var(--color-border-subtle)' }}>|</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <Users size={12} color="var(--color-primary-dark)" />
                      {ev.participants.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenDetail(ev)}
                  className="touch-target"
                  style={{
                    minWidth: 64,
                    minHeight: 44,
                    padding: '0 12px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--gradient-active-tab)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.76rem',
                    flexShrink: 0,
                  }}
                >
                  View
                </button>
              </div>
            ))}
          </section>
        </>
      )}

      {/* SUBVIEW 2: EVENT DETAIL */}
      {subView === 'detail' && (
        <section
          className="frosted-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: 14,
          }}
        >
          <EventVectorThumb id={selectedEvent.id} large />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span
              className="pill-badge"
              style={{
                background: 'var(--color-primary-soft)',
                color: 'var(--color-primary-deep)',
                fontSize: '0.72rem',
              }}
            >
              {selectedEvent.category}
            </span>
            <span
              className="pill-badge"
              style={{
                background: 'var(--color-gold-bg)',
                color: 'var(--color-gold-text)',
                fontSize: '0.72rem',
              }}
            >
              <Clock size={12} />
              {selectedEvent.startsIn}
            </span>
          </div>

          <div>
            <h2
              style={{
                fontSize: '1.2rem',
                fontWeight: 900,
                color: 'var(--color-text-primary)',
              }}
            >
              {selectedEvent.title}
            </h2>
            <p
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--color-text-secondary)',
                marginTop: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <MapPin size={14} color="var(--color-primary-dark)" />
              {selectedEvent.location} • Official Pacers & Hydration Stations
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
            }}
          >
            <div
              style={{
                padding: '10px 8px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.8)',
                border: '1px solid var(--color-border-subtle)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>
                DISTANCE
              </div>
              <div style={{ fontSize: '0.98rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
                {selectedEvent.distanceKm} KM
              </div>
            </div>
            <div
              style={{
                padding: '10px 8px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.8)',
                border: '1px solid var(--color-border-subtle)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>
                RUNNERS
              </div>
              <div style={{ fontSize: '0.98rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
                {selectedEvent.participants.toLocaleString()}
              </div>
            </div>
            <div
              style={{
                padding: '10px 8px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.8)',
                border: '1px solid var(--color-border-subtle)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>
                REWARD
              </div>
              <div style={{ fontSize: '0.98rem', fontWeight: 900, color: 'var(--color-primary-dark)' }}>
                +300 XP
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary-soft)',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'var(--color-primary-deep)',
              lineHeight: 1.4,
            }}
          >
            Join community runners at {selectedEvent.location}. Every kilometer run during this event also deals 2x bonus damage to active Raid Bosses!
          </div>

          <button
            type="button"
            onClick={() => handleTriggerRsvp(selectedEvent)}
            className="btn-primary-cta touch-target"
          >
            <Calendar size={18} />
            <span>RSVP for Event</span>
          </button>
        </section>
      )}

      {/* SUBVIEW 3: MY RSVPs & QR CHECK-IN TICKETS (matching design/16.png) */}
      {subView === 'rsvp-list' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rsvpedEvents.length === 0 ? (
            <div
              className="frosted-card"
              style={{ textAlign: 'center', padding: 24 }}
            >
              <p style={{ fontWeight: 800, color: 'var(--color-text-secondary)' }}>
                No active RSVPs yet. Pick an event to get your runner pass!
              </p>
            </div>
          ) : (
            rsvpedEvents.map((ev) => (
              <div
                key={ev.id}
                className="frosted-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                  <EventVectorThumb id={ev.id} />
                  <div style={{ minWidth: 0 }}>
                    <h3
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 900,
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {ev.title}
                    </h3>
                    <span
                      className="pill-badge"
                      style={{
                        marginTop: 4,
                        background: 'var(--color-success-bg)',
                        color: 'var(--color-success-text)',
                        fontSize: '0.68rem',
                        padding: '2px 10px',
                      }}
                    >
                      Going
                    </span>
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: '0.73rem',
                        fontWeight: 700,
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {ev.startsIn}
                    </div>
                  </div>
                </div>

                {/* Right Ticket Stub with QR & Cancel button */}
                <div
                  style={{
                    paddingLeft: 10,
                    borderLeft: '2px dashed rgba(16, 42, 67, 0.14)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    flexShrink: 0,
                  }}
                >
                  <PseudoQrCode />
                  <button
                    type="button"
                    onClick={() => toggleRsvp(ev.id)}
                    className="touch-target"
                    style={{
                      minHeight: 44,
                      minWidth: 76,
                      padding: '0 10px',
                      borderRadius: 'var(--radius-pill)',
                      border: '1.5px solid var(--color-primary-dark)',
                      color: 'var(--color-primary-dark)',
                      background: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))
          )}
          <p
            style={{
              textAlign: 'center',
              fontSize: '0.76rem',
              fontWeight: 700,
              color: 'var(--color-text-secondary)',
            }}
          >
            Show the QR code at check-in.
          </p>
        </section>
      )}

      {/* "You're In!" RSVP Confirmation Modal */}
      {rsvpModalEvent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rsvp-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(16, 42, 67, 0.58)',
            backdropFilter: 'blur(6px)',
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
              maxWidth: 356,
              background: '#ffffff',
              padding: '20px 18px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 12,
              boxShadow: '0 20px 50px rgba(16, 42, 67, 0.35)',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--color-success-bg)',
                color: 'var(--color-success-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={32} />
            </div>

            <div>
              <span
                className="pill-badge"
                style={{
                  background: 'var(--color-primary-soft)',
                  color: 'var(--color-primary-deep)',
                  fontSize: '0.68rem',
                }}
              >
                <Trophy size={12} />
                OFFICIAL RUNNER PASS SAVED
              </span>
              <h2
                id="rsvp-modal-title"
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 900,
                  color: 'var(--color-text-primary)',
                  marginTop: 6,
                }}
              >
                You&apos;re In!
              </h2>
              <p
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--color-text-secondary)',
                  marginTop: 4,
                }}
              >
                Spot reserved for <strong>{rsvpModalEvent.title}</strong> ({rsvpModalEvent.distanceKm} KM • {rsvpModalEvent.startsIn}).
              </p>
            </div>

            <div
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg-soft)',
                border: '1px solid rgba(0, 184, 169, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
                  {rsvpModalEvent.location}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                  {rsvpModalEvent.participants.toLocaleString()} Runners Joined
                </div>
              </div>
              <PseudoQrCode />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
              <button
                type="button"
                onClick={() => {
                  setRsvpModalEvent(null);
                  setHubTab('rsvp');
                  navigate('/hub');
                }}
                className="touch-target"
                style={{
                  minHeight: 48,
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--color-primary-soft)',
                  color: 'var(--color-primary-deep)',
                  border: '1.5px solid rgba(0, 184, 169, 0.35)',
                  fontWeight: 900,
                  fontSize: '0.82rem',
                }}
              >
                View RSVP
              </button>
              <button
                type="button"
                onClick={() => {
                  setRsvpModalEvent(null);
                  navigate('/');
                }}
                className="touch-target"
                style={{
                  minHeight: 48,
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--gradient-cta)',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.82rem',
                  boxShadow: '0 3px 0 #057a80',
                }}
              >
                Back to Map
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
