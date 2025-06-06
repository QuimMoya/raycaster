import { BimGeometry } from "./bim-geometry";
import { Extrusion, Point, Curve } from "web-ifc";
import * as WEBIFC from "web-ifc";
import * as THREE from "three";

export class Wall extends BimGeometry {
  core: Extrusion;

  profile: Curve = { points: [], userData: [], arcSegments: [] };
  elevationY = 1;
  startX = 3;
  startZ = 5;
  endX = 2;
  endZ = 1;
  height = 1;
  thickness = 0.3;
  dir = new THREE.Vector3(0, 1, 0);
  cuttingPlaneNormal = new THREE.Vector3(0, 1, 0);
  cuttingPlanePos = new THREE.Vector3(0, this.elevationY, 0);
  offset = 0;

  constructor(api: WEBIFC.IfcAPI) {
    super();
    this.core = api.CreateExtrusion() as Extrusion;
    this.update(api);
  }

  update(api: WEBIFC.IfcAPI): void {

    const endVec = new THREE.Vector3(this.endX, this.elevationY, this.endZ);
    const startVec = new THREE.Vector3(this.startX, this.elevationY, this.startZ);
    const horizontalVec = new THREE.Vector3(this.endX - this.startX, this.elevationY, this.endZ - this.startZ);
    const yAxis = new THREE.Vector3(0, 1, 0);
    const thicknessDir = new THREE.Vector3().crossVectors(horizontalVec, yAxis).normalize();


    const offsetVec = thicknessDir.clone().multiplyScalar(this.offset);
    endVec.add(offsetVec);
    startVec.add(offsetVec);

    const delta = thicknessDir.clone().multiplyScalar(this.thickness / 2);
    const rectanglePoints =
      [
        startVec.clone().add(delta),
        endVec.clone().add(delta),
        endVec.clone().sub(delta),
        startVec.clone().sub(delta)
      ];
    rectanglePoints.push(rectanglePoints[0]); // Close the loop
    this.profile.points = rectanglePoints.map(p => { return { x: p.x, y: p.y, z: p.z } });

    // ✅ Convert profile.points to a flat list of numbers
    const profilePoints = new api.wasmModule.DoubleVector(); // Flat vector

    this.profile.points.forEach(p => {
      profilePoints.push_back(p.x);
      profilePoints.push_back(p.y);
      profilePoints.push_back(p.z);
    });

    // ✅ Convert `dir` to a `DoubleVector`
    const dirPoint = new api.wasmModule.DoubleVector();
    dirPoint.push_back(this.dir.x);
    dirPoint.push_back(this.dir.y);
    dirPoint.push_back(this.dir.z);
    // ✅ Convert `cuttingPlaneNormal` to a `DoubleVector`
    const cuttingPlaneNormal = new api.wasmModule.DoubleVector();
    cuttingPlaneNormal.push_back(this.cuttingPlaneNormal.x);
    cuttingPlaneNormal.push_back(this.cuttingPlaneNormal.y);
    cuttingPlaneNormal.push_back(this.cuttingPlaneNormal.z);
    // ✅ Convert `cuttingPlanePos` to a `DoubleVector`
    this.cuttingPlanePos = new THREE.Vector3(0, this.elevationY, 0);
    const cuttingPlanePos = new api.wasmModule.DoubleVector();
    cuttingPlanePos.push_back(this.cuttingPlanePos.x);
    cuttingPlanePos.push_back(this.cuttingPlanePos.y);
    cuttingPlanePos.push_back(this.cuttingPlanePos.z);

    this.core.SetValues(profilePoints, dirPoint, this.height, cuttingPlaneNormal, cuttingPlanePos, true);

    super.update(api);
  }
}
