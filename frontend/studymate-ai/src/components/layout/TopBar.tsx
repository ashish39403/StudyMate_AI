import { useState, useEffect } from 'react'
import { Search, Bell, Command } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { Badge } from '@/components/ui/primitives'
import { CommandPalette } from '@/components/dashboard/CommandPalette'

export function TopBar() {
  const { user } = useAuthStore()
  const [cmdOpen, setCmdOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <>
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur px-6 flex items-center gap-4 shrink-0">
        {/* Greeting */}
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-semibold text-base truncate">
            {greeting}, <span className="text-primary">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Search trigger */}
        <button
          onClick={() => setCmdOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border text-muted-foreground text-sm hover:text-foreground transition-colors w-48"
        >
          <Search className="w-4 h-4 shrink-0" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="flex items-center gap-0.5 text-xs bg-background px-1.5 py-0.5 rounded border border-border">
            <Command className="w-3 h-3" />K
          </kbd>
        </button>

        {/* Streak badge */}
        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
          <span className="text-base">🔥</span>
          <span className="text-sm font-display font-bold text-amber-400">{user?.streak}</span>
          <span className="text-xs text-amber-400/70 hidden sm:block">day streak</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
              >
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-display font-semibold text-sm">Notifications</h3>
                  <Badge variant="default">3 new</Badge>
                </div>
                <div className="divide-y divide-border">
                  {[
                    { icon: '⚠️', text: 'Thermodynamics exam in 3 days!', time: '2h ago' },
                    { icon: '🎯', text: 'Daily quiz ready for DSA', time: '5h ago' },
                    { icon: '🔥', text: 'Keep it up! 7 day streak!', time: '1d ago' },
                  ].map((n, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 hover:bg-secondary/50 transition-colors cursor-pointer">
                      <span className="text-lg">{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{n.text}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Plan badge */}
        {user?.plan === 'pro' && (
          <Badge variant="emerald" className="hidden sm:flex">PRO</Badge>
        )}
      </header>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  )
}
