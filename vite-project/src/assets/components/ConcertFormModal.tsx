import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { X } from "lucide-react";
import type { Concert, ConcertFormValues } from "../../types/concert";
import { AGE_GROUPS, GENRES, todayISO } from "../../types/concert";
import type { AgeGroupKey, AgeGroups } from "../../types/concert";

type ConcertFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: ConcertFormValues) => Promise<void> | void;
  concert?: Concert | null; // pass a concert to edit; leave empty to create
};

const emptyForm: ConcertFormValues = {
  name: "",
  date: "",
  time: "",
  location: "",
  description: "",
  expectedAttendance: 0,
  actualAttendance: undefined,
  ticketPrice: NaN, // NaN = not filled in yet (0 is a valid "free" price)
  genre: "",
  // NaN = not filled in yet (0% is a valid answer)
  ageGroups: {
    under18: NaN,
    "18to24": NaN,
    "25to34": NaN,
    "35to44": NaN,
    "45plus": NaN,
  },
  localFansPercent: NaN,
};

const isPercent = (n: number) => !Number.isNaN(n) && n >= 0 && n <= 100;
// Rounded to 1 decimal so 33.3 + 33.3 + 33.4 shows as 100, not 99.99999
const ageTotal = (groups: AgeGroups) =>
  Math.round(
    Object.values(groups).reduce(
      (sum, n) => sum + (Number.isNaN(n) ? 0 : n),
      0,
    ) * 10,
  ) / 10;

type Errors = Partial<Record<keyof ConcertFormValues, string>>;

function validate(values: ConcertFormValues): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Name is required";
  if (!values.date) errors.date = "Date is required";
  if (!values.time) errors.time = "Time is required";
  if (!values.location.trim()) errors.location = "Location is required";
  if (!values.genre) errors.genre = "Genre is required";
  if (!values.expectedAttendance || values.expectedAttendance < 1)
    errors.expectedAttendance = "Enter a number greater than 0";
  if (
    values.actualAttendance !== undefined &&
    values.actualAttendance !== null &&
    !Number.isNaN(values.actualAttendance) &&
    values.actualAttendance < 0
  ) {
    errors.actualAttendance = "Actual attendance can't be negative";
  }
  if (Number.isNaN(values.ticketPrice))
    errors.ticketPrice = "Ticket price is required (enter 0 for free)";
  else if (values.ticketPrice < 0)
    errors.ticketPrice = "Price can't be negative";
  if (!Object.values(values.ageGroups).every(isPercent))
    errors.ageGroups = "Enter a % (0–100) for every age group";
  else if (Math.round(ageTotal(values.ageGroups)) !== 100)
    errors.ageGroups = `Age groups must add up to 100% (currently ${ageTotal(values.ageGroups)}%)`;
  if (!isPercent(values.localFansPercent))
    errors.localFansPercent = "Enter a % between 0 and 100";
  return errors;
}

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      )}
    </label>
  );
}

