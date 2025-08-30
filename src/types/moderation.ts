/**
 * Moderation type definitions for The Robot Overlord
 * Based on backend API schema
 */

export interface ModerationAction {
  id: string;
  type: 'post' | 'topic' | 'user' | 'comment';
  targetId: string;
  action: 'approve' | 'reject' | 'flag' | 'remove' | 'ban' | 'suspend' | 'warn' | 'edit' | 'lock' | 'unlock' | 'pin' | 'unpin';
  reason?: string;
  details?: string;
  moderatedBy: string;
  moderator: {
    id: string;
    username: string;
    role: string;
    avatar?: string;
  };
  previousStatus?: string;
  newStatus: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isReversible: boolean;
  expiresAt?: string;
  notifyTarget: boolean;
  isPublic: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  reversedAt?: string;
  reversedBy?: string;
}

export interface ModerationQueue {
  id: string;
  type: 'post' | 'topic' | 'user' | 'report';
  targetId: string;
  target: {
    id: string;
    title?: string;
    content?: string;
    author?: {
      id: string;
      username: string;
      avatar?: string;
    };
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_review' | 'resolved' | 'escalated';
  assignedTo?: string;
  assignedModerator?: {
    id: string;
    username: string;
    avatar?: string;
  };
  reportCount: number;
  autoFlagged: boolean;
  flagReasons: string[];
  submittedAt: string;
  assignedAt?: string;
  reviewedAt?: string;
  escalatedAt?: string;
  deadline?: string;
}

export interface Report {
  id: string;
  type: 'post' | 'topic' | 'user' | 'comment';
  targetId: string;
  target: {
    id: string;
    title?: string;
    content?: string;
    author?: {
      id: string;
      username: string;
    };
  };
  reportedBy: string;
  reporter: {
    id: string;
    username: string;
    avatar?: string;
    trustScore: number;
  };
  reason: string;
  category: 'spam' | 'harassment' | 'hate_speech' | 'misinformation' | 'inappropriate_content' | 'copyright' | 'other';
  details?: string;
  evidence?: Array<{
    type: 'screenshot' | 'link' | 'text';
    url?: string;
    description?: string;
  }>;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reviewedBy?: string;
  reviewer?: {
    id: string;
    username: string;
    role: string;
  };
  resolution?: string;
  actionTaken?: ModerationAction;
  createdAt: string;
  reviewedAt?: string;
  resolvedAt?: string;
}

export interface ModerationRule {
  id: string;
  name: string;
  description: string;
  type: 'automatic' | 'manual' | 'hybrid';
  category: 'content' | 'behavior' | 'spam' | 'quality';
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  conditions: Array<{
    field: string;
    operator: 'equals' | 'contains' | 'matches' | 'greater_than' | 'less_than';
    value: any;
    weight: number;
  }>;
  actions: Array<{
    action: ModerationAction['action'];
    threshold: number;
    autoExecute: boolean;
    requiresReview: boolean;
  }>;
  exceptions: Array<{
    condition: string;
    reason: string;
  }>;
  statistics: {
    triggered: number;
    falsePositives: number;
    accuracy: number;
    lastTriggered?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ModerationStatistics {
  totalActions: number;
  pendingItems: number;
  averageResponseTime: number;
  actionBreakdown: Record<string, number>;
  moderatorPerformance: Array<{
    moderator: {
      id: string;
      username: string;
    };
    actionsCount: number;
    averageTime: number;
    accuracy: number;
    specializations: string[];
  }>;
  contentTrends: Array<{
    date: string;
    reports: number;
    actions: number;
    falsePositives: number;
  }>;
  categoryBreakdown: Record<string, {
    reports: number;
    resolved: number;
    pending: number;
  }>;
  automationEffectiveness: {
    autoResolved: number;
    requiresHuman: number;
    accuracy: number;
  };
}

export interface ModerationFilters {
  type?: ModerationQueue['type'];
  status?: ModerationQueue['status'];
  priority?: ModerationQueue['priority'];
  assignedTo?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  autoFlagged?: boolean;
  hasReports?: boolean;
  category?: Report['category'];
  severity?: ModerationAction['severity'];
  page?: number;
  limit?: number;
}

export interface CreateReportRequest {
  type: Report['type'];
  targetId: string;
  reason: string;
  category: Report['category'];
  details?: string;
  evidence?: Report['evidence'];
}

export interface ModerationDecision {
  action: ModerationAction['action'];
  reason?: string;
  details?: string;
  severity?: ModerationAction['severity'];
  notifyTarget?: boolean;
  isPublic?: boolean;
  expiresAt?: string;
  customMessage?: string;
}

export interface AppealRequest {
  id: string;
  moderationActionId: string;
  moderationAction: ModerationAction;
  appealedBy: string;
  appellant: {
    id: string;
    username: string;
    avatar?: string;
  };
  reason: string;
  evidence?: Array<{
    type: 'text' | 'link' | 'file';
    content: string;
    description?: string;
  }>;
  status: 'pending' | 'under_review' | 'approved' | 'denied' | 'withdrawn';
  reviewedBy?: string;
  reviewer?: {
    id: string;
    username: string;
    role: string;
  };
  decision?: string;
  decisionReason?: string;
  createdAt: string;
  reviewedAt?: string;
  resolvedAt?: string;
}

export interface ModerationTemplate {
  id: string;
  name: string;
  type: 'warning' | 'removal' | 'ban' | 'suspension' | 'approval' | 'rejection';
  subject: string;
  content: string;
  variables: string[];
  isDefault: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
