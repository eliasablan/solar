import { CelestialBody } from '../types';

interface Props {
  cameraMode: 'free' | 'follow' | 'top';
  setCameraMode: (mode: 'free' | 'follow' | 'top') => void;
  selectedBody: CelestialBody | null;
}

export function CameraControls({ cameraMode, setCameraMode, selectedBody }: Props) {
  return (
    <div className="absolute top-4 left-4 bg-black/80 text-white p-3 rounded-lg shadow-lg border border-gray-700 font-mono text-sm backdrop-blur-sm z-10 pointer-events-auto flex flex-col gap-2">
      <h3 className="font-bold border-b border-gray-600 pb-1 mb-1">Camera</h3>
      
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
  );
}
