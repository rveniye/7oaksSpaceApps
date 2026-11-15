# Research context and page map

This index connects the website's research areas and the Markdown used by the Gemini assistant. The pages explain different parts of the same fire-safety problem: how combustion works, how ignition can be prevented, how its products are detected, how combustion can be stopped, and how the findings can inform work on Earth.

## Pages and source notes

| Page | Topics and sections | Markdown context |
| --- | --- | --- |
| [Research overview](../dist/index.html) | Investigation discovery and comparison (`#investigations`), research areas (`#research`), missing data (`#research-status`) | [Experiments](experiments/experiments.md) and the notes from every area |
| [Understand](../dist/understand.html) | Flame shape (`#shape`), combustion physics (`#chemistry`), Arrhenius equation (`#arrhenius`), radicals (`#radical-reactions`), thermal decomposition (`#thermal-decomposition`), heat balance (`#heat-balance`), droplet diagram (`#droplet-physics`), oxygen and extinction limits (`#extinction-limits`), flamelets (`#flamelets`), complete cool-flame lesson (`#flames`), complete soot lesson (`#soot`) | [Fire in microgravity](understand/fires-in-microgravity.md), [Combustion physics](understand/physics-of-combustion.md), [Flamelets](understand/flamelets.md), plus the cool-flame and soot material in [Applications notes](applications/applications.md) |
| [Prevent](../dist/prevent.html) | Materials (`#materials`), ventilation (`#ventilation`), crew environments (`#environments`), missing data (`#missing-data`) | [Materials and ventilation](prevent/materials-and-ventilation.md) |
| [Detect](../dist/detect.html) | Smoke transport (`#workspace`), sensing principles (`#methods`), ideal travel time (`#calculations`), draft detector ratings (`#comparison`), evidence (`#evidence`) | [Laser diode](detect/laser-diode.md), [Brunswick detector](detect/brunswick-fire.md), [Multi-angle optical sensors](detect/multi-angle-optical-sensors.md) |
| [Suppress](../dist/suppress.html) | FLEX extinction (`#extinction`), ventilation and flamelets (`#ventilation`), suppression mechanisms (`#mechanisms`), research approaches (`#approaches`) | [Ventilation and flamelets](suppress/ventilation-and-flamelets.md), [Fine water mist](suppress/fire-water-mist.md), [Ionic wind](suppress/electric-field-driven-ionic-wind.md), [Acoustic forcing](suppress/acoustic-fire-suppression.md) |
| [Applications](../dist/earth.html) | Brief factual references to cool flames and soot (`#findings`), HCCI engine illustration and technology transfer (`#transfer`), sources (`#sources`) | [Applications notes](applications/applications.md) |

## Connections between the pages

- Understand → Prevent: pyrolysis and flame spread explain why material configuration, heat sources, oxygen and airflow must be assessed together.
- Understand → Detect: smoke, soot and combustion gases provide different signals. Weak visible light is not proof that reactions have stopped. Smoke still has to reach a sampling inlet.
- Prevent → Detect: ventilation affects cooling and oxygen supply as well as the route taken by smoke. The transport illustration does not calculate an alarm time.
- Understand → Suppress: heat loss and reactant supply affect extinction. Cool-flame chemistry explains why visible hot-flame extinction needs careful interpretation.
- Suppress → Understand: FLEX extinction results connect to the complete hot-to-cool droplet sequence in Understand. Ionic and acoustic forcing illustrate gas motion; neither guarantees suppression.
- Understand → Applications: lower-temperature chemistry informs compression-ignition research. Soot formation and oxidation help explain the difference between production inside a flame and release into exhaust. Full explanations and interactive lessons live in Understand; Applications refers to the findings in prose and explores their possible uses.
- Prevent → Applications: solid-fuel studies can inform material screening, but spacecraft tests do not certify terrestrial products.
- Overview → all areas: relevance ordering identifies a useful reading sequence. It is not a ranking of fire probability, severity or engineering suitability.

The Applications source file still holds the original cool-flame and soot research prose. Its folder does not determine the current location of a website lesson. Understand's assistant must receive that file along with its own notes.

## Editing the AI prompt

Edit [assistant-prompt.md](assistant-prompt.md) to set the assistant’s role, tone, explanation style and evidence rules. The server reads it on every question, so prompt edits do not require a restart. It is a system instruction file, separate from research evidence, and is not included in the public note archive. The server retains the structured-response and action-validation contracts in code.

## AI context and interpretation

The Node backend reads this map on each question. Research pages load their allowlisted source notes; Understand also loads Applications notes. Detect retains its validated smoke/detector snapshot. Understand sends the live droplet and soot selections; Applications sends its engine selection. Controls describe educational illustrations, not measurements.

Useful first questions include “Explain the current demonstration step by step”, “Which conditions would I need to compare these investigations?” and “How does this finding connect to detection or suppression?” Responses should explain the selected state, distinguish source claims from interpretation, name missing data and cite the available document IDs. Navigation actions automatically open an allowlisted page. Subsequent scroll and control actions run on that destination once, and the conversation remains available. Chat history is saved in the browser; recent messages accompany the next request as conversational reference data. The assistant receives related-area notes for cross-page walkthroughs.

Original notes remain drafts. Their wording is preserved in source files, but unsupported claims should not be repeated as established facts. Review annotations in the backend identify known issues. No numerical PSI run data, calibrated risk scores or approved team evaluations are loaded. The empty FLEX entry in the experiments note needs authoring. The challenge brief's partial-gravity availability statement needs a dated database check before it is presented as current.

The original-note reader sections are intentionally absent from the website. Edit the page explanations directly, and keep their meaning consistent with reviewed source notes. After source changes, run `npm run sync:notes` and `npm test` from the project directory.

## Guided walkthrough instructions

[Assistant commands](assistant-commands.md) describes the text/action sequence and supported command types. The backend loads this manual with the assistant prompt. The generated allowlist comes from `dist/assistant-actions.js`, which is shared with the browser; changing prose alone cannot add a control. See [the final-day checklist](../TOMORROW.md) for research review, demonstration prompts and presentation preparation.

## Sources and numerical data

The [source register](../data/source-provenance.json) connects catalogue descriptions to primary references, dated checks and unresolved discrepancies. The backend includes it in the assistant context. [Verification instructions](../data/README.md) explain the checks required before importing actual run measurements. All pages show readable source links; internal citation codes remain hidden from chat.
