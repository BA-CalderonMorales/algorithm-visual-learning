# Navigation and control clarity audit

Reviewed and updated locally on 2026-10-06. The user approved applying the
lesson-level findings after reviewing the core-navigation pattern. The inventory
below preserves the original evidence; all nine groups are now addressed.
Publication is tracked by the repository's commit history and Pages workflow.

## Pattern applied to core navigation pages

Home, Algorithms, Discrete Mathematics, Complexity, and the locally enabled
Problems directories now share the same destination controls, including
Connections views and the Two Pointers directory:

- Destination links use `src/shared/ui/navigation-link`: sharp edges, an outline,
  a quiet filled surface, a minimum 44px height, an arrow, and hover/focus feedback.
- Linked titles are underlined, without navigation arrows.
- Algorithms' table study links use the same component; sortable headings have
  a visible outline and retain their sorting arrows, not destination arrows.
- The catalog's inline Complexity reference is now an actual underlined link,
  not a text-styled button that navigates. Filtering and sorting remain unchanged.
- Problems remains feature-gated for production. No new domain is being released.

Keep semantics: anchors navigate, buttons perform actions, and `summary` elements
expand disclosures. Button-looking links must still support copy-link, keyboard
access, and opening a destination in a new tab.

## Resolved findings, grouped by shared owner

The evidence column describes the pre-update state, not the current layout.

| Priority | Location and examples | Original evidence | Applied treatment |
| --- | --- | --- | --- |
| High | Discrete and Complexity lesson calls to action: “See it happen”, “Check your reasoning”, “Revisit an example” | `shared/ui/study-lesson/view.svelte` and its CSS: `.study-next` is transparent, borderless, and not underlined; 17px tall on Induction Understand and Time Practice. | Use the shared destination control for these next actions. |
| High | Discrete and Complexity lesson footer: “Use this idea” connections | Same owner: `.study-connections a` uses color alone; sampled Induction and Time links are 16px tall without underline or outline. | Give related destinations visible link controls, with room to wrap. |
| High | Algorithm Practice, Complexity, and Growth next actions | `algorithms/components/lesson/view.svelte`, `components/growth/view.svelte`, and `shared/styles/study-primitives.css`: secondary `.learning-link` has no border/fill or persistent underline; sampled Selection Practice/Growth links are 15px tall. | Reuse destination controls; retain the distinct primary action where useful. |
| High | Play transcript scene titles, across algorithm and concept films | `shared/playback/player/view.svelte` and CSS: these are actual jump-to-scene buttons, but `.film-transcript button` removes border/fill. Selection Play confirms 32px plain text controls. | Add a compact scene-jump affordance and explicit hover/focus/current-scene states. Do not change playback or remove the transcript. |
| Medium | Play “Related ideas” links inside “Read the explanation” | Same player owner: `.film-connections a` removes decoration; its underline only appears on hover. Source-confirmed shared behavior, even where a film has no related links. | Use destination controls in a wrapping related-links row. |
| Medium | Problems lesson footer: Hello Interview and related fundamentals | `problems/two-pointers/view.svelte` and CSS: `.lesson-links a` is color-only until hover; Two Sum Practice confirms 16px text links. | Controls for related lessons; persistently underlined reference links for citations. |
| Medium | Reasoning disclosures in Discrete/Complexity, algorithm Practice, and Problems Practice | `study-lesson`, `algorithms/components/lesson`, and `problems/two-pointers`: transparent summaries; sampled Time is 29px and Problems 37px. Native disclosure markers help, so this is less severe than hidden navigation. | Add an outlined, padded disclosure row while preserving native summary semantics and its expanded state. |
| Medium | Walkthrough failure recovery: “Open standalone” | `algorithms/components/walkthrough/view.svelte` and CSS: recovery has an outlined reload button but a color-only standalone link. Source-confirmed conditional failure state, not an observed loading failure. | Make both recovery options equally recognizable without changing iframe loading. |
| Low | Lesson return links: “All sorting algorithms”, domain return, “Two Pointers” | `algorithms/components/lesson`, `app/view.svelte`, and `problems/two-pointers`: directional text already suggests navigation, but decoration is absent until hover. | Strengthen the text-link treatment or use a quiet outlined return link, rather than competing with the main action. |

## Deliberately not treated as failures

- Header icon buttons, search, the rail collapse control, and intro eye controls
  already have a visible shape and accessible names.
- Tabs are a recognizable navigation group, not standalone calls to action.
- Breadcrumbs and prose citations should remain readable text links, not a row
  of large buttons. Persistent underlining is appropriate where context is weak.
- Example pickers, ratio selectors, native inputs, chart-case checkboxes,
  implementation selectors, and playback transport already show their control
  type. They may merit a separate touch-target pass, but are not hidden actions.
- Previous/next topic panels and embedded step-by-step transport controls have
  visible borders. Leave their established layout and behavior intact.

## Verification

`test:core-navigation-links` covers core Explore/Connections destinations, title
treatment, 44px targets, arrows, sharp corners, and overflow in five themes at
1440, 900, 390, and 320px. `test:domain-landings` checks directory tabs, reading
scroll, sticky filtering, sorting, and expanded-by-default rails. `test:home-links`
continues to cover Home, Resources, and Author's note.

Lesson destinations now reuse `navigation-link`, including the primary trace
action. Return links and the Hello Interview citation stay text links with
persistent underlines. Reasoning answers share `reasoning-disclosure`, retaining
native details/summary keyboard behavior and the original answer text. Transcript
scene buttons have a border, a scene-jump icon, hover/focus feedback, and a visible
current-scene state. Playback timing, recordings, and transport controls are
unchanged. The standalone walkthrough recovery link uses the same destination
component, with a clearly labeled new-tab behavior.

`test:lesson-controls` covers destination targets, native keyboard reveals,
transcript scene jumps, panel overflow, and focus feedback at 1440, 900, 390, and
320px in Dark, Paper, and Dawn. It forces a malformed iframe response to verify
the visible recovery controls and a successful retry. It runs in the Pages
workflow so these affordances remain protected as lessons are added.

Existing Study, Problems, architecture UI, shared player, and light-theme checks
also passed. Desktop and phone screenshots were reviewed locally before
publication; readable citations, breadcrumbs, and tabs have not been turned into
large buttons.
