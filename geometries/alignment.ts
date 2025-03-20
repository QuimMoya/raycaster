import { BimGeometry } from "./bim-geometry";
import { Alignment } from "web-ifc";
import * as WEBIFC from "web-ifc";
import * as THREE from "three";

export class AlignmentCurve extends BimGeometry {
  core: Alignment;

  horizontal:  THREE.Vector3[];
  vertical:  THREE.Vector3[];

  constructor(api: WEBIFC.IfcAPI) {
    super();
    this.core = api.CreateAlignment() as Alignment;
    this.update(api);
  }

  update(api: WEBIFC.IfcAPI): void {

    const horizontalValues = new api.wasmModule.DoubleVector(); // Flat vector

    this.horizontal.forEach(p => {
        horizontalValues.push_back(p.x);
        horizontalValues.push_back(p.y);
        horizontalValues.push_back(p.z);
    });

    const verticalValues = new api.wasmModule.DoubleVector(); // Flat vector

    this.vertical.forEach(p => {
        verticalValues.push_back(p.x);
        verticalValues.push_back(p.y);
        verticalValues.push_back(p.z);
    });

    this.core.SetValues(horizontalValues, verticalValues);

    super.update(api);
  }
}
