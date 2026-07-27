import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, Linking } from 'react-native';
import Mapbox, { MapView, Camera, PointAnnotation, MarkerView, Callout } from '@rnmapbox/maps';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../auth/store/authStore';
import { useProfilesMap, useProfilesList } from '../../../shared/hooks/useProfiles';
import { useThemeVars } from '../../../shared/theme/useThemeVars';
import { confirmAction, showAlert } from '../../../shared/lib/confirm';
import { distanceMeters, formatDurationShort } from '../../../shared/lib/geo';
import { describeStay, isDriving, type StayLabel } from '../stayStatus';
import ScreenHeader from '../../../shared/ui/ScreenHeader';
import Card from '../../../shared/ui/Card';
import EmptyState from '../../../shared/ui/EmptyState';
import SegmentedTabs from '../../../shared/ui/SegmentedTabs';
import ToggleSwitch from '../../../shared/ui/ToggleSwitch';
import FadeIn from '../../../shared/ui/FadeIn';
import Fab from '../../../shared/ui/Fab';
import {
  useAllLocations,
  useDeleteSavedPlace,
  useSavedPlaces,
  useSetLocationSharing,
} from '../hooks/useMap';
import { useLocationWatcher } from '../hooks/useLocationWatcher';
import { PLACE_CATEGORIES, categoryIcon, categoryLabel, type PlaceCategory } from '../constants';
import AddPlaceModal from '../components/AddPlaceModal';
import type { Tables } from '../../../shared/types/database';

type SavedPlace = Tables<'saved_places'>;
type LocationRow = Tables<'locations'>;
type ViewMode = 'peta' | 'daftar';
type CategoryFilter = 'semua' | PlaceCategory;

const JAKARTA_FALLBACK = { latitude: -6.2088, longitude: 106.8456 };
// Di bawah radius ini dianggap "lagi bareng" — cukup longgar (bisa beda
// lantai/sisi jalan tapi tetap dianggap satu tempat), bukan presisi GPS ketat.
const TOGETHER_RADIUS_M = 150;

