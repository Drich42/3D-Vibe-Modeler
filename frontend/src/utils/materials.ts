import { PBRMaterial, Color3, Scene } from '@babylonjs/core';

export type FilamentType = 'matte-pla' | 'glossy-petg' | 'flexible-tpu' | 'shiny-silk';

export function createFilamentMaterial(name: string, type: FilamentType, scene: Scene): PBRMaterial {
  const pbr = new PBRMaterial(name, scene);

  // Base color for all filaments
  pbr.albedoColor = Color3.FromHexString("#0070f3");

  switch (type) {
    case 'matte-pla':
      pbr.metallic = 0.0;
      pbr.roughness = 0.8;
      break;
    case 'glossy-petg':
      pbr.metallic = 0.1;
      pbr.roughness = 0.2;
      pbr.clearCoat.isEnabled = true;
      pbr.clearCoat.intensity = 0.5;
      break;
    case 'flexible-tpu':
      pbr.metallic = 0.0;
      pbr.roughness = 0.6;
      pbr.subSurface.isTranslucencyEnabled = true;
      pbr.subSurface.translucencyIntensity = 0.3;
      break;
    case 'shiny-silk':
      pbr.metallic = 0.6;
      pbr.roughness = 0.15;
      pbr.clearCoat.isEnabled = true;
      pbr.clearCoat.intensity = 1.0;
      pbr.clearCoat.roughness = 0.1;
      // "If Silk PLA doesn't blind the user when they rotate the camera, it's not shiny enough."
      pbr.anisotropy.isEnabled = true;
      pbr.anisotropy.intensity = 1.0;
      break;
  }

  pbr.backFaceCulling = false;
  return pbr;
}
