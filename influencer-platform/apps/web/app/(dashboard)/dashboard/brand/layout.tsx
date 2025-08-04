import { 
  Home, 
  PlusCircle, 
  FileText, 
  Users, 
  MessageSquare,
  BarChart3,
  Settings,
  CreditCard
} from 'lucide-react'
import { DashboardNav } from '@/app/components/dashboard/nav'
import { requireRole } from '@/app/lib/auth/utils'

const brandNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard/brand',
    icon: Home,
  },
  {
    title: 'Create Campaign',
    href: '/dashboard/brand/campaigns/new',
    icon: PlusCircle,
  },
  {
    title: 'My Campaigns',
    href: '/dashboard/brand/campaigns',
    icon: FileText,
  },
  {
    title: 'Find Creators',
    href: '/dashboard/brand/creators',
    icon: Users,
  },
  {
    title: 'Messages',
    href: '/dashboard/messages',
    icon: MessageSquare,
  },
  {
    title: 'Analytics',
    href: '/dashboard/brand/analytics',
    icon: BarChart3,
  },
  {
    title: 'Billing',
    href: '/dashboard/brand/billing',
    icon: CreditCard,
  },
  {
    title: 'Settings',
    href: '/dashboard/brand/settings',
    icon: Settings,
  },
]

export default async function BrandDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole(['brand'])
  
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav items={brandNavItems} />
      <main className="lg:pl-72">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}