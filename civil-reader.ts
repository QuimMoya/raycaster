import { CurveClothoid } from './geometries/clothoid';
import { Vector } from "./node_modules/web-ifc/web-ifc-api-node.d";
import * as THREE from "three";
import * as WEBIFC from "web-ifc";
import * as FRAGS from "@thatopen/fragments";
import { CurveArc } from "./geometries/arc";

export class CivilReader {
  defLineMat = new THREE.LineBasicMaterial({ color: 0xffffff });
  redLineMat = new THREE.LineBasicMaterial({
    color: 0xff0000,
    side: THREE.DoubleSide,
  });

  read(webIfc: WEBIFC.IfcAPI) {
    const IfcAlignment = webIfc.GetAllAlignments(0);
    const IfcCrossSection2D = webIfc.GetAllCrossSections2D(0);
    const IfcCrossSection3D = webIfc.GetAllCrossSections3D(0);

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
        alignment.absolute = this.getCurves(
          webIfc,
          ifcAlign.curve3D,
          alignment
        );
        alignment.horizontal = this.getCurves(
          webIfc,
          ifcAlign.horizontal,
          alignment
        );
        alignment.vertical = this.getCurves(
          webIfc,
          ifcAlign.vertical,
          alignment
        );
        alignments.set(alignments.size, alignment);
      }


      for (const ifcAlign of civilItems.IfcAlignment)
      {
        const alignment3D = webIfc.wasmModule.CreateAlignment() as WEBIFC.Alignment;

        const horAlign = new webIfc.wasmModule.DoubleVector();
        for (const curve of ifcAlign.horizontal) {
            for (let p = 0; p < curve.points.length; p++) {
                const pt = curve.points[p];
                horAlign.push_back(pt.x);
                horAlign.push_back(pt.y);
                horAlign.push_back(pt.z);
            }
        }

        const verAlign = new webIfc.wasmModule.DoubleVector();
        for (const curve of ifcAlign.vertical) {
            for (let p = 0; p < curve.points.length; p++) {
                const pt = curve.points[p];
                verAlign.push_back(pt.x);
                verAlign.push_back(pt.y);
                verAlign.push_back(pt.z);
            }
        }

        const curve3DList: any[] = [];
        alignment3D.SetValues(horAlign, verAlign);
        const buffers = alignment3D.GetBuffers();
        const vertexSize = buffers.fvertexData.size();
        const vertices = new Float32Array(vertexSize);
        for (let i = 0; i < vertexSize; i++) {
            vertices[i] = buffers.fvertexData.get(i);
        }       
        const indexSize = buffers.indexData.size();
        const indices: number[] = [];
        for (let i = 0; i < indexSize; i++) {
            indices[i] = buffers.indexData.get(i);
        }
        for(let i =0; i < vertexSize; i+=3)
        {
            const newPoint = { x: vertices[i], y: vertices[i + 1], z: vertices[i + 2] };
            curve3DList.push(newPoint);
        }
      }

