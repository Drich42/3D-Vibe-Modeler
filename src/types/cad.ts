export type Operation = 'add' | 'subtract';

export type ShapeType = 'cube' | 'sphere' | 'cylinder';

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

export type Shape = CubeShape | SphereShape | CylinderShape;

export interface CADModelSpec {
  version: string;
  shapes: Shape[];
}
