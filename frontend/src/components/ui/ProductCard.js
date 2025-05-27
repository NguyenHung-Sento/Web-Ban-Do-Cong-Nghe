"use client"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { FiShoppingCart } from "react-icons/fi"
import { addToCart } from "../../features/cart/cartSlice"
import Rating from "./Rating"
import ReviewService from "../../services/review.service"
import { toast } from "react-toastify"
import Spinner from "./Spinner"

const ProductCard = ({ product }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [rating, setRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  useEffect(() => {
    // Sử dụng rating và review_count từ product nếu có
    if (product.rating !== undefined && product.review_count !== undefined) {
      setRating(Number.parseFloat(product.rating) || 0)
      setReviewCount(product.review_count || 0)
    } else {
      // Nếu không có, lấy thông tin đánh giá cho sản phẩm từ API
      const fetchRating = async () => {
        try {
          const response = await ReviewService.getProductReviews(product.id, { limit: 1 })
          if (response.data && response.data.stats) {
            setRating(Number.parseFloat(response.data.stats.average_rating) || 0)
            setReviewCount(response.data.pagination.total || 0)
          }
        } catch (error) {
          console.error("Error fetching product rating:", error)
        }
      }

      fetchRating()
    }
  }, [product])

  const handleAddToCart = async () => {
    // Kiểm tra tồn kho
    if (product.stock <= 0) {
      toast.error("Sản phẩm đã hết hàng")
      return
    }

    setIsAddingToCart(true)

    try {
      await dispatch(
        addToCart({
          productId: product.id,
          quantity: 1,
          product: {
            name: product.name,
            price: product.price,
            sale_price: product.sale_price,
            image: product.image,
            stock: product.stock,
          },
        }),
      )
      // Thông báo thành công ở đây, đã loại bỏ ở cartSlice
      toast.success("Đã thêm sản phẩm vào giỏ hàng")
    } catch (error) {
      // Không cần hiển thị lỗi ở đây vì đã được xử lý trong cartSlice
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <div className="card group">
      <Link to={`/product/${product.slug}`} className="block overflow-hidden">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-48 object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="p-4">
        <Link to={`/product/${product.slug}`} className="block">
          <h3 className="text-base font-medium mb-1 line-clamp-2 h-12">{product.name}</h3>
          <div className="mb-2">
            <Rating value={rating} text={`(${reviewCount})`} />
          </div>
          <div className="flex items-center mb-3">
            {product.sale_price ? (
              <>
                <span className="text-lg font-bold text-primary">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.sale_price)}
                </span>
                <span className="ml-2 text-sm text-gray-dark line-through">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-primary">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
              </span>
            )}
          </div>
        </Link>
        <div>
          <button
            onClick={handleAddToCart}
            className={`w-full btn flex items-center justify-center ${
              product.stock > 0 ? "btn-primary" : "btn-disabled bg-gray-300 cursor-not-allowed"
            }`}
            disabled={product.stock <= 0 || isAddingToCart}
          >
            {isAddingToCart ? (
              <Spinner size="sm" />
            ) : (
              <>
                <FiShoppingCart className="mr-2" />
                Thêm vào giỏ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
