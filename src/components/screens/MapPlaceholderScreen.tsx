import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CloudSun,
  Flame,
  Zap,
  Flag,
  Calendar,
  Droplets,
  X,
  Compass,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ACTIVE_RAID_BOSS } from '../../data/mock';
import type { PlaceId, WorldPlace3D } from '../world/HomeIsland3D';

const LazyHomeIsland3D = React.lazy(() => import('../world/HomeIsland3D'));

const WORLD_HEIGHT = 1050;
const PROXIMITY_THRESHOLD_PX = 82;

// All 4 places are positioned strictly on LAND (y >= 210, never on sky/hills y < 135 or pond water)
const WORLD_PLACES: WorldPlace3D[] = [
  {
    id: 'raid',
    name: 'Raid Portal',
    shortPill: 'Raid Portal',
    xPct: 52,
    yPx: 215, // On the stone Raid Plaza at the far northern end of the path
    accentColor: '#ff3b9a',
    title: `${ACTIVE_RAID_BOSS.name} Raid`,
    subtitle: `⏱ ${ACTIVE_RAID_BOSS.countdown} • ${ACTIVE_RAID_BOSS.runnersJoined} Runners Joined`,
    detailText: 'Northern Stone Plaza • Multiplayer Boss Battle',
  },
  {
    id: 'event',
    name: 'Live Event',
    shortPill: 'Live Event',
    xPct: 68,
    yPx: 445, // On flat paved area on land near the wooden bridge
    accentColor: '#ff8a2b',
    title: 'RAIDRUN City Marathon',
    subtitle: 'Starts in 2h • 10 KM • 1,248 Runners',
    detailText: 'Bridge Plaza • Official Community Event',
  },
  {
    id: 'water',
    name: 'Water Station',
    shortPill: 'Water Station',
    xPct: 40,
    yPx: 625, // On grassy land bank at the eastern edge of the pond (pond water is at x=6%..27%)
    accentColor: '#0284c7',
    title: 'Pondside Water Station',
    subtitle: 'Free Cold Water, Electrolytes & Mist Cooling',
    detailText: 'Land Bank at Pond Edge • Open 24/7',
  },
  {
    id: 'popular',
    name: 'Popular Spot',
    shortPill: 'Popular Spot • Hot',
    xPct: 68,
    yPx: 800, // Near the Park Cafe & wooden benches on land
    accentColor: '#00b8a9',
    title: 'Park Cafe & Benches (Hot)',
    subtitle: '42 Active Runners Nearby • +15% Territory XP',
    detailText: 'Popular Runner Meetup & Recovery Patio',
  },
];

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return Boolean(gl);
  } catch {
    return false;
  }
}

