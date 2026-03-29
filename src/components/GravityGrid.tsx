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
      
      float dist = distance(vec2(position.x, position.y), vec2(bodyPos.x, -bodyPos.z));
      
      // RESTAURADO: Falloff suave (+5.0) y exponente 1.8 para pozos orgánicos
      float isSun = mass > 500000.0 ? 1.0 : 0.0;
      float pullFactor = mix(3.0, 0.1, isSun); 
      
      float displacement = (mass * pullFactor) / (pow(dist, 1.8) + 5.0);
      
      totalDisplacement += displacement;
    }

    // Limitamos el desplazamiento total de forma suave
    totalDisplacement = min(totalDisplacement, 150.0);

    newPosition.z -= totalDisplacement;
    vDisplacement = totalDisplacement;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    gl_PointSize = 1.5; // Puntos más pequeños y elegantes
  }
`;

const FRAGMENT_SHADER = `
  varying float vDisplacement;
  varying vec2 vUv;

  void main() {
    // REJILLA DE LÍNEAS FINAS: Dibujamos líneas continuas en lugar de puntos
    float lineX = step(0.99, sin(vUv.x * 80.0));
    float lineY = step(0.99, sin(vUv.y * 80.0));
    float gridLines = max(lineX, lineY);

    // Colores originales azul/cian
    vec3 baseColor = vec3(0.0, 0.05, 0.3); 
    vec3 glowColor = vec3(0.0, 0.7, 1.0); 
    
    float depthFactor = clamp(vDisplacement / 30.0, 0.0, 1.0);
    vec3 color = mix(baseColor, glowColor, depthFactor);
    
    // Añadir líneas de rejilla sutiles
    color += gridLines * 0.2;

    gl_FragColor = vec4(color, 0.3 + (depthFactor * 0.3));
  }
`;

export function GravityGrid({ bodies }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uBodyPositions: { value: new Array(20).fill(new THREE.Vector3()) },
    uBodyMasses: { value: new Array(20).fill(0) },
    uBodyCount: { value: 0 }
  }), []);

  useFrame((state) => {
    if (!meshRef.current || !pointsRef.current) return;
    
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.uTime.value = state.clock.getElapsedTime();
    
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

    mat.uniforms.uBodyPositions.value = positions;
    mat.uniforms.uBodyMasses.value = masses;
    mat.uniforms.uBodyCount.value = activeBodies.length;
    
    (pointsRef.current.material as THREE.ShaderMaterial).uniforms = mat.uniforms;
  });

  // Resolución aumentada para una rejilla más densa y suave
  const geometry = useMemo(() => new THREE.PlaneGeometry(650, 650, 200, 200), []);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      {/* El tejido (malla con líneas) */}
      <mesh ref={meshRef} geometry={geometry}>
        <shaderMaterial
          vertexShader={VERTEX_SHADER}
          fragmentShader={FRAGMENT_SHADER}
          uniforms={uniforms}
          transparent={true}
          wireframe={false}
          depthWrite={false}
        />
      </mesh>
      
      {/* Las partículas (estrellas de la rejilla) */}
      <points ref={pointsRef} geometry={geometry}>
        <shaderMaterial
          vertexShader={VERTEX_SHADER}
          fragmentShader={FRAGMENT_SHADER}
          uniforms={uniforms}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
