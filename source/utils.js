/* this file contains various utility functions that are used in other parts of the code */

function setCookie(cname, cvalue) {
    document.cookie = cname + "=" + cvalue;
}
  
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
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

export {setCookie, getCookie, indexOfMax, randomInRange, isIOS, resizeRendererToDisplaySize};