'use client'

import { useState, useRef, useCallback } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DetailsStepProps {
  description: string
  photos: File[]
  onUpdate: (data: { description: string; photos: File[] }) => void
}

const MAX_PHOTOS = 5
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function DetailsStep({ description, photos, onUpdate }: DetailsStepProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return 'Please upload only JPEG, PNG, or WebP images'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB'
    }
    return null
  }

  const handleFiles = useCallback((files: FileList | File[]) => {
    setUploadError(null)
    const fileArray = Array.from(files)
    const validFiles: File[] = []
    
    for (const file of fileArray) {
      const error = validateFile(file)
      if (error) {
        setUploadError(error)
        return
      }
      validFiles.push(file)
    }

    const newPhotos = [...photos, ...validFiles].slice(0, MAX_PHOTOS)
    onUpdate({ description, photos: newPhotos })
  }, [photos, description, onUpdate])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    onUpdate({ description, photos: newPhotos })
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const isDescriptionValid = description.length >= 50

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tell us about your project
        </h2>
        <p className="text-gray-600">
          Provide details and photos to help contractors understand your vision
        </p>
      </div>

      {/* Description */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-medium">
              Project Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your renovation project in detail. Include what you want to achieve, any specific requirements, preferred materials, timeline constraints, or special considerations..."
              value={description}
              onChange={(e) => onUpdate({ description: e.target.value, photos })}
              rows={6}
              className={`resize-none ${!isDescriptionValid && description.length > 0 ? 'border-red-500' : isDescriptionValid ? 'border-green-500' : ''}`}
            />
            <div className="flex items-center justify-between text-sm">
              <span className={description.length < 50 ? 'text-red-600' : 'text-green-600'}>
                {description.length}/50 characters minimum
              </span>
              {isDescriptionValid && (
                <span className="text-green-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Good description
                </span>
              )}
            </div>
            {!isDescriptionValid && description.length > 0 && (
              <p className="text-sm text-red-600">
                Please provide more details to help contractors understand your project
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Photo Upload */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-base font-medium">
              Project Photos (Optional)
            </Label>
            <p className="text-sm text-gray-600">
              Upload up to {MAX_PHOTOS} photos to show the current state or your inspiration
            </p>
          </div>

          {/* Upload Area */}
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
              photos.length >= MAX_PHOTOS ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {photos.length >= MAX_PHOTOS ? 'Maximum photos uploaded' : 'Drop photos here or click to upload'}
                </p>
                <p className="text-sm text-gray-600">
                  JPEG, PNG, or WebP up to 10MB each
                </p>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileInput}
            className="hidden"
          />

          {uploadError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
              {uploadError}
            </div>
          )}

          {/* Photo Preview */}
          {photos.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Uploaded Photos ({photos.length}/{MAX_PHOTOS})</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removePhoto(index)
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                    <div className="mt-1 text-xs text-gray-600 truncate">
                      {photo.name} ({formatFileSize(photo.size)})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-1">Helpful Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Include photos of the current space from different angles</li>
              <li>• Show any problem areas that need attention</li>
              <li>• Add inspiration photos if you have a specific vision</li>
              <li>• The more detail you provide, the more accurate quotes you&apos;ll receive</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
