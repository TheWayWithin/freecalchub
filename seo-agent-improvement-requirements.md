# SEO-Agent Library Improvement Requirements

**Generated**: 2026-05-11
**Source**: real-world use of the SEO-Agent library on freecalchub.com (2026-05-10 → 2026-05-11)
**Audience**: whoever next works on improving the SEO-Agent library (`.claude/agents/seo-*`, `.claude/missions/*`, `templates/`)
**Status**: requirements for review, not a committed plan

## Why this exists

Across two days of real SEO work on freecalchub.com (site-audit lite → technical-fix bulk migration → BMI canonical fix → robots.txt AI crawlers + sitewide head-tag standard), the SEO-Agent library held up well on the *core* mission delivery. But several gaps showed up that required ad-hoc workarounds. Documenting them here so the next iteration of the library is sharper than the last.

If your time is limited, read the **Top 5** section. Everything else is supporting detail.

## Top 5 priority gaps

Ranked by impact on a real SEO project's success.

### 1. The `/track` command is vapourware

**What I found**: `.claude/commands/track.md` documents an elaborate tracking system with "IMPLEMENTATION STATUS: ✅ Complete and Tested". In reality only `tracking/config/tracking.yml` exists. No `track.py`, no `report_engine.py`, no baselines directory, no schemas, no GSC/Lighthouse integration.

**Why it matters**: every SEO mission's Constitution rule 5 ("Prove it") depends on a working baseline → compare workflow. Without `/track`, agents and users have to manually construct baseline files, snapshot conventions, diff procedures. We did all of this ad hoc.

**Suggested fix**:
- Either implement the minimum viable `/track baseline` and `/track compare` (one Python script ~200 lines could capture the manual GSC/Lighthouse procedure as a CLI flow), OR
- Rewrite `track.md` to match what actually exists (a config file + manual procedure documented in a runbook).
- Schema for baseline files DOES exist now at `tracking/schemas/baseline.schema.json` (drafted during this work — promote / refine).

### 2. No strategic-planning artefact (roadmap pattern)

**What I found**: the library has `templates/seo-evidence-template.md` (backward-looking) and per-mission deliverable templates (`analysis-report.md`, `marketing-report.md`). It has no forward-looking strategic planning template. Mode D missions are per-run scoped, so there's no persistent project-level strategy file (unlike Mode A's `project-plan.md`).

**Why it matters**: for any SEO project beyond a single audit, the user needs to see "what should I work on this month, with what expected impact, in what order". Without a roadmap, the work fragments into isolated audits whose findings get lost between sessions.

**Suggested fix**:
- Promote `seo-roadmap.md` (drafted in this work) to `templates/seo-roadmap-template.md`.
- Structure: Active / Backlog (ROI-ranked) / Themes (strategic) / Done / Parked. Every item has Impact / Effort / ROI / Confidence / source pointer.
- Coordinator should populate this file on first run of any SEO mission against a new project.

### 3. No standard backlog file for inter-mission action handoff

**What I found**: site-audit produces a fix list in `runs/<run>/data.json`. Technical-fix mission consumes those fixes. But there's no durable, project-level backlog file connecting them. When the user comes back a week later, the open fixes are buried in a JSON file inside a dated run directory.

**Why it matters**: SEO is a long game. Fixes get deferred, prioritised, reshuffled. They need a durable home, not "go read last week's data.json".

**Suggested fix**:
- Promote `seo-backlog.md` (drafted in this work) to `templates/seo-backlog-template.md`.
- Standard convention: every mission that produces actionable fixes appends them to the project's `seo-backlog.md`. Coordinator owns the merge.
- When a fix ships, move it to a Done section with commit SHA + date.

### 4. Missions don't define "done" as "live and verified"

**What I found**: every mission's "Success Criteria" section talks about deliverables produced and recommendations made. None mention deploying to production or verifying live state. Multiple times during this work I described things as "shipped/complete" when they were only committed locally — Jamie had to repeatedly ask "is it actually live?".

**Why it matters**: SEO work that doesn't reach the open web has zero value. The library implicitly treats commits as the finish line. It shouldn't.

