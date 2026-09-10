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
| High | Lazy-loaded screens have no error boundary or update-recovery flow. A tab left open across a deployment can request a removed chunk and fail to open a screen. | Add a boundary with a safe “Reload latest version” action, preserving/exporting current drafts before reload; test an intentionally missing chunk. Avoid automatic reload loops. | Medium |
| Medium | The build reports a main chunk above 500 kB before compression. The bank, reference solutions and explanation data travel through app imports. | Load challenge metadata first, and load reference content/editor/chart features only when needed. Measure cold-load and first-run time before choosing further optimisations. | Medium |
| Medium | Current view and filters are React state; refresh returns to Discover, and individual challenges do not have shareable URLs. | Add URL state for challenge IDs and main views, with browser Back/Forward support and GitHub Pages-compatible hash routing. Keep timer/draft state independent. | Medium |
| Medium | Every progress edit serialises the full backup into synchronous localStorage; quota failure now has honest feedback, but capacity and multi-tab overwrites remain limitations. | Consider IndexedDB plus explicit multi-tab conflict handling. Preserve a last-known-good snapshot and provide a tested migration. Do not add account/cloud sync for personal use without a specific need. | Medium–large |
| Medium | Output tests cannot prove a required algorithm or explain reasoning. Some generated solution notes only paraphrase syntax. | Review the most demanding exercises first: add targeted incorrect-solution tests, then replace weak notes with brief explanations of invariants and design choices. Keep rubric evidence separate from automated passing results. | Ongoing content work |
| Low | Eight theory modules live under Sources, while practical and theory progress use different navigation paths. | Consider a dedicated Review destination, with links to the exact module/question from coverage and a count of unanswered questions. | Small–medium |

## Verification and limits

- TypeScript checks, study/backup regression suite and production build pass.
- Storage regression checks cover initial loading, preserving unreadable data, quota failure and successful saving. They test the storage boundary; OS-level storage denial was not forced in the browser.
- Browser checks: Local labs returns eight entries; Completed shows the expected empty state on a fresh progress record; Clear filters restores 89 entries.
- Mobile check at 390 × 844: filters wrap and document width remains 390 px.
- Existing full checks also run in the GitHub Pages deployment pipeline. No runtime or lab content was changed in this pass.
- Full keyboard/screen-reader testing, network-failure simulation, performance profiling and all 89 challenge correctness reviews are deferred. This report does not claim those audits are complete.

Design reference: the project's pinned Apple design skill, particularly accessibility and search guidance. Practical priority: readable status, predictable filtering and preserving the user's work.
