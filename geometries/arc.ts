import {Arc} from "web-ifc";
import * as WEBIFC from "web-ifc";
import * as THREE from "three";
import { BimCurve } from "./bim-curve";

export class CurveArc extends BimCurve {

    core: Arc;

    radiusX: number = 1;
    radiusY: number = 1;
    numSegments: number = 12;
    placement: THREE.Matrix3 = new THREE.Matrix3();  // 3x3 matrix equivalent of glm::dmat3
    startRad?: number = 0;
    endRad?: number = 3.1416;
    swap?: boolean = false;
    normalToCenterEnding?: boolean = false

    constructor(api: WEBIFC.IfcAPI) {
        super();
        this.core = api.CreateArc() as Arc;
        this.update(api);
    }

    update(api: WEBIFC.IfcAPI): void {
        // Create a flat vector for the matrix values
        const placementValues = new api.wasmModule.DoubleVector(); 

        // THREE.Matrix3 stores values in a flat 1D array
        this.placement.elements.forEach(value => {
            placementValues.push_back(value);
        });

        this.core.SetValues(
            this.radiusX,
            this.radiusY,
            this.numSegments,
            placementValues,
            this.startRad,
            this.endRad,
            this.swap,
            this.normalToCenterEnding
        );

        super.update(api);
    }
}