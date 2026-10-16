(() => {
  "use strict";
  const section = document.querySelector("#community-poll");
  const mount = document.querySelector("#communityPollContent");
  const status = document.querySelector("#communityPollStatus");
  if (!section || !mount || !status) return;

  // Supply the owner's hosted StrawPoll URL when the real poll has been created.
  // No vote counters or browser-local votes are ever fabricated.
  const raw = typeof window.OLDROOT_POLL_URL === "string" ? window.OLDROOT_POLL_URL.trim() : "";
  if (!raw) return;

  let url;
  try { url = new URL(raw); } catch { return; }
  if (url.protocol !== "https:" || !["strawpoll.com","www.strawpoll.com"].includes(url.hostname)) return;
  const parts = url.pathname.split("/").filter(Boolean);
  let id = "";
  if (parts.length === 1) id = parts[0];
  if (parts.length === 2 && parts[0] === "polls") id = parts[1];
  if (parts.length === 2 && parts[0] === "embed") id = parts[1];
  if (parts.length === 3 && parts[0] === "embed" && parts[1] === "polls") id = parts[2];
  if (!/^[a-zA-Z0-9]{6,32}$/.test(id)) return;

  const embed = "https://strawpoll.com/embed/polls/" + id;
  const share = "https://strawpoll.com/polls/" + id;

  const title = document.createElement("div");
  title.className = "community-poll-caption";
  title.textContent = "OPEN COMMUNITY VOTE";
  const frame = document.createElement("iframe");
  frame.className = "community-poll-frame";
  frame.src = embed;
  frame.title = "Vote on which OldRoot character should get the next issue";
  frame.loading = "lazy";
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  const link = document.createElement("a");
  link.className = "community-poll-open-link";
  link.href = share;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Open the full poll and results ↗";
  mount.replaceChildren(title, frame, link);
  status.textContent = "Voting is open. Cast your vote below or open the full poll.";
})();
