import { useEffect, useRef, useState } from 'react'
import Icon from './Icons.jsx'
import { authors, citation, demos } from './data.js'

const asset = (path) => `${import.meta.env.BASE_URL}${path}`

const navItems = [
  ['platform', 'Platform'],
  ['use-cases', 'Use cases'],
  ['studio', 'Studio'],
  ['worlds', 'Worlds'],
  ['technology', 'Technology'],
]

const promptExamples = [
  'Build a driveable city with dense streets, live ROS control, and three sensor cameras.',
  'Drop a stone into a still pond and verify the fluid–solid interaction.',
  'Create a wind-driven mechanism and measure its angular response over time.',
]

const buildStages = [
  {
    id: '01',
    label: 'Specify',
    title: 'Say what the world should do.',
    copy: 'Start from language or an image. The planner turns intent into a structured contract for geometry, bodies, joints, materials, cameras, and physical objectives.',
    icon: 'spark',
    artifact: 'world.plan',
  },
  {
    id: '02',
    label: 'Build',
    title: 'Compile intent into simulation code.',
    copy: 'Simulator skills, retrieved APIs, native platforms, and reusable assets are composed into one standalone, inspectable PyChrono program.',
    icon: 'code',
    artifact: 'simulation.py',
  },
  {
    id: '03',
    label: 'Simulate',
    title: 'Run the world through real physics.',
    copy: 'Cheap static and physics-only checks run first. Only healthy worlds advance to sensor cameras, full rendering, and interactive control.',
    icon: 'play',
    artifact: 'runtime',
  },
  {
    id: '04',
    label: 'Verify',
    title: 'Know why a world can be trusted.',
    copy: 'Rendered observations, logs, and trajectories are tested against the original objectives. A grounded repair loop patches failures and runs again.',
    icon: 'shield',
    artifact: 'evidence',
  },
]

const useCases = [
  {
    eyebrow: 'Robotics & autonomy',
    title: 'Give autonomous systems a world to learn in.',
    copy: 'Build sensor-rich, controllable environments for robot and vehicle development—before the first real-world run.',
    tags: ['ROS control', 'camera + lidar', 'terrain'],
    media: 'media/hero-city.mp4',
    poster: 'media/poster-hero-city.jpg',
    type: 'video',
    className: 'use-card--hero',
  },
  {
    eyebrow: 'Industrial digital twins',
    title: 'Compose asset-rich operating environments.',
    copy: 'Turn scene intent into reusable, simulation-ready objects with explicit scale, collision, material, and placement.',
    tags: ['3D assets', 'collision', 'scene layout'],
    media: 'media/ros-city.png',
    type: 'image',
    className: 'use-card--tall',
  },
  {
    eyebrow: 'Multiphysics engineering',
    title: 'Go beyond rigid bodies.',
    copy: 'Construct fluid–solid interaction, deformation, elasticity, contacts, mechanisms, and energy-driven systems.',
    tags: ['FSI', 'FEA', 'multibody'],
    media: 'media/demo-stone-pond.mp4',
    poster: 'media/poster-stone-pond.jpg',
    type: 'video',
    className: 'use-card--wide',
  },
  {
    eyebrow: 'Virtual engineering',
    title: 'Test behavior before committing hardware.',
    copy: 'Inspect source, solver state, trajectories, and visual output from the same executable world.',
    tags: ['replayable', 'inspectable', 'measurable'],
    media: 'media/demo-pendulum.mp4',
    poster: 'media/poster-pendulum.jpg',
    type: 'video',
    className: 'use-card--small',
  },
  {
    eyebrow: 'Synthetic sensors',
    title: 'Observe the world from any camera.',
    copy: 'Generate time-aligned visual evidence from simulator-native camera, light, shadow, and sensor systems.',
    tags: ['OptiX', 'sensor output', 'telemetry'],
    media: 'media/demo-light-vase.mp4',
    poster: 'media/poster-light-vase.jpg',
    type: 'video',
    className: 'use-card--small',
  },
]

