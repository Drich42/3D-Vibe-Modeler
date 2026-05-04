import { CADModelSpec } from '../types/cad';

export function parsePromptToJSON(prompt: string): CADModelSpec {
  const lowerPrompt = prompt.toLowerCase();
  
  const spec: CADModelSpec = {
    units: 'mm',
    base_object: {
      type: 'cube',
      width: 50,
      depth: 50,
      height: 50
    }
  };

  if (lowerPrompt.includes('cube')) {
    spec.base_object.type = 'cube';
    const match = lowerPrompt.match(/(\d+)\s*(mm|cm)/);
    if (match) {
      const size = parseInt(match[1]);
      spec.base_object.width = size;
      spec.base_object.depth = size;
      spec.base_object.height = size;
      spec.units = match[2] as 'mm' | 'cm';
    }
  } else if (lowerPrompt.includes('sphere')) {
    spec.base_object.type = 'sphere';
    const match = lowerPrompt.match(/(\d+)\s*(mm|cm)/);
    if (match) {
      spec.base_object.diameter = parseInt(match[1]);
      spec.units = match[2] as 'mm' | 'cm';
    } else {
        spec.base_object.diameter = 50;
    }
  } else if (lowerPrompt.includes('cylinder')) {
    spec.base_object.type = 'cylinder';
    spec.base_object.diameter = 50;
    spec.base_object.height = 100;
  }

  return spec;
}
