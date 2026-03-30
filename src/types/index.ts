import * as THREE from 'three';

export interface CelestialBody {
  id: string;
  name: string;
  position: THREE.Vector3;    // scene units
  velocity: THREE.Vector3;    // units/second
  mass: number;               // simulation mass units
  radius: number;             // scene units (for collision detection)
  type: 'star' | 'planet' | 'asteroid' | 'debris';
  density: number;            // g/cm³ (affects visual scale relative to mass)
  color: string;
  isAlive: boolean;
  targetPlanetId?: string;
  texturePath?: string;
  ringTexturePath?: string;
  hasRings?: boolean;
  rotationPeriod: number; // Period in Earth Days
}
