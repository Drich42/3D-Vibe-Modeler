import type { CADModelSpec, Shape } from './types/cad.js';
import modeling from '@jscad/modeling';

const { booleans, primitives, transforms } = modeling;
const { union, subtract } = booleans;
const { cuboid, sphere, cylinder } = primitives;
const { translate, rotate } = transforms;

export function generateGeometry(spec: CADModelSpec): any {
  if (!spec || !spec.shapes || spec.shapes.length === 0) {
    throw new Error('Invalid or empty CADModelSpec');
  }

  // The first shape is our base
  let currentGeometry: any = null;

  for (const shape of spec.shapes) {
    let geom: any;

    switch (shape.type) {
      case 'cube':
        geom = cuboid({ size: shape.size });
        break;
      case 'sphere':
        geom = sphere({ radius: shape.radius });
        break;
      case 'cylinder':
        geom = cylinder({ radius: shape.radius, height: shape.height });
        break;
      default:
        throw new Error(`Unsupported shape type`);
    }

    // Apply rotation if any (assuming degrees for simplicity in spec, converting to radians if needed. JSCAD takes radians)
    // Actually, let's assume the spec provides radians for now. Or we can convert. Let's assume radians for `rotation` array [x,y,z].
    if (shape.rotation) {
      geom = rotate(shape.rotation, geom);
    }

    // Apply translation
    geom = translate(shape.position, geom);

    // Apply boolean operation
    if (currentGeometry === null) {
      if (shape.operation === 'subtract') {
        // Edge case: first operation is subtract. Normally this is invalid,
        // but we'll assume it just means empty or maybe we initialize with an empty union.
        // Let's just create an empty union. Actually we can't easily union with nothing,
        // so let's start with nothing and subtract? Let's just make the first one the base if it's add.
        throw new Error('First shape operation cannot be subtract');
      }
      currentGeometry = geom;
    } else {
      if (shape.operation === 'add') {
        currentGeometry = union(currentGeometry, geom);
      } else if (shape.operation === 'subtract') {
        currentGeometry = subtract(currentGeometry, geom);
      }
    }
  }

  return currentGeometry;
}
