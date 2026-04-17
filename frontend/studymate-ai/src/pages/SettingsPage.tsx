import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, CreditCard, Key, Trash2, Camera, Copy, RefreshCw, Crown } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Label, Progress, Switch, Badge, Separator, Avatar, AvatarFallback } from '@/components/ui/primitives'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'subscription', label: 'Subscription', icon: CreditCard },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'danger', label: 'Danger Zone', icon: Trash2 },
]

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const { user } = useAuthStore()
  const [apiKey] = useState('sk-sm-••••••••••••••••••••••••••••••••')
  const [notifications, setNotifications] = useState({ daily: true, streak: true, quiz: false })

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'AS'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences</p>
      </motion.div>

      <div className="flex gap-6">
        {/* Tab sidebar */}
        <div className="hidden sm:flex flex-col gap-1 w-44 shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left',
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                tab.id === 'danger' && 'text-destructive/70 hover:text-destructive hover:bg-destructive/10'
              )}
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Profile tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="w-16 h-16">
                          <AvatarFallback className="text-lg bg-primary/20 text-primary font-display">{initials}</AvatarFallback>
                        </Avatar>
                        <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors">
                          <Camera className="w-3 h-3 text-white" />
                        </button>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                        <Button size="sm" variant="outline" className="mt-2 h-7 text-xs">Change Photo</Button>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Full Name</Label>
                        <Input defaultValue={user?.name} placeholder="Your full name" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Email</Label>
                        <Input defaultValue={user?.email} placeholder="Your email" type="email" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">College / University</Label>
                        <Input defaultValue={user?.college} placeholder="Your institution" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Course</Label>
                        <Input defaultValue={user?.course} placeholder="e.g. Engineering" />
                      </div>
                    </div>
                    <Button onClick={() => toast.success('Profile updated!')} className="w-full sm:w-auto">
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { key: 'daily', label: 'Daily Study Reminder', desc: 'Get reminded to study every day' },
                      { key: 'streak', label: 'Streak Alerts', desc: 'Alert when your streak is at risk' },
                      { key: 'quiz', label: 'Quiz Results', desc: 'Notify when AI generates new quizzes' },
                    ].map(n => (
                      <div key={n.key} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{n.label}</p>
                          <p className="text-xs text-muted-foreground">{n.desc}</p>
                        </div>
                        <Switch
                          checked={notifications[n.key as keyof typeof notifications]}
                          onCheckedChange={v => setNotifications(prev => ({ ...prev, [n.key]: v }))}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Subscription tab */}
            {activeTab === 'subscription' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Current Plan</CardTitle>
                      <Badge variant={user?.plan === 'pro' ? 'emerald' : 'secondary'} className="text-xs uppercase">
                        {user?.plan}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Credits Used</span>
                        <span className="text-sm font-display font-bold">{user?.creditsUsed} / {user?.creditsTotal}</span>
                      </div>
                      <Progress value={(user?.creditsUsed ?? 0) / (user?.creditsTotal ?? 1) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">Resets on May 1, 2025</p>
                    </div>

                    {user?.plan === 'free' && (
                      <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <Crown className="w-5 h-5 text-primary" />
                          <h3 className="font-display font-bold text-primary">Upgrade to Pro</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">Unlimited AI generations, priority support, and more.</p>
                        <div className="flex items-end gap-1 mb-4">
                          <span className="font-display text-3xl font-bold">₹299</span>
                          <span className="text-muted-foreground mb-1">/month</span>
                        </div>
                        <ul className="text-sm space-y-1.5 mb-5">
                          {['Unlimited flashcards & quizzes', 'Priority AI responses', 'PDF export', 'Progress analytics', 'API access'].map(f => (
                            <li key={f} className="flex items-center gap-2 text-muted-foreground">
                              <span className="text-emerald-400">✓</span> {f}
                            </li>
                          ))}
                        </ul>
                        <Button className="w-full glow-indigo" onClick={() => toast.success('Redirecting to payment...')}>
                          Upgrade Now — ₹299/mo
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* API Keys tab */}
            {activeTab === 'api' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">API Keys</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Use your API key to integrate StudyMate AI into your own applications.</p>
                  <div className="flex items-center gap-2">
                    <Input value={apiKey} readOnly className="font-mono text-xs" />
                    <Button size="icon" variant="outline" onClick={() => { navigator.clipboard.writeText(apiKey); toast.success('Copied!') }}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => toast.success('API key regenerated!')}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-xs text-amber-400">⚠️ Keep your API key secret. Never share it publicly or commit it to version control.</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Usage this month</p>
                    <div className="font-mono text-xs bg-secondary/50 p-3 rounded-lg space-y-1 text-muted-foreground">
                      <p>API calls: <span className="text-foreground">142 / 500</span></p>
                      <p>Last used: <span className="text-foreground">2 hours ago</span></p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Danger Zone tab */}
            {activeTab === 'danger' && (
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">These actions are permanent and cannot be undone.</p>
                  <Separator />
                  <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                    <div>
                      <p className="font-medium text-sm">Clear All Study Data</p>
                      <p className="text-xs text-muted-foreground">Remove all flashcards, quiz results, and progress</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive hover:text-white"
                      onClick={() => toast.error('This is a demo — data not cleared')}>
                      Clear Data
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                    <div>
                      <p className="font-medium text-sm">Delete Account</p>
                      <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="destructive" size="sm"
                      onClick={() => toast.error('This is a demo — account not deleted')}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
