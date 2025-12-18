import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import heroImg from '@assets/generated_images/Gemini_Generated_Image_39413i39413i3941.png';

export function Hero() {
  return (
    <div className="relative h-[90vh] w-full overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 animate-slow-zoom"
        style={{ backgroundImage: `url(${heroImg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/20 backdrop-blur-[1px]" />
      
      <div className="relative h-full container mx-auto px-4 flex flex-col justify-center items-center text-center text-white z-10">
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-amber-600/95 text-white px-4 py-1 rounded-full font-medium tracking-widest uppercase text-xs mb-6 shadow-2xl"
        >
          100% Organic & Fresh
        </motion.span>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-6 leading-tight drop-shadow-2xl"
        >
          Squeeze the <br /> 
          <span className="italic text-amber-300">Day</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg md:text-xl text-white font-medium max-w-2xl mb-10 drop-shadow-lg"
        >
          Refresh your body and soul with our cold-pressed juices, creamy smoothies, and artisanal desserts.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/menu" asChild>
            <Button size="lg" className="bg-amber-500 text-white hover:bg-amber-600 rounded-full px-8 h-12 text-base shadow-2xl">
              Order Now
            </Button>
          </Link>
          <Link href="/menu?category=c2" asChild>
            <Button size="lg" variant="outline" className="bg-white/10 border border-white text-white hover:bg-white/20 rounded-full px-8 h-12 text-base font-bold shadow-lg">
              View Menu
            </Button>
          </Link>
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white">
        <span className="text-xs uppercase tracking-widest font-bold drop-shadow-md">Scroll for Freshness</span>
      </div>
    </div>
  );
}
