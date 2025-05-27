"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import Layout from "../components/layout/Layout"
import Spinner from "../components/ui/Spinner"
import {
  fetchCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  toggleSelectItem,
  selectAllItems,
} from "../features/cart/cartSlice"
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiShoppingCart } from "react-icons/fi"
import { useLoginPrompt } from "../contexts/LoginPromptContext"

const CartPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { showLoginPrompt } = useLoginPrompt()

  const { items, totalItems, totalAmount, selectedItems, isLoading } = useSelector((state) => state.cart)
  const { isLoggedIn } = useSelector((state) => state.auth)

  // Calculate totals for selected items only
  const [selectedTotals, setSelectedTotals] = useState({
    count: 0,
    amount: 0,
  })

  // Update selected totals when items or selection changes
  useEffect(() => {
    if (items.length > 0 && selectedItems.length > 0) {
      let count = 0
      let amount = 0

      items.forEach((item) => {
        if (selectedItems.includes(item.id)) {
          count += item.quantity
          const itemPrice =
            item.options && item.options.variantPrice ? item.options.variantPrice : item.sale_price || item.price
          amount += itemPrice * item.quantity
        }
      })

      setSelectedTotals({
        count,
        amount,
      })
    } else {
      setSelectedTotals({
        count: 0,
        amount: 0,
      })
    }
  }, [items, selectedItems])

  // Update the useEffect hook that checks login status
  useEffect(() => {
    // Luôn fetch giỏ hàng, bất kể đăng nhập hay chưa
    dispatch(fetchCart())
  }, [dispatch])

  const handleQuantityChange = (itemId, quantity) => {
    if (quantity >= 1) {
      dispatch(updateCartItem({ itemId, quantity }))
    }
  }

  const handleRemoveItem = (itemId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")) {
      dispatch(removeFromCart(itemId))
    }
  }

  const handleClearCart = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?")) {
      dispatch(clearCart())
    }
  }

  // Handle item selection toggle
  const handleToggleSelect = (itemId) => {
    dispatch(toggleSelectItem(itemId))
  }

  // Handle select all toggle
  const handleSelectAll = (e) => {
    dispatch(selectAllItems(e.target.checked))
  }

  // Check if all items are selected
  const allSelected = items.length > 0 && selectedItems.length === items.length

  // Proceed to checkout with selected items only
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán")
      return
    }

    // Kiểm tra đăng nhập khi thanh toán
    if (!isLoggedIn) {
      showLoginPrompt("/checkout")
      return
    }

    navigate("/checkout")
  }

  // Hàm định dạng tên tùy chọn
  const formatOptionName = (optionKey, optionValue) => {
    const optionNames = {
      color: "Màu sắc",
      storage: "Dung lượng",
      config: "Cấu hình",
    }

    return `${optionNames[optionKey] || optionKey}: ${optionValue}`
  }

  // Bỏ early return cho người dùng chưa đăng nhập
  if (isLoading) {
    return (
      <Layout>
        <div className="container-custom py-20">
          <Spinner size="lg" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container-custom py-8">
        <h1 className="mb-6">Giỏ hàng của bạn</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <FiShoppingCart size={64} className="text-gray-dark" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống</h2>
            <p className="text-gray-dark mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
            <Link to="/products" className="btn btn-primary">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-light">
                    <tr>
                      <th className="py-4 px-2 text-center">
                        <div className="flex items-center justify-center">
                          <input type="checkbox" className="w-4 h-4" checked={allSelected} onChange={handleSelectAll} />
                        </div>
                      </th>
                      <th className="py-4 px-6 text-left">Sản phẩm</th>
                      <th className="py-4 px-6 text-center">Giá</th>
                      <th className="py-4 px-6 text-center">Số lượng</th>
                      <th className="py-4 px-6 text-center">Tổng</th>
                      <th className="py-4 px-6 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-medium">
                        <td className="py-4 px-2 text-center">
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              className="w-4 h-4"
                              checked={selectedItems.includes(item.id)}
                              onChange={() => handleToggleSelect(item.id)}
                            />
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <img
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              className="w-16 h-16 object-contain mr-4"
                            />
                            <div>
                              <Link to={`/product/${item.slug}`} className="font-medium hover:text-primary">
                                {item.name}
                              </Link>

                              {/* Hiển thị các tùy chọn sản phẩm nếu có */}
                              {item.options && (
                                <div className="text-sm text-gray-dark mt-1">
                                  {Object.entries(item.options)
                                    .filter(([key]) => !["variantPrice", "variantImage"].includes(key)) // Không hiển thị giá và ảnh biến thể
                                    .map(([key, value]) => (
                                      <div key={key}>{formatOptionName(key, value)}</div>
                                    ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {/* Sử dụng giá biến thể nếu có */}
                          {item.options && item.options.variantPrice ? (
                            <span className="font-medium">
                              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                item.options.variantPrice,
                              )}
                            </span>
                          ) : item.sale_price ? (
                            <div>
                              <span className="font-medium text-primary">
                                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                  item.sale_price,
                                )}
                              </span>
                              <span className="block text-sm text-gray-dark line-through">
                                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                  item.price,
                                )}
                              </span>
                            </div>
                          ) : (
                            <span className="font-medium">
                              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                item.price,
                              )}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="p-1 rounded-md hover:bg-gray-medium"
                            >
                              <FiMinus />
                            </button>
                            <span className="mx-3">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="p-1 rounded-md hover:bg-gray-medium"
                            >
                              <FiPlus />
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center font-medium">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                            ((item.options && item.options.variantPrice) || item.sale_price || item.price) *
                              item.quantity,
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button onClick={() => handleRemoveItem(item.id)} className="text-red-600 hover:text-red-800">
                            <FiTrash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between mt-6">
                <Link to="/products" className="btn btn-outline flex items-center">
                  <FiArrowLeft className="mr-2" />
                  Tiếp tục mua sắm
                </Link>

                <button
                  onClick={handleClearCart}
                  className="btn btn-outline flex items-center text-red-600 border-red-600 hover:bg-red-50"
                >
                  <FiTrash2 className="mr-2" />
                  Xóa giỏ hàng
                </button>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-6">Tóm tắt đơn hàng</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-dark">Sản phẩm đã chọn:</span>
                    <span>
                      {selectedTotals.count} / {totalItems}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-dark">Tạm tính:</span>
                    <span>
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                        selectedTotals.amount,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-dark">Phí vận chuyển:</span>
                    <span>Miễn phí</span>
                  </div>

                  <div className="border-t border-gray-medium pt-4 flex justify-between font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-primary text-xl">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                        selectedTotals.amount,
                      )}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="btn btn-primary w-full"
                  disabled={selectedItems.length === 0}
                >
                  {selectedItems.length === 0 ? "Vui lòng chọn sản phẩm" : "Tiến hành thanh toán"}
                </button>

                {selectedItems.length === 0 && (
                  <p className="text-sm text-red-500 mt-2 text-center">
                    Vui lòng chọn ít nhất một sản phẩm để thanh toán
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default CartPage
