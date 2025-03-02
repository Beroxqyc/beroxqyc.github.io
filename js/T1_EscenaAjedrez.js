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
let piezasW, piezasB;
let materialW = [], materialB = [];

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
    directional1.position.set(-2, 5, -2);
    directional1.castShadow = true;
    scene.add(directional1);
    const directional2 = new THREE.DirectionalLight(0xffffff, 1);
    directional2.position.set(2, 5, 2);
    directional2.castShadow = true;
    scene.add(directional2);
    // scene.add(new THREE.CameraHelper(directional1.shadow.camera));
    // scene.add(new THREE.CameraHelper(directional2.shadow.camera));
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
    const texturaMadera = new THREE.TextureLoader().load(path + 'wood512.jpg');
    const texturaMetalica = new THREE.TextureLoader().load(path + 'metal_128.jpg');

    const materialTabla = new THREE.MeshBasicMaterial({map: texturaTabla});
    const materialPiezaW = new THREE.MeshPhongMaterial({color: 'white', specular: 'gray', shininess: 100, envMap: texturaEntorno});
    const materialPiezaB= new THREE.MeshPhongMaterial({color: 'black', specular: 'gray', shininess: 100, envMap: texturaEntorno});
    const materialMaderaW = new THREE.MeshBasicMaterial({map: texturaMadera});
    const materialMaderaB = new THREE.MeshBasicMaterial({map: texturaMadera, color: 0x222222});
    const materialMetalicaW = new THREE.MeshBasicMaterial({map: texturaMetalica});
    const materialMetalicaB = new THREE.MeshBasicMaterial({map: texturaMetalica, color: 0x222222});

    materialW = {
        'Phong' : materialPiezaW,
        'Madera': materialMaderaW,
        'Metal': materialMetalicaW
    }

    materialB = {
        'Phong' : materialPiezaB,
        'Madera': materialMaderaB,
        'Metal': materialMetalicaB
    }

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

    loadPiezas();

    scene.add(piezasW);
    scene.add(piezasB);

    tabla = new THREE.Mesh(new THREE.BoxGeometry(8, 8, 0.1, 1), materialTabla);
    tabla.rotation.x = -Math.PI / 2;
    tabla.receiveShadow = true;
    scene.add(tabla);

}

function loadGUI() {
    effectController = {
        mensaje: 'controlador',
        materialPieza: 'Phong',
        texturaTabla: '',
        entorno: ''
    }

    const gui = new GUI();

    const h = gui.addFolder('Materiales');
    h.add(effectController, 'materialPieza', ['Phong', 'Madera', 'Metal']).name('Material Pieza').onChange(updateMaterial);
    h.add(effectController, 'texturaTabla', ['Madera', 'Metal', 'Piedra']).name('Textura Tabla')
    h.add(effectController, 'entorno', ['Ninguno', 'Beach', 'Cave']).name('Entorno')
}

