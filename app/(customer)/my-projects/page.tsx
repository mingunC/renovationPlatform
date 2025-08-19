import { Metadata } from 'next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RequestsTable } from '@/components/tables/requests-table'
import { ClipboardList, Hammer, Clock, CheckCircle, Award } from 'lucide-react'

export const metadata: Metadata = {
  title: 'My Projects | Renovate Platform',
  description: 'View and manage your renovation requests',
}

export default function MyProjectsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            My Renovation Projects
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track your renovation requests, manage bids, and monitor project progress
          </p>
        </div>
        
        <Tabs defaultValue="inspection" className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-16 bg-white shadow-lg rounded-xl p-1">
            <TabsTrigger 
              value="inspection" 
              className="flex flex-col items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
            >
              <ClipboardList className="h-5 w-5" />
              <span className="text-xs font-medium">현장방문 전</span>
            </TabsTrigger>
            <TabsTrigger 
              value="bidding" 
              className="flex flex-col items-center gap-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
            >
              <Hammer className="h-5 w-5" />
              <span className="text-xs font-medium">입찰 진행 중</span>
            </TabsTrigger>
            <TabsTrigger 
              value="closed" 
              className="flex flex-col items-center gap-2 data-[state=active]:bg-gray-50 data-[state=active]:text-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
            >
              <Clock className="h-5 w-5" />
              <span className="text-xs font-medium">입찰 마감</span>
            </TabsTrigger>
            <TabsTrigger 
              value="selected" 
              className="flex flex-col items-center gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
            >
              <Award className="h-5 w-5" />
              <span className="text-xs font-medium">업체 선택됨</span>
            </TabsTrigger>
            <TabsTrigger 
              value="completed" 
              className="flex flex-col items-center gap-2 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
            >
              <CheckCircle className="h-5 w-5" />
              <span className="text-xs font-medium">완료</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inspection" className="mt-8">
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">새요청 프로젝트</h3>
                <p className="text-sm text-blue-700">
                  견적요청 등록 및 현장방문 대기 중인 프로젝트입니다. 현장방문을 취소한 프로젝트도 여기에 표시됩니다.
                </p>
              </div>
              <RequestsTable 
                additionalStatuses={["OPEN", "INSPECTION_PENDING"]}
                isMyProjects={true} 
              />
            </div>
          </TabsContent>
          
          <TabsContent value="bidding" className="mt-8">
            <RequestsTable status="BIDDING_OPEN" isMyProjects={true} />
          </TabsContent>
          
          <TabsContent value="closed" className="mt-8">
            <RequestsTable status="BIDDING_CLOSED" isMyProjects={true} />
          </TabsContent>
          
          <TabsContent value="selected" className="mt-8">
            <RequestsTable status="CONTRACTOR_SELECTED" isMyProjects={true} />
          </TabsContent>
          
          <TabsContent value="completed" className="mt-8">
            <RequestsTable status="COMPLETED" isMyProjects={true} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
