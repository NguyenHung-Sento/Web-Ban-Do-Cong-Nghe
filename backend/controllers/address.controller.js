const Address = require("../models/address.model")

// Lấy tất cả địa chỉ của user hiện tại
exports.getUserAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.findByUserId(req.user.id)

    res.json({
      status: "success",
      data: {
        addresses,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Lấy địa chỉ mặc định của user
exports.getDefaultAddress = async (req, res, next) => {
  try {
    const address = await Address.findDefaultByUserId(req.user.id)

    res.json({
      status: "success",
      data: {
        address,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Tạo địa chỉ mới
exports.createAddress = async (req, res, next) => {
  try {
    const { address_text, is_default } = req.body

    if (!address_text || address_text.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Địa chỉ không được để trống",
      })
    }

    const addressData = {
      user_id: req.user.id,
      address_text: address_text.trim(),
      is_default: is_default || false,
    }

    const addressId = await Address.create(addressData)

    res.status(201).json({
      status: "success",
      message: "Tạo địa chỉ thành công",
      data: {
        id: addressId,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Cập nhật địa chỉ
exports.updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params
    const { address_text, is_default } = req.body

    // Kiểm tra quyền sở hữu
    const hasOwnership = await Address.checkOwnership(id, req.user.id)
    if (!hasOwnership) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy địa chỉ",
      })
    }

    if (!address_text || address_text.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Địa chỉ không được để trống",
      })
    }

    const addressData = {
      address_text: address_text.trim(),
      is_default: is_default || false,
    }

    const success = await Address.update(id, addressData)

    if (!success) {
      return res.status(404).json({
        status: "error",
        message: "Không thể cập nhật địa chỉ",
      })
    }

    res.json({
      status: "success",
      message: "Cập nhật địa chỉ thành công",
    })
  } catch (error) {
    next(error)
  }
}

// Xóa địa chỉ
exports.deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params

    // Kiểm tra quyền sở hữu
    const hasOwnership = await Address.checkOwnership(id, req.user.id)
    if (!hasOwnership) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy địa chỉ",
      })
    }

    const success = await Address.delete(id)

    if (!success) {
      return res.status(404).json({
        status: "error",
        message: "Không thể xóa địa chỉ",
      })
    }

    res.json({
      status: "success",
      message: "Xóa địa chỉ thành công",
    })
  } catch (error) {
    next(error)
  }
}

// Đặt địa chỉ mặc định
exports.setDefaultAddress = async (req, res, next) => {
  try {
    const { id } = req.params

    // Kiểm tra quyền sở hữu
    const hasOwnership = await Address.checkOwnership(id, req.user.id)
    if (!hasOwnership) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy địa chỉ",
      })
    }

    const success = await Address.setDefault(id, req.user.id)

    if (!success) {
      return res.status(404).json({
        status: "error",
        message: "Không thể đặt địa chỉ mặc định",
      })
    }

    res.json({
      status: "success",
      message: "Đặt địa chỉ mặc định thành công",
    })
  } catch (error) {
    next(error)
  }
}
