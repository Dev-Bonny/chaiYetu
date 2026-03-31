// frontend/src/components/admin/SystemHealth.tsx
'use client'

import React, { useState, useEffect } from 'react'
import {
  Server,
  Database,
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { cn, formatDate, formatFileSize } from '@/lib/utils'

interface HealthMetric {
  name: string
  value: number
  unit: string
  threshold: {
    warning: number
    critical: number
  }
  trend: 'up' | 'down' | 'stable'
}

interface SystemService {
  name: string
  status: 'healthy' | 'degraded' | 'down'
  responseTime: number
  uptime: number
  lastCheck: string
}

interface SystemHealthData {
  overallStatus: 'healthy' | 'degraded' | 'critical'
  lastUpdated: string
  services: SystemService[]
  metrics: HealthMetric[]
  alerts: Array<{
    id: string
    severity: 'info' | 'warning' | 'critical'
    message: string
    timestamp: string
    service: string
  }>
  uptime: {
    days: number
    hours: number
    minutes: number
  }
  performance: {
    requestsPerMinute: number
    averageResponseTime: number
    errorRate: number
  }
}

export default function SystemHealth() {
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchHealthData = async () => {
    if (refreshing) return
    
    setRefreshing(true)
    setError(null)
    
    try {
      // In production, this would call your backend API
      // const data = await apiClient.get('/api/v1/admin/health')
      
      // Mock data for development
      const mockData: SystemHealthData = {
        overallStatus: 'healthy',
        lastUpdated: new Date().toISOString(),
        uptime: {
          days: 45,
          hours: 12,
          minutes: 30
        },
        performance: {
          requestsPerMinute: 1250,
          averageResponseTime: 245,
          errorRate: 0.2
        },
        services: [
          {
            name: 'API Server',
            status: 'healthy',
            responseTime: 120,
            uptime: 99.99,
            lastCheck: new Date().toISOString()
          },
          {
            name: 'Database',
            status: 'healthy',
            responseTime: 45,
            uptime: 99.95,
            lastCheck: new Date().toISOString()
          },
          {
            name: 'Redis Cache',
            status: 'healthy',
            responseTime: 12,
            uptime: 99.98,
            lastCheck: new Date().toISOString()
          },
          {
            name: 'ML Service',
            status: 'degraded',
            responseTime: 450,
            uptime: 98.5,
            lastCheck: new Date().toISOString()
          },
          {
            name: 'File Storage',
            status: 'healthy',
            responseTime: 85,
            uptime: 99.9,
            lastCheck: new Date().toISOString()
          },
          {
            name: 'SMS Gateway',
            status: 'down',
            responseTime: 0,
            uptime: 92.3,
            lastCheck: new Date().toISOString()
          }
        ],
        metrics: [
          {
            name: 'CPU Usage',
            value: 65,
            unit: '%',
            threshold: { warning: 80, critical: 90 },
            trend: 'up'
          },
          {
            name: 'Memory Usage',
            value: 78,
            unit: '%',
            threshold: { warning: 85, critical: 95 },
            trend: 'up'
          },
          {
            name: 'Disk Usage',
            value: 45,
            unit: '%',
            threshold: { warning: 80, critical: 90 },
            trend: 'stable'
          },
          {
            name: 'Network Traffic',
            value: 2.5,
            unit: 'Gbps',
            threshold: { warning: 8, critical: 10 },
            trend: 'down'
          },
          {
            name: 'Database Connections',
            value: 42,
            unit: '',
            threshold: { warning: 100, critical: 150 },
            trend: 'stable'
          },
          {
            name: 'Active Sessions',
            value: 235,
            unit: '',
            threshold: { warning: 500, critical: 1000 },
            trend: 'up'
          }
        ],
        alerts: [
          {
            id: '1',
            severity: 'critical',
            message: 'ML Service response time degraded',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            service: 'ML Service'
          },
          {
            id: '2',
            severity: 'warning',
            message: 'SMS Gateway connection failed',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            service: 'SMS Gateway'
          },
          {
            id: '3',
            severity: 'info',
            message: 'Database backup completed successfully',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            service: 'Database'
          }
        ]
      }
      
      setHealthData(mockData)
      setIsLoading(false)
    } catch (err) {
      console.error('Failed to fetch system health:', err)
      setError('Failed to load system health data')
      setIsLoading(false)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchHealthData()
    
    let intervalId: NodeJS.Timeout
    if (autoRefresh) {
      intervalId = setInterval(fetchHealthData, 30000) // Refresh every 30 seconds
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [autoRefresh])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="text-green-500" size={20} />
      case 'degraded':
        return <AlertTriangle className="text-yellow-500" size={20} />
      case 'down':
        return <XCircle className="text-red-500" size={20} />
      default:
        return <AlertCircle className="text-gray-500" size={20} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'down':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="text-red-500" size={16} />
      case 'down':
        return <TrendingDown className="text-green-500" size={16} />
      case 'stable':
        return <Activity className="text-gray-500" size={16} />
    }
  }

  const getMetricColor = (value: number, threshold: { warning: number; critical: number }) => {
    if (value >= threshold.critical) return 'text-red-600'
    if (value >= threshold.warning) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getMetricBarColor = (value: number, threshold: { warning: number; critical: number }) => {
    if (value >= threshold.critical) return 'bg-red-500'
    if (value >= threshold.warning) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const handleRefresh = () => {
    fetchHealthData()
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">System Health</h2>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-tea-500" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-2 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card border-red-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">System Health</h2>
          <AlertCircle className="text-red-500" size={20} />
        </div>
        <div className="text-center py-8">
          <XCircle className="mx-auto h-12 w-12 text-red-400 mb-3" />
          <p className="text-red-600 font-medium mb-2">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-tea-600 text-white rounded-lg hover:bg-tea-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!healthData) return null

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Server className="text-tea-600" size={24} />
          <div>
            <h2 className="text-xl font-semibold">System Health</h2>
            <p className="text-sm text-gray-600">
              Last updated: {formatDate(healthData.lastUpdated, { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={cn(
              'p-2 rounded-lg transition-colors',
              refreshing ? 'text-gray-400' : 'text-gray-600 hover:bg-gray-100'
            )}
            title="Refresh"
          >
            <RefreshCw className={cn('size-5', refreshing && 'animate-spin')} />
          </button>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-tea-600 rounded focus:ring-tea-500"
            />
            <span className="text-sm text-gray-600">Auto-refresh</span>
          </label>
        </div>
      </div>

      {/* Overall Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Overall Status</h3>
          <span className={cn(
            'px-3 py-1 rounded-full text-sm font-medium capitalize',
            getStatusColor(healthData.overallStatus)
          )}>
            {healthData.overallStatus}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Activity className="text-blue-600" size={20} />
              <span className="font-medium">Uptime</span>
            </div>
            <p className="text-2xl font-bold">
              {healthData.uptime.days}d {healthData.uptime.hours}h
            </p>
            <p className="text-sm text-gray-600">
              {(healthData.services.reduce((acc, s) => acc + s.uptime, 0) / healthData.services.length).toFixed(2)}% average
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Cpu className="text-green-600" size={20} />
              <span className="font-medium">Requests/Min</span>
            </div>
            <p className="text-2xl font-bold">
              {healthData.performance.requestsPerMinute.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              {healthData.performance.averageResponseTime}ms avg response
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <AlertCircle className="text-orange-600" size={20} />
              <span className="font-medium">Error Rate</span>
            </div>
            <p className="text-2xl font-bold">
              {healthData.performance.errorRate}%
            </p>
            <p className="text-sm text-gray-600">
              {healthData.alerts.filter(a => a.severity === 'critical').length} critical alerts
            </p>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="mb-6">
        <h3 className="font-semibold mb-4">Services Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {healthData.services.map((service) => (
            <div
              key={service.name}
              className="p-3 border rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(service.status)}
                  <span className="font-medium">{service.name}</span>
                </div>
                <span className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium',
                  getStatusColor(service.status)
                )}>
                  {service.status}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Time:</span>
                  <span className="font-medium">{service.responseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uptime:</span>
                  <span className="font-medium">{service.uptime.toFixed(2)}%</span>
                </div>
                <div className="text-xs text-gray-500">
                  Last check: {formatDate(service.lastCheck, { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="mb-6">
        <h3 className="font-semibold mb-4">System Metrics</h3>
        <div className="space-y-4">
          {healthData.metrics.map((metric) => (
            <div key={metric.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="font-medium">{metric.name}</span>
                  {getTrendIcon(metric.trend)}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    'text-lg font-bold',
                    getMetricColor(metric.value, metric.threshold)
                  )}>
                    {metric.value}{metric.unit}
                  </span>
                  <span className="text-sm text-gray-500">
                    / {metric.threshold.critical}{metric.unit}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    getMetricBarColor(metric.value, metric.threshold)
                  )}
                  style={{
                    width: `${Math.min((metric.value / metric.threshold.critical) * 100, 100)}%`
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>0{metric.unit}</span>
                <span className={metric.value >= metric.threshold.warning ? 'text-yellow-600' : ''}>
                  Warning: {metric.threshold.warning}{metric.unit}
                </span>
                <span className={metric.value >= metric.threshold.critical ? 'text-red-600' : ''}>
                  Critical: {metric.threshold.critical}{metric.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Alerts</h3>
          <span className="text-sm text-gray-600">
            {healthData.alerts.length} total
          </span>
        </div>
        <div className="space-y-3">
          {healthData.alerts.length > 0 ? (
            healthData.alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'p-3 border rounded-lg flex items-start space-x-3',
                  getSeverityColor(alert.severity)
                )}
              >
                <div>
                  {alert.severity === 'critical' && <AlertCircle className="text-red-600" size={20} />}
                  {alert.severity === 'warning' && <AlertTriangle className="text-yellow-600" size={20} />}
                  {alert.severity === 'info' && <CheckCircle2 className="text-blue-600" size={20} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{alert.message}</p>
                    <span className="text-xs capitalize px-2 py-1 rounded-full bg-white bg-opacity-50">
                      {alert.severity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-700">{alert.service}</span>
                    <span className="text-xs text-gray-600">
                      {formatDate(alert.timestamp, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 border rounded-lg">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-400 mb-3" />
              <p className="text-gray-600">No active alerts</p>
              <p className="text-sm text-gray-500 mt-1">All systems are operating normally</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t">
        <button className="text-sm text-gray-600 hover:text-gray-900">
          View Detailed Report →
        </button>
        <div className="flex space-x-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            Mute Alerts
          </button>
          <button className="px-4 py-2 bg-tea-600 text-white rounded-lg hover:bg-tea-700 transition-colors">
            System Logs
          </button>
        </div>
      </div>
    </div>
  )
}