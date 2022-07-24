const animateQuad = (timeFraction) => {
    return Math.pow(timeFraction, 2);
};

const animateCirc = (timeFraction) => {
    return 1 - Math.sin(Math.acos(timeFraction));
};

const animateElastic = (timeFraction, x = 5) => {
    return Math.pow(2, 10 * (timeFraction - 1)) * Math.cos(((20 * Math.PI * x) / 3) * timeFraction);
};

const makeEaseInOut = (timing) => {
    return function (timeFraction) {
        if (timeFraction < 0.5) {
            return timing(2 * timeFraction) / 2;
        } else {
            return (2 - timing(2 * (1 - timeFraction))) / 2;
        }
    };
};

const makeEaseOut = (timing) => {
    return function (timeFraction) {
        return 1 - timing(1 - timeFraction);
    };
};

const quadEaseInOut = makeEaseInOut(animateQuad);
const circEaseInOut = makeEaseInOut(animateCirc);
const elasticEaseOut = makeEaseOut(animateElastic);

const animate = ({ timing, draw, duration }) => {
    let start = performance.now();

    requestAnimationFrame(function animate(time) {
        // timeFraction изменяется от 0 до 1
        let timeFraction = (time - start) / duration;
        if (timeFraction > 1) {
            timeFraction = 1;
        }

        // вычисление текущего состояния анимации
        let progress = timing(timeFraction);

        draw(progress); // отрисовать её

        if (timeFraction < 1) {
            requestAnimationFrame(animate);
        }
    });
};

const debounce = (func, ms = 300) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, ms);
    };
};

////////////////////////////////
function getAnchorsURL() {
    var section;
    var slide;
    var hash = win.location.hash;

    if (hash.length) {
        //getting the anchor link in the URL and deleting the `#`
        var anchorsParts = hash.replace("#", "").split("/"); //using / for visual reasons and not as a section/slide separator #2803

        var isFunkyAnchor = hash.indexOf("#/") > -1;
        section = isFunkyAnchor ? "/" + anchorsParts[1] : decodeURIComponent(anchorsParts[0]);
        var slideAnchor = isFunkyAnchor ? anchorsParts[2] : anchorsParts[1];

        if (slideAnchor && slideAnchor.length) {
            slide = decodeURIComponent(slideAnchor);
        }
    }

    return {
        section: section,
        slide: slide
    };
}

function setUrlHash(url) {
    if (getOptions().recordHistory) {
        location.hash = url;
    } else {
        //Mobile Chrome doesn't work the normal way, so... lets use HTML5 for phones :)
        if (isTouchDevice || isTouch) {
            win.history.replaceState(undefined, undefined, "#" + url);
        } else {
            var baseUrl = win.location.href.split("#")[0];
            win.location.replace(baseUrl + "#" + url);
        }
    }
}
////////////////////////////////

export { animate, quadEaseInOut, circEaseInOut, elasticEaseOut, makeEaseOut, debounce };

// animate({
//   duration: 400,
//   timing: circEaseInOut,
//   draw(progress) {
//     modalBlock.style.top = `${
//       percentStartPosition + Math.round((percentStopPosition - percentStartPosition) * progress)
//     }%`;
//   },
// });
