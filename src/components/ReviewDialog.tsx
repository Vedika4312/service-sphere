import { useState } from 'react';
import { Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  providerId: string;
  providerName: string;
  customerId: string;
  onReviewed: () => void;
}

const ReviewDialog = ({ open, onOpenChange, bookingId, providerId, providerName, customerId, onReviewed }: ReviewDialogProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('reviews').insert({
      booking_id: bookingId,
      customer_id: customerId,
      provider_id: providerId,
      rating,
      comment: comment.trim() || null,
    });
    if (error) {
      toast.error(error.message.includes('duplicate') ? 'Already reviewed' : 'Failed to submit review');
    } else {
      toast.success('Review submitted!');
      onReviewed();
      onOpenChange(false);
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Rate {providerName}</DialogTitle>
          <DialogDescription className="text-center">How was your experience?</DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-2 py-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  'h-8 w-8 transition-colors',
                  (hoveredRating || rating) >= star
                    ? 'fill-[hsl(var(--warning))] text-[hsl(var(--warning))]'
                    : 'text-muted-foreground'
                )}
              />
            </button>
          ))}
        </div>
        <Textarea
          placeholder="Leave a comment (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="rounded-xl resize-none"
          rows={3}
        />
        <Button onClick={handleSubmit} disabled={submitting || rating === 0} className="w-full rounded-xl">
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
