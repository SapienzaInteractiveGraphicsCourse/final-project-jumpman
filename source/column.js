import * as THREE from './three.js-r118/build/three.module.js';
import {Loader} from './loader.js';
import {OBB} from './three.js-r118/examples/jsm/math/OBB.js';
import {indexOfMax, randomInRange} from './utils.js';



const allSteps = [];
const realSteps = [];
let allStepsCount = 0;
let realStepsCount = 0;

const columnGroup = new THREE.Object3D();
let column;

const materials = {};
const geometries = {};

const stepWidth = 2;
const stepHeight = 0.5;
const stepDepth = 1.8;

const radius = 4;  
const columnHeight = 80; 

const stepTypes = {
    REAL: 0,
    MOVING: 1,
    HIGH_JUMP: 2,
    BREAKABLE: 3,
    FADE: 4,
    FAKE: 5
}


const stepTypeGenerator = {
    count: 1,
    prev: 0,
    next: function() {
        this.next = this._next;
        return 0;
    },
    _next: function() {
        const prob = [];
        if (this.count<60) {
            for(let i=0; i<=5; i++){
                prob.push(Math.random()/(i+1)*Math.exp(i*this.count*0.01));
            }

            this.count++;
        }  else {
            prob.push(0);
            for(let i=1; i<=5; i++){
                prob.push(Math.random());
            }

            if (this.prev == stepTypes.REAL){
                prob[stepTypes.FAKE]/=2;
            }

            if (this.prev == stepTypes.HIGH_JUMP){
                prob[stepTypes.HIGH_JUMP] = 0;
            }
        }
        

        if (this.prev == stepTypes.FADE){
            prob[stepTypes.FADE] = 0;
        }

        if (this.prev == stepTypes.FAKE){
            this.prev = stepTypes.REAL;
            return this.prev;
        }

        this.prev = indexOfMax(prob);
        return this.prev;
    }
}


function initStepsMaterials() {
    //real step
    materials.realStep = new THREE.MeshPhongMaterial({
        color: "rgb(230, 210, 175)",
        map: Loader.assets.textures.realStepMap.data,
        normalMap: Loader.assets.textures.realStepNormalMap.data,
    });

    //moving step
    const movingStepTopMat = new THREE.MeshPhongMaterial({
        map: Loader.assets.textures.movingStepMap.data.clone(),
        normalMap: Loader.assets.textures.movingStepNormalMap.data.clone(),
        specularMap: Loader.assets.textures.movingStepSpecularMap.data.clone(),
    });

    const movingStepLongSideMat = new THREE.MeshPhongMaterial({
        map: Loader.assets.textures.movingStepMap.data.clone(),
        normalMap: Loader.assets.textures.movingStepNormalMap.data.clone(),
        specularMap: Loader.assets.textures.movingStepSpecularMap.data.clone(),
    });

    const movingStepShortSideMat = new THREE.MeshPhongMaterial({
        map: Loader.assets.textures.movingStepMap.data.clone(),
        normalMap: Loader.assets.textures.movingStepNormalMap.data.clone(),
        specularMap: Loader.assets.textures.movingStepSpecularMap.data.clone(),
    });

    movingStepTopMat.map.needsUpdate = true;
    movingStepTopMat.map.repeat.set(stepWidth/5, stepDepth/5);
    movingStepTopMat.normalMap.needsUpdate = true;
    movingStepTopMat.normalMap.repeat.set(stepWidth/5, stepDepth/5); 
    movingStepTopMat.specularMap.needsUpdate = true;
    movingStepTopMat.specularMap.repeat.set(stepWidth/5, stepDepth/5);

    movingStepLongSideMat.map.needsUpdate = true;
    movingStepLongSideMat.map.repeat.set(stepWidth/5, stepHeight/5);
    movingStepLongSideMat.normalMap.needsUpdate = true;
    movingStepLongSideMat.normalMap.repeat.set(stepWidth/5, stepHeight/5);
    movingStepLongSideMat.specularMap.needsUpdate = true;
    movingStepLongSideMat.specularMap.repeat.set(stepWidth/5, stepHeight/5);

    movingStepShortSideMat.map.needsUpdate = true;
    movingStepShortSideMat.map.repeat.set(stepDepth/5, stepHeight/5);
    movingStepShortSideMat.normalMap.needsUpdate = true;
    movingStepShortSideMat.normalMap.repeat.set(stepDepth/5, stepHeight/5);
    movingStepShortSideMat.specularMap.needsUpdate = true;
    movingStepShortSideMat.specularMap.repeat.set(stepDepth/5, stepHeight/5);
    
    materials.movingStep = [movingStepShortSideMat, movingStepShortSideMat, 
                              movingStepTopMat, movingStepTopMat, 
                              movingStepLongSideMat, movingStepLongSideMat];


    //high jump step
    materials.highJumpStep = new THREE.MeshPhongMaterial({
        color: 0xDC143C,
        shininess: 150
    });

    materials.highJumpSpring = new THREE.MeshPhongMaterial({
        color: 0x778899, 
        shininess: 150
    });
    
    
    //breakable step
    const breakableStepTopMat = new THREE.MeshPhongMaterial({
        map: Loader.assets.textures.breakableStepTopMap.data,
        shininess: 5
    });
    
    const breakableStepSideMat = new THREE.MeshPhongMaterial({
        map: Loader.assets.textures.breakableStepSideMap.data,
        shininess: 5
    });

    materials.breakableStep = [breakableStepSideMat, breakableStepSideMat, 
                                  breakableStepTopMat, breakableStepTopMat, 
                                  breakableStepSideMat, breakableStepSideMat];


    //cracked step
    const crackedStepTopMat = new THREE.MeshPhongMaterial({
        map: Loader.assets.textures.crackedStepTopMap.data,
        normalMap: Loader.assets.textures.crackedStepTopNormalMap.data,
        shininess: 5
    });
  
    const crackedStepSideMat = new THREE.MeshPhongMaterial({
        map: Loader.assets.textures.crackedStepSideMap.data,
        normalMap: Loader.assets.textures.crackedStepSideNormalMap.data,
        shininess: 5
    });


    materials.crackedStep = [breakableStepSideMat, breakableStepSideMat, 
                                crackedStepTopMat, crackedStepTopMat, 
                                crackedStepSideMat, crackedStepSideMat];
    
    //fading step material
    materials.fadeStep = new THREE.MeshPhongMaterial({
        opacity: 1,
        emissive: 'white',
        transparent: true
    });

    const fade = new TWEEN.Tween(materials.fadeStep) 
        .to({opacity: 0}, 2000)
        .easing(TWEEN.Easing.Exponential.InOut)
        .yoyo(true)
        .repeat(Infinity)
        .start();


    //fake step material
    materials.fakeStep = new THREE.MeshPhongMaterial({
        color: 0xFFFFFF,
        opacity: 0.7,
        transparent: true
    });
}


