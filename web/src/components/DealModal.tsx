'use client'

import { useEffect, useMemo, useState } from 'react'
import { fetchPriceHistory } from '@/lib/api'
import { formatDateFO, getWeekNumber } from '@/lib/utils'
import type { ActiveDeal } from '@/lib/types'
import type { CartItem, AddToCartPayload } from '@/hooks/useCart'

type PriceHistoryRow = {
  price: number
  original_price: number | null
  discount_percent: number | null
  valid_from: string
  valid_to: string
}

function IconClose() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function IconCart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}

function IconBell() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function IconShare() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}

function IconChart() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function getSimilarDeals(
  currentDeal: ActiveDeal,
  allDeals: ActiveDeal[],
  maxResults = 3
): ActiveDeal[] {
  const others = allDeals.filter((d) => d.deal_id !== currentDeal.deal_id)

  const currentWords = currentDeal.product_name
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length >= 3)

  if (currentWords.length === 0) return []

  const scored = others.map((d) => {
    const otherName = d.product_name.toLowerCase()
    let score = 0
    for (const word of currentWords) {
      if (otherName.includes(word)) {
        score += 1
      }
    }
    const matchRatio = score / currentWords.length
    return { deal: d, score, matchRatio }
  })

  return scored
    .filter((s) => s.score >= 1 && s.matchRatio >= 0.3)
    .sort((a, b) => b.matchRatio - a.matchRatio || b.score - a.score)
    .slice(0, maxResults)
    .map((s) => s.deal)
}

function discountBadgeColor(pct: number | null): string {
  if (pct == null) return 'bg-gray-100 text-gray-600'
  if (pct > 30) return 'bg-teal-100 text-teal-700'
  if (pct >= 20) return 'bg-amber-100 text-amber-700'
  return 'bg-gray-100 text-gray-600'
}

type Props = {
  deal: ActiveDeal | null
  onClose: () => void
  allDeals: ActiveDeal[]
  onSelectDeal?: (deal: ActiveDeal) => void
  cartItems: CartItem[]
  addToCart: (payload: AddToCartPayload) => void
}

