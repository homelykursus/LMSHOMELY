'use client';

import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  message?: string
  subMessage?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ 
  message = 'Loading...', 
  subMessage = 'Data sedang dimuat',
  size = 'lg',
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12', 
    lg: 'h-12 w-12'
  }

  const titleSize = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}>
      <div className="text-center">
        <Loader2 className={`${sizeClasses[size]} animate-spin mx-auto mb-4 text-blue-600`} />
        <h2 className={`${titleSize[size]} font-bold text-gray-900`}>{message}</h2>
        {subMessage && (
          <p className="text-gray-600 mt-2">{subMessage}</p>
        )}
      </div>
    </div>
  )
}

export default LoadingSpinner