import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  GraduationCap,
  Loader2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { profileApi, syllabusApi, extractApiError } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

const COURSES = [
  "Engineering",
  "Medical",
  "Commerce",
  "Arts",
  "Law",
  "Architecture",
  "Other",
];

const STEPS = ["Course", "Semester", "Syllabus", "Exam date"];

export function OnboardingPage() {
  const navigate = useNavigate();
  const setOnboarded = useAuthStore((s) => s.setOnboarded);
  const [step, setStep] = useState(0);
  const [course, setCourse] = useState<string>("");
  const [semester, setSemester] = useState<number | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [examDate, setExamDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function next() {
    if (step === 0 && !course) return toast.error("Pick a course");
    if (step === 1 && !semester) return toast.error("Pick a semester");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function skip() {
    setOnboarded(true);
    toast("Skipped onboarding — you can complete it later in Settings.");
    navigate("/dashboard");
  }

  async function finish() {
    setSubmitting(true);
    try {
      if (course || semester) {
        await profileApi.updateExtended({
          course: course || undefined,
          semester: semester ? Number(semester) : undefined,
        });
      }
      if (file) {
        await syllabusApi.upload(file.name.replace(/\.pdf$/i, ""), file);
        toast.success("Syllabus uploaded — processing in the background");
      }
      setOnboarded(true);
      toast.success("You're all set!");
      navigate("/dashboard");
    } catch (e) {
      toast.error(extractApiError(e, "Failed to save onboarding"));
    } finally {
      setSubmitting(false);
    }
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f && f.type === "application/pdf") setFile(f);
    else toast.error("Please upload a PDF");
  }

  return (
    <div className="min-h-screen animated-gradient-bg flex flex-col">
      <header className="container py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="font-display font-bold">StudyMate AI</span>
        </div>
        <button
          onClick={skip}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Skip for now
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-6 md:p-10">
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>
                  Step {step + 1} of {STEPS.length}
                </span>
                <span>{STEPS[step]}</span>
              </div>
              <Progress value={((step + 1) / STEPS.length) * 100} />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {step === 0 && (
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                      What are you studying?
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Pick the field that matches your degree.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {COURSES.map((c) => (
                        <button
                          key={c}
                          onClick={() => setCourse(c)}
                          className={`relative rounded-xl px-4 py-4 text-sm font-medium border transition text-left ${
                            course === c
                              ? "border-primary/60 bg-primary/10"
                              : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                          }`}
                        >
                          {c}
                          {course === c && (
                            <Check className="h-4 w-4 absolute top-2 right-2 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                      Which semester?
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      So we can tailor recommendations.
                    </p>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                      {Array.from({ length: 8 }, (_, i) => i + 1).map((s) => (
                        <button
                          key={s}
                          onClick={() => setSemester(s)}
                          className={`h-12 rounded-lg font-semibold border transition ${
                            semester === s
                              ? "border-primary/60 bg-primary text-primary-foreground"
                              : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                      Upload your syllabus
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      A PDF works best. You can add more later.
                    </p>
                    <label
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={onDrop}
                      htmlFor="syllabus-file"
                      className="block border-2 border-dashed border-white/15 rounded-2xl p-8 text-center cursor-pointer hover:bg-white/[0.03] transition"
                    >
                      <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                      {file ? (
                        <div>
                          <div className="font-medium">{file.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {(file.size / 1024 / 1024).toFixed(2)} MB · click to
                            change
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium">
                            Drop your PDF here, or click to browse
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            PDF only · up to 25MB
                          </div>
                        </div>
                      )}
                      <input
                        id="syllabus-file"
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                      When's your exam?
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      We'll build your study plan around it.
                    </p>
                    <div className="max-w-xs">
                      <Label htmlFor="exam-date">Exam date</Label>
                      <div className="relative mt-1.5">
                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                          id="exam-date"
                          type="date"
                          value={examDate}
                          onChange={(e) => setExamDate(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-10">
              <Button
                variant="ghost"
                onClick={back}
                disabled={step === 0 || submitting}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={next}>
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={finish} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Finishing...
                    </>
                  ) : (
                    <>
                      Finish <Check className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
