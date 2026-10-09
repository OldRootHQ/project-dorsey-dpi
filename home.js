(() => {
  "use strict";
  const characters=Array.isArray(window.OLDROOT_CHARACTERS)?window.OLDROOT_CHARACTERS:[];
  const locations=window.OLDROOT_LOCATIONS||{};
  const config=window.OLDROOT_HOME||{};

  function esc(value){return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]))}
  function boundedRandom(max){
    if(max<=1)return 0;
    if(window.crypto&&crypto.getRandomValues){
      const span=0x100000000, ceiling=Math.floor(span/max)*max, box=new Uint32Array(1);
      do{crypto.getRandomValues(box)}while(box[0]>=ceiling);
      return box[0]%max;
    }
    return Math.floor(Math.random()*max);
  }
  function pickRandom(pool,count){
    const copy=[...pool], limit=Math.min(count,copy.length);
    for(let i=0;i<limit;i++){const j=i+boundedRandom(copy.length-i);[copy[i],copy[j]]=[copy[j],copy[i]]}
    return copy.slice(0,limit);
  }

  const establishedLocations=Object.entries(locations).filter(([,loc])=>loc&&loc.dossierUrl&&!loc.reference&&String(loc.id||"").startsWith("LOC-"));
  const upcoming=Array.isArray(config.upcoming)?config.upcoming:[];
  const selectedCharacters=pickRandom(characters,3);
  const selectedLocations=pickRandom(establishedLocations,3);
  const selectedUpcoming=pickRandom(upcoming,3);

  const tabs=document.querySelector("#homeCharacterTabs");
  const track=document.querySelector("#homeCharacterTrack");
  const counter=document.querySelector("#homeCharacterCounter");
  if(tabs&&track){
    tabs.innerHTML=selectedCharacters.map((c,n)=>{
      const spot=config.characterSpotlights?.[c.codename]||{};
      const key=spot.key||String(c.codename).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
      return '<button type="button" class="'+(n===0?"active":"")+'" data-home-character="'+esc(key)+'" role="tab" aria-selected="'+(n===0?"true":"false")+'">'+esc(c.codename)+'</button>'
    }).join("");
    track.innerHTML=selectedCharacters.map((c,n)=>{
      const spot=config.characterSpotlights?.[c.codename]||{};
      const key=spot.key||String(c.codename).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
      const image=spot.image||c.image||"";
      const mark=spot.mark||c.mark||"";
      const meta=spot.meta||[c.powerClass,c.classification,c.locationKey].filter(Boolean).join(" · ").toUpperCase();
      const teaser=spot.teaser||c.summary||"Open the dossier to explore this character.";
      const links=(spot.links?.length?spot.links:[["Character Dossier →",c.page]]).filter(([,href])=>href);
      return '<div class="home-character-slide '+(n===0?"active":"")+'" data-home-slide="'+esc(key)+'">'+
        '<div class="home-character-art '+esc(spot.artClass||"")+'">'+
        (image?'<img decoding="async" src="'+esc(image)+'" alt="'+esc(spot.alt||c.codename+" visual reference")+'" loading="'+(n===0?"eager":"lazy")+'" data-lightbox data-full-src="'+esc(image)+'" data-caption="'+esc(c.codename)+' · spotlight visual reference" title="View '+esc(c.codename)+' artwork" tabindex="0"/>':"")+
        '</div><div class="home-character-copy">'+
        (mark?'<img class="home-character-mark" src="'+esc(mark)+'" alt="" aria-hidden="true" loading="lazy"/>':"")+
        '<span>'+esc(meta)+'</span><h3>'+esc(c.codename)+'</h3><p>'+esc(teaser)+'</p>'+
        '<div class="home-character-links">'+links.map(([label,href])=>'<a href="'+esc(href)+'">'+esc(label)+'</a>').join("")+'</div></div></div>'
    }).join("");
    track.setAttribute("aria-busy","false");
  }

  const worldGrid=document.querySelector("#homeWorldGrid");
  if(worldGrid){
    worldGrid.innerHTML=selectedLocations.map(([key,loc])=>{
      const spot=config.locationSpotlights?.[key]||{};
      const cast=(loc.characters||[]).map(c=>c.name).join(" · ");
      const context=cast?cast+" · "+(loc.region||""):loc.region||loc.type||"";
      return '<a class="place-card '+esc(spot.className||"")+'" data-home-location="'+esc(key)+'" href="'+esc(loc.dossierUrl)+'"><span>'+esc(loc.id)+'</span><h3>'+esc(loc.shortName||loc.name)+'</h3><p class="place-teaser">'+esc(spot.teaser||loc.note||"Open the location dossier.")+'</p><small>'+esc(context)+'</small></a>'
    }).join("");
    worldGrid.setAttribute("aria-busy","false");
  }

  const upcomingGrid=document.querySelector("#homeUpcomingGrid");
  if(upcomingGrid){
    upcomingGrid.innerHTML=selectedUpcoming.map(item=>'<article class="discovery-card dev-state dev-state-seed" data-home-upcoming="'+esc(item.name)+'"><span>Upcoming Character</span><h3>'+esc(item.name)+'</h3><p>In development.</p><b>'+esc(item.status||"IN DEVELOPMENT")+'</b></article>').join("");
    upcomingGrid.setAttribute("aria-busy","false");
  }

  const latest=config.latestDispatch;
  const dispatch=document.querySelector("#homeLatestDispatch");
  if(dispatch&&latest){
    const label=dispatch.querySelector("[data-dispatch-label]"),meta=dispatch.querySelector("[data-dispatch-meta]"),title=dispatch.querySelector("[data-dispatch-title]"),body=dispatch.querySelector("[data-dispatch-body]"),link=dispatch.querySelector("[data-dispatch-link]");
    if(label)label.textContent=latest.label;if(meta)meta.textContent=latest.meta;if(title)title.textContent=latest.title;if(body)body.textContent=latest.body;if(link)link.href=latest.href;
  }

  window.OLDROOT_HOME_STATE={
    characterPool:characters.map(c=>c.codename),
    selectedCharacters:selectedCharacters.map(c=>c.codename),
    locationPool:establishedLocations.map(([key])=>key),
    selectedLocations:selectedLocations.map(([key])=>key),
    upcomingPool:upcoming.map(item=>item.name),
    selectedUpcoming:selectedUpcoming.map(item=>item.name)
  };

  const buttons=[...document.querySelectorAll("[data-home-character]")],slides=[...document.querySelectorAll("[data-home-slide]")],prev=document.querySelector("#homeCharacterPrev"),next=document.querySelector("#homeCharacterNext"),pause=document.querySelector("#homeCharacterPause"),feature=document.querySelector(".home-featured");
  let index=0,timer=null,scrollFrame=0,paused=false;
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  buttons.forEach((b,n)=>{const key=b.dataset.homeCharacter||String(n),panel=slides[n];b.id="homeCharacterTab-"+key;b.setAttribute("aria-controls","homeCharacterPanel-"+key);b.tabIndex=n===0?0:-1;if(panel){panel.id="homeCharacterPanel-"+key;panel.setAttribute("role","tabpanel");panel.setAttribute("aria-labelledby",b.id);panel.tabIndex=0}});
  function setPauseState(value){paused=value;if(pause){pause.setAttribute("aria-pressed",String(paused));pause.textContent=paused?"Play":"Pause"}}
  function paint(i){if(!slides.length)return;index=(i+slides.length)%slides.length;buttons.forEach((b,n)=>{const active=n===index;b.classList.toggle("active",active);b.setAttribute("aria-selected",String(active));b.tabIndex=active?0:-1});slides.forEach((s,n)=>{const active=n===index;s.classList.toggle("active",active);s.setAttribute("aria-hidden",String(!active));s.inert=!active});if(counter)counter.textContent=(index+1)+" / "+slides.length}
  function show(i,behavior="smooth"){if(!slides.length)return;const nextIndex=(i+slides.length)%slides.length;paint(nextIndex);const slide=slides[nextIndex];if(track&&slide)track.scrollTo({left:slide.offsetLeft,behavior:reduced?"auto":behavior})}
  function stop(){clearInterval(timer);timer=null}
  function restart(){stop();if(reduced||paused||document.hidden||slides.length<2)return;timer=setInterval(()=>show(index+1),7000)}
  function syncFromScroll(){cancelAnimationFrame(scrollFrame);scrollFrame=requestAnimationFrame(()=>{if(!track||!slides.length)return;let nearest=0,distance=Infinity;slides.forEach((slide,n)=>{const d=Math.abs(slide.offsetLeft-track.scrollLeft);if(d<distance){distance=d;nearest=n}});paint(nearest)})}
  buttons.forEach((b,n)=>{b.addEventListener("click",()=>{show(n);restart()});b.addEventListener("keydown",event=>{let target=null;if(event.key==="ArrowRight"||event.key==="ArrowDown")target=(n+1)%buttons.length;else if(event.key==="ArrowLeft"||event.key==="ArrowUp")target=(n-1+buttons.length)%buttons.length;else if(event.key==="Home")target=0;else if(event.key==="End")target=buttons.length-1;if(target!==null){event.preventDefault();show(target);buttons[target].focus();restart()}})});
  prev?.addEventListener("click",()=>{show(index-1);restart()});next?.addEventListener("click",()=>{show(index+1);restart()});pause?.addEventListener("click",()=>{setPauseState(!paused);restart()});
  track?.addEventListener("scroll",syncFromScroll,{passive:true});track?.addEventListener("pointerdown",stop);track?.addEventListener("pointerup",restart);track?.addEventListener("touchend",restart,{passive:true});
  feature?.addEventListener("mouseenter",stop);feature?.addEventListener("mouseleave",restart);feature?.addEventListener("focusin",stop);feature?.addEventListener("focusout",event=>{if(!feature.contains(event.relatedTarget))restart()});
  document.addEventListener("visibilitychange",restart);
  paint(0);if(track)track.scrollLeft=0;if(reduced&&pause){paused=true;pause.disabled=true;pause.setAttribute("aria-pressed","true");pause.textContent="Auto off"}restart();
})();