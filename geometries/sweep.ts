import { BimGeometry } from "./bim-geometry";
import { Sweep, Point, Curve } from "web-ifc";
import * as WEBIFC from "web-ifc";
import * as THREE from "three";
import { Profile } from "./profile";

export class Sweeping extends BimGeometry {
  core: Sweep;
  close = false;
  rotate90 = false;
  optimize = false;
  scaling = 1.0;
  lenght = 10.0;

  profile: Profile;
  rail = [
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 0, z: this.lenght },
    { x: 2, y: 2, z: this.lenght },
    { x: 3, y: 3, z: this.lenght + 3 },
    { x: 0, y: 5, z: this.lenght + 5 },
  ];
  initialNormal = [{ x: 0, y: 0, z: 0 }];

  constructor(api: WEBIFC.IfcAPI) {
    super();
    this.core = api.CreateSweep() as Sweep;
    this.profile = new Profile(api);
    this.update(api);
  }

  update(api: WEBIFC.IfcAPI): void {
    // Define a square profile

    this.profile.curve.points = [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 1, y: 1, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
    ];

    this.rail = [
        { x: 0, y: 0, z: 0 },
        { x: 0, y: 0, z: this.lenght },
        { x: 2, y: 2, z: this.lenght },
        { x: 3, y: 3, z: this.lenght + 3 },
        { x: 0, y: 5, z: this.lenght + 5 },
      ];

    // ✅ Convert profile.points to a flat list of numbers

    const profilePoints = new api.wasmModule.DoubleVector(); // Flat vector

    this.profile.curve.points.forEach(p => {
        profilePoints.push_back(p.x);
        profilePoints.push_back(p.y);
        profilePoints.push_back(p.z);
    });

    // ✅ Convert `dir` to a `DoubleVector`
    const dirPoint = new api.wasmModule.DoubleVector();

    this.rail.forEach(p => {
        dirPoint.push_back(p.x);
        dirPoint.push_back(p.y);
        dirPoint.push_back(p.z);
    });

    const iniNormal = new api.wasmModule.DoubleVector();

    this.initialNormal.forEach(p => {
        iniNormal.push_back(p.x);
        iniNormal.push_back(p.y);
        iniNormal.push_back(p.z);
    });

    this.core.SetValues(this.scaling, this.close, profilePoints, dirPoint, iniNormal, this.rotate90, this.optimize);

    super.update(api);
  }
}
