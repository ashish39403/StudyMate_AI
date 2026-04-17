import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, BookOpen, Layers, FileQuestion, Settings, ArrowRight, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const commands = [
  { icon: BookOpen, label: 'Go to My Courses', shortcut: '', path: '/dashboard/courses', category: 'Navigation' },
  { icon: Layers, label: 'Go to Flashcards', shortcut: '', path: '/flashcards', category: 'Navigation' },
  { icon: FileQuestion, label: 'Start a Quiz', shortcut: '', path: '/dashboard/quizzes', category: 'Navigation' },
  { icon: Settings, label: 'Open Settings', shortcut: '', path: '/settings', category: 'Navigation' },
  { icon: Zap, label: 'Generate Flashcards', shortcut: '', path: '/flashcards', category: 'Actions' },
  { icon: Zap, label: 'Upload PDF', shortcut: '', path: '/dashboard', category: 'Actions' },
]

interface Props { open: boolean; onClose: () => void }

export function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase())
  )

  const grouped = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = []
    acc[cmd.category].push(cmd)
    return acc
  }, {} as Record<string, typeof commands>)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search commands..."
                className="flex-1 bg-transparent text-sm font-body outline-none placeholder:text-muted-foreground"
              />
              <kbd className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded border border-border">ESC</kbd>
            </div>

            {/* Results */}
            <div className="p-2 max-h-80 overflow-y-auto">
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category} className="mb-2">
                  <p className="text-xs font-medium text-muted-foreground px-3 py-1.5 uppercase tracking-wider">{category}</p>
                  {items.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => { navigate(item.path); onClose() }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary text-left transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="flex-1 text-sm">{item.label}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No results found</p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
