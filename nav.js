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

  const masthead = nav.closest(".masthead");
  const mastInner = nav.parentElement;
  const groups = [...nav.querySelectorAll(".nav-group")];
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
        if (mobileQuery.matches) return;
        closeAll(group);
        setGroup(group, true);
      });
      group.addEventListener("mouseleave", () => {
        if (mobileQuery.matches) return;
        if (!group.contains(document.activeElement)) setGroup(group, false);
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

  syncMobileNav();
})();