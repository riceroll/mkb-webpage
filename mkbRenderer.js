import * as THREE from '../three.js/build/three.module.js';
import {MKB} from './mkb.js'

class MeshRenderer {
  constructor(core) {
    this.core = core;
    this.mesh = core.mesh;

  }

  beam() {
    let nMax = 20;
    let shape = new THREE.CircleGeometry( 1.0, nMax );
    shape.vertices = shape.vertices.slice(1);
    shape = new THREE.Shape(shape.vertices);

    let v0 = new THREE.Vector3(0, 0, 0);
    let v1 = new THREE.Vector3(0, 0, 1);
    let line = new THREE.LineCurve3(v0, v1);
    let extrudeSettings = {
      steps : 2,
      extrudePath : line
    };

    return (new THREE.ExtrudeGeometry(shape, extrudeSettings));
  }



}

export {MeshRenderer};