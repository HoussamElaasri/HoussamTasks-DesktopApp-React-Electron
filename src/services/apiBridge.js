// In Electron, window.api is injected by preload.js.
// If running in browser dev server directly without Electron, we provide a localStorage fallback
// so UI development, browser subagent testing, and previewing always work seamlessly.

if (typeof window !== 'undefined' && !window.api) {
  const STORAGE_KEY = 'houssam_tasks_db';

  const defaultSeed = () => {
    const defaultPageId = 'default-page';
    const now = new Date().toISOString();
    const todayStr = now.split('T')[0];

    const pages = [
      { id: defaultPageId, title: 'My Tasks', icon: 'home', sort_order: 0, created_at: now, updated_at: now }
    ];

    const views = [
      { id: 'view-list', page_id: defaultPageId, type: 'list', is_default: 1, sort_order: 0, config: '{}' },
      { id: 'view-board', page_id: defaultPageId, type: 'board', is_default: 0, sort_order: 1, config: '{}' },
      { id: 'view-table', page_id: defaultPageId, type: 'table', is_default: 0, sort_order: 2, config: '{}' },
      { id: 'view-calendar', page_id: defaultPageId, type: 'calendar', is_default: 0, sort_order: 3, config: '{}' },
      { id: 'view-timeline', page_id: defaultPageId, type: 'timeline', is_default: 0, sort_order: 4, config: '{}' },
      { id: 'view-gallery', page_id: defaultPageId, type: 'gallery', is_default: 0, sort_order: 5, config: '{}' },
      { id: 'view-mindmap', page_id: defaultPageId, type: 'mindmap', is_default: 0, sort_order: 6, config: '{}' },
    ];

    const tasks = [
      {
        id: 'task-welcome',
        page_id: defaultPageId,
        title: 'Welcome to HoussamTasks! 👋',
        content: JSON.stringify([
          { id: 'b1', type: 'heading', content: 'Welcome to your new workspace!', level: 2 },
          { id: 'b2', type: 'text', content: 'HoussamTasks gives you 7 distinct views over the same task dataset: Board, List, Table, Calendar, Timeline, Gallery, and Mind Map.' },
          { id: 'b3', type: 'checklist', items: [
            { id: 'i1', text: 'Switch between view tabs at the top', checked: true },
            { id: 'i2', text: 'Create new tasks with Ctrl+N', checked: false },
            { id: 'i3', text: 'Search anywhere with Ctrl+K', checked: false }
          ]},
          { id: 'b4', type: 'divider' },
          { id: 'b5', type: 'text', content: 'Everything you edit auto-saves instantly with SQLite.' }
        ]),
        status: 'todo',
        priority: 'high',
        due_date: todayStr,
        tags: JSON.stringify(['welcome', 'guide']),
        sort_order: 0,
        color: '#800020',
        created_at: now,
        updated_at: now
      },
      {
        id: 'task-board',
        page_id: defaultPageId,
        title: 'Try the Board view →',
        content: JSON.stringify([
          { id: 'b6', type: 'text', content: 'Drag cards across To Do, In Progress, and Done columns effortlessly.' }
        ]),
        status: 'in_progress',
        priority: 'medium',
        due_date: todayStr,
        tags: JSON.stringify(['workflow']),
        sort_order: 1,
        color: '#D45060',
        created_at: now,
        updated_at: now
      },
      {
        id: 'task-due',
        page_id: defaultPageId,
        title: 'Set a due date on me 📅',
        content: JSON.stringify([
          { id: 'b7', type: 'text', content: 'Tasks with due dates show up automatically on the Calendar and Timeline views!' }
        ]),
        status: 'todo',
        priority: 'medium',
        due_date: todayStr,
        tags: JSON.stringify(['calendar']),
        sort_order: 2,
        color: '#E89B3E',
        created_at: now,
        updated_at: now
      },
      {
        id: 'task-check',
        page_id: defaultPageId,
        title: 'Check me off! ✓',
        content: JSON.stringify([
          { id: 'b8', type: 'text', content: 'Completed tasks get a satisfying strikethrough animation.' }
        ]),
        status: 'done',
        priority: 'low',
        due_date: null,
        tags: JSON.stringify(['quick']),
        sort_order: 3,
        color: null,
        created_at: now,
        updated_at: now
      }
    ];

    return { pages, views, tasks, positions: [] };
  };

  const getStorage = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    const seed = defaultSeed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  };

  const setStorage = (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  };

  window.api = {
    getPages: async () => {
      const data = getStorage();
      return { success: true, data: [...data.pages].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)) };
    },
    createPage: async (page) => {
      const data = getStorage();
      const id = page.id || ('page_' + Math.random().toString(36).substring(2, 9));
      const now = new Date().toISOString();
      const newPage = {
        id,
        title: page.title || 'Untitled',
        icon: page.icon || '📄',
        parent_id: page.parent_id || null,
        sort_order: page.sort_order ?? data.pages.length,
        created_at: now,
        updated_at: now,
      };
      data.pages.push(newPage);
      // add default views
      const types = ['list', 'board', 'table', 'calendar', 'timeline', 'gallery', 'mindmap'];
      types.forEach((type, idx) => {
        data.views.push({
          id: 'v_' + Math.random().toString(36).substring(2, 9),
          page_id: id,
          type,
          config: '{}',
          is_default: idx === 0 ? 1 : 0,
          sort_order: idx,
        });
      });
      setStorage(data);
      return { success: true, data: newPage };
    },
    updatePage: async (id, changes) => {
      const data = getStorage();
      const p = data.pages.find((x) => x.id === id);
      if (p) {
        Object.assign(p, changes, { updated_at: new Date().toISOString() });
        setStorage(data);
      }
      return { success: true, data: p };
    },
    deletePage: async (id) => {
      const data = getStorage();
      data.pages = data.pages.filter((x) => x.id !== id);
      data.tasks = data.tasks.filter((x) => x.page_id !== id);
      data.views = data.views.filter((x) => x.page_id !== id);
      setStorage(data);
      return { success: true, data: { id } };
    },
    reorderPages: async (orderedIds) => {
      const data = getStorage();
      orderedIds.forEach((id, idx) => {
        const p = data.pages.find((x) => x.id === id);
        if (p) p.sort_order = idx;
      });
      setStorage(data);
      return { success: true, data: { success: true } };
    },

    getTasksByPage: async (pageId) => {
      const data = getStorage();
      const tasks = data.tasks
        .filter((x) => x.page_id === pageId)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      return { success: true, data: tasks };
    },
    createTask: async (task) => {
      const data = getStorage();
      const id = task.id || ('task_' + Math.random().toString(36).substring(2, 9));
      const now = new Date().toISOString();
      const newTask = {
        id,
        page_id: task.page_id,
        title: task.title || '',
        content: typeof task.content === 'string' ? task.content : JSON.stringify(task.content || []),
        status: task.status || 'todo',
        priority: task.priority || 'none',
        due_date: task.due_date || null,
        tags: typeof task.tags === 'string' ? task.tags : JSON.stringify(task.tags || []),
        parent_id: task.parent_id || null,
        sort_order: task.sort_order ?? data.tasks.length,
        color: task.color || null,
        cover: task.cover || null,
        created_at: now,
        updated_at: now,
      };
      data.tasks.push(newTask);
      setStorage(data);
      return { success: true, data: newTask };
    },
    updateTask: async (id, changes) => {
      const data = getStorage();
      const t = data.tasks.find((x) => x.id === id);
      if (t) {
        Object.assign(t, changes, { updated_at: new Date().toISOString() });
        setStorage(data);
      }
      return { success: true, data: t };
    },
    updateTasks: async (tasksArray) => {
      const data = getStorage();
      const now = new Date().toISOString();
      for (const t of tasksArray) {
        const found = data.tasks.find((x) => x.id === t.id);
        if (found) {
          Object.assign(found, t, { updated_at: now });
        }
      }
      setStorage(data);
      return { success: true, data: { count: tasksArray.length } };
    },
    deleteTask: async (id) => {
      const data = getStorage();
      data.tasks = data.tasks.filter((x) => x.id !== id);
      setStorage(data);
      return { success: true, data: { id } };
    },

    getViewsByPage: async (pageId) => {
      const data = getStorage();
      const views = data.views
        .filter((x) => x.page_id === pageId)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      return { success: true, data: views };
    },
    createView: async (view) => {
      const data = getStorage();
      const id = view.id || ('view_' + Math.random().toString(36).substring(2, 9));
      const newView = {
        id,
        page_id: view.page_id,
        type: view.type || 'list',
        config: typeof view.config === 'string' ? view.config : JSON.stringify(view.config || {}),
        is_default: view.is_default ? 1 : 0,
        sort_order: view.sort_order ?? data.views.length,
      };
      data.views.push(newView);
      setStorage(data);
      return { success: true, data: newView };
    },
    updateView: async (id, changes) => {
      const data = getStorage();
      const v = data.views.find((x) => x.id === id);
      if (v) {
        Object.assign(v, changes);
        setStorage(data);
      }
      return { success: true, data: v };
    },
    deleteView: async (id) => {
      const data = getStorage();
      data.views = data.views.filter((x) => x.id !== id);
      setStorage(data);
      return { success: true, data: { id } };
    },

    getTaskPositions: async (viewId) => {
      const data = getStorage();
      return { success: true, data: data.positions?.filter((x) => x.view_id === viewId) || [] };
    },
    upsertTaskPosition: async (pos) => {
      const data = getStorage();
      if (!data.positions) data.positions = [];
      const idx = data.positions.findIndex((x) => x.task_id === pos.task_id && x.view_id === pos.view_id);
      if (idx >= 0) {
        data.positions[idx] = pos;
      } else {
        data.positions.push(pos);
      }
      setStorage(data);
      return { success: true, data: pos };
    },
    upsertTaskPositions: async (positions) => {
      const data = getStorage();
      if (!data.positions) data.positions = [];
      for (const pos of positions) {
        const idx = data.positions.findIndex((x) => x.task_id === pos.task_id && x.view_id === pos.view_id);
        if (idx >= 0) data.positions[idx] = pos;
        else data.positions.push(pos);
      }
      setStorage(data);
      return { success: true, data: { count: positions.length } };
    },

    searchTasks: async (query) => {
      if (!query || !query.trim()) return { success: true, data: [] };
      const data = getStorage();
      const q = query.trim().toLowerCase();
      const results = data.tasks
        .filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            (t.content && t.content.toLowerCase().includes(q)) ||
            (t.tags && t.tags.toLowerCase().includes(q))
        )
        .slice(0, 50)
        .map((t) => {
          const page = data.pages.find((p) => p.id === t.page_id);
          return { ...t, page_title: page ? page.title : 'Page' };
        });
      return { success: true, data: results };
    },

    windowMinimize: () => {},
    windowMaximize: () => {},
    windowClose: () => {},
  };
}

export const api = window.api;
