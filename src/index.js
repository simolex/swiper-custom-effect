import Swiper from "swiper";
import EffectTunnel from "./modules/tunnelEffect";

const swiper = new Swiper(".swiper", {
    modules: [EffectTunnel],
    lazy: {
        loadPrevNextAmount: 2
    },
    slidesPerView: 2,
    spaceBetween: 30,
    navigation: {
        nextEl: ".heroes__button--next",
        prevEl: ".heroes__button--prev",
        disabledClass: "heroes__button--disabled"
    }
});
