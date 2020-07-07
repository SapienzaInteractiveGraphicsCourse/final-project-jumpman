import * as THREE from './three.js-r118/build/three.module.js';
import {Loader} from './loader.js';
import Stats from './three.js-r118/examples/jsm/libs/stats.module.js';
import {resizeRendererToDisplaySize} from './utils.js';
import * as column from './column.js';
import * as playerCharacter from './playerCharacter.js';
import {addToLeaderboard} from './leaderboard.js';
import {mainMenu} from './menu.js';

let player;

function gameOver(score) {
    window.onblur = "";
    window.onfocus = "";
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


const backgroundAndFog = {
    color: 0x00BFFF,
    init: function(scene) {
        scene.background = new THREE.Color(this.color);
        scene.fog = new THREE.Fog(scene.background, ground.depth, ground.depth+20);
    },
    update: function(scene) {
        if (camera.obj.position.y>500) {
            const newColor = new THREE.Color(this.color).lerp(new THREE.Color(0 ,0, 0), (camera.obj.position.y-500)/500);
            
            if (newColor.r<0) newColor.r = 0;
            if (newColor.g<0) newColor.g = 0;
            if (newColor.b<0) newColor.b = 0;

            scene.background = newColor;
            scene.fog.color = scene.background;
        } 
    }
}

const ground = {
    width: 200,
    depth: 60,
    obj: null,
    plane: new THREE.Plane(new THREE.Vector3(0,1,0)),
    init: function(scene) {
        const material = new THREE.MeshBasicMaterial({
            map: Loader.assets.textures.groundMap.data
        });
        material.map.repeat.set(this.width/10, this.depth/10);

        const geometry = new THREE.PlaneBufferGeometry(this.width, this.depth);
        geometry.rotateX(-Math.PI/2);

        this.obj = new THREE.Mesh(geometry, material);

        scene.add(this.obj);
    },
    update: function() {
        this.obj.updateMatrix();
        this.obj.updateMatrixWorld();
        this.plane.applyMatrix4(this.obj.matrixWorld);
    }
}


const camera = {
    obj: null,
    init: function(scene) {
        const fov = 35;
        const aspect = 2;
        const near = 0.1;
        const far = 10000;
        this.obj = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.obj.position.set(0, 40, 50);
        this.obj.lookAt(0, 0, 0);
        scene.add(this.obj);
    },
    update: function() {
        this.obj.updateMatrix();
        this.obj.updateMatrixWorld();
    },
    up: function(y) {
        const upAnimation = new TWEEN.Tween(this.obj.position) 
            .to({y: 40+y}, 1000) 
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
    }
}

const frustum = {
    obj: null,
    init: function() {
        this.obj = new THREE.Frustum();
    },
    update: function() {
        this.obj.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.obj.projectionMatrix, camera.obj.matrixWorldInverse));
    }
}


const lights = {
    skyColor: 0xB1E1FF,
    groundColor: 0x999966,
    ambientLight: null,
    init: function(scene) {
        
        this.ambientLight = new THREE.HemisphereLight(this.skyColor, this.groundColor, 0.4);
        scene.add(this.ambientLight);
    
        const color = 0xFFFFFF;
        const light = new THREE.DirectionalLight(color, 0.8);
        light.position.set(0, 4, 7);
        scene.add(light);    
    },
    update: function() {
        if (camera.obj.position.y>500) {
            const newSkyColor = new THREE.Color(this.skyColor)
                .lerp(new THREE.Color(0 ,0, 0), (camera.obj.position.y-500)/500);
            const newGroundColor = new THREE.Color(this.groundColor)
                .lerp(new THREE.Color(0 ,0, 0), (camera.obj.position.y-500)/500);
                
            if (newSkyColor.r<0) newSkyColor.r = 0;
            if (newSkyColor.g<0) newSkyColor.g = 0;
            if (newSkyColor.b<0) newSkyColor.b = 0;
            if (newGroundColor.r<0) newGroundColor.r = 0;
            if (newGroundColor.g<0) newGroundColor.g = 0;
            if (newGroundColor.b<0) newGroundColor.b = 0;

            this.ambientLight.color = newSkyColor;
            this.ambientLight.groundColor = newGroundColor;
        }
    }
}

