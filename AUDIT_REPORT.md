# Focused website audit — 10 September 2026

Scope: targeted code review and desktop/mobile browser checks of challenge discovery, review readability and device-local saving. This was a lightweight refinement pass, not an exhaustive accessibility, security or challenge-content audit. The translucent design and existing practice runtime remain in place. No new dependencies were added.

## Fixed in this pass

- **Preserve unreadable saved data.** Startup previously caught a parsing/validation error, then enabled the save effect, which could replace the original data with empty defaults. Saving now pauses until a valid backup is imported. Progress offers a download of the original unreadable data for recovery.
- **Accurate save feedback.** Storage quota/access failure no longer leaves the editor saying “Draft saved.” It displays an export prompt instead; a successful later write clears the failure state.
- **Find unfinished work and local projects.** Added Completed/Not completed and Browser exercises/Local labs filters. Completion respects self-reviewed labs. Clear filters resets the new controls too.
- **Find the expansion.** Added the expansion source filter and trimmed search whitespace. The library now shows a check for self-reviewed labs.
- **Readable review counts.** Changed review-summary text from the muted surface colour to the secondary text colour.
- **Backup clarity.** Backup copy explicitly includes review answers. Expanded filters wrap on small screens.

## Larger changes to consider

| Priority | Finding and evidence | Proposed change | Approximate scope |
|---|---|---|---|
| Completed | Lazy-loaded screens have no error boundary or update-recovery flow. A tab left open across a deployment can request a removed chunk and fail to open a screen. | Add a boundary with a safe “Reload latest version” action, preserving/exporting current drafts before reload; test an intentionally missing chunk. Avoid automatic reload loops. | Completed |
| Completed | The build reports a main chunk above 500 kB before compression. The bank, reference solutions and explanation data travel through app imports. | Load challenge metadata first, and load reference content/editor/chart features only when needed. Measure cold-load and first-run time before choosing further optimisations. | Completed |
| Completed | Current view and filters are React state; refresh returns to Discover, and individual challenges do not have shareable URLs. | Add URL state for challenge IDs and main views, with browser Back/Forward support and GitHub Pages-compatible hash routing. Keep timer/draft state independent. | Completed |
| Completed | Every progress edit serialises the full backup into synchronous localStorage; quota failure now has honest feedback, but capacity and multi-tab overwrites remain limitations. | Consider IndexedDB plus explicit multi-tab conflict handling. Preserve a last-known-good snapshot and provide a tested migration. Do not add account/cloud sync for personal use without a specific need. | Medium–large |
| Completed | Output tests cannot prove a required algorithm or explain reasoning. Some generated solution notes only paraphrase syntax. | Review the most demanding exercises first: add targeted incorrect-solution tests, then replace weak notes with brief explanations of invariants and design choices. Keep rubric evidence separate from automated passing results. | Ongoing content work |
| Completed | Eight theory modules live under Sources, while practical and theory progress use different navigation paths. | Consider a dedicated Review destination, with links to the exact module/question from coverage and a count of unanswered questions. | Small–medium |

## Verification and limits

- TypeScript checks, study/backup regression suite and production build pass.
- Storage regression checks cover initial loading, preserving unreadable data, quota failure and successful saving. They test the storage boundary; OS-level storage denial was not forced in the browser.
- Browser checks: Local labs returns eight entries; Completed shows the expected empty state on a fresh progress record; Clear filters restores 89 entries.
- Mobile check at 390 × 844: filters wrap and document width remains 390 px.
- Existing full checks also run in the GitHub Pages deployment pipeline. No runtime or lab content was changed in this pass.
- Full keyboard/screen-reader testing, network-failure simulation, performance profiling and all 89 challenge correctness reviews are deferred. This report does not claim those audits are complete.

Design reference: the project's pinned Apple design skill, particularly accessibility and search guidance. Practical priority: readable status, predictable filtering and preserving the user's work.

## High-priority recovery change — implemented

Every lazy-loaded screen now has a recovery boundary that keeps the main app and current drafts mounted. A failed screen offers **Export current work** and **Reload latest version**. Reload first attempts an immediate save; when storage is unavailable or recovery is paused, it requires a backup export. The user is told to verify the download. Editing work after an export invalidates that export's reload permission. No automatic reload or retry loop runs. Active exam deadlines remain unchanged.

Verified locally by temporarily removing the built quick-actions chunk, opening it, confirming the recovery UI and continued challenge navigation, editing a draft, restoring the chunk and explicitly reloading. The draft survived and quick actions loaded successfully. Regression checks cover reload permission for successful, failed and paused saves. Typecheck, study checks and production build pass. Initial HTML/main-script network failures remain outside React recovery because the app has not yet started.

## Remaining changes — implemented 11 September 2026

