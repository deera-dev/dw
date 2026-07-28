import React, { useState } from 'react';
import { Platform, Pressable, Text, View, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

type DatePickerFieldProps = {
  value: string; // format 'YYYY-MM-DD', string kosong berarti belum diisi
  onChange: (isoDate: string) => void;
  placeholder?: string;
  className?: string;
};

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateID(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Komponen date picker terpusat, dipakai di semua form yang butuh input
// tanggal (profil, kehamilan, jalan-jalan, tanggal penting) — supaya user
// pilih dari kalender native, bukan ketik manual "YYYY-MM-DD".
// @react-native-community/datetimepicker tidak punya implementasi web, jadi
// khusus di web kita fallback ke TextInput manual (preview browser saja;
// target utama aplikasi ini tetap Expo Go/dev build di HP).
export default function DatePickerField({
  value,
  onChange,
  placeholder = 'Pilih tanggal',
  className = '',
}: DatePickerFieldProps) {
  const [show, setShow] = useState(false);
  const dateValue = value ? new Date(`${value}T00:00:00`) : new Date();

  if (Platform.OS === 'web') {
    return (
      <TextInput
        style={{ color: '#EDEDED' }}
        placeholderTextColor="#8A8D94"
        className={`rounded-xl border border-border p-3 text-sm ${className}`}
        placeholder={`${placeholder} (YYYY-MM-DD)`}
        value={value}
        onChangeText={onChange}
      />
    );
  }

  return (
    <View>
      <Pressable
        className={`flex-row items-center justify-between rounded-xl border border-border p-3 ${className}`}
        onPress={() => setShow(true)}
      >
        <Text className={`text-sm ${value ? 'text-ink' : 'text-subtle'}`}>
          {value ? formatDateID(value) : placeholder}
        </Text>
      </Pressable>
      {show && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          themeVariant="dark"
          onChange={(event, selected) => {
            setShow(false);
            if (event.type === 'set' && selected) onChange(toISODate(selected));
          }}
        />
      )}
    </View>
  );
}
