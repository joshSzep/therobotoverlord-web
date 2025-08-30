/**
 * Component prop types for The Robot Overlord
 * Common interfaces for component props and shared component types
 */

import React from 'react';
import { User, UserRole } from './user';
import { Post, PostType, PostStatus } from './posts';
import { Topic, TopicCategory, TopicFilters } from './topics';
import { LeaderboardEntry, Competition, Achievement } from './leaderboard';
import { Badge, UserBadge } from './badges';
import { ModerationAction, Report } from './moderation';

// Base component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
  'data-testid'?: string;
}

// Loading and error states
export interface LoadingProps {
  isLoading?: boolean;
  loadingText?: string;
  loadingComponent?: React.ReactNode;
}

export interface ErrorProps {
  error?: string | null;
  errorComponent?: React.ReactNode;
  onRetry?: () => void;
}

export interface AsyncComponentProps extends LoadingProps, ErrorProps {
  isEmpty?: boolean;
  emptyComponent?: React.ReactNode;
  emptyText?: string;
}

// Layout component props
export interface LayoutProps extends BaseComponentProps {
  showHeader?: boolean;
  showSidebar?: boolean;
  showFooter?: boolean;
  sidebarOpen?: boolean;
  onSidebarToggle?: () => void;
}

export interface HeaderProps extends BaseComponentProps {
  user?: User | null;
  onLogout?: () => void;
  showMobileMenu?: boolean;
  onMobileMenuToggle?: () => void;
}

export interface SidebarProps extends BaseComponentProps {
  isOpen?: boolean;
  onClose?: () => void;
  user?: User | null;
  currentPath?: string;
}

export interface BreadcrumbProps extends BaseComponentProps {
  items?: Array<{
    label: string;
    href?: string;
    isActive?: boolean;
  }>;
  separator?: React.ReactNode;
}

// Form component props
export interface FormProps extends BaseComponentProps {
  onSubmit: (data: any) => void | Promise<void>;
  isSubmitting?: boolean;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  showCancel?: boolean;
  disabled?: boolean;
}

export interface InputProps extends BaseComponentProps {
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
}

export interface TextareaProps extends Omit<InputProps, 'type'> {
  rows?: number;
  cols?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export interface SelectProps extends BaseComponentProps {
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  multiple?: boolean;
}

export interface CheckboxProps extends BaseComponentProps {
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  indeterminate?: boolean;
}

export interface RadioProps extends BaseComponentProps {
  label?: string;
  name: string;
  value: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

// Button component props
export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'warning' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
}

// Modal and dialog props
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  preventScroll?: boolean;
}

export interface DialogProps extends ModalProps {
  type?: 'info' | 'warning' | 'error' | 'success' | 'confirm';
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  isConfirming?: boolean;
}

// Notification props
export interface NotificationProps extends BaseComponentProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

// User-related component props
export interface UserCardProps extends BaseComponentProps {
  user: User;
  showRole?: boolean;
  showLoyaltyScore?: boolean;
  showBadges?: boolean;
  showStats?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  actions?: React.ReactNode;
}

export interface UserAvatarProps extends BaseComponentProps {
  user: User;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showOnlineStatus?: boolean;
  onClick?: () => void;
  fallbackIcon?: React.ReactNode;
}

export interface UserListProps extends BaseComponentProps, AsyncComponentProps {
  users: User[];
  onUserClick?: (user: User) => void;
  showPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  filters?: any;
  onFiltersChange?: (filters: any) => void;
}

// Post-related component props
export interface PostCardProps extends BaseComponentProps {
  post: Post;
  showTopic?: boolean;
  showAuthor?: boolean;
  showStats?: boolean;
  showActions?: boolean;
  compact?: boolean;
  onClick?: () => void;
  onVote?: (vote: 'up' | 'down' | null) => void;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
}

export interface PostListProps extends BaseComponentProps, AsyncComponentProps {
  posts: Post[];
  onPostClick?: (post: Post) => void;
  onVote?: (postId: string, vote: 'up' | 'down' | null) => void;
  showPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  filters?: PostFilters;
  onFiltersChange?: (filters: PostFilters) => void;
}

export interface PostFormProps extends FormProps {
  initialData?: Partial<Post>;
  topicId?: string;
  parentId?: string;
  mode?: 'create' | 'edit' | 'reply';
  allowedTags?: string[];
  maxLength?: number;
  showPreview?: boolean;
}

