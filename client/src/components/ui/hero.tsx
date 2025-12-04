import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import heroImg from '@assets/generated_images/high-end_restaurant_interior_with_moody_lighting_and_elegant_table_settings..png';

export function Hero() {
  return (
    <div className="relative h-[90vh] w-full overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 animate-slow-zoom"
        style={{ backgroundImage: `url(${heroImg})` }}
      />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      
      <div className="relative h-full container mx-auto px-4 flex flex-col justify-center items-center text-center text-white z-10">
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-primary font-medium tracking-widest uppercase text-sm mb-4"
        >
          Taste the Extraordinary
        </motion.span>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-6 leading-tight"
        >
          Experience <br /> 
          <span className="italic text-primary">Modern</span> Dining
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg md:text-xl text-white/80 max-w-2xl mb-10 font-light"
        >
          A culinary journey through flavors, crafted with passion and served with elegance. 
          Order online for an unforgettable meal at home.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/menu">
            <Button size="lg" className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 h-12 text-base">
              View Menu
            </Button>
          </Link>
          <Link href="/reservations">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-full px-8 h-12 text-base backdrop-blur-sm">
              Book a Table
            </Button>
          </Link>
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
        <span className="text-sm uppercase tracking-widest text-xs">Scroll to Explore</span>
      </div>
    </div>
  );
}
