export default async function Weather({ lat, lng }: { lat: number; lng: number }) {
  try {
    const r = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&timezone=Asia%2FJakarta`,
      { next: { revalidate: 1800 } }
    )
    const d = await r.json()
    const code: number = d.current.weather_code
    const icon = code === 0 ? '☀️' : code < 4 ? '⛅' : code < 70 ? '🌧️' : '⛈️'
    return <span>{icon} {Math.round(d.current.temperature_2m)}°C</span>
  } catch {
    return <span className="text-slate-400">Cuaca tidak tersedia</span>
  }
}