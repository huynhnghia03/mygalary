
'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import { Photo } from './PhotoGallery';

interface PhotoViewModalProps {
  photo: Photo | null;
  onClose: () => void;
}

export default function PhotoViewModal({ photo, onClose }: PhotoViewModalProps) {
  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <button onClick={onClose} className="absolute top-4 right-4 z-10 text-white/80 hover:text-white">
            <X size={32} />
          </button>
          <motion.div
            layoutId={`photo-${photo._id}`}
            onClick={(e) => e.stopPropagation()}
            className="relative h-full max-h-[90vh] w-full max-w-[90vw]"
          >
            <Image
              src={photo.secure_url}
              alt={photo.title}
              fill
              className="object-contain"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
