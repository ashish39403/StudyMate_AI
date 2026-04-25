import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, User as UserIcon, ChevronDown, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { aiApi, extractApiError, api } from "@/services/api";
import type { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";

const SUGGESTED = [
  "Summarize this syllabus",
  "Give me 5 MCQs",
  "Explain like I'm 5",
  "Make a study plan for 7 days",
];

export function ChatModal({
  open,
  onOpenChange,
  syllabusId,
  syllabusTitle,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  syllabusId: number | null;
  syllabusTitle?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [showSourcesFor, setShowSourcesFor] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // 🆕 LOAD CHAT HISTORY FROM BACKEND
  const { data: historyData } = useQuery({
    queryKey: ["chat-history", syllabusId],
    queryFn: () => api.get(`/ai/chat/history/${syllabusId}/`).then(r => r.data),
    enabled: !!(open && syllabusId),
  });

  // 🆕 Set history when loaded
  useEffect(() => {
    if (historyData && Array.isArray(historyData)) {
      const loaded = historyData.map((msg: any) => ({
        id: crypto.randomUUID(),
        role: msg.role,
        content: msg.content,
        createdAt: new Date(msg.created_at || Date.now()).getTime(),
        sources: msg.sources || [],
      }));
      setMessages(loaded);
    } else if (open) {
      setMessages([]);
    }
  }, [historyData, open]);

  // Reset on syllabus change
  useEffect(() => {
    if (open) {
      setInput("");
      setShowSourcesFor({});
    }
  }, [open, syllabusId]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const chat = useMutation({
    mutationFn: (q: string) => aiApi.chat(syllabusId!, q),
    onSuccess: (data, question) => {
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== "pending"),
        {
          id: crypto.randomUUID(),
          role: "user",
          content: question,
          createdAt: Date.now() - 1,
        },
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.answer,
          sources: data.sources,
          createdAt: Date.now(),
        },
      ]);
    },
    onError: (err, question) => {
      const msg = extractApiError(err, "Failed to get an answer");
      toast.error(msg);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== "pending"),
        {
          id: crypto.randomUUID(),
          role: "user",
          content: question,
          createdAt: Date.now() - 1,
        },
        {
          id: crypto.randomUUID(),
          role: "error",
          content: msg,
          createdAt: Date.now(),
        },
      ]);
    },
  });

  function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q || !syllabusId || chat.isPending) return;
    setInput("");
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: q,
        createdAt: Date.now(),
      },
      {
        id: "pending",
        role: "assistant",
        content: "",
        createdAt: Date.now(),
      },
    ]);
    chat.mutate(q);
  }

  // 🆕 Clear history
  const handleClear = () => {
    if (confirm("Clear chat history?")) {
      api.delete(`/chat/history/${syllabusId}/`).then(() => {
        setMessages([]);
        toast.success("Chat cleared");
      }).catch(() => {
        // Fallback: just clear locally
        setMessages([]);
        toast.success("Chat cleared locally");
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="border-b border-white/10 px-5 py-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span>Ask AI · {syllabusTitle || "Your Syllabus"}</span>
            </div>
            {/* 🆕 Clear button */}
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="h-8 w-8 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground mt-8">
              <Bot className="h-10 w-10 mx-auto mb-3 text-indigo-400" />
              <p className="text-sm">
                Ask anything about your syllabus — concepts, summaries, MCQs.
              </p>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages
              .filter((m) => m.id !== "pending")
              .map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "flex gap-3",
                    m.role === "user" && "flex-row-reverse",
                  )}
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-lg shrink-0 flex items-center justify-center",
                      m.role === "user"
                        ? "bg-white/[0.06]"
                        : m.role === "error"
                          ? "bg-red-500/15"
                          : "bg-gradient-to-br from-indigo-500 to-fuchsia-500",
                    )}
                  >
                    {m.role === "user" ? (
                      <UserIcon className="h-4 w-4" />
                    ) : (
                      <Bot
                        className={cn(
                          "h-4 w-4",
                          m.role === "error" ? "text-red-300" : "text-white",
                        )}
                      />
                    )}
                  </div>
                  <div className="max-w-[80%] space-y-2">
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : m.role === "error"
                            ? "bg-red-500/10 text-red-200 border border-red-500/30"
                            : "bg-white/[0.04] border border-white/10",
                      )}
                    >
                      {m.content}
                    </div>
                    {m.role === "assistant" && m.sources && m.sources.length > 0 && (
                      <div>
                        <button
                          onClick={() =>
                            setShowSourcesFor((s) => ({
                              ...s,
                              [m.id]: !s[m.id],
                            }))
                          }
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
                        >
                          <ChevronDown
                            className={cn(
                              "h-3 w-3 transition-transform",
                              showSourcesFor[m.id] && "rotate-180",
                            )}
                          />
                          {m.sources.length} source
                          {m.sources.length === 1 ? "" : "s"}
                        </button>
                        {showSourcesFor[m.id] && (
                          <div className="mt-2 space-y-2">
                            {m.sources.map((s, idx) => (
                              <div
                                key={idx}
                                className="text-xs p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-muted-foreground"
                              >
                                {s.content}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>

          {chat.isPending && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg shrink-0 bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-white/[0.04] border border-white/10">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          )}
        </div>

        {messages.length === 0 && (
          <div className="px-5 pb-2 flex flex-wrap gap-2">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={!syllabusId || chat.isPending}
                className="text-xs px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="border-t border-white/10 p-4 flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask anything about your syllabus..."
            className="resize-none min-h-[44px] max-h-32"
            disabled={chat.isPending || !syllabusId}
          />
          <Button
            onClick={() => send()}
            disabled={!input.trim() || chat.isPending || !syllabusId}
            size="icon"
            className="h-11 w-11 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}