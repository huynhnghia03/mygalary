'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import PhotoGallery, { Photo } from '@/components/PhotoGallery';
import UploadModal from '@/components/UploadModal';
import PhotoViewModal from '@/components/PhotoViewModal';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPhotos, setTotalPhotos] = useState(0);
  const limit = 50; // Số ảnh mỗi trang, khớp với backend

  const fetchPhotos = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/photos?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch photos');
      const data = await res.json();
      setPhotos(data.photos);
      setTotalPages(data.total_pages);
      setTotalPhotos(data.total_photos);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [page]);

  const handlePhotoDelete = (deletedId: string) => {
    setPhotos(prevPhotos => prevPhotos.filter(p => p._id !== deletedId));
    // Cập nhật lại totalPhotos sau khi xóa
    setTotalPhotos(prev => Math.max(0, prev - 1));
    // Nếu trang hiện tại trống, chuyển về trang trước
    if (photos.length === 1 && page > 1) {
      setPage(page - 1);
    }
  };

  const handleUploadSuccess = () => {
    setPage(1); // Quay về trang đầu sau khi upload
    fetchPhotos();
  };

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <>
      <Header onUploadClick={() => setUploadModalOpen(true)} isAdmin={true} />
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-cyan-500" />
          </div>
        ) : photos.length > 0 ? (
          <>
            <PhotoGallery
              photos={photos}
              onPhotoClick={setSelectedPhoto}
              onPhotoDelete={handlePhotoDelete}
              isAdmin={true}
            />
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={handlePreviousPage}
                disabled={page === 1}
                className={`px-4 py-2 rounded ${
                  page === 1
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                }`}
              >
                Previous
              </button>
              <p className="text-gray-600">
                Page {page} of {totalPages} ({totalPhotos} photos)
              </p>
              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded ${
                  page === totalPages
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                }`}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <h2 className="text-2xl font-semibold text-slate-600">Your gallery is empty.</h2>
            <p className="text-slate-500 mt-2">Click 'Upload' to add your first photo!</p>
          </motion.div>
        )}
      </main>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
      
      <PhotoViewModal
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </>
  );
}