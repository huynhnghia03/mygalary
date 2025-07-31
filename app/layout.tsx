// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'My Photo Vault',
  description: 'A modern, personal photo storage application.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <Toaster position="bottom-center" toastOptions={{
          style: {
            background: '#1f2937', // gray-800
            color: '#f9fafb', // gray-50
          },
        }} />
        {children}
      </body>
    </html>
  );
}