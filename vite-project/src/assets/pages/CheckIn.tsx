import ConcertImage from "../components/ConcertImage";
import type { Concert } from "../../types/concert";
import sampleQRCode from "../images/sample-qr-code.png";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase/config";
import type { Attendee } from "../components/AttendeeForm";
import { CircleUserRound } from "lucide-react";

// Sample concert info; this will be replaced by actual data
const sampleConcert: Concert = {
  id: "sample-1",
  source: "sample",
  name: "The Brighteners Live Tour",
  date: "2026-12-20",
  time: "20:00",
  location: "Madison Square Garden, NYC",
  description:
    "Experience The Brighteners like never before in their highly anticipated tour.",
  expectedAttendance: 18000,
  genre: "Pop",
  ticketPrice: 129,
};

function CheckIn() {
  const [checkInAttendees, setCheckInAttendees] = useState<Attendee[]>([]);
  const [uid, setUid] = useState<string | null>(null);

  // Retrieve a list of checked-in attendees from firebase
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
    });
  }, []);

  useEffect(() => {
    if (!uid) return;

    const attendeesRef = collection(db, "users", uid, "attendees");

    const checkedInQuery = query(attendeesRef, where("checkedIn", "==", true));

    return onSnapshot(checkedInQuery, (snapshot) => {
      const attendees = snapshot.docs.map((doc) => ({
        ...(doc.data() as Omit<Attendee, "id">),
        id: doc.id,
      }));

      setCheckInAttendees(attendees);
    });
  }, [uid]);

  // Format concert date
  const eventDateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <div>
      {/* Concert information */}
      <section className="flex flex-wrap bg-white m-4 gap-4 p-5 md:m-10 md:gap-5 md:p-10 rounded-2xl ">
        <ConcertImage
          concert={sampleConcert}
          className="h-30 w-40 rounded-xl"
        />
        <div className="flex flex-col gap-3">
          <h2 className="font-bold">{sampleConcert.name}</h2>
          <time dateTime={`${sampleConcert.date}T${sampleConcert.time}`}>
            {`${eventDateFormatter.format(new Date(sampleConcert.date))} • ${sampleConcert.time}`}
          </time>
          <p>{sampleConcert.location}</p>
        </div>
        <span className="ml-auto self-start bg-green-200/50 py-1 px-2 rounded-xs text-green-700">
          Live Event
        </span>
      </section>

      <div className="grid grid-cols-1 gap-5 m-4 md:m-10 md:grid-cols-2">
        {/* QR and attendee ID */}
        <section className="flex flex-col gap-10 bg-white rounded-2xl p-5">
          <h2 className="font-semibold">Scan QR Code</h2>
          <img
            alt="Sample QR Code"
            className="h-auto w-full rounded-lg mx-auto max-w-lg"
            src={sampleQRCode}
          />
          <div className="flex flex-col gap-5">
            <label htmlFor="attendee-id" className="font-semibold">
              Enter Attendee ID
            </label>
            <div className="flex gap-5">
              <input
                type="text"
                name="attendeeId"
                id="attendee-id"
                placeholder="e.g. ATD-12345"
                className="border rounded-sm min-w-0 flex-1 p-1"
              />
              <button
                type="button"
                className="bg-purple-700 text-white py-1 px-2 rounded-sm"
              >
                Check In
              </button>
            </div>
          </div>
        </section>

        {/* Recent check-ins */}
        <section className="flex flex-col bg-white gap-5 rounded-2xl p-5">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">Recent Check In</h2>
            <span className="bg-green-200/50 py-1 px-2 rounded-xs text-green-700">
              Live
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {checkInAttendees.map((checkInAttendee) => (
              <div key={checkInAttendee.id} className="flex items-center gap-3">
                <CircleUserRound size={30} className="shrink-0" />
                <p className="font-semibold shrink-0 whitespace-nowrap">
                  {checkInAttendee.name}
                </p>
                <p className="min-w-0 truncate"> {checkInAttendee.email}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default CheckIn;
