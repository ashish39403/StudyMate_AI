import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronLeft, Layers, FileQuestion, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react'
import { courseService } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress, Skeleton, Badge } from '@/components/ui/primitives'
import { ChatModal } from '@/components/chat/ChatModal'
import { cn } from '@/lib/utils'

export function CourseDetail() {
  const { id } = useParams<{ id: string }>()
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatContext, setChatContext] = useState('')

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => courseService.getCourse(id!),
  })

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-32 w-full" />
        {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    )
  }

  if (!course) return (
    <div className="text-center py-20 text-muted-foreground">
      <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
      <p>Course not found</p>
      <Link to="/dashboard"><Button variant="ghost" className="mt-4">← Back to Dashboard</Button></Link>
    </div>
  )

  const completedChapters = course.chapters.filter(c => c.completed).length

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-foreground">{course.name}</span>
        </div>

        {/* Course header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: course.color }} />
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{course.code}</Badge>
                  <Badge variant="secondary">Semester {course.semester}</Badge>
                </div>
                <h1 className="font-display text-2xl font-bold">{course.name}</h1>
                <p className="text-muted-foreground mt-1">{course.chapters.length} chapters · {completedChapters} completed</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display text-3xl font-bold" style={{ color: course.color }}>{course.progress}%</p>
                <p className="text-xs text-muted-foreground">completed</p>
              </div>
            </div>
            <Progress value={course.progress} className="h-2" />
            <div className="flex items-center gap-3 mt-4">
              <Button size="sm" onClick={() => { setChatContext(course.name); setChatOpen(true) }}>
                <Sparkles className="w-4 h-4 mr-2" />
                Ask AI about this course
              </Button>
              <Button size="sm" variant="outline">
                <FileQuestion className="w-4 h-4 mr-2" />
                Generate Quiz
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Chapters accordion */}
        <div>
          <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Chapters</h2>
          <div className="space-y-2">
            {course.chapters.map((chapter, idx) => (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={cn('overflow-hidden transition-colors', expandedChapter === chapter.id && 'border-primary/30')}>
                  {/* Chapter header */}
                  <button
                    onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors text-left"
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-display shrink-0',
                      chapter.completed ? 'bg-emerald-500/15 text-emerald-400' : 'bg-secondary text-muted-foreground'
                    )}>
                      {chapter.completed ? <CheckCircle2 className="w-4 h-4" /> : chapter.number}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{chapter.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {chapter.flashcards.length > 0 ? `${chapter.flashcards.length} flashcards` : 'No flashcards yet'}
                        {chapter.completed && ' · Completed'}
                      </p>
                    </div>
                    {chapter.completed && <Badge variant="emerald" className="shrink-0">Done</Badge>}
                    <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform shrink-0', expandedChapter === chapter.id && 'rotate-180')} />
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {expandedChapter === chapter.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden border-t border-border"
                      >
                        <div className="p-4 space-y-4">
                          {/* Summary */}
                          {chapter.summary ? (
                            <div>
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">📄 Summary</h4>
                              <p className="text-sm text-muted-foreground leading-relaxed bg-secondary/40 p-3 rounded-lg">
                                {chapter.summary}
                              </p>
                            </div>
                          ) : (
                            <div className="text-center py-3">
                              <p className="text-sm text-muted-foreground mb-2">No summary yet</p>
                              <Button size="sm" variant="outline" className="text-xs">
                                <Sparkles className="w-3 h-3 mr-1" /> Generate Summary
                              </Button>
                            </div>
                          )}

                          {/* Flashcards preview */}
                          {chapter.flashcards.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">📝 Flashcards ({chapter.flashcards.length})</h4>
                              <div className="grid gap-2">
                                {chapter.flashcards.slice(0, 2).map(card => (
                                  <div key={card.id} className="bg-secondary/40 p-3 rounded-lg text-sm">
                                    <p className="font-medium mb-1">{card.front}</p>
                                    <p className="text-muted-foreground text-xs">{card.back}</p>
                                  </div>
                                ))}
                                {chapter.flashcards.length > 2 && (
                                  <p className="text-xs text-muted-foreground text-center">+{chapter.flashcards.length - 2} more cards</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Button size="sm" variant="outline" className="text-xs gap-1.5">
                              <Layers className="w-3.5 h-3.5" />
                              Study Flashcards
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs gap-1.5">
                              <FileQuestion className="w-3.5 h-3.5" />
                              Start Quiz
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs gap-1.5"
                              onClick={() => { setChatContext(`Chapter ${chapter.number}: ${chapter.title}`); setChatOpen(true) }}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              Ask AI
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating action button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        onClick={() => { setChatContext(course.name); setChatOpen(true) }}
        className="fixed bottom-6 right-6 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-2xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors glow-indigo"
      >
        <Sparkles className="w-4 h-4" />
        <span className="text-sm font-medium">Ask AI</span>
      </motion.button>

      <ChatModal open={chatOpen} onClose={() => setChatOpen(false)} context={chatContext} />
    </>
  )
}
