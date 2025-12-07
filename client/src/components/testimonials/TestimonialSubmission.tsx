import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { API_URL } from '@/lib/utils';

interface TestimonialSubmission {
  name: string;
  review: string;
  rating: number;
  profileImage: File | null;
}

export function TestimonialSubmissionDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<TestimonialSubmission>({
    name: '',
    review: '',
    rating: 5,
    profileImage: null,
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, profileImage: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.review || !form.rating) {
      setSubmitMessage('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('review', form.review);
      formData.append('rating', String(form.rating));
      if (form.profileImage) {
        formData.append('profileImage', form.profileImage);
      }

      const res = await fetch(`${API_URL}/testimonials/submit`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to submit testimonial');
      }

      setSubmitMessage('Thank you! Your testimonial will be reviewed and published soon.');
      setForm({ name: '', review: '', rating: 5, profileImage: null });
      setPreview(null);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitMessage('');
      }, 2000);
    } catch (err) {
      setSubmitMessage('Failed to submit testimonial. Please try again.');
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          Share Your Review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Your Experience</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">Rating *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, rating: star }))}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= form.rating
                        ? 'fill-yellow-400 stroke-yellow-400'
                        : 'stroke-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {form.rating}/5
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review">Your Review *</Label>
            <Textarea
              id="review"
              name="review"
              placeholder="Share your experience with us..."
              value={form.review}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profileImage">Profile Photo (Optional)</Label>
            <Input
              id="profileImage"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {preview && (
              <div className="mt-2">
                <img
                  src={preview}
                  alt="Profile preview"
                  className="w-20 h-20 object-cover rounded-full"
                />
              </div>
            )}
          </div>

          {submitMessage && (
            <div
              className={`text-sm p-3 rounded ${
                submitMessage.includes('Thank you')
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {submitMessage}
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
