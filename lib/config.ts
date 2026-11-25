export const JOIN_DEADLINE_DAYS = 3 // samakan dengan join_deadline_days() di SQL
export const CONTACT_EMAIL = 'GANTI-DENGAN-EMAILMU@gmail.com'
export const CATEGORIES = ['alam', 'budaya', 'kuliner', 'edukasi', 'religi']
export const DAYS = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'] as const
export const todayStr = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
export const TRAVEL_STYLES = ['Santai', 'Petualang', 'Budaya', 'Kuliner', 'Hemat', 'Fotografi']
export const MOV = { plans: 100, joinRate: 40, contactRate: 70, newDest: 20 }
export const REPORT_SLA_HOURS = 48