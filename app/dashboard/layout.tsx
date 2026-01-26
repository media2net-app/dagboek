'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Calendar, Dumbbell, Wallet, LogOut, ChevronLeft, ChevronRight, Menu, LayoutDashboard, User, StickyNote, FolderKanban, GitBranch } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Werk Planning', href: '/dashboard/werk', icon: Calendar },
  { name: 'Persoonlijke Planning', href: '/dashboard/persoonlijk', icon: User },
  { name: 'Fitness', href: '/dashboard/fitness', icon: Dumbbell },
  { name: 'Financieel', href: '/dashboard/financieel', icon: Wallet },
  { name: 'Projecten', href: '/dashboard/projecten', icon: FolderKanban },
  { name: 'Pipeline', href: '/dashboard/pipeline', icon: GitBranch },
  { name: 'Notities', href: '/dashboard/notities', icon: StickyNote },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    if (confirm('Weet je zeker dat je wilt uitloggen?')) {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-luxury-dark-bg flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-luxury-charcoal-dark transition-all duration-300 ease-in-out flex flex-col border-r border-luxury-dark-border`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-luxury-dark-border">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-xl font-semibold text-luxury-gold tracking-wider uppercase">
                HQ
              </h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-luxury-gold hover:text-luxury-gold-light transition-colors p-1"
            >
              {sidebarOpen ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <div className="text-xs uppercase tracking-wider text-luxury-dark-text-light px-4 py-2 mb-2">
            Modules
          </div>
          {navigation.map((item) => {
            // Check if active - exact match for dashboard, or starts with for sub-pages
            const isActive = item.href === '/dashboard' 
              ? pathname === '/dashboard' 
              : pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-luxury-charcoal-lighter text-luxury-gold border-l border-luxury-gold'
                    : 'text-luxury-dark-text-light hover:bg-luxury-charcoal hover:text-luxury-gold'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="font-medium text-sm">{item.name}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-luxury-dark-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-luxury-dark-text-light hover:bg-luxury-charcoal hover:text-luxury-gold transition-all duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium text-sm">Uitloggen</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-luxury-dark-bg">
        {children}
      </main>
    </div>
  )
}

