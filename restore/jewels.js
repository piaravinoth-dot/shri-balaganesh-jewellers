/* Original parametric jewellery design study. Not a scan or actual catalogue item. */
import * as THREE from './assets/vendor/three.module.js';
import { buildNecklace } from './necklace-model.js';
import { RoomEnvironment } from './assets/vendor/RoomEnvironment.js';
let disposeScene=()=>{};
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
let userPaused=false;
function initialise(){
 disposeScene();disposeScene=()=>{};
 const host=document.querySelector('#jewel-scene');if(!host)return;
 const controls=host.closest('.jewel-display');
 const status=controls.querySelector('.jewel-status');
 let renderer,environment,environmentScene,pmrem;
 try{const probe=document.createElement('canvas'),context=probe.getContext('webgl2');if(!context)throw new Error('WebGL unavailable');renderer=new THREE.WebGLRenderer({canvas:probe,context,alpha:true,antialias:true,powerPreference:'low-power'});}catch{
  initialiseFallback(host,controls);return;
 }
 renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.2:1.5));
 renderer.setClearColor(0x000000,0);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
 const canvas=renderer.domElement;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Three-dimensional antique-gold necklace with floral medallions, ruby-coloured stones and pearl drops. Illustrative design study. Use the turn and reset buttons to inspect it.');
 host.append(canvas);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.1,30);camera.position.set(0,.08,5.55);
 pmrem=new THREE.PMREMGenerator(renderer);environmentScene=new RoomEnvironment();environment=pmrem.fromScene(environmentScene,.04);scene.environment=environment.texture;
 scene.add(new THREE.HemisphereLight(0xffedcc,0x572a24,2.3));
 const key=new THREE.DirectionalLight(0xffe5bd,4.5);key.position.set(-3,4,5);scene.add(key);
 const rim=new THREE.DirectionalLight(0xffffff,2.5);rim.position.set(3,1,-2);scene.add(rim);
 const fill=new THREE.DirectionalLight(0xf7d795,1.2);fill.position.set(2,-2,4);scene.add(fill);
 const {jewel,geometries,materials}=buildNecklace(THREE);scene.add(jewel);
 let visible=true,dragging=false,lastX=0,yaw=-.16,targetYaw=-.16,lastFrame=0,dead=false,elapsed=0,lastTime=performance.now();
 controls.querySelectorAll('[data-jewel]').forEach(b=>b.disabled=false);
 const pause=controls.querySelector('[data-jewel="pause"]');
 function motionAllowed(){return !userPaused&&!reduce.matches;}
 function label(){pause.textContent=motionAllowed()?'Pause motion':'Resume motion';pause.setAttribute('aria-pressed',String(!motionAllowed()));pause.disabled=reduce.matches;status.textContent=reduce.matches?'Motion reduced · use the turn buttons':motionAllowed()?'Drag gently to explore · or use the turn buttons':'Motion paused · use the turn buttons';document.documentElement.classList.toggle('motion-off',userPaused||reduce.matches);}
 function draw(time=performance.now()){
  if(dead)return;
  const dt=Math.min((time-lastTime)/1000,.06);lastTime=time;
  if(motionAllowed()&&!dragging)elapsed+=dt;
  if(time-lastFrame<32)return;lastFrame=time;
  yaw+=(targetYaw-yaw)*.1;
  jewel.rotation.y=yaw+(motionAllowed()&&!dragging?Math.sin(elapsed*.32)*.2:0);
  jewel.rotation.x=motionAllowed()?Math.sin(elapsed*.25)*.025:0;
  jewel.position.y=.12+(motionAllowed()?Math.sin(elapsed*.6)*.025:0);
  renderer.render(scene,camera);
 }
 function loop(){renderer.setAnimationLoop(visible&&!document.hidden&&motionAllowed()?draw:null);lastFrame=0;lastTime=performance.now();draw();}
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.position.z=camera.aspect<.85?6.2:5.55;camera.updateProjectionMatrix();lastFrame=0;draw();}
 function control(e){let b=e.target.closest('[data-jewel]');if(!b||!controls.contains(b))return;switch(b.dataset.jewel){case'pause':userPaused=!userPaused;break;case'left':targetYaw=Math.max(-1,targetYaw-.22);break;case'right':targetYaw=Math.min(1,targetYaw+.22);break;case'reset':targetYaw=-.16;elapsed=0;break;}yaw=targetYaw;label();loop();}
 function down(e){if(e.button!==0)return;dragging=true;lastX=e.clientX;canvas.setPointerCapture(e.pointerId);}
 function move(e){if(!dragging)return;targetYaw=THREE.MathUtils.clamp(targetYaw+(e.clientX-lastX)*.008,-1,1);lastX=e.clientX;yaw=targetYaw;lastFrame=0;draw();}
 function up(){dragging=false;}
 function pref(){label();loop();}
 const observer=new ResizeObserver(resize);observer.observe(host);
 const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;loop();});intersection.observe(host);
 controls.addEventListener('click',control);canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);reduce.addEventListener('change',pref);document.addEventListener('visibilitychange',loop);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();host.classList.remove('ready');status.textContent='Static design view · reload to restore 3D';renderer.setAnimationLoop(null);});
 label();resize();host.classList.add('ready');loop();
 disposeScene=()=>{dead=true;renderer.setAnimationLoop(null);observer.disconnect();intersection.disconnect();controls.removeEventListener('click',control);reduce.removeEventListener('change',pref);document.removeEventListener('visibilitychange',loop);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());environment.dispose();environmentScene.dispose();pmrem.dispose();renderer.dispose();canvas.remove();};
}

