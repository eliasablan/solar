import * as THREE from 'three';
import { CelestialBody } from '../../types';
import { G, SOFTENING, J2000_PLANETS, AU_TO_SIM, SUN_MASS } from './constants';
import { handleCollisions } from './collisions';

export function getPlanetaryState(name: string, date: Date): { position: THREE.Vector3, velocity: THREE.Vector3 } {
  const elements = J2000_PLANETS[name.toLowerCase()];
  if (!elements) {
    return { position: new THREE.Vector3(), velocity: new THREE.Vector3() };
  }

  const { a, e, L, p } = elements;
  
  // 1. Days since J2000.0 (January 1, 2000, 12:00 UTC)
  const J2000 = new Date('2000-01-01T12:00:00Z').getTime();
  const d = (date.getTime() - J2000) / (1000 * 60 * 60 * 24);

  // 2. Mean daily motion n (deg/day)
  // P = 365.25 * a^1.5
  // n = 360 / P
  const n = 0.9856076686 / Math.pow(a, 1.5);

  // 3. Mean Longitude l = L + n * d
  let l = (L + n * d) % 360;
  if (l < 0) l += 360;

  // 4. Mean Anomaly M = l - p
  let M = (l - p) % 360;
  if (M < 0) M += 360;
  const M_rad = (M * Math.PI) / 180;

  // 5. Solve Kepler's Equation M = E - e * sin(E)
  let E = M_rad;
  for (let i = 0; i < 5; i++) {
    E = E - (E - e * Math.sin(E) - M_rad) / (1 - e * Math.cos(E));
  }

  // 6. Coordinates in orbital plane (perihelion at +X)
  const x_plane = a * (Math.cos(E) - e);
  const z_plane = a * Math.sqrt(1 - e * e) * Math.sin(E);

  // 7. Rotate by longitude of perihelion p
  const p_rad = (p * Math.PI) / 180;
  const cosP = Math.cos(p_rad);
  const sinP = Math.sin(p_rad);

  const x_ecl = x_plane * cosP - z_plane * sinP;
  const z_ecl = x_plane * sinP + z_plane * cosP;

  // 8. Velocity in orbital plane
  const mu = SUN_MASS * G;
  // v_mag_sq = mu * (2/r - 1/a)
  // v_vec = sqrt(mu / (a * (1 - e*cosE))) * [-sinE, sqrt(1-e^2)*cosE]
  const v_factor = Math.sqrt(mu / (a * AU_TO_SIM)) / (1 - e * Math.cos(E));
  const vx_plane = -v_factor * Math.sin(E);
  const vz_plane = v_factor * Math.sqrt(1 - e * e) * Math.cos(E);

  // Rotate velocity
  const vx_ecl = vx_plane * cosP - vz_plane * sinP;
  const vz_ecl = vx_plane * sinP + vz_plane * cosP;

  // 9. Match simulation convention: Flip Z
  return {
    position: new THREE.Vector3(x_ecl * AU_TO_SIM, 0, -z_ecl * AU_TO_SIM),
    velocity: new THREE.Vector3(vx_ecl, 0, -vz_ecl)
  };
}

export function computeAccelerations(bodies: CelestialBody[]): THREE.Vector3[] {
  const accelerations = bodies.map(() => new THREE.Vector3(0, 0, 0));

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const b1 = bodies[i];
      const b2 = bodies[j];

      const diff = new THREE.Vector3().subVectors(b2.position, b1.position);
      const distSq = diff.lengthSq();
      
      const r_softSq = distSq + SOFTENING * SOFTENING;
      const r_soft = Math.sqrt(r_softSq);

      const f = G / (r_softSq * r_soft); // Force magnitude without masses

      const a1 = diff.clone().multiplyScalar(f * b2.mass);
      const a2 = diff.clone().multiplyScalar(-f * b1.mass);

      accelerations[i].add(a1);
      accelerations[j].add(a2);
    }
  }

  return accelerations;
}

