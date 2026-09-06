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
  const deckMap=canvasMap(792,670,c=>{c.fillStyle='#152820';c.fillRect(0,0,792,670);c.strokeStyle='#55766342';c.lineWidth=.7;for(let x=0;x<792;x+=24){c.beginPath();c.moveTo(x,0);c.lineTo(x,670);c.stroke();}for(let y=0;y<670;y+=24){c.beginPath();c.moveTo(0,y);c.lineTo(792,y);c.stroke();}});
  const deckMesh=extrude(deckPts,{holes:[mouthOpening],height:-31,depth:21,bevel:0,map:deckMap,sideColor:0x101d19,roughness:.65,metalness:.3});
  const floorMap=canvasMap(792,612,c=>{const g=c.createLinearGradient(0,0,0,612);g.addColorStop(0,'#6c183b');g.addColorStop(.6,'#4c152c');g.addColorStop(1,'#34182c');c.fillStyle=g;c.fillRect(0,0,792,612);c.strokeStyle='#a74b6223';c.lineWidth=.5;for(let x=0;x<792;x+=16){c.beginPath();c.moveTo(x,0);c.lineTo(x,612);c.stroke();}for(let y=0;y<612;y+=16){c.beginPath();c.moveTo(0,y);c.lineTo(792,y);c.stroke();}c.textAlign='center';c.fillStyle='#bb95a5';c.font='8px monospace';c.fillText('C E R E B R A L   R E L E A S E',396,46);c.fillStyle='#bd8b9b';c.font='13px monospace';c.fillText('AUTOPSY',396,500);c.font='6px monospace';c.fillText('KEEP THE REFLEX ALIVE',396,516);});
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
  const ballMesh=new T.Mesh(new T.SphereGeometry(ball.r,28,20),new T.MeshStandardMaterial({color:0xeaf2ee,metalness:.92,roughness:.14,envMapIntensity:2.6}));ballMesh.castShadow=true;table.add(ballMesh);
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
    ballMesh.visible=ball.live;ballMesh.position.set(ball.x-396,ball.r+.6,ball.y-306);ballMesh.rotation.x+=ball.vy*.0002;ballMesh.rotation.z-=ball.vx*.0002;
    for(const {o,mesh}of organMeshes){mesh.material[0].emissive.set(0xffffff);mesh.material[0].emissiveIntensity=.08+o.hit*.18;}
    lipMesh.material[0].emissiveIntensity=.08+mouth.hit*.3;
    for(const {f,mesh,group}of footMeshes){group.rotation.y=-f.side*f.a;group.scale.x=f.side;mesh.material[0].color.set(time<tiltLockedUntil?0x4a5152:0xffffff);}
    lamps.forEach((l,i)=>l.material.emissiveIntensity=i<multiplier?1.3:.03);syncLabels();
    const message=mode==='paused'?'PROCEDURE PAUSED · P TO RESUME':time<tiltLockedUntil?'TILT · FEET LOCKED '+Math.ceil(tiltLockedUntil-time)+'s':!ball.live?(mode==='over'?'PROCEDURE COMPLETE · SPACE TO RESTART':'PRESS SPACE TO RELEASE'):'';
    if(message!==lastBanner){banner.textContent=message;banner.hidden=!message;lastBanner=message;}
    renderer.render(scene,camera);revealPlayfield();return true;
  }
  return{render,scene,get camera(){return camera;},renderer,lipMesh,liningMesh,floorMesh,deckMesh,mouthOpening,organMeshes,footMeshes,surface,textures,get ready(){return ready;},get projection(){return view==='3d'?'perspective':'orthographic';},get pitch(){return view==='3d'?30:0;}};
}
