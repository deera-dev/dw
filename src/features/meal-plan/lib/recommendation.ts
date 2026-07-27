import type { Tables } from '../../../shared/types/database';

type Recipe = Tables<'recipes'>;
type RecentPlan = { recipe_id: string | null; meal_date: string };

// Rekomendasi menu murni berbasis rumus/aturan dari data resep & riwayat menu
// yang sudah dicatat Denny & Wulan sendiri — tidak ada AI/model eksternal,
// sesuai prinsip PRD §4.12. Skor: favorit dapat bobot tinggi, lalu makin lama
// resep itu tidak dipakai makin tinggi skornya (mendorong variasi menu,
// bukan mengulang menu yang sama terus). Kalau ada beberapa resep dengan
// skor sama, dipilih acak di antara mereka supaya tiap tekan tombol terasa
// beda (bukan tie-break yang selalu sama).
export function recommendRecipeForMeal(recipes: Recipe[], recentPlans: RecentPlan[]): Recipe | null {
  if (recipes.length === 0) return null;

  const lastUsedDate = new Map<string, string>();
  recentPlans.forEach((p) => {
    if (!p.recipe_id) return;
    const prev = lastUsedDate.get(p.recipe_id);
    if (!prev || p.meal_date > prev) lastUsedDate.set(p.recipe_id, p.meal_date);
  });

  const now = Date.now();
  function score(r: Recipe) {
    const last = lastUsedDate.get(r.id);
    const daysSince = last ? Math.floor((now - new Date(`${last}T00:00:00`).getTime()) / 86_400_000) : 999;
    return (r.is_favorite ? 50 : 0) + Math.min(daysSince, 30);
  }

  const scored = recipes.map((r) => ({ recipe: r, s: score(r) }));
  const maxScore = Math.max(...scored.map((x) => x.s));
  const top = scored.filter((x) => x.s === maxScore).map((x) => x.recipe);
  return top[Math.floor(Math.random() * top.length)];
}
