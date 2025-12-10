import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ItemCard } from '@/components/menu/ItemCard';
import { useMenu } from '@/store/useMenu';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import CategorySheet from '@/components/menu/categorysheet';
import { Button } from '@/components/ui/button';
import { Menu as MenuIcon } from 'lucide-react';

export default function Menu() {
  const { categories, subCategories, items, fetchMenu } = useMenu();
  const [location] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubCategory, setActiveSubCategory] = useState('all');
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const loadMenu = async () => {
      setIsLoading(true);
      await fetchMenu();
      setIsLoading(false);
    };
    loadMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle query parameters from URL
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const categoryParam = params.get('category');
    if (categoryParam) {
      setActiveCategory(categoryParam);
      setActiveSubCategory('all');
    }
  }, [location]);

  const filteredSubCategories = activeCategory === 'all' 
    ? subCategories 
    : subCategories.filter(sc => sc.categoryId === activeCategory);

  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.categoryId === activeCategory;
    const matchesSubCategory = activeSubCategory === 'all' || item.subCategoryId === activeSubCategory;
    return matchesCategory && matchesSubCategory;
  });

  return (
    <div className="min-h-screen bg-background pt-24">
      <Navbar />
      
      <div className="container mx-auto px-4 py-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Our Menu</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our carefully curated selection of {items.length} dishes and drinks.
          </p>
        </div>

        {!isLoading && categories.length > 0 && (
          <>
            {/* Category Filter - desktop, hidden on mobile */}
            <div className="hidden md:flex flex-wrap justify-center gap-4 mb-8">
              <button
                onClick={() => { setActiveCategory('all'); setActiveSubCategory('all'); }}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all",
                  activeCategory === 'all' 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setActiveSubCategory('all'); }}
                  className={cn(
                    "px-6 py-2 rounded-full text-sm font-medium transition-all",
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {cat.title}
                </button>
              ))}
            </div>

            {/* Mobile: floating icon to open category sheet (bottom-right) */}
            {/* keep this small in the layout flow; actual fixed positioning is applied on the Button */}
            <div className="md:hidden">
              <Button
                onClick={() => setSheetOpen(true)}
                size="icon"
                aria-label="Open categories"
                className="fixed bottom-6 right-4 z-50 md:hidden"
              >
                <MenuIcon />
              </Button>
            </div>

            {/* SubCategory Filter */}
            {filteredSubCategories.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-12">
                <button
                  onClick={() => setActiveSubCategory('all')}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-medium transition-all border",
                    activeSubCategory === 'all'
                      ? "border-primary text-primary bg-primary/5" 
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  All Items
                </button>
                {filteredSubCategories.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubCategory(sub.id)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-medium transition-all border",
                      activeSubCategory === sub.id
                        ? "border-primary text-primary bg-primary/5" 
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {sub.title}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Items Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading menu...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredItems.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No dishes found in this category.</p>
            <p className="text-sm text-muted-foreground mt-4">
              Try selecting a different category or subcategory.
            </p>
          </div>
        )}
      </div>

      {/* Mobile Category Sheet (rendered outside main container) */}
      <CategorySheet
        categories={categories}
        activeCategory={activeCategory}
        open={sheetOpen}
        onOpenChange={(open) => setSheetOpen(open)}
        onSelect={(id) => { setActiveCategory(id); setActiveSubCategory('all'); setSheetOpen(false); }}
      />

      <Footer />
    </div>
  );
}
