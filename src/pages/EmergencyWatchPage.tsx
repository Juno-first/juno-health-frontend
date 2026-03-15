import { useState, useEffect, useRef, useMemo } from "react";
import { Sidebar, BottomNav } from "../components/AppNav";
import {
  Hospital, Clock, Users, AlertTriangle,
  Navigation, Phone, X, Search, Activity,
  RefreshCw, ChevronRight, Layers, MapPin,
  Loader2, WifiOff, LocateFixed, Route as RouteIcon,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { useNearbyFacilities } from "../store/hooks/useNearbyFacilities";
import type { NearbyFacility } from "../schemas/facility.schema";

// ── Types ─────────────────────────────────────────────────────────────────────

type CapacityStatus = "low" | "moderate" | "high" | "critical";

// ── Helpers ───────────────────────────────────────────────────────────────────

function deriveStatus(waitMins: number): CapacityStatus {
  if (waitMins < 20) return "low";
  if (waitMins < 45) return "moderate";
  if (waitMins < 90) return "high";
  return "critical";
}

function deriveCapacity(waitMins: number): number {
  return Math.min(95, Math.round((waitMins / 90) * 85) + 10);
}

function fmtDuration(mins: number) {
  if (mins < 60) return `${Math.round(mins)} min`;
  return `${Math.floor(mins / 60)}h ${Math.round(mins % 60)}m`;
}

function fmtDistance(m: number) {
  if (m < 1000) return `${Math.round(m)}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

const STATUS_CFG: Record<CapacityStatus, {
  color: string; bg: string; border: string;
  label: string; text: string; badge: string;
}> = {
  low:      { color:"#16A34A", bg:"rgba(22,163,74,.12)",  border:"rgba(22,163,74,.4)",  label:"Low",      text:"text-green-700",  badge:"bg-green-100 text-green-700"   },
  moderate: { color:"#D97706", bg:"rgba(217,119,6,.12)",  border:"rgba(217,119,6,.4)",  label:"Moderate", text:"text-amber-700",  badge:"bg-amber-100 text-amber-700"   },
  high:     { color:"#DC2626", bg:"rgba(220,38,38,.12)",  border:"rgba(220,38,38,.4)",  label:"High",     text:"text-red-700",    badge:"bg-red-100 text-red-700"       },
  critical: { color:"#7C3AED", bg:"rgba(124,58,237,.12)", border:"rgba(124,58,237,.4)", label:"Critical", text:"text-purple-700", badge:"bg-purple-100 text-purple-700" },
};

function CapacityBar({ pct, status }: { pct: number; status: CapacityStatus }) {
  return (
    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{ width:`${pct}%`, background:STATUS_CFG[status].color, transition:"width .6s ease" }}
      />
    </div>
  );
}

// ── Leaflet map ───────────────────────────────────────────────────────────────

interface MapFacility {
  id:       string;
  name:     string;
  lat:      number;
  lng:      number;
  wait:     number;
  status:   CapacityStatus;
  // geometry: array of line-strings, each is array of [lng, lat]
  geometry: [number, number][][] | null | undefined;
}

function LiveMap({
  facilities,
  userLat,
  userLon,
  selected,
  onSelect,
}: {
  facilities: MapFacility[];
  userLat:    number | null;
  userLon:    number | null;
  selected:   string | null;
  onSelect:   (id: string) => void;
}) {
  const mapRef      = useRef<HTMLDivElement>(null);
  const leafRef     = useRef<any>(null);
  const routesRef   = useRef<Record<string, any[]>>({});   // id → array of L.Polyline
  const markersRef  = useRef<Record<string, any>>({});
  const [mapReady,  setMapReady]  = useState(false);

  // ── Effect 1: create map + markers once ──────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;

    // StrictMode mounts twice — clear stale Leaflet ID from previous run
    const container = mapRef.current as any;
    if (container._leaflet_id) container._leaflet_id = undefined;

    let cancelled = false;

    import("leaflet").then(L => {
      if (cancelled || !mapRef.current) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const centerLat = userLat ?? (facilities[0]?.lat ?? 17.9971);
      const centerLon = userLon ?? (facilities[0]?.lng ?? -76.7936);

      const map = L.map(mapRef.current!, {
        center: [centerLat, centerLon],
        zoom:   13,
        zoomControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // User location dot
      if (userLat && userLon) {
        const userIcon = L.divIcon({
          html: `<div style="
            width:16px;height:16px;border-radius:50%;
            background:#3B82F6;border:3px solid white;
            box-shadow:0 0 0 5px rgba(59,130,246,.25);
          "></div>`,
          className:  "",
          iconSize:   [16, 16],
          iconAnchor: [8, 8],
        });
        L.marker([userLat, userLon], { icon: userIcon }).addTo(map);
      }

      // Markers
      facilities.forEach(f => {
        const cfg = STATUS_CFG[f.status];
        const iconHtml = `
          <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;position:relative;">
            ${f.status === "critical" ? `<div style="position:absolute;width:48px;height:48px;border-radius:50%;background:${cfg.color}33;animation:ew-ping 1.5s ease-out infinite;top:-4px;left:-4px;"></div>` : ""}
            <div style="
              width:40px;height:40px;border-radius:14px;
              background:white;border:2.5px solid ${cfg.color};
              display:flex;align-items:center;justify-content:center;
              box-shadow:0 4px 14px rgba(0,0,0,.18);position:relative;
            ">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${cfg.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div style="
              margin-top:3px;padding:2px 7px;border-radius:8px;
              background:${cfg.color};color:white;
              font-size:10px;font-weight:700;white-space:nowrap;
              box-shadow:0 2px 8px ${cfg.color}66;
            ">${f.wait}m</div>
            <div style="width:2px;height:5px;background:${cfg.color};margin-top:1px;border-radius:2px;"></div>
          </div>
        `;

        const icon = L.divIcon({
          html:       iconHtml,
          className:  "",
          iconSize:   [40, 68],
          iconAnchor: [20, 68],
        });

        const marker = L.marker([f.lat, f.lng], { icon })
          .addTo(map)
          .on("click", () => onSelect(f.id));

        markersRef.current[f.id] = marker;
      });

      leafRef.current = { map, L };
      setMapReady(true);
    });

    // Ping keyframe
    if (!document.getElementById("ew-ping-style")) {
      const s = document.createElement("style");
      s.id = "ew-ping-style";
      s.textContent = `@keyframes ew-ping{0%{transform:scale(1);opacity:.8}100%{transform:scale(2.4);opacity:0}}`;
      document.head.appendChild(s);
    }

    return () => {
      cancelled = true;
      leafRef.current?.map.remove();
      leafRef.current     = null;
      markersRef.current  = {};
      routesRef.current   = {};
      setMapReady(false);
    };
  }, [userLat, userLon]);    // ← only re-create map when location changes

  // ── Effect 2: draw / redraw routes whenever facilities or map is ready ──────
  useEffect(() => {
    if (!mapReady || !leafRef.current) return;
    const { map, L } = leafRef.current;

    // Remove all existing route polylines
    Object.values(routesRef.current).forEach(lines =>
      lines.forEach((line: any) => map.removeLayer(line)),
    );
    routesRef.current = {};

    // Draw fresh routes for every facility that has geometry
    facilities.forEach(f => {
      if (!f.geometry?.length) return;
      const cfg  = STATUS_CFG[f.status];
      const lines: any[] = [];

      f.geometry.forEach(lineString => {
        // API returns [lng, lat] — Leaflet needs [lat, lng]
        const latlngs = lineString.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
        const polyline = L.polyline(latlngs, {
          color:     cfg.color,
          weight:    5,
          opacity:   0.45,
          dashArray: "10 6",
        }).addTo(map);
        lines.push(polyline);
      });

      routesRef.current[f.id] = lines;
    });
  }, [facilities, mapReady]);   // ← re-draw when facilities arrive OR map becomes ready

  // ── Effect 3: highlight selected route, dim others ────────────────────────
  useEffect(() => {
    if (!leafRef.current) return;

    Object.entries(routesRef.current).forEach(([id, lines]) => {
      const isSelected = id === selected;
      lines.forEach((line: any) => {
        line.setStyle({
          opacity:   isSelected ? 1.0 : selected ? 0.15 : 0.45,
          weight:    isSelected ? 8   : 5,
          dashArray: isSelected ? ""  : "10 6",
        });
        if (isSelected) line.bringToFront();
      });
    });

    // Pan to selected facility
    if (selected) {
      const f = facilities.find(x => x.id === selected);
      if (f) leafRef.current.map.flyTo([f.lat, f.lng], 15, { duration: 0.8 });
    }
  }, [selected]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div ref={mapRef} className="w-full h-full" />
    </>
  );
}

