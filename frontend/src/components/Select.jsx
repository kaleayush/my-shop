import React from 'react'

const Select = React.forwardRef(function Select({ className = '', error, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={`
        w-full rounded-lg border px-3 py-2 text-sm text-gray-900 bg-white
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        disabled:bg-gray-50 disabled:text-gray-500
        ${error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'}
        ${className}
      `}
      {...props}
    >
      {children}
    </select>
  )
})

export default Select
