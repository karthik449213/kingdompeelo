import { useCart, Customization } from '@/store/useCart';
import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ShoppingBag, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

const PHONE = '917075543886';

export default function Invoice() {
  const { items, total, updateQuantity, removeFromCart } = useCart();
  const [copied, setCopied] = useState(false);
  const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null);
  const [editingCustomizations, setEditingCustomizations] = useState<Customization>({});

  const formatCustomizations = (customizations: any): string => {
    if (!customizations) return 'None';
    const parts: string[] = [];
    if (customizations.noSugar) parts.push('No sugar');
    if (customizations.addChilli) parts.push('Add chilli');
    if (customizations.extraToppings) parts.push('Extra toppings');
    if (customizations.notes) parts.push(customizations.notes);
    return parts.length > 0 ? parts.join(', ') : 'None';
  };

  const generateMessage = (): string => {
    let message = 'Hello, I want to place this order:\n';
    items.forEach((item) => {
      const custom = formatCustomizations(item.customizations || {});
      message += `• ${item.title} (Qty: ${item.quantity}`;
      if (custom !== 'None') message += `, ${custom}`;
      message += ')\n';
    });
    message += `\nTotal: ₹${total().toFixed(2)}`;
    return message;
  };

  const handleWhatsAppOrder = () => {
    const message = encodeURIComponent(generateMessage());
    window.location.href = `https://wa.me/${PHONE}?text=${message}`;
  };

  const handleCall = () => {
    window.location.href = `tel:+91${PHONE}`;
  };

  const handleCopyOrder = () => {
    navigator.clipboard.writeText(generateMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openEditCustomizations = (idx: number) => {
    setEditingItemIdx(idx);
    setEditingCustomizations(items[idx].customizations || {});
  };

  const saveCustomizations = (idx: number) => {
    const item = items[idx];
    updateQuantity(item.id, item.quantity, editingCustomizations);
    setEditingItemIdx(null);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-3xl font-serif font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Add some delicious items to get started.</p>
          <Link href="/menu" asChild>
            <Button size="lg" className="rounded-full">View Menu</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-white to-orange-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 pt-24">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block bg-linear-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-3">
            Order Invoice
          </div>
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Order Summary</h1>
          <p className="text-gray-600">Review and customize your order</p>
        </div>

        {/* Order Items */}
        <div className="space-y-3 mb-8 max-w-2xl mx-auto">
          {items.map((item: any, idx: number) => (
            <div
              key={`${item.id}-${JSON.stringify(item.customizations || {})}`}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-5 border border-gray-100"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Qty: <span className="font-semibold">{item.quantity}</span>
                  </p>
                </div>
                <span className="text-xl font-bold text-amber-600">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
              
              <div className="space-y-2">
                {item.customizations && formatCustomizations(item.customizations) !== 'None' && (
                  <div className="bg-amber-50 rounded-lg px-3 py-2 text-sm text-gray-700">
                    <span className="font-semibold">Customizations:</span> {formatCustomizations(item.customizations)}
                  </div>
                )}
                
                {/* Edit & Remove Buttons */}
                <div className="flex gap-2 mt-3">
                  <Dialog open={editingItemIdx === idx} onOpenChange={(open) => {
                    if (!open) setEditingItemIdx(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditCustomizations(idx)}
                        className="flex-1"
                      >
                        ✏️ Edit Customizations
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Customize {item.title}</DialogTitle>
                        <DialogDescription>
                          Select options and add special instructions for your {item.title}.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 mt-4">
                        {/* Built-in Customizations */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900">Quick Options</h4>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="no-sugar"
                              checked={editingCustomizations.noSugar || false}
                              onCheckedChange={(checked) =>
                                setEditingCustomizations({
                                  ...editingCustomizations,
                                  noSugar: checked as boolean,
                                })
                              }
                            />
                            <Label htmlFor="no-sugar" className="cursor-pointer">
                              🍬 No Sugar
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="add-chilli"
                              checked={editingCustomizations.addChilli || false}
                              onCheckedChange={(checked) =>
                                setEditingCustomizations({
                                  ...editingCustomizations,
                                  addChilli: checked as boolean,
                                })
                              }
                            />
                            <Label htmlFor="add-chilli" className="cursor-pointer">
                              🌶️ Add Chilli
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="extra-toppings"
                              checked={editingCustomizations.extraToppings || false}
                              onCheckedChange={(checked) =>
                                setEditingCustomizations({
                                  ...editingCustomizations,
                                  extraToppings: checked as boolean,
                                })
                              }
                            />
                            <Label htmlFor="extra-toppings" className="cursor-pointer">
                              ✨ Extra Toppings
                            </Label>
                          </div>
                        </div>

                        {/* Manual Notes */}
                        <div className="space-y-2">
                          <Label htmlFor="notes" className="font-semibold">
                            Special Instructions
                          </Label>
                          <Textarea
                            id="notes"
                            placeholder="e.g., No onions, Extra spicy, etc."
                            value={editingCustomizations.notes || ''}
                            onChange={(e) =>
                              setEditingCustomizations({
                                ...editingCustomizations,
                                notes: e.target.value,
                              })
                            }
                            rows={3}
                          />
                        </div>

                        <Button
                          onClick={() => saveCustomizations(idx)}
                          className="w-full"
                        >
                          Save Customizations
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeFromCart(item.id, item.customizations)}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border-2 border-amber-200 max-w-2xl mx-auto">
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span>₹{total().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Delivery</span>
              <span className="text-green-600 font-semibold">Free</span>
            </div>
            <div className="h-px bg-gray-200"></div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-900">Total Amount</span>
            <span className="text-3xl font-bold bg-linear-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              ₹{total().toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Button
            onClick={handleWhatsAppOrder}
            className="w-full bg-linear-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <span className="mr-2">📱</span>
            <span>WhatsApp Order</span>
          </Button>
          <Button
            onClick={handleCall}
            className="w-full bg-linear-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <span className="mr-2">☎️</span>
            <span>Call Restaurant</span>
          </Button>
        </div>

        {/* Secondary Action */}
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={handleCopyOrder}
            variant="outline"
            className="w-full font-semibold py-3 px-6 rounded-xl"
          >
            {copied ? '✓ Order copied to clipboard' : 'Copy Order Details'}
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
