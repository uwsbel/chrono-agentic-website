# ChronoAgentic website

The visual research website for **ChronoAgentic: A Code-based Multi-Agent World Simulator for Physically Grounded Simulation Construction**.

It presents ChronoAgentic through a demo-first research experience inspired by visual simulation project pages such as SceneSmith and SimWorld, with:

- a full-screen generated-world hero containing the paper title, authors, affiliation, and primary resources;
- world construction, open-vocabulary physics, interactive ROS, simulation-ready artifacts, evaluation, and paper sections;
- real PyChrono simulation videos and official system figures as the dominant visual material;
- interactive scene selection, pipeline stages, world filters, full-screen media, benchmark metrics, and citation tools;
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
src/data.js        authors, results, demos, and citation data
src/Icons.jsx      dependency-free interface icons
src/styles.css     responsive visual system and motion
public/media/      paper figures, videos, posters, and social image
```

## Source material

The website is grounded in the local `chrono-agentic`, `chrono-studio`, and manuscript repositories. Its structure follows the paper's main narrative: executable code as the world representation, a six-stage construction and review loop, live ROS interaction, and an 80-demo PhyWorldBench evaluation across eight physics categories.

Website source code is MIT licensed. The embedded paper, research figures, and simulation media remain copyright of their respective authors; see [NOTICE.md](NOTICE.md).
