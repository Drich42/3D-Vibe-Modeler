import { CADModelSpec } from '../types/cad';

export function parsePromptToJSON(prompt: string): CADModelSpec {
  const lowerPrompt = prompt.toLowerCase();
  
  const spec: CADModelSpec = {
    version: '1.0',
    shapes: [{
      id: 'base',
      type: 'cube',
      size: [50, 50, 50],
      position: [0, 0, 0],
      operation: 'add'
    }]
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseShape = spec.shapes[0] as any;

  if (lowerPrompt.includes('cube')) {
    baseShape.type = 'cube';
    const match = lowerPrompt.match(/(\d+)\s*(mm|cm)/);
    if (match) {
      const size = parseInt(match[1]);
      baseShape.size = [size, size, size];
    }
  } else if (lowerPrompt.includes('sphere')) {
    baseShape.type = 'sphere';
    const match = lowerPrompt.match(/(\d+)\s*(mm|cm)/);
    if (match) {
      baseShape.radius = parseInt(match[1]) / 2;
    } else {
      baseShape.radius = 25;
    }
  } else if (lowerPrompt.includes('cylinder')) {
    baseShape.type = 'cylinder';
    baseShape.radius = 25;
    baseShape.height = 100;
  }

  // Handle boolean subtract (mocked)
  if (lowerPrompt.includes('hole')) {
    spec.shapes.push({
      id: 'hole-1',
      type: 'cylinder',
      radius: 10,
      height: 200,
      position: [0, 0, 0],
      operation: 'subtract'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as unknown as any);
  }

  return spec;
}
