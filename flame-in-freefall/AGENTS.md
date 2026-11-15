# Source and data verification

When adding or changing research claims, sources or data in this repository:

- Inspect the original source content; a search result, working link or matching acronym alone is not sufficient verification.
- Match investigation identity, version and scope. Cross-check the claim or extracted value with the associated publication, README, test log or original data location. Record what was actually checked.
- Use `data/source-provenance.json` for provenance and follow `data/README.md` before importing measurements. Keep dates, source locators, units, transformations and limitations visible.
- If access is blocked or a check is incomplete, label that scope unverified or partial. Never infer missing numerical data or silently reconcile conflicting sources.
- Preserve the distinction between measured data, derived calculations, authored illustrations and draft team judgments. A summary-level source does not verify a run-level value.
- Run `npm run sync:sources` after changes to the register, then the relevant tests. Regeneration and tests do not substitute for checking the external source.
- Do not claim that the website assistant performs live web verification: it currently reads the stored source audit and allowlisted notes.
