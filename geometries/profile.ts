import * as THREE from "three";
import { BimGeometry } from "./bim-geometry";
import { ProfileSection, Curve } from "web-ifc";
import * as WEBIFC from "web-ifc";
import { Extrude } from "./extrude";

export class Profile extends BimGeometry {
    pType = 0;
    profileWidth = 0.2;
    profileDepth = 0.2;
    profileThick = 0.002;
    profileFlangeThick = 0.002;
    profileRadius = 0.001;
    radius = 0.01;
    slope = 0.001;
    curve: Curve = { points: [], userData: [], arcSegments: [] };

    transform = new THREE.Object3D();

    private _tempPoint = new THREE.Vector3();

    constructor(api: WEBIFC.IfcAPI) {
        super();
        this.core = api.CreateProfile() as ProfileSection;
        this.update(api);
    }

    update(api: WEBIFC.IfcAPI): void {
        // Define a square profile

        const placement = new api.wasmModule.DoubleVector(); // Flat vector

        // 1 0 0 0
        // 0 1 0 0
        // 0 0 1 0
        // 0 0 0 1

        for(const element of this.transform.matrix.elements) {
            placement.push_back(element);
        }
        
        // placement.push_back(1);
        // placement.push_back(0);
        // placement.push_back(0);
        // placement.push_back(0);

        // placement.push_back(0);
        // placement.push_back(1);
        // placement.push_back(0);
        // placement.push_back(0);

        // placement.push_back(0);
        // placement.push_back(0);
        // placement.push_back(1);
        // placement.push_back(0);

        // placement.push_back(0);
        // placement.push_back(0);
        // placement.push_back(0);
        // placement.push_back(1);

        this.core.SetValues(this.pType, this.profileWidth, this.profileDepth, this.profileThick, this.profileFlangeThick, false, this.profileRadius, this.radius, this.slope, placement);

        super.update(api);
    }
}

