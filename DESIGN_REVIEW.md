# Design review: Practical / 9569

## Summary
A new discovery experience and application shell replace the sidebar dashboard. The user requested a ground-up rebuild inspired by Apple's website, with animated buttons, backgrounds and interactive elements. The result uses large editorial headings, focused sections, pill controls, a translucent navigation layer and original code-themed artwork. The practice engine, problem bank and storage schema are retained.

## Research and design direction
- [Apple home](https://www.apple.com/) and [Mac](https://www.apple.com/mac/), reviewed September 9, 2026: prominent headlines, focused calls to action, a product collection and separate feature sections informed the discovery layout. This is an interpretation for a study tool; it does not reproduce Apple branding or product imagery.
- [Apple design skill](https://github.com/dickwu/apple-design-skill), pinned in `.design-rules`: consulted accessibility, color, typography, layout, entering-data, dark-mode, motion, materials and liquid-glass references. Glass is restricted to navigation rather than question content.
- [Apple motion guidance](https://developer.apple.com/design/human-interface-guidelines/motion): brief feedback, optional movement and restrained motion in frequent interactions.
- [Vercel Web Design Guidelines](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines): labels, visible focus, reduced motion and touch behavior.
- [Vercel React Best Practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices): off-screen list rendering and loading the editor on demand.
- [Anthropic frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design): researched in the previous revision; Apple remains the primary aesthetic direction.

## Components and motion
- [shadcn/ui with Base UI](https://ui.shadcn.com/docs/components/base/tabs): buttons, tabs, inputs, native selects and progress meters. Problem tabs support arrow-key focus and Enter activation.
- [Motion for React](https://motion.dev/docs/react): section entrances, shared navigation indicator, card hover/tap feedback and the code-window introduction.
- [Motion accessibility](https://motion.dev/docs/react-accessibility): MotionConfig follows system reduced motion. The page's pause control pauses decorative CSS animation and disables Motion transforms.
- Lucide icons and CodeMirror remain in use. Artwork is original CSS/HTML/SVG rather than downloaded assets.
- Ambient background shapes and the code caret animate on discovery only. Reading and coding surfaces have no continuous decorative animation.

## Improvements implemented
- New discovery page: code-window artwork, interactive topic collection, resume card, real progress ring, exam feature and footer.
- New global navigation with an animated selection indicator; mobile uses a floating bottom bar.
- A dedicated full-width workspace with focus mode and viewport-sensitive editor height.
- Redesigned challenge library, topic pills, progress and exam surfaces.
- System appearance, semantic contrast, reduced transparency, reduced motion and focus outlines.
- Editor loads separately, reducing initial JavaScript from about 993 kB to 509 kB before compression.

## Critical issues found and fixed during review
- Fixed positioning for mobile navigation initially conflicted with the blurred header's containing block. Mobile header blur is removed; the floating navigation retains its material.
- Fixed editor height pushed Run controls below short desktop viewports. Editor now adapts between 260 and 420 px.
- Focus mode initially affected overview layouts after navigation. Its styles now apply only to the practice workspace.
- Navigation now returns the new view to the top rather than preserving an unrelated discovery-page scroll position.

## Validation
- TypeScript and production build pass.
- Browser review at the default 1280 × 720 viewport and at 390 × 844. Mobile document width is 390 px without page overflow.
- Confirmed topic collection opens the Algorithms filter with 16 matching challenges.
- Confirmed arrow-key tab focus, Enter activation and focus-mode toggle.
- Confirmed `pri` + Tab opens completion options and Enter inserts `print`.
- Executed the first challenge with a binary-search implementation: 2/2 example tests passed. Restored the test draft afterward; tests were performed on a separate localhost origin, not the public site's saved work.
- Pause control changes state and the motion classes/configuration are wired to it.
- No browser console errors observed at completion.
- Calculated semantic text pairs in both appearances all exceed 4.5:1; light secondary text is at least 5.47:1 and dark secondary text at least 7.79:1 in tested surface/background pairs.

## Positive notes and limits
The challenge bank, user backup format, tab completion and Python worker are unchanged. Source credits and self-assessed lab distinctions remain available. This is not a full assistive-technology audit; OS-level light/dark and reduced-motion preferences were checked in source rather than switched on the user's computer. The main bundle still produces a size advisory; further splitting is optional. Challenge/filter state remains in memory instead of shareable URLs.

## September 2026 audit and practice workflow pass

The supplied implementation audit is addressed across Discover, the editor, Progress, Sources and exam practice. Existing Apple design rules were retained; additional references consulted cover focus/selection, loading and charts. No new library was added: Motion, Embla, cmdk and Recharts were already installed. The app remains static, uses the existing device-local storage key, and exports/imports version-1 backups with optional new fields.

### Design and interaction (audit 1–8, 16–18)

- Added Open Graph and Twitter metadata with an original 1200 × 630 sharing image.
- Kept the main hero kicker and removed repeated secondary labels. Workspace surfaces share the same generous radii, restrained shadows, typography and short transitions as Discover.
- View changes use a 180 ms fade/slide, with reduced-motion and pause controls respected. Loading states show shaped code skeletons; successful checks draw a single checkmark.
- The hero code types once per page visit and its window tilts with a mouse pointer. Both stop with reduced motion or the pause control; tilt ignores touch. Colorful collection art deliberately remains saturated in dark appearance, with neutral readable surrounding surfaces.
- Embla now provides collection dragging, arrow controls and pagination. Cmd/Ctrl+K opens searchable challenges, syllabus points, mock practice and appearance actions.
- The explicit system/light/dark choice implements the audit's requested theme control while defaulting to system appearance. Editor colors follow the same preference. Reduced transparency and increased contrast branches cover the new surfaces and dialogs.
- Discover's date control persists the sitting date and computes calendar days, including today/past-date messages. A browser check caught native date-input event handling; handling input as well as change fixed immediate updates and persistence.

### Study tools (audit 9–15)

- Progress lists all 73 numbered learning outcomes in the official 2026 syllabus. Existing references are expanded, including ranges, and distinguish untouched, in progress, complete/self-reviewed and unmapped outcomes. Coverage indicates the exercise mappings, not mastery; theory-only outcomes and practical content gaps remain explicitly unmapped. Palette selection scrolls to and outlines the selected outcome.
- Topic rings separate auto-checked challenges from self-reviewed labs. Weak-topic shortcuts use full-submission pass rates, with unattempted topics shown without a fabricated percentage. Recharts plots retained daily submissions and session scores, with textual counts available for accessibility. Each challenge still retains its latest 20 submissions.
- Balanced and weak-topic mock builders select four unique tasks across broad practical areas. Task budgets divide 180 minutes proportionally to the existing estimates; both budget and original estimate are visible.
- Completed exam records preserve dates, elapsed time, tasks and session-only latest test results. Earlier solved status cannot inflate a new session. Ending a session uses an accessible in-app confirmation and freezes its remaining clock.
- Sources groups the actual school/year tags in the bank into named collections. These are adapted collections, may have other than four tasks, and are not represented as complete original papers.
- Guided local labs provide a persistent timer, rubric steps and notes. Partial sessions appear in history without being marked fully reviewed. Lab self-review remains distinct from executable test results.

### Editor and explanations requested alongside the audit

- Four-space indentation guides, current line/column/indent status and selected-line count make Python nesting visible. Selection uses a stronger blue text-range highlight plus a separate whole-line tint. Existing Tab completion is preserved.
- Test details show the raw Python return representation, printed stdout and stderr separately. Output captured before an exception remains visible; existing timeout and output-size limits remain in place.
- All 60 reference solutions have concise, static explanations covering all 540 nonblank source lines. Numbered code and matching explanation numbers support comparison. These do not make model calls or spend tokens during practice. Active exams continue to hide solutions.

### Validation and remaining scope

- Type checking, production build and the new `npm test` checks pass. Deployment now runs these tests as well.
- Study checks cover all bank references, unique balanced papers, 180-minute budgets, session-only scoring, legacy/new backup round trips, invalid backups, topic rates, date arithmetic and complete explanation coverage.
- The actual Python worker was exercised with Pyodide for tuple representations, JSON comparisons, stdout, stderr, exceptions and output caps.
- Browser checks on a separate localhost origin covered Python runs and submission, multiline selection and guides, reference explanations, theme persistence, palette search, coverage navigation, countdown persistence, ending/reloading an exam and saving a partial guided lab with notes. Desktop and 390 px mobile layouts were inspected. No console errors remained. Tests did not alter the public site's saved work.
- **Content gap (audit 19): Databases has 6 exercises, compared with 21 Python & files exercises.** This pass improves practice tools; it does not fill that content gap. Original private exam PDFs, marking schemes and resource packs remain excluded.
- The main JavaScript chunk still triggers Vite's size advisory (about 590 kB before compression). The editor, charts, palette and solution guides load separately. Full assistive-technology and all operating-system preference testing remains outside this browser review.

The earlier notes above describe the previous redesign; this section supersedes their statements that the backup schema and worker were unchanged.

## Dark canvas and MongoDB emulation

### Design review — good; improved depth with protected reading surfaces

The dark-background prompt extends the existing atmosphere rather than introducing another visual system. The review used the pinned skill's Accessibility, Color, Layout, Typography, Dark Mode, Materials and Motion references. The relevant principles are sufficient text contrast, clear base/elevated planes, and optional decorative motion.

- A single fixed, pointer-transparent, screen-reader-hidden canvas now sits behind every view. Its soft radial top-light fades from `#191b22` into the existing `#101012` background.
- Three blurred blobs reuse `ambient-drift`, `--hero-tone` and color mixing at a combined 6% opacity, on a slower 32-second cycle. The first tint follows the active topic or section. A locally generated SVG grain tile uses 3% opacity and soft-light blending; it never overlays text or controls.
- Dark elevated surfaces move to `#202024`, with a faint inner top edge on cards and workspace panels. Reading and code surfaces stay opaque. Light mode does not show the canvas and retains white surfaces.
- Reduced motion stops drift and clears `will-change`; the existing pause button also pauses the new layer. Increased contrast and reduced transparency remove the decorative canvas entirely.
- Measured secondary-text contrast is 7.52:1 on the raised surface. A deliberately conservative upper bound for the brightest gradient, accent and grain combination gives 6.80:1 on the canvas, above the 4.5:1 body-text requirement.
- Browser review covered dark workspace/Progress, section tint, pause state, light-mode fallback and a 390 × 844 viewport with no horizontal overflow. OS-level media preferences were verified in CSS, not changed on the user's computer. No browser console errors were observed.

### MongoDB-style practice

The worker adds an independent `mongo` package-loading path. It installs `mongomock==4.3.0`, `packaging==24.2`, `sentinels==1.1.0` and `pytz==2025.2` through micropip only when needed. Python and SQL execution paths are preserved: only SQL skips execution of the student's code. The existing package-loading window remains separate from the 10-second code-execution limit, and Stop remains available.

The exact Pyodide 0.28.2 runtime was checked first. A two-test nested-query pilot then passed through the real browser editor before expanding the bank. The five new exercises cover insert/find, nested filters and projections, `$set` updates, deletion/counts, and `$match`/`$group`/`$avg`/`$sum`/`$sort` aggregation. Each has four tests, hints, fixtures/setup helpers and brief line explanations. Mutation exercises check stored data as well as return values; edge cases include empty input, missing fields, boundaries, unchanged updates and tied averages.

There are now 65 exercises, including 62 auto-graded exercises and the existing three labs. Databases has 11 exercises; the original MongoDB lab and its downloadable archive are unchanged. New copy clearly describes emulation, fresh per-test collections, the `mongomock`/`pymongo` naming difference and the limits of this approach. This follows [mongomock's documented scope](https://pypi.org/project/mongomock/4.3.0/), which does not promise a perfect MongoDB replica. Package loading follows [Pyodide's micropip guidance](https://pyodide.org/en/0.28.2/usage/loading-packages.html).

Validation: typecheck/build and `npm test` pass. New tests exercise all 20 Mongo reference checks, reject unfinished starters, verify collection isolation, preserve output on exceptions, and run existing Python/SQLite references. Browser checks confirm pilot grading, four-test aggregation submission, raw output and database progress. Tests use a separate localhost origin. No private papers or school resources were added. Runtime packages are fetched on demand, with no new frontend npm dependency.


## Interactive Visualisations — September 2026

Added a lazy-loaded learning page with 33 topics across searching, sorting, control flow, structures, recursion and graph algorithms. The existing Apple design skill and its layout, typography, motion, colour, dark-mode and accessibility references informed the review. The page reuses the app's colour tokens, Button component, navigation, Motion configuration and validated backup system.

The landing page introduces one restrained insertion-sort demonstration, followed by searchable categories, difficulty/type filters, recommendations and recent lessons. On desktop, the stage and Python are adjacent; on mobile, controls and explanations precede code. Mobile navigation uses “Learn” for the new section. Array values keep stable identities through swaps and shifts; linked-list steps change actual edges. Directed graph edges include arrowheads, self-loops and separate opposing connections. Only edges in the final shortest path are emphasised.

Algorithm generators produce bounded, deterministic snapshots without DOM access. A shared GSAP playhead supports pause, reverse stepping, reset, speed and seeking; Motion renders state transitions. Inputs are capped at 12 values (9 for pointer trees/lists), 8 graph vertices/16 edges and small recursion depths. Generation occurs when inputs change, never per animation frame. The feature is a separate approximately 54 KB gzipped JavaScript chunk. No 3D or remote animation service is required. References: [GSAP timeline](https://gsap.com/docs/v3/GSAP/Timeline/) and [Motion layout animation](https://motion.dev/docs/react-layout-animations/).

Keyboard shortcuts avoid form fields and dialogs. Current Python lines use aria-current; manual explanations are announced, automatic playback avoids repetitive announcements. Reduced motion removes spatial transitions and disables the hero's autoplay. The existing pause-motion control and high-contrast/transparency preferences remain supported. SVG/array accessible descriptions accompany colour, arrows, pointer names and visited checks. Completion means the user reached the final step, not mastery or an exam mark; predictions and recently viewed dates persist in device-local backups.

Validation: 1,254 generated traces cover defaults, all structure operations, duplicate/negative/empty inputs, ordering, heap invariants, tree deletion, searches and recursion. All 33 displayed Python examples parse; sorting, control flow, scalar recursion, simple structures and graph results are compared with executable Python. Random directed shortest-path graphs are also checked against independent Bellman–Ford relaxation. Existing study, Python worker, SQLite and MongoDB checks pass. Browser checks cover desktop and 390px mobile layouts, search, navigation, stepping, timeline completion, keyboard reset/step, playback, predictions, repeated push/pop and shortest-path output. No horizontal page overflow at 390px; large individual diagrams/code remain scrollable.

Complexity notes describe the displayed implementation, including list-copying recursion, unbalanced BSTs, deque queues and quadratic-scan Dijkstra. Binary search and heaps explicitly prepare their input before playback. The visualisations teach selected operations rather than tracing every Python interpreter event. Input caps keep the illustrations legible; no measured 60 FPS guarantee is claimed across devices. Uploaded papers and private resource packs remain excluded.

## Liquid glass material — 10 September 2026

Implemented the supplied material-only brief in globals.css. Light and dark canvases now share topic-aware ambient tones, with different section wash placement. All named panel families use translucent material, layered rim/inset/elevation shadows and varied specular light. Gentle lift is limited to non-editing tiles and suppressed by reduced-motion/pause settings. Existing layout, copy, radii, code surfaces and application logic are unchanged.

Blur is restricted to container panels. Repeated cards and syllabus tiles use translucent highlights without individual backdrop filters; at 1100px and below, container blur is disabled and opacity increases. Reduced-transparency and high-contrast guards remove ambient/specular layers and use opaque panels, preserving completion colours and borders. These preference rules were reviewed in source; OS preferences were not changed. Prefixed backdrop declarations now precede standard declarations so the production CSS retains the Chromium-compatible property.

Production build passed. Browser review covered light/dark challenge panels, the dark editor and 390px/1024px layouts. Computed styles confirmed 18px blur on desktop and no container blur on smaller screens; no page overflow or console errors were observed. The existing Apple design skill's material guidance informed the readability/depth balance.

## Translucent surfaces and syllabus expansion (10 September 2026)

Removed the specular gradient material and decorative background washes at the user's request. Main surfaces use a single translucent colour, a restrained border and 16px backdrop blur; small-screen and reduced-transparency fallbacks avoid excessive filtering. Motion, editor selection and indentation cues remain functional.

Implemented the 24 planned practical tasks: 19 browser-checked exercises and five downloadable Flask/SQLite, Pillow, real MongoDB and socket projects. The bank now contains 89 challenges (81 browser exercises, eight local labs). Eight original theory modules add 30 short questions, model answers and self-review criteria. Review answers persist, reset their review tick when edited, and travel in backups. Theory coverage links to the review modules; automated exercises expose any manual approach rubric alongside debugging notes. New solution code has brief line explanations.

Validation: typecheck and production build; existing study, worker, Mongo emulator and visualisation suites; 53 checks for all 19 new automatic solutions with unfinished starter rejection. Five freshly extracted lab packs were verified with their real dependencies, including a separate local MongoDB instance and socket connections. CI runs the same lab checks with a MongoDB service. Browser verification confirms a translucent panel background, no canvas or panel gradient, working review disclosure and persisted notes/checkmarks.

The expansion uses original fictional data; no uploaded school papers or marking schemes are included. Data stewardship references the PDPC's official Data Protection Obligations overview.
