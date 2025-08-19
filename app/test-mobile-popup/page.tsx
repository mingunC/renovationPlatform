'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MobileBidPopup, BidSubmissionData } from '@/components/contractor/MobileBidPopup'

export default function TestMobilePopupPage() {
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = async (bidData: BidSubmissionData) => {
    console.log('Bid submitted:', bidData)
    
    // 테스트용 간소화된 입찰 데이터
    const testBidData = {
      request_id: 'test-project-123',
      total_amount: parseInt(bidData.bidAmount.replace(/[^\d]/g, '')),
      estimate_file_url: 'https://example.com/test-file.pdf',
      notes: bidData.message || '',
      timeline_weeks: 4,
      start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }
    
    console.log('Test bid data for API:', testBidData)
    
    // 실제 구현에서는 API 호출
    alert(`입찰이 제출되었습니다!\n금액: $${bidData.bidAmount}\n파일: ${bidData.file?.name || '없음'}\n메시지: ${bidData.message}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          모바일 입찰 팝업 테스트
        </h1>
        
        <div className="space-y-4">
          <Button 
            onClick={() => setIsOpen(true)}
            className="w-full h-12 text-lg"
          >
            입찰 제출 팝업 열기
          </Button>
          
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-medium text-gray-900 mb-2">테스트 안내</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 모바일에서는 하단 시트로 표시됩니다</li>
              <li>• 데스크톱에서는 중앙 모달로 표시됩니다</li>
              <li>• 파일 업로드와 메시지 입력을 테스트해보세요</li>
              <li>• 반응형 디자인을 확인해보세요</li>
              <li>• 간소화된 입찰 시스템 (총액만)</li>
            </ul>
          </div>
        </div>
      </div>

      <MobileBidPopup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        projectTitle="테스트 프로젝트 - 주방 리노베이션"
        onSubmit={handleSubmit}
      />
    </div>
  )
}
