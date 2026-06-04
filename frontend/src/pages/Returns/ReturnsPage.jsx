import React from 'react'

export default function ReturnsPage() {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-64">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-700">Returns</h2>
        <p className="text-gray-400 text-sm mt-2">Coming in Phase 8</p>
      </div>
    </div>
  )
}
