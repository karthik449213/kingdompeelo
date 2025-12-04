import { useEffect, useState } from 'react';
import { useMenu } from '@/store/useMenu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/layout/Navbar';
import { Plus, Trash2, Edit2 } from 'lucide-react';

const API_BASE = "http://localhost:5000";

interface MenuItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image?: string;
  subcategory?: {
    _id: string;
    name: string;
    category?: { _id: string; name: string } | string;
  } | string;
}

export default function AdminMenuManagement() {
  const { items } = useMenu();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [apiCategories, setApiCategories] = useState<{ _id: string; name: string; image?: string }[]>([]);
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  // Load menu from API
  const loadMenu = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/menu/dishes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMenu(Array.isArray(data) ? data : Array.isArray(data?.dishes) ? data.dishes : []);
      try {
        const catsRes = await fetch(`${API_BASE}/api/menu/categories`);
        const catsData = await catsRes.json();
        setApiCategories(Array.isArray(catsData) ? catsData : []);
      } catch (err) {
        console.warn('Failed to load categories from API:', err);
      }
    } catch (err) {
      console.log('Error loading menu:', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }
    loadMenu();
  }, []);

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
    if (!form.name || !form.price || !form.category || !form.description) {
      alert('Please fill all fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('price', form.price);
      formData.append('description', form.description);
      // send category id (backend expects `category`)
      formData.append('category', form.category);
      if (file) formData.append('image', file);

      const res = await fetch(`${API_BASE}/api/menu/dishes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to add dish');
      alert('Dish Added');
      setForm({ name: '', price: '', category: '', description: '' });
      setFile(null);
      setPreview(null);
      setIsAddDialogOpen(false);
      loadMenu();
    } catch (err: any) {
      console.log('Error adding dish:', err);
      alert('Error Adding Dish');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/menu/dishes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      alert('Dish Deleted');
      loadMenu();
    } catch (err: any) {
      console.log('Error deleting dish:', err);
      alert('Error deleting dish');
    }
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item._id);
    setForm({
      name: item.name || '',
      price: String(item.price ?? ''),
      category: typeof item.category === 'string' ? item.category : item.category?._id || '',
      description: item.description || '',
    });
    setPreview(item.image || null);
    setFile(null);
  };

  const handleUpdate = async () => {
    if (!editingId || !form.name || !form.price || !form.category || !form.description) {
      alert('Please fill all fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('price', form.price);
      formData.append('description', form.description);
      if (form.category) formData.append('category', form.category);
      if (file) formData.append('image', file);

      const res = await fetch(`${API_BASE}/api/menu/dishes/${editingId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to update');
      alert('Dish updated');
      setEditingId(null);
      setForm({ name: '', price: '', category: '', description: '' });
      setFile(null);
      setPreview(null);
      loadMenu();
    } catch (err: any) {
      console.log('Error updating:', err);
      alert('Error updating dish');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', price: '', category: '', description: '' });
    setFile(null);
    setPreview(null);
  };

  const getFilteredMenu = () => {
    if (!filterCategory) return menu;
    return menu.filter((item) => {
      const cat = item.category as any;
      const catId = typeof cat === 'string' ? cat : cat?._id || '';
      return catId === filterCategory;
    });
  };

  return (
    <div className="min-h-screen bg-background pt-24">
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold">Menu Management</h1>
            <p className="text-muted-foreground">Add, edit, and delete menu items</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
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
                  <Label htmlFor="category">Category</Label>
                  <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Select category</SelectItem>
                      {apiCategories.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
            <CardTitle>Filter Menu Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filterCategory">Filter by Category</Label>
                <Select value={filterCategory} onValueChange={(val) => setFilterCategory(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {apiCategories.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items Display */}
        <Card>
          <CardHeader>
            <CardTitle>Menu Items {filterCategory || filterSubcategory ? '(Filtered)' : ''}</CardTitle>
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
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(item)}
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
