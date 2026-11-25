const map: Record<string, string> = {
  QUOTA_BELOW_APPROVED: 'Kuota teman tidak boleh lebih kecil dari peserta yang sudah disetujui.',
  INVALID_STATUS: 'Status tidak valid.',
  LOCKED_PENDING: 'Data sedang ditinjau admin dan tidak bisa diubah sementara.',
  INCOMPLETE: 'Lengkapi semua kolom wajib (minimal 3 foto, lokasi, jam buka, dan bukti).',
  NOTE_REQUIRED: 'Catatan wajib diisi (minimal 3 karakter).',
  ALREADY_HANDLED: 'Laporan ini sudah ditangani.',
  CANNOT_TARGET_ADMIN: 'Akun admin tidak bisa dinonaktifkan.',
  PLAN_GONE: 'Rencananya sudah tidak ada.',
  USER_GONE: 'Akun terlapor sudah tidak ada.',
  NOT_FOUND: 'Data tidak ditemukan.',
}

export function errText(err: unknown, fallback = 'Terjadi kesalahan.'): string {
  const raw =
    typeof err === 'string'
      ? err
      : err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
        ? err.message
        : ''

  if (!raw) return fallback

  for (const [code, message] of Object.entries(map)) {
    if (raw.includes(code)) return message
  }

  return raw
}

export const getErrorMessage = errText