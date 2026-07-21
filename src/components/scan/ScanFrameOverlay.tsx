import { StyleSheet, View } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface ScanFrameOverlayProps {
  active: boolean;
}

const OVERLAY_COLOR = 'rgba(0,0,0,0.45)';

/**
 * Overlay gelap dengan bingkai transparan di tengah untuk memandu posisi
 * barcode. `active` mengubah warna bingkai (mis. abu saat scanner terkunci).
 */
export function ScanFrameOverlay({ active }: ScanFrameOverlayProps) {
  const theme = useTheme();
  const frameColor = active ? theme.primary : theme.textSecondary;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.row, { backgroundColor: OVERLAY_COLOR }]} />
      <View style={styles.middleRow}>
        <View style={[styles.side, { backgroundColor: OVERLAY_COLOR }]} />
        <View style={[styles.frame, { borderColor: frameColor }]} />
        <View style={[styles.side, { backgroundColor: OVERLAY_COLOR }]} />
      </View>
      <View style={[styles.row, { backgroundColor: OVERLAY_COLOR, flex: 1.2 }]} />
    </View>
  );
}

const FRAME_SIZE = 250;

const styles = StyleSheet.create({
  row: {
    flex: 1,
  },
  middleRow: {
    flexDirection: 'row',
    height: FRAME_SIZE,
  },
  side: {
    flex: 1,
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    borderWidth: 3,
    borderRadius: Radius.lg,
  },
});
