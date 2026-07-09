'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCourses } from '@/hooks/useCourses'
import { useProfessors } from '@/hooks/useProfessors'
import Sidebar from '@/app/dashboard/components/Sidebar'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Toast from '@/components/ui/Toast'
import CourseForm from '@/app/dashboard/components/CourseForm'
import type { Course } from '@/lib/types'
import type { CourseFormData } from '@/lib/validations'

export default function CoursesPage() {
  const params = useParams()
  const universityId = params.id as string
  const careerId = params.careerId as string
  const { courses, loading, error, createCourse, updateCourse, deleteCourse } = useCourses(careerId)
  const { professors } = useProfessors(universityId)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const handleSubmit = async (data: CourseFormData) => {
    try {
      const payload = {
        name: data.name,
        hours_per_week: data.hours_per_week,
        students_count: data.students_count,
        professor_id: data.professor_id,
      }
      if (editing) {
        await updateCourse(editing.id, payload)
        setToast({ message: 'Course updated', type: 'success' })
      } else {
        await createCourse({ ...payload, career_id: careerId })
        setToast({ message: 'Course created', type: 'success' })
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
            <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
            <p className="text-gray-500 mt-1">Courses for this career</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/universities/${universityId}/careers/${careerId}/schedules`}>
              <Button variant="secondary">Schedule Builder</Button>
            </Link>
            <Button onClick={() => { setEditing(null); setModalOpen(true) }} disabled={professors.length === 0}>
              + Create Course
            </Button>
          </div>
        </div>

        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">{error}</div>}

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-sm text-gray-500">
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Professor</th>
                <th className="px-6 py-4 font-medium">Hours/week</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{course.name}</td>
                  <td className="px-6 py-4 text-gray-500">{course.professors?.name ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500">{course.hours_per_week}h</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => { setEditing(course); setModalOpen(true) }}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={async () => {
                        if (!confirm('Delete?')) return
                        try { await deleteCourse(course.id); setToast({ message: 'Deleted', type: 'success' }) }
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
          title={editing ? 'Edit Course' : 'Create Course'}>
          <CourseForm careerId={careerId} professors={professors} initial={editing}
            onSubmit={handleSubmit} onCancel={() => { setModalOpen(false); setEditing(null) }} />
        </Modal>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  )
}
