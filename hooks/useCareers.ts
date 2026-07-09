'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Career } from '@/lib/types'

export function useCareers(universityId?: string) {
  const [careers, setCareers] = useState<Career[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCareers = useCallback(async () => {
    if (!universityId) {
      setCareers([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('careers')
      .select('*')
      .eq('university_id', universityId)
      .order('name')

    if (err) {
      setError(err.message)
    } else {
      setCareers(data ?? [])
    }
    setLoading(false)
  }, [universityId])

  useEffect(() => {
    fetchCareers()
  }, [fetchCareers])

  const createCareer = async (payload: {
    name: string
    university_id: string
  }) => {
    const { data, error: err } = await supabase
      .from('careers')
      .insert(payload)
      .select()
      .single()

    if (err) throw new Error(err.message)
    setCareers((prev) => [...prev, data as Career])
    return data as Career
  }

  const updateCareer = async (
    id: string,
    payload: { name: string }
  ) => {
    const { data, error: err } = await supabase
      .from('careers')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (err) throw new Error(err.message)
    setCareers((prev) => prev.map((c) => (c.id === id ? (data as Career) : c)))
    return data as Career
  }

  const deleteCareer = async (id: string) => {
    const { error: err } = await supabase.from('careers').delete().eq('id', id)
    if (err) throw new Error(err.message)
    setCareers((prev) => prev.filter((c) => c.id !== id))
  }

  return {
    careers,
    loading,
    error,
    fetchCareers,
    createCareer,
    updateCareer,
    deleteCareer,
  }
}