function initGeometries() {
    //normal step
    geometries.normalStep = new THREE.BoxBufferGeometry(stepWidth, stepHeight, stepDepth);
    geometries.normalStep.userData.obb = new OBB();
    geometries.normalStep.userData.obb.halfSize = new THREE.Vector3(stepWidth/2, stepHeight/2, stepDepth/2);
    geometries.normalStep.userData.obb.center.y = stepHeight/2;

    //high jump step
    class SpringCurve extends THREE.Curve {
        constructor(stepHeight, radius, levels) {
            super();
            this.stepHeight = stepHeight;
            this.radius = radius;
            this.levels = levels;
        }
        getPoint(t) {
            const tx = Math.sin(t*this.levels*Math.PI*2);
            const tz = Math.cos(t*this.levels*Math.PI*2);
            return new THREE.Vector3(tx, t*this.stepHeight/this.radius, tz).multiplyScalar(this.radius);
        }
    }
          
    const path = new SpringCurve(1, 0.7, 3);      
    const tubularSegments = 50;  
    const tubeRadius = 0.08;  
    const tubeRadialSegments = 20;
    const closed = false;  
    geometries.highJumpSpring = new THREE.TubeBufferGeometry(path, tubularSegments, tubeRadius, tubeRadialSegments, closed);
    geometries.highJumpStep = new THREE.BoxBufferGeometry(stepWidth, stepHeight/2, stepDepth);
    geometries.highJumpStep.userData.obb = new OBB();
    geometries.highJumpStep.userData.obb.halfSize = new THREE.Vector3(stepWidth/2, stepHeight/4, stepDepth/2);
    geometries.highJumpStep.userData.obb.center.y = stepHeight/4;

    const leftPts = [
        new THREE.Vector2(-1,-0.9),
        new THREE.Vector2(-1,0.9),
        new THREE.Vector2(0,0.9),
        new THREE.Vector2(-0.3,0.675),
        new THREE.Vector2(0,0.45),
        new THREE.Vector2(-0.3,0.225),
        new THREE.Vector2(0,0),
        new THREE.Vector2(-0.3,-0.225),
        new THREE.Vector2(0,-0.45),
        new THREE.Vector2(-0.3,-0.675),
        new THREE.Vector2(0,-0.9)
    ];
    
    const rightPts = [
        new THREE.Vector2(1,-0.9),
        new THREE.Vector2(1,0.9),
        new THREE.Vector2(0,0.9),
        new THREE.Vector2(-0.3,0.675),
        new THREE.Vector2(0,0.45),
        new THREE.Vector2(-0.3,0.225),
        new THREE.Vector2(0,0),
        new THREE.Vector2(-0.3,-0.225),
        new THREE.Vector2(0,-0.45),
        new THREE.Vector2(-0.3,-0.675),
        new THREE.Vector2(0,-0.9)
    ];
    
    
    const leftShape = new THREE.Shape(leftPts);
    const rightShape = new THREE.Shape(rightPts);
    
    const extrudeSettings = {
      steps:   1,  
      depth:  stepDepth,  
      bevelEnabled: false,  
    };
    geometries.brokenStepLeft = new THREE.ExtrudeBufferGeometry( leftShape, extrudeSettings ); 
    geometries.brokenStepRight = new THREE.ExtrudeBufferGeometry( rightShape, extrudeSettings );
}

