/**
 * Form validation schemas for The Robot Overlord
 * Using Zod for runtime type validation and form validation
 */

import { z } from 'zod';

// Common validation patterns
const emailSchema = z.string().email('Invalid email address');
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number');

const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens');

const slugSchema = z.string()
  .min(1, 'Slug is required')
  .max(100, 'Slug must be less than 100 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens');

// Authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  username: usernameSchema,
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// User profile schemas
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  username: usernameSchema,
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  socialLinks: z.object({
    twitter: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
    github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
    linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  }).optional(),
});

export const userPreferencesSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  publicProfile: z.boolean(),
  showLoyaltyScore: z.boolean(),
  theme: z.enum(['dark', 'light', 'auto']),
  language: z.string().min(2, 'Language code required'),
});

// Post schemas
export const createPostSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters'),
  content: z.string()
    .min(10, 'Content must be at least 10 characters')
    .max(10000, 'Content must be less than 10,000 characters'),
  topicId: z.string().uuid('Invalid topic ID'),
  parentId: z.string().uuid('Invalid parent post ID').optional(),
  tags: z.array(z.string().min(1).max(30)).max(10, 'Maximum 10 tags allowed').optional(),
  status: z.enum(['draft', 'published']).default('published'),
});

export const updatePostSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  content: z.string()
    .min(10, 'Content must be at least 10 characters')
    .max(10000, 'Content must be less than 10,000 characters')
    .optional(),
  tags: z.array(z.string().min(1).max(30)).max(10, 'Maximum 10 tags allowed').optional(),
  editReason: z.string().max(200, 'Edit reason must be less than 200 characters').optional(),
});

export const postVoteSchema = z.object({
  vote: z.enum(['up', 'down']).nullable(),
});

export const reportPostSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
  category: z.enum(['spam', 'harassment', 'hate_speech', 'misinformation', 'inappropriate_content', 'copyright', 'other']),
  details: z.string().max(1000, 'Details must be less than 1000 characters').optional(),
});

// Topic schemas
export const createTopicSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(150, 'Title must be less than 150 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  categoryId: z.string().uuid('Invalid category ID'),
  tags: z.array(z.string().min(1).max(30)).max(10, 'Maximum 10 tags allowed').optional(),
  initialPost: z.object({
    title: z.string()
      .min(5, 'Post title must be at least 5 characters')
      .max(200, 'Post title must be less than 200 characters'),
    content: z.string()
      .min(10, 'Post content must be at least 10 characters')
      .max(10000, 'Post content must be less than 10,000 characters'),
  }).optional(),
});

export const updateTopicSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(150, 'Title must be less than 150 characters')
    .optional(),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  categoryId: z.string().uuid('Invalid category ID').optional(),
  tags: z.array(z.string().min(1).max(30)).max(10, 'Maximum 10 tags allowed').optional(),
});

export const createCategorySchema = z.object({
  name: z.string()
    .min(2, 'Category name must be at least 2 characters')
    .max(50, 'Category name must be less than 50 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format (use hex color)'),
  icon: z.string().max(50, 'Icon name must be less than 50 characters').optional(),
  parentId: z.string().uuid('Invalid parent category ID').optional(),
});

// Badge schemas
export const createBadgeSchema = z.object({
  name: z.string()
    .min(2, 'Badge name must be at least 2 characters')
    .max(50, 'Badge name must be less than 50 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(200, 'Description must be less than 200 characters'),
  icon: z.string().min(1, 'Icon is required'),
  category: z.enum(['achievement', 'participation', 'moderation', 'loyalty', 'special', 'seasonal', 'milestone']),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']),
  requirements: z.array(z.object({
    type: z.enum(['posts_created', 'upvotes_received', 'topics_created', 'days_active', 'loyalty_score', 'moderation_actions', 'special_event', 'streak_days']),
    target: z.number().min(1, 'Target must be at least 1'),
    timeframe: z.enum(['day', 'week', 'month', 'year', 'all']).optional(),
    description: z.string().min(1, 'Requirement description is required'),
  })).min(1, 'At least one requirement is needed'),
  rewards: z.object({
    loyaltyPoints: z.number().min(0, 'Loyalty points must be non-negative'),
    reputationPoints: z.number().min(0, 'Reputation points must be non-negative').optional(),
    title: z.string().max(50, 'Title must be less than 50 characters').optional(),
    privileges: z.array(z.string()).optional(),
  }),
  isSecret: z.boolean().default(false),
});

// Competition schemas
export const createCompetitionSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  type: z.enum(['weekly', 'monthly', 'seasonal', 'special', 'tournament']),
  category: z.enum(['posts', 'topics', 'engagement', 'loyalty', 'moderation', 'creativity']),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  maxParticipants: z.number().min(1, 'Must allow at least 1 participant').optional(),
  prizes: z.array(z.object({
    rank: z.number().min(1, 'Rank must be at least 1'),
    title: z.string().min(1, 'Prize title is required'),
    description: z.string().min(1, 'Prize description is required'),
    loyaltyBonus: z.number().min(0, 'Loyalty bonus must be non-negative').optional(),
  })).min(1, 'At least one prize is required'),
  rules: z.array(z.string().min(1)).min(1, 'At least one rule is required'),
});

// Moderation schemas
export const moderationActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'flag', 'remove', 'ban', 'suspend', 'warn', 'edit', 'lock', 'unlock', 'pin', 'unpin']),
  reason: z.string().max(500, 'Reason must be less than 500 characters').optional(),
  details: z.string().max(1000, 'Details must be less than 1000 characters').optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  notifyTarget: z.boolean().default(true),
  expiresAt: z.string().datetime('Invalid expiration date').optional(),
});

export const createReportSchema = z.object({
  type: z.enum(['post', 'topic', 'user', 'comment']),
  targetId: z.string().uuid('Invalid target ID'),
  reason: z.string().min(1, 'Reason is required'),
  category: z.enum(['spam', 'harassment', 'hate_speech', 'misinformation', 'inappropriate_content', 'copyright', 'other']),
  details: z.string().max(1000, 'Details must be less than 1000 characters').optional(),
});

// Search and filter schemas
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(200, 'Query must be less than 200 characters'),
  type: z.enum(['posts', 'topics', 'users', 'all']).default('all'),
  filters: z.record(z.any()).optional(),
});

export const paginationSchema = z.object({
  page: z.number().min(1, 'Page must be at least 1').default(1),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
});

// File upload schema
export const fileUploadSchema = z.object({
  file: z.instanceof(File, 'File is required'),
  type: z.enum(['avatar', 'attachment', 'badge_icon', 'category_icon']),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB default
});

// Type exports for form data
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type UserPreferencesFormData = z.infer<typeof userPreferencesSchema>;
export type CreatePostFormData = z.infer<typeof createPostSchema>;
export type UpdatePostFormData = z.infer<typeof updatePostSchema>;
export type PostVoteFormData = z.infer<typeof postVoteSchema>;
export type ReportPostFormData = z.infer<typeof reportPostSchema>;
export type CreateTopicFormData = z.infer<typeof createTopicSchema>;
export type UpdateTopicFormData = z.infer<typeof updateTopicSchema>;
export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
export type CreateBadgeFormData = z.infer<typeof createBadgeSchema>;
export type CreateCompetitionFormData = z.infer<typeof createCompetitionSchema>;
export type ModerationActionFormData = z.infer<typeof moderationActionSchema>;
export type CreateReportFormData = z.infer<typeof createReportSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type PaginationFormData = z.infer<typeof paginationSchema>;
export type FileUploadFormData = z.infer<typeof fileUploadSchema>;
