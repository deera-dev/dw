import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../auth/store/authStore';
import { useMealPlansForDate, useMealPlansForRange, useSaveMealPlan, useDeleteMealPlan } from '../hooks/useMealPlan';
import { useRecipes } from '../../recipes/hooks/useRecipes';
import RecipesScreen from '../../recipes/screens/RecipesScreen';
import { useThemeVars } from '../../../shared/theme/useThemeVars';
import ScreenHeader from '../../../shared/ui/ScreenHeader';
import EmptyState from '../../../shared/ui/EmptyState';
import SegmentedTabs from '../../../shared/ui/SegmentedTabs';
import { recommendRecipeForMeal } from '../lib/recommendation';
import { confirmAction, showAlert } from '../../../shared/lib/confirm';
import FadeIn from '../../../shared/ui/FadeIn';

const MEAL_TYPES: Array<'sarapan' | 'siang' | 'malam'> = ['sarapan', 'siang', 'malam'];

const MEAL_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  sarapan: 'sunny-outline',
  siang: 'partly-sunny-outline',
  malam: 'moon-outline',
};

type Tab = 'menu' | 'resep';

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(iso: string, delta: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + delta);
  return toISO(d);
}

function formatDateLabel(iso: string) {
  const todayISO = toISO(new Date());
  const tomorrowISO = addDays(todayISO, 1);
  const yesterdayISO = addDays(todayISO, -1);
  if (iso === todayISO) return 'Hari Ini';
  if (iso === tomorrowISO) return 'Besok';
  if (iso === yesterdayISO) return 'Kemarin';
  return new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function startOfWeek(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  const day = d.getDay(); // 0 = Minggu
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return toISO(d);
}

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

function WeeklyOverview({ date, onSelectDate }: { date: string; onSelectDate: (iso: string) => void }) {
  const weekStart = startOfWeek(date);
  const weekEnd = addDays(weekStart, 6);
  const { data: plans = [] } = useMealPlansForRange(weekStart, weekEnd);
  const todayISO = toISO(new Date());

  const filledByDate: Record<string, number> = {};
  plans.forEach((p: any) => {
    filledByDate[p.meal_date] = (filledByDate[p.meal_date] ?? 0) + 1;
  });

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <View className="mb-4 rounded-2xl bg-card p-3">
      <Text className="mb-2 text-xs font-semibold text-muted">Minggu Ini</Text>
      <View className="flex-row justify-between">
        {days.map((d, i) => {
          const filled = filledByDate[d] ?? 0;
          const isSelected = d === date;
          const isToday = d === todayISO;
          return (
            <Pressable key={d} onPress={() => onSelectDate(d)} className="items-center">
              <Text className={`mb-1 text-[10px] ${isToday ? 'font-bold text-primary' : 'text-muted'}`}>
                {DAY_LABELS[i]}
              </Text>
              <View
                className={`h-9 w-9 items-center justify-center rounded-full ${
                  isSelected ? 'bg-primary' : 'bg-surface'
                }`}
              >
                <Text className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-ink'}`}>
                  {new Date(`${d}T00:00:00`).getDate()}
                </Text>
              </View>
              <Text className="mt-1 text-[10px] text-subtle">{filled > 0 ? `${filled}/3` : '—'}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function DailyPlanner() {
  const [date, setDate] = useState(toISO(new Date()));
  const session = useAuthStore((s) => s.session);
  const { data: mealPlans = [] } = useMealPlansForDate(date);
  const { data: recipes = [] } = useRecipes();
  const { data: recentPlans = [] } = useMealPlansForRange(addDays(date, -7), addDays(date, -1));
  const saveMealPlan = useSaveMealPlan(date);
  const deleteMealPlan = useDeleteMealPlan(date);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [recipeIdDraft, setRecipeIdDraft] = useState<Record<string, string | null>>({});
  const [idMap, setIdMap] = useState<Record<string, string>>({});
  const [savingType, setSavingType] = useState<string | null>(null);
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const { themeVars } = useThemeVars();

  useEffect(() => {
    const map: Record<string, string> = {};
    const recipeMap: Record<string, string | null> = {};
    const ids: Record<string, string> = {};
    mealPlans.forEach((r: any) => {
      map[r.meal_type] = r.menu_description;
      recipeMap[r.meal_type] = r.recipe_id ?? null;
      ids[r.meal_type] = r.id;
    });
    setDraft(map);
    setRecipeIdDraft(recipeMap);
    setIdMap(ids);
  }, [mealPlans]);

  function handleDelete(mealType: string) {
    const id = idMap[mealType];
    if (!id) return;
    confirmAction({
      title: 'Hapus menu ini?',
      message: draft[mealType] ?? '',
      onConfirm: () => {
        deleteMealPlan.mutate(id);
        setDraft((prev) => ({ ...prev, [mealType]: '' }));
        setRecipeIdDraft((prev) => ({ ...prev, [mealType]: null }));
      },
    });
  }

  async function handleSave(mealType: string) {
    if (!session) return;
    const text = (draft[mealType] ?? '').trim();
    if (!text) return;
    setSavingType(mealType);
    try {
      await saveMealPlan.mutateAsync({
        meal_date: date,
        meal_type: mealType,
        menu_description: text,
        recipe_id: recipeIdDraft[mealType] ?? null,
        created_by: session.user.id,
      });
    } catch (e: any) {
      showAlert('Gagal menyimpan', e.message ?? String(e));
    } finally {
      setSavingType(null);
    }
  }

  function pickRecipe(mealType: string, recipe: { id: string; name: string }) {
    setDraft((prev) => ({ ...prev, [mealType]: recipe.name }));
    setRecipeIdDraft((prev) => ({ ...prev, [mealType]: recipe.id }));
    setPickerFor(null);
  }

  function handleRecommend(mealType: string) {
    if (recipes.length === 0) {
      showAlert('Belum ada resep', 'Tambahkan resep dulu di tab Resep supaya bisa direkomendasikan.');
      return;
    }
    const suggestion = recommendRecipeForMeal(recipes, recentPlans);
    if (!suggestion) return;
    pickRecipe(mealType, suggestion);
  }

  const savedMap: Record<string, string> = {};
  mealPlans.forEach((r: any) => {
    savedMap[r.meal_type] = r.menu_description;
  });

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
      <WeeklyOverview date={date} onSelectDate={setDate} />

      <View className="mb-4 flex-row items-center justify-between rounded-2xl bg-card p-3">
        <Pressable
          className="h-9 w-9 items-center justify-center rounded-full bg-surface"
          onPress={() => setDate((d) => addDays(d, -1))}
        >
          <Ionicons name="chevron-back" size={18} color="#EDEDED" />
        </Pressable>
        <Pressable onPress={() => setDate(toISO(new Date()))}>
          <Text className="font-title text-base font-bold capitalize text-ink">{formatDateLabel(date)}</Text>
        </Pressable>
        <Pressable
          className="h-9 w-9 items-center justify-center rounded-full bg-surface"
          onPress={() => setDate((d) => addDays(d, 1))}
        >
          <Ionicons name="chevron-forward" size={18} color="#EDEDED" />
        </Pressable>
      </View>

      {MEAL_TYPES.map((mealType) => (
        <View key={mealType} className="mb-3 rounded-2xl bg-card p-4">
          <View className="mb-2 flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <Ionicons name={MEAL_ICONS[mealType]} size={15} color="#9AA0A8" />
              <Text className="font-semibold capitalize text-ink">{mealType}</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Pressable onPress={() => handleRecommend(mealType)} className="flex-row items-center gap-1">
                <Ionicons name="sparkles-outline" size={12} color="#9AA0A8" />
                <Text className="text-xs font-semibold text-muted">Rekomendasi</Text>
              </Pressable>
              <Pressable onPress={() => setPickerFor(mealType)}>
                <Text className="text-xs font-semibold text-primary">Pilih dari resep</Text>
              </Pressable>
            </View>
          </View>
          <TextInput
        style={{ color: '#EDEDED' }}
            className="mb-2.5 rounded-xl border border-border p-3 text-ink"
            placeholder={`Menu ${mealType}...`}
            value={draft[mealType] ?? ''}
            onChangeText={(t) => {
              setDraft((prev) => ({ ...prev, [mealType]: t }));
              setRecipeIdDraft((prev) => ({ ...prev, [mealType]: null }));
            }}
          />
          <View className="flex-row gap-2">
            <Pressable
              className="flex-1 items-center rounded-xl bg-primary p-2.5"
              onPress={() => handleSave(mealType)}
              disabled={savingType === mealType || draft[mealType] === savedMap[mealType]}
            >
              <Text className="font-semibold text-white">
                {savingType === mealType ? 'Menyimpan...' : idMap[mealType] ? 'Update' : 'Simpan'}
              </Text>
            </Pressable>
            {idMap[mealType] && (
              <Pressable
                className="items-center justify-center rounded-xl border border-danger px-4"
                onPress={() => handleDelete(mealType)}
              >
                <Ionicons name="trash-outline" size={16} color="#E5766D" />
              </Pressable>
            )}
          </View>
        </View>
      ))}

      <Modal visible={pickerFor !== null} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View style={themeVars} className="max-h-[70%] rounded-t-3xl bg-card p-5">
            <Text className="mb-3 font-title text-lg font-bold text-ink">Pilih Resep</Text>
            <FlatList
              data={recipes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  className="flex-row items-center justify-between border-b border-border py-3"
                  onPress={() => pickerFor && pickRecipe(pickerFor, item)}
                >
                  <Text className="text-[15px] text-ink">{item.name}</Text>
                  {item.is_favorite && <Text className="text-primary">★</Text>}
                </Pressable>
              )}
              ListEmptyComponent={
                <EmptyState icon="restaurant-outline" text="Belum ada resep. Tambahkan dulu di tab Resep." />
              }
            />
            <Pressable className="mt-3 items-center p-3" onPress={() => setPickerFor(null)}>
              <Text className="font-semibold text-ink">Tutup</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

export default function MealPlanScreen() {
  const [tab, setTab] = useState<Tab>('menu');

  return (
    <View className="flex-1 bg-surface">
      <View className="px-4 pt-4">
        <ScreenHeader icon="restaurant" title="Rencana Makan" subtitle="Menu harian & resep favorit" />
      </View>

      <SegmentedTabs
        value={tab}
        onChange={(v) => setTab(v as Tab)}
        options={[
          { value: 'menu', label: 'Menu Harian' },
          { value: 'resep', label: 'Resep' },
        ]}
      />

      <FadeIn key={tab}>{tab === 'menu' ? <DailyPlanner /> : <RecipesScreen />}</FadeIn>
    </View>
  );
}
