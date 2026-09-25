(() => {
  const locations = {
    tucson:{id:"LOC-001",name:"Tucson, Arizona",type:"Primary operating location",region:"United States",status:"Established",character:"Gila Monster",characterUrl:"characters/gila-monster/",dossierUrl:"locations/tucson/",note:"Tucson is the established operating city of Gila Monster.",coords:[-110.9747,32.2226],boundary:{service:"places",layer:4,state:"04",name:"Tucson"}},
    chicago:{id:"LOC-002",name:"Chicago, Illinois",type:"Primary operating location",region:"United States",status:"Established",character:"Commotion",characterUrl:"characters/commotion/",dossierUrl:"locations/chicago/",note:"Chicago is the established operating city of Commotion.",coords:[-87.6298,41.8781],boundary:{service:"places",layer:4,state:"17",name:"Chicago"}},
    sanjuan:{id:"LOC-003",name:"San Juan, Puerto Rico",type:"Primary operating location",region:"Puerto Rico",status:"Established",character:"Aftermark",characterUrl:"characters/aftermark/",dossierUrl:"locations/san-juan/",note:"Santurce, San Juan is the established home and operating location of Aftermark.",coords:[-66.1057,18.4655],boundary:{service:"counties",layer:1,state:"72",name:"San Juan"}},
    stdorsey:{id:"LOC-004",name:"St. Dorsey Island",type:"Genesis location",region:"Washington, D.C. area",status:"Established",character:"—",characterUrl:"",dossierUrl:"locations/st-dorsey/",note:"St. Dorsey is a fictional developed island branching from Washington, D.C. into the tidal Potomac. Multiple bridge and highway approaches connect the island to the D.C. road network; Hampton Dynamics occupies the isolated far side of the island.",coords:[-77.0550,38.7550],boundary:{service:"fictional"}},
    baltimore:{id:"LOC-005",name:"Baltimore, Maryland",type:"Primary operating location",region:"United States",status:"Established",character:"Kincast",characterUrl:"characters/kincast/",dossierUrl:"locations/baltimore/",note:"Baltimore is the established home base and primary operating city of Kincast.",coords:[-76.6122,39.2904],boundary:{service:"places",layer:4,state:"24",name:"Baltimore"}},
    washington:{id:"REF-001",name:"Washington, D.C.",type:"Geographic reference",region:"United States",status:"Reference",character:"—",characterUrl:"",dossierUrl:"locations.html",note:"Washington, D.C. is shown to anchor the St. Dorsey corridor.",coords:[-77.0369,38.9072],boundary:{service:"states",layer:2,state:"11",name:"District of Columbia"}}
  };

  // Local-site nodes are intentionally schematic until exact public coordinates exist.
  const stDorseyGeography = {
    island:{type:"Feature",geometry:{type:"Polygon",coordinates:[[[-77.0580,38.8130],[-77.0490,38.8100],[-77.0450,38.7980],[-77.0440,38.7810],[-77.0450,38.7630],[-77.0470,38.7440],[-77.0490,38.7250],[-77.0520,38.7070],[-77.0580,38.6950],[-77.0770,38.6900],[-77.0860,38.6970],[-77.0790,38.7070],[-77.0650,38.7120],[-77.0690,38.7140],[-77.0680,38.7330],[-77.0660,38.7520],[-77.0650,38.7720],[-77.0650,38.7900],[-77.0630,38.8050],[-77.0580,38.8130]]]}},
    bridges:[
      {name:"WEST HIGHWAY",line:{type:"LineString",coordinates:[[-77.0790,38.8240],[-77.0840,38.8170],[-77.0790,38.8090],[-77.0670,38.8040],[-77.0615,38.8010]]}},
      {name:"EAST HIGHWAY",line:{type:"LineString",coordinates:[[-77.0310,38.8240],[-77.0260,38.8170],[-77.0300,38.8080],[-77.0410,38.8020],[-77.0480,38.7990]]}}
    ],
    entrance:[-77.0550,38.8030]
  };

  const landmarks = {
    hampton:{id:"SITE-001",name:"Hampton Dynamics Facility",parent:"stdorsey",type:"Historic research facility",region:"St. Dorsey Island",status:"Genesis strike site",character:"—",characterUrl:"",dossierUrl:"locations/st-dorsey/",note:"The Hampton Dynamics facility struck during Genesis. Its isolated coastal campus occupies the island's large outward-projecting southern tract, far from the primary D.C. approaches.",coords:[-77.0785,38.6975],calloutOffset:[44,28]},
    university:{id:"SITE-002",name:"University of Dorsey",parent:"stdorsey",type:"University",region:"St. Dorsey Island",status:"Established",character:"—",characterUrl:"",dossierUrl:"locations/st-dorsey/",note:"University of Dorsey occupies a separate coastal site on St. Dorsey, well away from Hampton Dynamics.",coords:[-77.0455,38.7705],calloutOffset:[46,-24]}
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

  const boundaryServices={
    places:"https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Places_CouSub_ConCity_SubMCD/MapServer",
    counties:"https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer",
    states:"https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer"
  };
  const boundaryCache={stdorsey:stDorseyGeography.island};
  const boundaryRequests={};

  let width=0,height=0,baseScale=0,space=false,world=null;
  let selectedLocationKey="tucson",selectedLandmarkKey=null;
  let hoveredLocationKey=null,cityViewKey=null;
  const localZoomThreshold=6.5;
  const projection=d3.geoOrthographic().clipAngle(90).precision(.4).rotate([96,-28,0]);
  const path=d3.geoPath(projection);
  const root=svg.append("g");
  root.append("circle").attr("class","earth-halo");
  root.append("path").attr("class","earth-sphere").datum({type:"Sphere"});
  root.append("path").attr("class","earth-grid").datum(d3.geoGraticule10());
  const landPath=root.append("path").attr("class","earth-land");
  const borderPath=root.append("path").attr("class","earth-borders");
  const boundaryLayer=root.append("g").attr("class","city-boundary-layer");
  const boundaryPath=boundaryLayer.append("path").attr("class","city-boundary");
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
    const mode=cityViewKey?"CITY / "+locations[cityViewKey].name.toUpperCase():zoomMode(r);
    zoomReadout.textContent="ZOOM "+r.toFixed(1)+"× // "+mode;
  }

  function loadBoundary(key){
    if(boundaryCache[key])return Promise.resolve(boundaryCache[key]);
    if(boundaryRequests[key])return boundaryRequests[key];
    const item=locations[key],spec=item&&item.boundary;
    if(!spec)return Promise.resolve(null);
    if(spec.service==="fictional"){
      boundaryCache[key]=stDorseyGeography.island;
      return Promise.resolve(boundaryCache[key]);
    }
    const base=boundaryServices[spec.service];
    if(!base)return Promise.resolve(null);
    const where=spec.service==="states"
      ?`STATE='${spec.state}'`
      :`STATE='${spec.state}' AND BASENAME='${spec.name.replace(/'/g,"''")}'`;
    const params=new URLSearchParams({
      where,
      outFields:"*",
      returnGeometry:"true",
      outSR:"4326",
      f:"geojson"
    });
    boundaryRequests[key]=fetch(`${base}/${spec.layer}/query?${params}`)
      .then(r=>r.ok?r.json():Promise.reject(new Error("Boundary request failed")))
      .then(data=>{
        const feature=data&&data.features&&data.features[0]?data.features[0]:null;
        if(feature)boundaryCache[key]=feature;
        delete boundaryRequests[key];
        if(cityViewKey===key||hoveredLocationKey===key)render();
        return feature;
      })
      .catch(()=>{
        delete boundaryRequests[key];
        return null;
      });
    return boundaryRequests[key];
  }

  function renderBoundary(){
    const key=cityViewKey||hoveredLocationKey;
    const feature=key&&boundaryCache[key];
    boundaryLayer.style("display",feature?"":"none").classed("city-view",!!cityViewKey);
    if(feature)boundaryPath.datum(feature).attr("d",path);
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

    renderBoundary();
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
      const g=d3.select(this).attr("transform",p?`translate(${p[0]},${p[1]})`:"translate(-999,-999)").style("display",visible?"":"none");
      const ratio=zoomRatio();
      g.select(".node-pulse").attr("r",ratio>=8?9:13);
      g.select(".node-core").attr("r",ratio>=8?3.5:5);
      g.select("text").style("display",(ratio>=1.7||key===selectedLocationKey)?"":"none").text(item.name.replace(", Arizona","").replace(", Illinois","").replace(", Puerto Rico","").replace(", Maryland",""));
    }).classed("active",d=>d[0]===selectedLocationKey&&!selectedLandmarkKey);

    renderLandmarks();
    updateZoomHud();
  }

  function renderStDorseyGeography(){
    const ratio=zoomRatio();
    const center=locations.stdorsey.coords;
    const front=d3.geoDistance(center,[-projection.rotate()[0],-projection.rotate()[1]])<Math.PI/2;
    const visible=ratio>=5.5&&front;
    fictionLayer.style("display",visible?"":"none");
    if(!visible)return;

    islandPath.attr("d",path);
    const centerPoint=projection(center);
    if(centerPoint) islandLabel.attr("x",centerPoint[0]).attr("y",centerPoint[1]+4).style("display",ratio>=8?"":"none");

    const ep=projection(stDorseyGeography.entrance);
    if(ep) entranceMarker.attr("transform",`translate(${ep[0]},${ep[1]})`).style("display",ratio>=9?"":"none");

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
        g.append("circle").attr("class","landmark-core").attr("r",4);
        g.append("text").attr("class","landmark-label").attr("x",9).attr("y",-7);
        return g;
      },
      update=>update,
      exit=>exit.remove()
    );

    marks.each(function([key,item]){
      const anchor=projection(item.coords||parent.coords);
      if(!anchor)return;
      const g=d3.select(this).attr("transform",`translate(${anchor[0]},${anchor[1]})`);
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
    cityViewKey=null;
    stage.classList.remove("city-view");
    selectLocation(key);
    projection.rotate([-item.coords[0],-item.coords[1],0]);
    const target=key==="stdorsey"?12:7;
    projection.scale(Math.max(projection.scale(),baseScale*target));
    render();
  }

  function cityFitRatio(feature){
    if(!feature||!baseScale)return 45;
    const bounds=d3.geoBounds(feature);
    const midLat=(bounds[0][1]+bounds[1][1])/2;
    const lonSpan=Math.abs(bounds[1][0]-bounds[0][0])*Math.max(.25,Math.cos(midLat*Math.PI/180));
    const latSpan=Math.abs(bounds[1][1]-bounds[0][1]);
    const spanDeg=Math.max(lonSpan,latSpan,.015);
    const desiredPixels=Math.min(width,height)*.72;
    const targetScale=desiredPixels/(spanDeg*Math.PI/180);
    return Math.max(35,Math.min(380,targetScale/baseScale));
  }

  async function enterCityView(key){
    const item=locations[key];if(!item)return;
    selectLocation(key);
    const feature=await loadBoundary(key);
    if(selectedLocationKey!==key)return;
    cityViewKey=key;
    stage.classList.add("city-view");
    let center=item.coords;
    if(feature&&!d3.geoContains(feature,center)){
      const centroid=d3.geoCentroid(feature);
      if(Number.isFinite(centroid[0])&&Number.isFinite(centroid[1]))center=centroid;
    }
    projection.rotate([-center[0],-center[1],0]);
    projection.scale(baseScale*cityFitRatio(feature));
    render();
  }

  function exitCityView(){
    if(!cityViewKey)return;
    cityViewKey=null;
    stage.classList.remove("city-view");
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
    const key=node.dataset.key;
    if(hoveredLocationKey!==key){
      hoveredLocationKey=key;
      loadBoundary(key);
      render();
    }
    showTooltip(event,locations[key].name);
  }).on("mouseout",event=>{
    const from=event.target.closest&&event.target.closest(".location-node");
    const to=event.relatedTarget&&event.relatedTarget.closest?event.relatedTarget.closest(".location-node"):null;
    if(from&&from!==to){
      hoveredLocationKey=null;
      tooltip.classList.remove("show");
      if(!cityViewKey)render();
    }
  }).on("click",event=>{
    const node=event.target.closest(".location-node"); if(node)enterCityView(node.dataset.key);
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
  document.querySelectorAll("[data-location]").forEach(btn=>btn.addEventListener("click",()=>enterCityView(btn.dataset.location)));

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