# Practical / 9569

A personal H2 Computing practice app, hosted publicly on GitHub Pages.

- 65 challenges, including 23 stretch exercises and five auto-graded MongoDB exercises.
- Python, SQLite and MongoDB-style CRUD/aggregation run in-browser using Pyodide 0.28.2.
- Notebook-style Tab completion, example and custom tests, hints and solutions.
- Three-hour practice timer, bookmarks, saved drafts and JSON backups.
- Three downloadable original Flask, MongoDB and socket labs.

The public repository does not include uploaded original school papers, marking schemes or their resource packs. Challenge descriptions contain adaptation/source credits. No official exam marks are estimated.

## Local development

Use Node 22 or newer. Run `npm ci`, then `npm run dev`. Check with `npm run typecheck` and `npm test`, then build with `npm run build`.

The Vite base path is `/practical-9569/`. Every worker and download path is resolved against it. GitHub Actions deploys on pushes to main.

## Saved work

Drafts and progress are stored locally in the browser, not in this repository. A different website address has separate browser storage: export a backup from your previous workspace, then import it on this site.

First Python execution needs internet to load Pyodide. MongoDB exercises install mongomock 4.3.0 and its pure-Python dependencies using micropip on demand. This emulates the collection API for CRUD and basic aggregation; it is not a complete MongoDB server. Tests receive fresh in-memory collections. Real MongoDB servers, Flask servers and raw TCP sockets remain in the downloadable local labs.
