import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from './Icons.jsx'
import {
  authors,
  benchmarkResults,
  demos,
  pipelineSteps,
} from './data.js'

// Resolve public files from the module bundle instead of the current page URL.
// This keeps media paths stable on repository subpaths and preview URLs that do
// not end with a slash.
const moduleUrl = import.meta.url
const publicRoot = new URL('../', moduleUrl)
const asset = (path) => new URL(path.replace(/^\/+/, ''), publicRoot).href

const navItems = [
  ['overview', 'Overview'],
  ['construction', 'Construction'],
  ['worlds', 'Worlds'],
  ['interaction', 'Interaction'],
  ['evaluation', 'Evidence'],
]

const constructionScenes = [
  {
    name: 'Interactive ROS city',
    prompt: 'Build an interactive city-driving world with a 3 × 3 street grid, generated scene assets, and a vehicle exposed for live ROS control.',
    video: 'media/hero-city.mp4',
    poster: 'media/poster-hero-city.jpg',
    systems: 'Vehicle · sensors · ROS bridge',
    detail: '3 × 3 grid · 130 minted assets · live mode',
  },
  {
    name: 'Physically arranged dining room',
    prompt: 'Create a dense dining room whose chairs face the table, whose props remain supported, and whose fruit stays contained after settling.',
    video: 'media/demo-dining-room.mp4',
    poster: 'media/poster-dining-room.jpg',
    systems: 'Assets · contact · placement',
    detail: 'visual feedback · targeted collision and pose repair',
  },
  {
    name: 'Stone entering still water',
    prompt: 'Drop a stone into a still pond and preserve the fluid–solid interaction through the full rollout.',
    video: 'media/demo-stone-pond.mp4',
    poster: 'media/poster-stone-pond.jpg',
    systems: 'SPH · contact · free surface',
    detail: 'fluid–solid coupling · recorded trajectory',
  },
  {
    name: 'Elastic spring system',
    prompt: 'Construct a spring that stores and releases energy while its deformation remains physically consistent.',
    video: 'media/demo-spring.mp4',
    poster: 'media/poster-spring.jpg',
    systems: 'FEA · elasticity · energy',
    detail: 'deformable state · sensor-camera render',
  },
]

const worldDetails = {
  'FloWave focused-wave pool': {
    domain: 'Additional solver demonstration',
    group: 'Fluids',
    prompt: 'A circular ring of hinged paddles drives inward waves that focus into a central free-surface spike.',
  },
  'A stone enters still water': {
    domain: 'Fluid and Particle Dynamics',
    group: 'Fluids',
    prompt: 'A stone is dropped into a still pond, creating a splash and outward-propagating waves.',
  },
  'Energy in a pendulum': {
    domain: 'Energy Conservation',
    group: 'Mechanics',
    prompt: 'A pendulum swings between two peaks while exchanging potential and kinetic energy.',
  },
  'A flexible board takes an impact': {
    domain: 'Deformations and Elasticity',
    group: 'Deformables',
    prompt: 'A falling rigid sphere contacts a flexible board, which bends under impact and rebounds from its solved FEA state.',
  },
  'Two billiard balls exchange momentum': {
    domain: 'Interaction Dynamics',
    group: 'Mechanics',
    prompt: 'Two billiard balls collide; contact impulse exchanges momentum, and friction determines their subsequent rolling.',
  },
  'A slack rope pulls a box': {
    domain: 'Interaction Dynamics',
    group: 'Mechanics',
    prompt: 'A segmented rope straightens, becomes taut, and transmits tension through its constraints to a frictional box.',
  },
  'A sponge compresses under load': {
    domain: 'Deformations and Elasticity',
    group: 'Deformables',
    prompt: 'Driven platens load a soft sponge while its FEA and contact state produce the visible compression and recovery.',
  },
  'Water forms a driven vortex': {
    domain: 'Fluid and Particle Dynamics',
    group: 'Fluids',
    prompt: 'A motor-driven BCE spoon transfers momentum into SPH water and creates a vortex through the fluid solve.',
  },
  'Thickness changes fracture': {
    domain: 'Scale and Proportions',
    group: 'Deformables',
    prompt: 'The same dynamic hammer contacts thin and thick glass panes, and measured stress produces thickness-dependent fracture.',
  },
  'A spring stores and releases': {
    domain: 'Deformations and Elasticity',
    group: 'Deformables',
    prompt: 'An elastic spring deforms, stores energy, and returns toward its resting configuration.',
  },
  'A beach ball meets a pool': {
    domain: 'Fluid and Particle Dynamics',
    group: 'Fluids',
    prompt: 'A beach ball falls into a pool, displaces water, and remains buoyant at the free surface.',
  },
}