      return { alignments, coordinationMatrix: new THREE.Matrix4() };
    }
    return undefined;
  }

  private getCurves(
    webIfc: WEBIFC.IfcAPI,
    ifcAlignData: any,
    alignment: FRAGS.Alignment
  ) {
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

      const newPoints: any[] = [];

      if (
        curve.data &&
        curve.data.length > 4 &&
        curve.data[1].includes("CIRCULARARC")
      ) {
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

        for (let i = 0; i < arc.mesh.geometry.attributes.position.count; i++) {
          newPoints.push({
            x: arc.mesh.geometry.attributes.position.getX(i),
            y: arc.mesh.geometry.attributes.position.getY(i),
            z: arc.mesh.geometry.attributes.position.getZ(i),
          });
        }
      }

      if (
        curve.data &&
        curve.data.length > 5 &&
        curve.data[1].includes("CLOTHOID")
      ) {
        const clot = new CurveClothoid(webIfc);
        const rad = parseFloat(curve.data[2].split(":")[1].trim());
        const srad = parseFloat(curve.data[3].split(":")[1].trim());
        const erad = parseFloat(curve.data[4].split(":")[1].trim());
        const slenght = parseFloat(curve.data[5].split(":")[1].trim());
        clot.ifcStartDirection = rad;
        clot.StartRadiusOfCurvature = srad;
        clot.EndRadiusOfCurvature = erad;
        clot.SegmentLength = slenght;
        clot.startPoint = curve.points[0];
        clot.update(webIfc);

        for (let i = 0; i < clot.mesh.geometry.attributes.position.count; i++) {
          newPoints.push({
            x: clot.mesh.geometry.attributes.position.getX(i),
            y: clot.mesh.geometry.attributes.position.getY(i),
            z: clot.mesh.geometry.attributes.position.getZ(i),
          });
        }
      }

      
      let finalPoints = newPoints;
      if(newPoints.length > 1)
      {
        finalPoints = this.alignCurves(points, newPoints);
      }

      const geometry = this.geometryFromPoints(points);

      const geometry2 = this.geometryFromPoints(finalPoints);

      const mewMesh = new FRAGS.CurveMesh(
        index,
        data,
        alignment,
        geometry2,
        this.redLineMat
      );

      const mesh = new FRAGS.CurveMesh(
        index,
        data,
        alignment,
        geometry,
        this.defLineMat
      );

      mesh.curve.mesh.attach(mewMesh);

      curves.push(mesh.curve);
      index++;
    }
    return curves;
  }

  private alignCurves(curve1: any[], curve2: any[]): any[] {
    if (curve1.length < 2 || curve2.length < 2) {
        throw new Error("Les corbes han de tenir almenys dos punts.");
    }

    // Punt inicial i final de la primera corba
    const P1i = curve1[0], P1f = curve1[curve1.length - 1];
    // Punt inicial i final de la segona corba
    const P2i = curve2[0], P2f = curve2[curve2.length - 1];

    // Vectors de direcció de les corbes
    const v1 = { x: P1f.x - P1i.x, y: P1f.y - P1i.y };
    const v2 = { x: P2f.x - P2i.x, y: P2f.y - P2i.y };

    // 1️⃣ Calcular translació
    const translation = { x: P1i.x - P2i.x, y: P1i.y - P2i.y };

    // 2️⃣ Calcular angle de rotació
    const angle1 = Math.atan2(v1.y, v1.x);
    const angle2 = Math.atan2(v2.y, v2.x);
    const rotationAngle = angle1 - angle2;

    // 3️⃣ Aplicar transformació a tota la corba 2
    let transformedCurve = curve2.map(point => {
        // Traslladar al nou origen
        const translated = { x: point.x + translation.x, y: point.y + translation.y };

        // Aplicar rotació
        const rotated = {
            x: P1i.x + (translated.x - P1i.x) * Math.cos(rotationAngle) - (translated.y - P1i.y) * Math.sin(rotationAngle),
            y: P1i.y + (translated.x - P1i.x) * Math.sin(rotationAngle) + (translated.y - P1i.y) * Math.cos(rotationAngle)
        };

        return rotated;
    });

    // 4️⃣ Comprovar si hi ha una reflexió (simetria)
    const midpoint1 = this.getCurveMidpoint(curve1);
    const midpoint2 = this.getCurveMidpoint(transformedCurve);
    const midPoint = {x: (P1i.x + P1f.x) / 2, y: (P1i.y + P1f.y) / 2};
    
    // Si el punt mitjà no coincideix, cal invertir la corba
    if (!this.arePointsClose(midpoint1, midpoint2)) {
        transformedCurve = transformedCurve.map(point => ({
            x: 2 * midPoint.x - point.x,  // Reflexió respecte al punt mitjà
            y: 2 * midPoint.y - point.y
        }));
    }

    return transformedCurve;
  }

  /**
   * Calcula el punt mitjà d'una corba.
   */
  private getCurveMidpoint(curve: any[]): any {
      const sum = curve.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
      return { x: sum.x / curve.length, y: sum.y / curve.length };
  }

  /**
   * Comprova si dos punts estan prou a prop per considerar-los iguals.
   */
  private arePointsClose(p1: any, p2: any, tolerance: number = 0.01): boolean {
      return Math.abs(p1.x - p2.x) < tolerance && Math.abs(p1.y - p2.y) < tolerance;
  }

  private geometryFromPoints(points: any) {
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
    return geometry;
  }
}
