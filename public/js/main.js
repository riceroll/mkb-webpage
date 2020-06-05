import * as THREE from '../../node_modules/three/build/three.module.js';
import { OrbitControls } from '../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { GUI } from '../../node_modules/three/examples/jsm/libs/dat.gui.module.js';

import { MKB } from './mkb.js';
import { Animation } from './animation.js';

let camera, scene, renderer, controls;
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
let gui;

let coreMKB;


class Core {
  constructor(x=3, y=3, z=3) {
    this.mkb = new MKB(x, y, z, this);
    this.animation = new Animation(this.mkb);
    this.updateScene();

    this.pressingMeta = false;
    this.constraintChanged = false;
  }

  updateScene() {
    if (! (this.mkb.mesh in scene) ) {
      scene.add(this.mkb.mesh);
    }
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
    console.log('core clicked', coreMKB.constraintChanged);
    if (coreMKB.constraintChanged) {
      console.log('change constraint');
      coreMKB.mkb.changeConstraint(gui.effect.constraint);
      coreMKB.constraintChanged = false;
    }

    if (Core.GUIHovered()) {
      return 0;
    }

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    let obj = objectCasted();

    if  (!coreMKB.pressingMeta) coreMKB.mkb.deselectAll();
    let constraint = coreMKB.mkb.select(obj);
    if (constraint !== -1) {
      gui.effect.constraint = constraint;
    }
  }

  static onKeyDown(e) {
    coreMKB.pressingMeta = (e.key === 'Meta');
  }

  static onKeyUp(e) {
    coreMKB.pressingMeta = !(e.key === 'Meta');
  }

}

function initCore() {
  coreMKB = new Core(gui.effect.x, gui.effect.y, gui.effect.z);
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
  camera.position.set(0, -20, 1 );
  camera.up.set(0,0,1);

  controls = new OrbitControls( camera, renderer.domElement );
  controls.minDistance = 1;
  controls.maxDistance = 500;
  // controls.dynamicDampingFactor = 0.5;

  let aLight = new THREE.AmbientLight( "rgb(255,255,255)", 0.1 );
  scene.add( aLight );

  let dLight = new THREE.DirectionalLight( "rgb(255,255,255)", 0.7);
  dLight.translateOnAxis(new THREE.Vector3(1,-1,1), 100);
  scene.add( dLight );

}

function initGUI() {

  let effectController = function () {
    // dimension
    this.x= 2;
    this.y= 2;
    this.z= 2;
    this.reset = initCore;

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

      // for (let j of coreMKB.mkb.joints) {
      //   let p = new THREE.Vector3();
      //   j.setNextPosition(p.copy(j.position).divideScalar(1.4));
      // }

      let ws = new WebSocket('ws://localhost:8765');
      ws.onmessage = (event) => {
        let json = event.data;
        let data = JSON.parse(json);
        let v = data['v'];
        let e = data['e'];
        coreMKB.mkb.loadVE(v, e);
      };
      ws.onopen = (event) => {
        ws.send('hehe');
        coreMKB.animation.ws = ws;
        coreMKB.animation.start();
      };

    };


    this.load = function() {
      let ws = new WebSocket('ws://localhost:8765');
      ws.onmessage = (event) => {
        let json = event.data;
        let data = JSON.parse(json);
        let v = data['v'];
        let e = data['e'];
        coreMKB.mkb.loadVE(v, e);
      };
      ws.onopen = (event) => {
        ws.send('hehe');
      };
    };
  };

  gui = {};
  gui.sliders = {};
  gui.window = new GUI();
  let f1 = gui.window.addFolder('dimension');
  let f2 = gui.window.addFolder('edit');
  let f3 = gui.window.addFolder('action');

  gui.effect = new effectController();
  f1.add( gui.effect, "x", 2, 6 ,1);
  f1.add( gui.effect, "y", 2, 6 ,1);
  f1.add( gui.effect, "z", 2, 6 ,1);
  f1.add( gui.effect, "reset");
  gui.sliders.constraint = f2.add( gui.effect, "constraint", 0, 1, 0.25).listen();
  f2.add( gui.effect, "addBeam");
  f2.add( gui.effect, "removeBeam");
  f3.add( gui.effect, "simulate");
  f3.add( gui.effect, "load");
  f1.open();
  f2.open();
  f3.open();


  gui.sliders.constraint.onChange(function(value) {
    console.log('constraint onChange');
    coreMKB.constraintChanged = true;
  });

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

  coreMKB.animation.update2();
  controls.update();
  renderer.render( scene, camera );

  requestAnimationFrame( animate );
}


// main ======================================================

initGUI();
initScene();
initCore();
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
