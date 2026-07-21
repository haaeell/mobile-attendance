/**
 * Theme dasar aplikasi. Belum mendesain seluruh UI — hanya token warna dan
 * spacing yang dipakai oleh komponen dasar (lihat src/components).
 */

export const Colors = {
  light: {
    primary: '#02783F',
    success: '#16A34A',
    warning: '#D97706',
    danger: '#DC2626',
    background: '#FFFFFF',
    surface: '#F5F6F8',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    border: '#E2E4E9',
  },
  dark: {
    primary: '#34C77D',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#F87171',
    background: '#0B0D10',
    surface: '#17191D',
    textPrimary: '#F5F6F8',
    textSecondary: '#9AA0AA',
    border: '#2A2D33',
  },
} as const;

export type ThemeMode = keyof typeof Colors;
export type ThemeColorName = keyof typeof Colors.light;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 22,
  full: 999,
} as const;

/**
 * Shadow tipis konsisten untuk kartu (iOS: shadow*, Android: elevation).
 * Dipakai bersama `theme.surface`/`theme.background` sebagai backgroundColor.
 */
export const CardShadow = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
} as const;
