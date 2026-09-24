(() => {
  const locations = {
    tucson:{id:"LOC-001",name:"Tucson, Arizona",type:"Primary operating location",region:"United States",status:"Established",character:"Gila Monster",characterUrl:"characters/gila-monster/",note:"Tucson is the established operating city of Gila Monster.",coords:[-110.9747,32.2226]},
    chicago:{id:"LOC-002",name:"Chicago, Illinois",type:"Primary operating location",region:"United States",status:"Established",character:"Commotion",characterUrl:"characters/commotion/",note:"Chicago is the established operating city of Commotion.",coords:[-87.6298,41.8781]},
    sanjuan:{id:"LOC-003",name:"San Juan, Puerto Rico",type:"Primary operating location",region:"Puerto Rico",status:"Established",character:"Aftermark",characterUrl:"characters/aftermark/",note:"Santurce, San Juan is the established home and operating location of Aftermark.",coords:[-66.1057,18.4655]},
    stdorsey:{id:"LOC-004",name:"St. Dorsey Island",type:"Genesis location",region:"Washington, D.C. area",status:"Established",character:"—",characterUrl:"",note:"Map placement is approximate. St. Dorsey is established as a Washington, D.C.-area island; exact public coordinates are not established.",coords:[-77.0369,38.9072]}
  };

  const svg=d3.select("#techGlobe");
  const stage=document.querySelector("#globeStage");
  const loading=document.querySelector("#globeLoading");
  const tooltip=document.querySelector("#globeTooltip");
  const terminal={
    id:document.querySelector("#locationId"),name:document.querySelector("#locationName"),
    type:document.querySelector("#locationType"),character:document.querySelector("#locationCharacter"),
    region:document.querySelector("#locationRegion"),status:document.querySelector("#locationStatus"),
    note:document.querySelector("#locationNote")
  };

  let width=0,height=0,baseScale=0,space=false,world=null;
  const projection=d3.geoOrthographic().clipAngle(90).precision(.4).rotate([96,-28,0]);
  const path=d3.geoPath(projection);
  const root=svg.append("g");
  root.append("circle").attr("class","earth-halo");
  root.append("path").attr("class","earth-sphere").datum({type:"Sphere"});
  root.append("path").attr("class","earth-grid").datum(d3.geoGraticule10());
  const landPath=root.append("path").attr("class","earth-land");
  const borderPath=root.append("path").attr("class","earth-borders");
  const nodesLayer=root.append("g").attr("class","earth-nodes");

  function resize(){
    const rect=stage.getBoundingClientRect();
    width=Math.max(320,rect.width);
    height=Math.max(430,rect.height);
    svg.attr("viewBox",`0 0 ${width} ${height}`);
    baseScale=Math.min(width,height)*.37;
    projection.translate([width/2,height/2]).scale(baseScale*(space?.63:1));
    render();
  }

  function render(){
    root.select(".earth-halo")
      .attr("cx",width/2).attr("cy",height/2)
      .attr("r",projection.scale()*1.08);
    root.select(".earth-sphere").attr("d",path);
    root.select(".earth-grid").attr("d",path);
    if(world){
      landPath.datum(topojson.feature(world,world.objects.land)).attr("d",path);
      borderPath.datum(topojson.mesh(world,world.objects.countries,(a,b)=>a!==b)).attr("d",path);
    }
    const data=Object.entries(locations);
    const points=nodesLayer.selectAll("g.location-node").data(data,d=>d[0]).join(enter=>{
      const g=enter.append("g").attr("class","location-node").attr("data-key",d=>d[0]);
      g.append("circle").attr("class","node-pulse").attr("r",13);
      g.append("circle").attr("class","node-core").attr("r",5);
      g.append("text").attr("class","node-label").attr("x",10).attr("y",-9);
      return g;
    });
    points.each(function([key,item]){
      const p=projection(item.coords);
      const visible=d3.geoDistance(item.coords,[-projection.rotate()[0],-projection.rotate()[1]])<Math.PI/2;
      d3.select(this).attr("transform",p?`translate(${p[0]},${p[1]})`:"translate(-999,-999)").style("display",visible?"":"none");
      d3.select(this).select("text").text(item.name.replace(", Arizona","").replace(", Illinois","").replace(", Puerto Rico",""));
    });
  }

  function selectLocation(key){
    const item=locations[key]; if(!item)return;
    terminal.id.textContent=item.id;
    terminal.name.textContent=item.name;
    terminal.type.textContent=item.type;
    terminal.region.textContent=item.region;
    terminal.status.textContent=item.status;
    terminal.note.textContent=item.note;
    terminal.character.innerHTML=item.characterUrl?`<a href="${item.characterUrl}">${item.character}</a>`:item.character;
    document.querySelectorAll("[data-location]").forEach(b=>b.classList.toggle("active",b.dataset.location===key));
    nodesLayer.selectAll(".location-node").classed("active",d=>d[0]===key);
  }

  nodesLayer.on("mousemove",event=>{
    const node=event.target.closest(".location-node"); if(!node)return;
    const item=locations[node.dataset.key];
    tooltip.textContent=item.name;
    tooltip.style.left=(event.offsetX+16)+"px";
    tooltip.style.top=(event.offsetY+12)+"px";
    tooltip.classList.add("show");
  }).on("mouseleave",()=>tooltip.classList.remove("show"))
    .on("click",event=>{
      const node=event.target.closest(".location-node"); if(node)selectLocation(node.dataset.key);
    });

  svg.call(d3.drag().on("drag",event=>{
    const r=projection.rotate();
    const k=75/projection.scale();
    projection.rotate([r[0]+event.dx*k,r[1]-event.dy*k,r[2]]);
    render();
  }));

  svg.on("wheel",event=>{
    event.preventDefault();
    const min=baseScale*.48,max=baseScale*1.65;
    projection.scale(Math.max(min,Math.min(max,projection.scale()*(event.deltaY>0?.92:1.08))));
    render();
  },{passive:false});

  function setView(isSpace){
    space=isSpace;
    document.querySelector("#earthView").classList.toggle("active",!space);
    document.querySelector("#spaceView").classList.toggle("active",space);
    stage.classList.toggle("space-view",space);
    projection.scale(baseScale*(space?.63:1));
    render();
  }
  document.querySelector("#earthView").addEventListener("click",()=>setView(false));
  document.querySelector("#spaceView").addEventListener("click",()=>setView(true));
  document.querySelector("#resetGlobe").addEventListener("click",()=>{
    projection.rotate([96,-28,0]);
    setView(false);
    selectLocation("tucson");
  });
  document.querySelectorAll("[data-location]").forEach(btn=>btn.addEventListener("click",()=>{
    selectLocation(btn.dataset.location);
    const item=locations[btn.dataset.location];
    projection.rotate([-item.coords[0],-item.coords[1],0]);
    render();
  }));

  fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
    .then(r=>r.json()).then(data=>{world=data;loading.hidden=true;render();})
    .catch(()=>{loading.textContent="EARTH OUTLINE ONLINE · MAP DETAIL UNAVAILABLE";render();});

  window.addEventListener("resize",resize);
  resize();
  selectLocation("tucson");
})();