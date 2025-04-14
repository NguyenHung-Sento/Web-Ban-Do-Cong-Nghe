"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import Layout from "../components/layout/Layout"
import Spinner from "../components/ui/Spinner"
import Rating from "../components/ui/Rating"
import ProductSlider from "../components/ui/ProductSlider"
import { fetchProductBySlug, fetchRelatedProducts } from "../features/products/productSlice"
import { addToCart } from "../features/cart/cartSlice"
import { FiMinus, FiPlus, FiShoppingCart, FiAlertCircle } from "react-icons/fi"
import { useLoginPrompt } from "../contexts/LoginPromptContext"
import ProductGallery from "../components/ui/ProductGallery"

const ProductDetailPage = () => {
  const { slug } = useParams()
  const dispatch = useDispatch()
  const { showLoginPrompt } = useLoginPrompt()

  const { product, relatedProducts, isLoading, error } = useSelector((state) => state.products)
  const { isLoggedIn } = useSelector((state) => state.auth)

  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("description")
  const [activeImage, setActiveImage] = useState(0)

  // Thêm state cho các tùy chọn sản phẩm
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedStorage, setSelectedStorage] = useState("")
  const [selectedConfig, setSelectedConfig] = useState("")

  useEffect(() => {
    dispatch(fetchProductBySlug(slug))
  }, [dispatch, slug])

  useEffect(() => {
    if (product) {
      dispatch(fetchRelatedProducts({ productId: product.id }))

      // Khởi tạo giá trị mặc định cho các tùy chọn
      if (product.variants) {
        const variants = typeof product.variants === "string" ? JSON.parse(product.variants) : product.variants

        if (variants.colors && variants.colors.length > 0) {
          setSelectedColor(variants.colors[0].value)
        }

        if (variants.storage && variants.storage.length > 0) {
          setSelectedStorage(variants.storage[0].value)
        }

        if (variants.configs && variants.configs.length > 0) {
          setSelectedConfig(variants.configs[0].value)
        }
      }
    }
  }, [dispatch, product])

  // Tính toán giá và tồn kho dựa trên các tùy chọn đã chọn
  const { currentPrice, currentStock, currentImage } = useMemo(() => {
    if (!product || !product.variants) {
      return {
        currentPrice: product?.sale_price || product?.price,
        currentStock: product?.stock,
        currentImage: product?.image,
      }
    }

    const variants = typeof product.variants === "string" ? JSON.parse(product.variants) : product.variants

    // Xử lý cho sản phẩm điện thoại (có màu sắc và dung lượng)
    if (product.product_type === "phone") {
      // Tìm giá dựa trên dung lượng đã chọn
      let variantPrice = product.sale_price || product.price
      if (variants.storage) {
        const selectedStorageOption = variants.storage.find((s) => s.value === selectedStorage)
        if (selectedStorageOption && selectedStorageOption.price) {
          variantPrice = selectedStorageOption.price
        }
      }

      // Tìm hình ảnh dựa trên màu sắc đã chọn
      let variantImage = product.image
      if (variants.colors) {
        const selectedColorOption = variants.colors.find((c) => c.value === selectedColor)
        if (selectedColorOption && selectedColorOption.image) {
          variantImage = selectedColorOption.image
        }
      }

      // Tìm tồn kho dựa trên kết hợp màu sắc và dung lượng
      let variantStock = product.stock
      if (variants.combinations) {
        const combination = variants.combinations.find(
          (c) => c.color === selectedColor && c.storage === selectedStorage,
        )
        if (combination) {
          variantStock = combination.stock
        }
      }

      return { currentPrice: variantPrice, currentStock: variantStock, currentImage: variantImage }
    }

    // Xử lý cho sản phẩm laptop (có cấu hình)
    else if (product.product_type === "laptop" && variants.configs) {
      const selectedConfigOption = variants.configs.find((c) => c.value === selectedConfig)
      if (selectedConfigOption) {
        return {
          currentPrice: selectedConfigOption.price || product.price,
          currentStock: selectedConfigOption.stock || product.stock,
          currentImage: product.image,
        }
      }
    }

    return {
      currentPrice: product.sale_price || product.price,
      currentStock: product.stock,
      currentImage: product.image,
    }
  }, [product, selectedColor, selectedStorage, selectedConfig])

  const handleQuantityChange = (value) => {
    const newQuantity = quantity + value
    if (newQuantity > 0 && newQuantity <= currentStock) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      // Use the global login prompt
      showLoginPrompt(`/product/${slug}`)
      return
    }

    // Get the variant image if a color is selected
    let variantImage = null
    if (selectedColor && product.variants) {
      const variants = typeof product.variants === "string" ? JSON.parse(product.variants) : product.variants
      if (variants.colors) {
        const selectedColorOption = variants.colors.find((c) => c.value === selectedColor)
        if (selectedColorOption && selectedColorOption.image) {
          variantImage = selectedColorOption.image
        }
      }
    }

    // Thêm các tùy chọn vào thông tin sản phẩm khi thêm vào giỏ hàng
    const productOptions = {}

    if (selectedColor) productOptions.color = selectedColor
    if (selectedStorage) productOptions.storage = selectedStorage
    if (selectedConfig) productOptions.config = selectedConfig

    // Thêm giá biến thể vào options để lưu trong giỏ hàng
    productOptions.variantPrice = currentPrice

    dispatch(
      addToCart({
        productId: product.id,
        quantity,
        options: Object.keys(productOptions).length > 0 ? productOptions : undefined,
        variantImage: variantImage,
      }),
    )
  }

  // Xử lý khi thay đổi màu sắc
  const handleColorChange = (colorValue) => {
    setSelectedColor(colorValue)
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container-custom py-20">
          <Spinner size="lg" />
        </div>
      </Layout>
    )
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container-custom py-10">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Không tìm thấy sản phẩm</h2>
            <p className="text-gray-dark mb-6">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <Link to="/products" className="btn btn-primary">
              Quay lại cửa hàng
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  // Parse specifications if it's a string
  const specifications =
    typeof product.specifications === "string" ? JSON.parse(product.specifications) : product.specifications

  // Parse variants if it's a string
  const variants = typeof product.variants === "string" ? JSON.parse(product.variants) : product.variants || {}

  // Kiểm tra loại sản phẩm
  const isPhone = product.product_type === "phone"
  const isLaptop = product.product_type === "laptop"
  const isAccessory = product.product_type === "accessory"

  return (
    <Layout>
      <div className="container-custom py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row">
            {/* Product Images */}
            <div className="md:w-2/5 mb-6 md:mb-0 md:pr-8">
              <ProductGallery
                product={product}
                selectedColor={selectedColor}
                onImageChange={(image) => {
                  // This is optional - if you need to do something when the main image changes
                }}
              />
            </div>

            {/* Product Info */}
            <div className="md:w-3/5">
              <h1 className="text-2xl font-bold mb-2">{product.name}</h1>

              <div className="flex items-center mb-4">
                <Rating value={4.5} text={`(${product.review_count || 0} đánh giá)`} />
                <span className="mx-4 text-gray-dark">|</span>
                <span className={currentStock > 0 ? "text-green-600" : "text-red-600"}>
                  {currentStock > 0 ? `Còn hàng: ${currentStock}` : "Hết hàng"}
                </span>
              </div>

              <div className="mb-6">
                {/* Hiển thị giá dựa trên biến thể đã chọn */}
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-primary">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(currentPrice)}
                  </span>
                  {product.price > currentPrice && (
                    <>
                      <span className="ml-3 text-lg text-gray-dark line-through">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
                      </span>
                      <span className="ml-3 bg-primary text-white px-2 py-1 rounded-md text-sm">
                        {Math.round(((product.price - currentPrice) / product.price) * 100)}% giảm
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <span className="w-24 text-gray-dark">Thương hiệu:</span>
                  <span className="font-medium">{product.brand}</span>
                </div>

                <div className="flex items-center mb-4">
                  <span className="w-24 text-gray-dark">Danh mục:</span>
                  <Link to={`/category/${product.category_id}`} className="text-secondary hover:underline">
                    {product.category_name}
                  </Link>
                </div>
              </div>

              {/* Tùy chọn màu sắc cho điện thoại */}
              {isPhone && variants.colors && variants.colors.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-start">
                    <span className="w-24 text-gray-dark mt-2">Màu sắc:</span>
                    <div className="flex flex-wrap gap-2">
                      {variants.colors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => handleColorChange(color.value)}
                          className={`px-4 py-2 border rounded-md ${
                            selectedColor === color.value
                              ? "border-primary text-primary"
                              : "border-gray-medium text-dark"
                          }`}
                          style={color.code ? { backgroundColor: color.code, color: "#000" } : {}}
                        >
                          {color.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tùy chọn dung lượng cho điện thoại */}
              {isPhone && variants.storage && variants.storage.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-start">
                    <span className="w-24 text-gray-dark mt-2">Dung lượng:</span>
                    <div className="flex flex-wrap gap-2">
                      {variants.storage.map((storage) => {
                        // Kiểm tra tồn kho cho kết hợp màu sắc và dung lượng này
                        let combinationStock = product.stock
                        let isOutOfStock = false

                        if (variants.combinations) {
                          const combination = variants.combinations.find(
                            (c) => c.color === selectedColor && c.storage === storage.value,
                          )
                          if (combination) {
                            combinationStock = combination.stock
                            isOutOfStock = combinationStock <= 0
                          }
                        }

                        return (
                          <button
                            key={storage.value}
                            onClick={() => setSelectedStorage(storage.value)}
                            disabled={isOutOfStock}
                            className={`px-4 py-2 border rounded-md ${
                              selectedStorage === storage.value
                                ? "border-primary text-primary"
                                : isOutOfStock
                                  ? "border-gray-300 text-gray-300 cursor-not-allowed"
                                  : "border-gray-medium text-dark"
                            }`}
                          >
                            <div className="flex items-center">
                              {storage.label}
                              {storage.price && (
                                <span className="ml-2 text-xs">
                                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                    storage.price,
                                  )}
                                </span>
                              )}
                              {isOutOfStock && <FiAlertCircle className="ml-1 text-red-500" title="Hết hàng" />}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Tùy chọn cấu hình cho laptop */}
              {isLaptop && variants.configs && variants.configs.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-start">
                    <span className="w-24 text-gray-dark mt-2">Cấu hình:</span>
                    <div className="flex flex-col gap-2 w-full">
                      {variants.configs.map((config) => {
                        const isOutOfStock = config.stock <= 0

                        return (
                          <button
                            key={config.value}
                            onClick={() => setSelectedConfig(config.value)}
                            disabled={isOutOfStock}
                            className={`px-4 py-3 border rounded-md text-left ${
                              selectedConfig === config.value
                                ? "border-primary text-primary"
                                : isOutOfStock
                                  ? "border-gray-300 text-gray-300 cursor-not-allowed"
                                  : "border-gray-medium text-dark"
                            }`}
                          >
                            <div className="flex justify-between">
                              <div>
                                <div className="font-medium">{config.label}</div>
                                <div className="text-sm text-gray-dark">{config.description}</div>
                              </div>
                              <div className="flex flex-col items-end">
                                {config.price && (
                                  <div className="text-primary font-medium">
                                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                      config.price,
                                    )}
                                  </div>
                                )}
                                {isOutOfStock ? (
                                  <div className="text-red-500 text-sm">Hết hàng</div>
                                ) : (
                                  <div className="text-green-500 text-sm">Còn {config.stock} sản phẩm</div>
                                )}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center">
                  <span className="w-24 text-gray-dark">Số lượng:</span>
                  <div className="flex items-center border border-gray-medium rounded-md">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className={`px-3 py-1 ${quantity <= 1 ? "text-gray-dark" : "text-dark hover:bg-gray-medium"}`}
                    >
                      <FiMinus />
                    </button>
                    <span className="px-4 py-1 border-l border-r border-gray-medium">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= currentStock}
                      className={`px-3 py-1 ${
                        quantity >= currentStock ? "text-gray-dark" : "text-dark hover:bg-gray-medium"
                      }`}
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  className="btn btn-primary flex items-center justify-center"
                  disabled={currentStock <= 0}
                >
                  <FiShoppingCart className="mr-2" />
                  {currentStock > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex border-b border-gray-medium">
            <button
              className={`px-6 py-3 font-medium ${
                activeTab === "description"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-dark hover:text-dark"
              }`}
              onClick={() => setActiveTab("description")}
            >
              Mô tả
            </button>

            <button
              className={`px-6 py-3 font-medium ${
                activeTab === "specifications"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-dark hover:text-dark"
              }`}
              onClick={() => setActiveTab("specifications")}
            >
              Thông số kỹ thuật
            </button>

            <button
              className={`px-6 py-3 font-medium ${
                activeTab === "reviews" ? "text-primary border-b-2 border-primary" : "text-gray-dark hover:text-dark"
              }`}
              onClick={() => setActiveTab("reviews")}
            >
              Đánh giá
            </button>
          </div>

          <div className="p-6">
            {activeTab === "description" && (
              <div>
                <p>{product.description || "Không có mô tả cho sản phẩm này."}</p>
              </div>
            )}

            {activeTab === "specifications" && (
              <div>
                {specifications ? (
                  <table className="w-full border-collapse">
                    <tbody>
                      {Object.entries(specifications).map(([key, value]) => (
                        <tr key={key} className="border-b border-gray-medium">
                          <td className="py-3 pr-4 font-medium w-1/3">{key}</td>
                          <td className="py-3">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>Không có thông số kỹ thuật cho sản phẩm này.</p>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <p>Chưa có đánh giá nào cho sản phẩm này.</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && <ProductSlider title="Sản phẩm liên quan" products={relatedProducts} />}
      </div>
    </Layout>
  )
}

export default ProductDetailPage

