import * as THREE from './js/three.module.js';
import { OBB } from './js/OBB.js';

function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({canvas, antialias: true});

    

    const scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x00BFFF );

    //camera
    const fov = 35;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set( 0, 40, 60 );
    camera.lookAt( 0, 0, 0 );
    scene.add( camera );

    const frustum = new THREE.Frustum();


    //ground
    const groundMaterial = new THREE.MeshBasicMaterial({color: 'grey'});
    const groundGeometry = new THREE.BoxBufferGeometry(100, 1, 60);
    const ground = new THREE.Mesh(
        groundGeometry,
        groundMaterial,
    );

    ground.position.y = -0.5;

    groundGeometry.userData.obb = new OBB();
    groundGeometry.userData.obb.halfSize = new THREE.Vector3(50, 0.7, 30);
    ground.userData.obb = new OBB();

    scene.add(ground);


    //light
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);


    //cilinder
    const columnGroup = new THREE.Object3D();
    columnGroup.position.z = 10;

    const radius = 4;  
    const height = 60;  
    const radialSegments = 12;  
    const cilinderGeo = new THREE.CylinderGeometry(radius, radius, height, radialSegments);

    const cilinderMat = new THREE.MeshPhongMaterial({
        color: 0xFF0000,    // red (can also use a CSS color string here)
        //flatShading: true,
    });

    const cylinder = new THREE.Mesh(cilinderGeo, cilinderMat);
    cylinder.position.y = height/2;

    scene.add(columnGroup);
    columnGroup.add(cylinder);

    const realStepMat = new THREE.MeshPhongMaterial({color: 0x000000});
    const fakeStepMat = new THREE.MeshPhongMaterial({color: 0xFFFFFF});

    const stepGeo = new THREE.BoxBufferGeometry(2, 0.5, 3);
    stepGeo.userData.obb = new OBB();
    stepGeo.userData.obb.halfSize = new THREE.Vector3(1, 0.25, 1.5);

    const allSteps = [];
    const realSteps = [];
    let allStepsCount = 0;
    let realStepsCount = 0;
    let lastRealStep = 0;
    let lastStep = 0;

    function addSteps(num) {
        const l = allStepsCount+num;
        for (; allStepsCount<l; allStepsCount++) {
            let step;
    
            if(allStepsCount%2==0){
                step = new THREE.Mesh(stepGeo, realStepMat);
                step.userData.obb = new OBB();
                step.userData.id = realStepsCount;
                realStepsCount++;
                realSteps.push(step);
            } else {
                step = new THREE.Mesh(stepGeo, fakeStepMat);
            }
    
            step.name = allStepsCount;
    
            step.position.z = radius;
            step.position.y = 4*allStepsCount;
    
            var pivot = new THREE.Object3D();
            pivot.add(step);
            pivot.rotation.y = allStepsCount;
            columnGroup.add(pivot);    
            
            allSteps.push(step);
        }
    }

    function removeSteps(num) {
        for(let i=0; i<num; i++){
            columnGroup.remove(allSteps[0].parent);
            if (allSteps[0].userData.id != null) {
                realSteps.shift();
            } 
            allSteps.shift();
        }
    }

    addSteps(7);

    //box
    const boxSize = 1;
    const geometry = new THREE.BoxBufferGeometry(boxSize, boxSize, boxSize);
    const material = new THREE.MeshPhongMaterial({color: 0x44aa88}); // greenish blue

    const cube = new THREE.Mesh(geometry, material);
    cube.position.y = boxSize/2 + 15;
    cube.position.z = 15;
    scene.add(cube);

    geometry.userData.obb = new OBB();
    geometry.userData.obb.halfSize = new THREE.Vector3(boxSize/2, boxSize/2, boxSize/2);
    cube.userData.obb = new OBB();
   

    //g = 30 m/s^2
    //terminal velocity 30 m/s
    //time to reach terminal velocity 1 s
    //distance traveled until terminal velocity 15m

    let freeFall = new TWEEN.Tween(cube.position)
        .to({y: '-30'}, 1000)
        .easing(TWEEN.Easing.Linear.None)
        .repeat(Infinity);
    
    let gravityFall = new TWEEN.Tween(cube.position) 
        .to({y: '-15'}, 1000)
        .easing(TWEEN.Easing.Quadratic.In)
        .chain(freeFall)
        .start();
    
    
    /*let down = new TWEEN.Tween(cube.position) 
        .to({y: '-15'}, 1000)
        .easing(TWEEN.Easing.Quadratic.In)
        .repeat(Infinity)
        .onRepeat(function() {
            down.to({y: '-30'}, 1000)
                .easing(TWEEN.Easing.Linear.None)
            })
        .start()*/



    //controls
    let move = 0;

    document.onkeydown = keyDown;

    function keyDown(e) {
        if (e.keyCode == '37') {
            // left arrow
            move = 1;
        }
        else if (e.keyCode == '39') {
            // right arrow
            move = -1;
        }
        else if (e.keyCode == '38') {
            camera.position.y+=1;
        } 
        else if (e.keyCode == '40') {
            // right arrow
            camera.position.y-=1;
        }
    }

    document.onkeyup = keyUp;

    function keyUp(e) {
        if (e.keyCode == '37' || e.keyCode == '39') {
            move = 0;
        }
    }



    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    function render(time) {
        //time *= 0.001;  // convert time to seconds
        TWEEN.update(time);

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }



        cube.updateMatrix();
        cube.updateMatrixWorld();
        cube.userData.obb.copy( cube.geometry.userData.obb );
        cube.userData.obb.applyMatrix4( cube.matrixWorld );

        ground.updateMatrix();
        ground.updateMatrixWorld();
        ground.userData.obb.copy( ground.geometry.userData.obb );
        ground.userData.obb.applyMatrix4( ground.matrixWorld );

        for (let i=0; i<realSteps.length; i++) {
            realSteps[i].updateMatrix();
            realSteps[i].updateMatrixWorld();
            realSteps[i].userData.obb.copy( realSteps[i].geometry.userData.obb );
            realSteps[i].userData.obb.applyMatrix4( realSteps[i].matrixWorld );
        }


        camera.updateMatrix();
        camera.updateMatrixWorld();
        frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));


        /*if (!frustum.containsPoint()) {
            console.log("It's off-screen!");
        }*/


        //collision
        for (let i=0; i<realSteps.length; i++) {
            if (cube.userData.obb.intersectsOBB(realSteps[i].userData.obb)) {                
                if (realSteps[i].userData.id > lastRealStep) {
                    const stepsJumped = realSteps[i].name - lastStep;
                    addSteps(stepsJumped);
                    lastRealStep = realSteps[i].userData.id;
                    lastStep = realSteps[i].name;


                    const y = realSteps[i].position.y;

                    //trovare soluzione migliore
                    if (camera.position.y>56){
                        const up = new TWEEN.Tween(cylinder.position) 
                            .to({y: y}, 1000) 
                            .easing(TWEEN.Easing.Quadratic.Out)
                            .start();

                        removeSteps(stepsJumped);
                        
                    }
                    const up = new TWEEN.Tween(camera.position) 
                        .to({y: 40+y}, 1000) 
                        .easing(TWEEN.Easing.Quadratic.Out)
                        .start(); 
                }
                

                gravityFall.stop();

                freeFall = new TWEEN.Tween(cube.position)
                    .to({y: '-30'}, 1000)
                    .easing(TWEEN.Easing.Linear.None)
                    .repeat(Infinity);

                gravityFall = new TWEEN.Tween(cube.position) 
                    .to({y: '-15'}, 1000)
                    .easing(TWEEN.Easing.Quadratic.In)
                    .chain(freeFall);
    
                const bounce = new TWEEN.Tween(cube.position) 
                    .to({y: '+14'}, 1000) 
                    .easing(TWEEN.Easing.Quadratic.Out)
                    .chain(gravityFall)
                    .start();
                
                break;
            }
        }
    
        if (cube.userData.obb.intersectsOBB(ground.userData.obb)) {
            gravityFall.stop();
        }


        //cylinder rotation
        columnGroup.rotation.y += 0.02 * move;


        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

}

main();
