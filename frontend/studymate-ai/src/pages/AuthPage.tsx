import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Zap, ArrowLeft, Mail } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/primitives'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
const signupSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

type LoginForm = z.infer<typeof loginSchema>
type SignupForm = z.infer<typeof signupSchema>

export function AuthPage() {
  const [params] = useSearchParams()
  const [mode, setMode] = useState<'login' | 'signup'>(params.get('mode') === 'signup' ? 'signup' : 'login')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })
  const signupForm = useForm<SignupForm>({ resolver: zodResolver(signupSchema) })

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const user = await authService.login(data.email, data.password)
      login(user)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch {
      toast.error('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (data: SignupForm) => {
    setIsLoading(true)
    try {
      const user = await authService.signup(data.email, data.name, data.password)
      login(user)
      toast.success('Account created!')
      navigate('/onboarding')
    } catch {
      toast.error('Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setIsLoading(true)
    const user = await authService.login('demo@studymate.ai', 'demo')
    login(user)
    toast.success('Logged in as demo user!')
    navigate('/dashboard')
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex flex-1 bg-card border-r border-border flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display text-3xl font-bold mb-4">Study smarter,<br />not harder</h2>
          <p className="text-muted-foreground leading-relaxed">AI-powered tools to help you master your syllabus, ace your exams, and build lasting knowledge.</p>
          <div className="grid grid-cols-2 gap-4 mt-8 text-left">
            {['12k+ students', '500k flashcards', '98% pass rate', '4.9★ rating'].map(stat => (
              <div key={stat} className="p-3 rounded-xl bg-secondary/50 border border-border">
                <p className="font-display font-bold text-primary text-lg">{stat.split(' ')[0]}</p>
                <p className="text-xs text-muted-foreground">{stat.split(' ').slice(1).join(' ')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex flex-col">
        <div className="p-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold">StudyMate AI</span>
            </div>

            {/* Mode toggle */}
            <div className="flex rounded-xl bg-secondary p-1 mb-8">
              {(['login', 'signup'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                    mode === m ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {m === 'login' ? 'Log in' : 'Sign up'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === 'signup' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'signup' ? -20 : 20 }}
                transition={{ duration: 0.2 }}
              >
                {mode === 'login' ? (
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <h1 className="font-display text-2xl font-bold mb-1">Welcome back</h1>
                    <p className="text-muted-foreground text-sm mb-6">Continue your study session</p>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Email</Label>
                      <Input {...loginForm.register('email')} type="email" placeholder="you@college.ac.in" />
                      {loginForm.formState.errors.email && <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Password</Label>
                        <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                      </div>
                      <div className="relative">
                        <Input {...loginForm.register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {loginForm.formState.errors.password && <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>}
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Signing in...' : 'Log in'}</Button>
                  </form>
                ) : (
                  <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                    <h1 className="font-display text-2xl font-bold mb-1">Create account</h1>
                    <p className="text-muted-foreground text-sm mb-6">Start your AI-powered study journey</p>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Full Name</Label>
                      <Input {...signupForm.register('name')} placeholder="Arjun Sharma" />
                      {signupForm.formState.errors.name && <p className="text-xs text-destructive">{signupForm.formState.errors.name.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Email</Label>
                      <Input {...signupForm.register('email')} type="email" placeholder="you@college.ac.in" />
                      {signupForm.formState.errors.email && <p className="text-xs text-destructive">{signupForm.formState.errors.email.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Password</Label>
                      <div className="relative">
                        <Input {...signupForm.register('password')} type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {signupForm.formState.errors.password && <p className="text-xs text-destructive">{signupForm.formState.errors.password.message}</p>}
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Creating account...' : 'Create account'}</Button>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or continue with</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Social + magic link */}
            <div className="space-y-2">
              <Button variant="outline" className="w-full gap-2" onClick={() => toast.info('Google OAuth coming soon!')}>
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={() => toast.info('Magic link coming soon!')}>
                <Mail className="w-4 h-4" />
                Magic Link (Email)
              </Button>
              <Button variant="ghost" className="w-full text-muted-foreground text-sm" onClick={handleDemoLogin} disabled={isLoading}>
                Try Demo without signing up →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
