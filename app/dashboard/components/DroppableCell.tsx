'use client'

import { useDroppable } from '@dnd-kit/core'
import type { DayOfWeek, Schedule, TimeSlot } from '@/lib/types'
import { cn } from '@/lib/utils'
import ScheduleBlock from './ScheduleBlock'

interface DroppableCellProps {
  day: DayOfWeek
  timeSlot: TimeSlot
  schedule: Schedule | null
  hasConflict?: boolean
  isHighlighted?: boolean
  onViewConflict?: () => void
  onDelete?: () => void
}

export default function DroppableCell({
  day,
  timeSlot,
  schedule,
  hasConflict,
  isHighlighted,
  onViewConflict,
  onDelete,
}: DroppableCellProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${day}-${timeSlot}`,
    data: { day, timeSlot },
  })

  return (
    <td
      ref={setNodeRef}
      className={cn(
        'border border-gray-100 p-1 min-h-[72px] h-[72px] align-top transition-colors',
        isOver && 'bg-blue-50'
      )}
    >
      {schedule ? (
        <ScheduleBlock
          schedule={schedule}
          hasConflict={hasConflict}
          isHighlighted={isHighlighted}
          onViewConflict={onViewConflict}
          onDelete={onDelete}
        />
      ) : (
        <div className="h-full w-full rounded-lg border border-dashed border-gray-100" />
      )}
    </td>
  )
}
