import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ItemCard } from '@/components/menu/ItemCard';
import { useMenu } from '@/store/useMenu';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';

export default function Menu() {
  const [location] = useLocation();
  const { categories, subCategories, items, fetchMenu, resetMenu } = useMenu();

  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubCategory, setActiveSubCategory] = useState('all');

  // Fetch menu on component mount
  useEffect(() => {
    // Call fetchMenu once on mount. We intentionally don't include
    // fetchMenu in deps to avoid repeated calls if the function
    // identity changes from the store implementation.
    // Any error is handled inside the store.
    void fetchMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Extract category from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('category');
    if (!catParam) return;

    // Try to resolve the category parameter to an actual category id.
    // The param may be an id or a slug (or even a subcategory id/slug),
    // so check categories and subcategories and map to the right ids.
    const byId = categories.find((c) => c.id === catParam);
    if (byId) {
      setActiveCategory(byId.id);
      setActiveSubCategory('all');
      return;
    }

    const bySlug = categories.find((c) => c.slug === catParam || c.title === catParam);
    if (bySlug) {
      setActiveCategory(bySlug.id);
      setActiveSubCategory('all');
      return;
    }

    // Maybe the param refers to a subcategory; if so, set both
    const subById = subCategories.find((s) => s.id === catParam || s.slug === catParam || s.title === catParam);
    if (subById) {
      setActiveCategory(subById.categoryId);
      setActiveSubCategory(subById.id);
      return;
    }
  }, [location, categories, subCategories]);

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
            <div className="mt-6">
              <button
                onClick={() => resetMenu()}
                className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground"
              >
                Load Demo Menu
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              If this persists, ensure your backend at `http://localhost:5000` is running and
              contains categories, subcategories and dishes (the full menu endpoint returns
              categories with nested subcategories and dishes).
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
