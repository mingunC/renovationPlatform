'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, MessageSquare, X, ChevronUp, ChevronDown } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

interface MobileBidPopupProps {
  isOpen: boolean
  onClose: () => void
  projectTitle: string
  onSubmit: (bidData: BidSubmissionData) => Promise<void>
  isLoading?: boolean
}

export interface BidSubmissionData {
  bidAmount: string
  file?: File
  message: string
}

export function MobileBidPopup({
  isOpen,
  onClose,
  projectTitle,
  onSubmit,
  isLoading = false
}: MobileBidPopupProps) {
  const [bidAmount, setBidAmount] = useState('')
  const [estimateFile, setEstimateFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // isLoading prop이 변경되면 isSubmitting 상태도 업데이트
  useEffect(() => {
    setIsSubmitting(isLoading)
  }, [isLoading])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setEstimateFile(acceptedFiles[0])
      setError('')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const handleSubmit = async () => {
    if (!bidAmount) {
      setError('입찰 금액을 입력해주세요.')
      return
    }

    const amount = bidAmount.replace(/[^0-9]/g, '')
    if (!amount || parseInt(amount) <= 0) {
      setError('유효한 입찰 금액을 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await onSubmit({
        bidAmount: bidAmount,
        file: estimateFile || undefined,
        message: message.trim()
      })
      
      // 성공 시 모달 닫기
      handleClose()
    } catch (error) {
      setError('입찰 제출 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setBidAmount('')
    setEstimateFile(null)
    setMessage('')
    setError('')
    setShowAdvanced(false)
    onClose()
  }

  const removeFile = () => {
    setEstimateFile(null)
  }

  const formatCurrency = (value: string) => {
    // 숫자와 소수점만 허용
    const numericValue = value.replace(/[^0-9.]/g, '')
    if (numericValue === '') return ''
    
    const number = parseFloat(numericValue)
    if (isNaN(number)) return ''
    
    return number.toLocaleString('ko-KR')
  }

  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      {/* 배경 오버레이 */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      
      {/* 모바일 시트 / 데스크톱 모달 */}
      <div
        ref={modalRef}
        className={`relative w-full max-w-md mx-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl transform transition-all duration-300 ease-out ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
        style={{
          maxHeight: '90vh',
          minHeight: '60vh'
        }}
      >
        {/* 드래그 인디케이터 (모바일) */}
        <div className="flex justify-center pt-3 pb-2 sm:hidden">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                입찰 제출하기
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {projectTitle}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="px-6 py-4 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {/* 견적 총액 */}
          <div className="space-y-3">
            <Label htmlFor="totalAmount" className="text-sm font-medium text-gray-700">
              견적 총액
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                $
              </span>
              <Input
                id="totalAmount"
                type="text"
                value={bidAmount}
                onChange={(e) => setBidAmount(formatCurrency(e.target.value))}
                placeholder="55,000"
                className="pl-8 text-lg font-medium h-12 text-center"
              />
            </div>
            <p className="text-xs text-gray-500 text-center">
              숫자만 입력 가능합니다
            </p>
          </div>

          {/* 상세 견적서 파일 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              상세 견적서 파일
            </Label>
            
            {!estimateFile ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-blue-400 bg-blue-50 scale-105'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className={`mx-auto h-12 w-12 mb-4 transition-colors ${
                  isDragActive ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <p className="text-sm text-gray-600 mb-2 font-medium">
                  {isDragActive
                    ? '파일을 여기에 놓으세요'
                    : '파일을 드래그하여 놓거나 클릭하여 선택하세요'}
                </p>
                <p className="text-xs text-gray-500">
                  PDF, DOCX, JPG 파일 (최대 10MB)
                </p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                        {estimateFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(estimateFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* 고급 옵션 토글 */}
          <div className="border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-3 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  업체 메시지 추가
                </span>
              </div>
              {showAdvanced ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {/* 메시지 입력 영역 */}
            {showAdvanced && (
              <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="고객님께 전하는 메시지를 남겨주세요..."
                  className="min-h-[100px] resize-none border-gray-200 focus:border-blue-500"
                  maxLength={500}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    고객님께 어필할 수 있는 메시지를 작성해보세요
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {message.length}/500
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* 에러 메시지 */}
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* 하단 액션 버튼 */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl sm:rounded-b-2xl">
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 h-12 sm:flex-none"
            >
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !bidAmount}
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 sm:flex-none"
            >
              {isSubmitting ? '제출 중...' : '견적 제출하기'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileBidPopup
