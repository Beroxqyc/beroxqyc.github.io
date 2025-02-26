/**
 * EscenaAnimada.js
 * 
 * Practica AGM #2. Escena basica con interfaz y animacion
 * Se trata de añadir un interfaz de usuario que permita 
 * disparar animaciones sobre los objetos de la escena con Tween
 * 
 * @author 
 * 
 */

// Modulos necesarios
/*******************
 * TO DO: Cargar los modulos necesarios
 *******************/
import * as THREE from "../lib/three.module.js";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";
import {OrbitControls} from "../lib/OrbitControls.module.js";
import {TWEEN} from "../lib/tween.module.min.js";
import {GUI} from "../lib/lil-gui.module.min.js";

// Variables de consenso
let renderer, scene, camera;

// Otras globales
/*******************
 * TO DO: Variables globales de la aplicacion
 *******************/
let pentagon;
let angulo = 0;
let cameraControls, effectController;

// Acciones
init();
loadScene();
loadGUI();
render();

function init()
{
    // Motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    /*******************
    * TO DO: Completar el motor de render y el canvas
    *******************/
   document.getElementById('container').appendChild( renderer.domElement );

    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.5,0.5,0.5);
    
    // Camara
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 1,1000);
    camera.position.set( 0.5, 2, 7 );
    /*******************
    * TO DO: Añadir manejador de camara (OrbitControls)
    *******************/
    cameraControls = new OrbitControls( camera, renderer.domElement );
    cameraControls.target.set(0,1,0);
    camera.lookAt( new THREE.Vector3(0,1,0) );

}

function loadScene()
{
    /*******************
    * TO DO: Misma escena que en la practica anterior
    *******************/
    const material = new THREE.MeshNormalMaterial( );
    const sueloMaterial = new THREE.MeshBasicMaterial( { color: 'cyan', wireframe: true } );

    const suelo = new THREE.Mesh( new THREE.PlaneGeometry(10,10, 10,10), sueloMaterial );
    suelo.rotation.x = -Math.PI / 2;
    scene.add(suelo);

    const figuras = [
    new THREE.BoxGeometry(1,1,1),
    new THREE.SphereGeometry(0.5,20,20),
    new THREE.ConeGeometry(0.5,1,20),
    new THREE.TorusGeometry(0.5,0.2,16,100),
    new THREE.DodecahedronGeometry(0.5)
    ];

    pentagon = new THREE.Object3D();

    for (let i = 0; i < 5; i++) {
        const angle = 2 * Math.PI * i / 5;
        const figura = new THREE.Mesh( figuras[i], material );
        figura.position.set( Math.cos(angle) * 2, 0.7, Math.sin(angle) * 2 );
        figuras.push(figura);
        pentagon.add(figura);
    }

    scene.add(pentagon);

    const loader = new THREE.ObjectLoader();
    loader.load( 'models/soldado/soldado.json', 
        function(objeto){
            const soldado = new THREE.Object3D();
            soldado.add(objeto);
            scene.add(soldado);
            objeto.position.y = 0;
            soldado.name = 'soldado';
        },
    );

    const glloader = new GLTFLoader();

    glloader.load( 'models/robota/scene.gltf', function ( gltf ) {
        gltf.scene.position.x = 0.5;
        gltf.scene.rotation.y = -Math.PI/2;
        scene.add( gltf.scene );
        gltf.scene.name = 'robota';
    
    }, undefined, function ( error ) {
    
        console.error( error );
    
    } );

    scene.add( new THREE.AxesHelper(3) );
    pentagon.add( new THREE.AxesHelper(3) );

}

function loadGUI()
{
    // Interfaz de usuario
    /*******************
    * TO DO: Crear la interfaz de usuario con la libreria lil-gui.js
    * - Funcion de disparo de animaciones. Las animaciones deben ir
    *   encadenadas
    * - Slider de control de radio del pentagono
    * - Checkbox para alambrico/solido
    *******************/
    
}

function update(delta)
{
    /*******************
    * TO DO: Actualizar tween
    *******************/
}

function render(delta)
{
    requestAnimationFrame( render );
    update(delta);
    renderer.render( scene, camera );
}