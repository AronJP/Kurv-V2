import { useState, useEffect } from 'react'

export type CartItem = {
  id: string
  productId: string | null
  productName: string
  storeName: string | null
  storeSlug: string | null
  storeColor: string | null
  price: number | null
  originalPrice: number | null
  savingsPerUnit: number | null
  quantity: number
  checked: boolean
  addedAt: string
}

/** Payload for adding a deal to cart (from DealModal). */
export type AddToCartPayload = {
  productId: string
  productName: string
  storeName: string
  storeSlug: string | null
  storeColor: string | null
  price: number
  originalPrice: number | null
  savingsPerUnit: number | null
  quantity: number
}

const STORAGE_KEY = 'kurvfo_cart'

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CartItem[]
        const migrated = parsed.map((item) => ({
          ...item,
          originalPrice: item.originalPrice ?? null,
          savingsPerUnit: item.savingsPerUnit ?? null,
        }))
        setItems(migrated)
      } catch (e) {
        console.error('Failed to parse cart:', e)
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !isLoaded) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, isLoaded])

  const addItem = (item: Omit<CartItem, 'id' | 'addedAt' | 'checked'>) => {
    const newItem: CartItem = {
      ...item,
      id: crypto.randomUUID(),
      addedAt: new Date().toISOString(),
      checked: false,
    }
    setItems((prev) => [...prev, newItem])
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const toggleChecked = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    )
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((item) => item.id !== id))
      return
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    )
  }

  const clearCart = () => setItems([])
  const clearChecked = () => setItems((prev) => prev.filter((item) => !item.checked))

  return {
    items,
    isLoaded,
    addItem,
    removeItem,
    toggleChecked,
    updateQuantity,
    clearCart,
    clearChecked,
  }
}
