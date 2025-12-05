import { motion } from 'framer-motion';
import { Link } from 'wouter';
import type { Category } from '@/store/useMenu';

interface CategoryCardProps {
  category: Category;
  index: number;
}

export function CategoryCard({ category, index }: CategoryCardProps) {
  return (
    <Link href={`/menu?category=${category.id}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        className="group relative h-80 md:h-96 w-full overflow-hidden rounded-2xl cursor-pointer shadow-lg"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url(${category.image})` }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-2xl md:text-3xl font-serif text-white font-bold mb-2">{category.title}</h3>
          <div className="h-1 w-12 bg-primary rounded-full group-hover:w-20 transition-all duration-300" />
          <p className="text-white/80 text-sm mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
            Explore {category.title} Collection &rarr;
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
