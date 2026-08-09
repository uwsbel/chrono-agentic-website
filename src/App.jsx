import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from './Icons.jsx'
import {
  authors,
  baselines,
  capabilities,
  categoryResults,
  citation,
  demos,
  evidenceCards,
  pipelineSteps,
} from './data.js'

const asset = (path) => `${import.meta.env.BASE_URL}${path}`

const navItems = [
  ['overview', 'Overview'],
  ['method', 'Method'],
  ['results', 'Results'],
  ['gallery', 'Gallery'],
  ['artifacts', 'Artifacts'],
]

function usePageEffects(setActiveSection) {
  useEffect(() => {
    document.documentElement.classList.add('js')

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            revealObserver.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 },
    )

    document.querySelectorAll('[data-reveal]').forEach((node) => revealObserver.observe(node))

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target?.id) setActiveSection(visible.target.id)
      },
      { rootMargin: '-20% 0px -68% 0px', threshold: [0, 0.2, 0.5] },
    )

    navItems.forEach(([id]) => {
      const section = document.getElementById(id)
      if (section) sectionObserver.observe(section)
    })

    const updateScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? window.scrollY / max : 0
      document.documentElement.style.setProperty('--scroll-progress', String(progress))
    }

    const updatePointer = (event) => {
      document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`)
      document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`)
    }

    updateScroll()
    window.addEventListener('scroll', updateScroll, { passive: true })
    window.addEventListener('pointermove', updatePointer, { passive: true })

    return () => {
      revealObserver.disconnect()
      sectionObserver.disconnect()
      window.removeEventListener('scroll', updateScroll)
      window.removeEventListener('pointermove', updatePointer)
    }
  }, [setActiveSection])
}

function IconLink({ href, icon, children, variant = 'primary', download, onClick }) {
  const external = href?.startsWith('http')
  return (
    <a
      className={`button button--${variant}`}
      href={href}
      download={download}
      onClick={onClick}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
    >
      <Icon name={icon} size={18} />
      <span>{children}</span>
      {variant !== 'quiet' && <Icon name={href?.startsWith('#') ? 'arrow' : 'external'} size={15} />}
    </a>
  )
}

function Wordmark({ compact = false }) {
  return (
    <a className={`wordmark ${compact ? 'wordmark--compact' : ''}`} href="#top" aria-label="ChronoAgentic home">
      <span className="wordmark__mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="wordmark__text">chrono<span>agentic</span></span>
    </a>
  )
}

function Navigation({ activeSection }) {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const close = () => setMenuOpen(false)
    window.addEventListener('resize', close)
    return () => window.removeEventListener('resize', close)
  }, [])

  return (
    <header className="site-header">
      <div className="scroll-progress" aria-hidden="true" />
      <nav className="nav shell" aria-label="Primary navigation">
        <Wordmark />
        <div className={`nav__links ${menuOpen ? 'is-open' : ''}`}>
          {navItems.map(([id, label]) => (
            <a
              key={id}
              className={activeSection === id ? 'is-active' : ''}
              href={`#${id}`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
          <a
            className="nav__github"
            href="https://github.com/Hongyu0329/chrono-agentic"
            target="_blank"
            rel="noreferrer"
          >
            <Icon name="github" size={17} />
            <span>Code</span>
          </a>
        </div>
        <button
          className="nav__menu"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} />
        </button>
      </nav>
    </header>
  )
}

function SectionIntro({ eyebrow, title, copy, align = 'left' }) {
  return (
    <div className={`section-intro section-intro--${align}`} data-reveal>
      <div className="eyebrow"><span />{eyebrow}</div>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  )
}

function AnimatedMetric({ value, suffix = '%', decimals = 1 }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    let frame
    let started = false

    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || started) return
      started = true
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduceMotion) {
        setDisplay(value)
        observer.disconnect()
        return
      }

      const start = performance.now()
      const duration = 1100
      const tick = (now) => {
        const elapsed = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - elapsed, 4)
        setDisplay(value * eased)
        if (elapsed < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
      observer.disconnect()
    }, { threshold: 0.6 })

    observer.observe(node)
    return () => {
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [value])

  return (
    <span ref={ref} aria-label={`${value}${suffix}`}>
      {display.toFixed(decimals)}{suffix}
    </span>
  )
}

