import { create } from 'zustand';

export const useWorkspaceStore = create((set, get) => ({
  pages: [],
  activePage: null,
  activeView: null,
  views: [],
  sidebarOpen: true,
  loading: true,

  loadPages: async () => {
    set({ loading: true });
    try {
      const res = await window.api.getPages();
      if (res.success && res.data) {
        const pages = res.data;
        const currentActive = get().activePage;
        let newActive = currentActive ? pages.find(p => p.id === currentActive.id) : null;
        if (!newActive && pages.length > 0) {
          newActive = pages[0];
        }
        set({ pages, activePage: newActive, loading: false });
        if (newActive) {
          await get().loadViews(newActive.id);
        }
      } else {
        set({ loading: false });
      }
    } catch (err) {
      console.error('loadPages error:', err);
      set({ loading: false });
    }
  },

  setActivePage: async (pageId) => {
    const page = get().pages.find((p) => p.id === pageId);
    if (!page) return;
    set({ activePage: page });
    await get().loadViews(pageId);
  },

  createPage: async (title = 'Untitled', icon = '📄') => {
    try {
      const res = await window.api.createPage({ title, icon });
      if (res.success && res.data) {
        const newPage = res.data;
        set((state) => ({
          pages: [...state.pages, newPage],
          activePage: newPage,
        }));
        await get().loadViews(newPage.id);
        return newPage;
      }
    } catch (err) {
      console.error('createPage error:', err);
    }
  },

  updatePage: async (id, changes) => {
    try {
      set((state) => ({
        pages: state.pages.map((p) => (p.id === id ? { ...p, ...changes } : p)),
        activePage: state.activePage?.id === id ? { ...state.activePage, ...changes } : state.activePage,
      }));
      await window.api.updatePage(id, changes);
    } catch (err) {
      console.error('updatePage error:', err);
    }
  },

  deletePage: async (id) => {
    try {
      const state = get();
      const remainingPages = state.pages.filter((p) => p.id !== id);
      let nextActive = null;
      if (state.activePage?.id === id) {
        nextActive = remainingPages.length > 0 ? remainingPages[0] : null;
      } else {
        nextActive = state.activePage;
      }

      set({
        pages: remainingPages,
        activePage: nextActive,
      });

      await window.api.deletePage(id);
      if (nextActive) {
        await get().loadViews(nextActive.id);
      } else {
        set({ views: [], activeView: null });
      }
    } catch (err) {
      console.error('deletePage error:', err);
    }
  },

  reorderPages: async (orderedIds) => {
    try {
      const pageMap = new Map(get().pages.map((p) => [p.id, p]));
      const newPages = orderedIds.map((id, index) => ({
        ...pageMap.get(id),
        sort_order: index,
      })).filter(Boolean);

      set({ pages: newPages });
      await window.api.reorderPages(orderedIds);
    } catch (err) {
      console.error('reorderPages error:', err);
    }
  },

  loadViews: async (pageId) => {
    try {
      const res = await window.api.getViewsByPage(pageId);
      if (res.success && res.data) {
        const views = res.data;
        const currentActive = get().activeView;
        let newActive = currentActive ? views.find((v) => v.id === currentActive.id) : null;
        if (!newActive && views.length > 0) {
          const defaultView = views.find((v) => v.is_default) || views[0];
          newActive = defaultView;
        }
        set({ views, activeView: newActive });
      }
    } catch (err) {
      console.error('loadViews error:', err);
    }
  },

  setActiveView: (viewId) => {
    const view = get().views.find((v) => v.id === viewId);
    if (view) {
      set({ activeView: view });
    }
  },

  createView: async (pageId, type) => {
    try {
      const res = await window.api.createView({ pageId, type });
      if (res.success && res.data) {
        const newView = res.data;
        set((state) => ({
          views: [...state.views, newView],
          activeView: newView,
        }));
        return newView;
      }
    } catch (err) {
      console.error('createView error:', err);
    }
  },

  updateView: async (id, changes) => {
    try {
      set((state) => ({
        views: state.views.map((v) => (v.id === id ? { ...v, ...changes } : v)),
        activeView: state.activeView?.id === id ? { ...state.activeView, ...changes } : state.activeView,
      }));
      await window.api.updateView(id, changes);
    } catch (err) {
      console.error('updateView error:', err);
    }
  },

  deleteView: async (id) => {
    try {
      const state = get();
      if (state.views.length <= 1) return; // Keep at least one view
      const remainingViews = state.views.filter((v) => v.id !== id);
      let nextActive = null;
      if (state.activeView?.id === id) {
        nextActive = remainingViews[0];
      } else {
        nextActive = state.activeView;
      }

      set({
        views: remainingViews,
        activeView: nextActive,
      });

      await window.api.deleteView(id);
    } catch (err) {
      console.error('deleteView error:', err);
    }
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },
}));
