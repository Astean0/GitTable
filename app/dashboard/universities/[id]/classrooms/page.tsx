'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useClassrooms } from '@/hooks/useClassrooms'
import Sidebar from '@/app/dashboard/components/Sidebar'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Toast from '@/components/ui/Toast'
import ClassroomForm from '@/app/dashboard/components/ClassroomForm'
import type { Classroom } from '@/lib/types'
import type { ClassroomFormData } from '@/lib/validations'

export default function ClassroomsPage() {
  const params = useParams()
  const universityId = params.id as string
  const { classrooms, loading, error, createClassroom, updateClassroom, deleteClassroom } =
    useClassrooms(universityId)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Classroom | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const handleSubmit = async (data: ClassroomFormData) => {
    try {
      const equipment = data.equipment
        ? data.equipment.split(',').map((e) => e.trim()).filter(Boolean)
        : []
      const payload = { name: data.name, capacity: data.capacity, equipment }
      if (editing) {
        await updateClassroom(editing.id, payload)
        setToast({ message: 'Classroom updated', type: 'success' })
      } else {
        await createClassroom({ ...payload, university_id: universityId })
        setToast({ message: 'Classroom created', type: 'success' })
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
            <h1 className="text-3xl font-bold text-gray-900">Classrooms</h1>
            <p className="text-gray-500 mt-1">Rooms and equipment</p>
          </div>
          <Button onClick={() => { setEditing(null); setModalOpen(true) }}>+ Create Classroom</Button>
        </div>

        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">{error}</div>}

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-sm text-gray-500">
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Capacity</th>
                <th className="px-6 py-4 font-medium">Equipment</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {classrooms.map((room) => (
                <tr key={room.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{room.name}</td>
                  <td className="px-6 py-4 text-gray-500">{room.capacity}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {room.equipment?.join(', ') ?? '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => { setEditing(room); setModalOpen(true) }}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={async () => {
                        if (!confirm('Delete?')) return
                        try { await deleteClassroom(room.id); setToast({ message: 'Deleted', type: 'success' }) }
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
          title={editing ? 'Edit Classroom' : 'Create Classroom'}>
          <ClassroomForm universityId={universityId} initial={editing} onSubmit={handleSubmit}
            onCancel={() => { setModalOpen(false); setEditing(null) }} />
        </Modal>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  )
}
