"use client"

import { useState, useEffect } from "react"
import AdminService from "../../services/admin.service"
import { toast } from "react-toastify"

const CategoryForm = ({ category, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    image: "",
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        slug: category.slug || "",
        image: category.image || "",
      })
    }
  }, [category])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-")
  }

  const handleNameChange = (e) => {
    const name = e.target.value
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (category) {
        await AdminService.updateCategory(category.id, formData)
        toast.success("Cập nhật danh mục thành công")
      } else {
        await AdminService.createCategory(formData)
        toast.success("Thêm danh mục thành công")
      }

      onSave()
    } catch (error) {
      console.error("Error saving category:", error)
      toast.error(category ? "Không thể cập nhật danh mục" : "Không thể thêm danh mục")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">{category ? "Cập nhật danh mục" : "Thêm danh mục mới"}</h2>
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tên danh mục */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên danh mục *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Hình ảnh */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {formData.image && (
                <div className="mt-2">
                  <img
                    src={formData.image || "/placeholder.svg"}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-md"
                    onError={(e) => {
                      e.target.style.display = "none"
                    }}
                  />
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
              >
                {isLoading ? "Đang lưu..." : category ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CategoryForm
