import { VertexData } from '@babylonjs/core';
import earcut from 'earcut';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function jscadToBabylon(geom: any): VertexData {
  const positions: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];
  let vertexOffset = 0;

  if (!geom || !geom.polygons) return new VertexData();

  for (const poly of geom.polygons) {
    const vertices = poly.vertices;
    if (vertices.length < 3) continue;

    // 1. Calculate normal for the polygon
    const p0 = vertices[0];
    const p1 = vertices[1];
    const p2 = vertices[2];

    const u = [p1[0]-p0[0], p1[1]-p0[1], p1[2]-p0[2]];
    const v = [p2[0]-p0[0], p2[1]-p0[1], p2[2]-p0[2]];

    let nx = u[1]*v[2] - u[2]*v[1];
    let ny = u[2]*v[0] - u[0]*v[2];
    let nz = u[0]*v[1] - u[1]*v[0];

    const len = Math.sqrt(nx*nx + ny*ny + nz*nz) || 1;
    nx /= len; ny /= len; nz /= len;

    // 2. Project to 2D plane by dropping the axis with the largest normal component
    const absN = [Math.abs(nx), Math.abs(ny), Math.abs(nz)];
    const maxIdx = absN[0] > absN[1] ? (absN[0] > absN[2] ? 0 : 2) : (absN[1] > absN[2] ? 1 : 2);

    const flatCoords: number[] = [];
    for (const vtx of vertices) {
      if (maxIdx === 0) flatCoords.push(vtx[1], vtx[2]);
      else if (maxIdx === 1) flatCoords.push(vtx[0], vtx[2]);
      else flatCoords.push(vtx[0], vtx[1]);

      positions.push(vtx[0], vtx[1], vtx[2]);
      normals.push(nx, ny, nz);
    }

    // 3. Triangulate with Earcut
    const triangles = earcut(flatCoords);

    // 4. Earcut projection might flip the winding order.
    // We can check if the calculated normal of the first triangulated face matches our poly normal.
    if (triangles.length >= 3) {
      const t0 = triangles[0], t1 = triangles[1], t2 = triangles[2];
      const v0 = vertices[t0], v1 = vertices[t1], v2 = vertices[t2];

      const tu = [v1[0]-v0[0], v1[1]-v0[1], v1[2]-v0[2]];
      const tv = [v2[0]-v0[0], v2[1]-v0[1], v2[2]-v0[2]];
      const tnx = tu[1]*tv[2] - tu[2]*tv[1];
      const tny = tu[2]*tv[0] - tu[0]*tv[2];
      const tnz = tu[0]*tv[1] - tu[1]*tv[0];

      // Dot product to check if normals point in the same direction
      const dot = nx*tnx + ny*tny + nz*tnz;

      for (let i = 0; i < triangles.length; i += 3) {
        if (dot < 0) {
          // Flipped, reverse the indices for this triangle
          indices.push(
            vertexOffset + triangles[i+2],
            vertexOffset + triangles[i+1],
            vertexOffset + triangles[i]
          );
        } else {
          indices.push(
            vertexOffset + triangles[i],
            vertexOffset + triangles[i+1],
            vertexOffset + triangles[i+2]
          );
        }
      }
    }

    vertexOffset += vertices.length;
  }

  const vertexData = new VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = normals;
  return vertexData;
}
