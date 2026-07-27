import React from 'react';
import { FlatList, Text, View } from 'react-native';
import ScreenHeader from '../../../shared/ui/ScreenHeader';
import EmptyState from '../../../shared/ui/EmptyState';
import Card from '../../../shared/ui/Card';
import { useProfilesMap } from '../../../shared/hooks/useProfiles';
import { useActivityLog } from '../hooks/useActivityLog';
import { describeActivity } from '../labels';
import type { Tables } from '../../../shared/types/database';

type ActivityRow = Tables<'activity_log'>;

// "Baru saja" / "X menit lalu" dsb — sama seperti pola di fitur Peta, tapi di
// sini presisinya sampai hari/bulan karena riwayat bisa lebih lama.
function formatWhen(iso: string) {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ActivityRowItem({ row, actorName }: { row: ActivityRow; actorName: string }) {
  const { icon, text } = describeActivity(row, actorName);
  return (
    <Card className="mb-2 flex-row items-start gap-2">
      <Text className="text-lg">{icon}</Text>
      <View className="flex-1">
        <Text className="text-sm text-ink">{text}</Text>
        <Text className="mt-0.5 text-[10px] text-subtle">{formatWhen(row.created_at)}</Text>
      </View>
    </Card>
  );
}

// Riwayat Aktivitas: baca-saja, diisi otomatis lewat trigger DB di ~16 tabel
// (lihat migrasi add_activity_log) — supaya Denny & Wulan tau siapa nambah/
// ubah/hapus apa, tanpa perlu buka tiap fitur satu-satu.
export default function ActivityLogScreen({ showHeader = true }: { showHeader?: boolean } = {}) {
  const { data: entries = [], isLoading } = useActivityLog();
  const profilesMap = useProfilesMap();

  return (
    <View className="flex-1 bg-surface">
      {showHeader && (
        <View className="px-4 pt-4">
          <ScreenHeader icon="time" title="Riwayat Aktivitas" subtitle="Siapa nambah, ubah, atau hapus apa" />
        </View>
      )}

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        renderItem={({ item }) => (
          <ActivityRowItem row={item} actorName={item.actor ? profilesMap[item.actor] ?? 'Seseorang' : 'Seseorang'} />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="time-outline"
              text="Belum ada riwayat — setiap tambah, ubah, atau hapus data di app ini bakal muncul di sini."
            />
          ) : null
        }
      />
    </View>
  );
}
