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
      // Try to find category by ID or slug
      const matchedCategory = categories.find(
        cat => cat.id === categoryParam || (cat as any).slug === categoryParam
      );
      if (matchedCategory) {
        setActiveCategory(matchedCategory.id);
      } else {
        setActiveCategory(categoryParam);
      }
      setActiveSubCategory('all');
    }
  }, [location, categories]);

  const filteredSubCategories = activeCategory === 'all' 
    ? subCategories 
    : subCategories.filter(sc => sc.categoryId === activeCategory);

  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.categoryId === activeCategory;
    const matchesSubCategory = activeSubCategory === 'all' || item.subCategoryId === activeSubCategory;
    return matchesCategory && matchesSubCategory;
  });

  // SEO: Generate page title and description based on filters
  const getPageTitle = () => {
    const activecat = categories.find(c => c.id === activeCategory);
    if (activeCategory === 'all') return 'Our Menu | Peelo Juice';
    return `${activecat?.title || 'Menu'} | Peelo Juice`;
  };

  const getPageDescription = () => {
    const activecat = categories.find(c => c.id === activeCategory);
    if (activeCategory === 'all') {
      return `Discover our carefully curated selection of ${items.length} delicious juices and creams. Fresh, healthy beverages crafted with premium ingredients.`;
    }
    return `Explore our ${activecat?.title || 'Menu'} collection. Fresh, healthy beverages at Peelo Juice. ${filteredItems.length} items available.`;
  };

  // Structured data for Schema.org
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'Peelo Juice',
    url: window.location.origin,
    description: 'Fresh juice and cream shop serving healthy beverages',
    hasMenu: {
      '@type': 'Menu',
      hasMenuSection: categories.map(cat => ({
        '@type': 'MenuSection',
        name: cat.title,
        itemListElement: items
          .filter(item => item.categoryId === cat.id)
          .map(item => ({
            '@type': 'MenuItem',
            name: item.title,
            description: item.description,
            offers: {
              '@type': 'Offer',
              price: item.price.toFixed(2),
              priceCurrency: 'INR'
            },
            image: item.image,
            aggregateRating: item.stars ? {
              '@type': 'AggregateRating',
              ratingValue: item.stars,
              bestRating: '5',
              worstRating: '0'
            } : undefined
          }))
      }))
    }
  };

  // Update meta tags on component mount and when filters change
  useEffect(() => {
    const title = getPageTitle();
    const description = getPageDescription();
    
    // Update document title
    document.title = title;
    
    // Update or create meta tags
    const updateMetaTag = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        if (name.startsWith('og:') || name.startsWith('twitter:')) {
          tag.setAttribute('property', name);
        } else {
          tag.setAttribute('name', name);
        }
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateMetaTag('description', description);
    updateMetaTag('keywords', 'juice, fresh juice, healthy drinks, peelo juice, beverages, cream, smoothie, milkshake');
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:url', window.location.href);
    updateMetaTag('og:image', filteredItems[0]?.image || `${window.location.origin}/og-image.jpg`);
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', filteredItems[0]?.image || `${window.location.origin}/og-image.jpg`);
    updateMetaTag('theme-color', '#ffffff');

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', window.location.href);

    // Update structured data
    let schemaScript = document.querySelector('script[type="application/ld+json"]');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(schemaData);
  }, [activeCategory, activeSubCategory, filteredItems, getPageTitle, getPageDescription, schemaData]);

  return (
    <div className="min-h-screen bg-background pt-24">
      <Navbar />
      
      <div className="container mx-auto px-4 py-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Our Menu</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our carefully curated selection of {items.length} Juices and Creams. Fresh, healthy beverages crafted with premium ingredients.
          </p>
        </div>

        {!isLoading && categories.length > 0 && (
          <>
            {/* Category Filter - responsive grid on mobile, flex on desktop */}
            <div className="mb-8 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 md:p-6 border border-slate-200 dark:border-slate-700">
              <h2 className="text-xs md:text-sm font-semibold text-slate-900 dark:text-white mb-3 md:mb-4 uppercase tracking-wider">Categories</h2>
              <div className="grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-2 md:gap-3">
                <button
                  onClick={() => { setActiveCategory('all'); setActiveSubCategory('all'); }}
                  className={cn(
                    "px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 border-2",
                    activeCategory === 'all' 
                      ? "bg-primary text-white border-primary shadow-md" 
                      : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-primary hover:text-primary dark:hover:text-primary"
                  )}
                  aria-label="View all menu items"
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setActiveSubCategory('all'); }}
                    className={cn(
                      "px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 border-2",
                      activeCategory === cat.id
                        ? "bg-primary text-white border-primary shadow-md" 
                        : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-primary hover:text-primary dark:hover:text-primary"
                    )}
                    aria-label={`View ${cat.title} menu items`}
                  >
                    {cat.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Floating Category Sheet Button - Mobile Only */}
            <Button
              onClick={() => setSheetOpen(true)}
              size="icon"
              aria-label="Open categories"
              className="fixed bottom-6 right-4 z-50 md:hidden rounded-full shadow-lg"
            >
              <MenuIcon />
            </Button>

            {/* SubCategory Filter */}
            {filteredSubCategories.length > 0 && (
              <div className="mb-10 md:mb-12 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-lg p-4 md:p-5 border border-slate-200 dark:border-slate-700">
                <h3 className="text-xs md:text-sm font-semibold text-slate-900 dark:text-white mb-3 md:mb-4 uppercase tracking-wider">Subcategories</h3>
                <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-2">
                  <button
                    onClick={() => setActiveSubCategory('all')}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 border",
                      activeSubCategory === 'all'
                        ? "bg-primary text-white border-primary shadow-sm" 
                        : "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-primary hover:text-primary dark:hover:text-primary"
                    )}
                    aria-label="View all items in category"
                  >
                    All Items
                  </button>
                  {filteredSubCategories.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => setActiveSubCategory(sub.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 border",
                        activeSubCategory === sub.id
                          ? "bg-primary text-white border-primary shadow-sm" 
                          : "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-primary hover:text-primary dark:hover:text-primary"
                      )}
                      aria-label={`View ${sub.title} items`}
                    >
                      {sub.title}
                    </button>
                  ))}
                </div>
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
