import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toProviderWithDetails, type ProviderWithDetails, type ServiceCategory } from '@/types/provider';

export function useProviders(category: ServiceCategory | null, search: string) {
  return useQuery({
    queryKey: ['providers', category, search],
    queryFn: async (): Promise<ProviderWithDetails[]> => {
      // Fetch providers
      let query = supabase.from('service_providers').select('*');
      if (category) {
        query = query.eq('category', category);
      }
      const { data: providers, error } = await query;
      if (error) throw error;
      if (!providers || providers.length === 0) return [];

      // Fetch profiles for these providers
      const userIds = providers.map(p => p.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      // Fetch services for these providers
      const providerIds = providers.map(p => p.id);
      const { data: services } = await supabase
        .from('services')
        .select('*')
        .in('provider_id', providerIds);

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      const serviceMap = new Map<string, typeof services>();
      (services || []).forEach(s => {
        const arr = serviceMap.get(s.provider_id) || [];
        arr.push(s);
        serviceMap.set(s.provider_id, arr);
      });

      let results = providers.map(sp =>
        toProviderWithDetails(sp, profileMap.get(sp.user_id) || null, serviceMap.get(sp.id) || [])
      );

      // Client-side text search
      if (search) {
        const q = search.toLowerCase();
        results = results.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.services.some(s => s.toLowerCase().includes(q))
        );
      }

      return results;
    },
  });
}
