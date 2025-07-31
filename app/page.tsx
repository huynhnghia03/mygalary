'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import PhotoGallery, { Photo } from '@/components/PhotoGallery';
import PhotoViewModal from '@/components/PhotoViewModal';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PublicHomePage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPhotos, setTotalPhotos] = useState(0);
  const limit = 50; // Số ảnh mỗi trang, khớp với backend

  useEffect(() => {
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
    fetchPhotos();
  }, [page]);

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-sky-50 to-violet-50 overflow-hidden">
      <Header isAdmin={false} />
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 via-pink-600 to-orange-500 text-transparent bg-clip-text">
            Photo Gallery
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Explore our stunning collection of moments captured in time
          </p>
        </motion.div>

        {isLoading ? (
          <motion.div 
            className="flex flex-col justify-center items-center h-64 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
            <p className="text-gray-600 animate-pulse">Loading amazing photos...</p>
          </motion.div>
        ) : photos.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <PhotoGallery
                photos={photos}
                onPhotoClick={setSelectedPhoto}
                onPhotoDelete={() => {}}
                isAdmin={false}
              />
            </motion.div>
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={handlePreviousPage}
                disabled={page === 1}
                className={`px-4 py-2 rounded ${
                  page === 1
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-violet-600 hover:bg-violet-700 text-white'
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
                    : 'bg-violet-600 hover:bg-violet-700 text-white'
                }`}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg p-8"
          >
            <img 
              src="/empty-gallery.svg" 
              alt="Empty Gallery" 
              className="w-48 h-48 mx-auto mb-6 opacity-60"
            />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 text-transparent bg-clip-text">
              This gallery is empty
            </h2>
            <p className="text-gray-600 mt-4 text-lg">
              Come back later to discover amazing new photos!
            </p>
          </motion.div>
        )}
      </main>
      
      <PhotoViewModal
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </div>
  );
}