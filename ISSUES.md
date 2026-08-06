# freecalchub — Issue & Project Register

**This is the single source of truth for what is open in this repo.** One row per
issue/project. Detail lives in the linked doc; this file is the index the Mission
Control reconcile (`repo-reconcile.py`) reads and mirrors to the cockpit.

> Recovered 2026-08-05 (ISS-59) from `DevProjects/freecalchub-OLD-LOCAL/`, a stale clone of
> this same remote last committed 2026-05-10. The three issues below were raised against the
> live freecalchub.com but sat in a folder that is not in the fleet registry, so nothing —
> not the cockpit, not the scorecard, not `mc-shipped` — could see them. The copy in
> OLD-LOCAL is now marked superseded. This file is the live one.

## ID convention (collision-safe)

Mission Control owns the bare `ISS-`/`PRJ-`/`T-` namespaces. **Every freecalchub ID
carries the `FCH-` prefix** so it can never collide with a Mission-Control-native
ID or another repo's. Raise issues here with `python3 ~/shared/scripts/repo-issue.py`.

---

## Open

| ID | Title | Status | Severity | Detail | MC-SYNC |
|----|-------|--------|----------|--------|---------|
| FCH-ISS-3 | AI-visibility gaps on freecalchub.com (scanner 78/100): no date metadata anywhere (Y.1.1 30), transparency/disclosure 45, citations to authoritative sources 50, no sitemap link tag in head | Open | low | — | pending |
| FCH-ISS-2 | GA (googletagmanager) live but no Plausible on freecalchub.com — migrate to Plausible per PRJ-25 standard + add a calculator-use conversion goal | Open | low | — | pending |
| FCH-ISS-1 | Social/OG metadata missing on freecalchub.com homepage: no og:image, og:url or twitter card — shared links render bare | Open | medium | — | pending |

## Recently closed

| ID | Title | Status | Commit | Detail |
|----|-------|--------|--------|--------|
