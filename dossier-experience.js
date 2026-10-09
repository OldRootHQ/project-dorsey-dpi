/* OR-WEB-0061 · OldRoot cinematic character dossier system
   Progressive enhancement: every character's original lore, artwork and OPI data
   remain accessible without JavaScript. No canonical events or powers are invented. */
(() => {
  "use strict";
  const main = document.querySelector("main.character-shell");
  const identity = main?.querySelector(":scope > .character-identity");
  const featured = main?.querySelector(":scope > .character-feature-art");
  const grid = main?.querySelector(":scope > .dossier-grid");
  if (!main || !identity || !featured || !grid || main.dataset.dossierEnhanced) return;
  main.dataset.dossierEnhanced = "true";

  const profiles = {
    "gila-monster": { color:"#e18a48", secondary:"#7f2f20", aura:"Desert Nocturne", sig:"Tucson / Investigator", icon:"⌁",
      guidance:"From detective work to an altered life, follow the evidence and the consequences." },
    "commotion": { color:"#e1a66a", secondary:"#704b4c", aura:"Street Pressure", sig:"Urban / Combat Specialist", icon:"◈",
      guidance:"A life shaped by discipline, fighting and the rooms he knows how to command." },
    "aftermark": { color:"#8db8c2", secondary:"#385c72", aura:"The Motion Archive", sig:"Physics / Movement", icon:"↗",
      guidance:"The man, the origin and the physical law that follows his movements." },
    "kincast": { color:"#e9c59a", secondary:"#444a56", aura:"Two Minds, One Name", sig:"Baltimore / Paired Identity", icon:"◑",
      guidance:"Discover the twins' dynamic before the abilities and methods of their shared identity." },
    "anchorage": { color:"#afc6dd", secondary:"#35586d", aura:"Heavy Metal", sig:"Baltimore / Underworld", icon:"▥",
      guidance:"Follow the transformation, broken conditioning and decisions behind the name." },
    "agent-emerald": { color:"#9be4b2", secondary:"#285e50", aura:"Precision Protocol", sig:"Engineering / Vigilance", icon:"◇",
      guidance:"The family, the engineering and the deliberate choices behind every weapon." },
    "latch": { color:"#c9c39c", secondary:"#536048", aura:"Field Records", sig:"Operations / Strategy", icon:"⟟",
      guidance:"The life of an operative told through service, loss, recruitment and resolve." },
    "kokio": { color:"#f0b17f", secondary:"#943a35", aura:"Ritual and Resolve", sig:"Hilo / Mythic Heritage", icon:"✦",
      guidance:"A photographer's history, an ancient bond and the cost of extraordinary power." }
  };
  const slug = location.pathname.match(/\/characters\/([^/]+)\//)?.[1] || "";
  const profile = profiles[slug];
  if (!profile) return;
  main.dataset.dossier = slug;
  main.style.setProperty("--dossier-accent", profile.color);
  main.style.setProperty("--dossier-secondary", profile.secondary);
  main.style.setProperty("--dossier-icon", JSON.stringify(profile.icon));

  // Preserve the original character identity and original featured art in-place,
  // but combine them as a single responsive cinematic composition.
  const hero = document.createElement("div");
  hero.className = "dossier-cinematic-hero";
  identity.before(hero);
  hero.append(identity, featured);

  const issue = document.createElement("div");
  issue.className = "dossier-hero-issue";
  issue.textContent = "OLDROOT / CHARACTER ARCHIVE / " + slug.toUpperCase().replace(/-/g, " ");
  identity.prepend(issue);
  const mast = document.createElement("div");
  mast.className = "dossier-hero-aside";
  const aura = document.createElement("span");
  aura.className = "dossier-aura";
  aura.textContent = profile.aura;
  const category = document.createElement("span");
  category.className = "dossier-category";
  category.textContent = profile.sig;
  mast.append(aura, category);
  identity.append(mast);
  featured.querySelector(".character-feature-art-badge")?.replaceChildren(document.createTextNode("View original artwork ↗"));

  // A one-tap map of the original chapters: labels come from existing headings.
  const sections = [...grid.querySelectorAll(".lore-column > .wiki-section")];
  const chapters = [];
  sections.forEach((section, index) => {
    const h = section.querySelector(":scope > h2");
    if (!h) return;
    const id = section.id || "chapter-" + String(index+1).padStart(2, "0");
    section.id = id;
    section.dataset.chapter = String(index + 1).padStart(2, "0");
    section.classList.add("dossier-chapter");
    const eyebrow = document.createElement("span");
    eyebrow.className = "dossier-chapter-label";
    eyebrow.textContent = "FILE / " + String(index+1).padStart(2, "0");
    h.before(eyebrow);
    chapters.push({ id, label:h.textContent.trim(), section, index });
  });

  const indexPanel = document.createElement("nav");
  indexPanel.className = "dossier-chapter-index";
  indexPanel.setAttribute("aria-label", "Explore character dossier");
  const indexText = document.createElement("div");
  indexText.className = "dossier-index-lead";
  const indexEyebrow = document.createElement("span");
  indexEyebrow.textContent = "OPEN THE ARCHIVE";
  const indexHeading = document.createElement("strong");
  indexHeading.textContent = "Explore the dossier.";
  const indexDescription = document.createElement("p");
  indexDescription.textContent = profile.guidance;
  indexText.append(indexEyebrow, indexHeading, indexDescription);
  const jumpList = document.createElement("div");
  jumpList.className = "dossier-index-scroll";
  chapters.forEach(({id,label,index}) => {
    const a=document.createElement("a");
    a.href="#" + id;
    a.textContent=String(index+1).padStart(2,"0")+" / "+label;
    jumpList.append(a);
  });
  indexPanel.append(indexText,jumpList);
  grid.before(indexPanel);

  // Turn preexisting story illustrations into chapter spotlights. No new scene
  // is claimed here: artwork and captions are drawn only from the original page.
  main.querySelectorAll(".lore-column .dossier-illustration").forEach((figure,index) => {
    figure.classList.add("dossier-scene");
    const caption=figure.querySelector("figcaption");
    if (caption) {
      const eyebrow=document.createElement("span");
      eyebrow.className="dossier-scene-label";
      eyebrow.textContent="VISUAL RECORD / "+String(index+1).padStart(2,"0");
      caption.prepend(eyebrow);
    }
  });

  // An OPI inspection station that DOES NOT replace or extrapolate official stats.
  const explanations = {
    "Strength":"Physical strength as measured by the OldRoot Power Index.",
    "Durability":"Resistance to physical damage; distinct from regeneration.",
    "Speed":"Movement and action speed within the OPI framework.",
    "Agility":"Coordination, flexibility and changes of direction.",
    "Regeneration":"Recovery from injury; a separate measure from durability.",
    "Senses":"Perception and detection capabilities.",
    "Offense":"Capacity to apply damaging or disabling force.",
    "Intellect":"Intellectual capability within the OPI scale.",
    "Combat":"Practical fighting capability, judgment and technique.",
    "Mobility":"Ability to traverse environments and reposition.",
    "Stamina":"Ability to sustain exertion and continued activity."
  };
  const statSection=sections.find(sec=>/power index/i.test(sec.querySelector("h2")?.textContent||""));
  if (statSection) {
    statSection.classList.add("dossier-opi-station");
    const gridStats=statSection.querySelector(".dpi-grid");
    if (gridStats) {
      gridStats.setAttribute("aria-label","Official baseline OPI measures");
      const readout=document.createElement("div");
      readout.className="dossier-opi-readout";
      readout.setAttribute("role","status");
      readout.setAttribute("aria-live","polite");
      readout.textContent="Select a measure to inspect its official baseline value.";
      gridStats.after(readout);
      for(const row of gridStats.querySelectorAll(".dpi-row")) {
        const name=row.querySelector(".dpi-name")?.textContent.trim();
        const value=row.querySelector(".dpi-value")?.textContent.trim();
        if (!name || !value) continue;
        row.classList.add("dossier-inspectable-row");
        const button=document.createElement("button");
        button.type="button";
        button.className="dossier-opi-inspect";
        button.setAttribute("aria-label","Inspect " + name + " score");
        button.textContent="+";
        button.addEventListener("click",()=>{
          gridStats.querySelectorAll(".dpi-row").forEach(r=>r.classList.remove("is-inspected"));
          row.classList.add("is-inspected");
          readout.replaceChildren();
          const heading=document.createElement("strong");heading.textContent=name + " / " + value;
          const description=document.createElement("span");description.textContent=explanations[name]||"Recorded category of the official OPI profile.";
          readout.append(heading,description);
        });
        row.append(button);
      }
    }
    const conditional=statSection.querySelector(".conditional-box");
    if(conditional) {
      const control=document.createElement("button");
      control.className="dossier-condition-button";
      control.type="button";
      control.textContent="Inspect conditional measurements ↗";
      const hasValues=!/No separate conditional values are established/i.test(conditional.textContent);
      if (!hasValues) control.textContent="Conditional values not established";
      control.disabled=!hasValues;
      if(hasValues) {
        conditional.hidden=true;
        control.setAttribute("aria-expanded","false");
        control.addEventListener("click",()=>{
          conditional.hidden=!conditional.hidden;
          control.setAttribute("aria-expanded",String(!conditional.hidden));
          control.textContent=conditional.hidden?"Inspect conditional measurements ↗":"Hide conditional measurements ↑";
        });
      }
      conditional.before(control);
    }
  }

  // Curate the artwork already approved in this dossier into a navigable archive.
  // The existing lightbox uses event delegation, so dynamically added triggers
  // work with the same controls and retain each image's original caption.
  const sources=[
    ...main.querySelectorAll(".character-feature-art [data-lightbox], .lore-column .dossier-illustration [data-lightbox], .character-infobox [data-lightbox]")
  ];
  const seen=new Set();
  const artwork=sources.map(trigger=>{
    const img=trigger.matches("img")?trigger:trigger.querySelector("img");
    const full=trigger.dataset.fullSrc||img?.getAttribute("src");
    if(!full||seen.has(full))return null;
    seen.add(full);
    return {src:img.getAttribute("src"),full,alt:img.alt||"Character artwork",
      caption:trigger.dataset.caption||img.alt||"Character visual reference"};
  }).filter(Boolean).slice(0,8);
  if(artwork.length){
    const gallery=document.createElement("section");
    gallery.className="dossier-art-archive";
    gallery.id="visual-archive";
    const header=document.createElement("div");
    header.className="dossier-archive-header";
    header.innerHTML='<span>OLDROOT / VISUAL RECORDS</span><h2>The art archive.</h2><p>Approved artwork and character references preserved from the original dossier. Select an image to see its full version.</p>';
    gallery.append(header);
    const artGrid=document.createElement("div");
    artGrid.className="dossier-art-gallery";
    artwork.forEach((item,index)=>{
      const button=document.createElement("button");
      button.className="dossier-art-tile";
      button.type="button";
      button.dataset.lightbox="";
      button.dataset.fullSrc=item.full;
      button.dataset.caption=item.caption;
      button.setAttribute("aria-label","View artwork: "+item.caption);
      const image=document.createElement("img");
      image.src=item.src;image.alt=item.alt;image.loading="lazy";image.decoding="async";
      const caption=document.createElement("span");
      caption.textContent=String(index+1).padStart(2,"0")+" / "+item.caption;
      button.append(image,caption);
      artGrid.append(button);
    });
    gallery.append(artGrid);
    const network=main.querySelector(".character-network");
    if(network)network.before(gallery);
    else grid.after(gallery);
    const galleryJump=document.createElement("a");
    galleryJump.href="#visual-archive";
    galleryJump.textContent="ARCHIVE / View artwork";
    galleryJump.className="dossier-gallery-jump";
    jumpList.append(galleryJump);
  }

  // Scroll-progression adds modest visual emphasis, not hidden content.
  if ("IntersectionObserver" in window) {
    const links=[...indexPanel.querySelectorAll('a[href^="#chapter-"]')];
    const map=new Map(links.map(a=>[a.hash.slice(1),a]));
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        links.forEach(a=>a.removeAttribute("aria-current"));
        map.get(entry.target.id)?.setAttribute("aria-current","location");
      });
    },{rootMargin:"-18% 0px -66% 0px"});
    chapters.forEach(c=>observer.observe(c.section));
  }
})();
