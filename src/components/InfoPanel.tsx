import { CelestialBody } from '../types';
import { Card } from './ui/Card';

interface Props {
  bodies: CelestialBody[];
  selectedBody: CelestialBody | null;
  onSelectBody: (body: CelestialBody | null) => void;
  setCameraMode: (mode: 'free' | 'follow' | 'top') => void;
}

export function InfoPanel({ bodies, selectedBody, onSelectBody, setCameraMode }: Props) {
  const planets = bodies.filter(b => b.type === 'planet' || b.type === 'star').length;
  const asteroids = bodies.filter(b => b.type === 'asteroid').length;
  const debris = bodies.filter(b => b.type === 'debris').length;

  const handleBodyClick = (body: CelestialBody) => {
    onSelectBody(body);
    setCameraMode('follow');
  };

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-4 z-10 pointer-events-none w-64">
      <Card title="Census" className="w-full">
        <div className="flex justify-between"><span>Planets/Stars:</span> <span>{planets}</span></div>
        <div className="flex justify-between"><span>Asteroids:</span> <span>{asteroids}</span></div>
        <div className="flex justify-between"><span>Debris:</span> <span>{debris}</span></div>
        <div className="flex justify-between font-bold mt-1 pt-1 border-t border-gray-800">
          <span>Total:</span> <span>{bodies.length}</span>
        </div>
      </Card>

      <Card title="Bodies List" className="w-full max-h-[40vh] overflow-y-auto">
        <div className="space-y-2">
          {bodies.length === 0 && <div className="text-gray-500 italic">No bodies detected</div>}
          
          {/* Stars & Planets */}
          {bodies.filter(b => b.type === 'star' || b.type === 'planet').length > 0 && (
            <div>
              <div className="text-[10px] text-blue-400 uppercase font-bold mb-1">Celestial</div>
              {bodies.filter(b => b.type === 'star' || b.type === 'planet').map(b => (
                <div 
                  key={b.id} 
                  className={`flex justify-between pl-2 border-l border-gray-800 hover:bg-white/10 cursor-pointer transition-colors ${selectedBody?.id === b.id ? 'bg-blue-900/30 border-blue-500' : ''}`}
                  onClick={() => handleBodyClick(b)}
                >
                  <span>{b.name}</span>
                  <span className="text-[10px] text-gray-500">{b.type}</span>
                </div>
              ))}
            </div>
          )}

          {/* Asteroids */}
          {bodies.filter(b => b.type === 'asteroid').length > 0 && (
            <div>
              <div className="text-[10px] text-orange-400 uppercase font-bold mb-1">Asteroids</div>
              {bodies.filter(b => b.type === 'asteroid').map(b => (
                <div 
                  key={b.id} 
                  className={`flex justify-between pl-2 border-l border-gray-800 hover:bg-white/10 cursor-pointer transition-colors text-xs ${selectedBody?.id === b.id ? 'bg-blue-900/30 border-blue-500' : ''}`}
                  onClick={() => handleBodyClick(b)}
                >
                  <span className="truncate max-w-[120px]">{b.name}</span>
                  <span className="text-gray-500">#{b.id.slice(-4)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Debris */}
          {bodies.filter(b => b.type === 'debris').length > 0 && (
            <div>
              <div className="text-[10px] text-red-400 uppercase font-bold mb-1">Debris</div>
              <div className="text-xs text-gray-400 pl-2 italic">
                {bodies.filter(b => b.type === 'debris').length} fragments detected
              </div>
            </div>
          )}
        </div>
      </Card>

      {selectedBody && (
        <Card title={selectedBody.name} className="w-full">
          <div className="flex justify-between">
            <span className="text-gray-400">Type:</span> 
            <span className="capitalize">{selectedBody.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Mass:</span> 
            <span>{selectedBody.mass >= 1000 ? selectedBody.mass.toExponential(2) : selectedBody.mass.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Speed:</span> 
            <span>{selectedBody.velocity.length().toFixed(1)} u/s</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-gray-400">Pos X:</span> 
            <span>{selectedBody.position.x.toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Pos Y:</span> 
            <span>{selectedBody.position.y.toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Pos Z:</span> 
            <span>{selectedBody.position.z.toFixed(1)}</span>
          </div>
        </Card>
      )}
    </div>
  );
}
