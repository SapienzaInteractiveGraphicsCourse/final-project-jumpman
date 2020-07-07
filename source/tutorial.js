import {mainMenu} from './menu.js';
import {newGame} from './game.js';
import {Loader} from './loader.js';
import * as column from './column.js';
import * as THREE from './three.js-r118/build/three.module.js';



function drawTutorial() {
    document.body.innerHTML = "";
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    const tutorialDiv = document.createElement("div");
    tutorialDiv.setAttribute("class", "tutorial");
    document.body.appendChild(tutorialDiv);
    const tutorialPar = document.createElement("p");
    tutorialPar.setAttribute("class", "tutorial");
    tutorialPar.innerHTML = 
    "Jump the steps of the ladder without falling, let's see what height you can reach!<br><br>" +
    "Use the left and right arrow keys, or tap on the right or on the left of the screen " +
    "on touch screen devices, to control the character.<br><br>" +
    "Watch out for the different type of steps:";
    tutorialDiv.appendChild(tutorialPar);


    const canvas = document.createElement("canvas");
    canvas.setAttribute("id", "tutorial-canvas");
    document.body.appendChild(canvas);


    const table = document.createElement("table");
    table.setAttribute("class", "tutorial");
    const tBody = table.createTBody();
    const normalStep = tBody.insertRow();
    normalStep.insertCell(0).innerText = "Normal steps: like the name implies these steps work as you expect";
    normalStep.insertCell(1).setAttribute("class", "second-column");
    const movingStep = tBody.insertRow();
    movingStep.insertCell(0).innerText = "Moving steps: these steps move up and down";
    movingStep.insertCell(1).setAttribute("class", "second-column");
    const springStep = tBody.insertRow();
    springStep.insertCell(0).innerText = "Spring steps: these steps will make you jump higher";
    springStep.insertCell(1).setAttribute("class", "second-column");
    const breakableStep = tBody.insertRow();
    breakableStep.insertCell(0).innerText = "Breakable steps: if you jump on one of these steps two times in a row it will break";
    breakableStep.insertCell(1).setAttribute("class", "second-column");
    const fadingStep = tBody.insertRow();
    fadingStep.insertCell(0).innerText = "Fading steps: these steps will periodically fade in and out, time your jump right to avoid falling";
    fadingStep.insertCell(1).setAttribute("class", "second-column");
    const fakeStep = tBody.insertRow();
    fakeStep.insertCell(0).innerText = "Fake steps: avoid these, if you jump on them you will fall";
    fakeStep.insertCell(1).setAttribute("class", "second-column");

    tutorialDiv.appendChild(table);

    const renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true});

    const sceneElements = [];

    function addScene(elem, fn) {
        sceneElements.push({elem, fn});
    }
  
    function makeScene() {
        const scene = new THREE.Scene();
    
        const fov = 45;
        const aspect = 2;
        const near = 0.1;
        const far = 100;
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.set(0, 2, 4);
        camera.lookAt(0, 0, 0);
  
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 5, 4);
        scene.add(light);
  
        return {scene, camera};
    }

    column.initGeometries();
    column.initStepsMaterials();
  
    {
        const elem = normalStep.cells[1];
        const {scene, camera} = makeScene();
        const mesh = new THREE.Mesh(column.geometries.normalStep, column.materials.realStep);
        scene.add(mesh);
        addScene(elem, (time, rect) => {
            camera.aspect = rect.width / rect.height;
            camera.updateProjectionMatrix();
            mesh.rotation.y = time * .1;
            renderer.render(scene, camera);
        });
    }

    {
        const elem = movingStep.cells[1];
        const {scene, camera} = makeScene();
        const mesh = new THREE.Mesh(column.geometries.normalStep, column.materials.movingStep);
        scene.add(mesh);
        addScene(elem, (time, rect) => {
            camera.aspect = rect.width / rect.height;
            camera.updateProjectionMatrix();
            mesh.rotation.y = time * .1;
            renderer.render(scene, camera);
        });
    }

    {
        const elem = springStep.cells[1];
        const {scene, camera} = makeScene();
        const stepTop = new THREE.Mesh(column.geometries.highJumpStep, column.materials.highJumpStep);
        const stepBottom = new THREE.Mesh(column.geometries.highJumpStep, column.materials.highJumpStep);
        const spring = new THREE.Mesh(column.geometries.highJumpSpring, column.materials.highJumpSpring);
        stepBottom.add(spring);
        stepTop.position.y = spring.geometry.parameters.path.stepHeight;
        spring.add(stepTop);
        scene.add(stepBottom);
        stepBottom.position.y = -0.3;
        addScene(elem, (time, rect) => {
            camera.aspect = rect.width / rect.height;
            camera.updateProjectionMatrix();
            stepBottom.rotation.y = time * .1;
            renderer.render(scene, camera);
        });
    }

    {
        const elem = breakableStep.cells[1];
        const {scene, camera} = makeScene();
        const mesh = new THREE.Mesh(column.geometries.normalStep, column.materials.breakableStep);
        scene.add(mesh);
        addScene(elem, (time, rect) => {
            camera.aspect = rect.width / rect.height;
            camera.updateProjectionMatrix();
            mesh.rotation.y = time * .1;
            renderer.render(scene, camera);
        });
    }

    {
        const elem = fadingStep.cells[1];
        const {scene, camera} = makeScene();
        const mesh = new THREE.Mesh(column.geometries.normalStep, column.materials.fadingStep);
        scene.add(mesh);
        addScene(elem, (time, rect) => {
            camera.aspect = rect.width / rect.height;
            camera.updateProjectionMatrix();
            mesh.rotation.y = time * .1;
            renderer.render(scene, camera);
        });
    }

    {
        const elem = fakeStep.cells[1];
        const {scene, camera} = makeScene();
        const mesh = new THREE.Mesh(column.geometries.normalStep, column.materials.fakeStep);
        scene.add(mesh);
        addScene(elem, (time, rect) => {
            camera.aspect = rect.width / rect.height;
            camera.updateProjectionMatrix();
            mesh.rotation.y = time * .1;
            renderer.render(scene, camera);
        });
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
  
    const clearColor = new THREE.Color('#000');
    function render(time) {
      time *= 0.001;
  
      resizeRendererToDisplaySize(renderer);
  
      renderer.setScissorTest(false);
      renderer.setClearColor(clearColor, 0);
      renderer.clear(true, true);
      renderer.setScissorTest(true);
  
      const transform = `translateY(${window.scrollY}px)`;
      renderer.domElement.style.transform = transform;
  
      for (const {elem, fn} of sceneElements) {
        // get the viewport relative position of this element
        const rect = elem.getBoundingClientRect();
        const {left, right, top, bottom, width, height} = rect;
  
        const isOffscreen =
            bottom < 0 ||
            top > renderer.domElement.clientHeight ||
            right < 0 ||
            left > renderer.domElement.clientWidth;
  
        if (!isOffscreen) {
          const positiveYUpBottom = renderer.domElement.clientHeight - bottom;
          renderer.setScissor(left, positiveYUpBottom, width, height);
          renderer.setViewport(left, positiveYUpBottom, width, height);
  
          fn(time, rect);
        }
      }
  
      requestAnimationFrame(render);
    }
  
    requestAnimationFrame(render);


    const newGameBt = document.createElement("button");
    newGameBt.setAttribute("class", "menu-button");
    newGameBt.innerText = "Play";
    newGameBt.onclick = newGame;
    document.body.appendChild(newGameBt);

    const menuBt = document.createElement("button");
    menuBt.setAttribute("class", "menu-button");
    menuBt.innerText = "Back to menu";
    menuBt.onclick = mainMenu;
    document.body.appendChild(menuBt);
}

function tutorial() {
    if(Loader.loaded){
        drawTutorial();
    } else {
        Loader.onLoad = drawTutorial;
        Loader.load();
    }
}

export {tutorial};