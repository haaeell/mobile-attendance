import * as Device from 'expo-device';
import { Platform } from 'react-native';

/**
 * Nama perangkat untuk dikirim sebagai `device_name` saat login (dipakai
 * backend untuk membedakan token per perangkat). Bukan data sensitif,
 * aman dikirim ke server.
 */
export function getDeviceName(): string {
  const name = Device.deviceName ?? Device.modelName ?? `${Platform.OS} device`;

  // Backend membatasi device_name maksimal 100 karakter.
  return name.slice(0, 100);
}
