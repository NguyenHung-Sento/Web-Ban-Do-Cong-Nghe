"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX } from "react-icons/fi"
import { fetchCategories } from "../../features/products/categorySlice"
import { logout } from "../../features/auth/authSlice"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { categories } = useSelector((state) => state.categories)
  const { isLoggedIn, user } = useSelector((state) => state.auth)
  const { totalItems } = useSelector((state) => state.cart)

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/search?q=${searchTerm}`)
      setSearchTerm("")
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    setIsUserMenuOpen(false)
    navigate("/")
  }

  return (
    <header className="bg-white shadow-md">
      {/* Top bar */}
      <div className="bg-gray-300 text-blue-900 py-1">
        <div className="container-custom flex justify-between items-center">
          <div className="text-sm">Hotline: 1800-2097</div>
          <div className="text-sm">Miễn phí vận chuyển cho đơn hàng trên 500.000đ</div>
        </div>
      </div>

      {/* Main header */}
      <div className=" py-4 bg-primary">
        <div className="flex items-center justify-between px-32">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-white">
            CellPhoneS
          </Link>

          {/* Search bar - hidden on mobile */}
          <div className="hidden md:block w-1/3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full py-2 px-4 pr-10 border border-gray-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="absolute right-0 top-0 h-full px-3 text-gray-dark">
                <FiSearch size={20} />
              </button>
            </form>
          </div>

          {/* Navigation for desktop */}
          <div className="hidden md:flex items-center space-x-6 text-white">
            <Link to="/cart" className="flex items-center">
              <div className="relative">
                <FiShoppingCart size={24} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-400 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border-5">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="ml-2">Giỏ hàng</span>
            </Link>

            {isLoggedIn ? (
              <div className="relative">
                <button className="flex items-center" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                  <FiUser size={24} />
                  <span className="ml-2">{user.name}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Thông tin tài khoản
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Đơn hàng của tôi
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Quản trị
                        </Link>
                      )}
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={handleLogout}
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center">
                <FiUser size={24} />
                <span className="ml-2">Đăng nhập</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Link to="/cart" className="mr-4 relative">
              <FiShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Search bar for mobile */}
        <div className="mt-4 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full py-2 px-4 pr-10 border border-gray-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="absolute right-0 top-0 h-full px-3 text-gray-dark">
              <FiSearch size={20} />
            </button>
          </form>
        </div>
      </div>

      {/* Categories navigation */}
      <nav className="bg-gray-light border-t border-b border-gray-medium">
        <div className="container-custom">
          {/* Desktop categories */}
          <ul className="hidden md:flex space-x-8 py-3">
            {categories.map((category) => (
              <li key={category.id}>
                <Link to={`/category/${category.slug}`} className="hover:text-primary transition-colors">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4">
              <ul className="space-y-4">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      to={`/category/${category.slug}`}
                      className="block hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
                <li className="border-t border-gray-medium pt-4 mt-4">
                  {isLoggedIn ? (
                    <>
                      <Link
                        to="/profile"
                        className="block py-2 hover:text-primary"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Thông tin tài khoản
                      </Link>
                      <Link to="/orders" className="block py-2 hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                        Đơn hàng của tôi
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          to="/admin"
                          className="block py-2 hover:text-primary"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Quản trị
                        </Link>
                      )}
                      <button
                        className="block w-full text-left py-2 hover:text-primary"
                        onClick={() => {
                          handleLogout()
                          setIsMenuOpen(false)
                        }}
                      >
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <Link to="/login" className="block py-2 hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                      Đăng nhập
                    </Link>
                  )}
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Header