// Topic-related component props
export interface TopicCardProps {
  topic: Topic;
  showCategory?: boolean;
  showStats?: boolean;
  showDescription?: boolean;
  compact?: boolean;
  onClick?: () => void;
  onSubscribe?: () => void;
  className?: string;
}

export interface TopicListProps {
  topics: Topic[];
  onTopicClick?: (topic: Topic) => void;
  onSubscribe?: (topicId: string) => void;
  showPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  filters?: TopicFilters;
  onFiltersChange?: (filters: TopicFilters) => void;
  isLoading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyText?: string;
  className?: string;
}

export interface TopicFiltersProps {
  filters: TopicFilters;
  onFiltersChange: (filters: TopicFilters) => void;
  categories?: TopicCategory[];
  showAdvanced?: boolean;
  onToggleAdvanced?: () => void;
  className?: string;
}

export interface TopicFormProps extends FormProps {
  initialData?: Partial<Topic>;
  categories: Array<{ id: string; name: string; color: string }>;
  mode?: 'create' | 'edit';
  allowedTags?: string[];
}

// Leaderboard component props
export interface LeaderboardProps extends BaseComponentProps, AsyncComponentProps {
  entries: LeaderboardEntry[];
  currentUser?: User;
  category?: string;
  timeRange?: string;
  showRankChange?: boolean;
  showBadges?: boolean;
  onUserClick?: (user: User) => void;
  onCategoryChange?: (category: string) => void;
  onTimeRangeChange?: (timeRange: string) => void;
}

export interface CompetitionCardProps extends BaseComponentProps {
  competition: Competition;
  showParticipants?: boolean;
  showPrizes?: boolean;
  compact?: boolean;
  onClick?: () => void;
  onJoin?: () => void;
  onLeave?: () => void;
}

export interface AchievementCardProps extends BaseComponentProps {
  achievement: Achievement;
  userProgress?: {
    current: number;
    target: number;
    percentage: number;
  };
  isUnlocked?: boolean;
  showProgress?: boolean;
  onClick?: () => void;
}

// Badge component props
export interface BadgeProps extends BaseComponentProps {
  badge: Badge;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  onClick?: () => void;
}

export interface BadgeListProps extends BaseComponentProps {
  badges: UserBadge[];
  maxDisplay?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showTooltips?: boolean;
  onBadgeClick?: (badge: Badge) => void;
}

// Moderation component props
export interface ModerationQueueProps extends BaseComponentProps, AsyncComponentProps {
  items: any[];
  onAction?: (itemId: string, action: ModerationAction) => void;
  onAssign?: (itemId: string, moderatorId: string) => void;
  filters?: any;
  onFiltersChange?: (filters: any) => void;
}

export interface ReportCardProps extends BaseComponentProps {
  report: Report;
  showTarget?: boolean;
  showReporter?: boolean;
  compact?: boolean;
  onClick?: () => void;
  onResolve?: (action: string) => void;
}

// Search component props
export interface SearchProps extends BaseComponentProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  suggestions?: string[];
  showSuggestions?: boolean;
  loading?: boolean;
  debounceMs?: number;
}

export interface SearchResultsProps extends BaseComponentProps, AsyncComponentProps {
  query: string;
  results: any[];
  type?: 'posts' | 'topics' | 'users' | 'all';
  onTypeChange?: (type: string) => void;
  onResultClick?: (result: any) => void;
  showFilters?: boolean;
  filters?: any;
  onFiltersChange?: (filters: any) => void;
}

// Pagination component props
export interface PaginationProps extends BaseComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

// Filter component props
export interface FilterProps extends BaseComponentProps {
  filters: Record<string, any>;
  onChange: (filters: Record<string, any>) => void;
  onReset?: () => void;
  options: Record<string, {
    type: 'select' | 'multiselect' | 'range' | 'date' | 'boolean';
    label: string;
    options?: Array<{ value: string; label: string }>;
    min?: number;
    max?: number;
    step?: number;
  }>;
  showReset?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

// Data table props
export interface DataTableProps<T> extends BaseComponentProps, AsyncComponentProps {
  data: T[];
  columns: Array<{
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    render?: (value: any, item: T) => React.ReactNode;
  }>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  onRowClick?: (item: T) => void;
  selectedRows?: string[];
  onRowSelect?: (selectedIds: string[]) => void;
  actions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (item: T) => void;
    disabled?: (item: T) => boolean;
  }>;
  bulkActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (selectedItems: T[]) => void;
  }>;
  showPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}
