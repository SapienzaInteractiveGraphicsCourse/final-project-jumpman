import {leaderboard} from './leaderboard.js';
import {newGame} from './game.js';
import {tutorial} from './tutorial.js';

function mainMenu() {
    document.body.innerHTML = "";
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

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

export {mainMenu};