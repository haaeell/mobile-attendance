import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Backend mengirim nama file lewat header Content-Disposition (mis. lewat
 * `streamDownload`/paket Excel), baik dalam bentuk `filename="x.pdf"` maupun
 * `filename=x.pdf` (tanpa tanda kutip bila tidak ada karakter spesial).
 */
export function parseFilenameFromContentDisposition(headerValue?: string | null): string | null {
  if (!headerValue) {
    return null;
  }

  const quotedMatch = headerValue.match(/filename="([^"]+)"/i);
  if (quotedMatch) {
    return quotedMatch[1];
  }

  const bareMatch = headerValue.match(/filename=([^;]+)/i);
  return bareMatch ? bareMatch[1].trim() : null;
}

/**
 * Tulis respons biner (ArrayBuffer) ke direktori cache. Cache dipilih (bukan
 * document directory) karena file ini hanya perantara sebelum dibagikan lewat
 * share sheet — pendekatan yang direkomendasikan Expo terbaru untuk export
 * file di Android tanpa perlu permission penyimpanan (scoped storage).
 */
export function saveArrayBufferToCacheFile(data: ArrayBuffer, filename: string): File {
  const file = new File(Paths.cache, filename);

  if (file.exists) {
    file.delete();
  }

  file.create();
  file.write(new Uint8Array(data));

  return file;
}

/**
 * Buka share sheet OS untuk file yang sudah tersimpan lokal. Di Android ini
 * juga berfungsi sebagai "buka" (aplikasi lain yang bisa menampilkan file
 * akan muncul sebagai pilihan), karena Expo tidak lagi menyediakan API akses
 * langsung ke penyimpanan publik tanpa permission tambahan.
 */
export async function shareFile(
  file: File,
  options?: { mimeType?: string; dialogTitle?: string },
): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();

  if (!isAvailable) {
    throw new Error('Fitur berbagi file tidak tersedia di perangkat ini.');
  }

  await Sharing.shareAsync(file.uri, {
    mimeType: options?.mimeType,
    dialogTitle: options?.dialogTitle,
  });
}
