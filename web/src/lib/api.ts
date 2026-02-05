import { supabase } from './supabase'
import type { ActiveDeal, Deal, Store } from './types'

export async function fetchActiveDeals(): Promise<ActiveDeal[]> {
  const { data, error } = await supabase
    .from('active_deals')
    .select('*')
    .order('discount_percent', { ascending: false })

  if (error) {
    console.error('Error fetching deals:', error)
    return []
  }
  return data || []
}

export async function fetchStores(): Promise<Store[]> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching stores:', error)
    return []
  }
  return data || []
}

export async function fetchPriceHistory(productId: string): Promise<Pick<Deal, 'price' | 'original_price' | 'discount_percent' | 'valid_from' | 'valid_to'>[]> {
  const { data, error } = await supabase
    .from('deals')
    .select('price, original_price, discount_percent, valid_from, valid_to')
    .eq('product_id', productId)
    .order('valid_from', { ascending: false })
    .limit(12)

  if (error) {
    console.error('Error fetching price history:', error)
    return []
  }
  return data || []
}
