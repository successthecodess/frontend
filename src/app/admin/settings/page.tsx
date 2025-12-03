'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Save, 
  RefreshCw, 
  Database, 
  Bell, 
  Shield,
  Palette,
  Mail,
  Key,
  TrendingUp
} from 'lucide-react';

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'AP CSA Practice Platform',
    siteDescription: 'Master AP Computer Science A with adaptive learning',
    supportEmail: 'support@apcsa.com',
    
    // Question Settings
    defaultDifficulty: 'MEDIUM',
    questionsPerSession: 40,
    timePerQuestion: 120, // seconds
    enableHints: true,
    enableExplanations: true,
    
    // Adaptive Learning
    correctStreakToAdvance: 3,
    wrongStreakToDecrease: 2,
    masteryThreshold: 70,
    
    // Notifications
    enableEmailNotifications: true,
    notifyOnNewQuestions: true,
    notifyOnLowPerformance: true,
    
    // Security
    requireEmailVerification: true,
    sessionTimeout: 60, // minutes
    maxLoginAttempts: 5,
    
    // API Keys
    openaiApiKey: '**********************',
    clerkApiKey: '**********************',
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // await api.updateSettings(settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset to default settings?')) {
      // Reset to defaults
      alert('Settings reset to defaults');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Configure platform settings and preferences
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleReset} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* General Settings */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            General Settings
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Site Name</Label>
            <Input
              value={settings.siteName}
              onChange={(e) =>
                setSettings({ ...settings, siteName: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Site Description</Label>
            <Textarea
              value={settings.siteDescription}
              onChange={(e) =>
                setSettings({ ...settings, siteDescription: e.target.value })
              }
              rows={3}
            />
          </div>

          <div>
            <Label>Support Email</Label>
            <Input
              type="email"
              value={settings.supportEmail}
              onChange={(e) =>
                setSettings({ ...settings, supportEmail: e.target.value })
              }
            />
          </div>
        </div>
      </Card>

      {/* Question Settings */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Database className="h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Question Settings
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Default Difficulty</Label>
            <Select
              value={settings.defaultDifficulty}
              onValueChange={(value) =>
                setSettings({ ...settings, defaultDifficulty: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
                <SelectItem value="EXPERT">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Questions per Session</Label>
            <Input
              type="number"
              value={settings.questionsPerSession}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  questionsPerSession: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div>
            <Label>Time per Question (seconds)</Label>
            <Input
              type="number"
              value={settings.timePerQuestion}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  timePerQuestion: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              checked={settings.enableHints}
              onChange={(e) =>
                setSettings({ ...settings, enableHints: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-indigo-600"
            />
            <Label className="mb-0">Enable Hints</Label>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              checked={settings.enableExplanations}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  enableExplanations: e.target.checked,
                })
              }
              className="h-4 w-4 rounded border-gray-300 text-indigo-600"
            />
            <Label className="mb-0">Enable Explanations</Label>
          </div>
        </div>
      </Card>

      {/* Adaptive Learning */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Adaptive Learning
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label>Correct Streak to Advance</Label>
            <Input
              type="number"
              value={settings.correctStreakToAdvance}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  correctStreakToAdvance: parseInt(e.target.value),
                })
              }
            />
            <p className="mt-1 text-sm text-gray-600">
              Consecutive correct answers needed to increase difficulty
            </p>
          </div>

          <div>
            <Label>Wrong Streak to Decrease</Label>
            <Input
              type="number"
              value={settings.wrongStreakToDecrease}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  wrongStreakToDecrease: parseInt(e.target.value),
                })
              }
            />
            <p className="mt-1 text-sm text-gray-600">
              Consecutive wrong answers to decrease difficulty
            </p>
          </div>

          <div>
            <Label>Mastery Threshold (%)</Label>
            <Input
              type="number"
              value={settings.masteryThreshold}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  masteryThreshold: parseInt(e.target.value),
                })
              }
            />
            <p className="mt-1 text-sm text-gray-600">
              Percentage required to consider topic mastered
            </p>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Notifications
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.enableEmailNotifications}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  enableEmailNotifications: e.target.checked,
                })
              }
              className="h-4 w-4 rounded border-gray-300 text-indigo-600"
            />
            <Label className="mb-0">Enable Email Notifications</Label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.notifyOnNewQuestions}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notifyOnNewQuestions: e.target.checked,
                })
              }
              className="h-4 w-4 rounded border-gray-300 text-indigo-600"
            />
            <Label className="mb-0">Notify on New Questions</Label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.notifyOnLowPerformance}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notifyOnLowPerformance: e.target.checked,
                })
              }
              className="h-4 w-4 rounded border-gray-300 text-indigo-600"
            />
            <Label className="mb-0">Notify on Low Performance</Label>
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Security Settings
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.requireEmailVerification}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  requireEmailVerification: e.target.checked,
                })
              }
              className="h-4 w-4 rounded border-gray-300 text-indigo-600"
            />
            <Label className="mb-0">Require Email Verification</Label>
          </div>

          <div>
            <Label>Session Timeout (minutes)</Label>
            <Input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  sessionTimeout: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div>
            <Label>Max Login Attempts</Label>
            <Input
              type="number"
              value={settings.maxLoginAttempts}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  maxLoginAttempts: parseInt(e.target.value),
                })
              }
            />
          </div>
        </div>
      </Card>

      {/* API Keys */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Key className="h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            API Keys
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label>OpenAI API Key</Label>
            <Input
              type="password"
              value={settings.openaiApiKey}
              onChange={(e) =>
                setSettings({ ...settings, openaiApiKey: e.target.value })
              }
              placeholder="sk-**********************"
            />
            <p className="mt-1 text-sm text-gray-600">
              Used for AI question generation and validation
            </p>
          </div>

          <div>
            <Label>Clerk API Key</Label>
            <Input
              type="password"
              value={settings.clerkApiKey}
              onChange={(e) =>
                setSettings({ ...settings, clerkApiKey: e.target.value })
              }
              placeholder="pk_**********************"
            />
            <p className="mt-1 text-sm text-gray-600">
              Used for authentication and user management
            </p>
          </div>
        </div>
      </Card>

      {/* Save Button (sticky) */}
      <div className="sticky bottom-4 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="lg"
          className="gap-2 shadow-lg"
        >
          <Save className="h-5 w-5" />
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>
    </div>
  );
}