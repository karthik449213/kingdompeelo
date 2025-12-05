import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';

export default function VisitUs() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const hours = [
    { day: "Monday - Friday", time: "7:00 AM - 9:00 PM" },
    { day: "Saturday", time: "8:00 AM - 10:00 PM" },
    { day: "Sunday", time: "9:00 AM - 8:00 PM" },
  ];

  return (
    <div className="min-h-screen bg-background pt-24">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Visit Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stop by our juice bar and experience fresh, delicious juices in a vibrant atmosphere.
          </p>
        </div>

        {/* Main Info Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Location Card */}
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold mb-2">peel O  juice Bar</p>
                  <p className="text-muted-foreground">
                    Royal Arcade 2002, Tikkle Rd<br />
                    Acharya Ranga Nagar<br />
                    Benz Circle<br />
                    Vijayawada, Andhra Pradesh 520010
                  </p>
                </div>
                <Button className="w-full" asChild>
                  <a href="https://www.google.com/maps/place/Peel+O+Juice/@16.501897584242048,80.6462275749139,15z/" target="_blank" rel="noopener noreferrer">
                    Get Directions
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Hours Card */}
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hours.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="font-medium">{item.day}</span>
                      <span className="text-muted-foreground">{item.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Phone */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Phone className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold mb-1">Call Us</p>
                    <a href="tel:+91998986556" className="text-primary hover:underline">
                      +91 998986556
                    </a>
                    <p className="text-sm text-muted-foreground mt-2">
                      Available during business hours
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Email */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Mail className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold mb-1">Email Us</p>
                    <a href="mailto:hello@peelOjuice.com" className="text-primary hover:underline">
                      hello@peelOjuice.com
                    </a>
                    <p className="text-sm text-muted-foreground mt-2">
                      We'll respond within 24 hours
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Map Placeholder */}
        <motion.div
          className="mb-16"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="bg-muted rounded-lg overflow-hidden min-h-[400px]">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3825.4790124355764!2d80.6462275749139!3d16.501897584242048!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35fb007d8936c9%3A0xa52f4b7b2d7413cb!2sPeel%20O%20Juice!5e0!3m2!1sen!2sin!4v1764944935821!5m2!1sen!2sin" 
              width="100%" 
              height="400" 
              style={{ border: 0 } as React.CSSProperties}
              allowFullScreen={true}
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="bg-linear-to-r from-amber-500 to-orange-500 text-white rounded-lg p-12 text-center"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-serif font-bold mb-4">Experience Fresh Juice Today</h2>
          <p className="text-lg mb-6 max-w-xl mx-auto">
            Walk in or order online for delivery. Your perfect juice is waiting!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/menu" asChild>
              <Button size="lg" className="bg-white text-amber-600 hover:bg-white/90">
                Order Now
              </Button>
            </Link>
            <Link href="/menu" asChild>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                View Menu
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
