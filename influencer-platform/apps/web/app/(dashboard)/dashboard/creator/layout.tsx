import { 
  Home, 
  Search, 
  MessageSquare, 
  DollarSign, 
  User, 
  BarChart3,
  Settings,
  HelpCircle
} from 'lucide-react'
import { DashboardNav } from '@/app/components/dashboard/nav'
import { requireRole } from '@/app/lib/auth/utils'

const creatorNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard/creator',
    icon: Home,
  },
  {
    title: 'Browse Campaigns',
    href: '/dashboard/creator/campaigns',
    icon: Search,
  },
  {
    title: 'My Applications',
    href: '/dashboard/creator/applications',
    icon: MessageSquare,
  },
  {
    title: 'Messages',
    href: '/dashboard/messages',
    icon: MessageSquare,
  },
  {
    title: 'Earnings',
    href: '/dashboard/creator/earnings',
    icon: DollarSign,
  },
  {
    title: 'Analytics',
    href: '/dashboard/creator/analytics',
    icon: BarChart3,
  },
  {
    title: 'Profile',
    href: '/dashboard/creator/profile',
    icon: User,
  },
  {
    title: 'Settings',
    href: '/dashboard/creator/settings',
    icon: Settings,
  },
]

export default async function CreatorDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole(['influencer'])
  
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav items={creatorNavItems} />
      <main className="lg:pl-72">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}