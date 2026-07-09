'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useUniversities } from '@/hooks/useUniversities'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Toast from '@/components/ui/Toast'
import UniversityForm from '@/app/dashboard/components/UniversityForm'
import type { University } from '@/lib/types'
import type { UniversityFormData } from '@/lib/validations'

export default function UniversitiesPage() {
  const { universities, loading, error, createUniversity, updateUniversity, deleteUniversity } =
    useUniversities()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<University | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const handleSubmit = async (data: UniversityFormData) => {
    try {
      if (editing) {
        await updateUniversity(editing.id, data)
        setToast({ message: 'University updated', type: 'success' })
      } else {
        await createUniversity(data)
        setToast({ message: 'University created', type: 'success' })
      }
      setModalOpen(false)
      setEditing(null)
    } catch (err) {
      setToast({ message: (err as Error).message, type: 'error' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this university?')) return
    try {
      await deleteUniversity(id)
      setToast({ message: 'University deleted', type: 'success' })
    } catch (err) {
      setToast({ message: (err as Error).message, type: 'error' })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Universities</h1>
          <p className="text-gray-500 mt-1">Manage all registered universities</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
        >
          + Create University
        </Button>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
          {error}. Make sure Supabase credentials are configured in .env.local
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 text-left text-sm text-gray-500">
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Region</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {universities.map((uni) => (
              <tr key={uni.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link
                    href={`/dashboard/universities/${uni.id}`}
                    className="font-medium text-gray-900 hover:underline"
                  >
                    {uni.name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-gray-500">{uni.region ?? '—'}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditing(uni)
                        setModalOpen(true)
                      }}
                    >
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(uni.id)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && universities.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                  No universities yet. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
        title={editing ? 'Edit University' : 'Create University'}
      >
        <UniversityForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false)
            setEditing(null)
          }}
        />
      </Modal>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
