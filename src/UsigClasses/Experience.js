import * as THREE from "three";
import curve from "./Curves.js"
import { EffectComposer, GlitchPass, LuminosityShader, OrbitControls, OutputPass, RenderPass, ShaderPass, UnrealBloomPass } from "three/examples/jsm/Addons.js";

class Experience {
    constructor() {

        this.sizes = {
            w: window.innerWidth,
            h: window.innerHeight,
        };

        this.canvas = document.querySelector("canvas.webgl");

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.35)

        this.camera = new THREE.PerspectiveCamera(75, this.sizes.w / this.sizes.h, 0.1, 1000);
        this.camera.position.z = 6;

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
        });
        this.renderer.setSize(this.sizes.w, this.sizes.h);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping

        this.composer = new EffectComposer(this.renderer)

        this.postProcessing()
        this.createTube()

        window.addEventListener("resize", this.windowResize);
        this.animate();
    }

    createTube() {
        const points = curve.getPoints(100)
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points)
        const lineMat = new THREE.LineBasicMaterial({ color: 0xff0000 })
        const line = new THREE.Line(lineGeo, lineMat)
        // this.scene.add(line)

        this.tubGeo = new THREE.TubeGeometry(curve, 222, 0.65, 16, true)

        const tubeEdges = new THREE.EdgesGeometry(this.tubGeo, 0.2)
        const tubeMat = new THREE.LineBasicMaterial({ color: 0x00ff00 })
        const tube = new THREE.LineSegments(tubeEdges, tubeMat)
        this.scene.add(tube)

        this.boxesInTube()
    }

    boxesInTube() {
        const boxesCount = 55;
        const sizes = 0.075
        const boxGeo = new THREE.BoxGeometry(sizes, sizes, sizes)

        for (let i = 0; i < boxesCount; i++) {
            // const boxMat = new THREE.MeshBasicMaterial({color:0xffff00 ,wireframe:true})
            // const box =new THREE.Mesh(boxGeo,boxMat)
            const p = (i / boxesCount + Math.random() * 0.1) % 1 //generates values from 0 to 1
            const pos = this.tubGeo.parameters.path.getPointAt(p)
            pos.x += Math.random() - 0.4
            pos.z += Math.random() - 0.4
            // box.position.copy(pos)

            const rotate = new THREE.Vector3(Math.random(),Math.random(),Math.random())

            const boxEdgesGeo = new THREE.EdgesGeometry(boxGeo, 0.2)
            const edgeLineMat = new THREE.LineBasicMaterial({ color: 0xff00ff * Math.random() })
            const boxEdgeLines = new THREE.LineSegments(boxEdgesGeo, edgeLineMat)
            boxEdgeLines.position.copy(pos)
            boxEdgeLines.rotation.set(rotate.x, rotate.y, rotate.z)

            this.scene.add(boxEdgeLines)
            // this.scene.add(box)
        }
    }

    updateCamera(t) {
        const time = t * 0.1
        const loopTime = 8 * 1000
        const p = (time % loopTime) / loopTime // each vertice point on curve

        const pos = this.tubGeo.parameters.path.getPointAt(p)
        const lookAt = this.tubGeo.parameters.path.getPointAt((p + 0.03) % 1)

        this.camera.position.copy(pos)
        this.camera.lookAt(lookAt)
    }

    postProcessing() {
        
        this.renderPass = new RenderPass(this.scene, this.camera)
        this.composer.addPass(this.renderPass)

        this.unrealBloom = new UnrealBloomPass(new THREE.Vector2(this.sizes.w, this.sizes.h))
        this.unrealBloom.strength = 3.5
        this.unrealBloom.threshold = 0.04
        this.unrealBloom.radius = 0
        this.composer.addPass(this.unrealBloom)

        // const luminosityPass = new ShaderPass(LuminosityShader);
        //  this.composer.addPass(luminosityPass);

        // const glitchPass = new GlitchPass();
        //  this.composer.addPass(glitchPass);

        // const outputPass = new OutputPass();
        //  this.composer.addPass(outputPass);

    }

    windowResize = () => {
        this.sizes.w = window.innerWidth;
        this.sizes.h = window.innerHeight;

        this.camera.aspect = this.sizes.w / this.sizes.h;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.sizes.w, this.sizes.h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    animate = (t = 0) => {
        window.requestAnimationFrame(this.animate);
        this.updateCamera(t)
        this.composer.render(this.scene, this.camera);
    }
}

const experience = new Experience();
