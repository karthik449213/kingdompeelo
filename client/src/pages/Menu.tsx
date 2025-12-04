import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ItemCard } from '@/components/menu/ItemCard';
import { categories, subCategories, items } from '@/lib/mockData';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';

export default function Menu() {
  const [location] = useLocation();
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubCategory, setActiveSubCategory] = useState('all');
  
  // Extract category from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('category');
    if (catParam) {
      setActiveCategory(catParam);
    }
  }, [location]);

  const filteredSubCategories = activeCategory === 'all' 
    ? subCategories 
    : subCategories.filter(sc => sc.categoryId === activeCategory);

  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === 'all' || 
      subCategories.find(sc => sc.id === item.subCategoryId)?.categoryId === activeCategory;
    
    const matchesSubCategory = activeSubCategory === 'all' || 
      item.subCategoryId === activeSubCategory;

    return matchesCategory && matchesSubCategory;
  });

  return (
    <div className="min-h-screen bg-background pt-24">
      <Navbar />
      
      <div className="container mx-auto px-4 py-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Our Menu</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our carefully curated selection of dishes and drinks.
          </p>
        </div>

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
            All
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

        {/* Items Grid */}
        {filteredItems.length > 0 ? (
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
            <p className="text-muted-foreground">No items found in this category.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
