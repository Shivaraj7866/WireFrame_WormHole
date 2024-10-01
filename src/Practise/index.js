import * as THREE from "three";
import { GlitchPass, LuminosityShader, OrbitControls, OutputPass, ShaderPass } from "three/examples/jsm/Addons.js";
import curve from "./curve";
import { EffectComposer } from "three/examples/jsm/Addons.js";
import { UnrealBloomPass } from "three/examples/jsm/Addons.js";
import { RenderPass } from "three/examples/jsm/Addons.js";

const sizes = {
    w: window.innerWidth,
    h: window.innerHeight,
};

console.log(curve);

const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.3);

const camera = new THREE.PerspectiveCamera(75, sizes.w / sizes.h, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.w, sizes.h);
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

//**************************************Post-Processing****************************************************
const composer = new EffectComposer(renderer)

const renderScene = new RenderPass(scene, camera)
composer.addPass(renderScene);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(sizes.w, sizes.h))
bloomPass.strength = 3.5;
bloomPass.radius = 0;
bloomPass.threshold = 0.002
composer.addPass(bloomPass)

// const luminosityPass = new ShaderPass( LuminosityShader );
// composer.addPass( luminosityPass );

// const glitchPass = new GlitchPass();
// composer.addPass( glitchPass );

// const outputPass = new OutputPass();
// composer.addPass( outputPass );

//******************************************************************************************

const points = curve.getPoints(100);
const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
const lineMat = new THREE.LineBasicMaterial({ color: 0x00ff00 });
const line = new THREE.Line(lineGeo, lineMat);
// scene.add(line);

const tubeGeo = new THREE.TubeGeometry(curve, 222, 0.65, 16, true);

const edgesGeo = new THREE.EdgesGeometry(tubeGeo, 0.2);
const tubeMat = new THREE.LineBasicMaterial({ color: 0xffffff * Math.random() });
const tubeLine = new THREE.LineSegments(edgesGeo, tubeMat);
scene.add(tubeLine);

console.log(tubeLine)
const BoxCount = 55;
const size = 0.075;
const boxGeo = new THREE.BoxGeometry(size, size, size);

for (let i = 0; i < BoxCount; i++) {
    const boxMat = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
    });

    let box = new THREE.Mesh(boxGeo, boxMat);
    const p = (i / BoxCount + Math.random() * 0.1) % 1;
    const pos = tubeGeo.parameters.path.getPointAt(p);
    pos.x += Math.random() - 0.4;
    pos.z += Math.random() - 0.4;
    box.position.copy(pos);

    const boxRot = new THREE.Vector3(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );
    box.rotation.set(boxRot.x, boxRot.y, boxRot.z)

    const edges = new THREE.EdgesGeometry(boxGeo, 0.2)
    let color = new THREE.Color().setHSL(0.5 - p, 1, 0.5);
    const mat = new THREE.LineBasicMaterial({ color })
    const boxLines = new THREE.LineSegments(edges, mat)
    boxLines.position.copy(pos)
    boxLines.rotation.set(boxRot.x, boxRot.y, boxRot.z)
    scene.add(boxLines)
    //   scene.add(box);
}

function updateCamera(t) {
    const time = t * 0.1;
    const looptime = 10 * 1000;
    const p = (time % looptime) / looptime;

    const pos = tubeGeo.parameters.path.getPointAt(p);
    const lookAt = tubeGeo.parameters.path.getPointAt((p + 0.03) % 1);

    camera.position.copy(pos);
    camera.lookAt(lookAt);
}

//******************************************************************************************

function animate(t = 0) {
    window.requestAnimationFrame(animate);
    controls.update();
    updateCamera(t);
    composer.render(scene, camera);
}

window.addEventListener("resize", windowResize);
function windowResize() {
    sizes.w = window.innerWidth;
    sizes.h = window.innerHeight;
    camera.aspect = sizes.w / sizes.h;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.w, sizes.h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

animate();