const capabilities = [
  ['Multibody', 'Bodies, joints, contacts, mechanisms'],
  ['Robotics', 'Native platforms, control, ROS worlds'],
  ['Vehicles', 'Terrain, tires, sensors, autonomy'],
  ['FEA', 'Beams, shells, cables, deformation'],
  ['Fluids', 'SPH, particles, fluid–solid coupling'],
  ['Sensors', 'Cameras, lidar, light, telemetry'],
]

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
      { rootMargin: '-28% 0px -62% 0px', threshold: [0, 0.2, 0.5] },
    )

    navItems.forEach(([id]) => {
      const section = document.getElementById(id)
      if (section) sectionObserver.observe(section)
    })

    const updateScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? window.scrollY / max : 0
      document.documentElement.style.setProperty('--scroll-progress', String(progress))
      document.documentElement.classList.toggle('has-scrolled', window.scrollY > 36)
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

function AnimatedMetric({ value, suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)

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
        observer.disconnect()
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
    }, { threshold: 0.5 })
    observer.observe(node)
    return () => {
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [value])

  return <span ref={ref}>{display.toFixed(decimals)}{suffix}</span>
}

function Wordmark({ inverse = false }) {
  return (
    <a className={`wordmark ${inverse ? 'wordmark--inverse' : ''}`} href="#top" aria-label="ChronoAgentic home">
      <span className="wordmark__symbol" aria-hidden="true"><i /><i /><i /></span>
      <span>Chrono<span>Agentic</span></span>
    </a>
  )
}

function ButtonLink({ href, children, icon = 'arrow', tone = 'dark', download = false }) {
  const external = href?.startsWith('http')
  return (
    <a
      className={`button button--${tone}`}
      href={href}
      download={download}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
    >
      <span>{children}</span>
      <span className="button__icon"><Icon name={icon} size={17} /></span>
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
      <nav className="nav shell" aria-label="Primary navigation">
        <Wordmark />
        <div className={`nav__panel ${open ? 'is-open' : ''}`}>
          <div className="nav__links">
            {navItems.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className={activeSection === id ? 'is-active' : ''}
                onClick={() => setOpen(false)}
              >
                {label}
              </a>
            ))}
          </div>
          <a className="nav__cta" href="https://github.com/Hongyu0329/chrono-agentic" target="_blank" rel="noreferrer">
            <Icon name="github" size={16} />
            <span>Build with it</span>
            <Icon name="external" size={13} />
          </a>
        </div>
        <button className="nav__menu" type="button" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(!open)}>
          <Icon name={open ? 'close' : 'menu'} size={22} />
        </button>
      </nav>
    </header>
  )
}

function SectionHeading({ eyebrow, title, copy, light = false, center = false }) {
  return (
    <div className={`section-heading ${light ? 'section-heading--light' : ''} ${center ? 'section-heading--center' : ''}`} data-reveal>
      <div className="eyebrow"><i />{eyebrow}</div>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  )
}

function Hero() {
  const [prompt, setPrompt] = useState(0)

  return (
    <section className="hero" id="top">
      <div className="hero__aurora" aria-hidden="true"><i /><i /><i /></div>
      <div className="shell hero__content">
        <div className="hero__badge" data-reveal>
          <span><i /> Executable world platform</span>
          <b>Built on Project Chrono</b>
        </div>
        <h1 data-reveal>
          <span>Build worlds</span>
          <span>that <em>behave.</em></span>
        </h1>
        <p className="hero__lead" data-reveal>
          Turn a sentence or image into a living physics environment—planned, constructed, simulated, and verified as executable PyChrono code.
        </p>
        <div className="hero__actions" data-reveal>
          <ButtonLink href="#platform" tone="red">Explore the platform</ButtonLink>
          <ButtonLink href="https://github.com/Hongyu0329/chrono-agentic" icon="github" tone="glass">View on GitHub</ButtonLink>
        </div>
      </div>

      <div className="shell hero-world" data-reveal>
        <div className="hero-world__media">
          <video
            src={asset('media/hero-city.mp4')}
            poster={asset('media/poster-hero-city.jpg')}
            muted
            loop
            autoPlay
            playsInline
            preload="auto"
            aria-label="A generated driveable city running in ChronoAgentic"
          />
          <div className="hero-world__shade" />
          <div className="hero-world__hud hero-world__hud--top">
            <span><i /> WORLD ONLINE</span>
            <span>ROS_CITY / CHASE_CAM</span>
            <span>PYCHRONO 10</span>
          </div>
          <div className="hero-world__telemetry">
            <small>LIVE STATE</small>
            <strong>07.42 <em>s</em></strong>
            <span><i /> PHYSICS STABLE</span>
          </div>
        </div>
        <div className="hero-composer">
          <div className="hero-composer__brand"><Icon name="spark" size={18} /><span>Describe a world</span></div>
          <p key={prompt}>{promptExamples[prompt]}</p>
          <div className="hero-composer__footer">
            <div className="prompt-dots" aria-label="Prompt examples">
              {promptExamples.map((item, index) => (
                <button key={item} type="button" aria-label={`Show example ${index + 1}`} className={prompt === index ? 'is-active' : ''} onClick={() => setPrompt(index)} />
              ))}
            </div>
            <button type="button" onClick={() => setPrompt((prompt + 1) % promptExamples.length)}>
              <span>Generate world</span><Icon name="arrow" size={17} />
            </button>
          </div>
        </div>
      </div>

      <div className="shell hero-proof" data-reveal>
        <div><b>Prompt</b><span>Natural language or image</span></div>
        <Icon name="arrow" size={16} />
        <div><b>Program</b><span>Inspectable PyChrono code</span></div>
        <Icon name="arrow" size={16} />
        <div><b>World</b><span>Physics + sensors + control</span></div>
        <Icon name="arrow" size={16} />
        <div><b>Evidence</b><span>Video + trajectories + verdict</span></div>
      </div>
    </section>
  )
}

