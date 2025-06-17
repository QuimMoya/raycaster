import { BimGeometry } from "./bim-geometry";
import { Point, BooleanOperator } from "web-ifc";
import * as WEBIFC from "web-ifc";
import * as THREE from "three";

export class BooleanOperation extends BimGeometry {
  core: BooleanOperator;
  op = "DIFFERENCE"; // "UNION";
  offsetX = 0.3;
  offsetY = 0.3;
  offsetZ = 0.3;


  geometry: Point[];
  second: Point[][];

  constructor(api: WEBIFC.IfcAPI) {
    super();
    this.core = api.CreateBooleanOperator() as BooleanOperator;
    this.update(api);
  }

  update(api: WEBIFC.IfcAPI): void {
    // Define a square profile

    this.geometry = [
        // Bottom face (y = 0)
        { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 1, y: 0, z: 2 },
        { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 2 }, { x: 0, y: 0, z: 2 },

        // Top face (y = 1)
        { x: 0, y: 1, z: 0 }, { x: 1, y: 1, z: 2 }, { x: 1, y: 1, z: 0 },
        { x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: 2 }, { x: 1, y: 1, z: 2 },

        // Front face (z = 0)
        { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 1, y: 1, z: 0 },
        { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 1, y: 0, z: 0 },

        // Back face (z = 1)
        { x: 0, y: 0, z: 2 }, { x: 1, y: 0, z: 2 }, { x: 1, y: 1, z: 2 },
        { x: 0, y: 0, z: 2 }, { x: 1, y: 1, z: 2 }, { x: 0, y: 1, z: 2 },

        // Left face (x = 0)
        { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 2 }, { x: 0, y: 1, z: 2 },
        { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 2 }, { x: 0, y: 1, z: 0 },

        // Right face (x = 1)
        { x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 1, y: 1, z: 2 },
        { x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 2 }, { x: 1, y: 0, z: 2 },
    ];

    this.second = [
        [
        // Bottom face (y = 0)
        { x: 0 + this.offsetX, y: 0 + this.offsetY, z: 0 + this.offsetZ }, { x: 1 + this.offsetX, y: 0 + this.offsetY, z: 0 + this.offsetZ }, { x: 1 + this.offsetX, y: 0 + this.offsetY, z: 1 + this.offsetZ },
        { x: 0 + this.offsetX, y: 0 + this.offsetY, z: 0 + this.offsetZ }, { x: 1 + this.offsetX, y: 0 + this.offsetY, z: 1 + this.offsetZ }, { x: 0 + this.offsetX, y: 0 + this.offsetY, z: 1 + this.offsetZ },

        // Top face (y = 1)
        { x: 0 + this.offsetX, y: 1 + this.offsetY, z: 0 + this.offsetZ }, { x: 1 + this.offsetX, y: 1 + this.offsetY, z: 1 + this.offsetZ }, { x: 1 + this.offsetX, y: 1 + this.offsetY, z: 0 + this.offsetZ },
        { x: 0 + this.offsetX, y: 1 + this.offsetY, z: 0 + this.offsetZ }, { x: 0 + this.offsetX, y: 1 + this.offsetY, z: 1 + this.offsetZ }, { x: 1 + this.offsetX, y: 1 + this.offsetY, z: 1 + this.offsetZ },

        // Front face (z = 0)
        { x: 0 + this.offsetX, y: 0 + this.offsetY, z: 0 + this.offsetZ }, { x: 0 + this.offsetX, y: 1 + this.offsetY, z: 0 + this.offsetZ }, { x: 1 + this.offsetX, y: 1 + this.offsetY, z: 0 + this.offsetZ },
        { x: 0 + this.offsetX, y: 0 + this.offsetY, z: 0 + this.offsetZ }, { x: 1 + this.offsetX, y: 1 + this.offsetY, z: 0 + this.offsetZ }, { x: 1 + this.offsetX, y: 0 + this.offsetY, z: 0 + this.offsetZ },

        // Back face (z = 1)
        { x: 0 + this.offsetX, y: 0 + this.offsetY, z: 1 + this.offsetZ }, { x: 1 + this.offsetX, y: 0 + this.offsetY, z: 1 + this.offsetZ }, { x: 1 + this.offsetX, y: 1 + this.offsetY, z: 1 + this.offsetZ },
        { x: 0 + this.offsetX, y: 0 + this.offsetY, z: 1 + this.offsetZ }, { x: 1 + this.offsetX, y: 1 + this.offsetY, z: 1 + this.offsetZ }, { x: 0 + this.offsetX, y: 1 + this.offsetY, z: 1 + this.offsetZ },

        // Left face (x = 0)
        { x: 0 + this.offsetX, y: 0 + this.offsetY, z: 0 + this.offsetZ }, { x: 0 + this.offsetX, y: 0 + this.offsetY, z: 1 + this.offsetZ }, { x: 0 + this.offsetX, y: 1 + this.offsetY, z: 1 + this.offsetZ },
        { x: 0 + this.offsetX, y: 0 + this.offsetY, z: 0 + this.offsetZ }, { x: 0 + this.offsetX, y: 1 + this.offsetY, z: 1 + this.offsetZ }, { x: 0 + this.offsetX, y: 1 + this.offsetY, z: 0 + this.offsetZ },

        // Right face (x = 1)
        { x: 1 + this.offsetX, y: 0 + this.offsetY, z: 0 + this.offsetZ }, { x: 1 + this.offsetX, y: 1 + this.offsetY, z: 0 + this.offsetZ }, { x: 1 + this.offsetX, y: 1 + this.offsetY, z: 1 + this.offsetZ },
        { x: 1 + this.offsetX, y: 0 + this.offsetY, z: 0 + this.offsetZ }, { x: 1 + this.offsetX, y: 1 + this.offsetY, z: 1 + this.offsetZ }, { x: 1 + this.offsetX, y: 0 + this.offsetY, z: 1 + this.offsetZ },
    ]
    ];

    // ✅ Convert profile.points to a flat list of numbers
    
    this.core.clear();

    const solidPoints = new api.wasmModule.DoubleVector(); // Flat vector

    this.geometry.forEach((p) => {
      solidPoints.push_back(p.x);
      solidPoints.push_back(p.y);
      solidPoints.push_back(p.z);
    });

    this.core.SetValues(solidPoints, this.op);

    this.second.forEach((s) => {
        const secondPoints = new api.wasmModule.DoubleVector(); // Flat vector

        s.forEach((p) => {
        secondPoints.push_back(p.x);
        secondPoints.push_back(p.y);
        secondPoints.push_back(p.z);
        });

        this.core.SetSecond(secondPoints);
    });

    super.update(api);
  }
}
