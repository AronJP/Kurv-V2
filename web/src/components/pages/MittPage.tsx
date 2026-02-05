'use client'

import { useMemo, useState } from 'react'
import type { CartItem } from '@/hooks/useCart'

const COMING_SOON = 'Kemur skjótt!'

function getDeviceId(): string {
  if (typeof window === 'undefined') return '--------'
  let id = localStorage.getItem('kurvfo_device_id')
  if (!id) {
    id = crypto.randomUUID?.() ?? `dev-${Date.now()}`
    localStorage.setItem('kurvfo_device_id', id)
  }
  return id.slice(0, 8)
}

type MittPageProps = {
  cartItems: CartItem[]
  dealCount: number
}

export default function MittPage({ cartItems, dealCount }: MittPageProps) {
  const [showAboutModal, setShowAboutModal] = useState(false)

  const savings = useMemo(() => {
    return cartItems
      .filter((item) => item.checked && item.savingsPerUnit != null)
      .reduce((sum, item) => sum + (item.savingsPerUnit ?? 0) * item.quantity, 0)
  }, [cartItems])

  const inCartCount = cartItems.filter((i) => !i.checked).length
  const purchasedCount = cartItems.filter((i) => i.checked).length

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-4">
      {/* Profile header (guest) */}
      <div className="mb-6 flex flex-col items-center rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-400"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h2 className="mt-3 text-lg font-bold text-gray-900">Gestur</h2>
        <p className="mt-1 text-center text-sm text-gray-500">
          Skráset þeg inn fyri at goyma títt
        </p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => window.alert(COMING_SOON)}
            className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white"
          >
            Stovna kontu
          </button>
          <button
            type="button"
            onClick={() => window.alert(COMING_SOON)}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700"
          >
            Logga inn
          </button>
        </div>
      </div>

      {/* Savings summary */}
      <div className="mb-6 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden>💰</span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-gray-500">Sparnaður hesa vikuna</h3>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {savings.toFixed(2)} kr
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              Grundað á vørum í kurvinum
            </p>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-gray-50 py-4 text-center">
          <p className="text-xl font-bold text-gray-900">{inCartCount}</p>
          <p className="mt-0.5 text-xs text-gray-500">Í kurvi</p>
        </div>
        <div className="rounded-xl bg-gray-50 py-4 text-center">
          <p className="text-xl font-bold text-gray-900">{purchasedCount}</p>
          <p className="mt-0.5 text-xs text-gray-500">Keypt</p>
        </div>
        <div className="rounded-xl bg-gray-50 py-4 text-center">
          <p className="text-xl font-bold text-gray-900">{dealCount}</p>
          <p className="mt-0.5 text-xs text-gray-500">Tilboð</p>
        </div>
      </div>

      {/* Innstillingar */}
      <div className="mb-6 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <h3 className="border-b border-gray-100 px-4 py-3 text-sm font-medium text-gray-500">
          Innstillingar
        </h3>
        <button
          type="button"
          onClick={() => {}}
          className="flex w-full items-center justify-between border-b border-gray-100 px-4 py-3 text-left text-sm"
        >
          <span className="text-gray-900">Mál</span>
          <span className="text-gray-500">Føroyskt</span>
        </button>
        <button
          type="button"
          onClick={() => window.alert(COMING_SOON)}
          className="flex w-full items-center justify-between border-b border-gray-100 px-4 py-3 text-left text-sm"
        >
          <span className="text-gray-900">Fráboðanir</span>
          <span className="text-gray-500">Av</span>
        </button>
        <button
          type="button"
          onClick={() => setShowAboutModal(true)}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm"
        >
          <span className="text-gray-900">Um kurv.fo</span>
          <span className="text-gray-400">→</span>
        </button>
      </div>

      {/* Kurv Pro */}
      <div className="mb-6 rounded-xl border-l-4 border-teal-500 border-gray-100 bg-teal-50/50 p-4 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900">✨ Kurv Pro</h3>
        <p className="mt-0.5 text-sm text-gray-600">Fá meira úr kurv.fo</p>
        <ul className="mt-3 space-y-1.5 text-sm text-gray-700">
          <li>• Prísvarslur — fá boð tá ið vørur fara á tilboð</li>
          <li>• Betri príshistorikk — síggj trendir yvir tíð</li>
          <li>• Besta handil — vit rokna út hvar tú sparir mest</li>
          <li>• Ongin lýsing</li>
        </ul>
        <p className="mt-3 text-sm font-medium text-gray-900">29 kr/mán</p>
        <button
          type="button"
          onClick={() => window.alert(COMING_SOON)}
          className="mt-3 w-full rounded-xl bg-teal-600 py-2.5 text-sm font-medium text-white"
        >
          Royn ókeypis
        </button>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 pt-4 text-center">
        <p className="text-xs text-gray-500">
          Kurv.fo er ikki ábyrgdarberar fyri villfør í prísum
        </p>
        <p className="mt-2 font-mono text-xs text-gray-400">{getDeviceId()}</p>
        <p className="mt-0.5 text-xs text-gray-400">v2.0.0</p>
      </div>

      {/* About modal */}
      {showAboutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowAboutModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Um kurv.fo"
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900">kurv.fo — Finn bestu tilboðini í Føroyum</h3>
            <p className="mt-2 text-sm text-gray-600">Samsett av Sparfrí</p>
            <p className="mt-1 text-sm text-gray-500">Útgáva 2.0.0</p>
            <button
              type="button"
              onClick={() => setShowAboutModal(false)}
              className="mt-4 w-full rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-gray-700"
            >
              Lat aftur
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
