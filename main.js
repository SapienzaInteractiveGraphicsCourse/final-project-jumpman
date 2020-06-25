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

    /*const groundMaterial = new THREE.MeshBasicMaterial({color: 'grey'});

    const ground = new THREE.Mesh(
        new THREE.BoxGeometry(100, 1, 100),
        groundMaterial,
    );

    ground.position.y = -0.5;

    scene.add(ground);*/



    //cilinder
    const columnGroup = new THREE.Object3D();
    columnGroup.position.z = 10;

    const radius = 4;  
    const height = 60;  
    const radialSegments = 12;  
    const cilinderGeo = new THREE.CylinderGeometry(radius, radius, height, radialSegments);

    const cilinderMat = new THREE.MeshPhongMaterial({
        color: 0xFF0000,    // red (can also use a CSS color string here)
        flatShading: true,
    });

    const cylinder = new THREE.Mesh(cilinderGeo, cilinderMat);
    cylinder.rotation.y = 0.26;
    cylinder.position.y = height/2;

    scene.add(columnGroup);
    columnGroup.add(cylinder);

    const realStepMat = new THREE.MeshPhongMaterial({color: 0x000000});
    const fakeStepMat = new THREE.MeshPhongMaterial({color: 0xFFFFFF});

    const stepGeo = new THREE.BoxBufferGeometry(2, 0.5, 3);
    stepGeo.userData.obb = new OBB();
    stepGeo.userData.obb.halfSize = new THREE.Vector3(1, 0.25, 1.5);

    const steps = [];
    let step_count = 0;

    for (; step_count<7; step_count++) {
        let step;

        if(step_count%2==0){
            step = new THREE.Mesh(stepGeo, realStepMat);
            step.userData.obb = new OBB();
            steps.push(step);
        } else {
            step = new THREE.Mesh(stepGeo, fakeStepMat);
        }

        step.position.z = radius;
        step.position.y = 4*step_count;

        var pivot = new THREE.Object3D();
        pivot.add(step);
        pivot.rotation.y = 1.05*step_count;
        columnGroup.add(pivot);     
    }

    





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
    let down = new TWEEN.Tween(cube.position) 
        .to({y: '-15'}, 1000)
        .easing(TWEEN.Easing.Quadratic.In)
        .repeat(Infinity)
        .onRepeat(function() {
            down.to({y: '-30'}, 1000)
                .easing(TWEEN.Easing.Linear.None)
            })
        .start()




    //light
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);


    let step_num = 0;



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

        for (let i=0; i<steps.length; i++) {
            steps[i].updateMatrix();
            steps[i].updateMatrixWorld();
            steps[i].userData.obb.copy( steps[i].geometry.userData.obb );
            steps[i].userData.obb.applyMatrix4( steps[i].matrixWorld );
        }


        camera.updateMatrix();
        camera.updateMatrixWorld();
        frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));


        /*if (!frustum.containsPoint()) {
            console.log("It's off-screen!");
        }*/


        //collision
        for (let i=0; i<steps.length; i++) {
            if (cube.userData.obb.intersectsOBB(steps[i].userData.obb)) {
                
                if (i > step_num) {
                    //trovare soluzione migliore
                    if (camera.position.y>56){
                        const up = new TWEEN.Tween(cylinder.position) 
                            .to({y: steps[i].position.y}, 1000) 
                            .easing(TWEEN.Easing.Quadratic.Out)
                            .start()
                        



                    }
                    const up = new TWEEN.Tween(camera.position) 
                        .to({y: 40+steps[i].position.y}, 1000) 
                        .easing(TWEEN.Easing.Quadratic.Out)
                        .start()
                    
                    step_num = i;
                }
                

                down.stop();
                down = new TWEEN.Tween(cube.position) 
                    .to({y: '-15'}, 1000)
                    .easing(TWEEN.Easing.Quadratic.In)
                    .repeat(Infinity)
                    .onRepeat(function() {
                        down.to({y: '-30'}, 1000)
                            .easing(TWEEN.Easing.Linear.None)
                    })
    
                const up = new TWEEN.Tween(cube.position) 
                    .to({y: '+15'}, 1000) 
                    .easing(TWEEN.Easing.Quadratic.Out)
                    .chain(down)
                    .start()
                
                break;
            }
        }
    


        //cylinder rotation
        columnGroup.rotation.y += 0.02 * move;


        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

}

main();
