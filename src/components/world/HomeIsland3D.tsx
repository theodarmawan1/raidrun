import React, { useMemo, useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Flame, Calendar, Droplets } from 'lucide-react';

const LazyDistantNorthRegion = React.lazy(() => import('./DistantNorthRegion3D'));

export type PlaceId = 'raid' | 'event' | 'water' | 'popular';

export interface WorldPlace3D {
  id: PlaceId;
  name: string;
  shortPill: string;
  xPct: number;
  yPx: number;
  accentColor: string;
  title: string;
  subtitle: string;
  detailText: string;
}

export interface RaidGuidanceInfo {
  distMeters: number;
  offScreen: boolean;
  angleDeg: number;
}

interface HomeIsland3DProps {
  places: WorldPlace3D[];
  activePlaceId: PlaceId | null;
  guidedPlaceId?: PlaceId;
  initialMintWorldPos?: { x: number; z: number };
  targetPos: { xPct: number; yPx: number } | null;
  qualityPreset?: 'high' | 'low';
  zoomFactor?: number;
  onSelectPlace: (placeId: PlaceId, walkTarget: { xPct: number; yPx: number }) => void;
  onProximityPlace: (placeId: PlaceId | null) => void;
  onGroundTap: (walkTarget: { xPct: number; yPx: number }) => void;
  onRegionChange?: (isNorthHalf: boolean) => void;
  onRaidGuidanceChange?: (info: RaidGuidanceInfo) => void;
  onMintWorldMove?: (x: number, z: number) => void;
  onLowFpsFallback?: () => void;
  onContextError?: () => void;
}

// Stage A: ~3.5x larger world space tuned so portrait viewports frame road, track loop, park, pond, fountain & buildings
export const toWorldX = (xPct: number): number => (xPct - 50) * 0.22;
export const toWorldZ = (yPx: number): number => (yPx - 600) * 0.044;
export const toXPct = (worldX: number): number => 50 + worldX / 0.22;
export const toYPx = (worldZ: number): number => 600 + worldZ / 0.044;

export const MIN_CAMERA_ZOOM = 0.75;
export const MAX_CAMERA_ZOOM = 1.85;

// Full-screen framing: reference aspect of the old card viewport and how much to compensate for taller screens
const BASE_FOV = 52;
const TALL_REF_ASPECT = 0.68;
const TALL_FOV_BOOST = 8;
const TALL_PULLBACK = 0.06;
const TALL_LOOKAT_SHIFT = 0.8;

// Screen-space zones (px) kept free of marker pills: top name/weather row, bottom tab bar + Deck disc, sides
const HUD_TOP_RESERVED_PX = 112;
const HUD_BOTTOM_RESERVED_PX = 140;
const HUD_SIDE_RESERVED_PX = 56;

// Matches the "close enough to join / open card" radius used by MapPlaceholderScreen
export const GUIDE_ARRIVAL_RADIUS_METERS = 15;

// Place 3D position overrides so all 4 markers sit cleanly on land without touching screen edges or the bottom-right Flag button
const getPlaceWorldCoords = (place: WorldPlace3D): [number, number] => {
  switch (place.id) {
    case 'raid':
      return [0.3, toWorldZ(215)]; // Northern Stone Raid Plaza across the river bridge
    case 'event':
      return [2.25, toWorldZ(445)]; // Flat Event Plaza near the river bridge
    case 'water':
      return [-2.35, toWorldZ(625)]; // Land bank at the eastern edge of the West Pond
    case 'popular':
      return [2.1, toWorldZ(760)]; // Patio near Park Cafe, benches & Fountain (clear of Flag button)
  }
};

// Clamp any 3D point so Mint stays strictly on walkable island land
const clampToIslandLand = (rawX: number, rawZ: number): { x: number; z: number } => {
  const z = THREE.MathUtils.clamp(rawZ, -19.0, 15.5);
  const maxHalfWidth = z < -13.0 ? 7.2 : 9.6;
  let x = THREE.MathUtils.clamp(rawX, -maxHalfWidth, maxHalfWidth);

  // Avoid West Pond water (center x = -4.2, z = 1.1, radius ~1.65)
  const distPond = Math.hypot(x - -4.2, z - 1.1);
  if (distPond < 1.75) {
    x = -2.3;
  }

  // Avoid Central Park Fountain basin (center x = 0.85, z = 3.2, radius ~1.0)
  const distFountain = Math.hypot(x - 0.85, z - 3.2);
  if (distFountain < 1.1) {
    x = -0.35;
  }

  return { x, z };
};

// Crisp 4-band toon gradient DataTexture
const useToonGradientMap = (): THREE.DataTexture => {
  return useMemo(() => {
    const colors = new Uint8Array([
      138, 138, 138, 255,
      182, 182, 182, 255,
      224, 224, 224, 255,
      255, 255, 255, 255,
    ]);
    const texture = new THREE.DataTexture(colors, 4, 1, THREE.RGBAFormat);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    return texture;
  }, []);
};

// Instanced Trees (30 in High, 15 in Low)
const ALL_TREE_POSITIONS: Array<[number, number, number, number]> = [
  [-6.8, 0, -9.2, 1.1],
  [-4.4, 0, -9.4, 1.0],
  [4.4, 0, -9.2, 1.05],
  [7.2, 0, -8.8, 1.0],
  [-7.4, 0, -5.8, 1.15],
  [-4.2, 0, -4.2, 0.95],
  [-6.8, 0, -0.6, 1.05],
  [-6.4, 0, 4.4, 1.1],
  [-3.8, 0, 5.2, 0.95],
  [-6.8, 0, 9.6, 1.15],
  [-3.2, 0, 9.8, 1.0],
  [-0.8, 0, 12.6, 0.95],
  [2.4, 0, 12.6, 1.0],
  [5.8, 0, 12.4, 1.05],
  [7.8, 0, 9.4, 1.1],
  [7.8, 0, 5.6, 1.0],
  [7.8, 0, 0.8, 1.05],
  [7.8, 0, -5.8, 1.0],
  [-1.6, 0, -2.2, 0.88],
  [1.6, 0, -1.6, 0.9],
  [-1.5, 0, 5.4, 0.88],
  [3.6, 0, 1.6, 0.92],
  [-5.2, 0, -13.2, 1.05],
  [5.2, 0, -13.0, 1.05],
  [-7.6, 0, 2.0, 1.0],
  [-7.6, 0, 7.2, 1.05],
  [-2.8, 0, -7.8, 0.92],
  [2.2, 0, -8.4, 0.92],
  [-3.4, 0, 7.8, 0.95],
  [3.8, 0, -3.5, 0.92],
];

