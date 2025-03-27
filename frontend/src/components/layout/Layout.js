"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Header from "./Header"
import Footer from "./Footer"
import { fetchCart } from "../../features/cart/cartSlice"

const Layout = ({ children }) => {
  const dispatch = useDispatch()
  const { isLoggedIn } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchCart())
    }
  }, [dispatch, isLoggedIn])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  )
}

export default Layout

