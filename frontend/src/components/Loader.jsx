import React from 'react'

export default function Loader({ fullscreen = true }) {
  const inner = (
    <div className="flex flex-col items-center gap-3">
      <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span className="text-sm text-gray-500">Loading…</span>
    </div>
  )

  if (!fullscreen) return inner

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      {inner}
    </div>
  )
}