function preload(scene) {
    const tempGeo = new THREE.BoxBufferGeometry(1, 1, 1);

    for (const material of Object.values(materials)) {
        const mesh = new THREE.Mesh(tempGeo, material);
        mesh.position.y = -20;
        mesh.frustumCulled = false;
        mesh.onAfterRender = function(){
            scene.remove(mesh);
        };
        scene.add(mesh);
    }

    for (const geometry of Object.values(geometries)) {
        const mesh = new THREE.Mesh(geometry);
        mesh.position.y = -20;
        mesh.frustumCulled = false;
        mesh.onAfterRender = function(){
            scene.remove(mesh);
        };
        scene.add(mesh);
    }
}

function init(scene) {
    columnGroup.position.z = 10;

    const radialSegments = 30;  
    const geometry = new THREE.CylinderGeometry(radius, radius, columnHeight, radialSegments);
            
    const material = new THREE.MeshPhongMaterial({
        color: "rgb(230, 210, 175)",
        normalMap: Loader.assets.textures.columnNormalMap.data
    });

    material.normalMap.repeat.set(18, 1);

    column = new THREE.Mesh(geometry, material);
    column.position.y = columnHeight/2;

    initStepsMaterials();
    initGeometries();

    preload(scene);


    columnGroup.add(column);
    scene.add(columnGroup);  
}


let rotation = 0;
let position = 1;

