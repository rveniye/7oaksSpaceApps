# Final 24 hours: preparation for 15 November

Goal: present a dashboard that helps a reader find relevant combustion research, understand an illustration and follow an AI-guided demonstration. Keep the distinction between educational illustrations, draft evaluations and measured research clear.

## Before the team starts

- [ ] Run `npm start` and open the site through the server, not a file URL.
- [ ] Run `npm test` and `npm run test:gemini -- --agent` on the presentation machine.
- [ ] Confirm that the model's answer changes an actual control, then continues its explanation after the change.
- [ ] Keep a copy of the current working project before final content edits. Do not put ADC credentials in the repository or deployment package.
- [ ] Allocate one owner each for research wording, evaluation evidence, browser testing and presentation/hosting.

## Hours 0–4: finish the research and evaluations

- [ ] Team authors deliver the final explanations for Understand, Prevent, Detect, Suppress and Applications. Keep the website and Markdown context consistent.
- [ ] Complete the FLEX entry in `context/experiments/experiments.md`.
- [ ] Review the known source issues recorded in `server/research-context.js`, especially gravity terminology, cool-flame chemistry, acoustic suppression, ionic wind and water-mist hardware claims.
- [ ] Supply the detector evaluations with criteria, reasoning, source references and limitations. Replace the draft ratings only when the team has reviewed them.
- [ ] Check the references behind numerical claims. Remove unsupported numbers or label the missing evidence clearly.
- [ ] After editing source notes, run `npm run sync:notes` and `npm test`.

Acceptance: a teammate can trace each comparison to its source and explain what the evidence does and does not establish.

## Hours 4–8: make the research finder useful

- [ ] Verify direct investigation/dataset links for the investigations used in the presentation. Current catalogue PSI links are searches.
- [ ] For those investigations, record fuel, sample geometry, oxygen concentration, pressure, airflow, hardware and measured quantities where sources actually provide them.
- [ ] Leave absent conditions explicitly missing. Do not make experiments appear directly comparable if their conditions differ.
- [ ] Check search, area prioritisation, three-item comparison, Deselect all, the independently scrolling list and CSV export.
- [ ] Explain in the presentation that relevance ordering is a reading aid; it is not a calibrated hazard score.

Acceptance: the presenter can find and compare two relevant studies and explain one important limitation of the comparison.

## Hours 8–13: rehearse the assistant and demonstrations

Use `context/assistant-prompt.md` for tone and `context/assistant-commands.md` for the command manual. The server reads both for each agent request; code/schema changes require a server restart.

- [ ] Understand: “Show Earth and microgravity flame shapes, and explain each change.”
- [ ] Understand: “Walk me through hot ignition and cool combustion, pausing to explain the difference.”
- [ ] Understand: “Keep soot formation high and increase oxidation. Explain what happens to the escaping soot.”
- [ ] Prevent: “Show how ventilation changes cooling, oxygen supply and smoke transport.”
- [ ] Detect: “Set microgravity and gradually increase airflow from zero to 65. Explain the drawing.”
- [ ] Detect: “Set distance to 5 metres and speed to 0.2 metres per second. Explain what the transport calculation leaves out.”
- [ ] Detect: “Select the optical detector, then compare it with the gas monitor.”
- [ ] Suppress: “Compare mist and ionic wind. Explain why they work differently.”
- [ ] Applications: “Step through compression and combustion in the engine.”
- [ ] Cross-page: “Go to Detect, adjust the fan and explain what I should notice.”
- [ ] Interrupt a walkthrough using Stop walkthrough and by changing a page control yourself. Confirm later commands do not execute.
- [ ] Reload, reopen chat and change pages. Check saved history, reading position, bold/italic text and hidden internal citation codes.
- [ ] Test reduced motion. It should apply settings without gradual motion, retaining the explanation order.
- [ ] Ask for an unavailable operation. The assistant must explain the limitation instead of claiming success.

Acceptance: text appears before a change, the real control changes, the demonstration has time to be observed, and the next text follows. No raw action JSON should appear in chat.

## Hours 13–17: review the site with new readers

- [ ] Ask one reader unfamiliar with the science to use the site without coaching. Record confusing labels and explanations.
- [ ] Check desktop and phone layouts: navigation, chat, comparison cells, sliders, diagrams, page overflow and readable captions.
- [ ] Check keyboard navigation, visible focus, slider operation and animation pause controls.
- [ ] Verify that the assistant panel does not prevent the presenter from showing the active demonstration. Close/reopen it when necessary.
- [ ] Fix the most disruptive issues first. Avoid a late visual redesign.

Acceptance: readers can explain what changes in each chosen demonstration and distinguish the illustration from a measured result.

## Hours 17–21: hosting and presentation

- [ ] Deploy both the frontend and Node backend if public AI access is required. A static-only deployment cannot call the local ADC backend.
- [ ] Configure API URL, permitted origin, hosted credentials and an appropriate request/quota limit.
- [ ] Test the deployed URL from a second device. Check an actual Gemini request, not just the health endpoint.
- [ ] Prepare a 3–5 minute narrative: research question → investigation comparison → guided demonstration → interpretation → missing evidence.
- [ ] Keep a short recording of a successful walkthrough as a connectivity fallback; identify it as a recording if used.

## Hours 21–24: freeze and rehearse

- [ ] Freeze content and features, except fixes for reproducible failures.
- [ ] Run automated tests, the live Gemini check and the presentation prompts once more on the final build.
- [ ] Record the final URL, restart procedure, project/model configuration and who owns deployment access.
- [ ] Rehearse once with the actual display, internet connection and presentation machine.
- [ ] List unfinished work honestly: full PSI numerical ingestion, validated predictive modelling, calibrated risk scoring and any remaining draft evaluations.

## Defer beyond this deadline

Do not attempt a new combustion solver, a complete PSI ingestion pipeline, a scoring system without evidence, or a broad framework migration in the remaining day. These need separate validation. Use the final hours to make the existing research and walkthroughs dependable.
