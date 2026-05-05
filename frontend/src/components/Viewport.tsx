'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Engine, Scene } from 'react-babylonjs';
import { Vector3, Mesh, Color4, Color3, Animation, CubicEase, EasingFunction, StandardMaterial } from '@babylonjs/core';
import type { Scene as BabylonScene, PBRMaterial } from '@babylonjs/core';
import { CADModelSpec, Shape } from '../types/cad';
import { exportSceneToSTL } from '../utils/exporter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateGeometry } from '../lib/csg_engine';
import { jscadToBabylon } from '../utils/jscadToBabylon';
import { createFilamentMaterial, FilamentType } from '../utils/materials';
import deepEqual from 'fast-deep-equal';

interface ViewportProps {
  modelSpec: CADModelSpec | null;
}

export function Viewport({ modelSpec }: ViewportProps) {
  const sceneRef = useRef<BabylonScene | null>(null);
  const meshRef = useRef<Mesh | null>(null);
  const prevSpecRef = useRef<CADModelSpec | null>(null);
  const diffMeshRef = useRef<Mesh | null>(null);
  const diffTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [filament, setFilament] = useState<FilamentType>('matte-pla');

  const handleExport = () => {
    if (sceneRef.current) {
      exportSceneToSTL(sceneRef.current, 'my_model.stl');
    }
  };

  const clearDiffMesh = () => {
    if (diffTimeoutRef.current) {
      clearTimeout(diffTimeoutRef.current);
      diffTimeoutRef.current = null;
    }
    if (diffMeshRef.current) {
      diffMeshRef.current.dispose();
      diffMeshRef.current = null;
    }
  };

  useEffect(() => {
    if (!modelSpec || !meshRef.current || !sceneRef.current || !sceneReady) return;

    const mesh = meshRef.current;
    const scene = sceneRef.current;

    const currentShapes = modelSpec.shapes || [];
    const prevShapes = prevSpecRef.current?.shapes || [];

    // Find the shape that changed (added, modified, or removed)
    let diffShape: Shape | null = null;
    let diffType: 'add' | 'remove' | 'modify' | null = null;

    if (currentShapes.length > prevShapes.length) {
       diffShape = currentShapes[currentShapes.length - 1];
       diffType = 'add';
    } else if (currentShapes.length < prevShapes.length) {
       // Find the removed shape by checking what's missing
       diffShape = prevShapes.find(p => !currentShapes.some(c => c.id === p.id)) || null;
       diffType = 'remove';
    } else {
       // Length is the same, find the modified shape
       for (let i = 0; i < currentShapes.length; i++) {
         if (!deepEqual(currentShapes[i], prevShapes[i])) {
           diffShape = currentShapes[i];
           diffType = 'modify';
           break;
         }
       }
    }

    prevSpecRef.current = modelSpec;

    try {
      // Diff Visualization Phase
      if (diffShape && diffType && mesh.getTotalVertices() > 0) {
        clearDiffMesh();

        // Generate isolated geometry for the changed shape
        // For a subtract/removed shape, we MUST force it to 'add' so the CSG engine can build it standalone.
        const standaloneShape = { ...diffShape, operation: 'add' as const };
        const isolatedSpec: CADModelSpec = { version: '1.0', shapes: [standaloneShape] };

        try {
            const isolatedGeom = generateGeometry(isolatedSpec);
            const isolatedVertexData = jscadToBabylon(isolatedGeom);

            const hologram = new Mesh('diff-hologram', scene);
            isolatedVertexData.applyToMesh(hologram, true);

            const glowMat = new StandardMaterial('glow-mat', scene);

            if (diffType === 'remove' || diffShape.operation === 'subtract') {
                glowMat.emissiveColor = new Color3(1, 0, 0); // Red for removed/subtracted
            } else if (diffType === 'modify') {
                glowMat.emissiveColor = new Color3(1, 1, 0); // Yellow for modify
            } else {
                glowMat.emissiveColor = new Color3(0, 1, 0); // Green for add
            }

            glowMat.alpha = 0.6;
            glowMat.disableLighting = true;
            hologram.material = glowMat;

            diffMeshRef.current = hologram;
        } catch (e) {
            console.warn("Failed to generate isolated diff mesh", e);
        }
      }

      const applyFinalGeometry = () => {
        let jscadGeometry;
        try {
            jscadGeometry = generateGeometry(modelSpec);
        } catch (e) {
            console.error('Failed to generate final CSG geometry:', e);
            return;
        }
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
      };

      if (diffMeshRef.current) {
        // Hold visualization for 1 second, then clear and apply final
        diffTimeoutRef.current = setTimeout(() => {
          clearDiffMesh();
          applyFinalGeometry();
        }, 1000);
      } else {
        applyFinalGeometry();
      }

    } catch (e) {
      console.error('Unhandled error in Viewport effect:', e);
    }

    return () => {
       // Cleanup timeout if effect re-runs quickly
       if (diffTimeoutRef.current) {
          clearTimeout(diffTimeoutRef.current);
       }
    };
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
