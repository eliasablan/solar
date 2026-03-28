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
    ringTexturePath: undefined
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
  texturePath: 'https://raw.githubusercontent.com/khushi-1907/SolarSystem/master/textures/sun.jpg'
});

INITIAL_BODIES.push(createPlanet('Mercury', 0.055, 22, 0.8, '#B5B5B5'));
INITIAL_BODIES.push(createPlanet('Venus', 0.815, 38, 1.4, '#E8CDa2'));
INITIAL_BODIES.push(createPlanet('Earth', 1.0, 55, 1.5, '#2E86AB'));
INITIAL_BODIES.push(createPlanet('Mars', 0.107, 75, 1.0, '#C1440E'));
INITIAL_BODIES.push(createPlanet('Jupiter', 317.8, 130, 5.0, '#C88B3A'));
INITIAL_BODIES.push(createPlanet('Saturn', 95.2, 180, 4.2, '#E4D191', true));
INITIAL_BODIES.push(createPlanet('Uranus', 14.5, 230, 2.5, '#B2EEF4'));
INITIAL_BODIES.push(createPlanet('Neptune', 17.1, 275, 2.4, '#3F54BA'));
