
-- Reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL,
  provider_id uuid NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  rating integer NOT NULL,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Validation trigger instead of CHECK constraint
CREATE OR REPLACE FUNCTION public.validate_review_rating()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_review_rating
  BEFORE INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.validate_review_rating();

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Customers can insert own reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = customer_id);

-- Add is_read to messages
ALTER TABLE public.messages ADD COLUMN is_read boolean NOT NULL DEFAULT false;

-- Allow participants to update is_read on messages
CREATE POLICY "Participants can mark messages read" ON public.messages FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (c.customer_id = auth.uid() OR EXISTS (SELECT 1 FROM service_providers sp WHERE sp.id = c.provider_id AND sp.user_id = auth.uid()))
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (c.customer_id = auth.uid() OR EXISTS (SELECT 1 FROM service_providers sp WHERE sp.id = c.provider_id AND sp.user_id = auth.uid()))
  ));

-- Add customer location to bookings
ALTER TABLE public.bookings ADD COLUMN customer_latitude double precision;
ALTER TABLE public.bookings ADD COLUMN customer_longitude double precision;

-- Allow conversations to be updated (for updated_at)
CREATE POLICY "Participants can update conversations" ON public.conversations FOR UPDATE TO authenticated
  USING (customer_id = auth.uid() OR EXISTS (SELECT 1 FROM service_providers sp WHERE sp.id = conversations.provider_id AND sp.user_id = auth.uid()));
