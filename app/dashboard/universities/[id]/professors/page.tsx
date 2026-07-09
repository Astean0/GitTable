'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useProfessors } from '@/hooks/useProfessors'
import Sidebar from '@/app/dashboard/components/Sidebar'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Toast from '@/components/ui/Toast'
import ProfessorForm from '@/app/dashboard/components/ProfessorForm'
import type { Professor } from '@/lib/types'
import type { ProfessorFormData } from '@/lib/validations'

export default function ProfessorsPage() {
  const params = useParams()
  const universityId = params.id as string
  const { professors, assignedHours, loading, error, createProfessor, updateProfessor, deleteProfessor } =
    useProfessors(universityId)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Professor | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const handleSubmit = async (data: ProfessorFormData) => {
    try {
      const payload = { name: data.name, email: data.email || undefined, max_hours: data.max_hours }
      if (editing) {
        await updateProfessor(editing.id, payload)
        setToast({ message: 'Professor updated', type: 'success' })
      } else {
        await createProfessor({ ...payload, university_id: universityId })
        setToast({ message: 'Professor created', type: 'success' })
      }
      setModalOpen(false)
      setEditing(null)
    } catch (err) {
      setToast({ message: (err as Error).message, type: 'error' })
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-65px)]">
      <Sidebar />
      <div className="flex-1 px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Professors</h1>
            <p className="text-gray-500 mt-1">Faculty members and assigned hours</p>
          </div>
          <Button onClick={() => { setEditing(null); setModalOpen(true) }}>+ Create Professor</Button>
        </div>

        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">{error}</div>}

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-sm text-gray-500">
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Hours</th>
                <th className="px-6 py-4 font-medium">Max</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {professors.map((prof) => (
                <tr key={prof.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{prof.name}</td>
                  <td className="px-6 py-4 text-gray-500">{prof.email ?? '—'}</td>
                  <td className="px-6 py-4">
                    <span className={assignedHours[prof.id] > prof.max_hours ? 'text-red-600 font-medium' : 'text-gray-900'}>
                      {assignedHours[prof.id] ?? 0}h
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{prof.max_hours}h</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => { setEditing(prof); setModalOpen(true) }}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={async () => {
                        if (!confirm('Delete?')) return
                        try { await deleteProfessor(prof.id); setToast({ message: 'Deleted', type: 'success' }) }
                        catch (err) { setToast({ message: (err as Error).message, type: 'error' }) }
                      }}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }}
          title={editing ? 'Edit Professor' : 'Create Professor'}>
          <ProfessorForm universityId={universityId} initial={editing} onSubmit={handleSubmit}
            onCancel={() => { setModalOpen(false); setEditing(null) }} />
        </Modal>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  )
}
