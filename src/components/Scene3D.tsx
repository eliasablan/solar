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
  const isResetting = useRef(false);
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const minZoomDist = selectedBody ? selectedBody.radius * 2.5 : 10;

  useEffect(() => {
    if (cameraMode === 'top') {
      camera.position.set(0, 400, 0);
      camera.lookAt(0, 0, 0);
      camera.up.set(0, 0, -1);
      if (controlsRef.current) controlsRef.current.target.set(0, 0, 0);
    } else if (cameraMode === 'free' && !selectedBody) {
      isResetting.current = true;
    }
  }, [cameraMode, camera, selectedBody]);

  useFrame((state, delta) => {
    if (cameraMode === 'follow' && selectedBody) {
      const body = bodies.find(b => b.id === selectedBody.id);
      if (body && controlsRef.current) {
        controlsRef.current.target.copy(body.position);
      }
    } else if (isResetting.current && cameraMode === 'free' && !selectedBody) {
      const targetPos = new THREE.Vector3(0, 150, 300);
      const targetLookAt = new THREE.Vector3(0, 0, 0);
      const targetUp = new THREE.Vector3(0, 1, 0);
      
      // Smoothly move camera
      camera.position.lerp(targetPos, 5 * delta);
      camera.up.lerp(targetUp, 5 * delta);
      
      // Smoothly move controls target
      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLookAt, 5 * delta);
      }

      // Stop resetting when close enough
      if (camera.position.distanceTo(targetPos) < 0.1 && 
          controlsRef.current?.target.distanceTo(targetLookAt) < 0.1) {
        isResetting.current = false;
        camera.position.copy(targetPos);
        camera.up.copy(targetUp);
        if (controlsRef.current) {
          controlsRef.current.target.copy(targetLookAt);
          controlsRef.current.update();
        }
      }
    }

    // Keyboard controls (WASD + QE + RF + IO)
    const isControlMode = cameraMode === 'free' || cameraMode === 'follow';
    if (isControlMode && !isResetting.current) {
      const keys = keysPressed.current;
      const panSpeed = 50; // units per second
      const rotateSpeed = 1.5; // radians per second
      const zoomSpeed = 1.5; // 150% per second for much faster zoom

      // Pan (WASD) - Only in Free mode, or switch to Free if used in Follow
      if (keys['w'] || keys['s'] || keys['a'] || keys['d']) {
        if (cameraMode === 'follow') {
          onSelectBody(null);
        } else {
          const panVector = new THREE.Vector3();
          const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
          const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
          
          if (keys['w']) panVector.add(up);
          if (keys['s']) panVector.sub(up);
          if (keys['a']) panVector.sub(right);
          if (keys['d']) panVector.add(right);
          
          if (panVector.lengthSq() > 0) {
            panVector.normalize().multiplyScalar(panSpeed * delta);
            camera.position.add(panVector);
            if (controlsRef.current) {
              controlsRef.current.target.add(panVector);
              controlsRef.current.update();
            }
          }
        }
      }

      // Rotate Yaw (QE) and Pitch (RF) around the target
      if (keys['q'] || keys['e'] || keys['r'] || keys['f']) {
        const target = controlsRef.current?.target || new THREE.Vector3(0, 0, 0);
        let relPos = camera.position.clone().sub(target);
        
        // Yaw (Y-axis)
        if (keys['q'] || keys['e']) {
          const yawAngle = rotateSpeed * delta * (keys['q'] ? 1 : -1);
          relPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), yawAngle);
        }
        
        // Pitch (Local X-axis)
        if (keys['r'] || keys['f']) {
          const pitchAngle = rotateSpeed * delta * (keys['r'] ? 1 : -1);
          const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
          relPos.applyAxisAngle(right, pitchAngle);
        }
        
        camera.position.copy(target).add(relPos);
        
        if (controlsRef.current) {
          controlsRef.current.update();
        }
      }

      // Zoom (IO)
      if (keys['i'] || keys['o']) {
        const camDir = new THREE.Vector3();
        camera.getWorldDirection(camDir);
        const target = controlsRef.current?.target || new THREE.Vector3(0, 0, 0);
        const distance = camera.position.distanceTo(target);
        
        // Base zoom on distance so it feels natural, but with a minimum step
        const zoomAmount = Math.max(distance, 10) * zoomSpeed * delta;
        
        if (keys['i'] && distance > minZoomDist + zoomAmount) {
          camera.position.addScaledVector(camDir, zoomAmount);
          if (controlsRef.current) controlsRef.current.update();
        }
        if (keys['o']) {
          camera.position.addScaledVector(camDir, -zoomAmount);
          if (controlsRef.current) controlsRef.current.update();
        }
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
    isAlive: true,
    rotationPeriod: 1.0
  }, bodies, 200, 1 / 30) : [];

  return (
    <>
      <OrbitControls 
        ref={controlsRef} 
        makeDefault 
        enableDamping 
        dampingFactor={0.05} 
        minDistance={minZoomDist}
        maxDistance={10000}
      />
      
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 0, 0]} intensity={5000} distance={5000} decay={1.5} color="#FDB813" />
      
      <Stars radius={4000} depth={100} count={8000} factor={6} saturation={0} fade speed={1} />

      <GravityGrid bodies={bodies} />

      <mesh visible={isAiming} onPointerDown={handlePointerDown}>
        <planeGeometry args={[5000, 5000]} />
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
