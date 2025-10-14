'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/types/auth';
import { apiService } from '@/services/api';
import { backendTester } from '@/utils/backendTester';
import { useRouter } from 'next/navigation';
import { BackButton } from '@/components/BackButton';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  allowRegistration: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  maintenanceMode: boolean;
  emailNotifications: boolean;
}

export default function SettingsPage() {
  const { state } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'Comic Reader Site',
    siteDescription: 'The best place to read manga online',
    allowRegistration: true,
    maxFileSize: 10, // MB
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'webp'],
    maintenanceMode: false,
    emailNotifications: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [isTestingBackend, setIsTestingBackend] = useState(false);

  useEffect(() => {
    if (state.isAuthenticated) {
      loadSettings();
    }
  }, [state.isAuthenticated]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      // Try to load settings from backend
      // For now, use default settings
      setSettings({
        siteName: 'Comic Reader Site',
        siteDescription: 'The best place to read manga online',
        allowRegistration: true,
        maxFileSize: 10,
        allowedFileTypes: ['jpg', 'jpeg', 'png', 'webp'],
        maintenanceMode: false,
        emailNotifications: true,
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // TODO: Save settings to backend
      console.log('Saving settings:', settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestBackend = async () => {
    try {
      setIsTestingBackend(true);
      const results = await backendTester.runAllTests();
      setTestResults(results);
    } catch (error) {
      console.error('Backend test failed:', error);
      setTestResults({ success: false, message: 'Test failed' });
    } finally {
      setIsTestingBackend(false);
    }
  };

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 text-gray-100">
        <div className="max-w-md rounded-2xl border border-purple-600/30 bg-gray-900/80 p-8 text-center shadow-2xl">
          <h2 className="text-xl font-semibold text-purple-200 mb-3">Access Denied</h2>
          <p className="text-sm text-gray-300">You need to sign in to manage system settings.</p>
        </div>
      </div>
    );
  }

  const { user } = state;

  // Check if user has admin permissions
  if (!isAdmin(user)) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 text-gray-100">
        <div className="max-w-md rounded-2xl border border-red-600/30 bg-gray-900/80 p-8 text-center shadow-2xl">
          <h2 className="text-xl font-semibold text-red-300 mb-3">Insufficient Permissions</h2>
          <p className="text-sm text-gray-300">Only administrators can access system settings. Switch to an admin account to continue.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-purple-500/20"></div>
          <div className="absolute inset-0 h-12 w-12 rounded-full border-t-2 border-purple-400 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <BackButton />

          <div>
            <h1 className="text-3xl font-semibold text-white">System Administration</h1>
            <p className="text-sm text-gray-400 mt-2">Adjust platform-wide preferences and monitor integrations.</p>
          </div>

          <div className="space-y-6">
            {/* General Settings */}
            <div className="rounded-2xl border border-white/5 bg-gray-900/70 shadow-lg">
              <div className="px-6 py-4 border-b border-white/5">
                <h2 className="text-lg font-medium text-white">General Settings</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Site Name</label>
                  <input
                    type="text"
                    className="mt-2 block w-full rounded-lg border border-white/10 bg-gray-900/80 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    placeholder="Enter site name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Site Description</label>
                  <textarea
                    rows={3}
                    className="mt-2 block w-full rounded-lg border border-white/10 bg-gray-900/80 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    placeholder="Enter site description"
                  />
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                  <input
                    type="checkbox"
                    id="allowRegistration"
                    className="h-4 w-4 rounded border-white/20 bg-gray-900/80 text-purple-500 focus:ring-purple-500"
                    checked={settings.allowRegistration}
                    onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                  />
                  <label htmlFor="allowRegistration" className="text-sm font-medium text-gray-200">
                    Allow user registration
                  </label>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    className="h-4 w-4 rounded border-white/20 bg-gray-900/80 text-purple-500 focus:ring-purple-500"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  />
                  <label htmlFor="maintenanceMode" className="text-sm font-medium text-gray-200">
                    Maintenance mode
                  </label>
                </div>
              </div>
            </div>

            {/* File Upload Settings */}
            <div className="rounded-2xl border border-white/5 bg-gray-900/70 shadow-lg">
              <div className="px-6 py-4 border-b border-white/5">
                <h2 className="text-lg font-medium text-white">File Upload Settings</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Max File Size (MB)</label>
                  <input
                    type="number"
                    title="Maximum file size in megabytes"
                    placeholder="e.g., 10"
                    min="1"
                    max="100"
                    className="mt-2 block w-full rounded-lg border border-white/10 bg-gray-900/80 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                    value={settings.maxFileSize}
                    onChange={(e) => setSettings({ ...settings, maxFileSize: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Allowed File Types</label>
                  <div className="mt-3 space-y-2">
                    {['jpg', 'jpeg', 'png', 'webp', 'gif'].map((type) => (
                      <div key={type} className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                        <input
                          type="checkbox"
                          id={`filetype-${type}`}
                          className="h-4 w-4 rounded border-white/20 bg-gray-900/80 text-purple-500 focus:ring-purple-500"
                          checked={settings.allowedFileTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSettings({
                                ...settings,
                                allowedFileTypes: [...settings.allowedFileTypes, type]
                              });
                            } else {
                              setSettings({
                                ...settings,
                                allowedFileTypes: settings.allowedFileTypes.filter(t => t !== type)
                              });
                            }
                          }}
                        />
                        <label htmlFor={`filetype-${type}`} className="text-sm text-gray-200">
                          .{type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="rounded-2xl border border-white/5 bg-gray-900/70 shadow-lg">
              <div className="px-6 py-4 border-b border-white/5">
                <h2 className="text-lg font-medium text-white">Notification Settings</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    className="h-4 w-4 rounded border-white/20 bg-gray-900/80 text-purple-500 focus:ring-purple-500"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  />
                  <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-200">
                    Enable email notifications
                  </label>
                </div>
              </div>
            </div>

            {/* Backend Testing */}
            <div className="rounded-2xl border border-white/5 bg-gray-900/70 shadow-lg">
              <div className="px-6 py-4 border-b border-white/5">
                <h2 className="text-lg font-medium text-white">Backend Connection</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Test Backend Connection</h3>
                    <p className="text-xs text-gray-400">Verify connectivity to the Tomcat backend running on port 8080.</p>
                  </div>
                  <button
                    onClick={handleTestBackend}
                    disabled={isTestingBackend}
                    className="rounded-lg border border-purple-500/40 bg-purple-600/20 px-4 py-2 text-sm font-medium text-purple-100 transition hover:border-purple-400/60 hover:bg-purple-600/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isTestingBackend ? 'Testing…' : 'Test Connection'}
                  </button>
                </div>

                {testResults && (
                  <div
                    className={`rounded-xl border px-4 py-3 text-sm ${
                      testResults.success
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
                        : 'border-red-500/40 bg-red-500/10 text-red-100'
                    }`}
                  >
                    <div className="font-semibold">
                      {testResults.success ? 'Backend connection successful' : 'Backend connection failed'}
                    </div>
                    <div className="text-xs text-gray-200 mt-2">{testResults.message}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-6 py-2 text-sm font-semibold text-emerald-100 transition hover:border-emerald-400/60 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? 'Saving…' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}