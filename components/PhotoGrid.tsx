'use client'

import React from 'react'
import { Heart, Download, X } from 'lucide-react'

// Định nghĩa kiểu dữ liệu cho ảnh
interface Photo {
  id: string
  originalName: string
  url: string
  size: number
  width?: number | null
  height?: number | null
  isFavorite: boolean
  uploadedAt: string
}

interface PhotoGridProps {
  photos: Photo[]
  viewMode: 'grid' | 'list'
  onPhotoClick: (photo: Photo) => void
  onToggleFavorite: (id: string, isFavorite: boolean) => void
  onDeletePhoto: (id: string) => void
}

export default function PhotoGrid({ photos, viewMode, onPhotoClick, onToggleFavorite, onDeletePhoto }: PhotoGridProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const downloadPhoto = async (photo: Photo, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const response = await fetch(photo.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = photo.originalName
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  const GridView = () => (
    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
      {photos.map((photo) => (
        <div key={photo.id} className='group relative aspect-square bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-purple-500/20'>
          <img
            src={photo.url}
            alt={photo.originalName}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => onPhotoClick(photo)}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end">
            <div className="p-3">
              <p className="text-white font-medium text-sm truncate mb-2">{photo.originalName}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">{formatFileSize(photo.size)}</span>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(photo.id, !photo.isFavorite) }}
                    className={`p-1.5 rounded-full transition-all ${photo.isFavorite ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
                    aria-label="Yêu thích"
                  >
                    <Heart className="w-4 h-4" fill={photo.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={(e) => downloadPhoto(photo, e)}
                    className="p-1.5 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all"
                    aria-label="Tải xuống"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeletePhoto(photo.id) }}
                    className="p-1.5 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-all"
                    aria-label="Xóa"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const ListView = () => (
    <div className='space-y-3'>
      {photos.map((photo) => (
        <div key={photo.id} className='flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-3 hover:bg-white/10 transition-all duration-300'>
          <img
            src={photo.url}
            alt={photo.originalName}
            className="w-16 h-16 object-cover rounded-lg cursor-pointer flex-shrink-0"
            onClick={() => onPhotoClick(photo)}
            loading="lazy"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium truncate">{photo.originalName}</h3>
            <p className="text-purple-300 text-sm">
              {new Date(photo.uploadedAt).toLocaleDateString('vi-VN')}
            </p>
            <p className="text-purple-400 text-xs">
              {formatFileSize(photo.size)} {photo.width && `• ${photo.width}x${photo.height}`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onToggleFavorite(photo.id, !photo.isFavorite)}
              className={`p-2 rounded-lg transition-all ${photo.isFavorite ? 'bg-red-500 text-white' : 'bg-white/10 text-purple-300 hover:bg-white/20'}`}
              aria-label="Yêu thích"
            >
              <Heart className="w-5 h-5" fill={photo.isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={(e) => downloadPhoto(photo, e)}
              className="p-2 bg-white/10 text-purple-300 rounded-lg hover:bg-white/20 transition-all"
              aria-label="Tải xuống"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDeletePhoto(photo.id)}
              className="p-2 bg-red-800/80 text-white rounded-lg hover:bg-red-700 transition-all"
              aria-label="Xóa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )

  return viewMode === 'grid' ? <GridView /> : <ListView />
}
