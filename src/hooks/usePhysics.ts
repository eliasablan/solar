import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { CelestialBody } from '../types';
import { INITIAL_BODIES } from '../lib/physics/constants';
import { computeAccelerations, stepSimulation, getPlanetaryState } from '../lib/physics/engine';

export function usePhysics() {
  const [bodies, setBodies] = useState<CelestialBody[]>(() => {
    const now = new Date();
    return INITIAL_BODIES.map(b => {
      if (b.type === 'planet') {
        const { position, velocity } = getPlanetaryState(b.name, now);
        return {
          ...b,
          position,
          velocity
        };
      }
      return {
        ...b,
        position: b.position.clone(),
        velocity: b.velocity.clone()
      };
    });
  });
  
  const [explosions, setExplosions] = useState<{ id: string, position: THREE.Vector3, time: number }[]>([]);
  // 1 Earth Year = 0.8104 sim seconds. Default to 1 Month/sec.
  const [timeScale, setTimeScale] = useState<number>(0.0675);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  
  const bodiesRef = useRef<CelestialBody[]>(bodies);
  const accelerationsRef = useRef<THREE.Vector3[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const requestRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const historyRef = useRef<{ bodies: CelestialBody[], simTime: number }[]>([]);
  const futureRef = useRef<{ bodies: CelestialBody[], simTime: number }[]>([]);
  const lastSnapshotTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    accelerationsRef.current = computeAccelerations(bodiesRef.current);
  }, []);

  const updateSimulation = (time: number) => {
    const deltaTimeMs = time - lastFrameTimeRef.current;
    lastFrameTimeRef.current = time;

    if (!isPaused) {
      // Snapshot logic: take a snapshot every 100ms (approx 6 frames at 60fps)
      const now = performance.now();
      if (now - lastSnapshotTimeRef.current >= 100) {
        lastSnapshotTimeRef.current = now;
        historyRef.current.push({
          bodies: bodiesRef.current.map(b => ({
            ...b,
            position: b.position.clone(),
            velocity: b.velocity.clone()
          })),
          simTime: timeRef.current
        });
        
        if (historyRef.current.length > 600) {
          historyRef.current.shift();
        }
        
        // If we resumed from a rewind, clear future history
        if (futureRef.current.length > 0) {
          futureRef.current = [];
        }
      }

      const maxDt = 1 / 30;
      const dt = Math.min(deltaTimeMs / 1000, maxDt) * timeScale;
      
      const numSteps = Math.ceil(Math.abs(timeScale) / 0.1) || 1;
      const subDt = dt / numSteps;

      if (subDt !== 0) {
        let currentBodies = bodiesRef.current;
        let currentAccels = accelerationsRef.current;
        let newExplosions: THREE.Vector3[] = [];

        for (let s = 0; s < numSteps; s++) {
          const result = stepSimulation(currentBodies, subDt, currentAccels);
          currentBodies = result.newBodies;
          currentAccels = result.newAccelerations;
          newExplosions = newExplosions.concat(result.explosions);
        }

        // Garbage collection: remove asteroids/debris that fly too far (e.g., > 2000 units)
        const MAX_DIST_SQ = 2000 * 2000;
        const validBodies: CelestialBody[] = [];
        let bodyCountChanged = false;

        for (let i = 0; i < currentBodies.length; i++) {
          const b = currentBodies[i];
          if (b.type === 'star' || b.type === 'planet' || b.position.lengthSq() < MAX_DIST_SQ) {
            validBodies.push(b);
          } else {
            bodyCountChanged = true;
          }
        }
        
        if (bodyCountChanged) {
          currentBodies = validBodies;
          currentAccels = computeAccelerations(currentBodies);
        }

        bodiesRef.current = currentBodies;
        accelerationsRef.current = currentAccels;
        timeRef.current += dt;

        // Combine map and cloning in one pass
        const updatedBodies = new Array(currentBodies.length);
        for (let i = 0; i < currentBodies.length; i++) {
          const b = currentBodies[i];
          updatedBodies[i] = { ...b, position: b.position.clone() };
        }
        setBodies(updatedBodies);
        
        if (newExplosions.length > 0) {
          const now = Date.now();
          const mappedExplosions = newExplosions.map((pos, i) => ({ id: `exp_${now}_${i}`, position: pos, time: now }));
          setExplosions(prev => [...prev, ...mappedExplosions].filter(e => now - e.time < 500));
        }
      }
    }

    requestRef.current = requestAnimationFrame(updateSimulation);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateSimulation);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPaused, timeScale]);

  const addBody = (body: CelestialBody) => {
    const newBodies = [...bodiesRef.current, body];
    bodiesRef.current = newBodies;
    accelerationsRef.current = computeAccelerations(newBodies);
    setBodies([...newBodies]);
  };

  const stepBack = () => {
    if (historyRef.current.length === 0) return;
    
    // Save current to future before jumping back
    futureRef.current.push({
      bodies: bodiesRef.current.map(b => ({
        ...b,
        position: b.position.clone(),
        velocity: b.velocity.clone()
      })),
      simTime: timeRef.current
    });
    
    const snapshot = historyRef.current.pop()!;
    bodiesRef.current = snapshot.bodies;
    timeRef.current = snapshot.simTime;
    accelerationsRef.current = computeAccelerations(snapshot.bodies);
    
    // Update state to trigger re-render
    setBodies(snapshot.bodies.map(b => ({ ...b, position: b.position.clone() })));
  };

  const stepForward = () => {
    if (futureRef.current.length === 0) return;
    
    // Save current to history before jumping forward
    historyRef.current.push({
      bodies: bodiesRef.current.map(b => ({
        ...b,
        position: b.position.clone(),
        velocity: b.velocity.clone()
      })),
      simTime: timeRef.current
    });
    
    const snapshot = futureRef.current.pop()!;
    bodiesRef.current = snapshot.bodies;
    timeRef.current = snapshot.simTime;
    accelerationsRef.current = computeAccelerations(snapshot.bodies);
    
    // Update state to trigger re-render
    setBodies(snapshot.bodies.map(b => ({ ...b, position: b.position.clone() })));
  };

  return {
    bodies,
    explosions,
    isPaused,
    setIsPaused,
    timeScale,
    setTimeScale,
    simTime: timeRef.current,
    addBody,
    stepBack,
    stepForward
  };
}
