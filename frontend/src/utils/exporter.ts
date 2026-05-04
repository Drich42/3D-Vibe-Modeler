import { Scene } from '@babylonjs/core';
import { STLExport } from '@babylonjs/serializers/STL/stlSerializer';

export function exportSceneToSTL(scene: Scene, filename: string = 'my_model.stl') {
  STLExport.CreateSTL(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scene.meshes as any[],
    true,
    filename,
    true,
    true,
    true
  );
}