class WebGLErrorBoundary extends React.Component<
  { fallback: React.ReactNode; onError: () => void; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; onError: () => void; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(): void {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const MapPlaceholderScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, setRaidSubTab, qualityPreset, setQualityPreset } = useAppStore();

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [viewportHeight, setViewportHeight] = useState(440);
  const [webglAvailable, setWebglAvailable] = useState<boolean>(() => checkWebGLSupport());

  // Mint starts on the path at (48%, 695px) — free walking never adds distance, XP, or coins
  const [mintPos, setMintPos] = useState<{ xPct: number; yPx: number }>({
    xPct: 48,
    yPx: 695,
  });
  const [targetPos, setTargetPos] = useState<{ xPct: number; yPx: number } | null>(null);
  const [activePlaceId, setActivePlaceId] = useState<PlaceId | null>(null);
  const [dismissedPlaceId, setDismissedPlaceId] = useState<PlaceId | null>(null);
  const [isNorthRegion3D, setIsNorthRegion3D] = useState(false);

  const use3DWorld = qualityPreset === 'high' && webglAvailable;

  useEffect(() => {
    const updateHeight = () => {
      if (viewportRef.current) {
        setViewportHeight(viewportRef.current.clientHeight || 440);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Smooth tap-to-move walking loop for 2D fallback (purely visual free walking; does NOT add distance, XP, or coins)
  useEffect(() => {
    if (use3DWorld || !targetPos) return;

    let animId: number;
    let lastTime = performance.now();

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      setMintPos((prev) => {
        const dxPct = targetPos.xPct - prev.xPct;
        const dyPx = targetPos.yPx - prev.yPx;
        const dxPx = (dxPct / 100) * 340;
        const distPx = Math.hypot(dxPx, dyPx);

        if (distPx < 4) {
          setTargetPos(null);
          return targetPos;
        }

        const speedPxPerSec = 260;
        const moveRatio = Math.min(1, (speedPxPerSec * dt) / distPx);
        return {
          xPct: Number((prev.xPct + dxPct * moveRatio).toFixed(2)),
          yPx: Number((prev.yPx + dyPx * moveRatio).toFixed(1)),
        };
      });

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [targetPos, use3DWorld]);

  // Check proximity to markers in 2D mode so the info card appears when Mint is near a marker
  useEffect(() => {
    if (use3DWorld) return;

    let nearest: WorldPlace3D | null = null;
    let bestDist = Infinity;

    for (const place of WORLD_PLACES) {
      const dxPx = ((place.xPct - mintPos.xPct) / 100) * 340;
      const dyPx = place.yPx - mintPos.yPx;
      const d = Math.hypot(dxPx, dyPx);
      if (d <= PROXIMITY_THRESHOLD_PX && d < bestDist) {
        bestDist = d;
        nearest = place;
      }
    }

    if (nearest) {
      if (dismissedPlaceId !== nearest.id) {
        setActivePlaceId(nearest.id);
      }
    } else if (dismissedPlaceId) {
      setDismissedPlaceId(null);
    }
  }, [mintPos, dismissedPlaceId, use3DWorld]);

  const isWalking2D = !use3DWorld && targetPos !== null;

  // Camera vertical offset following Mint in 2D mode (clamped to world bounds)
  const rawCameraTop = mintPos.yPx - viewportHeight * 0.56;
  const maxCameraTop = Math.max(0, WORLD_HEIGHT - viewportHeight);
  const cameraTop = Math.max(0, Math.min(maxCameraTop, rawCameraTop));

  const handleGroundTap2D = (e: React.MouseEvent<HTMLDivElement>) => {
    if (use3DWorld || !viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickYInViewport = e.clientY - rect.top;

    const worldY = Math.max(165, Math.min(WORLD_HEIGHT - 60, clickYInViewport + cameraTop));
    let worldXPct = Math.max(18, Math.min(84, (clickX / rect.width) * 100));

    // Keep Mint on land (avoid pond water at x=6..28%, y=590..665)
    if (worldY > 585 && worldY < 670 && worldXPct < 33) {
      worldXPct = 36;
    }

    setDismissedPlaceId(null);
    setActivePlaceId(null);
    setTargetPos({ xPct: worldXPct, yPx: worldY });
  };

  const handleMarkerTap2D = (e: React.MouseEvent, place: WorldPlace3D) => {
    e.stopPropagation();
    setDismissedPlaceId(null);
    setActivePlaceId(place.id);
    setTargetPos({
      xPct: Math.max(24, Math.min(76, place.xPct - 6)),
      yPx: Math.min(WORLD_HEIGHT - 60, place.yPx + 24),
    });
  };

  const handleJoinRaid = () => {
    setRaidSubTab('lobby');
    navigate('/raid');
  };

  const activePlace = WORLD_PLACES.find((p) => p.id === activePlaceId) || null;
  const showWalkSouthButton = use3DWorld ? isNorthRegion3D : mintPos.yPx < 480;

  // Existing 2D Home Map Layer (used when Quality is Low, WebGL is unavailable, or while 3D chunk loads)
  const renderFallback2DLayer = () => (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: WORLD_HEIGHT,
        transform: `translate3d(0, ${-Math.round(cameraTop)}px, 0)`,
        transition: isWalking2D ? 'none' : 'transform 0.25s ease-out',
        willChange: 'transform',
      }}
    >
      {/* SVG 2D Island Landscape (360 x 1050) */}
      <svg
        viewBox={`0 0 360 ${WORLD_HEIGHT}`}
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <defs>
          <linearGradient id="homeSkyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#74c0fc" />
            <stop offset="100%" stopColor="#d8f9ff" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="360" height="130" fill="url(#homeSkyGrad)" />

        <g fill="rgba(255,255,255,0.88)">
          <ellipse cx="78" cy="42" rx="34" ry="12" />
          <ellipse cx="94" cy="36" rx="22" ry="12" />
          <ellipse cx="272" cy="52" rx="30" ry="10" />
        </g>

        <path d="M0 110 Q95 78 190 108 T360 98 L360 150 L0 150 Z" fill="#9be86c" />
        <path d="M0 128 Q140 106 270 126 T360 120 L360 1050 L0 1050 Z" fill="#84dd5b" />

        <ellipse cx="285" cy="290" rx="55" ry="26" fill="#94e469" />
        <ellipse cx="75" cy="470" rx="52" ry="24" fill="#94e469" />
        <ellipse cx="265" cy="940" rx="64" ry="28" fill="#94e469" />

        <ellipse cx="187" cy="215" rx="66" ry="32" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="3" />
        <ellipse cx="187" cy="215" rx="52" ry="24" fill="#e2e8f0" stroke="#38f8c2" strokeWidth="2" strokeDasharray="6 4" />

        <rect x="196" y="412" width="102" height="58" rx="18" fill="#e9cfb0" />
        <rect x="200" y="416" width="94" height="50" rx="15" fill="#f8fafc" />

        <rect x="194" y="758" width="118" height="72" rx="18" fill="#e9cfb0" />
        <rect x="198" y="762" width="110" height="64" rx="14" fill="#fef3c7" />
        <rect x="252" y="714" width="58" height="42" rx="6" fill="#fff7ed" stroke="#d97706" strokeWidth="2" />
        <path d="M248 714 L314 714 L318 728 L244 728 Z" fill="#ff8a2b" />
        <rect x="272" y="734" width="16" height="22" rx="3" fill="#7c2d12" />
        <rect x="206" y="746" width="28" height="9" rx="3" fill="#b45309" />
        <rect x="208" y="755" width="4" height="5" fill="#78350f" />
        <rect x="228" y="755" width="4" height="5" fill="#78350f" />

        <path
          d="M 168 1050 C 145 940, 210 850, 175 740 C 145 640, 195 540, 176 410 C 162 320, 187 265, 187 215"
          fill="none"
          stroke="#e9cfb0"
          strokeWidth="52"
          strokeLinecap="round"
        />
        <path
          d="M 168 1050 C 145 940, 210 850, 175 740 C 145 640, 195 540, 176 410 C 162 320, 187 265, 187 215"
          fill="none"
          stroke="#f7e3c8"
          strokeWidth="42"
          strokeLinecap="round"
        />

        <path
          d="M 0 375 Q 95 355, 176 370 T 360 362"
          fill="none"
          stroke="#38d9f5"
          strokeWidth="18"
        />
        <rect x="148" y="352" width="56" height="36" rx="5" fill="#d99b66" stroke="#8c5828" strokeWidth="2.5" />
        <line x1="158" y1="352" x2="158" y2="388" stroke="#b47b48" strokeWidth="2" />
        <line x1="176" y1="352" x2="176" y2="388" stroke="#b47b48" strokeWidth="2" />
        <line x1="194" y1="352" x2="194" y2="388" stroke="#b47b48" strokeWidth="2" />

        <ellipse cx="62" cy="625" rx="46" ry="26" fill="#d9c398" />
        <ellipse cx="62" cy="625" rx="39" ry="20" fill="#38d9f5" />

        <g>
          <rect x="58" y="236" width="6" height="16" fill="#7c4d2b" />
          <polygon points="61,200 42,238 80,238" fill="#43a047" />
          <polygon points="61,200 61,238 80,238" fill="#2e7d32" />

          <rect x="302" y="242" width="6" height="15" fill="#7c4d2b" />
          <circle cx="305" cy="230" r="16" fill="#52b748" />

          <rect x="46" y="510" width="6" height="16" fill="#7c4d2b" />
          <polygon points="49,476 30,512 68,512" fill="#43a047" />
          <polygon points="49,476 49,512 68,512" fill="#2e7d32" />

          <rect x="58" y="868" width="7" height="16" fill="#7c4d2b" />
          <circle cx="61" cy="856" r="18" fill="#52b748" />

          <rect x="308" y="920" width="7" height="18" fill="#7c4d2b" />
          <circle cx="311" cy="906" r="20" fill="#68c947" />
        </g>
      </svg>

      {targetPos && (
        <div
          style={{
            position: 'absolute',
            left: `${targetPos.xPct}%`,
            top: targetPos.yPx,
            transform: 'translate(-50%, -50%)',
            width: 28,
            height: 14,
            borderRadius: '50%',
            border: '2.5px dashed #00b8a9',
            background: 'rgba(56, 248, 194, 0.25)',
            pointerEvents: 'none',
          }}
        />
      )}

      {WORLD_PLACES.map((place) => {
        const isSelected = activePlaceId === place.id;
        return (
          <button
            key={place.id}
            type="button"
            onClick={(e) => handleMarkerTap2D(e, place)}
            className="touch-target"
            aria-label={`${place.name} ground marker`}
            style={{
              position: 'absolute',
              left: `${place.xPct}%`,
              top: place.yPx,
              transform: 'translate(-50%, -50%)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 11px 6px 7px',
              minHeight: 44,
              minWidth: 44,
              borderRadius: 'var(--radius-pill)',
              background: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.95)',
              border: `2px solid ${place.accentColor}`,
              boxShadow: isSelected
                ? `0 0 0 4px ${place.accentColor}33, 0 8px 18px rgba(16, 42, 67, 0.22)`
                : '0 5px 14px rgba(16, 42, 67, 0.16)',
              zIndex: isSelected ? 4 : 3,
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: place.accentColor,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {place.id === 'raid' && <Flame size={15} fill="#ffffff" />}
              {place.id === 'event' && <Calendar size={15} />}
              {place.id === 'water' && <Droplets size={15} fill="#ffffff" />}
              {place.id === 'popular' && <Flame size={15} fill="#ffffff" />}
            </span>
            <span
              style={{
                fontSize: '0.73rem',
                fontWeight: 900,
                color: 'var(--color-text-primary)',
                whiteSpace: 'nowrap',
              }}
            >
              {place.shortPill}
            </span>
          </button>
        );
      })}

      <div
        style={{
          position: 'absolute',
          left: `${mintPos.xPct}%`,
          top: mintPos.yPx,
          transform: 'translate(-50%, -78%)',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      >
        <svg
          width="98"
          height="92"
          viewBox="0 0 116 106"
          className={isWalking2D ? 'mint-runner-sprite' : ''}
        >
          <ellipse
            cx="52"
            cy="92"
            rx="32"
            ry="9"
            fill="rgba(34, 245, 154, 0.18)"
            stroke="#22f59a"
            strokeWidth="3.5"
            strokeDasharray="24 6"
          />
          <circle cx="52" cy="24" r="10" fill="#f3b893" />
          <path d="M42 20 Q52 10 62 20 Z" fill="#5c3824" />
          <rect x="41" y="34" width="22" height="24" rx="6" fill="#00b8a9" />
          <path d="M45 34 L59 34 L56 54 L48 54 Z" fill="#ffffff" />
          <rect x="42" y="56" width="9" height="14" rx="3" fill="#0a878f" />
          <rect x="53" y="56" width="9" height="14" rx="3" fill="#0a878f" />
          <rect x="44" y="70" width="5" height="16" fill="#f3b893" />
          <rect x="55" y="70" width="5" height="16" fill="#f3b893" />
          <rect x="42" y="84" width="9" height="5" rx="2" fill="#00b8a9" />
          <rect x="54" y="84" width="9" height="5" rx="2" fill="#00b8a9" />

          <g transform="translate(74, 50)">
            <polygon points="14,0 6,14 22,14" fill="#72f6d0" />
            <polygon points="6,4 0,16 12,16" fill="#4ce0b3" />
            <polygon points="22,4 16,16 28,16" fill="#4ce0b3" />
            <ellipse cx="14" cy="20" rx="11" ry="10" fill="#a8f9e4" />
            <circle cx="10" cy="19" r="2" fill="#102a43" />
            <circle cx="18" cy="19" r="2" fill="#102a43" />
          </g>
        </svg>
      </div>
    </div>
  );

  return (
    <>
      {/* Top HUD Bar with labeled Energy bar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          width: '100%',
        }}
      >
        {/* Left Avatar Chip with circular XP ring */}
        <div
          className="frosted-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 10px 6px 6px',
            borderRadius: 'var(--radius-pill)',
            minWidth: 0,
            flex: '1 1 auto',
            maxWidth: 206,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'conic-gradient(#38f8c2 0% 65%, #102a43 65% 100%)',
              padding: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'linear-gradient(180deg, #1ce5c8 0%, #0a878f 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.8rem',
              }}
            >
              TK
            </div>
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span
                style={{
                  fontWeight: 900,
                  fontSize: '0.8rem',
                  color: 'var(--color-text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.username}
              </span>
              <span
                className="pill-badge"
                style={{
                  background: 'var(--color-primary-dark)',
                  color: '#fff',
                  padding: '2px 6px',
                  fontSize: '0.64rem',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                Lv {user.level}
              </span>
            </div>
            <div
              style={{
                marginTop: 4,
                width: '100%',
                maxWidth: 88,
                height: 6,
                borderRadius: 999,
                background: 'rgba(16, 42, 67, 0.14)',
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

        {/* Right Weather & Labeled Energy HUD */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 5,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'var(--color-surface-card)',
              border: '1.5px solid var(--color-border-card)',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-primary)',
            }}
            aria-label="Weather 28 degrees sunny"
          >
            <CloudSun size={21} color="#0A878F" />
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 8px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--color-surface-card)',
              border: '1.5px solid var(--color-border-card)',
              boxShadow: 'var(--shadow-card)',
            }}
            aria-label="Raid Energy 76 percent"
          >
            <Zap size={12} color="#00b8a9" fill="#00b8a9" />
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 900,
                color: 'var(--color-text-primary)',
                whiteSpace: 'nowrap',
              }}
            >
              Energy
            </span>
            <div
              style={{
                width: 36,
                height: 9,
                borderRadius: 999,
                background: '#102a43',
                overflow: 'hidden',
                padding: 1,
              }}
            >
              <div
                style={{
                  width: '76%',
                  height: '100%',
                  borderRadius: 999,
                  background: 'var(--gradient-xp-bar)',
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Home Island Viewport (3D World when Quality=High & WebGL supported; 2D Fallback when Quality=Low) */}
      <section
        ref={viewportRef}
        onClick={handleGroundTap2D}
        aria-label={
          use3DWorld
            ? 'Interactive 3D Home Island World (Tap ground or markers to walk)'
            : 'Interactive 2D Home World Map Fallback (Tap ground or markers to walk)'
        }
        style={{
          position: 'relative',
          flex: 1,
          minHeight: 430,
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          border: '2px solid rgba(255, 255, 255, 0.92)',
          boxShadow: 'var(--shadow-card)',
          background: use3DWorld ? '#a5f3fc' : '#80db57',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {use3DWorld ? (
          <WebGLErrorBoundary
            fallback={renderFallback2DLayer()}
            onError={() => setWebglAvailable(false)}
          >
            <Suspense fallback={renderFallback2DLayer()}>
              <LazyHomeIsland3D
                places={WORLD_PLACES}
                activePlaceId={activePlaceId}
                targetPos={targetPos}
                qualityPreset={qualityPreset}
                onSelectPlace={(placeId, walkTarget) => {
                  setDismissedPlaceId(null);
                  setActivePlaceId(placeId);
                  setTargetPos(walkTarget);
                }}
                onProximityPlace={(placeId) => {
                  if (placeId) {
                    if (dismissedPlaceId !== placeId) {
                      setActivePlaceId(placeId);
                    }
                  } else if (dismissedPlaceId) {
                    setDismissedPlaceId(null);
                  }
                }}
                onGroundTap={(walkTarget) => {
                  setDismissedPlaceId(null);
                  setActivePlaceId(null);
                  setTargetPos(walkTarget);
                }}
                onRegionChange={(isNorth) => setIsNorthRegion3D(isNorth)}
                onContextError={() => setWebglAvailable(false)}
              />
            </Suspense>
          </WebGLErrorBoundary>
        ) : (
          renderFallback2DLayer()
        )}

        {/* Top Overlay: Quick Walk-To Bar + Quality High/Low Toggle */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            right: 10,
            zIndex: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 6,
            pointerEvents: 'none',
          }}
        >
          {!showWalkSouthButton ? (
            <button
              type="button"
              onClick={() => {
                const raidPlace = WORLD_PLACES[0];
                setDismissedPlaceId(null);
                setActivePlaceId('raid');
                setTargetPos({ xPct: raidPlace.xPct, yPx: raidPlace.yPx + 22 });
              }}
              className="touch-target"
              aria-label="Walk to Raid Portal Plaza"
              style={{
                pointerEvents: 'auto',
                minHeight: 44,
                padding: '0 11px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(255, 255, 255, 0.94)',
                border: '1.5px solid #ff3b9a',
                boxShadow: 'var(--shadow-card)',
                fontSize: '0.69rem',
                fontWeight: 900,
                color: 'var(--color-text-primary)',
                gap: 5,
              }}
            >
              <Compass size={14} color="#ff3b9a" />
              <span>Walk to Raid Plaza ↑</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDismissedPlaceId(null);
                setActivePlaceId(null);
                setTargetPos({ xPct: 48, yPx: 695 });
              }}
              className="touch-target"
              aria-label="Walk South to Park Cafe"
              style={{
                pointerEvents: 'auto',
                minHeight: 44,
                padding: '0 11px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(255, 255, 255, 0.94)',
                border: '1.5px solid var(--color-primary)',
                boxShadow: 'var(--shadow-card)',
                fontSize: '0.69rem',
                fontWeight: 900,
                color: 'var(--color-text-primary)',
                gap: 5,
              }}
            >
              <Compass size={14} color="#00b8a9" />
              <span>Walk South ↓</span>
            </button>
          )}

          {/* Quality Setting High (3D) / Low (2D Fallback) Toggle */}
          <button
            type="button"
            onClick={() => setQualityPreset(qualityPreset === 'high' ? 'low' : 'high')}
            className="touch-target"
            aria-label={`Quality setting ${qualityPreset === 'high' ? 'High 3D' : 'Low 2D fallback'}`}
            style={{
              pointerEvents: 'auto',
              minHeight: 44,
              padding: '0 11px',
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(255, 255, 255, 0.94)',
              border: `1.5px solid ${use3DWorld ? '#00b8a9' : '#64748b'}`,
              boxShadow: 'var(--shadow-card)',
              fontSize: '0.69rem',
              fontWeight: 900,
              color: 'var(--color-text-primary)',
              gap: 5,
            }}
          >
            <Sparkles size={13} color={use3DWorld ? '#00b8a9' : '#64748b'} />
            <span>{use3DWorld ? 'Quality: High (3D)' : 'Quality: Low (2D)'}</span>
          </button>
        </div>

        {/* Bottom-Right Flag Button (opens Hub screen) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate('/hub');
          }}
          className="touch-target"
          aria-label="Open Hub"
          style={{
            position: 'absolute',
            right: 12,
            bottom: activePlace ? 126 : 12,
            zIndex: 9,
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'var(--color-surface-card)',
            border: '1.5px solid var(--color-border-card)',
            boxShadow: 'var(--shadow-card)',
            color: 'var(--color-text-primary)',
            transition: 'bottom 0.2s ease',
          }}
        >
          <Flag size={18} fill="#102a43" />
        </button>

        {/* Contextual Info Card — ONLY appears when Mint is near a marker OR a marker is tapped */}
        {activePlace && (
          <div
            role="dialog"
            aria-label={`${activePlace.title} Info`}
            onClick={(e) => e.stopPropagation()}
            className="frosted-card"
            style={{
              position: 'absolute',
              left: 10,
              right: 10,
              bottom: 10,
              zIndex: 10,
              background: 'rgba(255, 255, 255, 0.98)',
              border: `2px solid ${activePlace.accentColor}`,
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              boxShadow: '0 14px 32px rgba(16, 42, 67, 0.24)',
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  className="pill-badge"
                  style={{
                    background: `${activePlace.accentColor}1f`,
                    color: 'var(--color-text-primary)',
                    fontSize: '0.62rem',
                    padding: '2px 8px',
                  }}
                >
                  {activePlace.detailText}
                </span>
              </div>
              <div
                style={{
                  fontSize: '0.92rem',
                  fontWeight: 900,
                  color: 'var(--color-text-primary)',
                  marginTop: 3,
                }}
              >
                {activePlace.title}
              </div>
              <div
                style={{
                  fontSize: '0.73rem',
                  fontWeight: 700,
                  color: 'var(--color-text-secondary)',
                }}
              >
                {activePlace.subtitle}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              {activePlace.id === 'raid' && (
                <button
                  type="button"
                  onClick={handleJoinRaid}
                  className="touch-target"
                  style={{
                    minHeight: 44,
                    padding: '0 14px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--gradient-cta)',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '0.78rem',
                    boxShadow: '0 3px 0 #057a80',
                  }}
                >
                  Join Raid →
                </button>
              )}

              {activePlace.id === 'event' && (
                <button
                  type="button"
                  onClick={() => navigate('/events')}
                  className="touch-target"
                  style={{
                    minHeight: 44,
                    padding: '0 14px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--gradient-cta)',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '0.78rem',
                    boxShadow: '0 3px 0 #057a80',
                  }}
                >
                  Open Events →
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setDismissedPlaceId(activePlace.id);
                  setActivePlaceId(null);
                }}
                className="touch-target"
                aria-label="Close place card"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'rgba(16, 42, 67, 0.06)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
};
