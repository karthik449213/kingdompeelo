import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { optimizeCategoryImage } from '@/lib/cloudinary';
import type { Category } from '@/store/useMenu';

interface CategoryCardProps {
  category: Category;
  index: number;
}

export function CategoryCard({ category, index }: CategoryCardProps) {
  // Use slug if available for better URL readability, otherwise use ID
  const categoryIdentifier = (category as any).slug || category.id;
  // PERFORMANCE: Use optimized image URL
  const optimizedImage = optimizeCategoryImage(category.image);
  
  return (
    <Link href={`/menu?category=${categoryIdentifier}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        className="group relative h-80 md:h-96 w-full overflow-hidden rounded-2xl cursor-pointer shadow-lg active:shadow-2xl transition-shadow md:active:shadow-lg"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 md:group-active:scale-105"
          style={{ backgroundImage: `url(${optimizedImage})` }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 md:group-active:opacity-85 transition-opacity" />
        
        {/* Arrow Badge - Always visible on mobile, hover on desktop */}
        <div className="absolute top-4 right-4 bg-primary p-3 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
          <ArrowRight className="h-5 w-5 text-white" />
        </div>
        
        {/* Content Section */}
        <div className="absolute bottom-0 left-0 w-full h-full flex flex-col justify-end p-6 md:p-8">
          {/* Title - Always visible */}
          <h3 className="text-2xl md:text-3xl font-serif text-white font-bold mb-2">{category.title}</h3>
          
          {/* Accent bar - Animated on hover/desktop */}
          <div className="h-1 w-12 bg-primary rounded-full md:group-hover:w-20 transition-all duration-300 mb-3" />
          
          {/* Explore Button - Always visible on mobile */}
          <div className="flex items-center gap-2 text-white/90 font-medium text-sm md:text-base">
            <span className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
              Explore Collection
            </span>
            <ArrowRight className="h-4 w-4 md:h-5 md:w-5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          
          {/* Hidden description - Only on desktop hover */}
          <p className="text-white/70 text-xs md:text-sm mt-2 opacity-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
            Tap to explore {category.title} collection
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
