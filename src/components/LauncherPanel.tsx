import { useState } from 'react';
import * as THREE from 'three';
import { CelestialBody } from '../types';
import { Card } from './ui/Card';

interface Props {
  isAiming: boolean;
  setIsAiming: (val: boolean) => void;
  launchOrigin: THREE.Vector3 | null;
  launchVelocity: THREE.Vector3;
  setLaunchVelocity: (v: THREE.Vector3) => void;
  onLaunch: (body: CelestialBody) => void;
  className?: string;
}

export function LauncherPanel({
  isAiming,
  setIsAiming,
  launchOrigin,
  launchVelocity,
  setLaunchVelocity,
  onLaunch,
  className = ""
}: Props) {
  const [radius, setRadius] = useState(1.0);
  const [density, setDensity] = useState(3.0);
  const [speed, setSpeed] = useState(20);
  const [azimuth, setAzimuth] = useState(0); // degrees
  const [elevation, setElevation] = useState(0); // degrees
  const [color, setColor] = useState('#888888');

  // Update launch velocity when angles/speed change
  const updateVelocity = (s: number, a: number, e: number) => {
    const aRad = (a * Math.PI) / 180;
    const eRad = (e * Math.PI) / 180;
    
    const y = s * Math.sin(eRad);
    const x = s * Math.cos(eRad) * Math.cos(aRad);
    const z = s * Math.cos(eRad) * Math.sin(aRad);
    
    setLaunchVelocity(new THREE.Vector3(x, y, z));
  };

  const handleLaunch = () => {
    if (!launchOrigin) return;

    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
    const mass = volume * density;

    const newBody: CelestialBody = {
      id: `asteroid_${Date.now()}`,
      name: 'Asteroid',
      position: launchOrigin.clone(),
      velocity: launchVelocity.clone(),
      mass,
      radius,
      type: 'asteroid',
      density,
      color,
      isAlive: true,
      rotationPeriod: 1.0 // Asteroids rotate roughly once per day
    };

    onLaunch(newBody);
    setIsAiming(false);
  };

  const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
  const mass = volume * density;

  return (
    <div className={className}>
      <Card title="Asteroid Launcher" className="w-full md:w-80 max-h-[80vh] overflow-y-auto font-mono">
        <div className="space-y-4">
          <div>
            <button
              onClick={() => setIsAiming(!isAiming)}
              className={`w-full py-2 px-4 rounded font-bold transition-colors ${isAiming ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              {isAiming ? 'Click Scene to Set Origin' : '1. Set Launch Origin'}
            </button>
            {launchOrigin && (
              <div className="text-xs text-gray-400 mt-1 pl-1 border-l border-blue-500/50">
                Origin: {launchOrigin.x.toFixed(1)}, {launchOrigin.y.toFixed(1)}, {launchOrigin.z.toFixed(1)}
              </div>
            )}
          </div>

          <div className="space-y-3 px-1">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[10px] text-gray-500 uppercase">Radius</label>
                <span className="text-blue-400 font-bold">{radius.toFixed(1)}</span>
              </div>
              <input
                type="range" min="0.2" max="10" step="0.1" value={radius}
                onChange={(e) => setRadius(parseFloat(e.target.value))}
                className="w-full accent-blue-500 h-1.5"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[10px] text-gray-500 uppercase">Density</label>
                <span className="text-orange-400 font-bold">{density.toFixed(1)} g/cm³</span>
              </div>
              <input
                type="range" min="0.5" max="15" step="0.1" value={density}
                onChange={(e) => setDensity(parseFloat(e.target.value))}
                className="w-full accent-orange-500 h-1.5"
              />
              <div className="text-[10px] text-gray-500 mt-1 italic text-right">Mass: {mass.toFixed(1)}</div>
            </div>

            <div className="pt-2 border-t border-gray-800">
              <div className="flex justify-between mb-1">
                <label className="text-[10px] text-gray-500 uppercase">Speed</label>
                <span className="text-green-400 font-bold">{speed} u/s</span>
              </div>
              <input
                type="range" min="0" max="500" step="5" value={speed}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setSpeed(val);
                  updateVelocity(val, azimuth, elevation);
                }}
                className="w-full accent-green-500 h-1.5"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[10px] text-gray-500 uppercase">Azimuth</label>
                <span className="text-gray-300">{azimuth}°</span>
              </div>
              <input
                type="range" min="0" max="360" step="1" value={azimuth}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setAzimuth(val);
                  updateVelocity(speed, val, elevation);
                }}
                className="w-full accent-gray-500 h-1.5"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[10px] text-gray-500 uppercase">Elevation</label>
                <span className="text-gray-300">{elevation}°</span>
              </div>
              <input
                type="range" min="-90" max="90" step="1" value={elevation}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setElevation(val);
                  updateVelocity(speed, azimuth, val);
                }}
                className="w-full accent-gray-500 h-1.5"
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-500 uppercase block mb-1">Impact Hue</label>
              <input
                type="color" value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-8 cursor-pointer rounded bg-transparent border-none"
              />
            </div>
          </div>

          <button
            onClick={handleLaunch}
            disabled={!launchOrigin}
            className={`w-full py-3 px-4 rounded font-bold uppercase tracking-widest text-xs transition-all shadow-lg ${launchOrigin ? 'bg-red-600 hover:bg-red-500 active:scale-95' : 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-50'}`}
          >
            FIRE ASTEROID
          </button>
        </div>
      </Card>
    </div>
  );
}
