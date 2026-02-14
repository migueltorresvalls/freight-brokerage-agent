import type { Call, NegotiationBucket, NegotiationBucketKey, Sentiment, TopCustomer } from '../types'

export function sentimentScore(sentiment: Sentiment): number {
  if (sentiment === 'positive') return 10
  if (sentiment === 'neutral') return 5
  return 0
}

export function sentimentColor(sentiment: Sentiment): string {
  switch (sentiment) {
    case 'positive':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200'
    case 'neutral':
      return 'text-sky-700 bg-sky-50 border-sky-200'
    case 'negative':
      return 'text-rose-700 bg-rose-50 border-rose-200'
    default:
      return 'text-slate-700 bg-slate-50 border-slate-200'
  }
}

export function negotiationDeltaPercent(call: Call): number | null {
  if (!call.loadboard_rate || call.loadboard_rate === 0) return null
  if (!call.agreed_rate || call.agreed_rate === 0) return null
  return (call.agreed_rate - call.loadboard_rate) / call.loadboard_rate
}

export function formatPercent(value: number | null, fractionDigits = 1): string {
  if (value === null) return '–'
  return `${(value * 100).toFixed(fractionDigits)}%`
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '–'
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export function getNegotiationBucketKey(delta: number | null): NegotiationBucketKey | null {
  if (delta === null) return null
  const absDelta = Math.max(delta, 0)
  if (absDelta < 0.05) return '0-5'
  if (absDelta < 0.1) return '5-10'
  if (absDelta < 0.15) return '10-15'
  if (absDelta < 0.2) return '15-20'
  return '20+'
}

export function computeNegotiationBuckets(calls: Call[]): NegotiationBucket[] {
  const buckets: NegotiationBucket[] = [
    { key: '0-5', label: '0–5%', range: [0, 0.05], count: 0 },
    { key: '5-10', label: '5–10%', range: [0.05, 0.1], count: 0 },
    { key: '10-15', label: '10–15%', range: [0.1, 0.15], count: 0 },
    { key: '15-20', label: '15–20%', range: [0.15, 0.2], count: 0 },
    { key: '20+', label: '>20%', range: [0.2, null], count: 0 },
  ]
  for (const call of calls) {
    const key = getNegotiationBucketKey(negotiationDeltaPercent(call))
    if (!key) continue
    const bucket = buckets.find((b) => b.key === key)
    if (bucket) bucket.count++
  }
  return buckets
}

export function computeTopCustomers(calls: Call[]): TopCustomer[] {
  const map = new Map<string, TopCustomer>()
  for (const call of calls) {
    if (!call.mc_number) continue
    const existing = map.get(call.mc_number) ?? {
      mc_number: call.mc_number,
      callCount: 0,
      totalAgreedRate: 0,
    }
    existing.callCount += 1
    if (call.agreed_rate) existing.totalAgreedRate += call.agreed_rate
    map.set(call.mc_number, existing)
  }
  return Array.from(map.values()).sort((a, b) => {
    if (b.callCount === a.callCount) return b.totalAgreedRate - a.totalAgreedRate
    return b.callCount - a.callCount
  })
}

/**
 * Parsea call_datetime en formato "Feb 5 9:05a.m." / "Feb 14 02:30p.m." a Date.
 * Usa el año actual si no viene en el string.
 */
export function parseCallDateTime(callDatetime: string): Date | null {
  if (!callDatetime || typeof callDatetime !== 'string') return null
  const trimmed = callDatetime.trim().replace(/\s+([ap])\.?m\.?$/i, '$1.m.')
  // Intentar formato tipo "Feb 5 9:05a.m." o "feb 14 02:30p.m."
  const match = trimmed.match(/^([A-Za-z]{3})\s+(\d{1,2})\s+(\d{1,2}):(\d{2})([ap])\.?m\.?$/i)
  if (match) {
    const [, mon, day, hour, min, ampm] = match
    const monthNames: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    }
    const month = monthNames[mon.toLowerCase()]
    if (month === undefined) return null
    let h = parseInt(hour, 10)
    if (ampm.toLowerCase() === 'p' && h !== 12) h += 12
    if (ampm.toLowerCase() === 'a' && h === 12) h = 0
    const year = new Date().getFullYear()
    const d = new Date(year, month, parseInt(day, 10), h, parseInt(min, 10), 0, 0)
    return isNaN(d.getTime()) ? null : d
  }
  // Fallback: Date.parse para otros formatos (ISO, etc.)
  const parsed = Date.parse(trimmed)
  if (Number.isNaN(parsed)) return null
  return new Date(parsed)
}

export function computeTruckProgress(call: Call): number {
  if (!call.pickup_datetime || !call.delivery_datetime || !call.miles) return 0
  const pickup = new Date(call.pickup_datetime.replace(' ', 'T')).getTime()
  const delivery = new Date(call.delivery_datetime.replace(' ', 'T')).getTime()
  const now = Date.now()
  if (!pickup || !delivery || delivery <= pickup) return 0
  const totalMs = delivery - pickup
  const elapsedMs = Math.min(Math.max(now - pickup, 0), totalMs)
  const totalDays = totalMs / (1000 * 60 * 60 * 24)
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24)
  if (totalDays <= 0) return 0
  const distancePerDay = call.miles / totalDays
  const distanceCovered = distancePerDay * elapsedDays
  return Math.max(0, Math.min(distanceCovered / call.miles, 1))
}
