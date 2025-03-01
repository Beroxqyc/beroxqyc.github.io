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
let tabla;
let entorno;
let piezas = [], materialesW = [], materialesB = [];

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

    const ambiental = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambiental);
    const directional1 = new THREE.DirectionalLight(0xffffff, 1);
    directional1.position.set(-1, 1, -1);
    directional1.castShadow = true;
    scene.add(directional1);
    const directional2 = new THREE.DirectionalLight(0xffffff, 1);
    directional2.position.set(1, -1, 1);
    directional2.castShadow = true;
    scene.add(directional2);
    const focal =  new THREE.SpotLight(0xFFFFFF, 1);
    focal.position.set(-2, 7, 4);
    focal.target.position.set(0, 0, 0);
    focal.angle = Math.PI / 7;
    focal.penumbra = 0.3;
    focal.castShadow = true;
    focal.shadow.camera.far = 20;
    focal.shadow.camera.fov = 80;
    scene.add(focal);
    // scene.add(new THREE.CameraHelper(focal.shadow.camera));

    window.addEventListener('resize', updateAspectRatio);
}

function loadScene() {
    const path = './images/';

    const texturaTabla = new THREE.TextureLoader().load(path + 'ajedrez.jpg');

    entorno = [
        path+ 'e_beach/posx.jpg', path+ 'e_beach/negx.jpg',
        path+ 'e_beach/posy.jpg', path+ 'e_beach/negy.jpg',
        path+ 'e_beach/posz.jpg', path+ 'e_beach/negz.jpg'];

    const texturaEntorno = new THREE.CubeTextureLoader().load(entorno);

    const materialTabla = new THREE.MeshBasicMaterial({map: texturaTabla});
    const materialPiezaW = new THREE.MeshPhongMaterial({color: 'white', specular: 'gray', shininess: 100, envMap: texturaEntorno});
    const materialPiezaB= new THREE.MeshPhongMaterial({color: 'black', specular: 'gray', shininess: 100, envMap: texturaEntorno});

    const paredes = [];
            paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                          map: new THREE.TextureLoader().load(path+"e_beach/posx.jpg")}) );
            paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                          map: new THREE.TextureLoader().load(path+"e_beach/negx.jpg")}) );
            paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                          map: new THREE.TextureLoader().load(path+"e_beach/posy.jpg")}) );
            paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                          map: new THREE.TextureLoader().load(path+"e_beach/negy.jpg")}) );
            paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                          map: new THREE.TextureLoader().load(path+"e_beach/posz.jpg")}) );
            paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                          map: new THREE.TextureLoader().load(path+"e_beach/negz.jpg")}) );
            const habitacion = new THREE.Mesh( new THREE.BoxGeometry(40,40,40),paredes);
            scene.add(habitacion);

    
    const glloader = new GLTFLoader();
    glloader.load('../models/chess_pieces/pawn/pawn_W.glb', function ( gltf ) {
        const pieza =  new THREE.Object3D();
        // gltf.scene.position.x = 1.2;
        // gltf.scene.position.z = -0.5;
        gltf.scene.scale.set(20, 20, 20);
        gltf.scene.name = 'pawn_W';
        pieza.add(gltf.scene);
        pieza.position.x = 1.2;
        pieza.position.z = -0.5;
        pieza.add(new THREE.AxesHelper(3));
        scene.add( pieza );
        piezas.push(pieza);
    });

    glloader.load('../models/chess_pieces/king/king_W.glb', function ( gltf ) {
        gltf.scene.position.z = 0.5;
        gltf.scene.scale.set(20, 20, 20);
        gltf.scene.name = 'pawn_W';
        gltf.scene.traverse( function ( node ) {
            if ( node.isMesh ) {
                node.material = materialPiezaW;
            }
        })
        scene.add(gltf.scene);
    });

    glloader.load('../models/chess_pieces/king/king_B.glb', function ( gltf ) {
        // gltf.scene.position.z = 0.5;
        gltf.scene.scale.set(20, 20, 20);
        gltf.scene.name = 'pawn_W';

        const model =  gltf.scene;
        model.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.material = materialPiezaB;
            }
        })
        scene.add(model);
        // pieza.position.z = 0.5;
        // pieza.add(new THREE.AxesHelper(3));
    });

    tabla = new THREE.Mesh(new THREE.BoxGeometry(8, 8, 0.1, 1), materialTabla);
    tabla.rotation.x = -Math.PI / 2;
    tabla.receiveShadow = true;
    scene.add(tabla);

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