export function stepSimulation(
  bodies: CelestialBody[],
  dt: number,
  accelerations: THREE.Vector3[]
): { newBodies: CelestialBody[], newAccelerations: THREE.Vector3[], explosions: THREE.Vector3[] } {
  // Pre-map planets/stars for debris targeting
  const planetsById = new Map<string, CelestialBody>();
  for (const b of bodies) {
    if (b.type === 'planet' || b.type === 'star') {
      planetsById.set(b.id, b);
    }
  }

  // 1. Update positions
  for (let i = 0; i < bodies.length; i++) {
    const b = bodies[i];
    const a = accelerations[i];

    // Apply spiral-in forces for debris
    if (b.targetPlanetId && b.isAlive) {
      const target = planetsById.get(b.targetPlanetId);
      if (target) {
        const diff = new THREE.Vector3().subVectors(target.position, b.position);
        const dist = diff.length();

        if (dist <= target.radius) {
          // Absorption!
          target.mass += b.mass;
          target.radius = Math.cbrt((3 * target.mass) / (4 * Math.PI * target.density));
          b.isAlive = false;
        } else {
          // Tangential Spiral Drag + Inward Pull
          const relVel = b.velocity.clone().sub(target.velocity);
          const dir = diff.clone().normalize();
          const radialVel = dir.clone().multiplyScalar(relVel.dot(dir));
          const tangentialVel = relVel.clone().sub(radialVel);
          
          // Drag tangential velocity and add inward pull to ensure surface contact in ~1-3s
          const drag = tangentialVel.clone().multiplyScalar(-1.2 * dt);
          const pull = dir.clone().multiplyScalar(dist * 0.7 * dt);
          b.velocity.add(drag).add(pull);
        }
      }
    }
    
    // p += v*dt + 0.5*a*dt^2
    const deltaP = b.velocity.clone().multiplyScalar(dt).add(a.clone().multiplyScalar(0.5 * dt * dt));
    b.position.add(deltaP);
  }

  // 2. Compute new accelerations
  const newAccelerations = computeAccelerations(bodies);

  // 3. Update velocities
  for (let i = 0; i < bodies.length; i++) {
    const b = bodies[i];
    const a_old = accelerations[i];
    const a_new = newAccelerations[i];
    
    // v += 0.5 * (a_old + a_new) * dt
    const deltaV = a_old.clone().add(a_new).multiplyScalar(0.5 * dt);
    b.velocity.add(deltaV);
  }

  // 4. Handle collisions (filter out bodies absorbed during step)
  const { newBodies, explosions } = handleCollisions(bodies.filter(b => b.isAlive));

  // If there were collisions, accelerations array might be mismatched to newBodies length.
  // We'll recompute if the length changed, else return the new ones.
  let finalAccelerations = newAccelerations;
  if (newBodies.length !== bodies.length) {
    finalAccelerations = computeAccelerations(newBodies);
  }

  return { newBodies, newAccelerations: finalAccelerations, explosions };
}

// Function to compute a future path (e.g., trajectory preview)
export function computeTrajectory(
  body: CelestialBody,
  otherBodies: CelestialBody[],
  steps: number,
  dt: number
): THREE.Vector3[] {
  const simBody = { ...body, position: body.position.clone(), velocity: body.velocity.clone() };
  const trajectory: THREE.Vector3[] = [];
  
  for (let s = 0; s < steps; s++) {
    trajectory.push(simBody.position.clone());

    let a = new THREE.Vector3(0, 0, 0);
    for (const b2 of otherBodies) {
      const diff = new THREE.Vector3().subVectors(b2.position, simBody.position);
      const distSq = diff.lengthSq();
      const r_softSq = distSq + SOFTENING * SOFTENING;
      const r_soft = Math.sqrt(r_softSq);
      const f = G / (r_softSq * r_soft);
      a.add(diff.multiplyScalar(f * b2.mass));
    }
    
    simBody.velocity.add(a.clone().multiplyScalar(dt));
    simBody.position.add(simBody.velocity.clone().multiplyScalar(dt));
  }
  
  return trajectory;
}
