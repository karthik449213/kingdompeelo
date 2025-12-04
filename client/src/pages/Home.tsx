import { Hero } from '@/components/ui/hero';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CategoryCard } from '@/components/menu/CategoryCard';
import { categories, items } from '@/lib/mockData';
import { ItemCard } from '@/components/menu/ItemCard';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

export default function Home() {
  const featuredItems = items.filter(i => i.popular).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      
      <section className="py-20 container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-serif font-bold mb-4">Explore Our Menu</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From artisanal burgers to handcrafted cocktails, every item is prepared with the finest ingredients.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, idx) => (
            <CategoryCard key={category.id} category={category} index={idx} />
          ))}
        </div>
      </section>

      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-serif font-bold mb-2">Popular Dishes</h2>
              <p className="text-muted-foreground">Customer favorites you must try</p>
            </div>
            <Link href="/menu">
              <a className="hidden md:flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all">
                View Full Menu <ArrowRight className="h-4 w-4" />
              </a>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>

          <div className="mt-10 text-center md:hidden">
            <Link href="/menu">
              <a className="inline-flex items-center gap-2 text-primary font-medium">
                View Full Menu <ArrowRight className="h-4 w-4" />
              </a>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
