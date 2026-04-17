import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Upload, Zap, Layers, MessageSquare, ArrowRight, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { courseService, activityService } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress, Skeleton, Badge } from '@/components/ui/primitives'
import { timeAgo } from '@/lib/utils'
import { ChatModal } from '@/components/chat/ChatModal'
import { useState } from 'react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } }
}

const quickActions = [
  { icon: Upload, label: 'Upload Notes', desc: 'Add a PDF or document', color: 'text-indigo-400', bg: 'bg-indigo-500/10', path: '/dashboard' },
  { icon: Zap, label: 'Generate Quiz', desc: 'Test your knowledge', color: 'text-amber-400', bg: 'bg-amber-500/10', path: '/dashboard/quizzes' },
  { icon: Layers, label: 'Create Flashcards', desc: 'AI-powered cards', color: 'text-emerald-400', bg: 'bg-emerald-500/10', path: '/flashcards' },
  { icon: MessageSquare, label: 'Ask Doubt', desc: 'Chat with AI', color: 'text-pink-400', bg: 'bg-pink-500/10', path: '#chat' },
]

const activityIcons: Record<string, string> = {
  quiz: '✍️', flashcard: '📝', summary: '📄', upload: '📤'
}

function ProgressRing({ value, size = 80, stroke = 8, color = '#6366f1' }: { value: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <svg width={size} height={size} className="progress-ring">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--secondary))" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
    </svg>
  )
}

export function DashboardOverview() {
  const { user } = useAuthStore()
  const [chatOpen, setChatOpen] = useState(false)

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: courseService.getCourses,
  })

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['activity'],
    queryFn: activityService.getActivity,
  })

  const avgProgress = courses ? Math.round(courses.reduce((a, c) => a + c.progress, 0) / courses.length) : 0

  return (
    <>
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6">

        {/* Stats row */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Streak', value: `${user?.streak} days`, icon: '🔥', color: 'text-amber-400', sub: 'Keep it up!' },
            { label: 'Avg Progress', value: `${avgProgress}%`, icon: '📊', color: 'text-indigo-400', sub: 'Across courses' },
            { label: 'Credits Left', value: `${(user?.creditsTotal ?? 0) - (user?.creditsUsed ?? 0)}`, icon: '⚡', color: 'text-emerald-400', sub: `of ${user?.creditsTotal} total` },
            { label: 'Courses', value: courses?.length ?? '—', icon: '📚', color: 'text-pink-400', sub: 'This semester' },
          ].map((stat) => (
            <Card key={stat.label} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{stat.icon}</span>
                  <Badge variant="secondary" className="text-xs">{stat.sub}</Badge>
                </div>
                <p className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Courses progress */}
          <motion.div variants={item} className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Course Progress</CardTitle>
                <Link to="/dashboard/courses">
                  <Button variant="ghost" size="sm" className="text-xs gap-1">
                    View all <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {coursesLoading ? (
                  Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                ) : (
                  courses?.map((course) => (
                    <Link key={course.id} to={`/course/${course.id}`}>
                      <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group">
                        <div className="relative shrink-0">
                          <ProgressRing value={course.progress} size={56} stroke={5} color={course.color} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold font-display">{course.progress}%</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{course.name}</p>
                          <p className="text-xs text-muted-foreground">{course.code} · {course.chapters.length} chapters</p>
                          <Progress value={course.progress} className="mt-2 h-1" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Weak topics + streak */}
          <motion.div variants={item} className="space-y-4">
            {/* Weak topics alert */}
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  Needs Revision
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {['Thermodynamics Ch.3', 'DSA: Graph Theory', 'Digital: K-Maps'].map((topic) => (
                  <div key={topic} className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-amber-500/10 transition-colors cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <span className="text-muted-foreground">{topic}</span>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-2 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                  Start Revision
                </Button>
              </CardContent>
            </Card>

            {/* Today's goal */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Today's Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: 'Review 10 flashcards', done: true },
                  { label: 'Complete Chapter 3', done: false },
                  { label: 'Take a quiz', done: false },
                ].map((goal) => (
                  <div key={goal.label} className="flex items-center gap-2 text-sm">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${goal.done ? 'bg-emerald-500 border-emerald-500' : 'border-border'}`}>
                      {goal.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className={goal.done ? 'line-through text-muted-foreground' : ''}>{goal.label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick actions */}
        <motion.div variants={item}>
          <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.path}
                onClick={action.path === '#chat' ? (e) => { e.preventDefault(); setChatOpen(true) } : undefined}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col gap-2 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group"
                >
                  <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center`}>
                    <action.icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent activity */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <Badge variant="secondary">{activity?.length} events</Badge>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : (
                <div className="space-y-1">
                  {activity?.map((act) => (
                    <div key={act.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 text-base">
                        {activityIcons[act.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{act.description}</p>
                        <p className="text-xs text-muted-foreground">{timeAgo(act.timestamp)}</p>
                      </div>
                      {act.score !== undefined && (
                        <Badge variant={act.score >= 75 ? 'emerald' : 'amber'} className="shrink-0">
                          {act.score}%
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Courses grid */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider">My Courses</h2>
            <Link to="/dashboard/courses">
              <Button variant="ghost" size="sm" className="text-xs">View all →</Button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coursesLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-36" />)
            ) : (
              courses?.map((course) => (
                <Link key={course.id} to={`/course/${course.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div
                      className="absolute top-0 left-0 w-full h-0.5 rounded-t-xl"
                      style={{ background: course.color }}
                    />
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${course.color}20` }}>
                        <BookOpen className="w-5 h-5" style={{ color: course.color }} />
                      </div>
                      <Badge variant="secondary">{course.code}</Badge>
                    </div>
                    <h3 className="font-display font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{course.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{course.chapters.length} chapters · Sem {course.semester}</p>
                    <div className="flex items-center gap-2">
                      <Progress value={course.progress} className="flex-1 h-1.5" />
                      <span className="text-xs font-medium" style={{ color: course.color }}>{course.progress}%</span>
                    </div>
                  </motion.div>
                </Link>
              ))
            )}
          </div>
        </motion.div>

      </motion.div>

      <ChatModal open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  )
}
