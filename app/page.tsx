'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Upload, Grid, List, Search, Heart, X, Download, Eye } from 'lucide-react'
import PhotoUpload from '@/components/PhotoUpload'
import PhotoGrid from '@/components/PhotoGrid'

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

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFavorites, setShowFavorites] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  // Hàm fetch ảnh, sử dụng useCallback để tối ưu
  const fetchPhotos = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (showFavorites) params.append('favorite', 'true')

      const response = await fetch(`/api/photos?${params}`)
      if (!response.ok) throw new Error('Failed to fetch photos')
      const data = await response.json()
      setPhotos(data)
    } catch (error) {
      console.error('Error fetching photos:', error)
      // Thêm thông báo lỗi cho người dùng ở đây
    } finally {
      setLoading(false)
    }
  }, [searchTerm, showFavorites])

  // useEffect để fetch ảnh khi component mount hoặc filter thay đổi
  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos])

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      const response = await fetch(`/api/photos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite }),
      })
      if (response.ok) {
        fetchPhotos() // Tải lại danh sách ảnh
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleDeletePhoto = async (id: string) => {
    // Thay thế confirm bằng một modal tùy chỉnh để có UX tốt hơn
    if (window.confirm('Bạn có chắc muốn xóa ảnh này vĩnh viễn?')) {
        try {
            const response = await fetch(`/api/photos/${id}`, {
                method: 'DELETE',
            })
            if (response.ok) {
                fetchPhotos() // Tải lại danh sách
                if (selectedPhoto?.id === id) {
                    setSelectedPhoto(null) // Đóng modal nếu ảnh đang xem bị xóa
                }
            }
        } catch (error) {
            console.error('Error deleting photo:', error)
        }
    }
  }

  const downloadPhoto = async (photo: Photo) => {
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

  // Giao diện loading
  if (loading && photos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Đang tải thư viện ảnh...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-900/70 backdrop-blur-md border-b border-white/10">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
                <Upload className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">PhotoVault Pro</h1>
                <p className="text-purple-300 text-sm">Lưu trữ ảnh an toàn và vĩnh viễn</p>
              </div>
            </div>
            <div className="text-white/80 text-sm hidden sm:block">
              {photos.length} ảnh • {photos.filter(p => p.isFavorite).length} yêu thích
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <section className="mb-8">
          <PhotoUpload
            onUploadComplete={fetchPhotos}
            uploading={uploading}
            setUploading={setUploading}
          />
        </section>

        {/* Controls */}
        <section className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-black/20 rounded-xl border border-white/10">
            <div className="relative w-full sm:w-auto">
              <Search className="w-5 h-5 text-purple-300 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${showFavorites ? 'bg-red-500 text-white shadow-lg' : 'bg-white/10 text-purple-300 hover:bg-white/20'}`}
              >
                <Heart className="w-4 h-4" fill={showFavorites ? 'currentColor' : 'none'} />
                <span className="hidden sm:inline">Yêu thích</span>
              </button>
              <div className="flex items-center gap-1 p-1 bg-white/10 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-purple-300 hover:bg-white/20'}`}
                  aria-label="Grid View"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-purple-300 hover:bg-white/20'}`}
                   aria-label="List View"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
        </section>

        {/* Photo Gallery */}
        <section>
            {loading ? (
                 <div className="text-center py-12 text-purple-300">Đang cập nhật danh sách...</div>
            ) : photos.length > 0 ? (
                <PhotoGrid
                    photos={photos}
                    viewMode={viewMode}
                    onPhotoClick={setSelectedPhoto}
                    onToggleFavorite={handleToggleFavorite}
                    onDeletePhoto={handleDeletePhoto}
                />
            ) : (
                <div className="text-center py-20">
                    <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-white/20">
                        <Eye className="w-16 h-16 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-2">Chưa có ảnh nào</h3>
                    <p className="text-purple-300">Hãy là người đầu tiên tải ảnh lên thư viện của bạn!</p>
                </div>
            )}
        </section>
      </main>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-10 right-0 sm:right-[-40px] p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all z-10"
              aria-label="Đóng"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.originalName}
              className="block max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl mx-auto"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 rounded-b-lg pointer-events-none">
              <div className="pointer-events-auto">
                <h3 className="text-white font-semibold text-xl mb-2">{selectedPhoto.originalName}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-300 mb-4">
                  <span>{new Date(selectedPhoto.uploadedAt).toLocaleString('vi-VN')}</span>
                  <span>{selectedPhoto.width}x{selectedPhoto.height}px</span>
                  <span>{((selectedPhoto.size || 0) / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleToggleFavorite(selectedPhoto.id, !selectedPhoto.isFavorite)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-semibold ${selectedPhoto.isFavorite ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
                  >
                    <Heart className="w-4 h-4" fill={selectedPhoto.isFavorite ? 'currentColor' : 'none'} />
                    {selectedPhoto.isFavorite ? 'Bỏ thích' : 'Yêu thích'}
                  </button>
                  <button
                    onClick={() => downloadPhoto(selectedPhoto)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    Tải xuống
                  </button>
                  <button
                    onClick={() => handleDeletePhoto(selectedPhoto.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-800/80 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-semibold"
                  >
                    <X className="w-4 h-4" />
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}