- **On-demand content:** the initial catalogue contains metadata and counts. Each exercise, input fixtures and checks load when opened; its reference solution and line guide load only on reveal. Home artwork, editor, visualisations and charts remain separate chunks. A generator and consistency test preserve all 89 exercises. Failed exercise/reference requests offer a retry and never install an empty starter over a draft.
- **Shareable navigation:** hash URLs work on GitHub Pages for challenges, views, filters and specific review questions. Back/Forward and refresh preserve the destination. “Copy challenge link” includes the problem, not the user's code. Unknown views fall back safely; unavailable challenge IDs show a recoverable loading error.
- **Resilient local storage:** IndexedDB replaces repeated synchronous localStorage writes. Changes are debounced, commits are transactional, and the previous valid snapshot can be exported from Progress. Existing localStorage backups migrate after validation and remain untouched. An unreadable newest snapshot falls back to its valid predecessor. Storage failure keeps current work in memory with an export message.
- **Multi-tab protection:** atomic revision checks prevent stale writes even without broadcast support. A newer save pauses the older tab. Users can export and explicitly choose the newer saved version or their current tab's version; concurrent changes are checked again. Reload flushes current work first, and navigation warns when work remains unsaved.
- **Review destination:** a dedicated Review item includes an unanswered-question count, module links from syllabus coverage and direct question URLs. Model answers and checklist status remain separate from automated marks.
- **Assessment quality:** reviewed five demanding exercises (shared storage, sequential updates, tournament trees, path ranking and register imports). Five deliberately incorrect implementations now fail targeted checks. Added four edge cases, including a two-item equal-score case that exposed a real hole in the former stability test. Revised 18 line notes to explain invariants, bounded memory, transaction order and rollback; added corresponding manual reasoning criteria. The 19 expansion references now pass 57 checks.

### Measured results and verification

The deployed pre-change main JavaScript was 677,537 bytes; the revised build is approximately 554 KB, an 18% reduction. Locally gzip-compressed sizes fell from 204,489 bytes to about 165 KB (19%). Exercises and reference data moved to independent files, so the editor, solution guides and charts are not all required for Discover. The main bundle still exceeds the build tool's 500 KB advisory; this is a measurement, not a claim that performance work is exhausted.

On this computer, a fresh-origin local visit reached the editor in 2.32 seconds. Its first Python run passed both examples and was observed complete within 18.60 seconds; this upper bound includes automation observation delay. These are development checks with potentially warm browser/CDN caches, not a controlled cold-network benchmark or a production speed guarantee.

Tests cover legacy migration, reopening IndexedDB, previous snapshots, corrupt-current recovery, concurrent transactions, explicit revision resolution, hash round-trips, split-content integrity, and the five incorrect solutions. Browser checks confirmed migrated draft content, newer-tab conflict handling, direct question links, filter refresh (eight local labs), Back/Forward, reference reveal, Python execution and a 390 px layout with no horizontal overflow. The existing failed-screen recovery also handled a rebuild while a tab was open.

Scope limits: initial HTML/main-script failures still precede React recovery; IndexedDB is device/browser-local and private-mode storage may be temporary; older deployed tabs still using localStorage should be refreshed before further editing. The legacy snapshot remains available for manual recovery. The five targeted content reviews do not constitute an exhaustive correctness or accessibility audit of every exercise. No accounts, cloud sync or production dependencies were added; fake-indexeddb is used only for automated tests.

## Lightweight practice QoL pass — 11 September 2026

A focused follow-up found friction in repeated run/debug cycles and choosing unfinished work. Implemented four small additions without new dependencies:

- **Editor shortcuts:** Cmd/Ctrl+Enter runs examples; Cmd/Ctrl+Shift+Enter submits. The shortcuts are shown below the editor and are absent for local labs. Existing Tab completion remains intact; execution guards still reject an additional run while busy.
- **Stale-result feedback:** changing code or standard input after a run displays an explicit warning. Earlier results stay available for comparison, and submissions still record the code actually executed.
- **Copy debug report:** captures the tested code and input, every test call, expected/actual values, errors, raw returns, stdout and stderr. A text download is offered automatically when clipboard access fails. Reports are produced locally and are not sent to a service.
- **Unfinished practice:** opens an unfinished challenge from the current filtered list, preferring another challenge over the current one. It respects automated completion and lab self-review, and disables when no unfinished match exists.

Validation: targeted tests cover filtered selection, completed labs, no matches, changed code/input and report fields. Browser checks confirmed both Mac keyboard shortcuts, recorded submission results, the stale-draft warning, and selection of a local lab while the Local labs filter was active. Typecheck and production build pass; deployment runs the full existing suite. This was not another full-site audit.

## Solution explanation pilot — 11 September 2026

The approved three-challenge pilot covers shared linked-list storage, recursive tracing and transactional CSV import. Each now presents an approach, a short guide to key code blocks, a worked trace, common mistakes and a qualified complexity note. The original line-by-line detail remains available but starts collapsed for these three challenges. Reference content still loads only when revealed.

Expanded the recursive solution's conditional expression into an explicit base case and recursive branch. Other reference code was retained. All nine existing checks for the three solutions pass in the Python worker; unfinished starters still fail. Content/guide consistency, typecheck, build and browser reveal checks pass. Further rollout awaits user review of the pilot.
