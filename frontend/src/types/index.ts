export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface ExtendedProfile {
  id: number;
  username: string;
  email: string;
  college: string | null;
  semester: number | null;
  course: string | null;
  avatar: string | null;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
  message?: string;
}

export type SyllabusStatus = "pending" | "processing" | "completed" | "failed";

export interface Syllabus {
  progress: number;
  status: string;
  id: number;
  title: string;
  file_url?: string;
  is_processed: boolean;
  extracted_text?: string;
  processing_status: SyllabusStatus | string;
  uploaded_at: string;
}

export interface ChatSource {
  content: string;
  metadata?: Record<string, unknown>;
}

export interface ChatResponse {
  question: string;
  syllabus_title: string;
  answer: string;
  sources: ChatSource[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
  sources?: ChatSource[];
  createdAt: number;
}

export interface ApiErrorShape {
  error?: string;
  detail?: string;
  [key: string]: unknown;
}
