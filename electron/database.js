const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

let SQL = null;
let db = null;
let dbFilePath = null;

function saveDb() {
  if (!db || !dbFilePath) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbFilePath, buffer);
  } catch (err) {
    console.error('Failed to save SQLite database to file:', err);
  }
}

async function initDatabase(customPath = null) {
  if (db) return db;

  if (customPath) {
    dbFilePath = customPath;
  } else {
    // In development or when electron app is not yet passed, use current working directory
    const dir = process.env.NODE_ENV === 'production' && typeof process.resourcesPath === 'string'
      ? path.join(process.env.APPDATA || process.cwd(), 'HoussamTasks')
      : process.cwd();

    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (e) {
        console.error('Could not create data dir:', e);
      }
    }
    dbFilePath = path.join(dir, 'houssam-tasks.db');
  }

  SQL = await initSqlJs();

  if (fs.existsSync(dbFilePath)) {
    try {
      const fileBuffer = fs.readFileSync(dbFilePath);
      db = new SQL.Database(fileBuffer);
    } catch (e) {
      console.warn('Could not read existing database file, creating fresh database:', e);
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
  }

  // Pragmas
  try {
    db.run("PRAGMA foreign_keys = ON;");
  } catch (e) {
    // pragma foreign keys
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS pages (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL DEFAULT 'Untitled',
      icon        TEXT DEFAULT '📄',
      parent_id   TEXT REFERENCES pages(id) ON DELETE SET NULL,
      sort_order  INTEGER DEFAULT 0,
      created_at  TEXT DEFAULT (datetime('now')),
      updated_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id          TEXT PRIMARY KEY,
      page_id     TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
      title       TEXT NOT NULL DEFAULT '',
      content     TEXT DEFAULT '[]',
      status      TEXT DEFAULT 'todo',
      priority    TEXT DEFAULT 'none',
      due_date    TEXT,
      tags        TEXT DEFAULT '[]',
      parent_id   TEXT REFERENCES tasks(id) ON DELETE SET NULL,
      sort_order  INTEGER DEFAULT 0,
      color       TEXT,
      cover       TEXT,
      created_at  TEXT DEFAULT (datetime('now')),
      updated_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS views (
      id          TEXT PRIMARY KEY,
      page_id     TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
      type        TEXT NOT NULL,
      config      TEXT DEFAULT '{}',
      is_default  INTEGER DEFAULT 0,
      sort_order  INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS task_view_positions (
      task_id     TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      view_id     TEXT NOT NULL REFERENCES views(id) ON DELETE CASCADE,
      position    TEXT DEFAULT '{}',
      PRIMARY KEY (task_id, view_id)
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_page ON tasks(page_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date);
    CREATE INDEX IF NOT EXISTS idx_views_page ON views(page_id);
  `);

  // Check if pages is empty, then seed
  const countStmt = db.prepare("SELECT COUNT(*) AS count FROM pages");
  let pageCount = 0;
  if (countStmt.step()) {
    pageCount = countStmt.getAsObject().count;
  }
  countStmt.free();

  if (pageCount === 0) {
    seedDatabase();
  } else {
    saveDb();
  }

  return db;
}

function seedDatabase() {
  const defaultPageId = 'default-page';
  const now = new Date().toISOString();
  const todayStr = now.split('T')[0];

  // Insert default page
  db.run(
    "INSERT INTO pages (id, title, icon, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    [defaultPageId, 'My Tasks', 'home', 0, now, now]
  );

  // Insert standard views for the default page
  const defaultViews = [
    { id: 'view-list', type: 'list', is_default: 1, sort_order: 0 },
    { id: 'view-board', type: 'board', is_default: 0, sort_order: 1 },
    { id: 'view-table', type: 'table', is_default: 0, sort_order: 2 },
    { id: 'view-calendar', type: 'calendar', is_default: 0, sort_order: 3 },
    { id: 'view-timeline', type: 'timeline', is_default: 0, sort_order: 4 },
    { id: 'view-gallery', type: 'gallery', is_default: 0, sort_order: 5 },
    { id: 'view-mindmap', type: 'mindmap', is_default: 0, sort_order: 6 },
  ];

  for (const v of defaultViews) {
    db.run(
      "INSERT INTO views (id, page_id, type, config, is_default, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
      [v.id, defaultPageId, v.type, '{}', v.is_default, v.sort_order]
    );
  }

  // Seed initial onboarding tasks (Task 4.9)
  const seedTasks = [
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
      color: '#800020'
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
      color: '#D45060'
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
      color: '#E89B3E'
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
      color: null
    }
  ];

  for (const t of seedTasks) {
    db.run(
      `INSERT INTO tasks (id, page_id, title, content, status, priority, due_date, tags, parent_id, sort_order, color, cover, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, NULL, ?, ?)`,
      [t.id, t.page_id, t.title, t.content, t.status, t.priority, t.due_date, t.tags, t.sort_order, t.color, now, now]
    );
  }

  saveDb();
}

// ── CRUD Functions ──

// Pages
function getPages() {
  const stmt = db.prepare("SELECT * FROM pages ORDER BY sort_order ASC, created_at ASC");
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function createPage(page) {
  const id = page.id || ('page_' + Math.random().toString(36).substring(2, 10));
  const title = page.title || 'Untitled';
  const icon = page.icon || 'file';
  const parent_id = page.parent_id || null;
  const sort_order = page.sort_order ?? 0;
  const now = new Date().toISOString();

  db.run(
    "INSERT INTO pages (id, title, icon, parent_id, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [id, title, icon, parent_id, sort_order, now, now]
  );

  // Auto-create default views for new page
  const defaultViews = [
    { id: 'v_' + Math.random().toString(36).substring(2, 9), type: 'list', is_default: 1, sort_order: 0 },
    { id: 'v_' + Math.random().toString(36).substring(2, 9), type: 'board', is_default: 0, sort_order: 1 },
    { id: 'v_' + Math.random().toString(36).substring(2, 9), type: 'table', is_default: 0, sort_order: 2 },
    { id: 'v_' + Math.random().toString(36).substring(2, 9), type: 'calendar', is_default: 0, sort_order: 3 },
    { id: 'v_' + Math.random().toString(36).substring(2, 9), type: 'timeline', is_default: 0, sort_order: 4 },
    { id: 'v_' + Math.random().toString(36).substring(2, 9), type: 'gallery', is_default: 0, sort_order: 5 },
    { id: 'v_' + Math.random().toString(36).substring(2, 9), type: 'mindmap', is_default: 0, sort_order: 6 },
  ];
  for (const v of defaultViews) {
    db.run(
      "INSERT INTO views (id, page_id, type, config, is_default, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
      [v.id, id, v.type, '{}', v.is_default, v.sort_order]
    );
  }

  saveDb();
  return { id, title, icon, parent_id, sort_order, created_at: now, updated_at: now };
}

function updatePage(id, changes) {
  const allowed = ['title', 'icon', 'parent_id', 'sort_order'];
  const sets = [];
  const values = [];

  for (const key of allowed) {
    if (changes[key] !== undefined) {
      sets.push(`${key} = ?`);
      values.push(changes[key]);
    }
  }
  if (sets.length === 0) return { id };

  const now = new Date().toISOString();
  sets.push("updated_at = ?");
  values.push(now);
  values.push(id);

  db.run(`UPDATE pages SET ${sets.join(', ')} WHERE id = ?`, values);
  saveDb();
  return { id, ...changes, updated_at: now };
}

function deletePage(id) {
  db.run("DELETE FROM pages WHERE id = ?", [id]);
  saveDb();
  return { id };
}

function reorderPages(orderedIds) {
  for (let i = 0; i < orderedIds.length; i++) {
    db.run("UPDATE pages SET sort_order = ? WHERE id = ?", [i, orderedIds[i]]);
  }
  saveDb();
  return { success: true };
}

// Tasks
function getTasksByPage(pageId) {
  const stmt = db.prepare("SELECT * FROM tasks WHERE page_id = ? ORDER BY sort_order ASC, created_at ASC");
  stmt.bind([pageId]);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function createTask(task) {
  const id = task.id || ('task_' + Math.random().toString(36).substring(2, 10));
  const page_id = task.page_id;
  const title = task.title || '';
  const content = typeof task.content === 'string' ? task.content : JSON.stringify(task.content || []);
  const status = task.status || 'todo';
  const priority = task.priority || 'none';
  const due_date = task.due_date || null;
  const tags = typeof task.tags === 'string' ? task.tags : JSON.stringify(task.tags || []);
  const parent_id = task.parent_id || null;
  const sort_order = task.sort_order ?? 0;
  const color = task.color || null;
  const cover = task.cover || null;
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO tasks (id, page_id, title, content, status, priority, due_date, tags, parent_id, sort_order, color, cover, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, page_id, title, content, status, priority, due_date, tags, parent_id, sort_order, color, cover, now, now]
  );
  saveDb();

  return { id, page_id, title, content, status, priority, due_date, tags, parent_id, sort_order, color, cover, created_at: now, updated_at: now };
}

function updateTask(id, changes) {
  const allowed = ['title', 'content', 'status', 'priority', 'due_date', 'tags', 'parent_id', 'sort_order', 'color', 'cover', 'page_id'];
  const sets = [];
  const values = [];

  for (const key of allowed) {
    if (changes[key] !== undefined) {
      sets.push(`${key} = ?`);
      let val = changes[key];
      if ((key === 'content' || key === 'tags') && typeof val !== 'string') {
        val = JSON.stringify(val);
      }
      values.push(val);
    }
  }
  if (sets.length === 0) return { id };

  const now = new Date().toISOString();
  sets.push("updated_at = ?");
  values.push(now);
  values.push(id);

  db.run(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`, values);
  saveDb();
  return { id, ...changes, updated_at: now };
}

function updateTasks(tasksArray) {
  if (!Array.isArray(tasksArray)) return { count: 0 };
  const allowed = ['title', 'content', 'status', 'priority', 'due_date', 'tags', 'parent_id', 'sort_order', 'color', 'cover', 'page_id'];
  const now = new Date().toISOString();

  for (const task of tasksArray) {
    if (!task.id) continue;
    const sets = [];
    const values = [];

    for (const key of allowed) {
      if (task[key] !== undefined) {
        sets.push(`${key} = ?`);
        let val = task[key];
        if ((key === 'content' || key === 'tags') && typeof val !== 'string') {
          val = JSON.stringify(val);
        }
        values.push(val);
      }
    }
    if (sets.length > 0) {
      sets.push("updated_at = ?");
      values.push(now);
      values.push(task.id);
      db.run(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`, values);
    }
  }

  saveDb();
  return { count: tasksArray.length };
}

function deleteTask(id) {
  db.run("DELETE FROM tasks WHERE id = ?", [id]);
  saveDb();
  return { id };
}

// Views
function getViewsByPage(pageId) {
  const stmt = db.prepare("SELECT * FROM views WHERE page_id = ? ORDER BY sort_order ASC");
  stmt.bind([pageId]);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function createView(view) {
  const id = view.id || ('view_' + Math.random().toString(36).substring(2, 10));
  const page_id = view.page_id;
  const type = view.type || 'list';
  const config = typeof view.config === 'string' ? view.config : JSON.stringify(view.config || {});
  const is_default = view.is_default ? 1 : 0;
  const sort_order = view.sort_order ?? 0;

  db.run(
    "INSERT INTO views (id, page_id, type, config, is_default, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
    [id, page_id, type, config, is_default, sort_order]
  );
  saveDb();
  return { id, page_id, type, config, is_default, sort_order };
}

function updateView(id, changes) {
  const allowed = ['type', 'config', 'is_default', 'sort_order'];
  const sets = [];
  const values = [];

  for (const key of allowed) {
    if (changes[key] !== undefined) {
      sets.push(`${key} = ?`);
      let val = changes[key];
      if (key === 'config' && typeof val !== 'string') {
        val = JSON.stringify(val);
      }
      values.push(val);
    }
  }
  if (sets.length === 0) return { id };

  values.push(id);
  db.run(`UPDATE views SET ${sets.join(', ')} WHERE id = ?`, values);
  saveDb();
  return { id, ...changes };
}

function deleteView(id) {
  db.run("DELETE FROM views WHERE id = ?", [id]);
  saveDb();
  return { id };
}

// Task View Positions
function getTaskPositions(viewId) {
  const stmt = db.prepare("SELECT * FROM task_view_positions WHERE view_id = ?");
  stmt.bind([viewId]);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function upsertTaskPosition(pos) {
  const task_id = pos.task_id;
  const view_id = pos.view_id;
  const position = typeof pos.position === 'string' ? pos.position : JSON.stringify(pos.position || {});

  db.run(
    "INSERT OR REPLACE INTO task_view_positions (task_id, view_id, position) VALUES (?, ?, ?)",
    [task_id, view_id, position]
  );
  saveDb();
  return { task_id, view_id, position };
}

function upsertTaskPositions(positionsArray) {
  if (!Array.isArray(positionsArray)) return { count: 0 };
  for (const pos of positionsArray) {
    const task_id = pos.task_id;
    const view_id = pos.view_id;
    const position = typeof pos.position === 'string' ? pos.position : JSON.stringify(pos.position || {});
    db.run(
      "INSERT OR REPLACE INTO task_view_positions (task_id, view_id, position) VALUES (?, ?, ?)",
      [task_id, view_id, position]
    );
  }
  saveDb();
  return { count: positionsArray.length };
}

// Search
function searchTasks(query) {
  if (!query || !query.trim()) return [];
  const q = `%${query.trim()}%`;
  const stmt = db.prepare(`
    SELECT t.*, p.title as page_title 
    FROM tasks t 
    JOIN pages p ON t.page_id = p.id 
    WHERE t.title LIKE ? OR t.content LIKE ? OR t.tags LIKE ?
    LIMIT 50
  `);
  stmt.bind([q, q, q]);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

module.exports = {
  initDatabase,
  getPages,
  createPage,
  updatePage,
  deletePage,
  reorderPages,
  getTasksByPage,
  createTask,
  updateTask,
  updateTasks,
  deleteTask,
  getViewsByPage,
  createView,
  updateView,
  deleteView,
  getTaskPositions,
  upsertTaskPosition,
  upsertTaskPositions,
  searchTasks
};
