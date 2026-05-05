export type Operation = 'add' | 'subtract';

export type ShapeType = 'cube' | 'sphere' | 'cylinder' | 'extrusion';

export interface BaseShape {
  id: string;
  type: ShapeType;
  position: [number, number, number]; // [x, y, z]
  rotation?: [number, number, number]; // [x, y, z] in degrees or radians
  operation: Operation;
}

export interface CubeShape extends BaseShape {
  type: 'cube';
  size: [number, number, number]; // [width, height, depth]
}

export interface SphereShape extends BaseShape {
  type: 'sphere';
  radius: number;
}

export interface CylinderShape extends BaseShape {
  type: 'cylinder';
  radius: number;
  height: number;
}

export interface ExtrusionShape extends BaseShape {
  type: 'extrusion';
  path: string; // SVG path string
  depth: number;
}

export type Shape = CubeShape | SphereShape | CylinderShape | ExtrusionShape;

export interface CADModelSpec {
  version: string;
  shapes: Shape[];
}
