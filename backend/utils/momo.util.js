const crypto = require("crypto")
const axios = require("axios")

const momoConfig = {
  endpoint: process.env.MOMO_ENDPOINT,
  partnerCode: process.env.MOMO_PARTNER_CODE,
  accessKey: process.env.MOMO_ACCESS_KEY,
  secretKey: process.env.MOMO_SECRET_KEY,
  returnUrl: process.env.MOMO_RETURN_URL,
  notifyUrl: process.env.MOMO_NOTIFY_URL,
}

const MomoUtil = {
  createPayment: async (orderId, amount, orderInfo) => {
    try {
      // Create request data
      const requestId = `${Date.now()}_${Math.floor(Math.random() * 1000000)}`
      const requestData = {
        partnerCode: momoConfig.partnerCode,
        accessKey: momoConfig.accessKey,
        requestId: requestId,
        amount: amount,
        orderId: `MOMO_${orderId}_${requestId}`,
        orderInfo: orderInfo || `Thanh toán đơn hàng #${orderId}`,
        returnUrl: momoConfig.returnUrl,
        notifyUrl: momoConfig.notifyUrl,
        extraData: Buffer.from(JSON.stringify({ orderId })).toString("base64"),
        requestType: "captureWallet",
      }

      // Create signature
      const rawSignature = `accessKey=${requestData.accessKey}&amount=${requestData.amount}&extraData=${requestData.extraData}&ipnUrl=${requestData.notifyUrl}&orderId=${requestData.orderId}&orderInfo=${requestData.orderInfo}&partnerCode=${requestData.partnerCode}&redirectUrl=${requestData.returnUrl}&requestId=${requestData.requestId}&requestType=${requestData.requestType}`

      const signature = crypto.createHmac("sha256", momoConfig.secretKey).update(rawSignature).digest("hex")

      requestData.signature = signature

      // Send request to Momo
      const response = await axios.post(momoConfig.endpoint, requestData)

      return response.data
    } catch (error) {
      console.error("Momo payment error:", error.response ? error.response.data : error.message)
      throw new Error("Failed to create Momo payment")
    }
  },

  verifySignature: (requestData) => {
    // Extract data from request
    const {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = requestData

    // Create raw signature
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`

    // Create signature
    const calculatedSignature = crypto.createHmac("sha256", momoConfig.secretKey).update(rawSignature).digest("hex")

    // Compare signatures
    return calculatedSignature === signature
  },
}

module.exports = MomoUtil
