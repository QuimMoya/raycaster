import * as THREE from "three";
import * as WEBIFC from "web-ifc";
import {
  Extrusion,
  ExtrusionData,
  Profile,
  ProfileData,
  BooleanOperation,
  BooleanOperationData,
} from "./src";

export type ImplicitGeometryType = WEBIFC.Extrusion;

export class GeometryEngine {
  extrusion: Extrusion;
  profile: Profile;
  boolean: BooleanOperation;
  api: WEBIFC.IfcAPI;

  constructor(api: WEBIFC.IfcAPI) {
    this.api = api;
    this.extrusion = new Extrusion(api);
    this.profile = new Profile(api);
    this.boolean = new BooleanOperation(api);
  }

  getExtrusion(geometry: THREE.BufferGeometry, data: ExtrusionData) {
    const buffers = this.extrusion.get(this.api, data);
    this.applyMesh(geometry, buffers);
  }

  getProfile(geometry: THREE.BufferGeometry, data: ProfileData) {
    const buffers = this.profile.get(this.api, data);
    this.applyCurve(geometry, buffers);
  }

  getBoolean(geometry: THREE.BufferGeometry, data: BooleanOperationData) {
    const buffers = this.boolean.get(this.api, data);
    this.applyMesh(geometry, buffers);
  }

  getProfilePoints(data: ProfileData) {
    // TODO: Fix WEBIFC.Buffer.fvertexData type
    const buffers = this.profile.get(this.api, data) as any;
    const vertexSize = buffers.fvertexData.size();
    const points: number[] = [];
    for (let i = 0; i < vertexSize; i++) {
      const value = buffers.fvertexData.get(i);
      points.push(value);
    }
    return points;
  }

  private applyMesh(geometry: THREE.BufferGeometry, buffers: any) {
    // const buffers = this.core.GetBuffers();
    const vertexSize = buffers.fvertexData.size();
    const vertices = new Float32Array(vertexSize);
    for (let i = 0; i < vertexSize; i++) {
      vertices[i] = buffers.fvertexData.get(i);
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

    const indexSize = buffers.indexData.size();
    const indices: number[] = [];
    for (let i = 0; i < indexSize; i++) {
      indices[i] = buffers.indexData.get(i);
    }

    geometry.setIndex(indices);

    const normalArray = new Float32Array(vertexSize).fill(0);
    geometry.setAttribute("normal", new THREE.BufferAttribute(normalArray, 3));
    geometry.computeVertexNormals();
  }

  private applyCurve(geometry: THREE.BufferGeometry, buffers: any) {
    const vertexSize = buffers.fvertexData.size();
    const vertices = new Float32Array(vertexSize);
    for (let i = 0; i < vertexSize; i++) {
      vertices[i] = buffers.fvertexData.get(i);
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

    const indices: number[] = [];
    for (let i = 0; i < vertexSize / 3 - 1; i++) {
      indices.push(i, i + 1);
    }
    geometry.setIndex(indices);
  }
}
