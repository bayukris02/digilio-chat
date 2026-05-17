'use client'

import React, { useState, useEffect } from 'react'
import AIPromptEditor from '@/components/ui/AIPromptEditor'
import IntentList from '@/components/ui/IntentList'
import KnowledgeBase from '@/components/ui/KnowledgeBase'
import { useAppStore } from '@/store/useAppStore'
import { 
  Settings, 
  ShieldCheck, 
  ArrowLeft, 
  Bot, 
  Database, 
  History, 
  Users, 
  Lock, 
  Search,
  LayoutDashboard,
  Bell,
  HelpCircle,
  Moon,
  Sun,
  Zap,
  Package,
  BadgeDollarSign,
  ShoppingCart
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function SettingPage() {
  const { setPersonas, theme, toggleTheme } = useAppStore()
  const [activeMenu, setActiveMenu] = useState('ai-personas')
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['intents'])
  const [mounted, setMounted] = useState(false)

  const toggleExpand = (id: string) => {
    setExpandedMenus(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  // Fetch Personas on Mount
  useEffect(() => {
    if (!mounted) return
    const fetchPersonas = async () => {
      try {
        const response = await fetch('http://localhost:9005/api/personas')
        if (response.ok) {
          const data = await response.json()
          setPersonas(data)
        }
      } catch (error) {
        console.error("Failed to fetch personas", error)
      }
    }
    fetchPersonas()
  }, [mounted, setPersonas])

  const menuItems = [
    { id: 'ai-personas', label: 'AI Personas', icon: Bot },
    { 
      id: 'intents', 
      label: 'System Intents', 
      icon: Zap,
      subItems: [
        { id: 'intent-purchase', label: 'Purchase', icon: ShoppingCart },
      ]
    },
    { id: 'knowledge', label: 'Knowledge Base', icon: Database },
  ]

  return (
    <div className={cn(
      "min-h-screen flex flex-col font-sans transition-colors duration-300", 
      theme === 'dark' ? "dark bg-slate-950 text-slate-100" : "bg-[#F8F9FA] text-gray-900"
    )}>
      {/* Top Navbar - Google Style */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full cursor-pointer transition-colors text-gray-600 dark:text-slate-400">
            <LayoutDashboard size={24} />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xl font-medium text-gray-700 dark:text-slate-200">Digilio</span>
            <span className="text-xl text-gray-500 dark:text-slate-500 font-light italic">Admin</span>
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Search settings..."
              className="w-full bg-[#F1F3F4] dark:bg-slate-800 border-none rounded-lg py-2 pl-12 pr-4 text-sm focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:shadow-sm transition-all outline-none dark:text-slate-200 dark:placeholder-slate-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-600 dark:text-slate-400 transition-colors"
            title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-600 dark:text-slate-400 transition-colors">
            <Bell size={20} />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-600 dark:text-slate-400 transition-colors">
            <HelpCircle size={20} />
          </button>
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold ml-2 cursor-pointer border-4 border-blue-50">
            A
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Google Style */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col py-4 overflow-y-auto transition-colors">
          <div className="px-4 mb-6">
            <Link 
              href="/"
              className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <ArrowLeft size={18} />
              Return to App
            </Link>
          </div>

          <nav className="flex-1 space-y-0.5">
            {menuItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => item.subItems ? toggleExpand(item.id) : setActiveMenu(item.id)}
                  className={cn(
                    "w-full flex items-center gap-4 px-6 py-2.5 text-sm font-medium transition-all relative",
                    activeMenu === item.id || (item.subItems && activeMenu.startsWith('intent-'))
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10" 
                      : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                  )}
                >
                  {activeMenu === item.id && !item.subItems && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
                  )}
                  <item.icon size={18} className={activeMenu === item.id || (item.subItems && activeMenu.startsWith('intent-')) ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-slate-600"} />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>

                {/* Render Sub-items if expanded */}
                {item.subItems && expandedMenus.includes(item.id) && (
                  <div className="mt-1 mb-2">
                    {item.subItems.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => setActiveMenu(sub.id)}
                        className={cn(
                          "w-full flex items-center gap-3 pl-14 pr-6 py-2 text-xs font-medium transition-all relative",
                          activeMenu === sub.id 
                            ? "text-blue-600 dark:text-blue-400" 
                            : "text-gray-500 dark:text-slate-500 hover:text-gray-900 dark:hover:text-slate-300"
                        )}
                      >
                        {activeMenu === sub.id && (
                          <div className="absolute left-[30px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                        )}
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="p-6 border-t border-gray-100 dark:border-slate-800">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300">Privileged Session</span>
              </div>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 leading-relaxed font-medium">
                Admin mode active. All changes are logged for security compliance.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-950 transition-colors">
          <div className="max-w-6xl mx-auto py-10 px-8">
            {/* Page Header - Refined Google Style */}
            <div className="mb-10">
              <h2 className="text-3xl font-light text-gray-900 dark:text-slate-100 mb-3 tracking-tight">
                {menuItems.find(m => m.id === activeMenu)?.label}
              </h2>
              <p className="text-base text-gray-500 dark:text-slate-400 font-normal max-w-2xl leading-relaxed">
                Configure your system parameters, manage AI personas, and monitor platform health from a centralized administration console.
              </p>
            </div>

            {/* Content Container - No nested card shadow for a flatter, more modern look */}
            <div className="border border-gray-100 dark:border-slate-800 rounded-[28px] overflow-hidden min-h-[700px] bg-white dark:bg-slate-900 transition-colors duration-300">
              {activeMenu === 'ai-personas' ? (
                <AIPromptEditor />
              ) : activeMenu === 'knowledge' ? (
                <KnowledgeBase />
              ) : activeMenu.startsWith('intent-') ? (
                <IntentList initialModule={activeMenu.replace('intent-', '')} key={activeMenu} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <Settings size={40} className="text-gray-300 dark:text-slate-700 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 dark:text-slate-200 mb-2">Module Under Construction</h3>
                  <p className="text-gray-500 dark:text-slate-400 max-w-sm mx-auto text-sm leading-relaxed">
                    We are currently building this settings module to meet Google's high standards of simplicity and utility.
                  </p>
                  <button 
                    onClick={() => setActiveMenu('ai-personas')}
                    className="mt-8 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-all hover:shadow-lg active:scale-95"
                  >
                    Go back to AI Personas
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-8 text-center text-gray-400 dark:text-slate-600 text-xs flex items-center justify-center gap-4">
              <span className="hover:text-gray-600 dark:hover:text-slate-400 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="text-gray-300 dark:text-slate-800">•</span>
              <span className="hover:text-gray-600 dark:hover:text-slate-400 cursor-pointer transition-colors">Terms of Service</span>
              <span className="text-gray-300 dark:text-slate-800">•</span>
              <span className="hover:text-gray-600 dark:hover:text-slate-400 cursor-pointer transition-colors">Digilio v1.4.2</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
