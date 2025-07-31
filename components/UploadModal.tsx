// components/UploadModal.tsx
'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, UploadCloud, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export default function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      toast.error('Please provide a title and select a file.');
      return;
    }
    setIsUploading(true);
    const toastId = toast.loading('Uploading photo...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/photos/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed.');
      
      toast.success('Upload complete!', { id: toastId });
      onUploadSuccess();
      handleClose();
    } catch (err) {
      toast.error('Upload failed. Please try again.', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    setTitle('');
    setFile(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
          >
            <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800">
              <X />
            </button>
            <form onSubmit={handleSubmit}>
              <h2 className="mb-4 text-xl font-semibold text-slate-900">Upload a New Photo</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Photo Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-slate-300 bg-slate-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" disabled={isUploading} />
                <input type="file" onChange={handleFileChange} accept="image/*" className="w-full text-sm text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-cyan-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-700 hover:file:bg-cyan-100" disabled={isUploading} />
              </div>
              <button type="submit" disabled={isUploading || !file || !title} className="mt-6 flex w-full items-center justify-center rounded-md bg-cyan-500 px-4 py-2 font-semibold text-white shadow-sm transition-all hover:bg-cyan-600 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none">
                {isUploading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UploadCloud className="mr-2 h-5 w-5" />}
                <span>{isUploading ? 'Uploading...' : 'Upload Photo'}</span>
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}