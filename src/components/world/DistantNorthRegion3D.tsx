import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface DistantNorthRegionProps {
  gradientMap: THREE.DataTexture;
  raidPlazaPos: [number, number];
  onGroundTap: (e: any) => void;
}

const NORTH_TREES: Array<[number, number, number, number]> = [
  [-8.5, 0, -14.5, 1.1],
  [-6.2, 0, -17.8, 1.0],
  [-4.4, 0, -21.0, 1.15],
  [4.8, 0, -20.8, 1.1],
  [6.8, 0, -17.5, 1.0],
  [8.8, 0, -14.2, 1.05],
  [-2.2, 0, -22.2, 0.95],
  [2.6, 0, -22.0, 1.0],
];

export const DistantNorthRegion3D: React.FC<DistantNorthRegionProps> = ({
  gradientMap,
  raidPlazaPos,
  onGroundTap,
}) => {
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const foliageRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const dummy = new THREE.Object3D();
    NORTH_TREES.forEach(([x, y, z, s], i) => {
      dummy.position.set(x, y + 0.35 * s, z);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      trunkRef.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(x, y + 1.05 * s, z);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      foliageRef.current?.setMatrixAt(i, dummy.matrix);
    });
    if (trunkRef.current) trunkRef.current.instanceMatrix.needsUpdate = true;
    if (foliageRef.current) foliageRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  const [rx, rz] = raidPlazaPos;

  return (
    <group name="distant-north-region">
      {/* Northern Stone Raid Plaza (across the river bridge) */}
      <group position={[rx, 0.04, rz]}>
        <mesh onClick={onGroundTap} frustumCulled>
          <cylinderGeometry args={[2.8, 3.0, 0.14, 16]} />
          <meshToonMaterial color="#cbd5e1" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, 0.08, 0]} onClick={onGroundTap} frustumCulled>
          <cylinderGeometry args={[2.0, 2.15, 0.08, 16]} />
          <meshToonMaterial color="#e2e8f0" gradientMap={gradientMap} />
        </mesh>
        {/* Glowing Raid Portal Ring & Crystal Obelisks */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.14, 0]} frustumCulled>
          <ringGeometry args={[1.35, 1.62, 24]} />
          <meshBasicMaterial color="#ff3b9a" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-1.65, 0.72, -0.5]} frustumCulled>
          <octahedronGeometry args={[0.42, 0]} />
          <meshToonMaterial color="#ff3b9a" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[1.65, 0.72, -0.5]} frustumCulled>
          <octahedronGeometry args={[0.42, 0]} />
          <meshToonMaterial color="#ff3b9a" gradientMap={gradientMap} />
        </mesh>
      </group>

      {/* North-West & North-East Low-Poly Apartment Towers overlooking the Raid Plaza */}
      <group position={[-7.2, 1.3, -19.2]}>
        <mesh frustumCulled>
          <boxGeometry args={[2.4, 2.6, 1.8]} />
          <meshToonMaterial color="#e0f2fe" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, 1.4, 0]} frustumCulled>
          <boxGeometry args={[2.55, 0.22, 1.95]} />
          <meshToonMaterial color="#0a878f" gradientMap={gradientMap} />
        </mesh>
      </group>

      <group position={[7.4, 1.45, -18.8]}>
        <mesh frustumCulled>
          <boxGeometry args={[2.4, 2.9, 1.8]} />
          <meshToonMaterial color="#f0fdf4" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, 1.55, 0]} frustumCulled>
          <boxGeometry args={[2.55, 0.22, 1.95]} />
          <meshToonMaterial color="#00b8a9" gradientMap={gradientMap} />
        </mesh>
      </group>

      {/* Instanced Northern Pines */}
      <instancedMesh ref={trunkRef} args={[undefined, undefined, NORTH_TREES.length]} frustumCulled>
        <cylinderGeometry args={[0.12, 0.16, 0.7, 6]} />
        <meshToonMaterial color="#8c5830" gradientMap={gradientMap} />
      </instancedMesh>
      <instancedMesh ref={foliageRef} args={[undefined, undefined, NORTH_TREES.length]} frustumCulled>
        <coneGeometry args={[0.68, 1.35, 7]} />
        <meshToonMaterial color="#1ec98b" gradientMap={gradientMap} />
      </instancedMesh>
    </group>
  );
};

export default DistantNorthRegion3D;
