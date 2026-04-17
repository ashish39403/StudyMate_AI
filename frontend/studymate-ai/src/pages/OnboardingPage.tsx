import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Upload, ChevronRight, ChevronLeft, Check, Zap, FileText } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Label, Input } from '@/components/ui/primitives'
import { toast } from 'sonner'

const steps = ['Course', 'Semester', 'Syllabus PDF', 'Exam Date']

const courses = ['Engineering', 'Medical (MBBS/BDS)', 'Commerce & CA', 'Arts & Humanities', 'Law', 'Architecture', 'Pharmacy', 'Other']

export function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({ course: '', semester: 0, file: null as File | null, examDate: '' })
  const { setOnboarded } = useAuthStore()
  const navigate = useNavigate()

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: (files) => { setData(d => ({ ...d, file: files[0] })); toast.success(`${files[0].name} uploaded!`) }
  })

  const next = () => { if (step < steps.length - 1) setStep(s => s + 1) }
  const prev = () => { if (step > 0) setStep(s => s - 1) }

  const finish = () => {
    setOnboarded(true)
    toast.success('Setup complete! Let\'s start studying 🎓')
    navigate('/dashboard')
  }

  const canProceed = () => {
    if (step === 0) return !!data.course
    if (step === 1) return data.semester > 0
    if (step === 2) return true // PDF optional
    if (step === 3) return true
    return false
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-10">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg">StudyMate AI</span>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                  i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
                }`}>
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 transition-all ${i < step ? 'bg-emerald-500' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">Step {step + 1} of {steps.length}: <span className="text-foreground font-medium">{steps[step]}</span></p>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-card border border-border rounded-2xl p-6 mb-6"
          >
            {/* Step 0: Course */}
            {step === 0 && (
              <div>
                <h2 className="font-display text-xl font-bold mb-1">What are you studying?</h2>
                <p className="text-muted-foreground text-sm mb-6">Select your academic field</p>
                <div className="grid grid-cols-2 gap-2">
                  {courses.map(c => (
                    <button
                      key={c}
                      onClick={() => setData(d => ({ ...d, course: c }))}
                      className={`p-3 rounded-xl border text-sm text-left font-medium transition-all ${
                        data.course === c
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/30 text-foreground hover:bg-secondary/50'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Semester */}
            {step === 1 && (
              <div>
                <h2 className="font-display text-xl font-bold mb-1">Which semester?</h2>
                <p className="text-muted-foreground text-sm mb-6">This helps us tailor content for your level</p>
                <div className="grid grid-cols-4 gap-3">
                  {Array.from({ length: 8 }, (_, i) => i + 1).map(sem => (
                    <button
                      key={sem}
                      onClick={() => setData(d => ({ ...d, semester: sem }))}
                      className={`h-14 rounded-xl border text-lg font-display font-bold transition-all ${
                        data.semester === sem
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/30 text-foreground hover:bg-secondary/50'
                      }`}
                    >
                      {sem}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Upload */}
            {step === 2 && (
              <div>
                <h2 className="font-display text-xl font-bold mb-1">Upload your syllabus</h2>
                <p className="text-muted-foreground text-sm mb-6">We'll extract chapters and generate study materials</p>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isDragActive ? 'border-primary bg-primary/5' : data.file ? 'border-emerald-500 bg-emerald-500/5' : 'border-border hover:border-primary/50 hover:bg-secondary/30'
                  }`}
                >
                  <input {...getInputProps()} />
                  {data.file ? (
                    <div>
                      <FileText className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                      <p className="font-medium text-emerald-400">{data.file.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{(data.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="font-medium mb-1">{isDragActive ? 'Drop your PDF here!' : 'Drag & drop your syllabus PDF'}</p>
                      <p className="text-sm text-muted-foreground">or click to browse</p>
                      <p className="text-xs text-muted-foreground mt-4">Supports PDF up to 10MB</p>
                    </div>
                  )}
                </div>
                {!data.file && (
                  <p className="text-xs text-muted-foreground text-center mt-3">You can also skip and upload later from your dashboard</p>
                )}
              </div>
            )}

            {/* Step 3: Exam date */}
            {step === 3 && (
              <div>
                <h2 className="font-display text-xl font-bold mb-1">When's your exam?</h2>
                <p className="text-muted-foreground text-sm mb-6">We'll create a personalized study plan to get you ready</p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Exam Start Date</Label>
                    <Input type="date" value={data.examDate} onChange={e => setData(d => ({ ...d, examDate: e.target.value }))} min={new Date().toISOString().split('T')[0]} />
                  </div>
                  {data.examDate && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-sm text-emerald-400">
                        📅 {Math.ceil((new Date(data.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days to prepare. Let's build your study plan!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step > 0 && (
              <Button variant="outline" onClick={prev} className="gap-2">
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
            )}
            <button onClick={finish} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Skip for now
            </button>
          </div>

          {step < steps.length - 1 ? (
            <Button onClick={next} disabled={!canProceed()} className="gap-2">
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={finish} className="gap-2 glow-indigo">
              Let's go! 🚀
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
