import * as THREE from './three.js-r118/build/three.module.js';
import {OBJLoader2} from './three.js-r118/examples/jsm/loaders/OBJLoader2.js';
import {MTLLoader} from './three.js-r118/examples/jsm/loaders/MTLLoader.js';
import {MtlObjBridge} from './three.js-r118/examples/jsm/loaders/obj2/bridge/MtlObjBridge.js';

const manager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(manager);
const renderer = new THREE.WebGLRenderer();

function setTextureProperties(tx) {
    tx.magFilter = THREE.LinearFilter;
    tx.minFilter = THREE.LinearMipmapLinearFilter;
    tx.anisotropy = renderer.capabilities.getMaxAnisotropy();
    tx.wrapS = THREE.RepeatWrapping;
    tx.wrapT = THREE.RepeatWrapping;
}

const Loader = {
    loaded: false,

    assets: {
        textures: {
            realStepMap:                {href:"./../assets/realStepMap.png"},
            realStepNormalMap:          {href:"./../assets/realStepNormalMap.png"},
            movingStepMap:              {href:"./../assets/movingStepMap.png"},
            movingStepNormalMap:        {href:"./../assets/movingStepNormalMap.png"},
            movingStepSpecularMap:      {href:"./../assets/movingStepSpecularMap.png"},
            breakableStepTopMap:        {href:"./../assets/breakableStepTopMap.png"},
            breakableStepSideMap:       {href:"./../assets/breakableStepSideMap.png"},
            crackedStepTopMap:          {href:"./../assets/crackedStepTopMap.png"},
            crackedStepTopNormalMap:    {href:"./../assets/crackedStepTopNormalMap.png"},
            crackedStepSideMap:         {href:"./../assets/crackedStepSideMap.png"},
            crackedStepSideNormalMap:   {href:"./../assets/crackedStepSideNormalMap.png"},
            columnNormalMap:            {href:"./../assets/columnNormalMap.png"},
            cloudMap:                   {href:"./../assets/cloudMap.png"},
            groundMap:                  {href:"./../assets/groundMap.png"},
            starMap:                    {href:"./../assets/starMap.png"},
        },
        objects: {
            headObj: {mtlHref:"./../assets/head.mtl", objHref:"./../assets/head.obj"},
            handObj: {mtlHref:"./../assets/hand.mtl", objHref:"./../assets/hand.obj"},
        }  
    },

    load: function(anisotropy) {
        for (const texture of Object.values(this.assets.textures)) {
            textureLoader.load(texture.href, (data) => {
                texture.data = data;
                setTextureProperties(data, anisotropy);
            });
        }
        for (const object of Object.values(this.assets.objects)) {
            const mtlLoader = new MTLLoader(manager);
            const objLoader = new OBJLoader2(manager);
            mtlLoader.load(object.mtlHref, (material) => {
                objLoader.addMaterials(MtlObjBridge.addMaterialsFromMtlLoader(material));
                objLoader.load(object.objHref, (data) => {
                    object.data = data;
                });
            });
        }
    }
}


manager.onLoad = function() {
    Loader.loaded = true;
    Loader.onLoad();
};

export{Loader};