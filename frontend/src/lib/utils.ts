import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function getInitials(first?: string, last?: string, username?: string) {
  const f = (first || "").trim();
  const l = (last || "").trim();
  if (f || l) return `${f[0] || ""}${l[0] || ""}`.toUpperCase();
  return (username || "U").slice(0, 2).toUpperCase();
}