function CapabilityRail() {
  const items = ['MULTIBODY', 'ROBOTICS', 'VEHICLES', 'FINITE ELEMENTS', 'FLUIDS + FSI', 'SENSORS', 'ROS WORLDS']
  return (
    <div className="capability-rail" aria-label="Supported simulation domains">
      <div className="capability-rail__track">
        {[...items, ...items].map((item, index) => <span key={`${item}-${index}`}><i />{item}</span>)}
      </div>
    </div>
  )
}

function PlatformIntro() {
  return (
    <section className="platform-intro section" id="platform">
      <div className="shell">
        <SectionHeading
          eyebrow="A world compiler for physical AI"
          title={<>A prompt should become<br />more than a picture.</>}
          copy="ChronoAgentic creates the state behind the scene: the bodies, constraints, material properties, controls, sensors, and solver choices that make a world actually run."
          center
        />
        <div className="platform-pillars">
          <article data-reveal>
            <span className="pillar-number">01</span>
            <div className="pillar-icon pillar-icon--red"><Icon name="paper" size={25} /></div>
            <h3>World specification</h3>
            <p>Language becomes a structured scene contract before construction begins.</p>
            <div className="mini-schema"><span>bodies</span><span>joints</span><span>objectives</span><span>cameras</span></div>
          </article>
          <article data-reveal>
            <span className="pillar-number">02</span>
            <div className="pillar-icon pillar-icon--blue"><Icon name="code" size={25} /></div>
            <h3>Physics-native build</h3>
            <p>Plans compile into explicit, editable programs running on Project Chrono.</p>
            <div className="mini-code"><i /><i /><i /><i /><b /></div>
          </article>
          <article data-reveal>
            <span className="pillar-number">03</span>
            <div className="pillar-icon pillar-icon--green"><Icon name="shield" size={25} /></div>
            <h3>Evidence engine</h3>
            <p>Every accepted world is backed by visual and numerical runtime evidence.</p>
            <div className="mini-evidence"><span><Icon name="check" size={11} /> visual</span><span><Icon name="check" size={11} /> physical</span><span><Icon name="check" size={11} /> replayable</span></div>
          </article>
        </div>
      </div>
    </section>
  )
}

