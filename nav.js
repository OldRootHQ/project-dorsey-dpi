(() => {
  "use strict";

  const nav = document.querySelector(".site-nav");
  if (!nav) return;

  const groups = [...nav.querySelectorAll(".nav-group")];
  const fineHover = window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches ?? false;

  function setGroup(group, open, { focus = false, last = false } = {}) {
    const button = group.querySelector("[data-nav-toggle]");
    const menu = group.querySelector("[data-nav-menu]");
    if (!button || !menu) return;

    group.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", String(open));

    if (open && focus) {
      const links = [...menu.querySelectorAll("a")];
      (last ? links.at(-1) : links[0])?.focus();
    }
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

    button.addEventListener("click", event => {
      event.preventDefault();
      const nextOpen = button.getAttribute("aria-expanded") !== "true";
      closeAll(group);
      setGroup(group, nextOpen);
    });

    button.addEventListener("keydown", event => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        closeAll(group);
        setGroup(group, true, { focus: true });
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        closeAll(group);
        setGroup(group, true, { focus: true, last: true });
      } else if (event.key === "Escape") {
        event.preventDefault();
        setGroup(group, false);
        button.focus();
      }
    });

    menu.addEventListener("keydown", event => {
      const links = [...menu.querySelectorAll("a")];
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

    if (fineHover) {
      group.addEventListener("mouseenter", () => {
        closeAll(group);
        setGroup(group, true);
      });
      group.addEventListener("mouseleave", () => setGroup(group, false));
    }
  });

  document.addEventListener("pointerdown", event => {
    if (!nav.contains(event.target)) closeAll();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeAll();
  });
})();