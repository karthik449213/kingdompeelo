import { Button } from '@/components/ui/button';
import { useCart } from '@/store/useCart';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Item } from '@/store/useMenu';

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  const addToCart = useCart((state) => state.addToCart);
  const [isHovered, setIsHovered] = useState(false);
  
  // Default to available if undefined
  const isAvailable = item.available !== false;
  const starRating = item.stars ?? 5;

  return (
    <motion.div 
      className={`group relative bg-card rounded-xl overflow-hidden border-2 border-black shadow-sm hover:shadow-xl transition-all duration-300 ${
        !isAvailable ? 'opacity-60' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={isAvailable ? { y: -5 } : {}}
    >
      <div className="relative aspect-4/3 overflow-hidden">
        <img 
          src={item.image} 
          alt={item.title} 
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isAvailable ? 'group-hover:scale-110' : ''
          }`}
        />
        
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white text-lg font-bold">UNAVAILABLE</span>
          </div>
        )}
        
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
          isHovered && isAvailable ? 'opacity-100' : 'opacity-0'
        }`}>
          <Button 
            onClick={() => isAvailable && addToCart(item)}
            disabled={!isAvailable}
            className="bg-white text-black hover:bg-white/90 rounded-full font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
          >
            Add to Cart
          </Button>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-serif text-lg font-bold text-foreground leading-tight">{item.title}</h3>
          <span className="font-semibold text-primary">₹{item.price.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-yellow-500">
            {'⭐'.repeat(Math.round(starRating))}
          </span>
          <span className="text-xs text-muted-foreground">({starRating.toFixed(1)}/5)</span>
        </div>
        <p className="text-muted-foreground text-sm line-clamp-2">{item.description}</p>
      </div>
    </motion.div>
  );
}
