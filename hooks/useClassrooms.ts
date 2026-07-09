'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Classroom } from '@/lib/types'

export function useClassrooms(universityId?: string) {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClassrooms = useCallback(async () => {
    if (!universityId) {
      setClassrooms([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('classrooms')
      .select('*')
      .eq('university_id', universityId)
      .order('name')

    if (err) {
      setError(err.message)
    } else {
      setClassrooms(data ?? [])
    }
    setLoading(false)
  }, [universityId])

  useEffect(() => {
    fetchClassrooms()
  }, [fetchClassrooms])

  const createClassroom = async (payload: {
    name: string
    capacity: number
    equipment?: string[]
    university_id: string
  }) => {
    const { data, error: err } = await supabase
      .from('classrooms')
      .insert(payload)
      .select()
      .single()

    if (err) throw new Error(err.message)
    setClassrooms((prev) => [...prev, data as Classroom])
    return data as Classroom
  }

  const updateClassroom = async (
    id: string,
    payload: { name: string; capacity: number; equipment?: string[] }
  ) => {
    const { data, error: err } = await supabase
      .from('classrooms')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (err) throw new Error(err.message)
    setClassrooms((prev) => prev.map((c) => (c.id === id ? (data as Classroom) : c)))
    return data as Classroom
  }

  const deleteClassroom = async (id: string) => {
    const { error: err } = await supabase.from('classrooms').delete().eq('id', id)
    if (err) throw new Error(err.message)
    setClassrooms((prev) => prev.filter((c) => c.id !== id))
  }

  return {
    classrooms,
    loading,
    error,
    fetchClassrooms,
    createClassroom,
    updateClassroom,
    deleteClassroom,
  }
}
