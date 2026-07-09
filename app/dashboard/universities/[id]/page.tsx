'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function UniversityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  useEffect(() => {
    if (id) {
      router.replace(`/dashboard/universities/${id}/careers`)
    }
  }, [id, router])

  return (
    <div className="min-h-[calc(100vh-65px)] px-6 py-12">
      <p className="text-gray-500">Redirecting to Careers...</p>
    </div>
  )
}
