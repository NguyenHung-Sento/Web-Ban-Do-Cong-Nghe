import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/auth/authSlice"
import cartReducer from "../features/cart/cartSlice"
import productReducer from "../features/products/productSlice"
import categoryReducer from "../features/products/categorySlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productReducer,
    categories: categoryReducer,
  },
})

export default store

