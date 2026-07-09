'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Toast from '@/components/ui/Toast'
import { useSemesters } from '@/hooks/useSemesters'
import type { Semester } from '@/lib/types'

interface SemesterManagerProps {
  careerId: string
  onClose: () => void
}

export default function SemesterManager({ careerId, onClose }: SemesterManagerProps) {
  const { semesters, loading, error, createSemester, updateSemester, deleteSemester } = useSemesters(careerId)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Semester | null>(null)
  const [name, setName] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const openCreate = () => { setEditing(null); setName(''); setModalOpen(true) }
  const openEdit = (s: Semester) => { setEditing(s); setName(s.name); setModalOpen(true) }

  const handleSubmit = async () => {
    try {
      if (!name.trim()) {
        setToast({ message: 'Name is required', type: 'error' })
        return
      }
      if (editing) {
        await updateSemester(editing.id, { name })
        setToast({ message: 'Semester updated', type: 'success' })
      } else {
        await createSemester({ career_id: careerId, name })
        setToast({ message: 'Semester created', type: 'success' })
      }
      setModalOpen(false)
    } catch (err) {
      setToast({ message: (err as Error).message, type: 'error' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar semestre? Esto eliminará también horarios asociados.')) return
    try {
      await deleteSemester(id)
      setToast({ message: 'Semester deleted', type: 'success' })
    } catch (err) {
      setToast({ message: (err as Error).message, type: 'error' })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Semestres</h3>
        <div>
          <Button size="sm" onClick={openCreate}>+ Nuevo Semestre</Button>
          <Button size="sm" variant="secondary" onClick={onClose} className="ml-2">Cerrar</Button>
        </div>
      </div>

      {loading && <p className="text-gray-500">Cargando...</p>}
      {error && <div className="text-red-600">{error}</div>}

      <div className="space-y-2">
        {semesters.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-2 rounded-md border border-gray-100">
            <div>{s.name}</div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => openEdit(s)}>Edit</Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(s.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Semester' : 'Create Semester'}>
        <div className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="flex gap-2">
            <Button onClick={handleSubmit}>{editing ? 'Update' : 'Create'}</Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
