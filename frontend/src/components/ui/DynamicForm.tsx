'use client'

import React, { useState, useEffect } from 'react'
import { FormSchema } from '@/schemas/forms'
import { cn } from '@/lib/utils'
import { Sparkles, Save, Loader2, Upload, FileText } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

interface DynamicFormProps {
  schema: FormSchema;
  prefillData?: Record<string, any>;
  tabId?: string;
}

export default function DynamicForm({ schema, prefillData = {}, tabId }: DynamicFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isPrefilled, setIsPrefilled] = useState<Record<string, boolean>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isOcrProcessing, setIsOcrProcessing] = useState(false)
  
  const { lastUserCommand, saveRequestedForTab, requestSaveForTab, setSystemFeedback, userRole } = useAppStore()

  // Handle programmatic save from chat
  useEffect(() => {
    if (tabId && saveRequestedForTab === tabId) {
      console.log(`[AgenticUI] Chat-to-Save triggered for tab ${tabId}`)
      requestSaveForTab(null) // Reset request
      const syntheticEvent = { preventDefault: () => {} } as React.FormEvent
      handleSubmit(syntheticEvent)
    }
  }, [saveRequestedForTab, tabId])

  useEffect(() => {
    // Merge prefillData into formData and track which fields were prefilled
    const initialData: Record<string, any> = {}
    const prefillStatus: Record<string, boolean> = {}

    schema.fields.forEach(field => {
      if (prefillData[field.name] !== undefined) {
        initialData[field.name] = prefillData[field.name]
        prefillStatus[field.name] = true
      } else {
        initialData[field.name] = ''
      }
    })

    setFormData(initialData)
    setIsPrefilled(prefillStatus)
  }, [schema, prefillData])

  const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsOcrProcessing(true)
    const formDataObj = new FormData()
    formDataObj.append('file', file)
    formDataObj.append('user_role', userRole)

    try {
      const response = await fetch('http://localhost:9005/api/ocr/process', {
        method: 'POST',
        body: formDataObj,
      })

      if (!response.ok) throw new Error('Gagal memproses dokumen.')

      const data = await response.json()
      const nlpResult = data.nlp_analysis

      // Auto-fill form with extracted entities
      if (nlpResult && nlpResult.entities) {
        const newPrefilled: Record<string, boolean> = { ...isPrefilled }
        const newFormData: Record<string, any> = { ...formData }

        Object.keys(nlpResult.entities).forEach(key => {
          if (nlpResult.entities[key]) {
            newFormData[key] = nlpResult.entities[key]
            newPrefilled[key] = true
          }
        })

        setFormData(newFormData)
        setIsPrefilled(newPrefilled)
        setSystemFeedback(`OCR Sukses: Dokumen ${file.name} berhasil dianalisis.`)
      }
    } catch (error: any) {
      setSystemFeedback(`OCR ERROR: ${error.message}`)
    } finally {
      setIsOcrProcessing(false)
      // Reset input
      if (e.target) e.target.value = ''
    }
  }

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    // If user changes a prefilled field, remove the highlight
    if (isPrefilled[name]) {
      setIsPrefilled(prev => ({ ...prev, [name]: false }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const payload = {
      ...formData,
      tenant_id: "client_demo_001",
      created_by: "user_demo_001",
      user_role: userRole,
      user_command: lastUserCommand
    }

    try {
      const response = await fetch('http://localhost:9005/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.detail || 'Gagal menyimpan data.')
      }

      setSystemFeedback(`SUCCESS: PO ID: ${result.id} telah disimpan.`)
    } catch (error: any) {
      setSystemFeedback(`ERROR: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{schema.title}</h2>
          <p className="text-xs text-gray-500 mt-1">Lengkapi data di bawah atau unggah dokumen untuk pengisian otomatis.</p>
        </div>
        <div className="flex items-center gap-3">
          {Object.values(isPrefilled).some(v => v) && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium animate-pulse">
              <Sparkles size={14} />
              AI Ghost Filling
            </div>
          )}
          
          {/* OCR Upload Button */}
          <label className={cn(
            "flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors cursor-pointer border-2 border-dashed border-slate-300",
            isOcrProcessing && "opacity-50 cursor-not-allowed"
          )}>
            {isOcrProcessing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {isOcrProcessing ? 'Menganalisis...' : 'Unggah Nota (OCR)'}
            <input 
              type="file" 
              className="hidden" 
              accept="image/*,.pdf" 
              onChange={handleOcrUpload}
              disabled={isOcrProcessing}
            />
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schema.fields.map((field) => (
            <div key={field.name} className={cn("space-y-1.5", field.name === 'notes' ? "md:col-span-2" : "")}>
              <label className="text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              <div className="relative">
                <input
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  className={cn(
                    "w-full px-4 py-2 rounded-lg border transition-all outline-none focus:ring-2 focus:ring-blue-500",
                    isPrefilled[field.name] 
                      ? "bg-blue-50 border-blue-200 text-blue-900 placeholder-blue-300" 
                      : "bg-gray-50 border-gray-200 focus:bg-white"
                  )}
                />
                {isPrefilled[field.name] && (
                  <Sparkles 
                    size={14} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400" 
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {isSaving ? 'Memproses Aturan...' : `Simpan ${schema.title}`}
          </button>
        </div>
      </form>
    </div>
  )
}
