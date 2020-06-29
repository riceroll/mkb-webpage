<<<<<<< HEAD:public/js/mkb.js
import * as THREE from '../../node_modules/three/build/three.module.js';
=======
<<<<<<< HEAD
import * as THREE from '../../node_modules/three/build/three.module.js'
=======
import * as THREE from './modules/three.js/build/three.module.js'
>>>>>>> 8352ba114680c8fa039256dc9e487119ed68dd08
>>>>>>> Ola:mkb.js
import {Joint} from './joint.js'
import {Beam} from './beam.js'

class MKB {
  constructor(nX=3, nY=3, nZ=3, core) {
    this.core = core

    this.joints = []
    this.beams = new Set()

    this.mesh = new THREE.Object3D()

    this.init(nX, nY, nZ)

    this.selected = []
  }

  init(nX, nY, nZ) {
    for (let iZ = 0; iZ < nZ; iZ++) {
      for (let iY = 0; iY < nY; iY++) {
        for (let iX = 0; iX < nX; iX++) {
          let x = iX * Beam.beamLength
          let y = iY * Beam.beamLength
          let z = iZ * Beam.beamLength
          let joint = new Joint(x, y, z, this)
          this.joints.push(joint)
          this.mesh.add(joint.mesh)
        }
      }
    }

    let iJoint = 0
    for (let iZ = 0; iZ < nZ; iZ++) {
      for (let iY = 0; iY < nY; iY++) {
        for (let iX = 0; iX < nX; iX++) {
          if (iX < nX - 1) {
            let joint0 = this.joints[iJoint]
            let joint1 = this.joints[iJoint + 1]
            this.appendBeam(joint0, joint1)
          }
          if (iY < nY - 1) {
            let joint0 = this.joints[iJoint]
            let joint1 = this.joints[iJoint + nX]
            this.appendBeam(joint0, joint1)
          }
          if (iZ < nZ - 1) {
            let joint0 = this.joints[iJoint]
            let joint1 = this.joints[iJoint + nX * nY]
            this.appendBeam(joint0, joint1)
          }
          iJoint += 1
        }
      }
    }

    this.joints = new Set(this.joints)

  }

  loadVE(v, e) {
    // data = JSON.parse(json);
    // v = data['v'];
    // e = data['e'];

    for (let obj of this.beams) {
      if (obj instanceof Beam) {
<<<<<<< HEAD:public/js/mkb.js
        obj.disconnect();
        this.mesh.remove(obj.mesh);
        this.beams.delete(obj);
      }
    }

    this.joints = [];

    for (let vv of v) {
      this.newJoint(vv[0], vv[1], vv[2]);
    }

    for (let ee of e) {
      this.newBeam(ee[0], ee[1]);
    }


    this.joints = new Set(this.joints);
=======
        obj.disconnect()
        this.mesh.remove(obj.mesh)
        this.beams.delete(obj)
      }
    }

    this.joints = []

    for (let vv of v) {
      this.newJoint(vv[0], vv[1], vv[2])
    }

    for (let ee of e) {
      this.newBeam(ee[0], ee[1])
    }


    this.joints = new Set(this.joints)
