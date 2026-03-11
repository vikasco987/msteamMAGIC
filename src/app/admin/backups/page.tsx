"use client";

import React, { useEffect, useState } from "react";
import { 
  Database, 
  Cloud, 
  ArrowRight, 
  History, 
  ShieldCheck, 
  ExternalLink,
  Download,
  AlertCircle,
  Clock,
  HardDrive,
  FileText,
  Table,
  FileCode
} from "lucide-react";

interface Backup {
  id: string;
  fileName: string;
  date: string;
  sizeMB: number;
  status: string;
  s3Url: string | null;
  error?: string;
}

export default function BackupDashboard() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/backups")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBackups(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleDownload = async (id: string, fileName: string) => {
    try {
      setDownloadingId(id);
      const res = await fetch(`/api/admin/backups/download?file=${encodeURIComponent(fileName)}`);
      const data = await res.json();
      
      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        alert("Failed to generate download link: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Error generating download link");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleExport = (format: 'excel' | 'json', model: 'task' | 'customer') => {
    window.open(`/api/admin/backups/export?format=${format}&model=${model}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6 md:p-12 font-sans selection:bg-purple-500/30">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/20">
            <Database className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Database Backup Center
            </h1>
            <p className="text-gray-400 mt-1">Kravy POS Ultimate Security System</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: How it Works (Hinglish) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition hover:border-white/20">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <ShieldCheck className="text-green-400" />
              Yeh Setup Kaise Kaam Karta Hai?
            </h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold border border-purple-500/20 shrink-0">1</div>
                <div>
                  <h3 className="font-medium text-purple-300">Daily mongodump Script</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Rozana raat 2 baje system auto command run karta hai jo aapke pure database ki ek <b>compressed copy</b> (.gz file) banata hai.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold border border-blue-500/20 shrink-0">2</div>
                <div>
                  <h3 className="font-medium text-blue-300">Local Validation</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Backup file pehle server ke ek <b>secure folder</b> mein save hoti hai taaki verify ho sake ki data sahi se dump hua hai.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20 shrink-0">3</div>
                <div>
                  <h3 className="font-medium text-indigo-300">Cloud S3 Upload</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Validation ke baad, file ko turant <b>AWS S3 Bucket</b> mein upload kiya jata hai. Isse aapka data server crash hone ke baad bhi safe rehta hai.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/20 shrink-0">4</div>
                <div>
                  <h3 className="font-medium text-emerald-300">Automatic Cleanup</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Upload success hote hi server se temp file delete ho jati hai, taaki <b>disk space wastage</b> na ho.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/20">
              <p className="text-xs text-yellow-200/70 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Agar data delete ho jaye, toh Admin niche di gayi history se latest file download karke <b>'npm run db:restore'</b> chala sakta hai.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: History Table */}
        <div className="lg:col-span-2">
          <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl h-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <History className="text-purple-400" />
                Backup History
              </h2>
              <div className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-400 border border-white/10 italic">
                Logs updated in real-time
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                <p className="text-gray-500 animate-pulse">Fetching records...</p>
              </div>
            ) : backups.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
                <div className="p-4 rounded-full bg-white/5 w-fit mx-auto mb-4">
                  <HardDrive className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-400">No backup records found yet.</p>
                <p className="text-sm text-gray-600 mt-1">Run 'npm run db:backup' to create your first backup.</p>
              </div>
            ) : (
              <div className="overflow-x-auto relative">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-500 border-b border-white/5">
                      <th className="pb-4 font-medium px-4">Date & Time</th>
                      <th className="pb-4 font-medium px-4">Size</th>
                      <th className="pb-4 font-medium px-4">Status</th>
                      <th className="pb-4 font-medium px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {backups.map((backup) => (
                      <tr key={backup.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="py-5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-purple-500/20 transition-colors">
                              <Clock className="w-4 h-4 text-purple-400" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-200">
                                {new Date(backup.date).toLocaleDateString(undefined, { 
                                  day: '2-digit', 
                                  month: 'short', 
                                  year: 'numeric' 
                                })}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(backup.date).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-4">
                          <span className="text-sm text-gray-400">{backup.sizeMB > 0 ? `${backup.sizeMB} MB` : 'N/A'}</span>
                        </td>
                        <td className="py-5 px-4">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                            backup.status === 'success' 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${backup.status === 'success' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                            {backup.status.toUpperCase()}
                          </div>
                        </td>
                        <td className="py-5 px-4 text-right">
                          {backup.status === 'success' ? (
                            <button 
                              onClick={() => handleDownload(backup.id, backup.fileName)}
                              disabled={downloadingId === backup.id}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition group disabled:opacity-50"
                            >
                              {downloadingId === backup.id ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <Download className="w-4 h-4 group-hover:translate-y-0.5 transition" />
                              )}
                              {downloadingId === backup.id ? 'Loading...' : 'Download'}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-600 italic">No file available</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info & Instant Export */}
      <div className="max-w-7xl mx-auto mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Instant Export Section */}
        <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <FileText className="text-blue-400" />
            Instant Data Export
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tasks Export */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-sm font-medium mb-3">All Tasks Data</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleExport('excel', 'task')}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-green-500/20 text-green-400 border border-green-500/20 text-xs hover:bg-green-500/30 transition"
                >
                  <Table size={14} /> Excel
                </button>
                <button 
                  onClick={() => handleExport('json', 'task')}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 text-xs hover:bg-yellow-500/30 transition"
                >
                  <FileCode size={14} /> JSON
                </button>
              </div>
            </div>

            {/* Customers Export */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-sm font-medium mb-3">Customers Data</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleExport('excel', 'customer')}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-green-500/20 text-green-400 border border-green-500/20 text-xs hover:bg-green-500/30 transition"
                >
                  <Table size={14} /> Excel
                </button>
                <button 
                  onClick={() => handleExport('json', 'customer')}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 text-xs hover:bg-yellow-500/30 transition"
                >
                  <FileCode size={14} /> JSON
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center gap-4 text-gray-400 mb-6 sm:mb-0">
            <Cloud className="w-6 h-6" />
            <div>
              <p className="text-sm">Storage: <b>AWS S3 (Private)</b></p>
              <p className="text-xs text-gray-500">Auto-backup set for 02:00 AM daily</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
             <div className="px-4 py-3 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-xs text-purple-300 flex-1 text-center">
               Next Sync: Today @ 02:00 AM
             </div>
             <div className="px-4 py-3 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-xs text-blue-300 flex-1 text-center font-bold">
               Status: System Secure
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
