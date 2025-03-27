import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import CategoryService from "../../services/category.service"

// Async thunk actions
export const fetchCategories = createAsyncThunk("categories/fetchCategories", async (_, { rejectWithValue }) => {
  try {
    const response = await CategoryService.getAllCategories()
    return response.data.categories
  } catch (error) {
    const message = error.response?.data?.message || "Không thể lấy danh sách danh mục"
    return rejectWithValue(message)
  }
})

export const fetchCategoryById = createAsyncThunk("categories/fetchCategoryById", async (id, { rejectWithValue }) => {
  try {
    const response = await CategoryService.getCategoryById(id)
    return response.data.category
  } catch (error) {
    const message = error.response?.data?.message || "Không thể lấy thông tin danh mục"
    return rejectWithValue(message)
  }
})

export const fetchCategoryBySlug = createAsyncThunk(
  "categories/fetchCategoryBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const response = await CategoryService.getCategoryBySlug(slug)
      return response.data.category
    } catch (error) {
      const message = error.response?.data?.message || "Không thể lấy thông tin danh mục"
      return rejectWithValue(message)
    }
  },
)

// Slice
const categorySlice = createSlice({
  name: "categories",
  initialState: {
    categories: [],
    category: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    resetCategoryError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false
        state.categories = action.payload
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch Category By ID
      .addCase(fetchCategoryById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.isLoading = false
        state.category = action.payload
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch Category By Slug
      .addCase(fetchCategoryBySlug.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCategoryBySlug.fulfilled, (state, action) => {
        state.isLoading = false
        state.category = action.payload
      })
      .addCase(fetchCategoryBySlug.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { resetCategoryError } = categorySlice.actions

export default categorySlice.reducer

