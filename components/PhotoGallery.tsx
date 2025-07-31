// components/PhotoGallery.tsx
'use client';
import { motion } from "framer-motion";
import { Share2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Image from 'next/image';

export interface Photo {
  _id: string;
  title: string;
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}

interface PhotoGalleryProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
  onPhotoDelete: (id: string) => void;
  isAdmin?: boolean;
}

export default function PhotoGallery({ photos, onPhotoClick, onPhotoDelete, isAdmin = false}: PhotoGalleryProps) {

  const handleShare = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Image URL copied to clipboard!");
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Ngăn modal xem ảnh mở ra khi bấm xóa
    const toastId = toast.loading("Deleting photo...");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/photos/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error("Deletion failed");
      
      toast.success("Photo deleted!", { id: toastId });
      onPhotoDelete(id);
    } catch (error) {
      toast.error("Could not delete photo.", { id: toastId });
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <motion.div
          key={photo._id}
          layout
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring" }}
          className="group relative aspect-square"
          onClick={() => onPhotoClick(photo)}
        >
          <Image
            src={photo.secure_url}
            alt={photo.title}
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100 rounded-lg">
            <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
              <h3 className="text-lg font-bold text-white drop-shadow-md">{photo.title}</h3>
            </div>
             {isAdmin && (
            <div className="absolute top-2 right-2 flex gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(photo.secure_url);
                }} 
                className="rounded-full bg-black/50 p-2 text-white hover:bg-black/75"
              >
                <Share2 size={16} />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(e, photo._id);
                }} 
                className="rounded-full bg-black/50 p-2 text-white hover:bg-red-500/75"
              >
                <Trash2 size={16} />
              </button>
            </div>
             )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
