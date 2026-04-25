import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  ClipboardList,
  FileText,
  Layers,
  LineChart,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authApi } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

const FEATURES = [
  {
    icon: FileText,
    title: "PDF Upload",
    desc: "Drop your syllabus and we'll extract every chapter automatically.",
  },
  {
    icon: MessageSquare,
    title: "AI Chat",
    desc: "Ask any question — answers grounded in your actual syllabus.",
  },
  {
    icon: Layers,
    title: "Smart Flashcards",
    desc: "Generated from your content. Spaced-repetition built-in.",
  },
  {
    icon: ClipboardList,
    title: "Practice Quizzes",
    desc: "MCQs and short-answer drills tailored to each chapter.",
  },
  {
    icon: Brain,
    title: "Concise Summaries",
    desc: "Long PDFs collapsed into focused, exam-ready notes.",
  },
  {
    icon: LineChart,
    title: "Progress Tracking",
    desc: "See your streak, mastery, and weak chapters at a glance.",
  },
];

const STATS = [
  { value: "12k+", label: "Students" },
  { value: "500k", label: "Flashcards generated" },
  { value: "98%", label: "Pass rate" },
  { value: "4.9★", label: "Average rating" },
];

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "/mo",
    desc: "Perfect for getting started.",
    features: [
      "1 syllabus upload",
      "50 AI questions / month",
      "Basic flashcards",
      "Community support",
    ],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹299",
    period: "/mo",
    desc: "For serious students preparing for exams.",
    features: [
      "Unlimited syllabi",
      "Unlimited AI questions",
      "Advanced flashcards & quizzes",
      "Progress analytics",
      "Priority processing",
    ],
    cta: "Go Pro",
    highlight: true,
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  async function handleDemo() {
    const id = toast.loading("Logging in to demo account...");
    try {
      const res = await authApi.login({
        username: "demo",
        password: "demo123",
      });
      login({ user: res.user, access: res.access, refresh: res.refresh });
      toast.success("Welcome to the demo!", { id });
      navigate("/dashboard");
    } catch {
      toast.error("Demo unavailable. Please sign up.", { id });
      navigate("/auth?mode=signup");
    }
  }

  return (
    <div className="min-h-screen text-foreground animated-gradient-bg">
      {/* Nav */}
      <nav className="container flex items-center justify-between py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg">StudyMate AI</span>
        </Link>
        <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition">
            Features
          </a>
          <a href="#pricing" className="hover:text-foreground transition">
            Pricing
          </a>
          <a href="#stats" className="hover:text-foreground transition">
            Why us
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild>
            <Link to="/auth?mode=signup">Start Free</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="container pt-12 md:pt-20 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs text-muted-foreground mb-6">
            <Sparkles className="h-3 w-3 text-amber-300" />
            New · Generate quizzes from any PDF in seconds
          </div>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-5xl mx-auto leading-[1.05]">
            Master your syllabus in{" "}
            <span className="gradient-text">half the time</span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your syllabus PDF and chat with it like a personal tutor.
            Generate flashcards, quizzes, and crystal-clear summaries — all
            grounded in your actual course material.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={() => navigate("/auth?mode=signup")}>
              Start Free <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={handleDemo}>
              View Demo
            </Button>
          </div>
        </motion.div>

        {/* Hero preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-16 max-w-5xl mx-auto"
        >
          <div className="glass rounded-3xl p-2">
            <div className="rounded-2xl bg-black/40 p-6 md:p-10 border border-white/[0.06]">
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
                  <div className="text-xs text-muted-foreground mb-2">
                    YOU
                  </div>
                  <div className="text-sm">
                    Explain Newton's first law in simple terms.
                  </div>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 border border-indigo-500/20 p-5">
                  <div className="text-xs text-indigo-300 mb-2">
                    STUDYMATE AI
                  </div>
                  <div className="text-sm leading-relaxed text-foreground/90">
                    An object stays at rest, or keeps moving in a straight
                    line at a constant speed, unless a force acts on it. It's
                    why a ball on a frictionless table never stops on its own.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section id="stats" className="container py-12">
        <div className="glass rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl md:text-4xl font-bold gradient-text">
                {s.value}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            Everything you need to <span className="gradient-text">ace it</span>
          </h2>
          <p className="text-muted-foreground mt-4">
            Six features designed to turn passive reading into active mastery.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="glass glass-hover rounded-2xl p-6"
            >
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-1.5">
                {f.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            Simple, student-friendly{" "}
            <span className="gradient-text">pricing</span>
          </h2>
          <p className="text-muted-foreground mt-4">
            Start free. Upgrade when you need more.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={
                p.highlight
                  ? "rounded-2xl p-[1px] bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-2xl shadow-indigo-500/20"
                  : "rounded-2xl border border-white/10"
              }
            >
              <div className="rounded-2xl bg-card p-7 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-xl">
                    {p.name}
                  </h3>
                  {p.highlight && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30 font-semibold">
                      Most Popular
                    </span>
                  )}
                </div>
                <div className="mb-2">
                  <span className="font-display text-4xl font-bold">
                    {p.price}
                  </span>
                  <span className="text-muted-foreground">{p.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{p.desc}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-foreground/90"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  size="lg"
                  variant={p.highlight ? "default" : "outline"}
                  onClick={() => navigate("/auth?mode=signup")}
                >
                  {p.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <div className="glass rounded-3xl p-10 md:p-16 text-center max-w-4xl mx-auto">
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            Ready to study <span className="gradient-text">smarter?</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Join thousands of students using StudyMate to crush their semesters.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={() => navigate("/auth?mode=signup")}>
              Get started — it's free <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={handleDemo}>
              Try the demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] mt-10">
        <div className="container py-10 grid md:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <span className="font-display font-bold">StudyMate AI</span>
            </div>
            <p className="text-muted-foreground">
              The AI study assistant for college students.
            </p>
          </div>
          <div>
            <div className="font-semibold mb-3">Product</div>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-foreground">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-foreground">
                  Pricing
                </a>
              </li>
              <li>
                <Link to="/auth" className="hover:text-foreground">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3">Resources</div>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a className="hover:text-foreground" href="#">
                  Docs
                </a>
              </li>
              <li>
                <a className="hover:text-foreground" href="#">
                  Blog
                </a>
              </li>
              <li>
                <a className="hover:text-foreground" href="#">
                  Help center
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3">Legal</div>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a className="hover:text-foreground" href="#">
                  Privacy
                </a>
              </li>
              <li>
                <a className="hover:text-foreground" href="#">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="container py-6 border-t border-white/[0.06] text-xs text-muted-foreground flex flex-col sm:flex-row justify-between gap-2">
          <div>© {new Date().getFullYear()} StudyMate AI. All rights reserved.</div>
          <div>Made for students, by students.</div>
        </div>
      </footer>
    </div>
  );
}
