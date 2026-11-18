
import { useState } from "react";
import { signInAnonymously } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebase/config";

export default function FirebaseTest() {
  const [message, setMessage] = useState("");

  const testConnection = async () => {
    setMessage("Testing Firebase connection...");

    try {
      // Sign in as a guest if not already authenticated
      const user =
        auth.currentUser ??
        (await signInAnonymously(auth)).user;

      // Access this guest's attendees collection
      const attendeesRef = collection(
        db,
        "users",
        user.uid,
        "attendees"
      );

      await getDocs(attendeesRef);

      setMessage("✅ Firebase connected successfully!");
    } catch (error) {
      console.error("Firebase error:", error);

      setMessage("❌ Firebase connection failed.");
    }
  };

  return (
    <div className="p-5">
      <button
        onClick={testConnection}
        className="rounded-lg bg-purple-600 px-4 py-2 text-white"
      >
        Test Firebase Connection
      </button>

      <p className="mt-3">{message}</p>
    </div>
  );
}
