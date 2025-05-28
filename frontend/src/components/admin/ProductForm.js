"use client"

import { useState, useEffect } from "react"
import { CKEditor } from "@ckeditor/ckeditor5-react"
import ClassicEditor from "@ckeditor/ckeditor5-build-classic"
import { FiImage } from "react-icons/fi"
import AdminService from "../../services/admin.service"
import { toast } from "react-toastify"

const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    sale_price: "",
    stock: "",
    category_id: "",
    brand: "",
    image: "",
    images: "",
    specifications: "",
    featured: false,
    status: "active",
    slug: "",
    variants: "",
  })

  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        sale_price: product.sale_price || "",
        stock: product.stock || "",
        category_id: product.category_id || "",
        brand: product.brand || "",
        image: product.image || "",
        images:
          typeof product.images === "string"
            ? product.images
            : product.images
              ? JSON.stringify(product.images, null, 2)
              : "",
        specifications:
          typeof product.specifications === "string"
            ? product.specifications
            : product.specifications
              ? JSON.stringify(product.specifications, null, 2)
              : "",
        featured: product.featured || false,
        status: product.status || "active",
        slug: product.slug || "",
        variants:
          typeof product.variants === "string"
            ? product.variants
            : product.variants
              ? JSON.stringify(product.variants, null, 2)
              : "",
      })
    }
  }, [product])

  const fetchCategories = async () => {
    try {
      const response = await AdminService.getCategories()
      if (response?.data?.data?.categories) {
        setCategories(response.data.data.categories)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleDescriptionChange = (event, editor) => {
    const data = editor.getData()
    setFormData((prev) => ({
      ...prev,
      description: data,
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

  // Optimized upload adapter for CKEditor - compress images
  class MyUploadAdapter {
    constructor(loader) {
      this.loader = loader
    }

    upload() {
      return this.loader.file.then(
        (file) =>
          new Promise((resolve, reject) => {
            // Check file size (limit to 2MB)
            if (file.size > 2 * 1024 * 1024) {
              reject(new Error("File quá lớn. Vui lòng chọn ảnh nhỏ hơn 2MB."))
              return
            }

            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")
            const img = new Image()

            img.onload = () => {
              // Calculate new dimensions (max width: 800px)
              const maxWidth = 800
              const maxHeight = 600
              let { width, height } = img

              if (width > maxWidth) {
                height = (height * maxWidth) / width
                width = maxWidth
              }

              if (height > maxHeight) {
                width = (width * maxHeight) / height
                height = maxHeight
              }

              canvas.width = width
              canvas.height = height

              // Draw and compress
              ctx.drawImage(img, 0, 0, width, height)
              const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8)

              resolve({
                default: compressedDataUrl,
              })
            }

            img.onerror = () => reject(new Error("Không thể tải ảnh"))

            const reader = new FileReader()
            reader.onload = (e) => {
              img.src = e.target.result
            }
            reader.onerror = () => reject(new Error("Không thể đọc file"))
            reader.readAsDataURL(file)
          }),
      )
    }

    abort() {
      // Handle abort if needed
    }
  }

  function MyCustomUploadAdapterPlugin(editor) {
    editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
      return new MyUploadAdapter(loader)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const submitData = { ...formData }

      // Check description length (limit to avoid database errors)
      if (submitData.description && submitData.description.length > 65535) {
        toast.error("Mô tả quá dài. Vui lòng rút gọn nội dung.")
        setIsLoading(false)
        return
      }

      // Validate JSON fields only if they have content
      if (submitData.specifications && submitData.specifications.trim()) {
        try {
          JSON.parse(submitData.specifications)
        } catch (e) {
          toast.error("Thông số kỹ thuật phải là JSON hợp lệ")
          setIsLoading(false)
          return
        }
      } else {
        submitData.specifications = "{}"
      }

      if (submitData.variants && submitData.variants.trim()) {
        try {
          JSON.parse(submitData.variants)
        } catch (e) {
          toast.error("Biến thể phải là JSON hợp lệ")
          setIsLoading(false)
          return
        }
      } else {
        submitData.variants = "{}"
      }

      // Handle images field
      if (submitData.images && submitData.images.trim()) {
        if (submitData.images.trim().startsWith("[")) {
          try {
            JSON.parse(submitData.images)
          } catch (e) {
            toast.error("Gallery hình ảnh phải là JSON array hợp lệ")
            setIsLoading(false)
            return
          }
        }
        // If it's comma-separated, let backend handle it
      } else {
        submitData.images = "[]"
      }

      if (product) {
        await AdminService.updateProduct(product.id, submitData)
        toast.success("Cập nhật sản phẩm thành công")
      } else {
        await AdminService.createProduct(submitData)
        toast.success("Thêm sản phẩm thành công")
      }

      onSave()
    } catch (error) {
      console.error("Error saving product:", error)
      const errorMessage = error.response?.data?.message || error.message || "Đã xảy ra lỗi"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">{product ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</h2>
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tên sản phẩm */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm *</label>
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

              {/* Danh mục */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục *</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Thương hiệu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thương hiệu *</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Giá */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giá *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Giá khuyến mãi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giá khuyến mãi *</label>
                <input
                  type="number"
                  name="sale_price"
                  value={formData.sale_price}
                  onChange={handleInputChange}
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Tồn kho */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tồn kho *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Trạng thái */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="active">Đang bán</option>
                  <option value="inactive">Ngừng bán</option>
                  <option value="draft">Nháp</option>
                </select>
              </div>

              {/* Hình ảnh chính */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh chính *</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {formData.image && (
                  <div className="mt-3">
                    <div className="relative">
                      <img
                        src={formData.image || "/placeholder.svg"}
                        alt="Preview"
                        className="w-48 h-48 object-contain rounded-lg border"
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

              {/* Gallery hình ảnh */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Gallery hình ảnh</label>
                <textarea
                  name="images"
                  value={formData.images}
                  onChange={handleInputChange}
                  placeholder='["https://example.com/image1.jpg", "https://example.com/image2.jpg"] hoặc https://example.com/image1.jpg, https://example.com/image2.jpg'
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Sản phẩm nổi bật */}
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Sản phẩm nổi bật</span>
                </label>
              </div>
            </div>

            {/* Mô tả với CKEditor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả sản phẩm
                <span className="text-xs text-gray-500 ml-2">({formData.description.length}/65535 ký tự)</span>
              </label>
              <div className="border border-gray-300 rounded-md">
                <CKEditor
                  editor={ClassicEditor}
                  data={formData.description}
                  onChange={handleDescriptionChange}
                  config={{
                    extraPlugins: [MyCustomUploadAdapterPlugin],
                    toolbar: [
                      "heading",
                      "|",
                      "bold",
                      "italic",
                      "link",
                      "bulletedList",
                      "numberedList",
                      "|",
                      "outdent",
                      "indent",
                      "|",
                      "imageUpload",
                      "blockQuote",
                      "insertTable",
                      "mediaEmbed",
                      "|",
                      "undo",
                      "redo",
                    ],
                    image: {
                      toolbar: [
                        "imageTextAlternative",
                        "imageStyle:inline",
                        "imageStyle:block",
                        "imageStyle:side",
                        "|",
                        "toggleImageCaption",
                        "imageStyle:alignLeft",
                        "imageStyle:alignCenter",
                        "imageStyle:alignRight",
                      ],
                      styles: ["full", "side", "alignLeft", "alignCenter", "alignRight"],
                    },
                    table: {
                      contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
                    },
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ảnh sẽ được tự động nén xuống dưới 2MB và resize về tối đa 800px chiều rộng
              </p>
            </div>

            {/* Thông số kỹ thuật */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thông số kỹ thuật</label>
              <textarea
                name="specifications"
                value={formData.specifications}
                onChange={handleInputChange}
                placeholder='{"screen": "6.1 inch", "ram": "8GB", "storage": "256GB", "camera": "48MP"}'
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Biến thể */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Biến thể</label>
              <textarea
                name="variants"
                value={formData.variants}
                onChange={handleInputChange}
                placeholder='{"colors": [{"value": "red", "label": "Đỏ", "image": "url"}], "storage": [{"value": "128gb", "label": "128GB", "price": 15000000}]}'
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
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
                {isLoading ? "Đang lưu..." : product ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProductForm
