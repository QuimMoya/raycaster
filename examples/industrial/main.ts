import { Sweep } from "../../node_modules/web-ifc/web-ifc-api.d";
import * as THREE from "three";
import * as OBC from "@thatopen/components";
import Stats from "stats.js";
import { AABB } from "web-ifc";
import * as WEBIFC from "web-ifc";
import GUI from "lil-gui";
import { Bbox } from "../../geometries/bbox";
import { Extrude } from "../../geometries/extrude";
import { Sweeping } from "../../geometries/sweep";
import { Revolve } from "../../geometries/revolve";
import { CurveParabola } from "../../geometries/parabola";
import { CurveClothoid } from "../../geometries/clothoid";
import { CurveArc } from "../../geometries/arc";
import { CivilReader } from "../../civil-reader";
import { CylindricalRevolution } from "../../geometries/cylindricaRevolve";
import { BooleanOperation } from "../../geometries/boolean";
import { Profile } from "../../geometries/profile";
import { Wall } from "../../geometries/wall";
import { BimGeometry } from "../../geometries/bim-geometry";

async function main() {
  // Set up scene

  const components = new OBC.Components();
  const worlds = components.get(OBC.Worlds);
  const container = document.getElementById("container") as HTMLDivElement;

  const world = worlds.create<
    OBC.SimpleScene,
    OBC.SimpleCamera,
    OBC.SimpleRenderer
  >();

  world.scene = new OBC.SimpleScene(components);
  world.renderer = new OBC.SimpleRenderer(components, container);
  world.camera = new OBC.SimpleCamera(components);

  components.init();

  world.scene.setup();
  // world.camera.three.far = 10000;

  world.scene.three.add(new THREE.AxesHelper());

  world.camera.three.far = 10000;

  // Scene update

  const stats = new Stats();
  stats.showPanel(2);
  document.body.append(stats.dom);
  stats.dom.style.left = "0px";
  stats.dom.style.zIndex = "unset";
  world.renderer.onBeforeUpdate.add(() => stats.begin());
  world.renderer.onAfterUpdate.add(() => stats.end());

  const api = new WEBIFC.IfcAPI();
  api.SetWasmPath("../../node_modules/web-ifc/", false);
  await api.Init();

  // Create preview

  const previewLines: THREE.Vector3[][] = [];

  const previewGeometry = new THREE.BufferGeometry();
  const preveiwMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const previewMesh = new THREE.LineSegments(previewGeometry, preveiwMaterial);
  previewMesh.frustumCulled = false;
  world.scene.three.add(previewMesh);

  const updateLines = () => {
    const points: number[] = [];
    for (const line of previewLines) {
      const [start, end] = line;
      points.push(start.x, start.y, start.z);
      points.push(end.x, end.y, end.z);
    }
    previewGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(points, 3)
    );
  };

  updateLines();

  const createProfile = (data: {
    start?: THREE.Vector3;
    end?: THREE.Vector3;
    type?: number,
    profileWidth?: number,
    profileDepth?: number,
    profileThick?: number,
    profileFlangeThick?: number,
    profileRadius?: number,
    radius?: number,
    slope?: number,
    color?: THREE.Color,
  }) => {
    if(!data) {
      data = {};
    }
    if(!data.start) {
      data.start = new THREE.Vector3(0, 0, 0);
    }
    if(!data.end) {
      data.end = new THREE.Vector3(0, 10, 0);
    }
    if(!data.type) {
      data.type = 0;
    }
    if(!data.profileWidth) {
      data.profileWidth = 0.15;
    }
    if(!data.profileDepth) {  
      data.profileDepth = 0.2;
    }
    if(!data.profileThick) {
      data.profileThick = 0.001;
    }
    if(!data.profileFlangeThick) {
      data.profileFlangeThick = 0.001;
    }
    if(!data.profileRadius) {
      data.profileRadius = 0.001;
    }
    if(!data.radius) {
      data.radius = 0.001;
    }
    if(!data.slope) {
      data.slope = 0.001;
    }

    const length = data.end.distanceTo(data.start);

    const extrude = new Extrude(api);
    extrude.holes = [];
    extrude.profile.curve.points = [];
    extrude.dir = new THREE.Vector3(0, 1, 0);
    extrude.loadDefault = false;
    world.scene.three.add(extrude.mesh);

    extrude.profile.pType = data.type;
    extrude.profile.profileWidth = data.profileWidth;
    extrude.profile.profileDepth = data.profileDepth;
    extrude.profile.profileThick = data.profileThick;
    extrude.profile.profileFlangeThick = data.profileFlangeThick;
    extrude.profile.profileRadius = data.profileRadius;
    extrude.profile.radius = data.radius;
    extrude.profile.slope = data.slope;

    extrude.len = length;
    const xAxis = data.end.clone().sub(data.start).normalize();
    extrude.dir = xAxis;

    const basis = new THREE.Matrix4();
    const absY = new THREE.Vector3(0, 1, 0);
    const absX = new THREE.Vector3(1, 0, 0);
    const isUp = Math.abs(xAxis.dot(absY)) > 0.9;
    const zAxis = isUp ? xAxis.clone().cross(absX).normalize(): xAxis.clone().cross(absY).normalize();
    const yAxis = zAxis.clone().cross(xAxis).normalize();

    basis.fromArray([
      zAxis.x, zAxis.y, zAxis.z, 0,
      yAxis.x, yAxis.y, yAxis.z, 0,
      xAxis.x, xAxis.y, xAxis.z, 0,
      0, 0, 0, 1
    ]);

    extrude.profile.transform.applyMatrix4(basis);

    extrude.profile.update(api);
    extrude.update(api);

    if(!data.color) {
      data.color = new THREE.Color(0xffffff);
    }
    extrude.mesh.material.color = data.color;

    extrude.mesh.position.copy(data.start);

    // createdProfiles.set(key, extrude);
    bimGeometries.push(extrude);
  };

  const gui = new GUI();

  const params = {
    width: 20,
    length: 20,
    horizontalDivisions: 3,
    verticalDivisions: 3,
    floors: 3,
    floorHeight: 3,
    roofHeight: 1,
    joistNumber: 10,
  };

  const bimGeometries: BimGeometry[] = [];
  const otherMeshes: THREE.Mesh[] = [];

  const updateScene = () => {
    previewLines.length = 0;

    for (const geometry of bimGeometries) {
      geometry.dispose();
    }

    for (const mesh of otherMeshes) {
      mesh.geometry.dispose();
      mesh.material.dispose();
      mesh.removeFromParent();
    }
    otherMeshes.length = 0;

    const widthDistance = params.width / params.horizontalDivisions;
    const lengthDistance = params.length / params.verticalDivisions;
    const totalHeight = params.floorHeight * params.floors;

    // Create columns

    for (let i = 0; i <= params.horizontalDivisions; i++) {
      for (let j = 0; j <= params.verticalDivisions; j++) {
        const start = new THREE.Vector3(
          i * widthDistance,
          0,
          j * lengthDistance
        );
        const end = new THREE.Vector3(
          i * widthDistance,
          totalHeight,
          j * lengthDistance
        );
        previewLines.push([start, end]);
        createProfile({
          start,
          end,
          type: 0,
          profileWidth: 0.15,
          profileDepth: 0.2,
          color: new THREE.Color(0x00dd00),
        });
        previewLines.push([start, end]);
        const cubeMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: 0x888888 }));
        cubeMesh.position.x = start.x;
        cubeMesh.position.z = start.z;
        world.scene.three.add(cubeMesh);
        otherMeshes.push(cubeMesh);
      }
    }

    // Create width beams

    for (let i = 0; i < params.horizontalDivisions; i++) {
      for (let j = 0; j <= params.verticalDivisions; j++) {
        for (let k = 0; k < params.floors; k++) {
          const height = params.floorHeight * (k + 1);
          const start = new THREE.Vector3(
            i * widthDistance,
            height,
            j * lengthDistance
          );
          const end = new THREE.Vector3(
            (i + 1) * widthDistance,
            height,
            j * lengthDistance
          );
          createProfile({
            start,
            end,
            type: 0,
            profileWidth: 0.15,
            profileDepth: 0.2,
            color: new THREE.Color(0xdd0000),
          });
        }
      }
    }

    // Create horizontal joists (viguetas)

    for (let i = 0; i < params.horizontalDivisions; i++) {
      for (let j = 0; j < params.verticalDivisions; j++) {
        for (let k = 0; k < params.floors; k++) {
          const height = params.floorHeight * (k + 1);
          for (let l = 0; l < params.joistNumber - 1; l++) {
            const offset = (lengthDistance / params.joistNumber) * (l + 1);
            const start = new THREE.Vector3(
              i * widthDistance,
              height,
              j * lengthDistance + offset
            );
            const end = new THREE.Vector3(
              (i + 1) * widthDistance,
              height,
              j * lengthDistance + offset
            );
            previewLines.push([start, end]);
            createProfile({
              start,
              end,
              type: 0,
              profileWidth: 0.1,
              profileDepth: 0.15,
              color: new THREE.Color(0x00dd00),
            });
          }
        }
      }
    }
    // Create length beams

    for (let i = 0; i <= params.horizontalDivisions; i++) {
      for (let j = 0; j < params.verticalDivisions; j++) {
        for (let k = 0; k < params.floors; k++) {
          const height = params.floorHeight * (k + 1);
          const start = new THREE.Vector3(
            i * widthDistance,
            height,
            j * lengthDistance
          );
          const end = new THREE.Vector3(
            i * widthDistance,
            height,
            (j + 1) * lengthDistance
          );
          previewLines.push([start, end]);
          createProfile({
            start,
            end,
            type: 0,
            profileWidth: 0.15,
            profileDepth: 0.2,
            color: new THREE.Color(0xdd0000),
          });
        }
      }
    }

    // Create roof width beams

    for (let i = 0; i < params.horizontalDivisions; i++) {
      for (let j = 0; j <= params.verticalDivisions; j++) {
        const beam1Start = new THREE.Vector3(
          i * widthDistance,
          totalHeight,
          j * lengthDistance
        );
        const beam1End = new THREE.Vector3(
          i * widthDistance + widthDistance / 2,
          totalHeight + params.roofHeight,
          j * lengthDistance
        );
        previewLines.push([beam1Start, beam1End]);
        const beam2Start = new THREE.Vector3(
          i * widthDistance + widthDistance / 2,
          totalHeight + params.roofHeight,
          j * lengthDistance
        );
        const beam2End = new THREE.Vector3(
          (i + 1) * widthDistance,
          totalHeight,
          j * lengthDistance
        );
        previewLines.push([beam2Start, beam2End]);
      }
    }

    // Create roof height beams

    for (let i = 0; i < params.horizontalDivisions; i++) {
      for (let j = 0; j < params.verticalDivisions; j++) {
        const start = new THREE.Vector3(
          i * widthDistance + widthDistance / 2,
          totalHeight + params.roofHeight,
          j * lengthDistance
        );
        const end = new THREE.Vector3(
          i * widthDistance + widthDistance / 2,
          totalHeight + params.roofHeight,
          (j + 1) * lengthDistance
        );
        previewLines.push([start, end]);
        createProfile({
          start,
          end,
          type: 0,
          profileWidth: 0.1,
          profileDepth: 0.15,
          color: new THREE.Color(0x00dd00),
        });
      }
    }

    // Create roof joists (viguetas)

    for (let i = 0; i < params.horizontalDivisions; i++) {
      for (let j = 0; j < params.verticalDivisions; j++) {
        for (let l = 0; l < params.joistNumber + 1; l++) {
          const offset = (lengthDistance / params.joistNumber) * (l);
          const start1 = new THREE.Vector3(
            i * widthDistance,
            totalHeight,
            j * lengthDistance + offset
          );
          const end1 = new THREE.Vector3(
            i * widthDistance + widthDistance / 2,
            totalHeight + params.roofHeight,
            j * lengthDistance + offset
          );
          previewLines.push([start1, end1]);
          createProfile({
            start: start1,
            end: end1,
            type: 0,
            profileWidth: 0.1,
            profileDepth: 0.15,
            color: new THREE.Color(0xdddd00),
          });

          const start2 = new THREE.Vector3(
            i * widthDistance + widthDistance / 2,
            totalHeight + params.roofHeight,
            j * lengthDistance + offset
          );
          const end2 = new THREE.Vector3(
            (i + 1) * widthDistance,
            totalHeight,
            j * lengthDistance + offset
          );
          previewLines.push([start2, end2]);
          createProfile({
            start: start2,
            end: end2,
            type: 0,
            profileWidth: 0.1,
            profileDepth: 0.15,
            color: new THREE.Color(0xdddd00),
          });
        }
      }
    }

    updateLines();
  };

  updateScene();

  world.camera.controls.setLookAt(1, 1, 1, 0, 0, 0);

  gui.add(params, "width", 1, 50, 0.05).onChange(() => updateScene());
  gui.add(params, "length", 1, 50, 0.05).onChange(() => updateScene());
  gui
    .add(params, "horizontalDivisions", 1, 10, 1)
    .onChange(() => updateScene());
  gui.add(params, "verticalDivisions", 1, 10, 1).onChange(() => updateScene());
  gui.add(params, "floors", 1, 10, 1).onChange(() => updateScene());
  gui.add(params, "floorHeight", 3, 4, 0.05).onChange(() => updateScene());
  gui.add(params, "joistNumber", 5, 20, 1).onChange(() => updateScene());


}

main();
