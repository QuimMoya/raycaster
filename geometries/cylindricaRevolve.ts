import { BimGeometry } from "./bim-geometry";
import { CylindricalRevolve, Point, Curve } from "web-ifc";
import * as WEBIFC from "web-ifc";
import * as THREE from "three";

export class CylindricalRevolution extends BimGeometry {
  core: CylindricalRevolve;
  numRots = 12;
  startDegrees = 0.0;
  endDegrees = 180.0;
  minZ = -10;
  maxZ = 10;
  radius = 4;

  transform = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1];

  constructor(api: WEBIFC.IfcAPI) {
    super();
    this.core = api.CreateCylindricalRevolution() as CylindricalRevolve;
    this.update(api);
  }

  update(api: WEBIFC.IfcAPI): void {
    const transformation = new api.wasmModule.DoubleVector(); // Flat vector
    this.transform.forEach((p) => {
        transformation.push_back(p);
    });

    this.core.SetValues(
      transformation,
      this.startDegrees,
      this.endDegrees,
      this.minZ,
      this.maxZ,
      this.numRots,
      this.radius
    );

    super.update(api);
  }
}
