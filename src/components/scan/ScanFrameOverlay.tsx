import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface ScanFrameOverlayProps {
  active: boolean;
}

const OVERLAY_COLOR = 'rgba(0,0,0,0.5)';
const FRAME_SIZE = 250;
const BRACKET_SIZE = 36;
const BRACKET_THICKNESS = 4;

/**
 * Overlay gelap dengan bingkai bracket (gaya scanner modern) di tengah untuk
 * memandu posisi QR. Saat `active`, garis pemindai bergerak naik-turun di
 * dalam bingkai sebagai indikator kamera sedang aktif mencari kode.
 */
export function ScanFrameOverlay({ active }: ScanFrameOverlayProps) {
  const theme = useTheme();
  const frameColor = active ? theme.primary : theme.textSecondary;
  const [scanLineAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!active) {
      scanLineAnim.stopAnimation();
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ]),
    );
    loop.start();

    return () => loop.stop();
  }, [active, scanLineAnim]);

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [BRACKET_THICKNESS, FRAME_SIZE - BRACKET_THICKNESS],
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.row, { backgroundColor: OVERLAY_COLOR }]} />
      <View style={styles.middleRow}>
        <View style={[styles.side, { backgroundColor: OVERLAY_COLOR }]} />
        <View style={styles.frame}>
          <CornerBracket position="topLeft" color={frameColor} />
          <CornerBracket position="topRight" color={frameColor} />
          <CornerBracket position="bottomLeft" color={frameColor} />
          <CornerBracket position="bottomRight" color={frameColor} />

          {active ? (
            <Animated.View
              style={[
                styles.scanLine,
                { backgroundColor: theme.primary, transform: [{ translateY: scanLineTranslateY }] },
              ]}
            />
          ) : null}
        </View>
        <View style={[styles.side, { backgroundColor: OVERLAY_COLOR }]} />
      </View>
      <View style={[styles.row, { backgroundColor: OVERLAY_COLOR, flex: 1.2 }]} />
    </View>
  );
}

type CornerPosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

function CornerBracket({ position, color }: { position: CornerPosition; color: string }) {
  const isTop = position === 'topLeft' || position === 'topRight';
  const isLeft = position === 'topLeft' || position === 'bottomLeft';

  return (
    <View
      style={[
        styles.bracket,
        isTop ? { top: 0 } : { bottom: 0 },
        isLeft ? { left: 0 } : { right: 0 },
        {
          borderColor: color,
          borderTopWidth: isTop ? BRACKET_THICKNESS : 0,
          borderBottomWidth: isTop ? 0 : BRACKET_THICKNESS,
          borderLeftWidth: isLeft ? BRACKET_THICKNESS : 0,
          borderRightWidth: isLeft ? 0 : BRACKET_THICKNESS,
          borderTopLeftRadius: position === 'topLeft' ? Radius.md : 0,
          borderTopRightRadius: position === 'topRight' ? Radius.md : 0,
          borderBottomLeftRadius: position === 'bottomLeft' ? Radius.md : 0,
          borderBottomRightRadius: position === 'bottomRight' ? Radius.md : 0,
        },
      ]}
    />
  );
}

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
    overflow: 'hidden',
  },
  bracket: {
    position: 'absolute',
    width: BRACKET_SIZE,
    height: BRACKET_SIZE,
  },
  scanLine: {
    position: 'absolute',
    left: BRACKET_THICKNESS,
    right: BRACKET_THICKNESS,
    height: 2,
    borderRadius: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
});
