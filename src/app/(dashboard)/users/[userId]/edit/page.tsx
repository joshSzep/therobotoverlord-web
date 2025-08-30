/**
 * User profile editing page for The Robot Overlord
 * Allows users to edit their profile information and settings
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner, LoadingState } from '@/components/ui/LoadingSpinner';
import { useAppStore } from '@/stores/appStore';
import { usersService } from '@/services';
import { User } from '@/types/users';

interface ProfileFormData {
  displayName: string;
  bio: string;
  email: string;
  location: string;
  website: string;
  twitter: string;
  linkedin: string;
  github: string;
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    weeklyDigest: boolean;
    mentionAlerts: boolean;
    followAlerts: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'followers';
    showEmail: boolean;
    showLocation: boolean;
    showActivity: boolean;
  };
}

export default function EditProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const { addNotification, currentUser } = useAppStore();
  
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: '',
    bio: '',
    email: '',
    location: '',
    website: '',
    twitter: '',
    linkedin: '',
    github: '',
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      weeklyDigest: false,
      mentionAlerts: true,
      followAlerts: false,
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showLocation: true,
      showActivity: true,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy'>('profile');
  const [hasChanges, setHasChanges] = useState(false);

  // Load user profile data
  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userResponse = await usersService.getUserById(userId);
      if (userResponse.data) {
        const userData = userResponse.data;
        setUser(userData);
        
        // Populate form with existing data
        setFormData({
          displayName: userData.displayName || '',
          bio: userData.bio || '',
          email: userData.email || '',
          location: userData.location || '',
          website: userData.website || '',
          twitter: userData.twitter || '',
          linkedin: userData.linkedin || '',
          github: userData.github || '',
          notifications: {
            emailNotifications: userData.emailNotifications ?? true,
            pushNotifications: userData.pushNotifications ?? true,
            weeklyDigest: userData.weeklyDigest ?? false,
            mentionAlerts: userData.mentionAlerts ?? true,
            followAlerts: userData.followAlerts ?? false,
          },
          privacy: {
            profileVisibility: userData.profileVisibility || 'public',
            showEmail: userData.showEmail ?? false,
            showLocation: userData.showLocation ?? true,
            showActivity: userData.showActivity ?? true,
          },
        });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user profile';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Profile Error',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (userId) {
      // Check if user can edit this profile
      if (currentUser?.id !== userId) {
        addNotification({
          type: 'error',
          title: 'Access Denied',
          message: 'You can only edit your own profile',
        });
        router.push(`/users/${userId}`);
        return;
      }
      
      loadUserProfile();
    }
  }, [userId, currentUser]);

  // Handle form changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleNestedChange = (section: 'notifications' | 'privacy', field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  // Save profile changes
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const updateData = {
        displayName: formData.displayName,
        bio: formData.bio,
        email: formData.email,
        location: formData.location,
        website: formData.website,
        twitter: formData.twitter,
        linkedin: formData.linkedin,
        github: formData.github,
        ...formData.notifications,
        ...formData.privacy,
      };

      await usersService.updateUser(userId, updateData);
      
      setHasChanges(false);
      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated',
      });

      // Redirect back to profile
      router.push(`/users/${userId}`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Update Error',
        message: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        router.push(`/users/${userId}`);
      }
    } else {
      router.push(`/users/${userId}`);
    }
  };

  return (
    <LoadingState
      isLoading={isLoading}
      error={error}
      loadingComponent={
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-16 bg-muted/20 rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <div className="h-64 bg-muted/20 rounded-lg"></div>
              </div>
              <div className="lg:col-span-3">
                <div className="h-96 bg-muted/20 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      {user ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-light-text">Edit Profile</h1>
              <p className="text-muted-light mt-1">
                Update your profile information and preferences
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Navigation Sidebar */}
            <div className="lg:col-span-1">
              <Card variant="bordered">
                <CardContent className="p-4">
                  <nav className="space-y-2">
                    {[
                      { id: 'profile', label: 'Profile Info', icon: '👤' },
                      { id: 'notifications', label: 'Notifications', icon: '🔔' },
                      { id: 'privacy', label: 'Privacy', icon: '🔒' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-overlord-red/20 text-overlord-red'
                            : 'text-muted-light hover:bg-muted/10 hover:text-light-text'
                        }`}
                      >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Form Content */}
            <div className="lg:col-span-3">
              {activeTab === 'profile' && (
                <Card variant="bordered">
                  <CardHeader>
                    <h3 className="text-lg font-bold text-light-text">Profile Information</h3>
                    <p className="text-sm text-muted-light">
                      Update your public profile information
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-light-text mb-2">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={formData.displayName}
                          onChange={(e) => handleInputChange('displayName', e.target.value)}
                          className="w-full px-3 py-2 bg-dark-bg border border-muted/20 rounded-lg text-light-text placeholder-muted-light focus:border-overlord-red focus:outline-none"
                          placeholder="Your display name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-light-text mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-3 py-2 bg-dark-bg border border-muted/20 rounded-lg text-light-text placeholder-muted-light focus:border-overlord-red focus:outline-none"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-light-text mb-2">
                        Bio
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 bg-dark-bg border border-muted/20 rounded-lg text-light-text placeholder-muted-light focus:border-overlord-red focus:outline-none resize-none"
                        placeholder="Tell us about yourself..."
                      />
                      <p className="text-xs text-muted-light mt-1">
                        {formData.bio.length}/500 characters
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-light-text mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className="w-full px-3 py-2 bg-dark-bg border border-muted/20 rounded-lg text-light-text placeholder-muted-light focus:border-overlord-red focus:outline-none"
                          placeholder="City, Country"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-light-text mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          className="w-full px-3 py-2 bg-dark-bg border border-muted/20 rounded-lg text-light-text placeholder-muted-light focus:border-overlord-red focus:outline-none"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="border-t border-muted/20 pt-6">
                      <h4 className="text-md font-medium text-light-text mb-4">Social Links</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-light-text mb-2">
                            Twitter
                          </label>
                          <input
                            type="text"
                            value={formData.twitter}
                            onChange={(e) => handleInputChange('twitter', e.target.value)}
                            className="w-full px-3 py-2 bg-dark-bg border border-muted/20 rounded-lg text-light-text placeholder-muted-light focus:border-overlord-red focus:outline-none"
                            placeholder="@username"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-light-text mb-2">
                            LinkedIn
                          </label>
                          <input
                            type="text"
                            value={formData.linkedin}
                            onChange={(e) => handleInputChange('linkedin', e.target.value)}
                            className="w-full px-3 py-2 bg-dark-bg border border-muted/20 rounded-lg text-light-text placeholder-muted-light focus:border-overlord-red focus:outline-none"
                            placeholder="linkedin.com/in/username"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-light-text mb-2">
                            GitHub
                          </label>
                          <input
                            type="text"
                            value={formData.github}
                            onChange={(e) => handleInputChange('github', e.target.value)}
                            className="w-full px-3 py-2 bg-dark-bg border border-muted/20 rounded-lg text-light-text placeholder-muted-light focus:border-overlord-red focus:outline-none"
                            placeholder="github.com/username"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'notifications' && (
                <Card variant="bordered">
                  <CardHeader>
                    <h3 className="text-lg font-bold text-light-text">Notification Preferences</h3>
                    <p className="text-sm text-muted-light">
                      Choose how you want to be notified about activity
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {[
                      {
                        key: 'emailNotifications',
                        label: 'Email Notifications',
                        description: 'Receive notifications via email',
                        icon: '📧',
                      },
                      {
                        key: 'pushNotifications',
                        label: 'Push Notifications',
                        description: 'Receive browser push notifications',
                        icon: '🔔',
                      },
                      {
                        key: 'weeklyDigest',
                        label: 'Weekly Digest',
                        description: 'Get a weekly summary of activity',
                        icon: '📊',
                      },
                      {
                        key: 'mentionAlerts',
                        label: 'Mention Alerts',
                        description: 'Get notified when someone mentions you',
                        icon: '💬',
                      },
                      {
                        key: 'followAlerts',
                        label: 'Follow Alerts',
                        description: 'Get notified when someone follows you',
                        icon: '👤',
                      },
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between p-4 border border-muted/20 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <span className="text-xl">{setting.icon}</span>
                          <div>
                            <h4 className="font-medium text-light-text">{setting.label}</h4>
                            <p className="text-sm text-muted-light">{setting.description}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.notifications[setting.key as keyof typeof formData.notifications]}
                            onChange={(e) => handleNestedChange('notifications', setting.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-muted/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-overlord-red"></div>
                        </label>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'privacy' && (
                <Card variant="bordered">
                  <CardHeader>
                    <h3 className="text-lg font-bold text-light-text">Privacy Settings</h3>
                    <p className="text-sm text-muted-light">
                      Control who can see your information and activity
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Profile Visibility */}
                    <div className="p-4 border border-muted/20 rounded-lg">
                      <h4 className="font-medium text-light-text mb-3">Profile Visibility</h4>
                      <div className="space-y-3">
                        {[
                          { value: 'public', label: 'Public', description: 'Anyone can view your profile' },
                          { value: 'followers', label: 'Followers Only', description: 'Only your followers can view your profile' },
                          { value: 'private', label: 'Private', description: 'Only you can view your profile' },
                        ].map((option) => (
                          <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="profileVisibility"
                              value={option.value}
                              checked={formData.privacy.profileVisibility === option.value}
                              onChange={(e) => handleNestedChange('privacy', 'profileVisibility', e.target.value)}
                              className="mt-1 text-overlord-red focus:ring-overlord-red"
                            />
                            <div>
                              <div className="font-medium text-light-text">{option.label}</div>
                              <div className="text-sm text-muted-light">{option.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Information Visibility */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-light-text">Information Visibility</h4>
                      {[
                        {
                          key: 'showEmail',
                          label: 'Show Email',
                          description: 'Display your email address on your profile',
                          icon: '📧',
                        },
                        {
                          key: 'showLocation',
                          label: 'Show Location',
                          description: 'Display your location on your profile',
                          icon: '📍',
                        },
                        {
                          key: 'showActivity',
                          label: 'Show Activity',
                          description: 'Display your recent activity on your profile',
                          icon: '📊',
                        },
                      ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between p-4 border border-muted/20 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <span className="text-xl">{setting.icon}</span>
                            <div>
                              <h5 className="font-medium text-light-text">{setting.label}</h5>
                              <p className="text-sm text-muted-light">{setting.description}</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.privacy[setting.key as keyof typeof formData.privacy] as boolean}
                              onChange={(e) => handleNestedChange('privacy', setting.key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-muted/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-overlord-red"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Unsaved Changes Warning */}
          {hasChanges && (
            <div className="fixed bottom-6 right-6 bg-warning-amber/20 border border-warning-amber/30 rounded-lg p-4 max-w-sm">
              <div className="flex items-start space-x-3">
                <span className="text-warning-amber text-xl">⚠️</span>
                <div>
                  <h4 className="font-medium text-light-text">Unsaved Changes</h4>
                  <p className="text-sm text-muted-light">You have unsaved changes that will be lost if you leave.</p>
                  <div className="flex space-x-2 mt-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                    >
                      Discard
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚫</div>
          <h3 className="text-xl font-bold text-light-text mb-2">
            Access Denied
          </h3>
          <p className="text-muted-light">
            You don't have permission to edit this profile.
          </p>
        </div>
      )}
    </LoadingState>
  );
}
