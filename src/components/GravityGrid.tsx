import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CelestialBody } from '../types';

interface Props {
  bodies: CelestialBody[];
}

const VERTEX_SHADER = `
  uniform float uTime;
  uniform vec3 uBodyPositions[20];
  uniform float uBodyMasses[20];
  uniform int uBodyCount;
  
  varying float vDisplacement;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 newPosition = position;
    float totalDisplacement = 0.0;

    for (int i = 0; i < 20; i++) {
      if (i >= uBodyCount) break;
      
      vec3 bodyPos = uBodyPositions[i];
      float mass = uBodyMasses[i];
      
      // Calculate distance in XZ plane
      float dist = distance(vec2(position.x, position.y), vec2(bodyPos.x, -bodyPos.z));
      
      // Enhanced gravitational pull: logarithmic falloff creates steep wells that don't spread too far
      // We scale the mass influence so smaller planets are still visible without the Sun consuming everything
      float pullFactor = mass > 500000.0 ? 0.01 : 0.8; 
      float displacement = (mass * pullFactor) / (pow(dist, 1.4) + 1.0);
      
      // Allow deep wells for stars, shallower for planets
      float maxDepth = mass > 500000.0 ? 45.0 : 15.0;
      totalDisplacement += min(displacement, maxDepth);
    }

    newPosition.z -= totalDisplacement;
    vDisplacement = totalDisplacement;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  varying float vDisplacement;
  varying vec2 vUv;

  void main() {
    // Grid line effect
    float grid = sin(vUv.x * 100.0) * sin(vUv.y * 100.0);
    grid = step(0.98, grid);

    // Deep space blue to bright cyan core
    vec3 baseColor = vec3(0.0, 0.1, 0.4); 
    vec3 glowColor = vec3(0.0, 0.6, 1.0); 
    
    // Smooth transition based on depth
    float depthFactor = clamp(vDisplacement / 20.0, 0.0, 1.0);
    vec3 color = mix(baseColor, glowColor, depthFactor);
    
    // Add glowing grid lines
    color += grid * 0.4;

    gl_FragColor = vec4(color, 0.4 + (depthFactor * 0.4));
  }
`;

export function GravityGrid({ bodies }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uBodyPositions: { value: new Array(20).fill(new THREE.Vector3()) },
    uBodyMasses: { value: new Array(20).fill(0) },
    uBodyCount: { value: 0 }
  }), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const shaderMaterial = meshRef.current.material as THREE.ShaderMaterial;
    shaderMaterial.uniforms.uTime.value = state.clock.getElapsedTime();
    
    // Send only the heaviest bodies or first 20 to the shader for performance
    const activeBodies = bodies
      .filter(b => b.isAlive)
      .sort((a, b) => b.mass - a.mass)
      .slice(0, 20);

    const positions = new Array(20).fill(new THREE.Vector3());
    const masses = new Array(20).fill(0);

    activeBodies.forEach((body, i) => {
      positions[i] = body.position;
      masses[i] = body.mass;
    });

    shaderMaterial.uniforms.uBodyPositions.value = positions;
    shaderMaterial.uniforms.uBodyMasses.value = masses;
    shaderMaterial.uniforms.uBodyCount.value = activeBodies.length;
  });

  return (
    <mesh 
      ref={meshRef} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -2, 0]} // Brought much closer to the orbital plane
    >
      <planeGeometry args={[650, 650, 128, 128]} />
      <shaderMaterial
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent={true}
        wireframe={false} // Solid mesh with drawn grid lines looks better
        depthWrite={false}
      />
    </mesh>
  );
}
