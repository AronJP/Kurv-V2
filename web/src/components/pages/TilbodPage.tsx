'use client'

import { useMemo, useState } from 'react'
import type { ActiveDeal, Store } from '@/lib/types'
import type { CartItem } from '@/hooks/useCart'
import type { AddToCartPayload } from '@/hooks/useCart'
import DealModal from '@/components/DealModal'

function discountBadgeColor(pct: number | null): string {
  if (pct == null) return 'bg-gray-100 text-gray-600'
  if (pct > 30) return 'bg-teal-100 text-teal-700'
  if (pct >= 20) return 'bg-amber-100 text-amber-700'
  return 'bg-gray-100 text-gray-600'
}

type TilbodPageProps = {
  deals: ActiveDeal[]
  stores: Store[]
  loading: boolean
  cartItems: CartItem[]
  addToCart: (payload: AddToCartPayload) => void
}

export default function TilbodPage({ deals, stores, loading, cartItems, addToCart }: TilbodPageProps) {
  const [selectedStore, setSelectedStore] = useState<string | null>(null)
  const [selectedDeal, setSelectedDeal] = useState<ActiveDeal | null>(null)

  const dealsByStoreSlug = useMemo(() => {
    const m = new Map<string, ActiveDeal[]>()
    deals.forEach((d) => {
      const slug = d.store_slug
      if (!m.has(slug)) m.set(slug, [])
      m.get(slug)!.push(d)
    })
    m.forEach((arr) => arr.sort((a, b) => (b.discount_percent ?? 0) - (a.discount_percent ?? 0)))
    return m
  }, [deals])

  const storesWithCount = useMemo(() => {
    return [...stores]
      .map((s) => ({ store: s, count: dealsByStoreSlug.get(s.slug)?.length ?? 0 }))
      .sort((a, b) => b.count - a.count)
  }, [stores, dealsByStoreSlug])

  const totalDeals = deals.length
  const totalStores = storesWithCount.filter((s) => s.count > 0).length

  const selectedStoreData = selectedStore
    ? storesWithCount.find((s) => s.store.slug === selectedStore)
    : null
  const selectedStoreDeals = selectedStore ? dealsByStoreSlug.get(selectedStore) ?? [] : []
  const highlights = selectedStoreDeals.slice(0, 3)
  const allDealsSorted = [...selectedStoreDeals].sort(
    (a, b) => (b.discount_percent ?? 0) - (a.discount_percent ?? 0)
  )

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8">
        <p className="text-gray-500">Hentar tilboð...</p>
      </div>
    )
  }

  if (selectedStore && selectedStoreData) {
    const { store } = selectedStoreData
    const color = store.color?.startsWith('#') ? store.color : `#${store.color || '6b7280'}`

    return (
      <div className="mx-auto max-w-lg pb-24">
        {/* Back */}
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-gray-50 px-4 py-3">
          <button
            type="button"
            onClick={() => { setSelectedStore(null); setSelectedDeal(null) }}
            className="flex items-center gap-1 text-sm font-medium text-teal-600"
          >
            ← Tilboð
          </button>
        </div>

        {/* Store banner */}
        <div
          className="flex h-28 items-center gap-4 px-4 py-5"
          style={{ backgroundColor: color }}
        >
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20 text-xl font-bold text-white"
          >
            {store.name.trim() ? store.name[0].toUpperCase() : '?'}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-white">{store.name}</h1>
            <p className="text-sm text-white/80">{selectedStoreDeals.length} tilboð</p>
          </div>
        </div>

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="px-4 py-4">
            <h2 className="mb-3 text-sm font-medium text-gray-500">Highlights</h2>
            <div className="grid grid-cols-3 gap-2">
              {highlights.map((d) => (
                <button
                  key={d.deal_id}
                  type="button"
                  onClick={() => setSelectedDeal(d)}
                  className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white text-left shadow-sm"
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
                    <p className="line-clamp-1 text-xs font-bold text-gray-900">{d.product_name}</p>
                    <p className="text-sm font-bold text-gray-900">{d.price.toFixed(2)} kr</p>
                    {d.discount_percent != null && (
                      <span
                        className={`inline-block rounded px-1 py-0.5 text-[10px] font-medium ${discountBadgeColor(d.discount_percent)}`}
                      >
                        -{Math.round(d.discount_percent)}%
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Øll tilboð */}
        <div className="px-4 pb-6">
          <h2 className="mb-3 text-sm font-medium text-gray-500">Øll tilboð</h2>
          <div className="grid grid-cols-2 gap-3">
            {allDealsSorted.map((d) => (
              <button
                key={d.deal_id}
                type="button"
                onClick={() => setSelectedDeal(d)}
                className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white text-left shadow-sm"
              >
                <div className="h-28 w-full shrink-0 flex items-center justify-center bg-gray-50 rounded-t-xl overflow-hidden">
                  {(d.display_image_url || d.flyer_section_url || d.deal_image_url) ? (
                    <img
                      src={d.display_image_url || d.flyer_section_url || d.deal_image_url || ''}
                      alt={d.product_name}
                      className="w-full h-full object-contain bg-gray-50"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-2xl text-gray-400">
                      {d.product_name.trim() ? d.product_name[0].toUpperCase() : '?'}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-2.5">
                  <span
                    className="mb-0.5 inline-block w-fit rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
                    style={{ backgroundColor: d.store_color || '#6b7280' }}
                  >
                    {d.store_name}
                  </span>
                  <h3 className="line-clamp-2 text-sm font-bold leading-tight text-gray-900">
                    {d.product_name}
                  </h3>
                  <div className="mt-auto pt-1.5 space-y-0.5">
                    <p className="text-base font-bold text-gray-900">{d.price.toFixed(2)} kr</p>
                    {d.original_price != null && d.original_price > d.price && (
                      <p className="text-xs text-gray-500 line-through">{d.original_price.toFixed(2)} kr</p>
                    )}
                    {d.discount_percent != null && (
                      <span
                        className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${discountBadgeColor(d.discount_percent)}`}
                      >
                        -{Math.round(d.discount_percent)}%
                      </span>
                    )}
                    {d.savings != null && d.savings > 0 && (
                      <p className="text-xs text-gray-500">Spar {d.savings.toFixed(2)} kr</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <DealModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          allDeals={deals}
          onSelectDeal={(d) => setSelectedDeal(d)}
          cartItems={cartItems}
          addToCart={addToCart}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-4">
      {/* Header */}
      <header className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Tilboð hesa vikuna</h1>
        <p className="text-sm text-gray-500">
          {totalDeals} tilboð frá {totalStores} handlum
        </p>
      </header>

      {/* Store cards */}
      <ul className="space-y-4">
        {storesWithCount.map(({ store, count }) => {
          const color = store.color?.startsWith('#') ? store.color : `#${store.color || '6b7280'}`
          const storeDeals = dealsByStoreSlug.get(store.slug) ?? []
          const previewDeals = storeDeals.slice(0, 4)

          return (
            <li key={store.id}>
              <article className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setSelectedStore(store.slug)}
                  className="flex w-full items-center gap-4 p-4 text-left"
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {store.name.trim() ? store.name[0].toUpperCase() : '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-bold text-gray-900">{store.name}</h2>
                    <p className="text-sm text-gray-500">{count} tilboð</p>
                  </div>
                  <span className="shrink-0 text-gray-400" aria-hidden>
                    →
                  </span>
                </button>
                {previewDeals.length > 0 && (
                  <div className="overflow-x-auto scrollbar-hide border-t border-gray-100 px-4 py-3">
                    <div className="flex gap-3">
                      {previewDeals.map((d) => (
                        <button
                          key={d.deal_id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedStore(store.slug)
                            setSelectedDeal(d)
                          }}
                          className="flex w-36 shrink-0 flex-col overflow-hidden rounded-lg border border-gray-100 bg-gray-50 text-left"
                        >
                          <div className="flex h-16 w-full items-center justify-center bg-gray-50 overflow-hidden">
                            {(d.display_image_url || d.flyer_section_url || d.deal_image_url) ? (
                              <img
                                src={d.display_image_url || d.flyer_section_url || d.deal_image_url || ''}
                                alt={d.product_name}
                                className="w-full h-full object-contain bg-gray-50"
                                loading="lazy"
                              />
                            ) : (
                              <span className="text-lg text-gray-400">
                                {d.product_name.trim() ? d.product_name[0].toUpperCase() : '?'}
                              </span>
                            )}
                          </div>
                          <div className="p-2">
                            <p className="truncate text-xs font-medium text-gray-900">
                              {d.product_name}
                            </p>
                            <p className="text-sm font-bold text-gray-900">{d.price.toFixed(2)} kr</p>
                            {d.discount_percent != null && (
                              <span
                                className={`inline-block rounded px-1 py-0.5 text-[10px] font-medium ${discountBadgeColor(d.discount_percent)}`}
                              >
                                -{Math.round(d.discount_percent)}%
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            </li>
          )
        })}
      </ul>

      <DealModal
        deal={selectedDeal}
        onClose={() => setSelectedDeal(null)}
        allDeals={deals}
        onSelectDeal={(d) => setSelectedDeal(d)}
        cartItems={cartItems}
        addToCart={addToCart}
      />
    </div>
  )
}
