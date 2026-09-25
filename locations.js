(() => {
  const locations = {
    tucson:{id:"LOC-001",name:"Tucson, Arizona",type:"Primary operating location",region:"United States",status:"Established",character:"Gila Monster",characterUrl:"characters/gila-monster/",dossierUrl:"locations/tucson/",note:"Tucson is the established operating city of Gila Monster.",coords:[-110.9747,32.2226]},
    chicago:{id:"LOC-002",name:"Chicago, Illinois",type:"Primary operating location",region:"United States",status:"Established",character:"Commotion",characterUrl:"characters/commotion/",dossierUrl:"locations/chicago/",note:"Chicago is the established operating city of Commotion.",coords:[-87.6298,41.8781]},
    sanjuan:{id:"LOC-003",name:"San Juan, Puerto Rico",type:"Primary operating location",region:"Puerto Rico",status:"Established",character:"Aftermark",characterUrl:"characters/aftermark/",dossierUrl:"locations/san-juan/",note:"Santurce, San Juan is the established home and operating location of Aftermark.",coords:[-66.1057,18.4655]},
    stdorsey:{id:"LOC-004",name:"St. Dorsey Island",type:"Genesis location",region:"Washington, D.C. area",status:"Established",character:"—",characterUrl:"",dossierUrl:"locations/st-dorsey/",note:"St. Dorsey is a fictional developed island branching from Washington, D.C. into the tidal Potomac. Multiple bridge and highway approaches connect the island to the D.C. road network; Hampton Dynamics occupies the isolated far side of the island.",coords:[-77.0550,38.8330]},
    baltimore:{id:"LOC-005",name:"Baltimore, Maryland",type:"Primary operating location",region:"United States",status:"Established",character:"Kincast",characterUrl:"characters/kincast/",dossierUrl:"locations/baltimore/",note:"Baltimore is the established home base and primary operating city of Kincast.",coords:[-76.6122,39.2904]},
    washington:{id:"REF-001",name:"Washington, D.C.",type:"Geographic reference",region:"United States",status:"Reference",character:"—",characterUrl:"",dossierUrl:"locations.html",note:"Washington, D.C. is shown to anchor the St. Dorsey corridor.",coords:[-77.0369,38.9072]}
  };

  // Local-site nodes are intentionally schematic until exact public coordinates exist.
  const stDorseyGeography = {
    island:{type:"Feature",geometry:{type:"Polygon",coordinates:[[[-77.0510,38.8910],[-77.0400,38.8870],[-77.0340,38.8770],[-77.0320,38.8610],[-77.0340,38.8440],[-77.0380,38.8270],[-77.0440,38.8100],[-77.0510,38.7930],[-77.0600,38.7790],[-77.0730,38.7720],[-77.0970,38.7700],[-77.1120,38.7790],[-77.1060,38.7900],[-77.0900,38.7950],[-77.0870,38.7940],[-77.0820,38.8110],[-77.0750,38.8280],[-77.0690,38.8450],[-77.0640,38.8620],[-77.0610,38.8770],[-77.0570,38.8870],[-77.0510,38.8910]]]}},
    bridges:[
      {name:"WEST HIGHWAY",line:{type:"LineString",coordinates:[[-77.0610,38.8990],[-77.0750,38.8960],[-77.0800,38.8880],[-77.0750,38.8780],[-77.0630,38.8710]]}},
      {name:"EAST HIGHWAY",line:{type:"LineString",coordinates:[[-77.0300,38.8980],[-77.0160,38.8940],[-77.0110,38.8850],[-77.0180,38.8740],[-77.0350,38.8620]]}}
    ],
    entrance:[-77.0500,38.8830]
  };

  const landmarks = {
    hampton:{id:"SITE-001",name:"Hampton Dynamics Facility",parent:"stdorsey",type:"Historic research facility",region:"St. Dorsey Island",status:"Genesis strike site",character:"—",characterUrl:"",dossierUrl:"locations/st-dorsey/",note:"The Hampton Dynamics facility struck during Genesis. Its isolated coastal campus occupies the island's large outward-projecting southern tract, far from the primary D.C. approaches.",coords:[-77.1010,38.7810],calloutOffset:[44,28]},
    university:{id:"SITE-002",name:"University of Dorsey",parent:"stdorsey",type:"University",region:"St. Dorsey Island",status:"Established",character:"—",characterUrl:"",dossierUrl:"locations/st-dorsey/",note:"University of Dorsey occupies a separate coastal site on St. Dorsey, well away from Hampton Dynamics.",coords:[-77.0335,38.8460],calloutOffset:[46,-24]}
  };

  const svg=d3.select("#techGlobe");
  const stage=document.querySelector("#globeStage");
  const loading=document.querySelector("#globeLoading");
  const tooltip=document.querySelector("#globeTooltip");
  const zoomReadout=document.querySelector("#globeZoomReadout");
  const terminal={
    id:document.querySelector("#locationId"),name:document.querySelector("#locationName"),
    type:document.querySelector("#locationType"),character:document.querySelector("#locationCharacter"),
    region:document.querySelector("#locationRegion"),status:document.querySelector("#locationStatus"),
    note:document.querySelector("#locationNote"),explore:document.querySelector("#locationExplore")
  };

  let width=0,height=0,baseScale=0,space=false,world=null;
  let selectedLocationKey="tucson",selectedLandmarkKey=null;
  const localZoomThreshold=6.5;
  const projection=d3.geoOrthographic().clipAngle(90).precision(.4).rotate([96,-28,0]);
  const path=d3.geoPath(projection);
  const root=svg.append("g");
  root.append("circle").attr("class","earth-halo");
  root.append("path").attr("class","earth-sphere").datum({type:"Sphere"});
  root.append("path").attr("class","earth-grid").datum(d3.geoGraticule10());
  const landPath=root.append("path").attr("class","earth-land");
  const borderPath=root.append("path").attr("class","earth-borders");
  const fictionLayer=root.append("g").attr("class","fiction-geography");
  const islandPath=fictionLayer.append("path").attr("class","st-dorsey-island").datum(stDorseyGeography.island);
  const bridgeLayer=fictionLayer.append("g").attr("class","st-dorsey-bridges");
  const islandLabel=fictionLayer.append("text").attr("class","st-dorsey-label").text("ST. DORSEY");
  const entranceMarker=fictionLayer.append("g").attr("class","st-dorsey-entrance");
  entranceMarker.append("circle").attr("r",3.5);
  entranceMarker.append("text").attr("x",8).attr("y",-7).text("D.C. ENTRANCE");
  const nodesLayer=root.append("g").attr("class","earth-nodes");
  const landmarkLayer=root.append("g").attr("class","earth-landmarks");

  function zoomRatio(){return baseScale?projection.scale()/baseScale:1}
  function zoomMode(r=zoomRatio()){return r>=22?"SITE":r>=8?"LOCAL":r>=2.5?"REGIONAL":"GLOBAL"}
  function updateZoomHud(){
    if(!zoomReadout)return;
    const r=zoomRatio();
    zoomReadout.textContent="ZOOM "+r.toFixed(1)+"× // "+zoomMode(r);
  }

  function resize(){
    const priorRatio=baseScale?zoomRatio():(space?.63:1);
    const rect=stage.getBoundingClientRect();
    width=Math.max(320,rect.width);
    height=Math.max(430,rect.height);
    svg.attr("viewBox",`0 0 ${width} ${height}`);
    baseScale=Math.min(width,height)*.37;
    const target=Math.max(baseScale*.45,Math.min(baseScale*55,baseScale*priorRatio));
    projection.translate([width/2,height/2]).scale(target);
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

    renderStDorseyGeography();

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
      d3.select(this).select("text").text(item.name.replace(", Arizona","").replace(", Illinois","").replace(", Puerto Rico","").replace(", Maryland",""));
    }).classed("active",d=>d[0]===selectedLocationKey&&!selectedLandmarkKey);

    renderLandmarks();
    updateZoomHud();
  }

  function renderStDorseyGeography(){
    const ratio=zoomRatio();
    const center=locations.stdorsey.coords;
    const front=d3.geoDistance(center,[-projection.rotate()[0],-projection.rotate()[1]])<Math.PI/2;
    const visible=ratio>=3.15&&front;
    fictionLayer.style("display",visible?"":"none");
    if(!visible)return;

    islandPath.attr("d",path);
    const centerPoint=projection(center);
    if(centerPoint) islandLabel.attr("x",centerPoint[0]).attr("y",centerPoint[1]+4);

    const ep=projection(stDorseyGeography.entrance);
    if(ep) entranceMarker.attr("transform",`translate(${ep[0]},${ep[1]})`);

    bridgeLayer.selectAll("g.st-dorsey-bridge").data(stDorseyGeography.bridges,d=>d.name).join(enter=>{
      const g=enter.append("g").attr("class","st-dorsey-bridge");
      g.append("path").attr("class","st-dorsey-bridge-line");
      g.append("text").attr("class","st-dorsey-bridge-label");
      return g;
    }).each(function(item){
      const g=d3.select(this);
      g.select("path").datum(item.line).attr("d",path);
      const mid=d3.geoInterpolate(item.line.coordinates[0],item.line.coordinates[1])(.56);
      const mp=projection(mid);
      if(mp)g.select("text").attr("x",mp[0]).attr("y",mp[1]-5).text(item.name);
    });
  }

  function renderLandmarks(){
    const ratio=zoomRatio();
    const parent=locations[selectedLocationKey];
    const parentPoint=parent?projection(parent.coords):null;
    const parentVisible=parent&&d3.geoDistance(parent.coords,[-projection.rotate()[0],-projection.rotate()[1]])<Math.PI/2;
    const visible=ratio>=localZoomThreshold&&parent&&parentPoint&&parentVisible;
    const data=visible?Object.entries(landmarks).filter(([,item])=>item.parent===selectedLocationKey):[];

    const marks=landmarkLayer.selectAll("g.landmark-node").data(data,d=>d[0]).join(
      enter=>{
        const g=enter.append("g").attr("class","landmark-node").attr("data-landmark",d=>d[0]);
        g.append("circle").attr("class","landmark-anchor").attr("r",2.5);
        g.append("line").attr("class","landmark-link");
        g.append("rect").attr("class","landmark-core").attr("x",-4).attr("y",-4).attr("width",8).attr("height",8).attr("rx",1.5);
        g.append("text").attr("class","landmark-label").attr("x",10).attr("y",-8);
        return g;
      },
      update=>update,
      exit=>exit.remove()
    );

    marks.each(function([key,item]){
      const anchor=projection(item.coords||parent.coords);
      if(!anchor)return;
      const multiplier=Math.min(1.45,.82+ratio*.07);
      const offset=item.calloutOffset||[48,30];
      const dx=offset[0]*multiplier,dy=offset[1]*multiplier;
      const x=anchor[0]+dx,y=anchor[1]+dy;
      const g=d3.select(this).attr("transform",`translate(${x},${y})`);
      g.select(".landmark-anchor").attr("cx",-dx).attr("cy",-dy);
      g.select(".landmark-link").attr("x1",-dx).attr("y1",-dy).attr("x2",0).attr("y2",0);
      g.select(".landmark-label").text(item.name);
      g.classed("active",selectedLandmarkKey===key);
    });
  }

  function fillTerminal(item){
    terminal.id.textContent=item.id;
    terminal.name.textContent=item.name;
    terminal.type.textContent=item.type;
    terminal.region.textContent=item.region;
    terminal.status.textContent=item.status;
    terminal.note.textContent=item.note;
    if(terminal.explore) terminal.explore.href=item.dossierUrl;
    terminal.character.innerHTML=item.characterUrl?`<a href="${item.characterUrl}">${item.character}</a>`:item.character;
  }

  function selectLocation(key){
    const item=locations[key]; if(!item)return;
    selectedLocationKey=key;
    selectedLandmarkKey=null;
    fillTerminal(item);
    document.querySelectorAll("[data-location]").forEach(b=>b.classList.toggle("active",b.dataset.location===key));
    render();
  }

  function selectLandmark(key){
    const item=landmarks[key]; if(!item)return;
    selectedLocationKey=item.parent;
    selectedLandmarkKey=key;
    fillTerminal(item);
    document.querySelectorAll("[data-location]").forEach(b=>b.classList.toggle("active",b.dataset.location===item.parent));
    render();
  }

  function focusLocation(key){
    const item=locations[key];if(!item)return;
    selectLocation(key);
    projection.rotate([-item.coords[0],-item.coords[1],0]);
    const target=key==="stdorsey"?12:7;
    projection.scale(Math.max(projection.scale(),baseScale*target));
    render();
  }

  function showTooltip(event,text){
    tooltip.textContent=text;
    tooltip.style.left=(event.offsetX+16)+"px";
    tooltip.style.top=(event.offsetY+12)+"px";
    tooltip.classList.add("show");
  }

  nodesLayer.on("mousemove",event=>{
    const node=event.target.closest(".location-node"); if(!node)return;
    showTooltip(event,locations[node.dataset.key].name);
  }).on("mouseleave",()=>tooltip.classList.remove("show"))
    .on("click",event=>{
      const node=event.target.closest(".location-node"); if(node)selectLocation(node.dataset.key);
    });

  landmarkLayer.on("mousemove",event=>{
    const node=event.target.closest(".landmark-node");if(!node)return;
    showTooltip(event,landmarks[node.dataset.landmark].name+" · local site");
  }).on("mouseleave",()=>tooltip.classList.remove("show"))
    .on("click",event=>{
      const node=event.target.closest(".landmark-node");if(node)selectLandmark(node.dataset.landmark);
    });

  svg.call(d3.drag().on("drag",event=>{
    const r=projection.rotate();
    const k=75/projection.scale();
    projection.rotate([r[0]+event.dx*k,r[1]-event.dy*k,r[2]]);
    render();
  }));

  function applyZoom(factor){
    const min=baseScale*.45,max=baseScale*55;
    projection.scale(Math.max(min,Math.min(max,projection.scale()*factor)));
    render();
  }

  svg.on("wheel",event=>{
    event.preventDefault();
    applyZoom(event.deltaY>0?.82:1.22);
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
  document.querySelector("#zoomInGlobe").addEventListener("click",()=>applyZoom(1.65));
  document.querySelector("#zoomOutGlobe").addEventListener("click",()=>applyZoom(.61));
  document.querySelector("#resetGlobe").addEventListener("click",()=>{
    projection.rotate([96,-28,0]);
    setView(false);
    selectLocation("tucson");
  });
  document.querySelectorAll("[data-location]").forEach(btn=>btn.addEventListener("click",()=>focusLocation(btn.dataset.location)));

  fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json")
    .then(r=>r.json()).then(data=>{world=data;loading.hidden=true;render();})
    .catch(()=>{loading.textContent="EARTH OUTLINE ONLINE · MAP DETAIL UNAVAILABLE";render();});

  window.addEventListener("resize",resize);
  resize();
  const initialKey=location.hash.replace("#","");
  if(locations[initialKey]){
    focusLocation(initialKey);
  }else{
    selectLocation("tucson");
  }
})();