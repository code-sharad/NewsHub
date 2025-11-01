'use client'

import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ResizablePanelProps {
  children: React.ReactNode
  onClose: () => void
  title?: string
  defaultWidth?: number // percentage (0-100)
  minWidth?: number
  maxWidth?: number
}

export function ResizablePanel({
  children,
  onClose,
  title = 'Panel',
  defaultWidth = 50,
  minWidth = 30,
  maxWidth = 70,
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !panelRef.current) return

      const containerWidth = window.innerWidth
      const newWidth = ((containerWidth - e.clientX) / containerWidth) * 100

      // Clamp between minWidth and maxWidth
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
      setWidth(clampedWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, minWidth, maxWidth])

  return (
    <div
      ref={panelRef}
      className="fixed top-0 right-0 h-full bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 shadow-2xl z-50 flex flex-col"
      style={{ width: `${width}%` }}
    >
      {/* Resize Handle */}
      <div
        className="absolute left-0 top-0 w-1.5 h-full cursor-col-resize hover:bg-black dark:hover:bg-white transition-colors z-10 group"
        onMouseDown={(e) => {
          e.preventDefault()
          setIsResizing(true)
        }}
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-20 bg-gray-300 dark:bg-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 bg-white dark:bg-gray-950">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-9 w-9 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="px-8 py-6">{children}</div>
      </ScrollArea>
    </div>
  )
}

