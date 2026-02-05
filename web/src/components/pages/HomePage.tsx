'use client'

import { useMemo, useState } from 'react'
import type { ActiveDeal, Store } from '@/lib/types'
import type { CartItem } from '@/hooks/useCart'
import type { AddToCartPayload } from '@/hooks/useCart'
import DealModal from '@/components/DealModal'

type HomePageProps = {
  deals: ActiveDeal[]
  stores: Store[]
  loading: boolean
  cartItems: CartItem[]
  addToCart: (payload: AddToCartPayload) => void
}

const PAGE_SIZE = 20
const SORT_OPTIONS = [
  { id: 'discount', label: 'Mest afslátur' },
  { id: 'savings', label: 'Mest sparnaður' },
  { id: 'price', label: 'Lægst prísur' },
] as const

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 shrink-0">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function ClearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function EmptyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300 mx-auto mb-3">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

export default function HomePage({ deals, stores, loading, cartItems, addToCart }: HomePageProps) {
  const [search, setSearch] = useState('')
  const [selectedStoreIds, setSelectedStoreIds] = useState<Set<string>>(new Set()) // empty = All
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set()) // empty = All
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]['id']>('discount')
  const [shownCount, setShownCount] = useState(PAGE_SIZE)
  const [selectedDeal, setSelectedDeal] = useState<ActiveDeal | null>(null)

  const storeCounts = useMemo(() => {
    const m = new Map<string, number>()
    deals.forEach((d) => m.set(d.store_id, (m.get(d.store_id) ?? 0) + 1))
    return m
  }, [deals])

  const categoryCounts = useMemo(() => {
    const m = new Map<string, number>()
    deals.forEach((d) => {
      const cat = d.category?.trim()
      if (cat) m.set(cat, (m.get(cat) ?? 0) + 1)
    })
    return m
  }, [deals])

  const categories = useMemo(() => {
    return Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name]) => name)
  }, [categoryCounts])

  const filteredAndSorted = useMemo(() => {
    let list = deals

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((d) => d.product_name.toLowerCase().includes(q))
    }
    if (selectedStoreIds.size > 0) {
      list = list.filter((d) => selectedStoreIds.has(d.store_id))
    }
    if (selectedCategories.size > 0) {
      list = list.filter((d) => d.category && selectedCategories.has(d.category.trim()))
    }

    const arr = [...list]
    if (sort === 'discount') {
      arr.sort((a, b) => (b.discount_percent ?? 0) - (a.discount_percent ?? 0))
    } else if (sort === 'savings') {
      arr.sort((a, b) => (b.savings ?? 0) - (a.savings ?? 0))
    } else {
      arr.sort((a, b) => a.price - b.price)
    }
    return arr
  }, [deals, search, selectedStoreIds, selectedCategories, sort])

  const displayed = filteredAndSorted.slice(0, shownCount)
  const hasMore = shownCount < filteredAndSorted.length

  const toggleStore = (id: string) => {
    setSelectedStoreIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAllStores = () => setSelectedStoreIds(new Set())

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const selectAllCategories = () => setSelectedCategories(new Set())

  const discountBadgeColor = (pct: number | null) => {
    if (pct == null) return 'bg-gray-100 text-gray-600'
    if (pct > 30) return 'bg-teal-100 text-teal-700'
    if (pct >= 20) return 'bg-amber-100 text-amber-700'
    return 'bg-gray-100 text-gray-600'
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8">
        <p className="text-gray-500">Hentar tilboð...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-6">
      {/* Header — compact single line */}
      <header className="pt-4 pb-3">
        <h1 className="text-lg font-bold text-gray-900">
          kurv.fo <span className="font-normal text-gray-400">·</span>{' '}
          <span className="font-normal text-gray-500">Finn bestu tilboðini</span>
        </h1>
      </header>

      {/* Search */}
      <div className="relative mb-4">
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5">
          <SearchIcon />
          <input
            type="search"
            placeholder="Leita eftir vørum..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-gray-400"
            aria-label="Leita eftir vørum"
          />
          {search.length > 0 && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="shrink-0 p-1 text-gray-400 hover:text-gray-600"
              aria-label="Tøm leiti"
            >
              <ClearIcon />
            </button>
          )}
        </div>
      </div>

      {/* Store pills */}
      <div className="mb-3">
        <p className="mb-2 text-xs font-medium text-gray-500">Butikkir</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={selectAllStores}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${
              selectedStoreIds.size === 0
                ? 'border-teal-600 bg-teal-600 text-white'
                : 'border-gray-300 bg-white text-gray-700'
            }`}
          >
            Øll
          </button>
          {stores.map((s) => {
            const count = storeCounts.get(s.id) ?? 0
            const selected = selectedStoreIds.has(s.id)
            const raw = s.color || '#6b7280'
            const color = raw.startsWith('#') ? raw : `#${raw}`
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleStore(s.id)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${
                  selected ? 'border-transparent text-white' : ''
                }`}
                style={
                  selected
                    ? { backgroundColor: color, borderColor: color }
                    : { backgroundColor: `${color}26`, borderColor: `${color}66`, color }
                }
              >
                {s.name} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Category pills + sort on same row (sort always visible) */}
      <div className="mb-3">
        <div className="mb-2 flex items-center justify-between">
          {categories.length > 0 ? (
            <p className="text-xs font-medium text-gray-500">Bólkar</p>
          ) : (
            <span />
          )}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as (typeof SORT_OPTIONS)[number]['id'])}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-800"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={selectAllCategories}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${
                selectedCategories.size === 0
                  ? 'border-teal-600 bg-teal-600 text-white'
                  : 'border-gray-300 bg-white text-gray-700'
              }`}
            >
              Øll
            </button>
            {categories.map((cat) => {
              const selected = selectedCategories.has(cat)
              const count = categoryCounts.get(cat) ?? 0
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${
                    selected ? 'border-teal-600 bg-teal-600 text-white' : 'border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  {cat} ({count})
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Deal count + cards grid */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <EmptyIcon />
          <p className="text-sm font-medium text-gray-600">Eingin tilboð funnin</p>
        </div>
      ) : (
        <>
          <p className="mb-2 text-xs text-gray-500">{filteredAndSorted.length} tilboð</p>
          <div className="grid grid-cols-2 gap-3">
            {displayed.map((d) => (
              <button
                key={d.deal_id}
                type="button"
                onClick={() => setSelectedDeal(d)}
                className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white text-left shadow-sm"
              >
                <div className="h-28 w-full bg-gray-50 flex items-center justify-center rounded-t-xl shrink-0 overflow-hidden">
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

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setShownCount((c) => c + PAGE_SIZE)}
                className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm"
              >
                Vís fleiri
              </button>
            </div>
          )}
        </>
      )}

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
