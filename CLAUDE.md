# Rules for models working in this repo

Read the plan first: `claude/webapp-handoff-plan.md` in the claude.ai project, then `claude/webapp-progress-log.md`. Never start a task whose earlier STOP has no answer in the log.

- **Level 1 only.** Do not build Levels 2 or 3.
- **Geb writes the teaching.** Never fill a MINE slot. Gaps show as `TBD (Geb)` in preview builds.
- **Nothing shows as final until its status is `approved`.** Production builds hold no drafts; the build fails if they would.
- **One content source.** `content/sessions.yaml` and `content/test-outs.md` are copies of the project docs. Never edit them here. Never fix a fact in app code.
- **Recall, not recognition.** `choice` items are for lessons only, never review or test-out.
- **Names.** The cross stage is "Stage C." Never "Stage Four." Do not number the twelve words. Never "twelve steps" on screen.
- **The three pictures get struck through. The cross never does.**
- **Words.** Plain words, short sentences, no em dashes.
- **No new libraries** beyond the plan's section 7 without Geb agreeing.
- **Spend nothing.** Check any price with Geb first. Never state a price, version or date from memory.
- **Only `src/lib/schedule.ts` imports ts-fsrs. Only `src/lib/storage.ts` touches browser storage.**
- Before you push: `npm run check:py && npm test && npm run typecheck`.
