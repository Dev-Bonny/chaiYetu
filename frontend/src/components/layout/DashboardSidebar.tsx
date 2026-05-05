'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import {
  Home,
  Package,
  DollarSign,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Truck,
  User,
  FileText,
  Leaf,
  Factory,
  ShieldAlert,
  TrendingUp,
  ClipboardCheck,
  UserCheck
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface DashboardSidebarProps {
  user: any
}

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { logout } = useAuth()
  const router   = useRouter()
  const pathname = usePathname()

  const farmerNavItems = [
    { icon: <Home size={20} />,       label: 'Overview',    href: '/dashboard' },
    { icon: <Package size={20} />,    label: 'Collections', href: '/dashboard/collections' },
    { icon: <DollarSign size={20} />, label: 'Payments',    href: '/dashboard/payments' },
    { icon: <BarChart3 size={20} />,  label: 'Predictions', href: '/dashboard/predictions' },
    { icon: <User size={20} />,       label: 'Profile',     href: '/dashboard/profile' },
  ]

  const collectorNavItems = [
    { icon: <Home size={20} />,      label: 'Overview',          href: '/dashboard' },
    { icon: <Truck size={20} />,     label: 'Record Collection', href: '/dashboard/record-collection' },
    { icon: <Package size={20} />,   label: 'My Collections',    href: '/dashboard/collections' },
    { icon: <Users size={20} />,     label: 'Farmers',           href: '/dashboard/farmers' },
    { icon: <FileText size={20} />,  label: 'Daily Reports',     href: '/dashboard/reports' },
    { icon: <User size={20} />,      label: 'Profile',           href: '/dashboard/profile' },
  ]

  const adminNavItems = [
    { icon: <Home size={20} />,       label: 'Overview',    href: '/dashboard' },
    { icon: <Users size={20} />,      label: 'Farmers',     href: '/dashboard/farmers' },
    { icon: <Truck size={20} />,      label: 'Collectors',  href: '/dashboard/collectors' },
    { icon: <Package size={20} />,    label: 'Collections', href: '/dashboard/collections' },
    { icon: <DollarSign size={20} />, label: 'Payments',    href: '/dashboard/payments' },
    { icon: <BarChart3 size={20} />,  label: 'Predictions', href: '/dashboard/predictions' },
    { icon: <FileText size={20} />,   label: 'Reports',     href: '/dashboard/reports' },
    { icon: <Settings size={20} />,   label: 'Settings',    href: '/dashboard/settings' },
  ]

  // ── Factory Manager Navigation ──────────────────────────────────────────────
  const factoryNavSections = [
    {
      label: 'Overview',
      items: [
        { icon: <Home size={20} />, label: 'Dashboard', href: '/dashboard' },
      ],
    },
    {
      label: 'Operations',
      items: [
        { icon: <ClipboardCheck size={20} />, label: 'Audit Collections', href: '/dashboard/factory/audit' },
      ],
    },
    {
      label: 'Analytics',
      items: [
        { icon: <BarChart3 size={20} />, label: 'Production Analytics',  href: '/dashboard/factory/analytics'  },
        { icon: <UserCheck size={20} />, label: 'Collector Performance', href: '/dashboard/factory/collectors' },
        { icon: <Users size={20} />,     label: 'Active Farmers',        href: '/dashboard/factory/farmers'    },
      ],
    },
    {
      label: 'Intelligence',
      items: [
        { icon: <ShieldAlert size={20} />, label: 'Fraud Detection', href: '/dashboard/factory/fraud'       },
        { icon: <TrendingUp size={20} />,  label: 'Forecasting',     href: '/dashboard/factory/forecasting' },
      ],
    },
    {
      label: 'Reporting',
      items: [
        { icon: <FileText size={20} />, label: 'Reports & Export', href: '/dashboard/factory/reports' },
      ],
    },
  ]

  const getNavContent = () => {
    if (!user || !user.role) return null

    if (user.role === 'factory_manager') {
      return (
        <div className="space-y-5">
          {factoryNavSections.map((section) => (
            <div key={section.label}>
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active =
                    item.href === '/dashboard'
                      ? pathname === '/dashboard'
                      : pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                        active
                          ? 'bg-tea-600 text-white shadow-sm'
                          : 'text-gray-700 hover:bg-tea-50 hover:text-tea-700'
                      }`}
                    >
                      {item.icon}
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )
    }

    const items =
      user.role === 'farmer'    ? farmerNavItems    :
      user.role === 'collector' ? collectorNavItems :
      adminNavItems

    return (
      <div className="space-y-0.5">
        {items.map((item) => {
          const active =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                active
                  ? 'bg-tea-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-tea-50 hover:text-tea-600'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const roleLabel: Record<string, string> = {
    farmer:          'Farmer',
    collector:       'Collector',
    factory_manager: 'Factory Manager',
    admin:           'Administrator',
  }

  const roleColor: Record<string, string> = {
    farmer:          'bg-green-100  text-green-700',
    collector:       'bg-blue-100   text-blue-700',
    factory_manager: 'bg-purple-100 text-purple-700',
    admin:           'bg-red-100    text-red-700',
  }

  // ── Logo: Leaf icon for farmer/collector/admin | Factory icon for factory_manager
  const renderLogo = () => {
    if (user?.role === 'factory_manager') {
      return (
        <div className="p-6 border-b bg-gradient-to-br from-tea-600 to-tea-700">
          <div className="flex items-center gap-2">
            <Factory size={22} className="text-white" />
            <h1 className="text-2xl font-bold text-white">ChaiYetu</h1>
          </div>
          <p className="text-sm text-tea-200 mt-1">Tea Management System</p>
        </div>
      )
    }

    // Leaf icon for farmer, collector, admin
    return (
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <Leaf size={22} className="text-tea-600" />
          <h1 className="text-2xl font-bold text-tea-600">ChaiYetu</h1>
        </div>
        <p className="text-sm text-gray-600 mt-1">Tea Management System</p>
      </div>
    )
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-tea-600 text-white rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">

          {/* Logo */}
          {renderLogo()}

          {/* User info */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-tea-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-tea-600" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[user?.role] || 'bg-gray-100 text-gray-600'}`}>
                  {roleLabel[user?.role] || (user?.role ? user.role.replace('_', ' ') : 'User')}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            {getNavContent()}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors w-full"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>

        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}