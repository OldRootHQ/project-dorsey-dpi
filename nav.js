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

  const groups = [...nav.querySelectorAll(".nav-group")];
  const fineHover = window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches ?? false;

  nav.querySelectorAll("a.active").forEach(link => link.setAttribute("aria-current", "page"));

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

  groups.forEach(group => {
    const button = group.querySelector("[data-nav-toggle]");
    const menu = group.querySelector("[data-nav-menu]");
    if (!button || !menu) return;

    const links = [...menu.querySelectorAll("a")];

    button.addEventListener("click", event => {
      event.preventDefault();
      const nextOpen = button.getAttribute("aria-expanded") !== "true";
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
        setGroup(group, false);
        button.focus();
      }
    });

    links.forEach(link => link.addEventListener("click", () => setGroup(group, false)));

    group.addEventListener("focusin", () => closeAll(group));

    if (fineHover) {
      group.addEventListener("mouseenter", () => {
        closeAll(group);
        setGroup(group, true);
      });
      group.addEventListener("mouseleave", () => {
        if (!group.contains(document.activeElement)) setGroup(group, false);
      });
    }
  });

  document.addEventListener("pointerdown", event => {
    if (!nav.contains(event.target)) closeAll();
  });

  document.addEventListener("focusin", event => {
    if (!nav.contains(event.target)) closeAll();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeAll();
  });
})();