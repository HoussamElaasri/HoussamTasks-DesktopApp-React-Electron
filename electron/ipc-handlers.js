const db = require('./database');

function registerIpcHandlers(ipcMain) {
  // Helper
  const handle = (channel, fn) => {
    ipcMain.handle(channel, async (_event, ...args) => {
      try {
        const result = await fn(...args);
        return { success: true, data: result };
      } catch (err) {
        console.error(`IPC error on ${channel}:`, err);
        return { success: false, error: err.message };
      }
    });
  };

  // Pages
  handle('db:get-pages', () => db.getPages());
  handle('db:create-page', (page) => db.createPage(page));
  handle('db:update-page', (id, changes) => db.updatePage(id, changes));
  handle('db:delete-page', (id) => db.deletePage(id));
  handle('db:reorder-pages', (orderedIds) => db.reorderPages(orderedIds));

  // Tasks
  handle('db:get-tasks-by-page', (pageId) => db.getTasksByPage(pageId));
  handle('db:create-task', (task) => db.createTask(task));
  handle('db:update-task', (id, changes) => db.updateTask(id, changes));
  handle('db:update-tasks', (tasks) => db.updateTasks(tasks));
  handle('db:delete-task', (id) => db.deleteTask(id));

  // Views
  handle('db:get-views-by-page', (pageId) => db.getViewsByPage(pageId));
  handle('db:create-view', (view) => db.createView(view));
  handle('db:update-view', (id, changes) => db.updateView(id, changes));
  handle('db:delete-view', (id) => db.deleteView(id));

  // Task positions
  handle('db:get-task-positions', (viewId) => db.getTaskPositions(viewId));
  handle('db:upsert-task-position', (pos) => db.upsertTaskPosition(pos));
  handle('db:upsert-task-positions', (positions) => db.upsertTaskPositions(positions));

  // Search
  handle('db:search-tasks', (query) => db.searchTasks(query));
}

module.exports = { registerIpcHandlers };
