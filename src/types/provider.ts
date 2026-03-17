import type { Tables } from '@/integrations/supabase/types';

// A provider with joined profile and services data for display
export interface ProviderWithDetails {
  id: string;
  user_id: string;
  name: string;
  avatar: string;
  category: 'plumber' | 'cook' | 'drycleaner' | 'electrician';
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  distance: string;
  isOnline: boolean;
  latitude: number;
  longitude: number;
  services: string[];
}

export type ServiceCategory = 'plumber' | 'cook' | 'drycleaner' | 'electrician';

export const categories: { id: ServiceCategory; label: string; labelHi: string }[] = [
  { id: 'plumber', label: 'Plumber', labelHi: 'प्लंबर' },
  { id: 'cook', label: 'Cook', labelHi: 'रसोइया' },
  { id: 'drycleaner', label: 'Drycleaner', labelHi: 'ड्राईक्लीनर' },
  { id: 'electrician', label: 'Electrician', labelHi: 'इलेक्ट्रीशियन' },
];

// Convert DB provider + profile + services into display format
export function toProviderWithDetails(
  sp: Tables<'service_providers'>,
  profile: Tables<'profiles'> | null,
  services: Tables<'services'>[]
): ProviderWithDetails {
  const name = profile?.full_name || 'Provider';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return {
    id: sp.id,
    user_id: sp.user_id,
    name,
    avatar: initials,
    category: sp.category,
    rating: 4.5 + Math.random() * 0.5, // placeholder until reviews table
    reviewCount: Math.floor(20 + Math.random() * 180),
    hourlyRate: sp.hourly_rate,
    distance: '~nearby',
    isOnline: sp.is_online,
    latitude: sp.latitude ?? 28.6139,
    longitude: sp.longitude ?? 77.2090,
    services: services.map(s => s.name),
  };
}
