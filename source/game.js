import * as THREE from './three.js-r118/build/three.module.js';
import Stats from './three.js-r118/examples/jsm/libs/stats.module.js';
import {OBB} from './three.js-r118/examples/jsm/math/OBB.js';
import {indexOfMax, randomInRange, resizeRendererToDisplaySize} from './utils.js';
import {addToLeaderboard} from './leaderboard.js';
import {mainMenu} from './menu.js';
import {playerObj} from './playerCharacter.js';


function gameOver(score) {
    const gameOverDiv = document.createElement("div");
    gameOverDiv.setAttribute("id", "game-over");
    document.body.appendChild(gameOverDiv);

    const gameOverText = document.createElement("h");
    gameOverText.innerText = "Game Over";
    gameOverDiv.appendChild(gameOverText);

    const newGameBt = document.createElement("button");
    newGameBt.setAttribute("class", "game-button");
    newGameBt.innerText = "New Game";
    newGameBt.onclick = newGame;
    gameOverDiv.appendChild(newGameBt);

    const menuBt = document.createElement("button");
    menuBt.setAttribute("class", "game-button");
    menuBt.innerText = "Back to menu";
    menuBt.onclick = mainMenu;
    gameOverDiv.appendChild(menuBt);

    const player = prompt("Please enter your name:", "");
    addToLeaderboard(player, score);
}

