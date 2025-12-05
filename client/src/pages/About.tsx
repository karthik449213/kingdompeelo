import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function About() {
  return (
    <div className="min-h-screen bg-background pt-24">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">About peel O  juice</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fresh-pressed juices and vibrant blends crafted from local fruit for a brighter you.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-center">
          <div>
            <h2 className="text-3xl font-serif font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              peel O  juice was born from a simple belief: everyone deserves access to fresh, delicious, and nutritious juice. 
              What started as a small passion project has grown into a community favorite.
            </p>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              We source our fruits from local farms, ensuring the freshest ingredients in every glass. 
              Each juice is cold-pressed to perfection, locking in nutrients and flavor.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our mission is simple: to bring health, happiness, and flavor to every sip.
            </p>
          </div>
          <div className="bg-linear-to-br from-amber-100 to-orange-100 rounded-lg p-8 min-h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🍊</div>
              <p className="text-lg font-semibold text-gray-700">Fresh. Local. Delicious.</p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-serif font-bold mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border rounded-lg p-6">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-bold mb-2">Sustainability</h3>
              <p className="text-muted-foreground">
                We're committed to sustainable practices and supporting local farmers.
              </p>
            </div>
            <div className="bg-card border rounded-lg p-6">
              <div className="text-4xl mb-4">❤️</div>
              <h3 className="text-xl font-bold mb-2">Quality</h3>
              <p className="text-muted-foreground">
                Only the finest ingredients make it into our juices. No shortcuts, no compromises.
              </p>
            </div>
            <div className="bg-card border rounded-lg p-6">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-bold mb-2">Community</h3>
              <p className="text-muted-foreground">
                We're more than a juice bar—we're part of your daily health journey.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-linear-to-r from-amber-500 to-orange-500 text-white rounded-lg p-12 text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">Ready for Fresh Juice?</h2>
          <p className="text-lg mb-6 max-w-xl mx-auto">
            Visit us or order online to experience the peel O  juice difference.
          </p>
          <Link href="/menu" asChild>
            <Button size="lg" className="bg-white text-amber-600 hover:bg-white/90">
              Explore Our Menu
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
