/**
 * T1_EscenaAjedrez.js
 * 
 * Trabajo 1 - Desarrollo de un videojuego de ajedrez con WEBGL y THREE.js
 * 
 * @author Yu Lin
 * 
 * fuentes:
 * Texturas Cúbicas: www.humus.name 
 * 
 */

import * as THREE from '../lib/three.module.js'
import { GLTFLoader } from '../lib/GLTFLoader.module.js'
import { OrbitControls } from '../lib/OrbitControls.module.js'
import {TWEEN} from '../lib/tween.module.min.js'
import {GUI} from '../lib/lil-gui.module.min.js'

let renderer, scene, camera;
let cameraControls, effectController;
let suelo;
let materiales;

init();
loadScene();
loadGUI();
render();


function init() {
    renderer =  new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);
    renderer.antialias = true;
    renderer.shadowMap.enabled = true;

    scene = new THREE.Scene();
    scene.backgroud = new THREE.Color(0.5, 0.5, 0.5);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0.5, 2, 7);
    cameraControls = new OrbitControls(camera, renderer.domElement);
    cameraControls.target.set(0, 1, 0);
    camera.lookAt(new THREE.Vector3(0, 1, 0));

    const ambiental = new THREE.AmbientLight(0x222222);
    scene.add(ambiental);
    const directional = new THREE.DirectionalLight(0xffffff, 0.3);
    directional.position.set(-1, 1, -1);
    directional.castShadow = true;
    scene.add(directional);
    const focal =  new THREE.SpotLight(0xFFFFFF, 0.3);
    focal.position.set(-2, 7, 4);
    focal.target.position.set(0, 0, 0);
    focal.angle = Math.PI / 7;
    focal.penumbra = 0.3;
    focal.castShadow = true;
    focal.shadow.camera.far = 20;
    focal.shadow.camera.fov = 80;
    scene.add(focal);
    scene.add(new THREE.CameraHelper(focal.shadow.camera));

    window.addEventListener('resize', updateAspectRatio);
}

function loadScene() {

}

function loadGUI() {

}

function update() {

}

function updateAspectRatio() {
    const ar = window.innerWidth/window.innerHeight;
    renderer.setSize(window.innerWidth,window.innerHeight);
    camera.aspect = ar;
    camera.updateProjectionMatrix();
}

function render() {
    requestAnimationFrame( render );
    update();
    renderer.render( scene, camera );
}