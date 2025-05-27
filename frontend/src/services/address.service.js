import api from "./api"

const AddressService = {
  // Lấy tất cả địa chỉ của user
  getUserAddresses: async () => {
    const response = await api.get("/addresses")
    return response.data
  },

  // Lấy địa chỉ mặc định
  getDefaultAddress: async () => {
    const response = await api.get("/addresses/default")
    return response.data
  },

  // Tạo địa chỉ mới
  createAddress: async (addressData) => {
    const response = await api.post("/addresses", addressData)
    return response.data
  },

  // Cập nhật địa chỉ
  updateAddress: async (id, addressData) => {
    const response = await api.put(`/addresses/${id}`, addressData)
    return response.data
  },

  // Xóa địa chỉ
  deleteAddress: async (id) => {
    const response = await api.delete(`/addresses/${id}`)
    return response.data
  },

  // Đặt địa chỉ mặc định
  setDefaultAddress: async (id) => {
    const response = await api.patch(`/addresses/${id}/default`)
    return response.data
  },
}

export default AddressService
