import { useEffect, useState, useCallback } from 'react';
import { useMenu } from '@/store/useMenu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent,DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/layout/Navbar';
import { Plus, Trash2, Edit2, Search, ArrowUp, Star, Eye, EyeOff } from 'lucide-react';
import { API_URL } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface MenuItem {
  _id: string;
  name: string;
  category?: string | { _id: string; name: string };
  subCategory?: string | { _id: string; name: string };
  price: number;
  description: string;
  image?: string;
  available?: boolean;
  stars?: number;
  hidden?: boolean;
}

interface Category {
  _id: string;
  name: string;
}

interface SubCategory {
  _id: string;
  name: string;
  category: string;
}

export default function AdminMenuManagement() {
  const { items } = useMenu();
  const { toast } = useToast();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: '',
    subCategory: '',
    description: '',
    available: true,
    stars: 5,
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [token, setToken] = useState<string>('');
  const [hiddenItems, setHiddenItems] = useState<MenuItem[]>([]);

  // Load data on mount
  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      window.location.href = '/admin/login';
      return;
    }
    setToken(authToken);
  }, []);

  // Load menu from API
  const loadMenu = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/menu/dishes?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMenu(Array.isArray(data) ? data : Array.isArray(data?.dishes) ? data.dishes : []);
    } catch (err) {
      console.error('Failed to load menu:', err);
    }
  }, [token]);

  // Load hidden dishes
  const loadHiddenItems = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/menu/admin/hidden-dishes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setHiddenItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load hidden items:', err);
    }
  }, [token]);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/menu/categories`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  // Load subcategories
  const loadSubCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/menu/subcategories`);
      const data = await res.json();
      setSubCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load subcategories:', err);
    }
  }, []);

  // Load data when token is set
  useEffect(() => {
    if (token) {
      loadMenu();
      loadCategories();
      loadSubCategories();
      loadHiddenItems();
    }
  }, [token, loadMenu, loadCategories, loadSubCategories, loadHiddenItems]);

  // Handle scroll to top visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper function to render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= Math.floor(rating)
                ? 'fill-amber-400 text-amber-400'
                : star - 0.5 <= rating
                ? 'fill-amber-200 text-amber-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">({rating})</span>
      </div>
    );
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: any) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  };

  const handleAdd = async () => {
    if (!form.name || !form.price || !form.category || !form.subCategory || !form.description || !file) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields including category, subcategory, and an image',
        variant: 'destructive',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('price', form.price);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('subCategory', form.subCategory);
      formData.append('available', String(form.available));
      formData.append('stars', String(form.stars));
      formData.append('image', file);

      const res = await fetch(`${API_URL}/menu/dishes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to add dish');
      setForm({ name: '', price: '', category: '', subCategory: '', description: '', available: true, stars: 5 });
      setFile(null);
      setPreview(null);
      setIsAddDialogOpen(false);
      loadMenu();
    } catch (err: any) {
      console.error('Error adding dish:', err);
      toast({
        title: 'Error',
        description: 'Failed to add dish: ' + (err.message || 'Unknown error'),
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      const res = await fetch(`${API_URL}/menu/dishes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      loadMenu();
      loadHiddenItems();
    } catch (err: any) {
      console.error('Error deleting dish:', err);
    }
  };

  const handleToggleVisibility = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/menu/dishes/${id}/toggle-visibility`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to toggle visibility');
      loadMenu();
      loadHiddenItems();
    } catch (err: any) {
      console.error('Error toggling visibility:', err);
      toast({
        title: 'Error',
        description: 'Failed to toggle visibility: ' + (err.message || 'Unknown error'),
        variant: 'destructive',
      });
    }
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item._id);
    setForm({
      name: item.name || '',
      price: String(item.price ?? ''),
      category: typeof item.category === 'string' ? item.category : item.category?._id || '',
      subCategory: typeof item.subCategory === 'string' ? item.subCategory : item.subCategory?._id || '',
      description: item.description || '',
      available: item.available ?? true,
      stars: item.stars ?? 5,
    });
    setPreview(item.image || null);
    setFile(null);
  };

  const handleUpdate = async () => {
    if (!editingId || !form.name || !form.price || !form.category || !form.subCategory || !form.description) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields including category and subcategory',
        variant: 'destructive',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('price', form.price);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('subCategory', form.subCategory);
      formData.append('available', String(form.available));
      formData.append('stars', String(form.stars));
      if (file) formData.append('image', file);

      const res = await fetch(`${API_URL}/menu/dishes/${editingId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to update');
      setEditingId(null);
      setForm({ name: '', price: '', category: '', subCategory: '', description: '', available: true, stars: 5 });
      setFile(null);
      setPreview(null);
      loadMenu();
    } catch (err: any) {
      console.error('Error updating dish:', err);
      toast({
        title: 'Error',
        description: 'Failed to update dish: ' + (err.message || 'Unknown error'),
        variant: 'destructive',
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', price: '', category: '', subCategory: '', description: '', available: true, stars: 5 });
    setFile(null);
    setPreview(null);
  };

  // Get filtered subcategories based on selected category
  const getAvailableSubCategories = () => {
    if (!form.category) return [];
    return subCategories.filter((sc) => {
      // Handle both cases: category as string ID or as object with _id
      const categoryId = typeof sc.category === 'string' ? sc.category : (sc.category as any)?._id;
      return categoryId === form.category;
    });
  };

  const getFilteredMenu = () => {
    return menu.filter((item) => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-background pt-24">
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold">Dish Management</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Add, edit, and delete dishes</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) {
              // Reset form when dialog closes
              cancelEdit();
            }
          }}>
            <DialogTrigger asChild>
              <Button
                className="gap-2"
                onClick={() => {
                  cancelEdit();
                  setIsAddDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4" /> Add Dish
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Dish' : 'Add New Dish'}</DialogTitle>
                   <DialogDescription>
      This action is permanent and cannot be undone.
    </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4 pb-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Dish Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Dish Name"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    placeholder="Price"
                    value={form.price}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={form.category || ''} onValueChange={(val) => {
                    setForm({ ...form, category: val, subCategory: '' });
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category">
                        {form.category ? categories.find(c => c._id === form.category)?.name : 'Select category'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subCategory">SubCategory *</Label>
                  <div className="flex gap-2 items-center">
                    <Select
                      value={form.subCategory || ''}
                      onValueChange={(val) => setForm({ ...form, subCategory: val })}
                      disabled={!form.category}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subcategory">
                          {form.subCategory ? getAvailableSubCategories().find(sc => sc._id === form.subCategory)?.name : 'Select subcategory'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableSubCategories().map((sc) => (
                          <SelectItem key={sc._id} value={sc._id}>
                            {sc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.subCategory && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setForm({ ...form, subCategory: '' })}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {preview && (
                    <div className="mt-2">
                      <img src={preview} alt="preview" className="w-24 h-16 object-cover rounded" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Description"
                    value={form.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stars">Star Rating</Label>
                  <Input
                    id="stars"
                    type="number"
                    min="0"
                    max="5"
                    step="0.5"
                    placeholder="0-5"
                    value={form.stars}
                    onChange={(e) => setForm({ ...form, stars: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.available}
                      onChange={(e) => setForm({ ...form, available: e.target.checked })}
                      className="w-4 h-4"
                    />
                    Available for Order
                  </Label>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                  <Button onClick={editingId ? handleUpdate : handleAdd}>
                    {editingId ? 'Update Dish' : 'Add Dish'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search dishes by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-2"
            />
          </div>
        </div>

        {/* Menu Items Display */}
        <Card>
          <CardHeader>
            <CardTitle>
              Dishes
              {searchTerm ? ' (Search Results)' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getFilteredMenu().length === 0 ? (
              <p className="text-muted-foreground">No dishes found.</p>
            ) : (
              <div className="space-y-3">
                {getFilteredMenu().map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-secondary/50 transition gap-4"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-12 sm:w-20 sm:h-16 object-cover rounded shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-base truncate">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">₹{item.price}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                        <div className="text-xs mt-2 space-y-1">
                          <p className="truncate">
                            Category:{' '}
                            <span className="font-semibold">
                              {typeof item.category === 'string'
                                ? item.category
                                : item.category?.name}
                            </span>
                          </p>
                          {item.subCategory && (
                            <p className="truncate">
                              SubCategory:{' '}
                              <span className="font-semibold">
                                {typeof item.subCategory === 'string'
                                  ? item.subCategory
                                  : item.subCategory?.name}
                              </span>
                            </p>
                          )}
                          <div className="flex items-center">
                            <span className="font-semibold mr-1">Rating:</span>
                            {renderStars(item.stars ?? 5)}
                          </div>
                          <p>
                            Status:{' '}
                            <span className={`font-semibold ${item.available !== false ? 'text-green-600' : 'text-red-600'}`}>
                              {item.available !== false ? '✓ Available' : '✗ Not Available'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        title={item.hidden ? "Show item" : "Hide item"}
                        className="flex-1 sm:flex-none"
                        onClick={() => handleToggleVisibility(item._id)}
                      >
                        {item.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sm:hidden ml-1">{item.hidden ? 'Show' : 'Hide'}</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 sm:flex-none"
                        onClick={() => {
                          startEdit(item);
                          setIsAddDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                        <span className="sm:hidden ml-1">Edit</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1 sm:flex-none"
                        onClick={() => handleDelete(item._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sm:hidden ml-1">Delete</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hidden Items Section */}
        {hiddenItems.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Hidden Items ({hiddenItems.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hiddenItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-secondary/50 transition gap-4 opacity-60"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-12 sm:w-20 sm:h-16 object-cover rounded shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-base truncate">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">₹{item.price}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 sm:flex-none gap-2"
                        onClick={() => handleToggleVisibility(item._id)}
                      >
                        <Eye className="h-4 w-4" /> Restore
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:bg-primary/90 transition-all duration-300 z-50"
          title="Scroll to top"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
