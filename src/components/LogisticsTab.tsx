import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Check, X, Plane, Hotel, FileText, Upload, Loader2, ExternalLink, Clock, DoorOpen, Search, MapPin, Link2 } from "lucide-react";
import GlassCard from "./GlassCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface LogisticsItem {
  id: string;
  type: string;
  flight_number?: string | null;
  flight_time?: string | null;
  terminal?: string | null;
  gate?: string | null;
  hotel_name?: string | null;
  hotel_address?: string | null;
  booking_title?: string | null;
  file_url?: string | null;
  file_storage_path?: string | null;
  notes?: string | null;
}

interface LogisticsTabProps {
  tripId: string;
  tripStartDate?: string;
  items: LogisticsItem[];
  onRefresh: () => void;
}

const LogisticsTab = ({ tripId, tripStartDate, items, onRefresh }: LogisticsTabProps) => {
  const { user } = useAuth();
  const [addingType, setAddingType] = useState<"flight" | "hotel" | "booking" | null>(null);
  const [uploading, setUploading] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [bookingFile, setBookingFile] = useState<File | null>(null);
  const [hotelFile, setHotelFile] = useState<File | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const flights = items.filter((i) => i.type === "flight");
  const hotels = items.filter((i) => i.type === "hotel");
  const bookings = items.filter((i) => i.type === "booking");

 const handleFlightLookup = async () => {
  const flightNum = form.flightNumber?.trim();
  if (!flightNum) return;
  setLookingUp(true);
  try {
    const { data, error } = await supabase.functions.invoke("lookup-flight", {
      body: { flight_number: flightNum, date: tripStartDate },
    });
    
    if (data?.flight) {
  // Helper to grab HH:MM from ISO strings
  const format = (t: string) => t?.includes('T') ? t.split('T')[1].substring(0, 5) : t;

  setForm((prev) => ({
    ...prev,
    // THE FIX: If arrival_time is empty, we check the raw nested arrival object
    arrivalTime: format(
      data.flight.arrival_time ||            // Check what the Edge Function sent
      data.flight.arrival?.estimated ||      // Check for Estimated (from your screenshot!)
      data.flight.arrival?.scheduled ||      // Check for Scheduled
      data.flight.scheduled_arrival || 
      ""
    ),
    flightTime: format(data.flight.departure_time || data.flight.departure?.scheduled || ""),
    airline: data.flight.airline || "",
    origin: data.flight.origin || data.flight.departure?.iata || "",
    destination: data.flight.destination || data.flight.arrival?.iata || "",
    terminal: data.flight.terminal || data.flight.departure?.terminal || "",
    gate: data.flight.gate || data.flight.departure?.gate || "",
  }));
      toast.success(`Found flight: ${data.flight.airline || flightNum}`);
    }
  } catch (err) {
    toast.error("Lookup failed. Please enter details manually.");
  }
  setLookingUp(false);
};

const handleAdd = async () => {
    if (!addingType) return;
    
    // 1. Validation for Flight
    if (addingType === "flight" && !form.arrivalTime) {
      toast.error("Arrival time is required.");
      return;
    }

    const insert: any = { 
      trip_id: tripId, 
      user_id: user!.id, 
      type: addingType, 
      sort_order: items.length 
    };

    if (addingType === "flight") {
      const route = form.origin && form.destination 
  ? `${form.origin} > ${form.destination}` 
  : "";
      
      // SYNC FIX: Using " · " to match the renderFlightCard split logic
      insert.notes = [
        form.airline || "Philippine Airlines",
        route,
        form.arrivalTime
      ].join(" · ");
      
      insert.flight_number = form.flightNumber?.toUpperCase();
      insert.flight_time = form.flightTime;
      insert.terminal = form.terminal || "1";
      insert.gate = form.gate || "TBA";
    } else if (addingType === "hotel") {
      insert.hotel_name = form.hotelName || "";
      insert.hotel_address = form.hotelAddress || "";
      insert.notes = form.mapsLink || "";
    } else {
      insert.booking_title = form.bookingTitle || "";
      insert.notes = form.notes || "";
    }

    const { data: inserted } = await supabase.from("trip_logistics").insert(insert).select().single();

    if (addingType === "booking" && bookingFile && inserted) {
      await handleFileUpload(inserted.id, bookingFile);
    }
    if (addingType === "hotel" && hotelFile && inserted) {
      await handleFileUpload(inserted.id, hotelFile);
    }

    setForm({});
    setBookingFile(null);
    setHotelFile(null);
    setAddingType(null);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item?.file_storage_path) {
      await supabase.storage.from("trip-photos").remove([item.file_storage_path]);
    }
    await supabase.from("trip_logistics").delete().eq("id", id);
    onRefresh();
  };

  const handleFileUpload = async (logisticsId: string, file: File) => {
    setUploading(true);
    const path = `${user!.id}/${tripId}/bookings/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("trip-photos").upload(path, file);
    if (!error) {
      const { data: urlData } = supabase.storage.from("trip-photos").getPublicUrl(path);
      await supabase.from("trip_logistics").update({ file_url: urlData.publicUrl, file_storage_path: path }).eq("id", logisticsId);
      onRefresh();
    }
    setUploading(false);
  };

  const inputClass = "w-full bg-card border border-border rounded-xl px-3 py-2 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";

  const fileInputLabel = (file: File | null, label: string) => (
    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors border border-border rounded-xl px-3 py-2 bg-card">
      <Upload className="w-4 h-4" />
      <span className="truncate">{file ? file.name : label}</span>
      <input
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          return f;
        }}
      />
    </label>
  );

  const renderFlightCard = (item: LogisticsItem) => {
  // Correctly splits using the dot
  const noteParts = (item.notes || "").split(" · ");
  const airline = noteParts[0] || "Airline";
  const route = noteParts[1] || "";
  const arrivalTime = noteParts[2] || "";

  const [originIata, destIata] = route.split(">").map(s => s.trim());

  return (
    <GlassCard key={item.id} hover={false} className="p-5 group">
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          {/* Header Row: Airline & Flight No */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plane className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest leading-none mb-1">
                {airline}
              </p>
              <p className="text-foreground font-bold text-sm leading-none uppercase">
                {item.flight_number}
              </p>
            </div>
          </div>

          {/* 3-STACK GRID: Codes > Labels > Times */}
          {/* max-w-[260px] ensures they don't drift too far apart */}
          <div className="grid grid-cols-2 gap-x-10 max-w-[260px] pl-1">
            {/* Top: Airport Codes */}
            <div className="text-xl font-bold text-foreground tracking-tight">{originIata || "—"}</div>
            <div className="text-xl font-bold text-foreground tracking-tight text-right">{destIata || "—"}</div>

            {/* Middle: Small Labels */}
            <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">Departs</div>
            <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5 text-right">Lands</div>

            {/* Bottom: Times */}
            <div className="text-xl font-bold text-foreground tabular-nums tracking-tight">{item.flight_time || "—"}</div>
            <div className="text-xl font-bold text-foreground tabular-nums tracking-tight text-right">{arrivalTime || "—"}</div>
          </div>

          {/* Footer: Terminal & Gate */}
          <div className="mt-5 pt-3 border-t border-white/5 flex gap-5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
            <span>Terminal: <span className="text-foreground">{item.terminal || "1"}</span></span>
            <span>Gate: <span className="text-foreground">{item.gate || "TBA"}</span></span>
          </div>
        </div>

        <button onClick={() => handleDelete(item.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </GlassCard>
  );
};

  const renderHotelCard = (item: LogisticsItem) => {
    const mapsLink = item.notes && item.notes.startsWith("http") ? item.notes : null;
    const mapsQuery = encodeURIComponent((item.hotel_name || "") + (item.hotel_address ? " " + item.hotel_address : ""));

    return (
      <GlassCard key={item.id} hover={false} className="p-4 group">
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Hotel className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-foreground font-semibold text-sm">{item.hotel_name || "Hotel"}</p>
              {item.hotel_address && <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{item.hotel_address}</p>}
              <div className="flex gap-3 mt-1">
                {mapsLink ? (
                  <a href={mapsLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Link2 className="w-3 h-3" /> Google Maps
                  </a>
                ) : (item.hotel_name || item.hotel_address) ? (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" /> View on Maps
                  </a>
                ) : null}
                {item.file_url && (
                  <a href={item.file_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <FileText className="w-3 h-3" /> View File
                  </a>
                )}
              </div>
            </div>
          </div>
          <button onClick={() => handleDelete(item.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </GlassCard>
    );
  };

  const renderBookingCard = (item: LogisticsItem) => (
    <GlassCard key={item.id} hover={false} className="p-4 group">
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <FileText className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-foreground font-semibold text-sm">{item.booking_title || "Booking"}</p>
            {item.notes && !item.notes.startsWith("http") && <p className="text-xs text-muted-foreground mt-0.5">{item.notes}</p>}
            <div className="flex gap-2 mt-1">
              {item.file_url ? (
                <a href={item.file_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> View File
                </a>
              ) : (
                <button
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*,.pdf";
                    input.onchange = (e) => {
                      const f = (e.target as HTMLInputElement).files?.[0];
                      if (f) handleFileUpload(item.id, f);
                    };
                    input.click();
                  }}
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" /> Attach file
                </button>
              )}
            </div>
          </div>
        </div>
        <button onClick={() => handleDelete(item.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </GlassCard>
  );

  return (
    <div className="space-y-8">
      {/* Flights */}
      <div>
        <h3 className="text-label mb-3 flex items-center gap-2"><Plane className="w-3.5 h-3.5" /> Flights</h3>
        <div className="space-y-3">
          {flights.map(renderFlightCard)}
          {addingType === "flight" ? (
            <GlassCard hover={false} className="p-4">
              <div className="relative z-10 space-y-4">
                
                {/* ROW 1: Flight Number & Lookup */}
                <div className="flex gap-2">
                  <input 
                    value={form.flightNumber || ""} 
                    onChange={(e) => setForm({ ...form, flightNumber: e.target.value.toUpperCase() })} 
                    placeholder="Flight Number (e.g. PR336)" 
                    className={`${inputClass} flex-1 uppercase`} 
                  />
                  <button
                    onClick={handleFlightLookup}
                    disabled={lookingUp || !form.flightNumber?.trim()}
                    className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-primary/20 transition-all disabled:opacity-50 shrink-0"
                  >
                    {lookingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Lookup
                  </button>
                </div>
                
                {/* Add this above the Time row in your Flight Form */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">From</label>
                    <input 
                      value={form.origin || ""} 
                      onChange={(e) => setForm({ ...form, origin: e.target.value.toUpperCase() })} 
                      placeholder="MNL" 
                      className={`${inputClass} uppercase`}
                      maxLength={3}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">To</label>
                    <input 
                      value={form.destination || ""} 
                      onChange={(e) => setForm({ ...form, destination: e.target.value.toUpperCase() })} 
                      placeholder="HKG" 
                      className={`${inputClass} uppercase`}
                      maxLength={3}
                    />
                  </div>
                </div>

                {/* ROW 2: Departure & Arrival (The most important row) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Departure Time</label>
                    <input 
                      value={form.flightTime || ""} 
                      onChange={(e) => setForm({ ...form, flightTime: e.target.value })} 
                      placeholder="12:10" 
                      className={inputClass} 
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Arrival Time</label>
                    <input 
                      value={form.arrivalTime || ""} 
                      onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })} 
                      placeholder="14:30" 
                      className={inputClass} 
                      required 
                    />
                  </div>
                </div>

                {/* ROW 3: Terminal & Gate */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Terminal</label>
                    <input 
                      value={form.terminal || ""} 
                      onChange={(e) => setForm({ ...form, terminal: e.target.value })} 
                      placeholder="1" 
                      className={inputClass} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Gate</label>
                    <input 
                      value={form.gate || ""} 
                      onChange={(e) => setForm({ ...form, gate: e.target.value })} 
                      placeholder="TBA" 
                      className={inputClass} 
                    />
                  </div>
                </div>

            
                <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground italic">
                  For connecting flights, please add each flight leg separately.
                </p>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <p className="text-[10px] text-amber-200/70 leading-tight">
                    <strong>Note:</strong> Flight data is fetched from live providers and may not be 100% accurate. Please verify all details with your official booking confirmation.
                  </p>
                </div>
              </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { setAddingType(null); setForm({}); }} className="text-muted-foreground"><X className="w-4 h-4" /></button>
                  <button onClick={handleAdd} className="px-4 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-medium flex items-center gap-1"><Check className="w-4 h-4" /> Save</button>
                </div>
              </div>
            </GlassCard>
          ) : (
            <button onClick={() => { setAddingType("flight"); setForm({}); }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Plus className="w-4 h-4" /> Add Flight
            </button>
          )}
        </div>
      </div>

      {/* Hotels */}
      <div>
        <h3 className="text-label mb-3 flex items-center gap-2"><Hotel className="w-3.5 h-3.5" /> Hotels</h3>
        <div className="space-y-3">
          {hotels.map(renderHotelCard)}
          {addingType === "hotel" ? (
            <GlassCard hover={false} className="p-4">
              <div className="relative z-10 space-y-3">
                <input value={form.hotelName || ""} onChange={(e) => setForm({ ...form, hotelName: e.target.value })} placeholder="Hotel Name" className={inputClass} />
                <input value={form.hotelAddress || ""} onChange={(e) => setForm({ ...form, hotelAddress: e.target.value })} placeholder="Address (optional)" className={inputClass} />
                <input value={form.mapsLink || ""} onChange={(e) => setForm({ ...form, mapsLink: e.target.value })} placeholder="Google Maps Link (optional)" className={inputClass} />
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors border border-border rounded-xl px-3 py-2 bg-card">
                  <Upload className="w-4 h-4 shrink-0" />
                  <span className="truncate">{hotelFile ? hotelFile.name : "Attach file (optional)"}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setHotelFile(f);
                    }}
                  />
                </label>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { setAddingType(null); setForm({}); setHotelFile(null); }} className="text-muted-foreground"><X className="w-4 h-4" /></button>
                  <button onClick={handleAdd} className="px-4 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-medium flex items-center gap-1"><Check className="w-4 h-4" /> Save</button>
                </div>
              </div>
            </GlassCard>
          ) : (
            <button onClick={() => { setAddingType("hotel"); setForm({}); setHotelFile(null); }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Plus className="w-4 h-4" /> Add Hotel
            </button>
          )}
        </div>
      </div>

      {/* Bookings */}
      <div>
        <h3 className="text-label mb-3 flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Bookings</h3>
        <div className="space-y-3">
          {bookings.map(renderBookingCard)}
          {addingType === "booking" ? (
            <GlassCard hover={false} className="p-4">
              <div className="relative z-10 space-y-3">
                <input value={form.bookingTitle || ""} onChange={(e) => setForm({ ...form, bookingTitle: e.target.value })} placeholder="Booking Title" className={inputClass} />
                <input value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes (optional)" className={inputClass} />
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors border border-border rounded-xl px-3 py-2 bg-card">
                  <Upload className="w-4 h-4 shrink-0" />
                  <span className="truncate">{bookingFile ? bookingFile.name : "Attach file (optional)"}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setBookingFile(f);
                    }}
                  />
                </label>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { setAddingType(null); setForm({}); setBookingFile(null); }} className="text-muted-foreground"><X className="w-4 h-4" /></button>
                  <button onClick={handleAdd} className="px-4 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-medium flex items-center gap-1"><Check className="w-4 h-4" /> Save</button>
                </div>
              </div>
            </GlassCard>
          ) : (
            <button onClick={() => { setAddingType("booking"); setForm({}); setBookingFile(null); }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Plus className="w-4 h-4" /> Add Booking
            </button>
          )}
        </div>
      </div>

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
        </div>
      )}
    </div>
  );
};

export default LogisticsTab;
