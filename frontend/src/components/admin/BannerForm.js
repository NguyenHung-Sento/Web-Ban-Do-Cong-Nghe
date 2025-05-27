"use client"

import { useState, useEffect } from "react"
import { FiX, FiImage } from "react-icons/fi"
import { toast } from "react-toastify"

const BannerForm = ({ banner, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    image_url: "",
    link_url: "",
    button_text: "",
    position: 0,
    is_active: true,
  })

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || "",
        subtitle: banner.subtitle || "",
        description: banner.description || "",
        image_url: banner.image_url || "",
        link_url: banner.link_url || "",
        button_text: banner.button_text || "",
        position: banner.position || 0,
        is_active: banner.is_active !== undefined ? banner.is_active : true,
      })
    }
  }, [banner])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.title.trim()) {
      toast.error("Tiêu đề banner là bắt buộc")
      return
    }

    if (!formData.image_url.trim()) {
      toast.error("Link ảnh banner là bắt buộc")
      return
    }

    // Validate URL format
    try {
      new URL(formData.image_url)
    } catch {
      toast.error("Link ảnh không hợp lệ")
      return
    }

    const submitData = {
      title: formData.title.trim(),
      subtitle: formData.subtitle.trim(),
      description: formData.description.trim(),
      image_url: formData.image_url.trim(),
      link_url: formData.link_url?.trim(),
      button_text: formData.button_text.trim(),
      position: Number.parseInt(formData.position) || 0,
      is_active: formData.is_active,
    }

    onSubmit(submitData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">{banner ? "Chỉnh sửa banner" : "Thêm banner mới"}</h2>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
              <FiX size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Nhập tiêu đề banner"
                required
              />
            </div>

            {/* Subtitle */}
            <div>
              <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
                Phụ đề
              </label>
              <input
                type="text"
                id="subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Nhập phụ đề banner"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Nhập mô tả banner"
              />
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-2">
                Link ảnh banner *
              </label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://example.com/image.jpg"
                required
              />
              {formData.image_url && (
                <div className="mt-3">
                  <div className="relative">
                    <img
                      src={formData.image_url || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border"
                      onError={(e) => {
                        e.target.style.display = "none"
                        e.target.nextSibling.style.display = "flex"
                      }}
                      onLoad={(e) => {
                        e.target.style.display = "block"
                        e.target.nextSibling.style.display = "none"
                      }}
                    />
                    <div className="w-full h-48 bg-gray-100 rounded-lg border flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <FiImage size={48} className="mx-auto mb-2" />
                        <p>Không thể tải ảnh</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Link URL */}
            <div>
              <label htmlFor="link_url" className="block text-sm font-medium text-gray-700 mb-2">
                Đường dẫn
              </label>
              <input
                type="text"
                id="link_url"
                name="link_url"
                value={formData.link_url}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>

            {/* Button Text */}
            <div>
              <label htmlFor="button_text" className="block text-sm font-medium text-gray-700 mb-2">
                Văn bản nút
              </label>
              <input
                type="text"
                id="button_text"
                name="button_text"
                value={formData.button_text}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Xem chi tiết"
              />
            </div>

            {/* Position and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                  Vị trí
                </label>
                <input
                  type="number"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  Kích hoạt banner
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Đang xử lý..." : banner ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BannerForm
