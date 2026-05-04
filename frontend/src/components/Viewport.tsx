'use client';

import React, { useRef, useEffect } from 'react';
import { Engine, Scene } from 'react-babylonjs';
import { Vector3, Color3, Mesh } from '@babylonjs/core';
import type { Scene as BabylonScene } from '@babylonjs/core';
import { CADModelSpec } from '../types/cad';
import { exportSceneToSTL } from '../utils/exporter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { generateGeometry } from '../lib/csg_engine';
import { jscadToBabylon } from '../utils/jscadToBabylon';

interface ViewportProps {
  modelSpec: CADModelSpec | null;
}

export function Viewport({ modelSpec }: ViewportProps) {
  const sceneRef = useRef<BabylonScene | null>(null);
  const meshRef = useRef<Mesh | null>(null);

  const handleExport = () => {
    if (sceneRef.current) {
      exportSceneToSTL(sceneRef.current, 'my_model.stl');
    }
  };

  useEffect(() => {
    if (!modelSpec || !meshRef.current) return;

    try {
      const jscadGeometry = generateGeometry(modelSpec);
      const vertexData = jscadToBabylon(jscadGeometry);
      vertexData.applyToMesh(meshRef.current, true);
    } catch (e) {
      console.error('Failed to generate CSG geometry:', e);
    }
  }, [modelSpec]);

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
              radius={100}
              target={Vector3.Zero()}
              wheelPrecision={50}
            />
            <hemisphericLight name="light1" intensity={0.7} direction={new Vector3(0, 1, 0)} />
            <directionalLight name="light2" intensity={0.5} direction={new Vector3(-1, -2, -1)} />

            <mesh name="csg-mesh" ref={meshRef}>
              <standardMaterial name="mat" diffuseColor={Color3.FromHexString("#0070f3")} backFaceCulling={false} />
            </mesh>
          </Scene>
        </Engine>
      </Card>
    </div>
  );
}
