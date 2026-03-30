import * as THREE from 'three';
import { CelestialBody } from '../../types';

export const G = 10;
export const SOFTENING = 0.5;

export const INITIAL_BODIES: CelestialBody[] = [];

const SUN_MASS = 1000000;

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
