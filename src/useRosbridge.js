import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const DRIVER_TYPE = 'chrono_ros_interfaces/msg/DriverInputs'
const TWIST_TYPE = 'geometry_msgs/msg/TwistStamped'
const POSE_TYPE = 'geometry_msgs/msg/PoseStamped'
const ACCEL_TYPE = 'geometry_msgs/msg/AccelStamped'
const NAVSAT_TYPE = 'sensor_msgs/msg/NavSatFix'
const CLOCK_TYPE = 'rosgraph_msgs/msg/Clock'
const INT8_TYPE = 'std_msgs/msg/Int8'
const STRING_TYPE = 'std_msgs/msg/String'
const F32ARR_TYPE = 'std_msgs/msg/Float32MultiArray'

function normalizeNamespace(value) {
  const clean = String(value || '/chrono_studio').trim().replace(/^\/+|\/+$/g, '')
  return `/${clean || 'chrono_studio'}`
}

function resolveBridgeUrl(value) {
  const raw = String(value || '').trim()
  if (/^wss?:\/\//i.test(raw)) return raw
  if (raw.startsWith('/')) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${window.location.host}${raw}`
  }
  throw new Error('The rosbridge endpoint must use ws://, wss://, or a same-origin /path.')
}

function topicMap(namespace) {
  const node = normalizeNamespace(namespace)
  const state = `${node}/output/vehicle/state`
  return {
    driver: `${node}/input/driver_inputs`,
    transmission: `${node}/input/transmission`,
    cameraCommand: `${node}/input/camera`,
    twist: `${state}/twist`,
    pose: `${state}/pose`,
    accel: `${state}/accel`,
    gps: `${node}/output/gps/data`,
    powertrain: `${node}/output/vehicle/powertrain`,
    clock: '/clock',
  }
}

function rosTimeSeconds(clock = {}) {
  const seconds = clock.sec ?? clock.secs ?? 0
  const nanoseconds = clock.nanosec ?? clock.nsecs ?? 0
  return seconds + nanoseconds * 1e-9
}

export function useRosbridge({ enabled, bridgeUrl, namespace }) {
  const socketRef = useRef(null)
  const advertisedRef = useRef(false)
  const topics = useMemo(() => topicMap(namespace), [namespace])
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [speed, setSpeed] = useState(null)
  const [yawRate, setYawRate] = useState(null)
  const [position, setPosition] = useState(null)
  const [heading, setHeading] = useState(null)
  const [accel, setAccel] = useState(null)
  const [gps, setGps] = useState(null)
  const [simTime, setSimTime] = useState(null)
  const [powertrain, setPowertrain] = useState(null)
  const [rates, setRates] = useState({})
  const [lastMessageAt, setLastMessageAt] = useState(null)

  useEffect(() => {
    if (!enabled) {
      setStatus('idle')
      setError(null)
      return undefined
    }

    let url
    try {
      url = resolveBridgeUrl(bridgeUrl)
    } catch (cause) {
      setStatus('error')
      setError(cause.message)
      return undefined
    }

    let cancelled = false
    let retryTimer = null
    let connectionTimer = null
    let attempt = 0
    const counts = new Map()

    const safeSend = (socket, message) => {
      if (socket?.readyState !== WebSocket.OPEN) return false
      try {
        socket.send(JSON.stringify(message))
        return true
      } catch {
        return false
      }
    }

    const connect = () => {
      if (cancelled) return
      setStatus(attempt === 0 ? 'connecting' : 'reconnecting')
      setError(null)
      advertisedRef.current = false

      let socket
      try {
        socket = new WebSocket(url)
      } catch (cause) {
        setStatus('error')
        setError(cause.message || 'Unable to create the rosbridge WebSocket.')
        return
      }
      socketRef.current = socket

      connectionTimer = window.setTimeout(() => {
        if (socket.readyState !== WebSocket.OPEN) {
          setError('rosbridge did not answer within 8 seconds.')
          try { socket.close() } catch {}
        }
      }, 8000)

      socket.onopen = () => {
        if (cancelled) return
        window.clearTimeout(connectionTimer)
        attempt = 0
        setStatus('connected')
        setError(null)

        safeSend(socket, { op: 'advertise', topic: topics.driver, type: DRIVER_TYPE })
        safeSend(socket, { op: 'advertise', topic: topics.transmission, type: INT8_TYPE })
        safeSend(socket, { op: 'advertise', topic: topics.cameraCommand, type: F32ARR_TYPE })
        advertisedRef.current = true

        const subscribe = (topic, type, throttleRate = 100) => safeSend(socket, {
          op: 'subscribe',
          id: `chrono-site:${topic}`,
          topic,
          type,
          throttle_rate: throttleRate,
          queue_length: 1,
        })

        subscribe(topics.twist, TWIST_TYPE)
        subscribe(topics.pose, POSE_TYPE)
        subscribe(topics.accel, ACCEL_TYPE)
        subscribe(topics.gps, NAVSAT_TYPE, 250)
        subscribe(topics.clock, CLOCK_TYPE, 200)
        subscribe(topics.powertrain, STRING_TYPE, 150)
      }

      socket.onmessage = (event) => {
        let message
        try { message = JSON.parse(event.data) } catch { return }

        if (message.op === 'status') {
          if (message.level === 'error') setError(message.msg || 'rosbridge reported an error.')
          return
        }
        if (message.op !== 'publish') return

        const { topic, msg = {} } = message
        counts.set(topic, (counts.get(topic) || 0) + 1)
        setLastMessageAt(Date.now())

        if (topic === topics.twist) {
          const linear = msg.twist?.linear || msg.linear || {}
          const angular = msg.twist?.angular || msg.angular || {}
          setSpeed(Math.hypot(linear.x || 0, linear.y || 0, linear.z || 0))
          setYawRate(angular.z || 0)
        } else if (topic === topics.pose) {
          const point = msg.pose?.position || msg.position || {}
          const quaternion = msg.pose?.orientation || msg.orientation || {}
          setPosition({ x: point.x || 0, y: point.y || 0, z: point.z || 0 })
          const { x = 0, y = 0, z = 0, w = 1 } = quaternion
          setHeading(Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z)))
        } else if (topic === topics.accel) {
          const linear = msg.accel?.linear || msg.linear || {}
          setAccel({ x: linear.x || 0, y: linear.y || 0, z: linear.z || 0 })
        } else if (topic === topics.gps) {
          setGps({ lat: msg.latitude, lon: msg.longitude, alt: msg.altitude })
        } else if (topic === topics.clock) {
          setSimTime(rosTimeSeconds(msg.clock))
        } else if (topic === topics.powertrain) {
          try { setPowertrain(JSON.parse(msg.data || 'null')) } catch {}
        }
      }

      socket.onclose = (event) => {
        window.clearTimeout(connectionTimer)
        advertisedRef.current = false
        if (socketRef.current === socket) socketRef.current = null
        if (cancelled) return

        attempt += 1
        const delay = Math.min(8000, 1200 * (2 ** Math.min(attempt - 1, 3)))
        setStatus('reconnecting')
        if (event.code !== 1000) {
          setError(`rosbridge disconnected${event.code ? ` (code ${event.code})` : ''}; retrying.`)
        }
        retryTimer = window.setTimeout(connect, delay)
      }

      socket.onerror = () => {
        setError('The rosbridge WebSocket could not be reached. Check the endpoint and bridge process.')
        try { socket.close() } catch {}
      }
    }

    setSpeed(null)
    setYawRate(null)
    setPosition(null)
    setHeading(null)
    setAccel(null)
    setGps(null)
    setSimTime(null)
    setPowertrain(null)
    setLastMessageAt(null)
    connect()

    const rateTimer = window.setInterval(() => {
      const next = {}
      for (const [topic, count] of counts) next[topic] = count
      counts.clear()
      setRates(next)
    }, 1000)

    return () => {
      cancelled = true
      window.clearTimeout(retryTimer)
      window.clearTimeout(connectionTimer)
      window.clearInterval(rateTimer)
      const socket = socketRef.current
      if (socket?.readyState === WebSocket.OPEN && advertisedRef.current) {
        safeSend(socket, {
          op: 'publish',
          topic: topics.driver,
          msg: {
            header: { stamp: { sec: 0, nanosec: 0 }, frame_id: '' },
            steering: 0,
            throttle: 0,
            braking: 1,
            clutch: 0,
          },
        })
      }
      try { socket?.close(1000, 'website disconnected') } catch {}
      if (socketRef.current === socket) socketRef.current = null
      advertisedRef.current = false
      setStatus('idle')
      setRates({})
    }
  }, [enabled, bridgeUrl, topics])

  const publish = useCallback((topic, msg) => {
    const socket = socketRef.current
    if (!advertisedRef.current || socket?.readyState !== WebSocket.OPEN) return false
    try {
      socket.send(JSON.stringify({ op: 'publish', topic, msg }))
      return true
    } catch {
      return false
    }
  }, [])

  const publishDriver = useCallback(({ throttle = 0, steering = 0, braking = 0 }) => publish(
    topics.driver,
    {
      header: { stamp: { sec: 0, nanosec: 0 }, frame_id: '' },
      steering,
      throttle,
      braking,
      clutch: 0,
    },
  ), [publish, topics.driver])

  const publishGear = useCallback((mode) => publish(topics.transmission, { data: mode }), [publish, topics.transmission])

  const publishCamera = useCallback((yaw, pitch) => publish(
    topics.cameraCommand,
    { layout: { dim: [], data_offset: 0 }, data: [yaw, pitch] },
  ), [publish, topics.cameraCommand])

  return {
    topics,
    status,
    error,
    connected: status === 'connected',
    speed,
    yawRate,
    position,
    heading,
    accel,
    gps,
    simTime,
    powertrain,
    rates,
    lastMessageAt,
    publishDriver,
    publishGear,
    publishCamera,
  }
}
