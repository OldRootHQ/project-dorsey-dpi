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
      characters: [{ name: "Gila Monster", url: "characters/gila-monster/", role: "Hero" }],
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
      characters: [{ name: "Commotion", url: "characters/commotion/", role: "Hero" }],
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
      characters: [{ name: "Aftermark", url: "characters/aftermark/", role: "Hero" }],
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
      characters: [],
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
      character: "Kincast · Anchorage",
      characterUrl: "",
      characters: [
        { name: "Kincast", url: "characters/kincast/", role: "Hero" },
        { name: "Anchorage", url: "characters/anchorage/", role: "Villain" }
      ],
      dossierUrl: "locations/baltimore/",
      note: "Baltimore is the established home base and primary operating city of Kincast and an established operating city of Anchorage.",
      coords: [-76.6122, 39.2904],
      labelOffset: [13, -14]
    },
    washington: {
      id: "REF-001",
      name: "Washington, D.C.",
      shortName: "Washington, D.C.",
      type: "Geographic reference",
      region: "United States",
      status: "Reference",
      character: "—",
      characterUrl: "",
      characters: [],
      dossierUrl: "",
      note: "Washington, D.C. is shown as a geographic reference for the greater D.C. cluster and St. Dorsey's schematic placement.",
      coords: [-77.0369, 38.9072],
      reference: true,
      labelOffset: [12, 18]
    }
  };

  const locationKeys = Object.keys(locations);
  const HOME_ROTATION = [96, -28, 0];
  const EARTH_RATIO = 1;
  const SPACE_RATIO = 0.66;
  const FOCUS_RATIO = 1.55;
  const MIN_RATIO = 0.58;
  const MAX_RATIO = 2.2;
  const CLUSTER_DISTANCE = 34;

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
  const clusterPanel = document.querySelector("#globeClusterPanel");
  const clusterCounter = document.querySelector("#clusterCounter");
  const clusterCurrent = document.querySelector("#clusterCurrent");
  const clusterOptions = document.querySelector("#clusterOptions");
  const clusterPrevButton = document.querySelector("#clusterPrev");
  const clusterNextButton = document.querySelector("#clusterNext");
  const clusterCloseButton = document.querySelector("#clusterClose");
  const locationButtons = [...document.querySelectorAll("[data-location]")];
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  const terminal = {
    id: document.querySelector("#locationId"),
    name: document.querySelector("#locationName"),
    type: document.querySelector("#locationType"),
    character: document.querySelector("#locationCharacter"),
    characterLabel: document.querySelector("#locationCharacterLabel"),
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
  let activeClusterKeys = [];
  let clusterCursor = 0;
  let lastClusterWheelAt = 0;

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
  const clusterLayer = root.append("g").attr("class", "earth-clusters");

  const nodeSelection = nodesLayer
    .selectAll("g.location-node")
    .data(locationKeys.map(key => [key, locations[key]]), d => d[0])
    .join(enter => {
      const g = enter.append("g")
        .attr("class", d => `location-node${d[1].approximate ? " approximate" : ""}${d[1].reference ? " reference" : ""}`)
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

  function visibleProjectedLocations() {
    return locationKeys
      .map(key => {
        const item = locations[key];
        const projected = projection(item.coords);
        if (!projected || !isFrontFacing(item.coords)) return null;
        return { key, item, x: projected[0], y: projected[1] };
      })
      .filter(Boolean);
  }

  function buildClusters(points) {
    const visited = new Set();
    const clusters = [];

    points.forEach(point => {
      if (visited.has(point.key)) return;
      const queue = [point];
      const members = [];
      visited.add(point.key);

      while (queue.length) {
        const current = queue.shift();
        members.push(current);

        points.forEach(candidate => {
          if (visited.has(candidate.key)) return;
          const dx = current.x - candidate.x;
          const dy = current.y - candidate.y;
          if (Math.hypot(dx, dy) <= CLUSTER_DISTANCE) {
            visited.add(candidate.key);
            queue.push(candidate);
          }
        });
      }

      if (members.length > 1) {
        clusters.push({
          keys: members.map(member => member.key),
          x: members.reduce((sum, member) => sum + member.x, 0) / members.length,
          y: members.reduce((sum, member) => sum + member.y, 0) / members.length
        });
      }
    });

    return clusters;
  }

  function sameClusterKeys(a, b) {
    return a.length === b.length && a.every(key => b.includes(key));
  }

  function closeClusterPanel() {
    activeClusterKeys = [];
    clusterCursor = 0;
    if (clusterPanel) clusterPanel.hidden = true;
  }

  function positionClusterPanel(cluster) {
    if (!clusterPanel || clusterPanel.hidden) return;
    const panelWidth = Math.min(300, Math.max(240, width - 24));
    const panelHeight = 250;
    const left = Math.max(12, Math.min(width - panelWidth - 12, cluster.x + 22));
    const top = Math.max(12, Math.min(height - panelHeight - 12, cluster.y - 54));
    clusterPanel.style.left = `${left}px`;
    clusterPanel.style.top = `${top}px`;
  }

  function renderClusterPanel() {
    if (!clusterPanel || !activeClusterKeys.length) return;

    clusterCursor = ((clusterCursor % activeClusterKeys.length) + activeClusterKeys.length) % activeClusterKeys.length;
    const currentKey = activeClusterKeys[clusterCursor];
    const currentItem = locations[currentKey];

    if (clusterCounter) {
      clusterCounter.textContent = `${clusterCursor + 1} / ${activeClusterKeys.length} · NEARBY`;
    }
    if (clusterCurrent) clusterCurrent.textContent = currentItem.name;

    if (clusterOptions) {
      clusterOptions.textContent = "";
      activeClusterKeys.forEach((key, index) => {
        const item = locations[key];
        const button = document.createElement("button");
        button.type = "button";
        button.className = "cluster-option";
        button.setAttribute("role", "option");
        button.setAttribute("aria-selected", String(index === clusterCursor));
        button.dataset.clusterLocation = key;

        const number = document.createElement("span");
        number.textContent = String(index + 1).padStart(2, "0");
        const copy = document.createElement("span");
        const title = document.createElement("b");
        title.textContent = item.shortName;
        const detail = document.createElement("small");
        detail.textContent = item.reference ? "Geographic reference" : item.approximate ? "Schematic placement" : item.region;
        copy.append(title, detail);
        button.append(number, copy);
        button.addEventListener("click", () => selectClusterIndex(index));
        clusterOptions.appendChild(button);
      });
    }
  }

  function selectClusterIndex(index, { updateUrl = true } = {}) {
    if (!activeClusterKeys.length) return;
    clusterCursor = ((index % activeClusterKeys.length) + activeClusterKeys.length) % activeClusterKeys.length;
    selectedKey = activeClusterKeys[clusterCursor];
    syncSelectionUI();
    if (updateUrl) updateHash(selectedKey);
    renderClusterPanel();
    render();
  }

  function cycleCluster(step) {
    selectClusterIndex(clusterCursor + step);
  }

  function openCluster(cluster) {
    activeClusterKeys = cluster.keys.slice();
    const selectedIndex = activeClusterKeys.indexOf(selectedKey);
    clusterCursor = selectedIndex >= 0 ? selectedIndex : 0;
    if (clusterPanel) {
      clusterPanel.hidden = false;
      clusterPanel.dataset.clusterKeys = activeClusterKeys.join(",");
    }
    selectClusterIndex(clusterCursor);
    renderClusterPanel();
    positionClusterPanel(cluster);
    clusterPanel?.focus({ preventScroll: true });
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
    if (terminal.explore) {
      const hasDossier = Boolean(item.dossierUrl);
      terminal.explore.hidden = !hasDossier;
      if (hasDossier) terminal.explore.href = item.dossierUrl;
      else terminal.explore.removeAttribute("href");
    }

    if (terminal.character) {
      terminal.character.textContent = "";
      const knownCharacters = Array.isArray(item.characters) ? item.characters : [];
      if (terminal.characterLabel) {
        terminal.characterLabel.textContent = knownCharacters.length === 1 ? "Known character" : "Known characters";
      }
      if (knownCharacters.length) {
        knownCharacters.forEach((character, index) => {
          if (index) terminal.character.appendChild(document.createTextNode(" · "));
          const link = document.createElement("a");
          link.href = character.url;
          link.textContent = character.name;
          link.setAttribute("data-character-role", character.role || "");
          terminal.character.appendChild(link);
        });
      } else if (item.characterUrl) {
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
    const points = visibleProjectedLocations();
    const clusters = buildClusters(points);
    const clusteredKeys = new Set(clusters.flatMap(cluster => cluster.keys));
    const pointMap = new Map(points.map(point => [point.key, point]));

    nodeSelection.each(function([key, item]) {
      const point = pointMap.get(key);
      const visible = Boolean(point) && !clusteredKeys.has(key);
      const node = d3.select(this);

      node
        .style("display", visible ? null : "none")
        .attr("transform", visible ? `translate(${point.x},${point.y})` : "translate(-999,-999)");

      node.select(".node-label")
        .text(item.shortName)
        .attr("x", item.labelOffset?.[0] ?? 11)
        .attr("y", item.labelOffset?.[1] ?? -10);
    });

    const clusterSelection = clusterLayer
      .selectAll("g.location-cluster")
      .data(clusters, cluster => cluster.keys.join("|"))
      .join(
        enter => {
          const g = enter.append("g")
            .attr("class", "location-cluster")
            .attr("role", "button")
            .attr("tabindex", 0);
          g.append("circle").attr("class", "cluster-hit").attr("r", 25);
          g.append("circle").attr("class", "cluster-pulse").attr("r", 19);
          g.append("circle").attr("class", "cluster-core").attr("r", 12);
          g.append("text").attr("class", "cluster-count").attr("text-anchor", "middle").attr("dy", "0.34em");
          g.append("text").attr("class", "cluster-label").attr("x", 18).attr("y", -13).text("NEARBY");
          return g;
        },
        update => update,
        exit => exit.remove()
      )
      .attr("transform", cluster => `translate(${cluster.x},${cluster.y})`)
      .attr("data-keys", cluster => cluster.keys.join(","))
      .attr("aria-label", cluster => `${cluster.keys.length} nearby locations: ${cluster.keys.map(key => locations[key].name).join(", ")}`)
      .classed("active", cluster => cluster.keys.includes(selectedKey));

    clusterSelection.select(".cluster-count").text(cluster => cluster.keys.length);

    clusterSelection
      .on("click", (event, cluster) => {
        event.stopPropagation();
        hideTooltip();
        openCluster(cluster);
      })
      .on("keydown", (event, cluster) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        openCluster(cluster);
      });

    if (activeClusterKeys.length) {
      const active = clusters.find(cluster => sameClusterKeys(cluster.keys, activeClusterKeys));
      if (active) {
        activeClusterKeys = active.keys.slice();
        const selectedIndex = activeClusterKeys.indexOf(selectedKey);
        if (selectedIndex >= 0) clusterCursor = selectedIndex;
        renderClusterPanel();
        positionClusterPanel(active);
      } else {
        closeClusterPanel();
      }
    }
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
    closeClusterPanel();
    mode = nextMode === "space" ? "space" : "earth";
    updateModeButtons();
    setScaleRatio(mode === "space" ? SPACE_RATIO : EARTH_RATIO);
  }

  function focusLocation(key, { updateUrl = true } = {}) {
    const item = locations[key];
    if (!item) return;

    closeClusterPanel();
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
    .on("start", () => {
      closeClusterPanel();
      stage.classList.add("is-dragging");
    })
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
    closeClusterPanel();
    selectedKey = "tucson";
    mode = "earth";
    projection.rotate(HOME_ROTATION.slice()).scale(baseScale * EARTH_RATIO);
    syncSelectionUI();
    updateModeButtons();
    updateHash("tucson");
    render();
  });

  clusterPrevButton?.addEventListener("click", () => cycleCluster(-1));
  clusterNextButton?.addEventListener("click", () => cycleCluster(1));
  clusterCloseButton?.addEventListener("click", closeClusterPanel);

  clusterPanel?.addEventListener("wheel", event => {
    event.preventDefault();
    event.stopPropagation();
    const now = performance.now();
    if (now - lastClusterWheelAt < 160 || Math.abs(event.deltaY) < 4) return;
    lastClusterWheelAt = now;
    cycleCluster(event.deltaY > 0 ? 1 : -1);
  }, { passive: false });

  clusterPanel?.addEventListener("keydown", event => {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      cycleCluster(1);
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      cycleCluster(-1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeClusterPanel();
    }
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
