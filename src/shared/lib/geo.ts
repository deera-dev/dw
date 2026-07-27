// Util geografi kecil, dipakai fitur Peta Berdua — cuma perhitungan jarak
// titik-ke-titik (Haversine), TIDAK ada logika routing/jalur (lihat PRD
// §4.13: "tidak bikin sistem navigasi/routing sendiri").
const EARTH_RADIUS_M = 6371000;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function distanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
}

// Format durasi (ms) jadi teks Indonesia singkat — "5 menit", "2 jam 10 menit", "1 hari 3 jam".
export function formatDurationShort(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  if (totalMinutes < 1) return 'baru saja';
  if (totalMinutes < 60) return `${totalMinutes} menit`;
  const totalHours = Math.floor(totalMinutes / 60);
  const remMinutes = totalMinutes % 60;
  if (totalHours < 24) {
    return remMinutes > 0 ? `${totalHours} jam ${remMinutes} menit` : `${totalHours} jam`;
  }
  const days = Math.floor(totalHours / 24);
  const remHours = totalHours % 24;
  return remHours > 0 ? `${days} hari ${remHours} jam` : `${days} hari`;
}
