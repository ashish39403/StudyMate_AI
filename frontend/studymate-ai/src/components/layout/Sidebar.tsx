import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, Layers, FileQuestion,
  TrendingUp, Settings, LogOut, Zap, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', exact: true },
  { to: '/dashboard/courses', icon: BookOpen, label: 'My Courses' },
  { to: '/flashcards', icon: Layers, label: 'Flashcards' },
  { to: '/dashboard/quizzes', icon: FileQuestion, label: 'Quizzes' },
  { to: '/dashboard/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
    toast.success('Logged out successfully')
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'AS'

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-screen bg-card border-r border-border shrink-0 overflow-hidden z-10"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary glow-indigo shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-display font-bold text-lg tracking-tight whitespace-nowrap"
          >
            StudyMate <span className="text-primary">AI</span>
          </motion.span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary/10 rounded-lg"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={cn('w-5 h-5 shrink-0 relative z-10', isActive ? 'text-primary' : '')} />
                {!collapsed && (
                  <span className="relative z-10 whitespace-nowrap">{item.label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-border space-y-2 shrink-0">
        {/* Pro upgrade banner */}
        {!collapsed && user?.plan === 'free' && (
          <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 mb-2">
            <p className="text-xs font-display font-semibold text-primary mb-1">Free Plan</p>
            <p className="text-xs text-muted-foreground mb-2">{user.creditsUsed}/{user.creditsTotal} credits</p>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(user.creditsUsed / user.creditsTotal) * 100}%` }}
              />
            </div>
            <NavLink to="/settings?tab=subscription">
              <button className="mt-2 w-full text-xs font-medium text-primary hover:underline">
                Upgrade to Pro →
              </button>
            </NavLink>
          </div>
        )}

        {/* User avatar */}
        <div className={cn('flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer', collapsed && 'justify-center')}>
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-xs bg-primary/20 text-primary">{initials}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.college}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive transition-colors p-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all z-20"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  )
}
