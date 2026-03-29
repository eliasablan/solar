import { useState, useEffect } from 'react';
import { Card } from './ui/Card';

interface Props {
  isPaused: boolean;
  setIsPaused: (val: boolean) => void;
  timeScale: number;
  setTimeScale: (val: number) => void;
  simTime: number;
}

export function TimeControls({ isPaused, setIsPaused, timeScale, setTimeScale, simTime }: Props) {
  const [speedMultiplier, setSpeedSlider] = useState(1);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for reverse

  // Sync internal state with external timeScale if it changes from outside
  useEffect(() => {
    if (timeScale === 0) return;
    setDirection(timeScale > 0 ? 1 : -1);
    // Approximate mapping back to log slider scale if needed, 
    // but here we just update direction.
  }, [timeScale]);

  const handleSliderChange = (val: number) => {
    setSpeedSlider(val);
    // Use an exponential-like scale for the slider for better control
    // Range 0 to 10 -> scales from ~0.001 to ~5.0
    const newBaseScale = Math.pow(val / 5, 3); 
    setTimeScale(newBaseScale * direction);
  };

  const toggleDirection = (newDir: number) => {
    setDirection(newDir);
    const currentBaseScale = Math.abs(timeScale);
    setTimeScale(currentBaseScale * newDir);
  };

  const formatTime = (simSeconds: number) => {
    const daysElapsed = simSeconds / 0.00222; 
    const date = new Date();
    date.setDate(date.getDate() + daysElapsed);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });
  };

  const getEquivalence = (ts: number) => {
    const absTs = Math.abs(ts);
    if (absTs < 0.005) return "1 sec ≈ Hours";
    if (absTs < 0.02) return "1 sec ≈ 1 Day";
    if (absTs < 0.1) return "1 sec ≈ 1 Week";
    if (absTs < 0.5) return "1 sec ≈ 1 Month";
    return "1 sec ≈ 1 Year";
  };

  return (
    <div className="absolute bottom-4 right-4 z-10">
      <Card title="Simulation Time" className="w-80">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded">
            <span className="text-[10px] text-gray-500 uppercase">Date</span>
            <span className="text-blue-400 font-bold">{formatTime(simTime)}</span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-500 uppercase">Flow Rate</span>
              <span className="text-orange-400 font-bold">{direction > 0 ? 'FORWARD' : 'REVERSE'}</span>
            </div>
            <input 
              type="range" min="0.1" max="10" step="0.1" 
              value={speedMultiplier}
              onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="text-[10px] text-gray-500 text-center italic">
              {getEquivalence(timeScale)}
            </div>
          </div>

          <div className="flex justify-center gap-2 pt-2 border-t border-gray-800">
            <button
              onClick={() => toggleDirection(-1)}
              className={`p-2 rounded flex-1 flex justify-center items-center ${direction === -1 ? 'bg-orange-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              title="Reverse Time"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`p-2 rounded flex-1 font-bold ${isPaused ? 'bg-green-600' : 'bg-red-600 hover:opacity-80'}`}
            >
              {isPaused ? '▶ PLAY' : '⏸ PAUSE'}
            </button>

            <button
              onClick={() => toggleDirection(1)}
              className={`p-2 rounded flex-1 flex justify-center items-center ${direction === 1 ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              title="Forward Time"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
