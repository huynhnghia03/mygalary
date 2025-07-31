// components/Header.tsx
import { Camera, Upload } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  onUploadClick?: () => void;
  isAdmin?: boolean;
}

export default function Header({ onUploadClick, isAdmin = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/60 backdrop-blur-xl">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <Link 
          href="/" 
          className="flex items-center gap-3 group"
        >
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-violet-600 via-pink-600 to-orange-500 opacity-70 blur group-hover:opacity-100 transition-opacity"></div>
            <Camera className="h-8 w-8 text-white relative z-10" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-600 via-pink-600 to-orange-500 text-transparent bg-clip-text">
            Photo Vault
          </h1>
        </Link>
        {isAdmin && (
          <button
            onClick={onUploadClick}
            className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white rounded-full
              bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700
              shadow-lg shadow-violet-500/25 hover:shadow-violet-500/50
              transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Photos</span>
          </button>
        )}
      </div>
    </header>
  );
}
