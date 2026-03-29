import { useRef, Suspense, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { CelestialBody } from '../types';
import { TextureErrorBoundary } from './TextureErrorBoundary';

interface Props {
  body: CelestialBody;
  onClick?: (body: CelestialBody) => void;
  timeScale: number;
  isPaused: boolean;
}

// Componente que asume que la textura existe y la carga síncronamente (vía Suspense)
const TexturedMaterial = memo(function TexturedMaterial({ body }: { body: CelestialBody }) {
  const texture = useTexture(body.texturePath!);
  texture.colorSpace = THREE.SRGBColorSpace;
  
  // Condicionalmente carga el anillo si existe
  const ringTexturePath = body.ringTexturePath || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; // transparent 1x1 base64 as fallback
  const ringTexture = useTexture(ringTexturePath);
  
  if (body.ringTexturePath) {
      ringTexture.colorSpace = THREE.SRGBColorSpace;
  }

  const isStar = body.type === 'star';

  return (
    <>
      <mesh>
        <sphereGeometry args={[body.radius, 64, 64]} />
        {isStar ? (
          <meshBasicMaterial map={texture} color="#ffffff" />
        ) : (
          <meshPhysicalMaterial 
            map={texture}
            color="#ffffff"
            roughness={0.8}
            metalness={0.1}
            emissive={body.color}
            emissiveIntensity={0.05}
          />
        )}
      </mesh>

      {body.hasRings ? (
        <mesh rotation={[-Math.PI / 2.2, 0, 0]}>
          <ringGeometry args={[body.radius * 1.4, body.radius * 2.4, 128]} />
          <meshStandardMaterial 
            map={body.ringTexturePath ? ringTexture : undefined}
            color={body.ringTexturePath ? "#ffffff" : body.color} 
            side={THREE.DoubleSide} 
            transparent 
            opacity={0.6} 
          />
        </mesh>
      ) : null}
    </>
  );
});

// Componente de respaldo por si falla la textura o no tiene
const PlainMaterial = memo(function PlainMaterial({ body }: { body: CelestialBody }) {
  const isStar = body.type === 'star';
  return (
    <>
      <mesh>
        <sphereGeometry args={[body.radius, 32, 32]} />
        {isStar ? (
          <meshBasicMaterial color={body.color} />
        ) : (
          <meshStandardMaterial 
            color={body.color}
            roughness={0.7}
            metalness={0.1}
            emissive={body.color}
            emissiveIntensity={0.2}
          />
        )}
      </mesh>
      {body.hasRings ? (
        <mesh rotation={[-Math.PI / 2.2, 0, 0]}>
          <ringGeometry args={[body.radius * 1.5, body.radius * 2.5, 64]} />
          <meshStandardMaterial color={body.color} side={THREE.DoubleSide} transparent opacity={0.5} />
        </mesh>
      ) : null}
    </>
  );
});

export const PlanetMesh = memo(function PlanetMesh({ body, onClick, timeScale, isPaused }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.position.set(body.position.x, body.position.y, body.position.z);
      
      if (!isPaused) {
        // Rotación axial (simplificada, proporcional al tiempo)
        groupRef.current.rotation.y += delta * 10 * timeScale;
      }
    }
  });

  const handlePointerClick = (e: any) => {
    e.stopPropagation();
    onClick?.(body);
  };

  return (
    <group 
      ref={groupRef}
      onClick={handlePointerClick}
    >
      {body.texturePath ? (
        <TextureErrorBoundary fallback={<PlainMaterial body={body} />}>
          <Suspense fallback={<PlainMaterial body={body} />}>
            <TexturedMaterial body={body} />
          </Suspense>
        </TextureErrorBoundary>
      ) : (
        <PlainMaterial body={body} />
      )}
    </group>
  );
});
