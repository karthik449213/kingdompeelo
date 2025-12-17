import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/layout/Navbar';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { API_URL } from '@/lib/utils';

interface Category {
  _id: string;
  name: string;
  image?: string;
  slug?: string;
}

interface SubCategory {
  _id: string;
  name: string;
  image?: string;
  slug?: string;
  category: string | { _id: string; name: string };
}

export default function AdminCategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [token, setToken] = useState<string>('');

  // Category Form State
  const [categoryForm, setCategoryForm] = useState({ name: '', image: null as File | null, preview: '' });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  // SubCategory Form State
  const [subCategoryForm, setSubCategoryForm] = useState({
    name: '',
    category: '',
    image: null as File | null,
    preview: '',
  });
  const [editingSubCategoryId, setEditingSubCategoryId] = useState<string | null>(null);
  const [isSubCategoryDialogOpen, setIsSubCategoryDialogOpen] = useState(false);

  // Load data on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      window.location.href = '/admin/login';
      return;
    }
    setToken(storedToken);
    loadCategories();
    loadSubCategories();
  }, []);

  // Load categories from API
  const loadCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };
console.log(API_URL);
  // Load subcategories from API
  const loadSubCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/subcategories`);
      const data = await res.json();
      setSubCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load subcategories:', err);
    }
  };

  // ============ CATEGORY HANDLERS ============
  const handleCategoryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setCategoryForm({ ...categoryForm, image: f, preview: URL.createObjectURL(f) });
    }
  };

  const handleCategoryAdd = async () => {
    if (!categoryForm.name || !categoryForm.image) return;

    try {
      const formData = new FormData();
      formData.append('name', categoryForm.name);
      formData.append('image', categoryForm.image);

      const res = await fetch(`${API_URL}/menu/categories`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to add category');
      setCategoryForm({ name: '', image: null, preview: '' });
      setIsCategoryDialogOpen(false);
      loadCategories();
    } catch (err) {
      console.error('Error adding category:', err);
    }
  };

  const handleCategoryUpdate = async () => {
    if (!editingCategoryId || !categoryForm.name) return;

    try {
      const formData = new FormData();
      formData.append('name', categoryForm.name);
      if (categoryForm.image) formData.append('image', categoryForm.image);

      const res = await fetch(`${API_URL}/menu/categories/${editingCategoryId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to update category');
      setCategoryForm({ name: '', image: null, preview: '' });
      setEditingCategoryId(null);
      setIsCategoryDialogOpen(false);
      loadCategories();
    } catch (err) {
      console.error('Error updating category:', err);
    }
  };

  const handleCategoryDelete = async (id: string) => {
    if (!window.confirm('Are you sure? All dishes in this category will be orphaned.')) return;

    try {
      const res = await fetch(`${API_URL}/menu/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete category');
      loadCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  const startEditCategory = (cat: Category) => {
    setEditingCategoryId(cat._id);
    setCategoryForm({
      name: cat.name,
      image: null,
      preview: cat.image || '',
    });
    setIsCategoryDialogOpen(true);
  };

  const cancelCategoryEdit = () => {
    setEditingCategoryId(null);
    setCategoryForm({ name: '', image: null, preview: '' });
  };

  // ============ SUBCATEGORY HANDLERS ============
  const handleSubCategoryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setSubCategoryForm({ ...subCategoryForm, image: f, preview: URL.createObjectURL(f) });
    }
  };

  const handleSubCategoryAdd = async () => {
    if (!subCategoryForm.name || !subCategoryForm.category || !subCategoryForm.image) return;

    try {
      const formData = new FormData();
      formData.append('name', subCategoryForm.name);
      formData.append('category', subCategoryForm.category);
      formData.append('image', subCategoryForm.image);

      const res = await fetch(`${API_URL}/menu/subcategories`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to add subcategory');
      setSubCategoryForm({ name: '', category: '', image: null, preview: '' });
      setIsSubCategoryDialogOpen(false);
      loadSubCategories();
    } catch (err) {
      console.error('Error adding subcategory:', err);
    }
  };

  const handleSubCategoryUpdate = async () => {
    if (!editingSubCategoryId || !subCategoryForm.name || !subCategoryForm.category) return;

    try {
      const formData = new FormData();
      formData.append('name', subCategoryForm.name);
      formData.append('category', subCategoryForm.category);
      if (subCategoryForm.image) formData.append('image', subCategoryForm.image);

      const res = await fetch(`${API_URL}/menu/subcategories/${editingSubCategoryId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to update subcategory');
      setSubCategoryForm({ name: '', category: '', image: null, preview: '' });
      setEditingSubCategoryId(null);
      setIsSubCategoryDialogOpen(false);
      loadSubCategories();
    } catch (err) {
      console.error('Error updating subcategory:', err);
    }
  };

  const handleSubCategoryDelete = async (id: string) => {
    if (!window.confirm('Are you sure? All dishes in this subcategory will be orphaned.')) return;

    try {
      const res = await fetch(`${API_URL}/menu/subcategories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete subcategory');
      loadSubCategories();
    } catch (err) {
      console.error('Error deleting subcategory:', err);
    }
  };

  const startEditSubCategory = (subCat: SubCategory) => {
    setEditingSubCategoryId(subCat._id);
    setSubCategoryForm({
      name: subCat.name,
      category: typeof subCat.category === 'string' ? subCat.category : subCat.category._id,
      image: null,
      preview: subCat.image || '',
    });
    setIsSubCategoryDialogOpen(true);
  };

  const cancelSubCategoryEdit = () => {
    setEditingSubCategoryId(null);
    setSubCategoryForm({ name: '', category: '', image: null, preview: '' });
  };

  return (
    <div className="min-h-screen bg-background pt-24">
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold">Category Management</h1>
          <p className="text-muted-foreground">Manage categories and subcategories</p>
        </div>

        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="subcategories">SubCategories</TabsTrigger>
          </TabsList>

          {/* ============ CATEGORIES TAB ============ */}
          <TabsContent value="categories" className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">All Categories</h2>
              <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="gap-2"
                    onClick={() => {
                      cancelCategoryEdit();
                      setIsCategoryDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" /> Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{editingCategoryId ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="cat-name">Category Name</Label>
                      <Input
                        id="cat-name"
                        placeholder="Category Name"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cat-image">Image</Label>
                      <Input
                        id="cat-image"
                        type="file"
                        accept="image/*"
                        onChange={handleCategoryFileChange}
                      />
                      {categoryForm.preview && (
                        <img
                          src={categoryForm.preview}
                          alt="preview"
                          className="w-24 h-20 object-cover rounded"
                        />
                      )}
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                      <Button variant="outline" onClick={cancelCategoryEdit}>
                        Cancel
                      </Button>
                      <Button
                        onClick={editingCategoryId ? handleCategoryUpdate : handleCategoryAdd}
                        disabled={!categoryForm.name}
                      >
                        {editingCategoryId ? 'Update' : 'Add'} Category
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <Card key={cat._id} className="overflow-hidden">
                  <div className="aspect-video overflow-hidden bg-muted">
                    {cat.image && (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-bold text-lg mb-4">{cat.name}</h3>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => startEditCategory(cat)}
                      >
                        <Edit2 className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleCategoryDelete(cat._id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {categories.length === 0 && (
              <p className="text-center text-muted-foreground py-10">No categories found.</p>
            )}
          </TabsContent>

          {/* ============ SUBCATEGORIES TAB ============ */}
          <TabsContent value="subcategories" className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">All SubCategories</h2>
              <Dialog open={isSubCategoryDialogOpen} onOpenChange={setIsSubCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="gap-2"
                    onClick={() => {
                      cancelSubCategoryEdit();
                      setIsSubCategoryDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" /> Add SubCategory
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingSubCategoryId ? 'Edit SubCategory' : 'Add New SubCategory'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="subcat-name">SubCategory Name</Label>
                      <Input
                        id="subcat-name"
                        placeholder="SubCategory Name"
                        value={subCategoryForm.name}
                        onChange={(e) =>
                          setSubCategoryForm({ ...subCategoryForm, name: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subcat-category">Parent Category</Label>
                      <select
                        id="subcat-category"
                        className="w-full border rounded px-3 py-2 bg-background"
                        value={subCategoryForm.category}
                        onChange={(e) =>
                          setSubCategoryForm({ ...subCategoryForm, category: e.target.value })
                        }
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subcat-image">Image</Label>
                      <Input
                        id="subcat-image"
                        type="file"
                        accept="image/*"
                        onChange={handleSubCategoryFileChange}
                      />
                      {subCategoryForm.preview && (
                        <img
                          src={subCategoryForm.preview}
                          alt="preview"
                          className="w-24 h-20 object-cover rounded"
                        />
                      )}
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                      <Button variant="outline" onClick={cancelSubCategoryEdit}>
                        Cancel
                      </Button>
                      <Button
                        onClick={
                          editingSubCategoryId
                            ? handleSubCategoryUpdate
                            : handleSubCategoryAdd
                        }
                        disabled={!subCategoryForm.name || !subCategoryForm.category}
                      >
                        {editingSubCategoryId ? 'Update' : 'Add'} SubCategory
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subCategories.map((subCat) => (
                <Card key={subCat._id} className="overflow-hidden">
                  <div className="aspect-video overflow-hidden bg-muted">
                    {subCat.image && (
                      <img
                        src={subCat.image}
                        alt={subCat.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-bold text-lg mb-1">{subCat.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {typeof subCat.category === 'string'
                        ? subCat.category
                        : subCat.category?.name}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => startEditSubCategory(subCat)}
                      >
                        <Edit2 className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleSubCategoryDelete(subCat._id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {subCategories.length === 0 && (
              <p className="text-center text-muted-foreground py-10">No subcategories found.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
