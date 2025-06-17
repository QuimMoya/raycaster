import { BimGeometry } from "./bim-geometry";
import { Extrusion, Point, Curve } from "web-ifc";
import * as WEBIFC from "web-ifc";
import * as THREE from "three";

export class Extrude extends BimGeometry {
  core: Extrusion;
  zv = 0;
  len = 1;
  cap = true;
  cuttingPlanePos = new THREE.Vector3(0, 0, 0);
  cuttingPlaneNormal = new THREE.Vector3(0, 0, 0);
  profile: Curve = { points: [], userData: [], arcSegments: [] };
  holes: Curve[] = [];
  dir = new THREE.Vector3(1, 1, 1);

  constructor(api: WEBIFC.IfcAPI) {
    super();
    this.core = api.CreateExtrusion() as Extrusion;
    this.update(api);
  }

  update(api: WEBIFC.IfcAPI): void {
    // Define a square profile

    this.profile.points = [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 1 },
      { x: 1, y: 0, z: 1 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
    ];

    this.holes = [
      {
        points: [
          { x: 0.2, y: 0, z: 0.2 },
          { x: 0.2, y: 0, z: 0.3 },
          { x: 0.3, y: 0, z: 0.3 },
          { x: 0.3, y: 0, z: 0.2 },
          { x: 0.2, y: 0, z: 0.2 },
        ],
        userData: [],
        arcSegments: [],
      },
      {
        points: [
          { x: 0.7, y: 0, z: 0.8 },
          { x: 0.8, y: 0, z: 0.8 },
          { x: 0.8, y: 0, z: 0.7 },
          { x: 0.7, y: 0, z: 0.7 },
          { x: 0.7, y: 0, z: 0.8 },
        ],
        userData: [],
        arcSegments: [],
      },
    ];

    this.core.ClearHoles();

    // ✅ Convert profile.points to a flat list of numbers

    const profilePoints = new api.wasmModule.DoubleVector(); // Flat vector

    this.profile.points.forEach((p) => {
      profilePoints.push_back(p.x);
      profilePoints.push_back(p.y);
      profilePoints.push_back(p.z);
    });

    // Loop through each hole
    this.holes.forEach((hole) => {
      const holeVector = new api.wasmModule.DoubleVector();

      hole.points.forEach((p) => {
        holeVector.push_back(p.x);
        holeVector.push_back(p.y);
        holeVector.push_back(p.z);
      });

      // Send the hole to the core extrusion
      this.core.SetHoles(holeVector);
    });

    // ✅ Convert `dir` to a `DoubleVector`
    const dirPoint = new api.wasmModule.DoubleVector();
    dirPoint.push_back(this.dir.x);
    dirPoint.push_back(this.dir.y);
    dirPoint.push_back(this.dir.z);

    const cuttingPlaneNormal = new api.wasmModule.DoubleVector();
    cuttingPlaneNormal.push_back(this.cuttingPlaneNormal.x);
    cuttingPlaneNormal.push_back(this.cuttingPlaneNormal.y);
    cuttingPlaneNormal.push_back(this.cuttingPlaneNormal.z);

    const cuttingPlanePos = new api.wasmModule.DoubleVector();
    cuttingPlanePos.push_back(this.cuttingPlanePos.x);
    cuttingPlanePos.push_back(this.cuttingPlanePos.y);
    cuttingPlanePos.push_back(this.cuttingPlanePos.z);

    this.core.SetValues(
      profilePoints,
      dirPoint,
      this.len,
      cuttingPlaneNormal,
      cuttingPlanePos,
      this.cap
    );

    super.update(api);
  }
}
