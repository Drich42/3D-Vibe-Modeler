import type { CADModelSpec } from '../types/cad';
import modeling from '@jscad/modeling';
// @ts-ignore
import svgDeserializer from '@jscad/svg-deserializer';

const { booleans, primitives, transforms, extrusions } = modeling;
const { union, subtract } = booleans;
const { cuboid, sphere, cylinder } = primitives;
const { translate, rotate } = transforms;
const { extrudeLinear } = extrusions;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateGeometry(spec: CADModelSpec): any {
  if (!spec || !spec.shapes || spec.shapes.length === 0) {
    throw new Error('Invalid or empty CADModelSpec');
  }

  // The first shape is our base
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let currentGeometry: any = null;

  for (const shape of spec.shapes) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      case 'extrusion': {
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><path d="${shape.path}" /></svg>`;
        const parsed = svgDeserializer.deserialize({ filename: 'temp.svg', output: 'geometry' }, svgString);
        // The deserializer returns an array of 2D paths/geometries.
        if (parsed && parsed.length > 0) {
          // Extrude all paths
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const extrudedPieces = parsed.map((p: any) => extrudeLinear({ height: shape.depth }, p));
          if (extrudedPieces.length === 1) {
            geom = extrudedPieces[0];
          } else {
            geom = union(...extrudedPieces);
          }
        } else {
           throw new Error('Failed to parse SVG path into geometry');
        }
        break;
      }
      default:
        throw new Error(`Unsupported shape type`);
    }

    // Apply rotation if any (assuming degrees for simplicity in spec, converting to radians)
    if (shape.rotation) {
      const radians = shape.rotation.map(deg => (deg * Math.PI) / 180) as [number, number, number];
      geom = rotate(radians, geom);
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
