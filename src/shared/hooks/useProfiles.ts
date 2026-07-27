import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { queryKeys } from '../../app/queryClient';
import type { TablesUpdate } from '../types/database';

// "denny" -> "Denny" — dipakai di mana pun nama ditampilkan sebagai bagian
// dari kalimat (mis. "dicatat oleh ..."), karena class CSS "capitalize" cuma
// jalan kalau diterapkan ke <Text> utuh, bukan ke potongan string di tengah
// kalimat.
function capitalizeName(name: string) {
  if (!name) return name;
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

async function fetchProfiles() {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) throw error;
  return data;
}

async function updateProfile(userId: string, patch: TablesUpdate<'profiles'>) {
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
  if (error) throw error;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { userId: string; patch: TablesUpdate<'profiles'> }) =>
      updateProfile(params.userId, params.patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.profiles }),
  });
}

// Dipakai di banyak fitur untuk menampilkan "dicatat oleh Denny/Wulan" dsb.
// Hanya 2 profil, jadi aman selalu di-fetch utuh dan dipetakan id -> nama.
export function useProfilesMap() {
  const { data = [] } = useQuery({ queryKey: queryKeys.profiles, queryFn: fetchProfiles });
  const map: Record<string, string> = {};
  data.forEach((p) => {
    // Ditampilkan Capitalize ("Denny"/"Wulan") — cuma buat map display
    // "dicatat oleh ...", bukan dipakai buat submit/validasi apa pun.
    map[p.id] = capitalizeName(p.name);
  });
  return map;
}

// Versi lengkap (termasuk height_cm) untuk modul Kesehatan.
export function useProfilesList() {
  const { data = [] } = useQuery({ queryKey: queryKeys.profiles, queryFn: fetchProfiles });
  return data;
}
