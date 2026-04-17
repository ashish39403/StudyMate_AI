import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Zap, BookOpen, Layers, FileQuestion, Brain, TrendingUp, MessageSquare, ArrowRight, Check, Star, Sparkles, ChevronRight, Shield, Clock, Gift, Twitter, Instagram, Youtube, Mail, Globe, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/primitives'
import { useRef, useEffect, useState } from 'react'

const features = [
  { icon: Brain, title: 'AI Summaries', desc: 'Get chapter-by-chapter summaries from any PDF syllabus instantly.', color: 'text-indigo-400', bg: 'bg-indigo-500/10', gradient: 'from-indigo-500/20 to-transparent' },
  { icon: Layers, title: 'Smart Flashcards', desc: 'Automatically generated flashcards using spaced repetition science.', color: 'text-emerald-400', bg: 'bg-emerald-500/10', gradient: 'from-emerald-500/20 to-transparent' },
  { icon: FileQuestion, title: 'MCQ Generator', desc: 'Generate unlimited practice questions with detailed explanations.', color: 'text-amber-400', bg: 'bg-amber-500/10', gradient: 'from-amber-500/20 to-transparent' },
  { icon: MessageSquare, title: 'PDF Chat', desc: 'Ask questions directly from your textbooks and get instant answers.', color: 'text-pink-400', bg: 'bg-pink-500/10', gradient: 'from-pink-500/20 to-transparent' },
  { icon: TrendingUp, title: 'Progress Tracking', desc: 'Visual progress rings and streaks to keep you motivated daily.', color: 'text-blue-400', bg: 'bg-blue-500/10', gradient: 'from-blue-500/20 to-transparent' },
  { icon: BookOpen, title: 'Course Manager', desc: 'Organize all your subjects, chapters, and study materials in one place.', color: 'text-violet-400', bg: 'bg-violet-500/10', gradient: 'from-violet-500/20 to-transparent' },
]

const testimonials = [
  { name: 'Priya M.', college: 'IIT Bombay', text: 'Went from 60% to 90% in my semester exams. The flashcards are insanely good.', stars: 5 },
  { name: 'Rohan K.', college: 'AIIMS Delhi', text: 'I study 2 hours a day instead of 6. StudyMate AI just gets it.', stars: 5 },
  { name: 'Anjali S.', college: 'DU Commerce', text: 'The PDF chat feature is like having a private tutor available 24/7.', stars: 5 },
]

const container = { 
  hidden: { opacity: 0 }, 
  show: { 
    opacity: 1, 
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2
    } 
  } 
}

const item = { 
  hidden: { opacity: 0, y: 24 }, 
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: 'spring', 
      stiffness: 250, 
      damping: 25 
    } 
  } 
}

