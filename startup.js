// Keep the loading screen until a fully textured WebGL frame has been drawn.
let revealScheduled=false;
const loadTimeout=setTimeout(()=>showLoadingError(new Error('Loading timed out.')),45000);
function showLoadingError(error){
  if(document.body.dataset.loadState==='ready')return;
  clearTimeout(loadTimeout);
  document.body.dataset.loadState='error';
  document.querySelector('#loading-message').textContent='The 3D table could not load. Please retry in a browser with WebGL enabled.';
  document.querySelector('#loading-retry').hidden=false;
  console.error('Unable to prepare the 3D table.',error);
}
function revealPlayfield(){
  if(revealScheduled||document.body.dataset.loadState!=='loading')return;
  revealScheduled=true;
  // Allow the completed frame to reach the browser before starting the crossfade.
  requestAnimationFrame(()=>{
    if(document.body.dataset.loadState!=='loading')return;
    clearTimeout(loadTimeout);
    document.body.dataset.loadState='ready';
    document.querySelector('#view-toggle').disabled=false;
    document.querySelectorAll('body > header, body > main, body > footer').forEach(el=>el.inert=false);
    document.querySelector('#loading-screen').setAttribute('aria-hidden','true');
    document.querySelector('#loading-screen').inert=true;
  });
}
addEventListener('error',event=>{
  if(document.body.dataset.loadState==='loading')showLoadingError(event.error||new Error('A game resource failed to load.'));
},true);
