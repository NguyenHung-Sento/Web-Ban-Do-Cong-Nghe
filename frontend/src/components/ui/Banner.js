"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"
import BannerService from "../../services/banner.service"

const Banner = () => {
  const [banners, setBanners] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await BannerService.getActiveBanners()
      if (response.data.status === "success") {
        setBanners(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching banners:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length)
      }, 5000)

      return () => clearInterval(timer)
    }
  }, [banners.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  if (isLoading) {
    return (
      <div className="relative h-96 bg-gray-200 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400">Đang tải banner...</div>
        </div>
      </div>
    )
  }

  if (banners.length === 0) {
    return (
      <div className="relative h-96 bg-gradient-to-r from-primary to-primary-dark">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Chào mừng đến với DigitalW</h2>
            <p className="text-xl mb-6">Khám phá những sản phẩm công nghệ tuyệt vời</p>
            <Link
              to="/products"
              className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Xem sản phẩm
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-96 overflow-hidden">
      {/* Banner Slides */}
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div key={banner.id} className="w-full h-full flex-shrink-0 relative">
            <img
              src={banner.image_url || "/placeholder.svg"}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center">
              <div className="container-custom">
                <div className="max-w-2xl text-white">
                  {banner.subtitle && <p className="text-lg mb-2 opacity-90">{banner.subtitle}</p>}
                  <h2 className="text-4xl md:text-5xl font-bold mb-4">{banner.title}</h2>
                  {banner.description && <p className="text-lg mb-6 opacity-90">{banner.description}</p>}
                  {banner.link_url && banner.button_text && (
                    <Link
                      to={banner.link_url}
                      className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors inline-block"
                    >
                      {banner.button_text}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
          >
            <FiChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
          >
            <FiChevronRight size={24} />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? "bg-white" : "bg-white bg-opacity-50 hover:bg-opacity-75"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Banner
