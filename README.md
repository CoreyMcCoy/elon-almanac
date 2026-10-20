# Elon Almanac

A local personal reference site. Edition two: October 17, 2026. Company dossiers retain their October 16 review date; the added historical research and prediction assessments are dated October 17.

## Open it

Requires Node.js 20 or newer. No packages need to be installed.

Open a terminal in this folder and run:

```powershell
npm run dev
```

Visit http://127.0.0.1:4173. The server binds only to this computer. Stop it with Control+C. If port 4173 is in use, check whether the existing preview is already running.

## What works

- Seven filterable company/platform dossiers: SpaceX, Tesla, Starlink, Neuralink, xAI, The Boring Company and X.
- Ten searchable explainers, category filters, detailed evidence and copyable answers with source links.
- Direct question links such as `http://127.0.0.1:4173/#question-reuse`.
- Historical annual Tesla deliveries and storage chart. Hover, tap or keyboard-focus a year; toggle the metric.
- Nineteen searchable timeline entries, with category filters and fuller stories.
- Eight chapters about background, working methods, leadership and criticism.
- A company relationship map and four historical ventures: Zip2, X.com and PayPal, SolarCity, and OpenAI.
- Six prediction and progress assessments, each with a claim, timing, success criterion, outcome and sources.
- Whole-archive search across 54 entries, browser-local saved entries, and related reading. Press the slash key to focus the archive search.
- Orbit animation, short startup transition, reduced-motion support and a manual pause button.
- Browser-local personal notes with Markdown export. The site does not transmit notes. Browser data deletion clears saved notes; export a backup.
- Responsive layout and native keyboard-accessible modal dialogs.

## Update the research

Company dossiers, questions, chart data and field notes are stored in `content.json`. Chapters, historical ventures, prediction assessments, the expanded timeline and relationship map are stored in `research.json`. Sources from both files are combined in the sourcebook. The timeline in `research.json` replaces the earlier timeline at runtime. This is a manual, curated update workflow. There is no automatic news collection, scheduled refresh, quote provider or simulated live feed.

1. Open the authoritative source and read the specific announcement, filing or agency record.
2. Add or update a source under `sources` with its URL, publisher, title, record type and date. Use a publication date when known. For undated living pages, the displayed date is the access/review date. Do not invent a publication date.
3. Update the relevant company, question, news item or timeline entry. Keep facts, company positions, analysis and unresolved questions in their separate fields. A company report is not independent confirmation.
4. Keep `reviewedAt` aligned with the actual review date. Update the edition labels in `index.html` when publishing a new research edition. This date describes human review, not a background system refresh.
5. Run `npm run check`. It validates source references, unique IDs, required dossier/explainer fields, safe source URL schemes, chart series, page anchors, JavaScript syntax and the local image.
6. Reload the preview and review the affected cards. If public ownership changes, update both the company status and the market strip in `index.html` after checking the listing record.

The original annual chart data is from page 8 of Tesla's fourth-quarter and full-year 2024 report. Values reflect that report's finalized annual totals, including 499,647 deliveries for 2020. The chart deliberately identifies its 2020–2024 historical range.

## Market data boundary

The market strip lists TSLA and SPCX based on checked company investor records. No market price API is connected. It displays “Quote unavailable” and no price timestamp. It never fabricates quotes, returns or intraday chart movements. A future quote integration must supply exchange, symbol, price, currency, as-of time, delay status and an explicit failure/stale-data state. Do not expose a provider secret in browser JavaScript.

## Sources and imagery

All research sources are available in the site's Sourcebook and in the two research files. The large launch photograph is NASA's May 30, 2020 Demo-2 image, credited NASA/Bill Ingalls, downloaded from:

https://www.nasa.gov/wp-content/uploads/2020/05/49952758832_376bd0b7d2_k.jpg

The orbital visual is CSS illustration, not a rendering of actual live satellites. Fonts load from Google Fonts, with system fallbacks if offline. The image and application assets are local.

## Status

Local only. No deployment, external account, subscription, database or publishing service has been created. This is an independent personal almanac, not an official company publication. Content can be updated without a build step.

## Verification for this edition

The content checker validates both research files, all 33 source references, related questions, company-map references, unique content identifiers, page anchors, chart series and script syntax. Browser verification covers whole-archive search, historical details, bookmark persistence across reload, prediction filters, related reading, timeline search and category filters, chapter selection and direct detail links. Temporary test bookmarks are removed after verification.

Personal notes still use the original browser storage key. Saved entries use a separate key. Both are local to the browser and origin; they do not synchronize across computers. Existing personal notes have not been edited.

## Packaging

`../elon-almanac.zip` contains the current local site. `../elon-almanac-edition-001.zip` preserves the preceding edition. Start the site using the local server rather than opening the HTML file directly, because the page loads its research files through the browser.

Desktop and 390-pixel phone layouts were inspected in the browser. The document, reading dialog and energy chart had no horizontal overflow. Browser error and warning logs were empty. A screenshot of the chapter section is saved beside the site folder as edition-002-chapters.png.
