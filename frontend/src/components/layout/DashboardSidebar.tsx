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
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface DashboardSidebarProps {
  user: any
}

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { logout } = useAuth()
  const router = useRouter()

  const farmerNavItems = [
    { icon: <Home size={20} />, label: 'Overview', href: '/dashboard' },
    { icon: <Package size={20} />, label: 'Collections', href: '/dashboard/collections' },
    { icon: <DollarSign size={20} />, label: 'Payments', href: '/dashboard/payments' },
    { icon: <BarChart3 size={20} />, label: 'Predictions', href: '/dashboard/predictions' },
    { icon: <User size={20} />, label: 'Profile', href: '/dashboard/profile' },
  ]

  const collectorNavItems = [
    { icon: <Home size={20} />, label: 'Overview', href: '/dashboard' },
    { icon: <Truck size={20} />, label: 'Record Collection', href: '/dashboard/record-collection' },
    { icon: <Package size={20} />, label: 'My Collections', href: '/dashboard/collections' },
    { icon: <Users size={20} />, label: 'Farmers', href: '/dashboard/farmers' },
    { icon: <FileText size={20} />, label: 'Daily Reports', href: '/dashboard/reports' },
    { icon: <User size={20} />, label: 'Profile', href: '/dashboard/profile' },
  ]

  const adminNavItems = [
    { icon: <Home size={20} />, label: 'Overview', href: '/dashboard' },
    { icon: <Users size={20} />, label: 'Farmers', href: '/dashboard/farmers' },
    { icon: <Truck size={20} />, label: 'Collectors', href: '/dashboard/collectors' },
    { icon: <Package size={20} />, label: 'Collections', href: '/dashboard/collections' },
    { icon: <DollarSign size={20} />, label: 'Payments', href: '/dashboard/payments' },
    { icon: <BarChart3 size={20} />, label: 'Predictions', href: '/dashboard/predictions' },
    { icon: <FileText size={20} />, label: 'Reports', href: '/dashboard/reports' },
    { icon: <Settings size={20} />, label: 'Settings', href: '/dashboard/settings' },
  ]

  const getNavItems = () => {
    // Safety check: if user or role is missing, return empty array to prevent crashes
    if (!user || !user.role) return []

    switch (user.role) {
      case 'farmer':
        return farmerNavItems
      case 'collector':
        return collectorNavItems
      case 'admin':
      case 'factory_manager':
        return adminNavItems
      default:
        return []
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
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
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-tea-600">ChaiYetu</h1>
            <p className="text-sm text-gray-600 mt-1">Tea Management System</p>
          </div>

          {/* User info */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-tea-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-tea-600" />
              </div>
              <div>
                <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                {/* 👇 FIX APPLIED HERE: Added check for user.role before replacing */}
                <p className="text-sm text-gray-500 capitalize">
                  {user?.role ? user.role.replace('_', ' ') : 'User'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {getNavItems().map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-tea-50 text-gray-700 hover:text-tea-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
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