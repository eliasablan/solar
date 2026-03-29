import { Card } from './ui/Card';

interface Props {
  timeScale: number;
  simTime: number;
  className?: string;
}

export function StatusCard({ timeScale, simTime, className = "" }: Props) {
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

  const direction = timeScale >= 0 ? 'FORWARD' : 'REVERSE';

  return (
    <div className={`z-10 ${className}`}>
      <Card title="Simulation Epoch" className="w-full md:w-80">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded">
            <span className="text-[10px] text-gray-500 uppercase">Date</span>
            <span className="text-blue-400 font-bold">{formatTime(simTime)}</span>
          </div>
          
          <div className="flex flex-col gap-1 text-xs text-gray-500 px-1 mt-1 border-t border-gray-800 pt-2">
            <div className="flex justify-between">
              <span className="uppercase">Flow Rate</span>
              <span className="text-orange-400 font-bold">{direction}</span>
            </div>
            <div className="flex justify-between italic opacity-80">
              <span>Time Scale</span>
              <span>{getEquivalence(timeScale)}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
