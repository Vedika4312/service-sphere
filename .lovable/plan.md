

## Plan: Role-Based Navigation for Service Providers

### What Changes

When a user with the `provider` role logs in, they see a completely different bottom navigation and are routed to provider-specific pages only. Customers continue seeing the current navigation unchanged.

### 1. Update BottomNav — Role-Conditional Tabs

- If `role === 'provider'`: show only **Dashboard**, **Bookings**, **Chat**, **Profile** (4 tabs)
- If `role !== 'provider'` (customer/null): keep current tabs (Explore, Bookings, Chat, Profile)
- Provider's default landing route becomes `/provider/dashboard` instead of `/`

### 2. Update App.tsx — Provider Redirect

- Add a redirect: when provider navigates to `/`, redirect to `/provider/dashboard`
- This can be a small `<ProviderRedirect>` wrapper or logic inside `Explore` that checks role and redirects

### 3. Enhance Provider Bookings View

Currently the provider sees bookings inside their Dashboard. Create a dedicated **Provider Bookings page** (`/provider/bookings`) that shows:
- Customer name and phone (from profiles table)
- Service requested
- Booking date/time
- Status badge (pending/accepted/rejected/completed)
- Accept / Reject buttons for pending bookings
- Professional card layout with clear sections

### 4. Update Provider Dashboard

- Remove the "Incoming Requests" section (moved to dedicated Bookings page)
- Keep: Online toggle, Location update, Service CRUD
- Add summary stats at top (total bookings, pending count, services count)
- Remove "Back to Explore" button (no longer relevant for providers)

### 5. Profile Page — Minor Tweak

- Remove the "Provider Dashboard" link (no longer needed since Dashboard is in bottom nav)

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/BottomNav.tsx` | Rewrite nav items based on `role` |
| `src/App.tsx` | Add `/provider/bookings` route, add provider redirect from `/` |
| `src/pages/ProviderBookings.tsx` | **New** — dedicated provider bookings page with customer details and accept/reject |
| `src/pages/ProviderDashboard.tsx` | Remove bookings section, add stats summary, remove "Back to Explore" |
| `src/pages/Profile.tsx` | Remove provider dashboard link |

### No Database Changes Required

All needed data (customer name, phone from `profiles`) is already accessible via existing tables and RLS policies.