export default function DealModal({ deal, onClose, allDeals, onSelectDeal, cartItems, addToCart }: Props) {
  const [priceHistory, setPriceHistory] = useState<PriceHistoryRow[]>([])
  const [cartFeedback, setCartFeedback] = useState<'added' | 'already' | null>(null)
  const [watching, setWatching] = useState(false)
  const [shareDone, setShareDone] = useState(false)

  useEffect(() => {
    if (!deal) return
    let cancelled = false
    fetchPriceHistory(deal.product_id).then((data) => {
      if (!cancelled) setPriceHistory(data)
    })
    return () => { cancelled = true }
  }, [deal?.product_id])

  const similarDeals = useMemo(
    () => (deal ? getSimilarDeals(deal, allDeals, 3) : []),
    [deal, allDeals]
  )

  if (!deal) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleCartClick = () => {
    const alreadyInCart = cartItems.some(
      (i) => i.productId === deal.product_id && !i.checked
    )
    if (alreadyInCart) {
      setCartFeedback('already')
    } else {
      addToCart({
        productId: deal.product_id,
        productName: deal.product_name,
        storeName: deal.store_name,
        storeSlug: deal.store_slug,
        storeColor: deal.store_color,
        price: deal.price,
        originalPrice: deal.original_price,
        savingsPerUnit: deal.savings,
        quantity: 1,
      })
      setCartFeedback('added')
    }
    setTimeout(() => setCartFeedback(null), 2000)
  }

  const handleShareClick = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: deal.product_name, url })
        setShareDone(true)
        setTimeout(() => setShareDone(false), 2000)
      } catch {
        await navigator.clipboard?.writeText(url)
        setShareDone(true)
        setTimeout(() => setShareDone(false), 2000)
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      setShareDone(true)
      setTimeout(() => setShareDone(false), 2000)
    }
  }

  const currentValidFrom = deal.valid_from

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 transition-opacity"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Tilboð detaljur"
    >
      <div
        className="w-full max-w-lg rounded-t-2xl bg-white shadow-xl"
        style={{ maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle + close */}
        <div className="relative flex shrink-0 justify-center border-b border-gray-100 py-3">
          <div className="h-1 w-10 rounded-full bg-gray-300" aria-hidden />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-3 p-1 text-gray-500 hover:text-gray-700"
            aria-label="Lat aftur"
          >
            <IconClose />
          </button>
        </div>

        <div className="overflow-y-auto px-5 pb-6" style={{ maxHeight: 'calc(85vh - 52px)' }}>
          {/* Image */}
          <div className="-mx-5 flex h-48 shrink-0 items-center justify-center bg-gray-50 overflow-hidden">
            {(deal.display_image_url || deal.flyer_section_url || deal.deal_image_url) ? (
              <img
                src={deal.display_image_url || deal.flyer_section_url || deal.deal_image_url || ''}
                alt={deal.product_name}
                className="w-full h-full object-contain bg-gray-50"
                loading="lazy"
              />
            ) : (
              <span className="text-5xl text-gray-400">
                {deal.product_name.trim() ? deal.product_name[0].toUpperCase() : '?'}
              </span>
            )}
          </div>

          {/* Store + name + category */}
          <div className="mt-4">
            <span
              className="inline-block rounded px-2 py-0.5 text-[10px] font-medium text-white"
              style={{ backgroundColor: deal.store_color || '#6b7280' }}
            >
              {deal.store_name}
            </span>
            <h2 className="mt-2 text-xl font-bold text-gray-900">{deal.product_name}</h2>
            {deal.category && (
              <span className="mt-1.5 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {deal.category}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="mt-4 border-b border-gray-100 pb-4">
            <p className="text-2xl font-bold text-gray-900">{deal.price.toFixed(2)} kr</p>
            {deal.original_price != null && deal.original_price > deal.price && (
              <p className="text-sm text-gray-500 line-through">{deal.original_price.toFixed(2)} kr</p>
            )}
            {deal.discount_percent != null && (
              <span
                className={`mt-1 inline-block rounded px-2 py-0.5 text-sm font-medium ${discountBadgeColor(deal.discount_percent)}`}
              >
                -{Math.round(deal.discount_percent)}%
              </span>
            )}
            {deal.savings != null && deal.savings > 0 && (
              <p className="mt-0.5 text-sm text-gray-500">Spar {deal.savings.toFixed(2)} kr</p>
            )}
            {deal.unit_price != null && deal.unit && (
              <p className="mt-0.5 text-sm text-gray-500">
                ({deal.unit_price.toFixed(2)} kr/{deal.unit})
              </p>
            )}
          </div>

          {/* Good deal indicator */}
          {deal.times_on_sale >= 3 && (
            <p className="mt-4 text-sm text-gray-500">🔄 Hetta tilboð kemur ofta</p>
          )}
          {deal.times_on_sale === 1 && (
            <p className="mt-4 text-sm text-teal-600">⭐ Fyrsta ferð á tilboði!</p>
          )}

          {/* Validity */}
          <p className="mt-3 text-xs text-gray-500">
            Galdandi: {formatDateFO(deal.valid_from)} – {formatDateFO(deal.valid_to)}
          </p>

          {/* Action buttons */}
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleCartClick}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-medium text-white"
            >
              {cartFeedback === 'added' ? (
                <>Løgd í kurv ✓</>
              ) : cartFeedback === 'already' ? (
                <>Longu í kurv</>
              ) : (
                <>
                  <IconCart />
                  Kurv
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setWatching(!watching)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium ${
                watching ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-700'
              }`}
            >
              <IconBell />
              {watching ? 'Fylgir ✓' : 'Fylg'}
            </button>
            <button
              type="button"
              onClick={handleShareClick}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700"
            >
              <IconShare />
              {shareDone ? 'Kopiera ✓' : 'Deil'}
            </button>
          </div>

          {/* Price history */}
          <div className="mt-6 border-b border-gray-100 pb-4">
            <h3 className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
              <IconChart />
              Príshistorikk
            </h3>
            {priceHistory.length > 1 ? (
              <ul className="mt-2 space-y-1.5">
                {priceHistory.map((row) => {
                  const isCurrent = row.valid_from === currentValidFrom
                  const week = getWeekNumber(row.valid_from)
                  return (
                    <li
                      key={row.valid_from}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                        isCurrent ? 'bg-teal-50 font-medium text-teal-800' : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span>Vika {week}</span>
                      <span className="flex items-center gap-2">
                        {row.price.toFixed(2)} kr
                        {row.discount_percent != null && (
                          <span className={`rounded px-1.5 py-0.5 text-xs ${discountBadgeColor(row.discount_percent)}`}>
                            (-{Math.round(row.discount_percent)}%)
                          </span>
                        )}
                      </span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-gray-500">Ikki nóg data enn</p>
            )}
          </div>

          {/* Similar deals */}
          {similarDeals.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Lík tilboð</h3>
              <div className="mt-2 flex gap-3 overflow-x-auto pb-1">
                {similarDeals.map((d) => (
                  <button
                    key={d.deal_id}
                    type="button"
                    onClick={() => onSelectDeal?.(d)}
                    className="flex w-32 shrink-0 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white text-left shadow-sm"
                  >
                    <div className="flex h-20 items-center justify-center bg-gray-50 overflow-hidden">
                      {(d.display_image_url || d.flyer_section_url || d.deal_image_url) ? (
                        <img
                          src={d.display_image_url || d.flyer_section_url || d.deal_image_url || ''}
                          alt={d.product_name}
                          className="w-full h-full object-contain bg-gray-50"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-xl text-gray-400">
                          {d.product_name.trim() ? d.product_name[0].toUpperCase() : '?'}
                        </span>
                      )}
                    </div>
                    <div className="p-2">
                      <span
                        className="inline-block rounded px-1 py-0.5 text-[10px] font-medium text-white"
                        style={{ backgroundColor: d.store_color || '#6b7280' }}
                      >
                        {d.store_name}
                      </span>
                      <p className="mt-0.5 line-clamp-2 text-xs font-medium text-gray-900">{d.product_name}</p>
                      <p className="mt-0.5 text-sm font-bold text-gray-900">{d.price.toFixed(2)} kr</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
