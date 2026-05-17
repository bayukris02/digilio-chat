'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, Loader2, Paperclip, Settings, Moon, Sun } from 'lucide-react'

import { useAppStore } from '@/store/useAppStore'
import { INTENT_TO_SCHEMA, FORM_SCHEMAS } from '@/schemas/forms'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'ai';
  content: string;
  intent?: string;
  timestamp: string;
}

export default function CommandCenter() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const { 
    tabs, 
    activeTabId, 
    addTab, 
    updateTabPrefillData, 
    setLastUserCommand, 
    requestSaveForTab, 
    systemFeedback, 
    setSystemFeedback,
    theme,
    toggleTheme,
    personas,
    setPersonas,
    selectedPersonaId,
    setSelectedPersonaId,
    userRole,
    setUserRole,
    allowedModules,
    setAllowedModules
  } = useAppStore()

  // Handle Role Change for Testing
  const handleRoleChange = (role: string) => {
    setUserRole(role)
    if (role === 'admin') {
      setAllowedModules(['all'])
    } else if (role === 'operator') {
      setAllowedModules(['CREATE_PO', 'VIEW_DASHBOARD']) // Limited
    } else if (role === 'finance') {
      setAllowedModules(['VIEW_REPORT', 'APPROVE_PO'])
    }
  }

  // Fetch Personas on Mount
  useEffect(() => {
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
  }, [])

  // Handle System Feedback (Looping back form results to AI)
  useEffect(() => {
    const processFeedback = async () => {
      if (systemFeedback) {
        setIsProcessing(true)
        try {
          const response = await fetch('http://localhost:9005/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              message: `SYSTEM_FEEDBACK: ${systemFeedback}`,
              persona_id: selectedPersonaId,
              user_role: userRole,
              allowed_modules: allowedModules
            }),
          })
          
          if (response.ok) {
            const data = await response.json()
            setMessages(prev => [...prev, { 
              role: 'ai', 
              content: data.message, 
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }])
          }
        } catch (error) {
          console.error("Failed to process system feedback", error)
        } finally {
          setIsProcessing(false)
          setSystemFeedback(null)
        }
      }
    }
    
    processFeedback()
  }, [systemFeedback, selectedPersonaId])

  // Fix Hydration issues by only rendering initial message on client
  useEffect(() => {
    setMounted(true)
    setMessages([
      {
        role: 'ai',
        content: "Hello! I'm your AI Business Consultant. How can I help you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ])
  }, [])

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isProcessing])

  if (!mounted) return <div className="flex flex-col h-full bg-slate-50 shadow-inner" />

  const handleAiResponse = (data: any, skipAddingMessage: boolean = false) => {
    if (!skipAddingMessage) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: data.message, 
        intent: data.intent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    }

    // Auto-Navigation & Save Logic
    if (data.intent === 'CONFIRM_SAVE') {
      if (activeTabId) {
        requestSaveForTab(activeTabId)
      }
    } else if (data.intent === 'VIEW_REPORT') {
      addTab({
        id: `report-po-${Date.now()}`,
        title: 'Daftar Purchase Order',
        type: 'report'
      })
    } else if (data.intent && data.intent === 'EDIT_AI_PROMPT') {
       window.open('/setting', '_blank')
    } else if (data.intent && data.intent === 'MANAGE_KNOWLEDGE') {
       addTab({
         id: 'knowledge-base',
         title: 'Knowledge Base',
         type: 'knowledge-base'
      })
    } else if (data.intent && data.intent === 'SETUP_SYSTEM') {
      addTab({
         id: 'onboarding',
         title: 'AI Onboarding',
         type: 'onboarding'
      })
    } else if (data.intent && data.intent === 'MIGRATE_DATA') {
      addTab({
         id: 'data-migration',
         title: 'Data Migration',
         type: 'migration',
         schemaId: 'purchase_order' // Default for now
      })
    } else if (data.intent && INTENT_TO_SCHEMA[data.intent]) {
      const schemaId = INTENT_TO_SCHEMA[data.intent]
      const schema = FORM_SCHEMAS[schemaId]
      
      if (schema) {
        const existingTab = tabs.find(t => t.type === 'form' && t.schemaId === schemaId)
        if (existingTab) {
          updateTabPrefillData(existingTab.id, data.entities)
        } else {
          addTab({
            id: `tab-${schemaId}-${Date.now()}`,
            title: schema.title,
            type: 'form',
            schemaId: schemaId,
            prefillData: data.entities
          })
        }
      }
    }
  }

  const handleChatFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || isProcessing) return

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: `📄 [Lampiran: ${file.name}] - Tolong analisis dokumen ini.`, 
      timestamp 
    }])
    
    setIsProcessing(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('user_role', userRole)

    try {
      const response = await fetch('http://localhost:9005/api/ocr/process', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Gagal memproses dokumen')

      const result = await response.json()
      handleAiResponse(result.nlp_analysis)

    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "Maaf, saya gagal memproses file tersebut. Pastikan formatnya benar.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    } finally {
      setIsProcessing(false)
      if (e.target) e.target.value = ''
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return

    const userMsg = input.trim()
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp }])
    setLastUserCommand(userMsg)
    setInput('')
    setIsProcessing(true)

    // Add a placeholder AI message for streaming
    setMessages(prev => [...prev, { 
      role: 'ai', 
      content: '', 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }])

    try {
      const response = await fetch('http://localhost:9005/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMsg,
          persona_id: selectedPersonaId,
          user_role: userRole,
          allowed_modules: allowedModules
        }),
      })

      if (!response.ok) throw new Error('Failed to connect to AI')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value, { stream: true })
          fullContent += chunk
          
          // Try to extract clean message if it's already in JSON format
          // or just show the raw chunk if it's streaming text
          setMessages(prev => {
            const newMessages = [...prev]
            const lastMsg = newMessages[newMessages.length - 1]
            if (lastMsg && lastMsg.role === 'ai') {
              lastMsg.content = fullContent
            }
            return newMessages
          })
        }
      }

      // After streaming finishes, attempt to parse JSON to trigger intents/actions
      try {
        // Find the JSON block if AI added extra text
        const jsonMatch = fullContent.match(/\{[\s\S]*\}/)
        const jsonStr = jsonMatch ? jsonMatch[0] : fullContent
        const data = JSON.parse(jsonStr)
        
        if (data.message) {
           setMessages(prev => {
            const newMessages = [...prev]
            const lastMsg = newMessages[newMessages.length - 1]
            if (lastMsg && lastMsg.role === 'ai') {
              lastMsg.content = data.message
              lastMsg.intent = data.intent
            }
            return newMessages
          })
          handleAiResponse(data, true)
        }
      } catch (e) {
        console.log("Not a JSON response or parsing failed", e)
      }

    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "Sorry, I'm having trouble connecting to my brain right now. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Header - Google Style */}
      <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex flex-col gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-gray-900 dark:text-slate-100 tracking-tight leading-none">Command Center</h2>
              <p className="text-[10px] text-gray-500 dark:text-slate-400 flex items-center gap-1.5 font-medium mt-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                AI Agentic Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Theme Toggle in Main UI */}
            <button 
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
              title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button 
              onClick={() => window.open('/setting', '_blank')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
              title="AI Configuration"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
        
        {/* Row 2: Selectors - Modern Pill Style */}
        <div className="flex items-center gap-2">
          <select 
            value={userRole || 'admin'} 
            onChange={(e) => handleRoleChange(e.target.value)}
            className="flex-1 text-[10px] font-bold uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-none rounded-full px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer appearance-none text-center transition-all"
          >
            <option value="admin">Admin Role</option>
            <option value="operator">Operator Role</option>
            <option value="finance">Finance Role</option>
          </select>
          <select 
            value={String(selectedPersonaId || '')} 
            onChange={(e) => setSelectedPersonaId(e.target.value)}
            className="flex-[1.5] text-[10px] font-medium bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-none rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer truncate text-center transition-all"
          >
            <option value="" disabled>Select AI Persona</option>
            {personas.map(p => (
              <option key={p.id} value={String(p.id)}>{p.persona_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Message History - Light Google Background */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8F9FA] dark:bg-slate-950/50 transition-colors duration-300">
        {messages.map((msg, idx) => (
          <div key={idx} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm transition-colors duration-300",
              msg.role === 'ai' ? "bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700" : "bg-blue-600 shadow-blue-100"
            )}>
              {msg.role === 'ai' ? <Bot size={16} className="text-blue-600 dark:text-blue-400" /> : <User size={16} className="text-white" />}
            </div>
            <div className={cn(
              "p-4 rounded-[20px] max-w-[85%] text-sm leading-relaxed shadow-sm transition-all duration-300",
              msg.role === 'ai' 
                ? "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-tl-none border border-gray-100 dark:border-slate-700" 
                : "bg-blue-600 text-white rounded-tr-none border-blue-600"
            )}>
              <p>{msg.content}</p>
              {msg.intent && msg.intent !== 'UNKNOWN' && (
                <div className={cn(
                  "mt-3 pt-3 border-t flex items-center gap-2",
                  msg.role === 'ai' ? "border-gray-50 dark:border-slate-700" : "border-white/10"
                )}>
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                    msg.role === 'ai' ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-white/20 text-white"
                  )}>
                    {msg.intent}
                  </span>
                </div>
              )}
              <p className={cn(
                "text-[10px] mt-2 font-medium opacity-50",
                msg.role === 'ai' ? "text-gray-400 dark:text-slate-500" : "text-white"
              )}>
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Bot size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-[20px] rounded-tl-none border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
              <Loader2 size={16} className="animate-spin text-blue-600 dark:text-blue-400" />
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium tracking-wide">AI is thinking...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input Area - Floating Bar Style */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 transition-colors duration-300">
        <form onSubmit={handleSend} className="relative flex items-end gap-2 max-w-2xl mx-auto">
          <div className="relative flex-1 group">
             <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything or give a command..."
                className="w-full bg-gray-100 dark:bg-slate-800 border-none rounded-[28px] py-4 pl-12 pr-12 text-sm text-gray-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-900 transition-all duration-300 outline-none resize-none min-h-[56px] max-h-[200px] leading-relaxed"
                rows={1}
                disabled={isProcessing}
                onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend(e)
                }
                }}
            />
            {/* Attachment Button */}
            <label className={cn(
                "absolute left-3 bottom-3 p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-all duration-300 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600",
                isProcessing && "opacity-50 cursor-not-allowed"
            )}>
                <Paperclip size={20} />
                <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*,.pdf" 
                    onChange={handleChatFileUpload}
                    disabled={isProcessing}
                />
            </label>
            
            <button
                type="submit"
                className={cn(
                  "absolute right-2 bottom-2.5 p-2 rounded-full transition-all duration-300",
                  !input.trim() || isProcessing 
                    ? "text-gray-300 dark:text-slate-600 bg-transparent" 
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none"
                )}
                disabled={!input.trim() || isProcessing}
            >
                <Send size={18} />
            </button>
          </div>
        </form>
        <p className="text-[10px] text-center text-gray-400 dark:text-slate-600 mt-3 font-medium tracking-tight">
          Powered by Digilio Agentic Core &bull; 2026
        </p>
      </div>
    </div>
  )
}
