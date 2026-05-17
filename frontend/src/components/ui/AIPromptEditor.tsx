'use client'

import React, { useState, useEffect } from 'react'
import { Save, Plus, Trash2, Bot, Sparkles, ChevronRight, LayoutGrid, ListTodo, Copy, Search, MoreVertical, Check } from 'lucide-react'
import { useAppStore, Persona } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

export default function AIPromptEditor() {
  const { personas, setPersonas } = useAppStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (personas.length > 0 && !selectedId) {
      setSelectedId(personas[0].id)
    }
  }, [personas, selectedId])

  useEffect(() => {
    const p = personas.find(p => p.id === selectedId)
    if (p) {
      setEditingPersona(JSON.parse(JSON.stringify(p)))
    }
  }, [selectedId, personas])

  const handleSave = async () => {
    if (!editingPersona) return
    setIsSaving(true)
    try {
      const response = await fetch(`http://localhost:9005/api/personas/${editingPersona.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPersona),
      })
      if (response.ok) {
        const updated = await response.json()
        setPersonas(personas.map(p => p.id === updated.id ? updated : p))
      }
    } catch (error) {
      console.error("Failed to save persona", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateNew = async () => {
    const newPersonaName = prompt("Enter name for new persona:")
    if (!newPersonaName) return

    try {
      const response = await fetch('http://localhost:9005/api/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona_name: newPersonaName,
          system_instruction: "Anda asisten ERP Digilio ringkas.",
          few_shot_examples: [],
          is_default: false
        }),
      })

      if (response.ok) {
        const created = await response.json()
        setPersonas([...personas, created])
        setSelectedId(created.id)
      }
    } catch (error) {
      console.error("Failed to create persona", error)
    }
  }

  const updateExample = (index: number, field: string, value: any) => {
    if (!editingPersona) return
    const newPersona = { ...editingPersona }
    newPersona.few_shot_examples[index][field] = value
    setEditingPersona(newPersona)
  }

  const addExample = () => {
    if (!editingPersona) return
    const newPersona = { ...editingPersona }
    newPersona.few_shot_examples = [
      ...(newPersona.few_shot_examples || []),
      { user: '', ai: '', intent: 'UNKNOWN', entities: {} }
    ]
    setEditingPersona(newPersona)
  }

  const removeExample = (index: number) => {
    if (!editingPersona) return
    const newPersona = { ...editingPersona }
    newPersona.few_shot_examples.splice(index, 1)
    setEditingPersona(newPersona)
  }

  const duplicateExample = (index: number) => {
    if (!editingPersona) return
    const newPersona = { ...editingPersona }
    const exampleToDuplicate = JSON.parse(JSON.stringify(newPersona.few_shot_examples[index]))
    newPersona.few_shot_examples.splice(index + 1, 0, exampleToDuplicate)
    setEditingPersona(newPersona)
  }

  const filteredPersonas = personas.filter(p => 
    p.persona_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!editingPersona) return (
    <div className="flex flex-col items-center justify-center h-full p-12 text-center bg-white dark:bg-slate-900">
      <Bot size={48} className="text-gray-200 dark:text-slate-800 mb-4 animate-pulse" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">No Persona Selected</h3>
      <p className="text-sm text-gray-500 dark:text-slate-500 max-w-xs mx-auto mt-2">
        Please select a persona from the sidebar or create a new one to start configuring.
      </p>
      <button 
        onClick={handleCreateNew}
        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-all"
      >
        Create New Persona
      </button>
    </div>
  )

  return (
    <div className="flex h-full bg-white dark:bg-slate-900 transition-all duration-300">
      {/* Sidebar: Persona List (Google Left Panel style) */}
      <aside className="w-72 border-r border-gray-100 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900">
        <div className="p-4 flex items-center justify-between border-b border-gray-50 dark:border-slate-800">
          <span className="text-sm font-medium text-gray-900 dark:text-slate-100">AI Personas</span>
          <button 
            onClick={handleCreateNew}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-blue-600 dark:text-blue-400 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
            <input 
              type="text"
              placeholder="Filter personas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-md py-1.5 pl-9 pr-4 text-xs focus:ring-1 focus:ring-blue-500 outline-none dark:text-slate-200 dark:placeholder-slate-600"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
          {filteredPersonas.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-r-full text-sm font-medium transition-all group",
                selectedId === p.id 
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-none" 
                  : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50"
              )}
            >
              <Bot size={18} className={selectedId === p.id ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-slate-600"} />
              <span className="flex-1 text-left truncate">{p.persona_name}</span>
              {p.is_default && <Check size={14} className="text-green-600 dark:text-green-500" />}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content (Google Setting Detail style) */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Detail Header */}
        <header className="px-8 py-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <div>
              <input 
                type="text"
                value={editingPersona.persona_name}
                onChange={(e) => setEditingPersona({...editingPersona, persona_name: e.target.value})}
                className="text-xl font-normal text-gray-900 dark:text-slate-100 bg-transparent border-none outline-none focus:ring-0 p-0 h-auto w-full max-w-md focus:border-b focus:border-blue-600 dark:focus:border-blue-400"
              />
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">Configuration ID: {editingPersona.id}</p>
            </div>
          </div>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#1a73e8] dark:bg-blue-600 hover:bg-[#1765cc] dark:hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && <Plus className="animate-spin" size={16} />}
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-10">
          <div className="max-w-4xl space-y-12">
            
            {/* System Instructions Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <LayoutGrid size={18} className="text-gray-400 dark:text-slate-600" />
                <h3 className="text-lg font-normal text-gray-900 dark:text-slate-100">System Instruction</h3>
              </div>
              <div className="relative">
                <textarea 
                  value={editingPersona.system_instruction}
                  onChange={(e) => setEditingPersona({...editingPersona, system_instruction: e.target.value})}
                  className="w-full h-40 p-4 bg-gray-50 dark:bg-slate-800/50 border border-transparent dark:border-slate-800 rounded-xl text-sm text-gray-700 dark:text-slate-300 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-0 transition-all outline-none leading-relaxed placeholder:text-gray-300 dark:placeholder:text-slate-700"
                  placeholder="Tell the AI how to behave..."
                />
                <div className="mt-2 flex justify-end">
                  <span className="text-[10px] text-gray-400 dark:text-slate-600 font-medium uppercase tracking-wider">{editingPersona.system_instruction.length} Characters</span>
                </div>
              </div>
            </section>

            {/* Training Data Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <ListTodo size={18} className="text-gray-400 dark:text-slate-600" />
                  <h3 className="text-lg font-normal text-gray-900 dark:text-slate-100">Training Examples</h3>
                </div>
                <button 
                  onClick={addExample}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors flex items-center gap-1.5"
                >
                  <Plus size={16} />
                  Add Example
                </button>
              </div>

              {/* Training Cases List (Cleaner than table) */}
              <div className="space-y-4">
                {editingPersona.few_shot_examples?.map((ex, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-slate-800/30 rounded-2xl p-6 relative group border border-transparent dark:border-slate-800/50 hover:border-blue-100 dark:hover:border-blue-900/30 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">User Command</label>
                        <textarea 
                          value={ex.user}
                          onChange={(e) => updateExample(idx, 'user', e.target.value)}
                          className="w-full bg-transparent border-none p-1 text-sm text-gray-700 dark:text-slate-300 outline-none focus:ring-0 resize-none min-h-[60px] placeholder:text-gray-300 dark:placeholder:text-slate-700"
                          placeholder="What the user says..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">AI Response</label>
                        <textarea 
                          value={ex.ai}
                          onChange={(e) => updateExample(idx, 'ai', e.target.value)}
                          className="w-full bg-transparent border-none p-1 text-sm text-gray-700 dark:text-slate-300 outline-none focus:ring-0 resize-none min-h-[60px] placeholder:text-gray-300 dark:placeholder:text-slate-700"
                          placeholder="How the AI should reply..."
                        />
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 grid grid-cols-2 gap-6 items-center">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-gray-400 dark:text-slate-600 uppercase tracking-widest ml-1 block mb-1">Intent</label>
                          <input 
                            type="text"
                            value={ex.intent || 'UNKNOWN'}
                            onChange={(e) => updateExample(idx, 'intent', e.target.value)}
                            className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold px-3 py-1 rounded-full border-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-800 outline-none uppercase"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => duplicateExample(idx)}
                          className="p-2 text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                          title="Duplicate"
                        >
                          <Copy size={16} />
                        </button>
                        <button 
                          onClick={() => removeExample(idx)}
                          className="p-2 text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!editingPersona.few_shot_examples || editingPersona.few_shot_examples.length === 0) && (
                  <div className="bg-gray-50 dark:bg-slate-800/20 border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-2xl py-12 text-center">
                    <Bot size={40} className="mx-auto text-gray-200 dark:text-slate-800 mb-4" />
                    <p className="text-gray-400 dark:text-slate-600 text-sm">No examples yet. Start training by adding one.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
