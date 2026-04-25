import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen, ClipboardList, Flame, Layers, Loader2,
  MessageSquare, Plus, Sparkles, Trash2, TrendingUp,
  Upload, AlertCircle, CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { syllabusApi, extractApiError, api } from "@/services/api";
import { ChatModal } from "@/components/chat/ChatModal";
import { useAuthStore } from "@/store/authStore";
import { formatDate} from "@/lib/utils";
import type { Syllabus } from "@/types";

export function DashboardPage() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [chatTarget, setChatTarget] = useState<Syllabus | null>(null);

  // 🔥 REAL PROFILE DATA
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get("/profile/extended/").then(r => r.data),
    enabled: !!user,
  });

  // 🔥 REAL-TIME SYLLABI DATA (auto-refresh every 3s while processing)
  const syllabiQuery = useQuery({
    queryKey: ["syllabi"],
    queryFn: syllabusApi.list,
    refetchInterval: (query) => {
      const data = query.state.data as Syllabus[] | undefined;
      const hasProcessing = data?.some(
        (s) => !(s.is_processed || s.status === "completed")
      );
      return hasProcessing ? 3000 : false;
    },
  });

  const uploadMut = useMutation({
    mutationFn: ({ title, file }: { title: string; file: File }) =>
      syllabusApi.upload(title, file),
    onSuccess: () => {
      toast.success("Syllabus uploaded! Processing in background...");
      qc.invalidateQueries({ queryKey: ["syllabi"] });
    },
    onError: (e) => toast.error(extractApiError(e, "Upload failed")),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => syllabusApi.remove(id),
    onSuccess: () => {
      toast.success("Syllabus deleted");
      qc.invalidateQueries({ queryKey: ["syllabi"] });
    },
    onError: (e) => toast.error(extractApiError(e, "Delete failed")),
  });

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    uploadMut.mutate({
      title: f.name.replace(/\.pdf$/i, ""),
      file: f,
    });
    e.target.value = "";
  }

  const syllabi = syllabiQuery.data ?? [];
  const readySyllabi = syllabi.filter(s => s.is_processed || s.status === "completed");
  const processingSyllabi = syllabi.filter(s => !s.is_processed && s.status !== "completed" && s.status !== "failed");
  const failedSyllabi = syllabi.filter(s => s.status === "failed");

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-0 pb-20 sm:pb-0">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">
            Hey {user?.first_name || user?.username || "there"} 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {profile?.college 
              ? `${profile.college} · Semester ${profile.semester} · ${profile.course}`
              : "Complete your profile in settings"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploadMut.isPending}>
            {uploadMut.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Upload Syllabus
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={onPickFile}
          className="hidden"
        />
      </div>

      {/* 🔥 REAL STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={BookOpen}
          label="Total Syllabi"
          value={String(syllabi.length)}
          tone="from-sky-500/20 to-cyan-500/10 text-sky-300"
        />
        <StatCard
          icon={CheckCircle}
          label="Ready"
          value={String(readySyllabi.length)}
          tone="from-emerald-500/20 to-teal-500/10 text-emerald-300"
        />
        <StatCard
          icon={Loader2}
          label="Processing"
          value={String(processingSyllabi.length)}
          tone="from-amber-500/20 to-orange-500/10 text-amber-300"
        />
        <StatCard
          icon={AlertCircle}
          label="Failed"
          value={String(failedSyllabi.length)}
          tone="from-red-500/20 to-rose-500/10 text-red-300"
        />
      </div>

      {/* PROCESSING QUEUE */}
      {processingSyllabi.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Loader2 className="h-4 w-4 text-amber-400 animate-spin" />
              <h3 className="font-display font-semibold text-amber-400">
                Processing ({processingSyllabi.length})
              </h3>
              <span className="text-xs text-muted-foreground ml-auto">
                Auto-refreshing...
              </span>
            </div>
            <div className="space-y-2">
              {processingSyllabi.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg bg-black/20">
                  <Loader2 className="h-4 w-4 text-amber-400 animate-spin shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.title}</p>
                    <Progress value={s.progress || 30} className="h-1 mt-1" />
                  </div>
                  <span className="text-xs text-muted-foreground">{s.progress || 0}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* MAIN CONTENT */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* SYLLABI LIST */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-semibold">Your Syllabi</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {readySyllabi.length} ready · {processingSyllabi.length} processing
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMut.isPending}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">New</span>
              </Button>
            </div>

            {syllabiQuery.isLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : syllabiQuery.isError ? (
              <ErrorState message={extractApiError(syllabiQuery.error)} onRetry={() => syllabiQuery.refetch()} />
            ) : syllabi.length === 0 ? (
              <EmptyState onUpload={() => fileInputRef.current?.click()} />
            ) : (
              <div className="space-y-2">
                {syllabi.map((s) => (
                  <SyllabusRow
                    key={s.id}
                    syllabus={s}
                    onChat={() => setChatTarget(s)}
                    onDelete={() => {
                      if (confirm(`Delete "${s.title}"?`)) deleteMut.mutate(s.id);
                    }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* QUICK ACTIONS */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-display text-base sm:text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <QuickAction icon={Upload} label="Upload" onClick={() => fileInputRef.current?.click()} />
                <QuickAction icon={ClipboardList} label="Quiz" onClick={() => toast.info("Coming soon!")} />
                <QuickAction icon={Layers} label="Flashcards" href="/flashcards" />
                <QuickAction
                  icon={MessageSquare}
                  label="Ask AI"
                  onClick={() => {
                    const ready = syllabi.find((s) => s.is_processed);
                    if (ready) setChatTarget(ready);
                    else toast.info("No processed syllabus yet");
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* RECENT ACTIVITY */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-display text-base sm:text-lg font-semibold mb-4">Recent Activity</h3>
              <ul className="space-y-3 text-sm">
                {syllabi.slice(0, 5).map((s) => (
                  <ActivityItem
                      key={s.id}
                      icon={s.is_processed ? CheckCircle : Loader2}
                      text={s.is_processed ? `"${s.title}" ready for chat` : `"${s.title}" processing`}
                      time={formatDate(s.uploaded_at)}
                  />
                ))}
                {syllabi.length === 0 && (
                  <li className="text-muted-foreground text-center py-4">
                    No activity yet. Upload your first syllabus!
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MOBILE FAB */}
      <div className="fixed bottom-6 right-6 sm:hidden z-40">
        <Button
          size="lg"
          className="rounded-2xl shadow-lg shadow-indigo-500/30 h-14 w-14"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-5 w-5" />
        </Button>
      </div>

      <ChatModal
        open={!!chatTarget}
        onOpenChange={(v) => !v && setChatTarget(null)}
        syllabusId={chatTarget?.id ?? null}
        syllabusTitle={chatTarget?.title}
      />
    </div>
  );
}

// ─────────────────────────────────────
// SUB COMPONENTS
// ─────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <Card>
      <CardContent className="p-3 sm:p-5">
        <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br ${tone} flex items-center justify-center mb-2 sm:mb-3 ring-1 ring-inset ring-white/10`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className="font-display text-xl sm:text-2xl font-bold mt-0.5">{value}</div>
      </CardContent>
    </Card>
  );
}

function SyllabusRow({
  syllabus,
  onChat,
  onDelete,
}: {
  syllabus: Syllabus;
  onChat: () => void;
  onDelete: () => void;
}) {
  const isProcessed = syllabus.is_processed || syllabus.status === "completed";
  const isFailed = syllabus.status === "failed";
  const progress = syllabus.progress || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl border border-white/[0.06] hover:bg-white/[0.03] transition group"
    >
      <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center shrink-0 ${
        isProcessed ? 'bg-gradient-to-br from-emerald-500/30 to-teal-500/20' :
        isFailed ? 'bg-red-500/20' :
        'bg-gradient-to-br from-amber-500/30 to-orange-500/20'
      }`}>
        {isProcessed ? (
          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-300" />
        ) : isFailed ? (
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-300" />
        ) : (
          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-amber-300 animate-spin" />
        )}
      </div>

      <Link to={`/course/${syllabus.id}`} className="flex-1 min-w-0">
        <div className="font-medium text-sm sm:text-base truncate group-hover:text-indigo-300 transition">
          {syllabus.title}
        </div>
        <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
          {formatDate(syllabus.uploaded_at)}
        </div>
        {!isProcessed && !isFailed && (
          <Progress value={Math.max(progress, 10)} className="h-1 mt-1" />
        )}
      </Link>

      <StatusBadge status={isProcessed ? "ready" : isFailed ? "failed" : "processing"} progress={progress} />

      <div className="hidden sm:flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onChat} disabled={!isProcessed} title={isProcessed ? "Ask AI" : "Still processing"}>
          <Sparkles className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onDelete} title="Delete" className="hover:text-red-300">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status, progress }: { status: string; progress?: number }) {
  if (status === "ready" || status === "completed") {
    return <Badge variant="success" className="text-[10px] sm:text-xs">Ready</Badge>;
  }
  if (status === "failed") {
    return <Badge variant="destructive" className="text-[10px] sm:text-xs">Failed</Badge>;
  }
  return (
    <Badge variant="warning" className="text-[10px] sm:text-xs">
      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
      {progress || 0}%
    </Badge>
  );
}

function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="text-center py-8 sm:py-12 px-4 sm:px-6 rounded-xl border border-dashed border-white/10">
      <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-muted-foreground mb-3" />
      <h3 className="font-display font-semibold text-base sm:text-lg mb-1">No syllabi yet</h3>
      <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-5">
        Upload your first PDF to start chatting with AI.
      </p>
      <Button onClick={onUpload} size="sm">
        <Upload className="h-4 w-4 mr-2" /> Upload Syllabus
      </Button>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="text-center py-8 sm:py-10 px-4 sm:px-6 rounded-xl border border-red-500/20 bg-red-500/5">
      <AlertCircle className="h-8 w-8 mx-auto text-red-300 mb-2" />
      <p className="text-xs sm:text-sm text-red-200 mb-3">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>Try again</Button>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  href?: string;
}) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/10 transition cursor-pointer text-center">
      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-300" />
      <span className="text-[10px] sm:text-xs font-medium">{label}</span>
    </div>
  );
  return href ? <Link to={href}>{content}</Link> : <button onClick={onClick} className="w-full">{content}</button>;
}

function ActivityItem({
  icon: Icon,
  text,
  time,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  time: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <div className="h-7 w-7 rounded-md bg-white/[0.04] flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-foreground/90 line-clamp-2">{text}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{time}</div>
      </div>
    </li>
  );
}