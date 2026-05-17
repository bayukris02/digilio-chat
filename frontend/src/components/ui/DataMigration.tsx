'use client'

import React, { useState } from 'react'
import { Upload, FileSpreadsheet, ArrowRight, CheckCircle2, Loader2, AlertCircle, Database } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

interface DataMigrationProps {
  moduleName: string;
}

export default function DataMigration({ moduleName }: DataMigrationProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [mapping, setMapping] = useState<any[] | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
      setMapping(null)
      setSuccess(false)
    }
  }

  const analyzeMapping = async () => {
    if (!file) return
    setIsAnalyzing(true)
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await fetch(`http://localhost:9005/api/migration/analyze?module_name=${moduleName}`, {
        method: 'POST',
        body: formData
      })
      if (!response.ok) throw new Error('Gagal menganalisis mapping.')
      const data = await response.json()
      setMapping(data.suggested_mapping)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const executeImport = async () => {
    setIsImporting(true)
    try {
      // Simulation of import
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSuccess(true)
    } catch (error) {
      alert('Gagal mengimpor data.')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-2xl mb-4">
          <Database size={32} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Data Migration Agent</h1>
        <p className="text-slate-500 mt-2">Migrasikan data lama Anda dari CSV ke modul {moduleName} secara otomatis.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8">
        {!mapping && !success && (
          <div className="space-y-6">
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileSpreadsheet size={40} className="text-slate-400 group-hover:text-green-500 transition-colors mb-3" />
                <p className="text-sm text-slate-700 font-semibold">
                  {file ? file.name : 'Klik untuk pilih file CSV data lama'}
                </p>
              </div>
              <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
            </label>
            
            <button
              onClick={analyzeMapping}
              disabled={!file || isAnalyzing}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isAnalyzing ? <Loader2 className="animate-spin" /> : <ArrowRight size={18} />}
              {isAnalyzing ? 'AI sedang menganalisis Mapping...' : 'Analisis Kolom CSV'}
            </button>
          </div>
        )}

        {mapping && !success && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-4 rounded-xl">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">AI merekomendasikan pemetaan berikut. Silakan periksa kembali.</p>
            </div>

            <div className="border rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Kolom CSV Lama</th>
                    <th className="px-6 py-3 text-center w-10"></th>
                    <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Field Sistem Baru</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mapping.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-700">{item.csv_column}</td>
                      <td className="px-6 py-4 text-center text-slate-300"><ArrowRight size={16} /></td>
                      <td className="px-6 py-4 font-bold text-blue-600">{item.blueprint_field}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-4">
               <button
                onClick={() => setMapping(null)}
                className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all"
              >
                Ganti File
              </button>
              <button
                onClick={executeImport}
                disabled={isImporting}
                className="flex-[2] py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-100"
              >
                {isImporting ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={18} />}
                {isImporting ? 'Mengimpor Data...' : 'Konfirmasi & Impor Sekarang'}
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="text-center py-10 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Migrasi Sukses!</h2>
            <p className="text-slate-500 mt-2">Data Anda telah berhasil dipindahkan ke modul {moduleName}.</p>
            <button
              onClick={() => {setSuccess(false); setMapping(null); setFile(null);}}
              className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold"
            >
              Selesai
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
