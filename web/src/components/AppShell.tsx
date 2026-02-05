'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useCart, type AddToCartPayload } from '@/hooks/useCart'
import { fetchActiveDeals, fetchStores } from '@/lib/api'
import type { ActiveDeal, Store } from '@/lib/types'
import HomePage from './pages/HomePage'
import KurvPage from './pages/KurvPage'
import TilbodPage from './pages/TilbodPage'
import MittPage from './pages/MittPage'

type TabId = 'home' | 'tilbod' | 'kurv' | 'mitt'

const TAB_ACCENT = '#0D9488' // teal-600

function IconHome({ active }: { active: boolean }) {
  const c = active ? TAB_ACCENT : '#9ca3af'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function IconTag({ active }: { active: boolean }) {
  const c = active ? TAB_ACCENT : '#9ca3af'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}

function IconCart({ active }: { active: boolean }) {
  const c = active ? TAB_ACCENT : '#9ca3af'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}

function IconUser({ active }: { active: boolean }) {
  const c = active ? TAB_ACCENT : '#9ca3af'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

const TABS: { id: TabId; label: string; Icon: (p: { active: boolean }) => React.ReactElement }[] = [
  { id: 'home', label: 'Heim', Icon: IconHome },
  { id: 'tilbod', label: 'Tilboð', Icon: IconTag },
  { id: 'kurv', label: 'Kurv', Icon: IconCart },
  { id: 'mitt', label: 'Mítt', Icon: IconUser },
]

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <p className="text-gray-500">{label}</p>
    </div>
  )
}

export default function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const [deals, setDeals] = useState<ActiveDeal[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const cart = useCart()

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [dealsData, storesData] = await Promise.all([
        fetchActiveDeals(),
        fetchStores(),
      ])
      if (!cancelled) {
        setDeals(dealsData)
        setStores(storesData)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const addToCart = useCallback(
    (payload: AddToCartPayload) => {
      const existing = cart.items.find(
        (i) => i.productId === payload.productId && !i.checked
      )
      if (existing) {
        cart.updateQuantity(existing.id, existing.quantity + 1)
      } else {
        cart.addItem(payload)
      }
    },
    [cart.items, cart.addItem, cart.updateQuantity]
  )

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Content area: scrollable, padding bottom for tab bar */}
      <main className="min-h-0 flex-1 overflow-auto pb-20">
        {activeTab === 'home' && (
          <HomePage
            deals={deals}
            stores={stores}
            loading={loading}
            cartItems={cart.items}
            addToCart={addToCart}
          />
        )}
        {activeTab === 'tilbod' && (
          <TilbodPage
            deals={deals}
            stores={stores}
            loading={loading}
            cartItems={cart.items}
            addToCart={addToCart}
          />
        )}
        {activeTab === 'kurv' && <KurvPage {...cart} />}
        {activeTab === 'mitt' && (
          <MittPage
            cartItems={cart.items}
            dealCount={deals.length}
          />
        )}
      </main>

      {/* Bottom nav: fixed, white, subtle top border */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white"
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
      >
        <div className="flex h-16 items-center justify-around">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className="flex flex-col items-center justify-center gap-0.5 px-4 py-2 text-xs transition-colors"
              aria-current={activeTab === id ? 'page' : undefined}
            >
              {id === 'kurv' ? (
                <span className="relative inline-block">
                  <Icon active={activeTab === id} />
                  {cart.items.length > 0 && (
                    <span
                      className="absolute -right-1 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white"
                      aria-hidden
                    >
                      {cart.items.length > 9 ? '9+' : cart.items.length}
                    </span>
                  )}
                </span>
              ) : (
                <Icon active={activeTab === id} />
              )}
              <span className={activeTab === id ? 'font-medium text-teal-600' : 'text-gray-400'}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
