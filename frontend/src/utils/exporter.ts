import { Scene } from '@babylonjs/core';
import { STLExport } from '@babylonjs/serializers/STL/stlSerializer';

export function exportSceneToSTL(scene: Scene, filename: string = 'my_model.stl') {
  STLExport.CreateSTL(
    scene.meshes as any[],
    true,
    filename,
    true,
    true,
    true
  );
}
