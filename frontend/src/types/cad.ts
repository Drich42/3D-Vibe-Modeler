export interface CADModelSpec {
  units: 'mm' | 'cm';
  base_object: {
    type: 'cube' | 'sphere' | 'cylinder';
    width?: number;
    depth?: number;
    height?: number;
    diameter?: number;
  };
}
