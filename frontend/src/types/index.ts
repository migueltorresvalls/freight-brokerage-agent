export type Sentiment = 'positive' | 'neutral' | 'negative'

export interface AuthState {
  token: string
  username: string
  email: string
}

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

export interface CallsApiResponse {
  calls: Call[]
}

export type ViewMode = 'grid' | 'list'
export type Theme = 'light' | 'dark'

export type NegotiationBucketKey = '0-5' | '5-10' | '10-15' | '15-20' | '20+'

export interface NegotiationBucket {
  key: NegotiationBucketKey
  label: string
  range: [number, number | null]
  count: number
}

export interface TopCustomer {
  mc_number: string
  callCount: number
  totalAgreedRate: number
}

export type AppView = 'dashboard'

declare global {
  interface Window {
    __BEARER_TOKEN__?: string
  }
}
