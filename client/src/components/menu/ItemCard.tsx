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

  return (
    <motion.div 
      className="group relative bg-card rounded-xl overflow-hidden border border-border/40 shadow-sm hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
    >
      <div className="relative aspect-4/3 overflow-hidden">
        <img 
          src={item.image} 
          alt={item.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {item.popular && (
          <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            Popular
          </div>
        )}
        
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Button 
            onClick={() => addToCart(item)}
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
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{item.description}</p>
      </div>
    </motion.div>
  );
}
