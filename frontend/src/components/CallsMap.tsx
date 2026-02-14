import { useMemo, useState } from 'react'
import { Truck, MapPin, X } from 'lucide-react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import type { Call } from '../types'
import { GEO_URL, CITY_COORDS } from '../lib/constants'

export interface CallsMapProps {
  calls: Call[]
  selectedLocation: string | null
  onSelectLocation: (location: string | null) => void
  isDark: boolean
}

export function CallsMap({
  calls,
  selectedLocation,
  onSelectLocation,
  isDark,
}: CallsMapProps) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null)

  const { points, adjacency } = useMemo(() => {
    const list: {
      id: string
      type: 'origin' | 'destination'
      label: string
      lat: number
      lon: number
      count: number
    }[] = []
    const adjacency = new Map<string, Set<string>>()
    const keyFn = (loc: string, type: 'origin' | 'destination') => `${type}:${loc}`
    const map = new Map<string, (typeof list)[number]>()

    for (const call of calls) {
      const origin = call.origin
      const destination = call.destination
      if (origin && CITY_COORDS[origin]) {
        const key = keyFn(origin, 'origin')
        if (!map.has(key)) {
          const { lat, lon } = CITY_COORDS[origin]
          map.set(key, { id: key, type: 'origin', label: origin, lat, lon, count: 0 })
        }
        map.get(key)!.count++
      }
      if (destination && CITY_COORDS[destination]) {
        const key = keyFn(destination, 'destination')
        if (!map.has(key)) {
          const { lat, lon } = CITY_COORDS[destination]
          map.set(key, { id: key, type: 'destination', label: destination, lat, lon, count: 0 })
        }
        map.get(key)!.count++
      }
      if (origin && destination && CITY_COORDS[origin] && CITY_COORDS[destination]) {
        if (!adjacency.has(origin)) adjacency.set(origin, new Set())
        if (!adjacency.has(destination)) adjacency.set(destination, new Set())
        adjacency.get(origin)!.add(destination)
        adjacency.get(destination)!.add(origin)
      }
    }
    for (const entry of map.values()) list.push(entry)
    return { points: list, adjacency }
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
            <Truck className={'h-4 w-4 ' + (isDark ? 'text-emerald-400' : 'text-emerald-500')} />
            Network Heatmap
          </div>
          <div className={'text-xs ' + (isDark ? 'text-slate-400' : 'text-slate-500')}>
            Click a node to filter calls by origin/destination.
          </div>
        </div>
        <div
          className={
            'flex flex-col items-end gap-1 text-[11px] ' + (isDark ? 'text-slate-300' : 'text-slate-500')
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
          'relative h-[260px] overflow-hidden rounded-xl border md:h-[360px] lg:h-[420px] ' +
          (isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50')
        }
      >
        <ComposableMap projection="geoAlbersUsa" style={{ width: '100%', height: '100%' }}>
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: { rsmKey: string }[] }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isDark ? '#020617' : '#e5e7eb'}
                  stroke={isDark ? '#1f2937' : '#cbd5f5'}
                  strokeWidth={0.5}
                  style={{ default: { outline: 'none' }, hover: { outline: 'none' }, pressed: { outline: 'none' } }}
                />
              ))
            }
          </Geographies>
          {points.map((p) => {
            const isSelected = selectedLocation && p.label === selectedLocation
            const isHovered = hoveredCity === p.label
            const connectedCities = hoveredCity && adjacency.get(hoveredCity)
            const isConnected = !!connectedCities && connectedCities.has(p.label)
            const isDimmed = hoveredCity && !isHovered && !isConnected
            const baseRadius = 9 + Math.min(5, p.count / 2)
            let radius = baseRadius
            if (isSelected) radius = Math.max(radius, 14)
            if (isConnected) radius = Math.max(radius, 14)
            if (isHovered) radius = Math.max(radius, 18)
            return (
              <Marker
                key={p.id}
                coordinates={[p.lon, p.lat]}
                onClick={() => onSelectLocation(p.label)}
                onMouseEnter={() => setHoveredCity(p.label)}
                onMouseLeave={() => setHoveredCity(null)}
              >
                <circle
                  r={radius}
                  fill={p.type === 'origin' ? '#22c55e' : '#38bdf8'}
                  stroke={isHovered || isConnected ? '#facc15' : '#0f172a'}
                  strokeWidth={isHovered || isConnected ? 2 : 1.5}
                  style={{
                    cursor: 'pointer',
                    opacity: isDimmed ? 0.25 : 1,
                    transition: 'opacity 150ms ease, r 150ms ease, stroke-width 150ms ease',
                  }}
                />
                {isHovered && (
                  <g transform="translate(0, -28)">
                    <rect
                      x={-120}
                      y={-28}
                      rx={8}
                      ry={8}
                      width={240}
                      height={36}
                      fill={isDark ? '#0f172a' : '#ffffff'}
                      stroke={isDark ? '#334155' : '#e2e8f0'}
                      strokeWidth={0.5}
                    />
                    <g transform="translate(-108, -22) scale(0.7)">
                      <MapPin stroke={isDark ? '#94a3b8' : '#64748b'} strokeWidth={2} size={24} />
                    </g>
                    <text
                      textAnchor="start"
                      x={-88}
                      y={-7}
                      fontSize={15}
                      fontWeight={600}
                      fill={isDark ? '#f1f5f9' : '#0f172a'}
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
