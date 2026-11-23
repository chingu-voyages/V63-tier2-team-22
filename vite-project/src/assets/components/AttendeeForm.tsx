import { useEffect, useState, type FormEvent } from "react";
import {
  X,
  UserRoundPlus,
  Music2,
  Ticket,
  CalendarDays,
  Clock3,
  UserRound,
  Mail,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

export interface Attendee {
  id: string;
  registrationId: string;
  name: string;
  email: string;
  concertName: string;
  concertType: string;
  concertDate: string;
  concertTime: string;
  checkedIn: boolean;
  createdAt: number;
}

export type AttendeeInput = Omit<Attendee, "id" | "createdAt">;

interface AttendeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (attendee: AttendeeInput) => Promise<void>;
  editingAttendee?: Attendee | null;
}

const generateRegistrationId = () =>
  `REG-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

const createEmptyForm = (): AttendeeInput => ({
  registrationId: generateRegistrationId(),
  name: "",
  email: "",
  concertName: "",
  concertType: "",
  concertDate: "",
  concertTime: "",
  checkedIn: false,
});

export default function AttendeeForm({
  isOpen,
  onClose,
  onSave,
  editingAttendee,
}: AttendeeFormProps) {
  const [form, setForm] = useState<AttendeeInput>(createEmptyForm);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setSaveError("");

    if (editingAttendee) {
      setForm({
        registrationId: editingAttendee.registrationId,
        name: editingAttendee.name,
        email: editingAttendee.email,
        concertName: editingAttendee.concertName,
        concertType: editingAttendee.concertType,
        concertDate: editingAttendee.concertDate,
        concertTime: editingAttendee.concertTime,
        checkedIn: editingAttendee.checkedIn,
      });
    } else {
      setForm(createEmptyForm());
    }
  }, [isOpen, editingAttendee]);

  if (!isOpen) return null;

  const updateField = <K extends keyof AttendeeInput>(
    field: K,
    value: AttendeeInput[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (saving) return;

    setSaving(true);
    setSaveError("");

    try {
      await onSave({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        concertName: form.concertName.trim(),
        concertType: form.concertType.trim(),
      });

      onClose();
    } catch (error) {
      console.error("Error saving attendee:", error);
      setSaveError("Unable to save attendee. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#D9D0EC] bg-white px-4 py-3 " +
    "text-sm text-[#2C2045] outline-none transition " +
    "placeholder:text-[#88809B] focus:border-[#7913F7] " +
    "focus:ring-2 focus:ring-purple-100";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#150D25]/45">
      {/* Side panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={editingAttendee ? "Edit Attendee" : "Add Attendee"}
        className="flex h-full w-full max-w-[490px] flex-col overflow-y-auto
                   rounded-l-[28px] bg-[#FCFAFF] px-7 py-8 shadow-2xl
                   sm:px-9"
      >
        {/* Header */}
        <div className="mb-9 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-[#EEE2FF] p-3 text-[#7913F7]">
              <UserRoundPlus size={28} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#26153B]">
                {editingAttendee ? "Edit Attendee" : "Add Attendee"}
              </h2>
              <p className="mt-1 text-sm text-[#686078]">
                Register a new attendee for a concert.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="text-[#26153B] hover:text-[#7913F7]"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5">
          {/* Concert Name */}
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#21192F]">
              Concert Name <span className="text-red-500">*</span>
            </span>

            <div className="relative">
              <Music2
                size={18}
                className="absolute left-4 top-3.5 text-[#35254E]"
              />
              <input
                required
                type="text"
                placeholder="Enter concert name"
                value={form.concertName}
                onChange={(e) => updateField("concertName", e.target.value)}
                className={`${inputClass} pl-11`}
              />
            </div>
          </label>

          {/* Concert Type */}
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#21192F]">
              Concert Type <span className="text-red-500">*</span>
            </span>

            <div className="relative">
              <Ticket
                size={18}
                className="absolute left-4 top-3.5 text-[#35254E]"
              />
              <input
                required
                type="text"
                list="concert-types"
                placeholder="e.g. Rock, Pop, Jazz, Electronic"
                value={form.concertType}
                onChange={(e) => updateField("concertType", e.target.value)}
                className={`${inputClass} pl-11`}
              />
              <datalist id="concert-types">
                <option value="Rock" />
                <option value="Pop" />
                <option value="Jazz" />
                <option value="Electronic" />
                <option value="Classical" />
                <option value="Alternative" />
              </datalist>
            </div>
          </label>

          {/* Concert Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <label>
              <span className="mb-2 block text-sm font-semibold text-[#21192F]">
                Concert Date <span className="text-red-500">*</span>
              </span>
              <div className="mb-1 flex items-center gap-2 text-[#7913F7]">
                <CalendarDays size={16} />
                <span className="text-xs">Select date</span>
              </div>
              <input
                required
                type="date"
                value={form.concertDate}
                onChange={(e) => updateField("concertDate", e.target.value)}
                className={inputClass}
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-[#21192F]">
                Concert Time <span className="text-red-500">*</span>
              </span>
              <div className="mb-1 flex items-center gap-2 text-[#7913F7]">
                <Clock3 size={16} />
                <span className="text-xs">Select time</span>
              </div>
              <input
                required
                type="time"
                value={form.concertTime}
                onChange={(e) => updateField("concertTime", e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          {/* Full Name */}
          <label>
            <span className="mb-2 block text-sm font-semibold text-[#21192F]">
              Full Name <span className="text-red-500">*</span>
            </span>
            <div className="relative">
              <UserRound
                size={18}
                className="absolute left-4 top-3.5 text-[#35254E]"
              />
              <input
                required
                type="text"
                placeholder="Enter attendee's full name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className={`${inputClass} pl-11`}
              />
            </div>
          </label>

          {/* Email */}
          <label>
            <span className="mb-2 block text-sm font-semibold text-[#21192F]">
              Email Address <span className="text-red-500">*</span>
            </span>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-3.5 text-[#35254E]"
              />
              <input
                required
                type="email"
                placeholder="Enter email address"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={`${inputClass} pl-11`}
              />
            </div>
          </label>

          {/* Registration ID */}
          <div>
            <span className="mb-2 block text-sm font-semibold text-[#21192F]">
              Registration ID
            </span>

            <div className="flex gap-2">
              <div
                className="flex flex-1 items-center gap-3 rounded-xl
                           border border-[#DACCF0] bg-[#F0E9FB]
                           px-4 py-3 font-semibold text-[#35254E]"
              >
                <Ticket size={18} />
                <span className="text-sm">{form.registrationId}</span>
              </div>

              {!editingAttendee && (
                <button
                  type="button"
                  aria-label="Regenerate registration ID"
                  onClick={() =>
                    updateField("registrationId", generateRegistrationId())
                  }
                  className="rounded-xl bg-[#EEE2FF] px-4 text-[#7913F7]
                             hover:bg-[#E5D1FF]"
                >
                  <RefreshCw size={19} />
                </button>
              )}
            </div>

            <p className="mt-2 text-xs text-[#766C8D]">
              Automatically generated. You can regenerate if needed.
            </p>
          </div>

          {/* Check-In */}
          <div className="mt-4 border-t border-[#D7CAE9] pt-7">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#F0E7FF] p-3 text-[#7913F7]">
                  <CheckCircle2 size={23} />
                </div>

                <div>
                  <p className="text-sm font-bold text-[#21192F]">
                    Mark as Checked In
                  </p>
                  <p className="mt-1 text-xs text-[#766C8D]">
                    Register the attendee as already checked in.
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                role="switch"
                checked={form.checkedIn}
                onChange={(e) => updateField("checkedIn", e.target.checked)}
                className="h-5 w-5 cursor-pointer accent-[#7913F7]"
              />
            </label>
          </div>

          {saveError && (
            <p role="alert" className="text-sm text-red-600">
              {saveError}
            </p>
          )}

          {/* Footer buttons */}
          <div className="mt-auto flex gap-3 pt-10">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-xl border border-[#35254E]
               py-3 text-sm font-semibold text-[#35254E]
               hover:bg-purple-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-[#7900F9] py-3
               text-sm font-semibold text-white
               hover:bg-[#6500D1]
               disabled:cursor-not-allowed
               disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingAttendee
                  ? "Save Changes"
                  : "Add Attendee"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
