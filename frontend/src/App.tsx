import { useEffect, useMemo, useState } from 'react'
import {
  LayoutDashboard,
  PhoneCall,
  Truck,
  Users,
  Search,
  MapPin,
  ArrowRightLeft,
  X,
  ChevronLeft,
  ChevronRight,
  Table,
  Grid3X3,
  Sun,
  Moon,
} from 'lucide-react'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps'

declare global {
  interface Window {
    __BEARER_TOKEN__?: string
  }
}

type Sentiment = 'positive' | 'neutral' | 'negative'

export interface Call {
  call_id: number
  outcome: string
  load_id: number
  agreed_rate: number
  sentiment: Sentiment
  timestamp: string
  mc_number?: string | null
  origin?: string | null
  destination?: string | null
  pickup_datetime?: string | null
  delivery_datetime?: string | null
  loadboard_rate?: number | null
  weight?: number | null
  miles?: number | null
  call_datetime: string
}

interface CallsApiResponse {
  calls: Call[]
}

type ViewMode = 'grid' | 'list'
type Theme = 'light' | 'dark'

type NegotiationBucketKey = '0-5' | '5-10' | '10-15' | '15-20' | '20+'

interface NegotiationBucket {
  key: NegotiationBucketKey
  label: string
  range: [number, number | null]
  count: number
}

interface TopCustomer {
  mc_number: string
  callCount: number
  totalAgreedRate: number
}

const GEO_URL =
  'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'

const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  // Texas
  'Laredo, TX': { lat: 27.5306, lon: -99.4803 },
  'Houston, TX': { lat: 29.7604, lon: -95.3698 },
  'Dallas, TX': { lat: 32.7767, lon: -96.797 },
  'El Paso, TX': { lat: 31.7619, lon: -106.485 },
  'San Antonio, TX': { lat: 29.4241, lon: -98.4936 },
  'Austin, TX': { lat: 30.2672, lon: -97.7431 },
  'Lubbock, TX': { lat: 33.5779, lon: -101.8552 },
  'Amarillo, TX': { lat: 35.221997, lon: -101.8313 },

  // California
  'Los Angeles, CA': { lat: 34.0522, lon: -118.2437 },
  'San Diego, CA': { lat: 32.7157, lon: -117.1611 },
  'San Francisco, CA': { lat: 37.7749, lon: -122.4194 },
  'Sacramento, CA': { lat: 38.5816, lon: -121.4944 },
  'Fresno, CA': { lat: 36.7378, lon: -119.7871 },

  // Washington & PNW
  'Seattle, WA': { lat: 47.6062, lon: -122.3321 },
  'Tacoma, WA': { lat: 47.2529, lon: -122.4443 },
  'Spokane, WA': { lat: 47.6588, lon: -117.426 },
  'Portland, OR': { lat: 45.5051, lon: -122.675 },
  'Boise, ID': { lat: 43.615, lon: -116.2023 },

  // Midwest & Great Lakes
  'Chicago, IL': { lat: 41.8781, lon: -87.6298 },
  'Minneapolis, MN': { lat: 44.9778, lon: -93.265 },
  'Madison, WI': { lat: 43.0731, lon: -89.4012 },
  'Milwaukee, WI': { lat: 43.0389, lon: -87.9065 },
  'Detroit, MI': { lat: 42.3314, lon: -83.0458 },
  'Cleveland, OH': { lat: 41.4993, lon: -81.6944 },
  'Columbus, OH': { lat: 39.9612, lon: -82.9988 },
  'Cincinnati, OH': { lat: 39.1031, lon: -84.512 },
  'Indianapolis, IN': { lat: 39.7684, lon: -86.1581 },
  'Des Moines, IA': { lat: 41.5868, lon: -93.625 },
  'Omaha, NE': { lat: 41.2565, lon: -95.9345 },
  'Fargo, ND': { lat: 46.8772, lon: -96.7898 },
  'Kansas City, MO': { lat: 39.0997, lon: -94.5786 },
  'St. Louis, MO': { lat: 38.627, lon: -90.1994 },

  // Mountain West
  'Denver, CO': { lat: 39.7392, lon: -104.9903 },
  'Salt Lake City, UT': { lat: 40.7608, lon: -111.891 },
  'Phoenix, AZ': { lat: 33.4484, lon: -112.074 },
  'Tucson, AZ': { lat: 32.2226, lon: -110.9747 },
  'Albuquerque, NM': { lat: 35.0844, lon: -106.6504 },

  // South & Southeast
  'Miami, FL': { lat: 25.7617, lon: -80.1918 },
  'Orlando, FL': { lat: 28.5383, lon: -81.3792 },
  'Tampa, FL': { lat: 27.9506, lon: -82.4572 },
  'Jacksonville, FL': { lat: 30.3322, lon: -81.6557 },
  'New Orleans, LA': { lat: 29.9511, lon: -90.0715 },
  'Savannah, GA': { lat: 32.0809, lon: -81.0912 },
  'Atlanta, GA': { lat: 33.749, lon: -84.388 },
  'Greenville, SC': { lat: 34.8526, lon: -82.394 },
  'Charleston, SC': { lat: 32.7765, lon: -79.9311 },
  'Raleigh, NC': { lat: 35.7796, lon: -78.6382 },
  'Charlotte, NC': { lat: 35.2271, lon: -80.8431 },
  'Birmingham, AL': { lat: 33.5186, lon: -86.8104 },
  'Mobile, AL': { lat: 30.6954, lon: -88.0399 },
  'Little Rock, AR': { lat: 34.7465, lon: -92.2896 },
  'Jackson, MS': { lat: 32.2988, lon: -90.1848 },
  'Oklahoma City, OK': { lat: 35.4676, lon: -97.5164 },
  'Tulsa, OK': { lat: 36.1539, lon: -95.9928 },
  'Louisville, KY': { lat: 38.2527, lon: -85.7585 },
  'Nashville, TN': { lat: 36.1627, lon: -86.7816 },
  'Memphis, TN': { lat: 35.1495, lon: -90.049 },
  'Kansas City, KS': { lat: 39.1142, lon: -94.6275 }, // rarely used but safe

  // Northeast
  'New York, NY': { lat: 40.7128, lon: -74.006 },
  'Portland, ME': { lat: 43.6591, lon: -70.2568 },
  'Boston, MA': { lat: 42.3601, lon: -71.0589 },
  'Philadelphia, PA': { lat: 39.9526, lon: -75.1652 },
  'Pittsburgh, PA': { lat: 40.4406, lon: -79.9959 },
  'Baltimore, MD': { lat: 39.2904, lon: -76.6122 },
  'Hartford, CT': { lat: 41.7658, lon: -72.6734 },
  'Providence, RI': { lat: 41.824, lon: -71.4128 },
  'Newark, NJ': { lat: 40.7357, lon: -74.1724 },
  'Albany, NY': { lat: 42.6526, lon: -73.7562 },
  'Syracuse, NY': { lat: 43.0481, lon: -76.1474 },
  'Buffalo, NY': { lat: 42.8864, lon: -78.8784 },

  // Cross-border
  'Toronto, ON': { lat: 43.6532, lon: -79.3832 },
  'Vancouver, BC': { lat: 49.2827, lon: -123.1207 },
}

function sentimentScore(sentiment: Sentiment): number {
  if (sentiment === 'positive') return 10
  if (sentiment === 'neutral') return 5
  return 0
}

