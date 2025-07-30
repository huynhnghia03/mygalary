'use client'

import React, { useCallback, useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'

interface PhotoUploadProps {
  onUploadComplete: () => void
  uploading: boolean
  setUploading: (uploading: boolean) => void
}

export default function PhotoUpload({ onUploadComplete, uploading, setUploading }: PhotoUploadProps) {
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || !files.length) return
    setUploading(true)

    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('photos', file)
      })
      
      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      console.log('Upload successful:', result)
      onUploadComplete()
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Lỗi khi upload ảnh: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`)
    } finally {
      setUploading(false)
    }
  }, [onUploadComplete, setUploading])

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
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileUpload(files)
    }
  }, [handleFileUpload])

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${dragActive ? 'border-purple-400 bg-purple-500/10' : 'border-white/30'} ${uploading ? 'cursor-wait' : 'cursor-pointer hover:border-purple-400 hover:bg-white/5'}`}
    >
      {uploading ? (
        <>
            <Loader2 className="w-16 h-16 text-purple-300 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold text-white mb-2">Đang tải ảnh lên...</h3>
            <p className="text-purple-200">Vui lòng đợi trong giây lát.</p>
        </>
      ) : (
        <>
            <Upload className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Kéo thả hoặc nhấn để tải ảnh</h3>
            <p className="text-purple-200 mb-4">Hỗ trợ nhiều file cùng lúc</p>
            <p className="text-sm text-purple-300">JPG, PNG, GIF, WebP (Tối đa 10MB mỗi file)</p>
            <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
            />
        </>
      )}
    </div>
  )
}