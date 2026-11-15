---
title: Data, models and future fire-safety equipment
status: source-checked
evidence_scope: Published DCE Table 1 summaries and explicitly scoped hardware references
---

# Data, models and future fire-safety equipment

The research workspace is at `lab.html`. It connects numerical evidence to a small predictive model and to research questions for future equipment. It is separate from the established Understand, Prevent, Detect, Suppress and Applications dashboards.

## Experimental data

Source: Ackerman and colleagues, *A Treatment of Measurements of Heptane Droplet Combustion Aboard MSL-1*, NASA/TM—2003-212553 (October 2003), [NASA record](https://ntrs.nasa.gov/citations/20040000941), Table 1, printed pp. 17–18, PDF pp. 21–22. The original PDF, checksum, extracted text and separate visual transcription are retained in `data/`. Checked 15 November 2026.

There are 38 n-heptane droplet tests: 34 in oxygen/helium and four in air. Two air tests used fibre supports. They were conducted aboard Spacelab MSL-1, on STS-83/94, near 300 K. These are DCE experiments, not FLEX or ISS experiments. The imported data are published numerical summaries, not raw camera recordings or a live PSI feed.

Pressure, oxygen fraction and support are experimental conditions. Initial diameter, burn duration and extinction dimensions are imaging-based reported quantities. The burning constant K is derived by the report from diameter-squared histories: a larger K means faster loss of squared droplet diameter. K is not a flame-spread speed. Table 1 has initial, overall and final K values. We model only overall K.

Every CSV row includes the original printed cells, units in column names, PDF page, table row, source URL and original-file SHA-256. JSON also includes metadata, missing-value codes and conditions. Blank cells and letter-coded missing measurements remain null, not zero. Approximate initial diameters retain their printed uncertainty; the table does not give per-cell uncertainty for burn duration or K. Models use the separately visually checked diameter, burn time and overall-K columns; remaining exported columns are automatically extracted and retain their original cells for checking.

## Predictive model

The shared numerical implementation is `dist/lab-model.js`, version `dce-ols-1`. It is deterministic: Gemini explains results calculated by the server. The browser uses the same function.

Two fixed groups are available: 30% oxygen / 70% helium at 1 bar (DCE-07 to DCE-11), and 25% oxygen / 75% helium at 1 bar (DCE-12 to DCE-16). Each uses five free droplets with precise reported initial diameters and complete burn time / overall K. The allowed initial diameter ranges are 1.78–3.87 mm and 1.61–4.01 mm respectively. Do not interpolate oxygen concentration, pressure, fuel, gravity or support. The comparisons pool STS-83 and STS-94; drift varies between runs and is not modelled. Nearby sizes and few experiments limit independence of the error check.

Burn duration is fitted as `t = a + b d₀²`. Overall K is fitted separately as `K = c + e d₀`. Coefficients minimise squared residuals within each group (ordinary least squares). The squared-diameter feature is motivated by droplet burning physics, but these empirical fits do not solve the combustion equations. In particular, burn duration is NOT computed as d₀²/K: a flame may extinguish before all liquid disappears. No model of flame radius, temperature, heat release or cabin risk is supplied.

For the internal error check, each experiment is withheld in turn and predicted using only the other four. Mean absolute error (MAE) is the average absolute difference between predicted and reported values. Root-mean-square error (RMSE) gives more weight to large differences. The same split is used for a baseline that predicts the mean of the other four outcomes. Display when the regression is worse than this simpler baseline. Held-out endpoint tests are outside the remaining four-test size range and are labelled; this checks sensitivity to endpoints, not permission to extrapolate in the user tool. These are internal diagnostics, not independent validation, a confidence interval or a safety margin. Do not say the result is accurate to ±MAE.

The 20% oxygen tests are excluded: the report (printed pp. 7, 15) attributes their burning largely to the initial vapour cloud and discusses failure to sustain droplet combustion. Approximate diameters, missing outputs, other atmospheres/supports and groups with fewer than four complete tests are also excluded. Every excluded row remains downloadable with a reason.

The model can help explore relationships and select conditions for further droplet experiments. It cannot set safe oxygen limits, choose a cabin suppression system, predict material flammability or predict lunar/Martian fires.

## Research informing next-generation controls and equipment

These are evidence-led design directions, not a performance ranking or certification. Proposed design questions below are our interpretation; the linked sources establish the research finding and its scope.

### Smoke detectors tested against spacecraft materials

The [2018 NIST publication abstract](https://www.nist.gov/publications/evaluation-spacecraft-smoke-detector-performance-low-gravity-environment) and [associated NIST account](https://www.nist.gov/news-events/news/2018/05/nistnasa-study-shows-one-detector-doesnt-fit-all-smoke-spacecraft) were cross-checked. SAME heated five spacecraft materials and evaluated two spacecraft detectors. Neither detector detected every smoke type. This supports testing future detectors against the materials actually carried. Combining complementary signals is a design direction to test; these sources do not establish a particular fusion algorithm's performance. Evaluate missed detections, dust-related false alarms and transport to the inlet under relevant conditions.

### Gas monitoring alongside particle sensing

The [CPM preprint abstract](https://ntrs.nasa.gov/citations/20210012108), dated 2019, describes a tunable laser absorption instrument designed for Saffire with channels for CO, HCl, HCN, HF, CO₂ and O₂. This offers a research path for warning and post-fire assessment. Verification is limited to the abstract and record metadata; the linked full text could not be accessed during this check. No detection limits, response times or operational deployment status are inferred. Evaluate selectivity, calibration drift and sampling delay before designing an alarm from these measurements.

### Water mist that discharges in different orientations

The [2010 NASA Tech Brief](https://ntrs.nasa.gov/citations/20100001376) and its [PDF, pp. 24–25](https://ntrs.nasa.gov/api/citations/20100001376/downloads/20100001376.pdf) describe a rechargeable water/nitrogen device designed for discharge regardless of orientation. Proof-of-concept tests extinguished open fires and fires in baffled enclosures. The engineering connection is delivery of suppressant where gravity cannot position liquid reliably, with potential use in overturned vehicles on Earth. Confirm coverage, cooling, re-ignition and compatibility with the actual enclosure. The source does not certify all fuels or state present fleet deployment.

### Electric-field flame control

[NASA's E-FIELD Flames objectives and experiment description](https://science.nasa.gov/biological-physical/investigations/e-field-flames/) explain that electric fields act on flame ions, producing gas motion that changes flame stability, soot and heat transfer. The stated purpose is understanding and controlling gaseous flames; the terrestrial connection is cleaner, more efficient combustion. This is not evidence of a qualified spacecraft extinguisher. Stable burning can be enhanced as well as disrupted. Electrode layout, power and ignition interactions are questions for a proposed design, not tested performance figures in this workspace.

## Assistant controls

Use `navigate` page `lab`, then scroll to `data`, `model`, `validation`, `equipment` or `provenance`. Set `lab-cohort` to `he30` or `he25`, `lab-diameter` to a number in the active group's range, `lab-metric` to `burn_time_s` or `k_overall_mm2_s`, `lab-filter` to `all`, `eligible` or `excluded`, and `equipment-focus` to `all`, `detect`, `suppress` or `applications`. Set the cohort before diameter. `lab-reset` restores 30% oxygen and 2.5 mm. Actions change the page controls; they do not run experiments. Exports are user-operated downloads.

The server supplies the current calculated result, all verified table rows and a compact model audit (coefficients, domains, error metrics). A requested new in-domain value can be derived from those coefficients; label it as a model estimate. Do not invent measurements or claim to run live NASA queries. Prefer moving the page controls and explaining the displayed result. Outside the domain, explain which conditions lack a supported model.
