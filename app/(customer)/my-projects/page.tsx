import { Metadata } from 'next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RequestsTable } from '@/components/tables/requests-table'

export const metadata: Metadata = {
  title: 'My Projects | Renovate Platform',
  description: 'View and manage your renovation requests',
}

export default function MyProjectsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            My Renovation Projects
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Track your renovation requests and manage bids
          </p>
        </div>
        
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active Projects</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All Projects</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="space-y-4">
            <RequestsTable status="OPEN" />
          </TabsContent>
          <TabsContent value="completed" className="space-y-4">
            <RequestsTable status="COMPLETED" />
          </TabsContent>
          <TabsContent value="all" className="space-y-4">
            <RequestsTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
