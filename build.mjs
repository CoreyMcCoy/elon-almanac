import { copyFile, mkdir } from "node:fs/promises";

const output = new URL("./dist/", import.meta.url);
await mkdir(new URL("assets/", output), { recursive: true });

// Publish only browser assets; the development server is not a function.
const files = [
  "index.html",
  "styles.css",
  "app.js",
  "enhancements.js",
  "content.json",
  "research.json",
  "favicon.ico",
  "README.md",
  "assets/demo2.jpg",
];

for (const file of files) {
  await copyFile(new URL(file, import.meta.url), new URL(file, output));
}

console.log(`Built ${files.length} static files in dist/.`);
