import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import GlassCard from "./GlassCard";
import EmojiPicker from "./EmojiPicker";

interface ItineraryItem {
  id: string;
  day_label: string;
  time: string;
  title: string;
  description: string;
  icon: string;
}

interface ItineraryTabProps {
  days: Record<string, ItineraryItem[]>;
  onAdd: (dayLabel: string, time: string, title: string, description: string, icon: string) => void;
  onUpdate: (id: string, updates: Partial<ItineraryItem>) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
}

const ItineraryTab = ({ days, onAdd, onUpdate, onDelete, readOnly = false }: ItineraryTabProps) => {
  const [addingDay, setAddingDay] = useState<string | null>(null);
  const [newDayLabel, setNewDayLabel] = useState("");
  const [showNewDay, setShowNewDay] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ time: "09:00", title: "", description: "", icon: "📍" });

  const dayKeys = Object.keys(days).sort();

  const handleSubmitNew = () => {
    if (!form.title) return;
    const day = addingDay || newDayLabel || `Day ${dayKeys.length + 1}`;
    onAdd(day, form.time, form.title, form.description, form.icon);
    setForm({ time: "09:00", title: "", description: "", icon: "📍" });
    setAddingDay(null);
    setShowNewDay(false);
    setNewDayLabel("");
  };

  const handleSaveEdit = (item: ItineraryItem) => {
    onUpdate(item.id, { time: form.time, title: form.title, description: form.description, icon: form.icon });
    setEditId(null);
  };

  const startEdit = (item: ItineraryItem) => {
    setEditId(item.id);
    setForm({ time: item.time, title: item.title, description: item.description, icon: item.icon });
  };

  const renderForm = (onSubmit: () => void, onCancel: () => void) => (
    <GlassCard hover={false} className="p-5 space-y-3">
      <div className="relative z-10 space-y-3">
        <div className="flex gap-2">
          <input
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            placeholder="Time"
            className="w-24 bg-card border border-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title"
            className="flex-1 bg-card border border-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description"
          className="w-full bg-card border border-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <EmojiPicker value={form.icon} onChange={(emoji) => setForm({ ...form, icon: emoji })} />
        <div className="flex gap-2 justify-end">
          {/* FIX 1: Added type="button" and e.preventDefault() */}
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); onCancel(); }} 
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
          
          {/* FIX 2: Added type="button" and e.preventDefault() */}
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); onSubmit(); }} 
            className="px-4 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-medium flex items-center gap-1"
          >
            <Check className="w-4 h-4" /> Save
          </button>
        </div>
      </div>
    </GlassCard>
  );

  return (
    <div className="space-y-10">
      {dayKeys.map((day) => (
        <div key={day}>
          <h3 className="text-label mb-6">{day}</h3>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-secondary" />
            <div className="space-y-6">
              {days[day].map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, type: "spring", stiffness: 200, damping: 20 }}
                  className="relative flex items-start"
                >
                  <div className="relative z-10 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center text-sm shrink-0">
                    {item.icon}
                  </div>

                  {editId === item.id ? (
                    <div className="ml-4 flex-1">
                      {renderForm(() => handleSaveEdit(item), () => setEditId(null))}
                    </div>
                  ) : (
                    <GlassCard hover={false} className="ml-4 flex-1 p-5 group">
                      <div className="flex items-start justify-between relative z-10">
                        <div>
                          <span className="text-xs font-medium text-primary tabular-nums">{item.time}</span>
                          <h4 className="text-foreground font-semibold mt-1">{item.title}</h4>
                          <p className="text-body text-sm mt-1">{item.description}</p>
                        </div>
                        {!readOnly && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(item)} className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => onDelete(item.id)} className="w-8 h-8 rounded-full hover:bg-destructive/20 flex items-center justify-center text-muted-foreground hover:text-destructive">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </GlassCard>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {addingDay === day && (
            <div className="mt-4 ml-12">
              {renderForm(handleSubmitNew, () => setAddingDay(null))}
            </div>
          )}

          {!readOnly && addingDay !== day && (
            <button
              onClick={() => { setAddingDay(day); setForm({ time: "09:00", title: "", description: "", icon: "📍" }); }}
              className="mt-4 ml-12 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Event
            </button>
          )}
        </div>
      ))}

      {/* Add new day */}
      {!readOnly && (
        showNewDay ? (
          <div className="space-y-3">
            <input
              value={newDayLabel}
              onChange={(e) => setNewDayLabel(e.target.value)}
              placeholder={`Day ${dayKeys.length + 1}`}
              className="bg-card border border-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <div className="ml-0">
              {renderForm(handleSubmitNew, () => { setShowNewDay(false); setNewDayLabel(""); })}
            </div>
          </div>
        ) : (
          <button
            onClick={() => { setShowNewDay(true); setNewDayLabel(`Day ${dayKeys.length + 1}`); setForm({ time: "09:00", title: "", description: "", icon: "📍" }); }}
            className="glass-card px-6 py-4 w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors relative z-10"
          >
            <Plus className="w-4 h-4" /> Add New Day
          </button>
        )
      )}
    </div>
  );
};

export default ItineraryTab;
