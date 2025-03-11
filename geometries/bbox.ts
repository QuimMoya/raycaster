import { BimGeometry } from "./bim-geometry";
import {AABB} from "web-ifc";
import * as WEBIFC from "web-ifc";
import * as THREE from "three";

export class Bbox extends BimGeometry {

    core: AABB;

    min = new THREE.Vector3(0, 0, 0);
    max = new THREE.Vector3(1, 1, 1);

    constructor(api: WEBIFC.IfcAPI) {
        super();
        this.core = api.CreateAABB() as AABB;
        this.update(api);
    }

    update(api: WEBIFC.IfcAPI): void {
        const {x: minX, y: minY, z: minZ} = this.min;
        const {x: maxX, y: maxY, z: maxZ} = this.max;
        this.core.SetValues(minX, minY, minZ, maxX, maxY, maxZ);
        super.update(api);
    }
}