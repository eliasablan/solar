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
}

export function LauncherPanel({
  isAiming,
  setIsAiming,
  launchOrigin,
  launchVelocity,
  setLaunchVelocity,
  onLaunch
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
      isAlive: true
    };

    onLaunch(newBody);
    setIsAiming(false);
  };

  const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
  const mass = volume * density;

  return (
    <div className="absolute bottom-4 left-4 z-10">
      <Card title="Asteroid Launcher" className="w-80 max-h-[80vh] overflow-y-auto">
        <div className="space-y-4">
          <div>
            <button
              onClick={() => setIsAiming(!isAiming)}
              className={`w-full py-2 px-4 rounded font-bold ${isAiming ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              {isAiming ? 'Click Scene to Set Origin' : '1. Set Launch Origin'}
            </button>
            {launchOrigin && (
              <div className="text-xs text-gray-400 mt-1">
                Origin: {launchOrigin.x.toFixed(1)}, {launchOrigin.y.toFixed(1)}, {launchOrigin.z.toFixed(1)}
              </div>
            )}
          </div>

          <div>
            <label className="block mb-1">Radius: {radius.toFixed(1)}</label>
            <input
              type="range" min="0.2" max="10" step="0.1" value={radius}
              onChange={(e) => setRadius(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-1">Density: {density.toFixed(1)} g/cm³</label>
            <input
              type="range" min="0.5" max="15" step="0.1" value={density}
              onChange={(e) => setDensity(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-400 mt-1">Mass: {mass.toFixed(1)}</div>
          </div>

          <div>
            <label className="block mb-1">Velocity: {speed} units/s</label>
            <input
              type="range" min="0" max="500" step="5" value={speed}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSpeed(val);
                updateVelocity(val, azimuth, elevation);
              }}
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-1">Direction (Azimuth): {azimuth}°</label>
            <input
              type="range" min="0" max="360" step="1" value={azimuth}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setAzimuth(val);
                updateVelocity(speed, val, elevation);
              }}
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-1">Direction (Elevation): {elevation}°</label>
            <input
              type="range" min="-90" max="90" step="1" value={elevation}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setElevation(val);
                updateVelocity(speed, azimuth, val);
              }}
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-1">Color</label>
            <input
              type="color" value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-8 cursor-pointer rounded"
            />
          </div>

          <button
            onClick={handleLaunch}
            disabled={!launchOrigin}
            className={`w-full py-2 px-4 rounded font-bold ${launchOrigin ? 'bg-red-600 hover:bg-red-500' : 'bg-gray-600 opacity-50 cursor-not-allowed'}`}
          >
            FIRE ASTEROID
          </button>
        </div>
      </Card>
    </div>
  );
}
