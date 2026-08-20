import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from './Icons.jsx'
import {
  authors,
  comparisonMetrics,
  demos,
  pipelineSteps,
  videoModelComparison,
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
  ['worlds', 'Physics'],
  ['city', 'City Scene'],
  ['evaluation', 'Evidence'],
]

const worldDetails = {
  'FloWave focused-wave pool': {
    domain: 'Additional solver demonstration',
    prompt: 'A circular ring of hinged paddles drives inward waves that focus into a central free-surface spike.',
  },
  'A stone enters still water': {
    domain: 'Fluid and Particle Dynamics',
    prompt: 'A stone is dropped into a still pond, creating a splash and outward-propagating waves.',
  },
  'Energy in a pendulum': {
    domain: 'Energy Conservation',
    prompt: 'A pendulum swings between two peaks while exchanging potential and kinetic energy.',
  },
  'A flexible board takes an impact': {
    domain: 'Deformations and Elasticity',
    prompt: 'A falling rigid sphere contacts a flexible board, which bends under impact and rebounds from its solved FEA state.',
  },
  'Two billiard balls exchange momentum': {
    domain: 'Interaction Dynamics',
    prompt: 'Two billiard balls collide; contact impulse exchanges momentum, and friction determines their subsequent rolling.',
  },
  'A slack rope pulls a box': {
    domain: 'Interaction Dynamics',
    prompt: 'A segmented rope straightens, becomes taut, and transmits tension through its constraints to a frictional box.',
  },
  'A sponge compresses under load': {
    domain: 'Deformations and Elasticity',
    prompt: 'Driven platens load a soft sponge while its FEA and contact state produce the visible compression and recovery.',
  },
  'Water forms a driven vortex': {
    domain: 'Fluid and Particle Dynamics',
    prompt: 'A motor-driven BCE spoon transfers momentum into SPH water and creates a vortex through the fluid solve.',
  },
  'Thickness changes fracture': {
    domain: 'Scale and Proportions',
    prompt: 'The same dynamic hammer contacts thin and thick glass panes, and measured stress produces thickness-dependent fracture.',
  },
  'A spring stores and releases': {
    domain: 'Deformations and Elasticity',
    prompt: 'An elastic spring deforms, stores energy, and returns toward its resting configuration.',
  },
  'A beach ball meets a pool': {
    domain: 'Fluid and Particle Dynamics',
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
            <p>Video-based world models generate visually plausible rollouts, but since they infer dynamics in latent states they enforce no explicit physical constraints: contacts drift, shapes distort, and motion loses consistency. We present ChronoAgentic, a multi-agent framework that instead constructs the world as executable simulation code. The plan agent converts the natural-language prompt into a structured scene plan that the user can inspect and approve. The code agent implements the plan as an executable PyChrono program, grounded in a curated skill library, a generative 3D asset pipeline, and retrieval over the simulator source. After execution, the visual-analysis agent describes the rendered rollout, while deterministic physics checks scan the simulated trajectories for anomalies. The review agent evaluates this execution evidence, and the code agent iteratively repairs the program until it satisfies the plan objectives and physical constraints. On a suite of 80 demos selected from the PhyWorldBench benchmark, ChronoAgentic satisfies the benchmark's full correctness criterion—semantic adherence and physical correctness judged jointly—on 82.5% of demos, against 52.5% for the strongest of ten text-to-video models scored under the same criterion on their officially released benchmark videos. The same construction loop extends to interactive use, including a live ROS driving environment in a generated city.</p>
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
          <div className="comparison-figure__grid">
            <button type="button" onClick={() => onOpenMedia({ type: 'image', src: 'media/video-based-world-model.svg', alt: 'Video-based world model diagram', caption: 'The baseline conditions a latent diffusion process on image and text, then decodes the rollout into rendered frames without explicitly enforcing physical state constraints.' })}>
              <img src={asset('media/video-based-world-model.svg')} alt="Video-based world model pipeline with implicit latent dynamics" loading="lazy" />
              <span className="comparison-figure__expand"><Icon name="expand" size={15} /> Inspect diagram</span>
            </button>
            <button type="button" onClick={() => onOpenMedia({ type: 'image', src: 'media/agentic-world-simulator.svg', alt: 'Agentic world simulator diagram', caption: 'ChronoAgentic generates an executable scene program, advances it in PyChrono, and returns rollout evidence to a visual and physics review loop before acceptance.' })}>
              <img src={asset('media/agentic-world-simulator.svg')} alt="Agentic world simulator with executable PyChrono state and review-driven correction" loading="lazy" />
              <span className="comparison-figure__expand"><Icon name="expand" size={15} /> Inspect diagram</span>
            </button>
          </div>
          <figcaption><b>Two world representations.</b> The baseline decodes video from implicit latent dynamics; ChronoAgentic generates and reviews an executable program whose physical state and rollout evidence remain inspectable.</figcaption>
        </figure>
      </div>
    </section>
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
      </div>
      <div className="shell pipeline-section">
        <div className="pipeline-section__heading" data-reveal>
          <div><span>THE ARTIFACT CONTRACT</span><h3>Four role-specific agents. One closed construction loop.</h3></div>
          <p>The separation comes from isolated context, scoped write authority, and artifact-mediated handoffs—not model heterogeneity or parallel execution.</p>
        </div>
        <div className="pipeline-viewer" data-reveal>
          <button className="pipeline-viewer__figure" type="button" onClick={() => onOpenMedia({ type: 'image', src: 'media/pipeline.svg', alt: 'ChronoAgentic multi-agent pipeline', caption: 'A prompt and optional image become a reviewed plan, executable PyChrono code, simulation evidence, visual analysis, and a validity decision that either stops the loop or returns a targeted report.' })}>
            <img src={asset('media/pipeline.svg')} alt="ChronoAgentic agent pipeline" loading="lazy" />
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
        <button className="world-card__open" type="button" aria-label={`Open ${demo.title}`} onClick={() => onOpen({ type: 'video', src: demo.video, poster: demo.poster, alt: demo.title, caption: detail.prompt })} />
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
  const visible = useMemo(() => demos.filter((demo) => demo.approved), [])

  return (
    <section className="worlds section" id="worlds">
      <div className="shell-wide">
        <SectionHeading
          kicker="Selected evaluation rollouts"
          title={<>Executable programs,<br />rendered as evidence.</>}
          copy="This gallery shows a curated subset of accepted runs from the paper's PhyWorldBench campaign, together with FloWave as an additional solver demonstration. Paper-level statistics are computed on the full 80-demo set, not on this gallery."
        />
        <div className="world-grid">{visible.map((demo) => <WorldCard key={demo.title} demo={demo} index={demos.indexOf(demo)} onOpen={onOpenMedia} />)}</div>
      </div>
    </section>
  )
}

function CityWorld({ onOpenMedia }) {
  return (
    <section className="interaction section" id="city">
      <div className="shell">
        <SectionHeading
          kicker="Generated city case study"
          title={<>The same loop builds<br />a complete city world.</>}
          copy="ChronoAgentic constructs a 3 × 3 street grid with 130 unique minted assets, a sedan, and sensor-camera views inside one executable PyChrono scene."
          light
        />
      </div>
      <div className="shell-wide interaction-film" data-reveal>
        <video src={asset('media/hero-city.mp4')} poster={asset('media/poster-hero-city.jpg')} muted loop autoPlay playsInline preload="metadata" />
        <div className="interaction-film__top"><span><i /> PYCHRONO CITY · RECORDED RUN</span><span>CHASSIS · CAMERA · SCENE ASSETS</span></div>
        <div className="interaction-film__caption"><span>GENERATED CITY WORLD</span><h3>Scene construction, vehicle dynamics, and sensor rendering execute together in one world.</h3></div>
      </div>
      <div className="shell interaction-details">
        <button type="button" onClick={() => onOpenMedia({ type: 'image', src: 'media/city-top-down.png', alt: 'Top-down view of the generated 3 × 3 city', caption: 'Top-down view of the generated city, showing nine populated blocks, the surrounding road grid, buildings, street-level assets, and the vehicle route.' })} data-reveal>
          <img src={asset('media/city-top-down.png')} alt="Top-down view of the generated 3 × 3 city" loading="lazy" /><span><Icon name="expand" size={15} /> Top-down view</span>
        </button>
        <div className="interaction-details__copy" data-reveal>
          {[
            ['01', 'Lay out', 'A 3 × 3 street grid establishes the road network, blocks, sidewalks, and vehicle route.'],
            ['02', 'Populate', 'The accepted scene places 130 unique minted assets across buildings and street-level props.'],
            ['03', 'Simulate', 'A sedan, rigid-body contacts, and sensor cameras advance together in the executable scene.'],
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

function VideoModelComparison() {
  const [metric, setMetric] = useState('both')
  const active = comparisonMetrics.find((item) => item.key === metric)
  const baselines = useMemo(() => videoModelComparison.filter((row) => !row.ours), [])
  const ours = useMemo(() => videoModelComparison.find((row) => row.ours), [])
  const ranked = useMemo(() => [...videoModelComparison].sort((a, b) => b[metric] - a[metric]), [metric])
  const mean = (key) => baselines.reduce((total, row) => total + row[key], 0) / baselines.length
  const leader = (key) => baselines.reduce((top, row) => (row[key] > top[key] ? row : top), baselines[0])

  return (
    <div className="comparison-block">
      <div className="pipeline-section__heading" data-reveal>
        <div><span>SIMULATOR VERSUS VIDEO WORLD MODELS</span><h3>Ten text-to-video models. The same eighty prompts.</h3></div>
        <p>Every baseline is its official PhyWorldBench release video for the identical scenario prompt, scored by the same judge under the same full-video protocol as our rollouts.</p>
      </div>
      <div className="margin-cards" data-reveal>
        {comparisonMetrics.map((item) => {
          const top = leader(item.key)
          const average = mean(item.key)
          const scale = (value) => `${Math.max(value, 3)}%`
          return (
            <article key={item.key}>
              <header><span>{item.short}</span><h3>{item.label}</h3></header>
              <div className="margin-card__bars">
                <div className="margin-bar margin-bar--ours">
                  <span>ChronoAgentic</span>
                  <i style={{ width: scale(ours[item.key]) }} />
                  <b>{ours[item.key].toFixed(1)}%</b>
                </div>
                <div className="margin-bar">
                  <span>Best video model · {top.name}</span>
                  <i style={{ width: scale(top[item.key]) }} />
                  <b>{top[item.key].toFixed(1)}%</b>
                </div>
                <div className="margin-bar margin-bar--mean">
                  <span>Ten-model mean</span>
                  <i style={{ width: scale(average) }} />
                  <b>{average.toFixed(1)}%</b>
                </div>
              </div>
              <p><em>+{(ours[item.key] - top[item.key]).toFixed(1)} points</em> over the strongest video model. {item.copy}</p>
            </article>
          )
        })}
      </div>
      <div className="evaluation-panel ranking-panel" data-reveal>
        <div className="evaluation-panel__head">
          <div><span>PER-SYSTEM RESULT</span><h3>Eleven systems on the same 80-demo set</h3></div>
          <div>
            {comparisonMetrics.map((item) => (
              <button key={item.key} type="button" className={metric === item.key ? 'is-active' : ''} aria-pressed={metric === item.key} onClick={() => setMetric(item.key)}>{item.short}</button>
            ))}
          </div>
        </div>
        <p className="ranking-panel__note">Bars and ordering follow <b>{active.short}</b>. {active.copy}</p>
        <div className="ranking-table" role="table" aria-label={`PhyWorldBench systems ranked by ${active.label}`}>
          <div className="ranking-row ranking-row--head" role="row">
            <span role="columnheader">#</span>
            <span role="columnheader">System</span>
            <span role="columnheader" className="ranking-row__bar-head">{active.label}</span>
            <span role="columnheader">SA</span>
            <span role="columnheader">PC</span>
            <span role="columnheader">SA ∧ PC</span>
          </div>
          {ranked.map((row, index) => (
            <div className={`ranking-row ${row.ours ? 'ranking-row--ours' : ''}`} key={row.name} role="row">
              <span className="ranking-row__rank" role="cell">{String(index + 1).padStart(2, '0')}</span>
              <span className="ranking-row__name" role="cell"><b>{row.name}</b><small>{row.ours ? 'ours · code-based world simulator' : row.note}</small></span>
              <span className="ranking-row__bar" role="cell"><i style={{ width: `${Math.max(row[metric], 2)}%` }} /></span>
              <span className={`ranking-row__value ${metric === 'sa' ? 'is-active' : ''}`} role="cell">{row.sa.toFixed(1)}</span>
              <span className={`ranking-row__value ${metric === 'pc' ? 'is-active' : ''}`} role="cell">{row.pc.toFixed(1)}</span>
              <span className={`ranking-row__value ${metric === 'both' ? 'is-active' : ''}`} role="cell">{row.both.toFixed(1)}</span>
            </div>
          ))}
        </div>
        <p className="ranking-panel__foot">All values are percentages of the 80 demos. Baseline judgments cover the full demo set, so every row is scored over the same eighty prompts.</p>
      </div>
    </div>
  )
}

function Evaluation() {
  return (
    <section className="evaluation section" id="evaluation">
      <div className="shell">
        <SectionHeading
          kicker="PhyWorldBench evaluation"
          title={<>Eighty demos.<br />Judged on the full rollout.</>}
          copy="The paper evaluates two scenarios from 8 physical categories (Object Motion and Kinematics, Interaction Dynamics, Energy Conservation, Fluid and Particle Dynamics, Rigid Body Dynamics, Lighting and Shadows, Deformations and Elasticity, Scale and Proportions) for 80 demos and 146 scenario-specific Key Standards. A vision-language judge scores on complete rollout."
        />
        <div className="evaluation-numbers" data-reveal>
          <article><strong><AnimatedMetric value={80} /></strong><span>Evaluation demos</span><p>two scenarios from each selected subcategory</p></article>
          <article><strong><AnimatedMetric value={93.8} suffix="%" decimals={1} /></strong><span>Semantic adherence</span><p>required objects and event both appear</p></article>
          <article><strong><AnimatedMetric value={88.8} suffix="%" decimals={1} /></strong><span>Physical correctness</span><p>every Key Standard for the scenario passes</p></article>
          <article><strong><AnimatedMetric value={82.5} suffix="%" decimals={1} /></strong><span>Full correctness</span><p>semantic adherence and physical correctness jointly</p></article>
        </div>
        <VideoModelComparison />
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
        <CityWorld onOpenMedia={setMedia} />
        <SimulationReady onOpenMedia={setMedia} />
        <Evaluation />
      </main>
      <Footer />
      <MediaModal media={media} onClose={() => setMedia(null)} />
    </>
  )
}
