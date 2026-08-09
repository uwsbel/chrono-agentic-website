export const authors = [
  { name: 'Hongyu Wang', equal: true },
  { name: 'Jingquan Wang', equal: true },
  { name: 'Ashvin Anilkumar' },
  { name: 'Bocheng Zou' },
  { name: 'Radu Serban' },
  { name: 'Dan Negrut' },
]

export const pipelineSteps = [
  {
    id: '01',
    short: 'Plan',
    title: 'Commit the world specification',
    copy: 'A plan agent turns prose or an image into an inspectable scene contract: bodies, topology, dimensions, objectives, cameras, and physical predicates.',
    agent: 'Plan agent',
    artifact: 'plan.md',
    color: 'blue',
  },
  {
    id: '02',
    short: 'Code',
    title: 'Construct executable dynamics',
    copy: 'A code agent routes through PyChrono skills, simulator retrieval, and reusable assets to produce one standalone simulation program.',
    agent: 'Code agent',
    artifact: 'simulation.py',
    color: 'orange',
  },
  {
    id: '03',
    short: 'Run',
    title: 'Execute from cheap checks upward',
    copy: 'The program passes a static gate, a physics-only run, a first-frame composition check, and only then a full sensor-camera render.',
    agent: 'PyChrono',
    artifact: 'run + logs',
    color: 'graphite',
  },
  {
    id: '04',
    short: 'Observe',
    title: 'Watch what the solver produced',
    copy: 'Visual analysis reads the rendered rollout—not just the prompt—and reports scene, motion, framing, and temporal behavior.',
    agent: 'Visual agent',
    artifact: 'video report',
    color: 'green',
  },
  {
    id: '05',
    short: 'Verify',
    title: 'Test the physical claim',
    copy: 'Deterministic diagnostics inspect trajectories while a review agent compares source, runtime evidence, and the committed objectives.',
    agent: 'Review agent',
    artifact: 'verdict',
    color: 'violet',
  },
  {
    id: '06',
    short: 'Repair',
    title: 'Patch one grounded defect',
    copy: 'If evidence fails, a targeted report returns to the code agent. The run is accepted only when the loop closes with replayable evidence.',
    agent: 'Closed loop',
    artifact: 'accepted / blocked',
    color: 'red',
  },
]

export const categoryResults = [
  { name: 'Motion & kinematics', short: 'Motion', sa: 100, pc: 90, joint: 90 },
  { name: 'Interaction dynamics', short: 'Interaction', sa: 100, pc: 90, joint: 90 },
  { name: 'Energy conservation', short: 'Energy', sa: 100, pc: 100, joint: 100 },
  { name: 'Fluid & particles', short: 'Fluids', sa: 100, pc: 50, joint: 50 },
  { name: 'Rigid-body dynamics', short: 'Rigid body', sa: 90, pc: 100, joint: 90 },
  { name: 'Lighting & shadows', short: 'Lighting', sa: 80, pc: 90, joint: 70 },
  { name: 'Deformation & elasticity', short: 'Deformation', sa: 90, pc: 90, joint: 80 },
  { name: 'Scale & proportions', short: 'Scale', sa: 90, pc: 100, joint: 90 },
]

export const baselines = [
  { name: 'ChronoAgentic', value: 82.5, ours: true },
  { name: 'Pika', value: 52.5 },
  { name: 'Kling', value: 42.5 },
  { name: 'Sora', value: 40.0 },
  { name: 'Luma', value: 32.5 },
  { name: 'Gen-3', value: 28.7 },
  { name: '10-model mean', value: 29.0, mean: true },
]

export const demos = [
  {
    title: 'FloWave focused-wave pool',
    category: 'Fluid and particle dynamics',
    tag: 'SPH · 1,023,648 particles',
    video: 'media/demo-flowave-pool.mp4',
    poster: 'media/poster-flowave-pool.jpg',
    accent: '#1794b8',
    evidence: 'Pipeline accepted · numerical checks passed',
    featured: true,
  },
  {
    title: 'A stone enters still water',
    category: 'Fluid–solid interaction',
    tag: 'SPH · Contact',
    video: 'media/demo-stone-pond.mp4',
    poster: 'media/poster-stone-pond.jpg',
    accent: '#168c86',
    evidence: 'PhyWorldBench · semantic + physics pass',
  },
  {
    title: 'Wind drives a field mechanism',
    category: 'Motion & kinematics',
    tag: 'Rigid bodies · wind load',
    video: 'media/demo-windmill.mp4',
    poster: 'media/poster-windmill.jpg',
    accent: '#bd5d36',
    evidence: 'PhyWorldBench · semantic + physics pass',
  },
  {
    title: 'Energy in a pendulum',
    category: 'Multibody dynamics',
    tag: 'Constraint · Energy',
    video: 'media/demo-pendulum.mp4',
    poster: 'media/poster-pendulum.jpg',
    accent: '#6959bd',
    evidence: 'PhyWorldBench · semantic + physics pass',
  },
  {
    title: 'A spring stores and releases',
    category: 'Deformable systems',
    tag: 'FEA · Elasticity',
    video: 'media/demo-spring.mp4',
    poster: 'media/poster-spring.jpg',
    accent: '#3e72b8',
    evidence: 'PhyWorldBench · semantic + physics pass',
  },
  {
    title: 'A beach ball meets a pool',
    category: 'Fluid–solid interaction',
    tag: 'Buoyancy · Free surface',
    video: 'media/demo-beach-ball.mp4',
    poster: 'media/poster-beach-ball.jpg',
    accent: '#d05b63',
    evidence: 'PhyWorldBench · semantic + physics pass',
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
  ['ROS worlds', 'Interactive control and live telemetry'],
]
