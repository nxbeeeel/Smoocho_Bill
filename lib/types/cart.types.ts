export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  total: number
}

export interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  isEmpty: boolean
}
