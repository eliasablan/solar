import { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';

interface Props {
  points: THREE.Vector3[];
  color?: string;
}

export function TrajectoryLine({ points, color = '#ffffff' }: Props) {
  const linePoints = useMemo(() => {
    return points.map(p => new THREE.Vector3(p.x, p.y, p.z));
  }, [points]);

  if (linePoints.length < 2) return null;

  return (
    <Line
      points={linePoints}
      color={color}
      lineWidth={1.5}
      dashed
      dashScale={20}
      dashSize={2}
      dashOffset={0}
      opacity={0.5}
      transparent
    />
  );
}
