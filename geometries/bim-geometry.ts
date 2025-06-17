import * as THREE from "three";
import * as WEBIFC from "web-ifc";

export class BimGeometry {
  core: any;

  mesh = new THREE.Mesh(
    new THREE.BufferGeometry(),
    new THREE.MeshLambertMaterial({ color: "red", side: 2 })
  );

  constructor() {}

  update(api: WEBIFC.IfcAPI) {
    const buffers = this.core.GetBuffers();
    const vertexSize = buffers.fvertexData.size();
    const vertices = new Float32Array(vertexSize);
    for (let i = 0; i < vertexSize; i++) {
      vertices[i] = buffers.fvertexData.get(i);
    }

    const indexSize = buffers.indexData.size();
    const indices: number[] = [];
    for (let i = 0; i < indexSize; i++) {
      indices[i] = buffers.indexData.get(i);
    }

    const { geometry } = this.mesh;
    geometry.setIndex(indices);
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

    geometry.computeVertexNormals();
  }
}
