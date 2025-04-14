import api from "./api"

const PaymentService = {
  processPayment: async (paymentData) => {
    const response = await api.post("/payments/process", paymentData)
    return response.data
  },

  checkPaymentStatus: async (orderId) => {
    const response = await api.get(`/payments/check/${orderId}`)
    return response.data
  },

  generateBankQR: async (bankId, orderId) => {
    const response = await api.post("/payments/bank-qr", { bank_id: bankId, order_id: orderId })
    return response.data
  },

  // Chỉ admin mới có thể gọi API này
  confirmPayment: async (paymentId) => {
    const response = await api.post(`/payments/confirm/${paymentId}`)
    return response.data
  },
}

export default PaymentService
