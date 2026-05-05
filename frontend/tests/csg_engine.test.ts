import { describe, it, expect } from 'vitest';
import { generateGeometry } from '../src/lib/csg_engine';
import type { CADModelSpec } from '../src/types/cad';

describe('CSG Engine', () => {
  it('should generate a simple cube', () => {
    const spec: CADModelSpec = {
      version: '1.0',
      shapes: [
        {
          id: '1',
          type: 'cube',
          size: [10, 10, 10],
          position: [0, 0, 0],
          operation: 'add',
        },
      ],
    };

    const geometry = generateGeometry(spec);
    expect(geometry).toBeDefined();
    // In @jscad/modeling, polygons are available, but usually we just want to ensure it's generated without error
    expect(geometry.polygons.length).toBeGreaterThan(0);
  });

  it('should generate a base and subtract a hole', () => {
    const spec: CADModelSpec = {
      version: '1.0',
      shapes: [
        {
          id: '1',
          type: 'cube',
          size: [10, 10, 10],
          position: [0, 0, 0],
          operation: 'add',
        },
        {
          id: '2',
          type: 'cylinder',
          radius: 2,
          height: 10,
          position: [0, 0, 0],
          operation: 'subtract',
        },
      ],
    };

    const geometry = generateGeometry(spec);
    expect(geometry).toBeDefined();
    expect(geometry.polygons.length).toBeGreaterThan(0);
  });

  it('should handle subtracting a hole larger than the base object (Issue 1.1 QA)', () => {
    const spec: CADModelSpec = {
      version: '1.0',
      shapes: [
        {
          id: '1',
          type: 'cube',
          size: [10, 10, 10],
          position: [0, 0, 0],
          operation: 'add',
        },
        {
          id: '2',
          type: 'cube',
          size: [20, 20, 20],
          position: [0, 0, 0],
          operation: 'subtract',
        },
      ],
    };

    const geometry = generateGeometry(spec);
    expect(geometry).toBeDefined();
    // The result of subtracting everything should be empty geometry
    expect(geometry.polygons.length).toBe(0);
  });

  it('should throw if first operation is subtract', () => {
    const spec: CADModelSpec = {
      version: '1.0',
      shapes: [
        {
          id: '1',
          type: 'cube',
          size: [10, 10, 10],
          position: [0, 0, 0],
          operation: 'subtract',
        },
      ],
    };

    expect(() => generateGeometry(spec)).toThrow('First shape operation cannot be subtract');
  });

  it('should throw on empty spec', () => {
    const spec: CADModelSpec = {
      version: '1.0',
      shapes: [],
    };

    expect(() => generateGeometry(spec)).toThrow('Invalid or empty CADModelSpec');
  });

  it('should generate an extrusion from an SVG path', () => {
    const spec: CADModelSpec = {
      version: '1.0',
      shapes: [
        {
          id: 'ext1',
          type: 'extrusion',
          // Simple 10x10 square path
          path: 'M 0 0 L 10 0 L 10 10 L 0 10 Z',
          depth: 5,
          position: [0, 0, 0],
          operation: 'add',
        },
      ],
    };

    const geometry = generateGeometry(spec);
    expect(geometry).toBeDefined();
    expect(geometry.polygons.length).toBeGreaterThan(0);
  });
});
