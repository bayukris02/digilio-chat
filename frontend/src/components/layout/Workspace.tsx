'use client'

import React from 'react'
import { useAppStore, Tab } from '@/store/useAppStore'
import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import DynamicForm from '@/components/ui/DynamicForm'
import DynamicTable from '@/components/ui/DynamicTable'
import AIPromptEditor from '@/components/ui/AIPromptEditor'
import VisualFormBuilder from '@/components/ui/VisualFormBuilder'
import KnowledgeBase from '@/components/ui/KnowledgeBase'
import Onboarding from '@/components/ui/Onboarding'
import DataMigration from '@/components/ui/DataMigration'
import { FORM_SCHEMAS } from '@/schemas/forms'

export default function Workspace() {
  const { tabs, activeTabId, setActiveTab, removeTab, addTab } = useAppStore()

  const activeTab = tabs.find(t => t.id === activeTabId)

  const handleAddDummyTab = () => {
    const id = `tab-${Date.now()}`
    addTab({
      id,
      title: `New Tab ${tabs.length}`,
      type: 'dashboard'
    })
  }

  const renderTabContent = () => {
    if (!activeTab) return (
      <div className="h-full flex items-center justify-center text-gray-400">
        No tabs open. Use the Command Center or the + button to start.
      </div>
    )

    if (activeTab.type === 'form' && activeTab.schemaId) {
      const schema = FORM_SCHEMAS[activeTab.schemaId]
      if (schema) {
        return (
          <div className="max-w-4xl mx-auto py-8">
            <DynamicForm schema={schema} prefillData={activeTab.prefillData} tabId={activeTab.id} />
          </div>
        )
      }
    }

    if (activeTab.type === 'report') {
      return (
        <div className="max-w-6xl mx-auto py-8">
          <DynamicTable />
        </div>
      )
    }

    if (activeTab.type === 'ai-editor') {
      if (activeTab.schemaId) {
        return <VisualFormBuilder moduleName={activeTab.schemaId} />
      }
      return null
    }

    if (activeTab.type === 'knowledge-base') {
      return <KnowledgeBase />
    }

    if (activeTab.type === 'onboarding') {
      return <Onboarding />
    }

    if (activeTab.type === 'migration') {
      return <DataMigration moduleName={activeTab.schemaId || 'unknown'} />
    }

    return (
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">
          {activeTab.title} Content
        </h1>
        <div className="p-8 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-500 min-h-[400px]">
          <p className="text-lg">Workspace Area (75% Screen)</p>
          <p className="text-sm">Dynamic content for {activeTabId} will be rendered here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Tab Header - Google Modern Style */}
      <div className="flex items-center bg-gray-50/50 dark:bg-slate-950/50 border-b border-gray-100 dark:border-slate-800 overflow-x-auto no-scrollbar px-4 pt-3 pb-1 gap-1">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center px-4 py-2 cursor-pointer transition-all duration-300 rounded-t-[12px] min-w-[140px] max-w-[220px] group relative border-x border-t border-transparent",
              activeTabId === tab.id 
                ? "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-blue-600 dark:text-blue-400 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]" 
                : "text-gray-500 dark:text-slate-500 hover:bg-gray-100/50 dark:hover:bg-slate-800/50"
            )}
          >
            {/* Active Indicator Line */}
            {activeTabId === tab.id && (
              <div className="absolute -top-[1px] left-0 right-0 h-[2px] bg-blue-600 dark:bg-blue-500 rounded-t-full" />
            )}
            
            <span className="truncate flex-1 text-xs font-semibold tracking-tight">{tab.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeTab(tab.id)
              }}
              className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-all"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <button 
          onClick={handleAddDummyTab}
          className="p-2 ml-2 hover:bg-gray-200/50 dark:hover:bg-slate-800/50 rounded-full transition-colors group"
          title="Add New View"
        >
          <Plus size={18} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
        </button>
      </div>

      {/* Content Area - Minimalist Google Style */}
      <div className="flex-1 p-8 overflow-auto bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto h-full">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}
