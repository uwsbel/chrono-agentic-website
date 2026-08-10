# ChronoAgentic website

The visual research website for **ChronoAgentic: A Code-based Multi-Agent World Simulator for Physically Grounded Simulation Construction**.

It presents ChronoAgentic through a demo-first research experience inspired by visual simulation project pages such as SceneSmith and SimWorld, with:

- a full-screen generated-world hero containing the project title, authors, affiliation, and source link;
- the paper's six-stage plan, code-generation, execution, analysis, validation, and repair loop;
- the offline asset-minting pipeline, interactive ROS city, staged execution, and dining-room repair case;
- prompt-grounded, solver-executed Chrono/PyChrono videos and official system figures as the dominant visual material;
- the reported 80-demo PhyWorldBench result and its exact evaluation boundary;
- interactive scene selection, pipeline stages, world filters, and full-screen media;
- responsive layouts and reduced-motion support;
- relative asset paths suitable for GitHub Pages and other static hosts.

## Local development

Requirements: Node.js 20.19 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Production build

```bash
npm run build
npm run preview
```

The deployable static bundle is written to `dist/`. The Vite base path is relative, so the same build works at a domain root or repository subpath.

## Live ROS driving demo

The Interaction section is a real ROS client rather than a cosmetic playback. The browser connects to `rosbridge_server`, publishes steering/throttle/braking, gear, and chase-camera commands, and subscribes to vehicle pose, twist, acceleration, GPS, clock, and powertrain telemetry. Its live image comes from `web_video_server`; the bundled city video is only a clearly labelled pre-connection fallback.

The static website cannot start PyChrono or ROS. Run the companion processes from the `chrono_studio_workspace` on a ROS/PyChrono host.

Terminal 1 — start the exact interactive city scene:

```bash
cd /path/to/chrono_studio_workspace
conda activate pychrono10
set -a; source scripts/chrono_env.sh; set +a
ROS_DEMO_SCENE=city ROS_DEMO_SECONDS=600 \
  "$CHRONO_PY" scripts/ros_studio_demo.py
```

Terminal 2 — start only the browser transports and the required RGBA-to-RGB camera relay:

```bash
cd /path/to/chrono_studio_workspace
BRIDGES="rosbridge web_video" \
CAMERA_TOPIC=/chrono_studio/output/camera/image \
  bash scripts/ros_bridges.sh
```

For local development, keep the default endpoints shown in the connection panel:

```text
ws://127.0.0.1:9090
http://127.0.0.1:8080/stream?topic=/chrono_studio/output/camera/image_rgb&type=mjpeg
/chrono_studio
```

Click **Connect to ROS**, wait for `control online`, click **Release brake**, then use W/A/S/D or the touch controls. Space also brakes; R/N/D select a drive mode; arrow keys orbit the chase camera; C resets it. Losing window focus, hiding the tab, losing the rosbridge connection, disconnecting, or pressing the emergency button latches full braking.

Build-time defaults can be changed with the public Vite variables in `.env.example`. A visitor can also change and persist all three endpoints in the connection panel. These values are compiled into or stored by the browser and must never contain a secret.

### Serving the demo from GitHub Pages

GitHub Pages is HTTPS, so browsers will reject the local `ws://` and `http://` defaults as mixed content. A remotely usable deployment needs:

- an authenticated or network-restricted `wss://` reverse proxy to rosbridge port 9090;
- an `https://` reverse proxy to the MJPEG stream on port 8080;
- the ROS host running whenever the public demo should be online.

Do not publish an unauthenticated rosbridge port directly to the internet: it permits ROS topic writes. Keep it behind a VPN, identity-aware proxy, or equivalent access control, and expose only the topics required by this demo. Configure the public endpoints as GitHub Actions repository variables `ROS_BRIDGE_URL`, `ROS_STREAM_URL`, and optionally `ROS_NAMESPACE`; the deployment workflow passes them to Vite. The connection form remains available for local/private endpoints.

## GitHub Pages deployment

The repository includes `.github/workflows/deploy-pages.yml`. Every push to `main` builds the Vite site and deploys `dist/` to GitHub Pages.

Create and push the repository as public so the website can be visited without signing in:

```bash
gh repo create chrono-agentic-website \
  --public \
  --source=. \
  --remote=origin \
  --push
```

On GitHub, open **Settings → Pages** and select **GitHub Actions** as the deployment source. The default public URL is:

```text
https://YOUR_USERNAME.github.io/chrono-agentic-website/
```

The workflow supports these optional repository variables under **Settings → Secrets and variables → Actions → Variables**:

- `PAGES_BASE_PATH`: overrides Vite's default relative base path, for example `/chrono-agentic-website/`.
- `PAGES_CUSTOM_DOMAIN`: writes the supplied hostname into the deployed `CNAME`, for example `chronoagentic.example.edu`. Configure the same custom domain in **Settings → Pages** and add the required DNS records there; a `CNAME` file alone does not activate the domain.
- `ROS_BRIDGE_URL`: public `wss://` endpoint used as the live console default.
- `ROS_STREAM_URL`: public `https://` MJPEG endpoint used as the live camera default.
- `ROS_NAMESPACE`: optional topic namespace; defaults to `/chrono_studio`.

When neither variable is set, the default GitHub Pages project URL works without additional path configuration.

## Content map

```text
src/App.jsx        page structure and interactions
src/RosDriveDemo.jsx live driving console, safety controls, telemetry, and camera UI
src/useRosbridge.js dependency-free rosbridge v2 WebSocket client
src/data.js        authors, results, and demo metadata
src/Icons.jsx      dependency-free interface icons
src/styles.css     responsive visual system and motion
public/media/      research figures, simulation videos, posters, and social image
```

## Source material

The authoritative text source is `Manuscripts/Conference/2026/chrono-agentic/main.tex`. The site follows that paper's narrative: executable PyChrono code as the world representation; four context-isolated agent roles coordinated through persistent artifacts; six closed-loop stages; offline asset minting; staged execution and targeted repair; an 80-demo, eight-category PhyWorldBench evaluation; and a live ROS city demonstration.

The evaluation section reports the paper's full 80-demo results: 93.8% semantic adherence, 88.8% physical correctness, and 82.5% on their conjunction under the stated full-video protocol. It also preserves the paper's caveat that this selected subset and judging protocol are not an official-leaderboard result.

The video gallery is deliberately smaller than the evaluated set. It uses an explicit internal allow-list of selected benchmark runs, and the UI requires an approval flag before rendering a card. FloWave is retained as an additional solver demonstration and is not counted as one of the gallery-derived paper metrics.

Website source code is MIT licensed. Research figures and simulation media remain copyright of their respective authors; see [NOTICE.md](NOTICE.md).
