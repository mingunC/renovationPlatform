'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RequestList } from './request-list'
import { InspectionScheduledList } from './inspection-scheduled-list'
import { BiddingOpenList } from './bidding-open-list'
import { MyBidsList } from '../contractor/my-bids-list'

export function ContractorDashboardTabs() {
  return (
    <Tabs defaultValue="new-requests" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="new-requests">새 요청</TabsTrigger>
        <TabsTrigger value="inspection">현장 방문 대기</TabsTrigger>
        <TabsTrigger value="bidding">입찰 진행중</TabsTrigger>
        <TabsTrigger value="my-bids">내 입찰</TabsTrigger>
      </TabsList>

      <TabsContent value="new-requests" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              새로운 요청
            </h2>
            <p className="text-gray-600">
              당신의 전문 분야와 일치하는 새로운 프로젝트를 찾아보세요
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>15분마다 업데이트</span>
          </div>
        </div>
        <RequestList />
      </TabsContent>

      <TabsContent value="inspection" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              현장 방문 대기
            </h2>
            <p className="text-gray-600">
              현장 방문 일정이 설정된 프로젝트들 - 참여 의사를 표시하세요
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>빠른 응답 필요</span>
          </div>
        </div>
        <InspectionScheduledList />
      </TabsContent>

      <TabsContent value="bidding" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              입찰 진행중
            </h2>
            <p className="text-gray-600">
              현장 방문을 완료하고 입찰을 제출할 수 있는 프로젝트들
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>입찰 가능</span>
          </div>
        </div>
        <BiddingOpenList />
      </TabsContent>

      <TabsContent value="my-bids" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              내 입찰
            </h2>
            <p className="text-gray-600">
              제출한 입찰서들의 상태를 확인하고 관리하세요
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>입찰 관리</span>
          </div>
        </div>
        <MyBidsList />
      </TabsContent>
    </Tabs>
  )
}
