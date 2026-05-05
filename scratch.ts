import { generateGeometry } from './frontend/src/lib/csg_engine';
import { jscadToBabylon } from './frontend/src/utils/jscadToBabylon';
import type { CADModelSpec } from './frontend/src/types/cad';

const spec: CADModelSpec = {
  version: '1.0',
  shapes: [
    {
      id: 'shape1',
      position: [0, 0, 0],
      rotation: undefined,
      operation: 'add',
      type: 'sphere',
      radius: 30,
    }
  ]
};

try {
  const geom = generateGeometry(spec);
  console.log("Geom polygons length:", geom.polygons ? geom.polygons.length : 'undefined');
  const vdata = jscadToBabylon(geom);
  console.log("Vertex data positions length:", vdata.positions?.length);
  console.log("Vertex data indices length:", vdata.indices?.length);
} catch (e) {
  console.error("Error:", e);
}
