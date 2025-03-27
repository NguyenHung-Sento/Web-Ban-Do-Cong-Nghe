"use client"
import { Link } from "react-router-dom"
import { useDispatch } from "react-redux"
import { FiShoppingCart } from "react-icons/fi"
import { addToCart } from "../../features/cart/cartSlice"
import Rating from "./Rating"

const ProductCard = ({ product }) => {
  const dispatch = useDispatch()

  const handleAddToCart = () => {
    dispatch(addToCart({ productId: product.id, quantity: 1 }))
  }

  return (
    <div className="card group">
      <Link to={`/product/${product.slug}`} className="block overflow-hidden">
        <img
          src={ "/placeholder.svg" || product.image}
          alt={product.name}
          className="w-full h-48 object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="p-4">
        <Link to={`/product/${product.slug}`} className="block">
          <h3 className="text-base font-medium mb-1 line-clamp-2 h-12">{product.name}</h3>
          <div className="mb-2">
            <Rating value={4} text={`(${Math.floor(Math.random() * 50) + 5})`} />
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
        <button onClick={handleAddToCart} className="w-full btn btn-primary flex items-center justify-center">
          <FiShoppingCart className="mr-2" />
          Thêm vào giỏ
        </button>
      </div>
    </div>
  )
}

export default ProductCard

