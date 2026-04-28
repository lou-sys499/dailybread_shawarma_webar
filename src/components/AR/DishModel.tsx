import { useGLTF } from '@react-three/drei';
import { useRef } from 'react';
import { Group } from 'three';

interface DishModelProps {
  url: string;
  scale?: number;
  rotation?: [number, number, number];
}

export function DishModel({ url, scale = 1, rotation = [0, 0, 0] }: DishModelProps) {
  const { scene } = useGLTF(url);
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
useGLTF.preload('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb');
useGLTF.preload('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb');
useGLTF.preload('https://cdn.jsdelivr.net/gh/lou-sys499/dailybread_shawarma_webar@main/sample-shawarma.glb');
