import { BimGeometry } from "./bim-geometry";
import { ProfileI, Curve } from "web-ifc";
import * as WEBIFC from "web-ifc";
import { Extrude } from "./extrude";

export class Profile_I extends BimGeometry {

    profileWidth = 0.2;
    profileDepth = 0.2;
    profileThick = 0.002;
    profileFlangeThick = 0.002;
    profileRadius = 0.001;
    profile: Curve = { points: [], userData: [], arcSegments: [] };

    constructor(api: WEBIFC.IfcAPI) {
        super();
        this.core = api.CreateProfileI() as ProfileI;
        this.update(api);
    }

    update(api: WEBIFC.IfcAPI): void {
        // Define a square profile

        const placement = new api.wasmModule.DoubleVector(); // Flat vector

        placement.push_back(1);
        placement.push_back(0);
        placement.push_back(0);
        placement.push_back(0);

        placement.push_back(0);
        placement.push_back(1);
        placement.push_back(0);
        placement.push_back(0);

        placement.push_back(0);
        placement.push_back(0);
        placement.push_back(1);
        placement.push_back(0);

        placement.push_back(0);
        placement.push_back(0);
        placement.push_back(0);
        placement.push_back(0);

        this.core.SetValues(this.profileWidth, this.profileDepth, this.profileThick, this.profileFlangeThick, false, this.profileRadius, placement);
        
        super.update(api);
    }
}

