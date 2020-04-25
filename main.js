import * as THREE from '../three.js/build/three.module.js';
import { OrbitControls } from '../three.js/examples/jsm/controls/OrbitControls.js';
import { MKB } from './mkb.js';
import { Animation } from './animation.js';
import { MeshRenderer } from './mkbRenderer.js';
import { TWEEN } from '../three.js/examples/jsm/libs/tween.module.min.js';
import { GUI } from '../three.js/examples/jsm/libs/dat.gui.module.js';

let camera, scene, renderer, controls;
let coreMKB;
let effect;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

class Core {
  constructor(x=3, y=3, z=3) {
    this.mkb = new MKB(x, y, z, this);
    this.animation = new Animation(this.mkb);
    this.addObjectsToScene();
    this.focusCamera();

    this.pressingMeta = false;
  }

  addObjectsToScene() {
    scene.add(this.mkb.mesh);
  }

  focusCamera() {
    controls.target = this.mkb.center();
  }

  static GUIHovered() {
    if (document.getElementsByClassName('hover').length > 0) return true;
    for (let div of document.getElementsByClassName('slider')) {
      if (div.parentElement.querySelector(':hover')) return true;
    }
    return false;
  }

  static onMouseMove( event ) {
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    let obj = objectCasted();
    coreMKB.mkb.hover(obj);   // do not use this here, this is callback
  }

  static onMouseClick(event) {
    if (Core.GUIHovered()) return 0;

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    let obj = objectCasted();

    if  (!coreMKB.pressingMeta) coreMKB.mkb.deselectAll();
    coreMKB.mkb.select(obj);
  }

  static onKeyDown(e) {
    coreMKB.pressingMeta = (e.key === 'Meta');
  }

  static onKeyUp(e) {
    coreMKB.pressingMeta = !(e.key === 'Meta');
  }

}

function initScene() {

  let info = document.createElement( 'div' );
  info.style.position = 'absolute';
  info.style.top = '10px';
  info.style.width = '100%';
  info.style.textAlign = 'center';
  info.style.color = '#fff';
  info.style.link = '#f80';
  info.innerHTML = 'MKB';
  document.body.appendChild( info );

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x222222 );

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.set( 6, 6, 8 );

  controls = new OrbitControls( camera, renderer.domElement );
  controls.minDistance = 1;
  controls.maxDistance = 500;
  // controls.dynamicDampingFactor = 0.5;

  let aLight = new THREE.AmbientLight( "rgb(255,255,255)", 0.1 );
  scene.add( aLight );

  let dLight = new THREE.DirectionalLight( "rgb(255,255,255)", 0.7);
  dLight.translateOnAxis(new THREE.Vector3(1,1,1), 100);
  scene.add( dLight );

}

function initGUI() {

  let effectController = function () {
    // dimension
    this.x= 4;
    this.y= 3;
    this.z= 3;
    this.reset = function() {
      scene.children = [scene.children[0], scene.children[1]];
      initMKB();
    };

    // edit
    this.constraint = 0;
    this.addBeam = function() {
      console.log('addBeam', coreMKB.mkb.addBeam());
    };
    this.removeBeam = function() {
      console.log('removeBeam', coreMKB.mkb.removeBeam());
    };

    // action
    this.simulate = function() {
      for (let j of coreMKB.mkb.joints) {
        let p = new THREE.Vector3();
        j.setNextPosition(p.copy(j.position).divideScalar(2));
      }
      coreMKB.animation.start();
    }


  };

  let gui = new GUI();
  let f1 = gui.addFolder('dimension');
  let f2 = gui.addFolder('edit');
  let f3 = gui.addFolder('action');

  effect = new effectController();
  f1.add( effect, "x", 2, 6 ,1);
  f1.add( effect, "y", 2, 6 ,1);
  f1.add( effect, "z", 2, 6 ,1);
  f1.add( effect, "reset");
  f2.add( effect, "constraint", 0, 1, 0.25);
  f2.add( effect, "addBeam");
  f2.add( effect, "removeBeam");
  f3.add( effect, "simulate");
  f1.open();
  f2.open();
  f3.open();

}

function initMKB() {

  coreMKB = new Core(effect.x, effect.y, effect.z);
}


function objectCasted() {
  raycaster.setFromCamera( mouse, camera );
  let intersects = raycaster.intersectObjects( scene.children, true );
  if (intersects.length > 0) {
    let intersect = intersects[0];
    return intersect.object;
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {

  coreMKB.animation.update();

  controls.update();
  renderer.render( scene, camera );

  requestAnimationFrame( animate );
}

initGUI();
initScene();

initMKB();

animate();

window.addEventListener( 'mousemove', Core.onMouseMove, false );
window.addEventListener( 'mousedown', Core.onMouseClick, false );
window.addEventListener( 'keydown', Core.onKeyDown, false );
window.addEventListener( 'keyup', Core.onKeyUp, false );
window.addEventListener( 'resize', onWindowResize, false );


window.core = coreMKB;
window.scene = scene;
window.THREE = THREE;
window.camera = camera;
window.renderer = renderer;
window.controls = controls;