function sentimentColor(sentiment: Sentiment): string {
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

function negotiationDeltaPercent(call: Call): number | null {
  if (!call.loadboard_rate || call.loadboard_rate === 0) return null
  if (!call.agreed_rate || call.agreed_rate === 0) return null
  const ratio =
    (call.agreed_rate - call.loadboard_rate) / call.loadboard_rate
  return ratio
}

function formatPercent(value: number | null, fractionDigits = 1) {
  if (value === null) return '–'
  return `${(value * 100).toFixed(fractionDigits)}%`
}

function formatCurrency(value: number | null | undefined) {
  if (value == null) return '–'
  return `$${value.toLocaleString('en-US', {
    maximumFractionDigits: 0,
  })}`
}

function getNegotiationBucketKey(
  delta: number | null,
): NegotiationBucketKey | null {
  if (delta === null) return null
  const absDelta = Math.max(delta, 0)
  if (absDelta < 0.05) return '0-5'
  if (absDelta < 0.1) return '5-10'
  if (absDelta < 0.15) return '10-15'
  if (absDelta < 0.2) return '15-20'
  return '20+'
}

function computeNegotiationBuckets(
  calls: Call[],
): NegotiationBucket[] {
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

function computeTopCustomers(calls: Call[]): TopCustomer[] {
  const map = new Map<string, TopCustomer>()

  for (const call of calls) {
    if (!call.mc_number) continue
    const existing = map.get(call.mc_number) ?? {
      mc_number: call.mc_number,
      callCount: 0,
      totalAgreedRate: 0,
    }
    existing.callCount += 1
    if (call.agreed_rate) {
      existing.totalAgreedRate += call.agreed_rate
    }
    map.set(call.mc_number, existing)
  }

  return Array.from(map.values()).sort((a, b) => {
    if (b.callCount === a.callCount) {
      return b.totalAgreedRate - a.totalAgreedRate
    }
    return b.callCount - a.callCount
  })
}

function computeTruckProgress(call: Call): number {
  if (!call.pickup_datetime || !call.delivery_datetime || !call.miles) {
    return 0
  }

  const pickup = new Date(
    call.pickup_datetime.replace(' ', 'T'),
  ).getTime()
  const delivery = new Date(
    call.delivery_datetime.replace(' ', 'T'),
  ).getTime()
  const now = Date.now()

  if (!pickup || !delivery || delivery <= pickup) return 0

  const totalMs = delivery - pickup
  const elapsedMs = Math.min(Math.max(now - pickup, 0), totalMs)

  const totalDays = totalMs / (1000 * 60 * 60 * 24)
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24)

  if (totalDays <= 0) return 0

  const distancePerDay = call.miles / totalDays
  const distanceCovered = distancePerDay * elapsedDays
  const progress = distanceCovered / call.miles

  return Math.max(0, Math.min(progress, 1))
}

interface CallDetailModalProps {
  call: Call | null
  open: boolean
  onClose: () => void
}

function CallDetailModal({
  call,
  open,
  onClose,
  isDark,
}: CallDetailModalProps & { isDark: boolean }) {
  if (!open || !call) return null

  const progress = computeTruckProgress(call)

  return (
    <div
      className={
        'fixed inset-0 z-40 flex items-center justify-center backdrop-blur-sm ' +
        (isDark ? 'bg-slate-950/70' : 'bg-slate-900/15')
      }
    >
      <div
        className={
          'relative w-full max-w-4xl rounded-2xl border p-6 shadow-2xl ' +
          (isDark
            ? 'border-slate-700 bg-slate-900 shadow-slate-900'
            : 'border-slate-200 bg-white shadow-slate-200')
        }
      >
        <button
          onClick={onClose}
          className={
            'absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border text-slate-600 hover:bg-slate-100 ' +
            (isDark
              ? 'border-slate-700 bg-slate-900 text-slate-200'
              : 'border-slate-200 bg-slate-50 text-slate-600')
          }
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-wrap items-start gap-4 pr-8">
          <div
            className={
              'flex items-center gap-3 rounded-xl px-4 py-2 ' +
              (isDark ? 'bg-emerald-900/40' : 'bg-emerald-50')
            }
          >
            <PhoneCall
              className={
                'h-5 w-5 ' +
                (isDark
                  ? 'text-emerald-300'
                  : 'text-emerald-600')
              }
            />
            <div className="text-sm">
              <div
                className={
                  'text-xs uppercase tracking-wide ' +
                  (isDark
                    ? 'text-slate-300'
                    : 'text-slate-500')
                }
              >
                Call ID
              </div>
              <div
                className={
                  'font-semibold ' +
                  (isDark ? 'text-slate-50' : 'text-slate-900')
                }
              >
                #{call.call_id}
              </div>
            </div>
          </div>

          <div
            className={
              'flex items-center gap-3 rounded-xl px-4 py-2 ' +
              (isDark ? 'bg-indigo-900/40' : 'bg-indigo-50')
            }
          >
            <Truck
              className={
                'h-5 w-5 ' +
                (isDark ? 'text-indigo-300' : 'text-indigo-600')
              }
            />
            <div className="text-sm">
              <div
                className={
                  'text-xs uppercase tracking-wide ' +
                  (isDark
                    ? 'text-slate-300'
                    : 'text-slate-500')
                }
              >
                Load
              </div>
              <div
                className={
                  'font-semibold ' +
                  (isDark ? 'text-slate-50' : 'text-slate-900')
                }
              >
                #{call.load_id}
              </div>
            </div>
          </div>

          {call.mc_number && (
            <div
              className={
                'flex items-center gap-3 rounded-xl px-4 py-2 ' +
                (isDark ? 'bg-sky-900/40' : 'bg-sky-50')
              }
            >
              <Users
                className={
                  'h-5 w-5 ' +
                  (isDark
                    ? 'text-sky-300'
                    : 'text-sky-600')
                }
              />
              <div className="text-sm">
                <div
                  className={
                    'text-xs uppercase tracking-wide ' +
                    (isDark
                      ? 'text-slate-300'
                      : 'text-slate-500')
                  }
                >
                  MC Number
                </div>
                <div
                  className={
                    'font-semibold ' +
                    (isDark
                      ? 'text-slate-50'
                      : 'text-slate-900')
                  }
                >
                  {call.mc_number}
                </div>
              </div>
            </div>
          )}

          <div
            className={[
              'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium',
              sentimentColor(call.sentiment),
            ].join(' ')}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            <span className="capitalize">{call.sentiment} sentiment</span>
          </div>
        </div>

        <div className="mt-6">
          <div
            className={
              'flex items-center justify-between text-sm ' +
              (isDark ? 'text-slate-200' : 'text-slate-700')
            }
          >
            <div className="flex items-center gap-2">
              <MapPin
                className={
                  'h-4 w-4 ' +
                  (isDark
                    ? 'text-emerald-300'
                    : 'text-emerald-500')
                }
              />
              <span
                className={
                  'font-medium ' +
                  (isDark ? 'text-slate-50' : 'text-slate-900')
                }
              >
                {call.origin ?? 'Unknown origin'}
              </span>
            </div>
            <div
              className={
                'flex items-center gap-2 text-xs uppercase tracking-wide ' +
                (isDark ? 'text-slate-400' : 'text-slate-500')
              }
            >
              <ArrowRightLeft className="h-4 w-4" />
              <span>Route Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin
                className={
                  'h-4 w-4 ' +
                  (isDark
                    ? 'text-indigo-300'
                    : 'text-indigo-500')
                }
              />
              <span
                className={
                  'font-medium ' +
                  (isDark ? 'text-slate-50' : 'text-slate-900')
                }
              >
                {call.destination ?? 'Unknown destination'}
              </span>
            </div>
          </div>

          <div
            className={
              'relative mt-4 h-2 rounded-full ' +
              (isDark ? 'bg-slate-800' : 'bg-slate-200')
            }
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500"
              style={{ width: `${progress * 100}%` }}
            />

            <div
              className={
                'absolute -top-4 h-8 w-8 -translate-x-1/2 drop-shadow ' +
                (isDark ? 'text-emerald-300' : 'text-emerald-500')
              }
              style={{ left: `${Math.max(8, Math.min(92, progress * 100))}%` }}
            >
              <Truck className="h-8 w-8" />
            </div>
          </div>

          <div
            className={
              'mt-3 flex flex-wrap items-center justify-between gap-3 text-xs ' +
              (isDark ? 'text-slate-300' : 'text-slate-700')
            }
          >
            <div className="flex items-center gap-4">
              <div
                className={
                  'rounded-lg px-3 py-2 ' +
                  (isDark ? 'bg-slate-800' : 'bg-slate-50')
                }
              >
                <div
                  className={
                    'text-[10px] uppercase tracking-wide ' +
                    (isDark
                      ? 'text-slate-400'
                      : 'text-slate-500')
                  }
                >
                  Distance
                </div>
                <div
                  className={
                    'font-semibold ' +
                    (isDark ? 'text-slate-50' : 'text-slate-900')
                  }
                >
                  {call.miles ? `${call.miles.toLocaleString()} mi` : '–'}
                </div>
              </div>
              <div
                className={
                  'rounded-lg px-3 py-2 ' +
                  (isDark ? 'bg-slate-800' : 'bg-slate-50')
                }
              >
                <div
                  className={
                    'text-[10px] uppercase tracking-wide ' +
                    (isDark
                      ? 'text-slate-400'
                      : 'text-slate-500')
                  }
                >
                  Weight
                </div>
                <div
                  className={
                    'font-semibold ' +
                    (isDark ? 'text-slate-50' : 'text-slate-900')
                  }
                >
                  {call.weight
                    ? `${call.weight.toLocaleString()} lbs`
                    : '–'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div
                className={
                  'rounded-lg px-3 py-2 ' +
                  (isDark ? 'bg-slate-800' : 'bg-slate-50')
                }
              >
                <div
                  className={
                    'text-[10px] uppercase tracking-wide ' +
                    (isDark
                      ? 'text-slate-400'
                      : 'text-slate-500')
                  }
                >
                  Pickup
                </div>
                <div
                  className={
                    'font-mono text-xs ' +
                    (isDark
                      ? 'text-slate-200'
                      : 'text-slate-700')
                  }
                >
                  {call.pickup_datetime ?? '–'}
                </div>
              </div>
              <div
                className={
                  'rounded-lg px-3 py-2 ' +
                  (isDark ? 'bg-slate-800' : 'bg-slate-50')
                }
              >
                <div
                  className={
                    'text-[10px] uppercase tracking-wide ' +
                    (isDark
                      ? 'text-slate-400'
                      : 'text-slate-500')
                  }
                >
                  Delivery
                </div>
                <div
                  className={
                    'font-mono text-xs ' +
                    (isDark
                      ? 'text-slate-200'
                      : 'text-slate-700')
                  }
                >
                  {call.delivery_datetime ?? '–'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div
            className={
              'space-y-2 rounded-xl border p-4 ' +
              (isDark
                ? 'border-slate-700 bg-slate-900'
                : 'border-slate-200 bg-slate-50')
            }
          >
            <div
              className={
                'text-xs font-medium uppercase tracking-wide ' +
                (isDark ? 'text-slate-300' : 'text-slate-500')
              }
            >
              Commercial Outcome
            </div>
            <div
              className={
                'flex items-center gap-2 text-sm capitalize ' +
                (isDark ? 'text-slate-100' : 'text-slate-800')
              }
            >
              {call.outcome}
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  call.outcome === 'successful'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {call.outcome === 'successful'
                  ? 'Won booking'
                  : 'Lost booking'}
              </span>
            </div>
            <div
              className={
                'mt-2 grid grid-cols-2 gap-2 text-xs ' +
                (isDark ? 'text-slate-200' : 'text-slate-700')
              }
            >
              <div
                className={
                  'rounded-lg px-3 py-2 ' +
                  (isDark ? 'bg-slate-800' : 'bg-white')
                }
              >
                <div
                  className={
                    'text-[10px] uppercase tracking-wide ' +
                    (isDark
                      ? 'text-slate-400'
                      : 'text-slate-500')
                  }
                >
                  Agreed Rate
                </div>
                <div
                  className={
                    'font-semibold ' +
                    (isDark ? 'text-slate-50' : 'text-slate-900')
                  }
                >
                  {formatCurrency(call.agreed_rate)}
                </div>
              </div>
              <div
                className={
                  'rounded-lg px-3 py-2 ' +
                  (isDark ? 'bg-slate-800' : 'bg-white')
                }
              >
                <div
                  className={
                    'text-[10px] uppercase tracking-wide ' +
                    (isDark
                      ? 'text-slate-400'
                      : 'text-slate-500')
                  }
                >
                  Loadboard Rate
                </div>
                <div
                  className={
                    'font-semibold ' +
                    (isDark ? 'text-slate-50' : 'text-slate-900')
                  }
                >
                  {formatCurrency(call.loadboard_rate ?? null)}
                </div>
              </div>
            </div>
          </div>

          <div
            className={
              'space-y-2 rounded-xl border p-4 ' +
              (isDark
                ? 'border-slate-700 bg-slate-900'
                : 'border-slate-200 bg-slate-50')
            }
          >
            <div
              className={
                'text-xs font-medium uppercase tracking-wide ' +
                (isDark ? 'text-slate-300' : 'text-slate-500')
              }
            >
              Negotiation Uplift
            </div>
            <div className="flex items-baseline gap-2">
              <div
                className={
                  'text-2xl font-semibold ' +
                  (isDark
                    ? 'text-emerald-400'
                    : 'text-emerald-600')
                }
              >
                {formatPercent(negotiationDeltaPercent(call), 1)}
              </div>
              <div
                className={
                  'text-xs ' +
                  (isDark ? 'text-slate-400' : 'text-slate-500')
                }
              >
                vs loadboard benchmark
              </div>
            </div>
            <div
              className={
                'mt-1 h-1.5 rounded-full ' +
                (isDark ? 'bg-slate-800' : 'bg-slate-200')
              }
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500"
                style={{
                  width: `${
                    Math.min(
                      100,
                      Math.max(
                        0,
                        (negotiationDeltaPercent(call) ?? 0) * 400,
                      ),
                    ) || 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div
            className={
              'space-y-2 rounded-xl border p-4 text-xs ' +
              (isDark
                ? 'border-slate-700 bg-slate-900 text-slate-300'
                : 'border-slate-200 bg-slate-50 text-slate-700')
            }
          >
            <div
              className={
                'text-xs font-medium uppercase tracking-wide ' +
                (isDark ? 'text-slate-300' : 'text-slate-500')
              }
            >
              Call Metadata
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div
                className={
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }
              >
                Call time
              </div>
              <div
                className={
                  'font-mono text-xs ' +
                  (isDark
                    ? 'text-slate-200'
                    : 'text-slate-700')
                }
              >
                {call.call_datetime}
              </div>
              <div
                className={
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }
              >
                Ingested
              </div>
              <div
                className={
                  'font-mono text-xs ' +
                  (isDark
                    ? 'text-slate-200'
                    : 'text-slate-700')
                }
              >
                {call.timestamp}
              </div>
              <div
                className={
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }
              >
                Call ID
              </div>
              <div
                className={
                  'font-mono text-xs ' +
                  (isDark
                    ? 'text-slate-200'
                    : 'text-slate-700')
                }
              >
                {call.call_id}
              </div>
              <div
                className={
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }
              >
                Load ID
              </div>
              <div
                className={
                  'font-mono text-xs ' +
                  (isDark
                    ? 'text-slate-200'
                    : 'text-slate-700')
                }
              >
                {call.load_id}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface MapProps {
  calls: Call[]
  selectedLocation: string | null
  onSelectLocation: (location: string | null) => void
  isDark: boolean
}

function CallsMap({
  calls,
  selectedLocation,
  onSelectLocation,
  isDark,
}: MapProps) {
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null)

  const points = useMemo(() => {
    const list: {
      id: string
      type: 'origin' | 'destination'
      label: string
      lat: number
      lon: number
      count: number
    }[] = []
    const keyFn = (loc: string, type: 'origin' | 'destination') =>
      `${type}:${loc}`

    const map = new Map<string, (typeof list)[number]>()

    for (const call of calls) {
      if (call.origin && CITY_COORDS[call.origin]) {
        const key = keyFn(call.origin, 'origin')
        if (!map.has(key)) {
          const { lat, lon } = CITY_COORDS[call.origin]
          map.set(key, {
            id: key,
            type: 'origin',
            label: call.origin,
            lat,
            lon,
            count: 0,
          })
        }
        map.get(key)!.count++
      }
      if (call.destination && CITY_COORDS[call.destination]) {
        const key = keyFn(call.destination, 'destination')
        if (!map.has(key)) {
          const { lat, lon } = CITY_COORDS[call.destination]
          map.set(key, {
            id: key,
            type: 'destination',
            label: call.destination,
            lat,
            lon,
            count: 0,
          })
        }
        map.get(key)!.count++
      }
    }

    for (const entry of map.values()) {
      list.push(entry)
    }
    return list
  }, [calls])

  return (
    <div
      className={
        isDark
          ? 'h-full rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-sm'
          : 'h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'
      }
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div
            className={
              'flex items-center gap-2 text-xs font-medium uppercase tracking-wide ' +
              (isDark ? 'text-slate-200' : 'text-slate-500')
            }
          >
            <Truck
              className={
                'h-4 w-4 ' +
                (isDark ? 'text-emerald-400' : 'text-emerald-500')
              }
            />
            Network Heatmap
          </div>
          <div
            className={
              'text-xs ' + (isDark ? 'text-slate-400' : 'text-slate-500')
            }
          >
            Click a node to filter calls by origin/destination.
          </div>
        </div>
        <div
          className={
            'flex flex-col items-end gap-1 text-[11px] ' +
            (isDark ? 'text-slate-300' : 'text-slate-500')
          }
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Origin
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
              Destination
            </span>
          </div>
          {selectedLocation && (
            <button
              onClick={() => onSelectLocation(null)}
              className={
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] ' +
                (isDark
                  ? 'border-slate-600 bg-slate-800 text-slate-200 hover:border-emerald-400 hover:text-emerald-300'
                  : 'border-slate-300 bg-slate-50 text-slate-600 hover:border-emerald-400 hover:text-emerald-600')
              }
            >
              <X className="h-3 w-3" />
              Clear filter
            </button>
          )}
        </div>
      </div>

      <div
        className={
          'h-[260px] overflow-hidden rounded-xl border md:h-[360px] lg:h-[420px] ' +
          (isDark
            ? 'border-slate-800 bg-slate-900'
            : 'border-slate-200 bg-slate-50')
        }
      >
        <ComposableMap
          projection="geoAlbersUsa"
          style={{ width: '100%', height: '100%' }}
        >
        <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isDark ? '#020617' : '#e5e7eb'}
                  stroke={isDark ? '#1f2937' : '#cbd5f5'}
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>
          {points.map((p) => {
            const isSelected =
              selectedLocation && p.label === selectedLocation
            const isHovered = hoveredPointId === p.id
            return (
              <Marker
                key={p.id}
                coordinates={[p.lon, p.lat]}
                onClick={() => onSelectLocation(p.label)}
                onMouseEnter={() => setHoveredPointId(p.id)}
                onMouseLeave={() => setHoveredPointId(null)}
              >
                <circle
                  r={isSelected ? 14 : 9 + Math.min(5, p.count / 2)}
                  fill={
                    p.type === 'origin'
                      ? '#22c55e'
                      : '#38bdf8'
                  }
                  stroke="#0f172a"
                  strokeWidth={1.5}
                  style={{ cursor: 'pointer' }}
                />
                {isHovered && (
                  <g transform="translate(0, -20)">
                    <rect
                      x={-50}
                      y={-20}
                      rx={6}
                      ry={6}
                      width={100}
                      height={24}
                      fill={isDark ? '#020617' : '#f9fafb'}
                      stroke={isDark ? '#1f2937' : '#d1d5db'}
                      strokeWidth={0.5}
                    />
                    <text
                      textAnchor="middle"
                      y={-5}
                      fontSize={12}
                      fill={isDark ? '#e5e7eb' : '#111827'}
                    >
                      {p.label}
                    </text>
                  </g>
                )}
              </Marker>
            )
          })}
        </ComposableMap>
      </div>
    </div>
  )
}

interface CallsViewProps {
  calls: Call[]
  viewMode: ViewMode
  page: number
  rowsPerPage: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rows: number) => void
  onSelectCall: (call: Call) => void
  onViewModeChange: (mode: ViewMode) => void
  isDark: boolean
}

function CallsView({
  calls,
  viewMode,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onSelectCall,
  onViewModeChange,
  isDark,
}: CallsViewProps) {
  const totalPages = Math.max(1, Math.ceil(calls.length / rowsPerPage))
  const clampedPage = Math.min(page, totalPages - 1)
  const start = clampedPage * rowsPerPage
  const pageData = calls.slice(start, start + rowsPerPage)

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 0 || nextPage >= totalPages) return
    onPageChange(nextPage)
  }

  return (
    <div
      className={
        'mt-6 rounded-2xl border ' +
        (isDark
          ? 'border-slate-800 bg-slate-900'
          : 'border-slate-200 bg-white')
      }
    >
      <div
        className={
          'flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 ' +
          (isDark
            ? 'border-slate-800'
            : 'border-slate-200')
        }
      >
        <div
          className={
            'flex items-center gap-2 text-xs font-medium uppercase tracking-wide ' +
            (isDark ? 'text-slate-200' : 'text-slate-600')
          }
        >
          <PhoneCall
            className={
              'h-4 w-4 ' +
              (isDark ? 'text-emerald-400' : 'text-emerald-500')
            }
          />
          AI Broker Calls
          <span
            className={
              'rounded-full px-2 py-0.5 text-[10px] ' +
              (isDark
                ? 'bg-slate-800 text-slate-200'
                : 'bg-slate-100 text-slate-600')
            }
          >
            {calls.length} total
          </span>
        </div>
        <div
          className={
            'flex items-center gap-2 text-xs ' +
            (isDark ? 'text-slate-400' : 'text-slate-500')
          }
        >
          <span className="hidden sm:inline">View</span>
          <button
            onClick={() => {
              onViewModeChange('grid')
              onPageChange(0)
            }}
            className={[
              'inline-flex items-center gap-1 rounded-full border px-2 py-1',
              viewMode === 'grid'
                ? isDark
                  ? 'border-emerald-400 bg-emerald-900/40 text-emerald-100'
                  : 'border-emerald-400 bg-emerald-50 text-emerald-700'
                : isDark
                  ? 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300',
            ].join(' ')}
          >
            <Grid3X3 className="h-3 w-3" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            onClick={() => {
              onViewModeChange('list')
              onPageChange(0)
            }}
            className={[
              'inline-flex items-center gap-1 rounded-full border px-2 py-1',
              viewMode === 'list'
                ? isDark
                  ? 'border-emerald-400 bg-emerald-900/40 text-emerald-100'
                  : 'border-emerald-400 bg-emerald-50 text-emerald-700'
                : isDark
                  ? 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300',
            ].join(' ')}
          >
            <Table className="h-3 w-3" />
            <span className="hidden sm:inline">Table</span>
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid gap-4 px-4 py-4 md:grid-cols-2 xl:grid-cols-3">
          {pageData.map((call) => {
            const delta = negotiationDeltaPercent(call)
            return (
              <button
                key={call.call_id}
                onClick={() => onSelectCall(call)}
                className={
                  'group flex flex-col items-stretch rounded-xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 ' +
                  (isDark
                    ? 'border-slate-700 bg-slate-900 hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-900/40'
                    : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-100')
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div
                      className={
                        'flex items-center gap-2 text-xs ' +
                        (isDark ? 'text-slate-400' : 'text-slate-500')
                      }
                    >
                      <span
                        className={
                          'font-mono text-[11px] ' +
                          (isDark
                            ? 'text-slate-500'
                            : 'text-slate-400')
                        }
                      >
                        #{call.call_id.toString().padStart(3, '0')}
                      </span>
                      {call.mc_number && (
                        <span
                          className={
                            'rounded-full px-2 py-0.5 text-[10px] ' +
                            (isDark
                              ? 'bg-slate-800 text-slate-100'
                              : 'bg-slate-100 text-slate-700')
                          }
                        >
                          MC {call.mc_number}
                        </span>
                      )}
                    </div>
                    <div
                      className={
                        'flex items-center gap-1 text-sm font-semibold ' +
                        (isDark ? 'text-slate-50' : 'text-slate-900')
                      }
                    >
                      <span>{call.origin ?? 'Unknown origin'}</span>
                      <ArrowRightLeft
                        className={
                          'h-3 w-3 ' +
                          (isDark
                            ? 'text-slate-500'
                            : 'text-slate-400')
                        }
                      />
                      <span>{call.destination ?? 'Unknown destination'}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${
                          call.outcome === 'successful'
                            ? isDark
                              ? 'bg-emerald-900/40 text-emerald-100 border border-emerald-500/60'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isDark
                              ? 'bg-rose-900/40 text-rose-100 border border-rose-500/60'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {call.outcome === 'successful'
                          ? 'Successful'
                          : 'Unsuccessful'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div
                      className={[
                        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize',
                        sentimentColor(call.sentiment),
                      ].join(' ')}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {call.sentiment}
                    </div>
                  </div>
                </div>

                <div
                  className={
                    'mt-3 grid grid-cols-3 gap-2 text-xs ' +
                    (isDark ? 'text-slate-200' : 'text-slate-600')
                  }
                >
                  <div
                    className={
                      'rounded-lg px-3 py-2 ' +
                      (isDark ? 'bg-slate-800' : 'bg-slate-50')
                    }
                  >
                    <div
                      className={
                        'text-[10px] uppercase tracking-wide ' +
                        (isDark
                          ? 'text-slate-400'
                          : 'text-slate-400')
                      }
                    >
                      Agreed
                    </div>
                    <div
                      className={
                        'font-semibold ' +
                        (isDark
                          ? 'text-slate-50'
                          : 'text-slate-900')
                      }
                    >
                      {formatCurrency(call.agreed_rate)}
                    </div>
                  </div>
                  <div
                    className={
                      'rounded-lg px-3 py-2 ' +
                      (isDark ? 'bg-slate-800' : 'bg-slate-50')
                    }
                  >
                    <div
                      className={
                        'text-[10px] uppercase tracking-wide ' +
                        (isDark
                          ? 'text-slate-400'
                          : 'text-slate-400')
                      }
                    >
                      Loadboard
                    </div>
                    <div
                      className={
                        'font-semibold ' +
                        (isDark
                          ? 'text-slate-50'
                          : 'text-slate-900')
                      }
                    >
                      {formatCurrency(call.loadboard_rate ?? null)}
                    </div>
                  </div>
                  <div
                    className={
                      'rounded-lg px-3 py-2 ' +
                      (isDark ? 'bg-slate-800' : 'bg-slate-50')
                    }
                  >
                    <div
                      className={
                        'text-[10px] uppercase tracking-wide ' +
                        (isDark
                          ? 'text-slate-400'
                          : 'text-slate-400')
                      }
                    >
                      Uplift
                    </div>
                    <div
                      className={
                        'font-semibold ' +
                        (isDark
                          ? 'text-emerald-400'
                          : 'text-emerald-600')
                      }
                    >
                      {formatPercent(delta, 1)}
                    </div>
                  </div>
                </div>

                <div
                  className={
                    'mt-3 flex items-center justify-between text-[11px] ' +
                    (isDark
                      ? 'text-slate-400'
                      : 'text-slate-500')
                  }
                >
                  <span>{call.call_datetime}</span>
                  <span className="flex items-center gap-1">
                    <Truck
                      className={
                        'h-3 w-3 ' +
                        (isDark
                          ? 'text-emerald-400'
                          : 'text-emerald-500')
                      }
                    />
                    {call.miles
                      ? `${call.miles.toLocaleString()} mi`
                      : '–'}
                  </span>
                </div>
              </button>
            )
          })}
          {pageData.length === 0 && (
            <div className="col-span-full flex h-40 items-center justify-center text-sm text-slate-400">
              No calls for the current filters.
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table
            className={
              'min-w-full divide-y text-sm ' +
              (isDark
                ? 'divide-slate-800'
                : 'divide-slate-200')
            }
          >
            <thead
              className={isDark ? 'bg-slate-900' : 'bg-slate-50'}
            >
              <tr>
                <th
                  className={
                    'px-4 py-2 text-left text-xs font-medium uppercase tracking-wide ' +
                    (isDark
                      ? 'text-slate-300'
                      : 'text-slate-500')
                  }
                >
                  Call
                </th>
                <th
                  className={
                    'px-4 py-2 text-left text-xs font-medium uppercase tracking-wide ' +
                    (isDark
                      ? 'text-slate-300'
                      : 'text-slate-500')
                  }
                >
                  Customer
                </th>
                <th
                  className={
                    'px-4 py-2 text-left text-xs font-medium uppercase tracking-wide ' +
                    (isDark
                      ? 'text-slate-300'
                      : 'text-slate-500')
                  }
                >
                  Route
                </th>
                <th
                  className={
                    'px-4 py-2 text-right text-xs font-medium uppercase tracking-wide ' +
                    (isDark
                      ? 'text-slate-300'
                      : 'text-slate-500')
                  }
                >
                  Agreed
                </th>
                <th
                  className={
                    'px-4 py-2 text-right text-xs font-medium uppercase tracking-wide ' +
                    (isDark
                      ? 'text-slate-300'
                      : 'text-slate-500')
                  }
                >
                  Loadboard
                </th>
                <th
                  className={
                    'px-4 py-2 text-right text-xs font-medium uppercase tracking-wide ' +
                    (isDark
                      ? 'text-slate-300'
                      : 'text-slate-500')
                  }
                >
                  Uplift
                </th>
                <th
                  className={
                    'px-4 py-2 text-right text-xs font-medium uppercase tracking-wide ' +
                    (isDark
                      ? 'text-slate-300'
                      : 'text-slate-500')
                  }
                >
                  Miles
                </th>
              </tr>
            </thead>
            <tbody
              className={
                'divide-y ' +
                (isDark
                  ? 'divide-slate-800 bg-slate-900'
                  : 'divide-slate-100 bg-white')
              }
            >
              {pageData.map((call) => {
                const delta = negotiationDeltaPercent(call)
                return (
                  <tr
                    key={call.call_id}
                    onClick={() => onSelectCall(call)}
                    className={
                      'cursor-pointer ' +
                      (isDark
                        ? 'hover:bg-slate-800/60'
                        : 'hover:bg-slate-50')
                    }
                  >
                    <td
                      className={
                        'whitespace-nowrap px-4 py-2 text-xs ' +
                        (isDark
                          ? 'text-slate-200'
                          : 'text-slate-700')
                      }
                    >
                      <div
                        className={
                          'font-mono text-[11px] ' +
                          (isDark
                            ? 'text-slate-400'
                            : 'text-slate-500')
                        }
                      >
                        #{call.call_id.toString().padStart(3, '0')}
                      </div>
                      <div
                        className={
                          'text-[11px] ' +
                          (isDark
                            ? 'text-slate-500'
                            : 'text-slate-400')
                        }
                      >
                        {call.call_datetime}
                      </div>
                    </td>
                    <td
                      className={
                        'whitespace-nowrap px-4 py-2 text-xs ' +
                        (isDark
                          ? 'text-slate-200'
                          : 'text-slate-700')
                      }
                    >
                      {call.mc_number ?? '—'}
                      <div
                        className={[
                          'mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize',
                          sentimentColor(call.sentiment),
                        ].join(' ')}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {call.sentiment}
                      </div>
                    </td>
                    <td
                      className={
                        'whitespace-nowrap px-4 py-2 text-xs ' +
                        (isDark
                          ? 'text-slate-200'
                          : 'text-slate-700')
                      }
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <span>{call.origin ?? '—'}</span>
                          <ArrowRightLeft className="h-3 w-3 text-slate-500" />
                          <span>{call.destination ?? '—'}</span>
                        </div>
                        <span
                          className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            call.outcome === 'successful'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {call.outcome === 'successful'
                            ? 'Successful'
                            : 'Unsuccessful'}
                        </span>
                      </div>
                    </td>
                    <td
                      className={
                        'whitespace-nowrap px-4 py-2 text-right text-xs ' +
                        (isDark
                          ? 'text-slate-200'
                          : 'text-slate-700')
                      }
                    >
                      {formatCurrency(call.agreed_rate)}
                    </td>
                    <td
                      className={
                        'whitespace-nowrap px-4 py-2 text-right text-xs ' +
                        (isDark
                          ? 'text-slate-200'
                          : 'text-slate-700')
                      }
                    >
                      {formatCurrency(call.loadboard_rate ?? null)}
                    </td>
                    <td
                      className={
                        'whitespace-nowrap px-4 py-2 text-right text-xs font-semibold ' +
                        (isDark
                          ? 'text-emerald-400'
                          : 'text-emerald-600')
                      }
                    >
                      {formatPercent(delta, 1)}
                    </td>
                    <td
                      className={
                        'whitespace-nowrap px-4 py-2 text-right text-xs ' +
                        (isDark
                          ? 'text-slate-200'
                          : 'text-slate-700')
                      }
                    >
                      {call.miles
                        ? `${call.miles.toLocaleString()} mi`
                        : '—'}
                    </td>
                  </tr>
                )
              })}
              {pageData.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className={
                      'px-4 py-6 text-center text-sm ' +
                      (isDark
                        ? 'text-slate-400'
                        : 'text-slate-500')
                    }
                  >
                    No calls for the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div
        className={
          'flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-xs ' +
          (isDark
            ? 'border-slate-800 bg-slate-900 text-slate-300'
            : 'border-slate-200 bg-slate-50 text-slate-600')
        }
      >
        <div className="flex items-center gap-2">
          <span>
            Showing{' '}
            <span
              className={
                'font-medium ' +
                (isDark
                  ? 'text-slate-50'
                  : 'text-slate-900')
              }
            >
              {pageData.length === 0 ? 0 : start + 1}-
              {start + pageData.length}
            </span>{' '}
            of{' '}
            <span
              className={
                'font-medium ' +
                (isDark
                  ? 'text-slate-50'
                  : 'text-slate-900')
              }
            >
              {calls.length}
            </span>{' '}
            calls
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span>Rows per page</span>
            <select
              className={
                'rounded-md border px-2 py-1 text-xs ' +
                (isDark
                  ? 'border-slate-700 bg-slate-900 text-slate-100'
                  : 'border-slate-300 bg-white text-slate-800')
              }
              value={rowsPerPage}
              onChange={(e) =>
                onRowsPerPageChange(Number(e.target.value))
              }
            >
              {[6, 9, 15, 21].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(clampedPage - 1)}
              disabled={clampedPage === 0}
              className={
                'inline-flex h-7 w-7 items-center justify-center rounded-md border text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 ' +
                (isDark
                  ? 'border-slate-700 bg-slate-900 text-slate-200'
                  : 'border-slate-300 bg-white text-slate-600')
              }
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <span
              className={
                'mx-1 text-xs ' +
                (isDark
                  ? 'text-slate-300'
                  : 'text-slate-600')
              }
            >
              Page{' '}
              <span
                className={
                  'font-semibold ' +
                  (isDark
                    ? 'text-slate-50'
                    : 'text-slate-900')
                  }
              >
                {clampedPage + 1}
              </span>{' '}
              of{' '}
              <span
                className={
                  'font-semibold ' +
                  (isDark
                    ? 'text-slate-50'
                    : 'text-slate-900')
                }
              >
                {totalPages}
              </span>
            </span>
            <button
              onClick={() => handlePageChange(clampedPage + 1)}
              disabled={clampedPage >= totalPages - 1}
              className={
                'inline-flex h-7 w-7 items-center justify-center rounded-md border disabled:cursor-not-allowed disabled:opacity-40 ' +
                (isDark
                  ? 'border-slate-700 bg-slate-900 text-slate-200'
                  : 'border-slate-300 bg-white text-slate-600')
              }
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [calls, setCalls] = useState<Call[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [theme, setTheme] = useState<Theme>('light')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(6)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(
    null,
  )
  const [selectedCall, setSelectedCall] = useState<Call | null>(null)
  const [negotiationBucketFilter, setNegotiationBucketFilter] =
    useState<NegotiationBucketKey | 'all'>('all')
  const [customerFilter, setCustomerFilter] = useState<string | 'all'>(
    'all',
  )

  useEffect(() => {
    async function loadCalls() {
      setIsLoading(true)
      setError(null)
      try {
        const token =
          window.__BEARER_TOKEN__ ?? 'YOUR_BEARER_TOKEN_HERE'

        const res = await fetch('/api/v1/calls', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error(
            `API error ${res.status}: ${res.statusText}`,
          )
        }

        const data: CallsApiResponse = await res.json()
        setCalls(data.calls ?? [])
      } catch (err) {
        console.error('Error loading calls from API', err)
        setError('No se pudo cargar el API de llamadas.')
        setCalls([])
      } finally {
        setIsLoading(false)
      }
    }

    loadCalls()
  }, [])

  const filteredCalls = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return calls.filter((call) => {
      if (selectedLocation) {
        const matchLocation =
          call.origin === selectedLocation ||
          call.destination === selectedLocation
        if (!matchLocation) return false
      }

      if (negotiationBucketFilter !== 'all') {
        const key = getNegotiationBucketKey(
          negotiationDeltaPercent(call),
        )
        if (key !== negotiationBucketFilter) return false
      }

      if (customerFilter !== 'all') {
        if (!call.mc_number || call.mc_number !== customerFilter) {
          return false
        }
      }

      if (!term) return true

      // Special handling for outcome keywords so that
      // "successful" does not also match "unsuccessful"
      if (term === 'successful') {
        return call.outcome.toLowerCase() === 'successful'
      }
      if (term === 'unsuccessful') {
        return call.outcome.toLowerCase() === 'unsuccessful'
      }

      const haystack = [
        call.mc_number,
        call.origin,
        call.destination,
        call.outcome,
        call.sentiment,
        call.call_datetime,
        `${call.call_id}`,
        `${call.load_id}`,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(term)
    })
  }, [calls, searchTerm, selectedLocation, negotiationBucketFilter, customerFilter])

  const globalSatisfaction = useMemo(() => {
    if (calls.length === 0) return 0
    const sum = calls.reduce(
      (acc, c) => acc + sentimentScore(c.sentiment),
      0,
    )
    return sum / calls.length
  }, [calls])

  const globalSatisfactionColor =
    globalSatisfaction >= 8
      ? 'text-emerald-600'
      : globalSatisfaction >= 5
        ? 'text-sky-600'
        : 'text-rose-600'

  const negotiationBuckets = useMemo(
    () => computeNegotiationBuckets(calls),
    [calls],
  )

  const totalNegotiationCount = negotiationBuckets.reduce(
    (sum, b) => sum + b.count,
    0,
  )

  const topCustomers = useMemo(
    () => computeTopCustomers(calls).slice(0, 3),
    [calls],
  )

  const isDark = theme === 'dark'

  return (
    <div
      className={
        isDark
          ? 'flex min-h-screen bg-slate-950 text-slate-100'
          : 'flex min-h-screen bg-slate-50 text-slate-900'
      }
    >
      {/* Sidebar */}
      <aside
        className={
          isDark
            ? 'hidden w-64 flex-shrink-0 flex-col border-r border-slate-800 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 px-4 py-5 md:flex'
            : 'hidden w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-gradient-to-b from-white via-slate-50 to-slate-100 px-4 py-5 md:flex'
        }
      >
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 ring-1 ring-emerald-300">
            <Truck className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              ACMELogistics
            </div>
            <div className="text-sm font-semibold text-slate-900">
              AI Freight Brokerage
            </div>
          </div>
        </div>

        <nav className="mt-6 space-y-1 text-sm">
          <button
            className={
              isDark
                ? 'flex w-full items-center gap-2 rounded-lg bg-emerald-900/40 px-3 py-2 text-emerald-200 ring-1 ring-emerald-500/50'
                : 'flex w-full items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700 ring-1 ring-emerald-200'
            }
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Brokerage Overview</span>
          </button>
        </nav>

        <div
          className={
            isDark
              ? 'mt-auto space-y-3 px-2 text-xs text-slate-400'
              : 'mt-auto space-y-3 px-2 text-xs text-slate-500'
          }
        >
          <div
            className={
              isDark
                ? 'rounded-xl border border-emerald-500/40 bg-emerald-900/40 px-3 py-3'
                : 'rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3'
            }
          >
            <div
              className={
                isDark
                  ? 'text-[10px] font-medium uppercase tracking-wide text-emerald-300'
                  : 'text-[10px] font-medium uppercase tracking-wide text-emerald-700'
              }
            >
              AI Broker Network
            </div>
            <div
              className={
                isDark
                  ? 'mt-1 text-xs text-slate-200'
                  : 'mt-1 text-xs text-slate-700'
              }
            >
              Optimizing lanes, rates, and service levels in real-time.
            </div>
          </div>
          <div className="text-[10px] text-slate-500">
            v1.0 • Internal Preview
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* Top bar */}
        <header
          className={
            isDark
              ? 'border-b border-slate-800 bg-slate-950/80 px-4 py-3 backdrop-blur'
              : 'border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur'
          }
        >
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div className="flex items-center gap-2 md:hidden">
              <button
                className={
                  isDark
                    ? 'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-200'
                    : 'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700'
                }
              >
                <LayoutDashboard className="h-4 w-4" />
              </button>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                  ACMELogistics
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  AI Freight Brokerage
                </div>
              </div>
            </div>

            <div className="relative flex-1 max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search by MC, city, sentiment, outcome…"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(0)
                }}
                className={
                  isDark
                    ? 'h-9 w-full rounded-xl border border-slate-700 bg-slate-900 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 outline-none ring-emerald-500/40 focus:border-emerald-500 focus:ring-1'
                    : 'h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none ring-emerald-300 focus:border-emerald-400 focus:ring-1'
                }
              />
            </div>

            <div className="flex items-center gap-4">
              {/* Theme toggle */}
              <button
                type="button"
                onClick={() =>
                  setTheme((prev) =>
                    prev === 'light' ? 'dark' : 'light',
                  )
                }
                className={
                  isDark
                    ? 'flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100'
                    : 'flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700'
                }
              >
                <span className="relative inline-flex h-5 w-9 items-center rounded-full bg-slate-200">
                  <span
                    className={
                      'absolute h-4 w-4 rounded-full bg-white shadow transition-transform ' +
                      (isDark ? 'translate-x-4' : 'translate-x-1')
                    }
                  />
                </span>
                <span className="flex items-center gap-1">
                  <Sun
                    className={
                      'h-3 w-3 ' +
                      (isDark ? 'text-slate-500' : 'text-amber-400')
                    }
                  />
                  <Moon
                    className={
                      'h-3 w-3 ' +
                      (isDark ? 'text-sky-300' : 'text-slate-400')
                    }
                  />
                </span>
              </button>

              <div className="hidden sm:flex flex-col items-end">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Global Satisfaction
                  <span className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                    <span
                      className="block h-full rounded-full bg-gradient-to-r from-rose-400 via-sky-400 to-emerald-500"
                      style={{
                        width: `${(globalSatisfaction / 10) * 100}%`,
                      }}
                    />
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span
                    className={[
                      'text-2xl font-semibold tabular-nums',
                      globalSatisfactionColor,
                    ].join(' ')}
                  >
                    {globalSatisfaction.toFixed(1)}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-slate-400">
                    / 10
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard body */}
        <main
          className={
            isDark
              ? 'flex-1 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 px-4 pb-6 pt-4'
              : 'flex-1 bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 px-4 pb-6 pt-4'
          }
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-4">
            {/* Summary row */}
            <section className="grid gap-4 md:grid-cols-12">
              <div className="md:col-span-8">
                <CallsMap
                  calls={filteredCalls}
                  selectedLocation={selectedLocation}
                  onSelectLocation={(loc) => {
                    setSelectedLocation(loc)
                    setPage(0)
                  }}
                  isDark={isDark}
                />
              </div>

              <div className="md:col-span-4">
                <div
                  className={
                    isDark
                      ? 'rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-sm'
                      : 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div
                        className={
                          'flex items-center gap-2 text-xs font-medium uppercase tracking-wide ' +
                          (isDark ? 'text-slate-200' : 'text-slate-500')
                        }
                      >
                        <ArrowRightLeft
                          className={
                            'h-4 w-4 ' +
                            (isDark
                              ? 'text-indigo-400'
                              : 'text-indigo-500')
                          }
                        />
                        Negotiation Distribution
                      </div>
                      <div
                        className={
                          'text-xs ' +
                          (isDark ? 'text-slate-400' : 'text-slate-500')
                        }
                      >
                        Uplift vs loadboard benchmark by call.
                      </div>
                    </div>
                    {negotiationBucketFilter !== 'all' && (
                      <button
                        onClick={() => setNegotiationBucketFilter('all')}
                        className={
                          'rounded-full px-2.5 py-0.5 text-[11px] ' +
                          (isDark
                            ? 'border border-slate-700 bg-slate-900 text-slate-100 hover:border-emerald-400 hover:text-emerald-300'
                            : 'border border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-400 hover:text-emerald-600')
                        }
                      >
                        Clear uplift filter
                      </button>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-4">
                    <svg
                      width={160}
                      height={160}
                      viewBox="0 0 160 160"
                      className="shrink-0"
                    >
                      {totalNegotiationCount === 0 ? (
                        <circle
                          cx={80}
                          cy={80}
                          r={70}
                          fill={isDark ? '#020617' : '#f3f4f6'}
                          stroke={isDark ? '#1f2937' : '#e5e7eb'}
                          strokeWidth={1}
                        />
                      ) : (() => {
                        const colors = [
                          '#22c55e',
                          '#10b981',
                          '#0ea5e9',
                          '#6366f1',
                          '#8b5cf6',
                        ] as const
                        let currentAngle = -Math.PI / 2

                        return negotiationBuckets.map((bucket, index) => {
                          if (bucket.count === 0) return null

                          const sliceAngle =
                            (bucket.count / totalNegotiationCount) *
                            Math.PI *
                            2
                          const startAngle = currentAngle
                          const endAngle = currentAngle + sliceAngle
                          currentAngle = endAngle

                          const color =
                            colors[index % colors.length]
                          const largeArcFlag =
                            sliceAngle > Math.PI ? 1 : 0

                          const radiusOuter = 70
                          const radiusInner = 38
                          const center = 80

                          const x1Outer =
                            center +
                            radiusOuter * Math.cos(startAngle)
                          const y1Outer =
                            center +
                            radiusOuter * Math.sin(startAngle)
                          const x2Outer =
                            center +
                            radiusOuter * Math.cos(endAngle)
                          const y2Outer =
                            center +
                            radiusOuter * Math.sin(endAngle)

                          const x1Inner =
                            center +
                            radiusInner * Math.cos(endAngle)
                          const y1Inner =
                            center +
                            radiusInner * Math.sin(endAngle)
                          const x2Inner =
                            center +
                            radiusInner * Math.cos(startAngle)
                          const y2Inner =
                            center +
                            radiusInner * Math.sin(startAngle)

                          const d = [
                            `M ${x1Outer} ${y1Outer}`,
                            `A ${radiusOuter} ${radiusOuter} 0 ${largeArcFlag} 1 ${x2Outer} ${y2Outer}`,
                            `L ${x1Inner} ${y1Inner}`,
                            `A ${radiusInner} ${radiusInner} 0 ${largeArcFlag} 0 ${x2Inner} ${y2Inner}`,
                            'Z',
                          ].join(' ')

                          const isActive =
                            negotiationBucketFilter === bucket.key

                          return (
                            <path
                              key={bucket.key}
                              d={d}
                              fill={color}
                              fillOpacity={isActive ? 0.95 : 0.75}
                              stroke={
                                isActive
                                  ? isDark
                                    ? '#0b1120'
                                    : '#111827'
                                  : isDark
                                    ? '#020617'
                                    : '#ffffff'
                              }
                              strokeWidth={isActive ? 2 : 1}
                              style={{ cursor: 'pointer' }}
                              onClick={() =>
                                setNegotiationBucketFilter(
                                  negotiationBucketFilter === bucket.key
                                    ? 'all'
                                    : bucket.key,
                                )
                              }
                            />
                          )
                        })
                      })()}
                    </svg>

                    <div className="flex-1 space-y-2 text-xs">
                      {negotiationBuckets.map((bucket, index) => {
                        const colors = [
                          '#22c55e',
                          '#10b981',
                          '#0ea5e9',
                          '#6366f1',
                          '#8b5cf6',
                        ] as const
                        const color =
                          colors[index % colors.length]
                        const isActive =
                          negotiationBucketFilter === bucket.key
                        return (
                          <button
                            key={bucket.key}
                            onClick={() =>
                              setNegotiationBucketFilter(
                                negotiationBucketFilter === bucket.key
                                  ? 'all'
                                  : bucket.key,
                              )
                            }
                            className={[
                              'flex w-full items-center justify-between rounded-lg border px-2.5 py-1.5 text-left transition',
                              isActive
                                ? isDark
                                  ? 'border-emerald-400 bg-emerald-900/40 text-emerald-100'
                                  : 'border-emerald-400 bg-emerald-50/80 text-emerald-900'
                                : isDark
                                  ? 'border-slate-700 bg-slate-900 text-slate-100 hover:border-emerald-400 hover:bg-emerald-900/40'
                                  : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/70',
                            ].join(' ')}
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                              <span className="text-[11px] font-medium">
                                {bucket.label}
                              </span>
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {bucket.count} calls
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div
                    className={
                      'mt-4 border-t pt-3 ' +
                      (isDark ? 'border-slate-700' : 'border-slate-100')
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className={
                          'text-[11px] font-medium uppercase tracking-wide ' +
                          (isDark ? 'text-slate-200' : 'text-slate-500')
                        }
                      >
                        Top Customers
                      </div>
                      {customerFilter !== 'all' && (
                        <button
                          onClick={() => setCustomerFilter('all')}
                          className={
                            'text-[11px] hover:underline ' +
                            (isDark
                              ? 'text-emerald-300'
                              : 'text-emerald-700')
                          }
                        >
                          Clear customer filter
                        </button>
                      )}
                    </div>
                    <div className="mt-2 space-y-1">
                      {topCustomers.map((c) => {
                        const isActive = customerFilter === c.mc_number
                        return (
                          <button
                            key={c.mc_number}
                            onClick={() =>
                              setCustomerFilter(
                                isActive ? 'all' : c.mc_number,
                              )
                            }
                            className={[
                              'flex w-full items-center justify-between rounded-lg border px-2.5 py-1.5 text-left text-[11px]',
                              isActive
                                ? isDark
                                  ? 'border-indigo-400 bg-indigo-900/40 text-indigo-100'
                                  : 'border-indigo-400 bg-indigo-50 text-indigo-900'
                                : isDark
                                  ? 'border-slate-700 bg-slate-900 text-slate-100 hover:border-indigo-400 hover:bg-indigo-900/40'
                                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/70',
                            ].join(' ')}
                          >
                            <span className="flex items-center gap-2">
                              <span className="font-mono text-xs">
                                {c.mc_number}
                              </span>
                              <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] text-slate-500">
                                {c.callCount} calls
                              </span>
                            </span>
                            <span
                              className={
                                'text-[10px] ' +
                                (isDark
                                  ? 'text-slate-300'
                                  : 'text-slate-500')
                              }
                            >
                              {formatCurrency(c.totalAgreedRate)}
                            </span>
        </button>
                        )
                      })}
                      {topCustomers.length === 0 && (
                        <div
                          className={
                            'text-[11px] ' +
                            (isDark ? 'text-slate-500' : 'text-slate-400')
                          }
                        >
                          No customers yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Calls view */}
            <section>
              <CallsView
                calls={filteredCalls}
                viewMode={viewMode}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(p) => setPage(p)}
                onRowsPerPageChange={(rows) => {
                  setRowsPerPage(rows)
                  setPage(0)
                }}
                onSelectCall={(call) => setSelectedCall(call)}
                onViewModeChange={(mode) => {
                  setViewMode(mode)
                  setPage(0)
                }}
                isDark={isDark}
              />
            </section>
          </div>

          {isLoading && (
            <div className="pointer-events-none fixed inset-x-0 top-16 z-30 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/80 px-4 py-1.5 text-xs text-slate-300 shadow-lg shadow-emerald-500/10">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Syncing latest calls from AI brokers…
              </div>
            </div>
          )}

          {error && (
            <div className="fixed bottom-4 right-4 z-30 max-w-sm rounded-xl border border-amber-500/60 bg-amber-500/10 px-4 py-3 text-xs text-amber-100 shadow-lg">
              {error}
            </div>
          )}
        </main>
      </div>

      <CallDetailModal
        call={selectedCall}
        open={!!selectedCall}
        onClose={() => setSelectedCall(null)}
        isDark={isDark}
      />
    </div>
  )
}

export default App
