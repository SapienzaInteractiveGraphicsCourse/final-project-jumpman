import * as THREE from './three.js-r118/build/three.module.js';
import {Loader} from './loader.js';

let playerCharcter;
let boundingBox;
let torsoBBox;
let topPosition;
let container;
let torso;
let head;
let leftHand;
let rightHand;
let upperLeftArm;
let lowerLeftArm;
let upperRightArm;
let lowerRightArm;
let upperLeftLeg;
let lowerLeftLeg;
let upperRightLeg;
let lowerRightLeg;
let leftFoot;
let rightFoot;
let upperLeftArmPivot;
let lowerLeftArmPivot;
let upperRightArmPivot;
let lowerRightArmPivot;
let upperLeftLegPivot;
let lowerLeftLegPivot;
let upperRightLegPivot;
let lowerRightLegPivot;
let leftFootPivot;
let rightFootPivot;

const scale = 1/4;
const torsoWidth = 3;
const torsoHeight = 4;
const torsoDepth = 1.5;
const armWidth = 2;
const armHeight = 1;
const armDepth = 1;
const legWidth = 1.2;
const legHeight = 2;
const legDepth = 1.2;
const footWidth = 1;
const footHeight = 1;
const footDepth = 2;

let jumpToLong;
let freeFall;
let gravityFall;

let bouncing = false;