// Instanced Street Lamps along the Main Road sidewalks, South Boulevard, Jogging Track & Bridge (20 in High, 10 in Low)
const ALL_LAMP_POSITIONS: Array<[number, number, number]> = [
  [3.9, 0, 9.2],
  [3.9, 0, 5.6],
  [3.9, 0, 2.0],
  [3.9, 0, -1.6],
  [3.9, 0, -5.2],
  [3.9, 0, -8.6],
  [5.7, 0, 7.4],
  [5.7, 0, 3.8],
  [5.7, 0, 0.2],
  [5.7, 0, -3.4],
  [5.7, 0, -7.0],
  [-3.8, 0, 10.2],
  [-0.8, 0, 10.2],
  [2.2, 0, 10.2],
  [-2.1, 0, 3.8],
  [-2.1, 0, -1.4],
  [2.3, 0, 3.8],
  [2.3, 0, -1.4],
  [-0.9, 0, -9.8],
  [1.3, 0, -9.8],
];

// Instanced Bushes around the park, fountain, pond, and buildings (32 in High, 16 in Low)
const ALL_BUSH_POSITIONS: Array<[number, number, number, number]> = [
  [0.0, 0, 4.1, 0.95],
  [1.7, 0, 4.1, 0.9],
  [0.0, 0, 2.3, 0.9],
  [1.7, 0, 2.3, 0.95],
  [1.8, 0, 6.2, 1.0],
  [3.5, 0, 6.2, 0.9],
  [3.5, 0, 8.4, 0.95],
  [-3.0, 0, 2.5, 1.0],
  [-3.1, 0, -0.5, 0.95],
  [-4.6, 0, 5.8, 1.0],
  [-4.6, 0, 8.2, 0.95],
  [-4.6, 0, 1.2, 1.0],
  [-4.6, 0, 3.6, 0.9],
  [5.8, 0, 4.6, 0.9],
  [5.8, 0, 1.8, 0.95],
  [5.8, 0, -1.8, 0.9],
  [5.8, 0, -4.8, 0.95],
  [-1.2, 0, 0.6, 0.85],
  [1.4, 0, 0.5, 0.85],
  [-1.1, 0, -3.8, 0.9],
  [1.5, 0, -3.8, 0.88],
  [2.2, 0, -5.8, 0.95],
  [3.6, 0, -5.8, 1.0],
  [3.6, 0, -7.8, 0.9],
  [-3.8, 0, 7.2, 0.95],
  [-2.0, 0, 9.2, 1.0],
  [0.8, 0, 9.4, 0.9],
  [3.2, 0, 9.8, 0.95],
  [-3.8, 0, -6.4, 0.95],
  [-1.8, 0, -8.8, 0.88],
  [1.8, 0, -8.8, 0.9],
  [3.6, 0, -9.0, 0.95],
];

const InstancedWorldProps: React.FC<{
  gradientMap: THREE.DataTexture;
  isLowQuality: boolean;
}> = ({ gradientMap, isLowQuality }) => {
  const trees = useMemo(
    () => (isLowQuality ? ALL_TREE_POSITIONS.filter((_, i) => i % 2 === 0) : ALL_TREE_POSITIONS),
    [isLowQuality]
  );
  const lamps = useMemo(
    () => (isLowQuality ? ALL_LAMP_POSITIONS.filter((_, i) => i % 2 === 0) : ALL_LAMP_POSITIONS),
    [isLowQuality]
  );
  const bushes = useMemo(
    () => (isLowQuality ? ALL_BUSH_POSITIONS.filter((_, i) => i % 2 === 0) : ALL_BUSH_POSITIONS),
    [isLowQuality]
  );

  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const crownBottomRef = useRef<THREE.InstancedMesh>(null);
  const crownTopRef = useRef<THREE.InstancedMesh>(null);
  const lampPostRef = useRef<THREE.InstancedMesh>(null);
  const lampBulbRef = useRef<THREE.InstancedMesh>(null);
  const bushRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const dummy = new THREE.Object3D();

    trees.forEach(([x, y, z, scale], i) => {
      dummy.position.set(x, y + 0.32 * scale, z);
      dummy.scale.set(scale, scale, scale);
      dummy.rotation.set(0, i * 0.7, 0);
      dummy.updateMatrix();
      trunkRef.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(x, y + 0.88 * scale, z);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      crownBottomRef.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(x, y + 1.38 * scale, z);
      dummy.scale.set(scale * 0.82, scale * 0.85, scale * 0.82);
      dummy.updateMatrix();
      crownTopRef.current?.setMatrixAt(i, dummy.matrix);
    });

    lamps.forEach(([x, y, z], i) => {
      dummy.position.set(x, y + 0.65, z);
      dummy.scale.set(1, 1, 1);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      lampPostRef.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(x, y + 1.35, z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      lampBulbRef.current?.setMatrixAt(i, dummy.matrix);
    });

    bushes.forEach(([x, y, z, scale], i) => {
      dummy.position.set(x, y + 0.22 * scale, z);
      dummy.scale.set(scale * 1.15, scale * 0.85, scale * 1.15);
      dummy.rotation.set(0, i * 0.5, 0);
      dummy.updateMatrix();
      bushRef.current?.setMatrixAt(i, dummy.matrix);
    });

    if (trunkRef.current) trunkRef.current.instanceMatrix.needsUpdate = true;
    if (crownBottomRef.current) crownBottomRef.current.instanceMatrix.needsUpdate = true;
    if (crownTopRef.current) crownTopRef.current.instanceMatrix.needsUpdate = true;
    if (lampPostRef.current) lampPostRef.current.instanceMatrix.needsUpdate = true;
    if (lampBulbRef.current) lampBulbRef.current.instanceMatrix.needsUpdate = true;
    if (bushRef.current) bushRef.current.instanceMatrix.needsUpdate = true;
  }, [trees, lamps, bushes]);

  return (
    <group>
      {/* Instanced Trees */}
      <instancedMesh ref={trunkRef} args={[undefined, undefined, trees.length]} frustumCulled>
        <cylinderGeometry args={[0.11, 0.15, 0.64, 6]} />
        <meshToonMaterial color="#8c5830" gradientMap={gradientMap} />
      </instancedMesh>
      <instancedMesh ref={crownBottomRef} args={[undefined, undefined, trees.length]} frustumCulled>
        <coneGeometry args={[0.56, 0.92, 7]} />
        <meshToonMaterial color="#1ec98b" gradientMap={gradientMap} />
      </instancedMesh>
      <instancedMesh ref={crownTopRef} args={[undefined, undefined, trees.length]} frustumCulled>
        <coneGeometry args={[0.45, 0.82, 7]} />
        <meshToonMaterial color="#38f8c2" gradientMap={gradientMap} />
      </instancedMesh>

      {/* Instanced Street Lamps */}
      <instancedMesh ref={lampPostRef} args={[undefined, undefined, lamps.length]} frustumCulled>
        <cylinderGeometry args={[0.045, 0.065, 1.3, 6]} />
        <meshToonMaterial color="#1e293b" gradientMap={gradientMap} />
      </instancedMesh>
      <instancedMesh ref={lampBulbRef} args={[undefined, undefined, lamps.length]} frustumCulled>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshBasicMaterial color="#fef08a" />
      </instancedMesh>

      {/* Instanced Bushes */}
      <instancedMesh ref={bushRef} args={[undefined, undefined, bushes.length]} frustumCulled>
        <dodecahedronGeometry args={[0.3, 0]} />
        <meshToonMaterial color="#2be092" gradientMap={gradientMap} />
      </instancedMesh>
    </group>
  );
};

