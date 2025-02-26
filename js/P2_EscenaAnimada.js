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
let pentagon, suelo;
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

    renderer.domElement.addEventListener('dblclick', animate );

}

function loadScene()
{
    /*******************
    * TO DO: Misma escena que en la practica anterior
    *******************/
    const material = new THREE.MeshNormalMaterial( );
    const sueloMaterial = new THREE.MeshBasicMaterial( { color: 'cyan', wireframe: true } );

    suelo = new THREE.Mesh( new THREE.PlaneGeometry(10,10, 10,10), sueloMaterial );
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
   effectController = {
    mensaje: 'Aplication Controller',
    giroY: 0.0,
    radio: 1.0,
    colorsuelo: "rgb(150,150,150)",
    animacion: function(){
        animateFiguras();
    }
   };

   const gui = new GUI();

   const h = gui.addFolder("Control pentagono");
   h.add(effectController, "mensaje").name("menu");
   h.add(effectController, "giroY", -180, 180, 0.025).name("Giro Y");
   h.add(effectController, "radio", 0.0, 5.0, 0.025).name("Radio Pentagono");
   h.addColor(effectController, "colorsuelo").name("Color");
   h.add(effectController, "animacion").name("Animacion");

}

function animate(event) {
    let x = event.clientX;
    let y = event.clientY;
    x = ( x / window.innerWidth ) * 2 - 1;
    y = - ( y / window.innerHeight ) * 2 + 1;

    const rayo = new THREE.Raycaster();
    rayo.setFromCamera(new THREE.Vector2(x, y), camera);
    const soldado = scene.getObjectByName('soldado');
    const robota = scene.getObjectByName('robota');
    let intersecciones = rayo.intersectObjects(soldado.children, true);

    if( intersecciones.length > 0 ){
        new TWEEN.Tween( soldado.position ).
        to( {x:[0,0],y:[3,1],z:[0,0]}, 2000 ).
        interpolation( TWEEN.Interpolation.Bezier ).
        easing( TWEEN.Easing.Bounce.Out ).
        start();
    }

    intersecciones = rayo.intersectObjects(robota.children,true);

    if( intersecciones.length > 0 ){
        new TWEEN.Tween( robota.rotation ).
        to( {x:[0,0],y:[Math.PI,-Math.PI/2],z:[0,0]}, 5000 ).
        interpolation( TWEEN.Interpolation.Linear ).
        easing( TWEEN.Easing.Exponential.InOut ).
        start();
    }
}

function animateFiguras() {
    for(let i = 0; i < 5; i++) {
        new TWEEN.Tween(pentagon.children[i].position)
        .to({y: [0.7, 2]}, 2000)
        .interpolation(TWEEN.Interpolation.CatmullRom)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .delay(200 * i)
        .start();
        };
}

function update(delta)
{
    /*******************
    * TO DO: Actualizar tween
    *******************/
    angulo = effectController.giroY * (Math.PI / 180);
    for (let i = 0; i < 5; i++) {
        const angle = 2 * Math.PI * i / 5;
        pentagon.children[i].position.set(Math.cos(angle + angulo) * 2 * effectController.radio, 0.7, Math.sin(angle + angulo) * 2 * effectController.radio);
    }
    suelo.material.setValues({ color: effectController.colorsuelo });

    TWEEN.update();
}

function render(delta)
{
    requestAnimationFrame( render );
    update(delta);
    renderer.render( scene, camera );
}