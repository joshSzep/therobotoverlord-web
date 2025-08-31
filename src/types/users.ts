export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  role: 'user' | 'moderator' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
  preferences?: UserPreferences;
  stats?: UserStats;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    mentions: boolean;
    replies: boolean;
  };
  privacy: {
    showEmail: boolean;
    showLastActive: boolean;
  };
}

export interface UserStats {
  postsCount: number;
  topicsCount: number;
  commentsCount: number;
  likesReceived: number;
  reputation: number;
}

export interface UserProfile extends User {
  posts?: unknown[];
  topics?: unknown[];
  followers?: number;
  following?: number;
}

export interface UpdateUserRequest {
  displayName?: string;
  bio?: string;
  avatar?: string;
  preferences?: Partial<UserPreferences>;
}
