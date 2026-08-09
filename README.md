# ChronoAgentic website

The product website for **ChronoAgentic**, an executable world platform for physical AI built on Project Chrono.

It presents ChronoAgentic through a product-first, light-themed experience with:

- a cinematic generated-world hero and interactive prompt composer;
- platform, workflow, use-case, Studio, world-gallery, and technology sections;
- real PyChrono simulation videos and official system figures;
- interactive build stages, Studio views, world previews, metrics, and figure viewer;
- research and benchmark evidence presented as late-page technical proof;
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

The website is grounded in the local `chrono-agentic`, `chrono-studio`, and manuscript repositories. Product messaging is organized around executable worlds for robotics, autonomous systems, industrial digital twins, multiphysics engineering, and synthetic sensors. The technical proof comes from the 2026 ChronoAgentic preprint, including 82.5% full correctness across 80 PhyWorldBench demos in eight evaluated physics categories.

Website source code is MIT licensed. The embedded paper, research figures, and simulation media remain copyright of their respective authors; see [NOTICE.md](NOTICE.md).
