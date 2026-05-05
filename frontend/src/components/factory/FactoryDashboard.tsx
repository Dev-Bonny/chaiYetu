'use client'

import { useState, useEffect } from 'react'
import {
  Users, Truck, Package, DollarSign, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle2, XCircle, Clock, Factory,
  ShieldAlert, BarChart3, RefreshCw
} from 'lucide-react'
import { factoryService } from '@/lib/factory-service'
import { formatCurrency, formatWeight, formatDate } from '@/lib/utils'
import StatCard from '@/components/ui/StatCard'
import FactoryProductionChart from '@/components/factory/FactoryProductionChart'
import FraudAlertWidget from '@/components/factory/FraudAlertWidget'
import Link from 'next/link'

export default function FactoryDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [trend, setTrend] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefreshed, setLastRefreshed] = useState(new Date())

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [statsRes, trendRes] = await Promise.all([
        factoryService.getDashboardStats(),
        factoryService.getProductionTrend(30),
      ])
      setStats(statsRes.data)
      setTrend(trendRes.data || [])
      setLastRefreshed(new Date())
    } catch (err) {
      console.error('Factory dashboard fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tea-500" />
      </div>
    )
  }

  const today  = stats?.today  || {}
  const week   = stats?.week   || {}
  const month  = stats?.month  || {}
  const growth = stats?.growth || {}

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-r from-tea-600 to-tea-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Factory size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Factory Manager Portal</h1>
              <p className="text-tea-100 mt-1">Real-time overview of factory operations</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs opacity-75">Last refreshed</p>
              <p className="text-sm font-medium">{lastRefreshed.toLocaleTimeString()}</p>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm transition-colors"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Today's KPIs */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Today's Performance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Collections"
            value={today.totalCollections ?? 0}
            icon={<Package className="text-tea-600" />}
            change={`${formatWeight(today.totalWeight ?? 0)} received`}
          />
          <StatCard
            title="Today's Revenue"
            value={formatCurrency(today.totalRevenue ?? 0)}
            icon={<DollarSign className="text-green-600" />}
            change={`Avg ${formatWeight(today.avgWeightPerCollection ?? 0)}/collection`}
          />
          <StatCard
            title="Pending Audit"
            value={stats?.pendingAudit ?? 0}
            icon={<Clock className="text-orange-500" />}
            change={
              (stats?.pendingAudit ?? 0) > 0
                ? <span className="text-orange-600">Requires review</span>
                : <span className="text-green-600">All clear</span>
            }
          />
          <StatCard
            title="Fraud Alerts"
            value={stats?.fraudCount ?? 0}
            icon={<ShieldAlert className="text-red-500" />}
            change={
              (stats?.fraudCount ?? 0) > 0
                ? <span className="text-red-600">Needs attention</span>
                : <span className="text-green-600">No anomalies</span>
            }
          />
        </div>
      </div>

      {/* Monthly KPIs */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">This Month</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Monthly Weight"
            value={formatWeight(month.totalWeight ?? 0)}
            icon={<BarChart3 className="text-blue-600" />}
            change={
              Number(growth.weight) >= 0
                ? <span className="text-green-600 flex items-center gap-1"><TrendingUp size={14} />+{growth.weight}% vs last month</span>
                : <span className="text-red-600 flex items-center gap-1"><TrendingDown size={14} />{growth.weight}% vs last month</span>
            }
          />
          <StatCard
            title="Monthly Revenue"
            value={formatCurrency(month.totalRevenue ?? 0)}
            icon={<DollarSign className="text-green-600" />}
            change={
              Number(growth.revenue) >= 0
                ? <span className="text-green-600 flex items-center gap-1"><TrendingUp size={14} />+{growth.revenue}% vs last month</span>
                : <span className="text-red-600 flex items-center gap-1"><TrendingDown size={14} />{growth.revenue}% vs last month</span>
            }
          />
          <StatCard
            title="Active Farmers"
            value={stats?.activeFarmers ?? 0}
            icon={<Users className="text-purple-600" />}
            change={`${stats?.totalFarmers ?? 0} total registered`}
          />
          <StatCard
            title="Active Collectors"
            value={stats?.activeCollectors ?? 0}
            icon={<Truck className="text-indigo-600" />}
            change={`${stats?.totalCollectors ?? 0} total registered`}
          />
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Production chart — 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Production Trend (30 Days)</h2>
              <Link
                href="/dashboard/factory/analytics"
                className="text-sm text-tea-600 hover:text-tea-700 font-medium"
              >
                Full Analytics →
              </Link>
            </div>
            <FactoryProductionChart data={trend} />
          </div>

          {/* Grade & status breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-semibold text-gray-700 mb-4">Grade Breakdown (Month)</h3>
              <div className="space-y-3">
                {[
                  { label: 'Grade 1 (Premium)', key: 'grade1', color: 'bg-green-500',  textColor: 'text-green-700'  },
                  { label: 'Grade 2 (Standard)', key: 'grade2', color: 'bg-blue-500',   textColor: 'text-blue-700'   },
                  { label: 'Grade 3 (Basic)',    key: 'grade3', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
                ].map(({ label, key, color, textColor }) => {
                  const val   = month.gradeBreakdown?.[key] ?? 0
                  const total = month.totalWeight ?? 1
                  const pct   = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0'
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{label}</span>
                        <span className={`font-medium ${textColor}`}>{pct}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{formatWeight(val)}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-700 mb-4">Collection Status (Month)</h3>
              <div className="space-y-3">
                {[
                  { label: 'Verified', key: 'verified', icon: <CheckCircle2 size={16} className="text-green-500" /> },
                  { label: 'Pending',  key: 'pending',  icon: <Clock        size={16} className="text-orange-500" /> },
                  { label: 'Paid',     key: 'paid',     icon: <DollarSign   size={16} className="text-blue-500" /> },
                  { label: 'Rejected', key: 'rejected', icon: <XCircle      size={16} className="text-red-500" /> },
                ].map(({ label, key, icon }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {icon}
                      <span className="text-sm text-gray-600">{label}</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {month.statusBreakdown?.[key] ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Quick actions */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'Audit Pending Deliveries', href: '/dashboard/factory/audit',      icon: <CheckCircle2 size={18} className="text-green-600" />, badge: stats?.pendingAudit },
                { label: 'View Fraud Alerts',        href: '/dashboard/factory/fraud',       icon: <ShieldAlert   size={18} className="text-red-600"   />, badge: stats?.fraudCount  },
                { label: 'Collector Performance',    href: '/dashboard/factory/collectors',  icon: <Truck         size={18} className="text-blue-600"   /> },
                { label: 'Revenue Forecasting',      href: '/dashboard/factory/forecasting', icon: <TrendingUp    size={18} className="text-purple-600" /> },
                { label: 'Export Reports',           href: '/dashboard/factory/reports',     icon: <BarChart3     size={18} className="text-gray-600"   /> },
              ].map(({ label, href, icon, badge }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-tea-50 text-gray-700 hover:text-tea-700 transition-colors border border-transparent hover:border-tea-200"
                >
                  <div className="flex items-center gap-3">
                    {icon}
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  {badge !== undefined && badge > 0 && (
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      {badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Recent fraud alerts */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle size={18} className="text-orange-500" />
                Recent Alerts
              </h2>
              <Link href="/dashboard/factory/fraud" className="text-sm text-tea-600 hover:text-tea-700">
                View all →
              </Link>
            </div>
            <FraudAlertWidget flags={stats?.recentFraudFlags ?? []} compact />
          </div>

          {/* Weekly summary */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">This Week</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Collections</span>
                <span className="font-bold">{week.totalCollections ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Weight</span>
                <span className="font-bold">{formatWeight(week.totalWeight ?? 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Revenue</span>
                <span className="font-bold text-green-600">{formatCurrency(week.totalRevenue ?? 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Weight</span>
                <span className="font-bold">{formatWeight(week.avgWeightPerCollection ?? 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}