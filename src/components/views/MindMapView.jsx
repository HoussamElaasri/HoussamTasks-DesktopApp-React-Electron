import React, { useState, useRef } from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { MindMapIcon, PlusIcon } from '../ui/Icons';
import '../../styles/components/mindmap.css';

export function MindMapView() {
  const activePage = useWorkspaceStore((state) => state.activePage);
  const tasks = useTaskStore((state) => state.tasks);
  const createTask = useTaskStore((state) => state.createTask);
  const setActiveTaskId = useTaskStore((state) => state.setActiveTaskId);

  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Custom task node positions
  const [customPositions, setCustomPositions] = useState({});
  const [draggingNodeId, setDraggingNodeId] = useState(null);

  // Center coordinates of canvas
  const centerX = 500;
  const centerY = 350;

  // Calculate default radial positions
  const nodePositions = React.useMemo(() => {
    const positions = {};
    const radius = 220;
    const count = tasks.length;

    tasks.forEach((task, index) => {
      if (customPositions[task.id]) {
        positions[task.id] = customPositions[task.id];
      } else {
        const angle = (index / (count || 1)) * 2 * Math.PI;
        positions[task.id] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
      }
    });

    return positions;
  }, [tasks, customPositions]);

  // Handle panning background
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'svg' || e.target.classList.contains('mindmap-canvas-bg')) {
      setIsPanning(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    } else if (draggingNodeId) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const nodeX = (e.clientX - containerRect.left - pan.x) / zoom;
      const nodeY = (e.clientY - containerRect.top - pan.y) / zoom;
      setCustomPositions((prev) => ({
        ...prev,
        [draggingNodeId]: { x: nodeX, y: nodeY },
      }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  const handleAddChildTask = async () => {
    if (!activePage) return;
    const newTask = await createTask({
      page_id: activePage.id,
      title: 'Brainstorm Idea',
      status: 'todo',
    });
    if (newTask) {
      setActiveTaskId(newTask.id);
    }
  };

  if (!activePage) {
    return (
      <div className="empty-view-state">
        <MindMapIcon size={44} color="var(--border)" />
        <h3>No Page Selected</h3>
      </div>
    );
  }

  return (
    <div
      className="mindmap-container anim-fade-in"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Floating Toolbar */}
      <div className="mindmap-toolbar">
        <button
          type="button"
          className="mindmap-tool-btn"
          onClick={() => setZoom((z) => Math.min(z + 0.15, 2))}
          title="Zoom In"
        >
          +
        </button>
        <button
          type="button"
          className="mindmap-tool-btn"
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.4))}
          title="Zoom Out"
        >
          −
        </button>
        <button
          type="button"
          className="mindmap-tool-btn"
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          title="Recenter"
        >
          ⌖
        </button>
        <button
          type="button"
          className="mindmap-add-btn"
          onClick={handleAddChildTask}
          title="Add branch task"
        >
          <PlusIcon size={13} style={{ display: 'inline', marginRight: '4px' }} />
          <span>Add Idea</span>
        </button>
      </div>

      {/* SVG Canvas */}
      <svg
        className="mindmap-svg-canvas"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        <rect
          width="3000"
          height="3000"
          x="-1000"
          y="-1000"
          className="mindmap-canvas-bg"
          fill="transparent"
        />

        {/* Connecting Lines */}
        {tasks.map((task) => {
          const pos = nodePositions[task.id];
          if (!pos) return null;

          // Bezier curve from center to child node
          const dx = pos.x - centerX;
          const dy = pos.y - centerY;
          const cx1 = centerX + dx * 0.5;
          const cy1 = centerY;
          const cx2 = centerX + dx * 0.5;
          const cy2 = pos.y;
          const pathD = `M ${centerX} ${centerY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pos.x} ${pos.y}`;

          return (
            <path
              key={`line-${task.id}`}
              d={pathD}
              className="mindmap-connection-line"
              stroke={task.color || 'var(--border)'}
              strokeWidth="2.5"
              fill="none"
            />
          );
        })}

        {/* Central Node: Root page */}
        <g transform={`translate(${centerX - 80}, ${centerY - 24})`}>
          <rect
            width="160"
            height="48"
            rx="24"
            className="mindmap-center-rect"
          />
          <text
            x="80"
            y="29"
            className="mindmap-center-text"
            textAnchor="middle"
          >
            {activePage.title || 'Central Idea'}
          </text>
        </g>

        {/* Task Nodes */}
        {tasks.map((task) => {
          const pos = nodePositions[task.id];
          if (!pos) return null;
          const nodeWidth = 140;
          const nodeHeight = 40;

          return (
            <g
              key={`node-${task.id}`}
              transform={`translate(${pos.x - nodeWidth / 2}, ${pos.y - nodeHeight / 2})`}
              className="mindmap-task-node"
              onMouseDown={(e) => {
                e.stopPropagation();
                setDraggingNodeId(task.id);
              }}
              onClick={() => setActiveTaskId(task.id)}
            >
              <rect
                width={nodeWidth}
                height={nodeHeight}
                rx="20"
                className={`mindmap-node-rect ${task.status === 'done' ? 'is-done' : ''}`}
                style={{
                  borderLeft: `4px solid ${task.color || 'var(--burgundy)'}`,
                }}
              />
              <text
                x={nodeWidth / 2}
                y={nodeHeight / 2 + 4}
                className="mindmap-node-text"
                textAnchor="middle"
              >
                {task.title.length > 15 ? task.title.slice(0, 15) + '…' : task.title || 'Idea'}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default MindMapView;
