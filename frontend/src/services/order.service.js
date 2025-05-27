import api from "./api"

const OrderService = {
  createOrder: async (orderData) => {
    const response = await api.post("/orders", orderData)
    return response.data
  },
  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`)
    return response.data
  },
  updateOrder: async (orderId, orderData) => {
    const response = await api.put(`/orders/${orderId}`, orderData)
    return response.data
  },
  deleteOrder: async (orderId) => {
    const response = await api.delete(`/orders/${orderId}`)
    return response.data
  },
  getAllOrders: async () => {
    const response = await api.get("/orders")
    return response.data
  },
  getUserOrders: async () => {
    const response = await api.get("/orders/user")
    return response.data
  },
}

export default OrderService
