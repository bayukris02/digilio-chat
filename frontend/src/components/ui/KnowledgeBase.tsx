'use client'

import React, { useState } from 'react'
import { Upload, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export default function KnowledgeBase() {
  const [isUploading, setIsUploading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' })
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setStatus({ type: null, message: '' })

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:9005/api/knowledge/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Gagal mengunggah dokumen.')

      const data = await response.json()
      setStatus({ type: 'success', message: data.message })
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-8 max-w-2xl mx-auto mt-10">
      <div className="text-center mb-8">
        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText size={32} className="text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Knowledge Ingestion Base</h2>
        <p className="text-gray-500 mt-2">Unggah dokumen SOP, Aturan Bisnis, atau Panduan (PDF/Markdown) untuk memperluas wawasan AI Agent Anda.</p>
      </div>

      <div className="space-y-6">
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer group">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isUploading ? (
              <Loader2 size={40} className="text-blue-600 animate-spin mb-3" />
            ) : (
              <Upload size={40} className="text-blue-400 group-hover:text-blue-600 transition-colors mb-3" />
            )}
            <p className="mb-2 text-sm text-gray-700 font-semibold">
              {isUploading ? 'Sedang Memproses Dokumen...' : 'Klik untuk unggah atau seret file ke sini'}
            </p>
            <p className="text-xs text-gray-500">PDF atau Markdown (Maks. 10MB)</p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept=".pdf,.md,.txt" 
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </label>

        {status.type && (
          <div className={`p-4 rounded-lg flex items-start gap-3 ${
            status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p className="text-sm font-medium">{status.message}</p>
          </div>
        )}

        <div className="border-t pt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-500" />
            Tips untuk RAG yang Optimal:
          </h3>
          <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4">
            <li>Pastikan teks dalam dokumen PDF dapat dibaca (bukan hasil scan gambar tanpa OCR).</li>
            <li>Gunakan format Markdown untuk struktur data yang lebih dipahami AI.</li>
            <li>Satu file sebaiknya fokus pada satu topik (misal: SOP Pembelian).</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
