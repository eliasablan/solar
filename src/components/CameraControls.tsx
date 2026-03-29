import { CelestialBody } from '../types';
import { Card } from './ui/Card';

interface Props {
  cameraMode: 'free' | 'follow' | 'top';
  setCameraMode: (mode: 'free' | 'follow' | 'top') => void;
  selectedBody: CelestialBody | null;
  className?: string;
}

export function CameraControls({ cameraMode, setCameraMode, selectedBody, className = "" }: Props) {
  return (
    <div className={className}>
      <Card title="Camera" className="w-full md:w-64">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setCameraMode('free')}
            className={`px-3 py-1 rounded text-left ${cameraMode === 'free' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            Free Look (Reset)
          </button>

          <button
            onClick={() => setCameraMode('top')}
            className={`px-3 py-1 rounded text-left ${cameraMode === 'top' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            Top View
          </button>

          {selectedBody && (
            <button
              onClick={() => setCameraMode('follow')}
              className={`px-3 py-1 rounded text-left ${cameraMode === 'follow' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              Follow: {selectedBody.name}
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
