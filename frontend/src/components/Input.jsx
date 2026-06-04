import React from 'react'

const Input = React.forwardRef(function Input({ className = '', error, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`
        w-full rounded-lg border px-3 py-2 text-sm text-gray-900
        placeholder:text-gray-400
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        disabled:bg-gray-50 disabled:text-gray-500
        ${error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'}
        ${className}
      `}
      {...props}
    />
  )
})

export default Input
