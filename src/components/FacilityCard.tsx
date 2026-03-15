import { forwardRef } from "react";
import {
  CheckCircle2,
  MapPin, Clock, Hospital,
  Loader2, XCircle,
} from "lucide-react";
import { useFacilityLookup } from "../store/hooks/useFacility";

const FacilityCard = forwardRef<HTMLDivElement, {
  facility:       ReturnType<typeof useFacilityLookup>["facility"];
  loading:        boolean;
  lookupError:    string | null;
  onWrongFacility?: () => void;
  compact?:       boolean;
}>(({ facility, loading, lookupError, onWrongFacility, compact = false }, ref) => {

  if (loading) {
    return (
      <div ref={ref} className={`bg-white rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] ${compact ? "p-5" : "p-6"}`}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-gray-100 animate-pulse flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-100 animate-pulse rounded w-2/3" />
            <div className="h-3 bg-gray-100 animate-pulse rounded w-1/2" />
          </div>
        </div>
        <div className="rounded-2xl h-32 bg-gray-100 animate-pulse mb-4" />
        <div className="flex items-center justify-center gap-2 text-gray-400 text-sm py-2">
          <Loader2 size={14} className="animate-spin" /> Looking up facility…
        </div>
      </div>
    );
  }

  if (lookupError) {
    return (
      <div ref={ref} className={`bg-white rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] ${compact ? "p-5" : "p-6"}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <XCircle size={22} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Facility Not Found</h3>
            <p className="text-sm text-gray-500">Check the code and try again</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-red-600">{lookupError}</p>
        </div>
        {onWrongFacility && (
          <button
            onClick={onWrongFacility}
            className="w-full bg-gray-100 text-gray-700 rounded-xl py-3 font-semibold hover:bg-gray-200 transition-all text-sm"
          >
            Try a Different Code
          </button>
        )}
      </div>
    );
  }

  if (!facility) return null;

  const today      = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  const todayHours = facility.openingHours?.[today] ?? null;

  return (
    <div ref={ref} className={`bg-white rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] ${compact ? "p-5" : "p-6"}`}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 size={22} className="text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Facility Confirmed</h3>
          <p className="text-sm text-gray-500">Verify the details below</p>
        </div>
      </div>

      <div className="rounded-2xl p-5 text-white mb-5" style={{ background: "linear-gradient(135deg,#00703C,#059669)" }}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center flex-shrink-0">
            <Hospital size={26} style={{ color: "var(--color-juno-green)" }} />
          </div>
          <div>
            <h4 className="text-xl font-bold leading-tight">{facility.facilityName}</h4>
            <p className="text-sm text-white/90">{facility.departmentName}</p>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-start gap-3">
            <MapPin size={14} className="text-white/80 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-white/90">{facility.facilityAddress}</p>
          </div>
          <div className="flex items-start gap-3">
            <Clock size={14} className="text-white/80 mt-0.5 flex-shrink-0" />
            {todayHours !== null && (
              <p className="text-sm text-white/90">
                Today:{" "}
                <span className="font-semibold">
                  {todayHours.toLowerCase() === "closed" ? "Closed" : todayHours}
                </span>
              </p>
            )}
            {todayHours === null && facility.openingHours === null && (
              <p className="text-sm text-white/80">Open 24/7</p>
            )}
          </div>
        </div>
      </div>

      {facility.services.length > 0 && (
        <div className="mb-5 space-y-2">
          {facility.services.map((s) => (
            <div key={s.id} className="flex items-start gap-2 p-3 bg-green-50 rounded-xl">
              <CheckCircle2 size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                <p className="text-xs text-gray-500">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {onWrongFacility && (
        <div className={`flex ${compact ? "flex-col" : "flex-row"} gap-3`}>
          <button
            onClick={onWrongFacility}
            className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-3 font-semibold hover:bg-gray-200 transition-all text-sm"
          >
            Wrong Facility
          </button>
        </div>
      )}
    </div>
  );
});

FacilityCard.displayName = "FacilityCard";

export default FacilityCard;