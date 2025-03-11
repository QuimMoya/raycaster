import {Parabola} from "web-ifc";
import * as WEBIFC from "web-ifc";
import * as THREE from "three";
import { BimCurve } from "./bim-curve";

export class CurveParabola extends BimCurve {

    core: Parabola;

    segments: number = 12;
    startPoint = new THREE.Vector3(0, 0, 0);
    horizontalLength: number = 10;
    startHeight: number = 2;
    startGradient: number = 5;
    endGradient: number = 0;

    constructor(api: WEBIFC.IfcAPI) {
        super();
        this.core = api.CreateParabola() as Parabola;
        this.update(api);
    }

    update(api: WEBIFC.IfcAPI): void {
        const { x: startX, y: startY, z: startZ } = this.startPoint;

        this.core.SetValues(
            this.segments, 
            startX, 
            startY, 
            startZ, 
            this.horizontalLength, 
            this.startHeight, 
            this.startGradient, 
            this.endGradient
        );

        super.update(api);
    }
}