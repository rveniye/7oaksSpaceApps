# Source provenance and measured data

`source-provenance.json` is the editable source register. `npm run sync:sources` generates the browser copy. The backend reads the register for each question. Both the investigation catalogue and the page source sections use that register.

## What is connected now

- Twelve catalogue families have source records; the CPM gas-monitor explanation has an additional record.
- Four direct PSI records were inspected in a rendered browser on 2026-11-14: BASS-II (PSI-25 v4), Saffire-I (PSI-98 v4), FLEX (PSI-69 v5), and SAME-R (PSI-101 v4). Their record titles, identifiers, versions and DOIs were checked against the public pages.
- Research objectives and mechanisms were compared with the specific NASA/NIST reports, publication abstracts or operations pages listed in each record. A second account can corroborate a claim, but these are not necessarily independent experiments.
- Some checks are deliberately narrow: SPICE/SLICE identity, the CFI-G overview, DAFT's instrument relationship and the CPM abstract. Their limited status is displayed. These entries do not certify every catalogue field.
- **No raw experimental measurements are imported.** The register connects references and checked descriptions. It is not a PSI mirror, a live data feed or a validated numerical dataset.

## Findings that affect use of the data

1. BASS-II: PSI-25's Approach gives a wind-tunnel capability of 40 cm/s. The preliminary abstract at NTRS 20160000593 gives 53 cm/s. These could describe different configurations or reporting scopes; the audit does not establish why. Do not treat either as a common run range without checking the relevant run documentation.
2. Saffire-I: PSI-98's project dates (2001–2008) and platform metadata do not align with its own Cygnus description and NASA's June 2016 flight account. Identity and objectives were matched; those project dates/platform were excluded as flight metadata. Do not silently correct the upstream record.
3. The detector ranking contained power, service-life and particle-size specifications that lacked supporting provenance in the reviewed notes. Those claims were removed. The remaining scores are explicitly unverified draft judgments pending team evaluations, not performance measurements.
4. The catalogue's CFI-G 85% oxygen number was not independently established by this audit and has been removed from its conditions description. The challenge brief remains a supplied source, but it is not a substitute for run-level validation.
5. Historical summaries and mission pages are not evidence of current installed detector hardware. The CPM source is labelled a preprint; its abstract is not a calibration dataset.

## Required double-check before importing measurements

1. Open the original investigation record. Match the full experiment name, investigator, identifier, version and DOI; an acronym alone is not enough.
2. Open the linked run file and its README/data dictionary. Check the file actually belongs to that investigation and identify which columns are measured, calculated or control settings.
3. Cross-check at least one extracted value against the original file, and compare the conditions with the accompanying report or test log. Keep the original units as well as any conversion.
4. Preserve the original file, retrieval date and checksum. Record exact file name, run ID, sheet/table/row/column, instrument, calibration, uncertainty, missing-value convention and applicable licence.
5. Keep different fuels, geometries, oxygen fractions, pressures, flows and gravity conditions separate. Do not merge family-level records into a single experimental series.
6. If two sources disagree, record both and mark the affected field unresolved. Do not choose a convenient value, average conflicting metadata or mark an uninspected file verified.
7. Recompute derived values independently. Test conversions, missing data and out-of-range inputs before displaying them.
8. Record who checked the extraction and when. A successful download or HTTP 200 is not scientific verification. A dated check is not a promise that the upstream record never changes.

A future imported value needs at least: investigation ID/version, run ID, source URL, file/checksum, extraction location, quantity, original value/unit, any transformed value/unit and formula, experimental conditions, uncertainty or explicit absence, and verification status. Until these exist, display a descriptive summary or “not available”, not an invented measurement.

The assistant has no browsing tool. It can explain this stored audit and link its sources, but must not claim to have verified an external page during a chat request.
