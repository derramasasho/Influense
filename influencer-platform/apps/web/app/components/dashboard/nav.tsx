'use client'

import { Button , Avatar, AvatarFallback, AvatarImage , Badge } from '@influencer-platform/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  LogOut, 
  Moon, 
  Sun,
  Sparkles,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { createClient } from '@/app/lib/supabase/client'

interface NavItem {
  title: string
  href: string
  icon: any
}

interface DashboardNavProps {
  items: NavItem[]
}

export function DashboardNav({ items }: DashboardNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Failed to sign out')
    } else {
      router.push('/login')
    }
  }

  // Mock user data - replace with actual user data
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    role: pathname.includes('creator') ? 'Creator' : 'Brand',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        className="fixed top-4 left-4 z-50 lg:hidden"
        size="icon"
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              initial={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              initial={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{
          x: isOpen ? 0 : '-100%',
        }}
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border/50 lg:translate-x-0 ${
          !isOpen && 'lg:translate-x-0'
        }`}
        initial={false}
        transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 30 
        }}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b border-border/50">
            <Link className="flex items-center space-x-2 group" href="/dashboard">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                InfluencerBG
              </span>
            </Link>
          </div>

          {/* User profile */}
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                <AvatarImage alt={user.name} src={user.avatar} />
                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <Badge className="mt-1" variant="gradient">
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {items.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard/creator' && item.href !== '/dashboard/brand' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  className="group relative"
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                >
                  <motion.div
                    className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className={`h-5 w-5 mr-3 ${
                      isActive ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'
                    }`} />
                    {item.title}
                    {isActive && (
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    )}
                  </motion.div>
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-primary rounded-xl -z-10"
                      initial={false}
                      layoutId="activeNav"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30
                      }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Bottom section */}
          <div className="p-6 space-y-4 border-t border-border/50">
            {/* Theme toggle */}
            {mounted && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Theme</span>
                <Button
                  className="h-9 w-9 p-0"
                  size="sm"
                  variant="ghost"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  <AnimatePresence mode="wait">
                    {theme === 'dark' ? (
                      <motion.div
                        key="sun"
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        initial={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Sun className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="moon"
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        initial={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Moon className="h-4 w-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
            )}

            {/* Logout button */}
            <Button
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              variant="ghost"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </motion.aside>
    </>
  )
}