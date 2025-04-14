"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"
import Layout from "../components/layout/Layout"
import ProductCard from "../components/ui/ProductCard"
import Spinner from "../components/ui/Spinner"
import Pagination from "../components/ui/Pagination"
import { fetchProducts } from "../features/products/productSlice"
import { FiFilter, FiX } from "react-icons/fi"

const ProductListPage = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()

  const { products, pagination, isLoading } = useSelector((state) => state.products)
  const { categories } = useSelector((state) => state.categories)

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    category_id: "",
    brand: "",
    price_min: "",
    price_max: "",
    sort: "newest",
    search: "",
  })

  // Get query params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const page = searchParams.get("page") || 1
    const category_id = searchParams.get("category_id") || ""
    const brand = searchParams.get("brand") || ""
    const price_min = searchParams.get("price_min") || ""
    const price_max = searchParams.get("price_max") || ""
    const sort = searchParams.get("sort") || "newest"
    const search = searchParams.get("search") || ""

    // Update the filters state with values from URL
    setFilters({
      category_id,
      brand,
      price_min,
      price_max,
      sort,
      search,
    })

    // Fetch products with the filters
    dispatch(
      fetchProducts({
        page,
        limit: 12,
        category_id,
        brand,
        price_min,
        price_max,
        sort,
        search,
      }),
    )
  }, [dispatch, location.search])

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))

    // Apply sort filter immediately
    if (name === "sort") {
      const searchParams = new URLSearchParams(location.search)
      searchParams.set(name, value)
      navigate(`/products?${searchParams.toString()}`)
    }
  }

  // Apply filters
  const applyFilters = () => {
    const searchParams = new URLSearchParams()

    // Add page parameter
    searchParams.append("page", 1) // Reset to page 1 when applying new filters

    // Add all non-empty filters to the URL
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        searchParams.append(key, value)
      }
    })

    navigate(`/products?${searchParams.toString()}`)
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({
      category_id: "",
      brand: "",
      price_min: "",
      price_max: "",
      sort: "newest",
      search: "",
    })

    navigate("/products")
  }

  // Handle page change
  const handlePageChange = (page) => {
    const searchParams = new URLSearchParams(location.search)
    searchParams.set("page", page)
    navigate(`/products?${searchParams.toString()}`)
  }

  // Get unique brands from products
  const brands = [...new Set(products.map((product) => product.brand))]

  // Determine if we're in search mode
  const isSearchMode = !!filters.search

  return (
    <Layout>
      <div className="container-custom py-8">
        <div className="flex justify-between items-center mb-6">
          <h1>
            {isSearchMode
              ? `Kết quả tìm kiếm cho "${filters.search}"`
              : filters.category_id
                ? categories.find((c) => c.id.toString() === filters.category_id)?.name || "Sản phẩm"
                : "Tất cả sản phẩm"}
          </h1>

          <div className="flex items-center">
            <div className="hidden md:block">
              <select name="sort" value={filters.sort} onChange={handleFilterChange} className="form-input">
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá: Thấp đến cao</option>
                <option value="price_desc">Giá: Cao đến thấp</option>
                <option value="name_asc">Tên: A-Z</option>
                <option value="name_desc">Tên: Z-A</option>
              </select>
            </div>

            <button className="md:hidden btn btn-outline flex items-center ml-2" onClick={() => setIsFilterOpen(true)}>
              <FiFilter className="mr-2" />
              Lọc
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Filters - Desktop */}
          <div className="hidden md:block w-64 mr-8">
            {isSearchMode && (
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <h3 className="font-bold text-lg mb-4">Tìm kiếm</h3>
                <p className="text-gray-600 mb-2">Đang tìm kiếm: "{filters.search}"</p>
                <button
                  onClick={() => {
                    const searchParams = new URLSearchParams(location.search)
                    searchParams.delete("search")
                    navigate(`/products?${searchParams.toString()}`)
                  }}
                  className="text-primary hover:underline text-sm"
                >
                  Xóa tìm kiếm
                </button>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h3 className="font-bold text-lg mb-4">Danh mục</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="all-categories"
                    name="category_id"
                    value=""
                    checked={filters.category_id === ""}
                    onChange={handleFilterChange}
                    className="mr-2"
                  />
                  <label htmlFor="all-categories">Tất cả</label>
                </div>

                {categories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <input
                      type="radio"
                      id={`category-${category.id}`}
                      name="category_id"
                      value={category.id}
                      checked={filters.category_id === category.id.toString()}
                      onChange={handleFilterChange}
                      className="mr-2"
                    />
                    <label htmlFor={`category-${category.id}`}>{category.name}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h3 className="font-bold text-lg mb-4">Thương hiệu</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="all-brands"
                    name="brand"
                    value=""
                    checked={filters.brand === ""}
                    onChange={handleFilterChange}
                    className="mr-2"
                  />
                  <label htmlFor="all-brands">Tất cả</label>
                </div>

                {brands.map((brand) => (
                  <div key={brand} className="flex items-center">
                    <input
                      type="radio"
                      id={`brand-${brand}`}
                      name="brand"
                      value={brand}
                      checked={filters.brand === brand}
                      onChange={handleFilterChange}
                      className="mr-2"
                    />
                    <label htmlFor={`brand-${brand}`}>{brand}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h3 className="font-bold text-lg mb-4">Giá</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="price_min" className="block mb-1">
                    Từ:
                  </label>
                  <input
                    type="number"
                    id="price_min"
                    name="price_min"
                    value={filters.price_min}
                    onChange={handleFilterChange}
                    className="form-input"
                    placeholder="VNĐ"
                  />
                </div>

                <div>
                  <label htmlFor="price_max" className="block mb-1">
                    Đến:
                  </label>
                  <input
                    type="number"
                    id="price_max"
                    name="price_max"
                    value={filters.price_max}
                    onChange={handleFilterChange}
                    className="form-input"
                    placeholder="VNĐ"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button onClick={applyFilters} className="btn btn-primary flex-1">
                Áp dụng
              </button>

              <button onClick={resetFilters} className="btn btn-outline flex-1">
                Đặt lại
              </button>
            </div>
          </div>

          {/* Products */}
          <div className="flex-1">
            {isLoading ? (
              <div className="py-20">
                <Spinner size="lg" />
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h3 className="text-xl font-bold mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-dark mb-4">
                  {isSearchMode
                    ? `Không tìm thấy sản phẩm nào phù hợp với từ khóa "${filters.search}"`
                    : "Không có sản phẩm nào phù hợp với bộ lọc của bạn."}
                </p>
                <button onClick={resetFilters} className="btn btn-primary">
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sidebar */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsFilterOpen(false)}></div>

          <div className="absolute top-0 right-0 w-80 h-full bg-white shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-lg">Lọc sản phẩm</h3>
              <button onClick={() => setIsFilterOpen(false)}>
                <FiX size={24} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
              {isSearchMode && (
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-4">Tìm kiếm</h3>
                  <p className="text-gray-600 mb-2">Đang tìm kiếm: "{filters.search}"</p>
                  <button
                    onClick={() => {
                      const searchParams = new URLSearchParams(location.search)
                      searchParams.delete("search")
                      navigate(`/products?${searchParams.toString()}`)
                    }}
                    className="text-primary hover:underline text-sm"
                  >
                    Xóa tìm kiếm
                  </button>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-bold text-lg mb-4">Sắp xếp</h3>
                <select name="sort" value={filters.sort} onChange={handleFilterChange} className="form-input">
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá: Thấp đến cao</option>
                  <option value="price_desc">Giá: Cao đến thấp</option>
                  <option value="name_asc">Tên: A-Z</option>
                  <option value="name_desc">Tên: Z-A</option>
                </select>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-lg mb-4">Danh mục</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="mobile-all-categories"
                      name="category_id"
                      value=""
                      checked={filters.category_id === ""}
                      onChange={handleFilterChange}
                      className="mr-2"
                    />
                    <label htmlFor="mobile-all-categories">Tất cả</label>
                  </div>

                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <input
                        type="radio"
                        id={`mobile-category-${category.id}`}
                        name="category_id"
                        value={category.id}
                        checked={filters.category_id === category.id.toString()}
                        onChange={handleFilterChange}
                        className="mr-2"
                      />
                      <label htmlFor={`mobile-category-${category.id}`}>{category.name}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-lg mb-4">Thương hiệu</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="mobile-all-brands"
                      name="brand"
                      value=""
                      checked={filters.brand === ""}
                      onChange={handleFilterChange}
                      className="mr-2"
                    />
                    <label htmlFor="mobile-all-brands">Tất cả</label>
                  </div>

                  {brands.map((brand) => (
                    <div key={brand} className="flex items-center">
                      <input
                        type="radio"
                        id={`mobile-brand-${brand}`}
                        name="brand"
                        value={brand}
                        checked={filters.brand === brand}
                        onChange={handleFilterChange}
                        className="mr-2"
                      />
                      <label htmlFor={`mobile-brand-${brand}`}>{brand}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-lg mb-4">Giá</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="mobile-price_min" className="block mb-1">
                      Từ:
                    </label>
                    <input
                      type="number"
                      id="mobile-price_min"
                      name="price_min"
                      value={filters.price_min}
                      onChange={handleFilterChange}
                      className="form-input"
                      placeholder="VNĐ"
                    />
                  </div>

                  <div>
                    <label htmlFor="mobile-price_max" className="block mb-1">
                      Đến:
                    </label>
                    <input
                      type="number"
                      id="mobile-price_max"
                      name="price_max"
                      value={filters.price_max}
                      onChange={handleFilterChange}
                      className="form-input"
                      placeholder="VNĐ"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button onClick={applyFilters} className="btn btn-primary flex-1">
                  Áp dụng
                </button>

                <button onClick={resetFilters} className="btn btn-outline flex-1">
                  Đặt lại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default ProductListPage
