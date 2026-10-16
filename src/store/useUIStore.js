import { create } from 'zustand';

export const useUIStore = create((set) => ({
  commandPaletteOpen: false,
  contextMenu: null,
  modal: null,
  searchQuery: '',
  searchResults: [],
  draggedTask: null,

  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false, searchQuery: '', searchResults: [] }),

  openContextMenu: (x, y, items) => set({ contextMenu: { x, y, items } }),
  closeContextMenu: () => set({ contextMenu: null }),

  openModal: (type, props = {}) => set({ modal: { type, props } }),
  closeModal: () => set({ modal: null }),

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),

  setDraggedTask: (task) => set({ draggedTask: task }),
  clearDraggedTask: () => set({ draggedTask: null }),
}));
