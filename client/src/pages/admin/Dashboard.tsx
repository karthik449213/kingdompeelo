import { Navbar } from '@/components/layout/Navbar';
// import { stats } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';
import { DollarSign, ShoppingBag, Users, Utensils, Plus, Trash2, Edit2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMenu } from '@/store/useMenu';
import { useState, useEffect, useRef } from 'react';
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
let revenueData = [
  { name: 'Mon', total: 1200 },
  { name: 'Tue', total: 900 },
  { name: 'Wed', total: 1600 },
  { name: 'Thu', total: 1400 },
  { name: 'Fri', total: 2400 },
  { name: 'Sat', total: 3200 },
  { name: 'Sun', total: 2800 },
];

let orderData = [
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

const categorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  image: z.any().optional(),
});

const subCategorySchema = z.object({
  name: z.string().min(2, "Subcategory name is required"),
  categoryId: z.string().min(1, "Category is required"),
  image: z.any().optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;
type CategoryFormValues = z.infer<typeof categorySchema>;
type SubCategoryFormValues = z.infer<typeof subCategorySchema>;

export default function Dashboard() {
  
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState([
    { value: 0, change: '' },
    { value: 0, change: '' },
    { value: 0, change: '' }
  ]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [isAddSubCategoryDialogOpen, setIsAddSubCategoryDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chartRevenue, setChartRevenue] = useState(revenueData);
  const [chartOrders, setChartOrders] = useState(orderData);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema)
  });
  const { register: registerCategory, handleSubmit: handleSubmitCategory, reset: resetCategory, formState: { errors: categoryErrors } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema)
  });
  const { register: registerSubCategory, handleSubmit: handleSubmitSubCategory, reset: resetSubCategory, setValue: setValueSubCategory, formState: { errors: subCategoryErrors } } = useForm<SubCategoryFormValues>({
    resolver: zodResolver(subCategorySchema)
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
        console.error('Dashboard data error:', err);
        window.location.href = '/admin/login';
      }
    };

    const fetchDishes = async () => {
      try {
        // Use the API route that returns dishes (menuRoutes exposes /api/menu/dishes)
        // Add limit=1000 to get all dishes instead of just 20
        const res = await fetch(`${API_URL}/menu/dishes?limit=1000`);
        if (!res.ok) {
          console.error('Failed to fetch dishes:', res.status);
          return;
        }
        const data = await res.json();
        
        // Handle paginated response structure
        const dishesArray = data.dishes || (Array.isArray(data) ? data : []);
        
        setItems(Array.isArray(dishesArray) ? dishesArray.map(dish => ({
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
        console.error('Error fetching dishes:', err);
      }
    };

    const fetchCategories = async () => {
      try {
        // Subcategories are exposed at /api/menu/subcategories
        const res = await fetch(`${API_URL}/menu/subcategories`);
        if (!res.ok) {
          console.error('Failed to fetch subcategories:', res.status);
          return;
        }
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

    const fetchMainCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/menu/categories`);
        if (!res.ok) {
          console.error('Failed to fetch categories:', res.status);
          return;
        }
        const data = await res.json();
        
        setMainCategories(Array.isArray(data) ? data.map(cat => ({
          _id: cat._id,
          id: cat._id,
          name: cat.name,
          title: cat.name,
          image: cat.image
        })) : []);
      } catch (err) {
        console.error('Categories Error:', err);
      }
    };

    // Fetch initial data
    fetchDashboardData();
    fetchDishes();
    fetchCategories();
    fetchMainCategories();

    // Real-time polling for charts (every 30 seconds)
    pollingIntervalRef.current = setInterval(() => {
      updateChartData();
    }, 30000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Function to update chart data with simulated real-time data
  const updateChartData = () => {
    // Simulate revenue data with slight variations
    setChartRevenue(prev => prev.map(item => ({
      ...item,
      total: Math.max(500, item.total + Math.floor((Math.random() - 0.5) * 1000))
    })));

    // Simulate order data with slight variations
    setChartOrders(prev => prev.map(item => ({
      ...item,
      orders: Math.max(1, item.orders + Math.floor((Math.random() - 0.5) * 10))
    })));
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
  };

  const onSubmit = (data: ItemFormValues) => {
    (async () => {
      const token = localStorage.getItem('token');
      try {
        // Validate subcategory is provided
        if (!data.subCategoryId) {
          alert('Subcategory is required');
          return;
        }

        // Validate image is provided
        const fileList = (data as any).image as FileList | undefined;
        if (!fileList || fileList.length === 0) {
          alert('Please upload an image for the dish');
          return;
        }

        const form = new FormData();
        form.append('name', data.title);
        form.append('price', String(data.price));
        form.append('description', data.description);
        form.append('subCategory', data.subCategoryId);
        form.append('image', fileList[0]);

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

  // Add Category Handler
  const onSubmitCategory = async (data: CategoryFormValues) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Not authenticated');
      return;
    }
    
    // Validate image
    const fileList = (data as any).image as FileList | undefined;
    if (!fileList || fileList.length === 0) {
      alert('Please upload an image for the category');
      return;
    }

    try {
      const form = new FormData();
      form.append('name', data.name);
      form.append('image', fileList[0]);

      console.log('Submitting category with data:', { name: data.name, hasImage: true });

      const res = await fetch(`${API_URL}/menu/categories`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      console.log('Category submission response status:', res.status);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'No response body' }));
        console.error('Save category failed:', err);
        alert('Failed to save category: ' + (err.message || 'Unknown error'));
        return;
      }

      const saved = await res.json();
      console.log('Category saved successfully:', saved);
      
      const newCategory: Category = {
        _id: saved._id || saved.id,
        id: saved._id || saved.id,
        name: saved.name,
        title: saved.name,
        image: saved.image,
      };

      setMainCategories(prev => [newCategory, ...prev]);
      setIsAddCategoryDialogOpen(false);
      resetCategory();
      alert('Category added successfully!');
    } catch (e) {
      console.error('Submit Error:', e);
      alert('Failed to save category: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  // Add SubCategory Handler
  const onSubmitSubCategory = async (data: SubCategoryFormValues) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Not authenticated');
      return;
    }
    
    // Validate image
    const fileList = (data as any).image as FileList | undefined;
    if (!fileList || fileList.length === 0) {
      alert('Please upload an image for the subcategory');
      return;
    }

    if (!data.categoryId) {
      alert('Please select a category');
      return;
    }

    try {
      const form = new FormData();
      form.append('name', data.name);
      form.append('category', data.categoryId);
      form.append('image', fileList[0]);

      console.log('Submitting subcategory with data:', { name: data.name, categoryId: data.categoryId, hasImage: true });

      const res = await fetch(`${API_URL}/menu/subcategories`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      console.log('SubCategory submission response status:', res.status);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'No response body' }));
        console.error('Save subcategory failed:', err);
        alert('Failed to save subcategory: ' + (err.message || 'Unknown error'));
        return;
      }

      const saved = await res.json();
      console.log('SubCategory saved successfully:', saved);
      
      const newSubCategory: Category = {
        _id: saved._id || saved.id,
        id: saved._id || saved.id,
        name: saved.name,
        title: saved.name,
        image: saved.image,
      };

      setCategories(prev => [newSubCategory, ...prev]);
      setIsAddSubCategoryDialogOpen(false);
      resetSubCategory();
      alert('Subcategory added successfully!');
    } catch (e) {
      console.error('Submit Error:', e);
      alert('Failed to save subcategory: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24">
      <Navbar />
      
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your menu and View  performance.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
             <Button variant="outline" onClick={() => window.location.href = '/admin/menu'}>Menu Management</Button>
             <Button variant="outline" onClick={() => window.location.href = '/admin/categories'}>Category Management</Button>
             <Button variant="outline" onClick={() => window.location.href = '/admin/testimonials'}>Testimonial Management</Button>
             <Button variant="outline" onClick={() => window.location.href = '/menu'}>See Public Menu</Button>

       
             
             
             
            {/* Add Category Dialog 
             <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
               <DialogTrigger asChild>
                 <Button variant="outline" className="gap-2"><Plus className="h-4 w-4" /> Add Category</Button>
               </DialogTrigger>
               <DialogContent className="sm:max-w-[425px]">
                 <DialogHeader>
                   <DialogTitle>Add New Category</DialogTitle>
                   <DialogDescription>
                     Fill in the details to add a new category.
                   </DialogDescription>
                 </DialogHeader>
                 <form onSubmit={handleSubmitCategory(onSubmitCategory)} className="space-y-4 mt-4">
                   <div className="space-y-2">
                     <Label htmlFor="cat-name">Category Name</Label>
                     <Input id="cat-name" {...registerCategory("name")} placeholder="e.g. Beverages" />
                     {categoryErrors.name && <p className="text-destructive text-xs">{categoryErrors.name.message}</p>}
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="cat-image">Image</Label>
                     <input id="cat-image" type="file" accept="image/*" {...registerCategory('image')} />
                     <p className="text-xs text-muted-foreground">Upload an image for the category (optional).</p>
                   </div>

                   <DialogFooter>
                     <Button type="submit">Save Category</Button>
                   </DialogFooter>
                 </form>
               </DialogContent>
             </Dialog>*/}

             {/* Add SubCategory Dialog 
             <Dialog open={isAddSubCategoryDialogOpen} onOpenChange={setIsAddSubCategoryDialogOpen}>
               <DialogTrigger asChild>
                 <Button variant="outline" className="gap-2"><Plus className="h-4 w-4" /> Add SubCategory</Button>
               </DialogTrigger>
               <DialogContent className="sm:max-w-[425px]">
                 <DialogHeader>
                   <DialogTitle>Add New SubCategory</DialogTitle>
                   <DialogDescription>
                     Fill in the details to add a new subcategory.
                   </DialogDescription>
                 </DialogHeader>
                 <form onSubmit={handleSubmitSubCategory(onSubmitSubCategory)} className="space-y-4 mt-4">
                   <div className="space-y-2">
                     <Label htmlFor="subcat-name">SubCategory Name</Label>
                     <Input id="subcat-name" {...registerSubCategory("name")} placeholder="e.g. Cold Drinks" />
                     {subCategoryErrors.name && <p className="text-destructive text-xs">{subCategoryErrors.name.message}</p>}
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="subcat-category">Category</Label>
                     <Select onValueChange={(val) => setValueSubCategory("categoryId", val)}>
                       <SelectTrigger>
                         <SelectValue placeholder="Select category" />
                       </SelectTrigger>
                       <SelectContent>
                         {mainCategories.map(cat => (
                           <SelectItem key={cat._id || cat.id} value={cat._id || cat.id || ''}>{cat.name || cat.title}</SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                     {subCategoryErrors.categoryId && <p className="text-destructive text-xs">{subCategoryErrors.categoryId.message}</p>}
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="subcat-image">Image</Label>
                     <input id="subcat-image" type="file" accept="image/*" {...registerSubCategory('image')} />
                     <p className="text-xs text-muted-foreground">Upload an image for the subcategory (optional).</p>
                   </div>

                   <DialogFooter>
                     <Button type="submit">Save SubCategory</Button>
                   </DialogFooter>
                 </form>
               </DialogContent>
             </Dialog>
             */}
            

             {/* Add Item Dialog 
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
                     <Select onValueChange={(val) => setValue("subCategoryId", val)} defaultValue="">
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
             </Dialog> */}

             <Button variant="destructive" className="gap-2" onClick={handleLogout}><LogOut className="h-4 w-4" /> Logout</Button>
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
              <CardTitle>Revenue Overview (Real-time)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartRevenue}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 lg:col-span-3">
             <CardHeader>
              <CardTitle>Orders Timeline (Real-time)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartOrders}>
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
                      <td className="px-6 py-4">₹{item.price.toFixed(2)}</td>
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
                            setTimeout(() => {
                              setValue('title', itemObj.title || itemObj.name || '');
                              setValue('price', Number(itemObj?.price ?? 0));
                              setValue('description', itemObj.description || '');
                              setValue('subCategoryId', itemObj.categoryId || '');
                            }, 0);
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
