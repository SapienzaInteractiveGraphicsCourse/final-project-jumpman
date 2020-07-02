import * as THREE from './three.js-r118/build/three.module.js';
import {OBJLoader2} from './three.js-r118/examples/jsm/loaders/OBJLoader2.js';
import {MTLLoader} from './three.js-r118/examples/jsm/loaders/MTLLoader.js';
import {MtlObjBridge} from './three.js-r118/examples/jsm/loaders/obj2/bridge/MtlObjBridge.js';


const playerCharcter = new THREE.Object3D();
const bodyMat = new THREE.MeshPhongMaterial({color: "red"});
const armMat = new THREE.MeshPhongMaterial({color: 0xFFE4C4});
const legMat = new THREE.MeshPhongMaterial({color: "blue"});
const footMat = new THREE.MeshPhongMaterial({color: "brown"});
const bodyGeo = new THREE.BoxBufferGeometry(3,4,1.5);
const armGeo = new THREE.BoxBufferGeometry(2, 1, 1);
const legGeo = new THREE.BoxBufferGeometry(1.2,2,1.2);
const footGeo = new THREE.BoxBufferGeometry(1,1,2);

const body = new THREE.Mesh(bodyGeo, bodyMat);
const upperLeftArm = new THREE.Mesh(armGeo, armMat);
const lowerLeftArm = new THREE.Mesh(armGeo, armMat);
const upperRightArm = new THREE.Mesh(armGeo, armMat);
const lowerRightArm = new THREE.Mesh(armGeo, armMat);
const upperLeftLeg = new THREE.Mesh(legGeo, legMat);
const lowerLeftLeg = new THREE.Mesh(legGeo, legMat);
const upperRightLeg = new THREE.Mesh(legGeo, legMat);
const lowerRightLeg = new THREE.Mesh(legGeo, legMat);
const leftFoot = new THREE.Mesh(footGeo, footMat);
const rightFoot = new THREE.Mesh(footGeo, footMat);

const container = new THREE.Object3D();
const upperLeftArmPivot = new THREE.Object3D();
const lowerLeftArmPivot = new THREE.Object3D();
const upperRightArmPivot = new THREE.Object3D();
const lowerRightArmPivot = new THREE.Object3D();
const upperLeftLegPivot = new THREE.Object3D();
const lowerLeftLegPivot = new THREE.Object3D();
const upperRightLegPivot = new THREE.Object3D();
const lowerRightLegPivot = new THREE.Object3D();
const leftFootPivot = new THREE.Object3D();
const rightFootPivot = new THREE.Object3D();

playerCharcter.add(container);
container.add(body);

upperLeftArmPivot.position.y = body.geometry.parameters.height/2-upperLeftArm.geometry.parameters.height/2;
upperLeftArmPivot.position.x = body.geometry.parameters.width/2+upperLeftArm.geometry.parameters.height/2;
upperLeftArm.position.x = upperLeftArm.geometry.parameters.width/2-upperLeftArm.geometry.parameters.height/2;
upperLeftArmPivot.add(upperLeftArm);

container.add(upperLeftArmPivot);

lowerLeftArmPivot.position.x = upperLeftArm.geometry.parameters.width/2;
lowerLeftArm.position.x = lowerLeftArm.geometry.parameters.width/2;
lowerLeftArmPivot.add(lowerLeftArm);
upperLeftArm.add(lowerLeftArmPivot);

upperRightArmPivot.position.y = body.geometry.parameters.height/2-upperRightArm.geometry.parameters.height/2;
upperRightArmPivot.position.x = -body.geometry.parameters.width/2-upperRightArm.geometry.parameters.height/2;
upperRightArm.position.x = -upperRightArm.geometry.parameters.width/2+upperRightArm.geometry.parameters.height/2;
upperRightArmPivot.add(upperRightArm);

container.add(upperRightArmPivot);

lowerRightArmPivot.position.x = -upperRightArm.geometry.parameters.width/2;
lowerRightArm.position.x = -lowerRightArm.geometry.parameters.width/2;
lowerRightArmPivot.add(lowerRightArm);
upperRightArm.add(lowerRightArmPivot);