function loadPiezas() {

    piezasW = new THREE.Object3D();
    piezasB = new THREE.Object3D();

    const glloader = new GLTFLoader();

    //carga de pawn
    for (let i = -4; i < 4; i++) {
        glloader.load('../models/chess_pieces/pawn/pawn_W.glb', function ( gltf ) {
            const model = gltf.scene;
            model.position.x = i+0.2;
            model.position.z = 2.5;
            model.scale.set(20, 20, 20);
            model.name = 'pawn_W'+(i+4);
            model.traverse( function ( node ) {
                if ( node.isMesh ) {
                    node.material = materialW['Phong'];
                }
            })
            // model.add(new THREE.AxesHelper(3));
            // scene.add( model );
            piezasW.add(model);
        });
        glloader.load('../models/chess_pieces/pawn/pawn_B.glb', function ( gltf ) {
            const model = gltf.scene;
            model.position.x = i+0.8;
            model.position.z = -2.5;
            model.scale.set(20, 20, 20);
            model.name = 'pawn_B'+(i+4);
            model.traverse( function ( node ) {
                if ( node.isMesh ) {
                    node.material = materialB['Phong'];
                }
            })
            // model.add(new THREE.AxesHelper(3));
            // scene.add( model );
            piezasB.add(model);
        });
    }

    //carga de rook
    for (let i = -4; i < 4; i+=7) {
        glloader.load('../models/chess_pieces/rook/rook_W.glb', function ( gltf ) {
            const model = gltf.scene;
            model.position.x = i+0.2;
            model.position.z = 3.5;
            model.scale.set(20, 20, 20);
            model.name = 'rook_W'+(i+4);
            model.traverse( function ( node ) {
                if ( node.isMesh ) {
                    node.material = materialW['Phong'];
                }
            })
            // model.add(new THREE.AxesHelper(3));
            // scene.add( model );
            piezasW.add(model);
        });
        glloader.load('../models/chess_pieces/rook/rook_B.glb', function ( gltf ) {
            const model = gltf.scene;
            model.position.x = i+0.8;
            model.position.z = -3.5;
            model.scale.set(20, 20, 20);
            model.name = 'rook_B'+(i+4);
            model.traverse( function ( node ) {
                if ( node.isMesh ) {
                    node.material = materialB['Phong'];
                }
            })
            // model.add(new THREE.AxesHelper(3));
            // scene.add( model );
            piezasB.add(model);
        });
    }

    //carga de knight
    for (let i = -3; i < 3; i+=5) {
        glloader.load('../models/chess_pieces/knight/knight_W.glb', function( gltf ) {
            const model = gltf.scene;
            model.position.x = i+0.5;
            model.rotation.y = -Math.PI/2;
            model.position.z = 3;
            model.scale.set(20, 20, 20);
            model.name = 'knight_W'+(i+4);
            model.traverse( function ( node ) {
                if ( node.isMesh ) {
                    node.material = materialW['Phong'];
                }
            })
            // model.add(new THREE.AxesHelper(3));
            // scene.add( model );
            piezasW.add(model);
        });

        glloader.load('../models/chess_pieces/knight/knight_B.glb', function( gltf ) {
            const model = gltf.scene;
            model.position.x = i+0.5;
            model.rotation.y = Math.PI/2;
            model.position.z = -4;
            model.scale.set(20, 20, 20);
            model.name = 'knight_B'+(i+4);
            model.traverse( function ( node ) {
                if ( node.isMesh ) {
                    node.material = materialB['Phong'];
                }
            })
            // model.add(new THREE.AxesHelper(3));
            // scene.add( model );
            piezasB.add(model);
        });
    }

    //carga de bishop
    for (let i = -2; i < 2; i+=3) {
        glloader.load('../models/chess_pieces/bishop/bishop_W.glb', function( gltf ) {
            const model = gltf.scene;
            model.position.x = i+0.1;
            model.position.z = 3.5;
            model.scale.set(17, 17, 17);
            model.name = 'bishop_W'+(i+4);
            model.traverse( function ( node ) {
                if ( node.isMesh ) {
                    node.material = materialW['Phong'];
                }
            })
            // model.add(new THREE.AxesHelper(3));
            // scene.add( model );
            piezasW.add(model);
        });

        glloader.load('../models/chess_pieces/bishop/bishop_B.glb', function( gltf ) {
            const model = gltf.scene;
            model.position.x = i+0.9;
            model.position.z = -3.5;
            model.scale.set(17, 17, 17);
            model.name = 'bishop_B'+(i+4);
            model.traverse( function ( node ) {
                if ( node.isMesh ) {
                    node.material = materialB['Phong'];
                }
            })
            // model.add(new THREE.AxesHelper(3));
            // scene.add( model );
            piezasB.add(model);
        });
    }

    //carga de queen
    glloader.load('../models/chess_pieces/queen/queen_W.glb', function( gltf ) {
        const model = gltf.scene;
        model.position.x = -0.95;
        model.position.z = 3.5;
        model.scale.set(20, 20, 20);
        model.name = 'queen_W';
        model.traverse( function ( node ) {
            if ( node.isMesh ) {
                node.material = materialW['Phong'];
            }
        })
        // model.add(new THREE.AxesHelper(3));
        // scene.add( model );
        piezasW.add(model);
    });

    glloader.load('../models/chess_pieces/queen/queen_B.glb', function( gltf ) {
        const model = gltf.scene;
        model.position.x = -0.05;
        model.position.z = -3.5;
        model.scale.set(20, 20, 20);
        model.name = 'queen_B';
        model.traverse( function ( node ) {
            if ( node.isMesh ) {
                node.material = materialB['Phong'];
            }
        })
        // model.add(new THREE.AxesHelper(3));
        // scene.add( model );
        piezasB.add(model);
    });

    //carga de king
    glloader.load('../models/chess_pieces/king/king_W.glb', function( gltf ) {
        const model = gltf.scene;
        model.position.x = 0.05;
        model.position.z = 3.5;
        model.scale.set(20, 20, 20);
        model.name = 'king_W';
        model.traverse( function ( node ) {
            if ( node.isMesh ) {
                node.material = materialW['Phong'];
            }
        })
        // model.add(new THREE.AxesHelper(3));
        // scene.add( model );
        piezasW.add(model);
    });

    glloader.load('../models/chess_pieces/king/king_B.glb', function( gltf ) {
        const model = gltf.scene;
        model.position.x = 0.95;
        model.position.z = -3.5;
        model.scale.set(20, 20, 20);
        model.name = 'king_B';
        model.traverse( function ( node ) {
            if ( node.isMesh ) {
                node.material = materialB['Phong'];
            }
        })
        // model.add(new THREE.AxesHelper(3));
        // scene.add( model );
        piezasB.add(model);
    });

}

function updateMaterial() {
    for (let i = 0; i < piezasW.children.length; i++) {
        const piezaW = piezasW.children[i];
        piezaW.traverse( function ( node ) {
            if ( node.isMesh ) {
                node.material = materialW[effectController.materialPieza];
            }
        })

        const piezaB = piezasB.children[i];
        piezaB.traverse( function ( node ) {
            if ( node.isMesh ) {
                node.material = materialB[effectController.materialPieza];
            }
        })
    }
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