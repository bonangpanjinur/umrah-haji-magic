import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CompanySetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: string;
  description: string | null;
}

export interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  branch_name: string | null;
  is_active: boolean;
  is_primary: boolean;
}

export function useCompanySettings() {
  const queryClient = useQueryClient();

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["company-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_settings")
        .select("*")
        .order("setting_key");
      if (error) throw error;
      return data as CompanySetting[];
    },
  });

  const getSetting = (key: string): any => {
    const setting = settings.find((s) => s.setting_key === key);
    return setting?.setting_value ?? null;
  };

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase
        .from("company_settings")
        .update({ setting_value: value })
        .eq("setting_key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-settings"] });
      toast.success("Pengaturan berhasil disimpan");
    },
    onError: (error: Error) => toast.error("Gagal: " + error.message),
  });

  const updateMultipleSettings = useMutation({
    mutationFn: async (updates: { key: string; value: any }[]) => {
      for (const { key, value } of updates) {
        const { error } = await supabase
          .from("company_settings")
          .update({ setting_value: value })
          .eq("setting_key", key);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-settings"] });
      toast.success("Pengaturan berhasil disimpan");
    },
    onError: (error: Error) => toast.error("Gagal: " + error.message),
  });

  return {
    settings,
    isLoading,
    getSetting,
    updateSetting: updateSettingMutation.mutate,
    updateMultipleSettings: updateMultipleSettings.mutate,
    isUpdating: updateSettingMutation.isPending || updateMultipleSettings.isPending,
  };
}

export function useBankAccounts() {
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .order("is_primary", { ascending: false });
      if (error) throw error;
      return data as BankAccount[];
    },
  });

  const createAccountMutation = useMutation({
    mutationFn: async (account: Omit<BankAccount, "id">) => {
      const { error } = await supabase.from("bank_accounts").insert(account);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      toast.success("Rekening berhasil ditambahkan");
    },
    onError: (error: Error) => toast.error("Gagal: " + error.message),
  });

  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<BankAccount> & { id: string }) => {
      const { error } = await supabase
        .from("bank_accounts")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      toast.success("Rekening berhasil diperbarui");
    },
    onError: (error: Error) => toast.error("Gagal: " + error.message),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bank_accounts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      toast.success("Rekening berhasil dihapus");
    },
    onError: (error: Error) => toast.error("Gagal: " + error.message),
  });

  return {
    accounts,
    isLoading,
    primaryAccount: accounts.find((a) => a.is_primary),
    createAccount: createAccountMutation.mutate,
    updateAccount: updateAccountMutation.mutate,
    deleteAccount: deleteAccountMutation.mutate,
  };
}