function HeroWorldGlyph() {
  return (
    <div className="world-glyph" aria-hidden="true">
      <div className="world-glyph__grid" />
      <div className="world-glyph__orbit world-glyph__orbit--one"><i /></div>
      <div className="world-glyph__orbit world-glyph__orbit--two"><i /></div>
      <div className="world-glyph__core">
        <span className="world-glyph__axis world-glyph__axis--x" />
        <span className="world-glyph__axis world-glyph__axis--y" />
        <span className="world-glyph__axis world-glyph__axis--z" />
        <b />
      </div>
      <span className="world-glyph__label world-glyph__label--state">state(t)</span>
      <span className="world-glyph__label world-glyph__label--force">F →</span>
      <span className="world-glyph__label world-glyph__label--solver">Δt = 1e−3</span>
    </div>
  )
}

function HeroStudio() {
  return (
    <div className="studio-window hero-studio" data-reveal>
      <div className="studio-window__chrome">
        <div className="window-dots" aria-hidden="true"><i /><i /><i /></div>
        <div className="studio-window__title">
          <span className="live-dot" /> Chrono Studio · live workspace
        </div>
        <div className="studio-window__tools"><span>PyChrono 10.0</span><Icon name="layers" size={14} /></div>
      </div>
      <div className="hero-studio__body">
        <aside className="hero-studio__chat">
          <div className="panel-kicker">Conversation</div>
          <div className="chat-message chat-message--user">
            <div className="chat-avatar">Y</div>
            <p>Build a driveable city with dense streets, varied buildings, and live ROS control.</p>
          </div>
          <div className="chat-message chat-message--agent">
            <div className="chat-avatar chat-avatar--agent"><Icon name="spark" size={13} /></div>
            <div>
              <span className="agent-name">ChronoAgentic</span>
              <p>I’ll first commit the scene, vehicle, route-clearance, sensor, and ROS interfaces.</p>
            </div>
          </div>
          <div className="tool-card">
            <div><Icon name="paper" size={14} /><span>plan.md</span><b>committed</b></div>
            <small>130 assets · 1 vehicle · 3 cameras</small>
          </div>
          <div className="studio-thinking"><i /><i /><i /><span>executing staged run</span></div>
        </aside>
        <div className="hero-studio__viewport">
          <div className="viewport-toolbar">
            <span><Icon name="eye" size={14} /> Viewport</span>
            <span className="viewport-run">ros_city_drive / iteration_010</span>
            <span>chase_cam ▾</span>
          </div>
          <div className="viewport-video">
            <video
              src={asset('media/hero-city.mp4')}
              poster={asset('media/poster-hero-city.jpg')}
              muted
              loop
              autoPlay
              playsInline
              preload="auto"
              aria-label="Generated city driving simulation"
            />
            <div className="viewport-hud viewport-hud--top"><span>CHRONO / SENSOR</span><span>CAM 01</span></div>
            <div className="viewport-hud viewport-hud--bottom"><span>t 07.42 s</span><span>60 FPS</span></div>
            <div className="viewport-reticle" aria-hidden="true"><i /><i /></div>
          </div>
          <div className="viewport-timeline">
            <button type="button" aria-label="Pause preview"><Icon name="pause" size={13} /></button>
            <div className="timeline-track"><span /></div>
            <time>00:07 / 00:12</time>
          </div>
        </div>
        <aside className="hero-studio__inspector">
          <div className="inspector-tabs"><b>Lifecycle</b><span>Physics</span><span>VLM</span></div>
          <div className="run-health">
            <div className="run-health__ring"><span>4/4</span></div>
            <div><b>Run accepted</b><small>all evidence gates passed</small></div>
          </div>
          {[
            ['Plan', 'scene contract committed'],
            ['Physics', 'stable · no anomaly'],
            ['Render', '3 cameras captured'],
            ['Review', 'objectives satisfied'],
          ].map(([label, note]) => (
            <div className="lifecycle-row" key={label}>
              <i><Icon name="check" size={11} /></i>
              <div><b>{label}</b><small>{note}</small></div>
            </div>
          ))}
          <div className="evidence-chip"><Icon name="shield" size={13} /> checksum stamped</div>
        </aside>
      </div>
      <div className="studio-window__status">
        <span><i className="status-ok" /> agent loop closed</span>
        <span>source · video · trajectory · verdict</span>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="hero" id="overview">
      <div className="hero__wash" aria-hidden="true" />
      <HeroWorldGlyph />
      <div className="shell hero__content">
        <div className="hero__copy">
          <div className="release-pill" data-reveal>
            <span><i /> 2026 research preview</span>
            <b>80-demo evaluation</b>
          </div>
          <h1 data-reveal>
            Worlds that <em>run.</em><br />
            Evidence that <em>holds.</em>
          </h1>
          <p className="hero__dek" data-reveal>
            <strong>ChronoAgentic</strong> is a code-based multi-agent framework that turns natural language and images into executable, inspectable, and physically grounded PyChrono simulations.
          </p>
          <div className="hero__actions" data-reveal>
            <IconLink href={asset('chronoagentic-paper.pdf')} icon="paper" variant="primary">Read the paper</IconLink>
            <IconLink href="https://github.com/Hongyu0329/chrono-agentic" icon="github" variant="secondary">View code</IconLink>
            <a className="text-link" href="#gallery">Watch worlds <Icon name="arrow" size={16} /></a>
          </div>
          <div className="hero__authors" data-reveal>
            <div className="author-list">
              {authors.map((author, index) => (
                <span key={author.name}>
                  {author.name}{author.equal && <sup>*</sup>}{index < authors.length - 1 ? ',' : ''}
                </span>
              ))}
            </div>
            <div className="affiliation">
              <span className="uw-mark">W</span>
              <span>University of Wisconsin–Madison</span>
              <small>* equal contribution</small>
            </div>
          </div>
        </div>
        <div className="hero__aside" data-reveal>
          <div className="hero-stat">
            <span className="hero-stat__number"><AnimatedMetric value={82.5} /></span>
            <span className="hero-stat__label">full correctness<br />on PhyWorldBench</span>
          </div>
          <div className="hero-stat hero-stat--secondary">
            <span className="hero-stat__number">+30.0</span>
            <span className="hero-stat__label">points over the<br />strongest video baseline</span>
          </div>
        </div>
      </div>
      <div className="shell"><HeroStudio /></div>
      <a className="scroll-cue" href="#premise" aria-label="Scroll to the premise">
        <Icon name="mouse" size={17} /><span>Explore the system</span>
      </a>
    </section>
  )
}

