"use client"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import ProductCard from "./ProductCard"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"

const NextArrow = (props) => {
  const { onClick } = props
  return (
    <button
      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2"
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
      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2"
      onClick={onClick}
    >
      <FiChevronLeft size={24} />
    </button>
  )
}

const ProductSlider = ({ title, products }) => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
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

  if (!products || products.length === 0) return null

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="relative">
        <Slider {...settings}>
          {products.map((product) => (
            <div key={product.id} className="px-2">
              <ProductCard product={product} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  )
}

export default ProductSlider

