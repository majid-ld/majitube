import UploadForm from '@/components/UploadForm';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Publish Content — DashStream',
  description: 'Upload your cinematic videos securely to Google Drive.',
};

export default function UploadPage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface-container-lowest text-on-surface">
      <Navbar />
      <Sidebar />

      <main className="md:ml-64 pt-24 px-6 pb-12 max-w-[1440px]">
        {/* Page header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 bg-violet-600/10 border border-violet-500/20 shadow-2xl shadow-violet-600/20 group">
            <span className="material-symbols-outlined text-4xl text-violet-500 group-hover:scale-110 transition-transform duration-500">upload_file</span>
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase leading-tight">Publish Content</h1>
          <p className="text-neutral-400 font-medium leading-relaxed">
            Upload your cinematic experiences. Content is streamed directly from your private Google Drive infrastructure.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
          {[
            { label: 'Reliable Streaming', desc: 'Optimized chunked delivery', icon: 'speed' },
            { label: 'Secure Storage', desc: 'Google Cloud encryption', icon: 'security' },
            { label: 'Instant Meta', desc: 'Ultra-fast SQLite indexing', icon: 'bolt' },
          ].map(({ label, desc, icon }) => (
            <div
              key={label}
              className="flex items-center gap-4 p-6 rounded-2xl glass-card border-white/5 group hover:border-violet-500/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-violet-600/10 transition-colors">
                <span className="material-symbols-outlined text-2xl text-neutral-500 group-hover:text-violet-400 transition-colors">{icon}</span>
              </div>
              <div>
                <p className="text-sm font-black text-white uppercase tracking-tighter">{label}</p>
                <p className="text-xs text-neutral-500 font-bold">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <UploadForm />
      </main>
    </div>
  );
}

