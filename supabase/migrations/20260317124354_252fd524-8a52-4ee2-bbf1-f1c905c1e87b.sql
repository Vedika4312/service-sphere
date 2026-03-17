
-- Create booking status enum
CREATE TYPE public.booking_status AS ENUM ('pending', 'accepted', 'rejected', 'completed', 'cancelled');

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Customers can view their own bookings
CREATE POLICY "Customers can view own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = customer_id);

-- Providers can view bookings assigned to them
CREATE POLICY "Providers can view their bookings"
  ON public.bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.service_providers sp
      WHERE sp.id = bookings.provider_id AND sp.user_id = auth.uid()
    )
  );

-- Customers can create bookings
CREATE POLICY "Customers can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Providers can update booking status
CREATE POLICY "Providers can update booking status"
  ON public.bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.service_providers sp
      WHERE sp.id = bookings.provider_id AND sp.user_id = auth.uid()
    )
  );

-- Customers can cancel their own bookings
CREATE POLICY "Customers can update own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = customer_id);

-- Timestamp trigger
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
