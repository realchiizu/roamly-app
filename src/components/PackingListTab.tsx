import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Check, X, Package } from "lucide-react";
import GlassCard from "./GlassCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PackingItem {
  id: string;
  category: string;
  name: string;
  packed: boolean;
}

interface PackingListTabProps {
  categories: Record<string, PackingItem[]>;
  onToggle: (itemId: string) => void;
  onAdd: (category: string, name: string) => void;
  onUpdate: (itemId: string, updates: { name?: string; category?: string }) => void;
  onDelete: (itemId: string) => void;
}

const TEMPLATES: Record<string, { category: string; items: string[] }> = {
  hygiene: {
    category: "Personal Hygiene",
    items: ["Hair brush", "Deodorant", "Skincare", "Tweezers", "Nail clippers", "Perfume"],
  },
  health: {
    category: "Travel Health",
    items: ["Pain reliever", "Fever reducers", "Cold/Diarrhea meds", "Prescriptions", "Sunscreen", "First aid kit"],
  },
  tech: {
    category: "Tech",
    items: ["Smartphone & charger", "Camera", "Power banks", "Universal Adapter"],
  },
  beach: {
    category: "Beach",
    items: ["Sunscreen", "Swimwear", "Beach bag", "Beach mat", "Slippers"],
  },
  docs: {
    category: "Travel Docs",
    items: ["Passport/Visa", "Driver's License", "Booking PDFs", "Travel Insurance"],
  },
  cold: {
    category: "Cold Weather",
    items: ["Thermal layers", "Gloves", "Beanie", "Heat packs", "Wool socks", "Heavy jacket"],
  },
};

const TEMPLATE_OPTIONS = [
  { id: "hygiene", label: "Personal Hygiene", icon: "🧴" },
  { id: "health", label: "Travel Health", icon: "💊" },
  { id: "tech", label: "Tech", icon: "💻" },
  { id: "beach", label: "Beach", icon: "🏖️" },
  { id: "docs", label: "Travel Docs", icon: "📄" },
  { id: "cold", label: "Cold Weather", icon: "🧤" },
];

