import * as THREE from 'three';
import { CelestialBody } from '../../types';

export const G = 10;
export const SOFTENING = 0.5;

export const AU_TO_SIM = 55;
export const SUN_MASS = 1000000;

export interface OrbitalElements {
  a: number; // Semi-major axis (AU)
  e: number; // Eccentricity
  L: number; // Mean Longitude (degrees)
  p: number; // Longitude of perihelion (degrees)
  i: number; // Inclination (degrees)
}

export const J2000_PLANETS: Record<string, OrbitalElements> = {
  mercury: { a: 0.387098, e: 0.205630, L: 252.25084, p: 77.45779, i: 7.00559 },
  venus: { a: 0.723332, e: 0.006773, L: 181.97906, p: 131.53298, i: 3.39471 },
  earth: { a: 1.000000, e: 0.016710, L: 100.46435, p: 102.94719, i: 0.00005 },
  mars: { a: 1.523662, e: 0.093412, L: 355.45332, p: 336.04084, i: 1.85061 },
  jupiter: { a: 5.203363, e: 0.048393, L: 34.40438, p: 14.75385, i: 1.30530 },
  saturn: { a: 9.537070, e: 0.054151, L: 49.94432, p: 92.43194, i: 2.48446 },
  uranus: { a: 19.19126, e: 0.047168, L: 313.23218, p: 170.96424, i: 0.76986 },
  neptune: { a: 30.06896, e: 0.008586, L: 304.88003, p: 44.97135, i: 1.76917 },
};

export const INITIAL_BODIES: CelestialBody[] = [];

function createPlanet(
  name: string,
  mass: number,
  distance: number,
  radius: number,
  color: string,
  rotationPeriod: number, // in Earth Days
  hasRings = false
): CelestialBody {
  // v = sqrt(G * M_sun / r)
  const velocityMag = Math.sqrt((G * SUN_MASS) / distance);
  
  const textureMap: Record<string, string> = {
    'mercury': 'https://raw.githubusercontent.com/khushi-1907/SolarSystem/master/textures/mercury.jpg',
    'venus': 'https://raw.githubusercontent.com/khushi-1907/SolarSystem/master/textures/venus.jpg',
    'earth': 'https://raw.githubusercontent.com/khushi-1907/SolarSystem/master/textures/earth.jpg',
    'mars': 'https://raw.githubusercontent.com/khushi-1907/SolarSystem/master/textures/mars.jpg',
    'jupiter': 'https://raw.githubusercontent.com/khushi-1907/SolarSystem/master/textures/jupiter.jpg',
    'saturn': 'https://raw.githubusercontent.com/khushi-1907/SolarSystem/master/textures/saturn.jpg',
    'uranus': 'https://raw.githubusercontent.com/khushi-1907/SolarSystem/master/textures/uranus.jpg',
    'neptune': 'https://raw.githubusercontent.com/khushi-1907/SolarSystem/master/textures/neptune.jpg',
  };

  return {
    id: name.toLowerCase(),
    name,
    position: new THREE.Vector3(distance, 0, 0),
    velocity: new THREE.Vector3(0, 0, -velocityMag),
    mass,
    radius,
    type: 'planet',
    density: mass / (Math.PI * 4/3 * Math.pow(radius, 3)),
    color,
    isAlive: true,
    hasRings,
    texturePath: textureMap[name.toLowerCase()],
    ringTexturePath: undefined,
    rotationPeriod
  };
}

INITIAL_BODIES.push({
  id: 'sun',
  name: 'Sun',
  position: new THREE.Vector3(0, 0, 0),
  velocity: new THREE.Vector3(0, 0, 0),
  mass: SUN_MASS,
  radius: 8,
  type: 'star',
  density: SUN_MASS / (Math.PI * 4/3 * Math.pow(8, 3)),
  color: '#FDB813',
  isAlive: true,
  texturePath: 'https://raw.githubusercontent.com/khushi-1907/SolarSystem/master/textures/sun.jpg',
  rotationPeriod: 27 // Average rotation period of the Sun in days
});

// Sidereal rotation periods in Earth Days
INITIAL_BODIES.push(createPlanet('Mercury', 0.055, 22, 0.8, '#B5B5B5', 58.6));
INITIAL_BODIES.push(createPlanet('Venus', 0.815, 38, 1.4, '#E8CDa2', -243)); // Retrograde
INITIAL_BODIES.push(createPlanet('Earth', 1.0, 55, 1.5, '#2E86AB', 1.0));
INITIAL_BODIES.push(createPlanet('Mars', 0.107, 75, 1.0, '#C1440E', 1.03));
INITIAL_BODIES.push(createPlanet('Jupiter', 317.8, 130, 5.0, '#C88B3A', 0.41));
INITIAL_BODIES.push(createPlanet('Saturn', 95.2, 180, 4.2, '#E4D191', 0.45, true));
INITIAL_BODIES.push(createPlanet('Uranus', 14.5, 230, 2.5, '#B2EEF4', -0.72)); // Retrograde
INITIAL_BODIES.push(createPlanet('Neptune', 17.1, 275, 2.4, '#3F54BA', 0.67));
