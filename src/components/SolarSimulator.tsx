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
import OnboardingModal from './OnboardingModal';
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
    addBody,
    stepBack,
    stepForward
  } = usePhysics();

  const [selectedBody, setSelectedBody] = useState<CelestialBody | null>(null);
  const [cameraMode, setCameraMode] = useState<'free' | 'follow' | 'top'>('free');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(true);
  
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
      <OnboardingModal 
        isOpenExternal={isOnboardingOpen} 
        onClose={() => setIsOnboardingOpen(false)} 
      />
      <Canvas camera={{ position: [0, 150, 300], fov: 45, far: 20000 }}>
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

      {/* 0. Help Button */}
      <button 
        onClick={() => setIsOnboardingOpen(true)}
        className="absolute top-4 left-4 md:left-1/2 md:-translate-x-1/2 z-[60] flex items-center gap-2 px-4 py-2 bg-black/80 border border-gray-700 rounded-full text-white text-[10px] md:text-xs font-bold shadow-xl backdrop-blur-md hover:bg-gray-800 transition-all active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
        <span className="hidden sm:inline">CONTROLS & HELP</span>
        <span className="sm:hidden">HELP</span>
      </button>

      {/* 1. Hamburguer Button (Mobile) */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 right-4 z-[60] p-3 bg-black/80 border border-gray-700 rounded-full text-white shadow-xl backdrop-blur-md active:scale-95 transition-transform"
      >
        {isMobileMenuOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        )}
      </button>

      {/* 2. Backdrop (Mobile) */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 3. Mobile Sidebar / Sheet */}
      <div className={`
        md:hidden fixed z-50 bg-black/90 border-gray-800 backdrop-blur-xl transition-transform duration-300 ease-in-out overflow-y-auto p-6 flex flex-col gap-6 shadow-2xl
        portrait:inset-x-0 portrait:bottom-0 portrait:h-[70vh] portrait:w-full portrait:border-t portrait:rounded-t-[2.5rem]
        landscape:inset-y-0 landscape:right-0 landscape:w-96 landscape:h-full landscape:border-l
        ${isMobileMenuOpen 
          ? 'translate-x-0 translate-y-0' 
          : 'portrait:translate-y-full landscape:translate-x-full'}
      `}>
        <div className="flex justify-between items-center portrait:mb-2">
          <h2 className="text-xl font-bold text-white tracking-tight">System Controls</h2>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 hover:bg-white/10 rounded-full text-gray-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <InfoPanel bodies={bodies} selectedBody={selectedBody} onSelectBody={handleSelectBody} setCameraMode={setCameraMode} />
        <TimeControls 
          isPaused={isPaused} 
          setIsPaused={setIsPaused} 
          timeScale={timeScale} 
          setTimeScale={setTimeScale} 
          simTime={simTime} 
          stepBack={stepBack}
          stepForward={stepForward}
        />
        <LauncherPanel 
          isAiming={isAiming} 
          setIsAiming={setIsAiming} 
          launchOrigin={launchOrigin} 
          launchVelocity={launchVelocity} 
          setLaunchVelocity={setLaunchVelocity} 
          onLaunch={addBody} 
        />
        <CameraControls cameraMode={cameraMode} setCameraMode={setCameraMode} selectedBody={selectedBody} />
      </div>

      {/* 4. Desktop Layout */}
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
            stepBack={stepBack}
            stepForward={stepForward}
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

      {/* 4. Time Controls (Móvil - Solo visible cuando el menú está cerrado) */}
      {!isMobileMenuOpen && (
        <div className="md:hidden absolute bottom-4 right-4 pointer-events-auto">
          <TimeControls 
            isPaused={isPaused} 
            setIsPaused={setIsPaused} 
            timeScale={timeScale} 
            setTimeScale={setTimeScale} 
            simTime={simTime} 
            stepBack={stepBack}
            stepForward={stepForward}
          />
        </div>
      )}
    </div>
  );
}
