'use client';

import React, { useRef } from 'react';
import { Engine, Scene } from 'react-babylonjs';
import { Vector3, Color3 } from '@babylonjs/core';
import type { Scene as BabylonScene } from '@babylonjs/core';
import { CADModelSpec } from '../types/cad';
import { exportSceneToSTL } from '../utils/exporter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ViewportProps {
  modelSpec: CADModelSpec | null;
}

export function Viewport({ modelSpec }: ViewportProps) {
  const sceneRef = useRef<BabylonScene | null>(null);

  const handleExport = () => {
    if (sceneRef.current) {
      exportSceneToSTL(sceneRef.current, 'my_model.stl');
    }
  };

  const renderModel = () => {
    if (!modelSpec) return null;

    const { base_object } = modelSpec;
    
    // Convert units visually if needed, but keeping it simple for 1 unit = 1mm
    // Scaling down slightly so 50mm doesn't overflow screen if camera is at default
    const scale = 0.05; 

    if (base_object.type === 'cube') {
      const w = (base_object.width || 50) * scale;
      const d = (base_object.depth || 50) * scale;
      const h = (base_object.height || 50) * scale;
      return (
        <box name="base-cube" width={w} depth={d} height={h}>
          <standardMaterial name="mat" diffuseColor={Color3.FromHexString("#0070f3")} />
        </box>
      );
    }

    if (base_object.type === 'sphere') {
      const diameter = (base_object.diameter || 50) * scale;
      return (
        <sphere name="base-sphere" diameter={diameter} segments={32}>
          <standardMaterial name="mat" diffuseColor={Color3.FromHexString("#0070f3")} />
        </sphere>
      );
    }
    
    if (base_object.type === 'cylinder') {
      const diameter = (base_object.diameter || 50) * scale;
      const height = (base_object.height || 50) * scale;
      return (
        <cylinder name="base-cylinder" diameter={diameter} height={height} tessellation={32}>
          <standardMaterial name="mat" diffuseColor={Color3.FromHexString("#0070f3")} />
        </cylinder>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-full relative">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button onClick={handleExport} variant="secondary">Export STL</Button>
        </div>
      <Card className="flex-grow w-full h-[600px] overflow-hidden rounded-xl border bg-black">
        <Engine antialias adaptToDeviceRatio canvasId="babylon-canvas" style={{ width: '100%', height: '100%' }}>
          <Scene onSceneMount={(e) => { sceneRef.current = e.scene; }}>
            <arcRotateCamera
              name="camera1"
              alpha={Math.PI / 4}
              beta={Math.PI / 3}
              radius={10}
              target={Vector3.Zero()}
              wheelPrecision={50}
            />
            <hemisphericLight name="light1" intensity={0.7} direction={new Vector3(0, 1, 0)} />
            <directionalLight name="light2" intensity={0.5} direction={new Vector3(-1, -2, -1)} />
            {renderModel()}
          </Scene>
        </Engine>
      </Card>
    </div>
  );
}
