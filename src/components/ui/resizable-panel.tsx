'use client'

import { useState, useEffect, useRef } from 'react'
import { X, GripHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

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
  const [isMobile, setIsMobile] = useState(false)
  const [drawerHeight, setDrawerHeight] = useState(85) // percentage for mobile drawer
  const [isDraggingDrawer, setIsDraggingDrawer] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef<number>(0)
  const startHeightRef = useRef<number>(0)

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Desktop resize logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !panelRef.current || isMobile) return

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
  }, [isResizing, minWidth, maxWidth, isMobile])

  // Mobile drawer drag logic
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingDrawer || !isMobile) return
      
      const touch = e.touches[0]
      const deltaY = startYRef.current - touch.clientY
      const deltaPercent = (deltaY / window.innerHeight) * 100
      const newHeight = Math.max(30, Math.min(95, startHeightRef.current + deltaPercent))
      setDrawerHeight(newHeight)
    }

    const handleTouchEnd = () => {
      setIsDraggingDrawer(false)
      // Snap to full or partial based on position
      if (drawerHeight > 60) {
        setDrawerHeight(85)
      } else if (drawerHeight < 40) {
        setDrawerHeight(50)
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingDrawer || !isMobile) return
      
      const deltaY = startYRef.current - e.clientY
      const deltaPercent = (deltaY / window.innerHeight) * 100
      const newHeight = Math.max(30, Math.min(95, startHeightRef.current + deltaPercent))
      setDrawerHeight(newHeight)
    }

    const handleMouseUp = () => {
      setIsDraggingDrawer(false)
      if (drawerHeight > 60) {
        setDrawerHeight(85)
      } else if (drawerHeight < 40) {
        setDrawerHeight(50)
      }
    }

    if (isDraggingDrawer) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
    }
  }, [isDraggingDrawer, isMobile, drawerHeight])

  const handleDrawerDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDraggingDrawer(true)
    startHeightRef.current = drawerHeight
    if ('touches' in e) {
      startYRef.current = e.touches[0].clientY
    } else {
      startYRef.current = e.clientY
    }
  }

  // Mobile drawer view
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/60 z-40 animate-in fade-in duration-200"
          onClick={onClose}
        />
        
        {/* Drawer */}
        <div
          ref={panelRef}
          className={cn(
            "fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 rounded-t-3xl shadow-2xl z-50 flex flex-col",
            "animate-in slide-in-from-bottom duration-300"
          )}
          style={{ height: `${drawerHeight}%` }}
        >
          {/* Drag Handle */}
          <div
            className="flex justify-center py-3 cursor-grab active:cursor-grabbing touch-none"
            onTouchStart={handleDrawerDragStart}
            onMouseDown={handleDrawerDragStart}
          >
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
            <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
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
            <div className="px-5 py-4 pb-safe">{children}</div>
          </ScrollArea>
        </div>
      </>
    )
  }

  // Desktop side panel view
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