// Animated counter component
const AnimatedCounter = ({ value, duration = 2 }: { value: number, duration?: number }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  
  useEffect(() => {
    if (isInView) {
      let start = 0
      const increment = value / (duration * 60)
      const timer = setInterval(() => {
        start += increment
        if (start >= value) {
          setCount(value)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 16)
      return () => clearInterval(timer)
    }
  }, [isInView, value, duration])
  
  return <span ref={ref}>{count.toLocaleString()}+</span>
}

// Animated dashboard card component
const AnimatedDashboardCard = ({ title, index, isActive }: { title: string, index: number, isActive: boolean }) => {
  const [hovered, setHovered] = useState(false)
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: hovered ? -4 : 0
      }}
      transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`rounded-xl border transition-all duration-300 ${
        isActive 
          ? 'border-primary/50 bg-gradient-to-br from-primary/10 to-transparent shadow-lg shadow-primary/20' 
          : 'border-border bg-secondary/30 hover:border-primary/30'
      } p-4 cursor-pointer relative overflow-hidden`}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0"
        initial={{ x: '-100%' }}
        animate={{ x: hovered ? '100%' : '-100%' }}
        transition={{ duration: 1.5, repeat: hovered ? Infinity : 0 }}
      />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-display font-medium">{title}</p>
          {isActive && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>
          )}
        </div>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2 bg-gradient-to-r from-secondary to-secondary/50 rounded-full overflow-hidden"
              initial={{ width: '0%' }}
              animate={{ width: isActive ? `${65 + i * 10}%` : `${40 + i * 15}%` }}
              transition={{ delay: 1 + i * 0.1, duration: 1, ease: "easeOut" }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary/50"
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{ delay: 1.2 + i * 0.1, duration: 1 }}
              />
            </motion.div>
          ))}
          
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map((dot) => (
              <motion.div
                key={dot}
                className="flex-1 h-1.5 rounded-full bg-secondary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 + dot * 0.1 }}
              >
                <motion.div
                  className="h-full bg-primary/60 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${30 + dot * 20}%` }}
                  transition={{ delay: 1.8 + dot * 0.1, duration: 0.8 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function LandingPage() {
  const { scrollY } = useScroll()
  const heroRef = useRef(null)
  const isHeroInView = useInView(heroRef, { once: false })
  
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95])
  const headerBlur = useTransform(scrollY, [0, 100], [0, 8])
  
  return (
    <div className="min-h-screen bg-background font-body overflow-x-hidden">
      {/* Animated Nav */}
      <motion.nav 
        style={{ 
          opacity: headerOpacity,
          backdropFilter: `blur(${headerBlur}px)`
        }}
        className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 border-b border-border/50 bg-background/80"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <motion.div 
          className="flex items-center gap-2 mr-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div 
            className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"
            animate={{ 
              rotate: [0, 5, -5, 0],
              boxShadow: [
                '0 0 0 0 rgba(var(--primary), 0)',
                '0 0 20px 5px rgba(var(--primary), 0.3)',
                '0 0 0 0 rgba(var(--primary), 0)'
              ]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatType: "loop"
            }}
          >
            <Zap className="w-4 h-4 text-white" />
          </motion.div>
          <span className="font-display font-bold text-lg">
            StudyMate <span className="text-primary relative">
              AI
              <motion.span
                className="absolute -right-5 -top-1"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-3 h-3 text-primary" />
              </motion.span>
            </span>
          </span>
        </motion.div>
        <div className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground mr-8">
          {['Features', 'Pricing', 'Reviews'].map((item) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="hover:text-foreground transition-colors relative group"
              whileHover={{ y: -2 }}
            >
              {item}
              <motion.span
                className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"
                layoutId="navUnderline"
              />
            </motion.a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="relative overflow-hidden group">
              <span className="relative z-10">Login</span>
              <motion.div
                className="absolute inset-0 bg-primary/10"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </Button>
          </Link>
          <Link to="/auth?mode=signup">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="sm" className="relative overflow-hidden">
                <span className="relative z-10">Start Free</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </Button>
            </motion.div>
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Animated background glow */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-[600px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
        </motion.div>

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}

        <motion.div 
          variants={container} 
          initial="hidden" 
          animate={isHeroInView ? "show" : "hidden"} 
          className="max-w-4xl mx-auto text-center relative"
        >
          <motion.div variants={item}>
            <Badge variant="default" className="mb-6 text-sm px-4 py-1.5 gap-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-3.5 h-3.5" />
              </motion.div>
              AI-powered for Indian students
            </Badge>
          </motion.div>

          <motion.h1 
            variants={item} 
            className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6"
          >
            Master Your Syllabus<br />
            <motion.span 
              className="text-primary inline-block"
              animate={{ 
                textShadow: [
                  '0 0 0 rgba(var(--primary), 0)',
                  '0 0 20px rgba(var(--primary), 0.5)',
                  '0 0 0 rgba(var(--primary), 0)'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              in Half the Time
            </motion.span>
          </motion.h1>

          <motion.p 
            variants={item} 
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Upload your syllabus, get AI-powered notes, flashcards, and quizzes instantly.
            Built for college students preparing for semester exams.
          </motion.p>

          <motion.div 
            variants={item} 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/auth?mode=signup">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="xl" className="gap-2 glow-indigo w-full sm:w-auto relative overflow-hidden group">
                  <span className="relative z-10 flex items-center gap-2">
                    Start Free — No credit card
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.8 }}
                  />
                </Button>
              </motion.div>
            </Link>
            <Link to="/dashboard">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="xl" variant="outline" className="w-full sm:w-auto">
                  View Demo Dashboard
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          <motion.p 
            variants={item} 
            className="text-sm text-muted-foreground mt-6"
          >
            🔥 Joined by <strong><AnimatedCounter value={12000} /></strong> students from IITs, NITs, AIIMS & more
          </motion.p>
        </motion.div>

        {/* Hero visual — Enhanced animated dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="max-w-5xl mx-auto mt-16 relative"
        >
          <motion.div 
            className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xl"
            whileHover={{ boxShadow: '0 25px 50px -12px rgba(var(--primary), 0.25)' }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-10 border-b border-border bg-secondary/30 flex items-center px-4 gap-2">
              {['bg-red-500', 'bg-amber-500', 'bg-green-500'].map((c, i) => (
                <motion.div 
                  key={c} 
                  className={`w-3 h-3 rounded-full ${c}/60`}
                  whileHover={{ scale: 1.2 }}
                  animate={{
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3
                  }}
                />
              ))}
              <motion.div 
                className="flex-1 mx-4 h-5 rounded-full bg-secondary/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <motion.div
                  className="h-full w-32 bg-primary/20 rounded-full"
                  animate={{ x: [0, 100, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            </div>

            <div className="p-6 grid grid-cols-3 gap-4 min-h-48">
              {['📊 Overview', '📚 Courses', '📝 Flashcards'].map((title, i) => (
                <AnimatedDashboardCard 
                  key={title} 
                  title={title} 
                  index={i} 
                  isActive={i === 0}
                />
              ))}
            </div>

            <motion.div
              className="h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ delay: 2, duration: 2, ease: "easeOut" }}
            />
          </motion.div>
          
          <motion.div 
            className="absolute -inset-4 bg-primary/5 rounded-3xl -z-10 blur-xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="mb-4">
              <motion.span
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✨
              </motion.span>
              {' '}Features
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Everything you need to ace your exams</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Six powerful AI tools working together to make studying more efficient and effective.</p>
          </motion.div>
          
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {features.map((f, index) => {
              const featureRef = useRef(null)
              const isInView = useInView(featureRef, { once: true })
              
              return (
                <motion.div key={f.title} variants={item} ref={featureRef}>
                  <motion.div
                    whileHover={{ 
                      y: -8,
                      transition: { type: 'spring', stiffness: 300, damping: 20 }
                    }}
                    className="h-full"
                  >
                    <Card className="h-full hover:border-primary/30 transition-all duration-300 relative overflow-hidden group">
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                        initial={false}
                        animate={isInView ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      
                      <CardContent className="p-5 relative z-10">
                        <motion.div 
                          className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-4`}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <motion.div
                            animate={isInView ? {
                              scale: [1, 1.2, 1],
                              rotate: [0, 5, -5, 0]
                            } : {}}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: index * 0.2
                            }}
                          >
                            <f.icon className={`w-5 h-5 ${f.color}`} />
                          </motion.div>
                        </motion.div>
                        
                        <h3 className="font-display font-semibold mb-2 group-hover:text-primary transition-colors">
                          {f.title}
                        </h3>
                        
                        <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                        
                        <motion.div
                          className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity"
                          initial={{ x: -10 }}
                          whileHover={{ x: 0 }}
                        >
                          <ChevronRight className="w-4 h-4 text-primary" />
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-6 bg-gradient-to-b from-transparent via-card/30 to-transparent">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="mb-4">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ⭐
              </motion.span>
              {' '}Reviews
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Loved by students across India</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Join thousands of students who've transformed their study habits</p>
          </motion.div>
          
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.1 }} 
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                  <CardContent className="p-6 relative">
                    <div className="flex gap-0.5 mb-3">
                      {Array(t.stars).fill(0).map((_, j) => (
                        <motion.div
                          key={j}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.1 + j * 0.05 }}
                        >
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.text}"</p>
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm font-display font-bold text-primary border border-primary/20"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        {t.name[0]}
                      </motion.div>
                      <div>
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.college}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Pricing Section */}
      <section id="pricing" className="py-20 px-6 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(var(--primary), 0.03) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(var(--primary), 0.03) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(var(--primary), 0.03) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        
        <div className="max-w-5xl mx-auto relative">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="mb-4">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                💎
              </motion.span>
              {' '}Pricing
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Simple, student-friendly pricing</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Start free, upgrade when you're ready. No hidden fees.</p>
            
            <motion.div 
              className="inline-flex items-center gap-3 mt-6 p-1 bg-secondary/30 rounded-full border border-border"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Button variant="ghost" size="sm" className="rounded-full">Monthly</Button>
              <Button variant="default" size="sm" className="rounded-full relative overflow-hidden">
                Yearly
                <motion.span
                  className="absolute -top-1 -right-1"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Badge variant="default" className="text-[10px] px-1.5 py-0">Save 25%</Badge>
                </motion.span>
              </Button>
            </motion.div>
          </motion.div>
          
          <div className="grid lg:grid-cols-2 gap-6">
            {[
              {
                name: 'Free', price: '₹0', period: 'forever',
                features: ['10 AI generations/day', 'Basic flashcards', 'MCQ generator', 'PDF upload (10MB max)', 'Email support'],
                cta: 'Get Started Free', variant: 'outline' as const, highlighted: false,
                icon: Zap, color: 'from-blue-500/20 to-cyan-500/20'
              },
              {
                name: 'Pro', price: '₹299', period: '/month',
                features: ['Unlimited AI generations', 'Advanced flashcards', 'Priority AI responses', 'PDF upload (100MB max)', 'API access', 'Export to PDF', 'Priority support'],
                cta: 'Start Pro Trial', variant: 'default' as const, highlighted: true,
                icon: Sparkles, color: 'from-primary/20 via-purple-500/20 to-pink-500/20'
              },
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="relative"
              >
                <Card className={`h-full relative overflow-hidden transition-all duration-300 ${
                  plan.highlighted 
                    ? 'border-primary/50 shadow-2xl shadow-primary/20' 
                    : 'hover:border-primary/30'
                }`}>
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-50`}
                    animate={{
                      scale: [1, 1.05, 1],
                      rotate: [0, 1, -1, 0]
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {plan.highlighted && (
                    <>
                      <motion.div 
                        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary"
                        animate={{
                          opacity: [1, 0.5, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <motion.div 
                        className="absolute -top-3 left-1/2 -translate-x-1/2"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Badge variant="default" className="shadow-lg">
                          <motion.span
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            ⭐
                          </motion.span>
                          {' '}Most Popular
                        </Badge>
                      </motion.div>
                    </>
                  )}
                  
                  <CardContent className="p-6 lg:p-8 relative">
                    <div className="flex items-center gap-3 mb-4">
                      <motion.div 
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}
                        whileHover={{ rotate: 10, scale: 1.1 }}
                      >
                        <plan.icon className="w-6 h-6 text-primary" />
                      </motion.div>
                      <h3 className="font-display text-2xl font-bold">{plan.name}</h3>
                    </div>
                    
                    <div className="flex items-end gap-2 mb-6">
                      <motion.span 
                        className="font-display text-5xl font-bold"
                        initial={{ scale: 0.9 }}
                        whileInView={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                      >
                        {plan.price}
                      </motion.span>
                      <span className="text-muted-foreground mb-1">{plan.period}</span>
                    </div>
                    
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((f, i) => (
                        <motion.li 
                          key={f} 
                          className="flex items-center gap-3 text-sm"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 360 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          </motion.div>
                          <span className="text-muted-foreground">{f}</span>
                        </motion.li>
                      ))}
                    </ul>
                    
                    <Link to="/auth?mode=signup">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          variant={plan.variant} 
                          className={`w-full relative overflow-hidden group ${
                            plan.highlighted ? 'glow-indigo' : ''
                          }`}
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            {plan.cta}
                            <motion.div
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <ArrowRight className="w-4 h-4" />
                            </motion.div>
                          </span>
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 0.8 }}
                          />
                        </Button>
                      </motion.div>
                    </Link>
                    
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Shield className="w-3 h-3" />
                      <span>No credit card required</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                      <Clock className="w-3 h-3" />
                      <span>Cancel anytime</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/20">
              <Gift className="w-4 h-4 text-primary" />
              <span className="text-sm">Students get 20% off with valid ID — </span>
              <a href="#" className="text-primary hover:underline text-sm font-medium">Verify Now →</a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(circle at 50% 50%, rgba(var(--primary), 0.1) 0%, transparent 70%)',
              'radial-gradient(circle at 50% 50%, rgba(var(--primary), 0.15) 0%, transparent 70%)',
              'radial-gradient(circle at 50% 50%, rgba(var(--primary), 0.1) 0%, transparent 70%)'
            ]
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        
        <div className="max-w-3xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-12 md:p-16 relative overflow-hidden backdrop-blur-sm"
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div 
                className="w-96 h-96 bg-primary/20 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Badge variant="default" className="mb-6">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  🚀
                </motion.span>
                {' '}Limited Time Offer
              </Badge>
            </motion.div>
            
            <motion.h2 
              className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 relative"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              Start studying smarter today
            </motion.h2>
            
            <motion.p 
              className="text-lg text-muted-foreground mb-8 relative max-w-xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              Join 12,000+ students who upgraded their study game with AI. Get your first month free!
            </motion.p>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="relative"
            >
              <Link to="/auth?mode=signup">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Button size="xl" className="glow-indigo gap-2 relative overflow-hidden group px-8 py-6 text-lg">
                    <span className="relative z-10 flex items-center gap-2">
                      Get Started Free
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.8 }}
                    />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
            
            <motion.div
              className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Cancel anytime</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="border-t border-border bg-card/30">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            {/* Brand Column */}
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 mb-4">
                <motion.div 
                  className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <Zap className="w-4 h-4 text-white" />
                </motion.div>
                <span className="font-display font-bold text-xl">
                  StudyMate <span className="text-primary">AI</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                Empowering Indian students with AI-powered study tools. Master your syllabus faster and smarter.
              </p>
              <div className="flex gap-3">
                {[Twitter, Instagram, Youtube, Mail].map((Icon, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-full bg-secondary/50 hover:bg-primary/20 flex items-center justify-center transition-colors"
                    whileHover={{ y: -3, scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Links Columns */}
            {[
              {
                title: 'Product',
                links: ['Features', 'Pricing', 'Demo', 'AI Tools']
              },
              {
                title: 'Resources',
                links: ['Blog', 'Help Center', 'Community', 'Tutorials']
              },
              {
                title: 'Company',
                links: ['About', 'Careers', 'Contact', 'Press']
              }
            ].map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <h4 className="font-display font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <motion.a
                        href="#"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        {link}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Bottom Bar */}
          <motion.div 
            className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="w-4 h-4" />
              <span>English (India)</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span>🇮🇳 Made in India</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <motion.a 
                href="#" 
                className="hover:text-foreground transition-colors"
                whileHover={{ y: -2 }}
              >
                Privacy
              </motion.a>
              <motion.a 
                href="#" 
                className="hover:text-foreground transition-colors"
                whileHover={{ y: -2 }}
              >
                Terms
              </motion.a>
              <motion.a 
                href="#" 
                className="hover:text-foreground transition-colors"
                whileHover={{ y: -2 }}
              >
                Cookies
              </motion.a>
            </div>
            
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              © 2025 StudyMate AI. 
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="w-3 h-3 text-red-400 inline mx-0.5" />
              </motion.span>
              Made for Indian students.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}