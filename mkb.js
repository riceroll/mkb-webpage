import * as THREE from './modules/three.js/build/three.module.js'
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
    let constraint = -1
    if (obj) {
      if ('parent' in obj.userData) {
        let parent = obj.userData.parent
        parent.select()
        this.selected.push(parent)
        if (parent instanceof Beam) {
          constraint = parent.constraint
        }
      }
    }
    console.log('return constraint', constraint)
    return constraint
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
    this.joints.delete(joint)
    this.mesh.remove(joint.mesh)
  }

  changeConstraint(constraint) {
    for (let obj of this.selected) {
      if (obj instanceof Beam) {
        console.log('mkb change beam constraint')
        obj.constraint = constraint
      }
    }
    this.updateAll()
  }

}

export {MKB}