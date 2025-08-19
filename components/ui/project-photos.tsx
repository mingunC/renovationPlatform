'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ProjectPhotosProps {
  photos: string[]
  title?: string
  className?: string
}

export function ProjectPhotos({ photos, title = "프로젝트 사진", className = "" }: ProjectPhotosProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // 디버깅: props 확인
  console.log('ProjectPhotos props:', { photos, title, className })
  console.log('Photos type:', typeof photos)
  console.log('Photos length:', photos?.length)

  if (!photos || photos.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-gray-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium mb-2">첨부된 사진이 없습니다</p>
            <p className="text-sm text-gray-400">고객이 아직 사진을 첨부하지 않았습니다</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const openModal = (index: number) => {
    setSelectedPhotoIndex(index)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedPhotoIndex(null)
  }

  const nextPhoto = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex + 1) % photos.length)
    }
  }

  const prevPhoto = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex(selectedPhotoIndex === 0 ? photos.length - 1 : selectedPhotoIndex - 1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal()
    } else if (e.key === 'ArrowRight') {
      nextPhoto()
    } else if (e.key === 'ArrowLeft') {
      prevPhoto()
    }
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            {title} ({photos.length}장)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:border-blue-300 transition-all duration-200"
                onClick={() => openModal(index)}
              >
                {photo && photo.startsWith('http') ? (
                  <img
                    src={photo}
                    alt={`Project photo ${index + 1}`}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      console.error(`Failed to load image ${index + 1}:`, photo);
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                    onLoad={() => {
                      console.log(`Successfully loaded image ${index + 1}:`, photo);
                    }}
                  />
                ) : null}
                <div className={`w-full h-32 flex items-center justify-center bg-gray-100 ${photo && photo.startsWith('http') ? 'hidden' : ''}`}>
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Photo {index + 1}</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button size="sm" variant="secondary" className="bg-white text-gray-800 hover:bg-gray-100">
                      <ImageIcon className="w-4 h-4 mr-1" />
                      보기
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 사진 모달 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0" onKeyDown={handleKeyDown}>
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center justify-between">
              <span>{title} ({selectedPhotoIndex !== null ? selectedPhotoIndex + 1 : 0} / {photos.length})</span>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative flex-1 flex items-center justify-center p-4">
            {selectedPhotoIndex !== null && photos[selectedPhotoIndex] && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
                  onClick={prevPhoto}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                
                <div className="flex-1 flex items-center justify-center">
                  {photos[selectedPhotoIndex].startsWith('http') ? (
                    <img
                      src={photos[selectedPhotoIndex]}
                      alt={`Project photo ${selectedPhotoIndex + 1}`}
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="text-center py-16">
                      <ImageIcon className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">사진을 표시할 수 없습니다</p>
                    </div>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
                  onClick={nextPhoto}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}
          </div>
          
          {/* 썸네일 네비게이션 */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex gap-2 overflow-x-auto">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className={`flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedPhotoIndex === index ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPhotoIndex(index)}
                >
                  {photo && photo.startsWith('http') ? (
                    <img
                      src={photo}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-16 h-16 object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
