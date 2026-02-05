'use client'

import { useCallback, useState } from 'react'
import type { CartItem } from '@/hooks/useCart'

function IconTrash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function EmptyCartIcon() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="mx-auto mb-4 text-gray-300"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}

type KurvPageProps = {
  items: CartItem[]
  isLoaded: boolean
  addItem: (item: Omit<CartItem, 'id' | 'addedAt' | 'checked'>) => void
  removeItem: (id: string) => void
  toggleChecked: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  clearChecked: () => void
}

export default function KurvPage({
  items,
  isLoaded,
  addItem,
  removeItem,
  toggleChecked,
  updateQuantity,
  clearCart,
  clearChecked,
}: KurvPageProps) {
  const [customInput, setCustomInput] = useState('')

  const unchecked = items.filter((i) => !i.checked)
  const checked = items.filter((i) => i.checked)
  const totalKr = items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0)
  const hasItemsWithoutPrice = items.some((i) => i.price == null)

  const handleAddCustom = useCallback(() => {
    const name = customInput.trim()
    if (!name) return
    setCustomInput('')
    addItem({
      productId: null,
      productName: name,
      storeName: null,
      storeSlug: null,
      storeColor: null,
      price: null,
      originalPrice: null,
      savingsPerUnit: null,
      quantity: 1,
    })
  }, [addItem, customInput])

  const handleClearCart = useCallback(() => {
    if (typeof window === 'undefined') return
    if (window.confirm('Ert tú vísur at tú vilt reinsa alt úr kurvinum?')) {
      clearCart()
    }
  }, [clearCart])

  const markAllPurchased = useCallback(() => {
    unchecked.forEach((i) => toggleChecked(i.id))
  }, [unchecked, toggleChecked])

  if (!isLoaded) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8">
        <p className="text-gray-500">Hentar kurv...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
        <h1 className="text-xl font-bold text-gray-900">Kurv</h1>
        <div className="mt-12 flex flex-col items-center justify-center text-center">
          <EmptyCartIcon />
          <p className="text-base font-medium text-gray-600">Kurvin er tómur</p>
          <p className="mt-1 text-sm text-gray-500">Legg tilboð í kurvin frá forsíðuni</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-32 pt-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Kurv <span className="font-normal text-gray-500">({items.length} vørur)</span>
          </h1>
        </div>
        <button
          type="button"
          onClick={handleClearCart}
          className="text-sm font-medium text-gray-500 underline hover:text-gray-700"
        >
          Reinsa
        </button>
      </div>

      {/* Add custom item */}
      <div className="mb-4 flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5">
          <input
            type="text"
            placeholder="Legg afturat..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
            className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-gray-400"
            aria-label="Legg afturat vøru"
          />
        </div>
        <button
          type="button"
          onClick={handleAddCustom}
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          aria-label="Legg til"
        >
          <IconPlus />
        </button>
      </div>

      {/* Cart items: unchecked first */}
      <ul className="space-y-2">
        {unchecked.map((item) => (
          <CartRow
            key={item.id}
            item={item}
            onToggleChecked={() => toggleChecked(item.id)}
            onUpdateQuantity={(q) => updateQuantity(item.id, q)}
            onRemove={() => removeItem(item.id)}
          />
        ))}
      </ul>

      {/* Keypt section */}
      {checked.length > 0 && (
        <div className="mt-6 border-t border-gray-100 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">Keypt</h2>
            <button
              type="button"
              onClick={clearChecked}
              className="text-xs font-medium text-gray-500 underline hover:text-gray-700"
            >
              Strika keypt
            </button>
          </div>
          <ul className="space-y-2">
            {checked.map((item) => (
              <CartRow
                key={item.id}
                item={item}
                onToggleChecked={() => toggleChecked(item.id)}
                onUpdateQuantity={(q) => updateQuantity(item.id, q)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </ul>
        </div>
      )}

      {/* Summary sticky */}
      <div
        className="fixed bottom-16 left-0 right-0 z-40 border-t border-gray-200 bg-white px-4 py-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="font-medium text-gray-900">
                Tilsamans: {hasItemsWithoutPrice && items.some((i) => i.price != null) ? '~' : ''}
                {totalKr > 0 ? `${totalKr.toFixed(2)} kr` : '? kr'}
              </p>
              {hasItemsWithoutPrice && (
                <p className="mt-0.5 text-xs text-gray-500">Summar vørur hava ongan prís</p>
              )}
            </div>
            {unchecked.length > 0 && (
              <button
                type="button"
                onClick={markAllPurchased}
                className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white"
              >
                Keypt!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function CartRow({
  item,
  onToggleChecked,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem
  onToggleChecked: () => void
  onUpdateQuantity: (q: number) => void
  onRemove: () => void
}) {
  const subtotal = item.price != null ? Number((item.price * item.quantity).toFixed(2)) : null
  return (
    <li className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
      <button
        type="button"
        onClick={onToggleChecked}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
          item.checked ? 'border-teal-600 bg-teal-600 text-white' : 'border-gray-300'
        }`}
        aria-label={item.checked ? 'Ómerkt' : 'Merkt sum keypt'}
      >
        {item.checked && (
          <span style={{ fontSize: 10 }}>✓</span>
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={
            item.checked
              ? 'text-sm text-gray-400 line-through'
              : 'text-sm font-medium text-gray-900'
          }
        >
          {item.productName}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          {item.storeName ? (
            <span
              className="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
              style={{ backgroundColor: item.storeColor || '#6b7280' }}
            >
              {item.storeName}
            </span>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          )}
          <span className="text-xs text-gray-500">
            {subtotal != null ? `${subtotal.toFixed(2)} kr` : '? kr'}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onUpdateQuantity(item.quantity - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          aria-label="Minka"
        >
          –
        </button>
        <span className="min-w-[1.5rem] text-center text-sm font-medium">{item.quantity}</span>
        <button
          type="button"
          onClick={() => onUpdateQuantity(item.quantity + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          aria-label="Øk"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 p-1 text-gray-400 hover:text-red-600"
        aria-label="Tak burtur"
      >
        <IconTrash />
      </button>
    </li>
  )
}