const PackingListTab = ({ categories, onToggle, onAdd, onUpdate, onDelete }: PackingListTabProps) => {
  const [addingCategory, setAddingCategory] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  const catKeys = Object.keys(categories);
  const allItems = Object.values(categories).flat();
  const totalItems = allItems.length;
  const packedItems = allItems.filter((i) => i.packed).length;
  const progress = totalItems > 0 ? (packedItems / totalItems) * 100 : 0;

  const handleAddItem = (cat: string) => {
    if (!newItemName.trim()) return;
    onAdd(cat, newItemName.trim());
    setNewItemName("");
    setAddingCategory(null);
  };

  const handleApplyTemplate = (templateId: string) => {
    const tpl = TEMPLATES[templateId];
    if (!tpl) return;
    const existingNames = new Set(allItems.map((i) => i.name.toLowerCase()));
    let added = 0;
    tpl.items.forEach((itemName) => {
      if (!existingNames.has(itemName.toLowerCase())) {
        onAdd(tpl.category, itemName);
        existingNames.add(itemName.toLowerCase());
        added++;
      }
    });
    if (added === 0) {
      // All items already exist
    }
    setTemplateDialogOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Progress + Templates row */}
      <GlassCard hover={false} className="p-6">
        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="text-label">Packing Progress</span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {packedItems}/{totalItems} Items
            </span>
            <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground hover:text-foreground transition-colors border border-border">
                  <Package className="w-3.5 h-3.5" />
                  Use Template
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Packing Templates</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose a template to import items. Duplicates are skipped automatically.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {TEMPLATE_OPTIONS.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => handleApplyTemplate(tpl.id)}
                      className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 transition-colors text-left"
                    >
                      <span className="text-2xl">{tpl.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{tpl.label}</p>
                        <p className="text-xs text-muted-foreground">{TEMPLATES[tpl.id].items.length} items</p>
                      </div>
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden relative z-10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", bounce: 0, duration: 0.8 }}
            className="h-full bg-primary rounded-full glow-accent-sm"
          />
        </div>
      </GlassCard>

      {/* Categories */}
      {catKeys.map((category) => (
        <div key={category}>
          <h3 className="text-label mb-4">{category}</h3>
          <GlassCard hover={false} className="divide-y divide-[hsl(var(--glass-border))]">
            {categories[category].map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-4 px-5 w-full group">
                {editId === item.id ? (
                  <div className="flex items-center gap-2 flex-1 relative z-10">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 bg-[hsl(var(--glass-surface))] border border-[hsl(var(--glass-border))] rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { onUpdate(item.id, { name: editName }); setEditId(null); }
                        if (e.key === "Escape") setEditId(null);
                      }}
                    />
                    <button onClick={() => { onUpdate(item.id, { name: editName }); setEditId(null); }} className="text-primary">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditId(null)} className="text-muted-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onToggle(item.id)}
                      className="flex items-center gap-4 flex-1 text-left relative z-10"
                    >
                      <motion.div
                        animate={{
                          backgroundColor: item.packed ? "hsl(var(--primary))" : "transparent",
                          borderColor: item.packed ? "hsl(var(--primary))" : "hsl(var(--border))",
                        }}
                        transition={{ duration: 0.2 }}
                        className="w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0"
                      >
                        {item.packed && (
                          <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }} width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M3 7L6 10L11 4" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </motion.svg>
                        )}
                      </motion.div>
                      <span className={`text-sm transition-all duration-200 ${item.packed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {item.name}
                      </span>
                    </motion.button>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
                      <button onClick={() => { setEditId(item.id); setEditName(item.name); }} className="w-7 h-7 rounded-full hover:bg-[hsl(var(--glass-surface))] flex items-center justify-center text-muted-foreground hover:text-foreground">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button onClick={() => onDelete(item.id)} className="w-7 h-7 rounded-full hover:bg-destructive/20 flex items-center justify-center text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {addingCategory === category ? (
              <div className="flex items-center gap-2 py-3 px-5 relative z-10">
                <input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Item name"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddItem(category);
                    if (e.key === "Escape") setAddingCategory(null);
                  }}
                  className="flex-1 bg-[hsl(var(--glass-surface))] border border-[hsl(var(--glass-border))] rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button onClick={() => handleAddItem(category)} className="text-primary"><Check className="w-4 h-4" /></button>
                <button onClick={() => setAddingCategory(null)} className="text-muted-foreground"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <button
                onClick={() => { setAddingCategory(category); setNewItemName(""); }}
                className="flex items-center gap-2 py-3 px-5 text-sm text-muted-foreground hover:text-primary transition-colors w-full relative z-10"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            )}
          </GlassCard>
        </div>
      ))}

      {/* New category */}
      {showNewCategory ? (
        <div className="space-y-3">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Category name (e.g. Tech)"
            autoFocus
            className="bg-[hsl(var(--glass-surface))] border border-[hsl(var(--glass-border))] rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="flex items-center gap-2">
            <input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="First item name"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newCategory && newItemName) {
                  onAdd(newCategory, newItemName);
                  setShowNewCategory(false);
                  setNewCategory("");
                  setNewItemName("");
                }
              }}
              className="flex-1 bg-[hsl(var(--glass-surface))] border border-[hsl(var(--glass-border))] rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={() => {
                if (newCategory && newItemName) {
                  onAdd(newCategory, newItemName);
                  setShowNewCategory(false);
                  setNewCategory("");
                  setNewItemName("");
                }
              }}
              className="text-primary"
            ><Check className="w-4 h-4" /></button>
            <button onClick={() => { setShowNewCategory(false); setNewCategory(""); setNewItemName(""); }} className="text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowNewCategory(true)}
          className="glass-card px-6 py-4 w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors relative z-10"
        >
          <Plus className="w-4 h-4" /> Add New Category
        </button>
      )}
    </div>
  );
};

export default PackingListTab;
