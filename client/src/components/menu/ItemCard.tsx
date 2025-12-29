import { Button } from '@/components/ui/button';
import { useCart } from '@/store/useCart';
import { Plus, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, memo } from 'react';
import { optimizeItemImage } from '@/lib/cloudinary';
import type { Item } from '@/store/useMenu';

interface ItemCardProps {
  item: Item;
}

// PERFORMANCE: Memoize ItemCard to avoid unnecessary re-renders
export const ItemCard = memo(function ItemCard({ item }: ItemCardProps) {
  const addToCart = useCart((state) => state.addToCart);
  const [isHovered, setIsHovered] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  
  // Default to available if undefined
  const isAvailable = item.available !== false;
  const starRating = item.stars ?? 5;
  // PERFORMANCE: Use optimized image URL
  const optimizedImage = optimizeItemImage(item.image);

  // Helper function to render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3.5 w-3.5 ${
              star <= Math.floor(rating)
                ? 'fill-amber-400 text-amber-400'
                : star - 0.5 <= rating
                ? 'fill-amber-200 text-amber-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const handleAddToCart = () => {
    if (isAvailable) {
      addToCart(item);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    }
  };

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
          src={optimizedImage} 
          alt={item.title}
          width={300}
          height={300}
          loading="lazy"
          decoding="async"
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
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className="bg-white text-black hover:bg-white/90 rounded-full font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Order Now
          </Button>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-serif text-lg font-bold text-foreground leading-tight">{item.title}</h3>
          <span className="font-semibold text-primary">₹{item.price.toFixed(2)}</span>
        </div>
        <div className="mb-3">
          {renderStars(starRating)}
        </div>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{item.description}</p>
        
        {/* Add to Cart Button Below Description */}
        <Button 
          onClick={handleAddToCart}
          disabled={!isAvailable}
          className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 rounded-lg transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>

        {/* Success Notification */}
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 bg-green-100 text-green-800 text-sm p-2 rounded-lg text-center"
          >
            Added to cart! ✓
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});
