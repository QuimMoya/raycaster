import * as WEBIFC from "web-ifc";
import * as THREE from "three";

export type BooleanOperationData = {
  type: "DIFFERENCE" | "UNION";
  target: THREE.Mesh;
  operands: THREE.Mesh[];
};

export class BooleanOperation {
  core: WEBIFC.BooleanOperator;

  private _tempPoint = new THREE.Vector3();

  constructor(api: WEBIFC.IfcAPI) {
    this.core = api.CreateBooleanOperator() as WEBIFC.BooleanOperator;
  }

  get(api: WEBIFC.IfcAPI, data: BooleanOperationData) {
    const firstPoints = this.getPointsFromMesh(api, data.target);

    this.core.SetValues(firstPoints, data.type);

    for (const object of data.operands) {
      const secondPoints = this.getPointsFromMesh(api, object);
      this.core.SetSecond(secondPoints);
    }

    const result = this.core.GetBuffers();

    this.core.clear();

    return result;
  }

  private getPointsFromMesh(api: WEBIFC.IfcAPI, mesh: THREE.Mesh) {
    const vector = new api.wasmModule.DoubleVector();

    const targetPos = mesh.geometry.attributes.position.array;

    for (let i = 0; i < targetPos.length - 2; i += 3) {
      this._tempPoint.set(targetPos[i], targetPos[i + 1], targetPos[i + 2]);
      this._tempPoint.applyMatrix4(mesh.matrixWorld);
      console.log(this._tempPoint.x, this._tempPoint.y, this._tempPoint.z);
      vector.push_back(this._tempPoint.x);
      vector.push_back(this._tempPoint.y);
      vector.push_back(this._tempPoint.z);
    }

    // const targetIndex = mesh.geometry.index;

    // if (!targetIndex) {
    //   throw new Error(
    //     "Fragments: no index provided to create the boolean operation.",
    //   );
    // }

    // const targetIndexArr = targetIndex.array;
    // const targetPos = mesh.geometry.attributes.position.array;

    // for (let i = 0; i < targetIndexArr.length - 2; i++) {
    //   const i1 = targetIndexArr[i];
    //   const x1 = targetPos[i1 * 3];
    //   const y1 = targetPos[i1 * 3 + 1];
    //   const z1 = targetPos[i1 * 3 + 2];

    //   const i2 = targetIndexArr[i + 1];
    //   const x2 = targetPos[i2 * 3];
    //   const y2 = targetPos[i2 * 3 + 1];
    //   const z2 = targetPos[i2 * 3 + 2];

    //   const i3 = targetIndexArr[i + 2];
    //   const x3 = targetPos[i3 * 3];
    //   const y3 = targetPos[i3 * 3 + 1];
    //   const z3 = targetPos[i3 * 3 + 2];

    //   this._tempPoint.set(x1, y1, z1);
    //   this._tempPoint.applyMatrix4(mesh.matrixWorld);
    //   console.log(this._tempPoint.x, this._tempPoint.y, this._tempPoint.z);
    //   this.savePoint(solidPoints, this._tempPoint);

    //   this._tempPoint.set(x2, y2, z2);
    //   this._tempPoint.applyMatrix4(mesh.matrixWorld);
    //   console.log(this._tempPoint.x, this._tempPoint.y, this._tempPoint.z);
    //   this.savePoint(solidPoints, this._tempPoint);

    //   this._tempPoint.set(x3, y3, z3);
    //   this._tempPoint.applyMatrix4(mesh.matrixWorld);
    //   console.log(this._tempPoint.x, this._tempPoint.y, this._tempPoint.z);
    //   this.savePoint(solidPoints, this._tempPoint);
    // }
    return vector;
  }

  // private savePoint(solidPoints: any, tempPoint: THREE.Vector3) {
  //   solidPoints.push_back(tempPoint.x);
  //   solidPoints.push_back(tempPoint.y);
  //   solidPoints.push_back(tempPoint.z);
  // }
}
