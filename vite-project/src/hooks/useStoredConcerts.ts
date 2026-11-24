// Concerts the user creates (or edits) are stored in Firestore under
// users/{uid}/concerts — same per-user layout as the Attendees page.
import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";

import { auth, db } from "../firebase/config";
import type { Concert } from "../types/concert";

export type StoredConcertsStatus = "loading" | "ready" | "error";

// Firestore rejects `undefined` field values, so drop them before writing
function withoutUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

// Everyone (guests included) can read; App.tsx decides who is allowed to save.
export function useStoredConcerts() {
  const [user, setUser] = useState<User | null>(null);
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [status, setStatus] = useState<StoredConcertsStatus>("loading");
  const [error, setError] = useState("");

  // Sign in anonymously so each browser gets its own concerts
  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        signInAnonymously(auth).catch((err) => {
          console.error("Firebase authentication error:", err);
          setError("Unable to connect to the database.");
          setStatus("error");
        });
      }
    });
  }, []);

  // Keep the list in sync with Firestore in real time
  useEffect(() => {
    if (!user) return;

    const concertsRef = collection(db, "users", user.uid, "concerts");
    return onSnapshot(
      concertsRef,
      (snapshot) => {
        setConcerts(
          snapshot.docs.map((d) => ({ ...(d.data() as Omit<Concert, "id">), id: d.id })),
        );
        setError("");
        setStatus("ready");
      },
      (err) => {
        console.error("Error loading concerts:", err);
        setError("Unable to load your saved concerts.");
        setStatus("error");
      },
    );
  }, [user]);

  // Create (no id) or overwrite (existing id) a concert
  const saveConcert = async (concert: Omit<Concert, "id"> & { id?: Concert["id"] }) => {
    if (!user) throw new Error("Not connected to the database yet. Try again in a moment.");

    const concertsRef = collection(db, "users", user.uid, "concerts");
    const ref = concert.id !== undefined ? doc(concertsRef, String(concert.id)) : doc(concertsRef);
    // The id is the document key, not a stored field
    await setDoc(ref, withoutUndefined({ ...concert, id: undefined }));
  };

  return { concerts, status, error, saveConcert };
}
