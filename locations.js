(() => {
  "use strict";

  const locations = {
    tucson: {
      id: "LOC-001",
      name: "Tucson, Arizona",
      shortName: "Tucson",
      type: "Primary operating location",
      region: "United States",
      status: "Established",
      character: "Gila Monster",
      characterUrl: "characters/gila-monster/",
      dossierUrl: "locations/tucson/",
      note: "Tucson is the established operating city of Gila Monster.",
      coords: [-110.9747, 32.2226],
      labelOffset: [11, -10]
    },
    chicago: {
      id: "LOC-002",
      name: "Chicago, Illinois",
      shortName: "Chicago",
      type: "Primary operating location",
      region: "United States",
      status: "Established",
      character: "Commotion",
      characterUrl: "characters/commotion/",
      dossierUrl: "locations/chicago/",
      note: "Chicago is the established operating city of Commotion.",
      coords: [-87.6298, 41.8781],
      labelOffset: [11, -10]
    },
    sanjuan: {
      id: "LOC-003",
      name: "San Juan, Puerto Rico",
      shortName: "San Juan",
      type: "Primary operating location",
      region: "Puerto Rico",
      status: "Established",
      character: "Aftermark",
      characterUrl: "characters/aftermark/",
      dossierUrl: "locations/san-juan/",
      note: "Santurce, San Juan is the established home and operating location of Aftermark.",
      coords: [-66.1057, 18.4655],
      labelOffset: [11, -10]
    },
    stdorsey: {
      id: "LOC-004",
      name: "St. Dorsey Island",
      shortName: "St. Dorsey",
      type: "Genesis location",
      region: "Greater Washington, D.C. area",
      status: "Established / schematic placement",
      character: "—",
      characterUrl: "",
      dossierUrl: "locations/st-dorsey/",
      note: "St. Dorsey is a fictional island associated with the greater Washington, D.C. area. Its globe marker is schematic; exact public coordinates are not established.",
      coords: [-77.0369, 38.9072],
      approximate: true,
      labelOffset: [-72, 18]
    },
    baltimore: {
      id: "LOC-005",
      name: "Baltimore, Maryland",
      shortName: "Baltimore",
      type: "Primary operating location",
      region: "United States",
      status: "Established",
      character: "Kincast",
      characterUrl: "characters/kincast/",
      dossierUrl: "locations/baltimore/",
      note: "Baltimore is the established home base and primary operating city of Kincast.",
      coords: [-76.6122, 39.2904],
      labelOffset: [13, -14]
    }
  };

  const locationKeys = Object.keys(locations);
  const HOME_ROTATION = [96, -28, 0];
  const EARTH_RATIO = 1;
  const SPACE_RATIO = 0.66;
  const FOCUS_RATIO = 1.55;
  const MIN_RATIO = 0.58;
  const MAX_RATIO = 2.2;

  const svgElement = document.querySelector("#techGlobe");
  const stage = document.querySelector("#globeStage");
  if (!svgElement || !stage || typeof d3 === "undefined") return;

  const svg = d3.select(svgElement);
  const loading = document.querySelector("#globeLoading");
  const tooltip = document.querySelector("#globeTooltip");
  const zoomReadout = document.querySelector("#globeZoomReadout");
  const earthViewButton = document.querySelector("#earthView");
  const spaceViewButton = document.querySelector("#spaceView");
  const zoomInButton = document.querySelector("#zoomInGlobe");
  const zoomOutButton = document.querySelector("#zoomOutGlobe");
  const resetButton = document.querySelector("#resetGlobe");
  const locationButtons = [...document.querySelectorAll("[data-location]")];
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  const terminal = {
    id: document.querySelector("#locationId"),
    name: document.querySelector("#locationName"),
    type: document.querySelector("#locationType"),
    character: document.querySelector("#locationCharacter"),
    region: document.querySelector("#locationRegion"),
    status: document.querySelector("#locationStatus"),
    note: document.querySelector("#locationNote"),
    explore: document.querySelector("#locationExplore")
  };

  let width = 0;
  let height = 0;
  let baseScale = 0;
  let world = null;
  let selectedKey = "tucson";
  let mode = "earth";

  const projection = d3.geoOrthographic()
    .clipAngle(90)
    .precision(0.45)
    .rotate(HOME_ROTATION.slice());
  const path = d3.geoPath(projection);

  const root = svg.append("g").attr("class", "globe-root");
  root.append("circle").attr("class", "earth-halo");
  root.append("path").attr("class", "earth-sphere").datum({ type: "Sphere" });
  root.append("path").attr("class", "earth-grid").datum(d3.geoGraticule10());
  const landPath = root.append("path").attr("class", "earth-land");
  const borderPath = root.append("path").attr("class", "earth-borders");
  const nodesLayer = root.append("g").attr("class", "earth-nodes");

  const nodeSelection = nodesLayer
    .selectAll("g.location-node")
    .data(locationKeys.map(key => [key, locations[key]]), d => d[0])
    .join(enter => {
      const g = enter.append("g")
        .attr("class", d => `location-node${d[1].approximate ? " approximate" : ""}`)
        .attr("data-key", d => d[0])
        .attr("role", "button")
        .attr("tabindex", 0)
        .attr("aria-label", d => `Open ${d[1].name}`);

      g.append("circle").attr("class", "node-pulse").attr("r", 13);
      g.append("circle").attr("class", "node-core").attr("r", 5);
      g.append("text").attr("class", "node-label");
      return g;
    });

  function ratio() {
    return baseScale ? projection.scale() / baseScale : EARTH_RATIO;
  }

  function clampRatio(value) {
    return Math.max(MIN_RATIO, Math.min(MAX_RATIO, value));
  }

  function isFrontFacing(coords) {
    const center = [-projection.rotate()[0], -projection.rotate()[1]];
    return d3.geoDistance(coords, center) < Math.PI / 2;
  }

  function updateModeButtons() {
    earthViewButton?.classList.toggle("active", mode === "earth");
    spaceViewButton?.classList.toggle("active", mode === "space");
    stage.classList.toggle("space-view", mode === "space");
  }

  function updateZoomReadout() {
    if (!zoomReadout) return;
    const current = ratio();
    const label = mode === "space" ? "SPACE" : current > 1.25 ? "FOCUSED" : "GLOBAL";
    zoomReadout.textContent = `ZOOM ${current.toFixed(1)}× // ${label}`;
  }

  function fillTerminal(item) {
    if (terminal.id) terminal.id.textContent = item.id;
    if (terminal.name) terminal.name.textContent = item.name;
    if (terminal.type) terminal.type.textContent = item.type;
    if (terminal.region) terminal.region.textContent = item.region;
    if (terminal.status) terminal.status.textContent = item.status;
    if (terminal.note) terminal.note.textContent = item.note;
    if (terminal.explore) terminal.explore.href = item.dossierUrl;

    if (terminal.character) {
      terminal.character.textContent = "";
      if (item.characterUrl) {
        const link = document.createElement("a");
        link.href = item.characterUrl;
        link.textContent = item.character;
        terminal.character.appendChild(link);
      } else {
        terminal.character.textContent = item.character;
      }
    }
  }

  function syncSelectionUI() {
    const item = locations[selectedKey];
    fillTerminal(item);

    locationButtons.forEach(button => {
      const active = button.dataset.location === selectedKey;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    nodeSelection.classed("active", d => d[0] === selectedKey);
  }

  function updateHash(key) {
    const next = `#${key}`;
    if (location.hash === next) return;
    history.replaceState(null, "", next);
  }

  function renderNodes() {
    nodeSelection.each(function([key, item]) {
      const projected = projection(item.coords);
      const visible = Boolean(projected) && isFrontFacing(item.coords);
      const node = d3.select(this);

      node
        .style("display", visible ? null : "none")
        .attr("transform", visible ? `translate(${projected[0]},${projected[1]})` : "translate(-999,-999)");

      node.select(".node-label")
        .text(item.shortName)
        .attr("x", item.labelOffset?.[0] ?? 11)
        .attr("y", item.labelOffset?.[1] ?? -10);
    });
  }

  function render() {
    root.select(".earth-halo")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", projection.scale() * 1.08);

    root.select(".earth-sphere").attr("d", path);
    root.select(".earth-grid").attr("d", path);

    if (world && typeof topojson !== "undefined") {
      landPath.datum(topojson.feature(world, world.objects.land)).attr("d", path);
      borderPath.datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b)).attr("d", path);
    }

    renderNodes();
    updateZoomReadout();
  }

  function resize() {
    const previousRatio = baseScale ? ratio() : (mode === "space" ? SPACE_RATIO : EARTH_RATIO);
    const rect = stage.getBoundingClientRect();
    width = Math.max(320, rect.width);
    height = Math.max(430, rect.height);
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    baseScale = Math.min(width, height) * 0.37;
    projection.translate([width / 2, height / 2]).scale(baseScale * clampRatio(previousRatio));
    render();
  }

  function setScaleRatio(nextRatio) {
    if (!baseScale) return;
    const next = clampRatio(nextRatio);
    projection.scale(baseScale * next);
    mode = next <= SPACE_RATIO + 0.02 ? "space" : "earth";
    updateModeButtons();
    render();
  }

  function setMode(nextMode) {
    mode = nextMode === "space" ? "space" : "earth";
    updateModeButtons();
    setScaleRatio(mode === "space" ? SPACE_RATIO : EARTH_RATIO);
  }

  function focusLocation(key, { updateUrl = true } = {}) {
    const item = locations[key];
    if (!item) return;

    selectedKey = key;
    mode = "earth";
    projection
      .rotate([-item.coords[0], -item.coords[1], 0])
      .scale(baseScale * FOCUS_RATIO);

    syncSelectionUI();
    updateModeButtons();
    if (updateUrl) updateHash(key);
    render();
  }

  function showTooltip(event, item) {
    if (!tooltip) return;
    const stageRect = stage.getBoundingClientRect();
    const x = event.clientX - stageRect.left + 14;
    const y = event.clientY - stageRect.top + 14;
    tooltip.textContent = item.approximate ? `${item.name} · schematic position` : item.name;
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.classList.add("show");
  }

  function hideTooltip() {
    tooltip?.classList.remove("show");
  }

  nodeSelection
    .on("pointerenter pointermove", (event, [, item]) => showTooltip(event, item))
    .on("pointerleave", hideTooltip)
    .on("click", (event, [key]) => {
      event.stopPropagation();
      hideTooltip();
      focusLocation(key);
    })
    .on("keydown", (event, [key]) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      focusLocation(key);
    });

  svg.call(d3.drag()
    .filter(event => event.button === undefined || event.button === 0)
    .on("start", () => stage.classList.add("is-dragging"))
    .on("drag", event => {
      const current = projection.rotate();
      const sensitivity = 72 / Math.max(1, projection.scale());
      projection.rotate([
        current[0] + event.dx * sensitivity,
        Math.max(-80, Math.min(80, current[1] - event.dy * sensitivity)),
        0
      ]);
      render();
    })
    .on("end", () => stage.classList.remove("is-dragging"))
  );

  svg.on("wheel", event => {
    event.preventDefault();
    const factor = event.deltaY > 0 ? 0.9 : 1.1;
    setScaleRatio(ratio() * factor);
  }, { passive: false });

  earthViewButton?.addEventListener("click", () => setMode("earth"));
  spaceViewButton?.addEventListener("click", () => setMode("space"));
  zoomInButton?.addEventListener("click", () => setScaleRatio(ratio() * 1.2));
  zoomOutButton?.addEventListener("click", () => setScaleRatio(ratio() / 1.2));
  resetButton?.addEventListener("click", () => {
    selectedKey = "tucson";
    mode = "earth";
    projection.rotate(HOME_ROTATION.slice()).scale(baseScale * EARTH_RATIO);
    syncSelectionUI();
    updateModeButtons();
    updateHash("tucson");
    render();
  });

  locationButtons.forEach(button => {
    button.addEventListener("click", () => focusLocation(button.dataset.location));
  });

  window.addEventListener("hashchange", () => {
    const key = location.hash.replace("#", "");
    if (locations[key]) focusLocation(key, { updateUrl: false });
  });

  window.addEventListener("resize", () => requestAnimationFrame(resize));

  if (reduceMotion) stage.classList.add("reduce-motion");
  resize();

  const initialKey = location.hash.replace("#", "");
  if (locations[initialKey]) {
    focusLocation(initialKey, { updateUrl: false });
  } else {
    syncSelectionUI();
    updateModeButtons();
    render();
  }

  fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
    .then(response => response.ok ? response.json() : Promise.reject(new Error("World atlas request failed")))
    .then(data => {
      world = data;
      if (loading) loading.hidden = true;
      render();
    })
    .catch(() => {
      if (loading) loading.textContent = "EARTH OUTLINE ONLINE · MAP DETAIL UNAVAILABLE";
      render();
    });
})();
