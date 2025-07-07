import { Sweep } from './node_modules/web-ifc/web-ifc-api.d';
import * as THREE from "three";
import * as OBC from "@thatopen/components";
import Stats from "stats.js";
import { AABB } from "web-ifc";
import * as WEBIFC from "web-ifc";
import GUI from "lil-gui";
import { Bbox } from "./geometries/bbox";
import { Extrude } from "./geometries/extrude";
import { Sweeping} from "./geometries/sweep";
import { Revolve} from "./geometries/revolve";
import { CurveParabola } from "./geometries/parabola";
import { CurveClothoid } from './geometries/clothoid';
import { CurveArc } from "./geometries/arc";
import { CivilReader } from "./civil-reader";
import { CylindricalRevolution } from './geometries/cylindricaRevolve';
import { BooleanOperation } from './geometries/boolean';
import { Profile } from './geometries/profile';
import { Wall } from './geometries/wall';

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

  // //WALL
  // const wall = new Wall(api);
  // world.scene.three.add(wall.mesh);
  // gui.add(wall, "startX", 0, 10, 0.05).onChange(() => wall.update(api));  
  // gui.add(wall, "startZ", 0, 10, 0.05).onChange(() => wall.update(api));
  // gui.add(wall, "endX", 0, 10, 0.05).onChange(() => wall.update(api));
  // gui.add(wall, "endZ", 0, 10, 0.05).onChange(() => wall.update(api));
  // gui.add(wall, "elevationY", -10, 10, 0.05).onChange(() => wall.update(api));
  // gui.add(wall, "thickness", 0.3, 10, 0.05).onChange(() => wall.update(api));
  // gui.add(wall, "height", 1, 10, 0.05).onChange(() => wall.update(api));  
  // gui.add(wall, "offset", -10, 10, 0.05).onChange(() => wall.update(api));

  // AABB
  // const aabb = new Bbox(api);
  // world.scene.three.add(aabb.mesh);
  // gui.add(aabb.min, "x", -1, 0, 0.05).onChange(() => aabb.update());
  // gui.add(aabb.min, "y", -1, 0, 0.05).onChange(() => aabb.update());
  // gui.add(aabb.min, "z", -1, 0, 0.05).onChange(() => aabb.update());

  // BOOLEAN
  // const booleanOper = new BooleanOperation(api);
  // world.scene.three.add(booleanOper.mesh);
  // gui.add(booleanOper, "offsetX", 0.3, 1, 0.05).onChange(() => booleanOper.update(api));
  // gui.add(booleanOper, "offsetY", 0.3, 1, 0.05).onChange(() => booleanOper.update(api));
  // gui.add(booleanOper, "offsetZ", 0.3, 1, 0.05).onChange(() => booleanOper.update(api));
  // gui.add(booleanOper, 'op', { UNION: 'UNION', DIFFERENCE: 'DIFFERENCE' } ).onChange(() => booleanOper.update(api));

  // EXTRUDE
  // const extrude = new Extrude(api);
  // world.scene.three.add(extrude.mesh);
  // gui.add(extrude, "len", 1, 10, 0.05).onChange(() => extrude.update(api));

  // METAL PROFILES

  // const extrude = new Extrude(api);
  // extrude.holes = [];
  // extrude.profile.curve.points = [];
  // extrude.dir = new THREE.Vector3(0, 1, 0);
  // extrude.loadDefault = false;
  // world.scene.three.add(extrude.mesh);

  // const profileParams = [
  //   "profileWidth",
  //   "profileDepth",
  //   "profileThick",
  //   "profileFlangeThick",
  //   "profileRadius",
  //   "radius",
  //   "slope",
  // ];

  // gui.add(extrude.profile, "pType", 0, 7, 1).onChange(() => {
  //     extrude.profile.update(api);
  //     extrude.update(api);
  //   });
  // for (const param of profileParams) {
  //   gui.add(extrude.profile, (param as keyof Profile), 0.001, 0.5, 0.0005).onChange(() => {
  //     extrude.profile.update(api);
  //     extrude.update(api);
  //   });
  // }

  // extrude.update(api);

  // gui.add(extrude, "len", 1, 10, 0.05).onChange(() => extrude.update(api));

  // SWEEP
  // const sweep = new Sweeping(api);
  // world.scene.three.add(sweep.mesh);
  // gui.add(sweep, "close").onChange(() => sweep.update(api));
  // gui.add(sweep, "rotate90").onChange(() => sweep.update(api));
  // gui.add(sweep, "optimize").onChange(() => sweep.update(api));
  // gui.add(sweep, "lenght", 0.5, 20, 0.05).onChange(() => sweep.update(api));

  // REVOLVE
  // const revolve = new Revolve(api);
  // world.scene.three.add(revolve.mesh);
  // gui.add(revolve, "startDegrees", -360, 360, 0.05).onChange(() => revolve.update(api));
  // gui.add(revolve, "endDegrees", -360, 360, 0.05).onChange(() => revolve.update(api));
  // gui.add(revolve, "numRots", 3, 100, 1).onChange(() => revolve.update(api));

  // REVOLVE
  // const revolveCyl = new CylindricalRevolution(api);
  // world.scene.three.add(revolveCyl.mesh);
  // gui.add(revolveCyl, "startDegrees", -360, 360, 0.05).onChange(() => revolveCyl.update(api));
  // gui.add(revolveCyl, "endDegrees", -360, 360, 0.05).onChange(() => revolveCyl.update(api));
  // gui.add(revolveCyl, "minZ", -10, 0, 0.05).onChange(() => revolveCyl.update(api));
  // gui.add(revolveCyl, "maxZ", -0, 10, 0.05).onChange(() => revolveCyl.update(api));
  // gui.add(revolveCyl, "radius", 0.05, 10, 0.05).onChange(() => revolveCyl.update(api));
  // gui.add(revolveCyl, "numRots", 3, 100, 1).onChange(() => revolveCyl.update(api));


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

  // ARC
  // const arc = new CurveArc(api);
  // world.scene.three.add(arc.mesh);
  // gui.add(arc, "numSegments", 3, 100, 1).onChange(() => arc.update(api));
  // gui.add(arc, "radiusX", 1, 10, 0.05).onChange(() => arc.update(api));
  // gui.add(arc, "radiusY", 1, 10, 0.05).onChange(() => arc.update(api));
  // gui.add(arc, "startRad", 0, 6.28, 0.05).onChange(() => arc.update(api));
  // gui.add(arc, "endRad", 0, 6.28, 0.05).onChange(() => arc.update(api));
  // gui.add(arc, "swap").onChange(() => arc.update(api));
  // gui.add(arc, "normalToCenterEnding").onChange(() => arc.update(api));

}

main();
