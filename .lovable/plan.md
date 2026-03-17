

# Service Marketplace MVP — Implementation Plan

This is a large project. I recommend building it in **4 phases** to keep things manageable and testable at each stage.

---

## Phase 1: Foundation & UI Shell (First implementation)

**What we build:**
- Install dependencies: `leaflet`, `react-leaflet`, `@types/leaflet`, `framer-motion`
- Set up Geist-inspired design tokens in `index.css` (clean neutrals, tight spacing)
- **Layout system**: Split-screen on desktop (map left, list right), bottom-drawer on mobile
- **Top search bar** with category chips (Plumber, Cook, Drycleaner, Electrician)
- **Bottom navigation bar** (Explore, Bookings, Chat, Profile)
- **Full-screen Leaflet map** with placeholder markers using Lucide icons per category
- **Provider list panel** with skeleton loading states
- Page transitions with Framer Motion
- Pages: `/` (explore/map), `/bookings`, `/chat`, `/profile`, `/provider/dashboard`
- Mobile-first: 16px+ touch targets, high contrast, draggable bottom drawer via Vaul

**Key files:**
- `src/pages/Explore.tsx` — map + list split view
- `src/components/SearchBar.tsx`, `src/components/CategoryChips.tsx`
- `src/components/BottomNav.tsx`
- `src/components/MapView.tsx` — Leaflet wrapper
- `src/components/ProviderCard.tsx`, `src/components/ProviderList.tsx`
- `src/components/MobileDrawer.tsx` — Vaul-based bottom drawer

---

## Phase 2: Supabase Auth & Roles

**What we build:**
- Enable Supabase Auth (Lovable Cloud)
- Signup flow with role selection: Customer or Service Provider
- Database tables:
  - `profiles` (id, user_id, full_name, avatar_url, role, phone, created_at)
  - `user_roles` (id, user_id, role enum)
  - `service_providers` (id, user_id, category, description, hourly_rate, is_online, latitude, longitude)
  - `services` (id, provider_id, name, description, price)
- RLS policies using `has_role()` security definer function
- Auth pages: `/auth` (login/signup with role picker)
- Protected routes: redirect unauthenticated users

---

## Phase 3: Core Features — Search, Booking, Provider Dashboard

**What we build:**
- **Search & filter**: Category chip filters providers on map + list; text search by name/service
- **Provider profile modal**: Services list, ratings, "Book Now" button
- **Bookings table** (id, customer_id, provider_id, status, scheduled_at, created_at)
- **Provider Dashboard** (`/provider/dashboard`):
  - Online/Offline toggle (updates `is_online`)
  - Location update (browser geolocation → lat/lng)
  - Service listings CRUD
  - Incoming booking requests list
- **Customer bookings page** (`/bookings`): list of past/upcoming bookings

---

## Phase 4: Real-Time Chat & AI Assistant

**What we build:**
- **Chat tables**: `conversations` (id, booking_id, customer_id, provider_id), `messages` (id, conversation_id, sender_id, content, created_at)
- **Real-time chat UI** (`/chat`): conversation list + message thread using Supabase Realtime subscriptions
- **Floating AI chatbot FAB** (bottom-right): expandable chat bubble with Hindi/English toggle
- AI chatbot uses Lovable AI integration for responses

---

## Technical Notes

- **Map**: Leaflet with OpenStreetMap tiles (free, no API key). Custom DivIcon markers with Lucide SVGs per category.
- **Mobile drawer**: Vaul (already in dependencies) for the draggable bottom sheet.
- **Framer Motion**: Page route transitions + skeleton → content animations.
- **Font**: System font stack with Geist-like sizing (clean, legible at all sizes).
- **Responsive breakpoints**: Mobile-first. Desktop split at `md` (768px). Use existing `useIsMobile` hook.

---

## Recommended Approach

Given the scope, I'll implement **Phase 1** first — the complete UI shell with map, navigation, layout, and mock data. This gives you a working, navigable app to review before we add Supabase backend in Phase 2.

Shall I proceed with Phase 1?

