// Domain email "palsu" supaya Denny & Wulan cukup ketik nama di layar login
// (Supabase Auth tetap butuh format email). Dipusatkan di sini — jangan
// hardcode '@deera.id' di tempat lain.
export const EMAIL_DOMAIN = '@deera.id';

export function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}${EMAIL_DOMAIN}`;
}

export function emailToUsername(email?: string | null): string | null {
  if (!email) return null;
  return email.split('@')[0]?.toLowerCase() ?? null;
}
