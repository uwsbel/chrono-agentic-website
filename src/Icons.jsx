import React from 'react'

const paths = {
  arrow: <><path d="M5 12h14"/><path d="m14 7 5 5-5 5"/></>,
  external: <><path d="M15 4h5v5"/><path d="m10 14 10-10"/><path d="M20 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5"/></>,
  github: <><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7A5.4 5.4 0 0 0 19.3 4 5 5 0 0 0 19.1.5S18 0 15 2a13.4 13.4 0 0 0-7 0C5 .1 3.9.5 3.9.5A5 5 0 0 0 3.7 4a5.4 5.4 0 0 0-1.5 3.7c0 5.4 3.5 6.6 6.8 7A4.8 4.8 0 0 0 8 18v4"/><path d="M8 19c-3 .9-3-1.5-4-2"/></>,
  paper: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></>,
  code: <><path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14"/></>,
  play: <path d="m8 5 11 7-11 7z"/>,
  pause: <><path d="M9 5v14M15 5v14"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  copy: <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
  close: <><path d="M18 6 6 18M6 6l12 12"/></>,
  expand: <><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></>,
  chart: <><path d="M3 3v18h18"/><path d="m7 16 4-5 4 3 5-8"/></>,
  terminal: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></>,
  layers: <><path d="m12 2 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></>,
  spark: <><path d="m12 3-1.4 3.7a3 3 0 0 1-1.7 1.7L5.2 9.8l3.7 1.4a3 3 0 0 1 1.7 1.7l1.4 3.7 1.4-3.7a3 3 0 0 1 1.7-1.7l3.7-1.4-3.7-1.4a3 3 0 0 1-1.7-1.7z"/><path d="m19 17-.6 1.5a2 2 0 0 1-1 1L16 20l1.5.6a2 2 0 0 1 1 1L19 23l.6-1.5a2 2 0 0 1 1-1L22 20l-1.5-.6a2 2 0 0 1-1-1z"/></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
  mouse: <><rect x="7" y="2" width="10" height="20" rx="5"/><path d="M12 6v4"/></>,
  database: <><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12"/><circle cx="12" cy="12" r="3"/></>,
  shield: <><path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3z"/><path d="m9 12 2 2 4-4"/></>,
  orbit: <><circle cx="12" cy="12" r="2"/><path d="M4.9 4.9c-3.1 3.1.1 11.4 5.5 16.8M19.1 4.9c3.1 3.1-.1 11.4-5.5 16.8M2.3 12c0 4.4 8.1 8 15.7 5.7M21.7 12c0-4.4-8.1-8-15.7-5.7"/></>,
}

export default function Icon({ name, size = 20, className = '', strokeWidth = 1.8 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}
