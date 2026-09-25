(() => {
  const chars=window.OLDROOT_CHARACTERS||[];
  const $=s=>document.querySelector(s);
  const svg=$("#chart"),detail=$("#detail"),tip=$("#tooltip"),search=$("#search");
  const xMetric=$("#x-metric"),yMetric=$("#y-metric"),swapAxes=$("#swap-axes"),reset=$("#reset");
  const count=$("#count"),plotCount=$("#plot-count"),noResults=$("#no-results"),comparisonLabel=$("#comparison-label");
  const filterOpen=$("#filter-open"),filterDrawer=$("#filter-drawer"),filterGroups=$("#filter-groups"),filterCount=$("#filter-count");
  const filterClear=$("#filter-clear"),filterApply=$("#filter-apply"),activeFilters=$("#active-filters");
  const colorBy=$("#color-by"),sizeBy=$("#size-by"),labelBy=$("#label-by");
  const compareToggle=$("#compare-toggle"),compareTray=$("#compare-tray"),compareContent=$("#compare-content"),compareClear=$("#compare-clear");
  const chartNote=$("#chart-note"),NS="http://www.w3.org/2000/svg";

  const dpiMetrics=["Strength","Durability","Speed","Agility","Regeneration","Senses","Offense","Intellect","Combat","Mobility","Stamina"];
  const defs={
    ...Object.fromEntries(dpiMetrics.map(k=>[k,{label:k,group:"OPI",kind:"dpi",format:v=>v.toFixed(1)}])),
    age:{label:"Age",group:"Physical Profile",kind:"age",format:v=>String(Math.round(v))},
    heightIn:{label:"Height",group:"Physical Profile",kind:"height",format:formatHeight},
    weightLb:{label:"Weight",group:"Physical Profile",kind:"weight",format:v=>Math.round(v)+" lb"},
    yearsActive:{label:"Years Active",group:"Career",kind:"years",format:v=>v.toFixed(1).replace(".0","")},
    mean:{label:"Baseline Mean",group:"Derived Analytics",kind:"dpi",format:v=>v.toFixed(2)},
    high:{label:"Highest OPI Value",group:"Derived Analytics",kind:"dpi",format:v=>v.toFixed(1)},
    low:{label:"Lowest OPI Value",group:"Derived Analytics",kind:"dpi",format:v=>v.toFixed(1)},
    spread:{label:"OPI Spread",group:"Derived Analytics",kind:"dpi",format:v=>v.toFixed(1)},
    conditionalCount:{label:"Conditional OPI Count",group:"Derived Analytics",kind:"count",format:v=>String(Math.round(v))}
  };
  const metricOrder=[...dpiMetrics,"age","heightIn","weightLb","yearsActive","mean","high","low","spread","conditionalCount"];
  const filterDefs=[
    {key:"role",label:"Role"},
    {key:"powerClass",label:"Power Classification"},
    {key:"originType",label:"Origin Type"},
    {key:"ascendantStatus",label:"Ascendant Status"},
    {key:"locationKey",label:"Location"},
    {key:"conditionalStatus",label:"Conditional OPI"}
  ];
  const filterState={};
  const compareSet=new Set();
  let compareMode=false,selectedCharacter=chars[0]||null;

  function mean(c){const v=Object.values(c.baseline);return v.reduce((a,b)=>a+b,0)/v.length}
  function high(c){return Math.max(...Object.values(c.baseline))}
  function low(c){return Math.min(...Object.values(c.baseline))}
  function valueFor(c,key){
    if(dpiMetrics.includes(key))return c.baseline[key];
    if(key==="mean")return mean(c);
    if(key==="high")return high(c);
    if(key==="low")return low(c);
    if(key==="spread")return high(c)-low(c);
    if(key==="conditionalCount")return (c.conditional||[]).length;
    return c[key]??null;
  }
  function formatHeight(v){
    let ft=Math.floor(v/12),inch=Math.round(v-ft*12);
    if(inch===12){ft++;inch=0}
    return ft+"'"+inch+'"';
  }
  function formatMetric(key,v){return v==null?"—":defs[key].format(v)}
  function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
  function node(name,attrs={},text=""){const n=document.createElementNS(NS,name);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));if(text)n.textContent=text;return n}
  function unique(key){
    if(key==="conditionalStatus")return["Has conditional OPI","No conditional OPI"];
    return[...new Set(chars.map(c=>c[key]||"Unassigned"))].sort((a,b)=>String(a).localeCompare(String(b)));
  }

  function buildMetricSelect(select){
    const groups={};
    metricOrder.forEach(key=>{const d=defs[key];(groups[d.group]??=[]).push(key)});
    Object.entries(groups).forEach(([group,keys])=>{
      const optgroup=document.createElement("optgroup");optgroup.label=group;
      keys.forEach(key=>{const o=document.createElement("option");o.value=key;o.textContent=defs[key].label;optgroup.appendChild(o)});
      select.appendChild(optgroup);
    });
  }
  buildMetricSelect(xMetric);buildMetricSelect(yMetric);
  xMetric.value="Offense";yMetric.value="Durability";

  function buildFilters(){
    filterGroups.innerHTML="";
    filterDefs.forEach(def=>{
      filterState[def.key]=new Set();
      const section=document.createElement("section");section.className="filter-group";
      section.innerHTML="<h3>"+esc(def.label)+"</h3>";
      const options=document.createElement("div");options.className="filter-options";
      unique(def.key).forEach(value=>{
        const label=document.createElement("label");label.className="filter-check";
        const input=document.createElement("input");input.type="checkbox";input.dataset.filterKey=def.key;input.value=value;
        const text=document.createElement("span");text.textContent=value;
        const badge=document.createElement("b");badge.className="filter-option-count";badge.textContent="0";
        label.append(input,text,badge);options.appendChild(label);
      });
      section.appendChild(options);filterGroups.appendChild(section);
    });
    filterGroups.addEventListener("change",updateFilterOptionCounts);
  }
  buildFilters();

  function getFilterValue(c,key){
    if(key==="conditionalStatus")return(c.conditional&&c.conditional.length)?"Has conditional OPI":"No conditional OPI";
    return c[key]||"Unassigned";
  }
  function draftState(){
    const state={};
    filterGroups.querySelectorAll("[data-filter-key]:checked").forEach(input=>(state[input.dataset.filterKey]??=new Set()).add(input.value));
    return state;
  }
  function matchesState(c,state){return Object.entries(state).every(([key,set])=>!set.size||set.has(getFilterValue(c,key)))}
  function textMatches(c){
    const q=search.value.trim().toLowerCase();if(!q)return true;
    return[c.codename,c.civilian,c.location,c.origin,c.originType,c.powerClass,c.affiliation,c.ascendantStatus].filter(Boolean).join(" ").toLowerCase().includes(q);
  }
  function appliedMatches(c){return textMatches(c)&&matchesState(c,filterState)}

  function updateFilterOptionCounts(){
    const draft=draftState();
    filterGroups.querySelectorAll("[data-filter-key]").forEach(input=>{
      const state={};
      Object.entries(draft).forEach(([k,set])=>{if(k!==input.dataset.filterKey)state[k]=set});
      const n=chars.filter(c=>textMatches(c)&&matchesState(c,state)&&getFilterValue(c,input.dataset.filterKey)===input.value).length;
      input.closest(".filter-check").querySelector(".filter-option-count").textContent=n;
    });
  }
  function applyDraft(){
    Object.values(filterState).forEach(s=>s.clear());
    Object.entries(draftState()).forEach(([k,set])=>set.forEach(v=>filterState[k].add(v)));
    updateActiveFilters();render();
  }
  function updateActiveFilters(){
    const items=[];
    Object.entries(filterState).forEach(([key,set])=>set.forEach(v=>items.push({key,v})));
    filterCount.hidden=!items.length;filterCount.textContent=items.length;
    if(!items.length){activeFilters.hidden=true;activeFilters.innerHTML="";return}
    activeFilters.hidden=false;
    activeFilters.innerHTML=items.map(({key,v})=>'<button type="button" data-chip-key="'+esc(key)+'" data-chip-value="'+esc(v)+'">'+esc(v)+' ×</button>').join("");
    activeFilters.querySelectorAll("button").forEach(b=>b.onclick=()=>{
      filterState[b.dataset.chipKey].delete(b.dataset.chipValue);
      const input=[...filterGroups.querySelectorAll('[data-filter-key="'+b.dataset.chipKey+'"]')].find(i=>i.value===b.dataset.chipValue);
      if(input)input.checked=false;
      updateActiveFilters();updateFilterOptionCounts();render();
    });
  }

  function extentFor(data,key){
    const vals=data.map(c=>valueFor(c,key)).filter(Number.isFinite),kind=defs[key].kind;
    if(kind==="dpi")return[0,50];
    if(kind==="height")return[Math.min(60,Math.floor(Math.min(...vals)-2)),Math.max(80,Math.ceil(Math.max(...vals)+2))];
    if(kind==="weight")return[Math.max(0,Math.floor((Math.min(...vals)-20)/10)*10),Math.ceil((Math.max(...vals)+20)/10)*10];
    if(kind==="age")return[Math.max(0,Math.floor(Math.min(...vals)-3)),Math.ceil(Math.max(...vals)+3)];
    if(kind==="years")return[0,Math.max(5,Math.ceil(Math.max(...vals)+2))];
    if(kind==="count")return[0,Math.max(3,Math.ceil(Math.max(...vals)+1))];
    let lo=Math.min(...vals),hi=Math.max(...vals);if(lo===hi){lo-=1;hi+=1}const pad=(hi-lo)*.12;return[lo-pad,hi+pad];
  }
  function ticks([lo,hi],kind,n=6){
    if(kind==="dpi")return[0,10,20,30,40,50];
    const step=(hi-lo)/(n-1);return Array.from({length:n},(_,i)=>lo+step*i);
  }
  function tickText(key,v){
    const kind=defs[key].kind;
    if(kind==="height")return formatHeight(v);
    if(kind==="weight")return Math.round(v)+" lb";
    if(["age","years","count"].includes(kind))return String(Math.round(v));
    return Number(v).toFixed(1).replace(".0","");
  }
  function paletteValue(c){return colorBy.value==="none"?"All Characters":c[colorBy.value]||"Unassigned"}
  function colorMap(data){
    const values=[...new Set(data.map(paletteValue))],colors=["#C5A24A","#244C3A","#8C6A4A","#8E979F","#173428","#B77B45","#6D8275","#9B7E61","#6F6A78"];
    return Object.fromEntries(values.map((v,i)=>[v,colors[i%colors.length]]));
  }
  function radiusFor(c,data){
    const mode=sizeBy.value;if(mode==="fixed")return 8;
    const key=mode==="mean"?"mean":mode==="x"?xMetric.value:yMetric.value;
    const vals=data.map(x=>valueFor(x,key)).filter(Number.isFinite),v=valueFor(c,key);
    if(!Number.isFinite(v)||!vals.length)return 8;
    const lo=Math.min(...vals),hi=Math.max(...vals);if(lo===hi)return 10;
    return 6+((v-lo)/(hi-lo))*8;
  }

  function render(){
    const filtered=chars.filter(appliedMatches),xKey=xMetric.value,yKey=yMetric.value;
    const data=filtered.filter(c=>Number.isFinite(valueFor(c,xKey))&&Number.isFinite(valueFor(c,yKey)));
    count.textContent=filtered.length+" CHARACTER"+(filtered.length===1?"":"S");
    plotCount.textContent=data.length+" plotted"+(data.length!==filtered.length?" · "+(filtered.length-data.length)+" missing axis data":"");
    comparisonLabel.textContent=defs[xKey].label+" vs "+defs[yKey].label;
    chartNote.textContent=data.length!==filtered.length?(filtered.length-data.length)+" filtered character"+(filtered.length-data.length===1?" is":"s are")+" hidden from this plot because one or both selected values are not established.":"";
    noResults.classList.toggle("show",data.length===0);svg.innerHTML="";
    if(!data.length){detail.innerHTML='<div class="detail-empty">Choose another comparison or clear filters.</div>';renderCompare();return}

    const W=Math.max(760,svg.clientWidth||980),H=Math.max(540,svg.clientHeight||610);
    svg.setAttribute("viewBox","0 0 "+W+" "+H);
    const m={top:48,right:42,bottom:76,left:88},iw=W-m.left-m.right,ih=H-m.top-m.bottom;
    const xExt=extentFor(data,xKey),yExt=extentFor(data,yKey);
    const sx=v=>m.left+((v-xExt[0])/(xExt[1]-xExt[0]))*iw;
    const sy=v=>m.top+ih-((v-yExt[0])/(yExt[1]-yExt[0]))*ih;

    ticks(yExt,defs[yKey].kind).forEach(v=>{const yy=sy(v);svg.appendChild(node("line",{x1:m.left,y1:yy,x2:m.left+iw,y2:yy,class:"gridline"}));svg.appendChild(node("text",{x:m.left-12,y:yy+3,"text-anchor":"end",class:"tick"},tickText(yKey,v)))});
    ticks(xExt,defs[xKey].kind).forEach(v=>{const xx=sx(v);svg.appendChild(node("line",{x1:xx,y1:m.top,x2:xx,y2:m.top+ih,class:"gridline"}));svg.appendChild(node("text",{x:xx,y:m.top+ih+25,"text-anchor":"middle",class:"tick"},tickText(xKey,v)))});
    svg.appendChild(node("line",{x1:m.left,y1:m.top,x2:m.left,y2:m.top+ih,class:"axis"}));svg.appendChild(node("line",{x1:m.left,y1:m.top+ih,x2:m.left+iw,y2:m.top+ih,class:"axis"}));
    svg.appendChild(node("text",{x:24,y:m.top+ih/2,transform:"rotate(-90 24 "+(m.top+ih/2)+")","text-anchor":"middle",class:"axis-label"},defs[yKey].label));
    svg.appendChild(node("text",{x:m.left+iw/2,y:H-20,"text-anchor":"middle",class:"axis-label"},defs[xKey].label));

    const cmap=colorMap(data);
    data.forEach(c=>{
      const xv=valueFor(c,xKey),yv=valueFor(c,yKey),cx=sx(xv),cy=sy(yv),r=radiusFor(c,data),chosen=compareSet.has(c.codename);
      const g=node("g",{tabindex:"0",role:"button","aria-label":c.codename+", "+defs[xKey].label+" "+formatMetric(xKey,xv)+", "+defs[yKey].label+" "+formatMetric(yKey,yv)});
      if(chosen)g.appendChild(node("circle",{cx,cy,r:r+9,fill:"none",stroke:"#151515","stroke-width":"2",class:"compare-ring"}));
      g.appendChild(node("circle",{cx,cy,r:r+7,fill:"none",stroke:cmap[paletteValue(c)],"stroke-width":"7",opacity:".14"}));
      g.appendChild(node("circle",{cx,cy,r,fill:cmap[paletteValue(c)],stroke:"#173428","stroke-width":"1.4",class:"point"}));
      const label=labelBy.value==="codename"?c.codename:labelBy.value==="civilian"?c.civilian:"";
      if(label)g.appendChild(node("text",{x:cx,y:cy-r-10,"text-anchor":"middle",class:"point-label"},label.toUpperCase()));
      g.addEventListener("mousemove",e=>showTip(e,c));g.addEventListener("mouseenter",e=>showTip(e,c));g.addEventListener("mouseleave",()=>tip.classList.remove("show"));
      g.addEventListener("click",()=>pointAction(c));g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();pointAction(c)}});
      svg.appendChild(g);
    });

    const legendValues=[...new Set(data.map(paletteValue))];
    const lg=node("g",{class:"chart-legend"});let lx=m.left;
    legendValues.slice(0,8).forEach(v=>{lg.appendChild(node("circle",{cx:lx,cy:24,r:5,fill:cmap[v]}));lg.appendChild(node("text",{x:lx+10,y:27,class:"legend-text"},v));lx+=Math.min(195,Math.max(88,v.length*6.4+28))});
    svg.appendChild(lg);

    if(selectedCharacter&&filtered.includes(selectedCharacter))select(selectedCharacter);else select(filtered[0]);
    renderCompare();
  }

  function pointAction(c){
    selectedCharacter=c;
    if(compareMode){
      if(compareSet.has(c.codename))compareSet.delete(c.codename);else if(compareSet.size<4)compareSet.add(c.codename);
      render();
    }else select(c);
  }
  function showTip(e,c){
    const xKey=xMetric.value,yKey=yMetric.value;
    tip.innerHTML='<strong>'+esc(c.codename)+'</strong><small>'+esc(c.civilian)+'</small>'+
      '<div class="trow"><span>'+esc(defs[xKey].label)+'</span><b>'+esc(formatMetric(xKey,valueFor(c,xKey)))+'</b></div>'+
      '<div class="trow"><span>'+esc(defs[yKey].label)+'</span><b>'+esc(formatMetric(yKey,valueFor(c,yKey)))+'</b></div>'+
      '<div class="trow"><span>Baseline mean</span><b>'+mean(c).toFixed(2)+'</b></div>'+
      '<div class="trow"><span>Power class</span><b>'+esc(c.powerClass||"Unassigned")+'</b></div>';
    tip.classList.add("show");let left=e.clientX+16,top=e.clientY+16;if(left+320>innerWidth)left=e.clientX-320;if(top+200>innerHeight)top=e.clientY-210;
    tip.style.left=Math.max(10,left)+"px";tip.style.top=Math.max(10,top)+"px";
  }
  function select(c){
    selectedCharacter=c;const xKey=xMetric.value,yKey=yMetric.value,top=Object.entries(c.baseline).reduce((a,b)=>a[1]>b[1]?a:b);
    const conditional=(c.conditional&&c.conditional.length)?c.conditional.map(d=>'<div class="conditional"><span>'+esc(d.category)+' · '+esc(d.condition)+'</span><b>'+d.value.toFixed(1)+'</b></div>').join(""):'<div class="conditional-empty">No conditional values established.</div>';
    detail.innerHTML=
      (c.image?'<img class="detail-portrait" src="'+esc(c.image)+'" alt="'+esc(c.codename)+' visual reference" />':"")+
      '<div class="name-row"><div class="name">'+esc(c.codename)+'</div><span class="badge">'+esc(c.classification)+'</span></div>'+
      '<div class="civilian">'+esc(c.civilian)+'</div><div class="summary">'+esc(c.summary)+'</div>'+
      '<div class="meta"><div><span>Location</span><b>'+esc(c.location)+'</b></div><div><span>Power class</span><b>'+esc(c.powerClass||"Unassigned")+'</b></div>'+
      '<div><span>'+esc(defs[xKey].label)+'</span><b>'+esc(formatMetric(xKey,valueFor(c,xKey)))+'</b></div><div><span>'+esc(defs[yKey].label)+'</span><b>'+esc(formatMetric(yKey,valueFor(c,yKey)))+'</b></div></div>'+
      '<div class="comparison-readout"><span>Current comparison</span><b>'+esc(defs[xKey].label)+' '+esc(formatMetric(xKey,valueFor(c,xKey)))+' <i>vs</i> '+esc(defs[yKey].label)+' '+esc(formatMetric(yKey,valueFor(c,yKey)))+'</b></div>'+
      '<div class="mean"><span>Analytics-only<br>baseline mean</span><b>'+mean(c).toFixed(2)+'</b></div>'+
      '<div class="top-baseline"><span>Highest baseline category</span><b>'+esc(top[0])+' · '+top[1].toFixed(1)+'</b></div>'+
      (c.page?'<a class="dossier-link" href="'+esc(c.page)+'">Open character dossier →</a>':"")+
      '<div class="section-label">Baseline OPI</div>'+
      Object.entries(c.baseline).map(([k,v])=>'<div class="stat"><div class="stat-name">'+k+'</div><div class="track"><div class="fill" style="width:'+(v/50*100)+'%"></div></div><div class="stat-val">'+v.toFixed(1)+'</div></div>').join("")+
      '<div class="section-label">Conditional modifiers</div>'+conditional;
  }

  function renderCompare(){
    compareTray.hidden=!compareMode;if(!compareMode)return;
    const selected=chars.filter(c=>compareSet.has(c.codename));
    if(!selected.length){compareContent.innerHTML='<div class="compare-empty">Click up to four plotted characters to add them here.</div>';return}
    compareContent.innerHTML='<div class="compare-names">'+selected.map(c=>'<button type="button" data-remove-compare="'+esc(c.codename)+'">'+esc(c.codename)+' ×</button>').join("")+'</div>'+
      '<div class="compare-table-wrap"><table class="compare-table"><thead><tr><th>Category</th>'+selected.map(c=>'<th>'+esc(c.codename)+'</th>').join("")+'</tr></thead><tbody>'+
      dpiMetrics.map(k=>'<tr><td>'+k+'</td>'+selected.map(c=>'<td>'+c.baseline[k].toFixed(1)+'</td>').join("")+'</tr>').join("")+
      '<tr class="analytics-row"><td>Baseline Mean*</td>'+selected.map(c=>'<td>'+mean(c).toFixed(2)+'</td>').join("")+'</tr></tbody></table></div>'+
      '<p class="compare-footnote">* Analytics-only visualization statistic; not a canonical overall power score or fight rating.</p>';
    compareContent.querySelectorAll("[data-remove-compare]").forEach(b=>b.onclick=()=>{compareSet.delete(b.dataset.removeCompare);render()});
  }

  search.addEventListener("input",()=>{updateFilterOptionCounts();render()});
  [xMetric,yMetric,colorBy,sizeBy,labelBy].forEach(e=>e.addEventListener("change",render));
  swapAxes.onclick=()=>{const x=xMetric.value;xMetric.value=yMetric.value;yMetric.value=x;render()};
  filterOpen.onclick=()=>{const opening=filterDrawer.hidden;filterDrawer.hidden=!opening;filterOpen.setAttribute("aria-expanded",String(opening));if(opening)updateFilterOptionCounts()};
  filterApply.onclick=()=>{applyDraft();filterDrawer.hidden=true;filterOpen.setAttribute("aria-expanded","false")};
  filterClear.onclick=()=>{filterGroups.querySelectorAll("input").forEach(i=>i.checked=false);Object.values(filterState).forEach(s=>s.clear());updateActiveFilters();updateFilterOptionCounts();render()};
  compareToggle.onclick=()=>{compareMode=!compareMode;compareToggle.classList.toggle("active",compareMode);compareToggle.setAttribute("aria-pressed",String(compareMode));renderCompare();render()};
  compareClear.onclick=()=>{compareSet.clear();render()};
  reset.onclick=()=>{search.value="";filterGroups.querySelectorAll("input").forEach(i=>i.checked=false);Object.values(filterState).forEach(s=>s.clear());xMetric.value="Offense";yMetric.value="Durability";colorBy.value="powerClass";sizeBy.value="fixed";labelBy.value="codename";compareSet.clear();compareMode=false;compareToggle.classList.remove("active");compareToggle.setAttribute("aria-pressed","false");updateActiveFilters();updateFilterOptionCounts();render()};
  window.addEventListener("resize",()=>requestAnimationFrame(render));
  updateFilterOptionCounts();render();
})();