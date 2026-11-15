# The Bible in Three Pictures: web app

Geb Sierra's course as an installable web app. This repo builds **Level 1 only**, as a thin slice to test on real people. The plan is `claude/webapp-handoff-plan.md` in the claude.ai project "The Bible in 3 Pictures". Progress is logged in `claude/webapp-progress-log.md` there.

## Where things are

| Path | What it is |
|---|---|
| `content/sessions.yaml` | **Copy.** Its home is the claude.ai project, where the book work edits it. Never edit session content here. |
| `content/test-outs.md` | **Copy.** Same rule. |
| `content/items.yaml` | Check questions for the app. Its home is this repo. |
| `tools/validate.py` | Session checks. **Copy** of the project's; keep it identical. |
| `tools/validate_items.py` | Item checks (app only). |
| `tools/lint_content.py` | Fails on banned words: em dashes, "Stage Four", "twelve steps", "Chaos", "Four Pictures". |
| `scripts/build-content.ts` | Runs the checks, then writes `src/content/level1.json`. `--production` keeps approved content only. |
| `src/lib/` | Timeline data, storage, review schedule, graders, test-out scoring, share text. Each has tests. |
| `src/components/Timeline.tsx` | The timeline. The three pictures can be struck. The cross never is. |
| `docs/stack.md` | Tools, versions, prices, ESV terms, phone storage rules, with sources and dates. |
| `docs/reference-check-L1.md` | Level 1 verses checked against the ESV. |

## Refreshing the content copies

1. Read `claude/sessions.yaml` and `claude/test-outs.md` from the project.
2. Overwrite `content/sessions.yaml` and `content/test-outs.md` with them, byte for byte.
3. Run `npm run check:py`. Commit only if it passes.

## Run it

Needs Node 26 (see `.nvmrc`) and Python 3 with `pyyaml` and `pytest`.

```
npm ci
npm run check:py     # validators, lint, Python tests
npm test             # unit tests
npm run dev          # preview build on your machine
npm run build:prod   # fails until every Level 1 slot it needs is approved
```

## Publishing

- **Preview** (drafts shown, marked DRAFT): every push to `main` publishes to this repo's GitHub Pages address. One-time setup in GitHub: Settings > Pages > Source: GitHub Actions.
- **Release**: graceandgladness.com runs on GitHub Pages from `GebSierra/graceandgladness`. The production build will be copied into a folder there. Geb picks the folder name.
