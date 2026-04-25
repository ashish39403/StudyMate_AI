import axios, { AxiosError, AxiosInstance } from "axios";
import { useAuthStore } from "@/store/authStore";
import type {
  AuthResponse,
  ChatResponse,
  ExtendedProfile,
  Syllabus,
  User,
} from "@/types";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
});

// ── Request interceptor: attach JWT ────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 with refresh + queue ──────────────────
let isRefreshing = false;
let pending: Array<(token: string | null) => void> = [];

function onRefreshed(token: string | null) {
  pending.forEach((cb) => cb(token));
  pending = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as
      | (import("axios").InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const status = error.response?.status;

    if (
      status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes("/auth/")
    ) {
      const refresh = useAuthStore.getState().refreshToken;
      if (!refresh) {
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") window.location.href = "/auth";
        return Promise.reject(error);
      }
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pending.push((token) => {
            if (!token) return reject(error);
            original.headers = original.headers ?? {};
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post<{ access: string }>(
          `${BASE_URL}/token/refresh/`,  // ✅ FIXED
          { refresh },
        );
        useAuthStore.getState().setTokens(data.access);
        onRefreshed(data.access);
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch (e) {
        onRefreshed(null);
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") window.location.href = "/auth";
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ── Helpers ────────────────────────────────────────────────────────────────
export function extractApiError(err: unknown, fallback = "Something went wrong"): string {
  const e = err as AxiosError<any>;

  if (e?.response?.data) {
    const data = e.response.data;
    
    if (typeof data === "object") {
      return Object.values(data)
        .flat()
        .join(" ");
    }

    if (typeof data === "string") {
      return data;
    }
  }

  return e.message || fallback;
}

// ── Auth ───────────────────────────────────────────────────────────────────
export const authApi = {
  register: (payload: {
    username: string;
    email: string;
    password: string;
    password2: string;
    first_name: string;
    last_name: string;
  }) => api.post<AuthResponse>("/auth/register/", payload).then((r) => r.data),

  login: (payload: { username: string; password: string }) =>
    api.post<AuthResponse>("/auth/login/", payload).then((r) => r.data),

  logout: () => api.post<{ message: string }>("/auth/logout/").then((r) => r.data),

  refresh: (refresh: string) =>
    api.post<{ access: string }>("/token/refresh/", { refresh }).then((r) => r.data),  // ✅ FIXED
};

// ── Profile ────────────────────────────────────────────────────────────────
export const profileApi = {
  get: () => api.get<User>("/profile/").then((r) => r.data),
  update: (payload: Partial<Pick<User, "first_name" | "last_name">>) =>
    api.put<User>("/profile/", payload).then((r) => r.data),
  getExtended: () =>
    api.get<ExtendedProfile>("/profile/extended/").then((r) => r.data),
  updateExtended: (payload: {
    college?: string;
    semester?: number;
    course?: string;
  }) =>
    api.put<ExtendedProfile>("/profile/extended/", payload).then((r) => r.data),
};

// ── Syllabus ───────────────────────────────────────────────────────────────
export const syllabusApi = {
  list: () => api.get<Syllabus[]>("/syllabus/").then((r) => r.data),
  get: (id: number) => api.get<Syllabus>(`/syllabus/${id}/`).then((r) => r.data),
  upload: (title: string, file: File) => {
    const fd = new FormData();
    fd.append("title", title);
    fd.append("file", file);
    return api
      .post<{ message: string; syllabus: Syllabus }>("/syllabus/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
  remove: (id: number) =>
    api.delete<{ message: string }>(`/syllabus/${id}/`).then((r) => r.data),
};

// ── AI ─────────────────────────────────────────────────────────────────────
export const aiApi = {
  chat: (syllabus_id: number, question: string) =>
    api.post<ChatResponse>("/ai/chat/", { syllabus_id, question }).then((r) => r.data),
};