export const authors = [
  { name: 'Hongyu Wang' },
  { name: 'Jingquan Wang' },
  { name: 'Ashvin Anilkumar' },
  { name: 'Bocheng Zou' },
  { name: 'Radu Serban' },
  { name: 'Dan Negrut' },
]

export const pipelineSteps = [
  {
    id: '01',
    short: 'Plan',
    title: 'Commit an inspectable scene plan',
    copy: 'The plan agent converts a prompt and optional reference image into a structured plan covering simulation parameters, objectives, assets, topology, cameras, and reproducibility requirements. The user can approve or correct it before code is written.',
    agent: 'Plan agent',
    artifact: 'committed plan',
    color: 'blue',
  },
  {
    id: '02',
    short: 'Generate',
    title: 'Build one standalone PyChrono program',
    copy: 'The code agent implements the approved plan using the curated skill library, unified asset catalog, and retrieval over simulator source, documentation, demos, and forum history. A static linter screens the program before execution.',
    agent: 'Code agent',
    artifact: 'simulation.py',
    color: 'orange',
  },
  {
    id: '03',
    short: 'Execute',
    title: 'Spend compute in three staged passes',
    copy: 'The same program runs first as a full headless trajectory pass, then as a one-frame-per-camera composition check, and finally as a complete per-camera recording. Execution stops at the first failed gate under a pinned environment contract.',
    agent: 'Chrono engine',
    artifact: 'logs + trajectories',
    color: 'graphite',
  },
  {
    id: '04',
    short: 'Analyze',
    title: 'Turn the rollout into visual evidence',
    copy: 'The visual-analysis agent describes visible objects, arrangement, scale, overlaps, clipping, camera framing, motion, and objective coverage. It supplies evidence; it does not issue the final verdict.',
    agent: 'Visual-analysis agent',
    artifact: 'visual description',
    color: 'green',
  },
  {
    id: '05',
    short: 'Validate',
    title: 'Triangulate three evidence channels',
    copy: 'The review agent checks the program self-report and trajectory scan, the visual description, and the objectives in the committed plan. Claims are cross-checked before they trigger repair.',
    agent: 'Review agent',
    artifact: 'journal + verdict',
    color: 'violet',
  },
  {
    id: '06',
    short: 'Repair',
    title: 'Patch the same program—or stop explicitly',
    copy: 'A failed review returns one evidence-backed repair target to the code agent. Acceptance strips review instrumentation, validates the standalone script, and stamps a checksum; exhausted runs end as blocked with the cause preserved.',
    agent: 'Code agent + gate',
    artifact: 'accepted / blocked',
    color: 'red',
  },
]

export const benchmarkResults = [
  { name: 'Object Motion and Kinematics', score: 90 },
  { name: 'Interaction Dynamics', score: 90 },
  { name: 'Energy Conservation', score: 100 },
  { name: 'Fluid and Particle Dynamics', score: 50 },
  { name: 'Rigid Body Dynamics', score: 90 },
  { name: 'Lighting and Shadows', score: 70 },
  { name: 'Deformations and Elasticity', score: 80 },
  { name: 'Scale and Proportions', score: 90 },
]

// PhyWorld entries below are an explicit allow-list from the internal
// prompt-grounded implementation review. Only approved benchmark clips should
// set `approved: true` and become eligible for display.
export const demos = [
  {
    title: 'FloWave focused-wave pool',
    category: 'Fluid and particle dynamics',
    tag: 'SPH · Focused wave',
    video: 'media/demo-flowave-pool.mp4',
    poster: 'media/poster-flowave-pool.jpg',
    accent: '#1794b8',
    approved: true,
    auditId: null,
    evidence: 'solver-driven wave focusing',
    featured: true,
  },
  {
    title: 'A stone enters still water',
    category: 'Fluid–solid interaction',
    tag: 'SPH · Contact',
    video: 'media/demo-stone-pond.mp4',
    poster: 'media/poster-stone-pond.jpg',
    accent: '#168c86',
    approved: true,
    auditId: '107-2',
    evidence: 'coupled FSI/SPH',
  },
  {
    title: 'A flexible board takes an impact',
    category: 'Deformable contact',
    tag: 'FEA · Contact · Rebound',
    video: 'media/demo-flexible-board.mp4',
    poster: 'media/poster-flexible-board.jpg',
    accent: '#bd7e36',
    approved: true,
    auditId: '166-2',
    evidence: 'rigid/FEA contact',
  },
  {
    title: 'Two billiard balls exchange momentum',
    category: 'Interaction dynamics',
    tag: 'Contact · Impulse · Friction',
    video: 'media/demo-billiards.mp4',
    poster: 'media/poster-billiards.jpg',
    accent: '#46a479',
    approved: true,
    auditId: '037-2',
    evidence: 'rigid contact + impulse',
  },
  {
    title: 'A slack rope pulls a box',
    category: 'Interaction dynamics',
    tag: 'Joints · Tension · Friction',
    video: 'media/demo-slack-rope.mp4',
    poster: 'media/poster-slack-rope.jpg',
    accent: '#d29a43',
    approved: true,
    auditId: '064-2',
    evidence: 'jointed rope + friction',
  },
  {
    title: 'A sponge compresses under load',
    category: 'Interaction dynamics',
    tag: 'FEA · Contact · Compression',
    video: 'media/demo-sponge.mp4',
    poster: 'media/poster-sponge.jpg',
    accent: '#e3b82f',
    approved: true,
    auditId: '070-2',
    evidence: 'FEA + platen contact',
  },
  {
    title: 'Water forms a driven vortex',
    category: 'Fluid and particle dynamics',
    tag: 'SPH · BCE · Momentum',
    video: 'media/demo-stirred-water.mp4',
    poster: 'media/poster-stirred-water.jpg',
    accent: '#268eaf',
    approved: true,
    auditId: '111-2',
    evidence: 'motor/BCE + SPH',
  },
  {
    title: 'Energy in a pendulum',
    category: 'Multibody dynamics',
    tag: 'Constraint · Energy',
    video: 'media/demo-pendulum.mp4',
    poster: 'media/poster-pendulum.jpg',
    accent: '#6959bd',
    approved: true,
    auditId: '095-2',
    evidence: 'gravity + constraint',
  },
  {
    title: 'A spring stores and releases',
    category: 'Deformable systems',
    tag: 'FEA · Elasticity',
    video: 'media/demo-spring.mp4',
    poster: 'media/poster-spring.jpg',
    accent: '#3e72b8',
    approved: true,
    auditId: '222-2',
    evidence: 'elastic energy',
  },
  {
    title: 'A beach ball meets a pool',
    category: 'Fluid–solid interaction',
    tag: 'Buoyancy · Free surface',
    video: 'media/demo-beach-ball.mp4',
    poster: 'media/poster-beach-ball.jpg',
    accent: '#d05b63',
    approved: true,
    auditId: '130-2',
    evidence: 'coupled FSI/SPH',
  },
  {
    title: 'Thickness changes fracture',
    category: 'Scale and proportions',
    tag: 'Contact · Stress · Fracture',
    video: 'media/demo-glass-panes.mp4',
    poster: 'media/poster-glass-panes.jpg',
    accent: '#81aeb6',
    approved: true,
    auditId: '269-2',
    evidence: 'contact + stress fracture',
  },
]

