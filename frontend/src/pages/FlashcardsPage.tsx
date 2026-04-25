import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  Loader2,
  Plus,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { syllabusApi, aiApi, extractApiError } from "@/services/api";
import type { Syllabus } from "@/types";

export function FlashcardsPage() {
  const [activeDeck, setActiveDeck] = useState<any>(null);
  const [generatedCards, setGeneratedCards] = useState<any[]>([]);

  // ✅ Fetch real syllabi
  const { data: syllabi, isLoading } = useQuery({
    queryKey: ["syllabi"],
    queryFn: syllabusApi.list,
    select: (data) => data.filter((s) => s.is_processed),
  });

  // Generate flashcards from syllabus
  const generateMut = useMutation({
    mutationFn: (syllabusId: number) =>
      aiApi.chat(syllabusId, "Generate 5 flashcards as Q&A pairs from this syllabus"),
    onSuccess: (data) => {
      // Parse response into cards (simple split by Q: and A:)
      const cards = parseFlashcards(data.answer);
      setGeneratedCards(cards);
      setActiveDeck({
        title: "Generated Flashcards",
        cards: cards,
      });
      toast.success(`${cards.length} flashcards generated!`);
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to generate")),
  });

  if (activeDeck) {
    return (
      <StudyMode
        deck={activeDeck}
        onExit={() => {
          setActiveDeck(null);
          setGeneratedCards([]);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Flashcards</h1>
          <p className="text-muted-foreground mt-1">
            Generate flashcards from your processed syllabi.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : !syllabi?.length ? (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center">
            <Layers className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-display font-semibold text-lg mb-1">No syllabi ready</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload and process a syllabus first.
            </p>
            <Button onClick={() => window.location.href = "/dashboard"}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {syllabi.map((s) => (
            <Card
              key={s.id}
              className="cursor-pointer transition hover:bg-white/[0.04]"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="success">Ready</Badge>
                  <Layers className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-1">
                  {s.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Generate flashcards from this syllabus
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => generateMut.mutate(s.id)}
                  disabled={generateMut.isPending}
                >
                  {generateMut.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" /> Generate Flashcards
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Simple flashcard parser from AI response
function parseFlashcards(text: string) {
  const cards = [];
  const lines = text.split("\n");
  let current: any = {};

  for (const line of lines) {
    if (line.match(/^Q\d*[.:)]/i) || line.toLowerCase().startsWith("q:")) {
      current = { q: line.replace(/^Q\d*[.:)]\s*/i, "").trim() };
    } else if (line.match(/^A\d*[.:)]/i) || line.toLowerCase().startsWith("a:")) {
      current.a = line.replace(/^A\d*[.:)]\s*/i, "").trim();
      if (current.q && current.a) {
        cards.push({ ...current });
        current = {};
      }
    }
  }
  return cards.length > 0 ? cards : [{ q: "Sample Q", a: "Sample A" }];
}

function StudyMode({
  deck,
  onExit,
}: {
  deck: { title: string; cards: { q: string; a: string }[] };
  onExit: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = deck.cards[idx];
  function next() {
    setFlipped(false);
    setIdx((i) => (i + 1) % deck.cards.length);
  }
  function prev() {
    setFlipped(false);
    setIdx((i) => (i - 1 + deck.cards.length) % deck.cards.length);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onExit}
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> All decks
          </button>
          <h2 className="font-display text-2xl font-bold mt-1">{deck.title}</h2>
        </div>
        <Badge variant="secondary">
          {idx + 1} / {deck.cards.length}
        </Badge>
      </div>

      <div className="max-w-2xl mx-auto">
        <motion.div
          key={card.q}
          onClick={() => setFlipped((f) => !f)}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5 }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative w-full aspect-[3/2] cursor-pointer"
        >
          <Card className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
            <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center">
              <span className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Question</span>
              <p className="font-display text-2xl font-semibold">{card.q}</p>
              <span className="text-xs text-muted-foreground mt-6">Tap to flip</span>
            </CardContent>
          </Card>
          <Card
            className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-fuchsia-600/20"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center">
              <span className="text-xs text-indigo-300 uppercase tracking-widest mb-4">Answer</span>
              <p className="text-lg leading-relaxed">{card.a}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" onClick={prev}>
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        <Button variant="outline" onClick={() => setFlipped((f) => !f)}>
          <RotateCcw className="h-4 w-4" /> Flip
        </Button>
        <Button onClick={next}>
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}