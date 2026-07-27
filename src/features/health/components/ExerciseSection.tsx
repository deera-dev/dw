import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { showAlert } from '../../../shared/lib/confirm';
import { useAuthStore } from '../../auth/store/authStore';
import { useProfilesList } from '../../../shared/hooks/useProfiles';
import {
  useAddExerciseLog,
  useDeleteExerciseLog,
  useExerciseStreakDates,
  useFirstExerciseLogDate,
  useRecentWeightLogsAllProfiles,
  useThisWeekExerciseAllProfiles,
} from '../hooks/useHealth';
import type { Tables } from '../../../shared/types/database';
import { calculateBmi, categorizeBmi, type BmiCategory } from '../../../shared/lib/bmi';
import { computeStreakDays } from '../../../shared/lib/streak';
import {
  estimateMinutesForLog,
  formatPrescription,
  getDayLabel,
  getProgramGoalLabel,
  getProgressionPhase,
  getTodayDayIndex,
  getTodayProgramItems,
  getWeeklyProgram,
  getWeeksSinceStart,
  getWeightGoalEstimate,
  PROGRESSION_PHASES,
  type ProgramGender,
  type ProgramItem,
} from '../../../shared/lib/exerciseProgram';

type Profile = Tables<'profiles'>;
type ExerciseLog = Tables<'exercise_logs'>;

