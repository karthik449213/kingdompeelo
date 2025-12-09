import { useEffect, useState, useCallback } from 'react';
import { useMenu } from '@/store/useMenu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/layout/Navbar';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { API_URL } from '@/lib/utils';

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
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSubCategory, setFilterSubCategory] = useState('');
  const [showOnlyStandalone, setShowOnlyStandalone] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [token, setToken] = useState<string>('');

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
      const res = await fetch(`${API_URL}/menu/dishes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMenu(Array.isArray(data) ? data : Array.isArray(data?.dishes) ? data.dishes : []);
    } catch (err) {
      console.error('Failed to load menu:', err);
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
    }
  }, [token, loadMenu, loadCategories, loadSubCategories]);

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
      alert('Please fill in all required fields including category, subcategory, and an image');
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
      alert('Error adding dish: ' + (err.message || 'Unknown error'));
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
    } catch (err: any) {
      console.error('Error deleting dish:', err);
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
      alert('Please fill in all required fields including category and subcategory');
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
      alert('Error updating dish: ' + (err.message || 'Unknown error'));
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
    let filtered = menu;

    if (showOnlyStandalone) {
      // Show only items without subCategory
      filtered = filtered.filter((item) => !item.subCategory);
    } else {
      // Filter by category
      if (filterCategory) {
        filtered = filtered.filter((item) => {
          // Get the category ID from the item
          const itemCategoryId = typeof item.category === 'string' ? item.category : item.category?._id;
          return itemCategoryId === filterCategory;
        });
      }
      // Filter by subcategory
      if (filterSubCategory) {
        filtered = filtered.filter((item) => {
          // Get the subcategory ID from the item
          const itemSubCategoryId = typeof item.subCategory === 'string' ? item.subCategory : item.subCategory?._id;
          return itemSubCategoryId === filterSubCategory;
        });
      }
    }

    return filtered;
  };

  return (
    <div className="min-h-screen bg-background pt-24">
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold">Dish Management</h1>
            <p className="text-muted-foreground">Add, edit, and delete dishes</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Dish' : 'Add New Dish'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
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
                  <Select value={form.category} onValueChange={(val) => {
                    setForm({ ...form, category: val, subCategory: '' });
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
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
                      value={form.subCategory}
                      onValueChange={(val) => setForm({ ...form, subCategory: val })}
                      disabled={!form.category}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subcategory" />
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

        {/* Filter Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter Dishes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <input
                type="checkbox"
                id="showStandalone"
                checked={showOnlyStandalone}
                onChange={(e) => {
                  setShowOnlyStandalone(e.target.checked);
                  setFilterCategory('');
                  setFilterSubCategory('');
                }}
                className="w-4 h-4"
              />
              <Label htmlFor="showStandalone" className="cursor-pointer">
                Show only dishes with Category only (no SubCategory)
              </Label>
            </div>

            {!showOnlyStandalone && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="filterCategory">Filter by Category</Label>
                  <div className="flex gap-2">
                    <Select value={filterCategory} onValueChange={(val) => {
                      setFilterCategory(val);
                      setFilterSubCategory('');
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c._id} value={c._id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {filterCategory && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFilterCategory('');
                          setFilterSubCategory('');
                        }}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filterSubCategory">Filter by SubCategory</Label>
                  <div className="flex gap-2">
                    <Select
                      value={filterSubCategory}
                      onValueChange={setFilterSubCategory}
                      disabled={!filterCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All subcategories" />
                      </SelectTrigger>
                      <SelectContent>
                        {subCategories
                          .filter((sc) => {
                            const scCategoryId = typeof sc.category === 'string' ? sc.category : (sc.category as any)?._id;
                            return scCategoryId === filterCategory;
                          })
                          .map((sc) => (
                            <SelectItem key={sc._id} value={sc._id}>
                              {sc.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {filterSubCategory && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFilterSubCategory('')}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Menu Items Display */}
        <Card>
          <CardHeader>
            <CardTitle>
              Dishes
              {showOnlyStandalone
                ? ' (Category Only)'
                : filterCategory || filterSubCategory
                ? ' (Filtered)'
                : ''}
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
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">₹{item.price}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                        <div className="text-xs mt-2 space-y-1">
                          <p>
                            Category:{' '}
                            <span className="font-semibold">
                              {typeof item.category === 'string'
                                ? item.category
                                : item.category?.name}
                            </span>
                          </p>
                          {item.subCategory && (
                            <p>
                              SubCategory:{' '}
                              <span className="font-semibold">
                                {typeof item.subCategory === 'string'
                                  ? item.subCategory
                                  : item.subCategory?.name}
                              </span>
                            </p>
                          )}
                          <p>
                            Rating: <span className="font-semibold">{item.stars ?? 5} ⭐</span>
                          </p>
                          <p>
                            Status:{' '}
                            <span className={`font-semibold ${item.available !== false ? 'text-green-600' : 'text-red-600'}`}>
                              {item.available !== false ? '✓ Available' : '✗ Not Available'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          startEdit(item);
                          setIsAddDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
