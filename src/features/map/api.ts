import { supabase } from '../../shared/lib/supabase';
import { distanceMeters } from '../../shared/lib/geo';
import type { TablesInsert, TablesUpdate } from '../../shared/types/database';

// ---- Lokasi realtime (§4.13) ----
// Satu baris per profil di tabel `locations`, di-upsert selagi is_sharing
// aktif. Sengaja TIDAK menyimpan histori jejak — cuma posisi terkini/terakhir
// (lihat PRD: "Yang sengaja dibatasi").

export async function fetchAllLocations() {
  const { data, error } = await supabase.from('locations').select('*');
  if (error) throw error;
  return data;
}

// Radius "masih di tempat yang sama" — di bawah ini dianggap belum pindah,
// jadi `arrived_at` (dipakai buat info "sudah di sini berapa lama") TIDAK
// direset. Ini BUKAN log jejak (cuma satu timestamp yang dipertahankan/
// direset), konsisten dengan PRD §4.13.
const STAY_RADIUS_M = 100;

// Dipanggil berkala oleh watcher lokasi selagi sharing aktif. Sebelum upsert,
// cek posisi lama dulu — kalau masih dekat (< STAY_RADIUS_M), pertahankan
// arrived_at lama; kalau sudah pindah jauh, reset ke sekarang. `speedMps`
// (opsional, null kalau GPS tidak memberi info kecepatan) dipakai UI buat
// indikasi "sedang berkendara" — nilai sesaat, bukan histori.
export async function upsertLocation(
  profileId: string,
  latitude: number,
  longitude: number,
  speedMps: number | null
) {
  const { data: existing, error: fetchError } = await supabase
    .from('locations')
    .select('latitude, longitude, arrived_at')
    .eq('profile_id', profileId)
    .maybeSingle();
  if (fetchError) throw fetchError;

  const now = new Date().toISOString();
  const stillHere =
    existing && distanceMeters(existing.latitude, existing.longitude, latitude, longitude) < STAY_RADIUS_M;

  const { error } = await supabase.from('locations').upsert({
    profile_id: profileId,
    latitude,
    longitude,
    speed_mps: speedMps,
    is_sharing: true,
    updated_at: now,
    arrived_at: stillHere ? existing!.arrived_at : now,
  });
  if (error) throw error;
}

// Toggle di Pengaturan — mematikan sharing TIDAK menghapus baris ATAU
// menimpa lat/lng terakhir (posisi terakhir tetap tersimpan sebagai
// "terakhir terlihat"), cuma menandai is_sharing supaya klien pasangan tahu
// kapan harus berhenti anggap ini live. Cek dulu apakah baris sudah ada —
// kalau belum, baru insert dengan placeholder 0,0 (belum pernah share sama
// sekali), supaya update di sini tidak pernah menimpa koordinat asli.
export async function setLocationSharing(profileId: string, isSharing: boolean) {
  const { data: existing, error: checkError } = await supabase
    .from('locations')
    .select('profile_id')
    .eq('profile_id', profileId)
    .maybeSingle();
  if (checkError) throw checkError;

  if (existing) {
    const { error } = await supabase
      .from('locations')
      .update({ is_sharing: isSharing, updated_at: new Date().toISOString() })
      .eq('profile_id', profileId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('locations')
      .insert({ profile_id: profileId, latitude: 0, longitude: 0, is_sharing: isSharing });
    if (error) throw error;
  }
}

// ---- Pin tempat penting (§4.13) ----

export async function fetchSavedPlaces() {
  const { data, error } = await supabase
    .from('saved_places')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function insertSavedPlace(place: TablesInsert<'saved_places'>) {
  const { data, error } = await supabase.from('saved_places').insert(place).select().single();
  if (error) throw error;
  return data;
}

export async function updateSavedPlace(id: string, patch: TablesUpdate<'saved_places'>) {
  const { error } = await supabase.from('saved_places').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteSavedPlace(id: string) {
  const { error } = await supabase.from('saved_places').delete().eq('id', id);
  if (error) throw error;
}
