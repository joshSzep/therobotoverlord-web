"use client";

import React from 'react';
import { AuthGuard, UserProfile } from '@/components/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-overlord-robot-core">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="bg-overlord-card rounded-lg border border-overlord-border p-8">
            <h1 className="text-3xl font-bold text-overlord-light-text mb-8 font-display">
              User Profile
            </h1>
            
            {user && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-overlord-muted mb-2">
                      Username
                    </label>
                    <div className="text-overlord-light-text font-medium">
                      {user.username}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-overlord-muted mb-2">
                      Email
                    </label>
                    <div className="text-overlord-light-text font-medium">
                      {user.email}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-overlord-muted mb-2">
                      Role
                    </label>
                    <div className="text-overlord-light-text font-medium capitalize">
                      {user.role}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-overlord-muted mb-2">
                      Loyalty Score
                    </label>
                    <div className="text-overlord-accent font-bold text-lg">
                      {user.loyalty_score}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-overlord-muted mb-2">
                      Member Since
                    </label>
                    <div className="text-overlord-light-text font-medium">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-overlord-muted mb-2">
                      Permissions
                    </label>
                    <div className="text-overlord-light-text font-medium">
                      {user.permissions.length > 0 ? user.permissions.join(', ') : 'Standard User'}
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-overlord-border">
                  <UserProfile showLogoutAll={true} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