// Swappable procedural low-poly character for Mint
interface MintCharacterMeshProps {
  gradientMap: THREE.DataTexture;
  leftArmRef: React.RefObject<THREE.Group>;
  rightArmRef: React.RefObject<THREE.Group>;
  leftLegRef: React.RefObject<THREE.Group>;
  rightLegRef: React.RefObject<THREE.Group>;
  bodyGroupRef: React.RefObject<THREE.Group>;
}

const MintCharacterMesh: React.FC<MintCharacterMeshProps> = ({
  gradientMap,
  leftArmRef,
  rightArmRef,
  leftLegRef,
  rightLegRef,
  bodyGroupRef,
}) => {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.42, 0.56, 24]} />
        <meshBasicMaterial color="#22f59a" side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.42, 24]} />
        <meshBasicMaterial color="#38f8c2" transparent opacity={0.28} />
      </mesh>

      <group ref={bodyGroupRef}>
        <mesh position={[0, 0.68, 0]}>
          <cylinderGeometry args={[0.17, 0.2, 0.44, 8]} />
          <meshToonMaterial color="#00b8a9" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, 0.68, 0.15]}>
          <boxGeometry args={[0.12, 0.38, 0.07]} />
          <meshToonMaterial color="#ffffff" gradientMap={gradientMap} />
        </mesh>

        <mesh position={[0, 1.08, 0]}>
          <sphereGeometry args={[0.2, 12, 10]} />
          <meshToonMaterial color="#f5bfa0" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, 1.15, -0.02]}>
          <sphereGeometry args={[0.21, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
          <meshToonMaterial color="#4a2c1d" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, 1.13, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.195, 0.028, 6, 16]} />
          <meshToonMaterial color="#38f8c2" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, 1.1, -0.23]} rotation={[0.45, 0, 0]}>
          <coneGeometry args={[0.08, 0.22, 6]} />
          <meshToonMaterial color="#4a2c1d" gradientMap={gradientMap} />
        </mesh>

        <group ref={leftArmRef} position={[-0.22, 0.84, 0]}>
          <mesh position={[0, -0.16, 0]}>
            <cylinderGeometry args={[0.055, 0.05, 0.32, 6]} />
            <meshToonMaterial color="#f5bfa0" gradientMap={gradientMap} />
          </mesh>
        </group>

        <group ref={rightArmRef} position={[0.22, 0.84, 0]}>
          <mesh position={[0, -0.16, 0]}>
            <cylinderGeometry args={[0.055, 0.05, 0.32, 6]} />
            <meshToonMaterial color="#f5bfa0" gradientMap={gradientMap} />
          </mesh>
        </group>

        <group ref={leftLegRef} position={[-0.09, 0.45, 0]}>
          <mesh position={[0, -0.11, 0]}>
            <cylinderGeometry args={[0.078, 0.068, 0.2, 6]} />
            <meshToonMaterial color="#0a878f" gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0, -0.28, 0]}>
            <cylinderGeometry args={[0.055, 0.05, 0.22, 6]} />
            <meshToonMaterial color="#f5bfa0" gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0, -0.4, 0.03]}>
            <boxGeometry args={[0.12, 0.08, 0.2]} />
            <meshToonMaterial color="#00b8a9" gradientMap={gradientMap} />
          </mesh>
        </group>

        <group ref={rightLegRef} position={[0.09, 0.45, 0]}>
          <mesh position={[0, -0.11, 0]}>
            <cylinderGeometry args={[0.078, 0.068, 0.2, 6]} />
            <meshToonMaterial color="#0a878f" gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0, -0.28, 0]}>
            <cylinderGeometry args={[0.055, 0.05, 0.22, 6]} />
            <meshToonMaterial color="#f5bfa0" gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0, -0.4, 0.03]}>
            <boxGeometry args={[0.12, 0.08, 0.2]} />
            <meshToonMaterial color="#00b8a9" gradientMap={gradientMap} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

