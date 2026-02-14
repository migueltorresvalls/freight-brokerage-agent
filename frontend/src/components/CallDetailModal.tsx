import {
  PhoneCall,
  Truck,
  Users,
  MapPin,
  ArrowRightLeft,
  X,
} from 'lucide-react'
import type { Call } from '../types'
import {
  sentimentColor,
  negotiationDeltaPercent,
  formatPercent,
  formatCurrency,
  computeTruckProgress,
} from '../lib/calls'

export interface CallDetailModalProps {
  call: Call | null
  open: boolean
  onClose: () => void
  isDark: boolean
}

export function CallDetailModal({
  call,
  open,
  onClose,
  isDark,
}: CallDetailModalProps) {
  if (!open || !call) return null

  const isSuccessful = call.outcome?.toLowerCase() === 'successful'
  const progress = isSuccessful ? computeTruckProgress(call) : 0

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
            <PhoneCall className={'h-5 w-5 ' + (isDark ? 'text-emerald-300' : 'text-emerald-600')} />
            <div className="text-sm">
              <div className={'text-xs uppercase tracking-wide ' + (isDark ? 'text-slate-300' : 'text-slate-500')}>
                Call ID
              </div>
              <div className={'font-semibold ' + (isDark ? 'text-slate-50' : 'text-slate-900')}>
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
            <Truck className={'h-5 w-5 ' + (isDark ? 'text-indigo-300' : 'text-indigo-600')} />
            <div className="text-sm">
              <div className={'text-xs uppercase tracking-wide ' + (isDark ? 'text-slate-300' : 'text-slate-500')}>
                Load
              </div>
              <div className={'font-semibold ' + (isDark ? 'text-slate-50' : 'text-slate-900')}>
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
              <Users className={'h-5 w-5 ' + (isDark ? 'text-sky-300' : 'text-sky-600')} />
              <div className="text-sm">
                <div className={'text-xs uppercase tracking-wide ' + (isDark ? 'text-slate-300' : 'text-slate-500')}>
                  MC Number
                </div>
                <div className={'font-semibold ' + (isDark ? 'text-slate-50' : 'text-slate-900')}>
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
          <div className={'flex items-center justify-between text-sm ' + (isDark ? 'text-slate-200' : 'text-slate-700')}>
            <div className="flex items-center gap-2">
              <MapPin className={'h-4 w-4 ' + (isDark ? 'text-emerald-300' : 'text-emerald-500')} />
              <span className={'font-medium ' + (isDark ? 'text-slate-50' : 'text-slate-900')}>
                {call.origin ?? 'Unknown origin'}
              </span>
            </div>
            {isSuccessful && (
              <div className={'flex items-center gap-2 text-xs uppercase tracking-wide ' + (isDark ? 'text-slate-400' : 'text-slate-500')}>
                <ArrowRightLeft className="h-4 w-4" />
                <span>Route Progress</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className={'h-4 w-4 ' + (isDark ? 'text-indigo-300' : 'text-indigo-500')} />
              <span className={'font-medium ' + (isDark ? 'text-slate-50' : 'text-slate-900')}>
                {call.destination ?? 'Unknown destination'}
              </span>
            </div>
          </div>

          {isSuccessful && (
            <div
              className={
                'relative mt-4 h-2 rounded-full ' + (isDark ? 'bg-slate-800' : 'bg-slate-200')
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
          )}

          <div
            className={
              'mt-3 flex flex-wrap items-center justify-between gap-3 text-xs ' +
              (isDark ? 'text-slate-300' : 'text-slate-700')
            }
          >
            <div className="flex items-center gap-4">
              <div className={'rounded-lg px-3 py-2 ' + (isDark ? 'bg-slate-800' : 'bg-slate-50')}>
                <div className={'text-[10px] uppercase tracking-wide ' + (isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Distance
                </div>
                <div className={'font-semibold ' + (isDark ? 'text-slate-50' : 'text-slate-900')}>
                  {call.miles ? `${call.miles.toLocaleString()} mi` : '–'}
                </div>
              </div>
              <div className={'rounded-lg px-3 py-2 ' + (isDark ? 'bg-slate-800' : 'bg-slate-50')}>
                <div className={'text-[10px] uppercase tracking-wide ' + (isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Weight
                </div>
                <div className={'font-semibold ' + (isDark ? 'text-slate-50' : 'text-slate-900')}>
                  {call.weight ? `${call.weight.toLocaleString()} lbs` : '–'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={'rounded-lg px-3 py-2 ' + (isDark ? 'bg-slate-800' : 'bg-slate-50')}>
                <div className={'text-[10px] uppercase tracking-wide ' + (isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Pickup
                </div>
                <div className={'font-mono text-xs ' + (isDark ? 'text-slate-200' : 'text-slate-700')}>
                  {call.pickup_datetime ?? '–'}
                </div>
              </div>
              <div className={'rounded-lg px-3 py-2 ' + (isDark ? 'bg-slate-800' : 'bg-slate-50')}>
                <div className={'text-[10px] uppercase tracking-wide ' + (isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Delivery
                </div>
                <div className={'font-mono text-xs ' + (isDark ? 'text-slate-200' : 'text-slate-700')}>
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
              (isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50')
            }
          >
            <div className={'text-xs font-medium uppercase tracking-wide ' + (isDark ? 'text-slate-300' : 'text-slate-500')}>
              Commercial Outcome
            </div>
            <div className={'flex items-center gap-2 text-sm capitalize ' + (isDark ? 'text-slate-100' : 'text-slate-800')}>
              {call.outcome}
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  call.outcome === 'successful'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {call.outcome === 'successful' ? 'Won booking' : 'Lost booking'}
              </span>
            </div>
            <div className={'mt-2 grid grid-cols-2 gap-2 text-xs ' + (isDark ? 'text-slate-200' : 'text-slate-700')}>
              <div className={'rounded-lg px-3 py-2 ' + (isDark ? 'bg-slate-800' : 'bg-white')}>
                <div className={'text-[10px] uppercase tracking-wide ' + (isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Agreed Rate
                </div>
                <div className={'font-semibold ' + (isDark ? 'text-slate-50' : 'text-slate-900')}>
                  {formatCurrency(call.agreed_rate)}
                </div>
              </div>
              <div className={'rounded-lg px-3 py-2 ' + (isDark ? 'bg-slate-800' : 'bg-white')}>
                <div className={'text-[10px] uppercase tracking-wide ' + (isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Loadboard Rate
                </div>
                <div className={'font-semibold ' + (isDark ? 'text-slate-50' : 'text-slate-900')}>
                  {formatCurrency(call.loadboard_rate ?? null)}
                </div>
              </div>
            </div>
          </div>

          <div
            className={
              'space-y-2 rounded-xl border p-4 ' +
              (isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50')
            }
          >
            <div className={'text-xs font-medium uppercase tracking-wide ' + (isDark ? 'text-slate-300' : 'text-slate-500')}>
              Negotiation Uplift
            </div>
            <div className="flex items-baseline gap-2">
              <div className={'text-2xl font-semibold ' + (isDark ? 'text-emerald-400' : 'text-emerald-600')}>
                {formatPercent(negotiationDeltaPercent(call), 1)}
              </div>
              <div className={'text-xs ' + (isDark ? 'text-slate-400' : 'text-slate-500')}>
                vs loadboard benchmark
              </div>
            </div>
            <div className={'mt-1 h-1.5 rounded-full ' + (isDark ? 'bg-slate-800' : 'bg-slate-200')}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500"
                style={{
                  width: `${Math.min(100, Math.max(0, (negotiationDeltaPercent(call) ?? 0) * 400)) || 0}%`,
                }}
              />
            </div>
          </div>

          <div
            className={
              'space-y-2 rounded-xl border p-4 text-xs ' +
              (isDark ? 'border-slate-700 bg-slate-900 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700')
            }
          >
            <div className={'text-xs font-medium uppercase tracking-wide ' + (isDark ? 'text-slate-300' : 'text-slate-500')}>
              Call Metadata
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div className={isDark ? 'text-slate-400' : 'text-slate-500'}>Call time</div>
              <div className={'font-mono text-xs ' + (isDark ? 'text-slate-200' : 'text-slate-700')}>
                {call.call_datetime}
              </div>
              <div className={isDark ? 'text-slate-400' : 'text-slate-500'}>Ingested</div>
              <div className={'font-mono text-xs ' + (isDark ? 'text-slate-200' : 'text-slate-700')}>
                {call.timestamp}
              </div>
              <div className={isDark ? 'text-slate-400' : 'text-slate-500'}>Call ID</div>
              <div className={'font-mono text-xs ' + (isDark ? 'text-slate-200' : 'text-slate-700')}>
                {call.call_id}
              </div>
              <div className={isDark ? 'text-slate-400' : 'text-slate-500'}>Load ID</div>
              <div className={'font-mono text-xs ' + (isDark ? 'text-slate-200' : 'text-slate-700')}>
                {call.load_id}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
