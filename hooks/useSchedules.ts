'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { DayOfWeek, Schedule } from '@/lib/types'

const SCHEDULE_SELECT = `
  *,
  courses (
    *,
    professors (*)
  ),
  classrooms (*),
  semesters (*)
`

export function useSchedules(careerId?: string, semesterId?: string) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSchedules = useCallback(async () => {
    if (!careerId) {
      setSchedules([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    // If a semesterId is provided, fetch schedules directly for that semester
    if (semesterId) {
      const { data, error: err } = await supabase
        .from('schedules')
        .select(SCHEDULE_SELECT)
        .eq('semester_id', semesterId)
        .order('day')
        .order('start_time')

      if (err) {
        setError(err.message)
      } else {
        setSchedules((data as Schedule[]) ?? [])
      }

      setLoading(false)
      return
    }

    // Fallback: fetch schedules by career's courses
    const { data: courseIds, error: courseErr } = await supabase
      .from('courses')
      .select('id')
      .eq('career_id', careerId)

    if (courseErr) {
      setError(courseErr.message)
      setLoading(false)
      return
    }

    const ids = courseIds?.map((c) => c.id) ?? []
    if (ids.length === 0) {
      setSchedules([])
      setLoading(false)
      return
    }

    const { data, error: err } = await supabase
      .from('schedules')
      .select(SCHEDULE_SELECT)
      .in('course_id', ids)
      .order('day')
      .order('start_time')

    if (err) {
      setError(err.message)
    } else {
      setSchedules((data as Schedule[]) ?? [])
    }
    setLoading(false)
  }, [careerId, semesterId])

  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules])

  useEffect(() => {
    if (!careerId) return

    const channel = supabase
      .channel(`schedules-${careerId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'schedules' },
        () => {
          fetchSchedules()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [careerId, fetchSchedules])

  const createSchedule = async (payload: {
    course_id: string
    semester_id: string
    classroom_id: string
    day: DayOfWeek
    start_time: string
    end_time: string
  }) => {
    const { data, error: err } = await supabase
      .from('schedules')
      .insert(payload)
      .select(SCHEDULE_SELECT)
      .single()

    if (err) throw new Error(err.message)
    setSchedules((prev) => [...prev, data as Schedule])
    return data as Schedule
  }

  const updateSchedule = async (
    id: string,
    payload: {
      day?: DayOfWeek
      start_time?: string
      end_time?: string
      classroom_id?: string
      semester_id?: string
    }
  ) => {
    const { data, error: err } = await supabase
      .from('schedules')
      .update(payload)
      .eq('id', id)
      .select(SCHEDULE_SELECT)
      .single()

    if (err) throw new Error(err.message)
    setSchedules((prev) => prev.map((s) => (s.id === id ? (data as Schedule) : s)))
    return data as Schedule
  }

  const deleteSchedule = async (id: string) => {
    const { error: err } = await supabase.from('schedules').delete().eq('id', id)
    if (err) throw new Error(err.message)
    setSchedules((prev) => prev.filter((s) => s.id !== id))
  }

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  }
}
