import { BimGeometry } from "./bim-geometry";
import { Extrusion, Point, Curve } from "web-ifc";
import * as WEBIFC from "web-ifc";
import * as THREE from "three";

export class Extrude extends BimGeometry {
  core: Extrusion;

  len = 1;
  profile: Curve = { points: [], userData: [], arcSegments: [] };
  dir = new THREE.Vector3(0, 0, 1);

  constructor(api: WEBIFC.IfcAPI) {
    super();
    this.core = api.CreateExtrusion() as Extrusion;
    this.update(api);
  }

  update(api: WEBIFC.IfcAPI): void {
    // Define a square profile

    this.profile.points = [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 1, y: 1, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
    ];

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

    this.core.SetValues(profilePoints, dirPoint, this.len);

    super.update(api);
  }
}