function ConcertFormModal({
  isOpen,
  onClose,
  onSave,
  concert,
}: ConcertFormModalProps) {
  const isEditing = Boolean(concert);
  const [values, setValues] = useState<ConcertFormValues>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Fill the form when opening (edit) or reset it (create)
  useEffect(() => {
    if (!isOpen) return;
    if (concert) {
      setValues({
        name: concert.name,
        date: concert.date,
        time: concert.time,
        location: concert.location,
        description: concert.description,
        expectedAttendance: concert.expectedAttendance,
        actualAttendance: concert.actualAttendance ?? undefined,
        ticketPrice: concert.ticketPrice ?? NaN,
        genre: concert.genre ?? "",
        ageGroups: concert.ageGroups ?? emptyForm.ageGroups,
        localFansPercent: concert.localFansPercent ?? NaN,
      });
    } else {
      setValues(emptyForm);
    }
    setErrors({});
    setSaveError("");
  }, [isOpen, concert]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const isPastDue = Boolean(values.date && values.date < todayISO());

  if (!isOpen) return null;

  const update = <K extends keyof ConcertFormValues>(
    key: K,
    value: ConcertFormValues[K],
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const updateAge = (key: AgeGroupKey, raw: string) =>
    setValues((prev) => ({
      ...prev,
      ageGroups: { ...prev.ageGroups, [key]: raw === "" ? NaN : Number(raw) },
    }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    setSaveError("");
    try {
      await onSave({
        ...values,
        name: values.name.trim(),
        location: values.location.trim(),
        actualAttendance:
          isPastDue &&
          values.actualAttendance !== undefined &&
          values.actualAttendance !== null &&
          !Number.isNaN(values.actualAttendance)
            ? values.actualAttendance
            : undefined,
        ticketPrice: Math.round(values.ticketPrice * 100) / 100, // keep to cents
      });
      onClose();
    } catch (err) {
      console.error("Error saving concert:", err);
      setSaveError(
        err instanceof Error
          ? err.message
          : "Couldn't save the concert. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Keep an existing genre selectable even if it isn't in the standard list
  const genreOptions =
    values.genre && !GENRES.includes(values.genre)
      ? [values.genre, ...GENRES]
      : GENRES;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="concert-form-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2
            id="concert-form-title"
            className="text-xl font-bold text-gray-900"
          >
            {isEditing ? "Edit Concert" : "Create Concert"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-gray-500 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Field label="Concert Name" error={errors.name}>
            <input
              type="text"
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. The Brighters – Live in Concert"
              className={inputClass}
              autoFocus
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Date" error={errors.date}>
              <input
                type="date"
                value={values.date}
                onChange={(e) => update("date", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Time" error={errors.time}>
              <input
                type="time"
                value={values.time}
                onChange={(e) => update("time", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Location" error={errors.location}>
            <input
              type="text"
              value={values.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="e.g. Riverside Arena"
              className={inputClass}
            />
          </Field>

          <Field label="Genre" error={errors.genre}>
            <select
              value={values.genre}
              onChange={(e) => update("genre", e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Select a genre
              </option>
              {genreOptions.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Expected Attendance"
              error={errors.expectedAttendance}
            >
              <input
                type="number"
                min={1}
                value={values.expectedAttendance || ""}
                onChange={(e) =>
                  update("expectedAttendance", Number(e.target.value))
                }
                placeholder="e.g. 2500"
                className={inputClass}
              />
            </Field>
            <Field
              label="Ticket Price per Person (USD)"
              error={errors.ticketPrice}
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={
                    Number.isNaN(values.ticketPrice) ? "" : values.ticketPrice
                  }
                  onChange={(e) =>
                    update(
                      "ticketPrice",
                      e.target.value === "" ? NaN : Number(e.target.value),
                    )
                  }
                  placeholder="e.g. 49.99"
                  className={`${inputClass} pl-7`}
                />
              </div>
            </Field>
          </div>

          {isPastDue && (
            <Field
              label="Actual Attendance (Post-Event)"
              error={errors.actualAttendance}
            >
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={
                  values.actualAttendance === undefined ||
                  values.actualAttendance === null ||
                  Number.isNaN(values.actualAttendance)
                    ? ""
                    : values.actualAttendance
                }
                onChange={(e) =>
                  update(
                    "actualAttendance",
                    e.target.value === "" ? undefined : Number(e.target.value),
                  )
                }
                placeholder="e.g. 2150"
                className={inputClass}
              />
            </Field>
          )}
          {/* Demographics */}
          <fieldset className="rounded-lg border border-gray-200 p-4">
            <legend className="px-1 text-sm font-semibold text-gray-800">
              Demographics
            </legend>

            <p className="mb-2 text-sm font-medium text-gray-700">
              Expected age groups (%)
            </p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {AGE_GROUPS.map(({ key, label }) => (
                <label key={key} className="block">
                  <span className="mb-1 block text-xs text-gray-600">
                    {label}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    inputMode="numeric"
                    value={
                      Number.isNaN(values.ageGroups[key])
                        ? ""
                        : values.ageGroups[key]
                    }
                    onChange={(e) => updateAge(key, e.target.value)}
                    placeholder="%"
                    className={inputClass}
                  />
                </label>
              ))}
            </div>
            <p
              className={`mt-2 text-xs ${
                Math.round(ageTotal(values.ageGroups)) === 100
                  ? "text-green-700"
                  : "text-gray-500"
              }`}
            >
              Total: {ageTotal(values.ageGroups)}% of 100%
            </p>
            {errors.ageGroups && (
              <span className="mt-1 block text-xs text-red-600">
                {errors.ageGroups}
              </span>
            )}

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Local fans (%)" error={errors.localFansPercent}>
                <input
                  type="number"
                  min={0}
                  max={100}
                  inputMode="numeric"
                  value={
                    Number.isNaN(values.localFansPercent)
                      ? ""
                      : values.localFansPercent
                  }
                  onChange={(e) =>
                    update(
                      "localFansPercent",
                      e.target.value === "" ? NaN : Number(e.target.value),
                    )
                  }
                  placeholder="e.g. 70"
                  className={inputClass}
                />
              </Field>
              <div>
                <span className="mb-1 block text-sm font-medium text-gray-700">
                  Traveling fans (%)
                </span>
                <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  {isPercent(values.localFansPercent)
                    ? `${100 - values.localFansPercent}%`
                    : "—"}
                </p>
              </div>
            </div>
          </fieldset>

          <Field label="Description">
            <textarea
              rows={4}
              value={values.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="What should attendees know about this concert?"
              className={inputClass}
            />
          </Field>

          {saveError && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {saveError}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving…"
                : isEditing
                  ? "Save Changes"
                  : "Create Concert"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ConcertFormModal;
