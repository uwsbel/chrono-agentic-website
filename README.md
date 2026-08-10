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

When neither variable is set, the default GitHub Pages project URL works without additional path configuration.

## Content map

```text
src/App.jsx        page structure and interactions
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
