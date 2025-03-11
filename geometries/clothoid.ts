import {Parabola, Clothoid} from "web-ifc";
import * as WEBIFC from "web-ifc";
import * as THREE from "three";
import { BimCurve } from "./bim-curve";

export class CurveClothoid extends BimCurve {

    core: Clothoid;

    segments: number = 12;
    startPoint = new THREE.Vector3(0, 0, 0);
    ifcStartDirection: number = 0.5;
    StartRadiusOfCurvature: number = 5;
    EndRadiusOfCurvature: number = 0;
    SegmentLength: number = 5;

    constructor(api: WEBIFC.IfcAPI) {
        super();
        this.core = api.CreateClothoid() as Clothoid;
        this.update(api);
    }

    update(api: WEBIFC.IfcAPI): void {
        const { x: startX, y: startY, z: startZ } = this.startPoint;

        this.core.SetValues(
            this.segments, 
            startX, 
            startY, 
            startZ, 
            this.ifcStartDirection, 
            this.StartRadiusOfCurvature, 
            this.EndRadiusOfCurvature, 
            this.SegmentLength
        );

        super.update(api);
    }
}