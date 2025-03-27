import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import ProductService from "../../services/product.service"

// Async thunk actions
export const fetchProducts = createAsyncThunk("products/fetchProducts", async (params, { rejectWithValue }) => {
  try {
    const response = await ProductService.getAllProducts(params)
    return response.data
  } catch (error) {
    const message = error.response?.data?.message || "Không thể lấy danh sách sản phẩm"
    return rejectWithValue(message)
  }
})

export const fetchProductById = createAsyncThunk("products/fetchProductById", async (id, { rejectWithValue }) => {
  try {
    const response = await ProductService.getProductById(id)
    return response.data.product
  } catch (error) {
    const message = error.response?.data?.message || "Không thể lấy thông tin sản phẩm"
    return rejectWithValue(message)
  }
})

export const fetchProductBySlug = createAsyncThunk("products/fetchProductBySlug", async (slug, { rejectWithValue }) => {
  try {
    const response = await ProductService.getProductBySlug(slug)
    return response.data.product
  } catch (error) {
    const message = error.response?.data?.message || "Không thể lấy thông tin sản phẩm"
    return rejectWithValue(message)
  }
})

export const searchProducts = createAsyncThunk(
  "products/searchProducts",
  async ({ keyword, params }, { rejectWithValue }) => {
    try {
      const response = await ProductService.searchProducts(keyword, params)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || "Không thể tìm kiếm sản phẩm"
      return rejectWithValue(message)
    }
  },
)

export const fetchFeaturedProducts = createAsyncThunk(
  "products/fetchFeaturedProducts",
  async (limit = 8, { rejectWithValue }) => {
    try {
      const response = await ProductService.getFeaturedProducts(limit)
      return response.data.products
    } catch (error) {
      const message = error.response?.data?.message || "Không thể lấy sản phẩm nổi bật"
      return rejectWithValue(message)
    }
  },
)

export const fetchNewArrivals = createAsyncThunk(
  "products/fetchNewArrivals",
  async (limit = 8, { rejectWithValue }) => {
    try {
      const response = await ProductService.getNewArrivals(limit)
      return response.data.products
    } catch (error) {
      const message = error.response?.data?.message || "Không thể lấy sản phẩm mới"
      return rejectWithValue(message)
    }
  },
)

export const fetchBestSellers = createAsyncThunk(
  "products/fetchBestSellers",
  async (limit = 8, { rejectWithValue }) => {
    try {
      const response = await ProductService.getBestSellers(limit)
      return response.data.products
    } catch (error) {
      const message = error.response?.data?.message || "Không thể lấy sản phẩm bán chạy"
      return rejectWithValue(message)
    }
  },
)

export const fetchRelatedProducts = createAsyncThunk(
  "products/fetchRelatedProducts",
  async ({ productId, limit = 4 }, { rejectWithValue }) => {
    try {
      const response = await ProductService.getRelatedProducts(productId, limit)
      return response.data.products
    } catch (error) {
      const message = error.response?.data?.message || "Không thể lấy sản phẩm liên quan"
      return rejectWithValue(message)
    }
  },
)

// Slice
const productSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    product: null,
    featuredProducts: [],
    newArrivals: [],
    bestSellers: [],
    relatedProducts: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    },
    isLoading: false,
    error: null,
  },
  reducers: {
    resetProductError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.products = action.payload.products
        state.pagination = action.payload.pagination
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch Product By ID
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false
        state.product = action.payload
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch Product By Slug
      .addCase(fetchProductBySlug.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.isLoading = false
        state.product = action.payload
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Search Products
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.products = action.payload.products
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch Featured Products
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.featuredProducts = action.payload
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch New Arrivals
      .addCase(fetchNewArrivals.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchNewArrivals.fulfilled, (state, action) => {
        state.isLoading = false
        state.newArrivals = action.payload
      })
      .addCase(fetchNewArrivals.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch Best Sellers
      .addCase(fetchBestSellers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchBestSellers.fulfilled, (state, action) => {
        state.isLoading = false
        state.bestSellers = action.payload
      })
      .addCase(fetchBestSellers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch Related Products
      .addCase(fetchRelatedProducts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.relatedProducts = action.payload
      })
      .addCase(fetchRelatedProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { resetProductError } = productSlice.actions

export default productSlice.reducer

