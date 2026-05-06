import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DriveStream — Your Private Video Platform',
  description:
    'A private YouTube-like platform backed by Google Drive. Upload, stream and share your videos securely.',
  keywords: ['video', 'streaming', 'google drive', 'private platform'],
  openGraph: {
    title: 'DriveStream',
    description: 'Your Private Video Platform powered by Google Drive',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className="min-h-full flex flex-col bg-grid">
        {/* Radial gradient background blobs */}
        <div
          className="fixed inset-0 pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20"
            style={{
              background:
                'radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full opacity-10"
            style={{
              background:
                'radial-gradient(circle, rgba(79,70,229,0.5) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] rounded-full opacity-10"
            style={{
              background:
                'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)',
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
