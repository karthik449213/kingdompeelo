import { Navbar } from '@/components/layout/Navbar';
// import { stats } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';
import { DollarSign, ShoppingBag, Users, Utensils, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMenu } from '@/store/useMenu';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { API_BASE_URL, API_URL } from '@/lib/utils';

// Types for fetched data
type Item = {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  price: number;
  description: string;
  category?: string;
  categoryId?: string;
  image: string;
};

type Category = {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  image?: string;
};

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
  subCategoryId: z.string().min(1, "Subcategory is required"),
  // image will be a FileList from the file input; accept any to avoid zod validation errors
  image: z.any().optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

export default function Dashboard() {
  const { addItem, deleteItem, resetMenu } = useMenu();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState([
    { value: 0, change: '' },
    { value: 0, change: '' },
    { value: 0, change: '' }
  ]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema)
  });
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Authentication check - extracted from kingdomfrontend Dashboard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setStats(data.stats || [
          { value: 0, change: '' },
          { value: 0, change: '' },
          { value: 0, change: '' }
        ]);
        setMessage(data.message || 'Dashboard loaded successfully');
      } catch (err) {
        window.location.href = '/admin/login';
      }
    };

    const fetchDishes = async () => {
      try {
        // Use the API route that returns dishes (menuRoutes exposes /api/menu/dishes)
        const res = await fetch(`${API_URL}/menu/dishes`);
        const data = await res.json();
        setItems(Array.isArray(data) ? data.map(dish => ({
          _id: dish._id,
          id: dish._id,
          title: dish.name,
          price: dish.price,
          description: dish.description,
          // Ensure we extract subcategory id whether populated or not
          categoryId: dish.subCategory && typeof dish.subCategory === 'object' ? dish.subCategory._id : dish.subCategory,
          image: dish.image
        })) : []);
      } catch (err) {
        // Error fetching dishes
      }
    };

    const fetchCategories = async () => {
      try {
        // Subcategories are exposed at /api/menu/subcategories
        const res = await fetch(`${API_URL}/menu/subcategories`);
        const data = await res.json();
        
        setCategories(Array.isArray(data) ? data.map(sub => ({
          _id: sub._id,
          id: sub._id,
          name: sub.name,
          title: sub.name,
          image: sub.image
        })) : []);
      } catch (err) {
        console.error('SubCategories Error:', err);
      }
    };

    fetchDashboardData();
    fetchDishes();
    fetchCategories();
  }, []);

  const onSubmit = (data: ItemFormValues) => {
    (async () => {
      const token = localStorage.getItem('token');
      try {
        const form = new FormData();
        form.append('name', data.title);
        form.append('price', String(data.price));
        form.append('description', data.description);
        form.append('subCategory', data.subCategoryId);

        // data.image may be a FileList
        const fileList = (data as any).image as FileList | undefined;
        if (fileList && fileList.length > 0) {
          form.append('image', fileList[0]);
        }

        let res;
        if (editingItem) {
          // Update existing
          res = await fetch(`${API_URL}/menu/dishes/${editingItem._id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: form,
          });
        } else {
          // Create new
          res = await fetch(`${API_URL}/menu/dishes`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: form,
          });
        }

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error('Save item failed', err);
          alert('Failed to save item');
          return;
        }

        const saved = await res.json();
        // normalize returned dish
        const newItem: Item = {
          _id: saved._id || saved.id,
          id: saved._id || saved.id,
          name: saved.name || saved.title,
          title: saved.name || saved.title,
          price: saved.price,
          description: saved.description,
          categoryId: saved.subCategory && typeof saved.subCategory === 'object' ? saved.subCategory._id : saved.subCategory,
          image: saved.image,
        };

        if (editingItem) {
          setItems(prev => prev.map(i => ((i._id || i.id) === (editingItem._id || editingItem.id) ? newItem : i)));
        } else {
          setItems(prev => [newItem, ...prev]);
        }

        setIsAddDialogOpen(false);
        reset();
        setEditingItem(null);
      } catch (e) {
        console.error('Submit Error:', e);
        alert('Failed to save item');
      }
    })();
  };

  // Delete item from server then update local state
  const handleDelete = async (itemId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Not authenticated');

    if (!confirm('Delete this item permanently?')) return;

    try {
      const res = await fetch(`${API_URL}/menu/dishes/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Delete failed', err);
        return alert('Failed to delete item');
      }
      // Remove locally
      setItems(prev => prev.filter(i => (i._id || i.id) !== itemId));
    } catch (e) {
      console.error('Delete Error:', e);
      alert('Delete failed');
    }
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
                 <Button className="gap-2" onClick={() => { setEditingItem(null); reset(); }}><Plus className="h-4 w-4" /> Add Item</Button>
               </DialogTrigger>
               <DialogContent className="sm:max-w-[425px]">
                 <DialogHeader>
                   <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                   <DialogDescription>
                     {editingItem ? 'Update the item details below.' : 'Fill in the details to add a new item to your menu.'}
                   </DialogDescription>
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
                     <Label htmlFor="subcategory">Subcategory</Label>
                     <Select onValueChange={(val) => setValue("subCategoryId", val)}>
                       <SelectTrigger>
                         <SelectValue placeholder="Select subcategory" />
                       </SelectTrigger>
                       <SelectContent>
                         {categories.map(cat => (
                           <SelectItem key={cat._id || cat.id} value={cat._id || cat.id || ''}>{cat.name || cat.title}</SelectItem>
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

                   <div className="space-y-2">
                     <Label htmlFor="image">Image</Label>
                     <input id="image" type="file" accept="image/*" {...register('image')} />
                     <p className="text-xs text-muted-foreground">Upload an image for the item (optional).</p>
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
              <p className="text-xs text-green-500 font-medium">{stats[0].change} from last month</p>
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
              <p className="text-xs text-green-500 font-medium">{stats[1].change} since last hour</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats[2].value}</div>
              <p className="text-xs text-green-500 font-medium">{stats[2].change} from last month</p>
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
                    <th className="px-6 py-4">Subcategory</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item) => {
                    const itemId = (item._id || item.id) as string;
                    const itemName = item.name || item.title;
                    const categoryId = item.category || item.categoryId;
                    return (
                    <tr key={itemId} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="h-10 w-10 rounded overflow-hidden bg-muted">
                          <img src={item.image} alt={itemName} className="h-full w-full object-cover" />
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">{itemName}</td>
                      <td className="px-6 py-4">
                        {categories.find(c => (c._id || c.id) === categoryId)?.name || categories.find(c => (c._id || c.id) === categoryId)?.title || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4">${item.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => {
                            // open edit dialog populated with item
                            const itemObj: Item = {
                              _id: item._id,
                              id: item.id,
                              name: item.name,
                              title: item.title,
                              price: item.price,
                              description: item.description,
                              categoryId: item.categoryId || item.category,
                              image: item.image,
                            };
                            // populate form and open
                            setEditingItem(itemObj);
                            setValue('title', itemObj.title || itemObj.name || '');
                            setValue('price', Number(itemObj.price || 0));
                            setValue('description', itemObj.description || '');
                            setValue('subCategoryId', itemObj.categoryId || '');
                            setIsAddDialogOpen(true);
                          }}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(itemId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
