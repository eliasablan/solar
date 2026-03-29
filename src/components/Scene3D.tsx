import { useEffect, useRef, memo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { CelestialBody } from '../types';
import { PlanetMesh } from './PlanetMesh';
import { AsteroidMesh } from './AsteroidMesh';
import { ExplosionEffect } from './ExplosionEffect';
import { TrajectoryLine } from './TrajectoryLine';
import { GravityGrid } from './GravityGrid';
import { computeTrajectory } from '../lib/physics/engine';

interface Props {
  bodies: CelestialBody[];
  explosions: { id: string, position: THREE.Vector3, time: number }[];
  selectedBody: CelestialBody | null;
  onSelectBody: (body: CelestialBody | null) => void;
  isAiming: boolean;
  launchOrigin: THREE.Vector3 | null;
  launchVelocity: THREE.Vector3;
  setLaunchOrigin: (pos: THREE.Vector3) => void;
  cameraMode: 'free' | 'follow' | 'top';
  timeScale: number;
  isPaused: boolean;
}

export const Scene3D = memo(function Scene3D({
  bodies,
  explosions,
  selectedBody,
  onSelectBody,
  isAiming,
  launchOrigin,
  launchVelocity,
  setLaunchOrigin,
  cameraMode,
  timeScale,
  isPaused
}: Props) {
  const { camera, scene, pointer, raycaster } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (cameraMode === 'top') {
      camera.position.set(0, 400, 0);
      camera.lookAt(0, 0, 0);
      camera.up.set(0, 0, -1);
      if (controlsRef.current) controlsRef.current.target.set(0, 0, 0);
    } else if (cameraMode === 'free' && !selectedBody) {
      camera.position.set(0, 150, 300);
      camera.lookAt(0, 0, 0);
      if (controlsRef.current) controlsRef.current.target.set(0, 0, 0);
    }
  }, [cameraMode, camera, selectedBody]);

  useFrame(() => {
    if (cameraMode === 'follow' && selectedBody) {
      const body = bodies.find(b => b.id === selectedBody.id);
      if (body && controlsRef.current) {
        controlsRef.current.target.copy(body.position);
      }
    }
  });

  const handlePointerDown = (e: any) => {
    if (isAiming) {
      // Create a plane at Y=0 to intersect with
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      raycaster.setFromCamera(pointer, camera);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      if (intersection) {
        setLaunchOrigin(intersection);
      }
    } else {
      // Clicked on empty space
      if (e.object === scene) {
        onSelectBody(null);
      }
    }
  };

  // Trajectory preview
  const trajectoryPoints = (isAiming && launchOrigin) ? computeTrajectory({
    id: 'preview',
    name: 'Preview',
    position: launchOrigin,
    velocity: launchVelocity,
    mass: 1,
    radius: 1,
    type: 'asteroid',
    density: 3,
    color: '#ffffff',
    isAlive: true
  }, bodies, 200, 1 / 30) : [];

  const minZoomDist = selectedBody ? selectedBody.radius * 2.5 : 10;

  return (
    <>
      <OrbitControls 
        ref={controlsRef} 
        makeDefault 
        enableDamping 
        dampingFactor={0.05} 
        minDistance={minZoomDist}
        maxDistance={4000}
      />
      
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 0, 0]} intensity={5000} distance={2000} decay={1.5} color="#FDB813" />
      
      <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <GravityGrid bodies={bodies} />

      <mesh visible={isAiming} onPointerDown={handlePointerDown}>
        <planeGeometry args={[2000, 2000]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {bodies.map(body => (
        (body.type === 'star' || body.type === 'planet') ? (
          <PlanetMesh 
            key={body.id} 
            body={body} 
            onClick={onSelectBody} 
            timeScale={timeScale} 
            isPaused={isPaused} 
          />
        ) : (
          <AsteroidMesh key={body.id} body={body} onClick={onSelectBody} />
        )
      ))}

      {explosions.map(exp => (
        <ExplosionEffect key={exp.id} position={exp.position} timeCreated={exp.time} />
      ))}

      {isAiming && launchOrigin ? (
        <mesh position={launchOrigin}>
          <sphereGeometry args={[2, 16, 16]} />
          <meshBasicMaterial color="#ffffff" wireframe />
        </mesh>
      ) : null}

      {trajectoryPoints.length > 0 ? (
        <TrajectoryLine points={trajectoryPoints} color="#00ff00" />
      ) : null}
    </>
  );
});
