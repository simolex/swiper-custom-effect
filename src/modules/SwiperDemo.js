import Swiper, { Mousewheel, FreeMode } from "swiper";
import { gsap, Power1 } from "gsap";
import effectVirtualTransitionEnd from "../../node_modules/swiper/shared/effect-virtual-transition-end.js";

export class SwiperDemo {
    _progress = 0;

    constructor() {
        this.currentTransitionSpeed = 0;
        this.init();
    }

    getTransitionSpeed() {
        const transitionSpeed = this.currentTransitionSpeed;
        // don't forget to reset the variable for future calls
        this.currentTransitionSpeed = 0;
        return transitionSpeed;
    }

    /*
  A weird way to find this out but I've found no other.
  Checks if the progress on the active slide is 1 or -1 which happens when swiper navigates to next/previous slide on click and keybord navigation.
If not then the slider is being dragged, so we get the right index by finding the startTranslate from touchEvents in array of transitions the swiper snaps to.
The startTranslate doesn't exist on initial load so we use the initialSlide index instead.
  */
    getActiveIndexBeforeTransitionStart(swiper, slides) {
        const isDragging = !Math.abs(slides[swiper.activeIndex].progress === 1);
        if (isDragging) {
            return swiper.slidesGrid.indexOf(-swiper.touchEventsData.startTranslate || swiper.params.initialSlide);
        } else {
            return swiper.activeIndex;
        }
    }

    getDirection(animationProgress) {
        if (!this.swiper) return "NONE";

        const delta = this.swiper.activeIndex - animationProgress;
        if (delta === 0) {
            return "NONE";
        } else if (delta > 0) {
            return "NEXT";
        } else {
            return "BACK";
        }
    }

    progress(swiper, progress) {
        //console.log(progress);
        //console.log(swiper.maxTranslate(), progress);
        /*
    if you need to change something for each progress
    do it here (progress variable is always in range from 0 to 1) representing progress of the whole slider
    */
    }

    /*
   this is a function for the setTransition swiper event. Can be used for setting the CSS transition duration on slides or wrapper. Sometimes called when the change is supposed to be animated, sometimes not called if the change should be immediate (e.g. dragging the slider)
  */
    setTransition(swiper, transitionSpeed) {
        const $transitionElements = swiper.slides;
        $transitionElements
            .transition(transitionSpeed)
            .find(
                ".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left"
            )
            .transition(transitionSpeed);
        effectVirtualTransitionEnd({ swiper, transitionSpeed, transformEl: false });
        console.log("tr: " + transitionSpeed);

        // if (transitionSpeed > 0) {
        //     const slides = Object.values(swiper.slides);
        //     slides.map((slide, index) => {
        //         swiper.slides[index].style.clipPath = "";
        //         console.log(slide.style.clipPath);
        //     });
        // }
    }

