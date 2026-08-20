# ChronoAgentic website

The visual research website for **ChronoAgentic: A Code-based Multi-Agent World Simulator for Physically Grounded Simulation Construction**.

It presents ChronoAgentic through a demo-first research experience inspired by visual simulation project pages such as SceneSmith and SimWorld, with:

- a full-screen generated-world hero containing the project title, authors, affiliation, and source link;
- the paper's six-stage plan, code-generation, execution, analysis, validation, and repair loop;
- the offline asset-minting pipeline, generated city case study, staged execution, and dining-room repair case;
- prompt-grounded, solver-executed Chrono/PyChrono videos and official system figures as the dominant visual material;
- one PhyWorldBench evidence section: the reported 80-demo headline result, then the paper's head-to-head against ten text-to-video world models on the same prompts with a metric-switchable per-system ranking;
- interactive pipeline stages and full-screen media;
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

The authoritative text source is `Manuscripts/Conference/2026/chrono-agentic/main.tex`. The site follows that paper's narrative: executable PyChrono code as the world representation; four context-isolated agent roles coordinated through persistent artifacts; six closed-loop stages; offline asset minting; staged execution and targeted repair; an 80-demo PhyWorldBench evaluation; and a generated city case study.

The **Evidence** section (`#evaluation`) is a single section covering the whole PhyWorldBench evaluation. It opens with the paper's full 80-demo headline: 93.8% semantic adherence, 88.8% physical correctness, and 82.5% on their conjunction. The section heading carries the paper's two boundary conditions in prose—these are the full campaign rather than the smaller gallery above, and the full-video judging protocol makes the absolute scores non-comparable with the official leaderboard.

The rest of that section mirrors Table 2 (right) of the manuscript: ChronoAgentic against Pika, Kling, Sora, Luma, Gen-3, CogVideoX, HunyuanVideo, LTX-Video, Open-Sora-Plan, and Open-Sora, every baseline scored from its official PhyWorldBench release video by the same judge under the same full-video protocol. Three headline cards contrast our score with the strongest baseline and with the ten-model mean, then a metric-switchable table ranks all eleven systems. The mean is computed in the page from the same per-system table rather than stored separately, so the two cannot drift apart.

Figures come from the manuscript's image archive (`ImageArchive/conferences/2026/ACMD_ChronoAgent/figs`). `pipeline.svg`, `asset-pipeline.png`, and `iteration-loop.png` are converted from the current `pipeline.pdf`, `asset.pdf`, and `iteration.pdf`. `video-based-world-model.svg` and `agentic-world-simulator.svg` are web-native redraws of the paper's two comparison figures and are maintained in this repository.

The video gallery is deliberately smaller than the evaluated set. It uses an explicit internal allow-list of selected benchmark runs, and the UI requires an approval flag before rendering a card. FloWave is retained as an additional solver demonstration and is not counted as one of the gallery-derived paper metrics.

Website source code is MIT licensed. Research figures and simulation media remain copyright of their respective authors; see [NOTICE.md](NOTICE.md).
