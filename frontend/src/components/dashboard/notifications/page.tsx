'use client'

import { useState, useEffect } from 'react'
import { 
  Bell, 
  Check, 
  Trash2, 
  Filter, 
  Mail, 
  Smartphone, 
  MessageSquare,
  Bell as BellIcon,
  Settings,
  X
} from 'lucide-react'
import { useNotificationStore } from '@/store/notificationStore'
import { format } from 'date-fns'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showPreferences, setShowPreferences] = useState(false)

  const {
    notifications,
    preferences,
    isLoading,
    fetchNotifications,
    fetchPreferences,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences
  } = useNotificationStore()

  useEffect(() => {
    fetchNotifications()
    fetchPreferences()
  }, [])

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread' && notification.read) return false
    if (selectedType !== 'all' && notification.type !== selectedType) return false
    return true
  })

  const notificationTypes = [
    { id: 'all', label: 'All Types', icon: Bell },
    { id: 'payment', label: 'Payments', icon: Bell },
    { id: 'collection', label: 'Collections', icon: Bell },
    { id: 'prediction', label: 'Predictions', icon: Bell },
    { id: 'alert', label: 'Alerts', icon: Bell },
    { id: 'system', label: 'System', icon: Bell }
  ]

  const deliveryMethods = [
    { id: 'email', label: 'Email', icon: Mail, description: 'Receive notifications via email' },
    { id: 'push', label: 'Push', icon: Smartphone, description: 'Receive browser push notifications' },
    { id: 'sms', label: 'SMS', icon: MessageSquare, description: 'Receive SMS notifications' },
    { id: 'in_app', label: 'In-App', icon: BellIcon, description: 'See notifications in the app' }
  ]

  const notificationCategories = [
    { id: 'payment', label: 'Payments', description: 'Payment updates and alerts' },
    { id: 'collection', label: 'Collections', description: 'Collection updates and alerts' },
    { id: 'system', label: 'System', description: 'System updates and maintenance' },
    { id: 'alert', label: 'Alerts', description: 'Important alerts and warnings' },
    { id: 'prediction', label: 'Predictions', description: 'AI prediction updates' }
  ]

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">Manage your notifications and preferences</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPreferences(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              <Settings size={18} />
              <span>Preferences</span>
            </button>
            <button
              onClick={() => markAllAsRead()}
              className="flex items-center space-x-2 px-4 py-2 bg-tea-600 text-white rounded-lg hover:bg-tea-700"
            >
              <Check size={18} />
              <span>Mark all as read</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm font-medium">Filter by:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeTab === 'all'
                    ? 'bg-tea-100 text-tea-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeTab === 'unread'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Unread
              </button>
            </div>
            <div className="flex flex-wrap gap-2 ml-auto">
              {notificationTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${
                    selectedType === type.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <type.icon size={14} />
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tea-600 mx-auto"></div>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="divide-y">
              {filteredNotifications.map(notification => (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-tea-100 rounded-full flex items-center justify-center">
                      <Bell className="text-tea-600" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600">
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                          </span>
                          <div className="flex items-center space-x-1">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification._id)}
                                className="p-1 text-gray-400 hover:text-green-500"
                                title="Mark as read"
                              >
                                <Check size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification._id)}
                              className="p-1 text-gray-400 hover:text-red-500"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center space-x-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {notification.type}
                        </span>
                        {notification.action && (
                          <a
                            href={notification.action.url}
                            className="text-sm text-tea-600 hover:text-tea-700"
                          >
                            {notification.action.label} →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Bell size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">
                {activeTab === 'unread' 
                  ? "You've read all your notifications"
                  : "No notifications found with the selected filters"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Preferences Modal */}
      {showPreferences && preferences && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {deliveryMethods.map(method => (
                  <div key={method.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <method.icon className="text-gray-600" size={20} />
                        </div>
                        <div>
                          <h3 className="font-medium">{method.label}</h3>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={method.id === 'in_app' ? true : preferences[method.id as keyof typeof preferences]?.payment}
                          onChange={(e) => {
                            // Update all categories for this delivery method
                            const updated = { ...preferences }
                            notificationCategories.forEach(cat => {
                              if (updated[method.id as keyof typeof preferences]) {
                                updated[method.id as keyof typeof preferences][cat.id as keyof typeof updated[typeof method.id]] = e.target.checked
                              }
                            })
                            updatePreferences(updated)
                          }}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-tea-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tea-600"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {notificationCategories.map(category => (
                        <div key={category.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                          <div>
                            <span className="text-sm font-medium">{category.label}</span>
                            <p className="text-xs text-gray-500">{category.description}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={preferences[method.id as keyof typeof preferences]?.[category.id as keyof typeof preferences[typeof method.id]] || false}
                              onChange={(e) => {
                                const updated = { ...preferences }
                                if (updated[method.id as keyof typeof preferences]) {
                                  updated[method.id as keyof typeof preferences][category.id as keyof typeof updated[typeof method.id]] = e.target.checked
                                  updatePreferences(updated)
                                }
                              }}
                              disabled={method.id === 'in_app'}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-tea-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tea-600 peer-disabled:opacity-50"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowPreferences(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="px-4 py-2 bg-tea-600 text-white rounded-lg hover:bg-tea-700"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}