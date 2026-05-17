'use client'

import React, { useState } from 'react'
import { Sparkles, Loader2, CheckCircle2, Layout, ArrowRight } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export default function Onboarding() {
  const [need, setNeed] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)
  
  const { addTab } = useAppStore()

  const handleGenerate = async () => {
    if (!need.trim()) return
    setIsGenerating(true)
    
    try {
      const response = await fetch('http://localhost:9005/api/onboarding/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_need: need,
          tenant_id: 'client_demo_001'
        })
      })
      
      if (!response.ok) throw new Error('Gagal merancang blueprint.')
      
      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const openInBuilder = () => {
    if (result) {
      addTab({
        id: `builder-${result.module_name}`,
        title: `Editor: ${result.schema_json.title}`,
        type: 'ai-editor',
        schemaId: result.module_name // Using schemaId to store the module_name
      })
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
          <Sparkles size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">AI Business Consultant</h1>
        <p className="text-slate-500 mt-2 text-lg">Ceritakan proses bisnis Anda, dan biarkan AI merancang modul ERP yang sempurna untuk Anda.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Apa yang ingin Anda bangun hari ini?</label>
          <textarea
            value={need}
            onChange={(e) => setNeed(e.target.value)}
            placeholder="Contoh: Saya butuh form untuk mencatat penyewaan alat berat. Saya butuh kolom Nama Alat, Durasi Sewa, dan Lokasi Proyek."
            className="w-full h-32 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400 resize-none transition-all"
            disabled={isGenerating}
          />
          
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !need.trim()}
            className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            {isGenerating ? 'AI sedang merancang Arsitektur...' : 'Rancang Modul Sekarang'}
          </button>
        </div>

        {result && (
          <div className="bg-slate-50 p-8 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 text-green-600 mb-6">
              <CheckCircle2 size={24} />
              <h3 className="font-bold text-lg">Rancangan Selesai!</h3>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Layout size={18} className="text-blue-500" />
                Preview Struktur: {result.schema_json.title}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {result.schema_json.fields.map((f: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl text-xs font-medium text-slate-600 border border-slate-100">
                    <span className="text-slate-400 block mb-1 uppercase tracking-wider">{f.type}</span>
                    {f.label} {f.required && <span className="text-red-400">*</span>}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={openInBuilder}
              className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              Lanjutkan ke Visual Builder
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
