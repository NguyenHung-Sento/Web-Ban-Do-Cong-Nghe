import { Link } from "react-router-dom"
import Layout from "../components/layout/Layout"
import { FiAlertTriangle } from "react-icons/fi"

const NotFoundPage = () => {
  return (
    <Layout>
      <div className="container-custom py-20">
        <div className="max-w-lg mx-auto text-center">
          <FiAlertTriangle size={80} className="mx-auto text-primary mb-6" />
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <h2 className="text-2xl font-bold mb-6">Trang không tồn tại</h2>
          <p className="text-gray-dark mb-8">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link to="/" className="btn btn-primary">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    </Layout>
  )
}

export default NotFoundPage

