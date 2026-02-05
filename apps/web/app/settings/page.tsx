'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Building2, Bell, Palette, Save, Check, ArrowRight } from 'lucide-react';
import { getCurrentTenantName } from '@/lib/api-client';
import { Card, CardBody, CardHeader } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import toast from 'react-hot-toast';

interface UserSettings {
  name: string;
  email: string;
  phone: string;
}

interface BusinessSettings {
  name: string;
  currency: string;
  taxId: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  invoiceReminders: boolean;
  paymentAlerts: boolean;
  lowStockAlerts: boolean;
}

interface ThemeSettings {
  theme: 'light' | 'dark' | 'system';
}

export default function SettingsPage() {
  const [userSettings, setUserSettings] = useState<UserSettings>({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+254 712 345 678',
  });

  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    name: 'My Business Ltd',
    currency: 'KES',
    taxId: 'P051234567A',
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    invoiceReminders: true,
    paymentAlerts: true,
    lowStockAlerts: true,
  });

  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    theme: 'light',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savedSection, setSavedSection] = useState<string | null>(null);
  const [currentWorkspaceName, setCurrentWorkspaceName] = useState<string | null>(null);

  useEffect(() => {
    setCurrentWorkspaceName(getCurrentTenantName());
  }, []);

  const validateUserSettings = (): boolean => {
    if (!userSettings.name.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (!userSettings.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userSettings.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!userSettings.phone.trim()) {
      toast.error('Phone number is required');
      return false;
    }
    return true;
  };

  const validateBusinessSettings = (): boolean => {
    if (!businessSettings.name.trim()) {
      toast.error('Business name is required');
      return false;
    }
    if (!businessSettings.currency.trim()) {
      toast.error('Currency is required');
      return false;
    }
    return true;
  };

  const handleSaveUserSettings = async () => {
    if (!validateUserSettings()) return;

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSavedSection('user');
      toast.success('User settings saved successfully');
      setTimeout(() => setSavedSection(null), 2000);
    } catch (error) {
      toast.error('Failed to save user settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBusinessSettings = async () => {
    if (!validateBusinessSettings()) return;

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSavedSection('business');
      toast.success('Business settings saved successfully');
      setTimeout(() => setSavedSection(null), 2000);
    } catch (error) {
      toast.error('Failed to save business settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSavedSection('notifications');
      toast.success('Notification preferences saved successfully');
      setTimeout(() => setSavedSection(null), 2000);
    } catch (error) {
      toast.error('Failed to save notification preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveThemeSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSavedSection('theme');
      toast.success('Theme settings saved successfully');
      setTimeout(() => setSavedSection(null), 2000);
    } catch (error) {
      toast.error('Failed to save theme settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = async () => {
    if (!validateUserSettings() || !validateBusinessSettings()) return;

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSavedSection('all');
      toast.success('All settings saved successfully');
      setTimeout(() => setSavedSection(null), 2000);
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-baobab-900">Settings</h1>
          <p className="text-baobab-600 mt-1">
            Manage your account and business preferences
          </p>
        </div>
        <Button variant="primary" onClick={handleSaveAll} loading={isSaving}>
          <Save className="h-5 w-5 mr-2" />
          Save All Changes
        </Button>
      </div>

      {/* Workspace */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-baobab-600" />
              <h2 className="font-display font-semibold text-lg">Workspace</h2>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-baobab-600 mb-4">
            Current workspace: <span className="font-medium text-baobab-900">{currentWorkspaceName || '—'}</span>
          </p>
          <Link
            href="/tenant-select"
            className="inline-flex items-center gap-2 text-acacia-600 hover:text-acacia-700 font-medium text-sm"
          >
            Switch workspace
            <ArrowRight className="h-4 w-4" />
          </Link>
        </CardBody>
      </Card>

      {/* User Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2 text-baobab-600" />
              <h2 className="font-display font-semibold text-lg">User Profile</h2>
            </div>
            {savedSection === 'user' && (
              <div className="flex items-center text-acacia-600">
                <Check className="h-4 w-4 mr-1" />
                <span className="text-sm">Saved</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              value={userSettings.name}
              onChange={(e) => setUserSettings({ ...userSettings, name: e.target.value })}
              placeholder="Enter your full name"
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={userSettings.email}
              onChange={(e) => setUserSettings({ ...userSettings, email: e.target.value })}
              placeholder="Enter your email"
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              value={userSettings.phone}
              onChange={(e) => setUserSettings({ ...userSettings, phone: e.target.value })}
              placeholder="Enter your phone number"
              required
            />
          </div>
          <div className="flex justify-end mt-6">
            <Button variant="secondary" onClick={handleSaveUserSettings} loading={isSaving}>
              Save Profile
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Business Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-baobab-600" />
              <h2 className="font-display font-semibold text-lg">Business Settings</h2>
            </div>
            {savedSection === 'business' && (
              <div className="flex items-center text-acacia-600">
                <Check className="h-4 w-4 mr-1" />
                <span className="text-sm">Saved</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Business Name"
              value={businessSettings.name}
              onChange={(e) => setBusinessSettings({ ...businessSettings, name: e.target.value })}
              placeholder="Enter your business name"
              required
            />
            <Select
              label="Currency"
              value={businessSettings.currency}
              onChange={(e) => setBusinessSettings({ ...businessSettings, currency: e.target.value })}
              options={[
                { value: 'KES', label: 'Kenyan Shilling (KES)' },
                { value: 'USD', label: 'US Dollar (USD)' },
                { value: 'EUR', label: 'Euro (EUR)' },
                { value: 'GBP', label: 'British Pound (GBP)' },
                { value: 'UGX', label: 'Ugandan Shilling (UGX)' },
                { value: 'TZS', label: 'Tanzanian Shilling (TZS)' },
              ]}
              required
            />
            <Input
              label="Tax ID / PIN"
              value={businessSettings.taxId}
              onChange={(e) => setBusinessSettings({ ...businessSettings, taxId: e.target.value })}
              placeholder="Enter your tax ID"
              helperText="Your business tax identification number"
            />
          </div>
          <div className="flex justify-end mt-6">
            <Button variant="secondary" onClick={handleSaveBusinessSettings} loading={isSaving}>
              Save Business Settings
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-5 w-5 mr-2 text-baobab-600" />
              <h2 className="font-display font-semibold text-lg">Notification Preferences</h2>
            </div>
            {savedSection === 'notifications' && (
              <div className="flex items-center text-acacia-600">
                <Check className="h-4 w-4 mr-1" />
                <span className="text-sm">Saved</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-savanna-50 rounded-lg hover:bg-savanna-100 transition-colors cursor-pointer">
              <div>
                <p className="font-medium text-baobab-900">Email Notifications</p>
                <p className="text-sm text-baobab-600">Receive updates via email</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.emailNotifications}
                onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                className="w-5 h-5 text-acacia-600 rounded focus:ring-acacia-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-savanna-50 rounded-lg hover:bg-savanna-100 transition-colors cursor-pointer">
              <div>
                <p className="font-medium text-baobab-900">SMS Notifications</p>
                <p className="text-sm text-baobab-600">Receive updates via SMS</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.smsNotifications}
                onChange={(e) => setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked })}
                className="w-5 h-5 text-acacia-600 rounded focus:ring-acacia-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-savanna-50 rounded-lg hover:bg-savanna-100 transition-colors cursor-pointer">
              <div>
                <p className="font-medium text-baobab-900">Invoice Reminders</p>
                <p className="text-sm text-baobab-600">Get reminded about pending invoices</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.invoiceReminders}
                onChange={(e) => setNotificationSettings({ ...notificationSettings, invoiceReminders: e.target.checked })}
                className="w-5 h-5 text-acacia-600 rounded focus:ring-acacia-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-savanna-50 rounded-lg hover:bg-savanna-100 transition-colors cursor-pointer">
              <div>
                <p className="font-medium text-baobab-900">Payment Alerts</p>
                <p className="text-sm text-baobab-600">Get notified when payments are received</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.paymentAlerts}
                onChange={(e) => setNotificationSettings({ ...notificationSettings, paymentAlerts: e.target.checked })}
                className="w-5 h-5 text-acacia-600 rounded focus:ring-acacia-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-savanna-50 rounded-lg hover:bg-savanna-100 transition-colors cursor-pointer">
              <div>
                <p className="font-medium text-baobab-900">Low Stock Alerts</p>
                <p className="text-sm text-baobab-600">Get notified when inventory is low</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.lowStockAlerts}
                onChange={(e) => setNotificationSettings({ ...notificationSettings, lowStockAlerts: e.target.checked })}
                className="w-5 h-5 text-acacia-600 rounded focus:ring-acacia-500"
              />
            </label>
          </div>
          <div className="flex justify-end mt-6">
            <Button variant="secondary" onClick={handleSaveNotificationSettings} loading={isSaving}>
              Save Preferences
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Palette className="h-5 w-5 mr-2 text-baobab-600" />
              <h2 className="font-display font-semibold text-lg">Appearance</h2>
            </div>
            {savedSection === 'theme' && (
              <div className="flex items-center text-acacia-600">
                <Check className="h-4 w-4 mr-1" />
                <span className="text-sm">Saved</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardBody>
          <Select
            label="Theme"
            value={themeSettings.theme}
            onChange={(e) => setThemeSettings({ ...themeSettings, theme: e.target.value as 'light' | 'dark' | 'system' })}
            options={[
              { value: 'light', label: 'Light Mode' },
              { value: 'dark', label: 'Dark Mode' },
              { value: 'system', label: 'System Default' },
            ]}
            hint="Choose your preferred color scheme"
          />
          <div className="flex justify-end mt-6">
            <Button variant="secondary" onClick={handleSaveThemeSettings} loading={isSaving}>
              Save Theme
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
