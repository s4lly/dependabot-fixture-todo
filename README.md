# flue-victim-todo

A deliberately-vulnerable Vite/React todo app. It is **not** a real product — it is a
fixture for the [Flue Dependabot Alert Triage & Investigation](../flue1) system. Its
dependencies are pinned so GitHub Dependabot emits a known, mixed set of alerts that
exercises every branch of the triage gate.

The todo implementation is throwaway. The `package.json` / lockfile pins are the point.

## Engineered alert mix

Three dependencies are pinned to vulnerable versions, each chosen so its **only**
remediation lands in a different gate branch:

| Category | Package | Locked | Manifest range | Advisory (live GHSA) | Patched in | Why this branch |
|---|---|---|---|---|---|---|
| **clean-bump** | `lodash` (direct) | `4.17.21` | `^4.17.21` | [GHSA-r5fr-rjxr-66jc](https://github.com/advisories/GHSA-r5fr-rjxr-66jc) (HIGH) + others | `4.18.0` | `4.18.0` is inside `^4.17.21` → in-range patch, a one-click bump. Triage should suppress it. |
| **major-bump-required** | `jsonwebtoken` (direct) | `8.5.1` | `^8.5.1` | [GHSA-8cf7-32gw-wr33](https://github.com/advisories/GHSA-8cf7-32gw-wr33) (HIGH) + others | `9.0.0` | Every fix is in `9.0.0`, outside `^8` → a breaking major bump of a direct dep. Needs investigation. |
| **transitive-override** | `tough-cookie` (transitive, via `fetch-cookie@0.7.3`) | `2.5.0` | parent pins `^2.3.3` | [GHSA-72xf-g2v4-qvf3](https://github.com/advisories/GHSA-72xf-g2v4-qvf3) (MODERATE) | `4.1.3` | The patch is a major jump outside the parent's `^2.3.3` pin, and `fetch-cookie` has no release that loosens it. The surgical fix is an npm `overrides` entry, not a parent bump. Needs investigation. |

Notes:
- `fetch-cookie@0.7.3` is itself clean (no advisory), so the transitive alert is *only*
  about `tough-cookie` — no noise.
- A single package may produce more than one Dependabot alert (one per advisory), but
  every alert in this repo belongs to one of the three packages above and maps cleanly to
  one of the three categories.
- The override is **deliberately not applied** here — applying it would fix the transitive
  alert before it can fire. The override is the remediation the investigator should
  *recommend*.

## Reachability (for the investigation workflow)

Each vulnerable dependency is actually imported from a real entrypoint, so the
investigation workflow's reachability analysis has something true to find:

- `lodash` → imported by `src/todos.ts`, shipped in the browser bundle (`npm run build`).
- `jsonwebtoken` → imported by `scripts/issue-token.mjs` (`npm run token`).
- `fetch-cookie` (→ `tough-cookie`) → imported by `scripts/sync-remote.mjs` (`npm run sync`).

## Verifying the pins against the live Advisory DB

Advisory data drifts (new patched releases get published), so the pins are verified
against the live GitHub Advisory Database rather than trusted from memory. Re-run before
relying on the fixture:

```sh
# clean-bump: lodash 4.17.21 vulnerable, patch must be inside ^4.17.21 (i.e. < 5.0.0)
gh api graphql -f query='{ securityVulnerabilities(ecosystem: NPM, package: "lodash", first: 3, orderBy:{field:UPDATED_AT,direction:DESC}){ nodes{ advisory{ghsaId severity} vulnerableVersionRange firstPatchedVersion{identifier} } } }'

# major-bump: jsonwebtoken 8.5.1 vulnerable, patch must be >= 9.0.0 (outside ^8)
gh api graphql -f query='{ securityVulnerabilities(ecosystem: NPM, package: "jsonwebtoken", first: 3, orderBy:{field:UPDATED_AT,direction:DESC}){ nodes{ advisory{ghsaId severity} vulnerableVersionRange firstPatchedVersion{identifier} } } }'

# transitive: tough-cookie 2.5.0 vulnerable, patch must be a major jump (>= 4.1.3)
gh api graphql -f query='{ securityVulnerabilities(ecosystem: NPM, package: "tough-cookie", first: 3, orderBy:{field:UPDATED_AT,direction:DESC}){ nodes{ advisory{ghsaId severity} vulnerableVersionRange firstPatchedVersion{identifier} } } }'
```

`npm audit` is a quick local sanity check — it should report lodash as a non-breaking fix,
jsonwebtoken as a breaking (major) fix, and tough-cookie as a transitive vulnerable dep.

## Develop / run

```sh
npm install
npm run dev      # todo UI (uses lodash)
npm run build    # type-check + production bundle
npm run token    # sign/verify a demo JWT (uses jsonwebtoken)
npm run sync     # cookie-aware fetch demo (uses fetch-cookie -> tough-cookie)
```

## Dependabot

Alerts are enabled at the repo level (Settings → Code security → Dependabot alerts). No
`dependabot.yml` is committed: this fixture is about **alerts** (which feed the webhook),
not version-update PRs. Adding version-update config would open fix PRs that defeat the
purpose.
