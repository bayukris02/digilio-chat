'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Save, Loader2, GripVertical, Settings2, CheckCircle2 } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

interface VisualFormBuilderProps {
  moduleName: string;
}

export default function VisualFormBuilder({ moduleName }: VisualFormBuilderProps) {
  const [schema, setSchema] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const { setSystemFeedback } = useAppStore()

  useEffect(() => {
    const fetchBlueprint = async () => {
      try {
        const response = await fetch(`http://localhost:9005/api/blueprints/${moduleName}`)
        if (!response.ok) throw new Error('Blueprint not found')
        const data = await response.json()
        setSchema(data.schema_json)
      } catch (error) {
        console.error("Failed to fetch blueprint", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBlueprint()
  }, [moduleName])

  const handleSave = async () => {
    setIsSaving(true)
    setStatus(null)
    try {
      const response = await fetch(`http://localhost:9005/api/blueprints/${moduleName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schema_json: schema })
      })
      if (response.ok) {
        setStatus('Berhasil disimpan!')
        setSystemFeedback(`Blueprint ${moduleName} berhasil diperbarui secara visual.`)
      }
    } catch (error) {
      alert('Gagal menyimpan blueprint.')
    } finally {
      setIsSaving(false)
    }
  }

  const addField = () => {
    const newField = {
      name: `field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      placeholder: '',
      required: false
    }
    setSchema({ ...schema, fields: [...schema.fields, newField] })
  }

  const removeField = (index: number) => {
    const newFields = [...schema.fields]
    newFields.splice(index, 1)
    setSchema({ ...schema, fields: newFields })
  }

  const updateField = (index: number, key: string, value: any) => {
    const newFields = [...schema.fields]
    newFields[index] = { ...newFields[index], [key]: value }
    setSchema({ ...schema, fields: newFields })
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  )

  if (!schema) return <div className="p-8 text-center text-gray-500">Blueprint tidak ditemukan.</div>

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings2 className="text-blue-600" />
            Blueprint Editor: {schema.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Sesuaikan field, tipe data, dan aturan validasi secara visual.</p>
        </div>
        <div className="flex items-center gap-3">
          {status && (
            <span className="text-sm text-green-600 font-medium flex items-center gap-1 animate-in fade-in duration-300">
              <CheckCircle2 size={16} />
              {status}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {schema.fields.map((field: any, index: number) => (
          <div key={index} className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-blue-300 transition-all flex items-start gap-4">
            <div className="mt-2 text-slate-300 group-hover:text-blue-400 cursor-grab active:cursor-grabbing">
              <GripVertical size={20} />
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Field Label</label>
                <input
                  value={field.label}
                  onChange={(e) => updateField(index, 'label', e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Field Name (ID)</label>
                <input
                  value={field.name}
                  onChange={(e) => updateField(index, 'name', e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Data Type</label>
                <select
                  value={field.type}
                  onChange={(e) => updateField(index, 'type', e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="select">Select</option>
                </select>
              </div>
              <div className="flex items-end gap-3 pb-1">
                <label className="flex items-center gap-2 cursor-pointer select-none mb-2">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateField(index, 'required', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-600">Required</span>
                </label>
                <button
                  onClick={() => removeField(index)}
                  className="mb-1 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all ml-auto"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addField}
          className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all font-medium flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Tambah Field Baru
        </button>
      </div>
    </div>
  )
}
