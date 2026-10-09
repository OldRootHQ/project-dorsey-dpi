(() => {
  "use strict";

  const nav = document.querySelector(".site-nav");
  const main = document.querySelector("main");

  if (main && !main.id) main.id = "main-content";
  if (main && !document.querySelector(".skip-link")) {
    const skip = document.createElement("a");
    skip.className = "skip-link";
    skip.href = "#main-content";
    skip.textContent = "Skip to content";
    document.body.prepend(skip);
  }

  if (!nav) return;

  // All mastheads share this navigation controller; keep the in-development roster
  // discoverable in Characters without duplicating the canonical list in Dispatches.
  const charactersMenu = nav.querySelector("#nav-characters-menu");
  const registryLink = charactersMenu?.querySelector('a[href$="characters.html"]');
  if (charactersMenu && registryLink && !charactersMenu.querySelector('[data-upcoming-characters-link]')) {
    const prefix = registryLink.getAttribute("href").replace(/characters\.html(?:[?#].*)?$/, "");
    const upcoming = document.createElement("a");
    upcoming.setAttribute("role", "menuitem");
    upcoming.setAttribute("data-upcoming-characters-link", "");
    upcoming.href = prefix + "news.html#upcoming-characters";
    upcoming.textContent = "Upcoming Characters";
    registryLink.insertAdjacentElement("afterend", upcoming);
  }

  const loreMenu = nav.querySelector("#nav-lore-menu");
  const loreIndexLink = loreMenu?.querySelector('a[href$="lore.html"]');
  if (loreMenu && loreIndexLink) {
    const prefix = loreIndexLink.getAttribute("href").replace(/lore\.html(?:[?#].*)?$/, "");
    const records = [
      ["ELEMENT 126: ABYRON", "lore/abyron/"],
      ["Abyron Powder", "lore/abyron-powder/"],
      ["Discovery of Abyron", "lore/abyron-discovery/"],
      ["Genesis", "lore/genesis/"]
    ];
    const currentPath = window.location.pathname.replace(/index\.html$/, "");
    let recordActive = false;
    records.forEach(([label, path]) => {
      if (loreMenu.querySelector(`a[href="${prefix}${path}"]`)) return;
      const link = document.createElement("a");
      link.setAttribute("role", "menuitem");
      link.href = prefix + path;
      link.textContent = label;
      const targetPath = new URL(link.href, window.location.href).pathname.replace(/index\.html$/, "");
      if (currentPath === targetPath) {
        link.classList.add("active");
        recordActive = true;
      }
      loreMenu.append(link);
    });
    if (recordActive) loreIndexLink.classList.remove("active");
  }

  // OR-WEB-0060: Shared OldRoot navigation panels. The page templates supply
  // canonical links; this controller supplies accessible editorial presentation.
  const megaContent = {
    "nav-characters-menu": {
      kicker: "THE PEOPLE OF OLDROOT", title: "Characters",
      intro: "Meet established figures, study their capabilities, or see who is still taking shape.",
      theme: "characters",
      captions: {
        "Character Registry": "Browse the published character dossiers",
        "Upcoming Characters": "The figures currently in development",
        "OPI Analytics": "Compare capabilities across the registry"
      }
    },
    "nav-world-menu": {
      kicker: "THE LIVING WORLD", title: "World",
      intro: "The places, events, and factions that connect the OldRoot universe.",
      theme: "world",
      captions: {
        "Locations": "Cities, islands, facilities and beyond",
        "Events": "The history shaping the present",
        "Organizations": "Companies, factions and criminal networks"
      }
    },
    "nav-lore-menu": {
      kicker: "THE OLDROOT ARCHIVE", title: "Lore",
      intro: "Follow the deeper science, history and systems beneath the stories.",
      theme: "lore",
      captions: {
        "Start Here": "Your introduction to the universe",
        "Lore Index": "The complete terminology and reference library",
        "ELEMENT 126: ABYRON": "The element that changed human history",
        "Abyron Powder": "Genesis residue, amplification and its consequences",
        "Discovery of Abyron": "A strange first encounter beneath the ocean",
        "Genesis": "The catastrophe that altered everything"
      }
    }
  };

  for (const [id, config] of Object.entries(megaContent)) {
    const panel = nav.querySelector("#" + id);
    if (!panel || panel.classList.contains("oldroot-mega")) continue;
    panel.classList.add("oldroot-mega");
    panel.dataset.megaTheme = config.theme;
    panel.setAttribute("aria-label", config.title + " navigation");

    const introduction = document.createElement("div");
    introduction.className = "oldroot-mega-intro";
    const eyebrow = document.createElement("span");
    eyebrow.className = "oldroot-mega-kicker";
    eyebrow.textContent = config.kicker;
    const heading = document.createElement("strong");
    heading.className = "oldroot-mega-heading";
    heading.textContent = config.title;
    const description = document.createElement("p");
    description.className = "oldroot-mega-description";
    description.textContent = config.intro;
    const signature = document.createElement("span");
    signature.className = "oldroot-mega-signature";
    signature.textContent = "OLDROOT / EXPLORE";
    introduction.append(eyebrow, heading, description, signature);

    const cards = document.createElement("div");
    cards.className = "oldroot-mega-links";
    for (const link of [...panel.querySelectorAll(":scope > a")]) {
      link.classList.add("oldroot-mega-link");
      link.dataset.navDescription = config.captions[link.textContent.trim()] || "Explore this OldRoot record";
      cards.append(link);
    }
    panel.append(introduction, cards);
  }

  const masthead = nav.closest(".masthead");
  const mastInner = nav.parentElement;
  const groups = [...nav.querySelectorAll(".nav-group")];
  const scrim = document.createElement("div");
  scrim.className = "oldroot-nav-scrim";
  scrim.hidden = true;
  scrim.setAttribute("aria-hidden", "true");
  masthead?.after(scrim);

  const fineHover = window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches ?? false;
  const mobileQuery = window.matchMedia("(max-width: 760px)");

  nav.id ||= "primary-navigation";
  nav.querySelectorAll("a.active").forEach(link => link.setAttribute("aria-current", "page"));

  const mobileToggle = document.createElement("button");
  mobileToggle.type = "button";
  mobileToggle.className = "mobile-nav-toggle";
  mobileToggle.hidden = true;
  mobileToggle.setAttribute("aria-controls", nav.id);
  mobileToggle.setAttribute("aria-expanded", "false");
  mobileToggle.setAttribute("aria-label", "Open primary navigation");
  mobileToggle.innerHTML = '<span>Menu</span><span class="mobile-nav-icon" aria-hidden="true"><i></i><i></i></span>';
  mastInner?.insertBefore(mobileToggle, nav);

  function setGroup(group, open) {
    const button = group.querySelector("[data-nav-toggle]");
    const menu = group.querySelector("[data-nav-menu]");
    if (!button || !menu) return;

    group.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", String(open));
    const anyOpen = groups.some(item => item.classList.contains("is-open"));
    if (masthead) masthead.classList.toggle("has-mega-open", anyOpen);
    if (scrim) scrim.hidden = !anyOpen || mobileQuery.matches;
  }

  function closeAll(except = null) {
    groups.forEach(group => {
      if (group !== except) setGroup(group, false);
    });
  }

  function setMobileNav(open, focusToggle = false) {
    if (!masthead || !mobileQuery.matches) {
      nav.inert = false;
      nav.removeAttribute("aria-hidden");
      masthead?.classList.remove("nav-mobile-open");
      mobileToggle.setAttribute("aria-expanded", "false");
      mobileToggle.setAttribute("aria-label", "Open primary navigation");
      return;
    }

    masthead.classList.toggle("nav-mobile-open", open);
    mobileToggle.setAttribute("aria-expanded", String(open));
    mobileToggle.setAttribute("aria-label", open ? "Close primary navigation" : "Open primary navigation");
    nav.inert = !open;
    nav.setAttribute("aria-hidden", String(!open));

    if (!open) {
      closeAll();
      if (focusToggle) mobileToggle.focus();
    }
  }

  function syncMobileNav() {
    const mobile = mobileQuery.matches;
    masthead?.classList.toggle("nav-mobile-ready", mobile);
    mobileToggle.hidden = !mobile;
    setMobileNav(false);
  }

  mobileToggle.addEventListener("click", () => {
    const open = mobileToggle.getAttribute("aria-expanded") !== "true";
    setMobileNav(open);
  });

  mobileQuery.addEventListener?.("change", syncMobileNav);

  groups.forEach(group => {
    const button = group.querySelector("[data-nav-toggle]");
    const menu = group.querySelector("[data-nav-menu]");
    if (!button || !menu) return;

    const links = [...menu.querySelectorAll("a")];
    let hoverExitTimer;

    button.addEventListener("click", event => {
      event.preventDefault();
      const nextOpen = fineHover && !mobileQuery.matches ? true : button.getAttribute("aria-expanded") !== "true";
      closeAll(group);
      setGroup(group, nextOpen);
    });

    button.addEventListener("keydown", event => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        closeAll(group);
        setGroup(group, true);
        const target = event.key === "ArrowDown" ? links[0] : links.at(-1);
        requestAnimationFrame(() => target?.focus());
      } else if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        setGroup(group, false);
        button.focus();
      }
    });

    menu.addEventListener("keydown", event => {
      const current = links.indexOf(document.activeElement);
      if (current < 0) return;

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const step = event.key === "ArrowDown" ? 1 : -1;
        links[(current + step + links.length) % links.length]?.focus();
      } else if (event.key === "Home") {
        event.preventDefault();
        links[0]?.focus();
      } else if (event.key === "End") {
        event.preventDefault();
        links.at(-1)?.focus();
      } else if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        setGroup(group, false);
        button.focus();
      }
    });

    links.forEach(link => link.addEventListener("click", () => {
      setGroup(group, false);
      if (mobileQuery.matches) setMobileNav(false);
    }));

    group.addEventListener("focusin", () => closeAll(group));

    if (fineHover) {
      group.addEventListener("mouseenter", () => {
        clearTimeout(hoverExitTimer);
        if (mobileQuery.matches) return;
        closeAll(group);
        setGroup(group, true);
      });
      menu.addEventListener("pointerenter", () => clearTimeout(hoverExitTimer));
      group.addEventListener("mouseleave", () => {
        if (mobileQuery.matches) return;
        // A brief bridge prevents flicker when travelling from tab to panel.
        hoverExitTimer = setTimeout(() => {
          if (!group.matches(":hover") && !menu.matches(":hover")
            && !menu.contains(document.activeElement)) setGroup(group, false);
        }, 120);
      });
    }
  });

  [...nav.children].forEach(item => {
    if (item.matches?.(":scope > a")) {
      item.addEventListener("click", () => {
        if (mobileQuery.matches) setMobileNav(false);
      });
    }
  });

  document.addEventListener("pointerdown", event => {
    if (!nav.contains(event.target) && event.target !== mobileToggle && !mobileToggle.contains(event.target)) {
      closeAll();
      if (mobileQuery.matches && masthead?.classList.contains("nav-mobile-open")) setMobileNav(false);
    }
  });

  document.addEventListener("focusin", event => {
    if (!nav.contains(event.target) && event.target !== mobileToggle && !mobileToggle.contains(event.target)) closeAll();
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    closeAll();
    if (mobileQuery.matches && masthead?.classList.contains("nav-mobile-open")) {
      event.preventDefault();
      setMobileNav(false, true);
    }
  });

  scrim?.addEventListener("pointerenter", () => closeAll());
  scrim?.addEventListener("pointerdown", () => closeAll());
  window.addEventListener("scroll", () => {
    if (!mobileQuery.matches) closeAll();
  }, { passive: true });

  syncMobileNav();
})();