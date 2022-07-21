import $ from "../../node_modules/swiper/shared/dom.js";
import createShadow from "../../node_modules/swiper/shared/create-shadow.js";
import effectInit from "../../node_modules/swiper/shared/effect-init.js";
import effectTarget from "../../node_modules/swiper/shared/effect-target.js";
import effectVirtualTransitionEnd from "../../node_modules/swiper/shared/effect-virtual-transition-end.js";

export default function EffectTunnel({ swiper, extendParams, on }) {
    extendParams({
        tunnelEffect: {
            slideShadows: true,
            limitRotation: true,
            transformEl: null
        }
    });

    const createSlideShadows = ($slideEl, progress, params) => {
        let shadowBefore = swiper.isHorizontal()
            ? $slideEl.find(".swiper-slide-shadow-left")
            : $slideEl.find(".swiper-slide-shadow-top");
        let shadowAfter = swiper.isHorizontal()
            ? $slideEl.find(".swiper-slide-shadow-right")
            : $slideEl.find(".swiper-slide-shadow-bottom");
        if (shadowBefore.length === 0) {
            shadowBefore = createShadow(params, $slideEl, swiper.isHorizontal() ? "left" : "top");
        }
        if (shadowAfter.length === 0) {
            shadowAfter = createShadow(params, $slideEl, swiper.isHorizontal() ? "right" : "bottom");
        }
        if (shadowBefore.length) shadowBefore[0].style.opacity = Math.max(-progress, 0);
        if (shadowAfter.length) shadowAfter[0].style.opacity = Math.max(progress, 0);
    };

    const recreateShadows = () => {
        // Set shadows
        const params = swiper.params.tunnelEffect;
        swiper.slides.each((slideEl) => {
            const $slideEl = $(slideEl);
            let progress = $slideEl[0].progress;
            if (swiper.params.tunnelEffect.limitRotation) {
                progress = Math.max(Math.min(slideEl.progress, 1), -1);
            }
            createSlideShadows($slideEl, progress, params);
        });
    };

    const setTranslate = () => {
        const { slides, rtlTranslate: rtl } = swiper;
        const params = swiper.params.tunnelEffect;
        for (let i = 0; i < slides.length; i += 1) {
            const $slideEl = slides.eq(i);
            let progress = $slideEl[0].progress;
            if (swiper.params.tunnelEffect.limitRotation) {
                progress = Math.max(Math.min($slideEl[0].progress, 1), -1);
            }
            const offset = $slideEl[0].swiperSlideOffset;
            const rotate = -180 * progress;
            let rotateY = rotate;
            let rotateX = 0;
            let tx = swiper.params.cssMode ? -offset - swiper.translate : -offset;
            let ty = 0;
            if (!swiper.isHorizontal()) {
                ty = tx;
                tx = 0;
                rotateX = -rotateY;
                rotateY = 0;
            } else if (rtl) {
                rotateY = -rotateY;
            }

            $slideEl[0].style.zIndex = -Math.abs(Math.round(progress)) + slides.length;

            if (params.slideShadows) {
                createSlideShadows($slideEl, progress, params);
            }
            const transform = `translate3d(${tx}px, ${ty}px, 0px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            const $targetEl = effectTarget(params, $slideEl);
            $targetEl.transform(transform);
        }
    };

    const setTransition = (duration) => {
        const { transformEl } = swiper.params.tunnelEffect;
        const $transitionElements = transformEl ? swiper.slides.find(transformEl) : swiper.slides;
        $transitionElements
            .transition(duration)
            .find(
                ".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left"
            )
            .transition(duration);
        effectVirtualTransitionEnd({ swiper, duration, transformEl });
    };

    effectInit({
        effect: "tunnel",
        swiper,
        on,
        setTranslate,
        setTransition,
        recreateShadows,
        getEffectParams: () => swiper.params.tunnelEffect,
        perspective: () => true,
        overwriteParams: () => ({
            slidesPerView: 1,
            slidesPerGroup: 1,
            watchSlidesProgress: true,
            spaceBetween: 0,
            virtualTranslate: !swiper.params.cssMode
        })
    });
}
