import React from 'react';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../features/auth/store/authStore';
import LoginScreen from '../features/auth/screens/LoginScreen';
import DashboardScreen from '../features/dashboard/screens/DashboardScreen';
import FinanceScreen from '../features/finance/screens/FinanceScreen';
import MealPlanScreen from '../features/meal-plan/screens/MealPlanScreen';
import ReminderCalendarScreen from '../features/reminders/screens/ReminderCalendarScreen';
import TravelScreen from '../features/travel/screens/TravelScreen';
import SehatTab from './tabs/SehatTab';
import MapScreen from '../features/map/screens/MapScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import { darkPalette, getThemeKey, getThemeVars, themeColors } from '../shared/theme/theme';
import { useRealtimeSync } from '../shared/hooks/useRealtimeSync';

// Tema dark react-navigation dasar, disesuaikan warnanya biar konsisten sama
// palet dark kita sendiri (bukan warna dark default react-navigation).
const navigationDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: darkPalette.surface,
    card: darkPalette.card,
    border: darkPalette.border,
    text: darkPalette.ink,
  },
};

const Tab = createBottomTabNavigator();

// Kesehatan+Kehamilan+Olahraga digabung jadi satu tab "Sehat" (Olahraga
// sempat dipisah, tapi digabung balik atas permintaan user). Pengingat &
// Tanggal Penting ada di tab "Kalender" — Pengaturan cuma berisi Profil &
// preferensi.
const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Dasbor: 'home',
  Keuangan: 'wallet',
  Makan: 'restaurant',
  Sehat: 'heart',
  Liburan: 'airplane',
  Kalender: 'calendar',
  Peta: 'map',
  Pengaturan: 'settings',
};

function AppTabs({ tintColor }: { tintColor: string }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: tintColor,
        tabBarInactiveTintColor: darkPalette.subtle,
        tabBarStyle: { backgroundColor: darkPalette.card, borderTopColor: darkPalette.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        // Transisi halus pindah tab (fade + sedikit geser), bawaan
        // react-navigation v7 — tidak butuh reanimated/library tambahan.
        animation: 'shift',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name] ?? 'ellipse'} size={size ? size - 2 : 20} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Dasbor" component={DashboardScreen} />
      <Tab.Screen name="Keuangan" component={FinanceScreen} />
      <Tab.Screen name="Makan" component={MealPlanScreen} />
      <Tab.Screen name="Sehat" component={SehatTab} />
      <Tab.Screen name="Liburan" component={TravelScreen} />
      <Tab.Screen name="Kalender" component={ReminderCalendarScreen} />
      <Tab.Screen name="Peta" component={MapScreen} />
      <Tab.Screen name="Pengaturan" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const session = useAuthStore((s) => s.session);
  const loading = useAuthStore((s) => s.loading);

  const themeKey = getThemeKey(session?.user.email);
  const themeVars = getThemeVars(themeKey);
  const tintColor = themeColors[themeKey].primary;

  useRealtimeSync(Boolean(session));

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  // themeVars memasang CSS variable (--color-primary, dst) di root — semua
  // class seperti bg-primary/text-primary di layar anak otomatis ikut warna ini.
  return (
    <View style={[{ flex: 1 }, themeVars]}>
      <NavigationContainer theme={navigationDarkTheme}>
        {session ? <AppTabs tintColor={tintColor} /> : <LoginScreen />}
      </NavigationContainer>
    </View>
  );
}