function openInMaps(latitude: number, longitude: number, label: string) {
  const query = encodeURIComponent(label);
  const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}(${query})`;
  Linking.openURL(url).catch(() => showAlert('Gagal membuka peta', 'Tidak bisa membuka aplikasi peta.'));
}

function formatLastSeen(updatedAt: string) {
  const diffMin = Math.round((Date.now() - new Date(updatedAt).getTime()) / 60000);
  if (diffMin < 1) return 'baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  return new Date(updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

// Marker bulat gede + label nama di bawahnya, dipakai buat posisi Denny &
// Wulan sendiri (bukan pin tempat) — supaya langsung kelihatan jelas siapa di
// mana tanpa harus tap dulu (beda dari pin tempat yang cukup ikon kecil).
function PersonMarker({
  coordinate,
  color,
  label,
  driving,
  stay,
  onPress,
}: {
  coordinate: [number, number];
  color: string;
  label: string;
  driving?: boolean;
  stay?: StayLabel;
  onPress?: () => void;
}) {
  return (
    <MarkerView coordinate={coordinate} anchor={{ x: 0.5, y: 0.5 }}>
      <Pressable onPress={onPress} style={{ alignItems: 'center' }}>
        <View
          style={{
            height: 34,
            width: 34,
            borderRadius: 17,
            backgroundColor: driving ? '#2C2F36' : color,
            borderWidth: 3,
            borderColor: driving ? color : '#fff',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
            elevation: 4,
          }}
        >
          {driving && <Ionicons name="car-sport" size={16} color={color} />}
        </View>
        <View
          style={{
            marginTop: 2,
            borderRadius: 8,
            backgroundColor: 'rgba(15,17,21,0.85)',
            paddingHorizontal: 6,
            paddingVertical: 2,
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: '700', color: '#EDEDED' }}>
            {label}
            {driving ? ' 🚗' : stay?.icon && stay.icon !== '📍' ? ` ${stay.icon}` : ''}
          </Text>
        </View>
      </Pressable>
    </MarkerView>
  );
}

// Kartu status utama — ini yang menjawab "lagi bareng nggak", "udah di sini
// berapa lama", "udah bareng berapa lama". Sengaja dibuat "berisik" dengan
// info kecil-kecil (jarak persis, jam update terakhir, dst.) sesuai
// permintaan: "informasi penting dan gapenting masukin aja".
function TogetherStatusCard({
  myLocation,
  partnerLocation,
  myName,
  partnerName,
  nowTick,
  savedPlaces,
}: {
  myLocation: LocationRow | undefined;
  partnerLocation: LocationRow | undefined;
  myName: string;
  partnerName: string;
  nowTick: number;
  savedPlaces: SavedPlace[];
}) {
  const distance =
    myLocation?.is_sharing && partnerLocation
      ? distanceMeters(myLocation.latitude, myLocation.longitude, partnerLocation.latitude, partnerLocation.longitude)
      : null;
  const isTogether = distance !== null && distance < TOGETHER_RADIUS_M;

  if (!myLocation?.is_sharing && !partnerLocation) {
    return (
      <Card className="mx-4 mb-2">
        <View className="flex-row items-center gap-2">
          <Ionicons name="location-outline" size={16} color="#8A8D94" />
          <Text className="flex-1 text-xs text-subtle">
            Belum ada yang membagikan lokasi — nyalakan toggle di atas biar pasangan bisa lihat posisimu.
          </Text>
        </View>
      </Card>
    );
  }

  if (isTogether && myLocation && partnerLocation) {
    const togetherSinceMs = Math.max(
      new Date(myLocation.arrived_at).getTime(),
      new Date(partnerLocation.arrived_at).getTime()
    );
    return (
      <Card className="mx-4 mb-2 border-l-4 border-primary">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg">💑</Text>
          <Text className="flex-1 text-sm font-bold text-ink">Kalian lagi bareng!</Text>
        </View>
        <Text className="mt-1 text-xs text-muted">
          Sudah bareng sekitar {formatDurationShort(nowTick - togetherSinceMs)} di sekitar sini.
        </Text>
        <Text className="mt-0.5 text-[10px] text-subtle">
          Jarak antara kalian ~{formatDistance(distance)} · update terakhir {formatLastSeen(myLocation.updated_at)} &{' '}
          {formatLastSeen(partnerLocation.updated_at)}
        </Text>
        {(isDriving(myLocation) || isDriving(partnerLocation)) && (
          <Text className="mt-0.5 text-[10px] text-subtle">
            🚗 {[isDriving(myLocation) && myName, isDriving(partnerLocation) && partnerName].filter(Boolean).join(' & ')}{' '}
            kelihatan lagi di jalan.
          </Text>
        )}
      </Card>
    );
  }

  return (
    <Card className="mx-4 mb-2">
      {[
        { name: myName, loc: myLocation },
        { name: partnerName, loc: partnerLocation },
      ].map(({ name, loc }) => {
        const driving = isDriving(loc);
        const stay = loc?.is_sharing ? describeStay(loc, savedPlaces, nowTick) : null;
        return (
          <View key={name} className="flex-row items-center justify-between py-1">
            <Text className="text-sm text-ink">{name}</Text>
            {loc?.is_sharing ? (
              <Text className="text-right text-[10px] text-subtle">
                {driving
                  ? '🚗 Sedang di jalan'
                  : `${stay?.icon ?? '📍'} ${stay?.text ?? 'Di sini'} sejak ${formatDurationShort(
                      nowTick - new Date(loc.arrived_at).getTime()
                    )}`}{' '}
                · update {formatLastSeen(loc.updated_at)}
              </Text>
            ) : (
              <Text className="text-[10px] text-subtle">
                {loc ? `Sharing nonaktif · terakhir ${formatLastSeen(loc.updated_at)}` : 'Belum pernah share lokasi'}
              </Text>
            )}
          </View>
        );
      })}
      {distance !== null && (
        <Text className="mt-1.5 text-[10px] text-subtle">Terpisah sekitar {formatDistance(distance)} satu sama lain.</Text>
      )}
    </Card>
  );
}

function PlaceListItem({ place, onDelete }: { place: SavedPlace; onDelete: (id: string, name: string) => void }) {
  const profiles = useProfilesMap();
  return (
    <Card className="mb-3">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <View className="flex-row items-center gap-1.5">
            <Ionicons name={categoryIcon(place.category)} size={14} color="#8A8D94" />
            <Text className="text-xs font-semibold text-muted">{categoryLabel(place.category)}</Text>
          </View>
          <Text className="mt-1 text-base font-bold text-ink">{place.name}</Text>
          {place.notes && <Text className="mt-0.5 text-xs text-muted">{place.notes}</Text>}
          <Text className="mt-1 text-[10px] text-subtle">disimpan {profiles[place.created_by] ?? '—'}</Text>
        </View>
        <Pressable hitSlop={10} className="p-1" onPress={() => onDelete(place.id, place.name)}>
          <Ionicons name="trash-outline" size={16} color="#E5766D" />
        </Pressable>
      </View>
      <Pressable
        className="mt-3 flex-row items-center justify-center gap-1.5 rounded-xl border border-border p-2.5"
        onPress={() => openInMaps(place.latitude, place.longitude, place.name)}
      >
        <Ionicons name="navigate-outline" size={14} color="#9AA0A8" />
        <Text className="text-xs font-semibold text-ink">Buka di Peta</Text>
      </Pressable>
    </Card>
  );
}

export default function MapScreen() {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user.id ?? '';
  const profiles = useProfilesList();
  const profilesMap = useProfilesMap();
  const { primary } = useThemeVars();

  const { data: locations = [] } = useAllLocations();
  const { data: places = [] } = useSavedPlaces();
  const setSharing = useSetLocationSharing();
  const deletePlace = useDeleteSavedPlace();

  const [viewMode, setViewMode] = useState<ViewMode>('peta');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('semua');
  const [addModalVisible, setAddModalVisible] = useState(false);

  // Cuma buat bikin teks "sudah X lama" ikut jalan tanpa perlu ada
  // interaksi/refetch baru — dipaksa re-render tiap 30 detik.
  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNowTick(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const myLocation = locations.find((l) => l.profile_id === userId);
  // Partner ditampilkan di kartu status meski sharing-nya lagi off (biar
  // kelihatan "terakhir terlihat"), tapi marker peta cuma muncul kalau aktif.
  const partnerLocationRow = locations.find((l) => l.profile_id !== userId);
  const partnerLocation = partnerLocationRow?.is_sharing ? partnerLocationRow : undefined;
  const isSharing = myLocation?.is_sharing ?? false;

  // Kirim update posisi selagi toggle sharing aktif — dipisah dari mutation
  // toggle-nya sendiri supaya watcher otomatis start/stop ikut nilai terbaru.
  useLocationWatcher(userId, isSharing);

  const filteredPlaces = useMemo(
    () => (categoryFilter === 'semua' ? places : places.filter((p) => p.category === categoryFilter)),
    [places, categoryFilter]
  );

  async function handleToggleSharing(value: boolean) {
    if (!userId) return;
    try {
      await setSharing.mutateAsync({ profileId: userId, isSharing: value });
    } catch (e: any) {
      showAlert('Gagal mengubah pengaturan lokasi', e.message ?? String(e));
    }
  }

  function handleDeletePlace(id: string, name: string) {
    confirmAction({
      title: 'Hapus tempat ini?',
      message: name,
      onConfirm: () => deletePlace.mutate(id),
    });
  }

  // Mapbox pakai urutan [longitude, latitude] (GeoJSON), kebalikan dari
  // react-native-maps yang pakai {latitude, longitude} — semua koordinat di
  // bawah sengaja dikonversi ke format ini.
  const centerCoordinate: [number, number] = [
    myLocation?.longitude || partnerLocation?.longitude || JAKARTA_FALLBACK.longitude,
    myLocation?.latitude || partnerLocation?.latitude || JAKARTA_FALLBACK.latitude,
  ];

  return (
    <View className="flex-1 bg-surface">
      <View className="px-4 pt-4">
        <ScreenHeader icon="map" title="Peta Berdua" subtitle="Lokasi realtime & tempat favorit" />
      </View>

      <Card className="mx-4 mb-2 flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-sm font-semibold text-ink">Bagikan lokasi saya</Text>
          <Text className="mt-0.5 text-xs text-muted">
            {isSharing
              ? 'Aktif — pasangan bisa lihat posisimu sekarang.'
              : 'Nonaktif — posisimu tidak dibagikan ke pasangan.'}
          </Text>
        </View>
        <ToggleSwitch value={isSharing} onValueChange={handleToggleSharing} />
      </Card>

      <TogetherStatusCard
        myLocation={myLocation}
        partnerLocation={partnerLocationRow}
        myName={profilesMap[userId] ?? 'Saya'}
        partnerName={partnerLocationRow ? profilesMap[partnerLocationRow.profile_id] ?? 'Pasangan' : 'Pasangan'}
        nowTick={nowTick}
        savedPlaces={places}
      />

      <SegmentedTabs
        value={viewMode}
        onChange={(v) => setViewMode(v as ViewMode)}
        options={[
          { value: 'peta', label: 'Peta' },
          { value: 'daftar', label: 'Daftar' },
        ]}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-2 flex-grow-0"
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        <Pressable
          className={`flex-row items-center gap-1.5 rounded-full border px-3 py-2 ${
            categoryFilter === 'semua' ? 'border-primary bg-primary' : 'border-border'
          }`}
          onPress={() => setCategoryFilter('semua')}
        >
          <Text className={`text-xs font-semibold ${categoryFilter === 'semua' ? 'text-white' : 'text-ink'}`}>
            Semua
          </Text>
        </Pressable>
        {PLACE_CATEGORIES.map((c) => (
          <Pressable
            key={c.value}
            className={`flex-row items-center gap-1.5 rounded-full border px-3 py-2 ${
              categoryFilter === c.value ? 'border-primary bg-primary' : 'border-border'
            }`}
            onPress={() => setCategoryFilter(c.value)}
          >
            <Ionicons name={c.icon} size={13} color={categoryFilter === c.value ? '#fff' : '#8A8D94'} />
            <Text className={`text-xs font-semibold ${categoryFilter === c.value ? 'text-white' : 'text-ink'}`}>
              {c.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <FadeIn key={viewMode} style={{ flex: 1, marginTop: 12 }}>
        {viewMode === 'peta' ? (
          <View className="flex-1 px-4 pb-4">
            <View className="flex-1 overflow-hidden rounded-2xl">
              <MapView style={{ flex: 1 }} styleURL={Mapbox.StyleURL.Dark}>
                <Camera centerCoordinate={centerCoordinate} zoomLevel={12} animationMode="none" />

                {myLocation && myLocation.is_sharing && (
                  <PersonMarker
                    coordinate={[myLocation.longitude, myLocation.latitude]}
                    color={primary}
                    label={`${profilesMap[userId] ?? 'Saya'} (kamu)`}
                    driving={isDriving(myLocation)}
                    stay={describeStay(myLocation, places, nowTick)}
                    onPress={() =>
                      showAlert(
                        profilesMap[userId] ?? 'Saya',
                        isDriving(myLocation)
                          ? `🚗 Sedang di jalan\nUpdate terakhir: ${formatLastSeen(myLocation.updated_at)}`
                          : `${describeStay(myLocation, places, nowTick).icon} ${
                              describeStay(myLocation, places, nowTick).text
                            } sejak ${formatDurationShort(
                              nowTick - new Date(myLocation.arrived_at).getTime()
                            )}\nUpdate terakhir: ${formatLastSeen(myLocation.updated_at)}`
                      )
                    }
                  />
                )}

                {partnerLocation && (
                  <PersonMarker
                    coordinate={[partnerLocation.longitude, partnerLocation.latitude]}
                    color="#E5766D"
                    label={profilesMap[partnerLocation.profile_id] ?? 'Pasangan'}
                    driving={isDriving(partnerLocation)}
                    stay={describeStay(partnerLocation, places, nowTick)}
                    onPress={() =>
                      showAlert(
                        profilesMap[partnerLocation.profile_id] ?? 'Pasangan',
                        isDriving(partnerLocation)
                          ? `🚗 Sedang di jalan\nUpdate terakhir: ${formatLastSeen(partnerLocation.updated_at)}`
                          : `${describeStay(partnerLocation, places, nowTick).icon} ${
                              describeStay(partnerLocation, places, nowTick).text
                            } sejak ${formatDurationShort(
                              nowTick - new Date(partnerLocation.arrived_at).getTime()
                            )}\nUpdate terakhir: ${formatLastSeen(partnerLocation.updated_at)}`
                      )
                    }
                  />
                )}

                {filteredPlaces.map((place) => (
                  <PointAnnotation
                    key={place.id}
                    id={place.id}
                    coordinate={[place.longitude, place.latitude]}
                    onSelected={() => openInMaps(place.latitude, place.longitude, place.name)}
                  >
                    <View
                      style={{
                        height: 24,
                        width: 24,
                        borderRadius: 12,
                        backgroundColor: '#1B1E24',
                        borderWidth: 2,
                        borderColor: primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name={categoryIcon(place.category)} size={12} color={primary} />
                    </View>
                    <Callout title={place.name} />
                  </PointAnnotation>
                ))}
              </MapView>
            </View>
            <Text className="mt-2 text-center text-[10px] text-subtle">
              Ketuk pin tempat untuk membuka arah di Google Maps.
            </Text>
          </View>
        ) : (
          <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 16 }}>
            {profiles.length > 0 && (
              <Card className="mb-3">
                <Text className="mb-2 text-xs font-semibold text-muted">Posisi Terkini</Text>
                {locations.length === 0 && (
                  <Text className="text-xs italic text-subtle">Belum ada yang membagikan lokasi.</Text>
                )}
                {locations.map((loc) => (
                  <View key={loc.profile_id} className="flex-row items-center justify-between py-1.5">
                    <Text className="text-sm text-ink">{profilesMap[loc.profile_id] ?? '—'}</Text>
                    <Text className="text-xs text-subtle">
                      {loc.is_sharing ? `Aktif · ${formatLastSeen(loc.updated_at)}` : 'Sharing nonaktif'}
                    </Text>
                  </View>
                ))}
              </Card>
            )}

            {filteredPlaces.length === 0 ? (
              <Card className="mb-3">
                <EmptyState icon="location-outline" text="Belum ada tempat tersimpan di kategori ini." />
              </Card>
            ) : (
              filteredPlaces.map((place) => (
                <PlaceListItem key={place.id} place={place} onDelete={handleDeletePlace} />
              ))
            )}
          </ScrollView>
        )}
      </FadeIn>

      <Fab onPress={() => setAddModalVisible(true)} />

      <AddPlaceModal visible={addModalVisible} onClose={() => setAddModalVisible(false)} userId={userId} />
    </View>
  );
}
