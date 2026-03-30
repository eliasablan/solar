import { useState, useEffect } from 'react';
import { Card } from './ui/Card';

interface Props {
  isPaused: boolean;
  setIsPaused: (val: boolean) => void;
  timeScale: number;
  setTimeScale: (val: number) => void;
  simTime: number;
  stepBack: () => void;
  stepForward: () => void;
  className?: string;
}

export function TimeControls({ 
  isPaused, 
  setIsPaused, 
  timeScale, 
  setTimeScale, 
  simTime, 
  stepBack,
  stepForward,
  className = "" 
}: Props) {
  const [speedMultiplier, setSpeedSlider] = useState(1);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for reverse

  // Sync internal state with external timeScale if it changes from outside
  useEffect(() => {
    if (timeScale === 0) return;
    setDirection(timeScale > 0 ? 1 : -1);
  }, [timeScale]);

  // We define fixed speed options for the quick-access buttons
  const speedPresets = [
    { label: "1D/s", value: 0.00222, sliderPos: 1.3 },
    { label: "1W/s", value: 0.0155, sliderPos: 2.5 },
    { label: "1M/s", value: 0.0675, sliderPos: 4.0 },
    { label: "6M/s", value: 0.4052, sliderPos: 7.0 },
    { label: "1Y/s", value: 0.8104, sliderPos: 8.5 },
    { label: "5Y/s", value: 4.052, sliderPos: 10.0 }
  ];

  const handleSliderChange = (val: number) => {
    setSpeedSlider(val);
    // Cubic scale for more precision at low speeds
    const newBaseScale = Math.pow(val / 5, 3); 
    setTimeScale(newBaseScale * direction);
  };

  const setPreset = (preset: typeof speedPresets[0]) => {
    setSpeedSlider(preset.sliderPos);
    setTimeScale(preset.value * direction);
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
    <div className={className}>
      <Card title="Simulation Time" className="w-full md:w-80">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded border border-gray-800">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Current Epoch</span>
            <span className="text-blue-400 font-bold">{formatTime(simTime)}</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-500 uppercase">Speed Control</span>
              <span className="text-orange-400 font-bold">{direction > 0 ? 'FORWARD' : 'REVERSE'}</span>
            </div>
            
            {/* Quick Presets Grid */}
            <div className="grid grid-cols-3 gap-1 px-1">
              {speedPresets.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => setPreset(preset)}
                  className={`text-[9px] py-1 rounded transition-colors ${Math.abs(Math.abs(timeScale) - preset.value) < 0.001 ? 'bg-blue-600 font-bold' : 'bg-gray-800 hover:bg-gray-700'}`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <input 
              type="range" min="0.1" max="10" step="0.1" 
              value={speedMultiplier}
              onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
              className="w-full accent-blue-500 h-1 cursor-pointer"
            />
            
            <div className="text-[10px] text-gray-500 text-center italic opacity-70">
              {getEquivalence(timeScale)}
            </div>
          </div>

          <div className="flex justify-center gap-2 pt-2 border-t border-gray-800">
            {isPaused ? (
              <>
                <button
                  onClick={stepBack}
                  className="p-2 rounded flex-1 flex justify-center items-center bg-gray-800 hover:bg-gray-700 transition-all group"
                  title="Step Back"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-active:scale-90 transition-transform">
                    <polygon points="19 20 9 12 19 4 19 20"></polygon>
                    <line x1="5" y1="19" x2="5" y2="5"></line>
                  </svg>
                </button>
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-2 rounded flex-1 font-bold transition-all bg-green-600 hover:bg-green-500 active:scale-95"
                >
                  ▶ PLAY
                </button>
                <button
                  onClick={stepForward}
                  className="p-2 rounded flex-1 flex justify-center items-center bg-gray-800 hover:bg-gray-700 transition-all group"
                  title="Step Forward"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-active:scale-90 transition-transform">
                    <polygon points="5 4 15 12 5 20 5 4"></polygon>
                    <line x1="19" y1="5" x2="19" y2="19"></line>
                  </svg>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => toggleDirection(-1)}
                  className={`p-2 rounded flex-1 flex justify-center items-center transition-all ${direction === -1 ? 'bg-orange-600 shadow-inner' : 'bg-gray-700 hover:bg-gray-600'}`}
                  title="Reverse Time"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-2 rounded flex-1 font-bold transition-all bg-red-600 hover:opacity-80 active:scale-95"
                >
                  ⏸ PAUSE
                </button>

                <button
                  onClick={() => toggleDirection(1)}
                  className={`p-2 rounded flex-1 flex justify-center items-center transition-all ${direction === 1 ? 'bg-blue-600 shadow-inner' : 'bg-gray-700 hover:bg-gray-600'}`}
                  title="Forward Time"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
