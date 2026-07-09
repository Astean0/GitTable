'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { University } from '@/lib/types'

export function useUniversities() {
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUniversities = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('universities')
      .select('*')
      .order('created_at', { ascending: false })

    if (err) {
      setError(err.message)
    } else {
      setUniversities(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchUniversities()
  }, [fetchUniversities])

  const createUniversity = async (payload: { name: string; region?: string }) => {
    const { data, error: err } = await supabase
      .from('universities')
      .insert(payload)
      .select()
      .single()

    if (err) throw new Error(err.message)
    setUniversities((prev) => [data, ...prev])
    return data as University
  }

  const updateUniversity = async (id: string, payload: { name: string; region?: string }) => {
    const { data, error: err } = await supabase
      .from('universities')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (err) throw new Error(err.message)
    setUniversities((prev) => prev.map((u) => (u.id === id ? (data as University) : u)))
    return data as University
  }

  const deleteUniversity = async (id: string) => {
    const { error: err } = await supabase.from('universities').delete().eq('id', id)
    if (err) throw new Error(err.message)
    setUniversities((prev) => prev.filter((u) => u.id !== id))
  }

  return {
    universities,
    loading,
    error,
    fetchUniversities,
    createUniversity,
    updateUniversity,
    deleteUniversity,
  }
}
