import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase.from('agents').select('*, branches(name)').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAgent(id: string | undefined) {
  return useQuery({
    queryKey: ['agents', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from('agents').select('*').eq('id', id!).single();
      if (error) throw error;
      return data;
    },
  });
}

export function useAgentByUserId(userId: string | undefined) {
  return useQuery({
    queryKey: ['agents', 'user', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from('agents').select('*').eq('user_id', userId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useAgentCommissions(agentId: string | undefined) {
  return useQuery({
    queryKey: ['agent_commissions', agentId],
    enabled: !!agentId,
    queryFn: async () => {
      const { data, error } = await supabase.from('agent_commissions').select('*, bookings(booking_code, total_price, customers(full_name))').eq('agent_id', agentId!).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAgentWallet(agentId: string | undefined) {
  return useQuery({
    queryKey: ['agent_wallets', agentId],
    enabled: !!agentId,
    queryFn: async () => {
      const { data, error } = await supabase.from('agent_wallets').select('*').eq('agent_id', agentId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