function usePageEffects(setActiveSection) {
  useEffect(() => {
    document.documentElement.classList.add('js')

    const revealObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          revealObserver.unobserve(entry.target)
        }
      }),
      { threshold: 0.1 },
    )

    document.querySelectorAll('[data-reveal]').forEach((node) => revealObserver.observe(node))

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target?.id) setActiveSection(visible.target.id)
      },
      { rootMargin: '-24% 0px -66% 0px', threshold: [0, 0.2, 0.45] },
    )

    navItems.forEach(([id]) => {
      const section = document.getElementById(id)
      if (section) sectionObserver.observe(section)
    })

    const updateScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      document.documentElement.style.setProperty('--scroll-progress', String(max > 0 ? window.scrollY / max : 0))
      document.documentElement.classList.toggle('has-scrolled', window.scrollY > 80)
    }

    updateScroll()
    window.addEventListener('scroll', updateScroll, { passive: true })

    return () => {
      revealObserver.disconnect()
      sectionObserver.disconnect()
      window.removeEventListener('scroll', updateScroll)
    }
  }, [setActiveSection])
}

function AnimatedMetric({ value, suffix = '', decimals = 0 }) {
  const ref = useRef(null)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    let frame
    let started = false
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started) return
      started = true
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setDisplay(value)
        return
      }
      const start = performance.now()
      const tick = (now) => {
        const ratio = Math.min((now - start) / 1000, 1)
        setDisplay(value * (1 - Math.pow(1 - ratio, 4)))
        if (ratio < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
      observer.disconnect()
    }, { threshold: 0.55 })
    observer.observe(node)
    return () => {
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [value])

  return <span ref={ref}>{display.toFixed(decimals)}{suffix}</span>
}

function Brand() {
  return (
    <a className="brand" href="#top" aria-label="ChronoAgentic — SBEL Lab home">
      <img className="brand__logo" src={asset('sbel-lab-logo.png')} alt="" width="512" height="512" />
      <span className="brand__copy">
        <span className="brand__meta">SBEL · UW–MADISON</span>
        <span className="brand__name">Chrono<span>Agentic</span></span>
      </span>
    </a>
  )
}

function Navigation({ activeSection }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('menu-open', open)
    return () => document.body.classList.remove('menu-open')
  }, [open])

  return (
    <header className="site-header">
      <div className="scroll-progress" aria-hidden="true" />
      <nav className="nav shell-wide" aria-label="Primary navigation">
        <Brand />
        <div className={`nav__panel ${open ? 'is-open' : ''}`}>
          <div className="nav__links">
            {navItems.map(([id, label]) => (
              <a key={id} href={`#${id}`} className={activeSection === id ? 'is-active' : ''} onClick={() => setOpen(false)}>{label}</a>
            ))}
          </div>
          <a className="nav__code" href="https://github.com/Hongyu0329/chrono-agentic" target="_blank" rel="noreferrer">
            <Icon name="github" size={15} /> Code
          </a>
        </div>
        <button className="nav__menu" type="button" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(!open)}>
          <Icon name={open ? 'close' : 'menu'} size={22} />
        </button>
      </nav>
    </header>
  )
}

function ResourceLink({ href, icon, children, primary = false }) {
  const external = href.startsWith('http')
  return (
    <a className={`resource-link ${primary ? 'resource-link--primary' : ''}`} href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
      <Icon name={icon} size={16} />
      <span>{children}</span>
    </a>
  )
}

function SectionHeading({ kicker, title, copy, light = false, align = 'center' }) {
  return (
    <div className={`section-heading section-heading--${align} ${light ? 'section-heading--light' : ''}`} data-reveal>
      <span className="section-kicker">{kicker}</span>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  )
}

