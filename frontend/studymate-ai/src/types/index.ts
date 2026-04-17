export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  college?: string
  course?: string
  semester?: number
  plan: 'free' | 'pro'
  streak: number
  creditsUsed: number
  creditsTotal: number
}

export interface Course {
  id: string
  name: string
  code: string
  semester: number
  progress: number
  chapters: Chapter[]
  color: string
}

export interface Chapter {
  id: string
  title: string
  number: number
  summary?: string
  flashcards: Flashcard[]
  completed: boolean
}

export interface Flashcard {
  id: string
  front: string
  back: string
  chapterId: string
  courseId: string
  difficulty: 'easy' | 'medium' | 'hard'
  lastReviewed?: string
}

export interface FlashcardDeck {
  id: string
  title: string
  courseId: string
  courseName: string
  cardCount: number
  lastStudied?: string
  mastered: number
}

export interface QuizResult {
  id: string
  courseId: string
  chapterId: string
  score: number
  total: number
  date: string
  topic: string
}

export interface ActivityItem {
  id: string
  type: 'flashcard' | 'quiz' | 'summary' | 'upload'
  description: string
  timestamp: string
  score?: number
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}
