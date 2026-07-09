'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useSemesters } from '@/hooks/useSemesters'
import { useCareers } from '@/hooks/useCareers'
import Sidebar from '@/app/dashboard/components/Sidebar'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Toast from '@/components/ui/Toast'
import CareerForm from '@/app/dashboard/components/CareerForm'
import SemesterManager from '@/app/dashboard/components/SemesterManager'
import type { Career } from '@/lib/types'
import type { CareerFormData } from '@/lib/validations'

export default function CareersPage() {
  const params = useParams()
  const universityId = params.id as string
  const { careers, loading, error, createCareer, updateCareer, deleteCareer } =
    useCareers(universityId)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Career | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [semModalOpen, setSemModalOpen] = useState(false)
  const [semCareer, setSemCareer] = useState<Career | null>(null)

  const handleSubmit = async (data: CareerFormData) => {
    try {
      if (editing) {
        await updateCareer(editing.id, { name: data.name, semester: data.semester })
        setToast({ message: 'Career updated', type: 'success' })
      } else {
        await createCareer(data)
        setToast({ message: 'Career created', type: 'success' })
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
            <h1 className="text-3xl font-bold text-gray-900">Careers</h1>
            <p className="text-gray-500 mt-1">Academic programs for this university</p>
          </div>
          <Button onClick={() => { setEditing(null); setModalOpen(true) }}>
            + Create Career
          </Button>
        </div>

        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">{error}</div>}

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-sm text-gray-500">
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Semester</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {careers.map((career) => (
                <tr key={career.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/universities/${universityId}/careers/${career.id}/schedules`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {career.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{/* Semesters managed per career */}
                    <div className="flex gap-2 items-center">
                      <Button size="sm" variant="secondary" onClick={() => { setSemCareer(career); setSemModalOpen(true) }}>Semestres</Button>
                      <SemesterLinks careerId={career.id} universityId={universityId} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link href={`/dashboard/universities/${universityId}/careers/${career.id}/courses`}>
                        <Button size="sm" variant="ghost">Courses</Button>
                      </Link>
                      <Button size="sm" variant="secondary" onClick={() => { setEditing(career); setModalOpen(true) }}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={async () => {
                        if (!confirm('Delete?')) return
                        try {
                          await deleteCareer(career.id)
                          setToast({ message: 'Deleted', type: 'success' })
                        } catch (err) {
                          setToast({ message: (err as Error).message, type: 'error' })
                        }
                      }}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }}
          title={editing ? 'Edit Career' : 'Create Career'}>
          <CareerForm universityId={universityId} initial={editing} onSubmit={handleSubmit}
            onCancel={() => { setModalOpen(false); setEditing(null) }} />
        </Modal>
        <Modal open={semModalOpen} onClose={() => { setSemModalOpen(false); setSemCareer(null) }} title={semCareer ? `Semestres - ${semCareer.name}` : 'Semestres'}>
          {semCareer && <SemesterManager careerId={semCareer.id} onClose={() => { setSemModalOpen(false); setSemCareer(null) }} />}
        </Modal>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  )
}

function SemesterLinks({ careerId, universityId }: { careerId: string; universityId: string }) {
  const { semesters } = useSemesters(careerId)
  if (!semesters || semesters.length === 0) return null

  return (
    <div className="flex gap-1">
      {semesters.map((s) => (
        <Link
          key={s.id}
          href={`/dashboard/universities/${universityId}/careers/${careerId}/schedules?semesterId=${s.id}`}
        >
          <Button size="xs" variant="ghost">{s.name}</Button>
        </Link>
      ))}
    </div>
  )
}
