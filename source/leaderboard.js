import {setCookie, getCookie} from './utils.js';
import {mainMenu} from './menu.js';

// Gets the leaderboards from the cookies
function getLeaderboard() {
    const leaderboard = getCookie("leaderboard");
    if (leaderboard != "")
        return JSON.parse(getCookie("leaderboard"));
    else return [];
}

// Adds a score to the leaderboard
function addToLeaderboard(player, score) {
    if (player == null) return;
    let leaderboard = getLeaderboard();
    leaderboard.push({
        player: player,
        score: score
    });
    setCookie("leaderboard", JSON.stringify(leaderboard));
}

// Clears the leaderboard from the cookies
function clearLeaderboard() {
    setCookie("leaderboard", "");
}

// Draws the leaderboard page
function leaderboard() {
    document.body.innerHTML = "";
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    const table = document.createElement("table");
    table.setAttribute("class", "leaderboard");
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

    const clearBt = document.createElement("button");
    clearBt.setAttribute("class", "menu-button");
    clearBt.innerText = "Clear leaderboard";
    clearBt.onclick = function() {
        clearLeaderboard();
        tBody.innerHTML = "";
    }
    document.body.appendChild(clearBt);

    const menuBt = document.createElement("button");
    menuBt.setAttribute("class", "menu-button");
    menuBt.innerText = "Back to menu";
    menuBt.onclick = mainMenu;
    document.body.appendChild(menuBt);
}

export {leaderboard, addToLeaderboard};