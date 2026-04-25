import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Github,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authApi, extractApiError } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

const loginSchema = z.object({
  username: z.string().min(1, "Username or email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Enter a valid email"),
    first_name: z.string().min(1, "Required"),
    last_name: z.string().min(1, "Required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    password2: z.string().min(6, "Confirm your password"),
  })
  .refine((d) => d.password === d.password2, {
    message: "Passwords don't match",
    path: ["password2"],
  });

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

export function AuthPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const mode = params.get("mode") === "signup" ? "signup" : "login";
  const login = useAuthStore((s) => s.login);

  function setMode(m: "login" | "signup") {
    if (m === "signup") setParams({ mode: "signup" });
    else setParams({});
  }

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      password: "",
      password2: "",
    },
  });

  const loginMut = useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      login({ user: res.user, access: res.access, refresh: res.refresh });
      toast.success(res.message || "Welcome back!");
      navigate("/dashboard");
    },
    onError: (err) => toast.error(extractApiError(err, "Invalid credentials")),
  });

  const signupMut = useMutation({
    mutationFn: authApi.register,
    onSuccess: (res) => {
      login({ user: res.user, access: res.access, refresh: res.refresh });
      toast.success(res.message || "Account created!");
      navigate("/onboarding");
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Signup failed. Try again.")),
  });

  async function handleDemo() {
    const id = toast.loading("Signing in to demo...");
    try {
      const res = await authApi.login({
        username: "demo",
        password: "demo123",
      });
      login({ user: res.user, access: res.access, refresh: res.refresh });
      toast.success("Welcome to the demo!", { id });
      navigate("/dashboard");
    } catch (e) {
      toast.error(extractApiError(e, "Demo unavailable"), { id });
    }
  }

  useEffect(() => {
    document.title =
      mode === "signup" ? "Sign up — StudyMate AI" : "Sign in — StudyMate AI";
  }, [mode]);

  return (
    <div className="min-h-screen grid lg:grid-cols-2 animated-gradient-bg">
      {/* Left branding */}
      <div className="hidden lg:flex flex-col justify-between p-10 border-r border-white/[0.06] relative overflow-hidden">
        <Link to="/" className="flex items-center gap-2 relative z-10">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg">StudyMate AI</span>
        </Link>

        <div className="relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl xl:text-5xl font-bold leading-tight"
          >
            Your syllabus,{" "}
            <span className="gradient-text">finally readable.</span>
          </motion.h2>
          <p className="mt-4 text-muted-foreground max-w-md">
            Join 12,000+ students who turned dense PDFs into clear answers,
            flashcards, and quizzes.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
            {[
              { v: "12k+", l: "Students" },
              { v: "500k", l: "Flashcards" },
              { v: "98%", l: "Pass rate" },
            ].map((s) => (
              <div
                key={s.l}
                className="glass rounded-xl p-4 text-center"
              >
                <div className="font-display font-bold text-xl gradient-text">
                  {s.v}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground relative z-10">
          “StudyMate cut my prep time in half before finals.” — Aanya, IIT Delhi
        </div>
      </div>

      {/* Right form */}
      <div className="flex flex-col p-6 md:p-10">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to home
          </Link>
          <Button variant="outline" size="sm" onClick={handleDemo}>
            <Sparkles className="h-4 w-4" /> Try Demo
          </Button>
        </div>

        <div className="w-full max-w-md mx-auto my-auto">
          <h1 className="font-display text-3xl font-bold mb-2">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === "signup"
              ? "Start mastering your syllabus in minutes."
              : "Sign in to continue your study streak."}
          </p>

          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as "login" | "signup")}
          >
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form
                onSubmit={loginForm.handleSubmit((v) => loginMut.mutate(v))}
                className="space-y-4 mt-2"
              >
                <FieldRow
                  label="Username"
                  error={loginForm.formState.errors.username?.message}
                >
                  <Input
                    autoComplete="username"
                    placeholder="your_username"
                    {...loginForm.register("username")}
                  />
                </FieldRow>
                <FieldRow
                  label={
                    <div className="flex items-center justify-between w-full">
                      <span>Password</span>
                      <a
                        href="#"
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Forgot password?
                      </a>
                    </div>
                  }
                  error={loginForm.formState.errors.password?.message}
                >
                  <Input
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    {...loginForm.register("password")}
                  />
                </FieldRow>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loginMut.isPending}
                >
                  {loginMut.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form
                onSubmit={signupForm.handleSubmit((v) => signupMut.mutate(v))}
                className="space-y-4 mt-2"
              >
                <div className="grid grid-cols-2 gap-3">
                  <FieldRow
                    label="First name"
                    error={signupForm.formState.errors.first_name?.message}
                  >
                    <Input
                      placeholder="Aanya"
                      {...signupForm.register("first_name")}
                    />
                  </FieldRow>
                  <FieldRow
                    label="Last name"
                    error={signupForm.formState.errors.last_name?.message}
                  >
                    <Input
                      placeholder="Sharma"
                      {...signupForm.register("last_name")}
                    />
                  </FieldRow>
                </div>
                <FieldRow
                  label="Username"
                  error={signupForm.formState.errors.username?.message}
                >
                  <Input
                    placeholder="aanya_s"
                    {...signupForm.register("username")}
                  />
                </FieldRow>
                <FieldRow
                  label="Email"
                  error={signupForm.formState.errors.email?.message}
                >
                  <Input
                    type="email"
                    placeholder="you@college.edu"
                    {...signupForm.register("email")}
                  />
                </FieldRow>
                <FieldRow
                  label="Password"
                  error={signupForm.formState.errors.password?.message}
                >
                  <Input
                    type="password"
                    placeholder="At least 8 characters"
                    {...signupForm.register("password")}
                  />
                </FieldRow>
                <FieldRow
                  label="Confirm password"
                  error={signupForm.formState.errors.password2?.message}
                >
                  <Input
                    type="password"
                    placeholder="Re-enter password"
                    {...signupForm.register("password2")}
                  />
                </FieldRow>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={signupMut.isPending}
                >
                  {signupMut.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Creating
                      account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-white/10" />
            OR CONTINUE WITH
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => toast.info("Coming soon")}>
              <GoogleIcon /> Google
            </Button>
            <Button variant="outline" onClick={() => toast.info("Coming soon")}>
              <Github className="h-4 w-4" /> GitHub
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            By continuing you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

function FieldRow({
  label,
  error,
  children,
}: {
  label: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.084 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}
