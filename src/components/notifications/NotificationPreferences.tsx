'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { ServiceFactory } from '@/lib/services/factory'
import { NotificationPreferences } from '@/lib/types'

interface NotificationPreferencesProps {
  className?: string
}

export function NotificationPreferences({ className = '' }: NotificationPreferencesProps) {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const notificationService = ServiceFactory.getNotificationService()

  useEffect(() => {
    if (user) {
      loadPreferences()
    }
  }, [user])

  const loadPreferences = async () => {
    if (!user) return

    try {
      setLoading(true)
      const prefs = await notificationService.getNotificationPreferences(user.id)
      setPreferences(prefs)
    } catch (error) {
      console.error('Error loading notification preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePreference = async (key: keyof NotificationPreferences, value: any) => {
    if (!user || !preferences) return

    try {
      setSaving(true)
      const updatedPrefs = await notificationService.updateNotificationPreferences(user.id, {
        [key]: value
      })
      setPreferences(updatedPrefs)
    } catch (error) {
      console.error('Error updating notification preferences:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = (key: keyof NotificationPreferences) => {
    if (!preferences) return
    updatePreference(key, !preferences[key])
  }

  const handleTimeChange = (key: 'quiet_hours_start' | 'quiet_hours_end', value: string) => {
    updatePreference(key, value)
  }

  if (!user) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚙️</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to manage preferences</h3>
          <p className="text-gray-600">Customize your notification settings</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading preferences...</p>
        </div>
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading preferences</h3>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
        <p className="text-sm text-gray-600 mt-1">
          Customize how and when you receive notifications
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* General Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Push Notifications</label>
                <p className="text-sm text-gray-600">Receive notifications on your device</p>
              </div>
              <button
                onClick={() => handleToggle('push_notifications')}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  preferences.push_notifications ? 'bg-green-600' : 'bg-gray-200'
                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    preferences.push_notifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Email Notifications</label>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
              <button
                onClick={() => handleToggle('email_notifications')}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  preferences.email_notifications ? 'bg-green-600' : 'bg-gray-200'
                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    preferences.email_notifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Types</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xl">🌱</span>
                <div>
                  <label className="text-sm font-medium text-gray-900">Crop Updates</label>
                  <p className="text-sm text-gray-600">Milestones, growth stages, and harvest reminders</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('crop_updates')}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  preferences.crop_updates ? 'bg-green-600' : 'bg-gray-200'
                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    preferences.crop_updates ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xl">🌦️</span>
                <div>
                  <label className="text-sm font-medium text-gray-900">Weather Alerts</label>
                  <p className="text-sm text-gray-600">Rain, drought, frost, and severe weather warnings</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('weather_alerts')}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  preferences.weather_alerts ? 'bg-green-600' : 'bg-gray-200'
                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    preferences.weather_alerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xl">⭐</span>
                <div>
                  <label className="text-sm font-medium text-gray-900">XP & Achievements</label>
                  <p className="text-sm text-gray-600">Level ups, badges, and XP rewards</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('xp_notifications')}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  preferences.xp_notifications ? 'bg-green-600' : 'bg-gray-200'
                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    preferences.xp_notifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xl">🏰</span>
                <div>
                  <label className="text-sm font-medium text-gray-900">Clan Notifications</label>
                  <p className="text-sm text-gray-600">Invites, updates, and clan activities</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('clan_notifications')}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  preferences.clan_notifications ? 'bg-green-600' : 'bg-gray-200'
                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    preferences.clan_notifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xl">💰</span>
                <div>
                  <label className="text-sm font-medium text-gray-900">Market Alerts</label>
                  <p className="text-sm text-gray-600">Price changes and market opportunities</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('market_alerts')}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  preferences.market_alerts ? 'bg-green-600' : 'bg-gray-200'
                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    preferences.market_alerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xl">⚔️</span>
                <div>
                  <label className="text-sm font-medium text-gray-900">Game Notifications</label>
                  <p className="text-sm text-gray-600">Pest battles, quests, and game events</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('game_notifications')}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  preferences.game_notifications ? 'bg-green-600' : 'bg-gray-200'
                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    preferences.game_notifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Quiet Hours */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quiet Hours</h3>
          <p className="text-sm text-gray-600 mb-4">
            Set times when you don't want to receive notifications (except high priority alerts)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <input
                type="time"
                value={preferences.quiet_hours_start || '22:00'}
                onChange={(e) => handleTimeChange('quiet_hours_start', e.target.value)}
                disabled={saving}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <input
                type="time"
                value={preferences.quiet_hours_end || '07:00'}
                onChange={(e) => handleTimeChange('quiet_hours_end', e.target.value)}
                disabled={saving}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Save Status */}
        {saving && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            <span className="ml-2 text-sm text-gray-600">Saving preferences...</span>
          </div>
        )}
      </div>
    </div>
  )
}