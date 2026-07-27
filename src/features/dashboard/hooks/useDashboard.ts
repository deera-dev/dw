import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../app/queryClient';
import {
  fetchCurrentBalance,
  fetchCurrentMonthExpense,
  fetchTodayMeals,
  fetchTodayReminders,
} from '../api';

export function useCurrentBalance() {
  return useQuery({ queryKey: queryKeys.balance, queryFn: fetchCurrentBalance });
}

export function useCurrentMonthExpense() {
  return useQuery({ queryKey: queryKeys.currentMonthExpense, queryFn: fetchCurrentMonthExpense });
}

export function useTodayMeals() {
  return useQuery({ queryKey: queryKeys.todayMeals, queryFn: fetchTodayMeals });
}

export function useTodayReminders() {
  return useQuery({ queryKey: queryKeys.todayReminders, queryFn: fetchTodayReminders });
}
