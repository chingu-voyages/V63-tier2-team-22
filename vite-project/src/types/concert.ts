// Shared concert type + helpers — lives in src/types/concert.ts

// Where a concert came from:
// - "user":         created in the app with the Create Event form
// - "live":         a real event from the live concerts API (SeatGeek)
// - "sample":       placeholder data (past events / offline fallback)
export type ConcertSource = "user" | "live" | "sample";

export type Concert = {
  id: number | string; // live API ids are strings
  source: ConcertSource;
  name: string;
  date: string; // "YYYY-MM-DD" (from <input type="date">)
  time: string; // "HH:MM" 24h (from <input type="time">); "" if not announced
  location: string;
  description: string;
  expectedAttendance: number; // 0 = unknown (the live API doesn't provide it)
  ticketPrice?: number; // USD; 0 = free; undefined = unknown
  image?: string;
  artist?: string; // headliner, used to look up a photo
  genre?: string;
  url?: string; // where to buy tickets (live events)
  actualAttendance?: number; // filled in after the event happens
  createdAt?: number; // set on user-created concerts
};

// What the form edits
export type ConcertFormValues = {
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  expectedAttendance: number;
  ticketPrice: number;
  genre: string;
};

// Choices for the Genre field in the Create / Edit form
export const GENRES = [
  "Pop",
  "Rock",
  "Hip-Hop",
  "R&B",
  "Country",
  "EDM",
  "Jazz",
  "Classical",
  "Indie",
  "Metal",
  "Latin",
  "Folk",
  "Other",
];

// Only concerts the user made can be edited
export const isEditable = (c: Concert) => c.source !== "live";

export function formatPrice(price: number | undefined): string {
  if (price === undefined || Number.isNaN(price)) return "See prices";
  if (price === 0) return "Free";
  return price.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function formatDate(date: string): string {
  if (!date) return "";
  return new Date(`${date}T00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(time: string): string {
  if (!time) return "Time TBA";
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

// Local "today" as YYYY-MM-DD (toISOString would use UTC and flip early in the evening)
export function todayISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// User-created concerts first (newest created on top), then everything else by date
export function sortUpcoming(list: Concert[]): Concert[] {
  return [...list].sort((a, b) => {
    const aUser = a.source === "user";
    const bUser = b.source === "user";
    if (aUser !== bUser) return aUser ? -1 : 1;
    if (aUser && bUser) return (b.createdAt ?? 0) - (a.createdAt ?? 0);
    return `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`);
  });
}
