'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Engine, Scene } from 'react-babylonjs';
import { Vector3, Mesh, Color4, Color3, Animation, CubicEase, EasingFunction } from '@babylonjs/core';
import type { Scene as BabylonScene, PBRMaterial } from '@babylonjs/core';
import { CADModelSpec } from '../types/cad';
import { exportSceneToSTL } from '../utils/exporter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateGeometry } from '../lib/csg_engine';
import { jscadToBabylon } from '../utils/jscadToBabylon';
import { createFilamentMaterial, FilamentType } from '../utils/materials';

interface ViewportProps {
  modelSpec: CADModelSpec | null;
}

export function Viewport({ modelSpec }: ViewportProps) {
  const sceneRef = useRef<BabylonScene | null>(null);
  const meshRef = useRef<Mesh | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [filament, setFilament] = useState<FilamentType>('matte-pla');

  const handleExport = () => {
    if (sceneRef.current) {
      exportSceneToSTL(sceneRef.current, 'my_model.stl');
    }
  };

  useEffect(() => {
    if (!modelSpec || !meshRef.current || !sceneRef.current || !sceneReady) return;

    const mesh = meshRef.current;
    const scene = sceneRef.current;

    try {
      const jscadGeometry = generateGeometry(modelSpec);
      const vertexData = jscadToBabylon(jscadGeometry);

      // Create a smooth scaling transition (Pop out, apply new geometry, pop in)
      const frameRate = 60;
      const ease = new CubicEase();
      ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

      const scaleDown = new Animation("scaleDown", "scaling", frameRate, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
      scaleDown.setKeys([
        { frame: 0, value: mesh.scaling.clone() },
        { frame: 15, value: new Vector3(0.01, 0.01, 0.01) }
      ]);
      scaleDown.setEasingFunction(ease);

      const scaleUp = new Animation("scaleUp", "scaling", frameRate, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
      scaleUp.setKeys([
        { frame: 0, value: new Vector3(0.01, 0.01, 0.01) },
        { frame: 25, value: new Vector3(1, 1, 1) }
      ]);
      scaleUp.setEasingFunction(ease);

      if (mesh.getTotalVertices() === 0) {
        // Initial render: apply immediately without animation to avoid scale timing bugs
        vertexData.applyToMesh(mesh, true);
        mesh.scaling = new Vector3(1, 1, 1);
      } else {
        // Subsequent render: pop out, apply, pop in
        scene.beginDirectAnimation(mesh, [scaleDown], 0, 15, false, 1, () => {
          vertexData.applyToMesh(mesh, true);
          scene.beginDirectAnimation(mesh, [scaleUp], 0, 25, false, 1);
        });
      }

    } catch (e) {
      console.error('Failed to generate CSG geometry:', e);
    }
  }, [modelSpec, sceneReady]);

  // Update material when filament type changes
  useEffect(() => {
    if (sceneRef.current && meshRef.current) {
      const oldMaterial = meshRef.current.material as PBRMaterial;
      const newMaterial = createFilamentMaterial('filamentMat', filament, sceneRef.current);
      meshRef.current.material = newMaterial;
      if (oldMaterial) {
        oldMaterial.dispose();
      }
    }
  }, [filament]);

  return (
    <div className="flex flex-col h-full relative">
        <div className="absolute top-4 right-4 z-10 flex gap-2 items-center bg-background/80 p-2 rounded-lg backdrop-blur-sm">
            <Select value={filament} onValueChange={(val) => setFilament(val as FilamentType)}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Material" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="matte-pla">Matte PLA</SelectItem>
                <SelectItem value="glossy-petg">Glossy PETG</SelectItem>
                <SelectItem value="flexible-tpu">Flexible TPU</SelectItem>
                <SelectItem value="shiny-silk">Shiny Silk</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExport} variant="secondary" size="sm">Export STL</Button>
        </div>
      <Card className="flex-grow w-full h-[600px] overflow-hidden rounded-xl border bg-slate-900">
        <Engine antialias adaptToDeviceRatio canvasId="babylon-canvas" style={{ width: '100%', height: '100%' }}>
          <Scene
            clearColor={new Color4(0.05, 0.05, 0.07, 1)}
            onSceneMount={(e) => {
              sceneRef.current = e.scene;
              // Create initial environment
              e.scene.createDefaultEnvironment({
                createSkybox: false,
                createGround: true,
                groundSize: 1000,
                groundColor: new Color3(0.2, 0.2, 0.2),
                enableGroundShadow: true,
              });
              if (meshRef.current) {
                meshRef.current.material = createFilamentMaterial('filamentMat', filament, e.scene);
              }
              setSceneReady(true);
            }}
          >
            <arcRotateCamera
              name="camera1"
              alpha={Math.PI / 4}
              beta={Math.PI / 3}
              radius={100}
              target={Vector3.Zero()}
              wheelPrecision={50}
            />
            <hemisphericLight name="light1" intensity={0.7} direction={new Vector3(0, 1, 0)} />
            <directionalLight name="light2" intensity={1.5} direction={new Vector3(-1, -2, -1)} />
            <mesh name="csg-mesh" ref={meshRef}>
            </mesh>
          </Scene>
        </Engine>
      </Card>
    </div>
  );
}