function Hero() {
  return (
    <section className="hero" id="top">
      <video className="hero__video" src={asset('media/hero-city.mp4')} poster={asset('media/poster-hero-city.jpg')} muted loop autoPlay playsInline preload="auto" aria-label="ChronoAgentic generated city-driving simulation" />
      <div className="hero__veil" />
      <div className="hero__content shell">
        <div className="hero__venue" data-reveal><i /> EXECUTABLE WORLD SIMULATION · 2026 <i /></div>
        <h1 data-reveal>
          <span className="hero__name">ChronoAgentic:</span>
          <span>A Code-based Multi-Agent World Simulator for Physically Grounded Simulation Construction</span>
        </h1>
        <div className="hero__authors" data-reveal>
          {authors.map((author, index) => (
            <span key={author.name}>{author.name}{index < authors.length - 1 ? ',' : ''}</span>
          ))}
        </div>
        <p className="hero__affiliation" data-reveal>University of Wisconsin–Madison</p>
        <div className="hero__links" data-reveal>
          <ResourceLink href="https://github.com/Hongyu0329/chrono-agentic" icon="github" primary>Code</ResourceLink>
          <ResourceLink href="#worlds" icon="play">Selected rollouts</ResourceLink>
          <ResourceLink href="#construction" icon="code">Method</ResourceLink>
        </div>
      </div>
      <a className="hero__scroll" href="#overview"><span>Explore the work</span><i /></a>
    </section>
  )
}

