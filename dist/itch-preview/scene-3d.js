/* Perspective presentation; game.js remains the authoritative planar physics. */
function create3DTable(fallbackCanvas){
  const T=THREE,scene=new T.Scene(),renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
  renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
  const surface=renderer.domElement;surface.id='table';surface.setAttribute('aria-label',fallbackCanvas.getAttribute('aria-label'));surface.dataset.renderer='webgl';
  fallbackCanvas.id='table-fallback';surface.style.display='none';fallbackCanvas.after(surface);
  let camera=new T.PerspectiveCamera(34,1,1,4000);const table=new T.Group();scene.add(table);
  const ambient=new T.HemisphereLight(0xddeee0,0x1a1326,.8);scene.add(ambient);
  const key=new T.DirectionalLight(0xffead8,2.3);key.position.set(-320,720,-270);key.castShadow=true;
  key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-490,right:490,top:470,bottom:-470,near:1,far:1500});key.shadow.normalBias=.65;key.shadow.bias=-.00015;key.shadow.radius=3;scene.add(key);
  const fill=new T.DirectionalLight(0xa1d8ba,.85);fill.position.set(360,240,220);scene.add(fill);
  const rim=new T.DirectionalLight(0xb6c2fc,.7);rim.position.set(130,180,-460);scene.add(rim);
  const environment=new T.CubeTexture(Array.from({length:6},(_,i)=>{const c=document.createElement('canvas');c.width=c.height=128;const p=c.getContext('2d'),g=p.createLinearGradient(0,0,0,128);g.addColorStop(0,'#c6d4ce');g.addColorStop(.45,'#344941');g.addColorStop(1,'#0d1413');p.fillStyle=g;p.fillRect(0,0,128,128);p.fillStyle=i%2?'#f4fff3':'#a8bbc3';p.fillRect(20,14,22,83);p.fillStyle='#d9e7db';p.fillRect(81,23,9,62);return c;}));environment.needsUpdate=true;environment.colorSpace=T.SRGBColorSpace;scene.environment=environment;scene.environmentIntensity=.18;
  const loader=new T.TextureLoader(),textures={};
  for(const kind of ['brain','stomach','mouth','bone']){const map=loader.load(GAME_TEXTURES['assets/'+kind+'-material.png']);map.colorSpace=T.SRGBColorSpace;map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures[kind]=map;}
  function canvasMap(width,height,paint){const c=document.createElement('canvas');c.width=width;c.height=height;paint(c.getContext('2d'));const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;return tex;}
  function bounds(pts){const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y);return{minX:Math.min(...xs),minY:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};}
  function extrude(pts,options={}){
    const {cx=396,cy=306,height=0,depth=10,bevel=2,map=null,color=0xffffff,sideColor=0x38443b,roughness=.55,metalness=.05,uvBounds=bounds(pts),holes=[]}=options;
    const shape=new T.Shape(pts.map(p=>new T.Vector2(p.x-cx,cy-p.y)));
    for(const hole of holes)shape.holes.push(new T.Path(hole.map(p=>new T.Vector2(p.x-cx,cy-p.y))));
    const geometry=new T.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:3,curveSegments:16});
    const positions=geometry.attributes.position,uv=geometry.attributes.uv;
    for(let i=0;i<positions.count;i++){uv.setXY(i,(positions.getX(i)+cx-uvBounds.minX)/uvBounds.width,1-(cy-positions.getY(i)-uvBounds.minY)/uvBounds.height);}uv.needsUpdate=true;
    const top=new T.MeshStandardMaterial({color,map,roughness,metalness,envMapIntensity:.18,emissive:map?0xffffff:0x000000,emissiveMap:map,emissiveIntensity:map?.08:0});
    if(map){top.bumpMap=map;top.bumpScale=map===textures.brain?.55:.25;}
    const edge=new T.MeshStandardMaterial({color:sideColor,map,roughness:.6,metalness:.08});
    const mesh=new T.Mesh(geometry,[top,edge]);mesh.rotation.x=-Math.PI/2;mesh.position.set(cx-396,height,cy-306);mesh.castShadow=true;mesh.receiveShadow=true;table.add(mesh);return mesh;
  }
  const mouth=organs.find(o=>o.type==='mouth');
  const mouthOpening=mouth.pts.map(p=>({x:mouth.cx+(p.x-mouth.cx)*.94,y:mouth.cy+(p.y-mouth.cy)*.82}));
  // A shallow cabinet makes the projection readable even around the silhouette.
  const deckPts=[];for(let i=0;i<4;i++){const centers=[[-330,-286],[330,-286],[330,286],[-330,286]],c=centers[i];for(let j=0;j<=12;j++){const a=(-Math.PI+i*Math.PI/2)+j*Math.PI/24;deckPts.push({x:396+c[0]+Math.cos(a)*34,y:306+c[1]+Math.sin(a)*34});}}
  const deckMap=canvasMap(792,670,c=>{
    const steel=c.createLinearGradient(0,0,792,670);steel.addColorStop(0,'#50616a');steel.addColorStop(.22,'#8a999f');steel.addColorStop(.46,'#657780');steel.addColorStop(.72,'#88989f');steel.addColorStop(1,'#465b66');c.fillStyle=steel;c.fillRect(0,0,792,670);
    let seed=917;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    // Fine satin finish: continuous hairlines, without a grid or strong scratches.
    for(let i=0;i<850;i++){const y=rand()*670;c.strokeStyle=i%2?'#ffffff08':'#25394106';c.lineWidth=.3;c.beginPath();c.moveTo(0,y);c.lineTo(792,y+(rand()-.5)*.5);c.stroke();}
    // Restrained residue on the exposed tray around the specimen.
    for(const [x,y] of [[72,182],[705,288],[122,503],[673,534],[270,614]]){
      for(let i=0;i<16;i++){const px=x+(rand()-.5)*54,py=y+(rand()-.5)*38,r=.5+rand()*3.2;c.fillStyle=i%5?'#486b2999':'#6b344799';c.beginPath();c.ellipse(px,py,r,r*(.5+rand()*.6),rand()*3,0,Math.PI*2);c.fill();}
      c.fillStyle='#65833b9c';c.beginPath();c.ellipse(x,y,7,3.3,.5,0,Math.PI*2);c.fill();c.strokeStyle='#bdd48a88';c.lineWidth=.6;c.beginPath();c.ellipse(x-1,y-1,4,1.4,.5,0,Math.PI*2);c.stroke();
    }
    // Incised lettering in the exposed steel below the scalpel.
    c.textAlign='center';
    const engrave=(text,y,font)=>{c.font=font;c.fillStyle='#d9e1e099';c.fillText(text,101.7,y+.9);c.fillStyle='#233b46';c.fillText(text,101,y);};
    engrave('AUTOPSY',559,'bold 20px sans-serif');
    engrave('KEEP THE',578,'bold 11px sans-serif');
    engrave('REFLEX ALIVE',593,'bold 11px sans-serif');
  });
  const deckMesh=extrude(deckPts,{holes:[mouthOpening],height:-31,depth:21,bevel:0,map:deckMap,sideColor:0x71828a,roughness:.32,metalness:.72});
  const trayInset=deckPts.map(p=>({x:396+(p.x-396)*.985,y:306+(p.y-306)*.982}));
  extrude(deckPts,{holes:[trayInset],height:-11,depth:5,bevel:1,color:0x8a9da6,sideColor:0x536974,roughness:.24,metalness:.85});
  // Surgical scalpel rests outside the playfield on the left of the specimen.
  const toolGroup=new T.Group();toolGroup.position.set(132-396,-8,402-306);toolGroup.rotation.y=-.18;table.add(toolGroup);
  const scalpelPart=(pts,options)=>{const m=extrude(pts,{cx:0,cy:0,height:0,...options});table.remove(m);m.position.set(0,options.height||0,0);toolGroup.add(m);return m;};
  scalpelPart([{x:-5,y:-34},{x:5,y:-34},{x:7,y:41},{x:4,y:48},{x:-4,y:48},{x:-7,y:41}],{depth:2.5,bevel:1.1,color:0x9baeb8,sideColor:0x546975,roughness:.26,metalness:.85});
  // A surgical blade has a narrow tang, curved cutting edge and sharp point.
  scalpelPart([{x:-3,y:-27},{x:3,y:-27},{x:4,y:-41},{x:10,y:-50},{x:11,y:-62},{x:7,y:-76},{x:0,y:-94},{x:-3,y:-73}],{height:.9,depth:.8,bevel:.25,color:0xd5e2e6,sideColor:0x5d7783,roughness:.14,metalness:.96});
  scalpelPart([{x:-2,y:-72},{x:0,y:-92},{x:6,y:-75},{x:10,y:-62},{x:9,y:-53},{x:5,y:-47}],{height:1.75,depth:.08,bevel:0,color:0xe9f3f4,roughness:.12,metalness:.9});
  for(let i=0;i<12;i++){const groove=new T.Mesh(new T.BoxGeometry(10,.18,.65),new T.MeshStandardMaterial({color:0x334c59,metalness:.7,roughness:.4}));groove.position.set(0,3.5,-15+i*3.8);toolGroup.add(groove);}
  const slot=new T.Mesh(new T.BoxGeometry(2,.18,8),new T.MeshStandardMaterial({color:0x304653,roughness:.5}));slot.position.set(0,3.5,37);toolGroup.add(slot);
  const floorMap=canvasMap(792,612,c=>{const g=c.createLinearGradient(0,0,0,612);g.addColorStop(0,'#6c183b');g.addColorStop(.6,'#4c152c');g.addColorStop(1,'#34182c');c.fillStyle=g;c.fillRect(0,0,792,612);c.strokeStyle='#a74b6208';c.lineWidth=.5;for(let x=0;x<792;x+=16){c.beginPath();c.moveTo(x,0);c.lineTo(x,612);c.stroke();}for(let y=0;y<612;y+=16){c.beginPath();c.moveTo(0,y);c.lineTo(792,y);c.stroke();}// Paired vessels follow the anatomy, with fine capillaries around each organ.
    c.lineCap='round';c.lineJoin='round';
    function vessel(path,width,opacity=1){
      c.save();c.globalAlpha=opacity;c.strokeStyle='#310912';c.lineWidth=width+1.3;c.shadowColor='#b9242638';c.shadowBlur=3;c.stroke(path);c.shadowBlur=0;
      c.strokeStyle=width>2?'#a73738':'#b54445';c.lineWidth=width;c.stroke(path);
      if(width>1.5){c.strokeStyle='#de68634a';c.lineWidth=width*.26;c.stroke(path);}c.restore();
    }
    function paired(d,width,opacity=1){const path=new Path2D(d);vessel(path,width,opacity);c.save();c.translate(792,0);c.scale(-1,1);vessel(path,width,opacity);c.restore();}
    // Main trunks skirt the organs and divide toward the shoulder and leg roots.
    paired('M383 350 C351 348 310 347 298 374 C280 412 302 448 317 480 C328 503 330 531 313 548',4.1,.78);
    paired('M298 376 C282 338 275 308 280 279 C286 253 278 236 267 217 C255 194 270 173 299 159',3.1,.72);
    paired('M278 283 C249 270 220 255 195 240 C173 223 168 199 161 176 C151 151 137 122 131 94',3.5,.75);
    paired('M299 159 C318 152 337 148 355 151 C374 158 380 171 386 183',2.3,.7);
    paired('M317 480 C289 485 264 502 248 522',1.9,.65);
    paired('M161 177 C150 159 125 155 117 133',1.6,.66);
    paired('M171 207 C196 193 202 175 205 155',1.2,.62);
    // Smaller tributaries connect the mouth and stomach rims to the main trunks.
    paired('M280 283 C291 278 293 269 310 266',1.3,.72);
    paired('M287 329 C300 342 321 345 340 339',1.2,.73);
    paired('M299 374 C308 367 318 363 329 367',1.5,.74);
    paired('M302 448 C321 448 331 453 343 443',1.1,.73);
    paired('M320 493 C343 490 363 477 373 456',1.5,.65);
    // Tiny branching networks trace the real organ silhouettes, mirrored at x=396.
    for(const o of organs.filter(o=>['brain','mouth','stomach'].includes(o.type))){
      const step=o.type==='brain'?10:13;
      for(let i=3;i<o.pts.length-3;i+=step){
        const p=o.pts[i];if(p.x>392)continue;
        const dx=p.x-o.cx,dy=p.y-o.cy,len=Math.hypot(dx,dy)||1,nx=dx/len,ny=dy/len;
        const start={x:p.x+nx*5,y:p.y+ny*5},length=5+(i%5)*1.8;
        const ex=start.x+nx*length,ey=start.y+ny*length;
        paired(`M${start.x} ${start.y} Q${start.x+nx*length*.4-ny*2} ${start.y+ny*length*.4+nx*2} ${ex} ${ey}`, .45+(i%3)*.22,.68);
        paired(`M${ex} ${ey} q${nx*3-ny*3} ${ny*3+nx*3} ${nx*5-ny*4} ${ny*5+nx*4}`, .4,.54);
      }
    }
    // Fine vessels just beneath the dermal edge, including the fingers and limbs.
    const rimPoints=body.pts.map(p=>({x:396+(p.x-396)*.956,y:306+(p.y-306)*.957}));
    const peripheral=new Path2D();rimPoints.forEach((p,i)=>i?peripheral.lineTo(p.x,p.y):peripheral.moveTo(p.x,p.y));vessel(peripheral,.85,.55);
    for(let i=9;i<rimPoints.length;i+=22){const p=rimPoints[i];if(p.x>390)continue;const dx=396-p.x,dy=306-p.y,len=Math.hypot(dx,dy)||1,nx=dx/len,ny=dy/len;
      paired(`M${p.x} ${p.y} q${nx*8-ny*3} ${ny*8+nx*3} ${nx*17} ${ny*17}`, .65,.6);
      paired(`M${p.x+nx*10} ${p.y+ny*10} l${nx*7-ny*5} ${ny*7+nx*5}`, .4,.48);
    }
    const sheen=c.createRadialGradient(342,243,10,386,290,290);sheen.addColorStop(0,'#e07b8220');sheen.addColorStop(1,'#a9294500');c.fillStyle=sheen;c.fillRect(0,0,792,612);
    });
  const floorMesh=extrude(body.pts,{holes:[mouthOpening],height:-7,depth:7,bevel:0,map:floorMap,sideColor:0x24111c,roughness:.46,uvBounds:{minX:0,minY:0,width:792,height:612}});
  function rail(radius,height,material){const points=body.pts.filter((_,i)=>i%2===0).map(p=>new T.Vector3(p.x-396,height,p.y-306));points.push(new T.Vector3(body.pts.at(-1).x-396,height,body.pts.at(-1).y-306));const curve=new T.CatmullRomCurve3(points,false,'centripetal');const mesh=new T.Mesh(new T.TubeGeometry(curve,950,radius,8,false),material);mesh.castShadow=true;mesh.receiveShadow=true;table.add(mesh);return mesh;}
  rail(6.5,4,new T.MeshStandardMaterial({color:0x506c55,metalness:.7,roughness:.27}));
  rail(1.3,10,new T.MeshStandardMaterial({color:0xd9ffaf,emissive:0x91ee58,emissiveIntensity:1.6,roughness:.22}));
  // A closed lip ring protects a recessed cavity; the collision follows its outer edge.
  const lipMap=canvasMap(256,128,c=>{const g=c.createLinearGradient(0,0,0,128);g.addColorStop(0,'#b28388');g.addColorStop(.35,'#81575f');g.addColorStop(.7,'#563b48');g.addColorStop(1,'#aa7780');c.fillStyle=g;c.fillRect(0,0,256,128);for(let i=0;i<150;i++){c.strokeStyle=i%2?'#efb5b51a':'#26152422';c.beginPath();c.moveTo(i*1.8,0);c.bezierCurveTo(i*1.8-3,40,i*1.8+3,80,i*1.8,128);c.stroke();}});
  const lipMesh=extrude(mouth.pts,{holes:[mouthOpening],height:-1,depth:9,bevel:1,map:lipMap,sideColor:0x684550,roughness:.38});
  const liningPositions=[];
  for(let i=0;i<mouthOpening.length;i++){const a=mouthOpening[i],b=mouthOpening[(i+1)%mouthOpening.length];const v=(p,h)=>[p.x-396,h,p.y-306];liningPositions.push(...v(a,-19),...v(b,-19),...v(b,7),...v(a,-19),...v(b,7),...v(a,7));}
  const liningGeometry=new T.BufferGeometry();liningGeometry.setAttribute('position',new T.Float32BufferAttribute(liningPositions,3));liningGeometry.computeVertexNormals();
  const liningMesh=new T.Mesh(liningGeometry,new T.MeshStandardMaterial({color:0x291720,roughness:.48,side:T.DoubleSide}));liningMesh.receiveShadow=true;table.add(liningMesh);
  const organMeshes=[];
  for(const o of organs){
    const config={brain:[15,3.5,0x7a455b],stomach:[14,3.5,0x52643a],eye:[14,5,0x6c8667],mouth:[1,0,0x21131d],bone:[o.visualOnly?5:7,o.visualOnly?.6:1.4,0x91816a]}[o.type];
    let map=textures[o.type]||null;
    if(o.type==='eye')map=canvasMap(180,180,c=>{const g=c.createRadialGradient(58,45,4,90,90,100);g.addColorStop(0,'#ffffeb');g.addColorStop(.6,'#cad9b4');g.addColorStop(1,'#83967b');c.fillStyle=g;c.fillRect(0,0,180,180);c.save();c.translate(90,103);c.rotate(o.cx<396?-.25:.25);const iris=c.createRadialGradient(-7,-10,0,0,0,39);iris.addColorStop(0,'#d7ff91');iris.addColorStop(.65,'#64b958');iris.addColorStop(1,'#214c36');c.fillStyle=iris;c.beginPath();c.ellipse(0,0,34,39,0,0,7);c.fill();c.strokeStyle='#24573366';c.lineWidth=1;for(let i=0;i<30;i++){const a=i*Math.PI/15;c.beginPath();c.moveTo(Math.cos(a)*15,Math.sin(a)*19);c.lineTo(Math.cos(a)*31,Math.sin(a)*35);c.stroke();}c.fillStyle='#031009';c.beginPath();c.ellipse(0,0,8,31,0,0,7);c.fill();c.fillStyle='#fffce9';c.beginPath();c.ellipse(-10,-15,7,5,-.4,0,7);c.fill();c.restore();});
    const mesh=extrude(o.type==='mouth'?mouthOpening:o.pts,{cx:o.cx,cy:o.cy,height:o.type==='mouth'?-20:o.visualOnly?-15:1,uvBounds:bounds(o.pts),depth:config[0],bevel:config[1],map,sideColor:config[2],roughness:o.type==='mouth'?.34:o.type==='eye'?.27:.5});
    organMeshes.push({o,mesh});
  }
  const footMeshes=flippers.map(f=>{const mesh=extrude(footShape.pts,{cx:0,cy:0,height:2,depth:7,bevel:1.2,color:0x91a571,sideColor:0x3e5335,roughness:.5});table.remove(mesh);mesh.position.set(0,2,0);const group=new T.Group();group.position.set(f.x-396,0,f.y-306);group.add(mesh);table.add(group);const hinge=new T.Mesh(new T.CylinderGeometry(5.5,5.5,4,24),new T.MeshStandardMaterial({color:0xc7d3aa,metalness:.8,roughness:.2}));hinge.position.y=12;hinge.castShadow=true;group.add(hinge);return{f,mesh,group};});
  let footReady=false;
  // Dark emerald facets and restrained internal reflections, matching the logo gems.
  const ballMesh=new T.Group();table.add(ballMesh);
  const crystal=new T.Mesh(new T.IcosahedronGeometry(ball.r,2),new T.MeshPhysicalMaterial({color:0x07512b,metalness:.08,roughness:.17,transmission:.28,thickness:ball.r*1.8,attenuationColor:0x064624,attenuationDistance:5,ior:1.7,clearcoat:1,clearcoatRoughness:.12,flatShading:true,envMapIntensity:.75,emissive:0x021a09,emissiveIntensity:.08}));
  crystal.castShadow=true;ballMesh.add(crystal);
  const core=new T.Mesh(new T.IcosahedronGeometry(ball.r*.42,1),new T.MeshStandardMaterial({color:0x084523,emissive:0x10662d,emissiveIntensity:.12,roughness:.25}));ballMesh.add(core);
  // Reuse a soft glow texture and a fixed sprite pool; no per-frame allocations.
  const trailMap=canvasMap(64,64,c=>{const glow=c.createRadialGradient(32,32,0,32,32,32);glow.addColorStop(0,'#83e897b3');glow.addColorStop(.3,'#32b55d70');glow.addColorStop(.65,'#16863b25');glow.addColorStop(1,'#06351a00');c.fillStyle=glow;c.fillRect(0,0,64,64);});
  const trailSprites=Array.from({length:64},()=>{const sprite=new T.Sprite(new T.SpriteMaterial({map:trailMap,transparent:true,opacity:0,depthWrite:false,depthTest:true,blending:T.AdditiveBlending,toneMapped:false}));sprite.visible=false;table.add(sprite);return sprite;});
  function syncTrail(){
    const speed=Math.hypot(ball.vx,ball.vy),energy=Math.min(1,Math.max(0,(speed-35)/650));
    const maxLength=24+speed*.24;let distance=0,previous=ball;
    for(let i=0;i<trailSprites.length;i++){
      const sprite=trailSprites[i],point=ball.trail[i];
      if(!ball.live||reduced||energy===0||!point){sprite.visible=false;continue;}
      distance+=Math.hypot(point.x-previous.x,point.y-previous.y);previous=point;
      const fade=Math.sqrt(Math.max(0,1-distance/maxLength))*(1-i/trailSprites.length);
      sprite.visible=distance>2&&fade>.015;
      sprite.material.opacity=Math.min(.95,fade*(.38+energy*.68));
      const diameter=(ball.r*2.8+energy*13)*(0.35+fade*.65);sprite.scale.set(diameter,diameter,1);
      // Historical positions preserve the direction change at every bounce.
      sprite.position.set(point.x-396,ball.r+.3,point.y-306);
    }
  }
  const lamps=Array.from({length:5},(_,i)=>{const mesh=new T.Mesh(new T.CylinderGeometry(2.2,2.2,.7,16),new T.MeshStandardMaterial({color:0xd8ffa5,emissive:0xa2e955,emissiveIntensity:1}));mesh.position.set(-32+i*16,.8,174);table.add(mesh);return mesh;});
  const banner=document.createElement('div');banner.className='scene-banner';banner.setAttribute('aria-hidden','true');surface.parentElement.append(banner);
  let ready=false,lastBanner='',oldW=0,oldH=0,view='3d';
  const viewToggle=document.querySelector('#view-toggle');
  surface.dataset.view=view;
  viewToggle.addEventListener('click',()=>{
    if(document.body.dataset.loadState!=='ready')return;
    view=view==='3d'?'2.5d':'3d';
    camera=view==='3d'?new T.PerspectiveCamera(34,1,1,4000):new T.OrthographicCamera(-396,396,335,-335,1,4000);
    if(view==='2.5d')camera.up.set(0,0,-1);
    oldW=0;surface.dataset.view=view;
    viewToggle.textContent=view==='3d'?'3D PERSPECTIVE ⇄':'2.5D TOP-DOWN ⇄';
    viewToggle.setAttribute('aria-pressed',String(view==='3d'));
    viewToggle.title=view==='3d'?'Switch to top-down 2.5D (Tab)':'Switch to perspective 3D (Tab)';
  });
  const labelSprites=new Map();
  function syncLabels(){const active=new Set(labels);for(const [label,sprite]of labelSprites)if(!active.has(label)){table.remove(sprite);sprite.material.map.dispose();sprite.material.dispose();labelSprites.delete(label);}for(const l of labels){let sprite=labelSprites.get(l);if(!sprite){const tex=canvasMap(128,48,c=>{c.fillStyle=l.color;c.textAlign='center';c.font='bold 28px monospace';c.fillText(l.text,64,33);});sprite=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthTest:false}));sprite.scale.set(43,16,1);table.add(sprite);labelSprites.set(l,sprite);}sprite.position.set(l.x-396,28,l.y-306);sprite.material.opacity=l.life;}}
  function render(){
    if(!ready){if(!Object.values(textures).every(t=>t.image?.complete&&t.image.naturalWidth)||!footImage.complete||!footImage.naturalWidth||!footMaskImage.complete||!footMaskImage.naturalWidth)return false;ready=true;fallbackCanvas.style.display='none';surface.style.display='';surface.dataset.textures='ready';}
    const width=surface.clientWidth,height=surface.clientHeight;if(width<1||height<1)return true;
    if(width!==oldW||height!==oldH){oldW=width;oldH=height;renderer.setSize(width,height,false);camera.aspect=width/height;
      if(view==='3d'){
        const pitch=30*Math.PI/180,tan=Math.tan(camera.fov*Math.PI/360),distance=Math.max((320*Math.cos(pitch)+28)/tan,378/(tan*camera.aspect))+320*Math.sin(pitch);
        camera.position.set(0,distance*Math.cos(pitch),distance*Math.sin(pitch));
      }else{
        const halfHeight=Math.max(335,378/camera.aspect);
        camera.left=-halfHeight*camera.aspect;camera.right=halfHeight*camera.aspect;camera.top=halfHeight;camera.bottom=-halfHeight;
        camera.position.set(0,1200,0);
      }
      camera.lookAt(0,0,0);camera.updateProjectionMatrix();}
    if(!footReady&&footImage.complete&&footImage.naturalWidth&&footMaskImage.complete&&footMaskImage.naturalWidth){const map=canvasMap(560,240,c=>{c.drawImage(footImage,40,0,2076,729,0,0,560,240);c.globalCompositeOperation='destination-in';c.drawImage(footMaskImage,...FOOT_IMAGE_BOUNDS,0,0,560,240);});for(const f of footMeshes){f.mesh.material[0].color.set(0xffffff);f.mesh.material[0].map=map;f.mesh.material[0].alphaTest=.35;f.mesh.material[0].bumpMap=map;f.mesh.material[0].bumpScale=.3;f.mesh.material[0].emissiveMap=map;f.mesh.material[0].emissive.set(0xffffff);f.mesh.material[0].emissiveIntensity=.08;f.mesh.material[0].needsUpdate=true;}footReady=true;}
    table.position.x=reduced?0:Math.sin(time*75)*shake*2;table.position.z=reduced?0:Math.cos(time*65)*shake*1.4;
    ballMesh.visible=ball.live;ballMesh.position.set(ball.x-396,ball.r+.6,ball.y-306);ballMesh.rotation.x+=ball.vy*.0002;ballMesh.rotation.z-=ball.vx*.0002;syncTrail();
    for(const {o,mesh}of organMeshes){mesh.material[0].emissive.set(0xffffff);mesh.material[0].emissiveIntensity=.08+o.hit*.18;}
    lipMesh.material[0].emissiveIntensity=.08+mouth.hit*.3;
    for(const {f,mesh,group}of footMeshes){group.rotation.y=-f.side*f.a;group.scale.x=f.side;mesh.material[0].color.set(time<tiltLockedUntil?0x4a5152:0xffffff);}
    lamps.forEach((l,i)=>l.material.emissiveIntensity=i<multiplier?1.3:.03);syncLabels();
    const message=mode==='paused'?'PROCEDURE PAUSED · P TO RESUME':time<tiltLockedUntil?'TILT · FEET LOCKED '+Math.ceil(tiltLockedUntil-time)+'s':!ball.live?(mode==='over'?'PROCEDURE COMPLETE · SPACE TO RESTART':'PRESS SPACE TO RELEASE'):'';
    if(message!==lastBanner){banner.textContent=message;banner.hidden=!message;banner.classList.toggle('awaiting-release',message==='PRESS SPACE TO RELEASE');lastBanner=message;}
    renderer.render(scene,camera);revealPlayfield();return true;
  }
  return{render,scene,get camera(){return camera;},renderer,lipMesh,liningMesh,floorMesh,deckMesh,mouthOpening,organMeshes,footMeshes,surface,textures,get ready(){return ready;},get projection(){return view==='3d'?'perspective':'orthographic';},get pitch(){return view==='3d'?30:0;}};
}
