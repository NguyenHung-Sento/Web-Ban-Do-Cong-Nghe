import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Provider } from "react-redux"
import store from "./store"
import { LoginPromptProvider } from "./contexts/LoginPromptContext"

// Pages
import HomePage from "./pages/HomePage"
import ProductListPage from "./pages/ProductListPage"
import ProductDetailPage from "./pages/ProductDetailPage"
import CartPage from "./pages/CartPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import VerifyEmailPage from "./pages/VerifyEmailPage"
import ProfilePage from "./pages/ProfilePage"
import OrdersPage from "./pages/OrdersPage"
import CheckoutPage from "./pages/CheckoutPage"
import PaymentReturnPage from "./pages/PaymentReturnPage"
import SocialAuthCallbackPage from "./pages/SocialAuthCallbackPage"
import NotFoundPage from "./pages/NotFoundPage"
import OrderDetailsPage from "./pages/OrderDetailsPage"

// Admin Pages
import DashboardPage from "./pages/admin/DashboardPage"
import AdminProductsPage from "./pages/admin/ProductsPage"
import AdminCategoriesPage from "./pages/admin/CategoriesPage"
import AdminOrdersPage from "./pages/admin/OrdersPage"
import AdminUsersPage from "./pages/admin/UsersPage"
import OrderDetailPage from "./pages/admin/OrderDetailPage"
import BannersPage from "./pages/admin/BannersPage"

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <LoginPromptProvider>
          <Routes>
            {/* Client Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/category/:slug" element={<ProductListPage />} />
            <Route path="/search" element={<ProductListPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailsPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment/momo/return" element={<PaymentReturnPage />} />
            <Route path="/payment/vnpay/return" element={<PaymentReturnPage />} />
            <Route path="/social-auth-callback" element={<SocialAuthCallbackPage />} />
            {/* Admin Routes */}
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/banners" element={<BannersPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/orders/:id" element={<OrderDetailPage />} />
            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </LoginPromptProvider>
      </Router>
    </Provider>
  )
}

export default App
