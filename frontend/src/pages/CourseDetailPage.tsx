import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { extractApiError, syllabusApi } from "@/services/api";
import { ChatModal } from "@/components/chat/ChatModal";
import { formatDate } from "@/lib/utils";
import type { Syllabus } from "@/types";

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const numericId = Number(id);
  const [chatOpen, setChatOpen] = useState(false);
  const query = useQuery({
    queryKey: ["syllabus", numericId],
    queryFn: () => syllabusApi.get(numericId),
    enabled: !isNaN(numericId),
    staleTime: 0, // 🆕 Always fetch fresh data
    refetchInterval: (query) => {
      const data = query.state.data as Syllabus | undefined;
      if (!data) return false;

      // Stop polling if processed or completed
      if (
        data.is_processed ||
        data.status === "completed" ||
        data.status === "ready"
      ) {
        return false;
      }
      // Stop if failed
      if (data.status === "failed") {
        return false;
      }
      // Keep polling
      return 3000;
    },
  });

  // 🆕 Force refetch on mount
  useEffect(() => {
    if (numericId) {
      query.refetch();
    }
  }, [numericId]);

  const deleteMut = useMutation({
    mutationFn: () => syllabusApi.remove(numericId),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["syllabi"] });
      navigate("/dashboard");
    },
    onError: (e) => toast.error(extractApiError(e)),
  });

  if (isNaN(numericId)) return <div>Invalid ID</div>;

  if (query.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (query.isError) return <div>Error loading</div>;

  const syllabus = query.data!;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/dashboard">
          <ArrowLeft /> Back
        </Link>
        <span>/ {syllabus.title}</span>
      </div>

      {/* MAIN CARD */}
      <Card>
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold">{syllabus.title}</h1>

          <p className="text-sm text-gray-400">
            Uploaded {formatDate(syllabus.uploaded_at)}
          </p>

          {/* 🔥 REAL PROGRESS */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>{syllabus.progress || 0}%</span>
            </div>
            <Progress value={syllabus.progress || 0} />
          </div>

          {/* STATUS */}
          <div className="mt-4">
            {syllabus.is_processed ||
            syllabus.status === "completed" ||
            syllabus.status === "ready" ? (
              <Badge variant="success">✅ Ready</Badge>
            ) : syllabus.status === "failed" ? (
              <Badge variant="destructive">❌ Failed</Badge>
            ) : (
              <Badge variant="warning">
                <Loader2 className="animate-spin h-3 w-3 mr-1" />
                Processing... {syllabus.progress ? `${syllabus.progress}%` : ""}
              </Badge>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => setChatOpen(true)}
              disabled={
                !(
                  syllabus.is_processed ||
                  syllabus.status === "completed" ||
                  syllabus.status === "ready"
                )
              }
            >
              <Sparkles /> Ask AI
            </Button>

            <Button variant="ghost" onClick={() => deleteMut.mutate()}>
              <Trash2 /> Delete
            </Button>
          </div>

          {/* PROCESSING MESSAGE */}
          {!syllabus.is_processed && (
            <div className="mt-4 text-yellow-400 text-sm">
              Processing... auto refresh every 3 sec
            </div>
          )}
        </CardContent>
      </Card>

      {/* CHAPTERS */}
      <ExtractedChapters syllabus={syllabus} />

      {/* CHAT */}
      <ChatModal
        open={chatOpen}
        onOpenChange={setChatOpen}
        syllabusId={syllabus.id}
        syllabusTitle={syllabus.title}
      />
    </div>
  );
}

/* ===================== CHAPTERS ===================== */

function ExtractedChapters({ syllabus }: { syllabus: Syllabus }) {
  const chapters = useMemo(
    () => parseChapters(syllabus.extracted_text),
    [syllabus.extracted_text],
  );

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Chapters</h2>

        {!syllabus.is_processed ? (
          <p>Waiting for processing...</p>
        ) : chapters.length === 0 ? (
          <p>No chapters found</p>
        ) : (
          chapters.map((c, i) => (
            <div key={i} className="mb-4">
              <h4 className="font-semibold">{c.title}</h4>
              <p className="text-sm text-gray-400">{c.body}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

/* ===================== PARSER ===================== */

function parseChapters(text?: string) {
  if (!text) return [];

  const size = 800;
  const result = [];

  for (let i = 0; i < text.length; i += size) {
    result.push({
      title: `Section ${result.length + 1}`,
      body: text.slice(i, i + size),
    });
  }

  return result;
}
