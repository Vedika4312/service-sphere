

## Plan: Chat from Bookings, Ratings/Reviews, Location Features

This is a large feature set spanning 6 areas. Here's the plan:

### 1. Database Changes (Migration)

Create a `reviews` table and add `customer_latitude`/`customer_longitude` columns to `bookings`:

```sql
-- Reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL UNIQUE,
  customer_id uuid NOT NULL,
  provider_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
-- Customers can insert their own review
-- Anyone can read reviews
-- No update/delete

-- Add customer location to bookings
ALTER TABLE public.bookings ADD COLUMN customer_latitude double precision;
ALTER TABLE public.bookings ADD COLUMN customer_longitude double precision;
```

### 2. "Chat" Button on Accepted Bookings (Both Sides)

**Customer Bookings (`Bookings.tsx`)**: For `accepted` status bookings, show a "Chat" button that navigates to `/chat` and opens the conversation with that provider.

**Provider Bookings (`ProviderBookings.tsx`)**: For `accepted` status bookings, show a "Chat" button + "View Details" button. Also keep "Mark Completed".

### 3. Unread Message Badges

- Add an `is_read` boolean column to `messages` table (default false).
- On `Chat.tsx`, when opening a conversation, mark all messages from the other party as read.
- On `BottomNav.tsx`, query unread message count and show a red badge dot on the Chat icon.
- On the conversation list, show unread count per conversation.

### 4. Rating & Review Flow

**Provider side**: When provider clicks "Mark Completed", update status to `completed` as before.

**Customer side**: When a booking transitions to `completed`, show a dialog/popup with star rating (1-5) and a text review field. On submit, insert into `reviews` table. Show the dialog automatically when the customer views a completed booking that hasn't been reviewed yet.

### 5. Customer Location on Booking

**Customer Explore page (`MapView.tsx`)**: Add a "My Location" button that uses browser geolocation to center the map and show a marker.

**Booking creation (`ProviderDetail.tsx`)**: When booking, capture the customer's current location and store `customer_latitude`/`customer_longitude` in the booking.

**Provider "View Details"**: On accepted bookings, show a mini map (Leaflet) with the customer's location pin.

### 6. Booking Detail View for Provider

Add a dialog/expandable view on `ProviderBookings.tsx` for accepted bookings with:
- Customer name, phone, service
- Mini Leaflet map showing customer location
- Chat button

---

### Files to Create/Modify

| File | Action |
|------|--------|
| Migration SQL | Create `reviews` table, add `is_read` to messages, add `customer_latitude/longitude` to bookings |
| `src/pages/Bookings.tsx` | Add Chat button on accepted bookings, add review popup for completed bookings |
| `src/pages/ProviderBookings.tsx` | Add Chat button, View Details dialog with customer location map |
| `src/pages/Chat.tsx` | Mark messages as read on open, show names properly |
| `src/components/BottomNav.tsx` | Query unread count, show badge on Chat tab |
| `src/components/ProviderDetail.tsx` | Capture customer geolocation on booking |
| `src/components/MapView.tsx` | Add "My Location" button with geolocation |
| `src/components/ReviewDialog.tsx` | **New** - Star rating + comment dialog |
| `src/components/BookingDetailDialog.tsx` | **New** - Provider booking detail with mini map |

