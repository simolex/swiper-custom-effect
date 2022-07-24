import Swiper, { Mousewheel, FreeMode } from "swiper";
//import { gsap, Power1 } from "gsap";
import effectVirtualTransitionEnd from "../../node_modules/swiper/shared/effect-virtual-transition-end.js";

export class SwiperDemo {
    debugValue = {};

    constructor() {
        this.slideTimeout = [];
        this.currentTransitionSpeed = 0.5;
        this.currentSlideIndex = 0;
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

    getCurrentIndex() {
        return this.currentSlideIndex;
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

    progress(swiper, progress) {}

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

    setAnimation(slide, { radius, opacity, duration }) {
        if (!duration) duration = this.swiper.params.speed;
        slide.style.clipPath = `circle(${radius}% at 50% 50%)`;
        slide.style.transitionDuration = `${duration}ms`;
        slide.style.opacity = opacity;
    }

    setTranslate(swiper, wrapperTranslate) {
        if (swiper.slides.length == 0) return;

        const durationInSeconds = this.getTransitionSpeed() / 1000;

        const slides = Object.values(swiper.slides); //.slice(0, -1);

        let animationProgress = -swiper.translate / slides[0].swiperSlideSize;

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

            // do our animation stuff!
            const clip = (val, min, max) => Math.max(min, Math.min(val, max));
            const ZOOM_FACTOR = 0.05;
            //console.log(animationProgress, this.getBackIndex(), this.getNextIndex());
            animationProgress = clip(animationProgress, this.getBackIndex(), this.getNextIndex());
            //console.log(animationProgress);
            const progressLocal = clip(Math.abs(this.currentSlideIndex - animationProgress), 0, 1);

            if (progressLocal > swiper.params.myCustomTransition.resistanceFactor + 0.2) {
                return;
            }

            //debug
            this.setDebugValue("p_local", progressLocal);
            this.setDebugValue("next_index", this.getNextIndex());
            this.setDebugValue("back_index", this.getBackIndex());

            //end debug

            const opacity = clip(progressLocal, 0, 1);
            const percentProgress = (progressLocal * 80).toFixed(1);

            if (animationProgress > this.currentSlideIndex + swiper.params.myCustomTransition.resistanceFactor) {
                //this.slideTimeout.forEach((out) => clearTimeout(out));

                switch (this.getDirection(animationProgress)) {
                    case "NEXT":
                        if (index === this.getNextIndex()) {
                            this.setAnimation(slide, { radius: 80, opacity: 1 });
                            let timeSlot = this.slideTimeout.length;
                            this.slideTimeout.push(
                                setTimeout(
                                    (slideIndex, slideTo) => {
                                        //clearTimeout(this.slideTimeout[slideIndex]);
                                        swiper.slideTo(slideTo, swiper.params.speed);
                                    },
                                    swiper.params.speed,
                                    timeSlot,
                                    this.getNextIndex()
                                )
                            );
                        }
                        break;
                    case "BACK":
                        if (index === this.getCurrentIndex()) {
                            this.setAnimation(slide, { radius: 0, opacity: 1 });
                            let timeSlot = this.slideTimeout.length;
                            this.slideTimeout.push(
                                setTimeout(
                                    (slideIndex, slideTo) => {
                                        //clearTimeout(this.slideTimeout[slideIndex]);
                                        swiper.slideTo(slideTo, swiper.params.speed);
                                    },
                                    swiper.params.speed,
                                    timeSlot,
                                    this.getBackIndex()
                                )
                            );
                        }
                        break;
                }
            } else {
                if (index > this.currentSlideIndex) {
                    if (
                        this.getDirection(animationProgress) !== "NEXT" &&
                        this.getTargetIndex(animationProgress) !== index
                    ) {
                        this.setAnimation(slide, { radius: 0, opacity: 1 });
                    }
                } else {
                    if (this.currentSlideIndex !== index) {
                        if (this.getDirection(animationProgress) !== "BACK") {
                            // } else {
                            this.setAnimation(slide, { radius: 80, opacity: 1 });
                        }

                        // if (this.getDirection(animationProgress) === "BACK") {
                        //     this.setAnimation(slides[this.getCurrentIndex()].querySelector(".fs__overlay"), {
                        //         radius: 90,
                        //         opacity: 0,
                        //         duration: 0
                        //     });
                        // } else if (this.getDirection(animationProgress) === "NEXT") {
                        //     this.setAnimation(slides[this.getCurrentIndex()].querySelector(".fs__overlay"), {
                        //         radius: 10,
                        //         opacity: 0,
                        //         duration: 0
                        //     });
                        // }
                    }
                }

                if (index === this.getNextIndex() && this.getDirection(animationProgress) === "NEXT") {
                    //console.log("next", index, this.getNextIndex());
                    // const s = percentProgress + 10;
                    // this.setAnimation(slides[this.getCurrentIndex()].querySelector(".fs__overlay"), {
                    //     radius: s,
                    //     opacity: 1
                    // });
                    this.setAnimation(slide, { radius: percentProgress, opacity: 1 });
                }
                if (index === this.getCurrentIndex() && this.getDirection(animationProgress) === "BACK") {
                    //console.log("back", index, this.getBackIndex());
                    this.setAnimation(slide, { radius: 80 - percentProgress, opacity: 1 });
                }
            }
        });
    }
    handlerSlideChange(swiper) {
        this.setDebugValue("progress", swiper.activeIndex);
        console.log(`Change slide to ${swiper.activeIndex}`);
        this.currentSlideIndex = swiper.activeIndex;

        //swiper.translate = -swiper.slidesGrid[this.currentSlideIndex];
    }

    init() {
        const that = this;
        this.swiper = new Swiper(".swiper", {
            init: false,
            //cssMode: true,
            initialSlide: 0,
            longSwipes: false,
            modules: [Mousewheel, FreeMode],
            freeMode: {
                enabled: true,
                sticky: false
            },
            mousewheel: {
                sensitivity: 0.35,
                invert: false
            },
            resistance: false,
            resistanceRatio: 0.85,

            // -----unrelated settings start -----
            grabCursor: true,
            keyboard: true,
            direction: "vertical",
            // -----unrelated settings end -----
            speed: 700,
            effect: "myCustomTransition",
            myCustomTransition: {
                resistanceFactor: 0.3
            },

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
