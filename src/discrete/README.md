# Discrete mathematics

Induction, telescoping, and Master theorem each own their explanation in
`<topic>/model.ts` and their visualization stories in `<topic>/film.ts`.
`model.ts` at this domain root owns directory metadata and cross-domain links.

Topic pages reuse the shared study lesson shell, tabs, MathML presenter, and
player. Telescoping's cancellation presenter lives with that topic. Do not copy
the shared lesson shell into each topic or move authored examples into views.

MathML helpers in `shared/study/math.ts` accept trusted local lesson fragments,
not user input. Check cancellation pairs and surviving endpoints visually at
desktop, tablet, and phone sizes; algebra must remain readable and correctly
labeled. Examples should teach reasoning, not be geared to one exam or template.

New original static diagrams should retain editable `.excalidraw` sources and
SVG exports with accessible descriptions. This structural migration does not
replace the current diagrams or redesign the existing lessons.

Run `test:study` and `test:play` with the dev server running, plus architecture
and build checks. See [source conventions](../README.md) for CSS and size limits.
