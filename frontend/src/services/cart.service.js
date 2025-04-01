import api from "./api"

const CartService = {
  getCart: async () => {
    const response = await api.get("/cart")
    return response.data
  },

  // Cập nhật phương thức addItem để hỗ trợ các tùy chọn sản phẩm và giá biến thể
  addItem: async (cartData) => {
    const response = await api.post("/cart/items", cartData)
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