function initialiseFallback(host,controls){
 const photo=host.querySelector('.jewel-fallback'),status=controls.querySelector('.jewel-status'),pause=controls.querySelector('[data-jewel="pause"]');
 let yaw=0,visible=true,frame=0,last=0,t=0,startX=0,dragging=false;
 host.classList.add('image-motion');controls.querySelectorAll('[data-jewel]').forEach(b=>b.disabled=false);
 function allowed(){return !userPaused&&!reduce.matches;}
 function apply(angle){photo.style.transform=`perspective(900px) rotateY(${angle}deg) rotateX(2deg)`;}
 function draw(now){frame=0;if(!visible||document.hidden||!allowed())return;const dt=Math.min((now-last)/1000,.06);last=now;t+=dt;apply(yaw+(dragging?0:Math.sin(t*.45)*9));frame=requestAnimationFrame(draw);}
 function update(){cancelAnimationFrame(frame);frame=0;document.documentElement.classList.toggle('motion-off',userPaused||reduce.matches);pause.textContent=allowed()?'Pause motion':'Resume motion';pause.setAttribute('aria-pressed',String(!allowed()));pause.disabled=reduce.matches;status.textContent=reduce.matches?'Motion reduced · use the arrows':allowed()?'Drag to turn · or use the arrows':'Motion paused · use the arrows';apply(yaw);last=performance.now();if(allowed()&&visible&&!document.hidden)frame=requestAnimationFrame(draw);}
 function click(e){let b=e.target.closest('[data-jewel]');if(!b)return;if(b.dataset.jewel==='pause')userPaused=!userPaused;if(b.dataset.jewel==='left')yaw=Math.max(-35,yaw-12);if(b.dataset.jewel==='right')yaw=Math.min(35,yaw+12);if(b.dataset.jewel==='reset'){yaw=0;t=0;}update();}
 function down(e){if(e.button!==0)return;dragging=true;startX=e.clientX;host.setPointerCapture(e.pointerId);}
 function move(e){if(!dragging)return;yaw=Math.max(-35,Math.min(35,yaw+(e.clientX-startX)*.13));startX=e.clientX;apply(yaw);}
 function up(){dragging=false;}
 const obs=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();});obs.observe(host);controls.addEventListener('click',click);reduce.addEventListener('change',update);document.addEventListener('visibilitychange',update);host.addEventListener('pointerdown',down);host.addEventListener('pointermove',move);host.addEventListener('pointerup',up);host.addEventListener('pointercancel',up);update();
 disposeScene=()=>{cancelAnimationFrame(frame);obs.disconnect();controls.removeEventListener('click',click);reduce.removeEventListener('change',update);document.removeEventListener('visibilitychange',update);host.removeEventListener('pointerdown',down);host.removeEventListener('pointermove',move);host.removeEventListener('pointerup',up);host.removeEventListener('pointercancel',up);};
}
function reveal(){const reduced=reduce.matches||userPaused;const els=document.querySelectorAll('.section-heading,.heritage-story,.collection-banner,.plan-feature,.category');if(reduced||!('IntersectionObserver'in window))return;const ob=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('revealed');ob.unobserve(e.target);}},{threshold:.08});els.forEach(el=>{el.classList.add('will-reveal');ob.observe(el);});}
window.addEventListener('bg:render',()=>{initialise();reveal();});initialise();reveal();
