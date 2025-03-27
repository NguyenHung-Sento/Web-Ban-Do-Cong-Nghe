"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useFormik } from "formik"
import * as Yup from "yup"
import Layout from "../components/layout/Layout"
import Spinner from "../components/ui/Spinner"
import { fetchCart, clearCart } from "../features/cart/cartSlice"
import OrderService from "../services/order.service"
import { FiUser, FiPhone, FiMapPin, FiCreditCard } from "react-icons/fi"

const CheckoutPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const { items, totalItems, totalAmount, isLoading } = useSelector((state) => state.cart)
  const { isLoggedIn, user } = useSelector((state) => state.auth)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login?redirect=checkout")
      return
    }

    dispatch(fetchCart())
  }, [dispatch, isLoggedIn, navigate])

  useEffect(() => {
    if (items.length === 0 && !isLoading) {
      navigate("/cart")
    }
  }, [items, isLoading, navigate])

  const formik = useFormik({
    initialValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
      payment_method: "cod",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Họ tên là bắt buộc"),
      phone: Yup.string()
        .matches(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ")
        .required("Số điện thoại là bắt buộc"),
      address: Yup.string().required("Địa chỉ là bắt buộc"),
      payment_method: Yup.string().required("Phương thức thanh toán là bắt buộc"),
    }),
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true)
        setError(null)

        const orderItems = items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.sale_price || item.price,
        }))

        const orderData = {
          shipping_address: `${values.name}, ${values.phone}, ${values.address}`,
          payment_method: values.payment_method,
          items: orderItems,
        }

        const response = await OrderService.createOrder(orderData)

        // Clear cart after successful order
        dispatch(clearCart())

        // Redirect to success page
        navigate(`/orders`)
      } catch (error) {
        setError(error.response?.data?.message || "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.")
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  if (!isLoggedIn || (items.length === 0 && !isLoading)) {
    return null
  }

  return (
    <Layout>
      <div className="container-custom py-8">
        <h1 className="mb-6">Thanh toán</h1>

        {isLoading ? (
          <div className="py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Checkout Form */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold mb-6">Thông tin giao hàng</h2>

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
                )}

                <form onSubmit={formik.handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="name" className="form-label">
                      Họ tên
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FiUser className="text-gray-dark" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className={`form-input pl-10 ${
                          formik.touched.name && formik.errors.name ? "border-red-500" : ""
                        }`}
                        placeholder="Nhập họ tên người nhận"
                        {...formik.getFieldProps("name")}
                      />
                    </div>
                    {formik.touched.name && formik.errors.name && (
                      <div className="form-error">{formik.errors.name}</div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="phone" className="form-label">
                      Số điện thoại
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FiPhone className="text-gray-dark" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className={`form-input pl-10 ${
                          formik.touched.phone && formik.errors.phone ? "border-red-500" : ""
                        }`}
                        placeholder="Nhập số điện thoại người nhận"
                        {...formik.getFieldProps("phone")}
                      />
                    </div>
                    {formik.touched.phone && formik.errors.phone && (
                      <div className="form-error">{formik.errors.phone}</div>
                    )}
                  </div>

                  <div className="mb-6">
                    <label htmlFor="address" className="form-label">
                      Địa chỉ
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FiMapPin className="text-gray-dark" />
                      </div>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        className={`form-input pl-10 ${
                          formik.touched.address && formik.errors.address ? "border-red-500" : ""
                        }`}
                        placeholder="Nhập địa chỉ giao hàng đầy đủ"
                        {...formik.getFieldProps("address")}
                      />
                    </div>
                    {formik.touched.address && formik.errors.address && (
                      <div className="form-error">{formik.errors.address}</div>
                    )}
                  </div>

                  <h2 className="text-xl font-bold mb-6">Phương thức thanh toán</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="cod"
                        name="payment_method"
                        value="cod"
                        checked={formik.values.payment_method === "cod"}
                        onChange={formik.handleChange}
                        className="mr-2"
                      />
                      <label htmlFor="cod" className="flex items-center">
                        <FiCreditCard className="mr-2" />
                        Thanh toán khi nhận hàng (COD)
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="bank_transfer"
                        name="payment_method"
                        value="bank_transfer"
                        checked={formik.values.payment_method === "bank_transfer"}
                        onChange={formik.handleChange}
                        className="mr-2"
                      />
                      <label htmlFor="bank_transfer" className="flex items-center">
                        <FiCreditCard className="mr-2" />
                        Chuyển khoản ngân hàng
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="momo"
                        name="payment_method"
                        value="momo"
                        checked={formik.values.payment_method === "momo"}
                        onChange={formik.handleChange}
                        className="mr-2"
                      />
                      <label htmlFor="momo" className="flex items-center">
                        <FiCreditCard className="mr-2" />
                        Ví MoMo
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Spinner size="sm" /> : "Đặt hàng"}
                  </button>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-6">Đơn hàng của bạn</h2>

                <div className="mb-6">
                  <div className="max-h-80 overflow-y-auto mb-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex py-4 border-b border-gray-medium">
                        <div className="w-20 h-20 flex-shrink-0">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <div className="flex justify-between mt-1">
                            <span className="text-gray-dark">
                              {item.quantity} x{" "}
                              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                item.sale_price || item.price,
                              )}
                            </span>
                            <span className="font-medium">
                              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                (item.sale_price || item.price) * item.quantity,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-dark">Tổng sản phẩm:</span>
                      <span>{totalItems}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-dark">Tạm tính:</span>
                      <span>
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-dark">Phí vận chuyển:</span>
                      <span>Miễn phí</span>
                    </div>

                    <div className="border-t border-gray-medium pt-2 flex justify-between font-bold">
                      <span>Tổng cộng:</span>
                      <span className="text-primary text-xl">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default CheckoutPage

