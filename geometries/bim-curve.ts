import * as THREE from "three";
import * as WEBIFC from "web-ifc";

export class BimCurve {
  core: any;

  mesh = new THREE.Line(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({ color: "red" })
  );

  constructor() {}

  update() {
    const buffers = this.core.GetBuffers();
    const vertexSize = buffers.fvertexData.size();
    const vertices = new Float32Array(vertexSize);
    for (let i = 0; i < vertexSize; i++) {
      vertices[i] = buffers.fvertexData.get(i);
    }

    const { geometry } = this.mesh;
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  }
}
