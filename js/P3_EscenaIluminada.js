/**
 * EscenaIluminada.js
 * 
 * Practica AGM #3. Escena basica con interfaz, animacion e iluminacion
 * Se trata de añadir luces a la escena y diferentes materiales
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
let video;
let materiales;


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
    * TO DO: Completar el motor de render, el canvas y habilitar
    * el buffer de sombras
    *******************/
   document.getElementById('container').appendChild( renderer.domElement );
   renderer.antialias = true;
   renderer.shadowMap.enabled = true;

    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0.5, 0.5, 0.5 );
    
    // Camara
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1,1000);
    camera.position.set( 0.5, 2, 7 );
    /*******************
    * TO DO: Añadir manejador de camara (OrbitControls)
    *******************/
    cameraControls = new OrbitControls( camera, renderer.domElement );
    cameraControls.target.set( 0, 1, 0 );
    camera.lookAt( new THREE.Vector3(0,1,0) );

    // Luces
    /*******************
     * TO DO: Añadir luces y habilitar sombras
     * - Una ambiental
     * - Una direccional
     * - Una focal
     *******************/
    const ambiental = new THREE.AmbientLight(0x222222);
    scene.add(ambiental);
    const direccional = new THREE.DirectionalLight(0xFFFFFF,0.3);
    direccional.position.set(-1,1,-1);
    direccional.castShadow = true;
    scene.add(direccional);
    const puntual = new THREE.PointLight(0xFFFFFF,0.5);
    puntual.position.set(2,7,-4);
    scene.add(puntual);
    const focal = new THREE.SpotLight(0xFFFFFF,0.3);
    focal.position.set(-2,7,4);
    focal.target.position.set(0,0,0);
    focal.angle= Math.PI/7;
    focal.penumbra = 0.3;
    focal.castShadow= true;
    focal.shadow.camera.far = 20;
    focal.shadow.camera.fov = 80;
    scene.add(focal);
    scene.add(new THREE.CameraHelper(focal.shadow.camera));

    window.addEventListener('resize', updateAspectRatio );
    renderer.domElement.addEventListener('dblclick', animate );
}

function loadScene()
{
    // Texturas
    /*******************
     * TO DO: Cargar texturas
     * - De superposición
     * - De entorno
     *******************/
    const path = './images/';
    const texturaSuelo = new THREE.TextureLoader().load(path+'wood512.jpg');
    const texturaCubo = new THREE.TextureLoader().load(path+'wood512.jpg');
    texturaSuelo.repeat.set(4,3);
    texturaSuelo.wrapS = texturaSuelo.wrapT = THREE.MirroredRepeatWrapping;
    const entorno = [path+'posx.jpg', path+'negx.jpg',
                     path+'posy.jpg', path+'negy.jpg',
                     path+'posz.jpg', path+'negz.jpg'];
    const texturaesfera = new THREE.CubeTextureLoader().load(entorno);

    // Materiales
    /*******************
     * TO DO: Crear materiales y aplicar texturas
     * - Uno basado en Lambert
     * - Uno basado en Phong
     * - Uno basado en Basic
     *******************/
    const materialLambert = new THREE.MeshLambertMaterial({color: 'yellow', map: texturaCubo});
    const materialPhong = new THREE.MeshPhongMaterial({color: 'white', specular: 'gray', shininess: 30, envMap: texturaesfera});
    const materialBasic = new THREE.MeshBasicMaterial({color: 'white', envMap: texturaesfera});
    const materialNormal= new THREE.MeshNormalMaterial();
    
    materiales = {
        'Lambert': materialLambert,
        'Phong': materialPhong,
        'Basic': materialBasic,
        'Normal': materialNormal
    }

    /*******************
    * TO DO: Misma escena que en la practica anterior
    * cambiando los materiales y activando las sombras
    *******************/
    
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
            const figura = new THREE.Mesh( figuras[i], materialPhong );
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

    /******************
     * TO DO: Crear una habitacion de entorno
     ******************/
    const paredes = [];
        paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                      map: new THREE.TextureLoader().load(path+"posx.jpg")}) );
        paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                      map: new THREE.TextureLoader().load(path+"negx.jpg")}) );
        paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                      map: new THREE.TextureLoader().load(path+"posy.jpg")}) );
        paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                      map: new THREE.TextureLoader().load(path+"negy.jpg")}) );
        paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                      map: new THREE.TextureLoader().load(path+"posz.jpg")}) );
        paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                      map: new THREE.TextureLoader().load(path+"negz.jpg")}) );
        const habitacion = new THREE.Mesh( new THREE.BoxGeometry(40,40,40),paredes);
        scene.add(habitacion);

    /******************
     * TO DO: Asociar una textura de vídeo al suelo
     ******************/
    video = document.createElement('video');
    video.src = 'videos/Good.mp4';
    video.load();
    video.muted = true;
    video.play();
    const texturaVideo = new THREE.VideoTexture(video);
    suelo = new THREE.Mesh( new THREE.PlaneGeometry(16,9, 10,10), new THREE.MeshBasicMaterial({color:'white', map: texturaVideo}));
    suelo.rotation.x = -Math.PI / 2;
    suelo.position.y = -0.2;
    suelo.receiveShadow = true;
    scene.add(suelo);


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
    * - Checkbox de sombras
    * - Selector de color para cambio de algun material
    * - Boton de play/pause y checkbox de mute
    *******************/
   effectController = {
       mensaje: 'Aplication Controller',
       giroY: 0.0,
       radio: 1.0,
       colorsuelo: "rgb(150,150,150)",
       animacion: function(){
           animateFiguras();
       },
       shadow: true,
       material: 'Phong',
       mute: true,
       play: function(){video.play();},
       pause: function(){video.pause();},
       restart: function(){video.currentTime = 0;},
      };
   
      const gui = new GUI();
   
      const h = gui.addFolder("Control pentagono");
      h.add(effectController, "mensaje").name("menu");
      h.add(effectController, "giroY", -180, 180, 0.025).name("Giro Y");
      h.add(effectController, "radio", 0.0, 5.0, 0.025).name("Radio Pentagono");
      h.addColor(effectController, "colorsuelo").name("Color");
      h.add(effectController, "animacion").name("Animacion");
      h.add(effectController, "shadow").name("Sombras");
      h.add(effectController, "material", ['Lambert', 'Phong', 'Basic', 'Normal']).name("Material").onChange(updateMaterial);
      const videofolder = gui.addFolder("Control video");
      videofolder.add(effectController, "mute").name("Mute");
      videofolder.add(effectController,"play");
      videofolder.add(effectController,"pause");
      videofolder.add(effectController,"restart");
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

function updateMaterial() {
    for(let i = 0; i < 5; i++) {
        pentagon.children[i].material = materiales[effectController.material];
    }
}

function updateAspectRatio()
{
    const ar = window.innerWidth/window.innerHeight;
    renderer.setSize(window.innerWidth,window.innerHeight);
    camera.aspect = ar;
    camera.updateProjectionMatrix();
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
   video.muted = effectController.mute;
   suelo.shadow = effectController.shadow;
    TWEEN.update();
}

function render(delta)
{
    requestAnimationFrame( render );
    update(delta);
    renderer.render( scene, camera );
}