const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // ── Database operations ──
  // Pages
  getPages: () => ipcRenderer.invoke('db:get-pages'),
  createPage: (page) => ipcRenderer.invoke('db:create-page', page),
  updatePage: (id, changes) => ipcRenderer.invoke('db:update-page', id, changes),
  deletePage: (id) => ipcRenderer.invoke('db:delete-page', id),
  reorderPages: (orderedIds) => ipcRenderer.invoke('db:reorder-pages', orderedIds),

  // Tasks
  getTasksByPage: (pageId) => ipcRenderer.invoke('db:get-tasks-by-page', pageId),
  createTask: (task) => ipcRenderer.invoke('db:create-task', task),
  updateTask: (id, changes) => ipcRenderer.invoke('db:update-task', id, changes),
  updateTasks: (tasks) => ipcRenderer.invoke('db:update-tasks', tasks),
  deleteTask: (id) => ipcRenderer.invoke('db:delete-task', id),

  // Views
  getViewsByPage: (pageId) => ipcRenderer.invoke('db:get-views-by-page', pageId),
  createView: (view) => ipcRenderer.invoke('db:create-view', view),
  updateView: (id, changes) => ipcRenderer.invoke('db:update-view', id, changes),
  deleteView: (id) => ipcRenderer.invoke('db:delete-view', id),

  // Task view positions
  getTaskPositions: (viewId) => ipcRenderer.invoke('db:get-task-positions', viewId),
  upsertTaskPosition: (pos) => ipcRenderer.invoke('db:upsert-task-position', pos),
  upsertTaskPositions: (positions) => ipcRenderer.invoke('db:upsert-task-positions', positions),

  // Search
  searchTasks: (query) => ipcRenderer.invoke('db:search-tasks', query),

  // ── Window controls ──
  windowMinimize: () => ipcRenderer.send('window-minimize'),
  windowMaximize: () => ipcRenderer.send('window-maximize'),
  windowClose: () => ipcRenderer.send('window-close'),
});