    setTranslate(swiper, wrapperTranslate) {
        if (swiper.slides.length == 0) return;

        const durationInSeconds = this.getTransitionSpeed() / 1000;
        console.log(durationInSeconds);
        // convert slides object to plain array
        const slides = Object.values(swiper.slides); //.slice(0, -1);
        // get the index of the slide active before transition start (activeIndex changes halfway when dragging)
        const originIndex = this.getActiveIndexBeforeTransitionStart(swiper, slides);
        // get information about animation progress from the active slide - the active slide's value is always -1 to 1.
        /* 
    every slide has a progress attribute equal to the "distance" from the current active index.
    */
        const originSlide = slides[originIndex];
        const animationProgress = -wrapperTranslate / originSlide.swiperSlideSize;
        //console.log(animationProgress);
        // you can then get the drag direction like so:
        const direction = this.getDirection(animationProgress);
        // console.log(direction);
        //console.log(animationProgress, direction, swiper.activeIndex);

        // do magic with each slide
        // const progressDirection = (progress) => {
        //     //console.log(direction);
        //     switch (direction) {
        //         case "NEXT":
        //             return progress;
        //         case "BACK":
        //             return 1 - progress;
        //     }
        //     return 0;
        // };

        slides.map((slide, index) => {
            // to put the slides behind each other we have to set their CSS translate accordingly since by default they are arranged in line.
            const offset = slide.swiperSlideOffset;
            const offsetIndex = Math.abs(Math.round(slide.swiperSlideOffset / slide.swiperSlideSize));
            slide.style.zIndex = offsetIndex + 3; //slides.length;
            //----
            //let tx = swiper.params.cssMode ? -offset - swiper.translate : -offset;

            //console.log(animationProgress, slide.swiperSlideOffset, swiper.translate, slide.swiperSlideSize);

            //----
            let x = -offset;
            if (!swiper.params.virtualTranslate) x -= swiper.translate;
            let y = 0;
            if (!swiper.isHorizontal()) {
                y = x;
                x = 0;
            }

            gsap.set(slide, {
                x,
                y
            });
            // if (!slide.style.clipPath && index === Math.ceil(animationProgress)) {
            //     switch (direction) {
            //         case "NEXT":
            //             gsap.from(slide, { clipPath: "circle(1% at 50% 50%)" });
            //         case "BACK":
            //             gsap.from(slide, { clipPath: "circle(72% at 50% 50%)" });
            //     }
            // }

            // do our animation stuff!
            const clip = (val, min, max) => Math.max(min, Math.min(val, max));
            const ZOOM_FACTOR = 0.05;
            const progressLocal = Math.abs(((offsetIndex - animationProgress) * 1000) % 1000) / 1000;
            //console.log(progressLocal);

            const opacity = (1 - progressLocal).toFixed(4);

            //const clippedProgress = clip(progressLocal, -1, 1);
            //const scale = 1 - ZOOM_FACTOR * clippedProgress;
            const percentProgress = (progressLocal * 100).toFixed(1);

            // you can do your CSS animation instead of using tweening.

            // if (this._progress > 0) {
            //     slide.style.clipPath = "";
            //     // gsap.to(slide, {
            //     //     //scale,
            //     //     //opacity,
            //     //     duration: durationInSeconds,
            //     //     clipPath: `circle(72% at 50% 50%)`
            //     // });
            // }
            if (index > Math.ceil(animationProgress)) {
                slide.style.clipPath = `circle(0% at 50% 50%)`;
            }
            //console.log(this.getDirection(animationProgress));
            // if (durationInSeconds > 0) {
            //     console.log(Math.ceil(percentProgress));
            // }
            if (durationInSeconds === 0) {
                if (index === Math.ceil(animationProgress) && this.getDirection(animationProgress) === "NEXT") {
                    gsap.to(slide, {
                        //scale,
                        //opacity,
                        duration: durationInSeconds,
                        clipPath: `circle(${percentProgress}% at 50% 50%)`,
                        ease: Power1.easeInOut
                    });

                    //console.log(-slide.progress);
                }
            } else {
            }
        });
    }
    //height: 305px; z-index: 7; transform: translate(0px, -610px); transition-duration: 300ms; clip-path: circle(8.19672% at 50% 50%);
    snapIndexChange(swiper) {
        // Object.values(swiper.slides).map((slide, index) => {
        //     //console.dir(slide);
        //     //slide.style.transitionDuration = "";
        //     slide.style.clipPath = "";
        // });
        ///console.log("!!!!!!!", swiper.activeIndex, this._progress);
    }

    init() {
        const that = this;
        this.swiper = new Swiper(".swiper", {
            //cssMode: true,
            modules: [Mousewheel, FreeMode],
            freeMode: {
                enabled: true,
                sticky: true
            },
            mousewheel: {
                //releaseOnEdges: true,
                //thresholdTime: 1000,
                //releaseOnEdges: false,
                sensitivity: 0.7,
                //thresholdDelta: 50,
                invert: true
            },
            // -----unrelated settings start -----
            grabCursor: true,
            keyboard: true,
            //direction: "horizontal",
            direction: "vertical",

            // -----unrelated settings end -----
            speed: 300,
            effect: "myCustomTransition",
            //slidesPerView: 1,
            //slidesPerGroup: 1,
            watchSlidesProgress: true,
            virtualTranslate: true,

            on: {
                progress: function (swiperMain, progress) {
                    const swiper = this;
                    if (swiper.params.effect !== "myCustomTransition") return;
                    that.progress(swiper, progress);
                },
                setTransition: function (swiperMain, transition) {
                    const swiper = this;
                    if (swiper.params.effect !== "myCustomTransition") return;
                    that.setTransition(swiper, transition);
                },
                setTranslate: function (swiperMain, translate) {
                    const swiper = this;
                    if (swiper.params.effect !== "myCustomTransition") return;
                    that.setTranslate(swiper, translate);
                },
                resize: function (swiper) {
                    swiper.update();
                },
                snapIndexChange: function (swiperMain) {
                    const swiper = this;
                    if (swiper.params.effect !== "myCustomTransition") return;
                    that.snapIndexChange(swiper);
                },
                scroll: function (sw, e) {
                    //sw.animating = false;
                },
                transitionEnd: function (s) {
                    console.log("end");
                }
            }
        });
    }
}
