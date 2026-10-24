"use client";

export const FIRST_GRAD_YEAR = 1867; // Howard's founding year
export const LAST_GRAD_YEAR = new Date().getFullYear() + 6; // allow current students

export type AlumniInfo = {
  major: string;
  gradYear: string;
  showOnCard: boolean;
};

export const emptyAlumniInfo: AlumniInfo = { major: "", gradYear: "", showOnCard: false };

const inputClass =
  "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900";

// Major, Graduation Year, and whether to show them on directory cards
export default function AlumniInfoFields({
  value,
  onChange,
}: {
  value: AlumniInfo;
  onChange: (next: AlumniInfo) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="major" className="block text-sm font-medium text-gray-700 mb-1">
          Major at Howard
        </label>
        <input
          id="major"
          type="text"
          placeholder="Examples: Biology, Accounting, Journalism"
          className={inputClass}
          value={value.major}
          onChange={(e) => onChange({ ...value, major: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="grad-year" className="block text-sm font-medium text-gray-700 mb-1">
          Graduation Year
        </label>
        <input
          id="grad-year"
          type="number"
          inputMode="numeric"
          min={FIRST_GRAD_YEAR}
          max={LAST_GRAD_YEAR}
          placeholder="2005"
          className={inputClass}
          value={value.gradYear}
          onChange={(e) => onChange({ ...value, gradYear: e.target.value })}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          checked={value.showOnCard}
          onChange={(e) => onChange({ ...value, showOnCard: e.target.checked })}
        />
        Make this information visible?
      </label>
    </div>
  );
}