const IslandScene: React.FC<HomeIsland3DProps & { zoomRef: React.MutableRefObject<number> }> = ({
  places,
  activePlaceId,
  guidedPlaceId = 'raid',
  initialMintWorldPos,
  targetPos,
  qualityPreset = 'high',
  zoomRef,
  onSelectPlace,
  onProximityPlace,
  onGroundTap,
  onRegionChange,
  onRaidGuidanceChange,
  onMintWorldMove,
  onLowFpsFallback,
}) => {
  const gradientMap = useToonGradientMap();

  const mintGroupRef = useRef<THREE.Group>(null);
  const bodyGroupRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const crystieGroupRef = useRef<THREE.Group>(null);
  const walkRingRef = useRef<THREE.Mesh>(null);

  // 3D guide arrow: one small chunky extruded mesh (no extra lights), pointing toward guidedPlaceId
  const guideArrowRef = useRef<THREE.Mesh>(null);
  const guideArrowMatRef = useRef<THREE.MeshToonMaterial>(null);
  const guideArrowColorKey = useRef<string>('');
  const guideArrowGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.78);
    shape.lineTo(0.6, 0.05);
    shape.lineTo(0.22, 0.05);
    shape.lineTo(0.22, -0.62);
    shape.lineTo(-0.22, -0.62);
    shape.lineTo(-0.22, 0.05);
    shape.lineTo(-0.6, 0.05);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.2,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 1,
    });
    // Lay flat on the ground: shape +Y becomes world +Z (forward), extrusion goes up
    geo.rotateX(Math.PI / 2);
    geo.translate(0, 0.25, 0);
    return geo;
  }, []);
  useEffect(() => () => guideArrowGeometry.dispose(), [guideArrowGeometry]);

  // Sector refs for distance-based culling
  const southUrbanGroupRef = useRef<THREE.Group>(null);
  const eastCommercialGroupRef = useRef<THREE.Group>(null);
  const westApartmentsGroupRef = useRef<THREE.Group>(null);
  const northBridgeGroupRef = useRef<THREE.Group>(null);

  const [loadNorthRegion, setLoadNorthRegion] = useState(false);
  const [visibleMarkerIds, setVisibleMarkerIds] = useState<PlaceId[]>([
    'raid',
    'event',
    'water',
    'popular',
  ]);

  const mintPos3D = useRef(
    new THREE.Vector3(
      initialMintWorldPos ? initialMintWorldPos.x : -0.4,
      0,
      initialMintWorldPos ? initialMintWorldPos.z : 3.6
    )
  );
  const lastReportedPos = useRef({
    x: initialMintWorldPos ? initialMintWorldPos.x : -0.4,
    z: initialMintWorldPos ? initialMintWorldPos.z : 3.6,
  });
  const mintAngle = useRef(Math.PI);
  const crystiePos3D = useRef(new THREE.Vector3(0.28, 0.68, 4.0));
  const walkTarget3D = useRef<THREE.Vector3 | null>(null);
  const lastProximityId = useRef<PlaceId | null>(null);
  const lastNorthState = useRef<boolean>(false);
  const lastRaidGuidance = useRef<{
    placeId: PlaceId;
    distMeters: number;
    offScreen: boolean;
    angleDeg: number;
  }>({
    placeId: guidedPlaceId,
    distMeters: -1,
    offScreen: true,
    angleDeg: 0,
  });

  const fpsFrames = useRef(0);
  const fpsLastTime = useRef(performance.now());
  const lowFpsStreak = useRef(0);
  const lowFpsTriggered = useRef(false);
  const portalProjVec = useRef(new THREE.Vector3());

  useEffect(() => {
    const timer = window.setTimeout(() => setLoadNorthRegion(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!targetPos) {
      walkTarget3D.current = null;
      return;
    }
    const clamped = clampToIslandLand(toWorldX(targetPos.xPct), toWorldZ(targetPos.yPx));
    walkTarget3D.current = new THREE.Vector3(clamped.x, 0, clamped.z);
    if (clamped.z < -4) {
      setLoadNorthRegion(true);
    }
  }, [targetPos]);

  useFrame((state, delta) => {
    fpsFrames.current += 1;
    const now = performance.now();
    if (now - fpsLastTime.current >= 500) {
      const currentFps = Math.round((fpsFrames.current * 1000) / (now - fpsLastTime.current));
      (window as any).__raidrunFps = currentFps;
      fpsFrames.current = 0;
      fpsLastTime.current = now;

      // Auto-switch to Low quality if FPS stays below 22 for ~3 seconds after warmup
      if (state.clock.getElapsedTime() > 1.5 && !lowFpsTriggered.current) {
        if (currentFps < 22 || (window as any).__forceLowFpsTest === true) {
          lowFpsStreak.current += 1;
          if (lowFpsStreak.current >= 5) {
            lowFpsTriggered.current = true;
            onLowFpsFallback?.();
          }
        } else {
          lowFpsStreak.current = 0;
        }
      }
    }

    const dt = Math.min(0.05, delta);
    const t = state.clock.getElapsedTime();
    const pos = mintPos3D.current;
    const target = walkTarget3D.current;

    let isWalking = false;

    if (target) {
      const dx = target.x - pos.x;
      const dz = target.z - pos.z;
      const dist = Math.hypot(dx, dz);

      if (dist > 0.12) {
        isWalking = true;
        const walkSpeed = 13.5;
        const step = Math.min(dist, walkSpeed * dt);
        pos.x += (dx / dist) * step;
        pos.z += (dz / dist) * step;

        const desiredAngle = Math.atan2(dx, dz);
        let angleDiff = desiredAngle - mintAngle.current;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        mintAngle.current += angleDiff * Math.min(1, dt * 12);
      } else {
        pos.copy(target);
        walkTarget3D.current = null;
      }
    }

    if (mintGroupRef.current) {
      mintGroupRef.current.position.set(pos.x, 0, pos.z);
      mintGroupRef.current.rotation.y = mintAngle.current;
    }

    if (
      bodyGroupRef.current &&
      leftArmRef.current &&
      rightArmRef.current &&
      leftLegRef.current &&
      rightLegRef.current
    ) {
      if (isWalking) {
        const swing = Math.sin(t * 15) * 0.68;
        bodyGroupRef.current.position.y = Math.abs(Math.sin(t * 15)) * 0.08;
        leftLegRef.current.rotation.x = swing;
        rightLegRef.current.rotation.x = -swing;
        leftArmRef.current.rotation.x = -swing * 0.85;
        rightArmRef.current.rotation.x = swing * 0.85;
      } else {
        bodyGroupRef.current.position.y = Math.sin(t * 3.2) * 0.025;
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, dt * 10);
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, dt * 10);
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, dt * 10);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, dt * 10);
      }
    }

    if (crystieGroupRef.current) {
      const followOffset = new THREE.Vector3(0.68, 0, -0.48).applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        mintAngle.current
      );
      const followLerp = 1 - Math.exp(-4.5 * dt);
      crystiePos3D.current.x = THREE.MathUtils.lerp(
        crystiePos3D.current.x,
        pos.x + followOffset.x,
        followLerp
      );
      crystiePos3D.current.z = THREE.MathUtils.lerp(
        crystiePos3D.current.z,
        pos.z + followOffset.z,
        followLerp
      );
      crystiePos3D.current.y = 0.72 + Math.sin(t * 4.2) * 0.08;

      crystieGroupRef.current.position.copy(crystiePos3D.current);
      crystieGroupRef.current.rotation.y = t * 1.4;
    }

    if (walkRingRef.current) {
      if (walkTarget3D.current) {
        walkRingRef.current.visible = true;
        walkRingRef.current.position.set(walkTarget3D.current.x, 0.05, walkTarget3D.current.z);
        const pulse = 1 + Math.sin(t * 8) * 0.14;
        walkRingRef.current.scale.set(pulse, pulse, 1);
      } else {
        walkRingRef.current.visible = false;
      }
    }

    // Wider three-quarter camera following Mint with easing + limited pinch-to-zoom.
    // Full-screen portrait is taller/narrower than the old card, so widen FOV + pull back a bit with aspect.
    const persp = state.camera as THREE.PerspectiveCamera;
    const aspect = state.size.width / Math.max(1, state.size.height);
    const tall = THREE.MathUtils.clamp((TALL_REF_ASPECT - aspect) / 0.22, 0, 1);
    const targetFov = BASE_FOV + tall * TALL_FOV_BOOST;
    if (Math.abs(persp.fov - targetFov) > 0.01) {
      persp.fov = targetFov;
      persp.updateProjectionMatrix();
    }
    const zoom = THREE.MathUtils.clamp(zoomRef.current, MIN_CAMERA_ZOOM, MAX_CAMERA_ZOOM);
    const camEase = 1 - Math.exp(-5.5 * dt);
    const desiredCamX = THREE.MathUtils.clamp(pos.x * 0.5 + 1.4 * zoom, -5.0, 6.5);
    const desiredCamY = 12.6 * zoom * (1 + tall * TALL_PULLBACK);
    const desiredCamZ = THREE.MathUtils.clamp(
      pos.z + 10.2 * zoom * (1 + tall * TALL_PULLBACK),
      -10.0,
      28.0
    );

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, desiredCamX, camEase);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, desiredCamY, camEase);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, desiredCamZ, camEase);

    state.camera.lookAt(pos.x * 0.45 + 0.25, 0.15, pos.z - 1.4 + tall * TALL_LOOKAT_SHIFT);

    // Distance-based culling of world sectors relative to camera position
    const camPos = state.camera.position;
    const cullRadius = 36 * Math.max(1, zoom);
    if (southUrbanGroupRef.current) {
      southUrbanGroupRef.current.visible = Math.hypot(camPos.x - 2.5, camPos.z - 7.5) < cullRadius;
    }
    if (eastCommercialGroupRef.current) {
      eastCommercialGroupRef.current.visible = Math.hypot(camPos.x - 5.2, camPos.z - 0.0) < cullRadius;
    }
    if (westApartmentsGroupRef.current) {
      westApartmentsGroupRef.current.visible = Math.hypot(camPos.x - -5.2, camPos.z - 3.0) < cullRadius;
    }
    if (northBridgeGroupRef.current) {
      northBridgeGroupRef.current.visible = Math.hypot(camPos.x - 0.0, camPos.z - -10.0) < cullRadius;
    }

    // Cull distant HTML marker pills beyond 30 units OR when they would sit under the floating HUD
    // (top name/weather row, bottom tab bar + raised Deck disc) or too close to the side edges.
    const viewW = Math.max(1, state.size.width);
    const viewH = Math.max(1, state.size.height);
    const ndcTop = 1 - (2 * HUD_TOP_RESERVED_PX) / viewH;
    const ndcBottom = -1 + (2 * HUD_BOTTOM_RESERVED_PX) / viewH;
    const ndcSide = 1 - (2 * HUD_SIDE_RESERVED_PX) / viewW;
    const nextVisibleMarkers: PlaceId[] = [];
    for (const p of places) {
      const [px, pz] = getPlaceWorldCoords(p);
      portalProjVec.current.set(px, 0.42, pz).project(state.camera);
      const inViewBounds =
        portalProjVec.current.z <= 1 &&
        Math.abs(portalProjVec.current.x) <= ndcSide &&
        portalProjVec.current.y <= ndcTop &&
        portalProjVec.current.y >= ndcBottom;
      if (
        inViewBounds &&
        Math.hypot(camPos.x - px, camPos.z - pz) < 33 * Math.max(1, zoom * 0.95)
      ) {
        nextVisibleMarkers.push(p.id);
      }
    }
    if (
      nextVisibleMarkers.length !== visibleMarkerIds.length ||
      nextVisibleMarkers.some((id, idx) => id !== visibleMarkerIds[idx])
    ) {
      setVisibleMarkerIds(nextVisibleMarkers);
    }

    // Live distance & directional arrow toward guidedPlaceId
    const guidedPlace = places.find((p) => p.id === guidedPlaceId) || places[0];
    const [targetX, targetZ] = getPlaceWorldCoords(guidedPlace);
    const rawTargetDist = Math.hypot(targetX - pos.x, targetZ - pos.z);
    const distMeters = Math.max(0, Math.round(Math.max(0, rawTargetDist - 1.15) * 9.5));

    const isOffScreen = !nextVisibleMarkers.includes(guidedPlace.id);
    const angleDeg = Math.round((Math.atan2(targetX - pos.x, -(targetZ - pos.z)) * 180) / Math.PI);

    if (
      Math.hypot(pos.x - lastReportedPos.current.x, pos.z - lastReportedPos.current.z) >= 0.08
    ) {
      lastReportedPos.current = { x: pos.x, z: pos.z };
      onMintWorldMove?.(pos.x, pos.z);
    }

    if (
      guidedPlace.id !== lastRaidGuidance.current.placeId ||
      Math.abs(distMeters - lastRaidGuidance.current.distMeters) >= 1 ||
      isOffScreen !== lastRaidGuidance.current.offScreen ||
      Math.abs(angleDeg - lastRaidGuidance.current.angleDeg) >= 6
    ) {
      lastRaidGuidance.current = {
        placeId: guidedPlace.id,
        distMeters,
        offScreen: isOffScreen,
        angleDeg,
      };
      onRaidGuidanceChange?.({ distMeters, offScreen: isOffScreen, angleDeg });
    }

    // 3D guide arrow: ~1.8 units ahead of Mint, rotates in world space toward the target, hidden on arrival
    const guideArrow = guideArrowRef.current;
    if (guideArrow) {
      const toTargetX = targetX - pos.x;
      const toTargetZ = targetZ - pos.z;
      const toTargetLen = Math.hypot(toTargetX, toTargetZ);
      const arrived = distMeters <= GUIDE_ARRIVAL_RADIUS_METERS || toTargetLen < 0.001;
      guideArrow.visible = !arrived;
      if (!arrived) {
        const ux = toTargetX / toTargetLen;
        const uz = toTargetZ / toTargetLen;
        const bob = Math.sin(t * 4);
        const offset = 1.8 + bob * 0.12;
        guideArrow.position.set(pos.x + ux * offset, 0.08 + (bob * 0.5 + 0.5) * 0.07, pos.z + uz * offset);
        guideArrow.rotation.y = Math.atan2(toTargetX, toTargetZ);
        guideArrow.scale.setScalar(1 + Math.sin(t * 5) * 0.07);
        if (guideArrowColorKey.current !== guidedPlace.id && guideArrowMatRef.current) {
          guideArrowMatRef.current.color.set(guidedPlace.accentColor);
          guideArrowColorKey.current = guidedPlace.id;
        }
      }
    }

    // Proximity check to the 4 places on land (skip intermediate places while actively walking to a chosen place)
    let nearestPlace: PlaceId | null = null;
    let bestDist = Infinity;
    for (const p of places) {
      if (isWalking && activePlaceId && p.id !== activePlaceId) continue;
      const [px, pz] = getPlaceWorldCoords(p);
      const d = Math.hypot(pos.x - px, pos.z - pz);
      if (d <= 2.75 && d < bestDist) {
        bestDist = d;
        nearestPlace = p.id;
      }
    }

    if (!isWalking || nearestPlace === activePlaceId) {
      if (nearestPlace !== lastProximityId.current) {
        lastProximityId.current = nearestPlace;
        onProximityPlace(nearestPlace);
      }
    }

    const isNorth = pos.z < -5.5;
    if (isNorth !== lastNorthState.current) {
      lastNorthState.current = isNorth;
      onRegionChange?.(isNorth);
    }
  });

  const handleGroundPointerUp = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const clamped = clampToIslandLand(e.point.x, e.point.z);
    onGroundTap({
      xPct: Number(toXPct(clamped.x).toFixed(2)),
      yPx: Number(toYPx(clamped.z).toFixed(1)),
    });
  };

  return (
    <group>
      {/* Light Aqua Fog to hide the distant world edge */}
      <fog attach="fog" args={['#a5f3fc', 22, 48]} />

      {/* Bright Mint/Teal Lighting for Banded Toon Shading */}
      <hemisphereLight args={['#e6fffa', '#0a878f', 1.15]} />
      <directionalLight position={[12, 24, 14]} intensity={1.35} color="#fffef5" />

      {/* Stylized Aqua Ocean Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.65, 0]}>
        <planeGeometry args={[150, 150]} />
        <meshBasicMaterial color="#7be3f2" />
      </mesh>

      {/* Stage A 3.5x Larger Low-Poly Island Cliff Base */}
      <mesh position={[0, -0.36, -1.2]} scale={[1, 1, 1.9]} frustumCulled>
        <cylinderGeometry args={[12.4, 11.2, 0.62, 24]} />
        <meshToonMaterial color="#0a878f" gradientMap={gradientMap} />
      </mesh>

      {/* Stage A 3.5x Larger Low-Poly Island Grass Surface (Tappable Ground) */}
      <mesh
        position={[0, -0.05, -1.2]}
        scale={[1, 1, 1.9]}
        onClick={handleGroundPointerUp}
        frustumCulled
      >
        <cylinderGeometry args={[12.2, 12.3, 0.12, 28]} />
        <meshToonMaterial color="#58e08e" gradientMap={gradientMap} />
      </mesh>

      {/* Lush Grass Fields (Central Track Infield, West Lawn, South Meadow) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0.1, 0.018, 0.8]}
        scale={[1, 1.65, 1]}
        onClick={handleGroundPointerUp}
      >
        <circleGeometry args={[2.5, 20]} />
        <meshToonMaterial color="#76f0a3" gradientMap={gradientMap} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-3.8, 0.015, 6.2]}
        onClick={handleGroundPointerUp}
      >
        <circleGeometry args={[2.4, 14]} />
        <meshToonMaterial color="#76f0a3" gradientMap={gradientMap} />
      </mesh>

      {/* JOGGING TRACK LOOP around the central park field */}
      <group position={[0.1, 0.025, 0.8]} scale={[1, 1, 1.65]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} onClick={handleGroundPointerUp}>
          <ringGeometry args={[2.35, 3.25, 32]} />
          <meshToonMaterial color="#f8fafc" gradientMap={gradientMap} side={THREE.DoubleSide} />
        </mesh>
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.005, 0]}
          onClick={handleGroundPointerUp}
        >
          <ringGeometry args={[2.43, 3.17, 32]} />
          <meshToonMaterial color="#f2846b" gradientMap={gradientMap} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[2.78, 2.82, 32]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Winding North Path Spur connecting the Jogging Track Loop across the Bridge to the Raid Plaza */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0.25, 0.024, -11.2]}
        onClick={handleGroundPointerUp}
      >
        <planeGeometry args={[1.8, 13.5]} />
        <meshToonMaterial color="#f7e3c8" gradientMap={gradientMap} />
      </mesh>

      {/* MAIN ROAD WITH SIDEWALKS + GYM & SHOPS (East Avenue & South Boulevard) */}
      <group ref={eastCommercialGroupRef}>
        {/* East Main Road Sidewalk Base */}
        <mesh position={[4.8, 0.03, 0.2]} onClick={handleGroundPointerUp} frustumCulled>
          <boxGeometry args={[2.3, 0.06, 23.0]} />
          <meshToonMaterial color="#e2e8f0" gradientMap={gradientMap} />
        </mesh>
        {/* East Main Road Asphalt */}
        <mesh position={[4.8, 0.045, 0.2]} onClick={handleGroundPointerUp} frustumCulled>
          <boxGeometry args={[1.4, 0.06, 22.6]} />
          <meshToonMaterial color="#334155" gradientMap={gradientMap} />
        </mesh>
        {/* Dashed Road Center Stripes */}
        {[-9, -6, -3, 0, 3, 6, 9].map((rz) => (
          <mesh key={rz} position={[4.8, 0.08, rz]} rotation={[-Math.PI / 2, 0, 0]} frustumCulled>
            <planeGeometry args={[0.12, 1.2]} />
            <meshBasicMaterial color="#f8fafc" />
          </mesh>
        ))}

        {/* South Cross Boulevard Sidewalk + Asphalt Road */}
        <mesh position={[-0.2, 0.03, 11.2]} onClick={handleGroundPointerUp} frustumCulled>
          <boxGeometry args={[14.5, 0.06, 2.2]} />
          <meshToonMaterial color="#e2e8f0" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[-0.2, 0.045, 11.2]} onClick={handleGroundPointerUp} frustumCulled>
          <boxGeometry args={[14.2, 0.06, 1.35]} />
          <meshToonMaterial color="#334155" gradientMap={gradientMap} />
        </mesh>
        {[-5, -2, 1, 4].map((rx) => (
          <mesh key={rx} position={[rx, 0.08, 11.2]} rotation={[-Math.PI / 2, 0, 0]} frustumCulled>
            <planeGeometry args={[1.2, 0.12]} />
            <meshBasicMaterial color="#f8fafc" />
          </mesh>
        ))}

        {/* RAIDRUN FITNESS GYM Building along East Main Road Sidewalk */}
        <group position={[6.7, 0.85, 3.2]}>
          <mesh frustumCulled>
            <boxGeometry args={[1.8, 1.7, 2.3]} />
            <meshToonMaterial color="#0f766e" gradientMap={gradientMap} />
          </mesh>
          <mesh position={[-0.92, -0.08, 0]} frustumCulled>
            <boxGeometry args={[0.06, 1.05, 1.7]} />
            <meshToonMaterial color="#7dd3fc" gradientMap={gradientMap} />
          </mesh>
          <mesh position={[-0.3, 0.98, 0]} frustumCulled>
            <boxGeometry args={[1.2, 0.3, 1.85]} />
            <meshToonMaterial color="#38f8c2" gradientMap={gradientMap} />
          </mesh>
        </group>

        {/* SHOPS ROW along East Main Road Sidewalk */}
        <group position={[6.65, 0.65, -0.8]}>
          <mesh frustumCulled>
            <boxGeometry args={[1.7, 1.3, 1.8]} />
            <meshToonMaterial color="#fffbeb" gradientMap={gradientMap} />
          </mesh>
          <mesh position={[-0.9, 0.22, 0]} rotation={[0, 0, 0.35]} frustumCulled>
            <boxGeometry args={[0.42, 0.14, 1.7]} />
            <meshToonMaterial color="#ff8a2b" gradientMap={gradientMap} />
          </mesh>
        </group>
        <group position={[6.65, 0.65, -3.4]}>
          <mesh frustumCulled>
            <boxGeometry args={[1.7, 1.3, 1.8]} />
            <meshToonMaterial color="#f0fdfa" gradientMap={gradientMap} />
          </mesh>
          <mesh position={[-0.9, 0.22, 0]} rotation={[0, 0, 0.35]} frustumCulled>
            <boxGeometry args={[0.42, 0.14, 1.7]} />
            <meshToonMaterial color="#00b8a9" gradientMap={gradientMap} />
          </mesh>
        </group>
      </group>

      {/* WEST PARKSIDE APARTMENTS */}
      <group ref={westApartmentsGroupRef}>
        <group position={[-5.6, 1.25, 6.8]}>
          <mesh frustumCulled>
            <boxGeometry args={[1.9, 2.5, 1.8]} />
            <meshToonMaterial color="#f8fafc" gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0, 1.35, 0]} frustumCulled>
            <boxGeometry args={[2.05, 0.22, 1.95]} />
            <meshToonMaterial color="#00b8a9" gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0.98, 0.2, 0]} frustumCulled>
            <boxGeometry args={[0.16, 0.18, 1.45]} />
            <meshToonMaterial color="#38f8c2" gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0.98, -0.5, 0]} frustumCulled>
            <boxGeometry args={[0.16, 0.18, 1.45]} />
            <meshToonMaterial color="#38f8c2" gradientMap={gradientMap} />
          </mesh>
        </group>

        <group position={[-5.6, 1.1, -2.2]}>
          <mesh frustumCulled>
            <boxGeometry args={[1.85, 2.2, 1.75]} />
            <meshToonMaterial color="#ecfeff" gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0, 1.2, 0]} frustumCulled>
            <boxGeometry args={[2.0, 0.22, 1.9]} />
            <meshToonMaterial color="#0a878f" gradientMap={gradientMap} />
          </mesh>
        </group>
      </group>

      {/* RIVER, WOODEN BRIDGE & LIVE EVENT PLAZA */}
      <group ref={northBridgeGroupRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, toWorldZ(370)]} frustumCulled>
          <planeGeometry args={[22.4, 1.8]} />
          <meshToonMaterial color="#e9cfb0" gradientMap={gradientMap} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.028, toWorldZ(370)]} frustumCulled>
          <planeGeometry args={[22.2, 1.3]} />
          <meshBasicMaterial color="#2be4f7" />
        </mesh>

        {/* Bridge over the River */}
        <group position={[0.25, 0.11, toWorldZ(370)]}>
          <mesh onClick={handleGroundPointerUp} frustumCulled>
            <boxGeometry args={[2.2, 0.14, 2.1]} />
            <meshToonMaterial color="#d99b66" gradientMap={gradientMap} />
          </mesh>
          <mesh position={[-1.0, 0.28, 0]} frustumCulled>
            <boxGeometry args={[0.14, 0.42, 2.1]} />
            <meshToonMaterial color="#8c5828" gradientMap={gradientMap} />
          </mesh>
          <mesh position={[1.0, 0.28, 0]} frustumCulled>
            <boxGeometry args={[0.14, 0.42, 2.1]} />
            <meshToonMaterial color="#8c5828" gradientMap={gradientMap} />
          </mesh>
        </group>

        {/* 2. LIVE EVENT PLAZA near the Bridge */}
        <group position={[2.25, 0.035, toWorldZ(445)]}>
          <mesh onClick={handleGroundPointerUp} frustumCulled>
            <cylinderGeometry args={[1.5, 1.6, 0.08, 12]} />
            <meshToonMaterial color="#fef3c7" gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0.85, 0.55, -0.4]} frustumCulled>
            <cylinderGeometry args={[0.12, 0.14, 1.0, 8]} />
            <meshToonMaterial color="#ff8a2b" gradientMap={gradientMap} />
          </mesh>
        </group>
      </group>

      {/* 3. WEST POND + WATER STATION */}
      <group position={[-4.2, 0.02, toWorldZ(625)]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} frustumCulled>
          <circleGeometry args={[1.65, 20]} />
          <meshToonMaterial color="#e9cfb0" gradientMap={gradientMap} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]} frustumCulled>
          <circleGeometry args={[1.38, 20]} />
          <meshBasicMaterial color="#2be4f7" />
        </mesh>
      </group>
      <group position={[-2.35, 0.035, toWorldZ(625)]}>
        <mesh onClick={handleGroundPointerUp} frustumCulled>
          <cylinderGeometry args={[1.05, 1.12, 0.07, 10]} />
          <meshToonMaterial color="#e0f2fe" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[-0.5, 0.42, -0.3]} frustumCulled>
          <cylinderGeometry args={[0.22, 0.24, 0.72, 8]} />
          <meshToonMaterial color="#0284c7" gradientMap={gradientMap} />
        </mesh>
      </group>

      {/* 4. CENTRAL PARK FOUNTAIN, CAFE WITH BENCHES & POPULAR SPOT */}
      <group ref={southUrbanGroupRef}>
        {/* Central Park Fountain Plaza */}
        <group position={[0.85, 0.04, 3.2]}>
          <mesh frustumCulled>
            <cylinderGeometry args={[1.05, 1.15, 0.15, 16]} />
            <meshToonMaterial color="#cbd5e1" gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0, 0.085, 0]} rotation={[-Math.PI / 2, 0, 0]} frustumCulled>
            <circleGeometry args={[0.88, 16]} />
            <meshBasicMaterial color="#2be4f7" />
          </mesh>
          <mesh position={[0, 0.32, 0]} frustumCulled>
            <cylinderGeometry args={[0.2, 0.28, 0.5, 10]} />
            <meshToonMaterial color="#e2e8f0" gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0, 0.68, 0]} frustumCulled>
            <coneGeometry args={[0.25, 0.45, 8]} />
            <meshBasicMaterial color="#7be3f2" />
          </mesh>
        </group>

        {/* Cafe Patio, Building & Benches at Popular Spot */}
        <group position={[2.1, 0.035, toWorldZ(760)]}>
          <mesh onClick={handleGroundPointerUp} frustumCulled>
            <boxGeometry args={[2.8, 0.08, 2.4]} />
            <meshToonMaterial color="#fef3c7" gradientMap={gradientMap} />
          </mesh>
          <group position={[0.65, 0.52, -0.55]}>
            <mesh frustumCulled>
              <boxGeometry args={[1.25, 0.9, 0.9]} />
              <meshToonMaterial color="#fff7ed" gradientMap={gradientMap} />
            </mesh>
            <mesh position={[0, 0.55, 0.04]} rotation={[0, Math.PI / 4, 0]} frustumCulled>
              <coneGeometry args={[1.02, 0.52, 4]} />
              <meshToonMaterial color="#00b8a9" gradientMap={gradientMap} />
            </mesh>
            <mesh position={[0, 0.04, 0.46]} frustumCulled>
              <boxGeometry args={[0.64, 0.38, 0.05]} />
              <meshToonMaterial color="#102a43" gradientMap={gradientMap} />
            </mesh>
          </group>

          {/* Benches */}
          <group position={[-0.75, 0.18, -0.45]}>
            <mesh frustumCulled>
              <boxGeometry args={[0.68, 0.09, 0.28]} />
              <meshToonMaterial color="#d97706" gradientMap={gradientMap} />
            </mesh>
            <mesh position={[0, 0.13, -0.1]} frustumCulled>
              <boxGeometry args={[0.68, 0.16, 0.06]} />
              <meshToonMaterial color="#b45309" gradientMap={gradientMap} />
            </mesh>
          </group>
          <group position={[0.65, 0.18, 0.65]}>
            <mesh frustumCulled>
              <boxGeometry args={[0.68, 0.09, 0.28]} />
              <meshToonMaterial color="#d97706" gradientMap={gradientMap} />
            </mesh>
            <mesh position={[0, 0.13, 0.1]} frustumCulled>
              <boxGeometry args={[0.68, 0.16, 0.06]} />
              <meshToonMaterial color="#b45309" gradientMap={gradientMap} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Lazy-Loaded Distant Northern Region (Raid Plaza, Northern Towers & Pines) */}
      {loadNorthRegion && (
        <Suspense fallback={null}>
          <LazyDistantNorthRegion
            gradientMap={gradientMap}
            raidPlazaPos={[0.3, toWorldZ(215)]}
            onGroundTap={handleGroundPointerUp}
          />
        </Suspense>
      )}

      {/* Instanced Repeated World Props (Trees, Street Lamps, Bushes) */}
      <InstancedWorldProps
        gradientMap={gradientMap}
        isLowQuality={qualityPreset === 'low'}
      />

      {/* Ground Walk Target Ring */}
      <mesh ref={walkRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} visible={false}>
        <ringGeometry args={[0.3, 0.45, 20]} />
        <meshBasicMaterial color="#00b8a9" side={THREE.DoubleSide} />
      </mesh>

      {/* Four Places on LAND: Small Glowing Ground Marker + Name Pill (Distance-Culled) */}
      {places.map((place) => {
        const [px, pz] = getPlaceWorldCoords(place);
        const isSelected = activePlaceId === place.id;
        const isMarkerVisible = visibleMarkerIds.includes(place.id);

        return (
          <group key={place.id} position={[px, 0.06, pz]} visible={isMarkerVisible}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.45, 0.68, 22]} />
              <meshBasicMaterial color={place.accentColor} side={THREE.DoubleSide} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
              <circleGeometry args={[0.45, 22]} />
              <meshBasicMaterial color={place.accentColor} transparent opacity={0.34} />
            </mesh>

            {isMarkerVisible && (
              <Html
                position={[px > 1.5 ? -0.55 : 0, 0.42, 0]}
                center
                zIndexRange={[5, 0]}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPlace(place.id, {
                      xPct: Number(toXPct(px - 0.35).toFixed(1)),
                      yPx: Number(toYPx(pz + 0.85).toFixed(1)),
                    });
                  }}
                  className="touch-target"
                  aria-label={`${place.name} ground marker`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 10px 5px 6px',
                    minHeight: 44,
                    minWidth: 44,
                    borderRadius: 'var(--radius-pill)',
                    background: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.95)',
                    border: `2px solid ${place.accentColor}`,
                    boxShadow: isSelected
                      ? `0 0 0 4px ${place.accentColor}33, 0 8px 18px rgba(16, 42, 67, 0.22)`
                      : '0 5px 14px rgba(16, 42, 67, 0.18)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: place.accentColor,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {place.id === 'raid' && <Flame size={13} fill="#ffffff" />}
                    {place.id === 'event' && <Calendar size={13} />}
                    {place.id === 'water' && <Droplets size={13} fill="#ffffff" />}
                    {place.id === 'popular' && <Flame size={13} fill="#ffffff" />}
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 900,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {place.shortPill}
                  </span>
                </button>
              </Html>
            )}
          </group>
        );
      })}

      {/* 3D Guide Arrow: single small mesh, rendered last with depth cleared so nothing occludes it */}
      <mesh
        ref={guideArrowRef}
        geometry={guideArrowGeometry}
        visible={false}
        renderOrder={999}
        frustumCulled={false}
        onBeforeRender={(renderer) => renderer.clearDepth()}
      >
        <meshToonMaterial
          ref={guideArrowMatRef}
          color="#ff3b9a"
          transparent
          opacity={1}
          gradientMap={gradientMap}
          fog={false}
        />
      </mesh>

      {/* Mint Character */}
      <group ref={mintGroupRef} position={[-0.4, 0, 3.6]}>
        <MintCharacterMesh
          gradientMap={gradientMap}
          leftArmRef={leftArmRef}
          rightArmRef={rightArmRef}
          leftLegRef={leftLegRef}
          rightLegRef={rightLegRef}
          bodyGroupRef={bodyGroupRef}
        />
      </group>

      {/* Crystie Companion */}
      <group ref={crystieGroupRef} position={[0.28, 0.68, 4.0]}>
        <mesh>
          <octahedronGeometry args={[0.24, 0]} />
          <meshToonMaterial color="#72f6d0" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[-0.18, 0.08, 0]} rotation={[0, 0, 0.4]}>
          <coneGeometry args={[0.1, 0.24, 5]} />
          <meshToonMaterial color="#38f8c2" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0.18, 0.08, 0]} rotation={[0, 0, -0.4]}>
          <coneGeometry args={[0.1, 0.24, 5]} />
          <meshToonMaterial color="#38f8c2" gradientMap={gradientMap} />
        </mesh>
      </group>
    </group>
  );
};

