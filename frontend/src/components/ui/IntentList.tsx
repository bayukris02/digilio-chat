'use client'

import React, { useState, useEffect } from 'react'
import { 
  Zap, 
  Package, 
  BadgeDollarSign, 
  ShoppingCart, 
  Settings, 
  Search, 
  ChevronRight,
  Plus,
  Eye,
  Edit,
  Trash2,
  Box,
  Tags,
  Ruler,
  Users,
  Briefcase
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Centralized Data Definition - Only showing functional modules
const MODULES: any[] = [
  { 
    id: 'purchase', 
    label: 'Purchase', 
    icon: ShoppingCart, 
    color: 'text-amber-600',
    objects: [
      { id: 'po', label: 'Purchase Order', icon: ShoppingCart, fields: ['vendor_name', 'item_name', 'quantity', 'price', 'notes'] },
    ]
  }
]

interface IntentListProps {
  initialModule: string;
}

export default function IntentList({ initialModule }: IntentListProps) {
  const currentModule = MODULES.find(m => m.id === initialModule) || MODULES[0]
  const [activeObjectId, setActiveObjectId] = useState(currentModule.objects[0].id)
  const [searchTerm, setSearchTerm] = useState('')

  const activeObject = currentModule.objects.find((o: any) => o.id === activeObjectId) || currentModule.objects[0]

  return (
    <div className="flex h-full bg-white dark:bg-slate-900 transition-colors">
      {/* Sidebar: Objects List (Refactored to be internal menu) */}
      <aside className="w-72 border-r border-gray-100 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900">
        <div className="p-6 flex items-center justify-between border-b border-gray-50 dark:border-slate-800">
          <span className="text-sm font-bold text-gray-900 dark:text-slate-100 uppercase tracking-widest">{currentModule.label} Objects</span>
        </div>
        
        <div className="p-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder={`Filter ${currentModule.label} objects...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-md py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-blue-500 outline-none dark:text-slate-200"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {currentModule.objects
            .filter((o: any) => o.label.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((obj: any) => (
            <button
              key={obj.id}
              onClick={() => setActiveObjectId(obj.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-r-full text-sm font-medium transition-all group",
                activeObjectId === obj.id 
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" 
                  : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50"
              )}
            >
              <obj.icon size={18} className={activeObjectId === obj.id ? "text-blue-600 dark:text-blue-400" : "text-gray-400"} />
              <span className="flex-1 text-left">{obj.label}</span>
              <ChevronRight size={14} className={cn(
                "transition-transform",
                activeObjectId === obj.id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
              )} />
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content: Intent Cards for Active Object */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#F8F9FA] dark:bg-slate-950/50">
        <header className="px-8 py-6 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center bg-blue-50 dark:bg-blue-900/30")}>
              <activeObject.icon size={22} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-normal text-gray-900 dark:text-slate-100">{activeObject.label} Operations</h3>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">CRUD intents mapping for the {activeObject.label} entity.</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CREATE Intent */}
                <IntentCard 
                  intent={`CREATE_${activeObject.id.toUpperCase()}`} 
                  action="Create" 
                  icon={Plus} 
                  color="blue"
                  fields={activeObject.fields}
                />
                {/* VIEW Intent */}
                <IntentCard 
                  intent={`VIEW_${activeObject.id.toUpperCase()}`} 
                  action="Read" 
                  icon={Eye} 
                  color="green"
                />
                {/* UPDATE Intent */}
                <IntentCard 
                  intent={`UPDATE_${activeObject.id.toUpperCase()}`} 
                  action="Update" 
                  icon={Edit} 
                  color="amber"
                />
                {/* DELETE Intent */}
                <IntentCard 
                  intent={`DELETE_${activeObject.id.toUpperCase()}`} 
                  action="Delete" 
                  icon={Trash2} 
                  color="red"
                />
              </div>

              {/* Developer Info Card */}
              <div className="mt-12 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                <div className="flex items-start gap-5">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h5 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">Intent Architecture</h5>
                    <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                      These intents are recognized by the AI's NLP engine. When a user says something like 
                      <code className="mx-1 px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 rounded text-blue-600 dark:text-blue-400 font-mono">"tambah {activeObject.label.toLowerCase()} baru"</code>, 
                      the system maps it to <code className="mx-1 px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 rounded text-blue-600 dark:text-blue-400 font-mono">CREATE_{activeObject.id.toUpperCase()}</code>.
                    </p>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function IntentCard({ intent, action, icon: Icon, color, fields }: any) {
  const colorMap: any = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30",
    green: "text-green-600 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30",
    amber: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30",
    red: "text-red-600 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30",
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[24px] p-6 hover:shadow-lg transition-all group">
      <div className="flex items-center justify-between mb-6">
        <div className={cn("p-3 rounded-xl", colorMap[color])}>
          <Icon size={22} />
        </div>
        <span className="text-[10px] font-bold text-gray-400 dark:text-slate-600 uppercase tracking-widest">{action} Task</span>
      </div>
      
      <h5 className="text-sm font-bold text-gray-900 dark:text-slate-100 font-mono mb-3 truncate group-hover:text-blue-600 transition-colors">
        {intent}
      </h5>

      {fields ? (
        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-slate-800">
          <p className="text-[10px] font-bold text-gray-400 dark:text-slate-600 uppercase mb-3 tracking-tight">Required Fields for Extraction</p>
          <div className="flex flex-wrap gap-2">
            {fields.map((f: string) => (
              <span key={f} className="text-[10px] bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-2 py-1 rounded-lg border border-gray-100 dark:border-slate-700 font-medium">
                {f}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-slate-800">
          <p className="text-[10px] text-gray-400 dark:text-slate-500 italic">No extraction fields defined for this action.</p>
        </div>
      )}
    </div>
  )
}
