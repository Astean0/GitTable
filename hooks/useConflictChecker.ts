'use client'

import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { ConflictResult, DayOfWeek, Schedule } from '@/lib/types'
import { timesOverlap } from '@/lib/utils'

function normalizeTime(time: string): string {
  return time.slice(0, 5)
}

export function useConflictChecker() {
  const checkProfessorConflict = useCallback(
    async (
      professorId: string,
      day: DayOfWeek,
      startTime: string,
      endTime: string,
      excludeScheduleId?: string
    ): Promise<ConflictResult> => {
      const { data: courses } = await supabase
        .from('courses')
        .select('id, name')
        .eq('professor_id', professorId)

      const courseIds = courses?.map((c) => c.id) ?? []
      if (courseIds.length === 0) {
        return { hasConflict: false, message: '' }
      }

      const { data: schedules } = await supabase
        .from('schedules')
        .select('*, courses(name, career_id, careers(name), professors(name)), classrooms(name), semesters(name)')
        .in('course_id', courseIds)
        .eq('day', day)

      for (const schedule of (schedules as Schedule[]) ?? []) {
        if (excludeScheduleId && schedule.id === excludeScheduleId) continue

        if (
          timesOverlap(
            startTime,
            endTime,
            normalizeTime(schedule.start_time),
            normalizeTime(schedule.end_time)
          )
        ) {
          const professorName = schedule.courses?.professors?.name ?? 'Profesor'
          const courseName = schedule.courses?.name ?? 'Asignatura'
          const careerName = schedule.courses?.careers?.name ?? 'Carrera'
          const semName = schedule.semesters?.name ?? 'Semestre'
          return {
            hasConflict: true,
            message: `${professorName} ya tiene clase a esta hora: ${courseName} (${careerName} — ${semName})`,
            conflictingSchedule: schedule,
          }
        }
      }

      return { hasConflict: false, message: '' }
    },
    []
  )

  const checkClassroomConflict = useCallback(
    async (
      classroomId: string,
      day: DayOfWeek,
      startTime: string,
      endTime: string,
      excludeScheduleId?: string
    ): Promise<ConflictResult> => {
      const { data: schedules } = await supabase
        .from('schedules')
        .select('*, courses(name, career_id, careers(name)), classrooms(name), semesters(name)')
        .eq('classroom_id', classroomId)
        .eq('day', day)

      for (const schedule of (schedules as Schedule[]) ?? []) {
        if (excludeScheduleId && schedule.id === excludeScheduleId) continue

        if (
          timesOverlap(
            startTime,
            endTime,
            normalizeTime(schedule.start_time),
            normalizeTime(schedule.end_time)
          )
        ) {
          const roomName = schedule.classrooms?.name ?? 'Sala'
          const courseName = schedule.courses?.name ?? 'Asignatura'
          const careerName = schedule.courses?.careers?.name ?? 'Carrera'
          const semName = schedule.semesters?.name ?? 'Semestre'
          return {
            hasConflict: true,
            message: `${roomName} ya está ocupada por ${courseName} (${careerName} — ${semName})`,
            conflictingSchedule: schedule,
          }
        }
      }

      return { hasConflict: false, message: '' }
    },
    []
  )

  const checkStudentConflict = useCallback(
    async (
      careerId: string,
      day: DayOfWeek,
      startTime: string,
      endTime: string,
      excludeScheduleId?: string
    ): Promise<ConflictResult> => {
      const { data: courses } = await supabase
        .from('courses')
        .select('id, name')
        .eq('career_id', careerId)

      const courseIds = courses?.map((c) => c.id) ?? []
      if (courseIds.length === 0) {
        return { hasConflict: false, message: '' }
      }

      const { data: schedules } = await supabase
        .from('schedules')
        .select('*, courses(name, career_id, careers(name)), semesters(name)')
        .in('course_id', courseIds)
        .eq('day', day)

      for (const schedule of (schedules as Schedule[]) ?? []) {
        if (excludeScheduleId && schedule.id === excludeScheduleId) continue

        if (
          timesOverlap(
            startTime,
            endTime,
            normalizeTime(schedule.start_time),
            normalizeTime(schedule.end_time)
          )
        ) {
          const courseName = schedule.courses?.name ?? 'Asignatura'
          const careerName = schedule.courses?.careers?.name ?? 'Carrera'
          const semName = schedule.semesters?.name ?? 'Semestre'
          return {
            hasConflict: true,
            message: `Los estudiantes de ${careerName} ya tienen otro curso (${courseName}) en ${semName}`,
            conflictingSchedule: schedule,
          }
        }
      }

      return { hasConflict: false, message: '' }
    },
    []
  )

  const checkAllConflicts = useCallback(
    async (params: {
      professorId: string
      classroomId: string
      careerId: string
      day: DayOfWeek
      startTime: string
      endTime: string
      excludeScheduleId?: string
    }): Promise<ConflictResult> => {
      const checks = await Promise.all([
        checkProfessorConflict(
          params.professorId,
          params.day,
          params.startTime,
          params.endTime,
          params.excludeScheduleId
        ),
        checkClassroomConflict(
          params.classroomId,
          params.day,
          params.startTime,
          params.endTime,
          params.excludeScheduleId
        ),
        checkStudentConflict(
          params.careerId,
          params.day,
          params.startTime,
          params.endTime,
          params.excludeScheduleId
        ),
      ])

      const conflict = checks.find((c) => c.hasConflict)
      return conflict ?? { hasConflict: false, message: '' }
    },
    [checkProfessorConflict, checkClassroomConflict, checkStudentConflict]
  )

  return {
    checkProfessorConflict,
    checkClassroomConflict,
    checkStudentConflict,
    checkAllConflicts,
  }
}
