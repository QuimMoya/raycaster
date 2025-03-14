import { Vector } from './node_modules/web-ifc/web-ifc-api-node.d';
import * as THREE from "three";
import * as WEBIFC from "web-ifc";
import * as FRAGS from "@thatopen/fragments";
import { CurveArc } from "./geometries/arc";

export class CivilReader {
  defLineMat = new THREE.LineBasicMaterial({ color: 0xffffff });

  read(webIfc: WEBIFC.IfcAPI) {
    const IfcAlignment = webIfc.GetAllAlignments(0);
    const IfcCrossSection2D = webIfc.GetAllCrossSections2D(0);
    const IfcCrossSection3D = webIfc.GetAllCrossSections3D(0);

    console.log(IfcAlignment);

    const civilItems = {
      IfcAlignment,
      IfcCrossSection2D,
      IfcCrossSection3D,
    };

    return this.get(webIfc, civilItems);
  }

  get(webIfc: WEBIFC.IfcAPI, civilItems: any) {
    if (civilItems.IfcAlignment) {
      const alignments = new Map<number, FRAGS.Alignment>();

      for (const ifcAlign of civilItems.IfcAlignment) {
        const alignment = new FRAGS.Alignment();
        alignment.absolute = this.getCurves(webIfc, ifcAlign.curve3D, alignment);
        alignment.horizontal = this.getCurves(webIfc, ifcAlign.horizontal, alignment);
        alignment.vertical = this.getCurves(webIfc, ifcAlign.vertical, alignment);
        alignments.set(alignments.size, alignment);
      }

      return { alignments, coordinationMatrix: new THREE.Matrix4() };
    }
    return undefined;
  }

  private getCurves(webIfc: WEBIFC.IfcAPI, ifcAlignData: any, alignment: FRAGS.Alignment) {
    const curves: FRAGS.CivilCurve[] = [];
    let index = 0;
    for (const curve of ifcAlignData) {
      const data = {} as { [key: string]: string };
      if (curve.data) {
        for (const entry of curve.data) {
          const [key, value] = entry.split(": ");
          const numValue = parseFloat(value);
          data[key] = numValue || value;
        }
      }

      let { points } = curve;

      if (curve.data && curve.data.length > 4 && curve.data[1].includes("CIRCULARARC")) {
        const arc = new CurveArc(webIfc);
        const rad = parseFloat(curve.data[2].split(":")[1].trim());
        const srad = parseFloat(curve.data[3].split(":")[1].trim());
        const erad = parseFloat(curve.data[4].split(":")[1].trim());
        arc.radiusX = rad;
        arc.radiusY = rad;
        arc.endRad = erad;
        arc.startRad = srad;
        arc.startPosition = curve.points[0];
        arc.update(webIfc);
        
        points = [];
        console.log(arc.mesh.geometry.attributes.position);

        for(let i = 0; i < arc.mesh.geometry.attributes.position.count; i++)
        {
          points.push({
            x: arc.mesh.geometry.attributes.position.getX(i), 
            y: arc.mesh.geometry.attributes.position.getY(i), 
            z: arc.mesh.geometry.attributes.position.getZ(i)} );
        }
    }
    else
    {
      points=[];
    }

      for (let i = 1; i < points.length; i++) {
        points[i].x -= points[0].x;
        points[i].y -= points[0].y;
        points[i].z -= points[0].z;
      }

      points[0] = new THREE.Vector3(0,0,0);
      
      const array = new Float32Array(points.length * 3);
      for (let i = 0; i < points.length; i++) {
        const { x, y, z } = points[i];
        array[i * 3] = x;
        array[i * 3 + 1] = y;
        array[i * 3 + 2] = z || 0;
      }

      const attr = new THREE.BufferAttribute(array, 3);
      const geometry = new THREE.EdgesGeometry();
      geometry.setAttribute("position", attr);

      const mesh = new FRAGS.CurveMesh(
        index,
        data,
        alignment,
        geometry,
        this.defLineMat,
      );

      console.log(mesh.curve);

      curves.push(mesh.curve);
      index++;
    }
    return curves;
  }
}
