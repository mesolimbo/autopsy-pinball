'use strict';
const canvas=document.querySelector('#table'),ctx=canvas.getContext('2d'),$=s=>document.querySelector(s);
const NS='http://www.w3.org/2000/svg';
function shape(d){const el=document.createElementNS(NS,'path');el.setAttribute('d',d);const length=el.getTotalLength(),pts=[];for(let i=0;i<=Math.ceil(length/3);i++){const p=el.getPointAtLength(length*i/Math.ceil(length/3));pts.push({x:p.x,y:p.y})}return {path:new Path2D(d),pts};}
const body=shape(TABLE_OUTLINE),footShape=shape(FOOT_OUTLINE),organs=[];
function add(d,type,color,value){const s=shape(d),xs=s.pts.map(p=>p.x),ys=s.pts.map(p=>p.y);Object.assign(s,{type,color,value,minX:Math.min(...xs),minY:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys),cx:(Math.min(...xs)+Math.max(...xs))/2,cy:(Math.min(...ys)+Math.max(...ys))/2,hit:0,cool:0,armed:true});organs.push(s)}
ART.st5.forEach(d=>add(d,'brain','#f18bcc',500));ART.st3.forEach(d=>add(d,'eye','#bfedc5',250));
add('M318 402 C318 376 352 357 386 357 C421 357 469 375 475 398 C486 426 451 444 412 438 C389 434 380 429 364 434 C338 442 314 429 318 402Z','stomach','#bbf36f',200);
add(ART.st1[1],'mouth','#c0a080',100);
ART.st7.forEach(d=>add(d,'bone','#ffe1a0',100));
organs.forEach(o=>o.visualOnly=o.type==='bone'&&o.cy>265&&o.cy<339);
const ball={x:396,y:160,vx:0,vy:0,r:7.2,live:false,trail:[]};
const flippers=[{x:281,y:555,side:1,a:-.12,prev:-.12,pressed:false},{x:511,y:555,side:-1,a:-.12,prev:-.12,pressed:false}];
let score=0,best=0,ballNumber=1,multiplier=1,hits=0,mode='ready',sound=true,audio=null,time=0,particles=[],labels=[],last=0,acc=0;
const shotTuning={outward:70,spread:1030};
const PLAY_SPEED=1.2;
let nudgeTimes=[],tiltLockedUntil=0,tiltDisplay=-1,nudgeSign=1,shake=0;
const testMode=location.search.includes('test=1');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
try{if(!testMode)best=Number(localStorage.getItem('glow-autopsy-best'))||0}catch{}
function ui(){ $('#score').textContent=String(score).padStart(6,'0');$('#best').textContent=String(Math.max(best,score)).padStart(6,'0');$('#balls').innerHTML=String(ballNumber).padStart(2,'0')+' <small>/ 03</small>';$('#multi').textContent='×'+multiplier; }
function tone(freq=440,duration=.12,type='sine',gain=.08,end=freq/2){if(!sound)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),audio.currentTime+duration);g.gain.setValueAtTime(gain,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration)}catch{}}
function resetTilt(){nudgeTimes=[];tiltLockedUntil=0;tiltDisplay=-1;shake=0;$('#launch').disabled=false;}
function primaryAction(){if(document.body.dataset.loadState!=='ready')return;if(ball.live&&mode==='playing')nudge();else launch();}
function nudge(){
 if(mode!=='playing'||!ball.live||time<tiltLockedUntil)return;
 nudgeTimes=nudgeTimes.filter(t=>time-t<6);if(nudgeTimes.length&&time-nudgeTimes.at(-1)<.35)return;
 nudgeTimes.push(time);nudgeSign*=-1;ball.vx+=nudgeSign*120;ball.vy-=180;shake=reduced?0:1;tone(75,.12,'triangle',.09,30);
 if(nudgeTimes.length>=3){tiltLockedUntil=time+4;flippers.forEach(f=>f.pressed=false);tone(110,.5,'sawtooth',.04,45);updateTiltUi(true);}
 else{$('#message').textContent=nudgeTimes.length===2?'TILT WARNING — next nudge locks feet for 4 seconds.':'Table nudged. Let it settle before nudging again.';$('#state').textContent=nudgeTimes.length===2?'TILT WARNING / 2 OF 3':'TABLE NUDGED / 1 OF 3';}
}
function updateTiltUi(force=false){const remaining=Math.max(0,Math.ceil(tiltLockedUntil-time));if(remaining===tiltDisplay&&!force)return;const wasLocked=tiltDisplay>0;tiltDisplay=remaining;if(remaining>0){$('#launch').disabled=true;$('#launch').textContent='FEET LOCKED / '+remaining+'s';$('#message').textContent='TILT — feet unlock in '+remaining+' seconds.';$('#state').textContent='TILT / FLIPPERS LOCKED';}else if(wasLocked&&ball.live){nudgeTimes=[];$('#launch').disabled=false;$('#launch').innerHTML='NUDGE TABLE <span>SPACE</span>';$('#message').textContent='Feet unlocked. Reflexes restored.';$('#state').textContent='NEURAL ACTIVITY DETECTED';}}
function launch(){if(mode==='paused'){pause();return}if(ball.live)return;if(mode==='over'){score=0;ballNumber=1;hits=0;multiplier=1;organs.forEach(o=>o.hit=0)}resetTilt();organs.forEach(o=>{o.armed=true;o.cool=0});mode='playing';Object.assign(ball,{x:396,y:164,vx:(Math.random()<.5?-1:1)*(55+Math.random()*40),vy:110,live:true,trail:[]});$('#launch').innerHTML='NUDGE TABLE <span>SPACE</span>';$('#message').textContent='Keep the reflexes alive.';$('#state').textContent='NEURAL ACTIVITY DETECTED';tone(220,.5,'sine',.12,880);ui()}
function drain(){ball.live=false;resetTilt();tone(180,.6,'sawtooth',.04,35);if(ballNumber<3){ballNumber++;mode='ready';$('#launch').innerHTML='RELEASE NEXT BALL <span>↗</span>';$('#message').textContent='Specimen unstable. Try another stimulus.';$('#state').textContent='STIMULUS REQUIRED'}else{mode='over';best=Math.max(score,best);try{if(!testMode)localStorage.setItem('glow-autopsy-best',best)}catch{}$('#launch').innerHTML='RESTART PROCEDURE <span>↗</span>';$('#message').textContent='Procedure complete. Final score: '+score.toLocaleString();$('#state').textContent='PROCEDURE COMPLETE'}ui()}
function pause(){if(mode==='playing'){mode='paused';$('#message').textContent='Procedure paused.';$('#pause').textContent='▶ RESUME';$('#state').textContent='PROCEDURE PAUSED'}else if(mode==='paused'){mode='playing';$('#message').textContent='Keep the reflexes alive.';$('#pause').textContent='Ⅱ PAUSE';$('#state').textContent='NEURAL ACTIVITY DETECTED';updateTiltUi(true)}}
function hit(o){if(time<o.cool||!o.armed)return;o.armed=false;o.cool=time+.16;o.hit=1;const awarded=o.value*multiplier;score+=awarded;hits++;multiplier=Math.min(5,1+Math.floor(hits/12));labels.push({x:ball.x,y:ball.y,text:'+'+awarded,life:1,color:o.color});if(!reduced)for(let i=0;i<10;i++){let a=Math.random()*Math.PI*2;particles.push({x:ball.x,y:ball.y,vx:Math.cos(a)*80,vy:Math.sin(a)*80,life:.5,color:o.color})}tone(o.type==='brain'?880:o.type==='eye'?660:o.type==='stomach'?330:1050,.18,'sine',.1, o.type==='bone'?750:1200);ui()}
function nearest(pts,x,y){let result={d:Infinity};for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1))),px=a.x+dx*t,py=a.y+dy*t,d=Math.hypot(x-px,y-py);if(d<result.d)result={d,x:px,y:py}}return result}
function insidePolygon(pts,x,y){let inside=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const a=pts[i],b=pts[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)inside=!inside;}return inside;}
function collide(pts,r=ball.r,bounce=.85,obstacle=null,solid=false){const p=nearest(pts,ball.x,ball.y),inside=(obstacle||solid)&&insidePolygon(pts,ball.x,ball.y);if(obstacle&&!inside&&p.d>r+18)obstacle.armed=true;if((p.d>=r&&!inside)||p.d===0)return false;const sign=inside?-1:1,nx=sign*(ball.x-p.x)/p.d,ny=sign*(ball.y-p.y)/p.d;ball.x=p.x+nx*(r+.15);ball.y=p.y+ny*(r+.15);const dot=ball.vx*nx+ball.vy*ny;if(dot<0){ball.vx-=(1+bounce)*dot*nx;ball.vy-=(1+bounce)*dot*ny;if(obstacle&&obstacle.armed&&-dot>55&&time>=obstacle.cool){const boost=obstacle.type==='brain'?55:obstacle.type==='eye'?40:obstacle.type==='bone'?12:20;ball.vx+=nx*boost;ball.vy+=ny*boost;hit(obstacle)}else if(time>wallSound){tone(150,.045,'triangle',.025,70);wallSound=time+.07}}return true}
let wallSound=0;
function tip(f){return{x:f.x+f.side*Math.cos(f.a)*91,y:f.y+Math.sin(f.a)*91}}
function update(dt){time+=dt;shake=Math.max(0,shake-dt*5);if(ball.live)updateTiltUi();if(nudgeTimes.length&&time>=tiltLockedUntil){const count=nudgeTimes.length;nudgeTimes=nudgeTimes.filter(t=>time-t<6);if(count!==nudgeTimes.length&&nudgeTimes.length===0){$('#message').textContent='Table settled. Space to nudge.';$('#state').textContent='NEURAL ACTIVITY DETECTED';}}dt*=PLAY_SPEED;for(const o of organs)o.hit=Math.max(0,o.hit-dt*2.8);for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt}particles=particles.filter(p=>p.life>0);for(const l of labels){l.y-=25*dt;l.life-=dt}labels=labels.filter(l=>l.life>0);for(const f of flippers){f.prev=f.a;const target=f.pressed&&time>=tiltLockedUntil?-.57:-.12;f.a+=(target-f.a)*Math.min(1,dt*24)}if(!ball.live)return;ball.vy+=370*dt;ball.vx*=Math.exp(-.12*dt);ball.vy*=Math.exp(-.12*dt);const speed=Math.hypot(ball.vx,ball.vy);if(speed>740){ball.vx*=740/speed;ball.vy*=740/speed}ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;
collide(body.pts,ball.r+2,.68);for(const o of organs)if(!o.visualOnly)collide(o.pts,ball.r+1,o.type==='stomach'?.48:o.type==='mouth'?.5:.6,o);
for(const f of flippers){if(collide(footPoints(f),ball.r+1,.22,null,true)){if(f.pressed&&time>=tiltLockedUntil){const along=Math.max(.2,Math.min(1,Math.abs(ball.x-f.x)/91));ball.vy=-610-90*along;ball.vx=-f.side*(shotTuning.outward+along*shotTuning.spread);tone(110,.08,'triangle',.06,45)}}}
if(ball.y>615)drain();if(ball.live){ball.trail.unshift({x:ball.x,y:ball.y});if(ball.trail.length>18)ball.trail.pop()}}
function glowStroke(path,color,width,blur){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.shadowColor=color;ctx.shadowBlur=blur;ctx.stroke(path);ctx.shadowBlur=0}
function textAt(text,x,y,color='#9bad91',size=8){ctx.fillStyle=color;ctx.font=`500 ${size}px monospace`;ctx.textAlign='center';ctx.fillText(text,x,y)}
function raised(s,color,depth=8){ctx.save();ctx.translate(0,depth);ctx.fillStyle='#080b0d';ctx.shadowColor='#000';ctx.shadowBlur=13;ctx.shadowOffsetY=5;ctx.fill(s.path);ctx.restore();ctx.save();const g=ctx.createLinearGradient(0,s.cy-40,0,s.cy+40);g.addColorStop(0,color);g.addColorStop(.45,color);g.addColorStop(1,'#263c2d');ctx.fillStyle=g;ctx.fill(s.path);ctx.strokeStyle=color;ctx.lineWidth=1.7;ctx.shadowColor=color;ctx.shadowBlur=s.hit*20+3;ctx.stroke(s.path);ctx.shadowBlur=0;ctx.save();ctx.clip(s.path);ctx.translate(0,3);ctx.strokeStyle='#fff8';ctx.lineWidth=1.2;ctx.stroke(s.path);ctx.restore();ctx.restore()}
function render(){if(document.body.dataset.loadState==='error')return;try{scene3D?.render();}catch(error){showLoadingError(error);}}
function frame(now){const elapsed=Math.min((now-last)/1000,.05);last=now;if(mode!=='paused'){acc+=elapsed;while(acc>=1/240){update(1/240);acc-=1/240}}render();requestAnimationFrame(frame)}
function setFlipper(index,pressed){if(pressed&&document.body.dataset.loadState!=='ready')return;if(pressed&&time<tiltLockedUntil)return;if(flippers[index].pressed!==pressed&&pressed)tone(95,.065,'triangle',.06,40);flippers[index].pressed=pressed}
addEventListener('keydown',e=>{
 if(e.code==='Space'){
  // Space belongs to the game, including when a button has keyboard focus.
  e.preventDefault();if(!e.repeat)primaryAction();return;
 }
 if(e.code==='Tab'&&!e.shiftKey&&!e.ctrlKey&&!e.altKey&&!e.metaKey&&document.body.dataset.loadState==='ready'){
  e.preventDefault();if(!e.repeat)$('#view-toggle').click();return;
 }
 if(['ArrowLeft','ArrowRight','KeyP','KeyA','KeyD'].includes(e.code))e.preventDefault();
 if(e.code==='ArrowLeft'||e.code==='KeyA')setFlipper(0,true);
 if(e.code==='ArrowRight'||e.code==='KeyD')setFlipper(1,true);
 if(!e.repeat&&e.code==='KeyP')pause();
});
addEventListener('keyup',e=>{
 if(e.code==='Space')e.preventDefault();
 if(e.code==='ArrowLeft'||e.code==='KeyA')setFlipper(0,false);
 if(e.code==='ArrowRight'||e.code==='KeyD')setFlipper(1,false);
});
addEventListener('blur',()=>{flippers.forEach(f=>f.pressed=false);if(mode==='playing')pause()});document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='playing')pause()});
for(const [i,id] of ['#left','#right'].entries()){const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);setFlipper(i,true)});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>setFlipper(i,false))}
$('#launch').onclick=primaryAction;$('#pause').onclick=pause;$('#sound').onclick=()=>{sound=!sound;$('#sound').innerHTML=sound?'SOUND ON <span>◖))</span>':'SOUND OFF <span>×</span>';$('#sound').setAttribute('aria-pressed',String(sound));if(sound)tone(550)};
let scene3D=null;try{scene3D=create3DTable(canvas);}catch(error){showLoadingError(error);}
ui();requestAnimationFrame(frame);
