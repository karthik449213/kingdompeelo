import { Navbar } from '@/components/layout/Navbar';
// import { stats } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';
import { DollarSign, ShoppingBag, Users, Utensils, Plus, Trash2, Edit2, LogOut, Eye, EyeOff } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

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
  hidden?: boolean;
};

type Category = {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  image?: string;
  hidden?: boolean;
  category?: string | { _id: string; name: string }; // For subcategories to store parent category
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
  const { toast } = useToast();
  
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
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [weekAnalytics, setWeekAnalytics] = useState<any>(null);
  const [hiddenItems, setHiddenItems] = useState<Item[]>([]);
  const [hiddenCategories, setHiddenCategories] = useState<Category[]>([]);
  const [hiddenSubCategories, setHiddenSubCategories] = useState<Category[]>([]);
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

    const fetchAnalytics = async () => {
      try {
        const [todayRes, weekRes] = await Promise.all([
          fetch(`${API_URL}/analytics/today`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_URL}/analytics/week`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (todayRes.ok) {
          const todayData = await todayRes.json();
          setAnalyticsData(todayData.analytics);
          
          // Update stats with real analytics data
          setStats(prev => [
            { 
              value: `₹${todayData.analytics?.totalRevenue?.toFixed(2) || 0}`, 
              change: `₹${todayData.analytics?.totalRevenue?.toFixed(2) || 0} today` 
            },
            { 
              value: todayData.analytics?.totalOrders || 0, 
              change: `${todayData.analytics?.successfulOrders || 0} successful` 
            },
            { 
              value: `₹${todayData.analytics?.averageOrderValue?.toFixed(2) || 0}`, 
              change: 'average per order' 
            }
          ]);
        }

        if (weekRes.ok) {
          const weekData = await weekRes.json();
          setWeekAnalytics(weekData.analytics);
          
          // Update revenue chart with weekly data
          if (weekData.analytics?.daily && Array.isArray(weekData.analytics.daily)) {
            const weekChartData = weekData.analytics.daily.map((day: any, idx: number) => ({
              name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx % 7],
              total: day.totalRevenue || 0
            }));
            setChartRevenue(weekChartData);
            
            // Update orders chart with weekly data
            const weekOrderData = weekData.analytics.daily.map((day: any, idx: number) => ({
              time: ['10am', '12pm', '2pm', '4pm', '6pm', '8pm', '10pm'][idx % 7],
              orders: day.totalOrders || 0
            }));
            setChartOrders(weekOrderData);
          }
        }
      } catch (err) {
        console.error('Analytics fetch error:', err);
      }
    };

    const fetchDishes = async () => {
      try {
        const token = localStorage.getItem('token');
        // Use the API route that returns dishes (menuRoutes exposes /api/menu/dishes)
        // Add limit=1000 to get all dishes instead of just 20
        // Include auth token so we get ALL items (including hidden) for admin
        const res = await fetch(`${API_URL}/menu/dishes?limit=1000`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
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
          image: dish.image,
          hidden: dish.hidden || false
        })) : []);
      } catch (err) {
        console.error('Error fetching dishes:', err);
      }
    };

    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        // Subcategories are exposed at /api/menu/subcategories
        // Include auth token to get all subcategories (including hidden)
        const res = await fetch(`${API_URL}/menu/subcategories`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
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
          image: sub.image,
          category: sub.category, // Store parent category
          hidden: sub.hidden || false
        })) : []);
      } catch (err) {
        console.error('SubCategories Error:', err);
      }
    };

    const fetchMainCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        // Include auth token to get all categories (including hidden)
        const res = await fetch(`${API_URL}/menu/categories`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
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
          image: cat.image,
          hidden: cat.hidden || false
        })) : []);
      } catch (err) {
        console.error('Categories Error:', err);
      }
    };

    const fetchHiddenDishes = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/menu/admin/hidden-dishes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          console.error('Failed to fetch hidden dishes:', res.status);
          return;
        }
        const data = await res.json();
        setHiddenItems(Array.isArray(data) ? data.map(dish => ({
          _id: dish._id,
          id: dish._id,
          title: dish.name,
          price: dish.price,
          description: dish.description,
          categoryId: dish.subCategory && typeof dish.subCategory === 'object' ? dish.subCategory._id : dish.subCategory,
          image: dish.image,
          hidden: true
        })) : []);
      } catch (err) {
        console.error('Error fetching hidden dishes:', err);
      }
    };

    const fetchHiddenCategories = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/menu/admin/hidden-categories`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          console.error('Failed to fetch hidden categories:', res.status);
          return;
        }
        const data = await res.json();
        setHiddenCategories(Array.isArray(data) ? data.map(cat => ({
          _id: cat._id,
          id: cat._id,
          name: cat.name,
          title: cat.name,
          image: cat.image,
          hidden: true
        })) : []);
      } catch (err) {
        console.error('Error fetching hidden categories:', err);
      }
    };

    const fetchHiddenSubCategories = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/menu/admin/hidden-subcategories`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          console.error('Failed to fetch hidden subcategories:', res.status);
          return;
        }
        const data = await res.json();
        setHiddenSubCategories(Array.isArray(data) ? data.map(sub => ({
          _id: sub._id,
          id: sub._id,
          name: sub.name,
          title: sub.name,
          image: sub.image,
          category: sub.category,
          hidden: true
        })) : []);
      } catch (err) {
        console.error('Error fetching hidden subcategories:', err);
      }
    };

    // Fetch initial data
    fetchDashboardData();
    fetchAnalytics();
    fetchDishes();
    fetchCategories();
    fetchMainCategories();
    fetchHiddenDishes();
    fetchHiddenCategories();
    fetchHiddenSubCategories();

    // Real-time polling for analytics (every 30 seconds)
    pollingIntervalRef.current = setInterval(() => {
      fetchAnalytics();
    }, 30000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

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
          toast({
            title: 'Missing Field',
            description: 'Subcategory is required',
            variant: 'destructive',
          });
          return;
        }

        // Validate image is provided (required for new items, optional for editing)
        const fileList = (data as any).image as FileList | undefined;
        if (!editingItem && (!fileList || fileList.length === 0)) {
          toast({
            title: 'Missing Image',
            description: 'Please upload an image for the dish',
            variant: 'destructive',
          });
          return;
        }

        const form = new FormData();
        form.append('name', data.title);
        form.append('price', String(data.price));
        form.append('description', data.description);
        form.append('subCategory', data.subCategoryId);
        
        // Find the parent category for this subcategory
        const selectedSubCat = categories.find(c => c._id === data.subCategoryId);
        if (selectedSubCat && selectedSubCat.category) {
          const categoryId = typeof selectedSubCat.category === 'object' ? selectedSubCat.category._id : selectedSubCat.category;
          form.append('category', categoryId);
        }
        
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
    if (!token) {
      toast({
        title: 'Not Authenticated',
        description: 'Please log in to perform this action',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm('Delete this item permanently?')) return;

    try {
      const res = await fetch(`${API_URL}/menu/dishes/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Delete failed', err);
        toast({
          title: 'Error',
          description: 'Failed to delete item',
          variant: 'destructive',
        });
      }
      // Remove locally
      setItems(prev => prev.filter(i => (i._id || i.id) !== itemId));
    } catch (e) {
      console.error('Delete Error:', e);
      toast({
        title: 'Error',
        description: 'Delete operation failed',
        variant: 'destructive',
      });
    }
  };

  // Toggle item visibility
  const handleToggleItemVisibility = async (itemId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Not authenticated');

    try {
      const res = await fetch(`${API_URL}/menu/dishes/${itemId}/toggle-visibility`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Toggle visibility failed', err);
        return alert('Failed to toggle visibility');
      }
      const data = await res.json();
      // Update local state to reflect the change
      setItems(prev => prev.map(i => 
        ((i._id || i.id) === itemId) ? { ...i, hidden: data.hidden } : i
      ));
      // Also update hidden items list
      if (data.hidden) {
        // Item was hidden, add it to hidden list
        const hiddenItem = items.find(i => (i._id || i.id) === itemId);
        if (hiddenItem) {
          setHiddenItems(prev => [{ ...hiddenItem, hidden: true }, ...prev]);
        }
      } else {
        // Item was shown, remove from hidden list
        setHiddenItems(prev => prev.filter(i => (i._id || i.id) !== itemId));
      }
    } catch (e) {
      console.error('Toggle Error:', e);
      alert('Failed to toggle visibility');
    }
  };

  // Toggle category visibility
  const handleToggleCategoryVisibility = async (categoryId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Not authenticated');

    try {
      const res = await fetch(`${API_URL}/menu/categories/${categoryId}/toggle-visibility`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Toggle visibility failed', err);
        return alert('Failed to toggle visibility');
      }
      const data = await res.json();
      // Update hidden categories list
      if (data.hidden) {
        const category = mainCategories.find(c => (c._id || c.id) === categoryId);
        if (category) {
          setHiddenCategories(prev => [{ ...category, hidden: true }, ...prev]);
        }
      } else {
        setHiddenCategories(prev => prev.filter(c => (c._id || c.id) !== categoryId));
      }
    } catch (e) {
      console.error('Toggle Error:', e);
      alert('Failed to toggle visibility');
    }
  };

  // Toggle subcategory visibility
  const handleToggleSubCategoryVisibility = async (subCategoryId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Not authenticated');

    try {
      const res = await fetch(`${API_URL}/menu/subcategories/${subCategoryId}/toggle-visibility`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Toggle visibility failed', err);
        return alert('Failed to toggle visibility');
      }
      const data = await res.json();
      // Update hidden subcategories list
      if (data.hidden) {
        const subCategory = categories.find(c => (c._id || c.id) === subCategoryId);
        if (subCategory) {
          setHiddenSubCategories(prev => [{ ...subCategory, hidden: true }, ...prev]);
        }
      } else {
        setHiddenSubCategories(prev => prev.filter(c => (c._id || c.id) !== subCategoryId));
      }
    } catch (e) {
      console.error('Toggle Error:', e);
      alert('Failed to toggle visibility');
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
      toast({
        title: 'Missing Image',
        description: 'Please upload an image for the category',
        variant: 'destructive',
      });
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
        toast({
          title: 'Error',
          description: 'Failed to save category: ' + (err.message || 'Unknown error'),
          variant: 'destructive',
        });
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
      toast({
        title: 'Success',
        description: 'Category added successfully!',
      });
    } catch (e) {
      console.error('Submit Error:', e);
      toast({
        title: 'Error',
        description: 'Failed to save category: ' + (e instanceof Error ? e.message : 'Unknown error'),
        variant: 'destructive',
      });
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
      toast({
        title: 'Missing Image',
        description: 'Please upload an image for the subcategory',
        variant: 'destructive',
      });
      return;
    }

    if (!data.categoryId) {
      toast({
        title: 'Missing Field',
        description: 'Please select a category',
        variant: 'destructive',
      });
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
      toast({
        title: 'Success',
        description: 'Subcategory added successfully!',
      });
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
            

             {/* Add Item Dialog */}
             <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
               setIsAddDialogOpen(open);
               if (!open) {
                 // Reset form when dialog closes
                 setEditingItem(null);
                 reset();
               }
             }}>
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
                     <Select 
                       value={editingItem ? (editingItem.categoryId || editingItem._id) : ""} 
                       onValueChange={(val) => setValue("subCategoryId", val)}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Select subcategory" />
                       </SelectTrigger>
                       <SelectContent>
                         {categories.length > 0 ? (
                           categories.map(cat => (
                             <SelectItem key={cat._id || cat.id} value={cat._id || cat.id || ''}>{cat.name || cat.title}</SelectItem>
                           ))
                         ) : (
                           <div className="p-2 text-sm text-muted-foreground">No subcategories available</div>
                         )}
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
                     <p className="text-xs text-muted-foreground">Upload an image for the item {editingItem ? '(optional)' : '(required)'}.</p>
                   </div>

                   <DialogFooter>
                     <Button type="submit">{editingItem ? 'Update Item' : 'Save Item'}</Button>
                   </DialogFooter>
                 </form>
               </DialogContent>
             </Dialog>

             <Button variant="destructive" className="gap-2" onClick={handleLogout}><LogOut className="h-4 w-4" /> Logout</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {typeof stats[0].value === 'string' ? stats[0].value : `₹${stats[0].value}`}
              </div>
              <p className="text-xs text-green-500 font-medium">{stats[0].change}</p>
            </CardContent>
          </Card>
          <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders Today</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats[1].value}</div>
              <p className="text-xs text-green-500 font-medium">{stats[1].change}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats[2].value}</div>
              <p className="text-xs text-muted-foreground">{stats[2].change}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
              <Utensils className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{items.length}</div>
              <p className="text-xs text-muted-foreground">Active menu items</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Summary */}
        {analyticsData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment Methods (Today)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">PhonePe Orders</span>
                  <span className="font-bold">{analyticsData.paymentMethods?.phonepe?.count || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">PhonePe Revenue</span>
                  <span className="font-bold text-primary">₹{(analyticsData.paymentMethods?.phonepe?.amount || 0).toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">COD Orders</span>
                  <span className="font-bold">{analyticsData.paymentMethods?.cod?.count || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">COD Revenue</span>
                  <span className="font-bold text-primary">₹{(analyticsData.paymentMethods?.cod?.amount || 0).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order Types (Today)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Delivery Orders</span>
                  <span className="font-bold">{analyticsData.orderTypes?.delivery?.count || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Delivery Revenue</span>
                  <span className="font-bold text-primary">₹{(analyticsData.orderTypes?.delivery?.amount || 0).toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Dine-In Orders</span>
                  <span className="font-bold">{analyticsData.orderTypes?.dineIn?.count || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Dine-In Revenue</span>
                  <span className="font-bold text-primary">₹{(analyticsData.orderTypes?.dineIn?.amount || 0).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Dishes (Today)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[280px] overflow-y-auto">
                {analyticsData.topDishes && analyticsData.topDishes.length > 0 ? (
                  analyticsData.topDishes.slice(0, 5).map((dish: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground truncate">{dish.dishName}</span>
                      <div className="text-right">
                        <div className="font-bold">{dish.count} sold</div>
                        <div className="text-xs text-primary">₹{dish.revenue.toFixed(2)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No orders today</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

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
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-yellow-600"
                            onClick={() => handleToggleItemVisibility(itemId)}
                            title={item.hidden ? "Show item" : "Hide item"}
                          >
                            {item.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
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

        {/* Hidden Items Management Section */}
        {(hiddenItems.length > 0 || hiddenCategories.length > 0 || hiddenSubCategories.length > 0) && (
          <div className="mb-8">
            <h2 className="text-2xl font-serif font-bold mb-6">Hidden Items Management</h2>
            
            {/* Hidden Categories */}
            {hiddenCategories.length > 0 && (
              <div className="bg-card rounded-xl border shadow-sm overflow-hidden mb-6">
                <div className="px-6 py-4 bg-muted/50 border-b">
                  <h3 className="text-lg font-semibold">Hidden Categories ({hiddenCategories.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground uppercase font-medium">
                      <tr>
                        <th className="px-6 py-4">Image</th>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {hiddenCategories.map((cat) => {
                        const catId = (cat._id || cat.id) as string;
                        return (
                          <tr key={catId} className="hover:bg-muted/10 transition-colors">
                            <td className="px-6 py-4">
                              <div className="h-10 w-10 rounded overflow-hidden bg-muted">
                                <img src={cat.image} alt={cat.name || cat.title} className="h-full w-full object-cover" />
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium">{cat.name || cat.title}</td>
                            <td className="px-6 py-4 text-right">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="gap-2"
                                onClick={() => handleToggleCategoryVisibility(catId)}
                              >
                                <Eye className="h-4 w-4" /> Restore
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Hidden SubCategories */}
            {hiddenSubCategories.length > 0 && (
              <div className="bg-card rounded-xl border shadow-sm overflow-hidden mb-6">
                <div className="px-6 py-4 bg-muted/50 border-b">
                  <h3 className="text-lg font-semibold">Hidden Subcategories ({hiddenSubCategories.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground uppercase font-medium">
                      <tr>
                        <th className="px-6 py-4">Image</th>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Parent Category</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {hiddenSubCategories.map((subCat) => {
                        const subCatId = (subCat._id || subCat.id) as string;
                        const parentCatName = typeof subCat.category === 'object' ? subCat.category.name : 'Unknown';
                        return (
                          <tr key={subCatId} className="hover:bg-muted/10 transition-colors">
                            <td className="px-6 py-4">
                              <div className="h-10 w-10 rounded overflow-hidden bg-muted">
                                <img src={subCat.image} alt={subCat.name || subCat.title} className="h-full w-full object-cover" />
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium">{subCat.name || subCat.title}</td>
                            <td className="px-6 py-4">{parentCatName}</td>
                            <td className="px-6 py-4 text-right">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="gap-2"
                                onClick={() => handleToggleSubCategoryVisibility(subCatId)}
                              >
                                <Eye className="h-4 w-4" /> Restore
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Hidden Dishes */}
            {hiddenItems.length > 0 && (
              <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-muted/50 border-b">
                  <h3 className="text-lg font-semibold">Hidden Items ({hiddenItems.length})</h3>
                </div>
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
                      {hiddenItems.map((item) => {
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
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="gap-2"
                                onClick={() => handleToggleItemVisibility(itemId)}
                              >
                                <Eye className="h-4 w-4" /> Restore
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
