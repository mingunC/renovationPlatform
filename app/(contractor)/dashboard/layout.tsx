import { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Contractor Dashboard | Renovate Platform',
  description: 'Manage your renovation projects and bids',
}

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'light dark'
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-layout">
      {children}
    </div>
  )
}
