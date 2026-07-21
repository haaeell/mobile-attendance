import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */
export function useTheme() {
  const scheme = useColorScheme();

  return Colors[scheme === 'dark' ? 'dark' : 'light'];
}