export const evidenceCards = [
  {
    number: '01',
    title: 'Source is the world',
    copy: 'Bodies, joints, contacts, sensors, controllers, and solver choices remain inspectable in the delivered program.',
    label: 'simulation.py',
  },
  {
    number: '02',
    title: 'Execution is observable',
    copy: 'Bounded runs produce logs, trajectory data, first frames, and full videos from the same simulator state.',
    label: 'run artifacts',
  },
  {
    number: '03',
    title: 'Claims have a gate',
    copy: 'A visual result does not substitute for a physics diagnostic; acceptance binds each objective to its own evidence.',
    label: 'review verdict',
  },
]

export const capabilities = [
  ['Rigid body', 'Contacts, friction, collision, mechanisms'],
  ['Vehicles & robots', 'Native wrappers, terrain, sensors, control'],
  ['FEA', 'Beams, shells, cables, deformation'],
  ['Fluids & FSI', 'SPH, granular media, fluid–solid coupling'],
  ['Optical sensors', 'Headless camera, lidar, light and shadow'],
  ['Generated worlds', 'Vehicles, environments, and sensor-driven scenes'],
]

// PhyWorldBench comparison, Table 2 (right) of the manuscript. Every baseline is
// the official PhyWorldBench release video for the same scenario prompt, scored
// by the same judge under the same full-video protocol as our rollouts.
export const videoModelComparison = [
  { name: 'ChronoAgentic', note: 'code-based world simulator', sa: 93.8, pc: 88.8, both: 82.5, ours: true },
  { name: 'Pika', note: 'text-to-video', sa: 78.8, pc: 55.0, both: 52.5 },
  { name: 'Kling', note: 'text-to-video', sa: 65.0, pc: 45.0, both: 42.5 },
  { name: 'Sora', note: 'text-to-video', sa: 61.3, pc: 43.8, both: 40.0 },
  { name: 'Luma Dream Machine', note: 'text-to-video', sa: 58.8, pc: 38.8, both: 32.5 },
  { name: 'Runway Gen-3', note: 'text-to-video', sa: 47.5, pc: 36.2, both: 28.7 },
  { name: 'CogVideoX', note: 'text-to-video', sa: 52.5, pc: 40.0, both: 25.0 },
  { name: 'HunyuanVideo', note: 'text-to-video', sa: 50.0, pc: 33.8, both: 22.5 },
  { name: 'LTX-Video', note: 'text-to-video', sa: 51.2, pc: 25.0, both: 21.2 },
  { name: 'Open-Sora-Plan', note: 'text-to-video', sa: 25.0, pc: 18.8, both: 13.8 },
  { name: 'Open-Sora', note: 'text-to-video', sa: 31.2, pc: 21.2, both: 11.2 },
]

export const comparisonMetrics = [
  { key: 'both', short: 'SA ∧ PC', label: 'Full correctness', copy: 'The benchmark’s “everything correct” criterion: semantic adherence and physical correctness judged jointly.' },
  { key: 'pc', short: 'PC', label: 'Physical correctness', copy: 'Every scenario-specific Key Standard is satisfied — the metric that depends on solver state rather than on appearance.' },
  { key: 'sa', short: 'SA', label: 'Semantic adherence', copy: 'The prompt-specified objects and the prompt-specified event both appear in the rollout.' },
]

export const comparisonCaveats = [
  {
    number: '01',
    title: 'The judge shares a model family with our reviewer',
    copy: 'Verdicts come from Gemini 2.5 Pro, the same family as the framework’s visual-analysis agent, so part of the margin may reflect reviewer–judge alignment.',
  },
  {
    number: '02',
    title: 'Clip length is not controlled',
    copy: 'A short baseline clip can fail the Event criterion for lack of room to complete the action, which the protocol does not correct for.',
  },
  {
    number: '03',
    title: 'Not an official leaderboard result',
    copy: 'The full-video judge and the 80-demo in-scope subset both depart from the official eight-frame protocol, so absolute scores are not comparable to the published leaderboard.',
  },
]
