import React, { useEffect } from 'react';
import { useWorkspaceStore } from './store/useWorkspaceStore';
import { useTaskStore } from './store/useTaskStore';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import Canvas from './components/layout/Canvas';
import TaskDetailPanel from './components/TaskDetailPanel';
import CommandPalette from './components/CommandPalette';
import ContextMenu from './components/ui/ContextMenu';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import './styles/components/layout.css';

export function App() {
  const loadPages = useWorkspaceStore((state) => state.loadPages);
  const activePage = useWorkspaceStore((state) => state.activePage);
  const loadTasks = useTaskStore((state) => state.loadTasks);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Load initial workspace data
  useEffect(() => {
    loadPages();
  }, [loadPages]);

  // Load tasks whenever active page changes
  useEffect(() => {
    if (activePage?.id) {
      loadTasks(activePage.id);
    }
  }, [activePage, loadTasks]);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-area">
        <Topbar />
        <Canvas />
      </main>

      {/* Global Overlays */}
      <TaskDetailPanel />
      <CommandPalette />
      <ContextMenu />
    </div>
  );
}

export default App;