**Suggested fix**:
- Add a standard "Deploy & Verify" phase to every site-affecting mission (`technical-fix`, `ai-search-optimize`, `content-gap` follow-through, etc.).
- Mission success criteria should require: (a) live-URL fetch confirms the change is serving, (b) baseline/snapshot file updated with deploy timestamp.
- Coordinator should refuse to mark a site-affecting mission complete until step (a) passes.

### 5. No post-deploy sitewide verification step

**What I found**: the `technical-fix` mission's bulk migration ran cleanly, but a sitewide live grep AFTER deploy found 2 pages with missing Twitter Card tags. Root cause was a script logic bug (OG and Twitter treated as inseparable). Caught only because Jamie asked the right question.

**Why it matters**: bulk migrations have hidden edge cases. Without sitewide verification, partial failures slip through.

**Suggested fix**:
- Add a "sitewide verification" step to the technical-fix mission contract: after deploy, fetch every affected URL and confirm the change is present.
- Include a default sitewide-check script (or a reusable function) in `scripts/` that any mission can call.
- Coordinator records the verification result in the run's data.json (e.g. `verification: { method: "sitewide-grep", urls_checked: 110, urls_passed: 108, gaps: [...] }`).

## Full gap list by theme

### A. Tracking & Measurement Infrastructure

- A1. `/track` command is documentation only — see Top 5 #1.
- A2. No baseline schema until drafted ad hoc during this work. Now lives at `tracking/schemas/baseline.schema.json` — refine and lock.
- A3. No snapshot template for post-deploy / 28-day-later captures. Convention assumed but not codified.
- A4. No comparison/diff template. The 2026-06-07 compare will need to invent format.
- A5. INP (Interaction to Next Paint) field reserved in baseline schema but unmeasurable from Lighthouse lab. Low-traffic sites also lack CrUX field data. Schema should explicitly document where INP comes from for each site tier.
- A6. Pre-deploy live capture window is narrow and easy to miss. The library should flag this explicitly in the mission flow (Lighthouse-pre-deploy is a one-shot opportunity).
- A7. No documented procedure for paid-API integrations (PageSpeed Insights API key, Ahrefs, Moz). User had to spin up Google Cloud Console mid-session.

### B. Mission Workflow

- B1. No deploy-verification phase in any mission — see Top 5 #4.
- B2. No post-deploy sitewide verification — see Top 5 #5.
- B3. Coordinator subagent can't dispatch to specialists (Task tool unavailable inside subagents in current harness). Coordinator either does work directly or fails. Framework constraint, but worth documenting and designing around.
- B4. Coordinator subagent had trouble writing report-style .md files (some harness write restriction). Required parent agent to persist content. Friction.
- B5. Inter-mission handoff (e.g. site-audit → technical-fix) relies on the user manually mapping findings. No structured handoff protocol.
- B6. Mission deliverable contracts have ambiguity: `site-audit.md` mission file says `marketing.md` REQUIRED unconditionally; CLAUDE.md says marketing.md only "when before/after captured". Two sources disagree.

### C. Strategic Planning

