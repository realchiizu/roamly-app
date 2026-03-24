import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const EMOJI_CATEGORIES = {
  Transit: ["✈️", "🛫", "🚆", "🚌", "🚕", "🚶", "🚲"],
  Dining: ["☕", "🥐", "🍜", "🍣", "🍱", "🍻", "🍦"],
  Activities: ["⛩️", "🏰", "🏔️", "🌊", "🛍️", "🎡", "📸"],
  General: ["🏨", "🛌", "🎫", "💴", "🎒", "📍", "✨"],
};

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

const EmojiPicker = ({ value, onChange }: EmojiPickerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card text-sm hover:border-primary/50 transition-colors"
        >
          <span className="text-lg">{value}</span>
          <span className="text-muted-foreground text-xs">Select Emoji</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="space-y-3">
          {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
            <div key={category}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">{category}</p>
              <div className="flex flex-wrap gap-1">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => { onChange(emoji); setOpen(false); }}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-colors ${value === emoji ? "bg-primary/20 ring-1 ring-primary" : "hover:bg-secondary"}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
