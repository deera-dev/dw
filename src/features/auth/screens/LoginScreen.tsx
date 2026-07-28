import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { usernameToEmail } from '../../../shared/lib/auth';
import { BRAND_ACCENT } from '../../../shared/theme/theme';
import { clearRememberedLogin, loadRememberedLogin, saveRememberedLogin } from '../../../shared/lib/rememberedLogin';

export default function LoginScreen() {
  const { signIn, error } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Auto-fill kalau sebelumnya pernah login dengan "Ingat saya" aktif —
  // supaya tidak perlu ngetik ulang nama & password tiap buka app.
  useEffect(() => {
    loadRememberedLogin().then((saved) => {
      if (saved) {
        setUsername(saved.username);
        setPassword(saved.password);
        setRememberMe(true);
      }
    });
  }, []);

  async function handleLogin() {
    if (!username.trim() || submitting) return;
    setSubmitting(true);
    try {
      await signIn(usernameToEmail(username), password);
      // signIn() tidak throw saat gagal (errornya disimpan di store) — cek
      // state store terbaru setelah await untuk tahu apakah login berhasil.
      const latestError = useAuthStore.getState().error;
      if (!latestError) {
        if (rememberMe) {
          await saveRememberedLogin({ username: username.trim(), password });
        } else {
          await clearRememberedLogin();
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
    <ScrollView
      className="bg-card"
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="font-title text-center text-3xl font-bold text-ink">DW</Text>
      <Text className="mb-8 text-center text-sm text-muted">Denny & Wulan</Text>

      <TextInput
        style={{ color: '#EDEDED' }}
        placeholderTextColor="#8A8D94"
        className="mb-3 rounded-xl border border-border p-4 text-base text-ink"
        placeholder="Nama"
        autoCapitalize="none"
        autoCorrect={false}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={{ color: '#EDEDED' }}
        placeholderTextColor="#8A8D94"
        className="mb-3 rounded-xl border border-border p-4 text-base text-ink"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        className="mb-3 flex-row items-center gap-2"
        onPress={() => setRememberMe((v) => !v)}
        hitSlop={8}
      >
        <Ionicons name={rememberMe ? 'checkbox' : 'square-outline'} size={18} color={rememberMe ? BRAND_ACCENT : '#8A8D94'} />
        <Text className="text-sm text-ink">Ingat saya</Text>
      </Pressable>

      {error && <Text className="mb-3 text-center text-danger">{error}</Text>}

      <Pressable
        className="mt-2 items-center rounded-xl p-4"
        style={{ backgroundColor: BRAND_ACCENT, opacity: submitting ? 0.85 : 1 }}
        onPress={handleLogin}
        disabled={submitting}
      >
        {submitting ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator color="#fff" />
            <Text className="text-base font-semibold text-white">Memproses…</Text>
          </View>
        ) : (
          <Text className="text-base font-semibold text-white">Masuk</Text>
        )}
      </Pressable>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}
