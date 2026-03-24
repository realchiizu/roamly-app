import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Search, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AddTripDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (destination: string, country: string, startDate: string, endDate: string, coverImageUrl?: string) => Promise<void>;
}


const AddTripDialog = ({ open, onClose, onAdd }: AddTripDialogProps) => {
  const [destination, setDestination] = useState("");
  const [country, setCountry] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  

  // Unsplash
  const [photos, setPhotos] = useState<{ id: string; url: string; thumb: string }[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [searchingPhotos, setSearchingPhotos] = useState(false);

  const handleSearchPhotos = async () => {
  if (!destination.trim()) return;
  setSearchingPhotos(true);
  try {
    // Note: We remove the manual 'headers' block. 
    // The Supabase client handles this automatically IF the keys are set.
    const { data, error } = await supabase.functions.invoke("search-photos", {
      body: { query: destination.trim() },
    });

    if (error) {
      console.error("Function error:", error);
      return;
    }

    if (data?.results) {
      setPhotos(data.results);
      setSelectedPhoto(null);
    }
  } catch (err) {
    console.error("Search failed:", err);
  } finally {
    setSearchingPhotos(false);
  }
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (destination && country && startDate && endDate) {
      setLoading(true);
      await onAdd(destination, country, startDate, endDate, selectedPhoto || undefined);
      setDestination("");
      setCountry("");
      setStartDate("");
      setEndDate("");
      setPhotos([]);
      setSelectedPhoto(null);
      
      setLoading(false);
      onClose();
    }
  };

  const inputClass = "w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="glass-card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-foreground">New Trip</h2>
                  <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-label block mb-1.5">Destination 
          
                    </label>
                    <div className="flex gap-2">
                      <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Tokyo" className={inputClass} />
                      <button
                        type="button"
                        onClick={handleSearchPhotos}
                        disabled={searchingPhotos || !destination.trim()}
                        className="shrink-0 px-3 py-2 bg-secondary text-foreground rounded-xl text-xs font-medium flex items-center gap-1 disabled:opacity-40 hover:bg-secondary/80 transition-colors"
                      >
                        {searchingPhotos ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                        Photos
                      </button>
                    </div>
                    {/* NEW: Subtle hint for the user */}
                      <span className="text-[10px] text-muted-foreground font-normal italic">
                        Tap "Photos" to pick a cover image
                      </span>
                  </div>

                  {/* Unsplash results */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-5 gap-2">
                      {photos.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedPhoto(p.url)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedPhoto === p.url ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-primary/40"}`}
                        >
                          <img src={p.thumb} alt="" className="w-full h-full object-cover" />
                          {selectedPhoto === p.url && (
                            <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                              <Check className="w-5 h-5 text-primary-foreground" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  <div>
                    <label className="text-label block mb-1.5">Country</label>
                    <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Japan" className={inputClass} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-label block mb-1.5">Start Date</label>
                      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-label block mb-1.5">End Date</label>
                      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} className={inputClass} />
                    </div>
                  </div>


                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-full text-sm font-semibold glow-accent flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create Trip
                  </motion.button>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddTripDialog;
