import { Link } from "react-router-dom"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

const Banner = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  }

  const banners = [
    {
      id: 1,
      image: "/images/banner1.jpg",
      title: "iPhone 13 Pro",
      description: "Khuyến mãi đặc biệt - Giảm đến 2 triệu",
      link: "/product/iphone-13-pro",
    },
    {
      id: 2,
      image: "/images/banner2.jpg",
      title: "Samsung Galaxy S21",
      description: "Mua ngay - Nhận quà hấp dẫn",
      link: "/product/samsung-galaxy-s21",
    },
    {
      id: 3,
      image: "/images/banner3.jpg",
      title: "Laptop Gaming",
      description: "Trả góp 0% - Ưu đãi lớn",
      link: "/category/laptop",
    },
  ]

  return (
    <div className="mb-8">
      <Slider {...settings}>
        {banners.map((banner) => (
          <div key={banner.id}>
            <div className="relative">
              <img
                src={banner.image || "/placeholder.svg"}
                alt={banner.title}
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center">
                <div className="container-custom">
                  <div className="max-w-lg text-white">
                    <h2 className="text-4xl font-bold mb-4">{banner.title}</h2>
                    <p className="text-xl mb-6">{banner.description}</p>
                    <Link to={banner.link} className="btn btn-primary">
                      Xem ngay
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  )
}

export default Banner

