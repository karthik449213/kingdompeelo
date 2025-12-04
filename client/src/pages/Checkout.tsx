import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/store/useCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ShoppingBag, Phone, MapPin, User, CreditCard, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';

const checkoutSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(5, "Delivery address is required"),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema)
  });

  const onSubmit = (data: CheckoutForm) => {
    // 1. Generate Order Summary
    let message = `*New Order from ${data.name}*\n\n`;
    message += `*Items:*\n`;
    items.forEach(item => {
      message += `• ${item.title} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
    });
    message += `\n*Total: $${(total() * 1.05).toFixed(2)}*\n`; // Including tax
    message += `\n*Details:*\n`;
    message += `📞 Phone: ${data.phone}\n`;
    message += `📍 Address: ${data.address}\n`;
    if (data.notes) message += `📝 Notes: ${data.notes}`;

    // 2. Encode and Redirect to WhatsApp
    // Using a dummy number for demo purposes
    const phoneNumber = "15551234567"; 
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
    
    setIsSubmitted(true);
    clearCart();
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-primary/10 p-6 rounded-full mb-6 text-primary"
          >
            <CheckCircle className="h-16 w-16" />
          </motion.div>
          <h1 className="text-4xl font-serif font-bold mb-4">Order Placed!</h1>
          <p className="text-muted-foreground max-w-md mb-8">
            Thank you for your order. We have redirected you to WhatsApp to confirm the details with our restaurant.
          </p>
          <Link href="/">
            <Button size="lg" className="rounded-full">Return Home</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-3xl font-serif font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Add some delicious items to get started.</p>
          <Link href="/menu">
            <Button size="lg" className="rounded-full">View Menu</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <Navbar />
      
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-4xl font-serif font-bold mb-8 text-center">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Order Summary */}
          <div className="order-2 lg:order-1">
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" /> Order Summary
              </h2>
              
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded bg-muted overflow-hidden">
                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${total().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxes (5%)</span>
                  <span>${(total() * 0.05).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
                  <span>Total</span>
                  <span className="text-primary">${(total() * 1.05).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Details Form */}
          <div className="order-1 lg:order-2">
             <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> Contact Details
              </h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="name" className="pl-10" placeholder="John Doe" {...register("name")} />
                  </div>
                  {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" className="pl-10" placeholder="+1 (555) 000-0000" {...register("phone")} />
                  </div>
                  {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea id="address" className="pl-10 pt-2 min-h-[80px]" placeholder="123 Main St, Apt 4B" {...register("address")} />
                  </div>
                  {errors.address && <p className="text-destructive text-xs">{errors.address.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Special Instructions (Optional)</Label>
                  <Textarea id="notes" placeholder="Allergies, gate code, etc." {...register("notes")} />
                </div>

                <Button type="submit" className="w-full h-12 text-base rounded-full shadow-lg shadow-primary/20">
                  Complete Order via WhatsApp
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  You'll be redirected to WhatsApp to send your order.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
