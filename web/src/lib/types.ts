// ---- Stores ----
export type Store = {
  id: string
  name: string
  slug: string
  source: string | null
  source_id: string | null
  logo_url: string | null
  color: string | null
  website_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// ---- Products ----
export type Product = {
  id: string
  name: string
  normalized_name: string
  store_id: string | null
  category: string | null
  subcategory: string | null
  description: string | null
  unit: string | null
  weight_grams: number | null
  volume_ml: number | null
  image_url: string | null
  is_generic: boolean
  first_seen_at: string
  last_seen_at: string
  times_on_sale: number
  created_at: string
  updated_at: string
}

// ---- Deals ----
export type Deal = {
  id: string
  product_id: string
  price: number
  original_price: number | null
  discount_percent: number | null
  savings: number | null
  unit_price: number | null
  valid_from: string
  valid_to: string
  source: string | null
  flyer_section_url: string | null
  flyer_page_url: string | null
  image_url: string | null
  is_active: boolean
  is_sponsored: boolean
  sponsor_priority: number
  created_at: string
}

// ---- Active Deals View (joined) ----
export type ActiveDeal = {
  deal_id: string
  price: number
  original_price: number | null
  discount_percent: number | null
  savings: number | null
  unit_price: number | null
  valid_from: string
  valid_to: string
  source: string | null
  flyer_section_url: string | null
  flyer_page_url: string | null
  deal_image_url: string | null
  is_sponsored: boolean
  sponsor_priority: number
  deal_created_at: string
  product_id: string
  product_name: string
  normalized_name: string
  category: string | null
  subcategory: string | null
  product_description: string | null
  unit: string | null
  weight_grams: number | null
  volume_ml: number | null
  product_image_url: string | null
  times_on_sale: number
  is_generic: boolean
  store_id: string
  store_name: string
  store_slug: string
  store_logo: string | null
  store_color: string | null
  display_image_url: string | null
}

// ---- Profiles ----
export type Profile = {
  id: string
  display_name: string | null
  email: string | null
  language: string
  is_premium: boolean
  subscription_tier: 'free' | 'pro' | 'family'
  subscription_started_at: string | null
  subscription_expires_at: string | null
  preferred_stores: string[] | null
  savings_goal: number | null
  total_savings: number
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

// ---- Cart Items ----
export type CartItem = {
  id: string
  user_id: string
  product_id: string | null
  custom_name: string | null
  quantity: number
  price_when_added: number | null
  checked: boolean
  created_at: string
}

// ---- Watchlist Items ----
export type WatchlistItem = {
  id: string
  user_id: string
  product_id: string
  notify: boolean
  created_at: string
}

// ---- Sessions ----
export type Session = {
  id: string
  device_id: string
  user_id: string | null
  device_type: string | null
  browser: string | null
  os: string | null
  referral_source: string | null
  screen_width: number | null
  started_at: string
  ended_at: string | null
  duration_seconds: number | null
  is_bounce: boolean
  created_at: string
}

// ---- Events ----
export type AnalyticsEvent = {
  id: string
  session_id: string | null
  device_id: string
  user_id: string | null
  event_type: string
  event_data: Record<string, unknown>
  page: string | null
  device_type: string | null
  created_at: string
}

// ---- Constants ----
export const CATEGORIES = [
  'Kjøt', 'Fiskur', 'Mjólk', 'Frost', 'Breyð',
  'Drykkur', 'Snakk', 'Grønmeti', 'Annað'
] as const

export type Category = typeof CATEGORIES[number]
