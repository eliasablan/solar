import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { CelestialBody } from '../types';
import { INITIAL_BODIES } from '../lib/physics/constants';
import { computeAccelerations, stepSimulation } from '../lib/physics/engine';

export function usePhysics() {
  const [bodies, setBodies] = useState<CelestialBody[]>(() => 
    INITIAL_BODIES.map(b => ({
      ...b,
      position: b.position.clone(),
      velocity: b.velocity.clone()
    }))
  );
  
  const [explosions, setExplosions] = useState<{ id: string, position: THREE.Vector3, time: number }[]>([]);
  // 1 Earth Year = 0.8104 sim seconds. Default to 1 Month/sec.
  const [timeScale, setTimeScale] = useState<number>(0.0675);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  
  const bodiesRef = useRef<CelestialBody[]>(bodies);
  const accelerationsRef = useRef<THREE.Vector3[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const requestRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    accelerationsRef.current = computeAccelerations(bodiesRef.current);
  }, []);

  const updateSimulation = (time: number) => {
    const deltaTimeMs = time - lastFrameTimeRef.current;
    lastFrameTimeRef.current = time;

    if (!isPaused) {
      const maxDt = 1 / 30;
      const dt = Math.min(deltaTimeMs / 1000, maxDt) * timeScale;
      
      const numSteps = Math.ceil(timeScale / 0.1) || 1;
      const subDt = dt / numSteps;

      if (subDt > 0) {
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
        const validBodies = currentBodies.filter(b => 
          b.type === 'star' || b.type === 'planet' || b.position.lengthSq() < MAX_DIST_SQ
        );
        
        if (validBodies.length !== currentBodies.length) {
          currentBodies = validBodies;
          currentAccels = computeAccelerations(currentBodies);
        }

        bodiesRef.current = currentBodies;
        accelerationsRef.current = currentAccels;
        timeRef.current += dt;

        setBodies(currentBodies.map(b => ({...b, position: b.position.clone()})));
        
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

  return {
    bodies,
    explosions,
    isPaused,
    setIsPaused,
    timeScale,
    setTimeScale,
    simTime: timeRef.current,
    addBody
  };
}
