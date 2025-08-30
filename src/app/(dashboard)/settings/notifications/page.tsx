/**
 * Notification Settings page for The Robot Overlord
 * Allows users to configure notification preferences and delivery methods
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import { OverlordMessage, OverlordHeader, OverlordContent } from '@/components/overlord/OverlordMessage';
import { useAppStore } from '@/stores/appStore';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationPreferences {
  // In-app notifications
  inApp: {
    achievements: boolean;
    moderation: boolean;
    social: boolean;
    system: boolean;
    posts: boolean;
    topics: boolean;
  };
  
  // Email notifications
  email: {
    enabled: boolean;
    achievements: boolean;
    moderation: boolean;
    social: boolean;
    system: boolean;
    posts: boolean;
    topics: boolean;
    digest: 'never' | 'daily' | 'weekly';
  };
  
  // Push notifications (browser)
  push: {
    enabled: boolean;
    achievements: boolean;
    moderation: boolean;
    social: boolean;
    system: boolean;
    posts: boolean;
    topics: boolean;
  };
  
  // Quiet hours
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
}

function NotificationSettingsContent() {
  const { user } = useAuth();
  const { addNotification } = useAppStore();
  
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    inApp: {
      achievements: true,
      moderation: true,
      social: true,
      system: true,
      posts: true,
      topics: true,
    },
    email: {
      enabled: true,
      achievements: true,
      moderation: true,
      social: false,
      system: true,
      posts: false,
      topics: false,
      digest: 'weekly',
    },
    push: {
      enabled: false,
      achievements: true,
      moderation: true,
      social: false,
      system: false,
      posts: false,
      topics: false,
    },
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
      timezone: 'America/New_York',
    },
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load preferences
  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      // In a real app, this would fetch from the API
      // For now, we'll use the default preferences
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Settings Error',
        message: 'Failed to load notification preferences',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  // Save preferences
  const savePreferences = async () => {
    try {
      setIsSaving(true);
      // In a real app, this would save to the API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setHasChanges(false);
      addNotification({
        type: 'success',
        title: 'Settings Saved',
        message: 'Your notification preferences have been updated.',
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Save Error',
        message: 'Failed to save notification preferences',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Update preference
  const updatePreference = (section: keyof NotificationPreferences, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  // Request push notification permission
  const requestPushPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        updatePreference('push', 'enabled', true);
        addNotification({
          type: 'success',
          title: 'Push Notifications Enabled',
          message: 'You will now receive browser push notifications.',
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Permission Denied',
          message: 'Push notifications require browser permission.',
        });
      }
    } else {
      addNotification({
        type: 'error',
        title: 'Not Supported',
        message: 'Push notifications are not supported in this browser.',
      });
    }
  };

  // Test notification
  const sendTestNotification = () => {
    addNotification({
      type: 'info',
      title: '🤖 Test Notification',
      message: 'This is a test notification from The Robot Overlord. Your settings are working correctly!',
    });
  };

  const notificationTypes = [
    { key: 'achievements', label: '🏆 Achievements', description: 'Badge earnings, rank changes, milestones' },
    { key: 'moderation', label: '🛡️ Moderation', description: 'Post approvals, rejections, flags' },
    { key: 'social', label: '💬 Social', description: 'Replies, mentions, follows' },
    { key: 'system', label: '🤖 System', description: 'Maintenance, updates, announcements' },
    { key: 'posts', label: '📝 Posts', description: 'New posts in followed topics' },
    { key: 'topics', label: '💭 Topics', description: 'New topics in your interests' },
  ];

  return (
    <LoadingState
      isLoading={isLoading}
      error={null}
      loadingComponent={
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-24 bg-muted/20 rounded-lg mb-6"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted/20 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <OverlordMessage variant="default">
          <OverlordHeader>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-light-text">Notification Settings</h1>
                <div className="text-sm text-muted-light mt-2">
                  COMMUNICATION PREFERENCES
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={sendTestNotification}
              >
                📢 Test Notification
              </Button>
            </div>
          </OverlordHeader>
          <OverlordContent>
            <p className="text-sm">
              Configure how and when you receive notifications from The Robot Overlord.
              Stay informed while maintaining control over your communication preferences.
            </p>
          </OverlordContent>
        </OverlordMessage>

        {/* In-App Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📱</span>
              <span>In-App Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-light">
                Control which notifications appear in the app interface and notification center.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notificationTypes.map((type) => (
                  <div key={type.key} className="flex items-center justify-between p-3 border border-muted/20 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-light-text">{type.label}</div>
                      <div className="text-xs text-muted-light">{type.description}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.inApp[type.key as keyof typeof preferences.inApp]}
                        onChange={(e) => updatePreference('inApp', type.key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-overlord-red"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📧</span>
              <span>Email Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-muted/20 rounded-lg bg-muted/5">
                <div>
                  <div className="font-medium text-light-text">Enable Email Notifications</div>
                  <div className="text-xs text-muted-light">Receive notifications via email</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.email.enabled}
                    onChange={(e) => updatePreference('email', 'enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-overlord-red"></div>
                </label>
              </div>

              {preferences.email.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {notificationTypes.map((type) => (
                      <div key={type.key} className="flex items-center justify-between p-3 border border-muted/20 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-light-text">{type.label}</div>
                          <div className="text-xs text-muted-light">{type.description}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.email[type.key as keyof typeof preferences.email] as boolean}
                            onChange={(e) => updatePreference('email', type.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-overlord-red"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 border border-muted/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-light-text">Email Digest</div>
                        <div className="text-xs text-muted-light">Receive summary emails instead of individual notifications</div>
                      </div>
                      <select
                        value={preferences.email.digest}
                        onChange={(e) => updatePreference('email', 'digest', e.target.value)}
                        className="bg-dark-surface border border-muted/20 rounded px-3 py-1 text-light-text"
                      >
                        <option value="never">Never</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🔔</span>
              <span>Browser Push Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-muted/20 rounded-lg bg-muted/5">
                <div>
                  <div className="font-medium text-light-text">Enable Push Notifications</div>
                  <div className="text-xs text-muted-light">Receive notifications even when the app is closed</div>
                </div>
                <div className="flex items-center space-x-2">
                  {!preferences.push.enabled && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={requestPushPermission}
                    >
                      Enable
                    </Button>
                  )}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.push.enabled}
                      onChange={(e) => updatePreference('push', 'enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-overlord-red"></div>
                  </label>
                </div>
              </div>

              {preferences.push.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {notificationTypes.map((type) => (
                    <div key={type.key} className="flex items-center justify-between p-3 border border-muted/20 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-light-text">{type.label}</div>
                        <div className="text-xs text-muted-light">{type.description}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.push[type.key as keyof typeof preferences.push] as boolean}
                          onChange={(e) => updatePreference('push', type.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-overlord-red"></div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🌙</span>
              <span>Quiet Hours</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-muted/20 rounded-lg bg-muted/5">
                <div>
                  <div className="font-medium text-light-text">Enable Quiet Hours</div>
                  <div className="text-xs text-muted-light">Pause non-urgent notifications during specified hours</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.quietHours.enabled}
                    onChange={(e) => updatePreference('quietHours', 'enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-overlord-red"></div>
                </label>
              </div>

              {preferences.quietHours.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-light-text mb-2">Start Time</label>
                    <input
                      type="time"
                      value={preferences.quietHours.startTime}
                      onChange={(e) => updatePreference('quietHours', 'startTime', e.target.value)}
                      className="w-full bg-dark-surface border border-muted/20 rounded px-3 py-2 text-light-text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-light-text mb-2">End Time</label>
                    <input
                      type="time"
                      value={preferences.quietHours.endTime}
                      onChange={(e) => updatePreference('quietHours', 'endTime', e.target.value)}
                      className="w-full bg-dark-surface border border-muted/20 rounded px-3 py-2 text-light-text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-light-text mb-2">Timezone</label>
                    <select
                      value={preferences.quietHours.timezone}
                      onChange={(e) => updatePreference('quietHours', 'timezone', e.target.value)}
                      className="w-full bg-dark-surface border border-muted/20 rounded px-3 py-2 text-light-text"
                    >
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        {hasChanges && (
          <div className="sticky bottom-4 bg-dark-surface/95 backdrop-blur-sm border border-muted/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-light">
                You have unsaved changes to your notification preferences.
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    loadPreferences();
                    setHasChanges(false);
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={savePreferences}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </LoadingState>
  );
}

export default function NotificationSettingsPage() {
  return (
    <ProtectedRoute>
      <NotificationSettingsContent />
    </ProtectedRoute>
  );
}
