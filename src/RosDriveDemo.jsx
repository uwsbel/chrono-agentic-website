import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from './Icons.jsx'
import { useRosbridge } from './useRosbridge.js'

const STORAGE_KEY = 'chrono-agentic:ros-demo-config:v1'
const DEFAULT_NAMESPACE = import.meta.env.VITE_ROS_NAMESPACE || '/chrono_studio'
const DEFAULT_BRIDGE = import.meta.env.VITE_ROS_BRIDGE_URL || 'ws://127.0.0.1:9090'
const DEFAULT_STREAM = import.meta.env.VITE_ROS_STREAM_URL
  || 'http://127.0.0.1:8080/stream?topic=/chrono_studio/output/camera/image_rgb&type=mjpeg'

const DRIVE_KEYS = new Set(['w', 'a', 's', 'd', ' '])
const CAMERA_KEYS = new Set(['arrowup', 'arrowdown', 'arrowleft', 'arrowright'])
const CAMERA_DEFAULT = { yaw: 0, pitch: 0.2 }

// web_video_server treats an encoded slash in `topic=` as a literal character.
// Repair the previously shipped default if it is still present in localStorage.
function normalizeStreamUrl(value) {
  return String(value || '').replace(/([?&]topic=)([^&]*)/i, (_, prefix, topic) => (
    `${prefix}${topic.replace(/%2f/gi, '/')}`
  ))
}

function initialConfig() {
  const fallback = {
    bridgeUrl: DEFAULT_BRIDGE,
    streamUrl: DEFAULT_STREAM,
    namespace: DEFAULT_NAMESPACE,
  }
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null')
    const config = saved ? { ...fallback, ...saved } : fallback
    return { ...config, streamUrl: normalizeStreamUrl(config.streamUrl) }
  } catch {
    return fallback
  }
}

function normalizeNamespace(value) {
  const clean = String(value || DEFAULT_NAMESPACE).trim().replace(/^\/+|\/+$/g, '')
  return `/${clean || 'chrono_studio'}`
}

function validateConfig(config) {
  const bridge = config.bridgeUrl.trim()
  if (!/^wss?:\/\//i.test(bridge) && !bridge.startsWith('/')) {
    return 'rosbridge must use ws://, wss://, or a same-origin /path.'
  }
  if (config.streamUrl.trim() && !/^https?:\/\//i.test(config.streamUrl.trim()) && !config.streamUrl.trim().startsWith('/')) {
    return 'The camera stream must use http://, https://, or a same-origin /path.'
  }
  return null
}

function ramp(current, target, riseRate, returnRate, dt) {
  const rate = Math.abs(target) > Math.abs(current) ? riseRate : returnRate
  const delta = rate * dt
  if (current < target) return Math.min(target, current + delta)
  if (current > target) return Math.max(target, current - delta)
  return current
}

function streamWithNonce(url, nonce) {
  if (!url) return ''
  return `${url}${url.includes('?') ? '&' : '?'}chrono_session=${nonce}`
}

function formatNumber(value, decimals = 1, fallback = '—') {
  return Number.isFinite(value) ? value.toFixed(decimals) : fallback
}

function InputMeter({ label, value, signed = false, tone }) {
  const magnitude = Math.min(1, Math.abs(value))
  return (
    <div className="ros-meter">
      <span>{label}</span>
      <div className={`ros-meter__track ${signed ? 'is-signed' : ''}`}>
        <i
          style={signed
            ? { width: `${magnitude * 50}%`, transform: value < 0 ? 'translateX(-100%)' : 'none', background: tone }
            : { width: `${magnitude * 100}%`, background: tone }}
        />
      </div>
      <b>{value.toFixed(2)}</b>
    </div>
  )
}