function BuildVisual({ active }) {
  if (active === 0) {
    return (
      <div className="build-canvas build-canvas--specify stage-enter">
        <div className="request-card">
          <small>WORLD REQUEST</small>
          <p>“Build a driveable city with dense streets, varied buildings, and live ROS control.”</p>
          <span><Icon name="image" size={14} /> optional reference image</span>
        </div>
        <div className="flow-beam"><i /><i /><i /></div>
        <div className="contract-card">
          <div><Icon name="paper" size={16} /><b>world.plan</b><span>committed</span></div>
          {['Scene · dense urban grid', 'System · wheeled vehicle', 'Sensors · 3 cameras', 'Gate · route remains clear'].map((item) => <p key={item}><Icon name="check" size={11} />{item}</p>)}
        </div>
      </div>
    )
  }

  if (active === 1) {
    return (
      <div className="build-canvas build-canvas--code stage-enter">
        <div className="code-window">
          <div className="code-window__top"><span><i /><i /><i /></span><b>simulation.py</b><small>generated</small></div>
          <pre><code><span className="code-pink">import</span> pychrono <span className="code-pink">as</span> chrono{`\n`}<span className="code-pink">from</span> world.assets <span className="code-pink">import</span> city{`\n\n`}system = chrono.<span className="code-blue">ChSystemNSC</span>(){`\n`}terrain = city.<span className="code-blue">build_road_network</span>(){`\n`}vehicle = <span className="code-blue">create_vehicle</span>(system){`\n`}sensors.<span className="code-blue">attach_camera_rig</span>(vehicle){`\n\n`}<span className="code-pink">while</span> system.GetChTime() &lt; end_time:{`\n`}    controller.<span className="code-blue">synchronize</span>(system){`\n`}    system.<span className="code-blue">DoStepDynamics</span>(dt)</code></pre>
          <div className="code-window__status"><span><i /> syntax valid</span><span>842 lines</span></div>
        </div>
        <div className="context-stack">
          <div><Icon name="layers" size={18} /><span><b>Skill library</b><small>simulator patterns</small></span></div>
          <div><Icon name="database" size={18} /><span><b>Asset catalog</b><small>simulation-ready objects</small></span></div>
          <div><Icon name="orbit" size={18} /><span><b>Chrono retrieval</b><small>APIs + examples</small></span></div>
        </div>
      </div>
    )
  }

  if (active === 2) {
    return (
      <div className="build-canvas build-canvas--run stage-enter">
        <video src={asset('media/hero-city.mp4')} poster={asset('media/poster-hero-city.jpg')} muted loop autoPlay playsInline />
        <div className="run-toolbar"><span><i /> RUNNING</span><b>ros_city_drive</b><span>chase_cam</span></div>
        <div className="run-stages">
          {['Static', 'Physics', 'Frame', 'Render'].map((item, index) => <span key={item}><i><Icon name="check" size={10} /></i><b>{item}</b><small>{index === 3 ? 'live' : 'passed'}</small></span>)}
        </div>
        <div className="run-time">t <b>07.42</b> s</div>
      </div>
    )
  }

  return (
    <div className="build-canvas build-canvas--verify stage-enter">
      <div className="verify-score"><div><span>4 / 4</span></div><h3>World accepted</h3><p>Every declared objective has matching runtime evidence.</p></div>
      <div className="verify-list">
        {[
          ['Scene', 'Required objects present', 'video'],
          ['Motion', 'Vehicle follows control', 'trajectory'],
          ['Physics', 'No instability detected', 'diagnostic'],
          ['Review', 'Objectives satisfied', 'verdict'],
        ].map(([name, copy, type]) => <div key={name}><i><Icon name="check" size={12} /></i><span><b>{name}</b><small>{copy}</small></span><code>{type}</code></div>)}
      </div>
      <div className="verify-seal"><Icon name="shield" size={16} /> EVIDENCE BUNDLE STAMPED</div>
    </div>
  )
}

function BuildFlow() {
  const [active, setActive] = useState(0)
  const stage = buildStages[active]

  return (
    <section className="build-flow section">
      <div className="shell">
        <div className="build-flow__heading">
          <SectionHeading eyebrow="One continuous workflow" title={<>From idea to<br />operating world.</>} />
          <p data-reveal>A closed construction loop moves from human intent to working simulation—and keeps every artifact visible along the way.</p>
        </div>
        <div className="build-system" data-reveal>
          <div className="build-system__tabs" role="tablist" aria-label="World construction stages">
            {buildStages.map((item, index) => (
              <button key={item.id} type="button" role="tab" aria-selected={active === index} className={active === index ? 'is-active' : ''} onClick={() => setActive(index)}>
                <span>{item.id}</span><b>{item.label}</b><Icon name={item.icon} size={17} />
              </button>
            ))}
          </div>
          <div className="build-system__body">
            <div className="build-system__copy" key={stage.id}>
              <div><Icon name={stage.icon} size={19} /><code>{stage.artifact}</code></div>
              <h3>{stage.title}</h3>
              <p>{stage.copy}</p>
              <div className="stage-progress"><span style={{ width: `${(active + 1) * 25}%` }} /></div>
              <small>{stage.id} / 04</small>
            </div>
            <BuildVisual active={active} />
          </div>
        </div>
      </div>
    </section>
  )
}

