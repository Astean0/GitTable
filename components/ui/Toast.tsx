'use client'

import { cn } from '@/lib/utils'
import { useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
}

export default function Toast({ message, type = 'info', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const styles = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-black text-white',
  }

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50 px-6 py-3 rounded-full shadow-lg text-sm font-medium',
        styles[type]
      )}
    >
      {message}
    </div>
  )
}
