import Swiper, { Mousewheel, FreeMode } from "swiper";
import { gsap, Power1 } from "gsap";
import effectVirtualTransitionEnd from "../../node_modules/swiper/shared/effect-virtual-transition-end.js";

export class SwiperDemo {
    _progress = 0;
    debugValue = {};

    constructor() {
        this.currentTransitionSpeed = 0;
        this.currentSlideIndex = 2;
        this.init();
        this.swiper.init();
        this.debugValue = {
            progress: 0,
            cur_ind: this.currentSlideIndex,
            direction: "None"
        };
    }

    setDebugValue(props, value) {
        if (!this.debugValue) return;
        this.debugValue[props] = value;

        for (props in this.debugValue) {
            document.getElementById(props).textContent = this.debugValue[props];
        }
    }

    getTransitionSpeed() {
        const transitionSpeed = this.currentTransitionSpeed;
        // don't forget to reset the variable for future calls
        this.currentTransitionSpeed = 0;
        return transitionSpeed;
    }

    getNextIndex() {
        return this.currentSlideIndex + 1 >= this.swiper.slides.length
            ? this.swiper.slides.length - 1
            : this.currentSlideIndex + 1;
    }

    getBackIndex() {
        return this.currentSlideIndex - 1 < 0 ? 0 : this.currentSlideIndex - 1;
    }

    getDirection(animationProgress) {
        if (!this.swiper) return "NONE";

        const delta = this.currentSlideIndex - animationProgress;
        if (delta === 0) {
            return "NONE";
        } else if (delta < 0) {
            return "NEXT";
        } else {
            return "BACK";
        }
    }

    getTargetIndex(animProgress) {
        const direction = this.getDirection(animProgress);
        switch (direction) {
            case "NEXT":
                return this.getNextIndex();
            case "BACK":
                return this.getBackIndex();
        }
        return this.currentSlideIndex;
    }