upperLeftLegPivot.position.y = -body.geometry.parameters.height/2;
upperLeftLegPivot.position.x =  body.geometry.parameters.width/2-upperLeftLeg.geometry.parameters.width/2;
upperLeftLeg.position.y = -upperLeftLeg.geometry.parameters.height/2;
upperLeftLegPivot.add(upperLeftLeg);
body.add(upperLeftLegPivot);

lowerLeftLegPivot.position.y = -upperLeftLeg.geometry.parameters.height/2;
lowerLeftLeg.position.y = -lowerLeftLeg.geometry.parameters.height/2;
lowerLeftLegPivot.add(lowerLeftLeg);
upperLeftLeg.add(lowerLeftLegPivot);

leftFootPivot.position.y = -lowerLeftLeg.geometry.parameters.height/2 -leftFoot.geometry.parameters.height/2;
leftFootPivot.position.z = -lowerLeftLeg.geometry.parameters.depth/2+leftFoot.geometry.parameters.depth/2;
leftFootPivot.add(leftFoot);
lowerLeftLeg.add(leftFootPivot);

upperRightLegPivot.position.y = -body.geometry.parameters.height/2;
upperRightLegPivot.position.x =  -body.geometry.parameters.width/2+upperRightLeg.geometry.parameters.width/2;
upperRightLeg.position.y = -upperRightLeg.geometry.parameters.height/2;
upperRightLegPivot.add(upperRightLeg);
body.add(upperRightLegPivot);

lowerRightLegPivot.position.y = -upperRightLeg.geometry.parameters.height/2;
lowerRightLeg.position.y = -lowerRightLeg.geometry.parameters.height/2;
lowerRightLegPivot.add(lowerRightLeg);
upperRightLeg.add(lowerRightLegPivot);

rightFootPivot.position.y = -lowerRightLeg.geometry.parameters.height/2 -rightFoot.geometry.parameters.height/2;
rightFootPivot.position.z = -lowerRightLeg.geometry.parameters.depth/2+rightFoot.geometry.parameters.depth/2;
rightFootPivot.add(rightFoot);
lowerRightLeg.add(rightFootPivot);


const mtlLoader = new MTLLoader();
mtlLoader.load('./assets/head.mtl', (mtlParseResult) => {
  const objLoader = new OBJLoader2();
  const materials =  MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
  objLoader.addMaterials(materials);
  objLoader.load('./assets/head.obj', (head) => {
    head.scale.set(4,4,4);
    head.position.y = body.geometry.parameters.height/2;
    container.add(head);
  });
});

mtlLoader.load('./assets/hand.mtl', (mtlParseResult) => {
  const objLoader = new OBJLoader2();
  const materials =  MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
  objLoader.addMaterials(materials);
  objLoader.load('./assets/hand.obj', (rightHand) => {
    const leftHand = rightHand.clone();
    rightHand.position.y = -lowerRightArm.geometry.parameters.height/2;
    rightHand.position.x = -lowerRightArm.geometry.parameters.width/2;
    lowerRightArm.add(rightHand);

    leftHand.scale.multiply(new THREE.Vector3(-1, 1, 1));
    leftHand.position.y = -lowerLeftArm.geometry.parameters.height/2;
    leftHand.position.x = lowerLeftArm.geometry.parameters.width/2;
    lowerLeftArm.add(leftHand);
  });
});

let scale = 1;

upperLeftArmPivot.rotation.x = 0.5;
upperLeftArmPivot.rotation.z = Math.PI/2;

lowerLeftArmPivot.rotation.x = -Math.PI/2;

upperRightArmPivot.rotation.x = 0.5;
upperRightArmPivot.rotation.z = Math.PI/2;

lowerRightArmPivot.rotation.x = Math.PI/2;

upperLeftLegPivot.rotation.x = -0.8;
upperRightLegPivot.rotation.x = 0.8;


//jump to long
const t1 = new TWEEN.Tween([upperLeftArmPivot.rotation, 
                            upperRightArmPivot.rotation,
                            upperLeftLegPivot.rotation,
                            lowerLeftLegPivot.rotation,
                            upperRightLegPivot.rotation,
                            lowerRightLegPivot.rotation,
                            leftFootPivot.rotation,
                            rightFootPivot.rotation])
  .to([{x: Math.PI, z: Math.PI/2}, {x: 0, z: Math.PI/2}, {x: 0}, {x: 0}, 
       {x: 0}, {x: 0}, {x: 0}, {x: 0}], 600)
  .easing(TWEEN.Easing.Quadratic.In)
  .delay(200);