- C1. No roadmap template — see Top 5 #2.
- C2. No standard backlog file — see Top 5 #3.
- C3. Mode D missions lack persistent strategic state (vs Mode A's `project-plan.md`). Each Mode D mission is per-run, but SEO is a multi-mission long game.
- C4. No defined "themes" structure for grouping initiatives. Performance / Content / AI Search / Authority / Schema / Conversion came out of this work but aren't standardised.

### D. Documentation Quality

- D1. `/track` doc oversold capabilities (see #1).
- D2. AI Search Readiness scorecard has subjective dimensions (e.g. "answerability") without scoring rubrics. Two agents could score the same site differently.
- D3. Constitution rule 1 ("Read before scanning") doesn't define what to do when seo-evidence.md is empty (first run) vs full. Convention emerged in practice; should be explicit.
- D4. No documented convention for `runs/` directory naming when a run is post-deploy (e.g. `runs/2026-06-07-freecalchub-com-compare-vs-2026-05-10/` ?).

### E. Operational Friction

- E1. Manual GSC integration. Property verification + 24-48h processing delay was a real workflow blocker. Library could pre-pre-empt this (suggest verifying GSC property at project start, not at first baseline pull).
- E2. Manual Lighthouse capture via PageSpeed Insights browser UI is tedious for 5+ URLs. API works but needs key. Library could ship a `scripts/fetch-lighthouse.py` that handles the key + caching.
- E3. Hooks blocking legitimate operations (e.g. `rm /tmp/psi_key` was destructive-flagged). For SEO ops, certain command patterns are routine and could be allowlisted.

## Lessons learned (process insights)

Not gaps in the library, but lessons worth encoding somewhere (perhaps in a new `field-manual/seo-lessons.md`):

1. **Local commit ≠ shipped.** "Done" must be defined as live and verified, not committed. Words like "shipped/complete/deployed" should default to LIVE meaning.
2. **Sitewide verification catches what spot-checks miss.** After any bulk operation, fetch every affected URL, not just samples.
3. **Pre-deploy windows are narrow.** Baselines captured AFTER deploy are post-fix, not pre-fix, no matter what the filename says. Capture BEFORE pushing.
4. **Idempotency is non-negotiable for migration scripts.** Re-running must be safe.
5. **Conflation of OG and Twitter is a real bug pattern.** Track presence independently.
6. **Filename mismatches between SOPs and reality are systemic.** Calculator-template.html (dash) vs calculator_template.html (underscore) propagated across multiple docs. Audit SOPs against the filesystem on first read.
7. **Constitution rule 5 ("Prove it") requires infrastructure that may not exist.** Library should not assume the tracking layer exists; missions should flag when it's missing.
8. **Mission output mostly lived up to its template.** The site-audit and technical-fix deliverable contracts (analysis.md, marketing.md, data.json) were genuinely useful artefacts — the gaps are around them, not in them.

## Suggested new artefacts for the library

Concrete additions, in rough priority order:

1. `templates/seo-roadmap-template.md` — strategic planning artefact (promote from `seo-roadmap.md` drafted in this work).
2. `templates/seo-backlog-template.md` — durable tactical backlog (promote from `seo-backlog.md`).
3. `tracking/schemas/baseline.schema.json` — DONE during this work; needs refining and version-locking.
4. `tracking/schemas/snapshot.schema.json` — for post-deploy / 28-day-later captures (separate from baseline since structurally identical but semantically distinct).
5. `tracking/schemas/comparison.schema.json` — for `tracking/comparisons/<from>-vs-<to>.{md,json}` artefacts.
6. `scripts/fetch-lighthouse.py` — wraps PageSpeed Insights API, handles key from env var.
7. `scripts/sitewide-verify.py` — post-deploy sitewide grep for any tag/marker, configurable. Usable as a phase in technical-fix.
8. `field-manual/seo-lessons.md` — process insights from real-world runs (the "Lessons learned" section above).
9. `field-manual/scoring-rubrics.md` — concrete rubrics for AI Search and Traditional SEO scorecard dimensions (so scores are consistent across agents and runs).
10. Mission file updates: add a "Deploy & Verify" phase to `technical-fix.md`, `content-gap.md`, `ai-search-optimize.md`. Move "Sitewide verification" from optional to required.

## What's working well (don't break)

So the next iteration doesn't accidentally regress:

- The deliverable contract (`analysis.md` + `marketing.md` + `data.json` per run) is genuinely useful and well-thought-out. The JSON schema is mostly right.
- `seo-evidence.md` as a single backward-looking artefact store is the right pattern (Constitution rule 1).
- Mode D's per-run scoping (no `project-plan.md` at start of each mission) keeps SEO work lean. The gap is the missing project-level strategic file, not the per-run discipline.
- The Constitution (5 rules) is well-written and held up under real use. Especially rule 4 (minimal diffs) — saved us several times from over-reaching edits.
- The mission types (site-audit / content-gap / technical-fix / ai-search-optimize) cover the actual SEO work needed. The categorisation is right.
- Calculator-template.html as a source of truth for head-tag pattern: this convention is excellent. Made the technical-fix migration straightforward.

## How to use this document

This is a snapshot of gaps identified at 2026-05-11. It's not a project plan — it's input for one. The next person working on the SEO-Agent library can:

1. Skim the Top 5.
2. Decide which 1-2 to scope into actual library improvements.
3. Ignore the rest until they become relevant.

Don't try to fix all of this at once. Top 5 #1 (track command) and #2 (roadmap template) together would cover the majority of the friction observed in this work. The rest are polish.
