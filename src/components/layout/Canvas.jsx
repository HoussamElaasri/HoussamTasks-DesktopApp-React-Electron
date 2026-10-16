import React, { Suspense, lazy } from 'react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import '../../styles/components/canvas.css';

const ListView = lazy(() => import('../views/ListView'));
const BoardView = lazy(() => import('../views/BoardView'));
const TableView = lazy(() => import('../views/TableView'));
const CalendarView = lazy(() => import('../views/CalendarView'));
const TimelineView = lazy(() => import('../views/TimelineView'));
const GalleryView = lazy(() => import('../views/GalleryView'));
const MindMapView = lazy(() => import('../views/MindMapView'));

export function Canvas() {
  const activePage = useWorkspaceStore((state) => state.activePage);
  const activeView = useWorkspaceStore((state) => state.activeView);
  const loading = useWorkspaceStore((state) => state.loading);

  if (loading) {
    return (
      <div className="canvas-wrapper canvas-loading">
        <span className="canvas-loading-spinner anim-spin">◌</span>
        <p>Loading your workspace...</p>
      </div>
    );
  }

  if (!activePage) {
    return (
      <div className="canvas-wrapper canvas-empty">
        <span className="empty-icon">🏠</span>
        <h2>Welcome to HoussamTasks</h2>
        <p>Create a page in the sidebar to organize your thoughts and projects.</p>
      </div>
    );
  }

  const renderActiveView = () => {
    const viewType = activeView?.type || 'list';

    switch (viewType) {
      case 'board':
        return <BoardView />;
      case 'table':
        return <TableView />;
      case 'calendar':
        return <CalendarView />;
      case 'timeline':
        return <TimelineView />;
      case 'gallery':
        return <GalleryView />;
      case 'mindmap':
        return <MindMapView />;
      case 'list':
      default:
        return <ListView />;
    }
  };

  return (
    <div className="canvas-wrapper">
      <Suspense
        fallback={
          <div className="view-loading-fallback">
            <span className="canvas-loading-spinner anim-spin">◌</span>
            <span>Loading view...</span>
          </div>
        }
      >
        {renderActiveView()}
      </Suspense>
    </div>
  );
}

export default Canvas;
