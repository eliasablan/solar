interface Props {
  isPaused: boolean;
  setIsPaused: (val: boolean) => void;
  timeScale: number;
  setTimeScale: (val: number) => void;
  simTime: number;
}

export function TimeControls({ isPaused, setIsPaused, timeScale, setTimeScale, simTime }: Props) {
  // Earth orbit in simulated seconds = 0.8104
  const formatTime = (simSeconds: number) => {
    const daysElapsed = simSeconds / 0.00222; 
    
    // Create a base date (e.g., Today) and add the elapsed days
    const date = new Date();
    date.setDate(date.getDate() + daysElapsed);
    
    // Format as "Month DD, YYYY"
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const speedOptions = [
    { label: "1 Day/s", scale: 0.00222 },
    { label: "1 Wk/s", scale: 0.0155 },
    { label: "1 Mo/s", scale: 0.0675 },
    { label: "6 Mo/s", scale: 0.4052 },
    { label: "1 Yr/s", scale: 0.8104 },
    { label: "5 Yr/s", scale: 4.052 }
  ];

  return (
    <div className="absolute bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg shadow-lg border border-gray-700 font-mono text-sm backdrop-blur-sm z-10 pointer-events-auto flex flex-col items-end gap-3 min-w-[300px]">
      <div className="w-full flex justify-between items-center border-b border-gray-600 pb-2">
        <span className="font-bold text-gray-400">Simulation Time</span>
        <span className="text-blue-400 font-bold">{formatTime(simTime)}</span>
      </div>
      
      <div className="w-full flex justify-between items-center text-xs text-gray-500 mb-1">
        <span>Current Speed Rate:</span>
        <span className="text-orange-400 font-semibold">
          {speedOptions.find(o => Math.abs(o.scale - timeScale) < 0.001)?.label || "Custom"}
        </span>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className={`px-3 py-1 rounded font-bold mr-2 ${isPaused ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}`}
        >
          {isPaused ? '▶ PLAY' : '⏸ PAUSE'}
        </button>
        
        {speedOptions.map(opt => (
          <button
            key={opt.label}
            onClick={() => setTimeScale(opt.scale)}
            className={`px-2 py-1 rounded text-xs ${Math.abs(timeScale - opt.scale) < 0.001 ? 'bg-blue-600 font-bold' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
