import { enhance } from "./enhancements.js";
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let data;
try {
  const res = await fetch("content.json");
  if (!res.ok) throw Error();
  data = await res.json();
  const extra = await fetch("research.json");
  if (!extra.ok) throw Error();
  const research = await extra.json();
  data = {
    ...data,
    ...research,
    sources: { ...data.sources, ...research.sources },
  };
} catch {
  $("#company-grid").innerHTML =
    "<p>Content could not load. Run the local server and reload this page.</p>";
  throw Error("Content unavailable");
}
const sourceLink = (id) => {
  const s = data.sources[id];
  return `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)} ↗<small>${esc(s.publisher)} · ${esc(s.type)} · ${esc(s.date)}</small></a>`;
};
const dialog = $("#detail");
let returnFocus;
function show(html, hash) {
  if (!dialog.open) returnFocus = document.activeElement;
  $("#detail-content").innerHTML = html;
  if (!dialog.open) dialog.showModal();
  history.replaceState(null, "", `#${hash}`);
  $("#close-dialog").focus();
  dialog.scrollTop = 0;
  document.dispatchEvent(
    new CustomEvent("almanac:detail", { detail: { hash } }),
  );
}
function close() {
  dialog.close();
  if (
    /^#(question|company|chapter|venture|prediction|event)-/.test(location.hash)
  )
    history.replaceState(null, "", location.pathname);
  returnFocus?.focus();
}
$("#close-dialog").onclick = close;
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      close();
  }
});
dialog.addEventListener("cancel", (e) => {
  e.preventDefault();
  close();
});
function companyCards(filter = "all") {
  $("#company-grid").innerHTML = data.companies
    .filter((c) => filter === "all" || c.category === filter)
    .map(
      (c) =>
        `<button class="company-card" data-company="${c.id}" aria-label="Explore ${esc(c.name)}"><div class="company-top"><span class="company-mark">${esc(c.mark)}</span><span class="pill">${esc(c.status)}</span></div><h3>${esc(c.name)}</h3><p>${esc(c.summary)}</p><div class="card-bottom"><span>${esc(c.sector)}</span><b>↗</b></div></button>`,
    )
    .join("");
}
function rows(items) {
  return items
    .map(
      ([label, text, cls = ""]) =>
        `<div class="evidence-row ${cls}"><span class="eyebrow">${label}</span><p>${esc(text)}</p></div>`,
    )
    .join("");
}
function openCompany(id) {
  const c = data.companies.find((c) => c.id === id);
  if (!c) return;
  show(
    `<p class="eyebrow blue">${esc(c.status)} / ${esc(c.sector)}</p><h2 id="detail-title">${esc(c.name)}</h2><p class="lead">${esc(c.mission)}</p><h3>The problem</h3><p>${esc(c.problem)}</p>${rows(
      [
        ["DEMONSTRATED / REPORTED", c.accomplishment],
        ["POSSIBLE HUMAN BENEFIT · ANALYSIS", c.benefit],
        ["STILL TO PROVE", c.unproven, "open"],
      ],
    )}<h3>Selected development</h3><p>${esc(c.development)}</p><h3>What to watch next</h3><p>${esc(c.next)}</p><p class="subnote">Research checked ${data.reviewedAt}. Company claims are not independent validation.</p><div class="detail-sources">${c.sources.map(sourceLink).join("")}</div><div class="detail-actions"><button class="button primary" data-question="${c.question}">Understand the technology ↗</button></div>`,
    `company-${id}`,
  );
}
function openQuestion(id) {
  const q = data.questions.find((q) => q.id === id);
  if (!q) return;
  show(
    `<p class="eyebrow blue">${q.topic.toUpperCase()} / EXPLAINER</p><h2 id="detail-title">${esc(q.title)}</h2><p class="lead">${esc(q.short)}</p><h3>The deeper explanation</h3><p>${esc(q.deep)}</p>${rows(
      [
        ["THE RECORD", q.fact],
        ["COMPANY POSITION / AMBITION", q.claim, "claim"],
        ["WHY IT MATTERS", q.meaning],
        ["WHAT REMAINS OPEN", q.unknown, "open"],
      ],
    )}<div class="detail-sources"><h3>Go to the sources</h3>${q.sources.map(sourceLink).join("")}</div><div class="detail-actions"><button class="button primary" data-copy="${q.id}">Copy answer + sources ↗</button><button class="text-link" data-link="${q.id}">Copy local link</button></div><p class="subnote">Local links work on this computer while the preview server is running.</p>`,
    `question-${id}`,
  );
}
let topic = "all";
function questionCards() {
  const term = $("#search").value.trim().toLowerCase();
  const qs = data.questions.filter(
    (q) =>
      (topic === "all" || q.topic === topic) &&
      `${q.title} ${q.short} ${q.deep} ${q.meaning}`
        .toLowerCase()
        .includes(term),
  );
  $("#result-count").textContent = `${qs.length} questions found`;
  $("#questions-grid").innerHTML = qs.length
    ? qs
        .map(
          (q) =>
            `<button class="question-card" data-question="${q.id}"><span class="eyebrow">${q.topic === "criticism" ? "THE HARD QUESTIONS" : q.topic === "impact" ? "WHY IT MATTERS" : "THE TECHNOLOGY"}</span><h3>${esc(q.title)}</h3><p>${esc(q.short)}</p><b>↗</b></button>`,
        )
        .join("")
    : '<p class="empty">No matching questions. Try “rocket”, “energy” or “safety”.</p>';
}
$("#company-filters").onclick = (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  $("#company-filters")
    .querySelectorAll("button")
    .forEach((x) => {
      x.classList.toggle("active", x === b);
      x.setAttribute("aria-pressed", x === b);
    });
  companyCards(b.dataset.filter);
};
$("#question-filters").onclick = (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  topic = b.dataset.topic;
  $("#question-filters")
    .querySelectorAll("button")
    .forEach((x) => {
      x.classList.toggle("active", x === b);
      x.setAttribute("aria-pressed", x === b);
    });
  questionCards();
};
$("#search").oninput = questionCards;
$("#news-grid").innerHTML = data.news
  .map(
    (n) =>
      `<article class="news-card"><span class="eyebrow">${esc(n.kind)} · ${esc(n.date)}</span><h3>${esc(n.title)}</h3><p>${esc(n.text)}</p><a href="${esc(data.sources[n.source].url)}" target="_blank" rel="noopener">${esc(data.sources[n.source].publisher)} · Read the record ↗</a></article>`,
  )
  .join("");
