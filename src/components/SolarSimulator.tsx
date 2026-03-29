"use client";

import { useState, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { usePhysics } from '../hooks/usePhysics';
import { Scene3D } from './Scene3D';
import { LauncherPanel } from './LauncherPanel';
import { TimeControls } from './TimeControls';
import { InfoPanel } from './InfoPanel';
import { CameraControls } from './CameraControls';
import { StatusCard } from './StatusCard';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Launcher State
  const [isAiming, setIsAiming] = useState(false);
  const [launchOrigin, setLaunchOrigin] = useState<THREE.Vector3 | null>(null);
  const [launchVelocity, setLaunchVelocity] = useState<THREE.Vector3>(new THREE.Vector3(50, 0, 0));

  const handleSelectBody = useCallback((body: CelestialBody | null) => {
    setSelectedBody(body);
    if (!body && cameraMode === 'follow') {
      setCameraMode('free');
    }
  }, [cameraMode]);

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      <Canvas camera={{ position: [0, 150, 300], fov: 45, far: 5000 }}>
        <Suspense fallback={null}>
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
        </Suspense>
      </Canvas>

      {/* --- UI OVERLAYS --- */}

      {/* 1. Botón Hamburguesa (Móvil) */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden absolute top-4 left-4 z-50 p-3 bg-black/80 border border-gray-700 rounded-lg text-white shadow-xl backdrop-blur-md active:scale-95 transition-transform"
      >
        {isMobileMenuOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        )}
      </button>

      {/* 2. Mobile Sidebar / Sheet (REORDENADO) */}
      <div className={`md:hidden fixed inset-y-0 left-0 z-40 w-80 bg-black/90 border-r border-gray-800 backdrop-blur-xl transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto p-4 pt-20 flex flex-col gap-4 shadow-2xl`}>
        {/* Lógica: ¿Qué hay? -> ¿A qué velocidad? -> ¿Qué puedo hacer? -> ¿Cómo lo veo? */}
        <InfoPanel bodies={bodies} selectedBody={selectedBody} onSelectBody={handleSelectBody} setCameraMode={setCameraMode} />
        <TimeControls isPaused={isPaused} setIsPaused={setIsPaused} timeScale={timeScale} setTimeScale={setTimeScale} simTime={simTime} />
        <LauncherPanel 
          isAiming={isAiming} 
          setIsAiming={(v) => { setIsAiming(v); if(v) setIsMobileMenuOpen(false); }} 
          launchOrigin={launchOrigin} 
          launchVelocity={launchVelocity} 
          setLaunchVelocity={setLaunchVelocity} 
          onLaunch={addBody} 
        />
        <CameraControls cameraMode={cameraMode} setCameraMode={setCameraMode} selectedBody={selectedBody} />
      </div>

      {/* 3. Desktop Layout */}
      <div className="hidden md:block">
        <div className="absolute top-4 left-4 flex flex-col gap-4">
          <CameraControls cameraMode={cameraMode} setCameraMode={setCameraMode} selectedBody={selectedBody} />
        </div>
        
        <div className="absolute bottom-4 left-4 flex flex-col gap-4">
          <LauncherPanel 
            isAiming={isAiming} 
            setIsAiming={setIsAiming} 
            launchOrigin={launchOrigin} 
            launchVelocity={launchVelocity} 
            setLaunchVelocity={setLaunchVelocity} 
            onLaunch={addBody} 
          />
        </div>

        <div className="absolute bottom-4 right-4 flex flex-col gap-4 items-end">
          <TimeControls 
            isPaused={isPaused} 
            setIsPaused={setIsPaused} 
            timeScale={timeScale} 
            setTimeScale={setTimeScale} 
            simTime={simTime} 
          />
        </div>

        <div className="absolute top-4 right-4 flex flex-col gap-4">
          <InfoPanel 
            bodies={bodies} 
            selectedBody={selectedBody} 
            onSelectBody={handleSelectBody} 
            setCameraMode={setCameraMode} 
          />
        </div>
      </div>

      {/* 4. Status Card (Móvil - Solo visible cuando el menú está cerrado) */}
      {!isMobileMenuOpen && (
        <div className="md:hidden absolute bottom-4 right-4">
          <StatusCard 
            timeScale={timeScale}
            simTime={simTime}
          />
        </div>
      )}
    </div>
  );
}
