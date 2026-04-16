import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Sparkles, Share2 } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ItineraryTab from "@/components/ItineraryTab";
import PackingListTab from "@/components/PackingListTab";
import GalleryTab from "@/components/GalleryTab";
import LogisticsTab from "@/components/LogisticsTab";
import tokyoImg from "@/assets/tokyo.jpg";
import parisImg from "@/assets/paris.jpg";
import santoriniImg from "@/assets/santorini.jpg";

const defaultImages = [tokyoImg, parisImg, santoriniImg];

const tabs = ["Itinerary", "Packing", "Logistics", "Gallery"] as const;
type TabName = (typeof tabs)[number];

interface TripData {
  id: string;
  destination: string;
  country: string;
  date: string;
  start_date: string;
  end_date: string;
  cover_image_url: string | null;
  share_id?: string | null;
}

interface ItineraryItem { id: string; day_label: string; time: string; title: string; description: string; icon: string; sort_order: number; }
interface PackingItem { id: string; category: string; name: string; packed: boolean; sort_order: number; }
interface TripPhoto { id: string; url: string; storage_path: string; }
interface LogisticsItem { id: string; type: string; flight_number?: string | null; flight_time?: string | null; terminal?: string | null; gate?: string | null; hotel_name?: string | null; hotel_address?: string | null; booking_title?: string | null; file_url?: string | null; file_storage_path?: string | null; notes?: string | null; }

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabName>("Itinerary");
  const [trip, setTrip] = useState<TripData | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [photos, setPhotos] = useState<TripPhoto[]>([]);
  const [logistics, setLogistics] = useState<LogisticsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  const loadAll = async () => {
    if (!id) return;
    
    // Notice: We don't check for 'user' here anymore because 
    // we want guests to see the shared data.
    const [tripRes, itinRes, packRes, photoRes, logRes] = await Promise.all([
      supabase.from("trips").select("*").eq("id", id).single(),
      supabase.from("itinerary_items").select("*").eq("trip_id", id).order("sort_order"),
      supabase.from("packing_items").select("*").eq("trip_id", id).order("sort_order"),
      supabase.from("trip_photos").select("*").eq("trip_id", id).order("created_at"),
      supabase.from("trip_logistics").select("*").eq("trip_id", id).order("sort_order"),
    ]);

    if (tripRes.data) setTrip(tripRes.data);
    setItinerary(itinRes.data || []);
    setPackingItems(packRes.data || []);
    setPhotos(photoRes.data || []);
    setLogistics(logRes.data || []);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, [id]);

  const daysToGo = useMemo(() => {
    if (!trip) return 0;
    return differenceInDays(parseISO(trip.start_date), new Date());
  }, [trip]);

  const tripDuration = useMemo(() => {
    if (!trip) return 1;
    return Math.max(1, differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1);
  }, [trip]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  if (!trip) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-foreground">Trip not found</p></div>;

  const image = trip.cover_image_url || defaultImages[trip.destination.length % defaultImages.length];
  const itineraryDays = itinerary.reduce<Record<string, ItineraryItem[]>>((acc, item) => { if (!acc[item.day_label]) acc[item.day_label] = []; acc[item.day_label].push(item); return acc; }, {});
  const packingCategories = packingItems.reduce<Record<string, PackingItem[]>>((acc, item) => { if (!acc[item.category]) acc[item.category] = []; acc[item.category].push(item); return acc; }, {});
  const totalPacked = packingItems.filter((i) => i.packed).length;

  const handleTogglePacked = async (itemId: string) => {
    const item = packingItems.find((i) => i.id === itemId);
    if (!item) return;
    const newPacked = !item.packed;
    setPackingItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, packed: newPacked } : i)));
    await supabase.from("packing_items").update({ packed: newPacked }).eq("id", itemId);
  };

  const handleAddItineraryItem = async (dayLabel: string, time: string, title: string, description: string, icon: string) => {
    if (!user) {
      toast.error("You must be logged in to edit this trip!");
      return;
    }
  };

  const handleUpdateItineraryItem = async (itemId: string, updates: Partial<ItineraryItem>) => {
    await supabase.from("itinerary_items").update(updates).eq("id", itemId);
    setItinerary((prev) => prev.map((i) => (i.id === itemId ? { ...i, ...updates } : i)));
  };

  const handleDeleteItineraryItem = async (itemId: string) => {
    await supabase.from("itinerary_items").delete().eq("id", itemId);
    setItinerary((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleAddPackingItem = async (category: string, name: string) => {
    const { data } = await supabase.from("packing_items").insert({ trip_id: id!, user_id: user!.id, category, name, sort_order: packingItems.length }).select().single();
    if (data) setPackingItems((prev) => [...prev, data]);
  };

  const handleUpdatePackingItem = async (itemId: string, updates: { name?: string; category?: string }) => {
    await supabase.from("packing_items").update(updates).eq("id", itemId);
    setPackingItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, ...updates } : i)));
  };

  const handleDeletePackingItem = async (itemId: string) => {
    await supabase.from("packing_items").delete().eq("id", itemId);
    setPackingItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleUploadPhotos = async (files: FileList) => {
    for (const file of Array.from(files)) {
      const filePath = `${user!.id}/${id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("trip-photos").upload(filePath, file);
      if (uploadError) continue;
      const { data: urlData } = supabase.storage.from("trip-photos").getPublicUrl(filePath);
      const { data } = await supabase.from("trip_photos").insert({ trip_id: id!, user_id: user!.id, storage_path: filePath, url: urlData.publicUrl }).select().single();
      if (data) setPhotos((prev) => [...prev, data]);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    const photo = photos.find((p) => p.id === photoId);
    if (photo) {
      await supabase.storage.from("trip-photos").remove([photo.storage_path]);
      await supabase.from("trip_photos").delete().eq("id", photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    }
  };

  const handleSuggestItinerary = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("suggest-itinerary", {
        body: { destination: trip.destination, days: tripDuration },
      });
      if (error) throw error;
      const items = data?.items || [];
      if (items.length === 0) { toast.error("No suggestions generated"); setAiLoading(false); return; }

      const rows = items.map((item: any, i: number) => ({
        trip_id: id!,
        user_id: user!.id,
        day_label: item.day_label || `Day ${Math.floor(i / 3) + 1}`,
        time: item.time || "09:00",
        title: item.title || "Activity",
        description: item.description || "",
        icon: item.icon || "📍",
        sort_order: itinerary.length + i,
      }));

      const { data: inserted } = await supabase.from("itinerary_items").insert(rows).select();
      if (inserted) setItinerary((prev) => [...prev, ...inserted]);
      toast.success(`Added ${items.length} suggested activities!`);
    } catch (e: any) {
      toast.error(e?.message || "Failed to generate suggestions");
    }
    setAiLoading(false);
  };

  const handleShareTrip = () => {
    if (!trip.share_id) return;
    const url = `${window.location.origin}/shared/${trip.share_id}`;
    navigator.clipboard.writeText(url);
    toast.success("Share link copied!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-[35vh] sm:h-[45vh] overflow-hidden">
        <img src={image} alt={trip.destination} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        <div className="absolute top-4 left-4 z-20">
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => navigate("/")} className="w-10 h-10 rounded-full bg-card/50 backdrop-blur-md flex items-center justify-center text-foreground border border-border/50">
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Share button top-right */}
        {trip.share_id && (
          <div className="absolute top-4 right-4 z-20">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleShareTrip}
              className="flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-md rounded-full text-foreground text-sm font-medium border border-border/50 hover:bg-card/70 transition-colors"
              title="Share Trip"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share Trip</span>
            </motion.button>
          </div>
        )}

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

      {/* Stats */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 -mt-4 relative z-20">
        <div className="glass-card p-4 flex items-center justify-around text-center">
          <div className="relative z-10">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Events</p>
            <p className="text-lg font-bold text-foreground tabular-nums">{itinerary.length}</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="relative z-10">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Packed</p>
            <p className="text-lg font-bold text-foreground tabular-nums">{totalPacked}/{packingItems.length}</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="relative z-10">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Photos</p>
            <p className="text-lg font-bold text-foreground tabular-nums">{photos.length}</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="relative z-10">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Duration</p>
            <p className="text-lg font-bold text-foreground tabular-nums">{tripDuration}d</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 mt-8">
        <div className="glass-card p-1 flex gap-0.5 mb-8">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className="relative flex-1 py-2 text-sm font-medium rounded-xl transition-colors z-10">
              {activeTab === tab && (
                <motion.div layoutId="activeTab" transition={{ type: "spring", stiffness: 400, damping: 30 }} className="absolute inset-0 bg-primary/10 rounded-xl" />
              )}
              <span className={`relative z-10 ${activeTab === tab ? "text-primary font-semibold" : "text-muted-foreground"}`}>{tab}</span>
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="mb-6 flex justify-end gap-2">
          {activeTab === "Itinerary" && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleSuggestItinerary}
              disabled={aiLoading}
              className="px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-medium glow-orange flex items-center gap-2 disabled:opacity-50"
            >
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Suggest Itinerary
            </motion.button>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="pb-24">
            {activeTab === "Itinerary" && <ItineraryTab days={itineraryDays} onAdd={handleAddItineraryItem} onUpdate={handleUpdateItineraryItem} onDelete={handleDeleteItineraryItem} />}
            {activeTab === "Packing" && <PackingListTab categories={packingCategories} onToggle={handleTogglePacked} onAdd={handleAddPackingItem} onUpdate={handleUpdatePackingItem} onDelete={handleDeletePackingItem} />}
            {activeTab === "Logistics" && <LogisticsTab tripId={id!} tripStartDate={trip.start_date} items={logistics} onRefresh={loadAll} />}
            {activeTab === "Gallery" && <GalleryTab photos={photos} onUpload={handleUploadPhotos} onDelete={handleDeletePhoto} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TripDetail;
