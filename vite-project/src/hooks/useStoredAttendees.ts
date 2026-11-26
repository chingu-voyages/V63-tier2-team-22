import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";

import {
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from "firebase/auth";

import { auth, db } from "../firebase/config";
import type { Attendee } from "../assets/components/AttendeeForm";

export function useStoredAttendees() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Authenticate Firebase user
  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!active) return;

      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        setAttendees([]);

        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.error("Firebase authentication error:", err);

          if (active) {
            setError("Unable to authenticate with Firebase.");
            setLoading(false);
          }
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  // Retrieve attendees from Firestore
  useEffect(() => {
    if (!user) return;

    setAttendees([]);
    setLoading(true);

    const attendeesRef = collection(db, "users", user.uid, "attendees");

    const unsubscribe = onSnapshot(
      attendeesRef,
      (snapshot) => {
        const savedAttendees: Attendee[] = snapshot.docs.map((item) => ({
          ...(item.data() as Omit<Attendee, "id">),
          id: item.id,
        }));

        setAttendees(savedAttendees);
        setError("");
        setLoading(false);
      },
      (err) => {
        console.error("Error loading attendees:", err);
        setError("Unable to load attendees.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  return { attendees, user, loading, error };
}
