import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Route, Copy } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ItineraryTab from "@/components/ItineraryTab";
import GalleryTab from "@/components/GalleryTab";
import { TripDetailSkeleton } from "@/components/LoadingSkeleton";
import tokyoImg from "@/assets/tokyo.jpg";
import parisImg from "@/assets/paris.jpg";
import santoriniImg from "@/assets/santorini.jpg";

const defaultImages = [tokyoImg, parisImg, santoriniImg];

interface TripData {
  id: string;
  destination: string;
  country: string;
  start_date: string;
  end_date: string;
  cover_image_url: string | null;
}

interface ItineraryItem {
  id: string;
  day_label: string;
  time: string;
  title: string;
  description: string;
  icon: string;
  sort_order: number;
}

interface TripPhoto {
  id: string;
  url: string;
  storage_path: string;
}

const SharedTrip = () => {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trip, setTrip] = useState<TripData | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [photos, setPhotos] = useState<TripPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloning, setCloning] = useState(false);
  const [activeTab, setActiveTab] = useState<"Itinerary" | "Gallery">("Itinerary");

  useEffect(() => {
    const load = async () => {
      if (!shareId) return;
      const { data: tripData } = await supabase
        .from("trips")
        .select("*")
        .eq("share_id", shareId)
        .single();

      if (!tripData) {
        setLoading(false);
        return;
      }

      setTrip(tripData);

      const [itinRes, photoRes] = await Promise.all([
        supabase.from("itinerary_items").select("*").eq("trip_id", tripData.id).order("sort_order"),
        supabase.from("trip_photos").select("*").eq("trip_id", tripData.id).order("created_at"),
      ]);

      setItinerary(itinRes.data || []);
      setPhotos(photoRes.data || []);
      setLoading(false);
    };
    load();
  }, [shareId]);

  const handleClone = async () => {
    if (!user || !trip) {
      toast.error("Sign in to copy this itinerary");
      navigate(`/auth?returnTo=/shared/${shareId}`);
      return;
    }

    // Safety check: Don't clone if the itinerary didn't load
    if (itinerary.length === 0) {
      toast.error("No itinerary items found to copy.");
      return;
    }

    setCloning(true);
    try {
      const { data: newTrip, error: tripErr } = await supabase
        .from("trips")
        .insert({
          destination: trip.destination,
          country: trip.country,
          date: trip.start_date,
          start_date: trip.start_date,
          end_date: trip.end_date,
          cover_image_url: trip.cover_image_url,
          user_id: user.id,
        })
        .select()
        .single();

      if (tripErr || !newTrip) throw tripErr;

      if (itinerary.length > 0) {
        const rows = itinerary.map((item, i) => ({
          trip_id: newTrip.id,
          user_id: user.id,
          day_label: item.day_label,
          time: item.time,
          title: item.title,
          description: item.description,
          icon: item.icon,
          sort_order: i,
        }));
        await supabase.from("itinerary_items").insert(rows);
      }

      toast.success("Trip copied to your Roamly!");
      navigate(`/trip/${newTrip.id}`);
    } catch {
      toast.error("Failed to copy trip");
    }
    setCloning(false);
  };

  const daysToGo = useMemo(() => {
    if (!trip) return 0;
    return differenceInDays(parseISO(trip.start_date), new Date());
  }, [trip]);

  if (loading) return <TripDetailSkeleton />;

  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Route className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-semibold">Trip not found</p>
          <p className="text-muted-foreground text-sm mt-1">This link may have expired or is invalid.</p>
        </div>
      </div>
    );
  }

  const image = trip.cover_image_url || defaultImages[trip.destination.length % defaultImages.length];
  const itineraryDays = itinerary.reduce<Record<string, ItineraryItem[]>>((acc, item) => {
    if (!acc[item.day_label]) acc[item.day_label] = [];
    acc[item.day_label].push(item);
    return acc;
  }, {});

  const tabs = ["Itinerary", "Gallery"] as const;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-[35vh] sm:h-[45vh] overflow-hidden">
        <img src={image} alt={trip.destination} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <Route className="w-6 h-6 sm:w-5 sm:h-5 text-primary" strokeWidth={1.5} />
              <span className="font-logo text-base sm:text-sm tracking-[0.15em]">
                ROAMLY
              </span> 
        </div>

        <div className="absolute bottom-6 left-6 right-6 z-10">
          <p className="text-label mb-1">{trip.country}</p>
          <h1 className="text-display text-3xl sm:text-5xl">{trip.destination}</h1>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <span className="text-sm text-muted-foreground">
              {new Date(trip.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} — {new Date(trip.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <span className="bg-card/50 backdrop-blur-md px-3 py-1 rounded-full text-xs text-foreground tabular-nums border border-border/50">
              {daysToGo > 0 ? `${daysToGo}d to go` : "Completed"}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 mt-8">
        {/* Clone button */}
        <div className="mb-6 flex justify-end">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleClone}
            disabled={cloning}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium glow-accent flex items-center gap-2 disabled:opacity-50"
          >
            {cloning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
            Copy to My Roamly
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="glass-card p-1 flex gap-0.5 mb-8">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className="relative flex-1 py-2 text-sm font-medium rounded-xl transition-colors z-10">
              {activeTab === tab && (
                <motion.div layoutId="sharedActiveTab" transition={{ type: "spring", stiffness: 400, damping: 30 }} className="absolute inset-0 bg-primary/10 rounded-xl" />
              )}
              <span className={`relative z-10 ${activeTab === tab ? "text-primary font-semibold" : "text-muted-foreground"}`}>{tab}</span>
            </button>
          ))}
        </div>

        <div className="pb-24">
          {activeTab === "Itinerary" && (
            <ItineraryTab days={itineraryDays} onAdd={() => {}} onUpdate={() => {}} onDelete={() => {}} readOnly />
          )}
          {activeTab === "Gallery" && (
            <GalleryTab photos={photos} onUpload={() => {}} onDelete={() => {}} readOnly />
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedTrip;