const controls = {
    move: 0,
    init: function() {
        this.move = 0;
        const touchLeft = document.createElement("div");
        touchLeft.setAttribute("id", "touch-left");
        document.body.insertBefore(touchLeft, document.body.firstChild);

        const touchRight = document.createElement("div");
        touchRight.setAttribute("id", "touch-right");
        document.body.insertBefore(touchRight, document.body.firstChild);

        touchLeft.addEventListener("touchstart", function() {
            controls.move = 1;
        }, false);

        touchRight.addEventListener("touchstart", function() {
            controls.move = -1;
        }, false);

        touchRight.addEventListener("touchend", function() {
            controls.move = 0;
        }, false);

        touchLeft.addEventListener("touchend", function() {
            controls.move = 0;
        }, false);

        function keyDown(e) {
            if (e.keyCode == '37') {
                controls.move = 1;
            }
            else if (e.keyCode == '39') {
                controls.move = -1;
            }
        }
    
        function keyUp(e) {
            if (e.keyCode == '37' || e.keyCode == '39') {
                controls.move = 0;
            }
        }

        document.onkeydown = keyDown;
        document.onkeyup = keyUp;
    }
}

const clouds = {
    obj: null,
    init: function(scene) {
        const cloudGeo = new THREE.PlaneGeometry(2, 1, 1);
        const cloudMaterial = new THREE.MeshBasicMaterial( {
            map: Loader.assets.textures.cloudMap.data,
            opacity: 0.8,
            fog: false,
            transparent: true
        });
        this.obj = new THREE.Mesh(cloudGeo, cloudMaterial);

        this.obj.scale.set(80, 80, 80);
        this.obj.position.z = -100;
        this.obj.position.y = 200;

        scene.add(this.obj);
    
    },
    update: function() {
        this.obj.lookAt(camera.obj.position);
    }
}

const stars = {
    mat: null,
    obj: null,
    init: function(scene) {
        const starVertices = [];
        for (let i=0; i<10000; i++) {
            const x = THREE.MathUtils.randFloatSpread(1000);
            const y = THREE.MathUtils.randFloatSpread(1000);
            const z = THREE.MathUtils.randFloat(-5000, -500);
            starVertices.push(x, y, z);
        }
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        this.mat = new THREE.PointsMaterial({ 
            opacity: 0, 
            size:20, 
            transparent: true, 
            map: Loader.assets.textures.starMap.data,
            fog: false
        } );
        this.obj = new THREE.Points(starGeo, this.mat);
        scene.add(this.obj);

    }, update: function() {
        if (camera.obj.position.y>700 && camera.obj.position.y<800) {
            this.mat.opacity = (camera.obj.position.y-700)/100;
        }

        this.obj.position.y = camera.obj.position.y/1.1-400;
    }
}

const playAndPause = {
    paused: null,
    animations: null,
    init: function() {
        this.paused = false;
        const pauseDiv = document.createElement("div");
        pauseDiv.setAttribute("id", "pause");
        pauseDiv.innerHTML = "II";
        document.body.appendChild(pauseDiv);

        const darkDiv = document.createElement("div");
        darkDiv.setAttribute("id", "dark-div");

        document.body.appendChild(darkDiv);

        const resumeBt = document.createElement("button");
        resumeBt.setAttribute("class", "game-button");
        resumeBt.innerText = "Resume";
        resumeBt.style.marginTop = "40%";
        resumeBt.onclick = play;
        darkDiv.appendChild(resumeBt);
    
        const menuBt = document.createElement("button");
        menuBt.setAttribute("class", "game-button");
        menuBt.innerText = "Back to menu";
        menuBt.onclick = mainMenu;
        darkDiv.appendChild(menuBt);

        function pause() {
            playAndPause.paused = true;
            playAndPause.animations = TWEEN.getAll();
            pauseDiv.onclick = play;
            playAndPause.animations.forEach(element => element.pause());
            pauseDiv.innerHTML = "&#9658;";
            darkDiv.style.display = "block"; 
        }
        
        function play() {
            playAndPause.animations.forEach(element => element.resume());
            pauseDiv.innerHTML = "II";
            pauseDiv.onclick = pause;
            playAndPause.paused = false;
            darkDiv.style.display = "none"; 
            requestAnimationFrame(render);
        }

        pauseDiv.onclick = pause;
        window.onblur = pause;
    }
}


let render;

