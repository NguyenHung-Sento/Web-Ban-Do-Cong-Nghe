"use client"

import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import Layout from "../components/layout/Layout"
import Spinner from "../components/ui/Spinner"
import Rating from "../components/ui/Rating"
import ProductSlider from "../components/ui/ProductSlider"
import { fetchProductBySlug, fetchRelatedProducts } from "../features/products/productSlice"
import { addToCart } from "../features/cart/cartSlice"
import { FiMinus, FiPlus, FiShoppingCart, FiHeart, FiShare2 } from "react-icons/fi"

const ProductDetailPage = () => {
  const { slug } = useParams()
  const dispatch = useDispatch()

  const { product, relatedProducts, isLoading, error } = useSelector((state) => state.products)

  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("description")
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    dispatch(fetchProductBySlug(slug))
  }, [dispatch, slug])

  useEffect(() => {
    if (product) {
      dispatch(fetchRelatedProducts({ productId: product.id }))
    }
  }, [dispatch, product])

  const handleQuantityChange = (value) => {
    const newQuantity = quantity + value
    if (newQuantity > 0 && newQuantity <= product.stock) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    dispatch(addToCart({ productId: product.id, quantity }))
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

  // Get product images
  const productImages = product.images ? [product.image, ...product.images] : [product.image]

  return (
    <Layout>
      <div className="container-custom py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row">
            {/* Product Images */}
            <div className="md:w-2/5 mb-6 md:mb-0 md:pr-8">
              <div className="mb-4">
                <img
                  src={"/placeholder.svg" || productImages[activeImage] }
                  alt={product.name}
                  className="w-full h-80 object-contain"
                />
              </div>

              {productImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`border-2 rounded-md p-1 ${
                        activeImage === index ? "border-primary" : "border-gray-medium"
                      }`}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${product.name} - ${index + 1}`}
                        className="w-16 h-16 object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="md:w-3/5">
              <h1 className="text-2xl font-bold mb-2">{product.name}</h1>

              <div className="flex items-center mb-4">
                <Rating value={4.5} text="(45 đánh giá)" />
                <span className="mx-4 text-gray-dark">|</span>
                <span className="text-green-600">Còn hàng: {product.stock}</span>
              </div>

              <div className="mb-6">
                {product.sale_price ? (
                  <div className="flex items-center">
                    <span className="text-3xl font-bold text-primary">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                        product.sale_price,
                      )}
                    </span>
                    <span className="ml-3 text-lg text-gray-dark line-through">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
                    </span>
                    <span className="ml-3 bg-primary text-white px-2 py-1 rounded-md text-sm">
                      {Math.round(((product.price - product.sale_price) / product.price) * 100)}% giảm
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
                  </span>
                )}
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
                      disabled={quantity >= product.stock}
                      className={`px-3 py-1 ${
                        quantity >= product.stock ? "text-gray-dark" : "text-dark hover:bg-gray-medium"
                      }`}
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
                <button onClick={handleAddToCart} className="btn btn-primary flex items-center justify-center">
                  <FiShoppingCart className="mr-2" />
                  Thêm vào giỏ hàng
                </button>

                <button className="btn btn-outline flex items-center justify-center">
                  <FiHeart className="mr-2" />
                  Thêm vào yêu thích
                </button>

                <button className="btn btn-outline flex items-center justify-center">
                  <FiShare2 className="mr-2" />
                  Chia sẻ
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