>>>>>>> Ola:mkb.js

    // this.updateAll();
  }

  newJoint(x, y, z) {
<<<<<<< HEAD:public/js/mkb.js
    let j = new Joint(x, y, z, this);
    this.joints.push(j);
    this.mesh.add(j.mesh);
  }

  newBeam(iv0, iv1) {
    this.appendBeam(this.joints[iv0], this.joints[iv1]);
=======
    let j = new Joint(x, y, z, this)
    this.joints.push(j)
    this.mesh.add(j.mesh)
  }

  newBeam(iv0, iv1) {
    this.appendBeam(this.joints[iv0], this.joints[iv1])
>>>>>>> Ola:mkb.js
  }

  appendBeam(joint0, joint1) {
    let beam = new Beam(joint0, joint1, this)
    this.beams.add(beam)
    this.mesh.add(beam.mesh)
  }

  center() {
    let bbox = new THREE.Box3().setFromObject(this.mesh)
    return bbox.getCenter(new THREE.Vector3(0,0,0))
  }

  animate(t) {
    for (let joint of this.joints) {
      joint.animate(t)
    }
    this.updateAll()
  }

  updateAll() {
    this.updateBeams()
    this.updateJoints()
  }

  updateJoints() {
    for (let joint of this.joints) {
      joint.updateMesh()
    }
  }

  updateBeams() {
    for (let beam of this.beams) {
      beam.updateMesh()
    }
  }

  hover(obj) {
    for (let joint of this.joints) {
      joint.hover(false)
    }
    for (let beam of this.beams) {
      beam.hover(false)
    }

    if (obj) {
      if ('parent' in obj.userData) {
        obj.userData.parent.hover()
      }
    }
  }

  deselectAll() {
    for (let joint of this.joints) {
      joint.select(false)
    }
    for (let beam of this.beams) {
      beam.select(false)
    }
    this.selected = []
  }

  select(obj) {
<<<<<<< HEAD:public/js/mkb.js
    let constraint = -1;
    if (obj) {
      if ('parent' in obj.userData) {
        let parent = obj.userData.parent;
        parent.select();
        this.selected.push(parent);
        if (parent instanceof Beam) {
          constraint = parent.constraint;
        }
      }
    }
    console.log('return constraint', constraint);
    return constraint;
=======
    let constraint = -1
<<<<<<< HEAD
    
    if (obj) {
      if ('parent' in obj.userData) {
        
        let parent = obj.userData.parent
        
=======
    if (obj) {
      if ('parent' in obj.userData) {
        let parent = obj.userData.parent
>>>>>>> 8352ba114680c8fa039256dc9e487119ed68dd08
        parent.select()
        this.selected.push(parent)
        if (parent instanceof Beam) {
          constraint = parent.constraint
        }
      }
    }
<<<<<<< HEAD
   
    console.log('return constraint', constraint)
    return constraint

=======
    console.log('return constraint', constraint)
    return constraint
>>>>>>> 8352ba114680c8fa039256dc9e487119ed68dd08
>>>>>>> Ola:mkb.js
  }

  beamExist(joint0, joint1) {
    if (joint0 === joint1) return true
    for (let beam of this.beams) {
      if (joint0 in beam.joints || joint1 in beam.joints) return true
    }
    return false
  }

  addBeam() {
    if (!(this.selected.length === 2)) return false
    if (!this.selected[0] instanceof Joint) return false
    if (!this.selected[1] instanceof Joint) return false
    if (this.beamExist(this.selected[0], this.selected[1])) return false

    let beam = new Beam(this.selected[0], this.selected[1], this)
    this.beams.add(beam)
    this.mesh.add(beam.mesh)

    this.updateAll()
    return true
  }

  removeBeam() {
    let removed = false
    for (let obj of this.selected) {
      
      if (obj instanceof Beam) {
        obj.disconnect()
        this.mesh.remove(obj.mesh)
        this.beams.delete(obj)
        removed = true
      }
    }
    return removed
  }

  removeJoint(joint) {
<<<<<<< HEAD
    
        this.joints.delete(joint)
        this.mesh.remove(joint.mesh)          
  }
 
  remove_Joint(){
  
    let removed = false
    
    for (let obj of this.selected) {
      
      if (obj instanceof Joint || obj instanceof Beam) {
        this.mesh.remove(obj.mesh)
        this.joints.delete(obj)
        this.removeBeam(obj)
        console.log("joint removed")
        removed = true
      }
    }
    console.log("joint not removed")
    return removed
  }

  
  selectFace(){

var material = new THREE.MeshStandardMaterial( { color : 0x00cc00 } )

//create a geometry
var geometry = new THREE.Geometry()

geometry.vertices.push(
  new THREE.Vector3(-1, -1,  1),  // 0
  new THREE.Vector3( 1, -1,  1),  // 1
  new THREE.Vector3(-1,  1,  1),  // 2
  new THREE.Vector3( 1,  1,  1),  // 3
  new THREE.Vector3(-1, -1, -1),  // 4
  new THREE.Vector3( 1, -1, -1),  // 5
  new THREE.Vector3(-1,  1, -1),  // 6
  new THREE.Vector3( 1,  1, -1),  // 7
);

//create a new face using vertices 0, 1, 2
var normal = new THREE.Vector3( 0, 0, 1 )
var color = new THREE.Color( 0xffaa00 ) 
var materialIndex = 0

geometry.faces.push(
  // front
  new THREE.Face3(0, 3, 2, normal, color, materialIndex ),
  new THREE.Face3(0, 1, 3, normal, color, materialIndex ),
  // right
  new THREE.Face3(1, 7, 3, normal, color, materialIndex ),
  new THREE.Face3(1, 5, 7, normal, color, materialIndex ),
  // back
  new THREE.Face3(5, 6, 7, normal, color, materialIndex ),
  new THREE.Face3(5, 4, 6, normal, color, materialIndex ),
  // left
  new THREE.Face3(4, 2, 6, normal, color, materialIndex ),
  new THREE.Face3(4, 0, 2, normal, color, materialIndex ),
  // top
  new THREE.Face3(2, 7, 6, normal, color, materialIndex ),
  new THREE.Face3(2, 3, 7, normal, color, materialIndex ),
  // bottom
  new THREE.Face3(4, 1, 0, normal, color, materialIndex ),
  new THREE.Face3(4, 5, 1, normal, color, materialIndex ),
);

//the face normals and vertex normals can be calculated automatically if not supplied above
geometry.computeFaceNormals()
geometry.computeVertexNormals()

scene.add( new THREE.Mesh( geometry, material ) )
console.log("select face working")
}


=======
    this.joints.delete(joint)
    this.mesh.remove(joint.mesh)
  }
>>>>>>> 8352ba114680c8fa039256dc9e487119ed68dd08

  changeConstraint(constraint) {
    for (let obj of this.selected) {
      if (obj instanceof Beam) {
        console.log('mkb change beam constraint')
        obj.constraint = constraint
      }
    }
    this.updateAll()
  }

  changeConstraint(constraint) {
    for (let obj of this.selected) {
      if (obj instanceof Beam) {
        console.log('mkb change beam constraint');
        obj.constraint = constraint;
      }
    }
    this.updateAll();
  }

}

export {MKB}