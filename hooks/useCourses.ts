'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Course } from '@/lib/types'

export function useCourses(careerId?: string) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCourses = useCallback(async () => {
    if (!careerId) {
      setCourses([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('courses')
      .select('*, professors(*)')
      .eq('career_id', careerId)
      .order('name')

    if (err) {
      setError(err.message)
    } else {
      setCourses(data ?? [])
    }
    setLoading(false)
  }, [careerId])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const createCourse = async (payload: {
    name: string
    hours_per_week: number
    students_count?: number
    career_id: string
    professor_id: string
  }) => {
    const { data, error: err } = await supabase
      .from('courses')
      .insert(payload)
      .select('*, professors(*)')
      .single()

    if (err) throw new Error(err.message)
    setCourses((prev) => [...prev, data as Course])
    return data as Course
  }

  const updateCourse = async (
    id: string,
    payload: {
      name: string
      hours_per_week: number
      students_count?: number
      professor_id: string
    }
  ) => {
    const { data, error: err } = await supabase
      .from('courses')
      .update(payload)
      .eq('id', id)
      .select('*, professors(*)')
      .single()

    if (err) throw new Error(err.message)
    setCourses((prev) => prev.map((c) => (c.id === id ? (data as Course) : c)))
    return data as Course
  }

  const deleteCourse = async (id: string) => {
    const { error: err } = await supabase.from('courses').delete().eq('id', id)
    if (err) throw new Error(err.message)
    setCourses((prev) => prev.filter((c) => c.id !== id))
  }

  return {
    courses,
    loading,
    error,
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
  }
}