function Premise() {
  return (
    <section className="premise section" id="premise">
      <div className="shell premise__grid">
        <div className="premise__statement" data-reveal>
          <span className="oversize-index">01</span>
          <p className="quote-mark">“</p>
          <h2>A plausible frame is not yet a <em>physical world.</em></h2>
        </div>
        <div className="premise__copy" data-reveal>
          <p className="lead">Video models render outcomes. ChronoAgentic constructs the state that makes outcomes possible.</p>
          <p>Generated code explicitly specifies bodies, joints, contact, terrain, sensors, controllers, and numerical integration. Every world can be executed, inspected, revised, and replayed.</p>
          <a className="inline-link" href="#method">See how the loop closes <Icon name="arrow" size={16} /></a>
        </div>
      </div>
      <div className="shell paradigm-card" data-reveal>
        <div className="paradigm-card__side paradigm-card__side--latent">
          <div className="paradigm-card__label">Latent video world</div>
          <div className="latent-frames" aria-hidden="true">
            <i /><i /><i /><i />
          </div>
          <h3>Pixels predict pixels</h3>
          <p>Dynamics remain implicit; solver state and physical constraints are not directly inspectable.</p>
          <div className="paradigm-card__tags"><span>appearance</span><span>rollout</span><span>latent state</span></div>
        </div>
        <div className="paradigm-card__versus"><span>vs.</span></div>
        <div className="paradigm-card__side paradigm-card__side--code">
          <div className="paradigm-card__label">Executable simulation world</div>
          <div className="code-world" aria-hidden="true">
            <div className="code-world__editor"><i /><i /><i /><i /></div>
            <Icon name="arrow" size={22} />
            <div className="code-world__solver"><span /><span /><b /></div>
          </div>
          <h3>Programs define worlds</h3>
          <p>Explicit state advances through a physics engine and produces both trajectories and rendered observations.</p>
          <div className="paradigm-card__tags"><span>source</span><span>solver state</span><span>evidence</span></div>
        </div>
      </div>
    </section>
  )
}

