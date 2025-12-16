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
import { ShoppingBag, Phone, MapPin, User, CreditCard, CheckCircle, AlertCircle, Loader2, Radio } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/utils';

const checkoutSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  address: z.string().min(5, "Delivery address is required"),
  notes: z.string().optional(),
  deliveryType: z.enum(["DELIVERY", "DINE_IN"]),
  paymentMethod: z.enum(["PHONEPE", "COD"])
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const API_URL = API_BASE_URL;

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryType: "DELIVERY",
      paymentMethod: "COD"
    }
  });

  const paymentMethod = watch("paymentMethod");
  const deliveryType = watch("deliveryType");

  const WHATSAPP_PHONE = '917075543886';

  // Geolocation / address autofill state
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Check for payment status in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const orderId = params.get('orderId');
    const message = params.get('message');

    if (status === 'success' && orderId) {
      setIsSubmitted(true);
      setSuccessMessage(`Order placed successfully! Order ID: ${orderId}`);
      clearCart();
      setTimeout(() => {
        setLocation(`/invoice?orderId=${orderId}`);
      }, 3000);
    } else if (status === 'failed' || status === 'error') {
      setError(message || "Payment failed. Please try again.");
      window.history.replaceState({}, '', '/checkout');
    }
  }, []);

  const handleUseMyLocation = async () => {
    setLocationError(null);
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not available in your browser.');
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error('Failed to reverse geocode location');
          const data = await res.json();
          const addr = data?.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setValue('address', addr);
        } catch (err: any) {
          setLocationError(err?.message || 'Unable to determine address');
        } finally {
          setDetectingLocation(false);
        }
      },
      (err) => {
        setDetectingLocation(false);
        if (err.code === 1) setLocationError('Permission denied for location access.');
        else if (err.code === 2) setLocationError('Position unavailable.');
        else if (err.code === 3) setLocationError('Location request timed out.');
        else setLocationError('Unable to get location.');
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const onSubmit = async (data: CheckoutForm) => {
    try {
      setError(null);
      setIsProcessing(true);

      // Calculate totals
      const subtotal = total();
      const tax = subtotal * 0.05;
      const deliveryCharge = data.deliveryType === "DELIVERY" ? 50 : 0;
      const totalAmount = subtotal + tax + deliveryCharge;

      // Prepare order data
      const orderData = {
        customerName: data.name,
        customerPhone: data.phone,
        customerEmail: data.email || null,
        items: items.map(item => ({
          dishName: item.title,
          price: item.price,
          quantity: item.quantity,
          specialInstructions: data.notes
        })),
        deliveryAddress: data.address,
        deliveryType: data.deliveryType,
        subtotal,
        tax,
        deliveryCharge,
        discount: 0,
        totalAmount,
        specialNotes: data.notes,
        paymentMethod: data.paymentMethod
      };

      // Create order
      const response = await axios.post(`${API_URL}/api/payments/orders`, orderData);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to create order");
      }

      const { orderId, paymentUrl, paymentMethod: responseMethod } = response.data;

      if (responseMethod === "PHONEPE" && paymentUrl) {
        // Redirect to PhonePe payment
        window.location.href = paymentUrl;
      } else {
        // For COD, show success
        setIsSubmitted(true);
        setSuccessMessage(`Order created successfully! Order ID: ${orderId}`);
        clearCart();
        setTimeout(() => {
          setLocation(`/invoice?orderId=${orderId}`);
        }, 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "An error occurred");
      console.error("Checkout error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center pt-24">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-green-100 p-6 rounded-full mb-6 text-green-600"
          >
            <CheckCircle className="h-16 w-16" />
          </motion.div>
          <h1 className="text-4xl font-serif font-bold mb-4">Order Confirmed!</h1>
          <p className="text-muted-foreground max-w-md mb-8">
            {successMessage}
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Redirecting to your invoice...
          </p>
          <Link href="/menu">
            <Button size="lg" className="rounded-full">Continue Shopping</Button>
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

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-start gap-3 max-w-5xl mx-auto"
          >
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Order Summary */}
          <div className="order-2 lg:order-1">
            <div className="bg-card border rounded-xl p-6 shadow-sm sticky top-32">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" /> Order Summary
              </h2>
              
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center pb-4 border-b last:border-b-0">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-12 w-12 rounded bg-muted overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium ml-2">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{total().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxes (5%)</span>
                  <span>₹{(total() * 0.05).toFixed(2)}</span>
                </div>
                {deliveryType === "DELIVERY" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Charge</span>
                    <span>₹50.00</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
                  <span>Total</span>
                  <span className="text-primary">
                    ₹{(total() * 1.05 + (deliveryType === "DELIVERY" ? 50 : 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Details Form */}
          <div className="order-1 lg:order-2">
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> Order Details
              </h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Info */}
                <div className="space-y-4 pb-6 border-b">
                  <h3 className="font-semibold text-sm">Personal Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="name" className="pl-10" placeholder="John Doe" {...register("name")} />
                    </div>
                    {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" className="pl-10" placeholder="9876543210" {...register("phone")} />
                    </div>
                    {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input id="email" type="email" placeholder="john@example.com" {...register("email")} />
                    {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
                  </div>
                </div>

                {/* Delivery Details */}
                <div className="space-y-4 pb-6 border-b">
                  <h3 className="font-semibold text-sm">Delivery Details</h3>

                  <div className="space-y-3">
                    <Label>Order Type *</Label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition">
                        <input type="radio" value="DELIVERY" {...register("deliveryType")} />
                        <span>Delivery</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition">
                        <input type="radio" value="DINE_IN" {...register("deliveryType")} />
                        <span>Dine In</span>
                      </label>
                    </div>
                  </div>

                  {deliveryType === "DELIVERY" && (
                    <div className="space-y-2">
                      <Label htmlFor="address">Delivery Address *</Label>
                      <div className="flex items-start gap-3">
                        <div className="relative flex-1">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Textarea id="address" className="pl-10 pt-2 min-h-20" placeholder="123 Main St, Apt 4B" {...register("address")} />
                        </div>
                        <Button 
                          type="button" 
                          onClick={handleUseMyLocation} 
                          className="h-10 mt-1"
                          disabled={detectingLocation}
                        >
                          {detectingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Locate'}
                        </Button>
                      </div>
                      {locationError && <p className="text-red-600 text-xs">{locationError}</p>}
                      {errors.address && <p className="text-destructive text-xs">{errors.address.message}</p>}
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="space-y-4 pb-6 border-b">
                  <h3 className="font-semibold text-sm">Payment Method *</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition" style={{borderColor: paymentMethod === "PHONEPE" ? "var(--primary)" : ""}}>
                      <input type="radio" value="PHONEPE" {...register("paymentMethod")} />
                      <div className="flex-1">
                        <p className="font-medium">PhonePe</p>
                        <p className="text-xs text-muted-foreground">Pay securely with PhonePe</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition" style={{borderColor: paymentMethod === "COD" ? "var(--primary)" : ""}}>
                      <input type="radio" value="COD" {...register("paymentMethod")} />
                      <div className="flex-1">
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-xs text-muted-foreground">Pay when your order arrives</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Special Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Special Instructions (Optional)</Label>
                  <Textarea id="notes" placeholder="Allergies, preferences, gate code, etc." {...register("notes")} />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base rounded-full shadow-lg shadow-primary/20"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      {paymentMethod === "PHONEPE" ? "Proceed to PhonePe" : "Complete Order"}
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  {paymentMethod === "PHONEPE" 
                    ? "You'll be redirected to PhonePe for secure payment."
                    : "Your order will be confirmed after payment verification."}
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
