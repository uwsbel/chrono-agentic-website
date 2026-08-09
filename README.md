# ChronoAgentic website

The visual research website for **ChronoAgentic: A Code-based Multi-Agent World Simulator for Physically Grounded Simulation Construction**.

It presents ChronoAgentic through a demo-first research experience inspired by visual simulation project pages such as SceneSmith and SimWorld, with:

- a full-screen generated-world hero containing the project title, authors, affiliation, and source link;
- world construction, solver-executed physics, interactive ROS, simulation-ready artifacts, and evaluation sections;
- prompt-grounded `Pure physics` Chrono/PyChrono videos and official system figures as the dominant visual material;
- interactive scene selection, pipeline stages, world filters, full-screen media, and implementation-audit metrics;
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

## Content map

```text
src/App.jsx        page structure and interactions
src/data.js        authors, results, and verified demo data
src/Icons.jsx      dependency-free interface icons
src/styles.css     responsive visual system and motion
public/media/      research figures, simulation videos, posters, and social image
```

## Source material

The website is grounded in the local `chrono-agentic`, `chrono-studio`, and manuscript repositories. Its structure follows the project's main narrative: executable code as the world representation, a six-stage construction and review loop, live ROS interaction, and a prompt-grounded implementation audit of 80 PhyWorldBench runs. The gallery is an explicit allow-list from `history_exp/physics_vs_animation_review.md`: only rows classified as `Pure physics` are displayed. Benchmark success alone is not sufficient. The featured FloWave pool is an accepted million-particle SPH run from the same construction pipeline.

Website source code is MIT licensed. Research figures and simulation media remain copyright of their respective authors; see [NOTICE.md](NOTICE.md).
