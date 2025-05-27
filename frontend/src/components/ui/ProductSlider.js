"use client"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import ProductCard from "./ProductCard"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"

const NextArrow = ({ onClick }) => (
  <button
    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2"
    onClick={onClick}
  >
    <FiChevronRight size={24} />
  </button>
)

const PrevArrow = ({ onClick }) => (
  <button
    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2"
    onClick={onClick}
  >
    <FiChevronLeft size={24} />
  </button>
)

const ProductSlider = ({ title, products }) => {
  if (!products || products.length === 0) return null

  const isMultiple = products.length > 1

  const settings = {
    dots: false,
    infinite: products.length > 4,
    speed: 500,
    slidesToShow: Math.min(products.length, 4),
    slidesToScroll: 1,
    arrows: isMultiple,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(products.length, 3),
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(products.length, 2),
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  }

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="relative">
        {isMultiple ? (
          <Slider {...settings}>
            {products.map((product) => (
              <div key={product.id} className="px-2">
                <ProductCard product={product} />
              </div>
            ))}
          </Slider>
        ) : (
          // Nếu chỉ có 1 sản phẩm thì hiển thị đơn giản không dùng slider
          <div className="flex justify-start">
            <div className="w-[250px] px-2">
              <ProductCard product={products[0]} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductSlider
