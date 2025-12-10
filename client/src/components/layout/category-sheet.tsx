  import React, { useMemo, useState } from "react";
  import type { LucideIcon } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
  } from "@/components/ui/dialog";

  export interface CategoryItem {
    id: string;
    name: string;
    icon?: LucideIcon | null;
  }

  interface CategorySheetProps {
    categories: CategoryItem[];
    activeCategory: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (id: string) => void;
  }

  /**
   * CategorySheet
   * - Mobile-first full-screen sheet to pick a category
   * - Includes a quick filter input
   * - Only rendered/visible on mobile (md:hidden)
   */
 const CategorySheet: React.FC<CategorySheetProps> = ({
    categories,
    activeCategory,
    open,
    onOpenChange,
    onSelect,
  }) => {
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      if (!q) return categories;
      return categories.filter((c) => c.name.toLowerCase().includes(q));
    }, [categories, query]);

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="p-0 w-[calc(100vw-1rem)] max-w-none md:hidden">
          <DialogHeader className="px-4 pt-4 pb-2 border-b">
            <DialogTitle>Select Category</DialogTitle>
            <DialogDescription>Quickly filter and choose a category</DialogDescription>
          </DialogHeader>

          <div className="p-4 space-y-3">
            <Input
              placeholder="Filter categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full"
            />

            <div className="max-h-[60vh] overflow-y-auto -mx-1 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filtered.map((cat) => {
                  const Icon = cat.icon || null;
                  const isActive = activeCategory === cat.id;
                  return (
                    <Button
                      key={cat.id}
                      onClick={() => onSelect(cat.id)}
                      variant={isActive ? "default" : "secondary"}
                      className={`justify-start px-3 py-3 rounded-xl ${
                        isActive
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                      aria-pressed={isActive}
                    >
                      {Icon ? <Icon className="h-4 w-4 mr-2" /> : null}
                      <span className="truncate">{cat.name}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="pt-1">
              <Button
                onClick={() => onOpenChange(false)}
                variant="secondary"
                className="w-full rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  export default CategorySheet;