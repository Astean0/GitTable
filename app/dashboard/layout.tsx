import DashboardNav from '@/app/dashboard/components/DashboardNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      {children}
    </div>
  )
}