// Starts the falling animation
function startFallAnimation() {
    bouncing = false;

    jumpToLong = new TWEEN.Tween([upperLeftArmPivot.rotation, 
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
    
    freeFall = new TWEEN.Tween(playerCharcter.position)
        .to({y: '-30'}, 1000)
        .easing(TWEEN.Easing.Linear.None)
        .repeat(Infinity);

    gravityFall = new TWEEN.Tween(playerCharcter.position) 
        .to({y: '-15'}, 1000)
        .easing(TWEEN.Easing.Quadratic.In)
        .chain(freeFall);
    
    jumpToLong.start();
    gravityFall.start();
}

// Stops the falling animation
function stopFallAnimation() {
    jumpToLong.stop();
    freeFall.stop();
    gravityFall.stop();
}

// Starts the jumping animation
// If high = false it jumps by 15 points
// If high = true it jumps by 44 points
// Once the jump animations completes the falling animations is restarted
function startJumpAnimation(high = false) {
    stopFallAnimation();

    bouncing = true;

    const longToCrouch = new TWEEN.Tween([upperLeftArmPivot.rotation, 
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

    const crouchToLong = new TWEEN.Tween([upperLeftArmPivot.rotation, 
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

    const longToJump = new TWEEN.Tween([upperLeftArmPivot.rotation, 
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

    const jumpToLong1 = new TWEEN.Tween([upperLeftArmPivot.rotation, 
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
        .delay(600);
    
    longToCrouch.chain(crouchToLong);
    crouchToLong.chain(longToJump);
    longToJump.chain(jumpToLong1);

    let height = '+15';
    if (high) height = '+44';
    
    const jump = new TWEEN.Tween(playerCharcter.position) 
        .to({y: height}, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .delay(50)
        .onComplete(startFallAnimation);

    longToCrouch.start();
    jump.start();
}

// Initializes the player character and adds it to the scene
function init(scene) {
    const torsoMat = new THREE.MeshPhongMaterial({color: "red"});
    const armMat = new THREE.MeshPhongMaterial({color: 0xFFE4C4});
    const legMat = new THREE.MeshPhongMaterial({color: "blue"});
    const footMat = new THREE.MeshPhongMaterial({color: "brown"});
    const torsoGeo = new THREE.BoxBufferGeometry(torsoWidth, torsoHeight, torsoDepth);
    const armGeo = new THREE.BoxBufferGeometry(armWidth, armHeight, armDepth);
    const legGeo = new THREE.BoxBufferGeometry(legWidth, legHeight, legDepth);
    const footGeo = new THREE.BoxBufferGeometry(footWidth, footHeight, footDepth);

    playerCharcter = new THREE.Object3D();
    boundingBox = new THREE.Box3();
    container = new THREE.Object3D();
    torso = new THREE.Mesh(torsoGeo, torsoMat);
    head = Loader.assets.objects.headObj.data;
    leftHand = Loader.assets.objects.handObj.data.clone();
    rightHand = Loader.assets.objects.handObj.data.clone();
    upperLeftArm = new THREE.Mesh(armGeo, armMat);
    lowerLeftArm = new THREE.Mesh(armGeo, armMat);
    upperRightArm = new THREE.Mesh(armGeo, armMat);
    lowerRightArm = new THREE.Mesh(armGeo, armMat);
    upperLeftLeg = new THREE.Mesh(legGeo, legMat);
    lowerLeftLeg = new THREE.Mesh(legGeo, legMat);
    upperRightLeg = new THREE.Mesh(legGeo, legMat);
    lowerRightLeg = new THREE.Mesh(legGeo, legMat);
    leftFoot = new THREE.Mesh(footGeo, footMat);
    rightFoot = new THREE.Mesh(footGeo, footMat);

    upperLeftArmPivot = new THREE.Object3D();
    lowerLeftArmPivot = new THREE.Object3D();
    upperRightArmPivot = new THREE.Object3D();
    lowerRightArmPivot = new THREE.Object3D();
    upperLeftLegPivot = new THREE.Object3D();
    lowerLeftLegPivot = new THREE.Object3D();
    upperRightLegPivot = new THREE.Object3D();
    lowerRightLegPivot = new THREE.Object3D();
    leftFootPivot = new THREE.Object3D();
    rightFootPivot = new THREE.Object3D();

    playerCharcter.add(container);
    container.add(torso);

    head.scale.set(4,4,4);
    head.position.y = torsoHeight/2;
    container.add(head);

    upperLeftArmPivot.position.y = torsoHeight/2-armHeight/2;
    upperLeftArmPivot.position.x = torsoWidth/2+armHeight/2;
    upperLeftArm.position.x = armWidth/2-armHeight/2;
    upperLeftArmPivot.add(upperLeftArm);

    container.add(upperLeftArmPivot);

    lowerLeftArmPivot.position.x = armWidth/2;
    lowerLeftArm.position.x = armWidth/2;
    lowerLeftArmPivot.add(lowerLeftArm);
    upperLeftArm.add(lowerLeftArmPivot);

    upperRightArmPivot.position.y = torsoHeight/2-armHeight/2;
    upperRightArmPivot.position.x = -torsoWidth/2-armHeight/2;
    upperRightArm.position.x = -armWidth/2+armHeight/2;
    upperRightArmPivot.add(upperRightArm);

    container.add(upperRightArmPivot);

    lowerRightArmPivot.position.x = -armWidth/2;
    lowerRightArm.position.x = -armWidth/2;
    lowerRightArmPivot.add(lowerRightArm);
    upperRightArm.add(lowerRightArmPivot);

    rightHand.position.y = -armHeight/2;
    rightHand.position.x = -armWidth/2;
    lowerRightArm.add(rightHand);

    leftHand.scale.multiply(new THREE.Vector3(-1, 1, 1));
    leftHand.position.y = -armHeight/2;
    leftHand.position.x = armWidth/2;
    lowerLeftArm.add(leftHand);

    upperLeftLegPivot.position.y = -torsoHeight/2;
    upperLeftLegPivot.position.x =  torsoWidth/2-legWidth/2;
    upperLeftLeg.position.y = -legHeight/2;
    upperLeftLegPivot.add(upperLeftLeg);
    torso.add(upperLeftLegPivot);

    lowerLeftLegPivot.position.y = -legHeight/2;
    lowerLeftLeg.position.y = -legHeight/2;
    lowerLeftLegPivot.add(lowerLeftLeg);
    upperLeftLeg.add(lowerLeftLegPivot);

    leftFootPivot.position.y = -legHeight/2 -footHeight/2;
    leftFootPivot.position.z = -legDepth/2+footDepth/2;
    leftFootPivot.add(leftFoot);
    lowerLeftLeg.add(leftFootPivot);

    upperRightLegPivot.position.y = -torsoHeight/2;
    upperRightLegPivot.position.x =  -torsoWidth/2+legWidth/2;
    upperRightLeg.position.y = -legHeight/2;
    upperRightLegPivot.add(upperRightLeg);
    torso.add(upperRightLegPivot);

    lowerRightLegPivot.position.y = -legHeight/2;
    lowerRightLeg.position.y = -legHeight/2;
    lowerRightLegPivot.add(lowerRightLeg);
    upperRightLeg.add(lowerRightLegPivot);

    rightFootPivot.position.y = -legHeight/2 -footHeight/2;
    rightFootPivot.position.z = -legDepth/2+footDepth/2;
    rightFootPivot.add(rightFoot);
    lowerRightLeg.add(rightFootPivot);

    container.scale.set(scale, scale, scale);

    torsoBBox = new THREE.Box3();
    torsoBBox.setFromObject(torso);
    container.position.y = (torsoBBox.max.y - torsoBBox.min.y-torso.geometry.parameters.height/2)*scale;
    

    upperLeftArmPivot.rotation.x = 0.5;
    upperLeftArmPivot.rotation.z = Math.PI/2;

    lowerLeftArmPivot.rotation.x = -Math.PI/2;

    upperRightArmPivot.rotation.x = 0.5;
    upperRightArmPivot.rotation.z = Math.PI/2;

    lowerRightArmPivot.rotation.x = Math.PI/2;

    upperLeftLegPivot.rotation.x = -0.8;
    upperRightLegPivot.rotation.x = 0.8;

    playerCharcter.position.y = 15;
    playerCharcter.position.z = 15;
    playerCharcter.rotation.y = Math.PI/2-0.2;

    boundingBox = new THREE.Box3();
    boundingBox.setFromObject(playerCharcter);

    topPosition = torsoBBox.max.y+1;

    scene.add(playerCharcter); 
}

// Updates the player character
function update() {
    torsoBBox.setFromObject(torso);
    container.position.y = torsoBBox.max.y - torsoBBox.min.y-torsoHeight/2*scale;
    boundingBox.setFromObject(playerCharcter);
    topPosition = new THREE.Vector3(playerCharcter.position.x, torsoBBox.max.y, playerCharcter.position.z);
}

export {init, update, boundingBox, startJumpAnimation, startFallAnimation, bouncing, stopFallAnimation, topPosition};