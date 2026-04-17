import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BookOpen, ArrowRight } from 'lucide-react'
import { courseService } from '@/services/api'
import { Card, CardContent } from '@/components/ui/card'
import { Progress, Skeleton, Badge } from '@/components/ui/primitives'

export function CoursesPage() {
  const { data: courses, isLoading } = useQuery({ queryKey: ['courses'], queryFn: courseService.getCourses })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">My Courses</h1>
        <p className="text-muted-foreground text-sm mt-1">All your enrolled courses this semester</p>
      </div>
      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-48" />)}</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {courses?.map((course, idx) => (
            <motion.div key={course.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}>
              <Link to={`/course/${course.id}`}>
                <Card className="hover:border-primary/30 transition-all hover:-translate-y-0.5 duration-200 cursor-pointer group">
                  <div className="h-1 rounded-t-xl" style={{ background: course.color }} />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${course.color}20` }}>
                        <BookOpen className="w-5 h-5" style={{ color: course.color }} />
                      </div>
                      <Badge variant="secondary">{course.code}</Badge>
                    </div>
                    <h3 className="font-display font-semibold mb-1 group-hover:text-primary transition-colors">{course.name}</h3>
                    <p className="text-xs text-muted-foreground mb-4">{course.chapters.length} chapters · {course.chapters.filter(c => c.completed).length} completed</p>
                    <div className="flex items-center gap-2">
                      <Progress value={course.progress} className="flex-1 h-2" />
                      <span className="text-sm font-bold" style={{ color: course.color }}>{course.progress}%</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-muted-foreground">Semester {course.semester}</p>
                      <span className="text-xs text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                        View <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export function QuizzesPage() {
  const quizHistory = [
    { topic: 'Thermodynamics - Ch.1', score: 8, total: 10, date: '2 hours ago', course: 'ME301' },
    { topic: 'Digital Electronics', score: 7, total: 10, date: '3 days ago', course: 'EC302' },
    { topic: 'DSA - Arrays', score: 9, total: 10, date: '5 days ago', course: 'CS201' },
  ]
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Quizzes</h1>
          <p className="text-muted-foreground text-sm mt-1">Test your knowledge with AI-generated MCQs</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {[{ label: 'Quizzes Taken', val: '12', icon: '✍️' }, { label: 'Avg Score', val: '78%', icon: '📊' }, { label: 'Best Score', val: '95%', icon: '🏆' }].map(s => (
          <Card key={s.label}><CardContent className="p-4 flex items-center gap-3"><span className="text-2xl">{s.icon}</span><div><p className="font-display text-xl font-bold">{s.val}</p><p className="text-xs text-muted-foreground">{s.label}</p></div></CardContent></Card>
        ))}
      </div>
      <div>
        <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Recent Quizzes</h2>
        <div className="space-y-2">
          {quizHistory.map((q, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card className="hover:border-primary/30 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg ${q.score / q.total >= 0.8 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                    {Math.round((q.score / q.total) * 100)}%
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{q.topic}</p>
                    <p className="text-xs text-muted-foreground">{q.course} · {q.score}/{q.total} correct · {q.date}</p>
                  </div>
                  <Badge variant={q.score / q.total >= 0.8 ? 'emerald' : 'amber'}>{q.score >= 8 ? 'Great' : 'Good'}</Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ProgressPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Progress</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your study journey and growth</p>
      </div>
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { label: 'Day Streak', val: '7 🔥', color: 'text-amber-400' },
          { label: 'Study Hours', val: '42h', color: 'text-indigo-400' },
          { label: 'Cards Reviewed', val: '340', color: 'text-emerald-400' },
          { label: 'Quizzes Aced', val: '8', color: 'text-pink-400' },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-4 text-center"><p className={`font-display text-2xl font-bold ${s.color}`}>{s.val}</p><p className="text-xs text-muted-foreground mt-1">{s.label}</p></CardContent></Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-6">
          <h3 className="font-display font-semibold mb-4">Weekly Activity</h3>
          <div className="flex items-end gap-2 h-32">
            {[40, 70, 55, 90, 60, 80, 45].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="w-full rounded-t-lg bg-primary/70 hover:bg-primary transition-colors"
                  style={{ height: `${h}%` }}
                />
                <p className="text-xs text-muted-foreground">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
