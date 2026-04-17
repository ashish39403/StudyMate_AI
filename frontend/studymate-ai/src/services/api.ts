import type { User, Course, FlashcardDeck, QuizResult, ActivityItem } from '../types'

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

export const mockUser: User = {
  id: '1',
  name: 'Arjun Sharma',
  email: 'arjun@iitdelhi.ac.in',
  avatar: '',
  college: 'IIT Delhi',
  course: 'Engineering',
  semester: 5,
  plan: 'free',
  streak: 7,
  creditsUsed: 34,
  creditsTotal: 100,
}

export const mockCourses: Course[] = [
  {
    id: '1',
    name: 'Engineering Thermodynamics',
    code: 'ME301',
    semester: 5,
    progress: 68,
    color: '#6366f1',
    chapters: [
      {
        id: 'c1', title: 'Basic Concepts & Laws', number: 1, completed: true,
        summary: 'Thermodynamics deals with heat and temperature and their relation to energy and work...',
        flashcards: [
          { id: 'f1', front: 'What is the First Law of Thermodynamics?', back: 'Energy cannot be created or destroyed, only transferred or converted from one form to another. ΔU = Q - W', chapterId: 'c1', courseId: '1', difficulty: 'easy' },
          { id: 'f2', front: 'Define Entropy', back: 'A measure of disorder or randomness in a system. In any spontaneous process, entropy always increases (Second Law).', chapterId: 'c1', courseId: '1', difficulty: 'medium' },
          { id: 'f3', front: 'What is an Isothermal Process?', back: 'A thermodynamic process that occurs at constant temperature. PV = constant (Boyle\'s Law applies).', chapterId: 'c1', courseId: '1', difficulty: 'easy' },
        ],
      },
      {
        id: 'c2', title: 'Properties of Pure Substances', number: 2, completed: true,
        summary: 'Pure substances maintain fixed chemical composition throughout...',
        flashcards: [
          { id: 'f4', front: 'What is a saturated liquid?', back: 'A liquid at the temperature at which it starts to vaporize at a given pressure. Quality x = 0.', chapterId: 'c2', courseId: '1', difficulty: 'medium' },
        ],
      },
      {
        id: 'c3', title: 'Energy Analysis of Closed Systems', number: 3, completed: false,
        flashcards: [],
      },
      {
        id: 'c4', title: 'Mass & Energy Analysis of Open Systems', number: 4, completed: false,
        flashcards: [],
      },
    ],
  },
  {
    id: '2',
    name: 'Data Structures & Algorithms',
    code: 'CS201',
    semester: 5,
    progress: 45,
    color: '#10b981',
    chapters: [
      { id: 'c5', title: 'Arrays & Strings', number: 1, completed: true, flashcards: [] },
      { id: 'c6', title: 'Linked Lists', number: 2, completed: true, flashcards: [] },
      { id: 'c7', title: 'Trees & Graphs', number: 3, completed: false, flashcards: [] },
    ],
  },
  {
    id: '3',
    name: 'Digital Electronics',
    code: 'EC302',
    semester: 5,
    progress: 82,
    color: '#f59e0b',
    chapters: [
      { id: 'c8', title: 'Number Systems', number: 1, completed: true, flashcards: [] },
      { id: 'c9', title: 'Boolean Algebra', number: 2, completed: true, flashcards: [] },
    ],
  },
]

export const mockDecks: FlashcardDeck[] = [
  { id: '1', title: 'Chapter 1: Basic Concepts', courseId: '1', courseName: 'Engineering Thermodynamics', cardCount: 24, mastered: 18, lastStudied: new Date(Date.now() - 86400000).toISOString() },
  { id: '2', title: 'Chapter 2: Pure Substances', courseId: '1', courseName: 'Engineering Thermodynamics', cardCount: 15, mastered: 6, lastStudied: new Date(Date.now() - 172800000).toISOString() },
  { id: '3', title: 'Arrays & Strings', courseId: '2', courseName: 'Data Structures', cardCount: 30, mastered: 22, lastStudied: new Date(Date.now() - 3600000).toISOString() },
  { id: '4', title: 'Number Systems', courseId: '3', courseName: 'Digital Electronics', cardCount: 20, mastered: 20, lastStudied: new Date(Date.now() - 604800000).toISOString() },
]

export const mockActivity: ActivityItem[] = [
  { id: '1', type: 'quiz', description: 'Scored 80% in Engineering Thermodynamics Quiz', timestamp: new Date(Date.now() - 3600000).toISOString(), score: 80 },
  { id: '2', type: 'flashcard', description: 'Generated 24 flashcards for Chapter 1', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: '3', type: 'summary', description: 'Generated summary for DSA Chapter 2', timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: '4', type: 'upload', description: 'Uploaded Thermodynamics Syllabus PDF', timestamp: new Date(Date.now() - 172800000).toISOString() },
  { id: '5', type: 'quiz', description: 'Scored 65% in Digital Electronics Quiz', timestamp: new Date(Date.now() - 259200000).toISOString(), score: 65 },
]

export const mockQuizResults: QuizResult[] = [
  { id: '1', courseId: '1', chapterId: 'c1', score: 8, total: 10, date: new Date(Date.now() - 3600000).toISOString(), topic: 'Basic Concepts' },
  { id: '2', courseId: '3', chapterId: 'c8', score: 7, total: 10, date: new Date(Date.now() - 259200000).toISOString(), topic: 'Digital Electronics' },
]

// API service functions
export const authService = {
  login: async (email: string, _password: string): Promise<User> => {
    await delay(800)
    return { ...mockUser, email }
  },
  signup: async (email: string, name: string, _password: string): Promise<User> => {
    await delay(1000)
    return { ...mockUser, email, name }
  },
}

export const courseService = {
  getCourses: async (): Promise<Course[]> => {
    await delay(600)
    return mockCourses
  },
  getCourse: async (id: string): Promise<Course | undefined> => {
    await delay(400)
    return mockCourses.find(c => c.id === id)
  },
}

export const flashcardService = {
  getDecks: async (): Promise<FlashcardDeck[]> => {
    await delay(500)
    return mockDecks
  },
  generateFlashcards: async (chapterId: string): Promise<void> => {
    await delay(2000)
    console.log('Generated flashcards for', chapterId)
  },
}

export const activityService = {
  getActivity: async (): Promise<ActivityItem[]> => {
    await delay(400)
    return mockActivity
  },
}

export const chatService = {
  sendMessage: async (message: string, context?: string): Promise<string> => {
    await delay(1200)
    const responses = [
      `Great question about "${message}"! Based on the chapter content, here's what you need to know: The key concepts involve understanding the fundamental principles and their applications in real-world scenarios.`,
      `Let me explain this clearly. ${context ? `In the context of ${context}, ` : ''}the answer involves multiple interconnected concepts that build upon each other.`,
      `Here are 5 MCQs based on your question:\n1. What is the primary principle? (A) First Law (B) Second Law ✓ (C) Third Law (D) Zeroth Law\n2. Which process is reversible?...`,
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  },
}
