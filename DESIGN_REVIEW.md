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
