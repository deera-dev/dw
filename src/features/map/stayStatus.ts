import { distanceMeters } from '../../shared/lib/geo';
import { DRIVING_SPEED_THRESHOLD_MPS, HOME_RADIUS_M, OVERNIGHT_MIN_HOURS } from './constants';
import type { Tables } from '../../shared/types/database';

type LocationRow = Tables<'locations'>;
type SavedPlace = Tables<'saved_places'>;

export function isDriving(loc: LocationRow | undefined | null): boolean {
  if (!loc?.speed_mps) return false;
  return loc.speed_mps >= DRIVING_SPEED_THRESHOLD_MPS;
}

// Cocokkan posisi terhadap pin kategori "rumah" mana pun milik siapa saja
// (rumah tetap rumah, dicek berdua) dalam radius HOME_RADIUS_M.
export function isAtHome(loc: LocationRow | undefined | null, savedPlaces: SavedPlace[]): boolean {
  if (!loc) return false;
  return savedPlaces
    .filter((p) => p.category === 'rumah')
    .some((home) => distanceMeters(loc.latitude, loc.longitude, home.latitude, home.longitude) < HOME_RADIUS_M);
}

// Heuristik "kemungkinan menginap": sudah menetap cukup lama (bukan cuma
// mampir) DAN posisi mulai menetap itu terjadi malam hari (>=20:00 atau
// <05:00) — dua tanda ini bareng cukup untuk indikasi "nginep", tanpa perlu
// nyimpen histori jam demi jam (sesuai batasan PRD §4.13).
export function isLikelyOvernightStay(loc: LocationRow | undefined | null, nowMs: number): boolean {
  if (!loc) return false;
  const arrivedAt = new Date(loc.arrived_at);
  const hoursHere = (nowMs - arrivedAt.getTime()) / 3_600_000;
  if (hoursHere < OVERNIGHT_MIN_HOURS) return false;
  const arrivedHour = arrivedAt.getHours();
  return arrivedHour >= 20 || arrivedHour < 5;
}

export type StayLabel = { icon: string; text: string };

// Satu fungsi ringkas dipakai UI untuk label status tempat seseorang saat
// ini — urutan prioritas: rumah > kemungkinan menginap > biasa saja.
export function describeStay(
  loc: LocationRow | undefined | null,
  savedPlaces: SavedPlace[],
  nowMs: number
): StayLabel {
  if (isAtHome(loc, savedPlaces)) return { icon: '🏠', text: 'Di rumah' };
  if (isLikelyOvernightStay(loc, nowMs)) return { icon: '🌙', text: 'Kemungkinan menginap' };
  return { icon: '📍', text: 'Di sini' };
}
