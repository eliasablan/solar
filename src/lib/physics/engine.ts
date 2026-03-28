import * as THREE from 'three';
import { CelestialBody } from '../../types';
import { G, SOFTENING } from './constants';
import { handleCollisions } from './collisions';

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
  // 1. Update positions
  for (let i = 0; i < bodies.length; i++) {
    const b = bodies[i];
    const a = accelerations[i];
    
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

  // 4. Handle collisions
  const { newBodies, explosions } = handleCollisions(bodies);

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
