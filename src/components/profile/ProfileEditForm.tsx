'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User } from '@/types/user';
import { apiClient } from '@/lib/api-client';

interface ProfileEditFormProps {
  user: User;
  onUpdate: (updates: Partial<User>) => void;
  isLoading: boolean;
}

export function ProfileEditForm({ user, onUpdate, isLoading }: ProfileEditFormProps) {
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    bio: user.bio || '',
    display_name: user.display_name || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedUser = await apiClient.put<User>(`/users/${user.id}`, formData);
      onUpdate(updatedUser);
      setSuccess('Profile updated successfully!');
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user.username || '',
      email: user.email || '',
      bio: user.bio || '',
      display_name: user.display_name || '',
    });
    setError(null);
    setSuccess(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Display Name */}
          <div>
            <label htmlFor="display_name" className="block text-sm font-medium text-light-text mb-2">
              Display Name
            </label>
            <Input
              id="display_name"
              name="display_name"
              type="text"
              value={formData.display_name}
              onChange={handleInputChange}
              placeholder="Your display name"
              disabled={isSaving || isLoading}
              className="w-full"
            />
            <p className="text-xs text-muted-light mt-1">
              This is how your name appears to other citizens.
            </p>
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-light-text mb-2">
              Username
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Your unique username"
              disabled={isSaving || isLoading}
              className="w-full"
            />
            <p className="text-xs text-muted-light mt-1">
              Your unique identifier in the Robot Overlord's domain.
            </p>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-light-text mb-2">
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your.email@domain.com"
              disabled={isSaving || isLoading}
              className="w-full"
            />
            <p className="text-xs text-muted-light mt-1">
              Used for notifications and account recovery.
            </p>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-light-text mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell other citizens about yourself..."
              disabled={isSaving || isLoading}
              rows={4}
              className="w-full px-3 py-2 bg-input border border-input-border rounded-lg text-light-text placeholder-muted-light focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent resize-none"
            />
            <p className="text-xs text-muted-light mt-1">
              A brief description visible on your profile.
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="p-3 bg-rejected-red/10 border border-rejected-red rounded-lg">
              <p className="text-rejected-red text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-approved-green/10 border border-approved-green rounded-lg">
              <p className="text-approved-green text-sm">{success}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving || isLoading}
              className="flex-1"
            >
              {isSaving ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-light-text border-t-transparent rounded-full animate-spin mr-2"></div>
                  Updating...
                </div>
              ) : (
                'Save Changes'
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={isSaving || isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
