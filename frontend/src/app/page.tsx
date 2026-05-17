'use client'

import Workspace from '@/components/layout/Workspace'
import CommandCenter from '@/components/layout/CommandCenter'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

export default function Home() {
  const { theme } = useAppStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <main className={cn(
      "flex h-screen w-full overflow-hidden transition-colors duration-300",
      theme === 'dark' ? "dark bg-slate-950" : "bg-[#F8F9FA]"
    )}>
      {/* Command Center Area - 33% (1/3) */}
      <section className="w-1/3 h-full border-r border-gray-200 dark:border-slate-800">
        <CommandCenter />
      </section>

      {/* Workspace Area - 67% (2/3) */}
      <section className="w-2/3 h-full relative">
        <Workspace />
      </section>
    </main>
  )
}