function PipelineVisual({ active }) {
  const step = pipelineSteps[active]
  return (
    <div className={`pipeline-visual pipeline-visual--${step.color}`}>
      <div className="pipeline-visual__resources">
        <span><Icon name="layers" size={15} /> Skill library</span>
        <i>+</i>
        <span><Icon name="database" size={15} /> Assets</span>
        <i>+</i>
        <span><Icon name="orbit" size={15} /> Chrono RAG</span>
      </div>
      <div className="pipeline-visual__stage">
        <div className="agent-node">
          <small>{step.id} / 06</small>
          <div className="agent-node__icon">
            <Icon name={active === 0 ? 'paper' : active === 1 ? 'code' : active === 2 ? 'terminal' : active === 3 ? 'eye' : active === 4 ? 'shield' : 'spark'} size={29} />
          </div>
          <strong>{step.agent}</strong>
          <span>active role</span>
        </div>
        <div className="flow-signal" aria-hidden="true"><i /><i /><i /></div>
        <div className="artifact-node">
          <div className="artifact-node__top"><Icon name="layers" size={17} /><span>Persistent artifact</span></div>
          <code>{step.artifact}</code>
          <div className="artifact-lines"><i /><i /><i /><i /></div>
          <div className="artifact-node__stamp"><Icon name="check" size={12} /> inspectable</div>
        </div>
      </div>
      <div className="pipeline-visual__loop">
        {pipelineSteps.map((item, index) => (
          <span key={item.id} className={index === active ? 'is-active' : index < active ? 'is-past' : ''}>
            <i>{index < active ? <Icon name="check" size={9} /> : item.id}</i>
            <small>{item.short}</small>
          </span>
        ))}
      </div>
    </div>
  )
}

function FigureButton({ src, alt, caption, onOpen, className = '' }) {
  return (
    <figure className={`paper-figure ${className}`} data-reveal>
      <button type="button" onClick={() => onOpen({ src, alt, caption })} aria-label={`Expand figure: ${caption}`}>
        <img src={asset(src)} alt={alt} loading="lazy" />
        <span><Icon name="expand" size={17} /> Expand figure</span>
      </button>
      <figcaption>{caption}</figcaption>
    </figure>
  )
}

function Method({ onOpenFigure }) {
  const [activeStep, setActiveStep] = useState(0)
  const step = pipelineSteps[activeStep]

  return (
    <section className="method section" id="method">
      <div className="shell">
        <SectionIntro
          eyebrow="Method · a closed evidence loop"
          title={<>From request to <em>accepted&nbsp;world</em></>}
          copy="Four context-isolated agents exchange human-readable plans, executable programs, rendered observations, and review reports. Deterministic gates keep every handoff accountable."
        />
        <div className="method-interactive" data-reveal>
          <div className="method-interactive__tabs" role="tablist" aria-label="ChronoAgentic pipeline steps">
            {pipelineSteps.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={index === activeStep}
                className={index === activeStep ? 'is-active' : ''}
                onClick={() => setActiveStep(index)}
              >
                <span>{item.id}</span>
                <div><b>{item.short}</b><small>{item.artifact}</small></div>
                <Icon name="arrow" size={15} />
              </button>
            ))}
          </div>
          <div className="method-interactive__content">
            <PipelineVisual active={activeStep} />
            <div className="method-step-copy" key={step.id}>
              <div className="method-step-copy__meta"><span>{step.agent}</span><code>{step.artifact}</code></div>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </div>
          </div>
        </div>
        <FigureButton
          src="media/pipeline.png"
          alt="Official ChronoAgentic multi-agent pipeline diagram"
          caption="Figure 2. The official multi-agent pipeline used in the paper."
          onOpen={onOpenFigure}
          className="paper-figure--wide"
        />
      </div>
    </section>
  )
}

