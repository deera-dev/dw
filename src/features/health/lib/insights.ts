import type { Tables } from '../../../shared/types/database';
import { categorizeBmi, calculateBmi, BMI_CATEGORY_LABEL } from '../../../shared/lib/bmi';
import { categorizeBloodPressure, BP_CATEGORY_LABEL } from '../../../shared/lib/bloodPressure';

type WeightLog = Tables<'weight_logs'>;
type BpLog = Tables<'blood_pressure_logs'>;
type SmokingLog = Tables<'smoking_logs'>;
type Profile = Tables<'profiles'>;

export type PersonHealthInsight = {
  name: string;
  weightTrend: { direction: 'naik' | 'turun' | 'stabil'; deltaKg: number } | null;
  bmiLine: string | null;
  bpTrendLine: string | null;
  smokingLine: string | null;
};

// Semua di sini murni rumus/aturan dari data sendiri dibandingkan tabel
// referensi standar (BMI, tensi) — tidak ada AI/model eksternal, sesuai PRD §4.12.
export function computeHealthInsightForPerson(
  profile: Profile,
  weightLogs: WeightLog[],
  bpLogs: BpLog[],
  smokingLogs: SmokingLog[] = []
): PersonHealthInsight {
  const recentWeights = weightLogs.slice(0, 5);
  let weightTrend: PersonHealthInsight['weightTrend'] = null;
  if (recentWeights.length >= 2) {
    const newest = recentWeights[0].weight_kg;
    const oldest = recentWeights[recentWeights.length - 1].weight_kg;
    const delta = newest - oldest;
    weightTrend = {
      direction: delta > 0.3 ? 'naik' : delta < -0.3 ? 'turun' : 'stabil',
      deltaKg: Math.abs(delta),
    };
  }

  let bmiLine: string | null = null;
  if (recentWeights[0] && profile.height_cm) {
    const bmi = calculateBmi(recentWeights[0].weight_kg, profile.height_cm);
    const category = categorizeBmi(bmi);
    bmiLine = `BMI ${bmi.toFixed(1)} — kategori ${BMI_CATEGORY_LABEL[category]}`;
  }

  let bpTrendLine: string | null = null;
  const recentBp = bpLogs.slice(0, 3);
  if (recentBp.length > 0) {
    const avgSys = Math.round(recentBp.reduce((s, l) => s + l.systolic, 0) / recentBp.length);
    const avgDia = Math.round(recentBp.reduce((s, l) => s + l.diastolic, 0) / recentBp.length);
    const category = categorizeBloodPressure(avgSys, avgDia);
    const trendWord =
      recentBp.length >= 2 && recentBp[0].systolic > recentBp[recentBp.length - 1].systolic
        ? 'cenderung naik'
        : recentBp.length >= 2 && recentBp[0].systolic < recentBp[recentBp.length - 1].systolic
          ? 'cenderung turun'
          : 'relatif stabil';
    bpTrendLine = `Tensi ${recentBp.length}x terakhir ${trendWord}, rata-rata ${avgSys}/${avgDia} (${BP_CATEGORY_LABEL[category]})`;
  }

  let smokingLine: string | null = null;
  if (profile.is_smoker) {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentSmoking = smokingLogs.filter((l) => new Date(l.recorded_at).getTime() >= sevenDaysAgo);
    const totalSticks = recentSmoking.reduce((s, l) => s + l.cigarette_count, 0);
    const avgPerDay = totalSticks / 7;
    const perStickCost =
      profile.cigarettes_per_pack > 0 ? profile.cigarette_pack_price / profile.cigarettes_per_pack : 0;
    const estimatedWeeklyCost = perStickCost * totalSticks;
    smokingLine =
      totalSticks > 0
        ? `Rokok ${totalSticks} batang dalam 7 hari terakhir (rata-rata ${avgPerDay.toFixed(1)}/hari), estimasi biaya Rp${Math.round(
            estimatedWeeklyCost
          ).toLocaleString('id-ID')}`
        : 'Belum ada catatan rokok dalam 7 hari terakhir.';
  }

  return { name: profile.name, weightTrend, bmiLine, bpTrendLine, smokingLine };
}
