import React from 'react';
import { View, ViewProps } from 'react-native';

type CardProps = ViewProps & {
  accent?: boolean; // garis aksen warna tema di kiri — dipakai untuk kartu ringkasan/utama
};

// Komponen kartu terpusat biar seluruh app konsisten (radius, padding, shadow tipis),
// daripada tiap layar nulis ulang "rounded-2xl bg-card p-4" dengan variasi kecil.
export default function Card({ accent, className = '', style, children, ...rest }: CardProps) {
  return (
    <View
      className={`rounded-2xl bg-card p-4 ${accent ? 'border-l-4 border-primary' : ''} ${className}`}
      style={[
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 3,
          elevation: 1,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
