import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSun, Sun, type LucideIcon } from 'lucide-react'

export function weatherInfo(code: number): { label: string; Icon: LucideIcon } {
  if (code === 0) return { label: 'Cerah', Icon: Sun }
  if (code <= 2) return { label: 'Cerah berawan', Icon: CloudSun }
  if (code === 3) return { label: 'Berawan', Icon: Cloud }
  if (code === 45 || code === 48) return { label: 'Berkabut', Icon: CloudFog }
  if (code >= 51 && code <= 57) return { label: 'Gerimis', Icon: CloudDrizzle }
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { label: 'Hujan', Icon: CloudRain }
  if (code >= 95) return { label: 'Badai petir', Icon: CloudLightning }
  return { label: 'Berawan', Icon: Cloud }
}