//long to crunch
const t2 = new TWEEN.Tween([upperLeftArmPivot.rotation, 
                            upperRightArmPivot.rotation,
                            upperLeftLegPivot.rotation,
                            lowerLeftLegPivot.rotation,
                            upperRightLegPivot.rotation,
                            lowerRightLegPivot.rotation,
                            leftFootPivot.rotation,
                            rightFootPivot.rotation])
  .to([{x: Math.PI, z: 1}, {x: 0, z: 1}, {x: -1}, {x: Math.PI/2}, 
       {x: -1}, {x: Math.PI/2}, {x: -Math.PI/2+1}, {x: -Math.PI/2+1}], 50)
  .easing(TWEEN.Easing.Quadratic.InOut);

//crunch to long
const t3 = new TWEEN.Tween([upperLeftArmPivot.rotation, 
                            upperRightArmPivot.rotation,
                            upperLeftLegPivot.rotation,
                            lowerLeftLegPivot.rotation,
                            upperRightLegPivot.rotation,
                            lowerRightLegPivot.rotation,
                            leftFootPivot.rotation,
                            rightFootPivot.rotation])
  .to([{x: Math.PI, z: Math.PI/2}, {x: 0, z: Math.PI/2}, {x: 0}, {x: 0}, 
       {x: 0}, {x: 0}, {x: 0}, {x: 0}], 200)
  .easing(TWEEN.Easing.Quadratic.InOut);

//long to jump
const t4 = new TWEEN.Tween([upperLeftArmPivot.rotation, 
                            upperRightArmPivot.rotation,
                            upperLeftLegPivot.rotation,
                            lowerLeftLegPivot.rotation,
                            upperRightLegPivot.rotation,
                            lowerRightLegPivot.rotation,
                            leftFootPivot.rotation,
                            rightFootPivot.rotation])
  .to([{x: 0.5, z: Math.PI/2}, {x: 0.5, z: Math.PI/2}, {x: -0.8}, {x: 0}, 
       {x: 0.8}, {x: 0}, {x: 0}, {x: 0}], 400)
  .easing(TWEEN.Easing.Quadratic.Out);

t2.chain(t3);
t3.chain(t4);

let bodyBBox = new THREE.Box3();
bodyBBox.setFromObject(body);

let freeFall;
let gravityFall;


const playerObj = {
    bouncing: false,
    object3D: playerCharcter,
    boundingBox: bodyBBox,
    height: 0,
    update: function() {
        bodyBBox.setFromObject(body);
        container.position.y = bodyBBox.max.y - bodyBBox.min.y-body.geometry.parameters.height/2*scale;
        this.height = bodyBBox.max.y - bodyBBox.min.y + 2*scale;
    },
    scale: function(x) {
        scale = x;
        container.scale.set(x,x,x);
    },
    downAnimation: function() {
        freeFall = new TWEEN.Tween(playerCharcter.position)
        .to({y: '-30'}, 1000)
        .easing(TWEEN.Easing.Linear.None)
        .repeat(Infinity);

        gravityFall = new TWEEN.Tween(playerCharcter.position) 
            .to({y: '-15'}, 1000)
            .easing(TWEEN.Easing.Quadratic.In)
            .onStart(function(){t1.start()})
            .chain(freeFall);

        return gravityFall;
    },
    startDownAnimation: function() {
        this.downAnimation().start();
    }, 
    stopDownAmimation: function() {
        freeFall.stop();
        gravityFall.stop();
        t1.stop();
    },
    startJumpAiumation: function() {
        const up = new TWEEN.Tween(playerCharcter.position) 
            .to({y: '+15'}, 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .delay(50)
            .chain(this.downAnimation())
            .start()
          
        t2.start();
        this.bouncing = true;
        return up;
    },
    startHighJumpAnimation: function() {
        const up = new TWEEN.Tween(playerCharcter.position) 
            .to({y: '+44'}, 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .delay(50)
            .chain(this.downAnimation())
            .start()
          
        t2.start();
        this.bouncing = true;
        return up;
    }
};

export {playerObj};