function Evidence() {
  const [tab, setTab] = useState('physics')
  const tabs = ['viewport', 'physics', 'lifecycle']

  return (
    <section className="evidence section section--ink">
      <div className="shell">
        <SectionIntro
          eyebrow="Evidence-grounded by design"
          title={<>The rollout is reviewed.<br />The claim is <em>verified.</em></>}
          copy="Chrono Studio exposes the same artifacts the agents use: the conversation, rendered world, run lifecycle, physical traces, visual report, source, and logs."
        />
        <div className="evidence-layout">
          <div className="evidence-studio" data-reveal>
            <div className="evidence-studio__bar">
              <div className="window-dots"><i /><i /><i /></div>
              <span>iteration_002 · review workspace</span>
              <b><i /> accepted</b>
            </div>
            <div className="evidence-studio__tabs" role="tablist">
              {tabs.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={tab === item}
                  className={tab === item ? 'is-active' : ''}
                  onClick={() => setTab(item)}
                >
                  {item === 'viewport' ? 'Viewport' : item === 'physics' ? 'Physics evidence' : 'Lifecycle'}
                </button>
              ))}
            </div>
            <div className="evidence-studio__canvas">
              {tab === 'viewport' && (
                <div className="evidence-viewport panel-enter">
                  <video
                    src={asset('media/demo-dining-room.mp4')}
                    poster={asset('media/poster-dining-room.jpg')}
                    muted
                    loop
                    autoPlay
                    playsInline
                  />
                  <span className="evidence-viewport__camera">sensor_cam_table</span>
                  <span className="evidence-viewport__time">t = 8.00 s</span>
                </div>
              )}
              {tab === 'physics' && (
                <div className="physics-panel panel-enter">
                  <div className="physics-panel__header">
                    <div><span className="status-dot" /><b>Trajectory diagnostics</b></div>
                    <span>simulation_data.csv</span>
                  </div>
                  <div className="physics-chart" aria-label="Stable object height traces">
                    <div className="physics-chart__grid" />
                    <svg viewBox="0 0 640 220" preserveAspectRatio="none" aria-hidden="true">
                      <path d="M0 68 C90 67, 120 69, 195 68 S330 69, 410 68 S540 67, 640 68" className="trace trace--one" />
                      <path d="M0 118 C90 117, 160 119, 240 118 S360 119, 470 118 S570 117, 640 118" className="trace trace--two" />
                      <path d="M0 156 C80 157, 155 155, 240 156 S370 155, 455 156 S560 157, 640 156" className="trace trace--three" />
                      <path d="M0 181 C110 180, 190 182, 280 181 S430 182, 510 181 S590 180, 640 181" className="trace trace--four" />
                    </svg>
                    <span className="chart-axis chart-axis--y">z position [m]</span>
                    <span className="chart-axis chart-axis--x">simulation time [s]</span>
                  </div>
                  <div className="physics-summary">
                    <div><small>max drift</small><b>1.7 × 10<sup>−4</sup> m</b></div>
                    <div><small>contacts</small><b>stable</b></div>
                    <div><small>NaN / Inf</small><b>none</b></div>
                    <span><Icon name="check" size={14} /> physics gate passed</span>
                  </div>
                </div>
              )}
              {tab === 'lifecycle' && (
                <div className="lifecycle-panel panel-enter">
                  {[
                    ['Plan', 'Scene contract and objectives committed', '00:00'],
                    ['Code', 'Standalone PyChrono program generated', '00:18'],
                    ['Physics-only', 'Bounded execution and trajectory checks', '00:31'],
                    ['First frame', 'Camera and scene layout approved', '00:46'],
                    ['Full render', 'Two sensor-camera videos assembled', '01:14'],
                    ['Review', 'Visual and physical objectives accepted', '01:27'],
                  ].map(([title, copy, time], index) => (
                    <div className="lifecycle-panel__row" key={title}>
                      <span><Icon name="check" size={12} /></span>
                      <div><b>{title}</b><small>{copy}</small></div>
                      <time>{time}</time>
                      {index < 5 && <i />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="evidence-cards">
            {evidenceCards.map((card) => (
              <article key={card.number} data-reveal>
                <span>{card.number}</span>
                <div><h3>{card.title}</h3><p>{card.copy}</p><code>{card.label}</code></div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function BenchmarkBars({ metric }) {
  const metricLabel = metric === 'sa' ? 'Semantic adherence' : metric === 'pc' ? 'Physical correctness' : 'Full correctness'
  return (
    <div className="category-chart" aria-label={`${metricLabel} by physics category`}>
      <div className="category-chart__scale"><span>0</span><span>25</span><span>50</span><span>75</span><span>100%</span></div>
      {categoryResults.map((row, index) => (
        <div className="category-row" key={row.name} style={{ '--delay': `${index * 60}ms` }}>
          <span title={row.name}>{row.short}</span>
          <div className="category-row__track">
            <i style={{ '--value': `${row[metric]}%` }} />
            <b style={{ left: `${row[metric]}%` }}>{row[metric]}%</b>
          </div>
        </div>
      ))}
    </div>
  )
}

function Results({ onOpenFigure }) {
  const [metric, setMetric] = useState('joint')
  return (
    <section className="results section" id="results">
      <div className="shell">
        <SectionIntro
          eyebrow="PhyWorldBench · 80 demos · 8 categories"
          title={<>Physical correctness,<br /><em>not visual plausibility alone</em></>}
          copy="Each rollout is judged over the full video with scenario-specific semantic and physical criteria. Benchmark verdicts never enter the repair loop."
        />
        <div className="result-stats" data-reveal>
          <div className="result-stat result-stat--primary">
            <small>Full correctness</small>
            <strong><AnimatedMetric value={82.5} /></strong>
            <span>semantic adherence ∧ physical correctness</span>
          </div>
          <div className="result-stat">
            <small>Semantic adherence</small>
            <strong><AnimatedMetric value={93.8} /></strong>
            <span>required objects and event both present</span>
          </div>
          <div className="result-stat">
            <small>Physical correctness</small>
            <strong><AnimatedMetric value={88.8} /></strong>
            <span>all scenario-specific key standards hold</span>
          </div>
          <div className="result-stat">
            <small>Key standards</small>
            <strong>135<em>/146</em></strong>
            <span>individual physical criteria satisfied</span>
          </div>
        </div>
        <div className="results-grid">
          <div className="results-panel results-panel--categories" data-reveal>
            <div className="results-panel__heading">
              <div><span>Category analysis</span><h3>Correctness across physics</h3></div>
              <div className="metric-switch" role="group" aria-label="Select benchmark metric">
                {[
                  ['joint', 'Full'],
                  ['sa', 'Semantic'],
                  ['pc', 'Physical'],
                ].map(([id, label]) => (
                  <button key={id} type="button" className={metric === id ? 'is-active' : ''} onClick={() => setMetric(id)}>{label}</button>
                ))}
              </div>
            </div>
            <BenchmarkBars metric={metric} />
          </div>
          <div className="results-panel results-panel--baseline" data-reveal>
            <div className="results-panel__heading">
              <div><span>Matched comparison</span><h3>Against video generation</h3></div>
              <small>Full correctness (%)</small>
            </div>
            <div className="baseline-chart">
              {baselines.map((item) => (
                <div className={`baseline-row ${item.ours ? 'baseline-row--ours' : ''} ${item.mean ? 'baseline-row--mean' : ''}`} key={item.name}>
                  <span>{item.name}{item.ours && <b>ours</b>}</span>
                  <div><i style={{ '--value': `${item.value}%` }} /><em>{item.value.toFixed(1)}</em></div>
                </div>
              ))}
            </div>
            <div className="baseline-callout"><span>+30.0</span><p>percentage-point margin over the strongest baseline.</p></div>
          </div>
        </div>
        <FigureButton
          src="media/pwb-grid.png"
          alt="Eight accepted ChronoAgentic simulations across PhyWorldBench physics categories"
          caption="Accepted simulations across all eight evaluated physics categories; time advances left to right."
          onOpen={onOpenFigure}
          className="paper-figure--gallery"
        />
      </div>
    </section>
  )
}

function DemoCard({ demo, index }) {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  const play = () => {
    const promise = videoRef.current?.play()
    if (promise) promise.then(() => setPlaying(true)).catch(() => {})
  }

  const pause = () => {
    videoRef.current?.pause()
    setPlaying(false)
  }

  const toggle = () => playing ? pause() : play()

  return (
    <article
      className="demo-card"
      style={{ '--demo-accent': demo.accent, '--delay': `${index * 70}ms` }}
      data-reveal
      onMouseEnter={play}
      onMouseLeave={pause}
    >
      <div className="demo-card__media">
        <video
          ref={videoRef}
          src={asset(demo.video)}
          poster={asset(demo.poster)}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={`${demo.title} simulation video`}
        />
        <button type="button" onClick={toggle} aria-label={playing ? `Pause ${demo.title}` : `Play ${demo.title}`}>
          <Icon name={playing ? 'pause' : 'play'} size={17} />
        </button>
        <div className="demo-card__hud"><span>SIM {String(index + 1).padStart(2, '0')}</span><span className={playing ? 'is-live' : ''}>{playing ? 'running' : 'hover to run'}</span></div>
      </div>
      <div className="demo-card__body">
        <div><span>{demo.category}</span><h3>{demo.title}</h3></div>
        <small>{demo.tag}</small>
      </div>
    </article>
  )
}

function Gallery() {
  const [filter, setFilter] = useState('All')
  const filters = useMemo(() => ['All', ...new Set(demos.map((demo) => demo.category))], [])
  const visible = filter === 'All' ? demos : demos.filter((demo) => demo.category === filter)

  return (
    <section className="gallery section" id="gallery">
      <div className="shell">
        <div className="gallery__heading">
          <SectionIntro
            eyebrow="Generated worlds · rendered by the simulator"
            title={<>One framework.<br /><em>Many kinds of physics.</em></>}
            copy="These are recorded executions of generated PyChrono programs. Hover a world to run it."
          />
          <div className="gallery-filters" data-reveal>
            {filters.map((item) => (
              <button key={item} type="button" className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>{item}</button>
            ))}
          </div>
        </div>
        <div className="demo-grid">
          {visible.map((demo, index) => <DemoCard key={demo.title} demo={demo} index={index} />)}
        </div>
        <div className="gallery-note" data-reveal>
          <span><Icon name="play" size={14} /> 80 evaluated simulations</span>
          <p>The repository includes the complete benchmark video collection, prompts, accepted programs, and review artifacts.</p>
          <a href="https://github.com/Hongyu0329/chrono-agentic" target="_blank" rel="noreferrer">Browse the artifact repository <Icon name="external" size={14} /></a>
        </div>
      </div>
    </section>
  )
}

function AssetPipeline({ onOpenFigure }) {
  return (
    <section className="assets-section section">
      <div className="shell assets-section__grid">
        <div className="assets-section__copy">
          <SectionIntro
            eyebrow="World construction at asset scale"
            title={<>Missing object?<br /><em>Mint it once.</em></>}
            copy="The planner resolves catalog assets, simulator-native platforms, primitives, and generated geometry through one explicit scene contract."
          />
          <div className="asset-flow" data-reveal>
            {[
              ['01', 'Reference', 'Generate a clean object image'],
              ['02', 'Reconstruct', 'Segment and recover a textured 3D mesh'],
              ['03', 'Normalize', 'Orient, scale, and decompose collision'],
              ['04', 'Register', 'Add reusable metadata to the catalog'],
            ].map(([num, title, copy], index) => (
              <div className="asset-flow__step" key={num}>
                <span>{num}</span><div><b>{title}</b><small>{copy}</small></div>{index < 3 && <Icon name="arrow" size={15} />}
              </div>
            ))}
          </div>
          <div className="capability-grid" data-reveal>
            {capabilities.map(([name, copy]) => (
              <div key={name}><i /><b>{name}</b><span>{copy}</span></div>
            ))}
          </div>
        </div>
        <FigureButton
          src="media/asset-pipeline.png"
          alt="ChronoAgentic generated asset pipeline and a constructed bathroom simulation"
          caption="Planning and code generation meet through the reusable 3D asset pipeline."
          onOpen={onOpenFigure}
          className="paper-figure--asset"
        />
      </div>
    </section>
  )
}

function SystemHighlights({ onOpenFigure }) {
  const figures = [
    {
      src: 'media/ros-city.png',
      alt: 'Interactive ROS city driving demonstration',
      title: 'Interactive ROS city',
      copy: 'A driveable world with 130 generated assets, live control, multiple cameras, and collision-aware streets.',
      label: 'Beyond the benchmark',
    },
    {
      src: 'media/dining-repair.png',
      alt: 'Dining room iterative repair sequence',
      title: 'Evidence-driven repair',
      copy: 'Visual and trajectory diagnostics reveal wrong orientation and unstable placement, then ground a targeted patch.',
      label: 'Closed-loop refinement',
    },
    {
      src: 'media/comparison.png',
      alt: 'Comparison of video-based and code-based world simulation',
      title: 'An explicit world state',
      copy: 'The code-based paradigm keeps geometry, dynamics, simulation output, and review surfaces inspectable.',
      label: 'Core premise',
    },
  ]

  return (
    <section className="highlights section">
      <div className="shell">
        <SectionIntro
          eyebrow="The system in practice"
          title={<>Construct. Inspect.<br /><em>Interact.</em></>}
        />
        <div className="highlight-grid">
          {figures.map((figure, index) => (
            <article className={`highlight-card highlight-card--${index + 1}`} key={figure.title} data-reveal>
              <button type="button" onClick={() => onOpenFigure({ src: figure.src, alt: figure.alt, caption: figure.title })}>
                <img src={asset(figure.src)} alt={figure.alt} loading="lazy" />
                <span><Icon name="expand" size={16} /></span>
              </button>
              <div><small>{figure.label}</small><h3>{figure.title}</h3><p>{figure.copy}</p></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Artifacts({ onOpenFigure }) {
  const [copied, setCopied] = useState(false)

  const copyCitation = async () => {
    try {
      await navigator.clipboard.writeText(citation)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="artifacts section section--paper" id="artifacts">
      <div className="shell">
        <SectionIntro
          eyebrow="Paper & reproducibility"
          title={<>Read the work.<br /><em>Replay the worlds.</em></>}
          copy="The paper, source repository, benchmark videos, plans, simulation programs, and run evidence are organized as separate, inspectable artifacts."
          align="center"
        />
        <div className="artifact-actions" data-reveal>
          <IconLink href={asset('chronoagentic-paper.pdf')} icon="paper" variant="primary">Download PDF</IconLink>
          <IconLink href="https://github.com/Hongyu0329/chrono-agentic" icon="github" variant="secondary">Source & artifacts</IconLink>
          <IconLink href="https://projectchrono.org/" icon="external" variant="quiet">Project Chrono</IconLink>
        </div>
        <div className="paper-preview-grid">
          <div className="paper-preview" data-reveal>
            <div className="paper-sheet paper-sheet--back" />
            <div className="paper-sheet">
              <div className="paper-sheet__journal">PREPRINT · 2026</div>
              <h3>ChronoAgentic: A Code-based Multi-Agent World Simulator for Physically Grounded Simulation Construction</h3>
              <p>{authors.map((author) => author.name).join(' · ')}</p>
              <div className="paper-sheet__columns"><i /><i /></div>
              <img src={asset('media/pipeline.png')} alt="Pipeline preview inside paper" loading="lazy" />
              <div className="paper-sheet__columns paper-sheet__columns--short"><i /><i /></div>
            </div>
          </div>
          <div className="citation-card" data-reveal>
            <div className="citation-card__header"><span><Icon name="code" size={15} /> BibTeX</span><button type="button" onClick={copyCitation}><Icon name={copied ? 'check' : 'copy'} size={15} /> {copied ? 'Copied' : 'Copy'}</button></div>
            <pre><code>{citation}</code></pre>
            <div className="citation-card__note"><Icon name="shield" size={17} /><p><b>Artifact-first reporting.</b> Clean source remains separate from review-only video, traces, diagnostics, and verdicts.</p></div>
          </div>
        </div>
        <FigureButton
          src="media/iteration-loop.png"
          alt="Review agent repair loop with simulation data and camera evidence"
          caption="The review loop combines numerical trajectories and rendered observations before acceptance."
          onOpen={onOpenFigure}
          className="paper-figure--iteration"
        />
      </div>
    </section>
  )
}

function FigureModal({ figure, onClose }) {
  useEffect(() => {
    if (!figure) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.body.classList.add('modal-open')
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [figure, onClose])

  if (!figure) return null
  return (
    <div className="figure-modal" role="dialog" aria-modal="true" aria-label={figure.caption} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="figure-modal__content">
        <button type="button" onClick={onClose} aria-label="Close expanded figure"><Icon name="close" /></button>
        <img src={asset(figure.src)} alt={figure.alt} />
        <p>{figure.caption}</p>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer__top">
        <div><Wordmark compact /><p>Executable worlds.<br />Inspectable evidence.</p></div>
        <div className="footer__links">
          <div><span>Explore</span><a href="#method">Method</a><a href="#results">Results</a><a href="#gallery">Gallery</a></div>
          <div><span>Resources</span><a href={asset('chronoagentic-paper.pdf')}>Paper</a><a href="https://github.com/Hongyu0329/chrono-agentic" target="_blank" rel="noreferrer">GitHub</a><a href="https://projectchrono.org/" target="_blank" rel="noreferrer">Project Chrono</a></div>
          <div><span>Lab</span><a href="https://sbel.wisc.edu/" target="_blank" rel="noreferrer">UW–Madison SBEL</a><a href="https://www.wisc.edu/" target="_blank" rel="noreferrer">University of Wisconsin</a></div>
        </div>
      </div>
      <div className="shell footer__bottom"><span>ChronoAgentic · 2026</span><span>Research website for a preprint</span><a href="#top">Back to top ↑</a></div>
      <div className="footer__word" aria-hidden="true">EXECUTABLE WORLDS</div>
    </footer>
  )
}

export default function App() {
  const [activeSection, setActiveSection] = useState('overview')
  const [figure, setFigure] = useState(null)
  usePageEffects(setActiveSection)

  return (
    <>
      <div className="pointer-glow" aria-hidden="true" />
      <Navigation activeSection={activeSection} />
      <main id="top">
        <Hero />
        <Premise />
        <Method onOpenFigure={setFigure} />
        <Evidence />
        <Results onOpenFigure={setFigure} />
        <Gallery />
        <AssetPipeline onOpenFigure={setFigure} />
        <SystemHighlights onOpenFigure={setFigure} />
        <Artifacts onOpenFigure={setFigure} />
      </main>
      <Footer />
      <FigureModal figure={figure} onClose={() => setFigure(null)} />
    </>
  )
}