function Overview({ onOpenMedia }) {
  return (
    <section className="overview section" id="overview">
      <div className="shell">
        <SectionHeading
          kicker="Code-centric world simulation"
          title={<>The world is the program.<br />Execution makes it inspectable.</>}
          copy="ChronoAgentic constructs executable PyChrono programs whose bodies, joints, contacts, terrain, sensors, controllers, assets, and numerical settings define the world state explicitly."
        />
        <div className="abstract-block" data-reveal>
          <span>ABSTRACT</span>
          <div>
            <p>Video-based world models infer dynamics in latent states and do not enforce explicit physical constraints. ChronoAgentic instead converts a natural-language prompt and optional reference image into a committed scene plan, then implements that plan as a standalone simulator program.</p>
            <p>Without task-specific training, four context-isolated agents coordinate through persistent artifacts. Execution produces logs, trajectories, still frames, and per-camera videos; visual descriptions and deterministic anomaly checks ground one targeted repair at a time until the program is accepted or reported as blocked.</p>
          </div>
        </div>
        <div className="overview-principles" data-reveal>
          {[
            ['01', 'Commit the plan', 'A human-readable plan records parameters, objectives, assets, topology, cameras, and unresolved choices before code generation.'],
            ['02', 'Construct the program', 'Skills, an asset catalog, simulator retrieval, and static validation ground one standalone PyChrono script.'],
            ['03', 'Close the loop', 'Program reports, trajectory checks, and visual evidence are triangulated against the committed objectives.'],
          ].map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
        <figure className="comparison-figure" data-reveal>
          <button type="button" onClick={() => onOpenMedia({ type: 'image', src: 'media/comparison.png', alt: 'Video-based world modeling compared with executable simulation', caption: 'Video-based world modeling predicts frames from latent state. ChronoAgentic generates a program that exposes and advances physical state.' })}>
            <img src={asset('media/comparison.png')} alt="Video-based world modeling compared with executable simulation" loading="lazy" />
            <span><Icon name="expand" size={16} /> Expand</span>
          </button>
          <figcaption><b>Two world representations.</b> The paper contrasts latent video rollouts with a generated simulator program whose state, execution, and repair trail remain inspectable.</figcaption>
        </figure>
      </div>
    </section>
  )
}

function SceneShowcase() {
  const [active, setActive] = useState(0)
  const scene = constructionScenes[active]

  return (
    <div className="scene-showcase" data-reveal>
      <div className="scene-showcase__stage">
        <video key={scene.video} src={asset(scene.video)} poster={asset(scene.poster)} muted loop autoPlay playsInline preload="metadata" />
        <div className="scene-showcase__hud"><span><i /> PIPELINE OUTPUT</span><span>{String(active + 1).padStart(2, '0')} / {String(constructionScenes.length).padStart(2, '0')}</span></div>
        <div className="scene-showcase__caption">
          <span>SCENE OBJECTIVE</span>
          <p>{scene.prompt}</p>
        </div>
      </div>
      <aside className="scene-showcase__aside">
        <div><span>SELECTED CONSTRUCTION</span><h3>{scene.name}</h3><p>{scene.systems}</p></div>
        <dl><dt>Plan</dt><dd>committed and inspectable</dd><dt>Program</dt><dd>standalone PyChrono</dd><dt>Evidence</dt><dd>{scene.detail}</dd></dl>
        <div className="scene-showcase__selector">
          {constructionScenes.map((item, index) => (
            <button key={item.name} type="button" className={active === index ? 'is-active' : ''} onClick={() => setActive(index)}>
              <img src={asset(item.poster)} alt="" />
              <span><b>{String(index + 1).padStart(2, '0')}</b>{item.name}</span>
            </button>
          ))}
        </div>
      </aside>
    </div>
  )
}

function Construction({ onOpenMedia }) {
  const [stage, setStage] = useState(0)
  const active = pipelineSteps[stage]

  return (
    <section className="construction section" id="construction">
      <div className="shell-wide">
        <SectionHeading
          kicker="Multi-agent methodology"
          title={<>One committed plan.<br />Six inspectable stages.</>}
          copy="Plan, code, visual-analysis, and review agents run in separate model contexts with scoped authority and communicate through artifacts in a shared workspace."
        />
        <SceneShowcase />
      </div>
      <div className="shell pipeline-section">
        <div className="pipeline-section__heading" data-reveal>
          <div><span>THE ARTIFACT CONTRACT</span><h3>Four role-specific agents. One closed construction loop.</h3></div>
          <p>The separation comes from isolated context, scoped write authority, and artifact-mediated handoffs—not model heterogeneity or parallel execution.</p>
        </div>
        <div className="pipeline-viewer" data-reveal>
          <button className="pipeline-viewer__figure" type="button" onClick={() => onOpenMedia({ type: 'image', src: 'media/pipeline.png', alt: 'ChronoAgentic multi-agent pipeline', caption: 'A prompt and optional image become a committed plan, executable PyChrono program, staged runs, visual and trajectory evidence, and one targeted repair per iteration.' })}>
            <img src={asset('media/pipeline.png')} alt="ChronoAgentic agent pipeline" loading="lazy" />
            <span><Icon name="expand" size={15} /> Paper pipeline</span>
          </button>
          <div className="pipeline-viewer__content">
            <div className="pipeline-tabs" role="tablist" aria-label="Pipeline stages">
              {pipelineSteps.map((item, index) => <button key={item.id} type="button" role="tab" aria-selected={stage === index} className={stage === index ? 'is-active' : ''} onClick={() => setStage(index)}><span>{item.id}</span><b>{item.short}</b></button>)}
            </div>
            <div className="pipeline-copy" key={active.id}>
              <div><span>{active.agent}</span><code>{active.artifact}</code></div>
              <h3>{active.title}</h3>
              <p>{active.copy}</p>
            </div>
          </div>
        </div>
        <div className="asset-pipeline-callout" data-reveal>
          <div>
            <span>OFFLINE ASSET MINTING</span>
            <h3>Generate once. Register once. Reuse at runtime.</h3>
            <p>When the catalog lacks an object, an offline pipeline generates a reference product image, segments it, reconstructs a textured mesh with SAM 3D, normalizes its orientation and extent, and registers it in the unified catalog. Collision geometry is prepared separately with convex decomposition; generated simulation programs only read catalog entries and do not depend on the generation stack.</p>
          </div>
          <button type="button" onClick={() => onOpenMedia({ type: 'image', src: 'media/asset-pipeline.png', alt: 'ChronoAgentic offline 3D asset generation pipeline', caption: 'A reference image becomes a segmented, reconstructed, normalized, and cataloged mesh; collision geometry is prepared separately for simulation.' })}>
            <img src={asset('media/asset-pipeline.png')} alt="ChronoAgentic offline 3D asset generation pipeline" loading="lazy" />
            <span><Icon name="expand" size={15} /> Asset pipeline</span>
          </button>
        </div>
      </div>
    </section>
  )
}

function WorldCard({ demo, index, onOpen }) {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const detail = worldDetails[demo.title]

  const play = () => videoRef.current?.play().then(() => setPlaying(true)).catch(() => {})
  const pause = () => { videoRef.current?.pause(); setPlaying(false) }

  return (
    <article className={`world-card ${demo.featured ? 'world-card--featured' : ''}`} data-reveal onMouseEnter={play} onMouseLeave={pause}>
      <div className="world-card__media">
        <video ref={videoRef} src={asset(demo.video)} poster={asset(demo.poster)} muted loop playsInline preload="metadata" />
        <button type="button" aria-label={`Open ${demo.title}`} onClick={() => onOpen({ type: 'video', src: demo.video, poster: demo.poster, alt: demo.title, caption: detail.prompt })}><Icon name="play" size={18} /></button>
        <span className="world-card__index">{String(index + 1).padStart(2, '0')}</span>
        <span className={`world-card__state ${playing ? 'is-playing' : ''}`}><i />{playing ? 'RUNNING' : 'HOVER TO RUN'}</span>
      </div>
      <div className="world-card__copy">
        <span>{detail.domain} · {demo.tag}</span>
        <h3>{demo.title}</h3>
        <p>{detail.prompt}</p>
        <small><i />{demo.auditId ? `PWB ${demo.auditId}` : 'ADDITIONAL RUN'} · {demo.evidence}</small>
      </div>
    </article>
  )
}

function Worlds({ onOpenMedia }) {
  const [filter, setFilter] = useState('All')
  const filters = ['All', 'Mechanics', 'Fluids', 'Deformables']
  const visible = useMemo(
    () => demos.filter((demo) => demo.approved && (filter === 'All' || worldDetails[demo.title].group === filter)),
    [filter],
  )

  return (
    <section className="worlds section" id="worlds">
      <div className="shell-wide">
        <SectionHeading
          kicker="Selected evaluation rollouts"
          title={<>Executable programs,<br />rendered as evidence.</>}
          copy="This gallery shows a curated subset of accepted runs from the paper's PhyWorldBench campaign, together with FloWave as an additional solver demonstration. Paper-level statistics are computed on the full 80-demo set, not on this gallery."
        />
        <div className="world-filters" data-reveal>{filters.map((item) => <button key={item} type="button" className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div>
        <div className="world-grid">{visible.map((demo, index) => <WorldCard key={demo.title} demo={demo} index={demos.indexOf(demo)} onOpen={onOpenMedia} />)}</div>
      </div>
    </section>
  )
}

function Interaction({ onOpenMedia }) {
  return (
    <section className="interaction section" id="interaction">
      <div className="shell">
        <SectionHeading
          kicker="Interactive world beyond the benchmark"
          title={<>The same loop builds<br />a live ROS city.</>}
          copy="ChronoAgentic constructs a 3 × 3 street grid with 130 unique minted assets and a sedan that an external ROS node can drive while the simulation advances."
          light
        />
      </div>
      <div className="shell-wide interaction-film" data-reveal>
        <video src={asset('media/hero-city.mp4')} poster={asset('media/poster-hero-city.jpg')} muted loop autoPlay playsInline preload="metadata" />
        <div className="interaction-film__top"><span><i /> ROS BRIDGE · LIVE MODE</span><span>CLOCK · CHASSIS · DRIVER INPUTS</span></div>
        <div className="interaction-film__caption"><span>RECORDED + LIVE MODES</span><h3>A generated city becomes a running robotics environment, not only a recorded rollout.</h3></div>
      </div>
      <div className="shell interaction-details">
        <button type="button" onClick={() => onOpenMedia({ type: 'image', src: 'media/ros-city.png', alt: 'ROS city cameras and views', caption: 'The generated city supports live vehicle control, sensor cameras, and ROS-connected interaction.' })} data-reveal>
          <img src={asset('media/ros-city.png')} alt="ROS city cameras, layout, and review views" loading="lazy" /><span><Icon name="expand" size={15} /> Paper demonstration</span>
        </button>
        <div className="interaction-details__copy" data-reveal>
          {[
            ['01', 'Publish', 'A clock handler publishes simulation time; a body handler publishes chassis state at 25 Hz.'],
            ['02', 'Subscribe', 'A driver-input handler receives steering, throttle, and braking commands at 25 Hz.'],
            ['03', 'Construct', 'The accepted scene combines a 3 × 3 street grid, 130 minted assets, and a sedan model.'],
          ].map(([number, title, copy]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}
        </div>
      </div>
    </section>
  )
}

function SimulationReady({ onOpenMedia }) {
  return (
    <section className="simulation-ready section">
      <div className="shell">
        <SectionHeading
          kicker="Staged execution and repair"
          title={<>Cheap gates first.<br />Targeted repairs next.</>}
          copy="Every iteration runs the same program in three passes, ordered from least to most expensive, and aborts at the first failure before the review agent triangulates the evidence."
        />
        <div className="ready-layout">
          <button className="ready-layout__figure" type="button" onClick={() => onOpenMedia({ type: 'image', src: 'media/iteration-loop.png', alt: 'ChronoAgentic iteration and review loop', caption: 'The review agent combines program reports, trajectory checks, visual descriptions, and committed objectives before returning one targeted repair.' })} data-reveal>
            <img src={asset('media/iteration-loop.png')} alt="Evidence-driven iteration loop" loading="lazy" />
            <span><Icon name="expand" size={15} /> Review loop</span>
          </button>
          <div className="ready-layout__steps" data-reveal>
            {[
              ['Headless trajectory', 'Run the full simulation with rendering disabled and record the trajectory consumed by numeric checks.', 'logs + trajectory'],
              ['First frame', 'Render one still per camera and inspect scene arrangement and framing before full recording.', 'camera stills'],
              ['Full recording', 'Render the complete simulation into per-camera videos only after the cheaper gates pass.', 'camera videos'],
            ].map(([title, copy, artifact], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p><code>{artifact}</code></article>)}
          </div>
        </div>
        <div className="repair-example" data-reveal>
          <div><span>DINING-ROOM CASE STUDY</span><h3>Visual evidence changes the program.</h3><p>The visual analysis found fruit ejected by an intrusive collision hull and a chair facing away from the table. The code agent replaced the bowl collision with an open box and corrected the chair pose; the next accepted iteration kept the visual mesh while fixing the simulated scene.</p></div>
          <button type="button" onClick={() => onOpenMedia({ type: 'image', src: 'media/dining-repair.png', alt: 'Dining room visual-feedback repair sequence', caption: 'The paper demonstration repairs bowl containment and chair orientation, then increases scene density under a revised user constraint.' })}><img src={asset('media/dining-repair.png')} alt="Dining room visual-feedback repair sequence" loading="lazy" /><span><Icon name="expand" size={15} /></span></button>
        </div>
      </div>
    </section>
  )
}

function BenchmarkBars() {
  return (
    <div className="category-chart" aria-label="ChronoAgentic full-correctness rate by PhyWorldBench category">
      <div className="category-chart__scale"><span>0</span><span>25</span><span>50</span><span>75</span><span>100%</span></div>
      {benchmarkResults.map((row) => {
        return <div className="category-row" key={row.name}><span>{row.name}</span><div><i style={{ width: `${row.score}%` }} /><b>{row.score}%</b></div></div>
      })}
    </div>
  )
}

function Evaluation() {
  return (
    <section className="evaluation section" id="evaluation">
      <div className="shell">
        <SectionHeading
          kicker="PhyWorldBench evaluation"
          title={<>Eighty demos.<br />Eight in-scope categories.</>}
          copy="The paper evaluates two scenarios from each of 40 selected subcategories, for 80 demos and 146 scenario-specific Key Standards. These results come from the full campaign—not from the smaller gallery above."
        />
        <div className="evaluation-numbers" data-reveal>
          <article><strong><AnimatedMetric value={80} /></strong><span>Evaluation demos</span><p>two scenarios from each selected subcategory</p></article>
          <article><strong><AnimatedMetric value={93.8} suffix="%" decimals={1} /></strong><span>Semantic adherence</span><p>required objects and event both appear</p></article>
          <article><strong><AnimatedMetric value={88.8} suffix="%" decimals={1} /></strong><span>Physical correctness</span><p>every Key Standard for the scenario passes</p></article>
          <article><strong><AnimatedMetric value={82.5} suffix="%" decimals={1} /></strong><span>Full correctness</span><p>semantic adherence and physical correctness jointly</p></article>
        </div>
        <div className="evaluation-grid">
          <div className="evaluation-panel" data-reveal>
            <div className="evaluation-panel__head"><div><span>PER-CATEGORY RESULT</span><h3>Full-correctness rate across the 80-demo set</h3></div><small>SA ∧ PC</small></div>
            <BenchmarkBars />
          </div>
          <div className="evaluation-panel evaluation-panel--policy" data-reveal>
            <div className="evaluation-panel__head"><div><span>REPORTING CONTRACT</span><h3>How the paper forms the score</h3></div><small>FULL VIDEO</small></div>
            <div className="audit-rules">
              <article><span>01</span><div><b>Fixed evaluation scope</b><p>Eight categories within the current framework scope contribute ten demos each.</p></div></article>
              <article><span>02</span><div><b>Internal and external verdicts stay separate</b><p>A demo is scored only after internal acceptance; benchmark verdicts are never fed back into repair.</p></div></article>
              <article><span>03</span><div><b>Three reported metrics</b><p>SA requires objects and event; PC requires every Key Standard; full correctness requires both.</p></div></article>
              <article><span>04</span><div><b>Protocol boundary is explicit</b><p>The full-video, 24 fps judge and selected subset differ from the official protocol, so absolute scores are not an official leaderboard result.</p></div></article>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer__main"><a className="footer__project" href="#top">Chrono<span>Agentic</span></a><p>A code-based multi-agent world simulator for physically grounded simulation construction.</p><div><a href="https://github.com/Hongyu0329/chrono-agentic" target="_blank" rel="noreferrer">GitHub</a><a href="https://projectchrono.org/" target="_blank" rel="noreferrer">Project Chrono</a><a href="https://sbel.wisc.edu/" target="_blank" rel="noreferrer">UW–Madison SBEL</a></div></div>
      <div className="shell footer__bottom"><span>ChronoAgentic · 2026</span><span>University of Wisconsin–Madison</span><a href="#top">Back to top ↑</a></div>
    </footer>
  )
}

function MediaModal({ media, onClose }) {
  useEffect(() => {
    if (!media) return undefined
    const close = (event) => { if (event.key === 'Escape') onClose() }
    document.body.classList.add('modal-open')
    window.addEventListener('keydown', close)
    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', close)
    }
  }, [media, onClose])

  if (!media) return null
  return (
    <div className="media-modal" role="dialog" aria-modal="true" aria-label={media.caption} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className={`media-modal__panel media-modal__panel--${media.type}`}>
        <button type="button" onClick={onClose} aria-label="Close"><Icon name="close" size={20} /></button>
        {media.type === 'video'
          ? <video src={asset(media.src)} poster={media.poster ? asset(media.poster) : undefined} controls autoPlay muted loop playsInline />
          : <img src={asset(media.src)} alt={media.alt} />}
        <p>{media.caption}</p>
      </div>
    </div>
  )
}

export default function App() {
  const [activeSection, setActiveSection] = useState('overview')
  const [media, setMedia] = useState(null)
  usePageEffects(setActiveSection)

  return (
    <>
      <Navigation activeSection={activeSection} />
      <main>
        <Hero />
        <Overview onOpenMedia={setMedia} />
        <Construction onOpenMedia={setMedia} />
        <Worlds onOpenMedia={setMedia} />
        <Interaction onOpenMedia={setMedia} />
        <SimulationReady onOpenMedia={setMedia} />
        <Evaluation />
      </main>
      <Footer />
      <MediaModal media={media} onClose={() => setMedia(null)} />
    </>
  )
}
