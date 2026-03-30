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
  uniform float uBodyRadii[20];
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
      float radius = uBodyRadii[i];
      
      float dist = distance(vec2(position.x, position.y), vec2(bodyPos.x, -bodyPos.z));
      
      float isSun = mass > 500000.0 ? 1.0 : 0.0;
      
      // MATEMÁTICA DE GRAVEDAD BALANCEADA:
      // Sigma (ancho) proporcional al radio pero con un mínimo para evitar puntas afiladas.
      float sigma = max(radius * 1.8, 4.0);
      
      // Intensidad con escala potencial pura para mantener la jerarquía real:
      // Sun (1M) ≈ 100 | Jupiter (317) ≈ 15 | Earth (1) ≈ 3 | Mercury (0.05) ≈ 1.2
      // Esta fórmula asegura que NUNCA un planeta tenga más gravedad visual que el Sol.
      float intensity = pow(mass + 1.0, 0.3) * 1.6;
      
      float displacement = intensity * exp(-0.5 * pow(dist / sigma, 2.0));
      
      totalDisplacement += displacement;
    }

    newPosition.z -= totalDisplacement;
    vDisplacement = totalDisplacement;
    
    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Puntos visibles pero sutiles
    gl_PointSize = (1.2 + (totalDisplacement * 0.05)) * (300.0 / -mvPosition.z);
  }
`;

const FRAGMENT_SHADER = `
  varying float vDisplacement;
  varying vec2 vUv;

  void main() {
    // Líneas más finas y frecuentes para dar detalle
    float lineX = step(0.997, sin(vUv.x * 200.0));
    float lineY = step(0.997, sin(vUv.y * 200.0));
    float gridLines = max(lineX, lineY);

    vec3 baseColor = vec3(0.01, 0.1, 0.4); 
    vec3 glowColor = vec3(0.0, 0.8, 1.0); 
    
    // Factor de profundidad ajustado para ver mejor los planetas
    float depthFactor = clamp(vDisplacement / 25.0, 0.0, 1.0);
    vec3 color = mix(baseColor, glowColor, depthFactor);
    
    color += gridLines * 0.4;

    gl_FragColor = vec4(color, 0.25 + (depthFactor * 0.45));
  }
`;

const POINTS_FRAGMENT_SHADER = `
  varying float vDisplacement;

  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;

    vec3 pointColor = vec3(0.2, 0.9, 1.0);
    // Brillo base más alto para que se vean los puntos de la grilla plana
    float alpha = (1.0 - dist * 2.0) * (0.15 + clamp(vDisplacement / 15.0, 0.0, 0.8));
    
    gl_FragColor = vec4(pointColor, alpha);
  }
`;

export function GravityGrid({ bodies }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uBodyPositions: { value: new Array(20).fill(new THREE.Vector3()) },
    uBodyMasses: { value: new Array(20).fill(0) },
    uBodyRadii: { value: new Array(20).fill(0) },
    uBodyCount: { value: 0 }
  }), []);

  const pointsUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uBodyPositions: { value: new Array(20).fill(new THREE.Vector3()) },
    uBodyMasses: { value: new Array(20).fill(0) },
    uBodyRadii: { value: new Array(20).fill(0) },
    uBodyCount: { value: 0 }
  }), []);

  useFrame((state) => {
    if (!meshRef.current || !pointsRef.current) return;
    
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    const pMat = pointsRef.current.material as THREE.ShaderMaterial;
    const time = state.clock.getElapsedTime();
    
    mat.uniforms.uTime.value = time;
    pMat.uniforms.uTime.value = time;
    
    const activeBodies = bodies
      .filter(b => b.isAlive)
      .sort((a, b) => b.mass - a.mass)
      .slice(0, 20);

    const positions = new Array(20).fill(new THREE.Vector3());
    const masses = new Array(20).fill(0);
    const radii = new Array(20).fill(0);

    activeBodies.forEach((body, i) => {
      positions[i] = body.position;
      masses[i] = body.mass;
      radii[i] = body.radius;
    });

    [mat, pMat].forEach(m => {
      m.uniforms.uBodyPositions.value = positions;
      m.uniforms.uBodyMasses.value = masses;
      m.uniforms.uBodyRadii.value = radii;
      m.uniforms.uBodyCount.value = activeBodies.length;
    });
  });

  // Aumentamos la resolución a 500x500 para una superficie mucho más suave
  const geometry = useMemo(() => new THREE.PlaneGeometry(4000, 4000, 500, 500), []);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
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
      
      <points ref={pointsRef} geometry={geometry}>
        <shaderMaterial
          vertexShader={VERTEX_SHADER}
          fragmentShader={POINTS_FRAGMENT_SHADER}
          uniforms={pointsUniforms}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
