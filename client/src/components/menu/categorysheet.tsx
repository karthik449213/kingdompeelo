import React from "react";
import CategorySheet, { CategoryItem } from '@/components/layout/category-sheet';

interface Props {
  categories: Array<{ id: string; title: string; icon?: any }>;
  activeCategory: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: string) => void;
}

const CategorySheetWrapper: React.FC<Props> = ({ categories, activeCategory, open, onOpenChange, onSelect }) => {
  const mapped: CategoryItem[] = categories.map((c) => ({ id: c.id, name: c.title, icon: c.icon ?? null }));

  return (
    <CategorySheet
      categories={mapped}
      activeCategory={activeCategory}
      open={open}
      onOpenChange={onOpenChange}
      onSelect={onSelect}
    />
  );
};

export default CategorySheetWrapper;
