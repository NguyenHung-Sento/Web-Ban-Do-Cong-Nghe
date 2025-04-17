"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX } from "react-icons/fi"
import { fetchCategories } from "../../features/products/categorySlice"
import { logout } from "../../features/auth/authSlice"
import ProductService from "../../services/product.service"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef(null)
  const timeoutRef = useRef(null)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { categories } = useSelector((state) => state.categories)
  const { isLoggedIn, user } = useSelector((state) => state.auth)
  const { totalItems } = useSelector((state) => state.cart)

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [])

  // Debounce search input to prevent too many API calls
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (searchTerm.trim().length > 1) {
      setIsLoading(true)
      timeoutRef.current = setTimeout(async () => {
        try {
          const response = await ProductService.searchProducts(searchTerm, { limit: 5 })
          setSuggestions(response.data.products || [])
          setShowSuggestions(true)
        } catch (error) {
          console.error("Error fetching search suggestions:", error)
          setSuggestions([])
        } finally {
          setIsLoading(false)
        }
      }, 300) // 300ms debounce
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [searchTerm])

  // Update the handleSuggestionClick function to prevent event propagation
  const handleSuggestionClick = (slug, e) => {
    // Stop event propagation to prevent handleClickOutside from being triggered
    if (e) {
      e.stopPropagation()
    }
    navigate(`/product/${slug}`)
    setSearchTerm("")
    setShowSuggestions(false)
  }

  // Update the handleSearch function to prevent event propagation
  const handleSearch = (e) => {
    e.preventDefault()
    // Stop event propagation to prevent handleClickOutside from being triggered
    e.stopPropagation()
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`)
      setSearchTerm("")
      setShowSuggestions(false)
    }
  }

  // Function to highlight matching text in suggestions
  const highlightMatch = (text, query) => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi")
    return text.replace(regex, '<mark class="bg-yellow-200 text-gray-900">$1</mark>')
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate("/login")
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
      <div className="py-4 bg-primary">
        <div className="flex items-center justify-between px-32">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-white">
            CellPhone
          </Link>

          {/* Search bar - hidden on mobile */}
          <div className="hidden md:block w-1/3 relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full py-2 px-4 pr-10 border border-gray-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setShowSuggestions(true)
                  }
                }}
              />
              <button type="submit" className="absolute right-0 top-0 h-full px-3 text-gray-dark">
                <FiSearch size={20} />
              </button>
            </form>

            {/* Search suggestions */}
            {showSuggestions && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto">
                {isLoading ? (
                  <div className="p-3 text-center text-gray-500">Đang tìm kiếm...</div>
                ) : suggestions.length > 0 ? (
                  <ul>
                    {suggestions.map((product) => (
                      <li
                        key={product.id}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer"
                        onClick={(e) => handleSuggestionClick(product.slug, e)}
                      >
                        <div className="flex items-center p-2">
                          <div className="w-12 h-12 flex-shrink-0">
                            <img
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="ml-3 flex-grow">
                            <p
                              className="text-sm font-medium text-gray-900"
                              dangerouslySetInnerHTML={{
                                __html: highlightMatch(product.name, searchTerm),
                              }}
                            ></p>
                            <p className="text-sm text-primary font-semibold">
                              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                product.price,
                              )}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-3 text-center text-gray-500">Không tìm thấy sản phẩm</div>
                )}
                <div className="p-2 text-center border-t border-gray-100">
                  <button
                    className="text-sm text-primary hover:underline"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSearch(e)
                    }}
                  >
                    Xem tất cả kết quả
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation for desktop */}
          <div className="hidden md:flex items-center space-x-6 text-white">
            <Link to="/cart" className="flex items-center">
              <div className="relative">
                <FiShoppingCart size={24} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
        <div className="mt-4 md:hidden px-4 relative" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full py-2 px-4 pr-10 border border-gray-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true)
                }
              }}
            />
            <button type="submit" className="absolute right-0 top-0 h-full px-3 text-gray-dark">
              <FiSearch size={20} />
            </button>
          </form>

          {/* Mobile search suggestions */}
          {showSuggestions && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="p-3 text-center text-gray-500">Đang tìm kiếm...</div>
              ) : suggestions.length > 0 ? (
                <ul>
                  {suggestions.map((product) => (
                    <li
                      key={product.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer"
                      onClick={(e) => handleSuggestionClick(product.slug, e)}
                    >
                      <div className="flex items-center p-2">
                        <div className="w-12 h-12 flex-shrink-0">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-3 flex-grow">
                          <p
                            className="text-sm font-medium text-gray-900"
                            dangerouslySetInnerHTML={{
                              __html: highlightMatch(product.name, searchTerm),
                            }}
                          ></p>
                          <p className="text-sm text-primary font-semibold">
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                              product.price,
                            )}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-3 text-center text-gray-500">Không tìm thấy sản phẩm</div>
              )}
              <div className="p-2 text-center border-t border-gray-100">
                <button
                  className="text-sm text-primary hover:underline"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSearch(e)
                  }}
                >
                  Xem tất cả kết quả
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Categories navigation */}
      <nav className="bg-gray-light border-t border-b border-gray-medium">
        <div className="container-custom">
          {/* Desktop categories */}
          <ul className="hidden md:flex space-x-8 py-3">
            {categories.map((category) => (
              <li key={category.id}>
                <Link to={`/products?category_id=${category.id}`} className="hover:text-primary transition-colors">
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
                      to={`/products?category_id=${category.id}`}
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
