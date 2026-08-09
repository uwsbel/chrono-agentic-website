import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from './Icons.jsx'
import {
  authors,
  demos,
  physicsInventory,
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
  ['evaluation', 'Audit'],
]

const constructionScenes = [
  {
    name: 'Interactive ROS city',
    prompt: 'Build a driveable city with dense streets, varied buildings, and live ROS control.',
    video: 'media/hero-city.mp4',
    poster: 'media/poster-hero-city.jpg',
    systems: 'Vehicle · sensors · ROS',
    detail: '130 scene assets · 3 cameras · live control',
  },
  {
    name: 'Physically arranged dining room',
    prompt: 'Create a furnished dining room where every object is supported, correctly oriented, and stable under gravity.',
    video: 'media/demo-dining-room.mp4',
    poster: 'media/poster-dining-room.jpg',
    systems: 'Assets · contact · placement',
    detail: 'visual review · trajectory checks · repair',
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
    domain: 'Fluids',
    prompt: 'A circular ring of hinged paddles drives inward waves that focus into a central free-surface spike.',
  },
  'A stone enters still water': {
    domain: 'Fluids',
    prompt: 'A stone is dropped into a still pond, creating a splash and outward-propagating waves.',
  },
  'Energy in a pendulum': {
    domain: 'Mechanics',
    prompt: 'A pendulum swings between two peaks while exchanging potential and kinetic energy.',
  },
  'A flexible board takes an impact': {
    domain: 'Deformables',
    prompt: 'A falling rigid sphere contacts a flexible board, which bends under impact and rebounds from its solved FEA state.',
  },
  'Two billiard balls exchange momentum': {
    domain: 'Mechanics',
    prompt: 'Two billiard balls collide; contact impulse exchanges momentum, and friction determines their subsequent rolling.',
  },
  'A slack rope pulls a box': {
    domain: 'Mechanics',
    prompt: 'A segmented rope straightens, becomes taut, and transmits tension through its constraints to a frictional box.',
  },
  'A sponge compresses under load': {
    domain: 'Deformables',
    prompt: 'Driven platens load a soft sponge while its FEA and contact state produce the visible compression and recovery.',
  },
  'Water forms a driven vortex': {
    domain: 'Fluids',
    prompt: 'A motor-driven BCE spoon transfers momentum into SPH water and creates a vortex through the fluid solve.',
  },
  'Thickness changes fracture': {
    domain: 'Deformables',
    prompt: 'The same dynamic hammer contacts thin and thick glass panes, and measured stress produces thickness-dependent fracture.',
  },
  'A spring stores and releases': {
    domain: 'Deformables',
    prompt: 'An elastic spring deforms, stores energy, and returns toward its resting configuration.',
  },
  'A beach ball meets a pool': {
    domain: 'Fluids',
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
      <video className="hero__video" src={asset('media/hero-city.mp4')} poster={asset('media/poster-hero-city.jpg')} muted loop autoPlay playsInline preload="auto" aria-label="ChronoAgentic generated ROS city simulation" />
      <div className="hero__veil" />
      <div className="hero__content shell">
        <div className="hero__venue" data-reveal><i /> RESEARCH PREVIEW · 2026 <i /></div>
        <h1 data-reveal>
          <span className="hero__name">ChronoAgentic:</span>
          <span>A Code-based Multi-Agent World Simulator for Physically Grounded Simulation Construction</span>
        </h1>
        <div className="hero__authors" data-reveal>
          {authors.map((author, index) => (
            <span key={author.name}>{author.name}{author.equal && <sup>*</sup>}{index < authors.length - 1 ? ',' : ''}</span>
          ))}
        </div>
        <p className="hero__affiliation" data-reveal>University of Wisconsin–Madison · <sup>*</sup> Equal contribution</p>
        <div className="hero__links" data-reveal>
          <ResourceLink href="https://github.com/Hongyu0329/chrono-agentic" icon="github" primary>Code</ResourceLink>
          <ResourceLink href="#worlds" icon="play">Verified demos</ResourceLink>
          <ResourceLink href="#construction" icon="code">Pipeline</ResourceLink>
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
          kicker="Overview"
          title={<>The world is the program.<br />The rollout is the evidence.</>}
          copy="ChronoAgentic constructs physically grounded worlds as executable PyChrono programs rather than predicting future frames in a latent video state."
        />
        <div className="abstract-block" data-reveal>
          <span>ABSTRACT</span>
          <div>
            <p>Video-based world models can produce plausible rollouts, but contacts drift, shapes distort, and motion loses consistency because physical constraints remain implicit. ChronoAgentic makes the world state explicit: bodies, joints, contacts, terrain, sensors, controllers, and numerical integration live in inspectable code.</p>
            <p>Four context-isolated agents plan, construct, observe, and review each simulation. Runtime logs, trajectories, rendered videos, and deterministic physics checks ground targeted repairs until the executable world is accepted or reported as blocked.</p>
          </div>
        </div>
        <div className="overview-principles" data-reveal>
          {[
            ['01', 'Plan', 'Natural language becomes a human-readable scene contract before code is written.'],
            ['02', 'Execute', 'A standalone PyChrono program advances explicit physical state through time.'],
            ['03', 'Verify', 'Visual evidence and numerical trajectories must agree before acceptance.'],
          ].map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
        <figure className="comparison-figure" data-reveal>
          <button type="button" onClick={() => onOpenMedia({ type: 'image', src: 'media/comparison.png', alt: 'Video-based world modeling compared with executable simulation', caption: 'Video-based world modeling predicts frames from latent state. ChronoAgentic generates a program that exposes and advances physical state.' })}>
            <img src={asset('media/comparison.png')} alt="Video-based world modeling compared with executable simulation" loading="lazy" />
            <span><Icon name="expand" size={16} /> Expand</span>
          </button>
          <figcaption><b>Two world representations.</b> Video generation keeps mechanics latent; executable simulation exposes the state that determines what can happen next.</figcaption>
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
        <div className="scene-showcase__hud"><span><i /> EXECUTED SIMULATION</span><span>{String(active + 1).padStart(2, '0')} / {String(constructionScenes.length).padStart(2, '0')}</span></div>
        <div className="scene-showcase__caption">
          <span>PROMPT</span>
          <p>“{scene.prompt}”</p>
        </div>
      </div>
      <aside className="scene-showcase__aside">
        <div><span>SELECTED WORLD</span><h3>{scene.name}</h3><p>{scene.systems}</p></div>
        <dl><dt>Construction</dt><dd>agent-generated code</dd><dt>Runtime</dt><dd>Project Chrono</dd><dt>Artifacts</dt><dd>{scene.detail}</dd></dl>
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
          kicker="World construction"
          title={<>From an open prompt<br />to a simulation-ready world.</>}
          copy="The same construction loop spans populated scenes, rigid and deformable mechanics, fluids, lighting, sensors, vehicles, and live ROS interaction."
        />
        <SceneShowcase />
      </div>
      <div className="shell pipeline-section">
        <div className="pipeline-section__heading" data-reveal>
          <div><span>THE CLOSED LOOP</span><h3>Six stages. One inspectable handoff at a time.</h3></div>
          <p>Every agent writes a persistent artifact for the next role. Failed worlds are patched in place instead of regenerated from scratch.</p>
        </div>
        <div className="pipeline-viewer" data-reveal>
          <button className="pipeline-viewer__figure" type="button" onClick={() => onOpenMedia({ type: 'image', src: 'media/pipeline.png', alt: 'ChronoAgentic agent pipeline', caption: 'Planning, code generation, staged execution, visual analysis, physics validation, and targeted repair.' })}>
            <img src={asset('media/pipeline.png')} alt="ChronoAgentic agent pipeline" loading="lazy" />
            <span><Icon name="expand" size={15} /> View full pipeline</span>
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
        <p>“{detail.prompt}”</p>
        <small><i />{demo.verdict}{demo.auditId && ` · PWB ${demo.auditId}`} · {demo.evidence}</small>
      </div>
    </article>
  )
}

function Worlds({ onOpenMedia }) {
  const [filter, setFilter] = useState('All')
  const filters = ['All', 'Mechanics', 'Fluids', 'Deformables']
  const visible = useMemo(
    () => demos.filter((demo) => demo.verdict === 'Pure physics' && (filter === 'All' || worldDetails[demo.title].domain === filter)),
    [filter],
  )

  return (
    <section className="worlds section" id="worlds">
      <div className="shell-wide">
        <SectionHeading
          kicker="Solver-executed worlds"
          title={<>Real state.<br />Visible physics.</>}
          copy="Ten prompt-audited PhyWorld rollouts and the validated FloWave pool form this Pure physics collection. Every displayed result is driven by its named solver mechanism."
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
          kicker="Interactive simulation"
          title={<>Generated worlds<br />can keep running.</>}
          copy="The construction loop extends beyond benchmark clips to a large, asset-rich city connected to a live ROS driving environment."
          light
        />
      </div>
      <div className="shell-wide interaction-film" data-reveal>
        <video src={asset('media/hero-city.mp4')} poster={asset('media/poster-hero-city.jpg')} muted loop autoPlay playsInline preload="metadata" />
        <div className="interaction-film__top"><span><i /> ROS WORLD ONLINE</span><span>CHRONO SENSOR · CHASE CAMERA</span></div>
        <div className="interaction-film__caption"><span>BEYOND THE BENCHMARK</span><h3>A driveable world with 130 assets, live control, multiple cameras, and collision-aware streets.</h3></div>
      </div>
      <div className="shell interaction-details">
        <button type="button" onClick={() => onOpenMedia({ type: 'image', src: 'media/ros-city.png', alt: 'ROS city cameras and views', caption: 'The generated city supports live vehicle control, sensor cameras, and ROS-connected interaction.' })} data-reveal>
          <img src={asset('media/ros-city.png')} alt="ROS city cameras and views" loading="lazy" /><span><Icon name="expand" size={15} /> Multi-camera ROS world</span>
        </button>
        <div className="interaction-details__copy" data-reveal>
          {[
            ['01', 'Control', 'Drive the generated vehicle through a live ROS interface.'],
            ['02', 'Observe', 'Read synchronized camera streams and simulator telemetry.'],
            ['03', 'Interact', 'Keep collision, terrain, and vehicle dynamics active over time.'],
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
          kicker="Simulation-ready programs"
          title={<>Inspectable before,<br />during, and after execution.</>}
          copy="The result is not only a rendered clip. Source code, simulator state, trajectory diagnostics, visual observations, and the final verdict remain separate, replayable artifacts."
        />
        <div className="ready-layout">
          <button className="ready-layout__figure" type="button" onClick={() => onOpenMedia({ type: 'image', src: 'media/iteration-loop.png', alt: 'Evidence-driven iteration loop', caption: 'Review combines simulation data and camera evidence, then returns one grounded repair to the code agent.' })} data-reveal>
            <img src={asset('media/iteration-loop.png')} alt="Evidence-driven iteration loop" loading="lazy" />
            <span><Icon name="expand" size={15} /> Evidence-driven iteration</span>
          </button>
          <div className="ready-layout__steps" data-reveal>
            {[
              ['Source', 'The delivered Python program explicitly defines geometry, constraints, controllers, sensors, and numerical settings.', 'simulation.py'],
              ['Execution', 'Physics-only, first-frame, and full-render passes expose failures before expensive rollout generation.', 'run artifacts'],
              ['Evidence', 'Visual descriptions and deterministic trajectory checks are triangulated against the committed plan.', 'review verdict'],
            ].map(([title, copy, artifact], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p><code>{artifact}</code></article>)}
          </div>
        </div>
        <div className="repair-example" data-reveal>
          <div><span>REPAIR IN PRACTICE</span><h3>One grounded defect. One targeted patch.</h3><p>Wrong orientation and unstable placement are reported with visual and trajectory evidence, then repaired in the same program.</p></div>
          <button type="button" onClick={() => onOpenMedia({ type: 'image', src: 'media/dining-repair.png', alt: 'Dining room repair sequence', caption: 'An asset-rich dining scene converges through evidence-grounded repairs.' })}><img src={asset('media/dining-repair.png')} alt="Dining room repair sequence" loading="lazy" /><span><Icon name="expand" size={15} /></span></button>
        </div>
      </div>
    </section>
  )
}

function PhysicsInventoryBars() {
  return (
    <div className="category-chart" aria-label="Verified physics implementations by category">
      <div className="category-chart__scale"><span>0</span><span>2</span><span>4</span><span>6</span><span>8</span><span>10</span></div>
      {physicsInventory.map((row) => {
        const width = (row.count / 10) * 100
        return <div className="category-row" key={row.name}><span>{row.name}</span><div><i style={{ width: `${width}%` }} /><b>{row.count}</b></div></div>
      })}
    </div>
  )
}

function Evaluation() {
  return (
    <section className="evaluation section" id="evaluation">
      <div className="shell">
        <SectionHeading
          kicker="Prompt-grounded physics inventory"
          title={<>49 verified physics<br />implementations.</>}
          copy="Each counted case models the mechanism named by its prompt and produces the visible response through the corresponding solver."
        />
        <div className="evaluation-numbers" data-reveal>
          <article><strong><AnimatedMetric value={49} /></strong><span>Pure physics</span><p>prompt-grounded mechanism is solver-driven</p></article>
          <article><strong><AnimatedMetric value={7} /></strong><span>Physics categories</span><p>categories containing verified implementations</p></article>
          <article><strong><AnimatedMetric value={10} /></strong><span>Audited videos shown</span><p>prompt-grounded PhyWorld demonstrations</p></article>
          <article><strong><AnimatedMetric value={1.02} suffix="M" decimals={2} /></strong><span>FloWave particles</span><p>solver particles in the featured SPH world</p></article>
        </div>
        <div className="evaluation-grid">
          <div className="evaluation-panel" data-reveal>
            <div className="evaluation-panel__head"><div><span>IMPLEMENTATION INVENTORY</span><h3>Verified runs by category</h3></div><small>RUN COUNT</small></div>
            <PhysicsInventoryBars />
          </div>
          <div className="evaluation-panel evaluation-panel--policy" data-reveal>
            <div className="evaluation-panel__head"><div><span>SITE ALLOW-LIST</span><h3>What counts as a demo here</h3></div><small>PURE ONLY</small></div>
            <div className="audit-rules">
              <article><span>01</span><div><b>Named cause is modeled</b><p>Contact, gravity, joints, FEA, fracture, or coupled SPH/FSI generates the scored response.</p></div></article>
              <article><span>02</span><div><b>Experimental inputs are allowed</b><p>A release, motorized boundary, or applied load may initiate a response that then evolves physically.</p></div></article>
              <article><span>03</span><div><b>Solver evidence is visible</b><p>Trajectories, contact state, field data, and rendered motion originate from the same executable world.</p></div></article>
              <article><span>04</span><div><b>Verified rows only</b><p>The website data carries the audit ID and Pure physics verdict for every displayed PhyWorld clip.</p></div></article>
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
      <div className="shell footer__main"><a className="footer__project" href="#top">Chrono<span>Agentic</span></a><p>Executable worlds for physically grounded simulation construction.</p><div><a href="https://github.com/Hongyu0329/chrono-agentic" target="_blank" rel="noreferrer">GitHub</a><a href="https://projectchrono.org/" target="_blank" rel="noreferrer">Project Chrono</a><a href="https://sbel.wisc.edu/" target="_blank" rel="noreferrer">UW–Madison SBEL</a></div></div>
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