function addSteps(num) {
    const l = allStepsCount+num;
    for (; allStepsCount<l; allStepsCount++) {
        let step;

        let stepType = stepTypeGenerator.next();

        switch(stepType) {
            case stepTypes.REAL:
                step = new THREE.Mesh(geometries.normalStep, materials.realStep);
                step.userData.obb = new OBB();
                step.userData.id = realStepsCount;
                realStepsCount++;
                realSteps.push(step);

                break;
            case stepTypes.FAKE:
                step = new THREE.Mesh(geometries.normalStep, materials.fakeStep);

                break;
            case stepTypes.BREAKABLE:
                step = new THREE.Mesh(geometries.normalStep, materials.breakableStep);
                step.userData.obb = new OBB();
                step.userData.id = realStepsCount;
                realStepsCount++;
                realSteps.push(step);
                step.userData.status = "intact";
                step.userData.crack = function() {
                    step.userData.status = "cracked";
                    step.material = materials.crackedStep;
                };
                step.userData.break = function() {
                    const leftMesh = new THREE.Mesh(geometries.brokenStepLeft, materials.breakableStep);
                    leftMesh.rotation.x = Math.PI/2;
                    leftMesh.position.y = 0.25;
                    const rightMesh = new THREE.Mesh(geometries.brokenStepRight, materials.breakableStep);
                    rightMesh.rotation.x = Math.PI/2;
                    rightMesh.position.y = 0.25;
                            
                    const brokenStep = new THREE.Object3D();
                    brokenStep.add(leftMesh);
                    brokenStep.add(rightMesh);
                    brokenStep.position.y = step.position.y;
                    brokenStep.position.z = step.position.z;

                    const pivot = step.parent;
                    pivot.remove(step);
                    pivot.add(brokenStep);

                    const fallLeft = new TWEEN.Tween(leftMesh.position)
                        .to({y: '-30', x:'-5'}, 700)
                        .easing(TWEEN.Easing.Linear.None)
                        .repeat(Infinity)
                        .start();

                    const fallRight = new TWEEN.Tween(rightMesh.position)
                        .to({y: '-30', x:'+5'}, 700)
                        .easing(TWEEN.Easing.Linear.None)
                        .repeat(Infinity)
                        .start();
                };
                
                break;
            case stepTypes.MOVING:
                step = new THREE.Mesh(geometries.normalStep, materials.movingStep);
                step.userData.obb = new OBB();
                step.userData.id = realStepsCount;
                realStepsCount++;
                realSteps.push(step);

                break;
            case stepTypes.HIGH_JUMP:
                const stepTop = new THREE.Mesh(geometries.highJumpStep, materials.highJumpStep);
                const stepBottom = new THREE.Mesh(geometries.highJumpStep, materials.highJumpStep);
                const spring = new THREE.Mesh(geometries.highJumpSpring, materials.highJumpSpring);

                stepBottom.userData.obb = new OBB();
                stepBottom.userData.id = realStepsCount;
                realStepsCount++;

                stepTop.name = "stepTop";
                spring.name = "spring";

                stepBottom.add(spring);
                stepTop.position.y = spring.geometry.parameters.path.stepHeight;
                spring.add(stepTop);

                step = stepBottom;

                step.userData.jump = function() {
                    spring.scale.y = 0.6;

                    const expand = new TWEEN.Tween(spring.scale) 
                        .to({y: [4, 1]}, 200)
                        .easing(TWEEN.Easing.Quadratic.InOut)

                    const contract = new TWEEN.Tween(spring.scale) 
                        .to({y: 0.2}, 100)
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .chain(expand)
                        .start();
                }

                realSteps.push(step);

                break;
            case stepTypes.FADE:
                step = new THREE.Mesh(geometries.normalStep, materials.fadeStep);
                step.userData.obb = new OBB();
                step.userData.id = realStepsCount;
                realStepsCount++;
                realSteps.push(step);

                break;
        }

        step.userData.type = stepType;
        step.name = allStepsCount;

        step.position.z = radius + stepDepth/2 - 0.1;
        step.position.y += position;


        if (stepType == stepTypes.MOVING) {
            const upAndDown = new TWEEN.Tween(step.position) 
                .to({y: '+5'}, 1000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .yoyo(true)
                .repeat(Infinity)
                .start();
        }

        const pivot = new THREE.Object3D();
        pivot.add(step);
        pivot.rotation.y = rotation;

        
        columnGroup.add(pivot);    

        if (stepType == stepTypes.FAKE) {
            rotation += 0.8;
            position += 3;
        } else {
            rotation += randomInRange(0.9, 1.1);
            position += randomInRange(4, 6);
        }
            
        
        allSteps.push(step);

    }
}

function removeSteps(num) {
    for(let i=0; i<num; i++){
        columnGroup.remove(allSteps[0].parent);
        if (allSteps[0].userData.type != stepTypes.FAKE) {
            realSteps.shift();
        } 
        allSteps.shift();
    }
}

function update(move, frustum) {
    for (let i=0; i<realSteps.length; i++) {
        if(realSteps[i].userData.type == stepTypes.HIGH_JUMP) {
            const stepTop = realSteps[i].getObjectByName("stepTop");
            stepTop.updateMatrix();
            stepTop.updateMatrixWorld();
            realSteps[i].userData.obb.copy( stepTop.geometry.userData.obb );
            realSteps[i].userData.obb.applyMatrix4( stepTop.matrixWorld );
        } else {
            realSteps[i].updateMatrix();
            realSteps[i].updateMatrixWorld();
            realSteps[i].userData.obb.copy( realSteps[i].geometry.userData.obb );
            realSteps[i].userData.obb.applyMatrix4( realSteps[i].matrixWorld );
        }
    }

    if (!frustum.containsPoint(allSteps[0].position)) {
        removeSteps(1);
    }

    columnGroup.rotation.y += 0.02 * move;
}

function up(y) {
    const up = new TWEEN.Tween(column.position) 
        .to({y: y}, 1000) 
        .easing(TWEEN.Easing.Quadratic.Out)
        .start(); 
}

export {init, addSteps, removeSteps, update, realSteps, stepTypes, up};