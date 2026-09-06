// Hand-shaped collision silhouettes and cached material rendering.
const TABLE_OUTLINE = 'M274 557 C266 548 237 551 220 533 C204 516 211 492 214 466 L216 309 C218 285 206 276 185 269 L144 248 C132 242 126 231 122 215 L88 116 C80 96 78 77 90 68 C100 65 115 77 121 85 C121 68 127 53 135 47 C143 55 149 68 150 81 C155 66 162 54 169 57 C180 66 174 105 181 145 C187 181 195 211 214 219 C226 223 231 216 224 204 C217 178 226 130 229 103 C233 72 226 47 214 28 C222 11 266 27 277 57 C333 63 459 63 515 57 C526 27 570 11 578 28 C566 47 559 72 563 103 C566 130 575 178 568 204 C561 216 566 223 578 219 C597 211 605 181 611 145 C618 105 612 66 623 57 C630 54 637 66 642 81 C643 68 649 55 657 47 C665 53 671 68 671 85 C677 77 692 65 702 68 C714 77 712 96 704 116 L670 215 C666 231 660 242 648 248 L607 269 C586 276 574 285 576 309 L578 466 C581 492 588 516 572 533 C555 551 526 548 518 557';
const FOOT_OUTLINE = FOOT_IMAGE_PATH;
const organMaterials={};
for(const kind of ['brain','stomach','bone','mouth']){const img=new Image();img.src='assets/'+kind+'-material.png';organMaterials[kind]=img;}
const footImage=new Image();footImage.src='assets/foot-sprite.png';
function materialOrgan(o){
  const image=organMaterials[o.type];
  if(!image?.complete||!image.naturalWidth){raised(o,o.color);return;}
  if(!o.material){
    const scale=3,pad=18,layer=document.createElement('canvas');
    layer.width=Math.ceil((o.width+pad*2)*scale);layer.height=Math.ceil((o.height+pad*2)*scale);
    const c=layer.getContext('2d');c.scale(scale,scale);c.translate(-o.minX+pad,-o.minY+pad);
    c.save();c.translate(0,8);c.fillStyle='#100d16';c.shadowColor='#000b';c.shadowBlur=11;c.shadowOffsetY=5;c.fill(o.path);c.restore();
    for(let z=7;z>=1;z--){c.save();c.translate(0,z);c.fillStyle=o.type==='brain'?'#61374e':'#3c522b';c.fill(o.path);c.restore();}
    c.save();c.clip(o.path);c.drawImage(image,o.minX,o.minY,o.width,o.height);
    const shade=c.createLinearGradient(0,o.minY,0,o.minY+o.height);shade.addColorStop(0,'#fff3');shade.addColorStop(.35,'#ffffff00');shade.addColorStop(1,'#06100c88');c.fillStyle=shade;c.fillRect(o.minX,o.minY,o.width,o.height);
    c.strokeStyle=o.type==='brain'?'#683746':'#385521';c.lineWidth=3;c.stroke(o.path);
    c.save();c.translate(0,1.2);c.strokeStyle=o.type==='brain'?'#ffe2ecaa':'#eaffd6aa';c.lineWidth=1.3;c.stroke(o.path);c.restore();c.restore();
    o.material={layer,x:o.minX-pad,y:o.minY-pad,w:layer.width/scale,h:layer.height/scale};
  }
  const m=o.material;ctx.drawImage(m.layer,m.x,m.y,m.w,m.h);
  if(o.hit>0){ctx.save();ctx.globalAlpha=o.hit*.5;glowStroke(o.path,o.color,1.8,12);ctx.restore();}
}
function mouthOrgan(o){
  ctx.save();ctx.translate(0,7);ctx.shadowColor='#000c';ctx.shadowBlur=10;ctx.fillStyle='#100a10';ctx.fill(o.path);ctx.restore();
  const rim=ctx.createLinearGradient(0,263,0,338);rim.addColorStop(0,'#d8afb5');rim.addColorStop(.24,'#845c6b');rim.addColorStop(.7,'#3e2436');rim.addColorStop(1,'#bc8b9b');
  ctx.fillStyle='#08080b';ctx.strokeStyle='#20151d';ctx.lineWidth=8;ctx.fill(o.path);ctx.stroke(o.path);ctx.strokeStyle=rim;ctx.lineWidth=4;ctx.stroke(o.path);
  ctx.save();ctx.clip(o.path);const g=ctx.createRadialGradient(366,281,4,396,300,105);g.addColorStop(0,'#34313b');g.addColorStop(.3,'#14141c');g.addColorStop(.7,'#05070c');g.addColorStop(1,'#010205');ctx.fillStyle=g;ctx.fill(o.path);const texture=organMaterials.mouth;if(texture.complete&&texture.naturalWidth){ctx.globalAlpha=.85;ctx.drawImage(texture,o.minX,o.minY,o.width,o.height);ctx.globalAlpha=1;}
  ctx.strokeStyle='#020307';ctx.lineWidth=4;ctx.stroke(o.path);ctx.translate(0,2);ctx.strokeStyle='#e8ccda44';ctx.lineWidth=1;ctx.stroke(o.path);
  // Broad, restrained reflections across the black enamel face.
  ctx.strokeStyle='#9b9ead25';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(319,299);ctx.bezierCurveTo(346,281,374,270,391,272);ctx.stroke();ctx.strokeStyle='#d0c8d725';ctx.beginPath();ctx.moveTo(416,273);ctx.quadraticCurveTo(444,281,455,289);ctx.stroke();ctx.restore();
  if(o.hit>0){ctx.save();ctx.globalAlpha=o.hit*.5;glowStroke(o.path,'#eedab0',2,7);ctx.restore();}
}
function randomSurface(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function boneOrgan(o){
  const image=organMaterials.bone,ready=image.complete&&image.naturalWidth;if(ready&&!o.photoBone){o.boneSurface=null;o.photoBone=true;}
  if(!o.boneSurface){
    const pad=10,scale=4,layer=document.createElement('canvas');layer.width=Math.ceil((o.width+2*pad)*scale);layer.height=Math.ceil((o.height+2*pad)*scale);const c=layer.getContext('2d');c.scale(scale,scale);c.translate(pad-o.minX,pad-o.minY);
    c.save();c.translate(0,o.visualOnly?2.5:4.5);c.fillStyle='#372b20';c.shadowColor='#000a';c.shadowBlur=4;c.shadowOffsetY=2;c.fill(o.path);c.restore();
    c.save();c.clip(o.path);const enamel=c.createLinearGradient(o.minX,o.minY,o.minX+o.width*.35,o.minY+o.height);enamel.addColorStop(0,'#fffdf0');enamel.addColorStop(.2,'#f6ebd6');enamel.addColorStop(.48,'#d8c3a0');enamel.addColorStop(.8,'#b6a078');enamel.addColorStop(1,'#665a45');c.fillStyle=enamel;c.fill(o.path);if(ready){c.globalAlpha=.8;c.drawImage(image,o.minX,o.minY,o.width,o.height);c.globalAlpha=1;}
    const rand=randomSurface(Math.round(o.cx*o.cy));for(let i=0;i<(o.visualOnly?60:230);i++){c.fillStyle=i%3?'#6b4e2817':'#fff8df45';const x=o.minX+rand()*o.width,y=o.minY+rand()*o.height;c.beginPath();c.ellipse(x,y,.12+rand()*.25,.15+rand()*.4,0,0,7);c.fill();}
    c.strokeStyle='#76674a66';c.lineWidth=.8;c.stroke(o.path);c.save();c.translate(.1,1);c.strokeStyle='#ffffefb0';c.lineWidth=1.1;c.stroke(o.path);c.restore();
    if(!o.visualOnly){c.strokeStyle='#fff6df77';c.lineWidth=.7;c.beginPath();c.moveTo(o.minX+o.width*.12,o.minY+o.height*.24);c.quadraticCurveTo(o.cx,o.minY+o.height*.38,o.minX+o.width*.83,o.minY+o.height*.72);c.stroke();}
    else{const shine=c.createRadialGradient(o.cx-1,o.minY+o.height*.25,0,o.cx,o.cy,o.width*.55);shine.addColorStop(0,'#fffff899');shine.addColorStop(1,'#ffffff00');c.fillStyle=shine;c.fill(o.path);}
    c.restore();o.boneSurface={layer,x:o.minX-pad,y:o.minY-pad,w:layer.width/scale,h:layer.height/scale};
  }
  const m=o.boneSurface;ctx.drawImage(m.layer,m.x,m.y,m.w,m.h);if(o.hit>0){ctx.save();ctx.globalAlpha=o.hit*.4;glowStroke(o.path,'#fff0bb',1,6);ctx.restore();}
}
let footSurface;
function makeFootSurface(){
  const layer=document.createElement('canvas');layer.width=520;layer.height=280;const c=layer.getContext('2d');c.scale(4,4);c.translate(22,30);c.save();c.clip(footShape.path);
  const skin=c.createLinearGradient(0,-22,0,30);skin.addColorStop(0,'#eec5bd');skin.addColorStop(.25,'#d9a3aa');skin.addColorStop(.65,'#ae7a94');skin.addColorStop(1,'#543e60');c.fillStyle=skin;c.fill(footShape.path);
  // Soft pads and tendons give the moving foot a sculpted, rounded upper surface.
  for(const [x,y,r] of [[5,-2,16],[36,-2,23],[64,-7,17],[83,-11,11],[89,3,7],[85,13,7],[76,20,6],[62,23,5]]){const pad=c.createRadialGradient(x-3,y-4,1,x,y,r);pad.addColorStop(0,'#ffe9dd88');pad.addColorStop(.5,'#e5b4be33');pad.addColorStop(1,'#ffffff00');c.fillStyle=pad;c.fillRect(x-r,y-r,r*2,r*2);}
  c.lineCap='round';for(let i=0;i<3;i++){c.beginPath();c.moveTo(9,3+i*2);c.bezierCurveTo(25,-3+i*3,40,-3+i*3,66,-10+i*8);c.strokeStyle='#67476422';c.lineWidth=4-i*.6;c.stroke();c.save();c.translate(0,-1);c.strokeStyle='#ffe3dc44';c.lineWidth=1.2;c.stroke();c.restore();}
  c.strokeStyle='#73547730';c.lineWidth=.45;c.beginPath();c.moveTo(15,10);c.bezierCurveTo(28,5,32,9,42,6);c.bezierCurveTo(47,2,51,0,61,2);c.moveTo(39,7);c.quadraticCurveTo(42,13,50,14);c.stroke();
  const rand=randomSurface(8241);for(let i=0;i<1600;i++){c.fillStyle=i%2?'#4f34591a':'#ffe6d729';c.beginPath();c.arc(-16+rand()*120,-23+rand()*53,.1+rand()*.22,0,7);c.fill();}
  c.strokeStyle='#432d5144';c.lineWidth=2;c.stroke(footShape.path);c.translate(0,1);c.strokeStyle='#ffe6dc88';c.lineWidth=.9;c.stroke(footShape.path);c.restore();return layer;
}
function footPoints(f){const ca=Math.cos(f.a),sa=Math.sin(f.a);return footShape.pts.map(p=>({x:f.x+f.side*(p.x*ca-p.y*sa),y:f.y+p.x*sa+p.y*ca}));}
function drawFoot(f){
  ctx.save();ctx.translate(f.x,f.y);ctx.scale(f.side,1);ctx.rotate(f.a);
  ctx.save();ctx.translate(0,7);ctx.fillStyle='#030806';ctx.shadowBlur=12;ctx.shadowColor='#000';ctx.fill(footShape.path);ctx.restore();
  if(footImage.complete&&footImage.naturalWidth){
    ctx.strokeStyle='#6c7960';ctx.lineWidth=2;ctx.stroke(footShape.path);
    ctx.drawImage(footImage,...FOOT_IMAGE_BOUNDS,-14,-22,112,48);
    if(time<tiltLockedUntil){ctx.save();ctx.clip(footShape.path);ctx.fillStyle='#241a32a0';ctx.fill(footShape.path);ctx.restore();}
    const hinge=ctx.createRadialGradient(-2,-2,0,0,0,6);hinge.addColorStop(0,'#eaf5da');hinge.addColorStop(.5,'#92a185');hinge.addColorStop(.75,'#304133');hinge.addColorStop(1,'#c5d1b3');ctx.fillStyle=hinge;ctx.beginPath();ctx.arc(0,0,6,0,7);ctx.fill();ctx.fillStyle='#384537';ctx.beginPath();ctx.arc(0,0,2.2,0,7);ctx.fill();
    if(f.pressed){ctx.strokeStyle='#c9ff8877';ctx.shadowColor='#b9ff85';ctx.shadowBlur=6;ctx.lineWidth=.8;ctx.stroke(footShape.path);}
    ctx.restore();return;
  }
  ctx.strokeStyle='#485644';ctx.lineWidth=4;ctx.fillStyle='#593a53';ctx.fill(footShape.path);ctx.stroke(footShape.path);
  footSurface??=makeFootSurface();ctx.drawImage(footSurface,-22,-30,130,70);
  if(time<tiltLockedUntil){ctx.save();ctx.clip(footShape.path);ctx.fillStyle='#291e36a0';ctx.fill(footShape.path);ctx.restore();}
  // Tendons and toe creases follow the sculpted foot, including its moving collider.
  ctx.strokeStyle='#89567188';ctx.lineWidth=.85;ctx.lineCap='round';
  for(const [x,y] of [[83,-4],[85,7],[80,16],[68,20]]){ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x-5,y-4,x-10,y-3);ctx.stroke();}
  ctx.strokeStyle='#695668';ctx.lineWidth=.5;
  for(const [x,y,rx,ry] of [[86,-12,6,3.5],[90,2,4,2.5],[86,13,3.5,2.5],[76,21,3,2],[62,24,2.5,1.8]]){const nail=ctx.createLinearGradient(x,y-ry,x,y+ry);nail.addColorStop(0,'#fff4dc');nail.addColorStop(.4,'#e6d9bf');nail.addColorStop(1,'#9a8b88');ctx.fillStyle=nail;ctx.beginPath();ctx.ellipse(x,y,rx,ry,.2,0,7);ctx.fill();ctx.stroke();ctx.strokeStyle='#fff9e988';ctx.beginPath();ctx.ellipse(x,y+.2,rx*.72,ry*.62,.2,Math.PI,Math.PI*1.8);ctx.stroke();ctx.strokeStyle='#695668';}
  const joint=ctx.createRadialGradient(-2,-2,0,0,0,7);joint.addColorStop(0,'#e4ebd7');joint.addColorStop(.45,'#91a08b');joint.addColorStop(.7,'#344539');joint.addColorStop(1,'#b8cab0');ctx.fillStyle=joint;ctx.beginPath();ctx.arc(0,0,7,0,7);ctx.fill();ctx.fillStyle='#314037';ctx.beginPath();ctx.arc(0,0,2.7,0,7);ctx.fill();ctx.strokeStyle='#b8c9a0';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-1.5,0);ctx.lineTo(1.5,0);ctx.stroke();
  if(f.pressed){ctx.strokeStyle='#c9ff8899';ctx.shadowColor='#b9ff85';ctx.shadowBlur=8;ctx.lineWidth=1;ctx.stroke(footShape.path);}
  ctx.restore();
}
