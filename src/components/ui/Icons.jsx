import React from 'react';

const defaultProps = {
  size: 16,
  color: 'currentColor',
  strokeWidth: 2,
};

export function IconBase({ size = 16, color = 'currentColor', strokeWidth = 2, children, className = '', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg ${className}`}
      {...props}
    >
      {children}
    </svg>
  );
}

// ── Views ──
export function ListIcon(props) {
  return (
    <IconBase {...props}>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </IconBase>
  );
}

export function BoardIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="3" width="5" height="18" rx="1.5" />
      <rect x="10" y="3" width="5" height="12" rx="1.5" />
      <rect x="17" y="3" width="5" height="15" rx="1.5" />
    </IconBase>
  );
}

export function TableIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
    </IconBase>
  );
}

export function CalendarIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </IconBase>
  );
}

export function TimelineIcon(props) {
  return (
    <IconBase {...props}>
      <line x1="2" y1="5" x2="22" y2="5" />
      <rect x="4" y="8" width="8" height="4" rx="1" fill="currentColor" fillOpacity="0.2" />
      <rect x="10" y="14" width="10" height="4" rx="1" fill="currentColor" fillOpacity="0.2" />
    </IconBase>
  );
}

export function GalleryIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </IconBase>
  );
}

export function MindMapIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="3" />
      <circle cx="4" cy="6" r="2" />
      <circle cx="20" cy="6" r="2" />
      <circle cx="4" cy="18" r="2" />
      <circle cx="20" cy="18" r="2" />
      <path d="M9.5 10.5L5.8 7.2M14.5 10.5l3.7-3.3M9.5 13.5l-3.7 3.3M14.5 13.5l3.7 3.3" />
    </IconBase>
  );
}

// ── UI Actions & Controls ──
export function SearchIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </IconBase>
  );
}

export function PlusIcon(props) {
  return (
    <IconBase {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </IconBase>
  );
}

export function CheckIcon(props) {
  return (
    <IconBase {...props}>
      <polyline points="20 6 9 17 4 12" />
    </IconBase>
  );
}

export function CloseIcon(props) {
  return (
    <IconBase {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </IconBase>
  );
}

export function TrashIcon(props) {
  return (
    <IconBase {...props}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </IconBase>
  );
}

export function EditIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </IconBase>
  );
}

export function ChevronLeftIcon(props) {
  return (
    <IconBase {...props}>
      <polyline points="15 18 9 12 15 6" />
    </IconBase>
  );
}

export function ChevronRightIcon(props) {
  return (
    <IconBase {...props}>
      <polyline points="9 18 15 12 9 6" />
    </IconBase>
  );
}

export function ChevronDownIcon(props) {
  return (
    <IconBase {...props}>
      <polyline points="6 9 12 15 18 9" />
    </IconBase>
  );
}

export function MoreIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" />
      <circle cx="5" cy="12" r="1.5" fill="currentColor" />
    </IconBase>
  );
}

export function MenuIcon(props) {
  return (
    <IconBase {...props}>
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </IconBase>
  );
}

// ── Status & Priority ──
export function StatusTodoIcon(props) {
  return (
    <IconBase size={14} color="#8A7A7A" {...props}>
      <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
    </IconBase>
  );
}

export function StatusInProgressIcon(props) {
  return (
    <IconBase size={14} color="#E89B3E" {...props}>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 6 12 12 16 14" />
    </IconBase>
  );
}

export function StatusDoneIcon(props) {
  return (
    <IconBase size={14} color="#3E9E72" {...props}>
      <circle cx="12" cy="12" r="9" fill="#3E9E72" fillOpacity="0.2" />
      <polyline points="8 12 11 15 16 9" stroke="#3E9E72" />
    </IconBase>
  );
}

export function PriorityFlagIcon({ priority = 'none', size = 14, ...props }) {
  const colors = {
    high: '#D45060',
    medium: '#E89B3E',
    low: '#4A90D9',
    none: '#B3A09E',
  };
  const color = colors[priority] || colors.none;

  return (
    <IconBase size={size} color={color} {...props}>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" fill={priority !== 'none' ? color : 'none'} fillOpacity={0.25} />
      <line x1="4" y1="22" x2="4" y2="15" />
    </IconBase>
  );
}

// ── Page & Category Icons ──
export function HomeIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </IconBase>
  );
}

export function FileTextIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </IconBase>
  );
}

export function FolderIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </IconBase>
  );
}

export function TargetIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </IconBase>
  );
}

export function SparklesIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
    </IconBase>
  );
}

export function StarIcon(props) {
  return (
    <IconBase {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </IconBase>
  );
}

export function BriefcaseIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </IconBase>
  );
}

export function BookIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </IconBase>
  );
}

export function CodeIcon(props) {
  return (
    <IconBase {...props}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </IconBase>
  );
}

export function PaletteIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z" />
    </IconBase>
  );
}

export function ZapIcon(props) {
  return (
    <IconBase {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </IconBase>
  );
}

// Icon dictionary helper for rendering page icons dynamically
export const PAGE_ICONS = {
  home: HomeIcon,
  file: FileTextIcon,
  folder: FolderIcon,
  target: TargetIcon,
  sparkles: SparklesIcon,
  star: StarIcon,
  briefcase: BriefcaseIcon,
  book: BookIcon,
  code: CodeIcon,
  palette: PaletteIcon,
  zap: ZapIcon,
  // Emoji fallbacks mapped to clean icons
  '🏠': HomeIcon,
  '📄': FileTextIcon,
  '🚀': TargetIcon,
  '🎯': TargetIcon,
  '💡': SparklesIcon,
  '📚': BookIcon,
  '💼': BriefcaseIcon,
  '🛒': BriefcaseIcon,
  '🎨': PaletteIcon,
  '🔥': ZapIcon,
  '⭐': StarIcon,
  '⚡': ZapIcon,
  '📝': FileTextIcon,
  '🛠️': CodeIcon,
  '✨': SparklesIcon,
  '☕': HomeIcon,
};

export function renderPageIcon(iconKey, props = {}) {
  const IconComponent = PAGE_ICONS[iconKey] || FileTextIcon;
  return <IconComponent {...props} />;
}