function newGame() {
    document.body.innerHTML = "";

    const touchLeft = document.createElement("div");
    touchLeft.setAttribute("id", "touch-left");
    document.body.appendChild(touchLeft);

    const touchRight = document.createElement("div");
    touchRight.setAttribute("id", "touch-right");
    document.body.appendChild(touchRight);

    touchLeft.addEventListener("touchstart", function() {
        move = 1;
    }, false);

    touchRight.addEventListener("touchstart", function() {
        move = -1;
    }, false);

    touchRight.addEventListener("touchend", function() {
        move = 0;
    }, false);

    touchLeft.addEventListener("touchend", function() {
        move = 0;
    }, false);

    const scoreDiv = document.createElement("div");
    scoreDiv.setAttribute("id", "score");
    scoreDiv.innerText = "SCORE:0";
    document.body.appendChild(scoreDiv);


    var stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    const canvas = document.createElement("canvas");
    canvas.setAttribute("id", "c");
    document.body.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({canvas, antialias: true});

    

    const scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x00BFFF );

    //camera
    const fov = 35;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set( 0, 40, 50 );
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
    

    groundGeometry.userData.obb = new OBB();
    groundGeometry.userData.obb.halfSize = new THREE.Vector3(50, 0.5, 30);
    groundGeometry.userData.obb.center.y=0.5;
    ground.userData.obb = new OBB();

    ground.position.y = -0.5;

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
    const height = 80;  
    const radialSegments = 30;  
    const cilinderGeo = new THREE.CylinderGeometry(radius, radius, height, radialSegments);

    const loader = new THREE.TextureLoader();
    const normalMap = loader.load('./assets/pillarnormals.png');
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.repeat.set(18, 1); 
    
    const cilinderMat = new THREE.MeshPhongMaterial({
        color: "rgb(230, 210, 175)",
        normalMap: normalMap,
    });

    const cylinder = new THREE.Mesh(cilinderGeo, cilinderMat);
    cylinder.position.y = height/2;

    scene.add(columnGroup);
    columnGroup.add(cylinder);



    const anisotropy = renderer.capabilities.getMaxAnisotropy();
    function setTextureProperties(tx) {
        tx.magFilter = THREE.LinearFilter;
        tx.minFilter = THREE.LinearMipmapLinearFilter;
        tx.anisotropy = anisotropy;
        tx.wrapS = THREE.RepeatWrapping;
        tx.wrapT = THREE.RepeatWrapping;
    }


    const realStepTopMat = new THREE.MeshPhongMaterial({
        color: "rgb(230, 210, 175)",
        map: loader.load('./assets/travertino.png'),
        normalMap: loader.load('./assets/travertino-normal.png')
    });
  
    const realStepSideMat = new THREE.MeshPhongMaterial({
      color: "rgb(230, 210, 175)",
      map: loader.load('./assets/travertino.png'),
      normalMap: loader.load('./assets/travertino-normal.png')
    });

    setTextureProperties(realStepTopMat.map);
    setTextureProperties(realStepTopMat.normalMap);
    setTextureProperties(realStepSideMat.map);
    setTextureProperties(realStepSideMat.normalMap);

    const realStepMat = [realStepSideMat, realStepSideMat, realStepTopMat, 
                         realStepTopMat, realStepSideMat, realStepSideMat];

    
    const movingStepTopMat = new THREE.MeshPhongMaterial({
        map: loader.load('./assets/metal/metal1-dif-1024.png'),
        normalMap: loader.load('./assets/metal/metal1-nor-1024.png'),
        specularMap: loader.load('./assets/metal/metal1-spec-1024.png')
    });

    const movingStepLongSideMat = new THREE.MeshPhongMaterial({
        map: loader.load('./assets/metal/metal1-dif-1024.png'),
        normalMap: loader.load('./assets/metal/metal1-nor-1024.png'),
        specularMap: loader.load('./assets/metal/metal1-spec-1024.png')
    });

    const movingStepShortSideMat = new THREE.MeshPhongMaterial({
        map: loader.load('./assets/metal/metal1-dif-1024.png'),
        normalMap: loader.load('./assets/metal/metal1-nor-1024.png'),
        specularMap: loader.load('./assets/metal/metal1-spec-1024.png')
    });

    setTextureProperties(movingStepTopMat.map);
    setTextureProperties(movingStepTopMat.normalMap);
    setTextureProperties(movingStepTopMat.specularMap);
    setTextureProperties(movingStepLongSideMat.map);
    setTextureProperties(movingStepLongSideMat.normalMap);
    setTextureProperties(movingStepLongSideMat.specularMap);
    setTextureProperties(movingStepShortSideMat.map);
    setTextureProperties(movingStepShortSideMat.normalMap);
    setTextureProperties(movingStepShortSideMat.specularMap);

    movingStepTopMat.map.repeat.set(2/5, 1.8/5);
    movingStepTopMat.normalMap.repeat.set(2/5, 1.8/5);
    movingStepTopMat.specularMap.repeat.set(2/5, 1.8/5);

    movingStepLongSideMat.map.repeat.set(2/5, 0.5/5);
    movingStepLongSideMat.normalMap.repeat.set(2/5, 0.5/5);
    movingStepLongSideMat.specularMap.repeat.set(2/5, 0.5/5);

    movingStepShortSideMat.map.repeat.set(1.8/5, 0.5/5);
    movingStepShortSideMat.normalMap.repeat.set(1.8/5, 0.5/5);
    movingStepShortSideMat.specularMap.repeat.set(1.8/5, 0.5/5);
    
    const movingStepMat = [movingStepShortSideMat, movingStepShortSideMat, movingStepTopMat, 
                           movingStepTopMat, movingStepLongSideMat, movingStepLongSideMat];

    
    const breakableStepTopMat = new THREE.MeshPhongMaterial({
        map: loader.load('./assets/breakable_step/top.png'),
        shininess: 5
    });
  
    const breakableStepSideMat = new THREE.MeshPhongMaterial({
      map: loader.load('./assets/breakable_step/side.png'),
      shininess: 5
    });

    setTextureProperties(breakableStepTopMat.map);
    setTextureProperties(breakableStepSideMat.map);

    const breakableStepMat = [breakableStepSideMat, breakableStepSideMat, breakableStepTopMat, 
                              breakableStepTopMat, breakableStepSideMat, breakableStepSideMat];

    


    const breakedStepTopMat = new THREE.MeshPhongMaterial({
        map: loader.load('./assets/breakable_step/crack_top.png'),
        normalMap: loader.load('./assets/breakable_step/crack_top_normal.png'),
        shininess: 5
    });
  
    const breakedStepSideMat = new THREE.MeshPhongMaterial({
      map: loader.load('./assets/breakable_step/crack_side.png'),
      normalMap: loader.load('./assets/breakable_step/crack_side_normal.png'),
      shininess: 5
    });

    setTextureProperties(breakedStepTopMat.map);
    setTextureProperties(breakedStepSideMat.map);
    setTextureProperties(breakedStepTopMat.normalMap);
    setTextureProperties(breakedStepSideMat.normalMap);

    const breakedStepMat = [breakableStepSideMat, breakableStepSideMat, breakedStepTopMat, 
                              breakedStepTopMat, breakedStepSideMat, breakedStepSideMat];


    const highJumpStepMat = new THREE.MeshPhongMaterial({
        color: 0xDC143C,
        shininess: 150
    });

    const highJumpStepGeo = new THREE.BoxBufferGeometry(2, 0.25, 1.8);
    highJumpStepGeo.userData.obb = new OBB();
    highJumpStepGeo.userData.obb.halfSize = new THREE.Vector3(1, 0.125, 1.5);
    highJumpStepGeo.userData.obb.center.y=0.5;

    class SpringCurve extends THREE.Curve {
        constructor(height, radius, levels) {
            super();
            this.height = height;
            this.radius = radius;
            this.levels = levels;
        }
        getPoint(t) {
            const tx = Math.sin(t*this.levels*Math.PI*2);
            const tz = Math.cos(t*this.levels*Math.PI*2);
            return new THREE.Vector3(tx, t*this.height/this.radius, tz).multiplyScalar(this.radius);
        }
    }
          
    const path = new SpringCurve(1, 0.7, 3);      
    const tubularSegments = 50;  
    const tubeRadius = 0.08;  
    const tubeRadialSegments = 20;
    const closed = false;  
    const springGeo = new THREE.TubeBufferGeometry(path, tubularSegments, tubeRadius, tubeRadialSegments, closed);

    const springMat = new THREE.MeshPhongMaterial({
        color: 0x778899, 
        shininess: 150
    });


    const fakeStepMat = new THREE.MeshPhongMaterial({
        color: 0xFFFFFF,
        opacity: 0.7,
        transparent: true});
    
    
    const fadeStepMat = new THREE.MeshPhongMaterial({
        color: 0xF8F8FF,
        opacity: 1,
        transparent: true});

    const fade = new TWEEN.Tween(fadeStepMat) 
        .to({opacity: 0}, 2000)
        .easing(TWEEN.Easing.Exponential.InOut)
        .yoyo(true)
        .repeat(Infinity)
        .start();


    const stepGeo = new THREE.BoxBufferGeometry(2, 0.5, 1.8);
    stepGeo.userData.obb = new OBB();
    stepGeo.userData.obb.halfSize = new THREE.Vector3(1, 0.25, 1.5);
    stepGeo.userData.obb.center.y=1;


    const allSteps = [];
    const realSteps = [];
    let allStepsCount = 0;
    let realStepsCount = 0;
    let lastRealStep = 0;
    let lastStep = 0;

    const stepTypes = {
        REAL: 0,
        MOVING: 1,
        HIGH_JUMP: 2,
        BREAKABLE: 3,
        FADE: 4,
        FAKE: 5
    }

    const getType = {
        count: 1,
        prev: 0,
        next: function () {
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

    let rotation = 0;
    let position = 1;

    function addSteps(num) {
        const l = allStepsCount+num;
        for (; allStepsCount<l; allStepsCount++) {
            let step;

            let stepType = getType.next();

            switch(stepType) {
                case stepTypes.REAL:
                    step = new THREE.Mesh(stepGeo, realStepMat);
                    step.userData.obb = new OBB();
                    step.userData.id = realStepsCount;
                    realStepsCount++;
                    realSteps.push(step);

                    break;
                case stepTypes.FAKE:
                    step = new THREE.Mesh(stepGeo, fakeStepMat);

                    break;
                case stepTypes.BREAKABLE:
                    step = new THREE.Mesh(stepGeo, breakableStepMat);
                    step.userData.obb = new OBB();
                    step.userData.id = realStepsCount;
                    realStepsCount++;
                    realSteps.push(step);
                    step.userData.status = "intact";
                    
                    break;
                case stepTypes.MOVING:
                    step = new THREE.Mesh(stepGeo, movingStepMat);
                    step.userData.obb = new OBB();
                    step.userData.id = realStepsCount;
                    realStepsCount++;
                    realSteps.push(step);

                    break;
                case stepTypes.HIGH_JUMP:
                    const stepTop = new THREE.Mesh(highJumpStepGeo, highJumpStepMat);
                    const stepBottom = new THREE.Mesh(highJumpStepGeo, highJumpStepMat);
                    const spring = new THREE.Mesh(springGeo, springMat);

                    stepBottom.userData.obb = new OBB();
                    stepBottom.userData.id = realStepsCount;
                    realStepsCount++;

                    stepTop.name = "stepTop";
                    spring.name = "spring";

                    stepBottom.add(spring);
                    stepTop.position.y = spring.geometry.parameters.path.height;
                    spring.add(stepTop);

                    step = stepBottom;

                    realSteps.push(step);

                    break;
                case stepTypes.FADE:
                    step = new THREE.Mesh(stepGeo, fadeStepMat);
                    step.userData.obb = new OBB();
                    step.userData.id = realStepsCount;
                    realStepsCount++;
                    realSteps.push(step);

                    break;
            }
    
            step.userData.type = stepType;
            step.name = allStepsCount;
    
            step.position.z = radius+(stepGeo.parameters.depth)/2-0.1;
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

    addSteps(9);


    playerObj.object3D.position.y = 15;
    playerObj.object3D.position.z = 15;
    playerObj.object3D.rotation.y = Math.PI/2-0.2;

    playerObj.scale(1/4);

    scene.add(playerObj.object3D);

    playerObj.startDownAnimation();

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


    //let bouncing = false;
    let first = true;

    function render(time) {
        stats.begin();
        TWEEN.update(time);

        playerObj.update();

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }


        ground.updateMatrix();
        ground.updateMatrixWorld();
        ground.userData.obb.copy( ground.geometry.userData.obb );
        ground.userData.obb.applyMatrix4( ground.matrixWorld );

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


        camera.updateMatrix();
        camera.updateMatrixWorld();
        frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));


        if (!frustum.containsPoint(allSteps[0].position)) {
            removeSteps(1);
        }


        //collision
        if (!first){
        if (!playerObj.bouncing) {
            for (let i=0; i<realSteps.length; i++) {
                if (realSteps[i].userData.obb.intersectsBox3(playerObj.boundingBox)) {
                    const step = realSteps[i];   
                    if (step.material.opacity < 0.2) break; 
                    if (step.userData.type == stepTypes.HIGH_JUMP) {
                        const stepsJumped = step.name - lastStep;
                        addSteps(stepsJumped);
                        lastRealStep = step.userData.id;
                        lastStep = step.name;


                        const y = step.position.y+30;

                        //trovare soluzione migliore
                        if (camera.position.y>50){
                            const up = new TWEEN.Tween(cylinder.position) 
                                .to({y: y}, 1000) 
                                .easing(TWEEN.Easing.Quadratic.Out)
                                .start();                            
                        }

                        const up = new TWEEN.Tween(camera.position) 
                            .to({y: 40+y}, 1000) 
                            .easing(TWEEN.Easing.Quadratic.Out)
                            .start();

                        const spring = step.getObjectByName("spring");
                        spring.scale.y = 0.6;

                        const expand = new TWEEN.Tween(spring.scale) 
                            .to({y: [4, 1]}, 200)
                            .easing(TWEEN.Easing.Quadratic.InOut)

                        const contract = new TWEEN.Tween(spring.scale) 
                            .to({y: 0.2}, 100)
                            .easing(TWEEN.Easing.Quadratic.InOut)
                            .chain(expand)
                            .start();
                        
                        

                        playerObj.stopDownAmimation();
                        const bounce = playerObj.startHighJumpAnimation();
                        bounce.onComplete(function(){
                            playerObj.bouncing = false;
                        })
                        
                        break;
                    }
                    if (step.userData.id > lastRealStep) {
                        const stepsJumped = step.name - lastStep;
                        addSteps(stepsJumped);
                        lastRealStep = step.userData.id;
                        lastStep = step.name;


                        const y = step.position.y;

                        //trovare soluzione migliore
                        if (camera.position.y>70){
                            const up = new TWEEN.Tween(cylinder.position) 
                                .to({y: y}, 1000) 
                                .easing(TWEEN.Easing.Quadratic.Out)
                                .start();                            
                        }
                        const up = new TWEEN.Tween(camera.position) 
                            .to({y: 40+y}, 1000) 
                            .easing(TWEEN.Easing.Quadratic.Out)
                            .start(); 
                    }


                    if(step.userData.type == stepTypes.BREAKABLE) {
                        if(step.userData.status == 'intact') {
                            step.userData.status = 'breaked';
                            step.material = breakedStepMat;
                        } else {
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
                            
                            
                            var leftShape = new THREE.Shape(leftPts);
                            var rightShape = new THREE.Shape(rightPts);
                            
                            const extrudeSettings = {
                              steps:   1,  
                              depth:  0.5,  
                              bevelEnabled: false,  
                            };
                            const leftGeo = new THREE.ExtrudeBufferGeometry( leftShape, extrudeSettings );
                            const leftMesh = new THREE.Mesh( leftGeo, breakableStepTopMat );
                            leftMesh.rotation.x = Math.PI/2;
                            leftMesh.position.y = 0.25;
                            
                            const rightGeo = new THREE.ExtrudeBufferGeometry( rightShape, extrudeSettings );
                            const rightMesh = new THREE.Mesh( rightGeo, breakableStepTopMat );
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
                    
                            
                            break;
                        }
                    }

                    playerObj.stopDownAmimation();
                    const bounce = playerObj.startJumpAiumation();
                    bounce.onComplete(function(){
                        playerObj.bouncing = false;
                    })
                
                    
                    break;
                }
            }
        }
        }

        const score = Math.floor(camera.position.y-40);
        scoreDiv.innerText = "SCORE:"+score;
    

        if (!first){
        if (ground.userData.obb.intersectsBox3(playerObj.boundingBox) ||
        !frustum.containsPoint(new THREE.Vector3(0, playerObj.height, 0).add(playerObj.object3D.position))) {
            playerObj.stopDownAmimation();
            gameOver(score);
            return;
        }}

        first = false;

        //cylinder rotation
        columnGroup.rotation.y += 0.02 * move;

        stats.end();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

export {newGame};