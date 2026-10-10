"use strict";
window.OLDROOT_HOME = {
  characterSpotlights: {
    "Remedie": {
      key:"remedie", image:"assets/characters/remedie/remedie-featured.webp", mark:"assets/characters/remedie/remedie-emblem.svg?v=1",
      alt:"Remedie catches incoming fire with her responsive gauntlets while shielding a family",
      meta:"TECH-ASSISTED HUMAN · ANTI-HERO · BOSTON",
      teaser:"She built a weapon to recover her family. Every stranger she saves turns it into something else.",
      links:[["Character Dossier →","characters/remedie/"],["OPI Analytics →","dpi.html"]]
    },
    "Amari Razman": {
      key:"amari-razman", image:"assets/characters/amari-razman/amari-dossier-04.webp",
      alt:"Amari Razman overlooking the Brooklyn skyline at sunset",
      meta:"HUMAN · FIELD TRACKER · BROOKLYN · OPI 10.02",
      teaser:"No superpowers—just a disciplined operative who finds the people who do not want to be found.",
      links:[["Character Dossier →","characters/amari-razman/"],["Latch Boswell →","characters/latch/"],["Official OPI 10.02 →","dpi.html"]]
    },
    "Gila Monster": {
      key:"gila", image:"assets/characters/gila-monster/gila-featured.webp", mark:"assets/characters/gila-monster/gila-monster-emblem.svg?v=2",
      alt:"Gila Monster moving across Tucson rooftops at sunset",
      meta:"ENHANCED HUMAN · TUCSON",
      teaser:"A Tucson detective changed by an experiment he was never meant to survive.",
      artClass:"gila-home-art",
      links:[["Character Dossier →","characters/gila-monster/"],["Tucson →","locations/tucson/"],["Los Moralistas →","organizations/los-moralistas/"]]
    },
    "Commotion": {
      key:"commotion", image:"assets/characters/commotion/commotion-featured-rooftop.webp", mark:"assets/characters/commotion/commotion-emblem.svg?v=1",
      alt:"Commotion crouched on a Chicago elevated train at sunset",
      meta:"EXCEPTIONAL HUMAN · CHICAGO",
      teaser:"No powers. No armor. Just a Chicago fighter who is at his best when a plan falls apart.",
      links:[["Character Dossier →","characters/commotion/"],["Chicago →","locations/chicago/"]]
    },
    "Aftermark": {
      key:"aftermark", image:"assets/characters/aftermark/aftermark-featured.webp", mark:"assets/characters/aftermark/aftermark-emblem.svg?v=1",
      alt:"Aftermark leaping across rain-slick Santurce rooftops",
      meta:"SLIGHTLY ENHANCED HUMAN · SAN JUAN",
      teaser:"A San Juan hero who can leave pieces of his own movement behind—and make them happen again.",
      artClass:"aftermark-home-art",
      links:[["Character Dossier →","characters/aftermark/"],["San Juan →","locations/san-juan/"]]
    },
    "Kincast": {
      key:"kincast", image:"assets/characters/kincast/kincast-featured.webp", mark:"assets/characters/kincast/kincast-emblem.svg?v=1",
      alt:"Kincast with Naomi on an industrial catwalk",
      meta:"SUPERHUMAN · BALTIMORE",
      teaser:"One heroic identity shared by a gunfighter and the impossible shadow that fights beside him.",
      artClass:"kincast-home-art",
      links:[["Character Dossier →","characters/kincast/"],["Baltimore →","locations/baltimore/"]]
    },
    "Anchorage": {
      key:"anchorage", image:"assets/characters/anchorage/anchorage-featured.png", mark:"assets/characters/anchorage/anchorage-emblem.svg?v=1",
      alt:"Anchorage in his blue-and-ivory design",
      meta:"E&A HUMAN · VILLAIN · BALTIMORE",
      teaser:"A Baltimore mercenary built like living metal and heavy enough to make every fight a structural problem.",
      artClass:"anchorage-home-art",
      links:[["Character Dossier →","characters/anchorage/"],["Baltimore →","locations/baltimore/"]]
    },
    "Agent Emerald": {
      key:"agent-emerald", image:"assets/characters/agent-emerald/agent-emerald-featured.webp",
      alt:"Agent Emerald overlooking a rain-soaked Seattle industrial skyline",
      meta:"SUPERIOR HUMAN · VIGILANTE · SEATTLE",
      teaser:"A Seattle vigilante who turns engineering, precision, and preparation into a combat system.",
      artClass:"agent-emerald-home-art",
      links:[["Character Dossier →","characters/agent-emerald/"],["Seattle / Puget Sound →","locations/seattle/"],["Dunamis Dynamics →","organizations/dunamis-dynamics/"]]
    },
    "Latch": {
      key:"latch", image:"assets/characters/latch/latch-featured.webp",
      alt:"Latch moving through a damaged operational environment with a rifle",
      meta:"HUMAN · UNENHANCED · HERO · AUSTRALIAN",
      teaser:"An ordinary man recruited to stand beside people who are anything but ordinary.",
      links:[["Character Dossier →","characters/latch/"],["Genesis →","events.html#genesis"]]
    },
    "Kokio": {
      key:"kokio", image:"assets/characters/kokio/kokio-combat-01.webp",
      alt:"Kokio wielding two glowing ritual hatchets in close combat",
      meta:"DEMI-GOD · HERO · HILO / HAWAIʻI ISLAND",
      teaser:"A Hilo warrior carrying power from something far older than the world around her.",
      links:[["Character Dossier →","characters/kokio/"],["Hilo / Hawaiʻi Island →","locations/hilo/"],["OPI Analytics →","dpi.html"]]
    }
  },
  // The supporting cast also appears in the rotating public character spotlight.
  // Amari's eleven creator-approved OPI ratings are now established.
  characterSupportNotes: { "Amari Razman": "Official OPI 10.02" },
  locationSpotlights: {
    tucson:{teaser:"Desert nights, police corruption, and something moving beneath the city.",className:"place-tucson"},
    chicago:{teaser:"Human skill, family ties, and street-level chaos can matter here as much as raw power.",className:"place-chicago"},
    sanjuan:{teaser:"Rain-slick streets and impossible spatial echoes make Santurce difficult to predict.",className:"place-san-juan"},
    stdorsey:{teaser:"Ground zero for an accidental Abyron catastrophe—and later home to Hampton’s massive Dorsey New General expansion.",className:"place-st-dorsey"},
    baltimore:{teaser:"Heroes, mercenaries, shadows, and a criminal ecosystem learning to adapt.",className:"place-baltimore"},
    seattle:{teaser:"Technology, wealth, rain, and private ambition converge around Puget Sound.",className:"place-seattle"},
    hilo:{teaser:"Rainforest, volcanic terrain, and ancient ritual history meet on Hawaiʻi Island.",className:"place-hilo"}
  },
  upcoming: [
    {name:"Mark Hampton",status:"NO OPI LISTING"},
    {name:"Neegan Walters",status:"NO OPI LISTING"},
    {name:"Makari",status:"IN DEVELOPMENT"},
    {name:"Akuaom",status:"IN DEVELOPMENT"},
    {name:"Duke",status:"IN DEVELOPMENT"},
    {name:"Malasangre",status:"IN DEVELOPMENT"},
    {name:"White Magma",status:"IN DEVELOPMENT"}
  ],
  latestDispatch: {
    label:"LATEST DISPATCH / OCTOBER 2026",
    meta:"OR-WEB-0077 · Character emblem positioning",
    title:"Character emblems return beside their identities.",
    body:"All six installed character emblems — including Remedie and Kincast — now line up below their portraits beside the identity text, leaving the illustrations unobstructed.",
    href:"news.html#or-web-0077"
  }
};