function UseCaseMedia({ item }) {
  if (item.type === 'video') {
    return <video src={asset(item.media)} poster={item.poster ? asset(item.poster) : undefined} muted loop autoPlay playsInline preload="metadata" />
  }
  return <img src={asset(item.media)} alt="" loading="lazy" />
}

function UseCases() {
  return (
    <section className="use-cases section" id="use-cases">
      <div className="shell">
        <SectionHeading
          eyebrow="Built for systems that touch reality"
          title={<>A proving ground for<br />physical intelligence.</>}
          copy="Create diverse, measurable environments for autonomy, engineering, and interactive simulation from one agentic workflow."
        />
        <div className="use-grid">
          {useCases.map((item, index) => (
            <article className={`use-card ${item.className}`} key={item.title} data-reveal style={{ '--card-index': index }}>
              <div className="use-card__media"><UseCaseMedia item={item} /><div /></div>
              <div className="use-card__copy">
                <span>{item.eyebrow}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
                <div>{item.tags.map((tag) => <small key={tag}>{tag}</small>)}</div>
              </div>
              <div className="use-card__index">0{index + 1}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function StudioPanel({ tab }) {
  if (tab === 'physics') {
    return (
      <div className="studio-physics panel-enter">
        <div className="studio-physics__header"><span><i /> LIVE TELEMETRY</span><b>vehicle_state.csv</b><small>1,201 samples</small></div>
        <div className="studio-chart">
          <div className="studio-chart__grid" />
          <svg viewBox="0 0 800 320" preserveAspectRatio="none" aria-hidden="true">
            <path className="chart-line chart-line--red" d="M0 248 C50 245 80 238 120 214 S190 176 250 169 S350 173 410 139 S490 83 555 104 S650 141 800 70" />
            <path className="chart-line chart-line--blue" d="M0 205 C75 205 120 195 170 202 S260 225 320 205 S420 159 490 171 S590 220 655 181 S735 141 800 150" />
            <path className="chart-line chart-line--green" d="M0 277 C90 278 140 276 210 273 S320 265 385 270 S500 278 575 270 S680 260 800 265" />
          </svg>
          <span className="chart-label chart-label--one">velocity</span><span className="chart-label chart-label--two">steering</span><span className="chart-label chart-label--three">stability</span>
        </div>
        <div className="studio-readouts"><div><small>speed</small><b>8.42 <em>m/s</em></b></div><div><small>yaw rate</small><b>0.13 <em>rad/s</em></b></div><div><small>contacts</small><b>stable</b></div><span><Icon name="check" size={14} /> physics gate passed</span></div>
      </div>
    )
  }

  if (tab === 'lifecycle') {
    return (
      <div className="studio-lifecycle panel-enter">
        {[
          ['Plan committed', 'Scene, objectives, cameras, and interfaces', '00:00'],
          ['Program constructed', 'Standalone PyChrono source generated', '00:18'],
          ['Physics-only passed', 'Stable bounded execution', '00:31'],
          ['First frame approved', 'Composition and object layout confirmed', '00:46'],
          ['Full world rendered', 'Three sensor cameras captured', '01:14'],
          ['Evidence accepted', 'Visual and physical objectives satisfied', '01:27'],
        ].map(([title, copy, time], index) => (
          <div className="studio-lifecycle__row" key={title}>
            <span><Icon name="check" size={12} /></span><div><b>{title}</b><small>{copy}</small></div><time>{time}</time>{index < 5 && <i />}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="studio-viewport panel-enter">
      <video src={asset('media/hero-city.mp4')} poster={asset('media/poster-hero-city.jpg')} muted loop autoPlay playsInline />
      <div className="studio-viewport__top"><span><i /> LIVE SIMULATION</span><b>ros_city_drive / iteration_010</b><span>chase_cam ▾</span></div>
      <div className="studio-viewport__reticle"><i /><i /></div>
      <div className="studio-viewport__bottom"><span>CAM 01 · RGB</span><span>t 07.42 s</span><span>60 FPS</span></div>
    </div>
  )
}

function Studio() {
  const [tab, setTab] = useState('viewport')
  return (
    <section className="studio-section section" id="studio">
      <div className="studio-section__glow" aria-hidden="true" />
      <div className="shell">
        <div className="studio-section__heading">
          <SectionHeading
            eyebrow="Chrono Studio"
            title={<>See the whole world.<br />Not just the final frame.</>}
            copy="A unified workspace for intent, source, runtime, sensors, telemetry, and review. Follow a world from its first plan to the accepted evidence bundle."
            light
          />
          <ButtonLink href="https://github.com/Hongyu0329/chrono-agentic" tone="light" icon="github">Explore the source</ButtonLink>
        </div>
        <div className="studio-app" data-reveal>
          <div className="studio-app__chrome">
            <div className="window-dots"><i /><i /><i /></div>
            <span><i /> Chrono Studio · live workspace</span>
            <div><small>PyChrono 10.0</small><Icon name="layers" size={14} /></div>
          </div>
          <div className="studio-app__body">
            <aside className="studio-chat">
              <div className="studio-label">WORLD BRIEF</div>
              <div className="studio-message studio-message--user"><span>Y</span><p>Build a driveable city with dense streets, varied buildings, and live ROS control.</p></div>
              <div className="studio-message studio-message--agent"><span><Icon name="spark" size={13} /></span><div><b>ChronoAgentic</b><p>I’ll commit the scene, vehicle, route-clearance, sensor, and ROS interfaces first.</p></div></div>
              <div className="studio-artifact"><div><Icon name="paper" size={14} /><b>world.plan</b><span>committed</span></div><small>130 assets · 1 vehicle · 3 cameras</small></div>
              <div className="studio-agent-state"><i /><i /><i /><span>world is running</span></div>
            </aside>
            <div className="studio-main">
              <div className="studio-tabs" role="tablist" aria-label="Studio views">
                {[["viewport", "World"], ["physics", "Physics"], ["lifecycle", "Lifecycle"]].map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'is-active' : ''} onClick={() => setTab(id)}>{label}</button>)}
                <span>run_010 <i /> accepted</span>
              </div>
              <StudioPanel tab={tab} />
            </div>
            <aside className="studio-inspector">
              <div className="studio-label">RUN HEALTH</div>
              <div className="health-score"><div><span>4/4</span></div><p><b>All gates passed</b><small>latest iteration</small></p></div>
              {[
                ['Scene', 'complete'], ['Physics', 'stable'], ['Sensors', 'captured'], ['Review', 'accepted'],
              ].map(([name, value]) => <div className="health-row" key={name}><i><Icon name="check" size={10} /></i><b>{name}</b><span>{value}</span></div>)}
              <div className="health-bundle"><Icon name="shield" size={15} /><span><b>Evidence bundle</b><small>source · video · traces</small></span></div>
            </aside>
          </div>
          <div className="studio-app__status"><span><i /> Agent loop closed</span><span>All artifacts synchronized</span></div>
        </div>
      </div>
    </section>
  )
}

function DemoCard({ demo, index }) {
  const ref = useRef(null)
  const [playing, setPlaying] = useState(false)
  const play = () => ref.current?.play().then(() => setPlaying(true)).catch(() => {})
  const pause = () => { ref.current?.pause(); setPlaying(false) }

  return (
    <article className={`world-card world-card--${index + 1}`} data-reveal onMouseEnter={play} onMouseLeave={pause}>
      <div className="world-card__media">
        <video ref={ref} src={asset(demo.video)} poster={asset(demo.poster)} muted loop playsInline preload="metadata" aria-label={`${demo.title} simulation`} />
        <div className="world-card__shade" />
        <button type="button" onClick={() => (playing ? pause() : play())} aria-label={`${playing ? 'Pause' : 'Play'} ${demo.title}`}><Icon name={playing ? 'pause' : 'play'} size={17} /></button>
        <div className="world-card__state"><i className={playing ? 'is-live' : ''} />{playing ? 'WORLD RUNNING' : 'RUN WORLD'}</div>
      </div>
      <div className="world-card__copy"><span>0{index + 1} · {demo.category}</span><h3>{demo.title}</h3><small>{demo.tag}</small></div>
    </article>
  )
}

function Worlds() {
  return (
    <section className="worlds section" id="worlds">
      <div className="shell">
        <div className="worlds__heading">
          <SectionHeading eyebrow="Generated and executed" title={<>One platform.<br />Many laws of motion.</>} />
          <div data-reveal><p>Every scene below is a recorded run of generated PyChrono code—not a video model imagining the next frame.</p><span><i /> Hover to run a world</span></div>
        </div>
        <div className="world-grid">{demos.map((demo, index) => <DemoCard demo={demo} index={index} key={demo.title} />)}</div>
        <div className="worlds__more" data-reveal><span>80 evaluated worlds across eight physical categories</span><a href="https://github.com/Hongyu0329/chrono-agentic" target="_blank" rel="noreferrer">Browse all artifacts <Icon name="external" size={14} /></a></div>
      </div>
    </section>
  )
}

function Proof() {
  return (
    <section className="proof section">
      <div className="shell">
        <SectionHeading
          eyebrow="Measured, not merely watched"
          title={<>Built to be checked.<br />Designed to improve.</>}
          copy="A world is accepted only when its meaning and its motion both satisfy the declared objectives. The benchmark stays outside the repair loop."
          center
        />
        <div className="proof-stats" data-reveal>
          <div className="proof-stat proof-stat--primary"><small>Full correctness</small><strong><AnimatedMetric value={82.5} suffix="%" decimals={1} /></strong><p>semantic adherence and physical correctness together</p></div>
          <div className="proof-stat"><small>Worlds evaluated</small><strong><AnimatedMetric value={80} /></strong><p>across eight distinct physics categories</p></div>
          <div className="proof-stat"><small>Physical criteria passed</small><strong><AnimatedMetric value={135} /><em>/146</em></strong><p>scenario-specific standards satisfied</p></div>
          <div className="proof-stat"><small>Strongest baseline margin</small><strong>+<AnimatedMetric value={30} decimals={1} /></strong><p>percentage points in full correctness</p></div>
        </div>
        <div className="proof-bar" data-reveal>
          <div><span>ChronoAgentic</span><i><b style={{ width: '82.5%' }} /></i><strong>82.5</strong></div>
          <div><span>Strongest video baseline</span><i><b style={{ width: '52.5%' }} /></i><strong>52.5</strong></div>
          <p><Icon name="shield" size={15} /> Full correctness on the matched 80-prompt PhyWorldBench evaluation.</p>
        </div>
      </div>
    </section>
  )
}

function Technology({ onOpenFigure }) {
  const [copied, setCopied] = useState(false)
  const copyCitation = async () => {
    try {
      await navigator.clipboard.writeText(citation)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="technology section" id="technology">
      <div className="shell">
        <div className="technology__heading">
          <SectionHeading eyebrow="The engine underneath" title={<>Open artifacts.<br />Explicit architecture.</>} copy="The platform combines specialized agents, simulator knowledge, reusable assets, staged execution, and multimodal verification around one physics runtime." />
          <ButtonLink href={asset('chronoagentic-paper.pdf')} icon="paper" tone="outline">Read the technical paper</ButtonLink>
        </div>
        <div className="architecture-grid">
          <button className="architecture-visual" type="button" onClick={() => onOpenFigure({ src: 'media/pipeline.png', alt: 'ChronoAgentic system architecture', caption: 'ChronoAgentic system architecture: planning, construction, staged execution, observation, review, and repair.' })} data-reveal>
            <img src={asset('media/pipeline.png')} alt="ChronoAgentic system architecture" loading="lazy" />
            <span><Icon name="expand" size={16} /> View architecture</span>
          </button>
          <div className="architecture-copy" data-reveal>
            {[
              ['01', 'Context-isolated agents', 'Planning, coding, visual analysis, and review each operate through inspectable handoffs.'],
              ['02', 'Simulator-native intelligence', 'Curated skills and retrieval ground construction in real PyChrono APIs and working patterns.'],
              ['03', 'Reusable world assets', 'Native platforms, catalog objects, and generated meshes share explicit simulation metadata.'],
              ['04', 'Staged execution gates', 'Static, physics-only, first-frame, and full-render checks spend compute where it matters.'],
            ].map(([num, title, copy]) => <div key={num}><span>{num}</span><section><h3>{title}</h3><p>{copy}</p></section></div>)}
          </div>
        </div>

        <div className="domain-matrix" data-reveal>
          <div><span>PHYSICS COVERAGE</span><h3>One construction layer across the Chrono ecosystem.</h3></div>
          <div className="domain-matrix__grid">{capabilities.map(([name, copy]) => <article key={name}><Icon name="orbit" size={18} /><b>{name}</b><p>{copy}</p></article>)}</div>
        </div>

        <div className="research-resource" data-reveal>
          <div className="research-resource__label"><span>RESEARCH & OPEN SOURCE</span><i /></div>
          <div className="research-resource__main">
            <div>
              <h3>ChronoAgentic</h3>
              <p>A Code-based Multi-Agent World Simulator for Physically Grounded Simulation Construction</p>
              <small>{authors.map((author) => author.name).join(' · ')}</small>
            </div>
            <div className="research-resource__actions">
              <ButtonLink href={asset('chronoagentic-paper.pdf')} icon="paper" tone="paper">Paper PDF</ButtonLink>
              <ButtonLink href="https://github.com/Hongyu0329/chrono-agentic" icon="github" tone="paper">Source code</ButtonLink>
              <button type="button" onClick={copyCitation}><Icon name={copied ? 'check' : 'copy'} size={15} />{copied ? 'Copied' : 'Copy citation'}</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="final-cta">
      <div className="final-cta__orb" aria-hidden="true"><i /><i /></div>
      <div className="shell final-cta__content" data-reveal>
        <span>THE WORLD IS THE OUTPUT</span>
        <h2>Describe it.<br /><em>Watch it run.</em></h2>
        <p>Build executable, inspectable worlds for physical AI and engineering with ChronoAgentic.</p>
        <div><ButtonLink href="https://github.com/Hongyu0329/chrono-agentic" icon="github" tone="white">Start building</ButtonLink><ButtonLink href={asset('chronoagentic-paper.pdf')} icon="paper" tone="ghost">Read the paper</ButtonLink></div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer__top">
        <div className="footer__brand"><Wordmark inverse /><p>Executable worlds for<br />physical intelligence.</p></div>
        <div className="footer__links">
          <div><span>Platform</span><a href="#platform">Overview</a><a href="#use-cases">Use cases</a><a href="#studio">Chrono Studio</a><a href="#worlds">Worlds</a></div>
          <div><span>Resources</span><a href={asset('chronoagentic-paper.pdf')}>Technical paper</a><a href="https://github.com/Hongyu0329/chrono-agentic" target="_blank" rel="noreferrer">GitHub</a><a href="https://projectchrono.org/" target="_blank" rel="noreferrer">Project Chrono</a></div>
          <div><span>Created at</span><a href="https://sbel.wisc.edu/" target="_blank" rel="noreferrer">UW–Madison SBEL</a><a href="https://www.wisc.edu/" target="_blank" rel="noreferrer">University of Wisconsin</a></div>
        </div>
      </div>
      <div className="shell footer__bottom"><span>© 2026 ChronoAgentic</span><span>Open research · executable artifacts</span><a href="#top">Back to top ↑</a></div>
      <div className="footer__massive" aria-hidden="true">CHRONOAGENTIC</div>
    </footer>
  )
}

function FigureModal({ figure, onClose }) {
  useEffect(() => {
    if (!figure) return undefined
    const close = (event) => { if (event.key === 'Escape') onClose() }
    document.body.classList.add('modal-open')
    window.addEventListener('keydown', close)
    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', close)
    }
  }, [figure, onClose])

  if (!figure) return null
  return (
    <div className="figure-modal" role="dialog" aria-modal="true" aria-label={figure.caption} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="figure-modal__panel">
        <button type="button" onClick={onClose} aria-label="Close image"><Icon name="close" size={20} /></button>
        <img src={asset(figure.src)} alt={figure.alt} />
        <p>{figure.caption}</p>
      </div>
    </div>
  )
}

export default function App() {
  const [activeSection, setActiveSection] = useState('platform')
  const [figure, setFigure] = useState(null)
  usePageEffects(setActiveSection)

  return (
    <>
      <div className="pointer-glow" aria-hidden="true" />
      <Navigation activeSection={activeSection} />
      <main>
        <Hero />
        <CapabilityRail />
        <PlatformIntro />
        <BuildFlow />
        <UseCases />
        <Studio />
        <Worlds />
        <Proof />
        <Technology onOpenFigure={setFigure} />
        <FinalCTA />
      </main>
      <Footer />
      <FigureModal figure={figure} onClose={() => setFigure(null)} />
    </>
  )
}
