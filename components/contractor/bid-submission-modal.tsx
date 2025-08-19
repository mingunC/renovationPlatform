'use client'

import { MobileBidPopup, BidSubmissionData } from './MobileBidPopup'

interface BidSubmissionModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectTitle: string
  onSubmit: (bidData: BidSubmissionData) => Promise<void>
  isLoading?: boolean
}

export function BidSubmissionModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  onSubmit,
  isLoading = false
}: BidSubmissionModalProps) {
  return (
    <MobileBidPopup
      isOpen={isOpen}
      onClose={onClose}
      projectTitle={projectTitle}
      onSubmit={onSubmit}
      isLoading={isLoading}
    />
  )
}

// 기존 인터페이스 호환성을 위해 export
export interface BidSubmissionData {
  bidAmount: string
  file?: File
  message: string
}

export default BidSubmissionModal
