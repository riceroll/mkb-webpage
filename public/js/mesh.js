import * as THREE from '../../node_modules/three/build/three.module.js';

class Mesh {
  constructor(nX=1, nY=1, nZ=1, mkb) {
    this.mkb = mkb
    this.nX = nX;
    this.nY = nY;
    this.nZ = nZ;
    this.v = [];
    this.vNext = [];
    this.e = [];
    this.l0 = [];
    this._init_mesh();

    this.vMoveStep = 0.05;
  }

  _init_mesh() {
    for (let x = 0; x < this.nX; x++) {
      for (let y = 0; y < this.nY; y++) {
        for (let z = 0; z < this.nZ; z++) {

          let p = new THREE.Vector3( x, y, z );
          this.v.push(p);

          let i = this.to_i(x, y, z);
          if ( x != this.nX - 1) {
            let i_next = this.to_i(x+1, y, z);
            this.add_edge(i, i_next);
          }
          if (y != this.nY - 1) {
            let i_next = this.to_i(x, y+1, z);
            this.add_edge(i, i_next);
          }
          if (z != this.nZ - 1) {
            let i_next = this.to_i(x, y, z+1);
            this.add_edge(i, i_next);
          }
        }
      }
    }

    let centroid = this.centroid();
    for (let v of this.v) {
      v.sub(centroid);
    }
  }

  update_v() {
    if (this.vNext.length > 0) {
      let same = true;
      for (let i = 0; i < this.v.length; i++) {
        if (!this.v[i].equals(this.vNext[i])) {
          let vec = new THREE.Vector3(0,0,0);
          vec.subVectors(this.vNext[i], this.v[i]);
          if (vec.length() < this.vMoveStep) {
            this.v[i] = this.vNext[i].clone();
            continue;
          }
          vec.normalize();
          vec.multiplyScalar(this.vMoveStep);
          this.v[i].add(vec);
        }
      }
      if (same) {
        this.vNext = [];
        return false;
      }
    }

    return false
  }

  replace_vertices() {
    this.v = this.vNext;
    this.vNext = [];
  }

  to_i(x, y, z) {
    return x * this.nY * this.nZ + y * this.nZ + z;
  }

  add_edge(i, j) {
    this.e.push([i,j]);
    // this.l0.push( this.get_length([i, j]) );
  }

  get_edge(i, j) {
    for (let e of this.e) {
      if ( (e[0] == i && e[1] == j) || (e[0] == j && e[1] == i)) {
        return e;
      }
    }
  }

  get_length(e) {
    return new THREE.Vector3(0,0,0).copy(this.v[e[0]]).sub(this.v[e[1]]).length();
  }

  bbox() {
    let bb = [];
    let xMax = Math.max.apply(Math, this.v.map(function(o) { return o.x; }));
    let yMax = Math.max.apply(Math, this.v.map(function(o) { return o.y; }));
    let zMax = Math.max.apply(Math, this.v.map(function(o) { return o.z; }));
    let xMin = Math.min.apply(Math, this.v.map(function(o) { return o.x; }));
    let yMin = Math.min.apply(Math, this.v.map(function(o) { return o.y; }));
    let zMin = Math.min.apply(Math, this.v.map(function(o) { return o.z; }));

    bb.push(new THREE.Vector3(xMin, yMin, zMin));
    bb.push(new THREE.Vector3(xMax, yMax, zMax));
    return bb;
  }

  centroid() {
    let bb = this.bbox();
    let cen = new THREE.Vector3(0, 0, 0);
    cen.add(bb[0]).add(bb[1]).divideScalar(2);
    return cen;
  }

}

export {Mesh};