// ── Turn-by-turn steps ────────────────────────────────────────────────────────

function RouteSteps({ facility }: { facility: NearbyFacility }) {
  const [open, setOpen] = useState(false);
  const route = facility.route;
  if (!route) return null;

  return (
    <div className="mx-4 mb-3 rounded-xl overflow-hidden border border-gray-100" style={{ background:"#F9FAFB" }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left"
      >
        <div className="flex items-center gap-2">
          <RouteIcon size={12} className="text-blue-500" />
          <span className="text-xs font-bold text-gray-700">
            {fmtDuration(route.durationMinutes)} · {fmtDistance(route.distanceMeters)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
          {open ? <><ChevronUp size={12}/> Hide steps</> : <><ChevronDown size={12}/> {route.steps.length} steps</>}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100">
          {route.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2.5 px-3 py-2 border-b border-gray-100 last:border-0">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white flex-shrink-0 mt-0.5"
                style={{ background:"var(--color-juno-green)" }}
              >
                {i + 1}
              </span>
              <p className="text-xs text-gray-600 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Detail card ───────────────────────────────────────────────────────────────

function DetailCard({ facility, onClose }: { facility: NearbyFacility; onClose: () => void }) {
  const status   = deriveStatus(facility.avgWaitMinutes);
  const capacity = deriveCapacity(facility.avgWaitMinutes);
  const cfg      = STATUS_CFG[status];

  return (
    <div>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background:cfg.bg, border:`1.5px solid ${cfg.border}` }}
          >
            <Hospital size={16} style={{ color:cfg.color }} />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900 leading-tight">{facility.name}</p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
              {facility.facilityType.replace("_", " ")}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
        >
          <X size={13} className="text-gray-500" />
        </button>
      </div>

      {/* Stats */}
      <div className="px-4 py-3 grid grid-cols-3 gap-2">
        {[
          { Icon:Clock,      val:fmtDuration(facility.avgWaitMinutes),               label:"Avg wait"  },
          { Icon:Users,      val:`${capacity}%`,                                      label:"Capacity",   accent:true },
          { Icon:Navigation, val:facility.route
              ? fmtDuration(facility.route.durationMinutes)
              : `${facility.distanceKm.toFixed(1)}km`,
            label: facility.route ? "Drive time" : "Distance" },
        ].map(s => (
          <div key={s.label} className="text-center p-2 bg-gray-50 rounded-xl">
            <s.Icon size={11} className="text-gray-400 mx-auto mb-0.5" />
            <p className="text-sm font-black" style={{ color: s.accent ? cfg.color : "#111827" }}>{s.val}</p>
            <p className="text-[9px] text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Capacity bar */}
      <div className="px-4 pb-3">
        <div className="flex justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Capacity</span>
          <span className={`text-[10px] font-bold ${cfg.text}`}>{cfg.label}</span>
        </div>
        <CapacityBar pct={capacity} status={status} />
      </div>

      {/* Turn-by-turn */}
      <RouteSteps facility={facility} />

      {/* Services */}
      {facility.services.length > 0 && (
        <div className="px-4 pb-3">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Services</p>
          <div className="flex flex-wrap gap-1.5">
            {facility.services.map(s => (
              <span key={s.id} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Address */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <MapPin size={11} className="text-gray-400 flex-shrink-0" />
        <p className="text-xs text-gray-500 truncate">{facility.address}, {facility.parish}</p>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 grid grid-cols-2 gap-2">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:brightness-110"
          style={{ background:"var(--color-juno-green)" }}
        >
          <Navigation size={12} /> Directions
        </a>
        <a
          href={`tel:${facility.phone}`}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
        >
          <Phone size={12} /> Call
        </a>
      </div>
    </div>
  );
}

// ── Facility row ──────────────────────────────────────────────────────────────

function FacilityRow({ facility, selected, onClick }: {
  facility: NearbyFacility;
  selected: boolean;
  onClick:  () => void;
}) {
  const status   = deriveStatus(facility.avgWaitMinutes);
  const capacity = deriveCapacity(facility.avgWaitMinutes);
  const cfg      = STATUS_CFG[status];

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl shadow-md p-3 transition-all hover:shadow-lg"
      style={{
        background:     "rgba(255,255,255,.96)",
        backdropFilter: "blur(12px)",
        border:         `2px solid ${selected ? cfg.color : "transparent"}`,
      }}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background:cfg.bg, border:`1.5px solid ${cfg.border}` }}
        >
          <Hospital size={15} style={{ color:cfg.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-900 truncate leading-tight">{facility.name}</p>
          <p className="text-[10px] text-gray-400">
            {facility.distanceKm.toFixed(1)}km
            {facility.route && ` · ${fmtDuration(facility.route.durationMinutes)}`}
            {` · ${facility.facilityType.replace("_"," ")}`}
          </p>
        </div>
        <ChevronRight size={12} className="text-gray-300 flex-shrink-0" />
      </div>
      <div className="flex items-center gap-2">
        <Clock size={10} className="text-gray-400" />
        <span className="text-[11px] font-bold text-gray-800">{facility.avgWaitMinutes}m wait</span>
        <div className="flex-1 mx-1">
          <CapacityBar pct={capacity} status={status} />
        </div>
        <span className="text-[10px] font-black" style={{ color:cfg.color }}>{capacity}%</span>
      </div>
    </button>
  );
}

// ── Peek card (mobile) ────────────────────────────────────────────────────────

function PeekCard({ facility, onClick }: { facility: NearbyFacility; onClick: () => void }) {
  const status   = deriveStatus(facility.avgWaitMinutes);
  const capacity = deriveCapacity(facility.avgWaitMinutes);
  const cfg      = STATUS_CFG[status];

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 rounded-2xl shadow-lg p-3 text-left w-[200px] transition-all hover:shadow-xl"
      style={{
        background:     "rgba(255,255,255,.96)",
        backdropFilter: "blur(12px)",
        border:         `1.5px solid ${cfg.border}`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:cfg.bg }}>
          <Hospital size={13} style={{ color:cfg.color }} />
        </div>
        <p className="text-xs font-bold text-gray-900 truncate">{facility.name.split(" ").slice(0, 3).join(" ")}</p>
      </div>
      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-lg font-black text-gray-900">{facility.avgWaitMinutes}m</span>
        <span className="text-[10px] text-gray-400">wait</span>
      </div>
      {facility.route && (
        <p className="text-[10px] text-blue-500 font-semibold mb-1.5">
          {fmtDuration(facility.route.durationMinutes)} drive · {fmtDistance(facility.route.distanceMeters)}
        </p>
      )}
      <CapacityBar pct={capacity} status={status} />
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-gray-400">Capacity</span>
        <span className="text-[10px] font-bold" style={{ color:cfg.color }}>{cfg.label}</span>
      </div>
    </button>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function EmergencyWatchPage() {
  const { facilities, geoStatus, fetchStatus, error, userLat, userLon, refresh } = useNearbyFacilities();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter,     setFilter]     = useState<CapacityStatus | "all">("all");
  const [search,     setSearch]     = useState("");
  const [showList,   setShowList]   = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (fetchStatus === "loaded") setLastUpdate(new Date());
  }, [fetchStatus]);

  const selectedFacility = facilities.find(f => f.id === selectedId) ?? null;

  const filtered = facilities
    .filter(f => filter === "all" || deriveStatus(f.avgWaitMinutes) === filter)
    .filter(f =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.address.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const criticalCount = facilities.filter(f => deriveStatus(f.avgWaitMinutes) === "critical").length;
  const isLoading     = geoStatus === "locating" || fetchStatus === "loading";

  const mapFacilities = useMemo(() => filtered.map(f => ({
    id:       f.id,
    name:     f.name,
    lat:      f.latitude,
    lng:      f.longitude,
    wait:     f.avgWaitMinutes,
    status:   deriveStatus(f.avgWaitMinutes),
    geometry: f.route?.geometry ?? null,
  })), [filtered]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .ew { font-family:'DM Sans',sans-serif; }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        .slide-up { animation:slideUp .28s ease forwards; }
        .fade-in  { animation:fadeIn  .22s ease forwards; }
        .ew ::-webkit-scrollbar       { width:4px;height:4px; }
        .ew ::-webkit-scrollbar-track { background:transparent; }
        .ew ::-webkit-scrollbar-thumb { background:#D1D5DB;border-radius:4px; }
        .leaflet-bottom { bottom:80px!important; }
      `}</style>

      <div className="ew flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden relative">

          {/* ── FULL-SCREEN MAP ── */}
          <div className="absolute inset-0 z-0">
            {facilities.length > 0 ? (
              <LiveMap
                facilities={mapFacilities}
                userLat={userLat}
                userLon={userLon}
                selected={selectedId}
                onSelect={id => setSelectedId(prev => prev === id ? null : id)}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background:"linear-gradient(135deg,#e8f4f0,#d1e8e2,#bfdcd4)" }}
              >
                {isLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background:"var(--color-juno-green)" }}>
                      <LocateFixed size={28} className="text-white animate-pulse" />
                    </div>
                    <p className="text-gray-600 font-semibold">
                      {geoStatus === "locating" ? "Getting your location…" : "Loading facilities…"}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center px-8">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-red-100">
                      <WifiOff size={28} className="text-red-500" />
                    </div>
                    <p className="text-gray-700 font-semibold">{error ?? "No facilities found nearby."}</p>
                    <button
                      onClick={refresh}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold"
                      style={{ background:"var(--color-juno-green)" }}
                    >
                      <RefreshCw size={14} /> Try Again
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── TOP BAR ── */}
          <div className="relative z-10 px-3 pt-3 lg:px-5 lg:pt-4 flex items-start gap-2 pointer-events-none">
            <div
              className="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-lg pointer-events-auto"
              style={{ background:"rgba(255,255,255,.96)", backdropFilter:"blur(12px)" }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:"var(--color-juno-green)" }}>
                <Activity size={14} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-black text-gray-900 leading-none">Emergency Watch</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {fetchStatus === "loaded"
                    ? `${facilities.length} facilities · ${lastUpdate.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}`
                    : "Live facility status"}
                </p>
              </div>
            </div>

            <div
              className="flex-1 max-w-xs flex items-center gap-2 px-3 py-2.5 rounded-2xl shadow-lg pointer-events-auto"
              style={{ background:"rgba(255,255,255,.96)", backdropFilter:"blur(12px)" }}
            >
              <Search size={14} className="text-gray-400 flex-shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search facilities…"
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none min-w-0"
              />
              {search && <button onClick={() => setSearch("")}><X size={13} className="text-gray-400" /></button>}
            </div>

            <div
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-2xl shadow-lg pointer-events-auto"
              style={{ background:"rgba(255,255,255,.96)", backdropFilter:"blur(12px)" }}
            >
              {(["all","low","moderate","high","critical"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: filter === s ? (s === "all" ? "var(--color-juno-green)" : STATUS_CFG[s].color) : "transparent",
                    color: filter === s ? "white" : "#6B7280",
                  }}
                >
                  {s === "all" ? "All" : STATUS_CFG[s].label}
                </button>
              ))}
            </div>

            <button
              onClick={refresh}
              disabled={isLoading}
              className="hidden lg:flex w-10 h-10 rounded-xl shadow-lg items-center justify-center pointer-events-auto disabled:opacity-50"
              style={{ background:"rgba(255,255,255,.96)", backdropFilter:"blur(12px)" }}
            >
              <RefreshCw size={15} className={`text-gray-600 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={() => setShowList(v => !v)}
              className="lg:hidden w-10 h-10 rounded-xl shadow-lg flex items-center justify-center pointer-events-auto"
              style={{ background:"rgba(255,255,255,.96)", backdropFilter:"blur(12px)" }}
            >
              <Layers size={16} className="text-gray-700" />
            </button>
          </div>

          {/* Banners */}
          <div className="relative z-10 px-3 lg:px-5 mt-2 space-y-2 pointer-events-none">
            {isLoading && (
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl shadow-lg fade-in"
                style={{ background:"rgba(255,255,255,.92)", backdropFilter:"blur(8px)" }}
              >
                <Loader2 size={13} className="text-gray-500 animate-spin" />
                <p className="text-gray-600 text-xs font-semibold">
                  {geoStatus === "locating" ? "Getting your location…" : "Loading facilities…"}
                </p>
              </div>
            )}
            {criticalCount > 0 && (
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl shadow-lg slide-up"
                style={{ background:"rgba(124,58,237,.92)", backdropFilter:"blur(8px)" }}
              >
                <AlertTriangle size={13} className="text-purple-200 flex-shrink-0" />
                <p className="text-white text-xs font-semibold">
                  {criticalCount} facilit{criticalCount > 1 ? "ies" : "y"} at critical capacity
                </p>
              </div>
            )}
          </div>

          {/* ── DESKTOP: RIGHT PANEL ── */}
          <div className="hidden lg:flex absolute right-4 top-20 bottom-6 w-[300px] z-10 flex-col gap-3">
            <div
              className="rounded-2xl shadow-lg p-4 pointer-events-auto flex-shrink-0"
              style={{ background:"rgba(255,255,255,.96)", backdropFilter:"blur(12px)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-gray-700 uppercase tracking-wider">Live Status</span>
                <span className="text-[10px] text-gray-400">{facilities.length} facilities</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(["low","moderate","high","critical"] as CapacityStatus[]).map(s => {
                  const n   = facilities.filter(f => deriveStatus(f.avgWaitMinutes) === s).length;
                  const cfg = STATUS_CFG[s];
                  return (
                    <button
                      key={s}
                      onClick={() => setFilter(filter === s ? "all" : s)}
                      className="flex items-center gap-2 p-2 rounded-xl transition-all text-left"
                      style={{
                        background: filter === s ? cfg.bg : "#F9FAFB",
                        border: `1.5px solid ${filter === s ? cfg.border : "transparent"}`,
                      }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background:cfg.color }} />
                      <span className="text-xs font-semibold text-gray-700">{cfg.label}</span>
                      <span className="ml-auto text-xs font-black" style={{ color:cfg.color }}>{n}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pointer-events-auto">
              {filtered.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-400 text-sm">No facilities found</div>
              )}
              {filtered.map(f => (
                <FacilityRow
                  key={f.id}
                  facility={f}
                  selected={selectedId === f.id}
                  onClick={() => setSelectedId(prev => prev === f.id ? null : f.id)}
                />
              ))}
            </div>

            {selectedFacility && (
              <div
                className="pointer-events-auto rounded-2xl shadow-xl overflow-hidden slide-up flex-shrink-0"
                style={{ background:"rgba(255,255,255,.97)", backdropFilter:"blur(12px)" }}
              >
                <DetailCard facility={selectedFacility} onClose={() => setSelectedId(null)} />
              </div>
            )}
          </div>

          {/* ── MOBILE: BOTTOM ── */}
          <div className="lg:hidden absolute bottom-16 left-0 right-0 z-10 px-3 pb-2">
            <div className="flex gap-2 mb-2.5 overflow-x-auto" style={{ scrollbarWidth:"none" }}>
              {(["all","low","moderate","high","critical"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md"
                  style={{
                    background: filter === s
                      ? s === "all" ? "var(--color-juno-green)" : STATUS_CFG[s].color
                      : "rgba(255,255,255,.95)",
                    color: filter === s ? "white" : "#374151",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {s === "all" ? "All" : STATUS_CFG[s].label}
                </button>
              ))}
            </div>

            {selectedFacility ? (
              <div
                className="rounded-2xl shadow-xl overflow-hidden slide-up"
                style={{ background:"rgba(255,255,255,.97)", backdropFilter:"blur(12px)", maxHeight:"65vh", overflowY:"auto" }}
              >
                <DetailCard facility={selectedFacility} onClose={() => setSelectedId(null)} />
              </div>
            ) : showList ? (
              <div
                className="rounded-2xl shadow-xl overflow-hidden slide-up"
                style={{ maxHeight:"52vh", overflowY:"auto", background:"rgba(255,255,255,.97)", backdropFilter:"blur(12px)" }}
              >
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                  <p className="text-sm font-black text-gray-900">
                    Nearby <span className="text-gray-400 font-normal">({filtered.length})</span>
                  </p>
                  <button onClick={() => setShowList(false)}><X size={16} className="text-gray-400" /></button>
                </div>
                {filtered.map(f => {
                  const s   = deriveStatus(f.avgWaitMinutes);
                  const cfg = STATUS_CFG[s];
                  return (
                    <button
                      key={f.id}
                      onClick={() => { setSelectedId(f.id); setShowList(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 text-left"
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:cfg.bg }}>
                        <Hospital size={15} style={{ color:cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{f.name}</p>
                        <p className="text-xs text-gray-400">
                          {f.distanceKm.toFixed(1)}km
                          {f.route && ` · ${fmtDuration(f.route.durationMinutes)} drive`}
                          {` · ${f.avgWaitMinutes}m wait`}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background:cfg.bg, color:cfg.color }}>
                        {cfg.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth:"none" }}>
                {filtered.slice(0, 4).map(f => (
                  <PeekCard key={f.id} facility={f} onClick={() => setSelectedId(f.id)} />
                ))}
              </div>
            )}
          </div>
        </div>

        <BottomNav />
      </div>
    </>
  );
}