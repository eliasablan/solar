import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CelestialBody } from '../types';

interface Props {
  body: CelestialBody;
  onClick?: (body: CelestialBody) => void;
}

export function AsteroidMesh({ body, onClick }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.copy(body.position);
    }
  });

  const geometry = useMemo(() => new THREE.DodecahedronGeometry(body.radius, 0), [body.radius]);
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: body.color,
    roughness: 0.9,
    emissive: body.type === 'debris' ? body.color : '#000000',
    emissiveIntensity: body.type === 'debris' ? 0.2 : 0
  }), [body.color, body.type]);

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(body);
      }}
    />
  );
}