function start() {
    document.body.innerHTML = "";

    const canvas = document.createElement("canvas");
    canvas.setAttribute("id", "c");
    const renderer = new THREE.WebGLRenderer({canvas, antialias: true});

    const scoreDiv = document.createElement("div");
    scoreDiv.setAttribute("id", "score");
    scoreDiv.innerText = "SCORE:0";
    document.body.appendChild(scoreDiv);

    var stats = new Stats();
    stats.showPanel(0);
    stats.dom.style.left = "calc(50% - 40px)";
    document.body.appendChild(stats.dom);

    playAndPause.init();

    document.body.appendChild(canvas);

    
    const scene = new THREE.Scene();

    controls.init();
    frustum.init();
    backgroundAndFog.init(scene);
    camera.init(scene);

    ground.init(scene);
    lights.init(scene);
    column.init(scene, renderer);
    column.addSteps(9);
    playerCharacter.init(scene);
    clouds.init(scene);
    stars.init(scene);
   

    let lastRealStep = 0;
    let lastStep = 0;

    

    renderer.render(scene, camera.obj);
    playerCharacter.startFallAnimation();

    render = function(time) {
        stats.begin();
        TWEEN.update(time);

        const score = Math.floor(camera.obj.position.y-40);
        scoreDiv.innerText = "SCORE:"+score;
        

        if (resizeRendererToDisplaySize(renderer)) {
            camera.obj.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.obj.updateProjectionMatrix();
        }

        camera.update();
        frustum.update();

        backgroundAndFog.update(scene);
        lights.update();

        clouds.update();
        stars.update();
        ground.update();

        column.update(controls.move, frustum.obj);
        playerCharacter.update();
        

        if (!playerCharacter.bouncing) {
            for (let i=0; i<column.realSteps.length; i++) {
                const step = column.realSteps[i]; 
                if (step.userData.obb.intersectsBox3(playerCharacter.boundingBox)) {
                    let high = false;
                    let y = step.position.y;
                    let jump = true;
                    let soundEffect = Loader.assets.audio.hit.data;

                    switch (step.userData.type) {
                        case column.stepTypes.FAKE:
                            soundEffect = null;
                            jump = false;
                            break;
                        
                        case column.stepTypes.FADE:
                            if (step.material.opacity < 0.2) {
                                soundEffect = null;
                                jump = false;
                            }
                            break;

                        case column.stepTypes.HIGH_JUMP:
                            y += 30;
                            high = true;
                            step.userData.jump();
                            soundEffect = Loader.assets.audio.spring.data;
                            break;
                            
                        case column.stepTypes.BREAKABLE:
                            if(step.userData.status == 'intact') {
                                soundEffect = Loader.assets.audio.crack.data; 
                                step.userData.crack();
                            } else {
                                soundEffect = Loader.assets.audio.break.data;
                                jump = false;
                                step.userData.break();
                            }
                            break;
                    }

                    if (soundEffect != null) {
                        player.setBuffer(soundEffect);
                        player.setVolume(0.5);
                        player.play();
                    }

                    if (jump) {
                        if (step.userData.id > lastRealStep) {
                            const stepsJumped = step.name - lastStep;
                            column.addSteps(stepsJumped);
                            lastRealStep = step.userData.id;
                            lastStep = step.name;
    
                            //trovare soluzione migliore
                            if (camera.obj.position.y>60){
                                column.up(y);                           
                            }
                            
                            camera.up(y);
                        }
                        playerCharacter.startJumpAnimation(high);
                    }

                    break;
                }
            }
        }
        if (playerCharacter.boundingBox.intersectsPlane(ground.plane) ||
        !frustum.obj.containsPoint(playerCharacter.topPosition)) {
            playerCharacter.stopFallAnimation();
            gameOver(score);
            return;
        }
        
        renderer.render(scene, camera.obj);

        stats.end();
        if(!playAndPause.paused) requestAnimationFrame(render);
    }
    requestAnimationFrame(render);  
}

function newGame() {
    //Safari audio fix
    const listener = new THREE.AudioListener();
    player = new THREE.Audio(listener);

    // create empty buffer
    const buffer = listener.context.createBuffer(1, 1, 22050);
    player.setBuffer(buffer);
    player.play();

    if(Loader.loaded){
        start();
    } else {
        Loader.onLoad = start;
        Loader.load();
    }
}

export {newGame};