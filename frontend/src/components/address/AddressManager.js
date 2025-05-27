"use client"

import { useState, useEffect } from "react"
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiMapPin } from "react-icons/fi"
import AddressService from "../../services/address.service"
import Spinner from "../ui/Spinner"

const AddressManager = () => {
  const [addresses, setAddresses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [formData, setFormData] = useState({
    address_text: "",
    is_default: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      setIsLoading(true)
      const response = await AddressService.getUserAddresses()
      setAddresses(response.data.addresses)
    } catch (error) {
      setError("Không thể tải danh sách địa chỉ")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.address_text.trim()) {
      setError("Vui lòng nhập địa chỉ")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      if (editingAddress) {
        await AddressService.updateAddress(editingAddress.id, formData)
      } else {
        await AddressService.createAddress(formData)
      }

      await fetchAddresses()
      resetForm()
    } catch (error) {
      setError(error.response?.data?.message || "Đã xảy ra lỗi")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (address) => {
    setEditingAddress(address)
    setFormData({
      address_text: address.address_text,
      is_default: address.is_default,
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return

    try {
      await AddressService.deleteAddress(id)
      await fetchAddresses()
    } catch (error) {
      setError(error.response?.data?.message || "Không thể xóa địa chỉ")
    }
  }

  const handleSetDefault = async (id) => {
    try {
      await AddressService.setDefaultAddress(id)
      await fetchAddresses()
    } catch (error) {
      setError(error.response?.data?.message || "Không thể đặt địa chỉ mặc định")
    }
  }

  const resetForm = () => {
    setFormData({ address_text: "", is_default: false })
    setEditingAddress(null)
    setShowForm(false)
    setError(null)
  }

  if (isLoading) {
    return (
      <div className="py-8">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">Địa chỉ của tôi</h3>
        <button onClick={() => setShowForm(true)} className="btn btn-primary flex items-center">
          <FiPlus className="mr-2" />
          Thêm địa chỉ
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {/* Form thêm/sửa địa chỉ */}
      {showForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="font-bold mb-4">{editingAddress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}</h4>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label">Địa chỉ</label>
              <textarea
                className="form-input"
                rows="3"
                placeholder="Nhập địa chỉ đầy đủ..."
                value={formData.address_text}
                onChange={(e) => setFormData({ ...formData, address_text: e.target.value })}
                required
              />
            </div>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                />
                Đặt làm địa chỉ mặc định
              </label>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <Spinner size="sm" /> : "Lưu"}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách địa chỉ */}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiMapPin className="mx-auto text-4xl mb-2" />
            <p>Chưa có địa chỉ nào</p>
          </div>
        ) : (
          addresses.map((address) => (
            <div
              key={address.id}
              className={`border rounded-lg p-4 ${
                address.is_default ? "border-primary bg-primary bg-opacity-5" : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <FiMapPin className="mr-2 text-gray-500" />
                    {(address.is_default === 1 || address.is_default === true) && (
                      <span className="bg-primary text-white text-xs px-2 py-1 rounded mr-2">Mặc định</span>
                    )}
                  </div>
                  <p className="text-gray-800">{address.address_text}</p>
                </div>

                <div className="flex gap-2 ml-4">
                  {!address.is_default && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="text-primary hover:text-primary-dark"
                      title="Đặt làm mặc định"
                    >
                      <FiCheck />
                    </button>
                  )}
                  <button onClick={() => handleEdit(address)} className="text-blue-600 hover:text-blue-800" title="Sửa">
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Xóa"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AddressManager