$("#source-list").innerHTML = Object.keys(data.sources)
  .map((id) => `<div class="source-link">${sourceLink(id)}</div>`)
  .join("");
let metric = "deliveries";
function chartValue(i) {
  const val = data.chart[metric][i];
  $("#chart-value").textContent =
    metric === "deliveries"
      ? val.toLocaleString("en-US")
      : `${val.toFixed(1)} gigawatt-hours`;
  $("#chart-caption").textContent =
    `${data.chart.years[i]} · ${metric === "deliveries" ? "vehicles delivered" : "storage deployed"}`;
  $$(".bar-wrap").forEach((b, j) => b.classList.toggle("selected", i === j));
}
function chart() {
  const vals = data.chart[metric],
    max = Math.max(...vals) * 1.12;
  $("#chart").innerHTML = vals
    .map(
      (v, i) =>
        `<button class="bar-wrap" data-year="${i}" aria-label="${data.chart.years[i]}: ${v.toLocaleString("en-US")} ${metric === "deliveries" ? "vehicles" : "gigawatt hours"}"><span class="bar" style="height:${(v / max) * 100}%"></span><small>${data.chart.years[i]}</small></button>`,
    )
    .join("");
  $$(".bar-wrap").forEach((b) => {
    b.onmouseenter =
      b.onfocus =
      b.onclick =
        () => chartValue(Number(b.dataset.year));
  });
  chartValue(4);
}
$$("[data-metric]").forEach(
  (b) =>
    (b.onclick = () => {
      metric = b.dataset.metric;
      $$("[data-metric]").forEach((x) => {
        x.classList.toggle("active", x === b);
        x.setAttribute("aria-pressed", x === b);
      });
      chart();
    }),
);
function toast(text) {
  $("#toast").textContent = text;
  $("#toast").classList.add("show");
  setTimeout(() => $("#toast").classList.remove("show"), 2500);
}
async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast("Copied to clipboard");
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    $("#detail-content").append(ta);
    ta.select();
    toast("Clipboard unavailable. Select and copy the text below.");
  }
}
document.addEventListener("click", (e) => {
  const b = e.target.closest(
    "[data-company],[data-question],[data-copy],[data-link]",
  );
  if (!b) return;
  if (b.dataset.company) openCompany(b.dataset.company);
  if (b.dataset.question) openQuestion(b.dataset.question);
  if (b.dataset.copy) {
    const q = data.questions.find((x) => x.id === b.dataset.copy);
    copy(
      `${q.title}\n\n${q.short}\n\n${q.deep}\n\nWhy it matters: ${q.meaning}\n\nStill open: ${q.unknown}\n\nSources:\n${q.sources.map((id) => `${data.sources[id].title}: ${data.sources[id].url}`).join("\n")}\n\nResearch checked: ${data.reviewedAt}`,
    );
  }
  if (b.dataset.link)
    copy(`${location.origin}${location.pathname}#question-${b.dataset.link}`);
});
const notes = $("#notes");
try {
  notes.value = localStorage.getItem("almanac-notes") || "";
  if (notes.value) $("#save-state").textContent = "Saved in this browser.";
} catch {
  $("#save-state").textContent =
    "Browser storage unavailable. Use Export notes.";
}
notes.oninput = () => {
  try {
    localStorage.setItem("almanac-notes", notes.value);
    $("#save-state").textContent = "Saved in this browser.";
  } catch {
    $("#save-state").textContent = "Could not save. Export your notes.";
  }
};
$("#export-notes").onclick = () => {
  const blob = new Blob(
    [`# My Elon Almanac perspective\n\nPersonal opinion\n\n${notes.value}\n`],
    { type: "text/markdown" },
  );
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = "my-almanac-notes.md";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("Notes exported");
};
let paused = matchMedia("(prefers-reduced-motion: reduce)").matches;
function motion() {
  document.body.classList.toggle("paused", paused);
  $("#motion").setAttribute("aria-pressed", paused);
  $("#motion").setAttribute(
    "aria-label",
    paused ? "Resume motion" : "Pause motion",
  );
  $("#motion").textContent = paused ? "▷" : "Ⅱ";
}
$("#motion").onclick = () => {
  paused = !paused;
  motion();
};
motion();
document.addEventListener("keydown", (e) => {
  if (
    e.key === "/" &&
    !dialog.open &&
    !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
  ) {
    e.preventDefault();
    $("#archive-search").focus();
    $("#archive").scrollIntoView();
  }
});
companyCards();
questionCards();
chart();
enhance({
  data,
  $,
  $$,
  esc,
  sourceLink,
  show,
  copy,
  toast,
  openCompany,
  openQuestion,
});
function route() {
  if (location.hash.startsWith("#question-"))
    openQuestion(location.hash.slice(10));
  if (location.hash.startsWith("#company-"))
    openCompany(location.hash.slice(9));
}
route();
window.addEventListener("hashchange", route);
