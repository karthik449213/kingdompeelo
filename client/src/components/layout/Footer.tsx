import { Link } from 'wouter';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary-foreground border-t py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/">
              <a className="text-2xl font-serif font-bold tracking-tight block mb-4">
                Fresh Squeeze<span className="text-primary">.</span>
              </a>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Experience the finest organic juices and artisanal desserts, crafted with passion for your health.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/"><a className="hover:text-primary transition-colors">Home</a></Link></li>
              <li><Link href="/menu"><a className="hover:text-primary transition-colors">Menu</a></Link></li>
              <li><Link href="/reservations"><a className="hover:text-primary transition-colors">Visit Us</a></Link></li>
              <li><Link href="/about"><a className="hover:text-primary transition-colors">About Us</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>123 Fresh Avenue</li>
              <li>Juice City, JC 90210</li>
              <li>+1 (555) 123-4567</li>
              <li>hello@freshsqueeze.com</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="h-10 w-10 rounded-full bg-background flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-sm">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-background flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-sm">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-background flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-sm">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Fresh Squeeze Juice Bar. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
