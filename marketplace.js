(() => {
  "use strict";
  const grid = document.querySelector("#marketplaceFeaturedGrid");
  if (!grid) return;
  const stickers = [
    {id:"gila-monster",title:"Gila Monster",asset:"assets/characters/gila-monster/gila-monster-emblem.svg",href:"characters/gila-monster/"},
    {id:"commotion",title:"Commotion",asset:"assets/characters/commotion/commotion-emblem.svg",href:"characters/commotion/"},
    {id:"latch",title:"Latch",asset:"assets/characters/latch/latch-emblem.svg",href:"characters/latch/"},
    {id:"kokio",title:"Kokio",asset:"assets/characters/kokio/kokio-emblem.svg",href:"characters/kokio/"}
  ].map(p=>({...p,kind:"sticker"}));
  const books = Array.from({length:10},(_,i)=>({id:"book-"+(i+1),title:"OldRoot Book "+(i+1),number:i+1,href:"library/oldroot-book-"+(i+1)+"/",kind:"book"}));
  const shuffle=arr=>{const out=[...arr];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;};
  const getPrevious=()=>{try{return JSON.parse(sessionStorage.getItem("oldroot-marketplace-features-v1")||"null")}catch{return null}};
  const save=ids=>{try{sessionStorage.setItem("oldroot-marketplace-features-v1",JSON.stringify(ids));}catch{}};
  let picked = shuffle([...shuffle(stickers).slice(0,3),...shuffle(books).slice(0,2)]);
  const last = getPrevious();
  const same=(a,b)=>Array.isArray(b)&&a.length===b.length&&a.every((x,i)=>x===b[i]);
  if(same(picked.map(p=>p.id),last)){
    // Guarantee a visibly different selection on a refresh/re-entry, even if the random shuffle repeats.
    const replacement=books.find(b=>!picked.some(p=>p.id===b.id));
    if(replacement){const pos=picked.findIndex(p=>p.kind==="book");if(pos>=0)picked[pos]=replacement;}
  }
  save(picked.map(p=>p.id));
  const make=(p)=>{
    const a=document.createElement("a");
    a.href=p.href;a.className="market-feature-card";
    a.dataset.featureId=p.id;a.dataset.featureKind=p.kind;
    const art=document.createElement("div");art.className="market-feature-visual "+(p.kind==="book"?"is-book":"is-sticker");
    if(p.kind==="sticker"){
      const img=document.createElement("img");img.src=p.asset;img.alt="";
      img.width=720;img.height=720;img.loading="lazy";img.decoding="async";art.append(img);
    }else{
      for(const [cls,label] of [["market-book-spine","OR"],["market-book-folio",String(p.number).padStart(2,"0")],["market-book-label","OLDROOT STANDARD"]]){
        const span=document.createElement("span");span.className=cls;span.textContent=label;span.setAttribute("aria-hidden","true");art.append(span);
      }
    }
    const copy=document.createElement("div");copy.className="market-feature-info";
    const status=document.createElement("span");status.textContent=p.kind==="book"?"LIBRARY / COMING SOON":"EMBLEM STICKER / SAMPLE PENDING";
    const h=document.createElement("h3");h.textContent=p.title;
    const action=document.createElement("small");action.textContent=p.kind==="book"?"View book record →":"Explore character →";
    copy.append(status,h,action);a.append(art,copy);return a;
  };
  grid.replaceChildren(...picked.map(make));
  window.OLDROOT_MARKETPLACE_FEATURES={ids:picked.map(p=>p.id),bookCount:picked.filter(p=>p.kind==="book").length,stickerCount:picked.filter(p=>p.kind==="sticker").length};
})();