function RosMiniMap({ position, heading, speed, sessionKey }) {
  const canvasRef = useRef(null)
  const trailRef = useRef([])

  useEffect(() => { trailRef.current = [] }, [sessionKey])

  useEffect(() => {
    if (!position) return
    const trail = trailRef.current
    const previous = trail[trail.length - 1]
    if (!previous || Math.hypot(position.x - previous.x, position.y - previous.y) >= 0.5) {
      trail.push({ x: position.x, y: position.y })
      if (trail.length > 1200) trail.splice(0, trail.length - 1200)
    }
  }, [position])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const size = 156
    const ratio = window.devicePixelRatio || 1
    canvas.width = size * ratio
    canvas.height = size * ratio
    const context = canvas.getContext('2d')
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    context.clearRect(0, 0, size, size)

    const center = size / 2
    const scale = 1.35
    const worldX = position?.x || 0
    const worldY = position?.y || 0
    const x = (value) => center + (value - worldX) * scale
    const y = (value) => center - (value - worldY) * scale

    context.fillStyle = 'rgba(7, 11, 12, 0.82)'
    context.fillRect(0, 0, size, size)
    context.strokeStyle = 'rgba(255, 255, 255, 0.08)'
    context.lineWidth = 1
    context.beginPath()
    const span = center / scale
    for (let gx = Math.floor((worldX - span) / 20) * 20; gx <= worldX + span; gx += 20) {
      context.moveTo(x(gx), 0)
      context.lineTo(x(gx), size)
    }
    for (let gy = Math.floor((worldY - span) / 20) * 20; gy <= worldY + span; gy += 20) {
      context.moveTo(0, y(gy))
      context.lineTo(size, y(gy))
    }
    context.stroke()

    const trail = trailRef.current
    if (trail.length > 1) {
      context.strokeStyle = 'rgba(116, 228, 155, 0.86)'
      context.lineWidth = 1.8
      context.beginPath()
      context.moveTo(x(trail[0].x), y(trail[0].y))
      for (let index = 1; index < trail.length; index += 1) context.lineTo(x(trail[index].x), y(trail[index].y))
      context.stroke()
    }

    context.save()
    context.translate(center, center)
    context.rotate(-(heading || 0))
    context.fillStyle = '#74e49b'
    context.beginPath()
    context.moveTo(9, 0)
    context.lineTo(-6, 5)
    context.lineTo(-3, 0)
    context.lineTo(-6, -5)
    context.closePath()
    context.fill()
    context.restore()

    context.fillStyle = 'rgba(255, 255, 255, 0.76)'
    context.font = '8px DM Mono, monospace'
    context.fillText(position ? `${position.x.toFixed(1)}, ${position.y.toFixed(1)}` : 'waiting for pose', 8, 14)
  }, [position, heading])

  return (
    <div className="ros-minimap" aria-label="Live vehicle trajectory minimap">
      <canvas ref={canvasRef} width="156" height="156" />
      <span>{Number.isFinite(speed) ? `${Math.round(speed * 3.6)} km/h` : '— km/h'}</span>
    </div>
  )
}

