import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { differenceInDays, parseISO } from "date-fns";
import { Trash2 } from "lucide-react";
import tokyoImg from "@/assets/tokyo.jpg";
import parisImg from "@/assets/paris.jpg";
import santoriniImg from "@/assets/santorini.jpg";

const defaultImages = [tokyoImg, parisImg, santoriniImg];

function getPlaceholderImage(destination: string): string {
  const hash = destination.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return defaultImages[hash % defaultImages.length];
}

interface TravelCardProps {
  trip: {
    id: string;
    destination: string;
    country: string;
    date: string;
    start_date: string;
    end_date: string;
    cover_image_url?: string | null;
  };
  index: number;
  isPast?: boolean;
  onDelete?: (id: string) => void;
}

const TravelCard = ({ trip, index, isPast = false, onDelete }: TravelCardProps) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const daysToGo = differenceInDays(parseISO(trip.start_date), new Date());
  const image = trip.cover_image_url || getPlaceholderImage(trip.destination);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/trip/${trip.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative cursor-pointer overflow-hidden rounded-2xl shadow-lg group"
      style={{ minHeight: 220 }}
    >
      <img
        src={image}
        alt={trip.destination}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${isPast ? "grayscale group-hover:grayscale-0" : ""}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(222_47%_5%/0.7)] via-[hsl(222_47%_5%/0.2)] to-[hsl(222_47%_5%/0.3)]" />

      {/* Top-right: Days pill + Delete icon */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        {isPast ? (
          <div
            className="bg-white/15 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20 transition-all duration-300"
            style={{ transform: hovered && onDelete ? "translateX(-36px)" : "translateX(0)" }}
          >
            <span className="text-white/80 text-xs font-medium">Completed</span>
          </div>
        ) : daysToGo <= 0 ? (
          <div
            className="bg-accent/90 backdrop-blur-md rounded-full px-4 py-1.5 border border-accent/50 transition-all duration-300"
            style={{ transform: hovered && onDelete ? "translateX(-36px)" : "translateX(0)" }}
          >
            <span className="text-sm font-bold text-accent-foreground">NOW</span>
          </div>
        ) : (
          <div
            className="bg-white/15 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20 transition-all duration-300"
            style={{ transform: hovered && onDelete ? "translateX(-36px)" : "translateX(0)" }}
          >
            <span className="text-white text-xs font-semibold tabular-nums">{daysToGo} Days to Go</span>
          </div>
        )}

        {/* Delete button — appears on hover in the vacated space */}
        {onDelete && (
          <motion.button
            initial={false}
            animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => { e.stopPropagation(); onDelete(trip.id); }}
            className="absolute right-0 w-9 h-9 rounded-full bg-red-500/80 hover:bg-red-600 backdrop-blur-md flex items-center justify-center text-white shadow-lg transition-colors border border-white/10"
            style={{ pointerEvents: hovered ? "auto" : "none" }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </div>

      {/* Bottom content — Country top, Destination middle */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        <p className="text-white/80 text-[14px] font-light uppercase tracking-[0.1em] mb-1">{trip.country}</p>
        <h3 className="text-white text-[32px] font-black leading-none tracking-tighter">{trip.destination}</h3>
      </div>
    </motion.div>
  );
};

export default TravelCard;
