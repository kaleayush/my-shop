import React from 'react'

export default function CardDataStats({ title, value, icon, subtitle, trend, trendUp }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 truncate">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value ?? '—'}</p>
        {(subtitle || trend) && (
          <p className={`text-xs mt-1 ${trendUp ? 'text-green-600' : trend ? 'text-red-500' : 'text-gray-400'}`}>
            {trend ? (trendUp ? '↑' : '↓') + ' ' : ''}{subtitle ?? trend}
          </p>
        )}
      </div>
    </div>
  )
}
