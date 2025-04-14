"use client"

import { useState, useEffect } from "react"
import { FiCopy, FiCheck, FiDownload } from "react-icons/fi"
import PaymentService from "../../services/payment.service"
import Spinner from "../ui/Spinner"

const BankTransferPayment = ({ orderId, amount, onPaymentProcessed, ...props }) => {
  const [banks, setBanks] = useState([])
  const [selectedBank, setSelectedBank] = useState(null)
  const [orderCode, setOrderCode] = useState("")
  const [transferContent, setTransferContent] = useState("")
  const [qrCode, setQrCode] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState({
    accountNumber: false,
    transferContent: false,
    amount: false,
  })
  // Thêm state để lưu payment_id
  const [paymentId, setPaymentId] = useState(null)

  // Thêm state để theo dõi trạng thái thanh toán
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)

  // Thêm hàm xác nhận thanh toán
  const confirmPayment = () => {
    // Trong môi trường thực tế, đây là nơi bạn sẽ kiểm tra xem người dùng đã thanh toán chưa
    // Ví dụ: gọi API để kiểm tra trạng thái thanh toán

    // Đánh dấu là đã thanh toán và gọi callback
    setPaymentConfirmed(true)
    if (paymentId) {
      onPaymentProcessed(paymentId)
    }
  }

  // Sửa useEffect để tự động tạo QR code cho ngân hàng đầu tiên
  useEffect(() => {
    const processPayment = async () => {
      // If payment processing has already started, don't process again
      if (props.paymentProcessingStarted) return

      try {
        setLoading(true)
        const response = await PaymentService.processPayment({
          order_id: orderId,
          payment_method: "bank_transfer",
        })

        setBanks(response.data.bank_accounts)
        setOrderCode(response.data.order_code)
        setTransferContent(response.data.transfer_content)

        // Lưu payment_id để sử dụng sau này
        setPaymentId(response.data.payment_id)

        // Nếu có ngân hàng, tự động chọn ngân hàng đầu tiên và tạo QR code
        if (response.data.bank_accounts && response.data.bank_accounts.length > 0) {
          const firstBank = response.data.bank_accounts[0]
          setSelectedBank(firstBank)

          // Tự động tạo QR code cho ngân hàng đầu tiên
          try {
            const qrResponse = await PaymentService.generateBankQR(firstBank.id, orderId)
            setQrCode(qrResponse.data.qr_code)
          } catch (qrError) {
            console.error("Không thể tạo mã QR cho ngân hàng đầu tiên:", qrError)
          }
        }
      } catch (error) {
        setError(error.response?.data?.message || "Không thể xử lý thanh toán")
      } finally {
        setLoading(false)
      }
    }

    processPayment()
  }, [orderId, onPaymentProcessed, props.paymentProcessingStarted])

  const handleBankSelect = async (bank) => {
    setSelectedBank(bank)

    try {
      const response = await PaymentService.generateBankQR(bank.id, orderId)
      setQrCode(response.data.qr_code)
    } catch (error) {
      console.error("Không thể tạo mã QR:", error)
    }
  }

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied({ ...copied, [field]: true })
      setTimeout(() => {
        setCopied({ ...copied, [field]: false })
      }, 2000)
    })
  }

  const downloadQRCode = () => {
    const link = document.createElement("a")
    link.href = qrCode
    link.download = `qr_code_${orderCode}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">Chuyển khoản ngân hàng</h3>

      <div className="mb-6">
        <p className="text-gray-700 mb-2">Vui lòng chuyển khoản theo thông tin dưới đây:</p>
        <p className="text-sm text-gray-500 mb-4">
          Sau khi chuyển khoản thành công, đơn hàng của bạn sẽ được xử lý trong vòng 24 giờ.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
          <p className="text-blue-700 text-sm">
            <strong>Lưu ý:</strong> Vui lòng ghi đúng nội dung chuyển khoản để chúng tôi có thể xác nhận thanh toán của
            bạn nhanh chóng.
          </p>
        </div>
      </div>

      {/* Danh sách ngân hàng */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Chọn ngân hàng:</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {banks.map((bank) => (
            <button
              key={bank.id}
              className={`border rounded-md p-3 flex flex-col items-center justify-center transition-colors ${
                selectedBank && selectedBank.id === bank.id
                  ? "border-primary bg-primary bg-opacity-5"
                  : "border-gray-200 hover:border-primary"
              }`}
              onClick={() => handleBankSelect(bank)}
            >
              <span className="font-medium text-sm">{bank.bank_name}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedBank && (
        <>
          {/* Thông tin chuyển khoản */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">Thông tin chuyển khoản:</h4>
            <div className="space-y-4 bg-gray-50 p-4 rounded-md">
              <div>
                <p className="text-sm text-gray-500">Ngân hàng</p>
                <p className="font-medium">{selectedBank.bank_name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Chủ tài khoản</p>
                <p className="font-medium">{selectedBank.account_holder}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Số tài khoản</p>
                <div className="flex items-center">
                  <p className="font-medium mr-2">{selectedBank.account_number}</p>
                  <button
                    onClick={() => copyToClipboard(selectedBank.account_number, "accountNumber")}
                    className="text-primary hover:text-primary-dark"
                  >
                    {copied.accountNumber ? <FiCheck /> : <FiCopy />}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Chi nhánh</p>
                <p className="font-medium">{selectedBank.bank_branch}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Số tiền</p>
                <div className="flex items-center">
                  <p className="font-medium text-primary mr-2">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)}
                  </p>
                  <button
                    onClick={() => copyToClipboard(amount.toString(), "amount")}
                    className="text-primary hover:text-primary-dark"
                  >
                    {copied.amount ? <FiCheck /> : <FiCopy />}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Nội dung chuyển khoản</p>
                <div className="flex items-center">
                  <p className="font-medium mr-2">{transferContent}</p>
                  <button
                    onClick={() => copyToClipboard(transferContent, "transferContent")}
                    className="text-primary hover:text-primary-dark"
                  >
                    {copied.transferContent ? <FiCheck /> : <FiCopy />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code */}
          {qrCode && (
            <div className="mb-6">
              <h4 className="font-medium mb-3">Quét mã QR để thanh toán:</h4>
              <div className="flex flex-col items-center">
                <img src={qrCode || "/placeholder.svg"} alt="QR Code" className="w-64 h-64 object-contain mb-3" />
                <p className="text-sm text-gray-600 text-center mb-3">
                  Sử dụng ứng dụng ngân hàng của bạn để quét mã QR này. Thông tin đơn hàng sẽ tự động được điền vào ứng
                  dụng ngân hàng.
                </p>
                <button onClick={downloadQRCode} className="flex items-center text-primary hover:text-primary-dark">
                  <FiDownload className="mr-1" /> Tải mã QR
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-6 mb-6">
        <button onClick={confirmPayment} className="w-full btn btn-primary" disabled={paymentConfirmed}>
          {paymentConfirmed ? "Đã xác nhận thanh toán" : "Tôi đã thanh toán"}
        </button>
        <p className="text-sm text-center mt-2 text-gray-600">
          Nhấn vào nút trên sau khi bạn đã hoàn tất việc chuyển khoản
        </p>
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-yellow-700 text-sm">
          <strong>Hướng dẫn:</strong> Sau khi chuyển khoản, vui lòng chụp màn hình giao dịch và gửi cho chúng tôi qua
          email hoặc hotline để được xác nhận nhanh chóng.
        </p>
      </div>
    </div>
  )
}

export default BankTransferPayment
