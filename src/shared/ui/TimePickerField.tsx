import React, { useState } from 'react';
import { Platform, Pressable, Text, View, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

type TimePickerFieldProps = {
  value: string; // format 'HH:MM', string kosong berarti belum diisi
  onChange: (hhmm: string) => void;
  placeholder?: string;
  className?: string;
};

function toHHMM(d: Date) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// Sama seperti DatePickerField tapi mode="time" — dipakai buat pengingat
// yang perlu >1x sehari (mis. "minum obat" jam 07:00, 13:00, 20:00).
export default function TimePickerField({
  value,
  onChange,
  placeholder = 'Pilih jam',
  className = '',
}: TimePickerFieldProps) {
  const [show, setShow] = useState(false);
  const timeValue = (() => {
    const d = new Date();
    if (value && /^\d{2}:\d{2}$/.test(value)) {
      const [h, m] = value.split(':').map(Number);
      d.setHours(h, m, 0, 0);
    }
    return d;
  })();

  if (Platform.OS === 'web') {
    return (
      <TextInput
        style={{ color: '#EDEDED' }}
        className={`rounded-xl border border-border p-3 text-sm ${className}`}
        placeholder={`${placeholder} (HH:MM)`}
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
        <Text className={`text-sm ${value ? 'text-ink' : 'text-subtle'}`}>{value || placeholder}</Text>
      </Pressable>
      {show && (
        <DateTimePicker
          value={timeValue}
          mode="time"
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          themeVariant="dark"
          onChange={(event, selected) => {
            setShow(false);
            if (event.type === 'set' && selected) onChange(toHHMM(selected));
          }}
        />
      )}
    </View>
  );
}
