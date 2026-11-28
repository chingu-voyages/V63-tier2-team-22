import type { Concert } from "../../types/concert";
import { CircleCheck, Check, Clock, Clock4, UsersRound } from "lucide-react";

type CheckInSummaryProps = {
  selectedConcert: Concert;
};

// Sample check-in attendee data; this will be replaced later with actual data
const sampleAttendees = [
  {
    initials: "EJ",
    name: "Emily Johnson",
    registrationId: "REG-001",
    checkInStatus: "Checked In",
  },
  {
    initials: "DS",
    name: "Daniel Smith",
    registrationId: "REG-002",
    checkInStatus: "Checked In",
  },
  {
    initials: "SM",
    name: "Sofia Martinez",
    registrationId: "REG-003",
    checkInStatus: "Checked In",
  },
  {
    initials: "JW",
    name: "James Wilson",
    registrationId: "REG-004",
    checkInStatus: "Checked In",
  },
  {
    initials: "OB",
    name: "Olivia Brown",
    registrationId: "REG-005",
    checkInStatus: "Checked In",
  },
];

function CheckInSummary({ selectedConcert }: CheckInSummaryProps) {
  const expectedAttendance = selectedConcert.expectedAttendance;
  const actualAttendance = 150; // sample data; this will be replaced later with actual data
  const progress =
    expectedAttendance > 0
      ? Math.round((actualAttendance / expectedAttendance) * 100)
      : 0;

  return (
    <div>
      {/* Check-in summary for one specific concert */}
      <section className="flex m-4 gap-10 md:m-10">
        {/* Total # of attendees, check-in attendees, and pending attendees */}
        <div className="flex bg-white p-10 rounded-2xl gap-5 shadow-md">
          <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-violet-700/10">
            <UsersRound
              size={40}
              aria-hidden="true"
              className="text-violet-700"
            />
          </span>
          <div className="flex flex-col items-center">
            <h2 className="font-semibold text-lg text-gray-500">
              Total Attendees
            </h2>
            <p className="font-semibold text-5xl">
              {selectedConcert.expectedAttendance}
            </p>
          </div>
        </div>
        <div className="flex bg-white p-10 rounded-2xl gap-5 shadow-md">
          <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500/30">
            <CircleCheck
              size={40}
              aria-hidden="true"
              className="text-green-700"
            />
          </span>
          <div className="flex flex-col items-center">
            <h2 className="font-semibold text-lg text-gray-500">Checked In</h2>
            <p className="font-semibold text-5xl">{actualAttendance}</p>
          </div>
        </div>
        <div className="flex bg-white p-10 rounded-2xl gap-5 shadow-md">
          <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/30">
            <Clock4 size={40} aria-hidden="true" className="text-amber-700" />
          </span>
          <div className="flex flex-col items-center">
            <h2 className="font-semibold text-lg text-gray-500">Pending</h2>
            <p className="font-semibold text-5xl">
              {Math.max(expectedAttendance - actualAttendance, 0)}
            </p>
          </div>
        </div>
      </section>
      <section className="bg-white p-5 m-4 md:m-10 md:p-10 rounded-2xl ">
        {/* Check-in progress bar */}
        <div className="flex items-center gap-10">
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold text-3xl">Check-In Progress</h2>
            <p className="text-gray-500">
              {actualAttendance} /{selectedConcert.expectedAttendance} attendees
            </p>
          </div>

          <div className="flex-1 flex items-center gap-3 p-5">
            <div
              aria-hidden="true"
              className="h-9 flex-1 overflow-hidden rounded-full bg-violet-100"
            >
              <div
                className="h-full rounded-full bg-linear-to-r from-violet-500 to-violet-700"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <span className="bg-violet-100 rounded-full px-4 py-1.5 font-semibold">
              {progress}%
            </span>
          </div>
        </div>
      </section>
      <section className="flex flex-col bg-white m-4 gap-4 p-5 md:m-10 md:gap-5 md:p-10 rounded-2xl ">
        {/* List of checked-in attendees */}
        <div className="flex gap-3 items-center">
          <span className="inline-flex h-15 w-15 items-center justify-center rounded-full bg-violet-700/10">
            <Clock size={40} aria-hidden="true" className="text-violet-700" />
          </span>
          <div className="flex flex-col">
            <h2 className="font-semibold text-2xl">Recent Check Ins</h2>
            <p className="text-gray-500">
              Attendees who have recently checked in
            </p>
          </div>
        </div>
        <div className="overflow-x-auto border-t border-violet-100">
          <ul className="min-w-[600px] divide-y divide-violet-100">
            {sampleAttendees.map((attendee) => (
              <li
                key={attendee.registrationId}
                className="grid grid-cols-[400px_1fr_1fr_80px] items-center gap-x-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-100"
                  >
                    {attendee.initials}
                  </span>
                  <h3 className="font-medium">{attendee.name}</h3>
                </div>

                <p>{attendee.registrationId}</p>

                <span className="inline-flex items-center gap-1 justify-self-start whitespace-nowrap rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                  <Check size={15} aria-hidden="true" />
                  {attendee.checkInStatus}
                </span>

                <button
                  type="button"
                  aria-label={`Edit ${attendee.name}`}
                  className="justify-self-start rounded-md bg-violet-700 px-3 py-2 text-white"
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

export default CheckInSummary;
