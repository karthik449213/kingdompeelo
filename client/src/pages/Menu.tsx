import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ItemCard } from '@/components/menu/ItemCard';
import { useMenu } from '@/store/useMenu';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function Menu() {
  const { categories, subCategories, items, fetchMenu } = useMenu();
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubCategory, setActiveSubCategory] = useState('all');

  useEffect(() => {
    const loadMenu = async () => {
      setIsLoading(true);
      await fetchMenu();
      setIsLoading(false);
    };
    loadMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
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

      <Footer />
    </div>
  );
}
