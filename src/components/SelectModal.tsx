import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface SelectModalOption<T> {
  label: string;
  value: T;
}

export interface SelectModalProps<T> {
  visible: boolean;
  title: string;
  options: SelectModalOption<T>[];
  selectedValue: T | null;
  onSelect: (value: T | null) => void;
  onClose: () => void;
  allowClear?: boolean;
  clearLabel?: string;
}

/**
 * Modal pilihan generik (single-select) — dipakai untuk filter kelas,
 * status, dsb. Reusable di luar modul absensi.
 */
export function SelectModal<T extends string | number>({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  allowClear = true,
  clearLabel = 'Semua',
}: SelectModalProps<T>) {
  const theme = useTheme();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
        <FlatList
          data={allowClear ? [{ label: clearLabel, value: null }, ...options] : options}
          keyExtractor={(item, index) => `${item.value ?? 'clear'}-${index}`}
          style={styles.list}
          renderItem={({ item }) => {
            const isSelected = item.value === selectedValue;

            return (
              <Pressable
                style={[styles.option, isSelected && { backgroundColor: theme.surface }]}
                onPress={() => {
                  onSelect(item.value);
                  onClose();
                }}>
                <Text
                  style={[
                    styles.optionText,
                    { color: isSelected ? theme.primary : theme.textPrimary },
                  ]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopWidth: 1,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    maxHeight: '70%',
    padding: Spacing.lg,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  list: {
    flexGrow: 0,
  },
  option: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm,
  },
  optionText: {
    fontSize: 15,
  },
});
