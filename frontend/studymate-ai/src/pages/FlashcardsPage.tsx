import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, ChevronLeft, ChevronRight, RotateCcw, ThumbsUp, ThumbsDown, Download, BookOpen, Sparkles, X } from 'lucide-react'
import { flashcardService, mockDecks, mockCourses } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress, Skeleton, Badge } from '@/components/ui/primitives'
import { timeAgo, cn } from '@/lib/utils'
import type { Flashcard } from '@/types'

// The sample flashcards for study mode from course 1, chapter 1
const sampleCards = mockCourses[0].chapters[0].flashcards

function FlipCard({ card }: { card: Flashcard }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      className="relative w-full h-64 cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={() => setFlipped(!flipped)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
        className="w-full h-full relative"
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-6 rounded-2xl border border-border bg-card text-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider">Question</p>
          <p className="font-display text-lg font-semibold leading-relaxed">{card.front}</p>
          <p className="text-xs text-muted-foreground mt-6">Click to reveal answer</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-6 rounded-2xl border border-primary/30 bg-primary/5 text-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="text-xs text-primary mb-4 uppercase tracking-wider font-medium">Answer</p>
          <p className="text-base leading-relaxed">{card.back}</p>
          <Badge variant={card.difficulty === 'easy' ? 'emerald' : card.difficulty === 'medium' ? 'amber' : 'destructive'} className="mt-4">
            {card.difficulty}
          </Badge>
        </div>
      </motion.div>
    </div>
  )
}

function StudyMode({ cards, onClose }: { cards: Flashcard[]; onClose: () => void }) {
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState<Set<string>>(new Set())
  const [direction, setDirection] = useState(0)

  const card = cards[idx]
  const progress = ((idx) / cards.length) * 100

  const next = (knew: boolean) => {
    if (knew) setKnown(prev => new Set([...prev, card.id]))
    if (idx < cards.length - 1) {
      setDirection(1)
      setFlipped(false)
      setTimeout(() => setIdx(idx + 1), 50)
    } else {
      setIdx(cards.length) // Done
    }
  }

  if (idx >= cards.length) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur z-50 flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-sm">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="font-display text-2xl font-bold mb-2">Session Complete!</h2>
          <p className="text-muted-foreground mb-6">You knew {known.size} out of {cards.length} cards</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => { setIdx(0); setFlipped(false); setKnown(new Set()) }}>
              <RotateCcw className="w-4 h-4 mr-2" /> Restart
            </Button>
            <Button variant="outline" onClick={onClose}>Exit Study Mode</Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-sm font-display font-semibold">{idx + 1} / {cards.length}</span>
          <Progress value={progress} className="w-32 h-1.5" />
        </div>
        <p className="text-sm text-muted-foreground hidden sm:block">✅ {known.size} known</p>
        <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ x: direction * 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -direction * 50, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg"
          >
            <div
              className="relative w-full h-72 cursor-pointer"
              style={{ perspective: '1000px' }}
              onClick={() => setFlipped(!flipped)}
            >
              <motion.div
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.4 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="w-full h-full relative"
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 rounded-2xl border border-border bg-card text-center" style={{ backfaceVisibility: 'hidden' }}>
                  <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider">Question</p>
                  <p className="font-display text-xl font-semibold leading-relaxed">{card.front}</p>
                  <p className="text-xs text-muted-foreground mt-6">Tap to flip</p>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 rounded-2xl border border-primary/30 bg-primary/5 text-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <p className="text-xs text-primary mb-4 uppercase tracking-wider font-medium">Answer</p>
                  <p className="text-lg leading-relaxed">{card.back}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => next(false)}
            className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <ThumbsDown className="w-6 h-6" />
            <span className="text-xs">Still learning</span>
          </motion.button>

          <button
            onClick={() => setFlipped(!flipped)}
            className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => next(true)}
            className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
          >
            <ThumbsUp className="w-6 h-6" />
            <span className="text-xs">Got it!</span>
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export function FlashcardsPage() {
  const [studyMode, setStudyMode] = useState(false)
  const [activeDeckCards, setActiveDeckCards] = useState<Flashcard[]>([])

  const { data: decks, isLoading } = useQuery({
    queryKey: ['decks'],
    queryFn: flashcardService.getDecks,
  })

  const startStudy = (deckId: string) => {
    // Use sample cards for demo
    setActiveDeckCards(sampleCards)
    setStudyMode(true)
  }

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Flashcards</h1>
            <p className="text-muted-foreground text-sm mt-1">Review your AI-generated study cards</p>
          </div>
          <Button className="gap-2">
            <Sparkles className="w-4 h-4" />
            Generate New Deck
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Decks', value: decks?.length ?? 0, icon: '📚' },
            { label: 'Cards Mastered', value: decks?.reduce((a, d) => a + d.mastered, 0) ?? 0, icon: '✅' },
            { label: 'To Review', value: decks?.reduce((a, d) => a + (d.cardCount - d.mastered), 0) ?? 0, icon: '🔄' },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <p className="font-display text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Deck list */}
        <div>
          <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Your Decks</h2>
          {isLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-40" />)}</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {decks?.map((deck, idx) => {
                const masteredPct = Math.round((deck.mastered / deck.cardCount) * 100)
                return (
                  <motion.div
                    key={deck.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.07 }}
                  >
                    <Card className="hover:border-primary/30 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                            <Layers className="w-5 h-5 text-primary" />
                          </div>
                          <Badge variant="secondary" className="text-xs">{deck.cardCount} cards</Badge>
                        </div>
                        <CardTitle className="text-sm">{deck.title}</CardTitle>
                        <p className="text-xs text-muted-foreground">{deck.courseName}</p>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span>{deck.mastered} mastered</span>
                          <span>{masteredPct}%</span>
                        </div>
                        <Progress value={masteredPct} className="h-1.5 mb-3" />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {deck.lastStudied ? `Last: ${timeAgo(deck.lastStudied)}` : 'Not started'}
                          </span>
                          <div className="flex gap-1.5">
                            <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => {}}>
                              <Download className="w-3 h-3" />
                            </Button>
                            <Button size="sm" className="h-7 text-xs px-3" onClick={() => startStudy(deck.id)}>
                              Study
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Sample flip cards preview */}
        {sampleCards.length > 0 && (
          <div>
            <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Preview — Chapter 1 Cards</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sampleCards.map(card => (
                <FlipCard key={card.id} card={card} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Study mode overlay */}
      <AnimatePresence>
        {studyMode && (
          <StudyMode cards={activeDeckCards} onClose={() => setStudyMode(false)} />
        )}
      </AnimatePresence>
    </>
  )
}
