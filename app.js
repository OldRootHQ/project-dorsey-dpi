(() => {
  const chars = window.DORSEY_CHARACTERS || [];
  const svg = document.querySelector("#chart");
  const detail = document.querySelector("#detail");
  const tip = document.querySelector("#tooltip");
  const search = document.querySelector("#search");
  const origin = document.querySelector("#origin");
  const location = document.querySelector("#location");
  const reset = document.querySelector("#reset");
  const count = document.querySelector("#count");
  const noResults = document.querySelector("#no-results");
  const NS = "http://www.w3.org/2000/svg";

  const mean = c => Object.values(c.baseline).reduce((a,b)=>a+b,0) / Object.values(c.baseline).length;
  const unique = key => [...new Set(chars.map(c=>c[key]))].sort();
  unique("origin").forEach(v => origin.insertAdjacentHTML("beforeend", `<option>${v}</option>`));
  unique("location").forEach(v => location.insertAdjacentHTML("beforeend", `<option>${v}</option>`));

  const tiers = [
    [0,5,"Below ordinary → ordinary"],[5,10,"Trained / exceptional"],[10,15,"Peak human → earliest superhuman"],
    [15,20,"Low metahuman"],[20,25,"Established metahuman"],[25,30,"Heavy metahuman"],
    [30,35,"Major superhuman"],[35,40,"Extreme terrestrial"],[40,45,"Global-scale"],[45,50,"Cosmic / transcendent"]
  ];

  function node(name, attrs={}, text=""){
    const n=document.createElementNS(NS,name);
    Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));
    if(text) n.textContent=text;
    return n;
  }

  function matches(c){
    const q=search.value.trim().toLowerCase();
    const hay=`${c.codename} ${c.civilian} ${c.location} ${c.origin} ${c.powerClass||""}`.toLowerCase();
    return (!q || hay.includes(q)) && (!origin.value || c.origin===origin.value) && (!location.value || c.location===location.value);
  }

  function render(){
    const data=chars.filter(matches);
    count.textContent=`${data.length} HERO${data.length===1?"":"ES"}`;
    noResults.classList.toggle("show",data.length===0);
    svg.innerHTML="";
    if(!data.length) return;

    const W=Math.max(760,svg.clientWidth||980), H=Math.max(520,svg.clientHeight||590);
    svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
    const m={top:34,right:154,bottom:62,left:62}, iw=W-m.left-m.right, ih=H-m.top-m.bottom;
    const orders=data.map(c=>c.registryOrder), lo=Math.min(...orders), hi=Math.max(...orders);
    const x=v=>hi===lo?m.left+iw/2:m.left+((v-lo)/(hi-lo))*iw;
    const y=v=>m.top+ih-(v/50)*ih;

    tiers.forEach(([a,b,label])=>svg.appendChild(node("text",{x:m.left+iw+10,y:(y(a)+y(b))/2+3,class:"tier"},label)));
    for(let v=0;v<=50;v+=5){
      svg.appendChild(node("line",{x1:m.left,y1:y(v),x2:m.left+iw,y2:y(v),class:`gridline ${v%10===0?"major":""}`}));
      svg.appendChild(node("text",{x:m.left-12,y:y(v)+3,"text-anchor":"end",class:"tick"},String(v)));
    }
    svg.appendChild(node("line",{x1:m.left,y1:m.top,x2:m.left,y2:m.top+ih,class:"axis"}));
    svg.appendChild(node("line",{x1:m.left,y1:m.top+ih,x2:m.left+iw,y2:m.top+ih,class:"axis"}));
    svg.appendChild(node("text",{x:16,y:m.top+ih/2,transform:`rotate(-90 16 ${m.top+ih/2})`,"text-anchor":"middle",class:"axis-label"},"Baseline DPI mean"));
    svg.appendChild(node("text",{x:m.left+iw/2,y:H-16,"text-anchor":"middle",class:"axis-label"},"DPI registry order"));

    data.forEach(c=>{
      const cx=x(c.registryOrder), cy=y(mean(c));
      svg.appendChild(node("line",{x1:cx,y1:m.top+ih,x2:cx,y2:cy,class:"gridline"}));
      svg.appendChild(node("text",{x:cx,y:m.top+ih+22,"text-anchor":"middle",class:"tick"},String(c.registryOrder)));
      const g=node("g",{tabindex:"0",role:"button","aria-label":`${c.codename}, DPI mean ${mean(c).toFixed(2)}`});
      g.appendChild(node("circle",{cx,cy,r:16,fill:"none",stroke:"#C5A24A","stroke-width":"8",opacity:".1"}));
      g.appendChild(node("circle",{cx,cy,r:8,fill:"#C5A24A",stroke:"#173428","stroke-width":"1.3",class:"point"}));
      g.appendChild(node("text",{x:cx,y:cy-18,"text-anchor":"middle",class:"point-label"},c.codename.toUpperCase()));
      g.addEventListener("mousemove",e=>showTip(e,c));
      g.addEventListener("mouseenter",e=>showTip(e,c));
      g.addEventListener("mouseleave",()=>tip.classList.remove("show"));
      g.addEventListener("click",()=>select(c));
      g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();select(c)}});
      svg.appendChild(g);
    });
  }

  function showTip(e,c){
    const top=Object.entries(c.baseline).reduce((a,b)=>a[1]>b[1]?a:b);
    tip.innerHTML=`<strong>${c.codename}</strong><small>${c.civilian}</small>
      <div class="trow"><span>Baseline mean</span><b>${mean(c).toFixed(2)}</b></div>
      <div class="trow"><span>Highest category</span><b>${top[0]} · ${top[1].toFixed(1)}</b></div>
      <div class="trow"><span>Location</span><b>${c.location}</b></div>`;
    tip.classList.add("show");
    let left=e.clientX+16, topY=e.clientY+16;
    if(left+300>innerWidth) left=e.clientX-300;
    if(topY+160>innerHeight) topY=e.clientY-170;
    tip.style.left=`${Math.max(10,left)}px`; tip.style.top=`${Math.max(10,topY)}px`;
  }

  function select(c){
    const top=Object.entries(c.baseline).reduce((a,b)=>a[1]>b[1]?a:b);
    const conditional=(c.conditional && c.conditional.length)
      ? c.conditional.map(d=>`<div class="conditional"><span>${d.category} · ${d.condition}</span><b>${d.value.toFixed(1)}</b></div>`).join("")
      : '<div class="conditional-empty">No conditional values established.</div>';
    detail.innerHTML=`
      <div class="name-row"><div class="name">${c.codename}</div><span class="badge">${c.classification}</span></div>
      <div class="civilian">${c.civilian}</div>
      <div class="summary">${c.summary}</div>
      <div class="meta">
        <div><span>Location</span><b>${c.location}</b></div>
        <div><span>Origin / Class</span><b>${c.origin}${c.powerClass?` · ${c.powerClass}`:""}</b></div>
        <div><span>DPI registry</span><b>#${c.registryOrder}</b></div>
        <div><span>Top baseline</span><b>${top[0]} · ${top[1].toFixed(1)}</b></div>
      </div>
      <div class="mean"><span>Analytics-only<br>baseline mean</span><b>${mean(c).toFixed(2)}</b></div>
      ${c.page ? `<a class="dossier-link" href="${c.page}">Open character dossier →</a>` : ""}
      <div class="section-label">Baseline DPI</div>
      ${Object.entries(c.baseline).map(([k,v])=>`<div class="stat"><div class="stat-name">${k}</div><div class="track"><div class="fill" style="width:${v/50*100}%"></div></div><div class="stat-val">${v.toFixed(1)}</div></div>`).join("")}
      <div class="section-label">Conditional modifiers</div>
      ${conditional}
    `;
  }

  [search,origin,location].forEach(el=>el.addEventListener("input",render));
  reset.addEventListener("click",()=>{search.value="";origin.value="";location.value="";render()});
  window.addEventListener("resize",()=>requestAnimationFrame(render));
  render();
  if(chars[0]) select(chars[0]);
})();