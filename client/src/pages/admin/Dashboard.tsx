import { Navbar } from '@/components/layout/Navbar';
import { stats } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';
import { DollarSign, ShoppingBag, Users, Utensils, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMenu } from '@/store/useMenu';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Mock Data for Charts (Static for now)
const revenueData = [
  { name: 'Mon', total: 1200 },
  { name: 'Tue', total: 900 },
  { name: 'Wed', total: 1600 },
  { name: 'Thu', total: 1400 },
  { name: 'Fri', total: 2400 },
  { name: 'Sat', total: 3200 },
  { name: 'Sun', total: 2800 },
];

const orderData = [
  { time: '10am', orders: 4 },
  { time: '12pm', orders: 12 },
  { time: '2pm', orders: 8 },
  { time: '4pm', orders: 6 },
  { time: '6pm', orders: 24 },
  { time: '8pm', orders: 32 },
  { time: '10pm', orders: 18 },
];

// Form Schema
const itemSchema = z.object({
  title: z.string().min(2, "Title is required"),
  price: z.string().transform((val) => parseFloat(val)),
  description: z.string().min(5, "Description is required"),
  subCategoryId: z.string().min(1, "Category is required"),
  image: z.string().optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

export default function Dashboard() {
  const { items, subCategories, addItem, deleteItem, resetMenu } = useMenu();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema)
  });

  const onSubmit = (data: ItemFormValues) => {
    // Use a default image if none provided
    const image = data.image || "https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=800&auto=format&fit=crop&q=60";
    
    addItem({
      title: data.title,
      price: data.price,
      description: data.description,
      subCategoryId: data.subCategoryId,
      image: image,
      popular: false
    });
    
    setIsAddDialogOpen(false);
    reset();
  };

  return (
    <div className="min-h-screen bg-background pt-24">
      <Navbar />
      
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your menu and view performance.</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" onClick={() => resetMenu()}>Reset to Default</Button>
             
             <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
               <DialogTrigger asChild>
                 <Button className="gap-2"><Plus className="h-4 w-4" /> Add Item</Button>
               </DialogTrigger>
               <DialogContent className="sm:max-w-[425px]">
                 <DialogHeader>
                   <DialogTitle>Add New Item</DialogTitle>
                 </DialogHeader>
                 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                   <div className="space-y-2">
                     <Label htmlFor="title">Item Name</Label>
                     <Input id="title" {...register("title")} placeholder="e.g. Super Berry Smoothie" />
                     {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
                   </div>
                   
                   <div className="space-y-2">
                     <Label htmlFor="price">Price ($)</Label>
                     <Input id="price" type="number" step="0.01" {...register("price")} placeholder="9.50" />
                     {errors.price && <p className="text-destructive text-xs">{errors.price.message}</p>}
                   </div>
                   
                   <div className="space-y-2">
                     <Label htmlFor="category">Category</Label>
                     <Select onValueChange={(val) => setValue("subCategoryId", val)}>
                       <SelectTrigger>
                         <SelectValue placeholder="Select category" />
                       </SelectTrigger>
                       <SelectContent>
                         {subCategories.map(sub => (
                           <SelectItem key={sub.id} value={sub.id}>{sub.title}</SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                     {errors.subCategoryId && <p className="text-destructive text-xs">{errors.subCategoryId.message}</p>}
                   </div>
                   
                   <div className="space-y-2">
                     <Label htmlFor="description">Description</Label>
                     <Textarea id="description" {...register("description")} placeholder="Ingredients and details..." />
                     {errors.description && <p className="text-destructive text-xs">{errors.description.message}</p>}
                   </div>

                   <DialogFooter>
                     <Button type="submit">Save Item</Button>
                   </DialogFooter>
                 </form>
               </DialogContent>
             </Dialog>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats[0].value}</div>
              <p className="text-xs text-muted-foreground text-green-500 font-medium">{stats[0].change} from last month</p>
            </CardContent>
          </Card>
          <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Utensils className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{items.length}</div>
              <p className="text-xs text-muted-foreground">Active menu items</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats[1].value}</div>
              <p className="text-xs text-muted-foreground text-green-500 font-medium">{stats[1].change} since last hour</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats[2].value}</div>
              <p className="text-xs text-muted-foreground text-green-500 font-medium">{stats[2].change} from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-8">
          <Card className="col-span-1 lg:col-span-4">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 lg:col-span-3">
             <CardHeader>
              <CardTitle>Orders Timeline</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={orderData}>
                    <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                    <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Menu Management Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-serif font-bold mb-6">Menu Items Management</h2>
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase font-medium">
                  <tr>
                    <th className="px-6 py-4">Image</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="h-10 w-10 rounded overflow-hidden bg-muted">
                          <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">{item.title}</td>
                      <td className="px-6 py-4">
                        {subCategories.find(sc => sc.id === item.subCategoryId)?.title || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4">${item.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
