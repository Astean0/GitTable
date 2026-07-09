'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Professor } from '@/lib/types'

export function useProfessors(universityId?: string) {
  const [professors, setProfessors] = useState<Professor[]>([])
  const [assignedHours, setAssignedHours] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfessors = useCallback(async () => {
    if (!universityId) {
      setProfessors([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('professors')
      .select('*')
      .eq('university_id', universityId)
      .order('name')

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setProfessors(data ?? [])

    const { data: courses } = await supabase
      .from('courses')
      .select('professor_id, hours_per_week, careers!inner(university_id)')
      .eq('careers.university_id', universityId)

    const hours: Record<string, number> = {}
    courses?.forEach((c) => {
      hours[c.professor_id] = (hours[c.professor_id] ?? 0) + c.hours_per_week
    })
    setAssignedHours(hours)
    setLoading(false)
  }, [universityId])

  useEffect(() => {
    fetchProfessors()
  }, [fetchProfessors])

  const createProfessor = async (payload: {
    name: string
    email?: string
    max_hours?: number
    university_id: string
  }) => {
    const { data, error: err } = await supabase
      .from('professors')
      .insert(payload)
      .select()
      .single()

    if (err) throw new Error(err.message)
    setProfessors((prev) => [...prev, data as Professor])
    return data as Professor
  }

  const updateProfessor = async (
    id: string,
    payload: { name: string; email?: string; max_hours?: number }
  ) => {
    const { data, error: err } = await supabase
      .from('professors')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (err) throw new Error(err.message)
    setProfessors((prev) => prev.map((p) => (p.id === id ? (data as Professor) : p)))
    return data as Professor
  }

  const deleteProfessor = async (id: string) => {
    const { error: err } = await supabase.from('professors').delete().eq('id', id)
    if (err) throw new Error(err.message)
    setProfessors((prev) => prev.filter((p) => p.id !== id))
  }

  return {
    professors,
    assignedHours,
    loading,
    error,
    fetchProfessors,
    createProfessor,
    updateProfessor,
    deleteProfessor,
  }
}
