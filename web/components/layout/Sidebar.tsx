'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  ShoppingCart,
  FileText,
  RotateCcw,
  Wallet,
  BarChart2,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Dealers', href: '/dealers', icon: Users },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Inventory', href: '/inventory', icon: Layers },
  { label: 'POS Billing', href: '/pos', icon: ShoppingCart },
  { label: 'Purchase Bills', href: '/purchase-bills', icon: FileText },
  { label: 'Returns', href: '/returns', icon: RotateCcw },
  { label: 'Payments', href: '/payments', icon: Wallet },
  { label: 'Reports', href: '/reports', icon: BarChart2 },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-60 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-4">
        <span className="font-bold text-lg tracking-tight">AutoParts POS</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
