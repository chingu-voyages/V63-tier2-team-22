import { useEffect, useMemo, useState } from "react";
import {
  Users,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  Pencil,
  TrendingUp,
  CalendarDays,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";

import AttendeeForm, {
  type Attendee,
  type AttendeeInput,
} from "./AttendeeForm";

import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import {
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from "firebase/auth";

import { auth, db } from "../../firebase/config";

type StatusFilter = "all" | "checked" | "notChecked";
type SortOption = "recent" | "oldest" | "name";

export default function Attendees() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAttendee, setEditingAttendee] = useState<Attendee | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [concertFilter, setConcertFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  // Authenticate Firebase user
  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!active) return;

      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);

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

  // Retrieve attendees from Firestore in real time
  useEffect(() => {
    if (!user) return;

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

  const handleSave = async (data: AttendeeInput): Promise<void> => {
    if (!user) {
      throw new Error("User is not authenticated.");
    }

    const attendeesRef = collection(db, "users", user.uid, "attendees");

    try {
      if (editingAttendee) {
        // Edit existing attendee
        const attendeeRef = doc(attendeesRef, editingAttendee.id);

        await updateDoc(attendeeRef, {
          ...data,
        });
      } else {
        // Create attendee
        const attendeeRef = doc(attendeesRef);

        const newAttendee: Attendee = {
          ...data,
          id: attendeeRef.id,
          createdAt: Date.now(),
        };

        await setDoc(attendeeRef, newAttendee);
      }

      setEditingAttendee(null);
    } catch (err) {
      console.error("Error saving attendee:", err);
      throw err;
    }
  };

  const handleAdd = () => {
    setEditingAttendee(null);
    setIsFormOpen(true);
  };

  const handleEdit = (attendee: Attendee) => {
    setEditingAttendee(attendee);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingAttendee(null);
  };

  // Get distinct concert names from attendee data
  const concerts = useMemo(() => {
    return [...new Set(attendees.map((a) => a.concertName))];
  }, [attendees]);

  // Filter and sort
  const filteredAttendees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return attendees
      .filter((attendee) => {
        const matchesSearch =
          attendee.name.toLowerCase().includes(query) ||
          attendee.email.toLowerCase().includes(query) ||
          attendee.registrationId.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "checked" && attendee.checkedIn) ||
          (statusFilter === "notChecked" && !attendee.checkedIn);

        const matchesConcert =
          concertFilter === "all" || attendee.concertName === concertFilter;

        return matchesSearch && matchesStatus && matchesConcert;
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        }

        if (sortBy === "oldest") {
          return a.createdAt - b.createdAt;
        }

        return b.createdAt - a.createdAt;
      });
  }, [attendees, search, statusFilter, concertFilter, sortBy]);

  const total = attendees.length;
  const checkedIn = attendees.filter((a) => a.checkedIn).length;
  const notChecked = total - checkedIn;
  const attendanceRate = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

  const formatDate = (value: string) => {
    if (!value) return "";

    return new Date(`${value}T12:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const stats = [
    {
      label: "Total Attendees",
      value: total.toLocaleString(),
      icon: Users,
    },
    {
      label: "Checked In",
      value: checkedIn.toLocaleString(),
      icon: CheckCircle2,
    },
    {
      label: "Not Checked In",
      value: notChecked.toLocaleString(),
      icon: XCircle,
    },
    {
      label: "Attendance Rate",
      value: `${attendanceRate}%`,
      icon: TrendingUp,
    },
  ];

  const tabClass = (active: boolean) =>
    `flex items-center gap-2 rounded-xl px-4 py-3
     text-sm font-medium transition ${
       active
         ? "bg-[#7900F9] text-white shadow-sm"
         : "text-[#392A55] hover:bg-[#F0E6FF]"
     }`;

  return (
    <div className="min-h-full bg-[#FAF8FF] px-4 py-7 md:px-7">
      <div className="mx-auto max-w-[1450px]">
        {loading && (
          <p className="mb-4 rounded-lg bg-purple-100 p-3 text-sm text-purple-800">
            Loading attendees from Firebase...
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {/* Page title */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#26153B]">Attendees</h1>
            <p className="mt-1 text-sm text-[#81768F]">
              View and manage your event attendees.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!user}
            className="flex items-center gap-2 rounded-xl bg-[#7900F9] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#6500D1] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={18} />
            Add Attendee
          </button>
        </div>

        {/* Statistics */}
        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex min-h-[105px] items-center justify-between
                         rounded-xl border border-[#EDE5F8] bg-white
                         px-4 py-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-[#F1E6FF] p-3 text-[#7900F9]">
                  <Icon size={23} />
                </div>

                <div>
                  <p className="text-xs text-[#9589A8]">{label}</p>
                  <p className="mt-1 text-xl font-bold text-[#392A55]">
                    {value}
                  </p>
                </div>
              </div>

              {/* Decorative chart */}
              <svg
                width="65"
                height="35"
                viewBox="0 0 65 35"
                fill="none"
                aria-hidden="true"
                className="hidden shrink-0 sm:block"
              >
                <path
                  d="M2 30 L12 25 L20 27 L29 15 L39 20 L48 9 L56 12 L63 3"
                  stroke="#8B20FF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 30 L12 25 L20 27 L29 15 L39 20 L48 9 L56 12 L63 3 V35 H2 Z"
                  fill="#EDE1FF"
                  opacity=".75"
                />
              </svg>
            </div>
          ))}
        </div>

        {/* Status tabs + sorting */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={tabClass(statusFilter === "all")}
            >
              <Users size={19} />
              All Attendees ({total})
            </button>

            <button
              onClick={() => setStatusFilter("checked")}
              className={tabClass(statusFilter === "checked")}
            >
              <CheckCircle2 size={19} />
              Checked In ({checkedIn})
            </button>

            <button
              onClick={() => setStatusFilter("notChecked")}
              className={tabClass(statusFilter === "notChecked")}
            >
              <XCircle size={19} />
              Not Checked In ({notChecked})
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            aria-label="Sort attendees"
            className="rounded-xl border border-[#CEC4DD]
                       bg-white px-4 py-3 text-sm text-[#302443]
                       outline-none focus:border-[#7900F9]"
          >
            <option value="recent">Sort by Most Recent</option>
            <option value="oldest">Sort by Oldest</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>

        {/* Search + filters */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7900F9]"
            />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or registration ID..."
              className="w-full rounded-full border border-[#E5DDF2]
                         bg-white py-3 pl-12 pr-4 text-sm
                         text-[#35254E] outline-none
                         focus:border-[#7900F9]"
            />
          </div>

          <select
            value={concertFilter}
            onChange={(e) => setConcertFilter(e.target.value)}
            aria-label="Filter by concert"
            className="rounded-xl border border-[#CEC4DD]
                       bg-white px-4 py-3 text-sm text-[#35254E]"
          >
            <option value="all">Event: All Events</option>
            {concerts.map((concert) => (
              <option key={concert} value={concert}>
                {concert}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            aria-label="Filter by status"
            className="rounded-xl border border-[#CEC4DD]
                       bg-white px-4 py-3 text-sm text-[#35254E]"
          >
            <option value="all">Status: All</option>
            <option value="checked">Checked In</option>
            <option value="notChecked">Not Checked In</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setConcertFilter("all");
              setStatusFilter("all");
              setSortBy("recent");
            }}
            className="flex items-center gap-2 rounded-xl
                       border border-[#CEC4DD] bg-white
                       px-4 py-3 text-sm text-[#35254E]
                       hover:bg-purple-50"
          >
            <SlidersHorizontal size={18} className="text-[#7900F9]" />
            Reset Filters
          </button>
        </div>

        {/* Attendees table */}
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full min-w-[820px] border-separate border-spacing-y-2 text-left">
            <thead>
              <tr className="text-xs font-semibold text-[#7650A9]">
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    disabled
                    className="accent-[#7900F9]"
                  />
                </th>
                <th className="px-3 py-3">Attendee</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Registration ID</th>
                <th className="px-3 py-3">Event</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Edit</th>
              </tr>
            </thead>

            <tbody>
              {filteredAttendees.map((attendee) => (
                <tr
                  key={attendee.id}
                  className="bg-white text-sm text-[#43365A] shadow-sm"
                >
                  <td className="rounded-l-xl border-y border-l border-[#EEE5FA] px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Select ${attendee.name}`}
                      disabled
                      className="accent-[#7900F9]"
                    />
                  </td>

                  <td className="border-y border-[#EEE5FA] px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center
                                   justify-center rounded-full
                                   bg-[#EBD7FF] text-[#7913F7]"
                      >
                        <UserRound size={21} />
                      </div>
                      <span className="font-medium">{attendee.name}</span>
                    </div>
                  </td>

                  <td className="border-y border-[#EEE5FA] px-3 py-3 text-xs">
                    {attendee.email}
                  </td>

                  <td className="border-y border-[#EEE5FA] px-3 py-3">
                    <span
                      className="rounded-lg bg-[#EEDCFF]
                                 px-3 py-1.5 text-xs font-semibold
                                 text-[#7020DA]"
                    >
                      {attendee.registrationId}
                    </span>
                  </td>

                  <td className="border-y border-[#EEE5FA] px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-12 shrink-0 items-center
                                   justify-center rounded-lg
                                   bg-[#271043] text-[#B46CFF]"
                      >
                        <CalendarDays size={19} />
                      </div>

                      <div>
                        <p className="text-xs font-medium">
                          {attendee.concertName}
                        </p>
                        <p className="mt-1 text-[11px] text-[#9A90A9]">
                          {formatDate(attendee.concertDate)}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="border-y border-[#EEE5FA] px-3 py-3">
                    {attendee.checkedIn ? (
                      <span
                        className="inline-flex items-center gap-1
                                   whitespace-nowrap rounded-full
                                   bg-[#E2F7EB] px-3 py-1.5
                                   text-xs text-[#15934E]"
                      >
                        <CheckCircle2 size={14} />
                        Checked In
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1
                                   whitespace-nowrap rounded-full
                                   bg-[#FFE3EC] px-3 py-1.5
                                   text-xs text-[#E33266]"
                      >
                        <XCircle size={14} />
                        Not Checked In
                      </span>
                    )}
                  </td>

                  <td className="rounded-r-xl border-y border-r border-[#EEE5FA] px-3 py-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(attendee)}
                      aria-label={`Edit ${attendee.name}`}
                      className="rounded-lg p-2 text-[#7900F9]
                                 hover:bg-[#EEE2FF]"
                    >
                      <Pencil size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && !error && filteredAttendees.length === 0 && (
            <div className="rounded-xl border border-[#EEE5FA] bg-white px-6 py-14 text-center">
              <Users size={35} className="mx-auto mb-3 text-[#A777E8]" />

              <h3 className="font-semibold text-[#35254E]">
                No attendees found
              </h3>

              <p className="mt-2 text-sm text-[#92869F]">
                {total === 0
                  ? "Start by adding your first attendee."
                  : "Try adjusting your search or filters."}
              </p>

              {total === 0 && (
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!user}
                  className="mt-5 rounded-xl bg-[#7900F9]
                             px-5 py-2.5 text-sm font-medium text-white"
                >
                  Add Attendee
                </button>
              )}
            </div>
          )}
        </div>

        {/* Slide-over form */}
        <AttendeeForm
          isOpen={isFormOpen}
          onClose={handleClose}
          onSave={handleSave}
          editingAttendee={editingAttendee}
        />
      </div>
    </div>
  );
}
