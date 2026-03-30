"use client";

import { useState, useEffect } from 'react';

interface Props {
  initialOpen?: boolean;
  onClose?: () => void;
  isOpenExternal?: boolean;
}

export default function OnboardingModal({ initialOpen = true, onClose, isOpenExternal }: Props) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  useEffect(() => {
    if (isOpenExternal !== undefined) {
      setIsOpen(isOpenExternal);
    }
  }, [isOpenExternal]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300 max-h-[90vh]">
        <div className="p-6 flex flex-col gap-4 overflow-y-auto">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">Gravity Simulator</h2>
            <div className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-medium uppercase tracking-wider">v1.1</div>
          </div>
          
          <p className="text-gray-400 text-sm leading-relaxed">
            Experience the orbital mechanics of our solar system. Launch asteroids, observe gravity, and explore celestial bodies.
          </p>

          <div className="space-y-4 my-2">
            {/* Mouse Controls */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0 text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
              </div>
              <div>
                <h3 className="text-white text-sm font-semibold">Mouse Controls</h3>
                <p className="text-gray-500 text-xs font-mono">
                  <span className="text-blue-300">Left Click:</span> Rotate around target<br/>
                  <span className="text-blue-300">Right Click:</span> Pan view<br/>
                  <span className="text-blue-300">Scroll:</span> Zoom in/out
                </p>
              </div>
            </div>

            {/* Keyboard Controls */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0 text-orange-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h.01"/><path d="M11 9h.01"/><path d="M15 9h.01"/><path d="M19 9h.01"/><path d="M7 13h.01"/><path d="M11 13h.01"/><path d="M15 13h.01"/><path d="M19 13h.01"/><path d="M7 17h10"/></svg>
              </div>
              <div>
                <h3 className="text-white text-sm font-semibold">Keyboard Controls</h3>
                <div className="grid grid-cols-2 gap-x-4 text-xs font-mono text-gray-500 mt-1">
                  <p><span className="text-orange-300">WASD:</span> Move camera</p>
                  <p><span className="text-orange-300">Q / E:</span> Rotate Yaw (Horiz.)</p>
                  <p><span className="text-orange-300">R / F:</span> Rotate Pitch (Vert.)</p>
                  <p><span className="text-orange-300">I / O:</span> Fast Zoom</p>
                </div>
              </div>
            </div>

            {/* Launch & Focus */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0 text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4-4-4"/><path d="M3 10h13"/></svg>
              </div>
              <div>
                <h3 className="text-white text-sm font-semibold">Interaction</h3>
                <p className="text-gray-500 text-xs">Click <span className="text-green-300">Add Asteroid</span> to prepare launch. Click any body to <span className="text-green-300">Focus</span> the camera and see stats.</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-full py-3 bg-white hover:bg-gray-200 text-black font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg mt-2"
          >
            Start Exploring
          </button>
        </div>

        <div className="bg-black/40 border-t border-gray-800 p-4 flex justify-center">
          <p className="text-gray-500 text-xs">
            Created by <a href="https://eliasablan.dev" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 font-medium">eliasablan.dev</a>
          </p>
        </div>
      </div>
    </div>
  );
}
