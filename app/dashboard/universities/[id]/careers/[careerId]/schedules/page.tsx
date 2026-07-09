'use client'

import { useParams } from 'next/navigation'
import Sidebar from '@/app/dashboard/components/Sidebar'
import ScheduleBuilder from '@/app/dashboard/components/ScheduleBuilder'

export default function SchedulesPage() {
  const params = useParams()
  const careerId = params.careerId as string

  return (
    <div className="flex min-h-[calc(100vh-65px)]">
      <Sidebar />
      <div className="flex-1 px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Schedule Builder</h1>
          <p className="text-gray-500 mt-1">
            Drag blocks to change position. Conflicts are validated in real time.
          </p>
        </div>
        <ScheduleBuilder careerId={careerId} />
      </div>
    </div>
  )
}
