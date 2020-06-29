import * as THREE from './js/three.module.js';
import { OBB } from './js/OBB.js';


function getLeaderboard() {
    const leaderboard = getCookie("leaderboard");
    if (leaderboard != "")
        return JSON.parse(getCookie("leaderboard"));
    else return [];
}
  
function addToLeaderboard(player, score) {
    if (player == null) return;
    let leaderboard = getLeaderboard();
    leaderboard.push({
        player: player,
        score: score
    });
    setCookie("leaderboard", JSON.stringify(leaderboard));
}

function clearLeaderboard() {
    setCookie("leaderboard", "");
}

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

    

    groundGeometry.userData.obb = new OBB();
    groundGeometry.userData.obb.halfSize = new THREE.Vector3(50, 0.5, 30);
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

    const cilinderMat = new THREE.MeshPhongMaterial({
        color: 0xFF0000,    // red (can also use a CSS color string here)
        //flatShading: true,
    });

    const cylinder = new THREE.Mesh(cilinderGeo, cilinderMat);
    cylinder.position.y = height/2;

    scene.add(columnGroup);
    columnGroup.add(cylinder);



    const realStepMat = new THREE.MeshPhongMaterial({color: 0x000000});
    const fakeStepMat = new THREE.MeshPhongMaterial({
        color: 0xFFFFFF,
        opacity: 0.7,
        transparent: true});
    const breakableStepMat = new THREE.MeshPhongMaterial({color: 0xD2691E});
    const breakedStepMat = new THREE.MeshPhongMaterial({color: 0xA52A2A});
    const movingStepMat = new THREE.MeshPhongMaterial({color: 0x0000FF});
    const highJumpStepMat = new THREE.MeshPhongMaterial({color: 0xDC143C});
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


    const stepGeo = new THREE.BoxBufferGeometry(2, 0.5, 3);
    stepGeo.userData.obb = new OBB();
    stepGeo.userData.obb.halfSize = new THREE.Vector3(1, 0.25, 1.5);

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

    function indexOfMax(arr) {
        if (arr.length === 0) {
            return -1;
        }
    
        let max = arr[0];
        let maxIndex = 0;
    
        for (let i = 1; i < arr.length; i++) {
            if (arr[i] > max) {
                maxIndex = i;
                max = arr[i];
            }
        }
    
        return maxIndex;
    }

    function randomInRange(min, max) {
        return (Math.random()*(max-min))+max;
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
                    step = new THREE.Mesh(stepGeo, highJumpStepMat);
                    step.userData.obb = new OBB();
                    step.userData.id = realStepsCount;
                    realStepsCount++;
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
    
            step.position.z = radius;
            step.position.y = position;


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

    

    function isIOS() {
        var iosQuirkPresent = function () {
            var audio = new Audio();
    
            audio.volume = 0.5;
            return audio.volume === 1;   // volume cannot be changed from "1" on iOS 12 and below
        };
    
        var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        var isAppleDevice = navigator.userAgent.includes('Macintosh');
        var isTouchScreen = navigator.maxTouchPoints >= 1;   // true for iOS 13 (and hopefully beyond)
    
        return isIOS || (isAppleDevice && (isTouchScreen || iosQuirkPresent()));
    }

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        let pixelRatio = 1;
        if (isIOS()) pixelRatio = window.devicePixelRatio;
        const width  = canvas.clientWidth  * pixelRatio | 0;
        const height = canvas.clientHeight * pixelRatio | 0;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    let bouncing = false;

    function render(time) {
        stats.begin();
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


        if (!frustum.containsPoint(allSteps[0].position)) {
            removeSteps(1);
        }


        //collision
        if (!bouncing) {
            for (let i=0; i<realSteps.length; i++) {
                if (cube.userData.obb.intersectsOBB(realSteps[i].userData.obb)) {
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
                            .to({y: '+44'}, 1000) 
                            .easing(TWEEN.Easing.Quadratic.Out)
                            .onStart(function() {
                                bouncing = true;
                            })
                            .onComplete(function() {
                                bouncing = false;
                            })
                            .chain(gravityFall)
                            .start();
                        
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
                            const fall = new TWEEN.Tween(step.position)
                                .to({y: '-30'}, 700)
                                .easing(TWEEN.Easing.Linear.None)
                                .repeat(Infinity)
                                .start();
                            break;
                        }
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
                        .onStart(function() {
                            bouncing = true;
                        })
                        .onComplete(function() {
                            bouncing = false;
                        })
                        .chain(gravityFall)
                        .start();
                    
                    break;
                }
            }
        }

        const score = Math.floor(camera.position.y-40);
        scoreDiv.innerText = "SCORE:"+score;
    
        if (cube.userData.obb.intersectsOBB(ground.userData.obb) ||
        !frustum.containsPoint(new THREE.Vector3(0, 2, 0).add(cube.position))) {
            gravityFall.stop();
            gameOver(score);
            return;
        }

        //cylinder rotation
        columnGroup.rotation.y += 0.02 * move;

        stats.end();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

function tutorial() {
    document.body.innerHTML = "";
}

function leaderboard() {
    document.body.innerHTML = "";

    const table = document.createElement("table");
    const tHeaderRow = table.createTHead().insertRow(0);
    tHeaderRow.insertCell(0).innerText = "Player";
    tHeaderRow.insertCell(1).innerText = "Score";

    const tBody = table.createTBody();
    const leaderboard = getLeaderboard();

    leaderboard.sort(function(a, b){
        const diff = b.score-a.score;
        if (b.score-a.score == 0)
            return a.player.localeCompare(b.player);
        else 
            return diff;
    });

    for (let i=0; i<leaderboard.length; i++) {
        const row = tBody.insertRow();
        row.insertCell(0).innerText = leaderboard[i].player;
        row.insertCell(1).innerText = leaderboard[i].score;
    }
   
    document.body.appendChild(table);

    const menuBt = document.createElement("button");
    menuBt.setAttribute("class", "menu-button");
    menuBt.innerText = "Back to menu";
    menuBt.onclick = mainMenu;
    document.body.appendChild(menuBt);
}

function mainMenu() {
    document.body.innerHTML = "";

    const title = document.createElement("h");
    title.innerText = "JumpMan";
    document.body.appendChild(title);

    const newGameBt = document.createElement("button");
    newGameBt.setAttribute("class", "menu-button");
    newGameBt.innerText = "New Game";
    newGameBt.onclick = newGame;
    document.body.appendChild(newGameBt);

    const tutorialBt = document.createElement("button");
    tutorialBt.setAttribute("class", "menu-button");
    tutorialBt.innerText = "Tutorial";
    tutorialBt.onclick = tutorial;
    document.body.appendChild(tutorialBt);

    const leaderboardBt = document.createElement("button");
    leaderboardBt.setAttribute("class", "menu-button");
    leaderboardBt.innerText = "Leaderboard";
    leaderboardBt.onclick = leaderboard;
    document.body.appendChild(leaderboardBt);
}

window.onload = function() {
    mainMenu();
}