const crypto = require("crypto")
const moment = require("moment")

const vnpayConfig = {
  tmnCode: process.env.VNPAY_TMN_CODE,
  hashSecret: process.env.VNPAY_HASH_SECRET,
  url: process.env.VNPAY_URL,
  returnUrl: process.env.VNPAY_RETURN_URL,
}

// Function to sort object by key (required by VNPay)
function sortObject(obj) {
  const sorted = {}
  const str = []
  let key
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key))
    }
  }
  str.sort()
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+")
  }
  return sorted
}

const VNPayUtil = {
  createPayment: (orderId, amount, orderInfo, ipAddr, locale = "vn") => {
    // Set timezone to Vietnam
    process.env.TZ = "Asia/Ho_Chi_Minh"

    // Format dates according to VNPay requirements
    const date = new Date()
    const createDate = moment(date).format("YYYYMMDDHHmmss")

    // Ensure we have a valid IP address
    ipAddr = ipAddr || "127.0.0.1"

    // Create a unique transaction reference
    const txnRef = `${orderId}${moment(date).format("HHmmss")}`

    // Ensure amount is a number and convert to VNPay format (amount * 100, no decimal)
    amount = Math.floor(Number.parseFloat(amount) * 100)

    // Create VNPay parameters
    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: vnpayConfig.tmnCode,
      vnp_Locale: locale === "en" ? "en" : "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: orderInfo || `Thanh toan don hang #${orderId}`,
      vnp_OrderType: "billpayment",
      vnp_Amount: amount,
      vnp_ReturnUrl: vnpayConfig.returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    }

    // Sort parameters before signing (required by VNPay)
    vnp_Params = sortObject(vnp_Params)

    // Create signature exactly as VNPay documentation specifies
    const signData = Object.keys(vnp_Params)
      .map((key) => `${key}=${vnp_Params[key]}`)
      .join("&")

    const hmac = crypto.createHmac("sha512", vnpayConfig.hashSecret)
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex")

    // Add signature to parameters
    vnp_Params["vnp_SecureHash"] = signed

    // Create payment URL
    const paymentUrl =
      `${vnpayConfig.url}?` +
      Object.keys(vnp_Params)
        .map((key) => `${key}=${vnp_Params[key]}`)
        .join("&")

    console.log("Generated VNPay URL:", paymentUrl)

    return {
      paymentUrl,
      txnRef: txnRef,
    }
  },

  verifyReturnUrl: (vnpParams) => {
    // Get secure hash from params
    const secureHash = vnpParams.vnp_SecureHash

    // Remove secure hash from params
    delete vnpParams.vnp_SecureHash
    if (vnpParams.vnp_SecureHashType) {
      delete vnpParams.vnp_SecureHashType
    }

    // Sort params alphabetically
    const sortedParams = sortObject(vnpParams)

    // Create query string
    const signData = Object.keys(sortedParams)
      .map((key) => `${key}=${sortedParams[key]}`)
      .join("&")

    // Create signature
    const hmac = crypto.createHmac("sha512", vnpayConfig.hashSecret)
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex")

    // Compare signatures
    return secureHash === signed
  },
}

module.exports = VNPayUtil
