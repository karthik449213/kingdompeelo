import { Link, useLocation } from 'wouter';
import { ShoppingBag, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/store/useCart';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { CartDrawer } from '@/components/cart/CartDrawer';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();
  const itemCount = useCart((state) => state.itemCount());

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location === '/';

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent',
        isScrolled || !isHome
          ? 'bg-background/80 backdrop-blur-md border-border py-3'
          : 'bg-transparent py-5 text-white'
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/">
          <a className={cn("text-2xl font-serif font-bold tracking-tight", isScrolled || !isHome ? "text-foreground" : "text-white")}>
            Gourmet<span className="text-primary">.</span>
          </a>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/menu"><a className={cn("text-sm font-medium hover:text-primary transition-colors", isScrolled || !isHome ? "text-foreground" : "text-white/90")}>Menu</a></Link>
          <Link href="/about"><a className={cn("text-sm font-medium hover:text-primary transition-colors", isScrolled || !isHome ? "text-foreground" : "text-white/90")}>About</a></Link>
          <Link href="/reservations"><a className={cn("text-sm font-medium hover:text-primary transition-colors", isScrolled || !isHome ? "text-foreground" : "text-white/90")}>Reservations</a></Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="icon" className={cn("hover:bg-primary/10", isScrolled || !isHome ? "text-foreground" : "text-white hover:text-white")}>
              <User className="h-5 w-5" />
            </Button>
          </Link>
          
          <CartDrawer>
            <Button variant="ghost" size="icon" className={cn("relative hover:bg-primary/10", isScrolled || !isHome ? "text-foreground" : "text-white hover:text-white")}>
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          </CartDrawer>
        </div>
      </div>
    </nav>
  );
}
