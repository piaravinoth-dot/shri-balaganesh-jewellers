import {gem,heart,calendar} from './vendor/kubai/selected.js';
import {toSvg} from './vendor/kubai/icon.js';
import {animate} from './vendor/kubai/runtime.js';

const icons={gem,heart,calendar};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let cleanup=[];
function mount(){
  cleanup.forEach(fn=>fn());cleanup=[];
  document.querySelectorAll('[data-feature-icon]').forEach(slot=>{
    const def=icons[slot.dataset.featureIcon];if(!def)return;
    slot.innerHTML=toSvg(def,{size:40});
    const svg=slot.querySelector('svg'),target=slot.closest('a'),ctl=animate(svg,def);
    const play=on=>ctl.hover(on,reduced.matches||document.documentElement.classList.contains('motion-off'));
    const enter=()=>play(true),leave=()=>play(false);
    const focus=e=>{if(e.target.matches(':focus-visible'))play(true)};
    const reset=()=>ctl.hover(false,true);
    target.addEventListener('pointerenter',enter);target.addEventListener('pointerleave',leave);
    target.addEventListener('focusin',focus);target.addEventListener('focusout',leave);
    reduced.addEventListener('change',reset);
    cleanup.push(()=>{ctl.destroy();target.removeEventListener('pointerenter',enter);target.removeEventListener('pointerleave',leave);target.removeEventListener('focusin',focus);target.removeEventListener('focusout',leave);reduced.removeEventListener('change',reset)});
  });
}
window.addEventListener('bg:render',mount);mount();
