"use client";

import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { usePhysics } from '../hooks/usePhysics';
import { Scene3D } from './Scene3D';
import { LauncherPanel } from './LauncherPanel';
import { TimeControls } from './TimeControls';
import { InfoPanel } from './InfoPanel';
import { CameraControls } from './CameraControls';
import { CelestialBody } from '../types';

export default function SolarSimulator() {
  const {
    bodies,
    explosions,
    isPaused,
    setIsPaused,
    timeScale,
    setTimeScale,
    simTime,
    addBody
  } = usePhysics();

  const [selectedBody, setSelectedBody] = useState<CelestialBody | null>(null);
  const [cameraMode, setCameraMode] = useState<'free' | 'follow' | 'top'>('free');
  
  // Launcher State
  const [isAiming, setIsAiming] = useState(false);
  const [launchOrigin, setLaunchOrigin] = useState<THREE.Vector3 | null>(null);
  const [launchVelocity, setLaunchVelocity] = useState<THREE.Vector3>(new THREE.Vector3(50, 0, 0));

  const handleSelectBody = (body: CelestialBody | null) => {
    setSelectedBody(body);
    if (!body && cameraMode === 'follow') {
      setCameraMode('free');
    }
  };

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      <Canvas camera={{ position: [0, 150, 300], fov: 45 }}>
        <Scene3D
          bodies={bodies}
          explosions={explosions}
          selectedBody={selectedBody}
          onSelectBody={handleSelectBody}
          isAiming={isAiming}
          launchOrigin={launchOrigin}
          launchVelocity={launchVelocity}
          setLaunchOrigin={setLaunchOrigin}
          cameraMode={cameraMode}
          timeScale={timeScale}
          isPaused={isPaused}
        />
      </Canvas>

      <LauncherPanel
        isAiming={isAiming}
        setIsAiming={setIsAiming}
        launchOrigin={launchOrigin}
        launchVelocity={launchVelocity}
        setLaunchVelocity={setLaunchVelocity}
        onLaunch={addBody}
      />

      <TimeControls
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        timeScale={timeScale}
        setTimeScale={setTimeScale}
        simTime={simTime}
      />

      <InfoPanel
        bodies={bodies}
        selectedBody={selectedBody}
        onSelectBody={handleSelectBody}
        setCameraMode={setCameraMode}
      />

      <CameraControls
        cameraMode={cameraMode}
        setCameraMode={setCameraMode}
        selectedBody={selectedBody}
      />
    </div>
  );
}
