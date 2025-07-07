import { BimGeometry } from "./bim-geometry";
import { Revolution, Point, Curve } from "web-ifc";
import * as WEBIFC from "web-ifc";
import * as THREE from "three";
import { Profile } from "./profile";

export class Revolve extends BimGeometry {
  core: Revolution;
  numRots = 12;
  startDegrees = 0.0;
  endDegrees = 180.0;

  profile: Profile;
  transform = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1];

  constructor(api: WEBIFC.IfcAPI) {
    super();
    this.core = api.CreateRevolution() as Revolution;
    this.profile = new Profile(api);
    this.update(api);
  }

  update(api: WEBIFC.IfcAPI): void {
    // Define a square profile

    this.profile.curve.points = [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 1 },
      { x: 1, y: 0, z: 1 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
    ];

    // ✅ Convert profile.points to a flat list of numbers

    const profilePoints = new api.wasmModule.DoubleVector(); // Flat vector

    this.profile.curve.points.forEach((p) => {
      profilePoints.push_back(p.x);
      profilePoints.push_back(p.y);
      profilePoints.push_back(p.z);
    });

    const transformation = new api.wasmModule.DoubleVector(); // Flat vector

    this.transform.forEach((p) => {
        transformation.push_back(p);
    });

    this.core.SetValues(
      profilePoints,
      transformation,
      this.startDegrees,
      this.endDegrees,
      this.numRots
    );

    super.update(api);
  }
}
