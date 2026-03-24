import { useRef } from "react";
import { motion } from "framer-motion";
import { ImagePlus, Trash2 } from "lucide-react";

interface TripPhoto {
  id: string;
  url: string;
}

interface GalleryTabProps {
  photos: TripPhoto[];
  onUpload: (files: FileList) => void;
  onDelete: (photoId: string) => void;
  readOnly?: boolean;
}

const GalleryTab = ({ photos, onUpload, onDelete, readOnly = false }: GalleryTabProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    onUpload(files);
    e.target.value = "";
  };

  if (photos.length === 0) {
    return (
      <div className="columns-2 md:columns-3 gap-4 space-y-4">
        {!readOnly && (
          <>
            <input ref={inputRef} type="file" multiple accept="image/*" onChange={handleFiles} className="hidden" />
            <button
              onClick={() => inputRef.current?.click()}
              className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-muted-foreground/30 hover:border-primary flex flex-col items-center justify-center gap-3 transition-colors group break-inside-avoid"
            >
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <ImagePlus className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-sm text-muted-foreground group-hover:text-primary font-medium transition-colors">Add Photos</span>
            </button>
          </>
        )}
        {readOnly && (
          <p className="text-sm text-muted-foreground col-span-full text-center py-8">No photos yet.</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="columns-2 md:columns-3 gap-4 space-y-4">
        {photos.map((photo, i) => (
          <div key={photo.id} className="relative group break-inside-avoid">
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              src={photo.url}
              alt={`Memory ${i + 1}`}
              className="w-full rounded-2xl hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
            />
            {!readOnly && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(photo.id)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive/80 backdrop-blur-md flex items-center justify-center text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>
        ))}

        {/* Dashed empty slot to add more photos */}
        {!readOnly && (
          <>
            <input ref={inputRef} type="file" multiple accept="image/*" onChange={handleFiles} className="hidden" />
            <button
              onClick={() => inputRef.current?.click()}
              className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-muted-foreground/30 hover:border-primary flex flex-col items-center justify-center gap-2 transition-colors group break-inside-avoid"
            >
              <ImagePlus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-xs text-muted-foreground group-hover:text-primary font-medium transition-colors">Add More</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default GalleryTab;
