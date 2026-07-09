'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Semester } from '@/lib/types'

export function useSemesters(careerId?: string) {
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!careerId) {
      setSemesters([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error: err } = await supabase
      .from('semesters')
      .select('*')
      .eq('career_id', careerId)
      .order('name')

    if (err) setError(err.message)
    else setSemesters((data as Semester[]) ?? [])
    setLoading(false)
  }, [careerId])

  useEffect(() => {
    fetch()
  }, [fetch])

  const createSemester = async (payload: { career_id: string; name: string }) => {
    const { data, error: err } = await supabase
      .from('semesters')
      .insert(payload)
      .select('*')
      .single()
    if (err) throw new Error(err.message)
    setSemesters((prev) => [...prev, data as Semester])
    return data as Semester
  }

  const updateSemester = async (id: string, payload: { name: string }) => {
    const { data, error: err } = await supabase
      .from('semesters')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single()
    if (err) throw new Error(err.message)
    setSemesters((prev) => prev.map((s) => (s.id === id ? (data as Semester) : s)))
    return data as Semester
  }

  const deleteSemester = async (id: string) => {
    const { error: err } = await supabase.from('semesters').delete().eq('id', id)
    if (err) throw new Error(err.message)
    setSemesters((prev) => prev.filter((s) => s.id !== id))
  }

  return { semesters, loading, error, fetch, createSemester, updateSemester, deleteSemester }
}
