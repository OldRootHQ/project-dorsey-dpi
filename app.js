(() => {
  const chars = window.DORSEY_CHARACTERS || [];
  const svg = document.querySelector("#chart");
  const detail = document.querySelector("#detail");
  const tip = document.querySelector("#tooltip");
  const search = document.querySelector("#search");
  const origin = document.querySelector("#origin");
  const location = document.querySelector("#location");
  const xMetric = document.querySelector("#x-metric");
  const yMetric = document.querySelector("#y-metric");
  const swapAxes = document.querySelector("#swap-axes");
  const reset = document.querySelector("#reset");
  const count = document.querySelector("#count");
  const noResults = document.querySelector("#no-results");
  const comparisonLabel = document.querySelector("#comparison-label");
  const NS = "http://www.w3.org/2000/svg";

  const mean = c => Object.values(c.baseline).reduce((a,b)=>a+b,0) / Object.values(c.baseline).length;
  const unique = key => [...new Set(chars.map(c=>c[key]))].sort();
  const metrics = chars.length ? Object.keys(chars[0].baseline) : [
    "Strength","Durability","Speed","Agility","Regeneration","Senses","Offense","Intellect","Combat","Mobility","Stamina"
  ];
  let selectedCharacter = chars[0] || null;

  unique("origin").forEach(v => origin.insertAdjacentHTML("beforeend", `<option>${v}</option>`));
  unique("location").forEach(v => location.insertAdjacentHTML("beforeend", `<option>${v}</option>`));
  metrics.forEach(metric => {
    xMetric.insertAdjacentHTML("beforeend", `<option value="${metric}">${metric}</option>`);
    yMetric.insertAdjacentHTML("beforeend", `<option value="${metric}">${metric}</option>`);
  });
  xMetric.value = "Offense";
  yMetric.value = "Durability";

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
    const xKey=xMetric.value;
    const yKey=yMetric.value;
    count.textContent=`${data.length} HERO${data.length===1?"":"ES"}`;
    comparisonLabel.textContent=`${xKey} vs ${yKey}`;
    noResults.classList.toggle("show",data.length===0);
    svg.innerHTML="";
    if(!data.length){
      detail.innerHTML="";
      return;
    }

    const W=Math.max(760,svg.clientWidth||980), H=Math.max(520,svg.clientHeight||590);
    svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
    svg.setAttribute("aria-label",`DPI comparison scatter plot: ${xKey} versus ${yKey}`);
    const m={top:42,right:34,bottom:66,left:70}, iw=W-m.left-m.right, ih=H-m.top-m.bottom;
    const x=v=>m.left+(v/50)*iw;
    const y=v=>m.top+ih-(v/50)*ih;

    for(let v=0;v<=50;v+=5){
      svg.appendChild(node("line",{x1:m.left,y1:y(v),x2:m.left+iw,y2:y(v),class:`gridline ${v%10===0?"major":""}`}));
      svg.appendChild(node("line",{x1:x(v),y1:m.top,x2:x(v),y2:m.top+ih,class:`gridline ${v%10===0?"major":""}`}));
      svg.appendChild(node("text",{x:m.left-12,y:y(v)+3,"text-anchor":"end",class:"tick"},String(v)));
      svg.appendChild(node("text",{x:x(v),y:m.top+ih+23,"text-anchor":"middle",class:"tick"},String(v)));
    }

    svg.appendChild(node("line",{x1:m.left,y1:m.top,x2:m.left,y2:m.top+ih,class:"axis"}));
    svg.appendChild(node("line",{x1:m.left,y1:m.top+ih,x2:m.left+iw,y2:m.top+ih,class:"axis"}));
    svg.appendChild(node("text",{x:18,y:m.top+ih/2,transform:`rotate(-90 18 ${m.top+ih/2})`,"text-anchor":"middle",class:"axis-label"},yKey));
    svg.appendChild(node("text",{x:m.left+iw/2,y:H-17,"text-anchor":"middle",class:"axis-label"},xKey));

    const showLabels=data.length<=35;

    data.forEach(c=>{
      const xv=c.baseline[xKey], yv=c.baseline[yKey];
      const cx=x(xv), cy=y(yv);
      const g=node("g",{tabindex:"0",role:"button","aria-label":`${c.codename}, ${xKey} ${xv.toFixed(1)}, ${yKey} ${yv.toFixed(1)}, baseline mean ${mean(c).toFixed(2)}`});
      g.appendChild(node("circle",{cx,cy,r:16,fill:"none",stroke:"#C5A24A","stroke-width":"8",opacity:".1"}));
      g.appendChild(node("circle",{cx,cy,r:8,fill:"#C5A24A",stroke:"#173428","stroke-width":"1.3",class:"point"}));
      if(showLabels){
        g.appendChild(node("text",{x:cx,y:cy-18,"text-anchor":"middle",class:"point-label"},c.codename.toUpperCase()));
      }
      g.addEventListener("mousemove",e=>showTip(e,c));
      g.addEventListener("mouseenter",e=>showTip(e,c));
      g.addEventListener("mouseleave",()=>tip.classList.remove("show"));
      g.addEventListener("click",()=>select(c));
      g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();select(c)}});
      svg.appendChild(g);
    });

    if(selectedCharacter && data.includes(selectedCharacter)) select(selectedCharacter);
    else select(data[0]);
  }

  function showTip(e,c){
    const xKey=xMetric.value, yKey=yMetric.value;
    tip.innerHTML=`<strong>${c.codename}</strong><small>${c.civilian}</small>
      <div class="trow"><span>${xKey}</span><b>${c.baseline[xKey].toFixed(1)}</b></div>
      <div class="trow"><span>${yKey}</span><b>${c.baseline[yKey].toFixed(1)}</b></div>
      <div class="trow"><span>Baseline mean</span><b>${mean(c).toFixed(2)}</b></div>
      <div class="trow"><span>Power class</span><b>${c.powerClass||"Unassigned"}</b></div>`;
    tip.classList.add("show");
    let left=e.clientX+16, topY=e.clientY+16;
    if(left+310>innerWidth) left=e.clientX-310;
    if(topY+190>innerHeight) topY=e.clientY-200;
    tip.style.left=`${Math.max(10,left)}px`; tip.style.top=`${Math.max(10,topY)}px`;
  }

  function select(c){
    selectedCharacter=c;
    const xKey=xMetric.value, yKey=yMetric.value;
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
        <div><span>Power class</span><b>${c.powerClass||"Unassigned"}</b></div>
        <div><span>${xKey}</span><b>${c.baseline[xKey].toFixed(1)}</b></div>
        <div><span>${yKey}</span><b>${c.baseline[yKey].toFixed(1)}</b></div>
      </div>
      <div class="comparison-readout"><span>Current comparison</span><b>${xKey} ${c.baseline[xKey].toFixed(1)} <i>vs</i> ${yKey} ${c.baseline[yKey].toFixed(1)}</b></div>
      <div class="mean"><span>Analytics-only<br>baseline mean</span><b>${mean(c).toFixed(2)}</b></div>
      <div class="top-baseline"><span>Highest baseline category</span><b>${top[0]} · ${top[1].toFixed(1)}</b></div>
      ${c.page ? `<a class="dossier-link" href="${c.page}">Open character dossier →</a>` : ""}
      <div class="section-label">Baseline DPI</div>
      ${Object.entries(c.baseline).map(([k,v])=>`<div class="stat"><div class="stat-name">${k}</div><div class="track"><div class="fill" style="width:${v/50*100}%"></div></div><div class="stat-val">${v.toFixed(1)}</div></div>`).join("")}
      <div class="section-label">Conditional modifiers</div>
      ${conditional}
    `;
  }

  [search,origin,location].forEach(el=>el.addEventListener("input",render));
  [xMetric,yMetric].forEach(el=>el.addEventListener("change",render));

  swapAxes.addEventListener("click",()=>{
    const x=xMetric.value;
    xMetric.value=yMetric.value;
    yMetric.value=x;
    render();
  });

  reset.addEventListener("click",()=>{
    search.value="";
    origin.value="";
    location.value="";
    xMetric.value="Offense";
    yMetric.value="Durability";
    render();
  });

  window.addEventListener("resize",()=>requestAnimationFrame(render));
  render();
})();