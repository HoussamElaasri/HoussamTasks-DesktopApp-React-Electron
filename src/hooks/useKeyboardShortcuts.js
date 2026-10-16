import { useEffect } from 'react';
import { useUIStore } from '../store/useUIStore';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { useTaskStore } from '../store/useTaskStore';

export function useKeyboardShortcuts() {
  const openCommandPalette = useUIStore((state) => state.openCommandPalette);
  const closeCommandPalette = useUIStore((state) => state.closeCommandPalette);
  const closeContextMenu = useUIStore((state) => state.closeContextMenu);
  const closeModal = useUIStore((state) => state.closeModal);

  const activePage = useWorkspaceStore((state) => state.activePage);
  const views = useWorkspaceStore((state) => state.views);
  const setActiveView = useWorkspaceStore((state) => state.setActiveView);
  const createPage = useWorkspaceStore((state) => state.createPage);
  const toggleSidebar = useWorkspaceStore((state) => state.toggleSidebar);

  const createTask = useTaskStore((state) => state.createTask);
  const setActiveTaskId = useTaskStore((state) => state.setActiveTaskId);

  useEffect(() => {
    const handleKeyDown = async (e) => {
      const isInput =
        ['INPUT', 'TEXTAREA'].includes(e.target.tagName) ||
        e.target.getAttribute('contenteditable') === 'true';

      // Escape handles closing overlays even if inside input
      if (e.key === 'Escape') {
        closeCommandPalette();
        closeContextMenu();
        closeModal();
        setActiveTaskId(null);
        return;
      }

      // Check modifier (Ctrl on Windows/Linux or Cmd on Mac)
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd) {
        // Ctrl+K -> Command Palette
        if (e.key.toLowerCase() === 'k') {
          e.preventDefault();
          openCommandPalette();
          return;
        }

        // Ctrl+\ -> Toggle Sidebar
        if (e.key === '\\') {
          e.preventDefault();
          toggleSidebar();
          return;
        }

        // Ctrl+Shift+N -> Create new page
        if (e.shiftKey && e.key.toLowerCase() === 'n') {
          e.preventDefault();
          await createPage('Untitled Page', '📄');
          return;
        }

        // Ctrl+N -> Create new task in current page
        if (!e.shiftKey && e.key.toLowerCase() === 'n' && !isInput) {
          e.preventDefault();
          if (activePage) {
            const newTask = await createTask({
              page_id: activePage.id,
              title: 'New task',
              status: 'todo',
            });
            if (newTask) {
              setActiveTaskId(newTask.id);
            }
          }
          return;
        }

        // Ctrl+1 through Ctrl+7 -> Switch view tabs
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= 7 && !isInput) {
          e.preventDefault();
          const targetIndex = num - 1;
          if (views[targetIndex]) {
            setActiveView(views[targetIndex].id);
          }
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    openCommandPalette,
    closeCommandPalette,
    closeContextMenu,
    closeModal,
    activePage,
    views,
    setActiveView,
    createPage,
    toggleSidebar,
    createTask,
    setActiveTaskId,
  ]);
}

export default useKeyboardShortcuts;
