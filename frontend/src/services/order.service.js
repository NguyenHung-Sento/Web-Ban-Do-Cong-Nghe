import api from "./api"

const OrderService = {
  getAllOrders: async () => {
    const response = await api.get("/orders")
    return response.data
  },

  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`)
    return response.data
  },

  createOrder: async (orderData) => {
    const response = await api.post("/orders", orderData)
    return response.data
  },

  // Add this new method to delete an order
  deleteOrder: async (id) => {
    const response = await api.delete(`/orders/${id}`)
    return response.data
  },
}

export default OrderService
