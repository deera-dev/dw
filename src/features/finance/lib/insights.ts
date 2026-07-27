import type { Tables } from '../../../shared/types/database';

type SummaryRow = Tables<'v_monthly_summary'>;

export type FinanceInsight = {
  pctChangeExpense: number | null;
  topCategoryThisMonth: { category: string; total: number } | null;
  fastestRisingCategory: { category: string; pctChange: number } | null;
  projectedEndBalance: number | null;
  daysLeftInMonth: number;
};

function monthKey(dateStr: string) {
  return dateStr.slice(0, 7); // "YYYY-MM"
}

// Semua di sini murni rumus/aturan dari data sendiri (rata-rata, % perubahan,
// proyeksi linear) — tidak ada AI/model eksternal, sesuai PRD §4.12.
export function computeFinanceInsight(params: {
  summary: SummaryRow[];
  currentBalance: number | null;
  currentMonthExpense: number | null;
}): FinanceInsight {
  const now = new Date();
  const thisKey = monthKey(now.toISOString());
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastKey = monthKey(lastMonthDate.toISOString());

  const thisMonthExpense = params.summary.filter(
    (r) => r.type === 'pengeluaran' && r.month && monthKey(r.month) === thisKey
  );
  const lastMonthExpense = params.summary.filter(
    (r) => r.type === 'pengeluaran' && r.month && monthKey(r.month) === lastKey
  );

  const totalThis = thisMonthExpense.reduce((s, r) => s + (r.total ?? 0), 0);
  const totalLast = lastMonthExpense.reduce((s, r) => s + (r.total ?? 0), 0);
  const pctChangeExpense = totalLast > 0 ? ((totalThis - totalLast) / totalLast) * 100 : null;

  const topCategoryThisMonth = thisMonthExpense.reduce<{ category: string; total: number } | null>(
    (acc, r) => {
      if (!r.category) return acc;
      if (!acc || (r.total ?? 0) > acc.total) return { category: r.category, total: r.total ?? 0 };
      return acc;
    },
    null
  );

  let fastestRisingCategory: { category: string; pctChange: number } | null = null;
  for (const r of thisMonthExpense) {
    if (!r.category) continue;
    const prev = lastMonthExpense.find((l) => l.category === r.category);
    const prevTotal = prev?.total ?? 0;
    if (prevTotal > 0) {
      const pct = (((r.total ?? 0) - prevTotal) / prevTotal) * 100;
      if (pct > 0 && (!fastestRisingCategory || pct > fastestRisingCategory.pctChange)) {
        fastestRisingCategory = { category: r.category, pctChange: pct };
      }
    }
  }

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const daysLeft = daysInMonth - dayOfMonth;

  let projectedEndBalance: number | null = null;
  if (params.currentBalance != null && params.currentMonthExpense != null && dayOfMonth > 0) {
    const avgDaily = params.currentMonthExpense / dayOfMonth;
    projectedEndBalance = params.currentBalance - avgDaily * daysLeft;
  }

  return {
    pctChangeExpense,
    topCategoryThisMonth,
    fastestRisingCategory,
    projectedEndBalance,
    daysLeftInMonth: daysLeft,
  };
}