function normalizeGender(gender: unknown): ProgramGender | null {
  return gender === 'pria' || gender === 'wanita' ? gender : null;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Checklist program hidup sehat harian (bukan cuma saran) — item tetap per
// hari dalam seminggu (Senin–Minggu) sesuai kategori BMI, dicentang saat
// dikerjakan (otomatis tercatat sebagai exercise_log, ikut dihitung ke total
// menit mingguan). Hanya pemilik akun sendiri yang bisa centang miliknya.
function ProfileExerciseProgress({
  profile,
  bmiCategory,
  gender,
  latestWeightKg,
  isSelf,
  todayLogsAllProfiles,
}: {
  profile: Profile;
  bmiCategory: BmiCategory | null;
  gender: ProgramGender | null;
  latestWeightKg: number | null;
  isSelf: boolean;
  todayLogsAllProfiles: ExerciseLog[];
}) {
  const { data: weekLogs = [] } = useThisWeekExerciseAllProfiles();
  const myLogs = weekLogs.filter((l) => l.created_by === profile.id);
  const totalMinutes = myLogs.reduce((s, l) => s + l.duration_minutes, 0);
  const target = profile.weekly_exercise_target_minutes;
  const pct = Math.min(100, Math.round((totalMinutes / target) * 100));
  const behind = new Date().getDay() >= 5 && totalMinutes < target; // Jum'at–Minggu tapi belum capai target minggu ini

  const addExercise = useAddExerciseLog(profile.id);
  const deleteExercise = useDeleteExerciseLog(profile.id);
  const [showWeek, setShowWeek] = useState(false);

  // Fase progresi dihitung dari tanggal log olahraga PALING AWAL milik orang
  // ini (bukan kolom baru di DB) — lihat exerciseProgram.ts. Kalau belum
  // pernah mencentang apa pun, weeksSinceStart null (dianggap Fase 1).
  const { data: firstLogDate } = useFirstExerciseLogDate(profile.id);
  const weeksSinceStart = getWeeksSinceStart(firstLogDate ?? null);
  const phase = getProgressionPhase(weeksSinceStart);

  // Lencana kecil konsistensi (bukan sistem poin/leaderboard) — cuma
  // pengakuan ringan kalau checklist olahraga tercatat beberapa hari
  // berturut-turut, buat bikin semangat lanjut.
  const { data: streakDates = [] } = useExerciseStreakDates(profile.id);
  const streakDays = computeStreakDays(streakDates);

  const todayItems = getTodayProgramItems(bmiCategory, gender, weeksSinceStart);
  const todayLabel = getDayLabel(getTodayDayIndex());
  const myTodayLogs = todayLogsAllProfiles.filter((l) => l.created_by === profile.id);
  const weightGoal =
    latestWeightKg != null && profile.height_cm ? getWeightGoalEstimate(latestWeightKg, profile.height_cm, bmiCategory) : null;

  function isDone(activity: string) {
    return myTodayLogs.some((l) => l.activity === activity);
  }

  async function toggleItem(item: ProgramItem) {
    if (!isSelf) return;
    const existing = myTodayLogs.find((l) => l.activity === item.activity);
    if (existing) {
      deleteExercise.mutate(existing.id);
    } else {
      try {
        await addExercise.mutateAsync({ activity: item.activity, durationMinutes: estimateMinutesForLog(item) });
      } catch (e: any) {
        showAlert('Gagal menyimpan', e.message ?? String(e));
      }
    }
  }

  return (
    <View className="mb-2.5 rounded-xl bg-surface p-3">
      <View className="flex-row flex-wrap items-center gap-1.5">
        <Text className="text-sm font-semibold capitalize text-ink">{profile.name}</Text>
        {streakDays >= 2 && (
          <Text className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-primary-dark">
            🔥 {streakDays} hari beruntun
          </Text>
        )}
        {behind && (
          <Text className="rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-semibold text-danger">
            Belum tercapai
          </Text>
        )}
      </View>

      <Text className="mt-1 text-[11px] font-semibold text-primary">
        Tujuan: {getProgramGoalLabel(bmiCategory)}
      </Text>

      {weightGoal && (
        <View className="mt-1.5 rounded-lg bg-primary-soft/60 p-2">
          <Text className="text-[10px] font-semibold text-muted">Target Program</Text>
          <Text className="mt-0.5 text-[11px] text-ink">{weightGoal.message}</Text>
        </View>
      )}

      {gender === null && (
        <Text className="mt-1.5 text-[10px] italic text-subtle">
          Isi jenis kelamin di Pengaturan biar program checklist ini lebih pas buat kamu.
        </Text>
      )}

      <View className="mt-1.5 rounded-lg bg-primary-soft/60 p-2">
        <Text className="text-[10px] font-semibold text-primary">
          Fase: {phase.phaseName} ({phase.weekRangeLabel})
        </Text>
        <Text className="mt-0.5 text-[10px] text-muted">
          {phase.phaseIndex === 0
            ? 'Mulai dari basic dulu — set/repetisi akan naik bertahap tiap ~2 minggu kalau konsisten dicentang.'
            : 'Set/repetisi sedikit lebih berat dari fase sebelumnya, mengikuti progres checklist kamu.'}{' '}
          Progresi ini asumsi konsisten — kalau masih terasa berat, tidak apa-apa ulang fase yang sama lebih lama
          dulu, dengarkan tubuh, tidak perlu dipaksakan.
        </Text>
      </View>

      <Text className="mt-1.5 text-[11px] font-semibold text-muted">Program {todayLabel}</Text>
      <View className="mt-1 gap-1.5">
        {todayItems.map((item) => {
          const done = isDone(item.activity);
          return (
            <Pressable
              key={item.activity}
              onPress={() => toggleItem(item)}
              disabled={!isSelf}
              className="flex-row items-start gap-2 rounded-lg bg-primary-soft p-2"
            >
              <Ionicons
                name={done ? 'checkbox' : 'square-outline'}
                size={16}
                color={done ? '#6FCB74' : '#9AA0A8'}
                style={{ marginTop: 1 }}
              />
              <View className="flex-1">
                <Text
                  className={`text-xs font-semibold ${done ? 'text-subtle line-through' : 'text-primary-dark'}`}
                >
                  {item.activity} · {formatPrescription(item)}
                </Text>
                <Text className="mt-0.5 text-[10px] text-muted">{item.note}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable onPress={() => setShowWeek((v) => !v)} className="mt-1.5">
        <Text className="text-[11px] font-semibold text-primary">
          {showWeek ? 'Sembunyikan program seminggu' : 'Lihat program seminggu & roadmap progresi'}
        </Text>
      </Pressable>

      {showWeek && (
        <View className="mt-1.5 gap-1.5 border-t border-border pt-2">
          {getWeeklyProgram(bmiCategory, gender, weeksSinceStart).map((items, dayIdx) => (
            <View key={dayIdx} className="flex-row justify-between">
              <Text
                className={`text-[11px] ${dayIdx === getTodayDayIndex() ? 'font-bold text-primary' : 'text-muted'}`}
              >
                {getDayLabel(dayIdx)}
              </Text>
              <Text className="flex-1 pl-2 text-right text-[11px] text-ink">
                {items.map((it) => `${it.activity} (${formatPrescription(it)})`).join(', ')}
              </Text>
            </View>
          ))}

          <View className="mt-1.5 border-t border-border pt-1.5">
            <Text className="text-[10px] font-semibold text-muted">
              Roadmap progresi (naik bertahap tiap ~2 minggu, lalu menetap di fase terakhir)
            </Text>
            {PROGRESSION_PHASES.map((p) => (
              <Text
                key={p.phaseIndex}
                className={`mt-0.5 text-[10px] ${
                  p.phaseIndex === phase.phaseIndex ? 'font-bold text-primary' : 'text-muted'
                }`}
              >
                {p.phaseName} ({p.weekRangeLabel}){p.phaseIndex === phase.phaseIndex ? ' — kamu di sini' : ''}
              </Text>
            ))}
          </View>
        </View>
      )}

      <Text className="mt-1.5 text-[10px] text-subtle">
        {totalMinutes}/{target} menit minggu ini
      </Text>
      <View className="mt-1 h-1 w-full overflow-hidden rounded-full bg-border">
        <View className="h-1 rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </View>
    </View>
  );
}

export default function ExerciseSection() {
  const session = useAuthStore((s) => s.session);
  const profiles = useProfilesList();
  const myProfile = profiles.find((p) => p.id === session?.user.id);
  const partnerProfile = profiles.find((p) => p.id !== session?.user.id);

  const { data: allWeightLogs = [] } = useRecentWeightLogsAllProfiles();
  const { data: weekLogsAll = [] } = useThisWeekExerciseAllProfiles();

  const today = new Date();
  const todayLogsAllProfiles = weekLogsAll.filter((l) => isSameDay(new Date(l.recorded_at), today));

  function latestWeightFor(profile?: Profile): number | null {
    if (!profile) return null;
    const latest = allWeightLogs.find((l) => l.created_by === profile.id);
    return latest ? latest.weight_kg : null;
  }

  function bmiCategoryFor(profile?: Profile): BmiCategory | null {
    if (!profile || !profile.height_cm) return null;
    const latestWeightKg = latestWeightFor(profile);
    if (latestWeightKg == null) return null;
    return categorizeBmi(calculateBmi(latestWeightKg, profile.height_cm));
  }

  return (
    <View className="mb-4 rounded-2xl bg-card p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="barbell-outline" size={16} color="#9AA0A8" />
          <Text className="text-base font-bold text-ink">Olahraga</Text>
        </View>
      </View>

      <Text className="mb-2.5 text-[10px] italic text-subtle">
        Program checklist harian di bawah semuanya bisa dilakukan di rumah, tanpa alat khusus atau harus keluar
        rumah. Centang kalau sudah dikerjakan — itu satu-satunya cara olahraga tercatat.
      </Text>

      {myProfile && (
        <ProfileExerciseProgress
          profile={myProfile}
          bmiCategory={bmiCategoryFor(myProfile)}
          gender={normalizeGender(myProfile.gender)}
          latestWeightKg={latestWeightFor(myProfile)}
          isSelf
          todayLogsAllProfiles={todayLogsAllProfiles}
        />
      )}
      {partnerProfile && (
        <ProfileExerciseProgress
          profile={partnerProfile}
          bmiCategory={bmiCategoryFor(partnerProfile)}
          gender={normalizeGender(partnerProfile.gender)}
          latestWeightKg={latestWeightFor(partnerProfile)}
          isSelf={false}
          todayLogsAllProfiles={todayLogsAllProfiles}
        />
      )}
    </View>
  );
}
