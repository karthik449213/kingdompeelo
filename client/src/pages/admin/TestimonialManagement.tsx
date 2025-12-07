import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import { Star, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { API_URL } from '@/lib/utils';

interface Testimonial {
  _id: string;
  name: string;
  review: string;
  rating: number;
  profileImage?: string;
  approved: boolean;
  createdAt: string;
}

export default function AdminTestimonialManagement() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      window.location.href = '/admin/login';
      return;
    }
    setToken(storedToken);
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/testimonials/all`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      const data = await res.json();
      setTestimonials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/testimonials/${id}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to approve');
      loadTestimonials();
    } catch (err) {
      console.error('Error approving testimonial:', err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/testimonials/${id}/reject`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to reject');
      loadTestimonials();
    } catch (err) {
      console.error('Error rejecting testimonial:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      const res = await fetch(`${API_URL}/testimonials/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete');
      loadTestimonials();
    } catch (err) {
      console.error('Error deleting testimonial:', err);
    }
  };

  const getFilteredTestimonials = () => {
    if (filter === 'approved') return testimonials.filter((t) => t.approved);
    if (filter === 'pending') return testimonials.filter((t) => !t.approved);
    return testimonials;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 stroke-yellow-400'
                : 'stroke-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const stats = {
    total: testimonials.length,
    approved: testimonials.filter((t) => t.approved).length,
    pending: testimonials.filter((t) => !t.approved).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <Navbar />
        <div className="container mx-auto px-4 py-10">
          <p className="text-center text-muted-foreground">Loading testimonials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold">Testimonial Management</h1>
          <p className="text-muted-foreground">Approve, reject, and manage customer reviews</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Testimonials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'approved' ? 'default' : 'outline'}
            onClick={() => setFilter('approved')}
          >
            Approved
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
          >
            Pending
          </Button>
        </div>

        {/* Testimonials List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Testimonials ({getFilteredTestimonials().length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getFilteredTestimonials().length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No testimonials found.
              </p>
            ) : (
              <div className="space-y-4">
                {getFilteredTestimonials().map((testimonial) => (
                  <div
                    key={testimonial._id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition"
                  >
                    <div className="flex gap-4">
                      {/* Profile Image */}
                      {testimonial.profileImage ? (
                        <img
                          src={testimonial.profileImage}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-purple-400 flex items-center justify-center text-white font-bold shrink-0">
                          {testimonial.name.charAt(0)}
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-semibold">{testimonial.name}</h3>
                            <div className="text-sm">
                              {renderStars(testimonial.rating)}
                            </div>
                          </div>
                          <div className="shrink-0">
                            {testimonial.approved ? (
                              <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                <CheckCircle2 className="h-3 w-3" />
                                Approved
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                                <XCircle className="h-3 w-3" />
                                Pending
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          {testimonial.review}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {new Date(testimonial.createdAt).toLocaleDateString()}
                          </span>

                          {/* Actions */}
                          <div className="flex gap-2">
                            {!testimonial.approved && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleApprove(testimonial._id)}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            )}
                            {testimonial.approved && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-yellow-600 hover:text-yellow-700"
                                onClick={() => handleReject(testimonial._id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(testimonial._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
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
