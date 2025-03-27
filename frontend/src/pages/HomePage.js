"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import Layout from "../components/layout/Layout"
import Banner from "../components/ui/Banner"
import ProductSlider from "../components/ui/ProductSlider"
import Spinner from "../components/ui/Spinner"
import { fetchFeaturedProducts, fetchNewArrivals, fetchBestSellers } from "../features/products/productSlice"

const HomePage = () => {
  const dispatch = useDispatch()
  const { featuredProducts, newArrivals, bestSellers, isLoading } = useSelector((state) => state.products)

  useEffect(() => {
    dispatch(fetchFeaturedProducts())
    dispatch(fetchNewArrivals())
    dispatch(fetchBestSellers())
  }, [dispatch])

  return (
    <Layout>
      <Banner />

      <div className="container-custom py-8">
        {isLoading ? (
          <div className="py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <ProductSlider title="Sản phẩm nổi bật" products={featuredProducts} />
            <ProductSlider title="Sản phẩm mới" products={newArrivals} />
            <ProductSlider title="Sản phẩm bán chạy" products={bestSellers} />
          </>
        )}
      </div>
    </Layout>
  )
}

export default HomePage

