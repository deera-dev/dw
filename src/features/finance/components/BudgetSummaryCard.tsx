import React from 'react';
import { View, Text } from 'react-native';
import { useFinanceOverview } from '../hooks/useFinance';

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);
}

// Dua angka yang sengaja dipisah biar tidak tertukar maknanya:
// - Sisa gaji bulan ini = arus kas bulan berjalan (uang masuk - keluar).
// - Total kekayaan = saldo semua akun (bank/tabungan/saham/cash) digabung.
export default function BudgetSummaryCard() {
  const { isLoading, sisaGajiBulanIni, totalWealth } = useFinanceOverview();

  return (
    <View className="mb-3 rounded-2xl bg-card p-4">
      {isLoading ? (
        <Text className="text-center text-subtle">Memuat...</Text>
      ) : (
        <>
          <View className="flex-row justify-between">
            <View className="flex-1">
              <Text className="text-xs text-muted">Sisa gaji bulan ini</Text>
              <Text
                className={`mt-1 text-lg font-bold ${sisaGajiBulanIni >= 0 ? 'text-success' : 'text-danger'}`}
              >
                {formatRupiah(sisaGajiBulanIni)}
              </Text>
            </View>
            <View className="flex-1 items-end">
              <Text className="text-xs text-muted">Total kekayaan</Text>
              <Text className="mt-1 text-lg font-bold text-ink">{formatRupiah(totalWealth)}</Text>
            </View>
          </View>
          <Text className="mt-3 text-[11px] text-subtle">
            Sisa gaji = uang masuk dikurangi keluar bulan ini. Total kekayaan = semua saldo akun digabung.
          </Text>
        </>
      )}
    </View>
  );
}
