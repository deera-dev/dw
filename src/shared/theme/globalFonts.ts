import React from 'react';
import { Text, TextInput } from 'react-native';
import { darkPalette } from './theme';

// Supaya tidak perlu edit satu-satu setiap <Text>/<TextInput> yang sudah ada
// di seluruh app, kita "patch" render bawaan RN: hasil render aslinya (yang
// sudah termasuk style dari NativeWind/className) tetap dipakai, kita cuma
// selipkan fontFamily & warna teks default DI BAWAH style tersebut. Kalau
// elemen sudah punya fontFamily/color sendiri (mis. lewat className
// "font-title" atau "text-muted"), itu tetap menang karena urutan array
// style RN: entri belakang override entri depan.
//
// Warna default ini juga jadi jaring pengaman buat tema dark: RN normalnya
// bikin <Text> tanpa class warna jadi hitam (kebaca di background putih),
// tapi begitu app pindah ke tema dark itu jadi teks hitam di atas kartu
// gelap alias tak kelihatan. Dengan default color di sini, teks yang belum
// sempat dikasih class warna eksplisit tetap kebaca.
let patched = false;

export function applyGlobalFonts() {
  if (patched) return;
  patched = true;

  const TextAny = Text as any;
  const originalTextRender = TextAny.render;
  if (originalTextRender) {
    TextAny.render = function patchedTextRender(...args: unknown[]) {
      const origin = originalTextRender.apply(this, args);
      return React.cloneElement(origin, {
        style: [{ fontFamily: 'Sleggie', color: darkPalette.ink }, origin.props.style],
      });
    };
  }

  const TextInputAny = TextInput as any;
  const originalInputRender = TextInputAny.render;
  if (originalInputRender) {
    TextInputAny.render = function patchedTextInputRender(...args: unknown[]) {
      const origin = originalInputRender.apply(this, args);
      return React.cloneElement(origin, {
        style: [{ fontFamily: 'Sleggie', color: darkPalette.ink }, origin.props.style],
        placeholderTextColor: origin.props.placeholderTextColor ?? darkPalette.subtle,
      });
    };
  }
}
