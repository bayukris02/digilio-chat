import { create } from 'zustand'

export interface Tab {
  id: string;
  title: string;
  type: 'dashboard' | 'form' | 'report' | 'ai-editor' | 'knowledge-base' | 'onboarding' | 'migration';
  schemaId?: string;
  prefillData?: Record<string, any>;
}

export interface Persona {
  id: string;
  persona_name: string;
  system_instruction: string;
  few_shot_examples: any[];
  is_default: boolean;
}

interface AppState {
  tabs: Tab[];
  activeTabId: string | null;
  lastUserCommand: string | null;
  saveRequestedForTab: string | null;
  personas: Persona[];
  selectedPersonaId: string | null;
  userRole: string;
  allowedModules: string[];
  addTab: (tab: Tab) => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabPrefillData: (id: string, newData: Record<string, any>) => void;
  setLastUserCommand: (command: string) => void;
  requestSaveForTab: (tabId: string | null) => void;
  systemFeedback: string | null;
  theme: 'light' | 'dark';
  setSystemFeedback: (feedback: string | null) => void;
  toggleTheme: () => void;
  setPersonas: (personas: Persona[]) => void;
  setSelectedPersonaId: (id: string) => void;
  setUserRole: (role: string) => void;
  setAllowedModules: (modules: string[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  tabs: [
    { id: 'welcome', title: 'Welcome', type: 'dashboard' }
  ],
  activeTabId: 'welcome',
  lastUserCommand: null,
  saveRequestedForTab: null,
  systemFeedback: null,
  theme: 'light',
  personas: [],
  selectedPersonaId: null,
  userRole: 'admin',
  allowedModules: ['all'],
  addTab: (tab) => set((state) => {
    const exists = state.tabs.find(t => t.id === tab.id);
    if (exists) return { activeTabId: tab.id };
    return { 
      tabs: [...state.tabs, tab],
      activeTabId: tab.id
    };
  }),
  removeTab: (id) => set((state) => {
    const newTabs = state.tabs.filter(t => t.id !== id);
    let newActiveId = state.activeTabId;
    if (state.activeTabId === id) {
      newActiveId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
    }
    return { tabs: newTabs, activeTabId: newActiveId };
  }),
  setActiveTab: (id) => set({ activeTabId: id }),
  updateTabPrefillData: (id, newData) => set((state) => ({
    tabs: state.tabs.map(tab => 
      tab.id === id 
        ? { ...tab, prefillData: { ...tab.prefillData, ...newData } }
        : tab
    ),
    activeTabId: id // Ensure the updated tab becomes active
  })),
  setLastUserCommand: (command) => set({ lastUserCommand: command }),
  requestSaveForTab: (tabId) => set({ saveRequestedForTab: tabId }),
  setSystemFeedback: (feedback) => set({ systemFeedback: feedback }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  setPersonas: (personas) => set((state) => ({ 
    personas, 
    selectedPersonaId: state.selectedPersonaId || personas.find(p => p.is_default)?.id || (personas.length > 0 ? personas[0].id : null) 
  })),
  setSelectedPersonaId: (id) => set({ selectedPersonaId: id }),
  setUserRole: (role) => set({ userRole: role }),
  setAllowedModules: (modules) => set({ allowedModules: modules }),
}))
