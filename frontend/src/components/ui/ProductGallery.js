"use client"
import { useState, useEffect, useRef } from "react"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"

const ProductGallery = ({ product, selectedColor, onImageChange }) => {
  const [activeImage, setActiveImage] = useState(0)
  const [images, setImages] = useState([])
  const mainSliderRef = useRef(null)
  const thumbnailSliderRef = useRef(null)

  useEffect(() => {
    // Initialize images array
    let productImages = []

    // Add main product image
    if (product.image) {
      productImages.push(product.image)
    }

    // Add additional product images if available
    if (product.images && Array.isArray(product.images)) {
      productImages = [...productImages, ...product.images]
    }

    // Add variant images to the gallery if they exist
    if (product.variants) {
      const variants = typeof product.variants === "string" ? JSON.parse(product.variants) : product.variants

      if (variants.colors) {
        // Add all color variant images to the gallery
        variants.colors.forEach((color) => {
          if (color.image && !productImages.includes(color.image)) {
            productImages.push(color.image)
          }
        })
      }
    }

    setImages(productImages)

    // If a color is selected, find its image and make it active
    if (selectedColor && product.variants) {
      const variants = typeof product.variants === "string" ? JSON.parse(product.variants) : product.variants

      if (variants.colors) {
        const selectedColorOption = variants.colors.find((c) => c.value === selectedColor)
        if (selectedColorOption && selectedColorOption.image) {
          // Find the index of the variant image in our images array
          const variantImageIndex = productImages.findIndex((img) => img === selectedColorOption.image)
          if (variantImageIndex >= 0) {
            setActiveImage(variantImageIndex)
            // Sync the sliders to the selected image
            if (mainSliderRef.current) {
              mainSliderRef.current.slickGoTo(variantImageIndex)
            }
            // Notify parent component about the current active image
            if (onImageChange) {
              onImageChange(selectedColorOption.image)
            }
            return // Exit early since we've set the active image
          }
        }
      }
    }

    // Default to first image if no variant is selected or variant image not found
    setActiveImage(0)

    // Notify parent component about the current active image
    if (productImages.length > 0 && onImageChange) {
      onImageChange(productImages[0])
    }
  }, [product, selectedColor, onImageChange])

  const handleThumbnailClick = (index) => {
    setActiveImage(index)
    if (mainSliderRef.current) {
      mainSliderRef.current.slickGoTo(index)
    }
    if (onImageChange && images[index]) {
      onImageChange(images[index])
    }
  }

  // Custom arrows for main slider
  const NextArrow = (props) => {
    const { onClick } = props
    return (
      <button
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 mr-2"
        onClick={onClick}
      >
        <FiChevronRight size={24} />
      </button>
    )
  }

  const PrevArrow = (props) => {
    const { onClick } = props
    return (
      <button
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 ml-2"
        onClick={onClick}
      >
        <FiChevronLeft size={24} />
      </button>
    )
  }

  // Settings for main image slider
  const mainSliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    beforeChange: (current, next) => {
      setActiveImage(next)
      if (thumbnailSliderRef.current) {
        thumbnailSliderRef.current.slickGoTo(next)
      }
      if (onImageChange && images[next]) {
        onImageChange(images[next])
      }
    },
  }

  // Settings for thumbnail slider
  const thumbnailSliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    arrows: true,
    focusOnSelect: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 3,
        },
      },
    ],
  }

  if (!product || images.length === 0) {
    return (
      <div className="flex justify-center items-center h-80 bg-gray-100 rounded-lg">
        <span className="text-gray-500">No image available</span>
      </div>
    )
  }

  return (
    <div className="product-gallery">
      {/* Main large image slider */}
      <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
        <Slider {...mainSliderSettings} ref={mainSliderRef}>
          {images.map((image, index) => (
            <div key={index} className="outline-none">
              <img
                src={image || "/placeholder.svg"}
                alt={`${product.name} - ${index + 1}`}
                className="w-full h-80 object-contain"
              />
            </div>
          ))}
        </Slider>
      </div>

      {/* Thumbnails slider */}
      {images.length > 1 && (
        <div className="px-2">
          <Slider {...thumbnailSliderSettings} ref={thumbnailSliderRef}>
            {images.map((image, index) => (
              <div key={index} className="px-1 outline-none">
                <button
                  onClick={() => handleThumbnailClick(index)}
                  className={`border-2 rounded-md p-1 w-full ${activeImage === index ? "border-primary" : "border-gray-medium"}`}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} - ${index + 1}`}
                    className="w-full h-16 object-contain"
                  />
                </button>
              </div>
            ))}
          </Slider>
        </div>
      )}
    </div>
  )
}

export default ProductGallery

