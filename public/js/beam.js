import * as THREE from '../../node_modules/three/build/three.module.js';

class Beam {
  static beamLength = 1;
  static actuatorLength = Beam.beamLength * 0.7;
  static actuatorWidth = Beam.actuatorLength * 0.1;
  static tubeWidth = Beam.actuatorLength * 0.05;
  static maxContraction = 0.3;
  static colorHovered = new THREE.Color(1.0, 0.5, 0);
  static colorSelected = new THREE.Color(1.0, 0, 0);
  static actuatorColor = new THREE.Color(0.8, 0.8, 0.8);
  static tubeColor = new THREE.Color(1, 1, 1);

  constructor(joint0, joint1, mkb) {
    this.mkb = mkb;
    this.joints = new Set();
    this.connectJoint(joint0);
    this.connectJoint(joint1);
    this.hovered = false;
    this.selected = false;
    this.constraint = 0;

    this.tubeLength = -1; // length of each tube
    this.tubeScaleM = new THREE.Matrix4();
    this.actuatorScaleM = new THREE.Matrix4();
    this.mesh = this.createMesh();
    this.updateMesh();
  }

  disconnect() {
    for (let joint of this.joints) {
      joint.disconnectBeam(this);
    }
    this.joints = new Set();
  }

  vec() {
    let p0 = Array.from(this.joints)[0].position;
    let p1 = Array.from(this.joints)[1].position;
    let vec = new THREE.Vector3();
    vec.subVectors(p1, p0);
    return vec;
  }

  length() {
    return this.vec().length();
  }

  center() {
    let p0 = Array.from(this.joints)[0].position;
    let p1 = Array.from(this.joints)[1].position;
    let pMid = new THREE.Vector3();
    pMid.addVectors(p0, p1);
    pMid.divideScalar(2);
    return pMid;
  }

  contraction() {
    return 1 - (this.length() - 2 * this.tubeLength) / Beam.actuatorLength;
  }

  expansion() {
  //  expansion of radius
    return Math.sqrt(1 / (1 - this.contraction())) - 1;
  }

  actuatorColor() {
    return( new THREE.Color(1, 1, 1).copy(Beam.actuatorColor).multiplyScalar( (1 - Math.sqrt(this.constraint * 0.6) ) ));
  }

  connectJoint(joint) {
    console.assert(this.joints.size <= 1);
    this.joints.add(joint);
    joint.connectBeam(this);
  }

  createMesh() {
    let mesh = new THREE.Object3D();
    let geometry = new THREE.CylinderBufferGeometry(1, 1, 1, 20);
    let material = new THREE.MeshLambertMaterial( {color: this.actuatorColor()} );
    let actuator = new THREE.Mesh(geometry, material);
    actuator.userData.parent = this;
    mesh.add(actuator);

    geometry = new THREE.CylinderBufferGeometry(1, 1, 1, 20);
    material = new THREE.MeshLambertMaterial( {color: Beam.tubeColor} );
    let tube = new THREE.Mesh(geometry, material);
    tube.userData.parent = this;
    mesh.add(tube);

    let length = this.vec().length();
    this.tubeLength = (length - Beam.actuatorLength) / 2;
    console.assert(this.tubeLength > 0);

    this.tubeScaleM.makeScale(1, 1, 1);
    this.actuatorScaleM.makeScale(1, 1, 1);

    mesh.userData.parent = this;
    return mesh;
  }

  updateMesh() {
    let vec = this.vec();
    let length = this.length();
    let center =this.center();

    let actuatorLength = this.length() - this.tubeLength * 2;
    let actuatorWidth = Beam.actuatorWidth * (1 + this.expansion());


    this.mesh.position.set(0, 0, 0);
    this.mesh.rotateX(-Math.PI / 2);
    this.mesh.lookAt(0, 1, 0);
    this.mesh.children[0].applyMatrix4( (new THREE.Matrix4()).getInverse(this.actuatorScaleM) );
    this.mesh.children[1].applyMatrix4( (new THREE.Matrix4()).getInverse(this.tubeScaleM) );

    this.actuatorScaleM.identity().makeScale(actuatorWidth, actuatorLength, actuatorWidth) ;
    this.tubeScaleM.identity().makeScale(Beam.tubeWidth, length, Beam.tubeWidth);
    this.mesh.children[0].applyMatrix4( this.actuatorScaleM );
    this.mesh.children[1].applyMatrix4( this.tubeScaleM );
    this.mesh.lookAt(vec);
    this.mesh.rotateX(Math.PI / 2);
    this.mesh.position.copy(center);

    this.updateColor();
  }

  updateColor() {
    this.mesh.children[0].material.color.copy(this.actuatorColor());
    if (this.hovered) {
      this.mesh.children[0].material.color.copy(Beam.colorHovered);
    }
    if (this.selected) {
      this.mesh.children[0].material.color.copy(Beam.colorSelected);
    }
  }

  hover(t = true) {
    this.hovered = t;
    this.updateColor();
  }

  select(t = true) {
    this.selected = t;
    this.updateColor();
  }

}

export {Beam};