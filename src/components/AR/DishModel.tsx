import { useGLTF } from '@react-three/drei';
import { useRef } from 'react';
import { Group } from 'three';

interface DishModelProps {
  url: string;
  scale?: number;
  rotation?: [number, number, number];
}

export function DishModel({ url, scale = 1, rotation = [0, 0, 0] }: DishModelProps) {
  const { scene } = useGLTF(url, 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
  const groupRef = useRef<Group>(null);

  return (
    <primitive 
      ref={groupRef} 
      object={scene} 
      scale={scale} 
      rotation={rotation}
      dispose={null} 
    />
  );
}

// Preload common models
const DRACO_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';
useGLTF.preload('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb', DRACO_PATH);
useGLTF.preload('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb', DRACO_PATH);
useGLTF.preload('/models/duck.glb', DRACO_PATH);
