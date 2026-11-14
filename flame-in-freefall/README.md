# Flame in Freefall

A minimal, responsive landing page for a student NASA Space Apps research project. Buildless HTML, CSS and JavaScript; no dependencies. The rotating upper assembly is an illustrative procedural 3D reconstruction of the Apollo 1 Saturn IB stack, not an engineering model. It includes the S-IVB upper section, spacecraft adapter, service and command modules, and launch escape tower. Geometry is rendered locally with WebGL, an opaque triangle mesh, and per-pixel depth testing; no model download or library is needed.

Historical reference: https://www.nasa.gov/humans-in-space/55-years-ago-final-preparations-for-the-planned-launch-of-apollo-1/

## Preview

From this directory, run `python3 -m http.server 4173 --directory dist`, then visit http://localhost:4173.

Edit `dist/index.html`, `dist/style.css` and `dist/script.js`. Fonts are loaded from Google Fonts with system fallbacks. Scroll reveals and the rotating model respect reduced-motion preferences. Rotation pauses when the model is off screen or the browser tab is hidden. The model fades into black before the research section.


## Gemini backend (ADC)

Node 22+ is required. From `flame-in-freefall`:

```bash
npm install
npm run test:gemini
npm start
```

Open http://localhost:4173 for the landing page. The standalone Ask page has been removed; the Gemini backend at POST /api/ask is retained for future simulation panels.
The standalone Python static server cannot run the AI endpoint; stop it if it
already occupies port 4173, or use `PORT=4174 npm start`.

Defaults are project `project-915cfa66-e9ad-474f-be8`, region `global`, model
`gemini-3.5-flash-lite`. Copy `.env.example` to `.env` to override. Model access
must be verified by `npm run test:gemini`; this repository does not claim a live
connection until that command succeeds. The backend uses the Google Gen AI SDK
with Vertex AI and explicitly sets its quota project. ADC stays outside this repo.

If authentication fails, run `gcloud auth application-default login`.
If project setup is incomplete, use your authorised Google account to run:

```bash
gcloud config set project project-915cfa66-e9ad-474f-be8
gcloud auth application-default set-quota-project project-915cfa66-e9ad-474f-be8
gcloud services enable aiplatform.googleapis.com --project=project-915cfa66-e9ad-474f-be8
```

The account needs the appropriate Vertex AI and Service Usage permissions.
No project APIs or permissions were changed by this code. Credentials, tokens,
and full upstream error bodies are never returned to the browser.

The assistant uses three curated source summaries in `server/evidence.js`.
It is not a comprehensive PSI search or a numerical modelling service. Add the
team's reviewed findings there. Displayed citations are matched against known
record IDs; this does not automatically verify that the cited source supports
all generated claims.

## GitHub Pages and deployment

Publish only `dist/` to Pages. Deploy the Node backend separately with ADC from
an attached Google Cloud service account (do not upload local user credentials).
When adding simulation panels, configure their public backend URL in the frontend.
Set `ALLOWED_ORIGIN` on the backend to the
Pages origin, such as `https://username.github.io`, without a repository path.
Use `HOST=0.0.0.0` in a container; local development defaults to loopback.

Before public deployment, add managed access/abuse protection and project quota
limits. The local server has a six-requests-per-minute process-wide throttle and
one concurrent request; CORS is not authentication and this throttle is not a
distributed quota. Neither the model backend nor Pages has been deployed here.

`npm test` runs local renderer and backend contract tests without cloud calls.

## Detect workspace

Open `/detect.html` through the Detect card on the landing page. It includes a
conceptual smoke transport animation, qualitative controls, four sensing-principle
panels, a SAME hover/focus/tap preview and an evidence-based Gemini panel. The
animation is not CFD or a validated detector response model and reports no alarm
times, concentrations or detection probabilities. Settings persist under the
versioned localStorage key `7oaks:detect:v1`; storage failure is non-fatal.

On “Explain this scene”, the browser sends a fresh, versioned snapshot rather than
scraping the page or trusting old storage. `/api/ask` validates the snapshot and
loads the selected detector note plus the optical transport background directly
from `context/detect/*.md`. Only allowlisted files can be read. Research remains
on the server; API credentials never go to the browser. Changes to the Markdown
are read on the next question without rebuilding. Notes remain drafts and their
limitations are included in the prompt. No request is sent when controls change.

If the Node server was running before these backend changes, restart it. For
GitHub Pages, the visuals work independently, but the Gemini panel needs a hosted
backend URL in `dist/api-config.js` and the appropriate `ALLOWED_ORIGIN` on the
backend. Keep the `context/` folder in the backend deployment. Never publish ADC
files. The source lookup does not verify that every AI claim is entailed by a
citation; users should inspect the referenced evidence.

### Floating Detect assistant

The sparkle button opens the Gemini assistant. It sends the current scenario and the team's detection notes to the existing `/api/ask` backend. Restart `npm start` after backend changes; direct `file://` previews support local interactions but need the HTTP backend for Gemini.

Commands work without an API call: `/go workspace`, `/go methods`, `/go calculations`, `/go evidence`, and `/set FIELD VALUE`. Examples: `/set method gas`, `/set airflow 65`, `/set distance 4`, `/set velocity 0.2`. Natural-language requests can return the same allowlisted actions through Gemini. Both server and browser validate actions; stale actions are skipped if the user changes the scene while waiting. No generated code is executed.

The calculator's path length (0.5–10 m) and air speed (0–0.5 m/s) are hypothetical inputs for `t = L/u`, separate from the dimensionless fan slider. The moving marker follows that ideal travel duration. Zero velocity produces no finite advective estimate. This is not CFD, an alarm-time prediction or a calibrated sensor simulation.

### Earth applications workspace

`dist/earth.html` is written from `context/applications/applications.md`, with NASA references linked beside the explanations. It includes a four-stage FLEX-inspired hot/cool droplet illustration, a separate formation-versus-oxidation soot demonstration, an interactive HCCI piston diagram, and material-screening / firefighter-equipment diagrams. No experimental run data or chemical kinetics solver is included. Soot numbers are authored tracer tokens, not measured particles or mass emissions.

Settings are allowlisted and saved under `7oaks:earth:v1`. The saved snapshot identifies its illustrative scope; it is not currently sent to the Detect-only Gemini endpoint. The page works as static HTML on GitHub Pages and from local files. Stage stepping works with reduced motion enabled; continuous animation pauses in hidden tabs. `npm test` covers input normalization, token accounting and the interactive controls.
