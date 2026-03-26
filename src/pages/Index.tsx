import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Route, LogOut, User, Loader2 } from "lucide-react";
import TravelCard from "@/components/TravelCard";
import AddTripDialog from "@/components/AddTripDialog";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { isAfter, parseISO, startOfDay } from "date-fns";

interface TripRow {
  id: string;
  destination: string;
  country: string;
  date: string;
  start_date: string;
  end_date: string;
  cover_image_url: string | null;
}

const Index = () => {
  const { user, nickname, signOut } = useAuth();
  const [trips, setTrips] = useState<TripRow[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // FIX 3: Add the .eq('user_id', user.id) filter to prevent data leaks
  const fetchTrips = async () => {
    if (!user?.id) return; // Guard: Don't fetch if no user is logged in

    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("user_id", user.id) // ONLY fetch trips belonging to this user
      .order("start_date", { ascending: true });

    if (error) {
      toast.error("Failed to load trips");
    } else {
      setTrips(data || []);
    }
    setLoading(false);
  };

  // Re-run fetch whenever the user object changes (e.g., after login)
  useEffect(() => { 
    if (user) {
      fetchTrips(); 
    } else {
      setLoading(false);
    }
  }, [user]);

  // FIX 4: Secure the insertion with an explicit user_id stamp
  const handleAddTrip = async (
    destination: string,
    country: string,
    startDate: string,
    endDate: string,
    coverImageUrl?: string,
  ) => {
    // Guard: Prevent ownerless rows
    if (!user?.id) {
      toast.error("You must be logged in to create a trip");
      return;
    }

    const { error } = await supabase.from("trips").insert({
      destination,
      country,
      date: startDate,
      start_date: startDate,
      end_date: endDate,
      cover_image_url: coverImageUrl || null,
      user_id: user.id, // Explicitly pass the ID
    }).select().single();

    if (error) {
      console.error("Insert error:", error);
      toast.error("Failed to create trip");
      return;
    }

    toast.success("Trip created!");
    fetchTrips();
  };

  const handleDeleteTrip = async (tripId: string) => {
    const { error } = await supabase.from("trips").delete().eq("id", tripId);
    if (error) {
      toast.error("Failed to delete trip");
    } else {
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
      toast.success("Trip deleted");
    }
  };

  const today = startOfDay(new Date());
  const activeTrips = useMemo(() => trips.filter((t) => !isAfter(today, parseISO(t.end_date))), [trips, today]);
  const pastTrips = useMemo(() => trips.filter((t) => isAfter(today, parseISO(t.end_date))), [trips, today]);

  const displayName = nickname || "Traveler";

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-start justify-between"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-2 h-11"> {/* h-9 matches the circle button height */}
              <Route className="w-6 h-6 sm:w-5 sm:h-5 text-primary" strokeWidth={1.5} />
              <span className="font-logo text-base sm:text-sm tracking-[0.15em]">
                ROAMLY
              </span> 
            </div>
            <div className="mt-2 sm:mt-3">
            <h1 className="text-3xl sm:text-4xl leading-tight flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
              <span className="text-4xl sm:text-4xl font-bold text-foreground tracking-tight whitespace-nowrap">
          Hi, {displayName}!
        </span>
              <span className="text-2xl sm:text-3xl font-light text-slate-600 dark:text-muted-foreground tracking-tight whitespace-nowrap mt-1.5 opacity-90">
  Where to next?
</span>
            </h1>
          </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-4">
            {/* Desktop Add Trip button */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setDialogOpen(true)}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold glow-accent hover:brightness-110 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Trip
            </motion.button>
            <ThemeToggle />
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={signOut}
              className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : trips.length === 0 ? (
          <div className="glass-card p-12 flex flex-col items-center justify-center text-center relative">
            <div className="relative z-10">
              <Route className="w-12 h-12 text-muted-foreground mb-4 mx-auto" />
              <p className="text-foreground font-semibold mb-1">No plans yet, {displayName}?</p>
              <p className="text-body text-sm mb-6">Let's fix that!</p>
              <motion.button
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                onClick={() => setDialogOpen(true)}
                className="w-14 h-14 bg-primary rounded-full flex items-center justify-center glow-accent mx-auto"
              >
                <Plus className="w-7 h-7 text-primary-foreground" />
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Trips */}
            {activeTrips.length > 0 && (
              <div>
                <p className="text-label mb-4">{activeTrips.length} Active {activeTrips.length === 1 ? "Trip" : "Trips"}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {activeTrips.map((trip, i) => (
                    <TravelCard key={trip.id} trip={trip} index={i} onDelete={handleDeleteTrip} />
                  ))}
                </div>
              </div>
            )}

            {/* Past Adventures */}
            {pastTrips.length > 0 && (
              <div>
                <div className="flex items-center gap-3 my-4">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-label text-xs">Past Adventures</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {pastTrips.map((trip, i) => (
                    <TravelCard key={trip.id} trip={trip} index={i} isPast onDelete={handleDeleteTrip} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile FAB only */}
      {trips.length > 0 && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setDialogOpen(true)}
          className="sm:hidden fixed bottom-8 right-8 w-14 h-14 bg-primary rounded-full flex items-center justify-center glow-accent shadow-2xl z-40"
        >
          <Plus className="w-6 h-6 text-primary-foreground" />
        </motion.button>
      )}

      <AddTripDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onAdd={handleAddTrip} />
    </div>
  );
};

export default Index;
