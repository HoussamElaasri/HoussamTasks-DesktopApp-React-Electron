import { create } from 'zustand';

let saveDebounceTimer = null;

export const useTaskStore = create((set, get) => ({
  tasks: [],
  dirtyTaskIds: new Set(),
  saving: false,
  lastSaved: null,
  activeTaskId: null, // For task detail panel

  setActiveTaskId: (taskId) => {
    set({ activeTaskId: taskId });
  },

  loadTasks: async (pageId) => {
    if (!pageId) {
      set({ tasks: [] });
      return;
    }
    try {
      const res = await window.api.getTasksByPage(pageId);
      if (res.success && res.data) {
        set({ tasks: res.data });
      }
    } catch (err) {
      console.error('loadTasks error:', err);
    }
  },

  createTask: async (taskData) => {
    try {
      const res = await window.api.createTask(taskData);
      if (res.success && res.data) {
        const newTask = res.data;
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
        return newTask;
      }
    } catch (err) {
      console.error('createTask error:', err);
    }
  },

  updateTask: (id, changes) => {
    set((state) => {
      const nextDirty = new Set(state.dirtyTaskIds);
      nextDirty.add(id);
      return {
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...changes } : t)),
        dirtyTaskIds: nextDirty,
      };
    });
    get()._scheduleSave();
  },

  moveTask: (id, newStatus, newSortOrder = null) => {
    const changes = { status: newStatus };
    if (newSortOrder !== null) {
      changes.sort_order = newSortOrder;
    }
    get().updateTask(id, changes);
  },

  reorderTasks: (orderedIds) => {
    set((state) => {
      const nextDirty = new Set(state.dirtyTaskIds);
      const idMap = new Map(orderedIds.map((id, index) => [id, index]));
      const updated = state.tasks.map((t) => {
        if (idMap.has(t.id)) {
          const newOrder = idMap.get(t.id);
          if (t.sort_order !== newOrder) {
            nextDirty.add(t.id);
            return { ...t, sort_order: newOrder };
          }
        }
        return t;
      });
      return {
        tasks: updated,
        dirtyTaskIds: nextDirty,
      };
    });
    get()._scheduleSave();
  },

  deleteTask: async (id) => {
    set((state) => {
      const nextDirty = new Set(state.dirtyTaskIds);
      nextDirty.delete(id);
      return {
        tasks: state.tasks.filter((t) => t.id !== id),
        dirtyTaskIds: nextDirty,
        activeTaskId: state.activeTaskId === id ? null : state.activeTaskId,
      };
    });
    try {
      await window.api.deleteTask(id);
    } catch (err) {
      console.error('deleteTask error:', err);
    }
  },

  _scheduleSave: () => {
    if (saveDebounceTimer) {
      clearTimeout(saveDebounceTimer);
    }
    saveDebounceTimer = setTimeout(() => {
      get()._flushSave();
    }, 300);
  },

  _flushSave: async () => {
    const { dirtyTaskIds, tasks } = get();
    if (!dirtyTaskIds || dirtyTaskIds.size === 0) return;

    set({ saving: true });
    const dirtyTasks = tasks.filter((t) => dirtyTaskIds.has(t.id));

    try {
      await window.api.updateTasks(dirtyTasks);
      set({
        dirtyTaskIds: new Set(),
        saving: false,
        lastSaved: Date.now(),
      });
    } catch (err) {
      console.error('Auto-save error:', err);
      set({ saving: false });
    }
  },
}));
