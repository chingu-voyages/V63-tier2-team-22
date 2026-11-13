// Shared concert type + helpers — lives in src/types/concert.ts

export type Concert = {
  id: number;
  name: string;
  date: string; // "YYYY-MM-DD" (from <input type="date">)
  time: string; // "HH:MM" 24h (from <input type="time">)
  location: string;
  description: string;
  expectedAttendance: number;
  image?: string;
};

// What the form edits (no id yet when creating)
export type ConcertFormValues = Omit<Concert, "id" | "image">;

export function formatDate(date: string): string {
  if (!date) return "";
  return new Date(`${date}T00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(time: string): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}