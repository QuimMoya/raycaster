import * as THREE from "three";
import * as OBC from "@thatopen/components";
import Stats from "stats.js";
import { AABB } from "web-ifc";
import * as WEBIFC from "web-ifc";
import GUI from "lil-gui";
import { Bbox } from "./geometries/bbox";
import { Extrude } from "./geometries/extrude";
import { CurveParabola } from "./geometries/parabola";
import { CurveClothoid } from './geometries/clothoid';
import { CurveArc } from "./geometries/arc";
import { CivilReader } from "./civil-reader";

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
  api.SetWasmPath("./node_modules/web-ifc/", false);
  await api.Init();

  const gui = new GUI();

  // AABB
  // const aabb = new Bbox(api);
  // world.scene.three.add(aabb.mesh);
  // gui.add(aabb.min, "x", -1, 0, 0.05).onChange(() => aabb.update());
  // gui.add(aabb.min, "y", -1, 0, 0.05).onChange(() => aabb.update());
  // gui.add(aabb.min, "z", -1, 0, 0.05).onChange(() => aabb.update());

  // EXTRUDE
  // const extrude = new Extrude(api);
  // world.scene.three.add(extrude.mesh);
  // gui.add(extrude, "len", 1, 3, 0.05).onChange(() => extrude.update(api));
  
  // PARABOLA
  // const parabola = new CurveParabola(api);
  // world.scene.three.add(parabola.mesh);
  // gui.add(parabola, "segments", 3, 100, 1).onChange(() => parabola.update(api));
  // gui.add(parabola, "horizontalLength", 1, 10, 0.05).onChange(() => parabola.update(api));
  // gui.add(parabola, "startHeight", 1, 10, 0.05).onChange(() => parabola.update(api));
  // gui.add(parabola, "startGradient", -10, 10, 0.05).onChange(() => parabola.update(api));
  // gui.add(parabola, "endGradient", -10, 10, 0.05).onChange(() => parabola.update(api));

  // // CLOTHOID
  // const clothoid = new CurveClothoid(api);
  // world.scene.three.add(clothoid.mesh);
  // gui.add(clothoid, "segments", 3, 100, 1).onChange(() => clothoid.update(api));
  // gui.add(clothoid, "ifcStartDirection", 1, 10, 0.05).onChange(() => clothoid.update(api));
  // gui.add(clothoid, "StartRadiusOfCurvature", 1, 10, 0.05).onChange(() => clothoid.update(api));
  // gui.add(clothoid, "EndRadiusOfCurvature", -10, 10, 0.05).onChange(() => clothoid.update(api));
  // gui.add(clothoid, "SegmentLength", -10, 10, 0.05).onChange(() => clothoid.update(api));

  // Arc
  // const arc = new CurveArc(api);
  // world.scene.three.add(arc.mesh);
  // gui.add(arc, "numSegments", 3, 100, 1).onChange(() => arc.update(api));
  // gui.add(arc, "radiusX", 1, 10, 0.05).onChange(() => arc.update(api));
  // gui.add(arc, "radiusY", 1, 10, 0.05).onChange(() => arc.update(api));
  // gui.add(arc, "startRad", 0, 6.28, 0.05).onChange(() => arc.update(api));
  // gui.add(arc, "endRad", 0, 6.28, 0.05).onChange(() => arc.update(api));
  // gui.add(arc, "swap").onChange(() => arc.update(api));
  // gui.add(arc, "normalToCenterEnding").onChange(() => arc.update(api));

  // Open model
  
  const fetched = await fetch("(E28)_CARRETERA_10.94_4X3.ifc");
  const arrayBuffer = await fetched.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const modelId = api.OpenModel(uint8Array, {
    COORDINATE_TO_ORIGIN: true,
  });

  api.StreamAllMeshes(modelId, () => {});

  // Get explicit aligments

  const civilReader = new CivilReader();
  const alignments = civilReader.read(api);

  console.log(alignments);
  // console.log(ifcCrossSection2D);
  // console.log(ifcCrossSection3D);

  for(const [,alignment] of alignments.alignments) {
    for(const {mesh} of alignment.horizontal) {
      world.scene.three.add(mesh);
    }
  }

  // for(const [,alignment] of alignments.alignments) {
  //   for(const {mesh} of alignment.absolute) {
  //     world.scene.three.add(mesh);
  //   }
  // }

}

main();