    /*
  A weird way to find this out but I've found no other.
  Checks if the progress on the active slide is 1 or -1 which happens when swiper navigates to next/previous slide on click and keybord navigation.
If not then the slider is being dragged, so we get the right index by finding the startTranslate from touchEvents in array of transitions the swiper snaps to.
The startTranslate doesn't exist on initial load so we use the initialSlide index instead.
  */
    // getActiveIndexBeforeTransitionStart(swiper, slides) {
    //     const isDragging = !Math.abs(slides[swiper.activeIndex].progress === 1);
    //     if (isDragging) {
    //         return swiper.slidesGrid.indexOf(-swiper.touchEventsData.startTranslate || swiper.params.initialSlide);
    //     } else {
    //         return swiper.activeIndex;
    //     }
    // }

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
        $transitionElements.transition(transitionSpeed);
        // .find(
        //     ".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left"
        // )
        // .transition(transitionSpeed);
        effectVirtualTransitionEnd({ swiper, transitionSpeed });
        //console.log("tr: " + transitionSpeed, swiper);
        this.currentTransitionSpeed = transitionSpeed;
    }

    setTranslate(swiper, wrapperTranslate) {
        if (swiper.slides.length == 0) return;

        //const durationInSeconds = this.getTransitionSpeed() / 1000;
        const durationInSeconds = this.getTransitionSpeed() / 1000;
        //console.log(durationInSeconds);
        // convert slides object to plain array
        const slides = Object.values(swiper.slides); //.slice(0, -1);
        // get the index of the slide active before transition start (activeIndex changes halfway when dragging)
        //const originIndex = this.getActiveIndexBeforeTransitionStart(swiper, slides);
        // get information about animation progress from the active slide - the active slide's value is always -1 to 1.
        /* 
    every slide has a progress attribute equal to the "distance" from the current active index.
    */
        //const originSlide = slides[originIndex];
        const animationProgress = -wrapperTranslate / slides[0].swiperSlideSize;
        //debug
        this.setDebugValue("progress", animationProgress);
        this.setDebugValue("direction", this.getDirection(animationProgress));
        this.setDebugValue("cur_ind", this.currentSlideIndex);
        //end debug

        // you can then get the drag direction like so:
        const direction = this.getDirection(animationProgress);
        // console.log(direction);
        //console.log(animationProgress, direction, swiper.activeIndex);

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

            slide.style.transform = `translate3d(${x}px, ${y}px, 0px)`;

            // gsap.set(slide, {
            //     x,
            //     y
            // });

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
            const progressLocal = clip(Math.abs(this.currentSlideIndex - animationProgress), 0, 1);
            //console.log(progressLocal);
            //debug
            this.setDebugValue("p_local", progressLocal);
            this.setDebugValue("next_index", this.getNextIndex());
            this.setDebugValue("back_index", this.getBackIndex());

            //end debug

            const opacity = clip(progressLocal * 3, 0, 1);

            //const clippedProgress = clip(progressLocal, -1, 1);
            //const scale = 1 - ZOOM_FACTOR * clippedProgress;
            const percentProgress = (progressLocal * 80).toFixed(1);

            // you can do your CSS animation instead of using tweening.

            if (index > this.currentSlideIndex) {
                if (this.getDirection(animationProgress) === "NEXT") {
                    //console.log("Next index: " + index, "Next Target: " + this.getTargetIndex(animationProgress));
                } else if (
                    //this.getDirection(animationProgress) !== "NEXT" &&
                    this.getTargetIndex(animationProgress) !== index
                ) {
                    slide.style.clipPath = `circle(0% at 50% 50%)`;
                    slide.style.transitionDuration = `${swiper.params.speed + 300}ms`;
                    slide.style.opacity = 0;
                    //console.log("0%: " + index);
                }
            } else {
                if (this.currentSlideIndex !== index) {
                    if (this.getDirection(animationProgress) === "BACK") {
                        //console.log("Back Target: " + index);
                    } else {
                        slide.style.clipPath = `circle(70% at 50% 50%)`;
                        slide.style.opacity = 1;
                        //console.log("100%: " + index);
                    }
                }
            }
            if (index === Math.ceil(animationProgress) || index === Math.floor(animationProgress)) {
                //console.log(durationInSeconds, animationProgress, this.getDirection(animationProgress), index, slide);
                //console.dir(swiper);
            }
            if (index === this.getNextIndex() && this.getDirection(animationProgress) === "NEXT") {
                console.log("next", index, this.getNextIndex());

                slide.style.clipPath = `circle(${percentProgress}% at 50% 50%)`;
                slide.style.opacity = opacity;
            }
            if (index === Math.floor(animationProgress) && this.getDirection(animationProgress) === "BACK") {
                console.log("back", index);
                if (durationInSeconds > 0) {
                    console.log("go Back");
                    gsap.to(slide, {
                        //scale,
                        opacity: 0.5,
                        //duration: durationInSeconds,
                        clipPath: "circle(0% at 50% 50%)",
                        ease: Power1.easeInOut,
                        overwrite: true,
                        immediateRender: true,
                        onStart: () => {
                            console.log("go Prev");
                        }
                    });
                } else {
                    gsap.to(slide, {
                        //scale,
                        opacity: 0,
                        //duration: durationInSeconds,
                        clipPath: `circle(${percentProgress}% at 50% 50%)`,
                        ease: Power1.easeInOut
                    });
                }

                //console.log(-slide.progress);
            }

            //console.log(swiper);
        });
    }
    handlerSlideChange(swiper) {
        console.log(`Change slide to ${swiper.activeIndex}`);
        this.currentSlideIndex = swiper.activeIndex;
    }

    init() {
        const that = this;
        this.swiper = new Swiper(".swiper", {
            init: false,
            //cssMode: true,
            initialSlide: 2,
            modules: [Mousewheel, FreeMode],
            freeMode: {
                enabled: true,
                sticky: false
            },
            mousewheel: {
                //releaseOnEdges: true,
                //thresholdTime: 1000,
                //releaseOnEdges: false,
                sensitivity: 0.35,
                //thresholdDelta: 50,
                invert: true
            },
            resistance: false,
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
                resize: function (swiperMain) {
                    swiperMain.update();
                },
                slideChange: function (swiperMain) {
                    const swiper = this;
                    if (swiper.params.effect !== "myCustomTransition") return;
                    that.handlerSlideChange(swiper);
                }
            }
        });
        // this.swiper.slideToClosest(300, () => {
        //     console.log("Closes");
        //     return true;
        // });
    }
}
