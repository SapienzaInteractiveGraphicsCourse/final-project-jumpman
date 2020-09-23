import {mainMenu} from './menu.js';

// Draws the credits page
function credits() {
    document.body.innerHTML = "";
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    const creditsDiv = document.createElement("div");
    creditsDiv.setAttribute("class", "credits");
    document.body.appendChild(creditsDiv);
    const creditsPar = document.createElement("p");
    creditsPar.innerHTML = 
    "I have developed this game as part of the Interactive Graphics course from the Engineering " +
    "in Computer Science master's degree at Sapienza - University of Rome. <br><br>" +
    "The project is developed using the three.js, tween.js, OBB.js, OBJLoader2.js, MTLLoader.js " +
    "and MtlObjBridge.js libraries used respectively for 3D graphics, animations, collisions and " + 
    "loading objects and materials. <br><br>" +
    "Various royalty free assets are used:<br>" +
    "<ul><li>The <a href='./../assets/break.wav'>break.wav</a> sound effect has been obtained from <a href='https://freesound.org/people/JustInvoke/sounds/446119/'>freesound.org</a> and created by user JustInvoke" +
    "<li>The <a href='./../assets/crack.wav'>crack.wav</a> sound effect is a cropped version of <a href='./../assets/break.wav'>break.wav</a>" +
    "<li>The <a href='./../assets/hit.wav'>hit.wav</a> sound effect has been obtained from <a href='https://freesound.org/people/Cigaro30/sounds/420936/'>freesound.org</a> and created by user Cigaro30" +
    "<li>The <a href='./../assets/spring.flac'>spring.flac</a> sound effect has been obtained from <a href='https://freesound.org/people/qubodup/sounds/172660/'>freesound.org</a> and created by users qubodup and cfork" +
    "<li>The <a href='./../assets/breakableStepTopMap.png'>breakableStepTopMap.png</a> texture has been obtained from <a href='https://opengameart.org/content/light-wood-1024x1024'>opengameart.org</a> and created by user qubodup" +
    "<li>The <a href='./../assets/breakableStepSideMap.png'>breakableStepSideMap.png</a> texture is a cropped version of <a href='./../assets/breakableStepTopMap.png'>breakableStepTopMap.png</a>" +
    "<li>The <a href='./../assets/crackedStepTopMap.png'>crackedStepTopMap.png</a> texture has been obtained by overlaying on top of <a href='./../assets/breakableStepTopMap.png'>breakableStepTopMap.png</a> <a href='https://www.seekpng.com/ima/u2e6o0w7w7e6q8o0/'>this image from seekpng.com</a>" +
    "<li>The <a href='./../assets/crackedStepSideMap.png'>crackedStepSideMap.png</a> texture has been obtained by overlaying on top of <a href='./../assets/breakableStepSideMap.png'>breakableStepSideMap.png</a> <a href='https://www.pinclipart.com/maxpin/iiiJoi/'>this image from pinclipart.com</a>" +
    "<li>The <a href='./../assets/crackedStepSideNormalMap.png'>crackedStepSideNormalMap.png</a> and <a href='./../assets/crackedStepTopNormalMap.png'>crackedStepTopNormalMap.png</a> textures have been generated from <a href='https://www.pinclipart.com/maxpin/iiiJoi/'>this</a> and <a href='https://www.seekpng.com/ima/u2e6o0w7w7e6q8o0/'>this</a> images respectively using <a href='https://cpetry.github.io/NormalMap-Online/'>this tool</a>" +
    "<li>The <a href='./../assets/cloudMap.png'>cloudMap.png</a> texture has been designed starting from <a href='https://www.freepik.com/free-vector/clouds-background-flat-design_2040928.htm#page=1&query=cloud&position=6'>this image from freepik.com</a>" +
    "<li>The <a href='./../assets/columnNormalMap.png'>columnNormalMap.png</a> texture is a cropped version of <a href='https://1004259platformevaluation.files.wordpress.com/2011/12/pillarnormals.png'>this image from 1004259platformevaluation.wordpress.com</a>" +
    "<li>The <a href='./../assets/groundMap.png'>groundMap.png</a> texture has been obtained from <a href='https://opengameart.org/content/tileable-bricks-ground-textures-set-1'>opengameart.org</a> and created by user Cethiel" +
    "<li>The <a href='./../assets/movingStepMap.png'>movingStepMap.png</a>, <a href='./../assets/movingStepNormalMap.png'>movingStepNormalMap.png</a> and <a href='./../assets/movingStepSpecularMap.png'>movingStepSpecularMap.png</a> textures have been obtained from this texture pack on <a href='https://opengameart.org/content/metal-texture'>opengameart.org</a> created by user JosipKladaric" +
    "<li>The <a href='./../assets/realStepMap.png'>realStepMap.png</a> texture is a cropped version of <a href='https://www.flickr.com/photos/seier/4357566390'>this image from flickr.com</a>, the <a href='./../assets/realStepNormalMap.png'>realStepNormalMap.png</a> texture has been generated from the same image using <a href='https://cpetry.github.io/NormalMap-Online/'>this tool</a>" +
    "</ul><br><br>" +
    "Some of the assets have been created by myself, in particular:<br>" +
    "<ul><li>I have designed the <a href='./../assets/starMap.png'>starMap.png</a> texture using <a href='https://affinity.serif.com/it/designer/'>Affinity Designer</a>" +
    "<li>I have desinged the <a href='./../assets/hand.mtl'>hand.mtl</a>, <a href='./../assets/hand.obj'>hand.obj</a>, <a href='./../assets/hand.png'>hand.png</a>, <a href='./../assets/head.mtl'>head.mtl</a>, <a href='./../assets/head.obj'>head.obj</a>, <a href='./../assets/head.png'>head.png</a> materials, objects and textures using <a href='https://ephtracy.github.io/'>MagicaVoxel</a> and taking inspiration from <a href='https://opengameart.org/content/hero-1'>this model on opengameart.org</a> created by luckygreentiger" +
    "</ul><br>" +
    "Simone Bartolini";
    creditsDiv.appendChild(creditsPar);

    const menuBt = document.createElement("button");
    menuBt.setAttribute("class", "menu-button");
    menuBt.innerText = "Back to menu";
    menuBt.onclick = mainMenu;
    document.body.appendChild(menuBt);
}

export {credits}