export const HomeIsland3D: React.FC<HomeIsland3DProps> = (props) => {
  const zoomRef = useRef<number>(props.zoomFactor ?? 1.15);
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef<number>(1.15);

  useEffect(() => {
    if (typeof props.zoomFactor === 'number') {
      zoomRef.current = THREE.MathUtils.clamp(
        props.zoomFactor,
        MIN_CAMERA_ZOOM,
        MAX_CAMERA_ZOOM
      );
    }
  }, [props.zoomFactor]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartDistRef.current = Math.hypot(dx, dy);
      pinchStartZoomRef.current = zoomRef.current;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && pinchStartDistRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (dist > 8) {
        const scale = pinchStartDistRef.current / dist;
        zoomRef.current = THREE.MathUtils.clamp(
          pinchStartZoomRef.current * scale,
          MIN_CAMERA_ZOOM,
          MAX_CAMERA_ZOOM
        );
      }
    }
  };

  const handleTouchEnd = () => {
    pinchStartDistRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const nextZoom = zoomRef.current + e.deltaY * 0.0014;
    zoomRef.current = THREE.MathUtils.clamp(nextZoom, MIN_CAMERA_ZOOM, MAX_CAMERA_ZOOM);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        touchAction: 'none',
      }}
    >
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [1.4, 14.5, 15.3], fov: 52, near: 0.1, far: 120 }}
        onCreated={({ gl }) => {
          gl.setClearColor('#a5f3fc', 1);
          const canvasEl = gl.domElement;
          canvasEl.addEventListener('webglcontextlost', (ev) => {
            ev.preventDefault();
            props.onContextError?.();
          });
        }}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <IslandScene {...props} zoomRef={zoomRef} />
      </Canvas>
    </div>
  );
};

export default HomeIsland3D;
