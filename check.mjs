import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
const data = JSON.parse(
  await readFile(new URL("content.json", import.meta.url), "utf8"),
);
const research = JSON.parse(
  await readFile(new URL("research.json", import.meta.url), "utf8"),
);
Object.assign(data.sources, research.sources);
data.timeline = research.timeline;
assert.match(data.reviewedAt, /^\d{4}-\d{2}-\d{2}$/);
for (const [id, s] of Object.entries(data.sources)) {
  assert(s.title && s.publisher && s.type && s.date, `Incomplete source ${id}`);
  assert.equal(new URL(s.url).protocol, "https:", `Unsafe source URL ${id}`);
}
const refs = (ids) => {
  for (const id of ids) assert(data.sources[id], `Missing source ${id}`);
};
for (const list of [data.companies, data.questions]) {
  assert.equal(
    new Set(list.map((x) => x.id)).size,
    list.length,
    "Duplicate content IDs",
  );
  for (const item of list) {
    assert.match(item.id, /^[a-z0-9-]+$/);
    assert(item.sources.length > 0);
    refs(item.sources);
  }
}
for (const c of data.companies) {
  for (const key of [
    "name",
    "status",
    "mission",
    "summary",
    "development",
    "next",
    "problem",
    "accomplishment",
    "benefit",
    "unproven",
  ])
    assert(c[key], `Missing ${key} for ${c.id}`);
  assert(["public", "private", "division"].includes(c.category));
  assert(
    data.questions.some((q) => q.id === c.question),
    `Unknown explainer for ${c.id}`,
  );
}
for (const q of data.questions)
  for (const key of [
    "title",
    "topic",
    "short",
    "deep",
    "fact",
    "claim",
    "meaning",
    "unknown",
  ])
    assert(q[key], `Missing ${key} for ${q.id}`);
for (const item of [...data.news, ...data.timeline])
  refs([item.source, ...(item.extraSource ? [item.extraSource] : [])]);
for (const metric of ["deliveries", "energy"]) {
  assert.equal(data.chart[metric].length, data.chart.years.length);
  assert(data.chart[metric].every((v) => Number.isFinite(v) && v >= 0));
}
refs([data.chart.source]);
const html = await readFile(new URL("index.html", import.meta.url), "utf8");
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
assert.equal(ids.length, new Set(ids).size, "Duplicate DOM IDs");
for (const [, id] of html.matchAll(/href="#([^"]+)"/g))
  assert(ids.includes(id), `Missing anchor ${id}`);
for (const file of ["app.js", "enhancements.js", "server.mjs"]) {
  const result = spawnSync(
    process.execPath,
    [
      "--check",
      new URL(file, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"),
    ],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
}
assert(
  (await stat(new URL("assets/demo2.jpg", import.meta.url))).size > 10000,
  "Missing launch image",
);
console.log(
  `PASS: ${data.companies.length} dossiers, ${data.questions.length} explainers, ${Object.keys(data.sources).length} sources, ${data.timeline.length} milestones; data references, chart series, anchors, scripts and image verified.`,
);

for (const group of [
  "chapters",
  "ventures",
  "predictions",
  "timeline",
  "connections",
]) {
  const list = research[group];
  assert(list.length, `Empty ${group}`);
  assert.equal(
    new Set(list.map((x) => x.id)).size,
    list.length,
    `Duplicate ${group} IDs`,
  );
  for (const item of list) {
    assert.match(item.id, /^[a-z0-9-]+$/);
    refs(
      item.sources || [
        item.source,
        ...(item.extraSource ? [item.extraSource] : []),
      ],
    );
    for (const id of item.related || [])
      assert(
        data.questions.some((q) => q.id === id),
        `Unknown related question ${id}`,
      );
  }
}
for (const r of research.predictions) {
  assert(["demonstrated", "missed", "open"].includes(r.status));
  for (const field of [
    "claim",
    "criterion",
    "outcome",
    "story",
    "stated",
    "deadline",
  ])
    assert(r[field], `Missing prediction ${field}`);
}
for (const r of research.chapters) {
  assert(r.story.length >= 2);
  assert(r.interpretation);
}
for (const r of research.connections)
  for (const id of [r.id, ...r.children])
    assert(
      data.companies.some((c) => c.id === id),
      `Unknown company in map ${id}`,
    );
console.log(
  `PASS: ${research.chapters.length} chapters, ${research.ventures.length} historical ventures, ${research.predictions.length} assessments, ${research.connections.length} company branches; sources and relationships verified.`,
);
