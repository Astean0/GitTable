'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Schedule } from '@/lib/types'
import { cn, hashColor } from '@/lib/utils'

interface ScheduleBlockProps {
  schedule: Schedule
  hasConflict?: boolean
  isHighlighted?: boolean
  onViewConflict?: () => void
  onDelete?: () => void
}

export default function ScheduleBlock({
  schedule,
  hasConflict,
  isHighlighted,
  onViewConflict,
  onDelete,
}: ScheduleBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: schedule.id,
    data: { schedule },
  })

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  const colorClass = hasConflict
    ? 'bg-red-100 border-red-500 text-red-900'
    : hashColor(schedule.course_id)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'relative p-2 rounded-lg border text-xs cursor-grab active:cursor-grabbing transition-all',
        colorClass,
        isDragging && 'opacity-50 shadow-lg z-10',
        isHighlighted && 'ring-2 ring-red-500 ring-offset-1'
      )}
    >
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="absolute right-1 top-1 h-6 w-6 rounded-full bg-white/80 text-[10px] font-bold text-red-700 shadow-sm"
        >
          ×
        </button>
      )}
      <div className="font-semibold truncate">{schedule.courses?.name}</div>
      <div className="truncate opacity-80">{schedule.courses?.professors?.name}</div>
      <div className="truncate opacity-70">{schedule.classrooms?.name}</div>
      {hasConflict && onViewConflict && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onViewConflict()
          }}
          className="mt-1 text-[10px] underline text-red-700"
        >
          Ver conflicto
        </button>
      )}
    </div>
  )
}