function HoldButton({ control, label, hint, disabled, onPress, onRelease, className = '' }) {
  const release = (event) => {
    try { event.currentTarget.releasePointerCapture(event.pointerId) } catch {}
    onRelease(control)
  }

  return (
    <button
      className={`ros-hold ${className}`}
      type="button"
      disabled={disabled}
      onPointerDown={(event) => {
        event.preventDefault()
        event.currentTarget.setPointerCapture(event.pointerId)
        onPress(control)
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onContextMenu={(event) => event.preventDefault()}
    >
      <b>{label}</b><span>{hint}</span>
    </button>
  )
}

export default function RosDriveDemo({ previewVideo, previewPoster }) {
  const rootRef = useRef(null)
  const stageRef = useRef(null)
  const pressedRef = useRef(new Set())
  const controlRef = useRef({ throttle: 0, steering: 0, braking: 1 })
  const cameraRef = useRef({ ...CAMERA_DEFAULT })
  const streamRetryRef = useRef(null)
  const wasConnectedRef = useRef(false)
  const initial = useMemo(initialConfig, [])
  const [draft, setDraft] = useState(initial)
  const [activeConfig, setActiveConfig] = useState(initial)
  const [enabled, setEnabled] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(true)
  const [configError, setConfigError] = useState(null)
  const [streamReady, setStreamReady] = useState(false)
  const [streamFailed, setStreamFailed] = useState(false)
  const [streamNonce, setStreamNonce] = useState(0)
  const [focused, setFocused] = useState(false)
  const [emergency, setEmergency] = useState(true)
  const [display, setDisplay] = useState({ throttle: 0, steering: 0, braking: 1 })
  const [requestedGear, setRequestedGear] = useState('D')

  const ros = useRosbridge({
    enabled,
    bridgeUrl: activeConfig.bridgeUrl,
    namespace: activeConfig.namespace,
  })

  const mixedTransport = typeof window !== 'undefined'
    && window.location.protocol === 'https:'
    && (/^ws:\/\//i.test(draft.bridgeUrl.trim()) || /^http:\/\//i.test(draft.streamUrl.trim()))

  const streamSource = enabled && activeConfig.streamUrl.trim()
    ? streamWithNonce(activeConfig.streamUrl.trim(), streamNonce)
    : ''

  useEffect(() => {
    setStreamReady(false)
    setStreamFailed(false)
    window.clearTimeout(streamRetryRef.current)
    if (enabled && activeConfig.streamUrl) setStreamNonce((value) => value + 1)
    return () => window.clearTimeout(streamRetryRef.current)
  }, [enabled, activeConfig.streamUrl])

  const clearPressed = useCallback(() => pressedRef.current.clear(), [])

  const emergencyBrake = useCallback(() => {
    clearPressed()
    setEmergency(true)
    controlRef.current = { throttle: 0, steering: 0, braking: 1 }
    setDisplay({ throttle: 0, steering: 0, braking: 1 })
    ros.publishDriver({ throttle: 0, steering: 0, braking: 1 })
  }, [clearPressed, ros.publishDriver])

  useEffect(() => {
    if (wasConnectedRef.current && !ros.connected && enabled) emergencyBrake()
    wasConnectedRef.current = ros.connected
  }, [enabled, ros.connected, emergencyBrake])

  useEffect(() => {
    const stop = () => { if (enabled) emergencyBrake() }
    const visibility = () => { if (document.hidden) stop() }
    window.addEventListener('blur', stop)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      window.removeEventListener('blur', stop)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [enabled, emergencyBrake])

  useEffect(() => {
    if (!enabled) return undefined
    let previous = performance.now()
    const timer = window.setInterval(() => {
      const now = performance.now()
      const dt = Math.min(0.1, (now - previous) / 1000)
      previous = now
      const keys = pressedRef.current
      const brakeHeld = keys.has('s') || keys.has(' ') || keys.has('brake')
      const throttleTarget = !emergency && !brakeHeld && (keys.has('w') || keys.has('throttle')) ? 1 : 0
      const brakeTarget = emergency || brakeHeld ? 1 : 0
      let steeringTarget = 0
      if (!emergency && (keys.has('a') || keys.has('left'))) steeringTarget -= 1
      if (!emergency && (keys.has('d') || keys.has('right'))) steeringTarget += 1

      const control = controlRef.current
      control.throttle = ramp(control.throttle, throttleTarget, 2.5, 4.5, dt)
      control.braking = ramp(control.braking, brakeTarget, 7, 8, dt)
      control.steering = ramp(control.steering, steeringTarget, 3.5, 6, dt)

      let yawDirection = 0
      let pitchDirection = 0
      if (keys.has('arrowleft')) yawDirection -= 1
      if (keys.has('arrowright')) yawDirection += 1
      if (keys.has('arrowup')) pitchDirection -= 1
      if (keys.has('arrowdown')) pitchDirection += 1
      if (yawDirection || pitchDirection) {
        const camera = cameraRef.current
        camera.yaw += yawDirection * 1.8 * dt
        if (camera.yaw > Math.PI) camera.yaw -= 2 * Math.PI
        if (camera.yaw < -Math.PI) camera.yaw += 2 * Math.PI
        camera.pitch = Math.max(-0.6, Math.min(1.2, camera.pitch + pitchDirection * 0.9 * dt))
        if (ros.connected) ros.publishCamera(camera.yaw, camera.pitch)
      }

      if (ros.connected) {
        ros.publishDriver({
          throttle: control.throttle,
          steering: -control.steering,
          braking: control.braking,
        })
      }
      setDisplay({ ...control })
    }, 33)

    return () => window.clearInterval(timer)
  }, [enabled, emergency, ros.connected, ros.publishCamera, ros.publishDriver])

  const connect = (event) => {
    event.preventDefault()
    const next = {
      bridgeUrl: draft.bridgeUrl.trim(),
      streamUrl: normalizeStreamUrl(draft.streamUrl.trim()),
      namespace: normalizeNamespace(draft.namespace),
    }
    const issue = validateConfig(next)
    if (issue) {
      setConfigError(issue)
      return
    }
    setConfigError(null)
    setActiveConfig(next)
    setDraft(next)
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
    setEmergency(true)
    setEnabled(true)
    setSettingsOpen(false)
  }

  const disconnect = () => {
    emergencyBrake()
    setEnabled(false)
    setFocused(false)
    setSettingsOpen(true)
  }

  const setGear = (mode, value) => {
    if (!ros.connected) return
    setRequestedGear(mode)
    ros.publishGear(value)
  }

  const onKeyDown = (event) => {
    const key = event.key.toLowerCase()
    if (DRIVE_KEYS.has(key) || CAMERA_KEYS.has(key)) {
      event.preventDefault()
      pressedRef.current.add(key)
    }
    if (event.repeat) return
    if (key === 'r') {
      event.preventDefault()
      const mode = (ros.powertrain?.mode || requestedGear) === 'R' ? 'D' : 'R'
      setGear(mode, mode === 'R' ? -1 : 1)
    } else if (key === 'n') {
      event.preventDefault()
      setGear('N', 0)
    } else if (key === 'c') {
      event.preventDefault()
      cameraRef.current = { ...CAMERA_DEFAULT }
      ros.publishCamera(CAMERA_DEFAULT.yaw, CAMERA_DEFAULT.pitch)
    }
  }

  const onKeyUp = (event) => pressedRef.current.delete(event.key.toLowerCase())
  const press = (control) => pressedRef.current.add(control)
  const release = (control) => pressedRef.current.delete(control)
  const liveTelemetry = ros.lastMessageAt && Date.now() - ros.lastMessageAt < 3500
  const gear = ros.powertrain?.mode || requestedGear || '—'
  const gearLabel = gear === 'D' && ros.powertrain?.gear ? `D${ros.powertrain.gear}` : gear
  const statusLabel = {
    idle: 'not connected',
    connecting: 'connecting',
    reconnecting: 'reconnecting',
    connected: 'control online',
    error: 'connection error',
  }[ros.status] || ros.status

  return (
    <div className="ros-drive shell-wide" ref={rootRef} data-reveal>
      <div className="ros-drive__toolbar">
        <div className="ros-drive__identity">
          <span className={`ros-status-dot is-${ros.status}`} />
          <div><b>CHRONO::ROS LIVE</b><span>{statusLabel}</span></div>
        </div>
        <div className="ros-drive__toolbar-actions">
          <button type="button" onClick={() => setSettingsOpen((value) => !value)}><Icon name="terminal" size={14} /> Connection</button>
          {enabled
            ? <button className="is-danger" type="button" onClick={disconnect}><Icon name="close" size={14} /> Disconnect</button>
            : null}
        </div>
      </div>

      {settingsOpen && (
        <form className="ros-connect" onSubmit={connect}>
          <div className="ros-connect__heading">
            <div><span>LIVE ENDPOINTS</span><h3>Connect this page to a running ROS city.</h3></div>
            <p>The browser speaks rosbridge directly. It cannot start PyChrono from GitHub Pages; launch the simulation and bridges on a ROS host first.</p>
          </div>
          <div className="ros-connect__fields">
            <label><span>rosbridge WebSocket</span><input value={draft.bridgeUrl} onChange={(event) => setDraft({ ...draft, bridgeUrl: event.target.value })} spellCheck="false" placeholder="wss://host.example/rosbridge" /></label>
            <label><span>Camera MJPEG stream</span><input value={draft.streamUrl} onChange={(event) => setDraft({ ...draft, streamUrl: event.target.value })} spellCheck="false" placeholder="https://host.example/ros-camera" /></label>
            <label><span>ROS node namespace</span><input value={draft.namespace} onChange={(event) => setDraft({ ...draft, namespace: event.target.value })} spellCheck="false" placeholder="/chrono_studio" /></label>
          </div>
          {(configError || mixedTransport) && <p className="ros-connect__warning">{configError || 'This site is HTTPS. Public deployment requires WSS and an HTTPS camera stream; ws:// and http:// may only work from a local page.'}</p>}
          <div className="ros-connect__footer">
            <details>
              <summary>Host setup</summary>
              <p>From the Chrono Studio workspace, run the city simulation and browser bridges in separate terminals:</p>
              <pre><code>{`# terminal 1 — simulation\nconda activate pychrono10\nset -a; source scripts/chrono_env.sh; set +a\nROS_DEMO_SCENE=city ROS_DEMO_SECONDS=600 "$CHRONO_PY" scripts/ros_studio_demo.py\n\n# terminal 2 — browser transports\nBRIDGES="rosbridge web_video" CAMERA_TOPIC=/chrono_studio/output/camera/image bash scripts/ros_bridges.sh`}</code></pre>
              <p>Do not expose an unauthenticated rosbridge port to the public internet. Put remote access behind an authenticated WSS/HTTPS reverse proxy.</p>
            </details>
            <button className="ros-connect__submit" type="submit"><Icon name="orbit" size={15} /> Connect to ROS</button>
          </div>
        </form>
      )}

      <div className="ros-drive__body">
        <div
          className={`ros-viewport ${focused ? 'is-focused' : ''}`}
          ref={stageRef}
          tabIndex={enabled ? 0 : -1}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            setFocused(false)
            clearPressed()
            if (!rootRef.current?.contains(event.relatedTarget)) emergencyBrake()
          }}
          onClick={() => enabled && stageRef.current?.focus()}
        >
          <video className="ros-viewport__preview" src={previewVideo} poster={previewPoster} muted loop autoPlay playsInline preload="metadata" />
          {streamSource && (
            <img
              key={streamSource}
              className={`ros-viewport__live ${streamReady ? 'is-ready' : ''}`}
              src={streamSource}
              alt="Live chase camera from the PyChrono ROS simulation"
              onLoad={() => { setStreamReady(true); setStreamFailed(false) }}
              onError={() => {
                setStreamReady(false)
                setStreamFailed(true)
                window.clearTimeout(streamRetryRef.current)
                streamRetryRef.current = window.setTimeout(() => setStreamNonce((value) => value + 1), 2500)
              }}
            />
          )}
          <div className="ros-viewport__shade" />
          <div className="ros-viewport__top">
            <span><i className={ros.connected ? 'is-live' : ''} />{ros.connected ? 'ROSBRIDGE CONNECTED' : 'RECORDED PREVIEW'}</span>
            <span>{streamReady ? 'LIVE CAMERA' : streamFailed ? 'CAMERA RETRYING' : 'CAMERA WAITING'}</span>
          </div>
          {enabled && <RosMiniMap position={ros.position} heading={ros.heading} speed={ros.speed} sessionKey={`${activeConfig.bridgeUrl}:${activeConfig.namespace}`} />}
          <div className="ros-viewport__hud">
            <strong className={gear === 'R' ? 'is-reverse' : ''}>{gearLabel}</strong>
            <b>{Number.isFinite(ros.speed) ? Math.round(ros.speed * 3.6) : '—'}<small> km/h</small></b>
            {Number.isFinite(ros.powertrain?.rpm) && <span>{Math.round(ros.powertrain.rpm)} rpm</span>}
          </div>
          <div className="ros-viewport__message">
            {!enabled
              ? 'Connect to a running ROS host to replace this recorded preview with the live chase camera.'
              : !ros.connected
                ? 'Opening the control channel…'
                : !streamReady
                  ? 'Control is online. Waiting for the live camera stream…'
                  : emergency
                    ? 'Emergency brake is latched. Release it in the control panel before driving.'
                    : focused
                      ? 'Keys active · W throttle · S/Space brake · A/D steer · R reverse · arrows camera'
                      : 'Click the live view to activate keyboard driving.'}
          </div>
        </div>

        <aside className="ros-console">
          <div className="ros-console__head">
            <div><span>REAL-TIME CONTROL</span><h3>Drive the solver.</h3></div>
            <span className={liveTelemetry ? 'is-live' : ''}><i />{liveTelemetry ? 'telemetry' : 'waiting'}</span>
          </div>

          <div className="ros-telemetry">
            <article><span>Speed</span><b>{formatNumber(ros.speed != null ? ros.speed * 3.6 : null, 1)} <small>km/h</small></b></article>
            <article><span>Simulation time</span><b>{formatNumber(ros.simTime, 2)} <small>s</small></b></article>
            <article><span>Position</span><b>{ros.position ? `${ros.position.x.toFixed(1)}, ${ros.position.y.toFixed(1)}` : '—'} <small>m</small></b></article>
            <article><span>Yaw rate</span><b>{formatNumber(ros.yawRate, 2)} <small>rad/s</small></b></article>
          </div>

          <div className="ros-inputs">
            <InputMeter label="throttle" value={display.throttle} tone="#74e49b" />
            <InputMeter label="steering" value={display.steering} signed tone="#61cbd7" />
            <InputMeter label="braking" value={display.braking} tone="#ff755e" />
          </div>

          <div className="ros-touch" aria-label="Touch vehicle controls">
            <HoldButton control="left" label="←" hint="left" disabled={!ros.connected || emergency} onPress={press} onRelease={release} />
            <HoldButton control="throttle" label="W" hint="throttle" disabled={!ros.connected || emergency} onPress={press} onRelease={release} className="is-throttle" />
            <HoldButton control="right" label="→" hint="right" disabled={!ros.connected || emergency} onPress={press} onRelease={release} />
            <span />
            <HoldButton control="brake" label="S" hint="brake" disabled={!ros.connected} onPress={press} onRelease={release} className="is-brake" />
            <span />
          </div>

          <div className="ros-gears">
            {['R', 'N', 'D'].map((mode) => <button key={mode} type="button" disabled={!ros.connected} className={gear === mode ? 'is-active' : ''} onClick={() => setGear(mode, mode === 'R' ? -1 : mode === 'N' ? 0 : 1)}>{mode}</button>)}
            <button
              className={`ros-estop ${emergency ? 'is-latched' : ''}`}
              type="button"
              disabled={!ros.connected}
              onClick={() => {
                if (emergency) {
                  controlRef.current.braking = 0
                  setEmergency(false)
                  ros.publishDriver({ throttle: 0, steering: 0, braking: 0 })
                } else {
                  emergencyBrake()
                }
              }}
            >{emergency ? 'Release brake' : 'Emergency brake'}</button>
          </div>

          <div className="ros-console__foot">
            <span><Icon name="shield" size={13} /> Browser → rosbridge → PyChrono</span>
            <span>{ros.connected ? `${Object.values(ros.rates).reduce((sum, value) => sum + value, 0)} msg/s` : 'no ROS traffic'}</span>
          </div>
          {(ros.error || configError) && <p className="ros-console__error">{ros.error || configError}</p>}
        </aside>
      </div>
    </div>
  )
}
