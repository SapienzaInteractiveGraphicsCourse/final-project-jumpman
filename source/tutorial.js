import {mainMenu} from './menu.js';
import {newGame} from './game.js';


function tutorial() {
    document.body.innerHTML = "";

    const tutorial = document.createElement("div");
    tutorial.setAttribute("id", "tutorial");
    tutorial.innerHTML = 
    "Jump the steps of the ladder without falling, let's what hegiht you can reach!<br><br>" +
    "Use the left and right arrow keys or tap on the right or on the left of the screen " +
    "on touch screen devices to control the character.<br><br>" +
    "watch out fot the different type of steps:<br>" +
    "Normal steps: like the name implies these steps work as you expect<br>" +
    "Moving steps: these steps move up and down<br>" +
    "Spring steps: these steps will make you jump higher<br>" +
    "Breakable steps: if you jump on one of these steps two times in a row it will break<br>" +
    "Fading steps: these steps will periodically fade in and out, time your jump right to avoid falling<br>" +
    "Fake steps: avoid these, if you jump on them you will fall.";
    document.body.appendChild(tutorial);

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

export {tutorial};