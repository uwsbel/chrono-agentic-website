# ChronoAgentic paper website

The standalone research website for **ChronoAgentic: A Code-based Multi-Agent World Simulator for Physically Grounded Simulation Construction**.

It presents the paper through an interactive, light-themed academic site with:

- a live Chrono Studio–inspired hero experience;
- the official paper, pipeline, asset, repair, benchmark, and ROS figures;
- real PyChrono simulation videos from the evaluated artifact collection;
- interactive pipeline, benchmark, gallery, and figure-viewer components;
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

The website is grounded in the local `chrono-agentic`, `chrono-studio`, and manuscript repositories. The primary manuscript is the 2026 ChronoAgentic preprint; its current headline result is 82.5% full correctness across 80 PhyWorldBench demos in eight evaluated physics categories.

Website source code is MIT licensed. The embedded paper, research figures, and simulation media remain copyright of their respective authors; see [NOTICE.md](NOTICE.md).
