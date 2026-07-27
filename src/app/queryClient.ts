import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // data dianggap segar 30 detik — cukup untuk 2 pengguna
      retry: 1,
    },
  },
});

// Kunci query terpusat, biar konsisten dipakai untuk invalidate antar fitur.
export const queryKeys = {
  balance: ['balance'] as const,
  currentMonthExpense: ['currentMonthExpense'] as const,
  monthlySummary: ['monthlySummary'] as const,
  transactions: ['transactions'] as const,
  allTransactions: ['allTransactions'] as const,
  accounts: ['accounts'] as const,
  todayMeals: ['todayMeals'] as const,
  mealPlansForDate: (date: string) => ['mealPlans', date] as const,
  mealPlansForRange: (from: string, to: string) => ['mealPlansRange', from, to] as const,
  recipes: ['recipes'] as const,
  todayReminders: ['todayReminders'] as const,
  upcomingReminders: (from?: string, to?: string) => ['upcomingReminders', from, to] as const,
  allReminders: ['reminders'] as const,
  profiles: ['profiles'] as const,
  weightHistory: (userId: string) => ['weightHistory', userId] as const,
  weightRecentAll: ['weightRecentAll'] as const,
  waterToday: ['waterToday'] as const,
  exerciseHistory: (userId: string) => ['exerciseHistory', userId] as const,
  exerciseThisWeek: ['exerciseThisWeek'] as const,
  firstExerciseLogDate: (userId: string) => ['firstExerciseLogDate', userId] as const,
  exerciseStreakDates: (userId: string) => ['exerciseStreakDates', userId] as const,
  pregnancyProfile: ['pregnancyProfile'] as const,
  pregnancyChecklist: ['pregnancyChecklist'] as const,
  pregnancyContacts: ['pregnancyContacts'] as const,
  bloodPressureRecentAll: ['bloodPressureRecentAll'] as const,
  bloodPressureHistory: (userId: string) => ['bloodPressureHistory', userId] as const,
  travelPlans: ['travelPlans'] as const,
  travelWishlist: ['travelWishlist'] as const,
  travelChecklist: (planId: string) => ['travelChecklist', planId] as const,
  smokingToday: ['smokingToday'] as const,
  smokingRecentAll: ['smokingRecentAll'] as const,
  smokingHistory: (userId: string) => ['smokingHistory', userId] as const,
  locations: ['locations'] as const,
  savedPlaces: ['savedPlaces'] as const,
  activityLog: ['activityLog'] as const,
};
