'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useSchedules } from '@/hooks/useSchedules'
import { useSemesters } from '@/hooks/useSemesters'
import { useConflictChecker } from '@/hooks/useConflictChecker'
import { useCourses } from '@/hooks/useCourses'
import { useClassrooms } from '@/hooks/useClassrooms'
import { DAYS, TIME_SLOTS, type DayOfWeek, type Schedule, type TimeSlot } from '@/lib/types'
import { getEndTimeForSlot } from '@/lib/utils'
import DroppableCell from './DroppableCell'
import ScheduleBlock from './ScheduleBlock'
import ConflictSidebar from './ConflictSidebar'
import Toast from '@/components/ui/Toast'
import Button from '@/components/ui/Button'

interface ScheduleBuilderProps {
  careerId: string
}

function normalizeTime(time: string): string {
  return time.slice(0, 5)
}

export default function ScheduleBuilder({ careerId }: ScheduleBuilderProps) {
  const params = useParams()
  const universityId = params.id as string
  const { semesters } = useSemesters(careerId)

  const searchParams = useSearchParams()
  const urlSemesterId = searchParams?.get('semesterId') ?? ''

  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(urlSemesterId || '')

  useEffect(() => {
    // prefer URL param if provided, otherwise default to first semester
    if (urlSemesterId) {
      setSelectedSemesterId(urlSemesterId)
      return
    }
    if (semesters.length > 0 && !selectedSemesterId) setSelectedSemesterId(semesters[0].id)
  }, [semesters, selectedSemesterId, urlSemesterId])

  const { schedules, loading, error, updateSchedule, createSchedule, deleteSchedule } = useSchedules(careerId, selectedSemesterId)
  const { courses, loading: loadingCourses, error: coursesError } = useCourses(careerId)
  const { classrooms, loading: loadingRooms, error: roomsError } = useClassrooms(universityId)
  const { checkAllConflicts } = useConflictChecker()

  const [activeSchedule, setActiveSchedule] = useState<Schedule | null>(null)
  const [conflictMap, setConflictMap] = useState<Record<string, string>>({})
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('')
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('monday')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot>(TIME_SLOTS[0])
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id)
    }
  }, [courses, selectedCourseId])

  useEffect(() => {
    if (classrooms.length > 0 && !selectedClassroomId) {
      setSelectedClassroomId(classrooms[0].id)
    }
  }, [classrooms, selectedClassroomId])

  useEffect(() => {
    if (selectedSemesterId) {
      // reset selection when semester changes
      setSelectedCourseId('')
    }
  }, [selectedSemesterId])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const scheduleGrid = useMemo(() => {
    const grid: Record<string, Schedule> = {}
    schedules.forEach((s) => {
      const start = normalizeTime(s.start_time)
      const key = `${s.day}-${start}`
      grid[key] = s
    })
    return grid
  }, [schedules])

  const conflictList = useMemo(
    () =>
      Object.entries(conflictMap).map(([scheduleId, message]) => ({
        scheduleId,
        message,
        schedule: schedules.find((s) => s.id === scheduleId),
      })),
    [conflictMap, schedules]
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveSchedule(null)
      const { active, over } = event
      if (!over) return

      const schedule = active.data.current?.schedule as Schedule | undefined
      const dropData = over.data.current as { day: DayOfWeek; timeSlot: TimeSlot } | undefined
      if (!schedule || !dropData) return

      const { day, timeSlot } = dropData
      const startTime = timeSlot
      const endTime = getEndTimeForSlot(timeSlot)

      const professorId = schedule.courses?.professor_id
      if (!professorId) return

      const result = await checkAllConflicts({
        professorId,
        classroomId: schedule.classroom_id,
        careerId,
        day,
        startTime,
        endTime,
        excludeScheduleId: schedule.id,
      })

      if (result.hasConflict) {
        setConflictMap((prev) => ({ ...prev, [schedule.id]: result.message }))
        setToast({ message: result.message, type: 'error' })
        return
      }

      try {
        await updateSchedule(schedule.id, {
          day,
          start_time: startTime,
          end_time: endTime,
        })
        setConflictMap((prev) => {
          const next = { ...prev }
          delete next[schedule.id]
          return next
        })
        setToast({ message: 'Horario actualizado', type: 'success' })
      } catch (err) {
        setToast({ message: (err as Error).message, type: 'error' })
      }
    },
    [careerId, checkAllConflicts, updateSchedule]
  )

  const handleCreateBlock = useCallback(async () => {
    if (!selectedCourseId || !selectedClassroomId) {
      setToast({ message: 'Selecciona curso y sala', type: 'error' })
      return
    }

    const course = courses.find((c) => c.id === selectedCourseId)
    if (!course) {
      setToast({ message: 'Curso no encontrado', type: 'error' })
      return
    }

    const startTime = selectedTimeSlot
    const endTime = getEndTimeForSlot(selectedTimeSlot)

    try {
      setCreating(true)
      const result = await checkAllConflicts({
        professorId: course.professor_id,
        classroomId: selectedClassroomId,
        careerId,
        day: selectedDay,
        startTime,
        endTime,
      })

      if (result.hasConflict) {
        setToast({ message: result.message, type: 'error' })
        return
      }

      await createSchedule({
        course_id: selectedCourseId,
        semester_id: selectedSemesterId,
        classroom_id: selectedClassroomId,
        day: selectedDay,
        start_time: startTime,
        end_time: endTime,
      })

      setToast({ message: 'Bloque creado', type: 'success' })
    } catch (err) {
      setToast({ message: (err as Error).message, type: 'error' })
    } finally {
      setCreating(false)
    }
  }, [careerId, checkAllConflicts, createSchedule, courses, selectedClassroomId, selectedCourseId, selectedDay, selectedSemesterId, selectedTimeSlot])

  const handleDeleteBlock = useCallback(
    async (scheduleId: string) => {
      try {
        await deleteSchedule(scheduleId)
        setToast({ message: 'Bloque eliminado', type: 'success' })
        setConflictMap((prev) => {
          const next = { ...prev }
          delete next[scheduleId]
          return next
        })
      } catch (err) {
        setToast({ message: (err as Error).message, type: 'error' })
      }
    },
    [deleteSchedule]
  )

  if (loading || loadingCourses || loadingRooms) return <p className="text-gray-500">Loading schedule...</p>
  if (error || coursesError || roomsError) {
    return <div className="text-red-600">{error || coursesError || roomsError}</div>
  }

  return (
    <div className="flex gap-6">
      <div className="flex-1 overflow-x-auto">
        <DndContext
          sensors={sensors}
          onDragStart={(e) => {
            const schedule = e.active.data.current?.schedule as Schedule
            setActiveSchedule(schedule ?? null)
          }}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveSchedule(null)}
        >
          <table className="w-full border-collapse bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <thead>
              <tr>
                <th className="border border-gray-100 px-3 py-2 text-xs text-gray-500 w-28">
                  Hora
                </th>
                {DAYS.map((d) => (
                  <th
                    key={d.key}
                    className="border border-gray-100 px-3 py-2 text-sm font-medium text-gray-700"
                  >
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((slot) => (
                <tr key={slot}>
                  <td className="border border-gray-100 px-3 py-2 text-xs text-gray-500 font-medium">
                    {slot} - {getEndTimeForSlot(slot)}
                  </td>
                  {DAYS.map((d) => {
                    const key = `${d.key}-${slot}`
                    const schedule = scheduleGrid[key] ?? null
                    return (
                      <DroppableCell
                        key={key}
                        day={d.key}
                        timeSlot={slot}
                        schedule={schedule}
                        hasConflict={schedule ? !!conflictMap[schedule.id] : false}
                        isHighlighted={schedule?.id === highlightedId}
                        onViewConflict={() => schedule && setHighlightedId(schedule.id)}
                        onDelete={schedule ? () => handleDeleteBlock(schedule.id) : undefined}
                      />
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <DragOverlay>
            {activeSchedule && (
              <ScheduleBlock schedule={activeSchedule} hasConflict={false} />
            )}
          </DragOverlay>
        </DndContext>
      </div>

      <div className="w-80 flex flex-col gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Crear bloque</h2>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Semestre</label>
            <select
              value={selectedSemesterId}
              onChange={(e) => setSelectedSemesterId(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">-- Seleccionar semestre --</option>
              {semesters.map((sem) => (
                <option key={sem.id} value={sem.id}>{sem.name}</option>
              ))}
            </select>

            <label className="block text-sm font-medium text-gray-700">Curso</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.hours_per_week}h)
                </option>
              ))}
            </select>

            <label className="block text-sm font-medium text-gray-700">Sala</label>
            <select
              value={selectedClassroomId}
              onChange={(e) => setSelectedClassroomId(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              {classrooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Día</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {DAYS.map((day) => (
                    <option key={day.key} value={day.key}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Horario</label>
                <select
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value as TimeSlot)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot} - {getEndTimeForSlot(slot)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button type="button" onClick={handleCreateBlock} disabled={creating || !selectedSemesterId || courses.length === 0 || classrooms.length === 0}>
              {creating ? 'Creando...' : 'Crear bloque'}
            </Button>
          </div>
        </div>

        <ConflictSidebar
          conflicts={conflictList}
          highlightedId={highlightedId}
          onHighlight={setHighlightedId}
        />
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
