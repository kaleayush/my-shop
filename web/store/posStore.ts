'use client'

import { create } from 'zustand'

interface DraftBillTab {
  id: string
  draftNumber: string
  customerName?: string
}

interface PosState {
  activeTabs: DraftBillTab[]
  selectedTabId: string | null
  addTab: (tab: DraftBillTab) => void
  removeTab: (id: string) => void
  selectTab: (id: string) => void
}

export const usePosStore = create<PosState>((set) => ({
  activeTabs: [],
  selectedTabId: null,
  addTab: (tab) =>
    set((state) => ({
      activeTabs: [...state.activeTabs, tab],
      selectedTabId: tab.id,
    })),
  removeTab: (id) =>
    set((state) => {
      const remaining = state.activeTabs.filter((t) => t.id !== id)
      return {
        activeTabs: remaining,
        selectedTabId: remaining.length > 0 ? remaining[remaining.length - 1].id : null,
      }
    }),
  selectTab: (id) => set({ selectedTabId: id }),
}))
