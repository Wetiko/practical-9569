# Design review: Practical / 9569

## Summary
The original interface needed clearer navigation, readable secondary text and an adaptive appearance. The updated React workspace follows the user-selected Apple design skill, with a compact desktop sidebar, mobile bottom navigation and system light/dark appearance.

## Critical issues addressed
- Accessibility / Color: replaced the dark-only palette with semantic text, surface, action and status pairs. Status includes text or icons in addition to color.
- Layout / Accessibility: added a skip link, focus rings, safe-area spacing, reduced-motion support and larger mobile controls.
- Platform conventions: replaced problem-section buttons with shadcn/ui Base UI Tabs, providing tab semantics and arrow-key navigation.

## Improvements implemented
- shadcn/ui Button, Input, Tabs, NativeSelect and Progress are used in the actual application; CodeMirror and Lucide remain the editor and icon libraries.
- System typography and quieter surfaces put the question and code first.
- Native selects retain familiar mobile pickers. Progress meters expose their value to assistive technology.
- Challenge rows defer off-screen rendering with content-visibility.
- Python Tab completion and existing storage keys are unchanged.

## Positive notes
The original app already had clear run/submit actions, recoverable execution errors, downloadable backups and explicit separation of self-reviewed labs from checked exercises. Those behaviors are retained.

## Platform notes and verification
TypeScript validation and the production build passed. Core semantic text pairs were calculated below; this is not a complete WCAG audit. Visual and assistive-technology interaction testing has not been performed during this revision. Desktop has independent question/editor scrolling; narrower windows stack these panels; mobile exposes four primary destinations at the bottom.

| Appearance | Text / background | Contrast |
|---|---|---|
| light | foreground / surface | 16.07:1 |
| light | secondary / surface | 5.87:1 |
| light | secondary / sidebar | 5.05:1 |
| light | primary / surface | 5.95:1 |
| light | primary-foreground / primary | 5.95:1 |
| light | success / success-bg | 5.20:1 |
| light | danger / danger-bg | 5.27:1 |
| light | warning / warning-bg | 5.93:1 |
| light | purple / purple-bg | 5.57:1 |
| dark | foreground / surface | 14.24:1 |
| dark | secondary / surface | 7.48:1 |
| dark | secondary / sidebar | 7.83:1 |
| dark | primary / surface | 7.95:1 |
| dark | primary-foreground / primary | 7.94:1 |
| dark | success / success-bg | 7.12:1 |
| dark | danger / danger-bg | 7.05:1 |
| dark | warning / warning-bg | 7.78:1 |
| dark | purple / purple-bg | 6.87:1 |

## Skills researched and selection
- [Apple design skill](https://github.com/dickwu/apple-design-skill): primary visual direction, pinned as `.design-rules`. References consulted: accessibility, color, layout, typography, dark-mode and entering-data under references/hig.
- [Vercel Web Design Guidelines](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines): applied to the changed UI files, using the current [web interface rules](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md). Used focus, labels, forms, theme metadata and reduced-motion guidance. Apple sentence-case guidance takes precedence over the conflicting title-case rule.
- [Vercel React Best Practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices): applied its rendering-content-visibility rule to the challenge library. Server/Next.js-specific rules do not apply to this Vite app.
- [Anthropic frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design): reviewed as an optional future skill; not layered over the selected Apple direction because the aesthetic guidance overlaps.
- [shadcn/ui Base UI Tabs](https://ui.shadcn.com/docs/components/base/tabs): component reference for the tab implementation.

## Remaining review items
- app/page.tsx: challenge selection and filters remain device-local/in-memory rather than shareable URL state; this predates the redesign.
- app/page.tsx: storage updates still run on editor changes; consider debounced persistence if larger drafts make typing slow.
- The production build reports a large main bundle, principally the editor/runtime UI. Lazy editor loading is a possible separate optimization.
