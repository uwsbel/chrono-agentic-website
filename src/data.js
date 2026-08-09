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

export const physicsAudit = [
  { name: 'Motion & kinematics', pure: 8, proxy: 2 },
  { name: 'Interaction dynamics', pure: 6, proxy: 4 },
  { name: 'Energy conservation', pure: 6, proxy: 4 },
  { name: 'Fluid & particles', pure: 5, proxy: 5 },
  { name: 'Rigid-body dynamics', pure: 9, proxy: 1 },
  { name: 'Lighting & shadows', pure: 0, proxy: 10 },
  { name: 'Deformation & elasticity', pure: 8, proxy: 2 },
  { name: 'Scale & proportions', pure: 7, proxy: 3 },
]

// PhyWorld entries below are an explicit allow-list sourced from
// history_exp/physics_vs_animation_review.md. Do not add a benchmark clip
// unless its prompt-grounded verdict is "Pure physics" in that audit.
export const demos = [
  {
    title: 'FloWave focused-wave pool',
    category: 'Fluid and particle dynamics',
    tag: 'SPH · 1,023,648 particles',
    video: 'media/demo-flowave-pool.mp4',
    poster: 'media/poster-flowave-pool.jpg',
    accent: '#1794b8',
    evidence: 'Pure physics · validated million-particle SPH',
    featured: true,
  },
  {
    title: 'A stone enters still water',
    category: 'Fluid–solid interaction',
    tag: 'SPH · Contact',
    video: 'media/demo-stone-pond.mp4',
    poster: 'media/poster-stone-pond.jpg',
    accent: '#168c86',
    evidence: 'Pure physics · PWB 107-2 · coupled FSI/SPH',
  },
  {
    title: 'A flexible board takes an impact',
    category: 'Deformable contact',
    tag: 'FEA · Contact · Rebound',
    video: 'media/demo-flexible-board.mp4',
    poster: 'media/poster-flexible-board.jpg',
    accent: '#bd7e36',
    evidence: 'Pure physics · PWB 166-2 · rigid/FEA contact',
  },
  {
    title: 'Energy in a pendulum',
    category: 'Multibody dynamics',
    tag: 'Constraint · Energy',
    video: 'media/demo-pendulum.mp4',
    poster: 'media/poster-pendulum.jpg',
    accent: '#6959bd',
    evidence: 'Pure physics · PWB 095-2 · gravity + constraint',
  },
  {
    title: 'A spring stores and releases',
    category: 'Deformable systems',
    tag: 'FEA · Elasticity',
    video: 'media/demo-spring.mp4',
    poster: 'media/poster-spring.jpg',
    accent: '#3e72b8',
    evidence: 'Pure physics · PWB 222-2 · elastic energy',
  },
  {
    title: 'A beach ball meets a pool',
    category: 'Fluid–solid interaction',
    tag: 'Buoyancy · Free surface',
    video: 'media/demo-beach-ball.mp4',
    poster: 'media/poster-beach-ball.jpg',
    accent: '#d05b63',
    evidence: 'Pure physics · PWB 130-2 · coupled FSI/SPH',
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
