import { Link } from "react-router-dom"
import { FiFacebook, FiInstagram, FiYoutube, FiMapPin, FiPhone, FiMail } from "react-icons/fi"

const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-12 pb-6">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">DigitalW</h3>
            <p className="text-gray-400 mb-4">
              DigitalW - Hệ thống bán lẻ điện thoại, máy tính, thiết bị công nghệ chính hãng với hơn 100 cửa hàng trên
              toàn quốc.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-white hover:text-primary">
                <FiFacebook size={24} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="text-white hover:text-primary"
              >
                <FiInstagram size={24} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-white hover:text-primary">
                <FiYoutube size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-white">
                  Tin tức
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-xl font-bold mb-4">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-400 hover:text-white">
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link to="/return" className="text-gray-400 hover:text-white">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link to="/warranty" className="text-gray-400 hover:text-white">
                  Chính sách bảo hành
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">Thông tin liên hệ</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FiMapPin className="mt-1 mr-3 text-primary" size={18} />
                <span className="text-gray-400">543 Nguyễn Trãi, phường Thanh Xuân Nam. quận Thanh Xuân, Thành phố Hà Nội, Việt Nam</span>
              </li>
              <li className="flex items-center">
                <FiPhone className="mr-3 text-primary" size={18} />
                <span className="text-gray-400">024.7303.0119</span>
              </li>
              <li className="flex items-center">
                <FiMail className="mr-3 text-primary" size={18} />
                <span className="text-gray-400">info@digitalw.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} DigitalW. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex space-x-4">
              <img src="/images/payment-visa.png" alt="Visa" className="h-8" />
              <img src="/images/payment-mastercard.png" alt="Mastercard" className="h-8" />
              <img src="/images/payment-vnpay.png" alt="VNPay" className="h-8" />
              <img src="/images/payment-momo.png" alt="MoMo" className="h-8" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

