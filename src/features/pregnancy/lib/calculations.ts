// Semua perhitungan di sini murni rumus umum (bukan diagnosis medis), sesuai
// prinsip PRD "Analisa Data" — tidak ada AI/model eksternal.

const DAY_MS = 24 * 60 * 60 * 1000;

export type CycleInfo = {
  cycleDay: number;
  nextPeriodDate: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  ovulationDate: Date;
  daysUntilNextPeriod: number;
};

export function computeCycleInfo(lastPeriodDate: Date, cycleLengthDays: number): CycleInfo {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = new Date(lastPeriodDate);
  start.setHours(0, 0, 0, 0);

  const daysSinceStart = Math.floor((now.getTime() - start.getTime()) / DAY_MS);
  const cycleDay = ((daysSinceStart % cycleLengthDays) + cycleLengthDays) % cycleLengthDays;

  const cyclesElapsed = Math.floor(daysSinceStart / cycleLengthDays);
  const currentCycleStart = new Date(start.getTime() + cyclesElapsed * cycleLengthDays * DAY_MS);
  const nextPeriodDate = new Date(currentCycleStart.getTime() + cycleLengthDays * DAY_MS);

  // Ovulasi diperkirakan ~14 hari sebelum periode berikutnya (rumus standar umum).
  const ovulationDate = new Date(nextPeriodDate.getTime() - 14 * DAY_MS);
  const fertileWindowStart = new Date(ovulationDate.getTime() - 5 * DAY_MS);
  const fertileWindowEnd = new Date(ovulationDate.getTime() + 1 * DAY_MS);

  const daysUntilNextPeriod = Math.ceil((nextPeriodDate.getTime() - now.getTime()) / DAY_MS);

  return {
    cycleDay: cycleDay + 1,
    nextPeriodDate,
    fertileWindowStart,
    fertileWindowEnd,
    ovulationDate,
    daysUntilNextPeriod,
  };
}

export type PregnancyInfo = {
  weeksPregnant: number;
  daysIntoWeek: number;
  dueDate: Date;
  daysUntilDue: number;
  trimester: 1 | 2 | 3;
};

export function computePregnancyInfo(pregnancyStartDate: Date): PregnancyInfo {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = new Date(pregnancyStartDate);
  start.setHours(0, 0, 0, 0);

  const daysSinceStart = Math.max(0, Math.floor((now.getTime() - start.getTime()) / DAY_MS));
  const weeksPregnant = Math.floor(daysSinceStart / 7);
  const daysIntoWeek = daysSinceStart % 7;

  // Usia kehamilan dihitung dari HPHT, taksiran 40 minggu (280 hari) — rumus umum Naegele.
  const dueDate = new Date(start.getTime() + 280 * DAY_MS);
  const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / DAY_MS);

  const trimester: 1 | 2 | 3 = weeksPregnant < 13 ? 1 : weeksPregnant < 27 ? 2 : 3;

  return { weeksPregnant, daysIntoWeek, dueDate, daysUntilDue, trimester };
}

export function formatDateID(d: Date) {
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}
