import api from "./api"

const CartService = {
  getCart: async () => {
    const response = await api.get("/cart")
    return response.data
  },

  addItem: async (productId, quantity) => {
    const response = await api.post("/cart/items", { product_id: productId, quantity })
    return response.data
  },

  updateItem: async (itemId, quantity) => {
    const response = await api.put(`/cart/items/${itemId}`, { quantity })
    return response.data
  },

  removeItem: async (itemId) => {
    const response = await api.delete(`/cart/items/${itemId}`)
    return response.data
  },

  clearCart: async () => {
    const response = await api.delete("/cart")
    return response.data
  },
}

export default CartService

