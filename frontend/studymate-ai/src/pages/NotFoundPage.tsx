import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <p className="font-mono text-8xl font-bold text-primary/20 mb-4">404</p>
        <h1 className="font-display text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-8">This page seems to have gone studying without you.</p>
        <Link to="/dashboard">
          <Button>← Back to Dashboard</Button>
        </Link>
      </motion.div>
    </div>
  )
}
