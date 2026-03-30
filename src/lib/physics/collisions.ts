import * as THREE from 'three';
import { CelestialBody } from '../../types';

export function handleCollisions(bodies: CelestialBody[]): { newBodies: CelestialBody[], explosions: THREE.Vector3[] } {
  const toRemove = new Set<string>();
  const toAdd: CelestialBody[] = [];
  const explosions: THREE.Vector3[] = [];

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const b1 = bodies[i];
      const b2 = bodies[j];

      if (!b1.isAlive || !b2.isAlive) continue;

      const distSq = b1.position.distanceToSquared(b2.position);
      const radiusSum = b1.radius + b2.radius;

      if (distSq < radiusSum * radiusSum) {
        // Collision!
        const isPlanetOrStar1 = b1.type === 'star' || b1.type === 'planet';
        const isPlanetOrStar2 = b2.type === 'star' || b2.type === 'planet';

        const impactVel = b1.velocity.clone().sub(b2.velocity).length();
        const PlanetStrengthThreshold = 20;

        explosions.push(b1.position.clone().lerp(b2.position, 0.5));

        if (isPlanetOrStar1 && !isPlanetOrStar2) {
          if (b2.type === 'asteroid' && (b2.density * impactVel) > PlanetStrengthThreshold) {
            // Fragment the asteroid
            const numFragments = Math.floor(Math.random() * 11) + 10; // 10-20
            const impactPoint = b1.position.clone().lerp(b2.position, b1.radius / (b1.radius + b2.radius));
            for (let k = 0; k < numFragments; k++) {
              const fMass = (b2.mass / numFragments) * (0.5 + Math.random());
              const fDensity = b2.density;
              const fRadius = Math.cbrt((3 * fMass) / (4 * Math.PI * fDensity));
              const kickDir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
              const kickMag = impactVel * (0.1 + Math.random() * 0.2);
              const fVel = b2.velocity.clone().add(kickDir.multiplyScalar(kickMag));
              toAdd.push({
                id: `debris_${Date.now()}_${Math.random()}`,
                name: 'Debris Fragment',
                position: impactPoint.clone().add(new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).multiplyScalar(b2.radius * 2)),
                velocity: fVel,
                mass: fMass,
                radius: fRadius,
                type: 'debris',
                density: fDensity,
                color: b2.color,
                isAlive: true,
                targetPlanetId: b1.id,
                rotationPeriod: 0.1 + Math.random() * 0.5
              });
            }
          } else {
            b1.mass += b2.mass; // absorb
            b1.radius = Math.cbrt((3 * b1.mass) / (4 * Math.PI * b1.density));
          }
          b2.isAlive = false;
          toRemove.add(b2.id);
        } else if (!isPlanetOrStar1 && isPlanetOrStar2) {
          if (b1.type === 'asteroid' && (b1.density * impactVel) > PlanetStrengthThreshold) {
            // Fragment the asteroid
            const numFragments = Math.floor(Math.random() * 11) + 10; // 10-20
            const impactPoint = b2.position.clone().lerp(b1.position, b2.radius / (b2.radius + b1.radius));
            for (let k = 0; k < numFragments; k++) {
              const fMass = (b1.mass / numFragments) * (0.5 + Math.random());
              const fDensity = b1.density;
              const fRadius = Math.cbrt((3 * fMass) / (4 * Math.PI * fDensity));
              const kickDir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
              const kickMag = impactVel * (0.1 + Math.random() * 0.2);
              const fVel = b1.velocity.clone().add(kickDir.multiplyScalar(kickMag));
              toAdd.push({
                id: `debris_${Date.now()}_${Math.random()}`,
                name: 'Debris Fragment',
                position: impactPoint.clone().add(new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).multiplyScalar(b1.radius * 2)),
                velocity: fVel,
                mass: fMass,
                radius: fRadius,
                type: 'debris',
                density: fDensity,
                color: b1.color,
                isAlive: true,
                targetPlanetId: b2.id,
                rotationPeriod: 0.1 + Math.random() * 0.5
              });
            }
          } else {
            b2.mass += b1.mass; // absorb
            b2.radius = Math.cbrt((3 * b2.mass) / (4 * Math.PI * b2.density));
          }
          b1.isAlive = false;
          toRemove.add(b1.id);
        } else if (isPlanetOrStar1 && isPlanetOrStar2) {
          // Two planets/stars collide. Absorb smaller into larger for simplicity.
          if (b1.mass > b2.mass) {
            b1.mass += b2.mass;
            b1.radius = Math.cbrt((3 * b1.mass) / (4 * Math.PI * b1.density));
            b2.isAlive = false;
            toRemove.add(b2.id);
          } else {
            b2.mass += b1.mass;
            b2.radius = Math.cbrt((3 * b2.mass) / (4 * Math.PI * b2.density));
            b1.isAlive = false;
            toRemove.add(b1.id);
          }
        } else {
          // Asteroid/debris vs Asteroid/debris
          b1.isAlive = false;
          b2.isAlive = false;
          toRemove.add(b1.id);
          toRemove.add(b2.id);

          const combinedMass = b1.mass + b2.mass;
          // Calculate center of mass velocity
          const comVel = b1.velocity.clone().multiplyScalar(b1.mass).add(b2.velocity.clone().multiplyScalar(b2.mass)).divideScalar(combinedMass);
          
          const minRadiusThreshold = 0.1;
          if (b1.radius > minRadiusThreshold || b2.radius > minRadiusThreshold) {
            const numFragments = Math.floor(Math.random() * 6) + 3; // 3 to 8
            
            // Impact velocity magnitude
            const impactVel = b1.velocity.clone().sub(b2.velocity).length();

            for (let k = 0; k < numFragments; k++) {
              const fMass = (combinedMass / numFragments) * (0.5 + Math.random());
              const fDensity = (b1.density + b2.density) / 2;
              const fRadius = Math.cbrt((3 * fMass) / (4 * Math.PI * fDensity));

              // Random radial kick
              const kickDir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
              const kickMag = impactVel * (0.2 + Math.random() * 0.2); // 20-40%
              
              const fVel = comVel.clone().add(kickDir.multiplyScalar(kickMag));
              
              toAdd.push({
                id: `debris_${Date.now()}_${Math.random()}`,
                name: 'Debris',
                position: b1.position.clone().lerp(b2.position, 0.5).add(new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).multiplyScalar(radiusSum * 0.5)),
                velocity: fVel,
                mass: fMass,
                radius: fRadius,
                type: 'debris',
                density: fDensity,
                color: Math.random() > 0.5 ? b1.color : b2.color,
                isAlive: true,
                rotationPeriod: 0.1 + Math.random() * 0.5 // Fast chaotic rotation for fragments
              });
            }
          }
        }
      }
    }
  }

  return {
    newBodies: bodies.filter(b => !toRemove.has(b.id)).concat(toAdd),
    explosions
  };
}
